import React from "react";

const SignUp:React.FC = () => {
    return (
        <div style={{padding:'2rem'}}>
            <h2>Sign Up</h2>
            <form>
                <input type="text" placeholder="Username" /><br/><br/>
                <input type="email" placeholder="Email"/><br/><br/>
                <input type="password" placeholder="Password"/><br/><br/>
                <button type="submit">Log In</button>
            </form>
        </div>
    );
};

export default SignUp;