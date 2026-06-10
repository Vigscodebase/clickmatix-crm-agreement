import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import DashboardLayout from './DashboardLayout';

/**
 * Route firewall defending secure functional endpoints against unauthorized interactions.
 * Supports explicit granular role verification filters out of the box.
 */
const ProtectedRoute = ({ allowedRoles }) => {
    const { user, token } = useAuth();
    const location = useLocation();

    // 1. Check baseline token validation state
    if (!token || !user) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // 2. RBAC Layer: Enforce roles matching your user_model structure
    if (allowedRoles && !allowedRoles.includes(user.role)) {
        return <Navigate to="/unauthorized" replace />;
    }

    // Renders the authorized sub-routes tree layouts contextually wrapped in the Sidebar Navigation Layout
    return (
        <DashboardLayout>
            <Outlet />
        </DashboardLayout>
    );
};

export default ProtectedRoute;