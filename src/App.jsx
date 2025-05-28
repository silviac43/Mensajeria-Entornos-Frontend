import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import RoleNavbar from './components/RoleNavbar';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import PrivateRoute from './components/PrivateRoute';
import Home from './pages/Home';

// Páginas de admin
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminClientes from './pages/admin/AdminClientes';
import AdminEmpresas from './pages/admin/AdminEmpresas';
import AdminHistorial from './pages/admin/AdminHistorialPedidos';
import AdminPedidos from './pages/admin/AdminPedidos';
import AdminUsuarios from './pages/admin/AdminUsuarios';
import AdminInfo from './pages/admin/AdminInformacion';

// Páginas de operador
import OperadorDashboard from './pages/operador/OperadorDashboard';
import OperadorClientes from './pages/operador/OperadorClientes';
import OperadorHistorial from './pages/operador/OperadorHistorialPedidos';
import OperadorPedidos from './pages/operador/OperadorPedidos';
import OperadorMensajeros from './pages/operador/OperadorMensajeros';
import OperadorInfo from './pages/operador/OperadorInformacion';

// Páginas de mensajero
import MensajeroDashboard from './pages/mensajero/MensajeroDashboard';
import MensajeroHistorial from './pages/mensajero/MensajeroHistorialPedidos';
import MensajeroPedidos from './pages/mensajero/MensajeroPedidos';
import MensajeroInfo from './pages/mensajero/MensajeroInformacion';

const App = () => {
  const { auth, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Determina la ruta base según el rol
  const getRoleBasePath = (role) => {
    if (!role) return '';
    if (role.includes('admin')) return 'admin';
    if (role.includes('operador')) return 'operador';
    if (role.includes('mensajero')) return 'mensajero';
    return '';
  };

  return (
    <>
      {/* Navbar pública o navbar según rol */}
      {!auth.user ? <Navbar /> : <RoleNavbar userRole={auth.role} onLogout={handleLogout} />}

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />

        {/* Rutas protegidas para admin */}
        <Route element={<PrivateRoute allowedRoles={['ROLE_admin_mensajeria']} />}>
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/clientes" element={<AdminClientes />} />
          <Route path="/admin/empresas" element={<AdminEmpresas />} />
          <Route path="/admin/pedidos" element={<AdminPedidos />} />
          <Route path="/admin/historial_pedido" element={<AdminHistorial />} />
          <Route path="/admin/usuarios" element={<AdminUsuarios />} />
          <Route path="/admin/info" element={<AdminInfo />} />
        </Route>

        {/* Rutas protegidas para operador */}
        <Route element={<PrivateRoute allowedRoles={['ROLE_operador']} />}>
          <Route path="/operador" element={<OperadorDashboard />} />
          <Route path="/operador/clientes" element={<OperadorClientes />} />
          <Route path="/operador/pedidos" element={<OperadorPedidos />} />
          <Route path="/operador/historial_pedido" element={<OperadorHistorial />} />
          <Route path="/operador/mensajeros" element={<OperadorMensajeros />} />
          <Route path="/operador/info" element={<OperadorInfo />} />
        </Route>


        {/* Rutas protegidas para mensajero */}
        <Route element={<PrivateRoute allowedRoles={['ROLE_mensajero']} />}>
          <Route path="/mensajero" element={<MensajeroDashboard />} />
          <Route path="/mensajero/pedidos" element={<MensajeroPedidos />} />
          <Route path="/mensajero/historial_pedido" element={<MensajeroHistorial />} />
          <Route path="/mensajero/info" element={<MensajeroInfo />} />
        </Route>

        {/* Redirección catch-all */}
        <Route
          path="*"
          element={<Navigate to={auth.user ? `/${getRoleBasePath(auth.role)}` : '/login'} />}
        />
      </Routes>
    </>
  );
};

export default App;
