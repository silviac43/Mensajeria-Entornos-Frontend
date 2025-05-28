import { useEffect, useState } from 'react';

const Register = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    empresaId: '',
    rol: 'operador'
  });

  const [empresas, setEmpresas] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Llama al endpoint para obtener empresas
    fetch('http://localhost:8080/api/empresas') // Ajusta el puerto si es necesario
      .then(res => {
        if (!res.ok) {
          throw new Error('Error al obtener empresas');
        }
        return res.json();
      })
      .then(data => setEmpresas(data))
      .catch(err => {
        console.error(err);
        setError('No se pudieron cargar las empresas');
      });
  }, []);

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    const usuarioPayload = {
      nombreUsuario: formData.username,
      email: formData.email,
      password: formData.password,
      rol: formData.rol,
      empresaMensajeria: { id: formData.empresaId }
    };

    try {
      const res = await fetch('http://localhost:8080/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(usuarioPayload)
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || 'Error al registrar usuario');
        return;
      }

      console.log('Usuario registrado:', data);
      alert('Registro exitoso');
    } catch (err) {
      console.error(err);
      setError('Error al registrar');
    }
  };

  return (
    <main className="register-container">
      <h2>Registro</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <form onSubmit={handleSubmit}>
        <label htmlFor="username">Usuario:</label>
        <input
          id="username"
          name="username"
          value={formData.username}
          onChange={handleChange}
          required
        />

        <label htmlFor="email">Correo electrónico:</label>
        <input
          id="email"
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          required
        />

        <label htmlFor="password">Contraseña:</label>
        <input
          id="password"
          type="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          required
        />

        <label htmlFor="confirmPassword">Confirmar contraseña:</label>
        <input
          id="confirmPassword"
          type="password"
          name="confirmPassword"
          value={formData.confirmPassword}
          onChange={handleChange}
          required
        />

        <label htmlFor="empresaId">Empresa de Mensajería:</label>
        <select
          id="empresaId"
          name="empresaId"
          value={formData.empresaId}
          onChange={handleChange}
          required
        >
          <option value="">Selecciona una empresa</option>
          {empresas.map((empresa) => (
            <option key={empresa.id} value={empresa.id}>
              {empresa.nombre}
            </option>
          ))}
        </select>

        <label htmlFor="rol">Rol:</label>
        <select
          id="rol"
          name="rol"
          value={formData.rol}
          onChange={handleChange}
          required
        >
          <option value="operador">Operador</option>
          <option value="mensajero">Mensajero</option>
          <option value="admin_mensajeria">Administrador</option>
        </select>

        <button type="submit">Registrarse</button>
      </form>
    </main>
  );
};

export default Register;
