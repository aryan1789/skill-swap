import React from "react";

const Login:React.FC = () => {
    return (
        <div style={{padding:'2rem'}}>
            <h2>Login</h2>
            <form>
                <input type="email" placeholder="Email"/><br/><br/>
                <input type="password" placeholder="Password"/><br/><br/>
                <button type="submit">Log In</button>
            </form>
        </div>
    );
};

export default Login;