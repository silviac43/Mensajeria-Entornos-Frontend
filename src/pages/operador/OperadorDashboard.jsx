import logo from "../../images/logo.png";
import Footer from "../../components/Footer.jsx";

const OperadorDashboard = () => {
  return (
    <>
      <main className="home-container">
        <section className="intro text-center py-5">
          <div className="d-flex align-items-center justify-content-center gap-3 mb-4">
            <h1 className="display-4 fw-bold mb-0">Panel del operador</h1>
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
            Bienvenido al centro operativo de Agatha. Desde aquí podrás gestionar pedidos, asignar mensajeros y coordinar operaciones logísticas.
          </p>
        </section>

        <section
          className="full-width-section my-4 p-4 rounded-4 text-center"
          style={{ backgroundColor: "white" }}
        >
          <h2 className="mb-4 fw-bold">
            <i className="bi bi-tools me-2" style={{ color: "var(--color-primary-dark)" }}></i>
            Funciones principales
          </h2>
          <div className="d-flex flex-wrap justify-content-center gap-4">
            <div className="card shadow-sm border-0" style={{ backgroundColor: "#e1ddd3", width: "300px" }}>
              <div className="card-body">
                <h5 className="card-title">
                  <i className="bi bi-truck me-2" style={{ color: "#198754" }}></i>
                  Gestión de pedidos
                </h5>
                <p className="card-text">
                  Supervisa y coordina el flujo de pedidos desde la creación hasta su entrega final.
                </p>
              </div>
            </div>

            <div className="card shadow-sm border-0" style={{ backgroundColor: "#e1ddd3", width: "300px" }}>
              <div className="card-body">
                <h5 className="card-title">
                  <i className="bi bi-person-lines-fill me-2" style={{ color: "#6f42c1" }}></i>
                  Asignación de mensajeros
                </h5>
                <p className="card-text">
                  Asigna eficientemente mensajeros a cada pedido según la zona y disponibilidad.
                </p>
              </div>
            </div>

            <div className="card shadow-sm border-0" style={{ backgroundColor: "#e1ddd3", width: "300px" }}>
              <div className="card-body">
                <h5 className="card-title">
                  <i className="bi bi-arrow-repeat me-2" style={{ color: "#cca9bd" }}></i>
                  Actualización de estados
                </h5>
                <p className="card-text">
                  Cambia el estado de los pedidos en tiempo real para mantener informadas a todas las partes.
                </p>
              </div>
            </div>

            <div className="card shadow-sm border-0" style={{ backgroundColor: "#e1ddd3", width: "300px" }}>
              <div className="card-body">
                <h5 className="card-title">
                  <i className="bi bi-chat-left-dots-fill me-2" style={{ color: "#d63384" }}></i>
                  Comunicación efectiva
                </h5>
                <p className="card-text">
                  Facilita la comunicación entre empresas, mensajeros y clientes para una operación fluida.
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

export default OperadorDashboard;
