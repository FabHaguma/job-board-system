import { useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { logout } from '../../features/auth/authSlice';
import './UserMenu.css';

const UserMenu = ({ user, isOpen, onToggle }) => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const dropdownRef = useRef(null);

    const handleLogout = () => {
        dispatch(logout());
        navigate('/');
        onToggle(false);
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                onToggle(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [onToggle]);

    return (
        <div className="user-profile" onClick={() => onToggle(!isOpen)} ref={dropdownRef}>
            <div className="user-info">
                <div className="user-avatar">
                    {user.username.charAt(0).toUpperCase()}
                </div>
                <span className="username">{user.username}</span>
                <span className={`dropdown-arrow ${isOpen ? 'open' : ''}`}>▼</span>
            </div>
            <div className={`dropdown-menu ${isOpen ? '' : 'hidden'}`}>
                <button onClick={handleLogout} className="dropdown-item logout">
                    Logout
                </button>
            </div>
        </div>
    );
};

export default UserMenu;
