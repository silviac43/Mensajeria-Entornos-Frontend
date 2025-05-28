import Carousel from "../components/Carousel";
import Navbar from "../components/Navbar";

const Home = () => {
  return (
    <>
      <main className="home-container text-light">
        <section id="acercade" className="intro text-center py-5">
          <h1 className="display-3 fw-bold mb-3">Agatha - Mensajería Express</h1>
          <p className="lead px-3 px-md-5">
            Una plataforma moderna diseñada para optimizar la gestión de pedidos y entregas en empresas de mensajería pequeñas y medianas (PYMEs).
            Rápida, segura y escalable para llevar tu negocio al siguiente nivel.
          </p>
          <Carousel />
        </section>

        <section id="justificacion" className="justification full-width-section my-1 p-4 rounded-4 bg-gradient-purple">
          <h2 className="mb-4">Justificación del proyecto</h2>
          <p>
            La tecnología actual permite que las PYMEs mejoren sus procesos mediante herramientas digitales. En el sector de mensajería express, muchas empresas
            aún dependen de métodos manuales que afectan la eficiencia y competitividad. <strong>Agatha</strong> es un sistema que mejora la organización de pedidos,
            trazabilidad de entregas y administración de clientes para que estas empresas puedan competir y crecer.
          </p>
          <section className="full-width-section my-1 p-4 rounded-4">
            <div className="justification-container">
              <div className="justification-box">Responde a una necesidad real del sector.</div>
              <div className="justification-box">Mejora la eficiencia operativa digitalizando procesos.</div>
              <div className="justification-box">Permite competir en mercados dominados por grandes plataformas.</div>
              <div className="justification-box">Ofrece una solución escalable y accesible para PYMEs.</div>
            </div>
          </section>
        </section>

        <section id="requerimientos" className="features full-width-section my-1 p-4 rounded-4 bg-gradient-purple">
          <h2 className="mb-4" style={{ color: "var(--color-primary-dark)" }}>Requerimientos del sistema</h2>

          <div className="features-container d-flex gap-4 flex-wrap">
            <div className="functionalities flex-fill">
              <h4 style={{ color: "var(--color-primary)" }}>Funcionales</h4>
              <ul>
                <li>Registro y gestión de clientes.</li>
                <li>Creación y seguimiento de pedidos en tiempo real.</li>
                <li>Asignación automática y manual de pedidos a mensajeros.</li>
                <li>Panel de control para visualizar estados de pedidos y entregas.</li>
              </ul>
            </div>

            <div className="non-functionalities flex-fill">
              <h4 style={{ color: "var(--color-primary)" }}>No funcionales</h4>
              <ul>
                <li>Escalabilidad para nuevas funcionalidades futuras.</li>
                <li>Interfaz intuitiva y fácil de usar.</li>
                <li>Seguridad en manejo de información.</li>
                <li>Alta disponibilidad para evitar interrupciones.</li>
              </ul>
            </div>
          </div>
        </section>

        <footer className="footer text-center py-3 text-muted">
          <small>© 2025 Agatha Mensajería Express | Hecho con React y Bootstrap 5</small>
        </footer>
      </main>
    </>
  );
};

export default Home;
