import { useEffect, useState } from 'react';
import axios from 'axios';

const ROLES = [
  'admin_mensajeria',
  'operador',
  'mensajero'
];

export default function AdminUsuarios() {
  const [usuarios, setUsuarios] = useState([]);
  const [empresas, setEmpresas] = useState([]);
  const [formVisible, setFormVisible] = useState(false);
  const [editingUsuario, setEditingUsuario] = useState(null);
  const [errores, setErrores] = useState({});
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem('token');
  const headers = {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json'
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    setLoading(true);
    try {
      const [usuariosRes, empresasRes] = await Promise.all([
        axios.get('http://localhost:8080/admin/users', { headers }),
        axios.get('http://localhost:8080/api/empresas', { headers })
      ]);

      setUsuarios(usuariosRes.data);

      if (empresasRes.data.status === 'success') {
        setEmpresas(empresasRes.data.data);
      } else {
        console.error('Error al cargar empresas:', empresasRes.data);
      }
    } catch (error) {
      console.error('Error al cargar datos:', error);
    } finally {
      setLoading(false);
    }
  };

  const validarCampo = (name, value) => {
    let error = '';
    if (!value || !value.toString().trim()) {
      error = 'Este campo es obligatorio';
    } else {
      if (name === 'email') {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
          error = 'Email no es válido';
        }
      }
      if (name === 'nombreUsuario') {
        if (value.length < 3) {
          error = 'El nombre de usuario debe tener al menos 3 caracteres';
        }
      }
    }
    return error;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    if (name === 'empresaMensajeria') {
      setEditingUsuario(prev => ({
        ...prev,
        empresaMensajeria: { id: Number(value) }
      }));
      setErrores(prev => ({
        ...prev,
        empresaMensajeria: value ? '' : 'Debe seleccionar una empresa'
      }));
    } else if (name === 'rol') {
      setEditingUsuario(prev => ({ ...prev, rol: value }));
      setErrores(prev => ({
        ...prev,
        rol: value ? '' : 'Debe seleccionar un rol'
      }));
    } else {
      setEditingUsuario(prev => ({ ...prev, [name]: value }));
      const errorCampo = validarCampo(name, value);
      setErrores(prev => ({ ...prev, [name]: errorCampo }));
    }
  };

  const validarFormulario = () => {
    const erroresValidacion = {};
    ['email', 'nombreUsuario', 'rol', 'empresaMensajeria'].forEach(campo => {
      let valor;
      if (campo === 'empresaMensajeria') {
        valor = editingUsuario?.empresaMensajeria?.id;
      } else {
        valor = editingUsuario?.[campo];
      }
      const error = validarCampo(campo, valor);
      if (error) erroresValidacion[campo] = error;
    });
    setErrores(erroresValidacion);
    return Object.keys(erroresValidacion).length === 0;
  };

  const handleEditar = (usuario) => {
    const usuarioSinPass = { ...usuario };
    delete usuarioSinPass.password;
    setEditingUsuario(usuarioSinPass);
    setFormVisible(true);
    setErrores({});
  };

  const handleEliminar = (id) => {
    if (confirm('¿Eliminar usuario?')) {
      axios.delete(`http://localhost:8080/admin/users/${id}`, { headers })
        .then(() => {
          cargarDatos();
        })
        .catch(err => console.error('Error al eliminar usuario:', err));
    }
  };

  const handleGuardar = async (e) => {
    e.preventDefault();
    if (!validarFormulario()) return;

    try {
      let usuarioEnviar = { ...editingUsuario };

      if (usuarioEnviar.empresaMensajeria && typeof usuarioEnviar.empresaMensajeria === 'object') {
        usuarioEnviar.empresaMensajeria = { id: usuarioEnviar.empresaMensajeria.id };
      }

      const url = usuarioEnviar.id
        ? `http://localhost:8080/admin/users/${usuarioEnviar.id}`
        : 'http://localhost:8080/admin/users';

      const method = usuarioEnviar.id ? axios.put : axios.post;

      await method(url, usuarioEnviar, { headers });

      setFormVisible(false);
      setEditingUsuario(null);
      setErrores({});

      if (usuarioEnviar.id) {
        alert('Usuario actualizado correctamente.');
      } else {
        alert('Usuario creado correctamente. La contraseña fue enviada al correo registrado.');
      }

      cargarDatos();
    } catch (error) {
      console.error('Error al guardar usuario:', error);
      alert(`Error al guardar usuario: ${error.response?.data?.message || error.message}`);
    }
  };

  if (loading) {
    return (
      <div className="p-4">
        <h2 className="text-2xl font-bold mb-4">Administrar Usuarios</h2>
        <div className="flex justify-center items-center h-32">
          <div className="text-lg">Cargando datos...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Administrar Usuarios</h2>

      {formVisible ? (
        <form onSubmit={handleGuardar} className="space-y-4 bg-white p-6 rounded-xl shadow-md mb-6">
          <div>
            <input
              name="email"
              type="email"
              placeholder="Email"
              value={editingUsuario?.email || ''}
              onChange={handleInputChange}
              className={`w-full px-4 py-2 border rounded-md ${errores.email ? 'border-red-500' : 'border-gray-300'} focus:outline-none focus:ring-2 focus:ring-blue-400`}
            />
            {errores.email && <p className="text-red-600 text-sm mt-1">{errores.email}</p>}
          </div>

          <div>
            <input
              name="nombreUsuario"
              type="text"
              placeholder="Nombre de Usuario"
              value={editingUsuario?.nombreUsuario || ''}
              onChange={handleInputChange}
              className={`w-full px-4 py-2 border rounded-md ${errores.nombreUsuario ? 'border-red-500' : 'border-gray-300'} focus:outline-none focus:ring-2 focus:ring-blue-400`}
            />
            {errores.nombreUsuario && <p className="text-red-600 text-sm mt-1">{errores.nombreUsuario}</p>}
          </div>

          <div>
            <select
              name="rol"
              value={editingUsuario?.rol || ''}
              onChange={handleInputChange}
              className={`w-full px-4 py-2 border rounded-md ${errores.rol ? 'border-red-500' : 'border-gray-300'} focus:outline-none focus:ring-2 focus:ring-blue-400`}
            >
              <option value="">Selecciona un rol</option>
              {ROLES.map(r => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
            {errores.rol && <p className="text-red-600 text-sm mt-1">{errores.rol}</p>}
          </div>

          <div>
            <select
              name="empresaMensajeria"
              value={editingUsuario?.empresaMensajeria?.id || ''}
              onChange={handleInputChange}
              className={`w-full px-4 py-2 border rounded-md ${errores.empresaMensajeria ? 'border-red-500' : 'border-gray-300'} focus:outline-none focus:ring-2 focus:ring-blue-400`}
            >
              <option value="">Selecciona empresa</option>
              {empresas.map(e => (
                <option key={e.id} value={e.id}>{e.nombre}</option>
              ))}
            </select>
            {errores.empresaMensajeria && <p className="text-red-600 text-sm mt-1">{errores.empresaMensajeria}</p>}
          </div>

          <div className="flex gap-4 mt-4 justify-end">
            <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition">Guardar</button>
            <button type="button" className="bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400 transition" onClick={() => { setFormVisible(false); setEditingUsuario(null); setErrores({}); }}>Cancelar</button>
          </div>
        </form>
      ) : (
        <div className="mb-6">
          <button
            onClick={() => {
              setEditingUsuario({ empresaMensajeria: { id: '' }, rol: '' });
              setFormVisible(true);
              setErrores({});
            }}
            className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700 transition"
          >
            + Nuevo Usuario
          </button>
        </div>
      )}

      <table className="w-full table-auto border text-left shadow-sm rounded overflow-hidden bg-white">
        <thead className="bg-gray-100">
          <tr>
            <th className="px-4 py-2">Email</th>
            <th className="px-4 py-2">Nombre Usuario</th>
            <th className="px-4 py-2">Rol</th>
            <th className="px-4 py-2">Empresa</th>
            <th className="px-4 py-2">Fecha Creación</th>
            <th className="px-4 py-2">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {usuarios.map(usuario => (
            <tr key={usuario.id} className="border-t hover:bg-gray-50 transition">
              <td className="px-4 py-2">{usuario.email}</td>
              <td className="px-4 py-2">{usuario.nombreUsuario}</td>
              <td className="px-4 py-2">{usuario.rol}</td>
              <td className="px-4 py-2">{usuario.empresaMensajeria?.nombre || 'N/A'}</td>
              <td className="px-4 py-2">{new Date(usuario.fechaCreacion).toLocaleDateString()}</td>
              <td className="px-4 py-2">
                <button onClick={() => handleEditar(usuario)} className="text-blue-600 hover:underline mr-4">Editar</button>
                <button onClick={() => handleEliminar(usuario.id)} className="text-red-600 hover:underline">Eliminar</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
