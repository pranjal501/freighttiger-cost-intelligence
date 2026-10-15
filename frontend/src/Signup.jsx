
import { useState } from "react";
import "./Login.css";

export default function Signup() {
  const [form, setForm] = useState({
    full_name: "",
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    otp: "",
  });

  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  function updateField(event) {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));

    setError("");
  }

  async function sendOtp(event) {
    event.preventDefault();
    setError("");
    setMessage("");

    if (
      !form.full_name.trim() ||
      !form.username.trim() ||
      !form.email.trim() ||
      !form.password ||
      !form.confirmPassword
    ) {
      setError("Please complete all fields before requesting an OTP.");
      return;
    }

    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (form.password.length < 8) {
      setError("Password must contain at least 8 characters.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/auth/signup/send-otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          full_name: form.full_name.trim(),
          username: form.username.trim(),
          email: form.email.trim(),
          password: form.password,
        }),
      });

      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          result.detail || "Could not send the verification code."
        );
      }

      setOtpSent(true);
      setMessage(result.message || "OTP sent. Check your email.");
    } catch (err) {
      setError(err.message || "Unable to connect to the backend.");
    } finally {
      setLoading(false);
    }
  }

  async function verifyOtp(event) {
    event.preventDefault();
    setError("");
    setMessage("");

    if (!/^\d{6}$/.test(form.otp.trim())) {
      setError("Enter the 6-digit OTP sent to your email.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/auth/signup/verify-otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          email: form.email.trim(),
          otp: form.otp.trim(),
        }),
      });

      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          result.detail || "Account verification failed."
        );
      }

      setMessage("Account created successfully. Redirecting to login...");

      window.setTimeout(() => {
        window.location.replace("/login");
      }, 1200);
    } catch (err) {
      setError(err.message || "Unable to verify your email.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="login-page">
      <section className="login-card">
        <a href="/" className="login-brand" aria-label="Freight Tiger home">
          <span className="brand-stripe stripe-one" />
          <span className="brand-stripe stripe-two" />
          <span className="brand-stripe stripe-three" />
          <span className="login-brand-name">FREIGHT TIGER</span>
        </a>

        <p className="login-eyebrow">CREATE YOUR ACCOUNT</p>

        <h1>Get started.</h1>

        <p className="login-subtitle">
          Create an account to access your freight intelligence workspace.
        </p>

        <form onSubmit={otpSent ? verifyOtp : sendOtp}>
          <label htmlFor="full_name">Full name</label>
          <input
            id="full_name"
            name="full_name"
            type="text"
            autoComplete="name"
            placeholder="Enter your full name"
            value={form.full_name}
            onChange={updateField}
            required
            disabled={otpSent || loading}
          />

          <label htmlFor="username">Username</label>
          <input
            id="username"
            name="username"
            type="text"
            autoComplete="username"
            placeholder="Choose a username"
            value={form.username}
            onChange={updateField}
            required
            disabled={otpSent || loading}
          />

          <label htmlFor="email">Email address</label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            value={form.email}
            onChange={updateField}
            required
            disabled={otpSent || loading}
          />

          <label htmlFor="password">Password</label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="new-password"
            placeholder="At least 8 characters"
            value={form.password}
            onChange={updateField}
            minLength={8}
            required
            disabled={otpSent || loading}
          />

          <label htmlFor="confirmPassword">Confirm password</label>
          <input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            autoComplete="new-password"
            placeholder="Enter your password again"
            value={form.confirmPassword}
            onChange={updateField}
            minLength={8}
            required
            disabled={otpSent || loading}
          />

          {otpSent && (
            <>
              <label htmlFor="otp">Email verification OTP</label>
              <input
                id="otp"
                name="otp"
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                placeholder="Enter 6-digit OTP"
                value={form.otp}
                onChange={(event) =>
                  setForm((previous) => ({
                    ...previous,
                    otp: event.target.value.replace(/\D/g, "").slice(0, 6),
                  }))
                }
                maxLength={6}
                pattern="[0-9]{6}"
                required
                disabled={loading}
              />
            </>
          )}

          {error && (
            <p className="login-error" role="alert">
              {error}
            </p>
          )}

          {message && (
            <p className="login-success" role="status">
              {message}
            </p>
          )}

          <button
            className="continue-button"
            type="submit"
            disabled={loading}
          >
            {loading
              ? "PLEASE WAIT..."
              : otpSent
                ? "VERIFY OTP & CREATE ACCOUNT →"
                : "SEND EMAIL OTP →"}
          </button>
        </form>

        {otpSent && (
          <button
            className="text-link"
            type="button"
            disabled={loading}
            onClick={() => {
              setOtpSent(false);
              setForm((previous) => ({ ...previous, otp: "" }));
              setError("");
              setMessage("");
            }}
          >
            Edit account details
          </button>
        )}

        <p className="login-signup-text">
          Already have an account? <a href="/login">Sign in</a>
        </p>

        <a href="/" className="login-back-link">
          ← Back to home
        </a>
      </section>
    </main>
  );
}
