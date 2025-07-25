import React, { useState } from "react";
import "../Login.css";
import { FaEye, FaEyeSlash,FaEnvelope,FaCircleNotch } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { getUserBySupabaseId } from "../api/userService";
import { useAppDispatch, useAuth } from "../store/hooks";
import { loginStart, loginSuccess, loginFailure } from "../store/userSlice";


const Login: React.FC = () => {
    // Form state (these stay local since they're just form inputs)
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    
    // Redux hooks
    const dispatch = useAppDispatch();
    const { loading, error } = useAuth(); // Get loading and error from Redux
    const navigate = useNavigate();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        
        // Dispatch Redux action to start login (sets loading to true)
        dispatch(loginStart());

        try {
            // Make API call to backend
            const response = await fetch("http://localhost:5209/auth/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ email, password })
            });

            if (response.ok) {
                const data = await response.json();
                
                // Get the database user using Supabase ID
                const databaseUser = await getUserBySupabaseId(data.user.id);
                
                // Dispatch Redux action (handles localStorage internally)
                dispatch(loginSuccess({
                    user: databaseUser, // Store the full database user object
                    token: `Bearer ${data.token}`,
                    supabaseUid: data.user.id, // Supabase user ID
                    userGuid: databaseUser.id   // Database user GUID
                }));
                
                // Navigate to profile page
                navigate("/profile");
            } else {
                const errorData = await response.json();
                // Dispatch Redux action for failed login
                dispatch(loginFailure(errorData.error || "Invalid email or password. Please try again."));
            }
        } catch (err) {
            // Dispatch Redux action for network error
            dispatch(loginFailure("Network error. Please check your connection and try again."));
            console.error("Login error:", err);
        }
        // Note: No finally block needed! Redux handles loading state
    };

    const handlePasswordToggle = () => {
        setShowPassword(!showPassword);
    };

    const isValidEmail = (email: string) => {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    };

    const canSubmit = email.trim() !== "" && password.trim() !== "" && isValidEmail(email);

    return (
        <div className="login-container">
            <div className="login-card">
                <div className="login-header">
                    <h1>Welcome Back</h1>
                    <p>Sign in to continue your skill-swapping journey</p>
                </div>

                <form onSubmit={handleLogin} className="login-form">
                    {error && (
                        <div className="error-message">
                            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                                <circle cx="8" cy="8" r="8" fill="#FEF2F2" />
                                <path d="M8 4V8M8 12H8.01" stroke="#DC2626" strokeWidth="2" strokeLinecap="round" />
                            </svg>
                            {error}
                        </div>
                    )}

                    <div className="form-group">
                        <label htmlFor="email">Email Address</label>
                        <div className="input-wrapper">
                            <input
                                id="email"
                                type="email"
                                placeholder="Enter your email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className={error ? "error" : ""}
                                required
                            />
                            <FaEnvelope size={20} />
                        </div>
                    </div>

                    <div className="form-group">
                        <label htmlFor="password">Password</label>
                        <div className="input-wrapper">
                            <input
                                id="password"
                                type={showPassword ? "text" : "password"}
                                placeholder="Enter your password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className={error ? "error" : ""}
                                required
                            />
                            <button
                                type="button"
                                className="password-toggle"
                                onClick={handlePasswordToggle}
                            >
                                {showPassword ? (
                                    <FaEye size={20} />
                                ) : (
                                    <FaEyeSlash size={20} />
                                )}
                            </button>
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="login-button"
                        disabled={!canSubmit || loading}
                    >
                        {loading ? (
                            <>
                                <FaCircleNotch />

                                Signing in...
                            </>
                        ) : (
                            "Sign In"
                        )}
                    </button>
                </form>

                <div className="login-footer">
                    <p>Don't have an account? <a href="/register">Sign up here</a></p>
                    <p><a href="/forgot-password">Forgot your password?</a></p>
                </div>
            </div>
        </div>
    );
};

export default Login;