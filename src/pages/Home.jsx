import Carousel from "../components/Carousel";
import logo from "../images/logo.png";
import Footer from '../components/Footer.jsx';

const Home = () => {
  return (
    <>
      <main className="home-container">
        <section id="acercade" className="intro text-center py-5">
          <div className="d-flex align-items-center justify-content-center gap-3 mb-3">
          <h1 className="display-3 fw-bold mb-0">Agatha</h1>
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
            Una plataforma moderna diseñada para optimizar la gestión de pedidos y entregas en empresas de mensajería pequeñas y medianas (PYMEs).
            Rápida, segura y escalable para llevar tu negocio al siguiente nivel.
          </p>
          <Carousel />
        </section>

        <section id="justificacion" className="justification full-width-section my-4 p-4 rounded-4 ">
          <h2 className="mb-4 fw-bold mb-0">
            <i className="bi bi-clipboard-check me-2" style={{ color: 'var(--color-primary-dark)' }}></i>
            Justificación del proyecto
          </h2>
          <p className="mb-4">
            La tecnología actual permite que las PYMEs mejoren sus procesos mediante herramientas digitales, en el sector de mensajería express, muchas empresas
            aún dependen de métodos manuales que afectan la eficiencia y competitividad. Agatha es un sistema que mejora la organización de pedidos,
            trazabilidad de entregas y administración de clientes para que estas empresas puedan competir y crecer.
          </p>
          
          <div className="justification-container">
            <div className="justification-box">
              <strong>
                <i className="bi bi-bullseye me-2" style={{ color: '#dc3545' }}></i>
                Necesidad Real
              </strong><br/>
              Responde a una necesidad real del sector de mensajería express.
            </div>
            <div className="justification-box">
              <strong>
                <i className="bi bi-lightning-charge-fill me-2" style={{ color: '#ffc107' }}></i>
                Eficiencia Operativa
              </strong><br/>
              Mejora la eficiencia operativa digitalizando procesos manuales.
            </div>
            <div className="justification-box">
              <strong>
                <i className="bi bi-trophy-fill me-2" style={{ color: '#ffd700' }}></i>
                Competitividad
              </strong><br/>
              Permite competir en mercados dominados por grandes plataformas.
            </div>
            <div className="justification-box">
              <strong>
                <i className="bi bi-graph-up-arrow me-2" style={{ color: '#28a745' }}></i>
                Escalabilidad
              </strong><br/>
              Ofrece una solución escalable y accesible para PYMEs.
            </div>
          </div>
        </section>

        <section id="requerimientos" className="features full-width-section my-4 p-4 rounded-4">
          <h2 className="mb-4 text-center fw-bold mb-0">
            <i className="bi bi-gear-wide-connected me-2" style={{ color: 'var(--color-primary-dark)' }}></i>
            Requerimientos del sistema
          </h2>
          <div className="row g-4">
            <div className="col-md-6">
              <div className="card h-100 shadow-sm border-0" style={{ backgroundColor: "#e1ddd3"}}>
                <div className="card-body">
                  <h4 className="card-title mb-3">
                    <i className="bi bi-puzzle me-2" style={{ color: '#007bff' }}></i>
                    Funcionales
                  </h4>
                  <ul className="mb-0">
                    <li>Registro y gestión completa de clientes.</li>
                    <li>Creación y seguimiento de pedidos en tiempo real.</li>
                    <li>Asignación automática y manual de pedidos a mensajeros.</li>
                    <li>Panel de control para visualizar estados de entregas.</li>
                    <li>Sistema de notificaciones para clientes y mensajeros.</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="col-md-6">
              <div className="card h-100 shadow-sm border-0" style={{ backgroundColor: "#e1ddd3" }}>
                <div className="card-body">
                  <h4 className="card-title mb-3">
                    <i className="bi bi-shield-check me-2" style={{ color: '#28a745' }}></i>
                    No funcionales
                  </h4>
                  <ul className="mb-0">
                    <li>Escalabilidad para nuevas funcionalidades futuras.</li>
                    <li>Interfaz intuitiva y fácil de usar para todos los usuarios.</li>
                    <li>Seguridad robusta en el manejo de información sensible.</li>
                    <li>Alta disponibilidad para evitar interrupciones del servicio.</li>
                    <li>Rendimiento optimizado para múltiples usuarios simultáneos.</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>
        <Footer />
      </main>
    </>
  );
};

export default Home;