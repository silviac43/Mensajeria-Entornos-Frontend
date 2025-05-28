import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export default function AdminInformacion() {
  const [usuario, setUsuario] = useState(null);
  const [form, setForm] = useState({
    email: '',
    confirmEmail: '',
    nombreUsuario: '',
    password: '',
    confirmPassword: ''
  });
  const [errores, setErrores] = useState({});
  const [loading, setLoading] = useState(true);
  const [mensaje, setMensaje] = useState(null);
  const [modoEdicion, setModoEdicion] = useState(false);
  const navigate = useNavigate();

  const token = localStorage.getItem('token');
  const headers = { Authorization: `Bearer ${token}` };

  useEffect(() => {
    axios.get('http://localhost:8080/auth/me', { headers })
      .then(res => {
        setUsuario(res.data);
        setForm(prev => ({
          ...prev,
          email: res.data.email || '',
          nombreUsuario: res.data.nombreUsuario || '',
          confirmEmail: '',
          password: '',
          confirmPassword: ''
        }));
      })
      .catch(() => setMensaje('Error al cargar la información del usuario'))
      .finally(() => setLoading(false));
  }, []);

  const validarCampo = (name, value) => {
    if (!value.trim()) return 'Este campo es obligatorio';
    if (name === 'email' || name === 'confirmEmail') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value)) return 'Email no es válido';
    }
    if (name === 'nombreUsuario' && value.length < 3) {
      return 'El nombre de usuario debe tener al menos 3 caracteres';
    }
    return '';
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    setErrores(prev => ({ ...prev, [name]: validarCampo(name, value) }));
    setMensaje(null);
  };

  const validarFormulario = () => {
    const nuevosErrores = {};
    ['email', 'confirmEmail', 'nombreUsuario'].forEach(campo => {
      const error = validarCampo(campo, form[campo]);
      if (error) nuevosErrores[campo] = error;
    });

    if (form.email !== form.confirmEmail) {
      nuevosErrores.confirmEmail = 'Los emails no coinciden';
    }

    if (form.password.trim() || form.confirmPassword.trim()) {
      if (form.password.length < 6) {
        nuevosErrores.password = 'La contraseña debe tener al menos 6 caracteres';
      }
      if (form.password !== form.confirmPassword) {
        nuevosErrores.confirmPassword = 'Las contraseñas no coinciden';
      }
    }

    setErrores(nuevosErrores);
    return Object.keys(nuevosErrores).length === 0;
  };

    const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validarFormulario()) return;

    try {
      const dataEnviar = {
        email: form.email,
        nombreUsuario: form.nombreUsuario,
        ...(form.password.trim() && { password: form.password })
      };

      await axios.put('http://localhost:8080/auth/me', dataEnviar, { headers });

      setMensaje('Usuario actualizado correctamente');

      const cambiosSensibles =
        form.email !== usuario.email || form.password.trim();

      if (cambiosSensibles) {
        const confirmar = window.confirm(
          'Has cambiado tu email o contraseña. Por seguridad deberás volver a iniciar sesión. ¿Deseas continuar?'
        );

        if (confirmar) {
          localStorage.removeItem('token');
          window.location.href = '/login';
        } else {
          setMensaje('Cambios cancelados por el usuario.');
        }
      } else {
        setModoEdicion(false);
        setForm(prev => ({ ...prev, password: '', confirmPassword: '' }));
      }
    } catch (error) {
      const msg = error.response?.data || 'Error al actualizar usuario';
      setMensaje(msg);
    }
  };


  if (loading) return <div className="p-4">Cargando información...</div>;

  if (!usuario) return <div className="p-4 text-red-600">No se pudo cargar el usuario.</div>;

  return (
    <div className="max-w-md mx-auto p-4 bg-white rounded shadow">
      <h2 className="text-xl font-bold mb-4">Mi Información</h2>

      {mensaje && (
        <p className={`mb-4 ${mensaje.includes('Error') ? 'text-red-600' : 'text-green-600'}`}>
          {mensaje}
        </p>
      )}

      {!modoEdicion ? (
        <div>
          <p><strong>Email:</strong> {usuario.email}</p>
          <p><strong>Nombre de usuario:</strong> {usuario.nombreUsuario}</p>
          <button
            onClick={() => setModoEdicion(true)}
            className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
          >
            Editar Información
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} noValidate>
          <div className="mb-4">
            <label className="block font-semibold mb-1" htmlFor="email">Email</label>
            <input
              id="email"
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded ${errores.email ? 'border-red-500' : 'border-gray-300'}`}
            />
            {errores.email && <p className="text-red-600 text-sm mt-1">{errores.email}</p>}
          </div>

          <div className="mb-4">
            <label className="block font-semibold mb-1" htmlFor="confirmEmail">Confirmar Email</label>
            <input
              id="confirmEmail"
              name="confirmEmail"
              type="email"
              value={form.confirmEmail}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded ${errores.confirmEmail ? 'border-red-500' : 'border-gray-300'}`}
            />
            {errores.confirmEmail && <p className="text-red-600 text-sm mt-1">{errores.confirmEmail}</p>}
          </div>

          <div className="mb-4">
            <label className="block font-semibold mb-1" htmlFor="nombreUsuario">Nombre de Usuario</label>
            <input
              id="nombreUsuario"
              name="nombreUsuario"
              type="text"
              value={form.nombreUsuario}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded ${errores.nombreUsuario ? 'border-red-500' : 'border-gray-300'}`}
            />
            {errores.nombreUsuario && <p className="text-red-600 text-sm mt-1">{errores.nombreUsuario}</p>}
          </div>

          <div className="mb-4">
            <label className="block font-semibold mb-1" htmlFor="password">Nueva Contraseña (opcional)</label>
            <input
              id="password"
              name="password"
              type="password"
              value={form.password}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded ${errores.password ? 'border-red-500' : 'border-gray-300'}`}
            />
            {errores.password && <p className="text-red-600 text-sm mt-1">{errores.password}</p>}
          </div>

          <div className="mb-4">
            <label className="block font-semibold mb-1" htmlFor="confirmPassword">Confirmar Contraseña</label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              value={form.confirmPassword}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded ${errores.confirmPassword ? 'border-red-500' : 'border-gray-300'}`}
            />
            {errores.confirmPassword && <p className="text-red-600 text-sm mt-1">{errores.confirmPassword}</p>}
          </div>

          <div className="flex justify-between items-center">
            <button
              type="submit"
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition"
            >
              Guardar Cambios
            </button>
            <button
              type="button"
              onClick={() => setModoEdicion(false)}
              className="text-gray-600 underline"
            >
              Cancelar
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
