import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Menu, ChevronLeft, Layers, FileText, Layout, Users, LogOut } from 'lucide-react';

const DashboardLayout = ({ children }) => {
    const { user, logout } = useAuth();
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };

    // RBAC validation matching your App.jsx routes tier definitions
    const hasAdminAccess = user && ['super_admin'].includes(user.role);

    return (
        <div className={`dashboard-workspace-layout ${isSidebarOpen ? 'sidebar-expanded' : 'sidebar-collapsed'}`}>

            {/* FLOATING ACTION TOGGLE LINK BUTTON */}
            <button
                type="button"
                className="sidebar-toggle-action-trigger"
                onClick={toggleSidebar}
                aria-label="Toggle Navigation Control Panel"
            >
                {isSidebarOpen ? (
                    <>
                        <ChevronLeft size={16} style={{ marginRight: '6px', verticalAlign: 'middle' }} />
                        Close Menu
                    </>
                ) : (
                    <>
                        <Menu size={16} style={{ marginRight: '6px', verticalAlign: 'middle' }} />
                        Open Menu
                    </>
                )}
            </button>

            {/* SYSTEM SIDEBAR VIEW LAYER */}
            <aside className="app-navigation-sidebar">
                <div className="sidebar-branding-header">
                    <span className="branding-logo-icon">
                        <Layers size={22} />
                    </span>
                    <div className="branding-meta-group">
                        <h2 className="branding-main-title">Clickmatix</h2>
                        <span className="branding-version-tag">v2.1.0-Core</span>
                    </div>
                </div>

                <nav className="sidebar-nav-links-pipeline">
                    <NavLink
                        to="/signnow-create-document"
                        className={({ isActive }) => `nav-link-anchor ${isActive ? 'nav-link-active' : ''}`}
                    >
                        <span className="link-glyph-icon">
                            <FileText size={18} style={{ verticalAlign: 'middle' }} />
                        </span>
                        <span className="link-text-label">Documents Dashboard</span>
                    </NavLink>

                    <NavLink
                        to="/signnow-create-template"
                        className={({ isActive }) => `nav-link-anchor ${isActive ? 'nav-link-active' : ''}`}
                    >
                        <span className="link-glyph-icon">
                            <Layout size={18} style={{ verticalAlign: 'middle' }} />
                        </span>
                        <span className="link-text-label">Template Manager</span>
                    </NavLink>

                    {hasAdminAccess && (
                        <NavLink
                            to="/user-management"
                            className={({ isActive }) => `nav-link-anchor ${isActive ? 'nav-link-active' : ''}`}
                        >
                            <span className="link-glyph-icon">
                                <Users size={18} style={{ verticalAlign: 'middle' }} />
                            </span>
                            <span className="link-text-label">User Management</span>
                        </NavLink>
                    )}
                </nav>

                {/* CURRENT OPERATOR APPLICATION PROFILE ACCOUNT BLOCK */}
                <div className="sidebar-identity-footer-card">
                    <div className="operator-profile-snippet">
                        <div className="operator-avatar-placeholder">
                            {(user?.email || 'OP').substring(0, 2).toUpperCase()}
                        </div>
                        <div className="operator-text-details">
                            <span className="operator-email-string" title={user?.email}>
                                {user?.email || 'System Agent'}
                            </span>
                            <span className={`operator-role-badge badge-slug-${user?.role?.toLowerCase()}`}>
                                {user?.role?.replace('_', ' ').toUpperCase() || 'OPERATOR'}
                            </span>
                        </div>
                    </div>
                    <button type="button" className="sidebar-action-logout-btn" onClick={logout}>
                        <LogOut size={16} style={{ marginRight: '6px', verticalAlign: 'middle' }} /> Logout
                    </button>
                </div>
            </aside>

            {/* SUB-ROUTER TARGET MAIN CONTENT PORTAL VIEW LAYER */}
            <main className="dashboard-main-viewport-content">
                {children}
            </main>
        </div>
    );
};

export default DashboardLayout;