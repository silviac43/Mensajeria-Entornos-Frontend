import { useEffect, useState } from 'react';
import axios from 'axios';

export default function OperadorPedidos() {
  const [pedidos, setPedidos] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [mensajeros, setMensajeros] = useState([]);
  const [empresa, setEmpresa] = useState(null);
  const [formVisible, setFormVisible] = useState(false);
  const [editingPedido, setEditingPedido] = useState(null);
  const [errores, setErrores] = useState({});
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem('token');
  const headers = {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  };

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

      if (!operador?.empresaMensajeria?.id) {
        console.error('No se pudo obtener la empresa del operador');
        setLoading(false);
        return;
      }

      const empresaId = operador.empresaMensajeria.id;
      const empresaNombre = operador.empresaMensajeria.nombre || '';

      setEmpresa({ id: empresaId, nombre: empresaNombre });  

      const [clientesRes, pedidosRes, mensajerosRes] = await Promise.all([
        axios.get(`http://localhost:8080/api/clientes/empresa/${empresaId}`, { headers }),
        axios.get(`http://localhost:8080/api/pedidos/empresa/${empresaId}`, { headers }),
        axios.get(`http://localhost:8080/api/mensajeros/empresa/${empresaId}`, { headers })
      ]);

      setClientes(clientesRes.data?.data || []);
      setPedidos(pedidosRes.data?.data || []);
      setMensajeros(mensajerosRes.data?.data || []);
    } catch (error) {
      console.error('Error al cargar datos:', error);
      setClientes([]);
      setPedidos([]);
      setMensajeros([]);
    } finally {
      setLoading(false);
    }
  };


  const validarCampo = (name, value) => {
    if (!value || !value.toString().trim()) {
      return 'Este campo es obligatorio';
    }
    if ((name === 'telefonoRecogida' || name === 'telefonoEntrega') && !/^\d{7,15}$/.test(value)) {
      return 'Debe ser un teléfono válido (7-15 dígitos)';
    }
    return '';
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    if (['cliente', 'mensajero'].includes(name)) {
      setEditingPedido(prev => ({
        ...prev,
        [name]: value ? { id: Number(value) } : null,
      }));
    } else {
      setEditingPedido(prev => ({ ...prev, [name]: value }));
    }

    const errorCampo = validarCampo(name, value);
    setErrores(prev => ({ ...prev, [name]: errorCampo }));
  };

  const validarFormulario = () => {
    const campos = ['cliente', 'direccionRecogida', 'direccionEntrega', 'telefonoRecogida', 'telefonoEntrega', 'tipoPaquete'];
    const erroresValidacion = {};
    campos.forEach(campo => {
      const valor = editingPedido?.[campo];
      const error = validarCampo(campo, valor);
      if (error) erroresValidacion[campo] = error;
    });
    setErrores(erroresValidacion);
    return Object.keys(erroresValidacion).length === 0;
  };

  const handleEditar = (pedido) => {
    setEditingPedido(pedido);
    setFormVisible(true);
    setErrores({});
  };

  const handleEliminar = async (id) => {
    if (confirm('¿Eliminar pedido?')) {
      try {
        await axios.delete(`http://localhost:8080/api/pedidos/${id}`, { headers });
        cargarDatos();
      } catch (err) {
        console.error('Error al eliminar pedido:', err);
      }
    }
  };

  const handleGuardar = async (e) => {
    e.preventDefault();
    if (!validarFormulario()) return alert('Completa todos los campos correctamente.');

    if (!empresa?.id) {
      alert('Error: No se ha cargado la empresa correctamente.');
      return;
    }

    try {
      let pedidoEnviar = {
        ...editingPedido,
        empresaMensajeria: { id: empresa.id },
        cliente: editingPedido.cliente?.id ? { id: editingPedido.cliente.id } : null,
        mensajero: editingPedido.mensajero?.id ? { id: editingPedido.mensajero.id } : null,
      };

      const url = pedidoEnviar.id
        ? `http://localhost:8080/api/pedidos/${pedidoEnviar.id}`
        : 'http://localhost:8080/api/pedidos';
      const method = pedidoEnviar.id ? axios.put : axios.post;

      await method(url, pedidoEnviar, { headers });

      setFormVisible(false);
      setEditingPedido(null);
      setErrores({});
      alert(pedidoEnviar.id ? 'Pedido actualizado.' : 'Pedido creado.');
      cargarDatos();
    } catch (error) {
      console.error('Error al guardar pedido:', error);
      alert(`Error: ${error.response?.data?.message || error.message}`);
    }
  };


  if (loading) return <div className="p-4">Cargando datos...</div>;

  return (
    <div className="p-4 max-w-5xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Pedidos - Empresa {empresa?.nombre}</h2>

      {formVisible ? (
        <form onSubmit={handleGuardar} className="space-y-4 bg-white p-6 rounded-xl shadow-md mb-6">
          <p className="text-gray-700 font-semibold">Empresa: {empresa?.nombre}</p>

          <select name="cliente" value={editingPedido?.cliente?.id || ''} onChange={handleInputChange} className="w-full px-4 py-2 border rounded-md">
            <option value="">Selecciona cliente</option>
            {clientes.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
          </select>

          <input name="direccionRecogida" placeholder="Dirección Recogida" value={editingPedido?.direccionRecogida || ''} onChange={handleInputChange} className="w-full px-4 py-2 border rounded-md" />
          <input name="direccionEntrega" placeholder="Dirección Entrega" value={editingPedido?.direccionEntrega || ''} onChange={handleInputChange} className="w-full px-4 py-2 border rounded-md" />
          <input name="telefonoRecogida" placeholder="Teléfono Recogida" value={editingPedido?.telefonoRecogida || ''} onChange={handleInputChange} className="w-full px-4 py-2 border rounded-md" />
          <input name="telefonoEntrega" placeholder="Teléfono Entrega" value={editingPedido?.telefonoEntrega || ''} onChange={handleInputChange} className="w-full px-4 py-2 border rounded-md" />
          <input name="tipoPaquete" placeholder="Tipo de paquete" value={editingPedido?.tipoPaquete || ''} onChange={handleInputChange} className="w-full px-4 py-2 border rounded-md" />

          <select name="mensajero" value={editingPedido?.mensajero?.id || ''} onChange={handleInputChange} className="w-full px-4 py-2 border rounded-md">
            <option value="">Sin mensajero</option>
            {mensajeros.map(m => <option key={m.id} value={m.id}>{m.nombreUsuario}</option>)}
          </select>

          <select name="estado" value={editingPedido?.estado || 'PENDIENTE'} onChange={handleInputChange} className="w-full px-4 py-2 border rounded-md">
            <option value="PENDIENTE">Pendiente</option>
            <option value="EN_TRANSITO">En tránsito</option>
            <option value="ENTREGADO">Entregado</option>
            <option value="ASIGNADO">Asignado</option>
          </select>

          <textarea name="notas" placeholder="Notas" value={editingPedido?.notas || ''} onChange={handleInputChange} className="w-full px-4 py-2 border rounded-md" />

          <button type="submit" className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600">Guardar</button>
          <button type="button" onClick={() => { setFormVisible(false); setEditingPedido(null); setErrores({}); }} className="ml-4 px-4 py-2 bg-gray-300 rounded hover:bg-gray-400">Cancelar</button>
        </form>
      ) : (
        <button onClick={() => {
          setEditingPedido({
            cliente: { id: '' },
            mensajero: { id: '' },
            direccionRecogida: '',
            direccionEntrega: '',
            telefonoRecogida: '',
            telefonoEntrega: '',
            tipoPaquete: '',
            estado: 'PENDIENTE',
            notas: ''
          });
          setErrores({});
          setFormVisible(true);
        }} className="mb-6 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">Nuevo Pedido</button>
      )}

      <table className="w-full text-left border-collapse border border-gray-300">
        <thead>
          <tr className="bg-gray-200">
            <th className="border px-2 py-1">ID</th>
            <th className="border px-2 py-1">Cliente</th>
            <th className="border px-2 py-1">Recogida</th>
            <th className="border px-2 py-1">Entrega</th>
            <th className="border px-2 py-1">Tel. Recogida</th>
            <th className="border px-2 py-1">Tel. Entrega</th>
            <th className="border px-2 py-1">Tipo</th>
            <th className="border px-2 py-1">Estado</th>
            <th className="border px-2 py-1">Mensajero</th>
            <th className="border px-2 py-1">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {pedidos.map(pedido => (
            <tr key={pedido.id} className="hover:bg-gray-100">
              <td className="border px-2 py-1">{pedido.id}</td>
              <td className="border px-2 py-1">{pedido.cliente?.nombre || 'No esta registrado'}</td>
              <td className="border px-2 py-1">{pedido.direccionRecogida}</td>
              <td className="border px-2 py-1">{pedido.direccionEntrega}</td>
              <td className="border px-2 py-1">{pedido.telefonoRecogida}</td>
              <td className="border px-2 py-1">{pedido.telefonoEntrega}</td>
              <td className="border px-2 py-1">{pedido.tipoPaquete}</td>
              <td className="border px-2 py-1">{pedido.estado}</td>
              <td className="border px-2 py-1">{pedido.mensajero?.nombreUsuario || '-'}</td>
              <td className="border px-2 py-1">
                <button onClick={() => handleEditar(pedido)} className="text-blue-600 hover:underline mr-2">Editar</button>
                <button onClick={() => handleEliminar(pedido.id)} className="text-red-600 hover:underline">Eliminar</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
