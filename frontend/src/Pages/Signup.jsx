import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Signup = () => {
    const navigate = useNavigate();
    const { user, openAuthModal } = useAuth();

    useEffect(() => {
        if (user) {
            navigate('/');
            return;
        }
        navigate('/', { replace: true });
        setTimeout(() => openAuthModal(), 100);
    }, []);

    return null;
};

export default Signup;
