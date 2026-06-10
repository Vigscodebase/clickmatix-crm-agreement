import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import AuthApi from '../api/auth';
import { AlertCircle, CheckCircle, UserPlus, Pencil, Trash2, ArrowLeft } from 'lucide-react';

const UserManagement = () => {
    const { token } = useAuth();

    // View Management Pipeline Toggles: 'list' | 'add' | 'edit'
    const [viewMode, setViewMode] = useState('list');

    // System Lifecycle States
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // Current Operator Identity Details
    const [currentUser, setCurrentUser] = useState({ email: '', role: '' });
    const [isAuthorized, setIsAuthorized] = useState(false);

    // Form Binding Hooks
    const [selectedUserId, setSelectedUserId] = useState('');
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        role: 'sales_manager'
    });

    // Extract authorization payload claims locally to verify RBAC system clearance
    useEffect(() => {
        if (token) {
            try {
                const base64Url = token.split('.')[1];
                const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
                const payload = JSON.parse(window.atob(base64));

                setCurrentUser({ email: payload.email, role: payload.role });

                // Allow account updates/deletions only for super_admin and admin classifications
                if (payload.role === 'super_admin' || payload.role === 'admin') {
                    setIsAuthorized(true);
                } else {
                    setIsAuthorized(false);
                }
            } catch (err) {
                console.error("Critical authorization decoding error:", err);
            }
        }
    }, [token]);

    useEffect(() => {
        fetchWorkspaceUsers();
    }, []);

    const fetchWorkspaceUsers = async () => {
        setLoading(true);
        setError('');
        try {
            const res = await AuthApi.ListUsers();
            setUsers(res.data?.data || []);
        } catch (err) {
            setError(err.response?.data?.message || 'Access pipeline configuration error: Unable to map database profiles.');
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const resetFormState = () => {
        setFormData({ name: '', email: '', password: '', role: 'sales_manager' });
        setSelectedUserId('');
        setError('');
    };

    const handleTransitionToAdd = () => {
        resetFormState();
        setSuccess('');
        setViewMode('add');
    };

    const handleTransitionToEdit = (user) => {
        setSuccess('');
        setError('');
        setSelectedUserId(user.id);

        // Reverse slug assignments to map cleanly into dropdown state fields
        let mappedRoleSlug = 'sales_manager';
        const roleCheck = user.role?.toLowerCase();
        if (roleCheck.includes('super admin') || roleCheck === 'super_admin') mappedRoleSlug = 'super_admin';
        else if (roleCheck.includes('admin') || roleCheck === 'admin') mappedRoleSlug = 'admin';
        else if (roleCheck.includes('account') || roleCheck === 'account_manager') mappedRoleSlug = 'account_manager';

        setFormData({
            name: user.name || '',
            email: user.email || '',
            password: '',
            role: mappedRoleSlug
        });
        setViewMode('edit');
    };

    const handleFormSubmitCreate = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            await AuthApi.CreateUser({
                add_name: formData.name,
                add_email: formData.email.trim().toLowerCase(),
                add_password: formData.password,
                addrole_dropdown: formData.role
            });

            setSuccess('New user account environment configured successfully.');
            await fetchWorkspaceUsers();
            setViewMode('list');
            resetFormState();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to persist alternative account mappings.');
        } finally {
            setLoading(false);
        }
    };

    const handleFormSubmitEdit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            await AuthApi.EditUser(selectedUserId, {
                edit_name: formData.name,
                edit_email: formData.email.trim().toLowerCase(),
                editrole_dropdown: formData.role,
                edit_password: formData.password
            });

            setSuccess('User workspace configuration rules adjusted successfully.');
            await fetchWorkspaceUsers();
            setViewMode('list');
            resetFormState();
        } catch (err) {
            setError(err.response?.data?.message || 'Operation failure executing target metadata adjustments.');
        } finally {
            setLoading(false);
        }
    };

    const handleExecuteDelete = async (targetId, targetName) => {
        if (!window.confirm(`Are you sure you want to permanently strip account permissions for [${targetName}]?`)) return;

        setLoading(true);
        setError('');
        try {
            await AuthApi.DeleteUser(targetId, {
                superadmin_email: currentUser.email
            });

            setSuccess('Account profile visibility contextual flag dropped successfully.');
            await fetchWorkspaceUsers();
        } catch (err) {
            setError(err.response?.data?.message || 'Access matrix error: Target resource deletion failed.');
        } finally {
            setLoading(false);
        }
    };

    if (loading && viewMode === 'list') {
        return <div className="user-mgmt-loading">Syncing active system directory mappings...</div>;
    }

    return (
        <div className="user-mgmt-page">
            <div className="user-mgmt-container">

                {/* Visual Feedback Alerts */}
                {error && (
                    <div className="mgmt-status-banner banner-error" role="alert">
                        <span className="banner-icon">
                            <AlertCircle size={18} style={{ verticalAlign: 'middle' }} />
                        </span>
                        <span className="banner-text">{error}</span>
                    </div>
                )}
                {success && (
                    <div className="mgmt-status-banner banner-success" role="alert">
                        <span className="banner-icon">
                            <CheckCircle size={18} style={{ verticalAlign: 'middle' }} />
                        </span>
                        <span className="banner-text">{success}</span>
                    </div>
                )}

                {/* VIEW LAYER 1: ADMIN DIRECTORY TABLE LISTING */}
                {viewMode === 'list' && (
                    <>
                        <div className="user-mgmt-header">
                            <div>
                                <h1 className="mgmt-title">User Accounts</h1>
                                <p className="mgmt-subtitle">Manage authorization boundaries, access roles, and audit security credentials.</p>
                            </div>
                            {isAuthorized && (
                                <button type="button" className="mgmt-btn-primary" onClick={handleTransitionToAdd}>
                                    <UserPlus size={16} style={{ marginRight: '6px', verticalAlign: 'middle' }} /> Create New User
                                </button>
                            )}
                        </div>

                        {users.length === 0 ? (
                            <div className="mgmt-empty-notice">No active network credentials found matching this context path.</div>
                        ) : (
                            <div className="mgmt-table-wrapper">
                                <table className="user-data-table">
                                    <thead>
                                        <tr className="table-header-row">
                                            <th className="table-th">Account Name</th>
                                            <th className="table-th">Email</th>
                                            <th className="table-th">Role</th>
                                            <th className="table-th actions-header-th">Account Operations</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {users.map((user) => {
                                            // Format raw role inputs neatly for display
                                            const normalizedRoleStr = user.role || 'sales_manager';
                                            const cleanRoleLabel = normalizedRoleStr.replace('_', ' ');
                                            const roleBadgeClassName = `badge-role-${normalizedRoleStr.toLowerCase().replace(' ', '_')}`;

                                            return (
                                                <tr key={user.id} className="table-body-row">
                                                    <td className="table-td td-primary-bold">
                                                        <div className="user-profile-flex">
                                                            <div className="user-avatar-circle">
                                                                {user.image ? (
                                                                    <img src={user.image} alt={user.name} />
                                                                ) : (
                                                                    (user.name || 'US').substring(0, 2).toUpperCase()
                                                                )}
                                                            </div>
                                                            <div>
                                                                <div className="user-display-name">{user.name || 'Unassigned Profile'}</div>
                                                                {/* ID display commented out to prevent rendering while preserving layout structure */}
                                                                {/* <span className="metadata-id-tag">ID: {user.id}</span> */}
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="table-td td-email-text">{user.email}</td>
                                                    <td className="table-td">
                                                        <span className={`role-badge ${roleBadgeClassName}`}>
                                                            {cleanRoleLabel.toUpperCase()}
                                                        </span>
                                                    </td>
                                                    <td className="table-td">
                                                        <div className="actions-button-group">
                                                            <button
                                                                type="button"
                                                                className="btn-action btn-edit-mgmt"
                                                                disabled={!isAuthorized}
                                                                onClick={() => handleTransitionToEdit(user)}
                                                            >
                                                                <Pencil size={14} style={{ marginRight: '4px', verticalAlign: 'middle' }} /> Edit
                                                            </button>
                                                            {/* <button
                                                                type="button"
                                                                className="btn-action btn-delete-mgmt"
                                                                disabled={!isAuthorized}
                                                                onClick={() => handleExecuteDelete(user.id, user.name)}
                                                            >
                                                                <Trash2 size={14} style={{ marginRight: '4px', verticalAlign: 'middle' }} /> Delete
                                                            </button> */}
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </>
                )}

                {/* VIEW LAYER 2 & 3: ISOLATED MANAGEMENT OPERATION PANEL FORM */}
                {(viewMode === 'add' || viewMode === 'edit') && (
                    <div className="mgmt-form-card">
                        <div className="form-card-header">
                            <h2 className="form-card-title">
                                {viewMode === 'add' ? 'Provision Workspace Identity Matrix' : 'Modify Core Identity Constraints'}
                            </h2>
                            <button type="button" className="mgmt-btn-secondary" onClick={() => { setViewMode('list'); resetFormState(); }}>
                                <ArrowLeft size={16} style={{ marginRight: '6px', verticalAlign: 'middle' }} /> Cancel & Dismiss
                            </button>
                        </div>

                        <form onSubmit={viewMode === 'add' ? handleFormSubmitCreate : handleFormSubmitEdit} className="mgmt-form-layout">

                            <div className="form-grid-two-columns">
                                <div className="form-group">
                                    <label className="form-label" htmlFor="name">Fullname</label>
                                    <input
                                        id="name"
                                        name="name"
                                        type="text"
                                        className="form-input"
                                        placeholder="Alex Mercer"
                                        value={formData.name}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label className="form-label" htmlFor="email">Email Address</label>
                                    <input
                                        id="email"
                                        name="email"
                                        type="email"
                                        className="form-input"
                                        placeholder="name@company.com"
                                        value={formData.email}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="form-grid-two-columns">
                                <div className="form-group">
                                    <label className="form-label" htmlFor="password">
                                        Password {viewMode === 'edit' && <span className="label-optional-badge">(Blank leaves unchanged)</span>}
                                    </label>
                                    <input
                                        id="password"
                                        name="password"
                                        type="password"
                                        className="form-input"
                                        placeholder="••••••••"
                                        value={formData.password}
                                        onChange={handleInputChange}
                                        required={viewMode === 'add'}
                                    />
                                </div>

                                <div className="form-group">
                                    <label className="form-label" htmlFor="role">Role</label>
                                    <select
                                        id="role"
                                        name="role"
                                        className="form-input form-select-dropdown"
                                        value={formData.role}
                                        onChange={handleInputChange}
                                        required
                                    >
                                        <option value="super_admin">Super Admin</option>
                                        <option value="admin">Admin</option>
                                        <option value="sales_manager">Sales Manager</option>
                                        <option value="account_manager">Account Manager</option>
                                    </select>
                                </div>
                            </div>

                            <div className="form-actions-footer">
                                <button type="submit" className="mgmt-btn-primary action-submit-stretch" disabled={loading}>
                                    {loading ? 'Committing Changes...' : viewMode === 'add' ? 'Add User' : 'Update User'}
                                </button>
                            </div>
                        </form>
                    </div>
                )}

            </div>
        </div>
    );
};

export default UserManagement;