import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Header = () => {
    const { isLoggedIn, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    return (
        <header className="w-full bg-white shadow-md px-6 py-4">
            <div className="container mx-auto flex justify-start items-start flex-col">
                <div className="text-2xl font-bold text-gray-800">
                    <Link to="/">
                        <h1 className='font-martian'>Todo<br/>Cards</h1>
                    </Link>
                </div>
                <nav className="mt-2">
                    <ul className="flex space-x-4 font-martian text-sm">
                        {isLoggedIn ? (
                            <li>
                                <button 
                                    onClick={handleLogout} 
                                    className="text-gray-600 hover:text-gray-900 transition-colors duration-200"
                                >
                                    Logout
                                </button>
                            </li>
                        ) : (
                            <>
                                <li>
                                    <Link to="/login" className="text-gray-600 hover:text-gray-900 transition-colors duration-200">
                                        Sign In
                                    </Link>
                                </li>
                                <li className="text-gray-600">/</li>
                                <li>
                                    <Link to="/register" className="text-gray-600 hover:text-gray-900 transition-colors duration-200">
                                        Sign Up
                                    </Link>
                                </li>
                            </>
                        )}
                    </ul>
                </nav>
            </div>
        </header>
    );
};

export default Header;