import { useEffect, useState } from 'react';
import axios from 'axios';

export default function AdminClientes() {
  const [clientes, setClientes] = useState([]);
  const [empresas, setEmpresas] = useState([]);
  const [formVisible, setFormVisible] = useState(false);
  const [editingCliente, setEditingCliente] = useState(null);
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
      const [clientesResponse, empresasResponse] = await Promise.all([
        axios.get('http://localhost:8080/api/clientes', { headers }),
        axios.get('http://localhost:8080/api/empresas', { headers })
      ]);

      if (clientesResponse.data.status === 'success') {
        setClientes(clientesResponse.data.data);
      } else {
        console.error('Error al cargar clientes:', clientesResponse.data.message);
      }

      if (empresasResponse.data.status === 'success') {
        setEmpresas(empresasResponse.data.data);
      } else {
        console.error('Error al cargar empresas:', empresasResponse.data.message);
      }
    } catch (error) {
      console.error('Error general al cargar datos:', error);
    } finally {
      setLoading(false);
    }
  };

  const cargarClientes = () => {
    axios.get('http://localhost:8080/api/clientes', { headers })
      .then(res => {
        const data = res.data;
        if (data.status === 'success') {
          setClientes(data.data);
        } else {
          console.error('Error al cargar clientes:', data.message);
        }
      })
      .catch(err => console.error('Error al cargar clientes:', err));
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
    if (name === 'empresaMensajeria') {
      setEditingCliente(prev => ({ ...prev, empresaMensajeria: { id: Number(value) } }));
      setErrores(prev => ({
        ...prev,
        empresaMensajeria: value ? '' : 'Debe seleccionar una empresa'
      }));
    } else {
      setEditingCliente(prev => ({ ...prev, [name]: value }));
      const errorCampo = validarCampo(name, value);
      setErrores(prev => ({ ...prev, [name]: errorCampo }));
    }
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
    if (!editingCliente?.empresaMensajeria?.id) {
      erroresValidacion.empresaMensajeria = 'Debe seleccionar una empresa';
    }
    setErrores(erroresValidacion);
    return Object.keys(erroresValidacion).length === 0;
  };

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

    const cliente = editingCliente;
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

  const getEmpresaName = (empresaId) => {
    if (!empresaId || empresas.length === 0) return 'N/A';
    const empresa = empresas.find(e => e.id === empresaId);
    return empresa ? empresa.nombre : 'N/A';
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

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Administrar Clientes</h2>

      {formVisible ? (
        <form onSubmit={handleGuardar} className="space-y-4 bg-white p-6 rounded-xl shadow-md mb-6 max-w-xl mx-auto">
          {[{ name: 'nombre', placeholder: 'Nombre' }, { name: 'telefonoRecogida', placeholder: 'Teléfono Recogida' },
            { name: 'direccionRecogida', placeholder: 'Dirección Recogida' }, { name: 'telefonoEntrega', placeholder: 'Teléfono Entrega' },
            { name: 'direccionEntrega', placeholder: 'Dirección Entrega' }, { name: 'email', placeholder: 'Email', type: 'email' }]
            .map(({ name, placeholder, type = 'text' }) => (
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

          <div>
            <select
              name="empresaMensajeria"
              value={editingCliente?.empresaMensajeria?.id || ''}
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
            <button type="button" className="bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400 transition" onClick={() => { setFormVisible(false); setEditingCliente(null); setErrores({}); }}>Cancelar</button>
          </div>
        </form>
      ) : (
        <div className="mb-6">
          <button onClick={() => { setFormVisible(true); setEditingCliente({ empresaMensajeria: { id: '' } }); setErrores({}); }} className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700 transition">
            + Nuevo Cliente
          </button>
        </div>
      )}

      <table className="w-full table-auto border text-left shadow-sm rounded overflow-hidden bg-white">
        <thead className="bg-gray-100">
          <tr>
            <th className="px-4 py-2">Nombre</th>
            <th className="px-4 py-2">Email</th>
            <th className="px-4 py-2">Empresa</th>
            <th className="px-4 py-2">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {clientes.map(cliente => (
            <tr key={cliente.id} className="border-t hover:bg-gray-50 transition">
              <td className="px-4 py-2">{cliente.nombre}</td>
              <td className="px-4 py-2">{cliente.email}</td>
              <td className="px-4 py-2">{getEmpresaName(cliente.empresaMensajeria?.id)}</td>
              <td className="px-4 py-2">
                <button onClick={() => handleEditar(cliente)} className="text-blue-600 hover:underline mr-4">Editar</button>
                <button onClick={() => handleEliminar(cliente.id)} className="text-red-600 hover:underline">Eliminar</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
    