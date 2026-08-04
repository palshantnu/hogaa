import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Login = () => {
    const navigate = useNavigate();
    const { user, openAuthModal } = useAuth();

    useEffect(() => {
        if (user) {
            navigate('/');
            return;
        }
        // Show OTP modal and redirect home
        navigate('/', { replace: true });
        setTimeout(() => openAuthModal(), 100);
    }, []);

    return null;
};

export default Login;
