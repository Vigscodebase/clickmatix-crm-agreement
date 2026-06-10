import { useState, useEffect } from 'react';
import { useNavigate, Link } from "react-router-dom";
import AuthApi from '../api/auth';
import RoleApi from '../api/role';
import { useAuth } from '../context/AuthContext'; // Import the authentication hook

const Login = () => {
    const navigate = useNavigate();
    const { token, updateToken } = useAuth(); // Destructure the reactive context states and setters

    // Input States
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [selectedRole, setSelectedRole] = useState('');

    // System Lifecycle States
    const [roles, setRoles] = useState([]);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [fetchingRoles, setFetchingRoles] = useState(true);

    // Guard Clause: Prevent already authenticated users from accessing login page using reactive token state
    useEffect(() => {
        if (token) {
            navigate('/panda-create-template', { replace: true });
        }
    }, [token, navigate]);

    // Fetch predefined database roles dynamically on mount
    useEffect(() => {
        const loadPredefinedRoles = async () => {
            try {
                setError('');
                const res = await RoleApi.GetRoles();

                // Handle standard array wrapping safely or fall back gracefully
                const rolesData = res.data?.data || res.data || [];
                setRoles(rolesData);
            } catch (err) {
                console.error("Role fetching failure:", err);
                setError("System configuration error: Unable to verify access permissions.");
            } finally {
                setFetchingRoles(false);
            }
        };

        loadPredefinedRoles();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!email || !password) {
            setError("All fields, including role classification, are required.");
            return;
        }

        setError('');
        setLoading(true);

        try {
            // Sends the data securely to user_controller.js
            const res = await AuthApi.Login({
                email: email.trim().toLowerCase(),
                password,
                role: selectedRole
            });

            const receivedToken = res.data?.token;
            if (receivedToken) {
                // FIX: Update the global AuthContext state so ProtectedRoute registers the session instantly
                updateToken(receivedToken);
                navigate('/panda-create-template', { replace: true });
            } else {
                throw new Error("Invalid response structural context from auth engine.");
            }
        } catch (err) {
            console.error('Login error:', err);
            // Protects against error string leaking while showing backend validation messaging
            setError(err.response?.data?.message || 'Authentication failed. Please verify your credentials.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page-container">
            <div className="auth-card">
                {/* <div className="auth-header-brand">
                    <span className="auth-brand-icon">🛡️</span>
                    <span className="auth-brand-badge">SECURE GATEWAY</span>
                </div> */}

                <h1 className="auth-title">Welcome Back</h1>
                <p className="auth-subtitle">Sign in to manage your core agreement workspace</p>

                {error && (
                    <div className="error-banner" role="alert">
                        <span className="error-icon">⚠️</span>
                        <span className="error-text">{error}</span>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="auth-form-layout">
                    {/* Email Input */}
                    <div className="form-group">
                        <label className="form-label" htmlFor="email">Email Address</label>
                        <input
                            id="email"
                            type="email"
                            className="form-input"
                            placeholder="name@company.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            disabled={loading || fetchingRoles}
                            autoComplete="username"
                            required
                        />
                    </div>

                    {/* Password Input */}
                    <div className="form-group">
                        <label className="form-label" htmlFor="password">Password</label>
                        <input
                            id="password"
                            type="password"
                            className="form-input"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            disabled={loading || fetchingRoles}
                            autoComplete="current-password"
                            required
                        />
                    </div>

                    {/* DYNAMIC ROLE DROPDOWN */}
                    {/* <div className="form-group">
                        <label className="form-label" htmlFor="role">Account Role Classification</label>
                        <select
                            id="role"
                            className="form-input form-select"
                            value={selectedRole}
                            onChange={(e) => setSelectedRole(e.target.value)}
                            disabled={loading || fetchingRoles}
                            required
                        >
                            <option value="" disabled hidden>
                                {fetchingRoles ? "Loading access scopes..." : "-- Select Your System Role --"}
                            </option>
                            {roles.map((r) => (
                                <option key={r._id || r.role_slug} value={r.role_slug}>
                                    {r.role_name}
                                </option>
                            ))}
                        </select>
                    </div> */}

                    {/* Submit Button Controls */}
                    <button
                        type="submit"
                        className="auth-btn-primary"
                        disabled={loading || fetchingRoles}
                    >
                        {loading ? 'Authenticating System Access...' : 'Sign In To Account'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Login;