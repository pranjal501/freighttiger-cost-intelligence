
import { useState } from "react";
import "./Login.css";

export default function Login() {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          identifier: identifier.trim(),
          password,
        }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.detail || "Login failed. Please try again.");
      }

      window.location.replace("/dashboard");
    } catch (err) {
      setError(err.message || "Unable to connect to the backend.");
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

        <h1>Welcome back</h1>
        <p className="login-subtitle">
          Log in to your Freight Tiger workspace.
        </p>

        <form onSubmit={handleSubmit}>
          <label htmlFor="login-identifier">
            Username or Email address<span>*</span>
          </label>

          <input
            id="login-identifier"
            type="text"
            value={identifier}
            onChange={(event) => {
              setIdentifier(event.target.value);
              setError("");
            }}
            autoComplete="username"
            placeholder="Enter username or email"
            required
          />

          <label htmlFor="login-password">
            Password<span>*</span>
          </label>

          <input
            id="login-password"
            type="password"
            value={password}
            onChange={(event) => {
              setPassword(event.target.value);
              setError("");
            }}
            autoComplete="current-password"
            placeholder="Enter your password"
            required
          />

          {error && (
            <p className="login-error" role="alert">
              {error}
            </p>
          )}

          <button
            className="continue-button"
            type="submit"
            disabled={loading}
          >
            {loading ? "Signing in..." : "Sign in →"}
          </button>
        </form>

        <p className="login-signup-text">
          Don't have an account? <a href="/signup">Create an account</a>
        </p>

        <a href="/" className="login-back-link">
          ← Back to home
        </a>

        <p className="login-footer">
          Freight cost intelligence, with evidence you can trust.
        </p>
      </section>
    </main>
  );
}
