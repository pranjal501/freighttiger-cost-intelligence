
from pathlib import Path
import hashlib
import hmac
import secrets
import sqlite3
import time

from pwdlib import PasswordHash

# --------------------------------------------------
# DATABASE CONFIGURATION
# --------------------------------------------------

PROJECT_ROOT = Path(__file__).resolve().parent.parent
DATA_DIR = PROJECT_ROOT / "data"
DATABASE_FILE = DATA_DIR / "app_users.db"

password_hasher = PasswordHash.recommended()

SESSION_DURATION_SECONDS = 60 * 60 * 24  # 24 hours
OTP_EXPIRY_SECONDS = 300
OTP_RESEND_COOLDOWN = 60
MAX_OTP_ATTEMPTS = 5


# --------------------------------------------------
# DATABASE CONNECTION
# --------------------------------------------------

def get_connection():
    DATA_DIR.mkdir(parents=True, exist_ok=True)

    connection = sqlite3.connect(DATABASE_FILE, timeout=10)
    connection.row_factory = sqlite3.Row
    connection.execute("PRAGMA foreign_keys = ON")
    return connection


def initialize_auth_database():
    with get_connection() as connection:
        connection.execute("""
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                full_name TEXT NOT NULL,
                username TEXT NOT NULL COLLATE NOCASE UNIQUE,
                email TEXT NOT NULL COLLATE NOCASE UNIQUE,
                password_hash TEXT NOT NULL,
                email_verified INTEGER NOT NULL DEFAULT 0,
                created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
                last_login TEXT
            )
        """)

        connection.execute("""
            CREATE TABLE IF NOT EXISTS sessions (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                token_hash TEXT NOT NULL UNIQUE,
                expires_at INTEGER NOT NULL,
                created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id)
                    ON DELETE CASCADE
            )
        """)

        connection.execute("""
            CREATE TABLE IF NOT EXISTS signup_otps (
                email TEXT PRIMARY KEY COLLATE NOCASE,
                full_name TEXT NOT NULL,
                username TEXT NOT NULL COLLATE NOCASE,
                password_hash TEXT NOT NULL,
                otp_hash TEXT NOT NULL,
                expires_at INTEGER NOT NULL,
                sent_at INTEGER NOT NULL,
                attempts INTEGER NOT NULL DEFAULT 0
            )
        """)


# --------------------------------------------------
# PASSWORDS
# --------------------------------------------------

def hash_password(password: str) -> str:
    return password_hasher.hash(password)


def verify_password(password: str, stored_hash: str) -> bool:
    try:
        return password_hasher.verify(password, stored_hash)
    except Exception:
        return False


# --------------------------------------------------
# OTP HELPERS
# --------------------------------------------------

def hash_otp(otp: str) -> str:
    return hashlib.sha256(otp.encode("utf-8")).hexdigest()


def save_signup_otp(
    full_name: str,
    username: str,
    email: str,
    password: str,
    otp: str,
):
    now = int(time.time())
    email = email.strip().lower()
    username = username.strip()

    initialize_auth_database()

    with get_connection() as connection:
        existing = connection.execute(
            """
            SELECT id FROM users
            WHERE email = ? OR username = ?
            """,
            (email, username),
        ).fetchone()

        if existing:
            raise ValueError("Email or username is already registered.")

        pending = connection.execute(
            "SELECT sent_at FROM signup_otps WHERE email = ?",
            (email,),
        ).fetchone()

        if pending and now - pending["sent_at"] < OTP_RESEND_COOLDOWN:
            raise ValueError("Please wait before requesting another OTP.")

        connection.execute(
            """
            INSERT INTO signup_otps (
                email, full_name, username, password_hash,
                otp_hash, expires_at, sent_at, attempts
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, 0)
            ON CONFLICT(email) DO UPDATE SET
                full_name = excluded.full_name,
                username = excluded.username,
                password_hash = excluded.password_hash,
                otp_hash = excluded.otp_hash,
                expires_at = excluded.expires_at,
                sent_at = excluded.sent_at,
                attempts = 0
            """,
            (
                email,
                full_name.strip(),
                username,
                hash_password(password),
                hash_otp(otp),
                now + OTP_EXPIRY_SECONDS,
                now,
            ),
        )


def verify_signup_otp(email: str, otp: str):
    email = email.strip().lower()
    now = int(time.time())

    initialize_auth_database()

    with get_connection() as connection:
        pending = connection.execute(
            "SELECT * FROM signup_otps WHERE email = ?",
            (email,),
        ).fetchone()

        if not pending:
            raise ValueError("Signup OTP not found. Request a new code.")

        if now >= pending["expires_at"]:
            connection.execute(
                "DELETE FROM signup_otps WHERE email = ?",
                (email,),
            )
            raise ValueError("OTP expired. Request a new code.")

        if pending["attempts"] >= MAX_OTP_ATTEMPTS:
            connection.execute(
                "DELETE FROM signup_otps WHERE email = ?",
                (email,),
            )
            raise ValueError("Too many attempts. Request a new code.")

        connection.execute(
            """
            UPDATE signup_otps
            SET attempts = attempts + 1
            WHERE email = ?
            """,
            (email,),
        )

        if not hmac.compare_digest(
            hash_otp(otp),
            pending["otp_hash"],
        ):
            raise ValueError("Incorrect OTP.")

        # Recheck uniqueness in case another signup used the details.
        existing = connection.execute(
            """
            SELECT id FROM users
            WHERE email = ? OR username = ?
            """,
            (email, pending["username"]),
        ).fetchone()

        if existing:
            connection.execute(
                "DELETE FROM signup_otps WHERE email = ?",
                (email,),
            )
            raise ValueError("Email or username is already registered.")

        cursor = connection.execute(
            """
            INSERT INTO users (
                full_name, username, email,
                password_hash, email_verified
            )
            VALUES (?, ?, ?, ?, 1)
            """,
            (
                pending["full_name"],
                pending["username"],
                email,
                pending["password_hash"],
            ),
        )

        user_id = cursor.lastrowid

        connection.execute(
            "DELETE FROM signup_otps WHERE email = ?",
            (email,),
        )

        return int(user_id)


# --------------------------------------------------
# LOGIN AND USER PROFILE
# --------------------------------------------------

def authenticate_user(identifier: str, password: str):
    identifier = identifier.strip()

    initialize_auth_database()

    with get_connection() as connection:
        user = connection.execute(
            """
            SELECT * FROM users
            WHERE email = ? OR username = ?
            """,
            (identifier, identifier),
        ).fetchone()

        if not user or not verify_password(
            password,
            user["password_hash"],
        ):
            return None

        connection.execute(
            """
            UPDATE users
            SET last_login = CURRENT_TIMESTAMP
            WHERE id = ?
            """,
            (user["id"],),
        )

        return {
            "id": user["id"],
            "full_name": user["full_name"],
            "username": user["username"],
            "email": user["email"],
            "created_at": user["created_at"],
        }


# --------------------------------------------------
# SERVER-SIDE SESSIONS
# --------------------------------------------------

def create_session(user_id: int) -> str:
    initialize_auth_database()

    raw_token = secrets.token_urlsafe(32)
    token_hash = hashlib.sha256(
        raw_token.encode("utf-8")
    ).hexdigest()

    expires_at = int(time.time()) + SESSION_DURATION_SECONDS

    with get_connection() as connection:
        connection.execute(
            "DELETE FROM sessions WHERE expires_at <= ?",
            (int(time.time()),),
        )

        connection.execute(
            """
            INSERT INTO sessions (user_id, token_hash, expires_at)
            VALUES (?, ?, ?)
            """,
            (user_id, token_hash, expires_at),
        )

    # Return the raw token only to the caller so it can set
    # an HttpOnly session cookie. Only its hash is stored.
    return raw_token


def get_user_from_session(raw_token: str | None):
    if not raw_token:
        return None

    token_hash = hashlib.sha256(
        raw_token.encode("utf-8")
    ).hexdigest()

    initialize_auth_database()

    with get_connection() as connection:
        row = connection.execute(
            """
            SELECT
                users.id,
                users.full_name,
                users.username,
                users.email,
                users.created_at,
                users.last_login
            FROM sessions
            JOIN users ON users.id = sessions.user_id
            WHERE sessions.token_hash = ?
              AND sessions.expires_at > ?
              AND users.email_verified = 1
            """,
            (token_hash, int(time.time())),
        ).fetchone()

        return dict(row) if row else None


def delete_session(raw_token: str | None):
    if not raw_token:
        return

    token_hash = hashlib.sha256(
        raw_token.encode("utf-8")
    ).hexdigest()

    initialize_auth_database()

    with get_connection() as connection:
        connection.execute(
            "DELETE FROM sessions WHERE token_hash = ?",
            (token_hash,),
        )
