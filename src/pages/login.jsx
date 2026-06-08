import { useState, useEffect } from 'react';
import { useNavigate, Link } from "react-router-dom";

const Login = () => {
    const navigate = useNavigate();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    // Redirect to dashboard if already logged in
    // useEffect(() => {
    //     const token = localStorage.getItem('token');
    //     if (token) {
    //         navigate('/dashboard');
    //     }
    // }, [router]);

    const handleSubmit = async (e) => {
        // e.preventDefault();
        // setError('');
        // setLoading(true);

        // try {
        //     const res = await api.post('/api/auth/login', { email, password });

        //     localStorage.setItem('token', res.data.token);
        //     navigate('/dashboard');
        // } catch (err) {
        //     console.error('Login error:', err);
        //     setError(err.response?.data?.message || 'Invalid email or password. Please try again.');
        // } finally {
        //     setLoading(false);
        // }
    };

    return (
        <div className="auth-page-container">
            <div className="auth-card">
                {/* <div className="auth-header-brand">
                    <span className="auth-brand-icon">📄</span>
                    <span className="auth-brand-badge">WORKSPACE HUB</span>
                </div> */}

                <h1 className="auth-title">Welcome Back</h1>
                <p className="auth-subtitle">Sign in to manage your agreements</p>

                {error && <div className="error-banner">{error}</div>}

                <form onSubmit={handleSubmit} className="auth-form-layout">
                    <div className="form-group">
                        <label className="form-label" htmlFor="email">Email Address</label>
                        <input
                            id="email"
                            type="email"
                            className="form-input"
                            placeholder="name@company.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label" htmlFor="password">Password</label>
                        <input
                            id="password"
                            type="password"
                            className="form-input"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    <button type="submit" className="auth-btn-primary" disabled={loading}>
                        {loading ? 'Signing in...' : 'Sign In'}
                    </button>
                </form>

                <p className="auth-footer-text">
                    Don't have an account?{' '}
                    <Link to="/register" className="auth-link">
                        Sign up
                    </Link>
                </p>
            </div>
        </div>
    );
};

export default Login;