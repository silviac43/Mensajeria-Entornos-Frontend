// src/components/RoleNavbar.jsx
import { Link } from 'react-router-dom';

const RoleNavbar = ({ userRole, onLogout }) => {
  const roleNavItems = {
    ROLE_admin_mensajeria: [
      { label: "Clientes", path: "/admin/clientes" },
      { label: "Empresas", path: "/admin/empresas" },
      { label: "Pedidos", path: "/admin/pedidos" },
      { label: "Historial de Pedidos", path: "/admin/historial_pedido" },
      { label: "Usuarios", path: "/admin/usuarios" },
      { label: "Mi información", path: "/admin/info" }
    ],
    ROLE_operador: [
      { label: "Clientes", path: "/operador/clientes" },
      { label: "Pedidos", path: "/operador/pedidos" },
      { label: "Historial de Pedidos", path: "/operador/historial_pedido" },
      { label: "Mensajeros", path: "/operador/mensajeros" },
      { label: "Mi información", path: "/operador/info" }
    ],
    ROLE_mensajero: [
      { label: "Pedidos", path: "/mensajero/pedidos" },
      { label: "Historial de Pedidos", path: "/mensajero/historial_pedido" },
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
        backgroundColor: "var(--color-primary)",
        padding: "0.75rem 2rem",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        color: "white",
        boxShadow: "0 2px 8px rgba(20, 38, 99, 0.4)",
      }}
    >
      <Link
        to={getDashboardPath()}
        style={{
          fontWeight: "700",
          fontSize: "1.8rem",
          letterSpacing: "2px",
          color: "white",
          textDecoration: "none",
        }}
      >
        Agatha
      </Link>

      <div style={{ display: "flex", alignItems: "center", gap: "2rem" }}>
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
                  color: "var(--color-bg-overlay)",
                  textDecoration: "none",
                  fontWeight: "600",
                  transition: "color 0.3s ease",
                }}
                onMouseEnter={(e) => (e.target.style.color = "var(--color-accent)")}
                onMouseLeave={(e) => (e.target.style.color = "var(--color-bg-overlay)")}
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>

        <button
          onClick={onLogout}
          style={{
            backgroundColor: "transparent",
            border: "2px solid var(--color-bg-overlay)",
            color: "var(--color-bg-overlay)",
            padding: "0.5rem 1rem",
            borderRadius: "6px",
            fontWeight: "600",
            cursor: "pointer",
            transition: "all 0.3s ease",
          }}
          onMouseEnter={(e) => {
            e.target.style.backgroundColor = "var(--color-bg-overlay)";
            e.target.style.color = "var(--color-primary)";
          }}
          onMouseLeave={(e) => {
            e.target.style.backgroundColor = "transparent";
            e.target.style.color = "var(--color-bg-overlay)";
          }}
        >
          Cerrar Sesión
        </button>
      </div>
    </nav>
  );
};

export default RoleNavbar;
