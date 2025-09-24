import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../styles/signup.css";

function SignupPage() {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    password2: "",
  });

  const navigate = useNavigate();

  const { username, email, password, password2 } = formData;

  const onChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    if (password !== password2) {
      alert("Passwords do not match");
    } else {
      const newUser = {
        username,
        email,
        password,
        password2,
      };
      try {
        const config = {
          headers: {
            "Content-Type": "application/json",
          },
        };
        const body = JSON.stringify(newUser);
        const res = await axios.post("http://127.0.0.1:8000/api/signup/", body, config);
        console.log(res.data);
        alert("Signup successful! Please login.");
        navigate("/login");
      } catch (err) {
        console.error(err.response.data);
        alert("Signup failed. Please try again.");
      }
    }
  };

  return (
    <div className="auth-bg">
      <div className="auth-container">
        <h2 className="auth-title">Sign Up for CodeTrackr</h2>
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

          <label htmlFor="email" className="auth-label">Email</label>
          <input
            type="email"
            id="email"
            name="email"
            className="auth-input"
            placeholder="Enter your email"
            value={email}
            onChange={onChange}
            required
          />

          <label htmlFor="password" className="auth-label">Password</label>
          <input
            type="password"
            id="password"
            name="password"
            className="auth-input"
            placeholder="Create a password"
            value={password}
            onChange={onChange}
            minLength="6"
            required
          />

          <label htmlFor="password2" className="auth-label">Confirm Password</label>
          <input
            type="password"
            id="password2"
            name="password2"
            className="auth-input"
            placeholder="Confirm your password"
            value={password2}
            onChange={onChange}
            minLength="6"
            required
          />

          <button type="submit" className="auth-btn">Sign Up</button>
        </form>
        <div className="auth-extra">
          <span>Already have an account?</span>
          <a href="/login" className="auth-link">Login</a>
        </div>
        <div className="auth-extra">
          <a href="/" className="auth-link">Back to Home</a>
        </div>
      </div>
    </div>
  );
}

export default SignupPage;