import { useEffect, useState } from 'react';
import axios from 'axios';

export default function AdminEmpresas() {
  const [empresas, setEmpresas] = useState([]);
  const [formVisible, setFormVisible] = useState(false);
  const [editingEmpresa, setEditingEmpresa] = useState(null);
  const [errores, setErrores] = useState({});
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem('token');
  const headers = {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json'
  };

  useEffect(() => {
    cargarEmpresas();
  }, []);

  const cargarEmpresas = async () => {
    setLoading(true);
    try {
      const res = await axios.get('http://localhost:8080/api/empresas', { headers });
      if (res.data.status === 'success') {
        setEmpresas(res.data.data);
      } else {
        console.error('Error al cargar empresas:', res.data.message);
      }
    } catch (error) {
      console.error('Error general al cargar empresas:', error);
    } finally {
      setLoading(false);
    }
  };

  const validarCampo = (name, value) => {
    let error = '';
    if (!value.trim()) {
      error = 'Este campo es obligatorio';
    } else if (name === 'nombre' && value.length > 100) {
      error = 'El nombre no puede superar los 100 caracteres';
    }
    return error;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditingEmpresa(prev => ({ ...prev, [name]: value }));
    const errorCampo = validarCampo(name, value);
    setErrores(prev => ({ ...prev, [name]: errorCampo }));
  };

  const validarFormulario = () => {
    const erroresValidacion = {};
    if (!editingEmpresa?.nombre || !editingEmpresa.nombre.trim()) {
      erroresValidacion.nombre = 'El nombre es obligatorio';
    } else if (editingEmpresa.nombre.length > 100) {
      erroresValidacion.nombre = 'El nombre no puede superar los 100 caracteres';
    }
    setErrores(erroresValidacion);
    return Object.keys(erroresValidacion).length === 0;
  };

  const handleEditar = (empresa) => {
    setEditingEmpresa(empresa);
    setFormVisible(true);
    setErrores({});
  };

  const handleEliminar = (id) => {
    if (confirm('¿Eliminar empresa?')) {
      axios.delete(`http://localhost:8080/api/empresas/${id}`, { headers })
        .then(() => {
          console.log('Empresa eliminada correctamente');
          cargarEmpresas();
        })
        .catch(err => console.error('Error al eliminar empresa:', err));
    }
  };

  const handleGuardar = async (e) => {
    e.preventDefault();
    if (!validarFormulario()) return;

    const empresa = editingEmpresa;

    try {
      const response = empresa.id
        ? await axios.put(`http://localhost:8080/api/empresas/${empresa.id}`, empresa, { headers })
        : await axios.post('http://localhost:8080/api/empresas', empresa, { headers });

      const data = response.data;
      if (data.status === 'success') {
        console.log('Empresa guardada con éxito:', data.data);
        setFormVisible(false);
        setEditingEmpresa(null);
        setErrores({});
        cargarEmpresas();
      } else {
        console.error('Error al guardar empresa (API):', data.message);
        alert(`Error al guardar empresa: ${data.message}`);
      }
    } catch (err) {
      console.error('Error al guardar empresa:', err);
      alert(`Error al guardar empresa: ${err.response?.data?.message || err.message}`);
    }
  };

  if (loading) {
    return (
      <div className="p-4">
        <h2 className="text-2xl font-bold mb-4">Administrar Empresas</h2>
        <div className="flex justify-center items-center h-32">
          <div className="text-lg">Cargando empresas...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Administrar Empresas</h2>

      {formVisible ? (
        <form onSubmit={handleGuardar} className="space-y-4 bg-white p-6 rounded-xl shadow-md mb-6 max-w-md mx-auto">
          <div>
            <input
              name="nombre"
              type="text"
              value={editingEmpresa?.nombre || ''}
              onChange={handleInputChange}
              placeholder="Nombre de la empresa"
              className={`w-full px-4 py-2 border rounded-md ${errores.nombre ? 'border-red-500' : 'border-gray-300'} focus:outline-none focus:ring-2 focus:ring-blue-400`}
            />
            {errores.nombre && <p className="text-red-600 text-sm mt-1">{errores.nombre}</p>}
          </div>

          <div className="flex gap-4 mt-4 justify-end">
            <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition">
              Guardar
            </button>
            <button
              type="button"
              className="bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400 transition"
              onClick={() => {
                setFormVisible(false);
                setEditingEmpresa(null);
                setErrores({});
              }}
            >
              Cancelar
            </button>
          </div>
        </form>
      ) : (
        <div className="mb-6">
          <button
            onClick={() => {
              setFormVisible(true);
              setEditingEmpresa({ nombre: '' });
              setErrores({});
            }}
            className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700 transition"
          >
            + Nueva Empresa
          </button>
        </div>
      )}

      <table className="w-full table-auto border text-left shadow-sm rounded overflow-hidden bg-white">
        <thead className="bg-gray-100">
          <tr>
            <th className="px-4 py-2">Nombre</th>
            <th className="px-4 py-2">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {empresas.map((empresa) => (
            <tr key={empresa.id} className="border-t hover:bg-gray-50 transition">
              <td className="px-4 py-2">{empresa.nombre}</td>
              <td className="px-4 py-2">
                <button
                  onClick={() => handleEditar(empresa)}
                  className="text-blue-600 hover:underline mr-4"
                >
                  Editar
                </button>
                <button
                  onClick={() => handleEliminar(empresa.id)}
                  className="text-red-600 hover:underline"
                >
                  Eliminar
                </button>
              </td>
            </tr>
          ))}
          {empresas.length === 0 && (
            <tr>
              <td colSpan="2" className="px-4 py-2 text-center text-gray-500">
                No hay empresas registradas.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
