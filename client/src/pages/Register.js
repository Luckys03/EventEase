import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../api";

function Register({ onAuthSuccess }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (password.length < 6) {
      setError("Password must be at least 6 characters long");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setIsSubmitting(true);

    try {
      // 1. Register the user
      const registerRes = await api.post("/users/register", {
        name,
        email,
        phone: phone || undefined,
        password,
      });

      const token = registerRes.data.token;

      // 2. Fetch user profile to get complete details
      const userRes = await api.get("/users/me", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // 3. Log them in directly
      onAuthSuccess?.({
        token,
        user: userRes.data,
      });

      navigate("/");
    } catch (err) {
      console.error(err);
      if (err.response?.data?.errors?.[0]?.msg) {
        setError(err.response.data.errors[0].msg);
      } else if (err.response?.data?.msg) {
        setError(err.response.data.msg);
      } else {
        setError("Registration failed. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card" style={{ width: "min(480px, 100%)" }}>
        <p className="eyebrow">Get Started</p>
        <h1>Create your account</h1>
        <p className="muted">
          Join EventEase to browse premium venues and schedule your next university showcase.
        </p>

        {error && <div className="alert error">{error}</div>}

        <form className="auth-form" onSubmit={handleSubmit}>
          <label>
            <span>Full Name</span>
            <input
              type="text"
              placeholder="Alex Johnson"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </label>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
            <label style={{ color: "inherit" }}>
              <span>Email</span>
              <input
                type="email"
                placeholder="you@college.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </label>

            <label style={{ color: "inherit" }}>
              <span>Phone (Optional)</span>
              <input
                type="tel"
                placeholder="9876543210"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </label>
          </div>

          <label>
            <span>Password</span>
            <input
              type="password"
              placeholder="•••••••• (Min 6 chars)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </label>

          <label>
            <span>Confirm Password</span>
            <input
              type="password"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </label>

          <button type="submit" className="primary-btn" disabled={isSubmitting}>
            {isSubmitting ? "Creating account..." : "Sign Up"}
          </button>
        </form>

        <p className="footnote" style={{ textAlign: "center", marginTop: "8px" }}>
          Already have an account?{" "}
          <Link to="/login" style={{ color: "#a5b4fc", fontWeight: "600", textDecoration: "none" }}>
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Register;
