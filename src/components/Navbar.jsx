import { HashLink } from 'react-router-hash-link';
import { Link } from 'react-router-dom';

const normalizeId = (text) => {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, "");
};

const Navbar = () => {
  const navItems = ["Acerca de", "Justificación", "Requerimientos", "Login"];

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
      {/* Logo / Nombre que lleva al inicio */}
      <Link
        to="/"
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
          <li key={item}>
            {item === "Login" ? (
              <Link
                to="/login"
                style={{
                  color: "var(--color-bg-overlay)",
                  textDecoration: "none",
                  fontWeight: "600",
                  transition: "color 0.3s ease",
                }}
                onMouseEnter={(e) => (e.target.style.color = "var(--color-accent)")}
                onMouseLeave={(e) => (e.target.style.color = "var(--color-bg-overlay)")}
              >
                {item}
              </Link>
            ) : (
              <HashLink
                smooth
                to={`/#${normalizeId(item)}`}
                style={{
                  color: "var(--color-bg-overlay)",
                  textDecoration: "none",
                  fontWeight: "600",
                  transition: "color 0.3s ease",
                }}
                onMouseEnter={(e) => (e.target.style.color = "var(--color-accent)")}
                onMouseLeave={(e) => (e.target.style.color = "var(--color-bg-overlay)")}
              >
                {item}
              </HashLink>
            )}
          </li>
        ))}
      </ul>
    </nav>
  );
};

export default Navbar;
