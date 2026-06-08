import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';

const Register = () => {
    const navigate = useNavigate();

    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('sales');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    // Redirect to dashboard if already logged in
    useEffect(() => {
        const token = localStorage.getItem('token');
        // if (token) {
        //     navigate('/dashboard');
        // }
    }, [navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const res = await api.post('/api/auth/register', {
                firstName,
                lastName,
                email,
                password,
                role,
            });

            // localStorage.setItem('token', res.data.token);
            // navigate('/dashboard');
        } catch (err) {
            console.error('Registration error:', err);
            setError(err.response?.data?.message || 'Failed to create account. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page-container">
            <div className="auth-card">
                {/* <div className="auth-header-brand">
                    <span className="auth-brand-icon">📄</span>
                    <span className="auth-brand-badge">WORKSPACE HUB</span>
                </div> */}

                <h1 className="auth-title">Create Account</h1>
                <p className="auth-subtitle">Get started with Agreement Manager</p>

                {error && <div className="error-banner">{error}</div>}

                <form onSubmit={handleSubmit} className="auth-form-layout">
                    <div className="form-grid-dual">
                        <div className="form-group">
                            <label className="form-label" htmlFor="firstName">First Name</label>
                            <input
                                id="firstName"
                                type="text"
                                className="form-input"
                                placeholder="John"
                                value={firstName}
                                onChange={(e) => setFirstName(e.target.value)}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label" htmlFor="lastName">Last Name</label>
                            <input
                                id="lastName"
                                type="text"
                                className="form-input"
                                placeholder="Doe"
                                value={lastName}
                                onChange={(e) => setLastName(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="form-label" htmlFor="email">Email Address</label>
                        <input
                            id="email"
                            type="email"
                            className="form-input"
                            placeholder="john@company.com"
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
                            placeholder="At least 6 characters"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label" htmlFor="role">Organization Role</label>
                        <div className="select-input-wrapper">
                            <select
                                id="role"
                                className="form-select"
                                value={role}
                                onChange={(e) => setRole(e.target.value)}
                            >
                                <option value="sales">Sales (Can create agreements)</option>
                                <option value="manager">Manager (Can review agreements)</option>
                            </select>
                        </div>
                    </div>

                    <button type="submit" className="auth-btn-primary" disabled={loading}>
                        {loading ? 'Creating Account...' : 'Register Account'}
                    </button>
                </form>

                <p className="auth-footer-text">
                    Already have an account?{' '}
                    <Link to="/login" className="auth-link">
                        Sign in
                    </Link>
                </p>
            </div>
        </div>
    );
};

export default Register;