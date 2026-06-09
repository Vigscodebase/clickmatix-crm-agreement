import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { setupAxiosInterceptors } from '../api/axiosSetup';

const AuthContext = createContext(null);

const parseJwt = (token) => {
    try { return JSON.parse(atob(token.split('.')[1])); } catch (e) { return null; }
};

export const AuthProvider = ({ children }) => {
    const navigate = useNavigate();
    const [token, setToken] = useState(() => localStorage.getItem('token'));
    const [user, setUser] = useState(() => {
        const initialToken = localStorage.getItem('token');
        return initialToken ? parseJwt(initialToken) : null;
    });

    // Explicit state controlling the post-expiration modal display
    const [isExpiredModalOpen, setIsExpiredModalOpen] = useState(false);

    const idleTimerRef = useRef(null);

    // Triggers instantly when 7.5 minutes elapses or a 401 network error occurs
    const handleSessionExpiry = useCallback(() => {
        // SECURITY: Immediately drop local validation assets so no further API calls can be signed
        localStorage.removeItem('token');
        if (idleTimerRef.current) clearTimeout(idleTimerRef.current);

        // Render the blocking modal interface
        setIsExpiredModalOpen(true);
    }, []);

    // Bound directly to the "Okay" button interaction element
    const handleModalConfirm = () => {
        setIsExpiredModalOpen(false);
        setToken(null);
        setUser(null);

        // Clean routing transition back to auth portal
        navigate('/login', { replace: true });
    };

    // Standard intentional manual logouts
    const logout = useCallback(() => {
        localStorage.removeItem('token');
        setToken(null);
        setUser(null);
        if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
        setIsExpiredModalOpen(false);
        navigate('/login', { replace: true });
    }, [navigate]);

    const updateToken = useCallback((newToken) => {
        localStorage.setItem('token', newToken);
        setToken(newToken);
        setUser(parseJwt(newToken));
    }, []);

    const startIdleTimer = useCallback(() => {
        if (idleTimerRef.current) clearTimeout(idleTimerRef.current);

        // Do not process countdown monitors if already logged out or viewing expired modal
        if (!token || isExpiredModalOpen) return;

        const sessionTimeoutMs = 7.5 * 60 * 1000; // 7.5 Minutes

        idleTimerRef.current = setTimeout(() => {
            handleSessionExpiry();
        }, sessionTimeoutMs);
    }, [token, isExpiredModalOpen, handleSessionExpiry]);

    const handleUserInteraction = useCallback(() => {
        if (token && !isExpiredModalOpen) {
            startIdleTimer();
        }
    }, [token, isExpiredModalOpen, startIdleTimer]);

    // Bind backend interceptors to capture expiration exceptions dynamically
    useEffect(() => {
        setupAxiosInterceptors(updateToken, () => handleSessionExpiry());
    }, [updateToken, handleSessionExpiry]);

    // Track physical user engagement matrix
    useEffect(() => {
        if (!token || isExpiredModalOpen) {
            if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
            return;
        }

        const events = ['mousemove', 'keydown', 'mousedown', 'scroll', 'touchstart'];

        startIdleTimer();
        events.forEach(event => window.addEventListener(event, handleUserInteraction));

        return () => {
            events.forEach(event => window.removeEventListener(event, handleUserInteraction));
            if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
        };
    }, [token, isExpiredModalOpen, startIdleTimer, handleUserInteraction]);

    const value = { token, user, logout, updateToken };

    return (
        <AuthContext value={value}>
            {children}

            {/* DEDICATED BANK-STYLE POST-EXPIRATION INTERACTIVE MODAL */}
            {isExpiredModalOpen && (
                <div className="expired-modal-overlay">
                    <div className="expired-modal-card">
                        <div className="expired-modal-icon">🔒</div>
                        <h2>Session Expired</h2>
                        <p>Your session expired please login again.</p>
                        <button
                            type="button"
                            className="expired-modal-btn"
                            onClick={handleModalConfirm}
                        >
                            Okay
                        </button>
                    </div>
                </div>
            )}
        </AuthContext>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error("useAuth component execution boundary broken.");
    return context;
};