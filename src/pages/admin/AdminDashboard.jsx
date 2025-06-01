import logo from "../../images/logo.png";
import Footer from "../../components/Footer.jsx";

const AdminDashboard = () => {
  return (
    <>
      <main className="home-container">
        <section className="intro text-center py-5">
          <div className="d-flex align-items-center justify-content-center gap-3 mb-4">
            <h1 className="display-4 fw-bold mb-0">Panel de administrador</h1>
            <img
              src={logo}
              alt="Logo Agatha"
              style={{
                width: "120px",
                height: "120px",
                borderRadius: "50%",
                objectFit: "cover",
                border: "2px solid var(--color-border)",
                backgroundColor: "white",
              }}
            />
          </div>
          <p className="lead px-3 px-md-5">
            Bienvenido al centro de control de Agatha. Desde aquí podrás gestionar empresas, usuarios, pedidos y mucho más.
          </p>
        </section>

        <section className="full-width-section my-4 p-4 rounded-4 text-center" style={{ backgroundColor: "white" }}>
          <h2 className="mb-4 fw-bold">
            <i className="bi bi-sliders me-2" style={{ color: 'var(--color-primary-dark)' }}></i>
            Tus funciones
          </h2>
          <div className="d-flex flex-wrap justify-content-center gap-4">
            <div className="card shadow-sm border-0" style={{ backgroundColor: "#e1ddd3", width: "300px" }}>
              <div className="card-body">
                <h5 className="card-title">
                  <i className="bi bi-buildings me-2" style={{ color: '#ff6600' }}></i>
                  Gestión de empresas y usuarios
                </h5>
                <p className="card-text">
                  Administra todas las empresas registradas, asigna y modifica roles de los usuarios vinculados a cada una.
                </p>
              </div>
            </div>

            <div className="card shadow-sm border-0" style={{ backgroundColor: "#e1ddd3", width: "300px" }}>
              <div className="card-body">
                <h5 className="card-title">
                  <i className="bi bi-gear-fill me-2" style={{ color: '#6610f2' }}></i>
                  Control total del sistema
                </h5>
                <p className="card-text">
                  Supervisa pedidos, historial de entregas, clientes y más desde una sola vista centralizada.
                </p>
              </div>
            </div>

            <div className="card shadow-sm border-0" style={{ backgroundColor: "#e1ddd3", width: "300px" }}>
              <div className="card-body">
                <h5 className="card-title">
                  <i className="bi bi-shield-lock-fill me-2" style={{ color: '#d63384' }}></i>
                  Seguridad y control
                </h5>
                <p className="card-text">
                  Acceso privilegiado para mantener la integridad del sistema, con posibilidad de auditar y tomar decisiones estratégicas.
                </p>
              </div>
            </div>

            <div className="card shadow-sm border-0" style={{ backgroundColor: "#e1ddd3", width: "300px" }}>
              <div className="card-body">
                <h5 className="card-title">
                  <i className="bi bi-grid-3x3-gap-fill me-2" style={{ color: '#033500' }}></i>
                  Panel central
                </h5>
                <p className="card-text">
                  Punto de partida para visualizar actividades en tiempo real y tomar decisiones informadas rápidamente.
                </p>
              </div>
            </div>
          </div>
        </section>
        <Footer />
      </main>
    </>
  );
};

export default AdminDashboard;
