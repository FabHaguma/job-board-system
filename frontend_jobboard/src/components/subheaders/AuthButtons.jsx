import { Link } from 'react-router-dom';
import './AuthButtons.css';

const AuthButtons = () => {
    return (
        <div className="auth-links">
            <Link to="/login" className="header-login-btn">
                Login
            </Link>
            <Link to="/register" className="header-register-btn">
                Register
            </Link>
        </div>
    );
};

export default AuthButtons;
