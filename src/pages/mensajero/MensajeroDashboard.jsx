import logo from "../../images/logo.png";
import Footer from "../../components/Footer.jsx";

const MensajeroDashboard = () => {
  return (
    <>
      <main className="home-container">
        <section className="intro text-center py-5">
          <div className="d-flex align-items-center justify-content-center gap-3 mb-4">
            <h1 className="display-4 fw-bold mb-0">Panel del mensajero</h1>
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
            Bienvenido a tu centro de control como mensajero. Desde aquí podrás gestionar tus entregas, actualizar estados de pedidos y mantener tu información al día.
          </p>
        </section>

        <section className="full-width-section my-4 p-4 rounded-4 text-center" style={{ backgroundColor: "white" }}>
          <h2 className="mb-4 fw-bold">
            <i className="bi bi-truck me-2" style={{ color: 'var(--color-primary-dark)' }}></i>
            Tus funciones
          </h2>
          <div className="d-flex flex-wrap justify-content-center gap-4">
            <div className="card shadow-sm border-0" style={{ backgroundColor: "#e1ddd3", width: "300px" }}>
              <div className="card-body">
                <h5 className="card-title">
                  <i className="bi bi-box-seam-fill me-2" style={{ color: '#252850' }}></i>
                  Gestión de pedidos
                </h5>
                <p className="card-text">
                  Visualiza todos tus pedidos asignados, con información detallada de cada entrega programada.
                </p>
              </div>
            </div>

            <div className="card shadow-sm border-0" style={{ backgroundColor: "#e1ddd3", width: "300px" }}>
              <div className="card-body">
                <h5 className="card-title">
                  <i className="bi bi-arrow-clockwise me-2" style={{ color: '#28a745' }}></i>
                  Actualización de estados
                </h5>
                <p className="card-text">
                  Cambia el estado de tus pedidos en tiempo real para mantener informados a clientes y supervisores.
                </p>
              </div>
            </div>

            <div className="card shadow-sm border-0" style={{ backgroundColor: "#e1ddd3", width: "300px" }}>
              <div className="card-body">
                <h5 className="card-title">
                  <i className="bi bi-clock-history me-2" style={{ color: '#cca9bd' }}></i>
                  Historial de entregas
                </h5>
                <p className="card-text">
                  Accede al registro completo de todas tus entregas realizadas y el historial de cambios en cada pedido.
                </p>
              </div>
            </div>

            <div className="card shadow-sm border-0" style={{ backgroundColor: "#e1ddd3", width: "300px" }}>
              <div className="card-body">
                <h5 className="card-title">
                  <i className="bi bi-person-gear me-2" style={{ color: '#6610f2' }}></i>
                  Información personal
                </h5>
                <p className="card-text">
                  Actualiza y mantén al día tu información personal para una comunicación efectiva y control de perfil.
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

export default MensajeroDashboard;