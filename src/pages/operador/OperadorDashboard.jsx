const OperadorDashboard = () => {
  return (
    <main
      className="home-container"
      style={{
        backgroundColor: '#d0f0c0',
        color: 'var(--color-primary-dark)',
        padding: '4rem 2rem',
      }}
    >
      <h1>Bienvenido, Operador</h1>
      <p>
        El rol de operador es clave para la gestión diaria y operativa de cada empresa
        dentro del sistema. Estos usuarios son responsables de manejar y coordinar los
        pedidos asignados a su empresa.
      </p>
      <p>
        Los operadores supervisan el flujo de pedidos, asignan mensajeros, y aseguran que
        cada solicitud sea procesada correctamente y en tiempo. Además, pueden actualizar
        el estado de los pedidos y gestionar la comunicación entre las partes involucradas.
      </p>
      <p>
        Gracias a su acceso específico y controlado, los operadores garantizan que la
        operación logística funcione de manera eficiente y organizada, siendo el nexo
        fundamental entre la empresa, los mensajeros y los clientes.
      </p>
      <p>
        Este panel es su centro de control para monitorear y administrar en tiempo real
        las actividades relacionadas con los pedidos y sus estados, facilitando la
        gestión y seguimiento continuo de la operación.
      </p>
    </main>
  );
};

export default OperadorDashboard;
