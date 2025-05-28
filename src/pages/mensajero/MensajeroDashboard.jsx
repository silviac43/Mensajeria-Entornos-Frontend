const MensajeroDashboard = () => {
  return (
    <main
      className="home-container"
      style={{
        backgroundColor: '#c0d0f0',
        color: 'var(--color-primary-dark)',
        padding: '4rem 2rem',
      }}
    >
      <h1>Bienvenido, Mensajero</h1>
      <p>
        Como mensajero, tienes un papel fundamental en la entrega y seguimiento de los pedidos asignados.
      </p>
      <p>
        En esta sección puedes visualizar la información detallada de tus pedidos actuales y el historial de cambios realizados en ellos.
      </p>
      <p>
        Además, puedes acceder y actualizar tu información personal para mantener tus datos siempre al día.
      </p>
      <p>
        Este panel te permite tener un control claro y actualizado de tus tareas, facilitando la comunicación y el cumplimiento eficiente de las entregas.
      </p>
    </main>
  );
};

export default MensajeroDashboard;
