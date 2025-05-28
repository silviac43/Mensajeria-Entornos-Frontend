import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const PrivateRoute = ({ allowedRoles }) => {
  const { auth } = useAuth();
  const userRole = auth.role;

  const getRoleBasePath = (role) => {
    if (!role) return '';
    if (role === 'ROLE_admin_mensajeria') return 'admin';
    if (role === 'ROLE_operador') return 'operador';
    if (role === 'ROLE_mensajero') return 'mensajero';
    return '';
  };


  if (!auth.user) {
    return <Navigate to="/login" replace />;
  }

  const hasAccess = allowedRoles?.includes(userRole);

  if (!hasAccess) {
    return <Navigate to={`/${getRoleBasePath(userRole)}`} replace />;
  }

  return <Outlet />;
};

export default PrivateRoute;
