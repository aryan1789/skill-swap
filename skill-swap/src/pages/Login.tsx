import React from "react";

const Login: React.FC = () => {
    const [email, setEmail] = React.useState("");
    const [password, setPassword] = React.useState("");

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();

        const response = await fetch("http://localhost:5209/api/users/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ email, password })
        });

        if (response.ok) {
            const data = await response.json();
            alert("Login successful!");
            localStorage.setItem("user", JSON.stringify(data));
            localStorage.setItem("userId", data.id); // Store token for future requests
            console.log("Login successful:", data);
            window.location.href = "/"; // Redirect to home page
            // Handle successful login (e.g., redirect to dashboard)
        } else {
            alert("Invalid email or password. Please try again.");
            console.error("Login failed:", response.statusText);
        }
    };

    return (
        <div style={{ padding: "2rem" }}>
            <h2>Login</h2>
            <form onSubmit={handleLogin}>
                <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                /><br /><br />
                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                /><br /><br />
                <button type="submit">Log In</button>
            </form>
        </div>
    );
};

export default Login;