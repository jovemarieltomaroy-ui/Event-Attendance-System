import { NavLink, useNavigate } from 'react-router-dom';
import './header.css';

function Header() {
    const navigate = useNavigate();

    const handleLogout = () => {
        if (window.confirm("Are you sure you want to logout?")) {
            localStorage.removeItem('isAuthenticated');
            navigate('/');
        }
    };

    return (
        <header className="main-header">
            <div className="header-top">
                <h1 className="logo">midsa</h1>
                <div className="label-container">
                    <h3 className="label">Event Attendance System</h3>
                    <h3 className="name">MSU-IIT DOST SCHOLARS' ASSOCIATION</h3>
                </div>
            </div>
            <nav className="navbar">
                <ul className="nav-links">
                    <li><NavLink to="/home" end>HOME</NavLink></li>
                    <li><NavLink to="/events">EVENTS</NavLink></li>
                    <li><NavLink to="/attendance">ATTENDANCE</NavLink></li>
                    <li><NavLink to="/masterlist">MASTER LIST</NavLink></li>
                    
                    <li className="logout-item">
                        <span className="logout" onClick={handleLogout}>
                            LOGOUT
                        </span>
                    </li>
                </ul>
            </nav>
        </header>
    );
}

export default Header;