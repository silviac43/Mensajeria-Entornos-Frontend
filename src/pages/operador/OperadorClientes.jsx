import { useEffect, useState } from 'react';
import axios from 'axios';

export default function OperadorClientes() {
  const [clientes, setClientes] = useState([]);
  const [operadorData, setOperadorData] = useState(null);
  const [empresaOperador, setEmpresaOperador] = useState(null);
  const [formVisible, setFormVisible] = useState(false);
  const [editingCliente, setEditingCliente] = useState(null);
  const [errores, setErrores] = useState({});
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem('token');
  const headers = {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json'
  };

  // Función para obtener la información del operador desde el backend
  const obtenerInformacionOperador = async () => {
    try {
      const token = localStorage.getItem('token'); // o sessionStorage
      
      if (!token) {
        throw new Error('No hay token de autenticación');
      }
      
      const response = await axios.get('http://localhost:8080/auth/me', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      return response.data;
    } catch (error) {
      console.error('Error al obtener información del operador:', error);
      throw error;
    }
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
  setLoading(true);
  try {
    const operador = await obtenerInformacionOperador();
    setOperadorData(operador);

    if (!operador?.empresaMensajeria?.id) {
      console.error('No se pudo obtener la empresa del operador');
      setLoading(false);
      return;
    }

    const empresaId = operador.empresaMensajeria.id;
    setEmpresaOperador({ id: empresaId });

    // Cargar clientes de la empresa del operador
    const clientesResponse = await axios.get(
      `http://localhost:8080/api/clientes/empresa/${empresaId}`, 
      { headers }
    );

    if (clientesResponse.data.status === 'success') {
      setClientes(clientesResponse.data.data);
    } else {
      console.error('Error al cargar clientes:', clientesResponse.data.message);
    }
    } catch (error) {
      console.error('Error general al cargar datos:', error);
    } finally {
      setLoading(false);
    }
  };


  const validarCampo = (name, value) => {
    let error = '';
    if (!value.trim()) {
      error = 'Este campo es obligatorio';
    } else if (name === 'email') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value)) {
        error = 'Email no es válido';
      }
    }
    return error;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditingCliente(prev => ({ ...prev, [name]: value }));
    const errorCampo = validarCampo(name, value);
    setErrores(prev => ({ ...prev, [name]: errorCampo }));
  };

  const validarFormulario = () => {
    const erroresValidacion = {};
    const campos = [
      'nombre', 'telefonoRecogida', 'direccionRecogida',
      'telefonoEntrega', 'direccionEntrega', 'email'
    ];
    
    campos.forEach(campo => {
      const valor = editingCliente?.[campo] || '';
      const errorCampo = validarCampo(campo, valor);
      if (errorCampo) erroresValidacion[campo] = errorCampo;
    });
    
    
    setErrores(erroresValidacion);
    return Object.keys(erroresValidacion).length === 0;
  };


  function cargarClientes() {
  if (!empresaOperador?.id) return;

  axios.get(`http://localhost:8080/api/clientes/empresa/${empresaOperador.id}`, { headers })
    .then(response => {
      if (response.data.status === 'success') {
        setClientes(response.data.data);
      } else {
        console.error('Error al cargar clientes:', response.data.message);
      }
    })
    .catch(error => {
      console.error('Error al cargar clientes:', error);
    });
  }


  const handleEditar = (cliente) => {
    console.log('Editando cliente:', cliente);
    setEditingCliente(cliente);
    setFormVisible(true);
    setErrores({});
  };

  const handleEliminar = (id) => {
    if (confirm('¿Eliminar cliente?')) {
      axios.delete(`http://localhost:8080/api/clientes/${id}`, { headers })
        .then(() => {
          console.log('Cliente eliminado correctamente');
          cargarClientes();
        })
        .catch(err => console.error('Error al eliminar cliente:', err));
    }
  };

  const handleGuardar = async (e) => {
    e.preventDefault();
    if (!validarFormulario()) return;

    // Asegurar que el cliente se asigne a la empresa del operador
    const cliente = {
      ...editingCliente,
      empresaMensajeria: { id: empresaOperador.id }
    };
    
    console.log('Guardando cliente, datos a enviar:', cliente);

    try {
      const response = cliente.id
        ? await axios.put(`http://localhost:8080/api/clientes/${cliente.id}`, cliente, { headers })
        : await axios.post('http://localhost:8080/api/clientes', cliente, { headers });

      const data = response.data;
      if (data.status === 'success') {
        console.log('Cliente guardado con éxito:', data.data);
        setFormVisible(false);
        setEditingCliente(null);
        setErrores({});
        cargarClientes();
      } else {
        console.error('Error al guardar cliente (respuesta API):', data.message);
        alert(`Error al guardar cliente: ${data.message}`);
      }
    } catch (err) {
      console.error('Error al guardar cliente (catch):', err);
      console.error('Detalles del error (respuesta completa):', err.response?.data || err.message);
      alert(`Error al guardar cliente: ${err.response?.data?.message || err.message}`);
    }
  };

  if (loading) {
    return (
      <div className="p-4">
        <h2 className="text-2xl font-bold mb-4">Administrar Clientes</h2>
        <div className="flex justify-center items-center h-32">
          <div className="text-lg">Cargando datos...</div>
        </div>
      </div>
    );
  }

  if (!empresaOperador) {
    return (
      <div className="p-4">
        <h2 className="text-2xl font-bold mb-4">Administrar Clientes</h2>
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          No se pudo determinar la empresa del operador. Verifique su sesión.
        </div>
      </div>
    );
  }

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Administrar Clientes</h2>

      {formVisible ? (
        <form onSubmit={handleGuardar} className="space-y-4 bg-white p-6 rounded-xl shadow-md mb-6 max-w-xl mx-auto">
          {[
            { name: 'nombre', placeholder: 'Nombre' }, 
            { name: 'telefonoRecogida', placeholder: 'Teléfono Recogida' },
            { name: 'direccionRecogida', placeholder: 'Dirección Recogida' }, 
            { name: 'telefonoEntrega', placeholder: 'Teléfono Entrega' },
            { name: 'direccionEntrega', placeholder: 'Dirección Entrega' }, 
            { name: 'email', placeholder: 'Email', type: 'email' }
          ].map(({ name, placeholder, type = 'text' }) => (
            <div key={name}>
              <input
                name={name}
                type={type}
                value={editingCliente?.[name] || ''}
                onChange={handleInputChange}
                placeholder={placeholder}
                className={`w-full px-4 py-2 border rounded-md ${errores[name] ? 'border-red-500' : 'border-gray-300'} focus:outline-none focus:ring-2 focus:ring-blue-400`}
              />
              {errores[name] && <p className="text-red-600 text-sm mt-1">{errores[name]}</p>}
            </div>
          ))}

          <div className="flex gap-4 mt-4 justify-end">
            <button 
              type="submit" 
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
            >
              Guardar
            </button>
            <button 
              type="button" 
              className="bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400 transition" 
              onClick={() => { 
                setFormVisible(false); 
                setEditingCliente(null); 
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
              setEditingCliente({}); 
              setErrores({}); 
            }} 
            className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700 transition"
          >
            + Nuevo Cliente
          </button>
        </div>
      )}

      <table className="w-full table-auto border text-left shadow-sm rounded overflow-hidden bg-white">
        <thead className="bg-gray-100">
          <tr>
            <th className="px-4 py-2">Nombre</th>
            <th className="px-4 py-2">Email</th>
            <th className="px-4 py-2">Teléfono Recogida</th>
            <th className="px-4 py-2">Dirección Recogida</th>
            <th className="px-4 py-2">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {clientes.length === 0 ? (
            <tr>
              <td colSpan="5" className="px-4 py-8 text-center text-gray-500">
                No hay clientes registrados para tu empresa
              </td>
            </tr>
          ) : (
            clientes.map(cliente => (
              <tr key={cliente.id} className="border-t hover:bg-gray-50 transition">
                <td className="px-4 py-2">{cliente.nombre}</td>
                <td className="px-4 py-2">{cliente.email}</td>
                <td className="px-4 py-2">{cliente.telefonoRecogida}</td>
                <td className="px-4 py-2">{cliente.direccionRecogida}</td>
                <td className="px-4 py-2">
                  <button 
                    onClick={() => handleEditar(cliente)} 
                    className="text-blue-600 hover:underline mr-4"
                  >
                    Editar
                  </button>
                  <button 
                    onClick={() => handleEliminar(cliente.id)} 
                    className="text-red-600 hover:underline"
                  >
                    Eliminar
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}