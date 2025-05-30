import { Link } from 'react-router-dom';
import logo from '../images/logo.png';

const RoleNavbar = ({ userRole, onLogout }) => {
  const roleNavItems = {
    ROLE_admin_mensajeria: [
      { label: "Clientes", path: "/admin/clientes" },
      { label: "Empresas", path: "/admin/empresas" },
      { label: "Pedidos", path: "/admin/pedidos" },
      { label: "Historial de pedidos", path: "/admin/historial_pedido" },
      { label: "Usuarios", path: "/admin/usuarios" },
      { label: "Mi información", path: "/admin/info" }
    ],
    ROLE_operador: [
      { label: "Clientes", path: "/operador/clientes" },
      { label: "Pedidos", path: "/operador/pedidos" },
      { label: "Historial de pedidos", path: "/operador/historial_pedido" },
      { label: "Mensajeros", path: "/operador/mensajeros" },
      { label: "Mi información", path: "/operador/info" }
    ],
    ROLE_mensajero: [
      { label: "Mis pedidos", path: "/mensajero/pedidos" },
      { label: "Historial de mis pedidos", path: "/mensajero/historial_pedido" },
      { label: "Mi información", path: "/mensajero/info" }
    ]
  };

  const navItems = roleNavItems[userRole] || [];

  const getDashboardPath = () => {
    if (userRole === 'ROLE_admin_mensajeria') return '/admin';
    if (userRole === 'ROLE_operador') return '/operador';
    if (userRole === 'ROLE_mensajero') return '/mensajero';
    return '/';
  };

  return (
    <nav
      style={{
        backgroundColor: "#e1ddd3",
        padding: "0.75rem 2rem",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        boxShadow: "0 2px 8px rgba(20, 38, 99, 0.4)",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "2rem",
          flexGrow: 1,
          borderRight: "1px solid #ccc",
          paddingRight: "1rem",
        }}
      >
        <Link
          to={getDashboardPath()}
          style={{
            display: "flex",
            alignItems: "center",
            textDecoration: "none",
            color: "#374151",
            gap: "0.5rem",
          }}
        >
          <img
            src={logo}
            alt="Logo"
            style={{
              height: "80px",
              width: "80px",
              objectFit: "cover",
            }}
          />
        </Link>

        <ul
          style={{
            display: "flex",
            listStyle: "none",
            gap: "2rem",
            margin: 0,
            padding: 0,
          }}
        >
          {navItems.map((item) => (
            <li key={item.label}>
              <Link
                to={item.path}
                style={{
                  color: "#374151",
                  textDecoration: "none",
                  fontWeight: "500",
                  transition: "color 0.3s ease",
                }}
                onMouseEnter={(e) => (e.target.style.color = "#4a90e2")}
                onMouseLeave={(e) => (e.target.style.color = "#374151")}
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>

      <button
        onClick={onLogout}
        style={{
          backgroundColor: "#111827",
          color: "#e1ddd3",
          padding: "0.5rem 1.2rem",
          borderRadius: "20px",
          border: "none",
          fontWeight: "600",
          cursor: "pointer",
          boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
          transition: "all 0.3s ease",
          whiteSpace: "nowrap",
        }}
        onMouseEnter={(e) => {
          e.target.style.backgroundColor = "#4a90e2";
          e.target.style.color = "white";
        }}
        onMouseLeave={(e) => {
          e.target.style.backgroundColor = "#111827";
          e.target.style.color = "#e1ddd3";
        }}
      >
        Cerrar Sesión
      </button>
    </nav>
  );
};

export default RoleNavbar;
