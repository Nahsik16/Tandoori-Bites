import React, { useContext, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import "./ResetPassword.css";
import { StoreContext } from "../../context/StoreContext";

const ResetPassword = () => {
  const { url } = useContext(StoreContext);
  const location = useLocation();
  const navigate = useNavigate();
  const token = useMemo(() => new URLSearchParams(location.search).get("token"), [location.search]);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);

  const onSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setMessage("");

    if (!token) {
      setError("Missing reset token.");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    const response = await axios.post(url + "/api/user/reset-password", {
      token,
      newPassword: password,
    });

    if (response.data.success) {
      setMessage("Password updated. You can now log in.");
      setIsSuccess(true);
      setTimeout(() => navigate("/", { state: { openLogin: true } }), 1500);
    } else {
      setError(response.data.message || "Failed to reset password.");
    }
  };

  return (
    <div className="reset-password">
      <form className="reset-password-card" onSubmit={onSubmit}>
        <h2>Reset Password</h2>
        {isSuccess ? (
          <div className="reset-password-success">
            <p className="reset-password-message">{message}</p>
            <button type="button" onClick={() => navigate("/", { state: { openLogin: true } })}>
              Go to login
            </button>
          </div>
        ) : (
          <>
            <p className="reset-password-help">Enter a new password for your account.</p>
            <input
              type="password"
              placeholder="New password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />
            <input
              type="password"
              placeholder="Confirm new password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              required
            />
            {error ? <p className="reset-password-error">{error}</p> : null}
            {message ? <p className="reset-password-message">{message}</p> : null}
            <button type="submit">Update password</button>
          </>
        )}
      </form>
    </div>
  );
};

export default ResetPassword;
