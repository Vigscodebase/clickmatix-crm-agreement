import { useState, useEffect } from 'react';
import { useNavigate, Link } from "react-router-dom";
import AuthApi from '../api/auth';
import RoleApi from '../api/role';

const Login = () => {
    const navigate = useNavigate();

    // Input States
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [selectedRole, setSelectedRole] = useState('');

    // System Lifecycle States
    const [roles, setRoles] = useState([]);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [fetchingRoles, setFetchingRoles] = useState(true);

    // Guard Clause: Prevent authenticated users from accessing login page
    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            navigate('/panda-create-template');
        }
    }, [navigate]);

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
                //role: selectedRole
            });

            const token = res.data?.token;
            if (token) {
                localStorage.setItem('token', token);
                navigate('/panda-create-template');
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

                    {/* DYNAMIC ROLE DROPDOWN (Positioned precisely after password input) */}
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

                {/* <p className="auth-footer-text">
                    Need a secure profile provisioned?{' '}
                    <Link to="/register" className="auth-link">
                        Contact System Administrator
                    </Link>
                </p> */}
            </div>
        </div>
    );
};

export default Login;