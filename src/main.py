
from contextlib import asynccontextmanager
from email.message import EmailMessage
from pathlib import Path
import os
import re
import secrets
import smtplib

import pandas as pd
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException, Request, Response
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from pydantic import BaseModel, EmailStr, Field

from src.auth import (
    initialize_auth_database,
    save_signup_otp,
    verify_signup_otp,
    authenticate_user,
    create_session,
    get_user_from_session,
    delete_session,
    get_connection,
)


# --------------------------------------------------
# PROJECT CONFIGURATION
# --------------------------------------------------

PROJECT_ROOT = Path(__file__).resolve().parent.parent
OUTPUT_DIR = PROJECT_ROOT / "outputs"
OUTPUT_FILE = OUTPUT_DIR / "freight_cost_analysis.csv"

OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
load_dotenv(PROJECT_ROOT / ".env")

GMAIL_ADDRESS = os.getenv("GMAIL_ADDRESS", "").strip()
GMAIL_APP_PASSWORD = os.getenv(
    "GMAIL_APP_PASSWORD", ""
).replace(" ", "")

SESSION_COOKIE = "ft_session"
SESSION_DURATION_SECONDS = 24 * 60 * 60


# --------------------------------------------------
# APPLICATION INITIALIZATION
# IMPORTANT: app MUST exist before route decorators.
# --------------------------------------------------

@asynccontextmanager
async def lifespan(app: FastAPI):
    initialize_auth_database()
    yield


app = FastAPI(
    title="Freight Cost Intelligence API",
    description="Freight analysis, authentication, evidence and export.",
    version="2.1.0",
    lifespan=lifespan,
)


# --------------------------------------------------
# CORS
# --------------------------------------------------


app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "https://freighttiger-cost-intelligence-x1ut.vercel.app",
        "https://freighttiger-cost-intelligence-x1ut-8vr8z5pvf.vercel.app"
    ],
    allow_credentials=True,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["Content-Type"],
)



# --------------------------------------------------
# REQUEST MODELS
# --------------------------------------------------

class AskRequest(BaseModel):
    question: str = Field(min_length=1, max_length=2000)


class SignupOTPRequest(BaseModel):
    full_name: str = Field(min_length=2, max_length=100)
    username: str = Field(min_length=3, max_length=30)
    email: EmailStr
    password: str = Field(min_length=8, max_length=128)


class SignupVerifyRequest(BaseModel):
    email: EmailStr
    otp: str


class LoginRequest(BaseModel):
    identifier: str = Field(min_length=1, max_length=254)
    password: str = Field(min_length=1, max_length=128)


# --------------------------------------------------
# AUTHENTICATION HELPERS
# --------------------------------------------------

def normalize_email(email: str) -> str:
    return email.strip().lower()


def require_logged_in_user(request: Request):
    token = request.cookies.get(SESSION_COOKIE)

    if not token:
        raise HTTPException(
            status_code=401,
            detail="Please log in to access this feature.",
        )

    user = get_user_from_session(token)

    if not user:
        raise HTTPException(
            status_code=401,
            detail="Your session has expired. Please log in again.",
        )

    return user


def send_email_otp(email: str, otp: str) -> None:
    if not GMAIL_ADDRESS or not GMAIL_APP_PASSWORD:
        raise HTTPException(
            status_code=500,
            detail="Email service is not configured.",
        )

    message = EmailMessage()
    message["Subject"] = "Your Freight Cost Intelligence Verification Code"
    message["From"] = GMAIL_ADDRESS
    message["To"] = email
    message.set_content(
        f"Your verification code is {otp}.\n\n"
        "It expires in 5 minutes. If you did not request it, "
        "please ignore this email."
    )

    try:
        with smtplib.SMTP_SSL(
            "smtp.gmail.com", 465, timeout=15
        ) as server:
            server.login(GMAIL_ADDRESS, GMAIL_APP_PASSWORD)
            server.send_message(message)
    except (smtplib.SMTPException, OSError) as exc:
        print(f"Email delivery failed: {type(exc).__name__}")
        raise HTTPException(
            status_code=502,
            detail="Could not send verification email. Check email configuration.",
        ) from exc


# --------------------------------------------------
# ANALYSIS HELPER
# --------------------------------------------------

def get_analysis() -> pd.DataFrame:
    try:
        from src.assistant import run_analysis
        from src.data_loader import (
            load_shipment_records,
            load_context_notes,
        )

        shipments = load_shipment_records()
        context_notes = load_context_notes()

        result = run_analysis(shipments, context_notes)

        if not isinstance(result, pd.DataFrame):
            result = pd.DataFrame(result)

        result.to_csv(OUTPUT_FILE, index=False, encoding="utf-8-sig")
        return result

    except HTTPException:
        raise
    except Exception as exc:
        print(f"Analysis failed: {type(exc).__name__}: {exc}")
        raise HTTPException(
            status_code=500,
            detail="Freight analysis failed. Check backend logs.",
        ) from exc


# --------------------------------------------------
# HEALTH CHECK
# --------------------------------------------------

@app.get("/")
def root():
    return {
        "name": "Freight Cost Intelligence API",
        "status": "running",
        "docs": "/docs",
    }


@app.get("/health")
def health_check():
    return {"status": "ok"}


# --------------------------------------------------
# SIGNUP: SEND EMAIL OTP
# --------------------------------------------------

@app.post("/api/auth/signup/send-otp")
def signup_send_otp(request: SignupOTPRequest):
    full_name = request.full_name.strip()
    username = request.username.strip()
    email = normalize_email(str(request.email))

    if len(full_name) < 2:
        raise HTTPException(400, "Please enter your full name.")

    if not re.fullmatch(r"[A-Za-z0-9_]{3,30}", username):
        raise HTTPException(
            400,
            "Username must contain 3–30 letters, numbers, or underscores.",
        )

    otp = f"{secrets.randbelow(1_000_000):06d}"

    try:
        save_signup_otp(
            full_name=full_name,
            username=username,
            email=email,
            password=request.password,
            otp=otp,
        )
    except ValueError as exc:
        raise HTTPException(400, detail=str(exc)) from exc

    try:
        send_email_otp(email, otp)
    except HTTPException:
        with get_connection() as connection:
            connection.execute(
                "DELETE FROM signup_otps WHERE email = ?",
                (email,),
            )
        raise

    return {
        "success": True,
        "message": "Verification code sent. Check your email.",
    }


# --------------------------------------------------
# SIGNUP: VERIFY OTP
# --------------------------------------------------

@app.post("/api/auth/signup/verify-otp")
def signup_verify_otp(request: SignupVerifyRequest):
    email = normalize_email(str(request.email))
    otp = request.otp.strip()

    if not re.fullmatch(r"\d{6}", otp):
        raise HTTPException(400, "Enter a valid 6-digit verification code.")

    try:
        user_id = verify_signup_otp(email=email, otp=otp)
    except ValueError as exc:
        raise HTTPException(400, detail=str(exc)) from exc

    return {
        "success": True,
        "user_id": user_id,
        "message": "Account created successfully. Please log in.",
    }


# --------------------------------------------------
# LOGIN
# --------------------------------------------------

@app.post("/api/auth/login")
def login(request: LoginRequest, response: Response):
    user = authenticate_user(
        identifier=request.identifier.strip(),
        password=request.password,
    )

    if not user:
        raise HTTPException(
            status_code=401,
            detail="Invalid username/email or password.",
        )

    token = create_session(user["id"])

    response.set_cookie(
        key=SESSION_COOKIE,
        value=token,
        max_age=SESSION_DURATION_SECONDS,
        httponly=True,
        secure=os.getenv("COOKIE_SECURE", "false").lower() == "true",
        samesite="none",
        path="/",
    )

    return {
        "success": True,
        "message": "Login successful.",
        "user": user,
    }


# --------------------------------------------------
# CURRENT USER
# --------------------------------------------------

@app.get("/api/auth/me")
def current_user(request: Request):
    user = require_logged_in_user(request)
    return {"authenticated": True, "user": user}


# --------------------------------------------------
# LOGOUT
# --------------------------------------------------

@app.post("/api/auth/logout")
def logout(request: Request, response: Response):
    token = request.cookies.get(SESSION_COOKIE)

    if token:
        delete_session(token)

    response.delete_cookie(
        key=SESSION_COOKIE,
        path="/",
        httponly=True,
        secure=os.getenv("COOKIE_SECURE", "false").lower() == "true",
        samesite="none",
    )

    return {"success": True, "message": "Logged out successfully."}


# --------------------------------------------------
# FREIGHT ANALYSIS
# --------------------------------------------------


@app.get("/api/analyze")
def analyze():
    df = get_analysis()

    records = (
        df.astype(object)
        .where(pd.notna(df), None)
        .to_dict(orient="records")
    )

    flagged_count = sum(
        str(record.get("flagged", "")).strip().lower()
        in {"true", "1", "yes"}
        for record in records
    )

    matched_notes_count = sum(
        record.get("matched_note_id") is not None
        and bool(str(record.get("matched_note_id")).strip())
        for record in records
    )

    costs = (
        pd.to_numeric(df["cost_per_tonne_km"], errors="coerce")
        if "cost_per_tonne_km" in df.columns
        else pd.Series(dtype=float)
    )

    average_cost = (
        float(costs.mean()) if not costs.dropna().empty else None
    )

    return {
        "total_records": len(records),
        "flagged_records": flagged_count,
        "matched_notes": matched_notes_count,
        "average_cost": average_cost,
        "records": records,
    }


# --------------------------------------------------
# FREIGHT ASSISTANT
# --------------------------------------------------

@app.post("/api/ask")
def ask_question(request: AskRequest, http_request: Request):
    require_logged_in_user(http_request)
    question = request.question.strip()

    if not question:
        raise HTTPException(400, "Please enter a question.")

    try:
        from src.assistant import answer_question
        answer = answer_question(question)
        return {"question": question, "answer": str(answer)}

    except ImportError:
        return {
            "question": question,
            "answer": (
                "The assistant function is not configured in "
                "src/assistant.py yet."
            ),
        }
    except Exception as exc:
        print(f"Assistant failed: {type(exc).__name__}: {exc}")
        raise HTTPException(
            status_code=500,
            detail="Could not answer the question. Check backend logs.",
        ) from exc


# --------------------------------------------------
# CSV EXPORT
# --------------------------------------------------

@app.get("/api/export")
def export_analysis(request: Request):
    require_logged_in_user(request)
    get_analysis()

    if not OUTPUT_FILE.exists():
        raise HTTPException(
            status_code=404,
            detail="Analysis output CSV was not generated.",
        )

    return FileResponse(
        path=str(OUTPUT_FILE),
        media_type="text/csv",
        filename="freight_cost_analysis.csv",
    )
