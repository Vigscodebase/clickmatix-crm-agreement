import { Routes, Route, Navigate, BrowserRouter } from 'react-router-dom';
import Agreement from './pages/agreement';
import PandaTemplate from "./pages/pandatemplate";
import PandaDocument from "./pages/pandadocument";
import Login from "./pages/login";
import Usermanagement from "./pages/usermanagement";
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import SignnowTemplate from "./pages/signnowtemplate";
import SignnowDocument from "./pages/signnowdocument";

const App = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public Routes Block */}
          <Route path="/login" element={<Login />} />

          {/* Universal Layout Fallbacks - FIXED: Changed duplicate /login path to /unauthorized */}
          <Route path="/unauthorized" element={<div className="error-center"><h2>Access Forbidden</h2></div>} />

          {/* Authenticated Global Firewall Matrix Base Wrapper */}
          <Route element={<ProtectedRoute />}>
            <Route path="/panda-create-document" element={<PandaDocument />} />
            <Route path="/panda-create-template" element={<PandaTemplate />} />
            <Route path="/signnow-create-document" element={<SignnowDocument />} />
            <Route path="/signnow-create-template" element={<SignnowTemplate />} />
          </Route>

          {/* Highly Restricted Management Tier (Role Enforcement Layer) */}
          <Route element={<ProtectedRoute allowedRoles={['super_admin']} />}>
            <Route path="/user-management" element={<Usermanagement />} />
          </Route>

          {/* Wildcard Route Interception */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;