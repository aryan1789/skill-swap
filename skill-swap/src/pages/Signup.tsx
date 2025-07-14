import React, { useState } from "react";
import { useNavigate } from "react-router-dom";


const SignUp: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [occupation, setOccupation] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();
  const [error, setError] = useState("");

  const isValidEmail = (email: string) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

const isStrongPassword = (pw: string) => pw.length >= 8;

const handleSignUp = async (e: React.FormEvent) => {
  e.preventDefault();
  setMessage("");
  setError("");

  if (!isValidEmail(email)) {
    setError("Please enter a valid email.");
    return;
  }

  if (!isStrongPassword(password)) {
    setError("Password must be at least 8 characters long.");
    return;
  }

    try {
      const response = await fetch("http://localhost:5209/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password,name,occupation }),
      });

      const result = await response.json();

      if (response.ok) {
        setMessage("Registration successful! You can now log in.");
        setTimeout(() => navigate("/login"),1500);
      } else {
        setMessage(result.error || "Registration failed.");
      }
    } catch (error) {
      console.error(error);
      setMessage("Something went wrong.");
    }
  };

  return (
    <div style={{ padding: "2rem" }}>
      <h2>Sign Up</h2>
      <form onSubmit={handleSignUp}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        /><br /><br />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        /><br /><br />
        <input
          type="text"
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          /><br /><br />
        <input
            type="text"
            placeholder="Occupation"
            value={occupation}
            onChange={(e) => setOccupation(e.target.value)}
            required
            /><br /><br />
        <button type="submit">Register</button>
      </form>
{error && <p style={{ color: "red" }}>{error}</p>}
{message && <p style={{ color: "green" }}>{message}</p>}
    </div>
  );
};

export default SignUp;
