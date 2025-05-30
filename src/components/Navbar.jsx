import { HashLink } from "react-router-hash-link";
import { Link } from "react-router-dom";
import logo from "../images/logo.png";

const normalizeId = (text) => {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, "");
};

const Navbar = () => {
  const navItems = ["Acerca de", "Justificación", "Requerimientos"];

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
        }}
      >
        <Link
          to="/"
          style={{
            display: "flex",
            alignItems: "center",
            textDecoration: "none",
            paddingRight: "1rem",
            borderRight: "1px solid #ccc",
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

        {/* Navegación central (secciones) */}
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
              <HashLink
                smooth
                to={`/#${normalizeId(item)}`}
                style={{
                  color: "#374151",
                  textDecoration: "none",
                  fontWeight: "500",
                  transition: "color 0.3s ease",
                }}
                onMouseEnter={(e) => (e.target.style.color = "#4a90e2")}
                onMouseLeave={(e) => (e.target.style.color = "#111827")}
              >
                {item}
              </HashLink>
            </li>
          ))}
        </ul>
      </div>

      {/* Botón Login */}
      <Link
        to="/login"
        style={{
          backgroundColor: "#111827",
          color: "#e1ddd3",
          padding: "0.5rem 1.2rem",
          borderRadius: "20px",
          textDecoration: "none",
          fontWeight: "600",
          transition: "all 0.3s ease",
          boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
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
        Login
      </Link>
    </nav>
  );
};

export default Navbar;
