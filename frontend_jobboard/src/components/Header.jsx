import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useState } from 'react';
import UserMenu from './subheaders/UserMenu';
import AuthButtons from './subheaders/AuthButtons';
import './Header.css';

const Header = () => {
    const { user } = useSelector((state) => state.auth);
    const [dropdownOpen, setDropdownOpen] = useState(false);

    return (
        <nav className="header">
            <Link to="/" className="header-title">
                Job Board Platform
            </Link>

            <div className="header-auth">
                {user ? (
                    <>
                        {user.role === 'admin' && (
                            <Link to="/admin" className="admin-link">
                                Admin Dashboard
                            </Link>
                        )}
                        <UserMenu 
                            user={user}
                            isOpen={dropdownOpen}
                            onToggle={setDropdownOpen}
                        />
                    </>
                ) : (
                    <AuthButtons />
                )}
            </div>
        </nav>
    );
};

export default Header;
