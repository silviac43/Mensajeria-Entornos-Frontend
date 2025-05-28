const AdminDashboard = () => {
  return (
    <main className="home-container" style={{ backgroundColor: '#f7f7b3', color: 'var(--color-primary-dark)', padding: '4rem 2rem' }}>
      <h1>Bienvenido, Administrador</h1>
      <p>
        El rol de administrador en este sistema es fundamental y estratégico. Este usuario tiene la responsabilidad de
        gestionar y organizar todas las empresas registradas, así como a los usuarios asociados a cada una de ellas.
      </p>
      <p>
        Gracias a su acceso completo, el administrador puede supervisar toda la información del sistema, desde clientes y
        pedidos hasta usuarios y sus permisos. Esta capacidad le permite mantener el orden, asegurar el correcto funcionamiento
        y garantizar la seguridad de la plataforma.
      </p>
      <p>
        Por estas razones, el rol de administrador cuenta con los mayores privilegios y permisos dentro del sistema,
        asegurando que todas las operaciones y datos estén centralizados bajo una gestión eficiente y confiable.
      </p>
      <p>
        Este panel es el punto de partida para administrar y monitorear en tiempo real todas las actividades relacionadas con
        las empresas y sus usuarios, facilitando la toma de decisiones y la coordinación integral del sistema.
      </p>
    </main>
  );
};

export default AdminDashboard;
