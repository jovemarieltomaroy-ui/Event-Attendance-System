import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './login.css';

function Login() {
    const navigate = useNavigate();
    const [credentials, setCredentials] = useState({ username: '', password: '' });
    const [loading, setLoading] = useState(false);

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {

            const response = await axios.post('http://localhost:5001/api/auth', credentials);

            if (response.data) {
                localStorage.setItem('isAuthenticated', 'true');
                localStorage.setItem('user', response.data.username);
                
                navigate('/home');
            }
        } catch (error) {
            
            const errorMsg = error.response?.data?.message || "Login Failed. Is the server running?";
            alert(errorMsg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-page-container">
            <header className="main-header">
                <div className="header-top">
                    <h1 className="logo">midsa</h1>
                    <div className="label-container">
                        <h3 className="label">Event Attendance System</h3>
                        <h3 className="name">MSU-IIT DOST SCHOLARS' ASSOCIATION</h3>
                    </div>
                </div>
            </header>

            <div className="login-card">
                <h1>midsa</h1>
                <p>Event Attendance System</p>
                
                <form className="login-form" onSubmit={handleLogin}>
                    <div className="input-group">
                        <label>Username:</label>
                        <input 
                            type="text" 
                            placeholder="Enter username"
                            onChange={(e) => setCredentials({...credentials, username: e.target.value})}
                            required 
                        />
                    </div>
                    <div className="input-group">
                        <label>Password:</label>
                        <input 
                            type="password" 
                            placeholder="Enter password"
                            onChange={(e) => setCredentials({...credentials, password: e.target.value})}
                            required 
                        />
                    </div>
                    <div className="login-button-container">
                        <button 
                            type="submit" 
                            className="login-submit-btn" 
                            disabled={loading}
                        >
                            {loading ? "AUTHENTICATING..." : "LOGIN"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default Login;