import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../styles/login.css";

function LoginPage() {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });
  const [errorMessage, setErrorMessage] = useState("");

  const navigate = useNavigate();

  const { username, password } = formData;

  const onChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage(""); // Clear previous errors
    const user = {
      username,
      password,
    };
    try {
      const config = {
        headers: {
          "Content-Type": "application/json",
        },
      };
      const body = JSON.stringify(user);
      const res = await axios.post("http://127.0.0.1:8000/api/login/", body, config);
      console.log(res.data);
      alert("Login successful!");
      navigate("/dashboard");
    } catch (err) {
      console.error(err.response?.data);
      // Extract specific error message from backend response
      let errorMsg = "Login failed. Please check your credentials.";
      if (err.response?.data?.detail) {
        errorMsg = err.response.data.detail;
      } else if (err.response?.data?.message) {
        errorMsg = err.response.data.message;
      } else if (typeof err.response?.data === 'string') {
        errorMsg = err.response.data;
      }
      setErrorMessage(errorMsg);
    }
  };

  return (
    <div className="auth-bg">
      <div className="auth-container">
        <h2 className="auth-title">Login to CodeTrackr</h2>
        <form className="auth-form" onSubmit={onSubmit}>
          <label htmlFor="username" className="auth-label">Username</label>
          <input
            type="text"
            id="username"
            name="username"
            className="auth-input"
            placeholder="Enter your username"
            value={username}
            onChange={onChange}
            required
          />

          <label htmlFor="password" className="auth-label">Password</label>
          <input
            type="password"
            id="password"
            name="password"
            className="auth-input"
            placeholder="Enter your password"
            value={password}
            onChange={onChange}
            minLength="6"
            required
          />

          <button type="submit" className="auth-btn">Login</button>
        </form>
        {errorMessage && (
          <div className="auth-error">
            {errorMessage}
          </div>
        )}
        <div className="auth-extra">
          <span>Don't have an account?</span>
          <a href="/signup" className="auth-link">Sign Up</a>
        </div>
        <div className="auth-extra">
          <a href="/" className="auth-link">Back to Home</a>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;