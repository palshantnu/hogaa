import React, { createContext, useState, useContext, useEffect } from 'react';
import { RecaptchaVerifier, signInWithPhoneNumber } from 'firebase/auth';
import { mergeGuestCartToServer } from '../utils/cart';
import OtpModal from '../Components/OtpModal';
import { firebaseAuth } from '../firebase';

const AuthContext = createContext();
const API = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? 'http://localhost:5050' : 'https://admin.hogaacosmetics.com');

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [authModalOpen, setAuthModalOpen] = useState(false);
    const [authModalCallback, setAuthModalCallback] = useState(null);
    const [otpConfirmation, setOtpConfirmation] = useState(null);

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) setUser(JSON.parse(storedUser));
        setLoading(false);
    }, []);

    const openAuthModal = (onSuccess) => {
        setAuthModalCallback(() => onSuccess || null);
        setAuthModalOpen(true);
    };

    const closeAuthModal = () => {
        setAuthModalOpen(false);
        setAuthModalCallback(null);
    };

    const _setLoggedIn = async (userData) => {
        localStorage.setItem('user', JSON.stringify(userData));
        localStorage.setItem('isLoggedIn', 'true');
        setUser(userData);
        await mergeGuestCartToServer(userData.id);
    };

    const login = async (mobile, password) => {
        try {
            const res = await fetch(`${API}/api/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ mobile, password })
            });
            const data = await res.json();
            if (data.success) await _setLoggedIn(data.user);
            return { success: data.success, message: data.message };
        } catch {
            return { success: false, message: 'Network error. Please try again.' };
        }
    };

    const register = async (userData) => {
        try {
            const res = await fetch(`${API}/api/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify(userData)
            });
            const data = await res.json();
            if (data.success) await _setLoggedIn(data.user);
            return { success: data.success, message: data.message };
        } catch {
            return { success: false, message: 'Network error. Please try again.' };
        }
    };

    const createRecaptchaContainer = () => {
        const existing = document.getElementById('firebase-recaptcha-container');
        if (existing) existing.remove();

        const container = document.createElement('div');
        container.id = 'firebase-recaptcha-container';
        container.style.position = 'fixed';
        container.style.left = '-9999px';
        container.style.top = '0';
        container.style.width = '1px';
        container.style.height = '1px';
        container.style.overflow = 'hidden';
        document.body.appendChild(container);
        return container.id;
    };

    const getRecaptchaVerifier = async () => {
        if (!window.recaptchaVerifier) {
            window.recaptchaVerifier = new RecaptchaVerifier(firebaseAuth, createRecaptchaContainer(), {
                size: 'invisible'
            });
            await window.recaptchaVerifier.render();
        }
        return window.recaptchaVerifier;
    };

    const resetRecaptcha = () => {
        if (window.recaptchaVerifier) {
            try {
                window.recaptchaVerifier.clear();
            } catch {
                // Firebase may already have cleared the widget after a failed send.
            }
            window.recaptchaVerifier = null;
        }
        document.getElementById('firebase-recaptcha-container')?.remove();
    };

    const sendOtp = async (mobile) => {
        try {
            resetRecaptcha();
            const confirmation = await signInWithPhoneNumber(
                firebaseAuth,
                `+91${mobile}`,
                await getRecaptchaVerifier()
            );
            setOtpConfirmation(confirmation);
            return { success: true, message: 'OTP sent successfully' };
        } catch (error) {
            resetRecaptcha();
            return {
                success: false,
                message: error?.message || 'Failed to send OTP. Please try again.'
            };
        }
    };

const verifyOtp = async (mobile, otp) => {
  try {
    if (!otpConfirmation) {
      return {
        success: false,
        message: "Please request OTP again."
      };
    }

    const credential = await otpConfirmation.confirm(otp);

    // OTP verified by Firebase
    const res = await fetch(`${API}/api/auth/firebase-login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        mobile
      })
    });

    const data = await res.json();

    if (data.success) {
      await _setLoggedIn(data.user);
    }

    return data;
  } catch (error) {
    return {
      success: false,
      message: error?.message || "Invalid OTP"
    };
  }
};

    const logout = async () => {
        try {
            await fetch(`${API}/api/auth/logout`, { method: 'POST', credentials: 'include' }).catch(() => {});
        } finally {
            localStorage.removeItem('user');
            localStorage.removeItem('isLoggedIn');
            setUser(null);
        }
        return { success: true };
    };

    const isAuthenticated = () => localStorage.getItem('isLoggedIn') === 'true' && user !== null;
    const getUser = () => user || JSON.parse(localStorage.getItem('user') || 'null');

    const handleAuthModalSuccess = (userData) => {
        closeAuthModal();
        if (authModalCallback) authModalCallback(userData);
    };

    return (
        <AuthContext.Provider value={{
            user, loading,
            login, register, logout,
            isAuthenticated, getUser,
            sendOtp, verifyOtp,
            openAuthModal, closeAuthModal
        }}>
            {children}
            {authModalOpen && (
                <OtpModal
                    onSuccess={handleAuthModalSuccess}
                    onClose={closeAuthModal}
                />
            )}
        </AuthContext.Provider>
    );
};
