import { useEffect, useState } from 'react';
import axios from 'axios';

export default function AdminPedidos() {
  const [pedidos, setPedidos] = useState([]);
  const [empresas, setEmpresas] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [mensajeros, setMensajeros] = useState([]);
  const [formVisible, setFormVisible] = useState(false);
  const [editingPedido, setEditingPedido] = useState(null);
  const [errores, setErrores] = useState({});
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem('token');
  const headers = {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    setLoading(true);
    try {
      const [pedidosRes, empresasRes, clientesRes, mensajerosRes] = await Promise.all([
        axios.get('http://localhost:8080/api/pedidos', { headers }),
        axios.get('http://localhost:8080/api/empresas', { headers }),
        axios.get('http://localhost:8080/api/clientes', { headers }),
        axios.get('http://localhost:8080/api/mensajeros', { headers }),
      ]);

      setPedidos(pedidosRes.data?.data || []);
      setEmpresas(empresasRes.data?.data || []);
      setClientes(clientesRes.data?.data || []);
      setMensajeros(mensajerosRes.data ? mensajerosRes.data : []);
    } catch (error) {
      console.error('Error al cargar datos:', error);
      setPedidos([]);
      setEmpresas([]);
      setClientes([]);
      setMensajeros([]);
    } finally {
      setLoading(false);
    }
  };

  const validarCampo = (name, value) => {
    let error = '';
    if (!value || !value.toString().trim()) {
      error = 'Este campo es obligatorio';
    } else {
      if (name === 'telefonoRecogida' || name === 'telefonoEntrega') {
        if (!/^\d{7,15}$/.test(value)) {
          error = 'Debe ser un teléfono válido (7-15 dígitos)';
        }
      }
    }
    return error;
  };

  const handleInputChange = async (e) => {
    const { name, value } = e.target;

    if (name === 'empresaMensajeria') {
      const empresaId = Number(value);
      setEditingPedido(prev => ({
        ...prev,
        empresaMensajeria: value ? { id: empresaId } : null,
        mensajero: null, // limpiar selección de mensajero
      }));
      setErrores(prev => ({
        ...prev,
        empresaMensajeria: value ? '' : 'Debe seleccionar una opción',
        mensajero: '', // limpiar error mensajero
      }));

      setMensajeros([]); // limpiar mientras carga nuevos mensajeros

      if (value) {
        try {
          const response = await axios.get(`http://localhost:8080/api/mensajeros/empresa/${empresaId}`, { headers });

          let data = [];
          if (Array.isArray(response.data)) {
            data = response.data;
          } else if (Array.isArray(response.data.data)) {
            data = response.data.data;
          } else {
            console.warn('Respuesta inesperada para mensajeros:', response.data);
          }

          setMensajeros(data);
        } catch (error) {
          console.error('Error al cargar mensajeros por empresa:', error);
          setMensajeros([]);
        }
      } else {
        setMensajeros([]);
      }
    } else if (['cliente', 'mensajero'].includes(name)) {
      setEditingPedido(prev => ({
        ...prev,
        [name]: value ? { id: Number(value) } : null,
      }));
      setErrores(prev => ({
        ...prev,
        [name]: value ? '' : 'Debe seleccionar una opción',
      }));
    } else {
      setEditingPedido(prev => ({ ...prev, [name]: value }));
      const errorCampo = validarCampo(name, value);
      setErrores(prev => ({ ...prev, [name]: errorCampo }));
    }
  };

  const validarFormulario = () => {
    const campos = ['empresaMensajeria', 'cliente', 'direccionRecogida', 'direccionEntrega', 'telefonoRecogida', 'telefonoEntrega', 'tipoPaquete'];
    const erroresValidacion = {};
    campos.forEach(campo => {
      const valor = ['empresaMensajeria', 'cliente', 'mensajero'].includes(campo)
        ? editingPedido?.[campo]?.id
        : editingPedido?.[campo];
      const error = validarCampo(campo, valor);
      if (error) erroresValidacion[campo] = error;
    });
    setErrores(erroresValidacion);
    return Object.keys(erroresValidacion).length === 0;
  };

  const handleEditar = async (pedido) => {
    setEditingPedido(pedido);
    setFormVisible(true);
    setErrores({});

    const empresaId = pedido?.empresaMensajeria?.id;
    if (empresaId) {
      setMensajeros([]); // limpiar antes de cargar
      try {
        const response = await axios.get(`http://localhost:8080/api/mensajeros/empresa/${empresaId}`, { headers });

        let data = [];
        if (Array.isArray(response.data)) {
          data = response.data;
        } else if (Array.isArray(response.data.data)) {
          data = response.data.data;
        } else {
          console.warn('Respuesta inesperada para mensajeros en edición:', response.data);
        }
        setMensajeros(data);
      } catch (error) {
        console.error('Error al cargar mensajeros para edición:', error);
        setMensajeros([]);
      }
    } else {
      setMensajeros([]);
    }
  };

  const handleEliminar = (id) => {
    if (confirm('¿Eliminar pedido?')) {
      axios.delete(`http://localhost:8080/api/pedidos/${id}`, { headers })
        .then(() => cargarDatos())
        .catch(err => console.error('Error al eliminar pedido:', err));
    }
  };

  const handleGuardar = async (e) => {
    e.preventDefault();
    if (!validarFormulario()) {
      alert('Por favor completa todos los campos obligatorios correctamente.');
      return;
    }

    try {
      let pedidoEnviar = { ...editingPedido };

      // Normalizar relaciones
      ['empresaMensajeria', 'cliente', 'mensajero'].forEach(campo => {
        if (pedidoEnviar[campo] && typeof pedidoEnviar[campo] === 'object') {
          pedidoEnviar[campo] = { id: pedidoEnviar[campo].id };
        }
      });

      const url = pedidoEnviar.id
        ? `http://localhost:8080/api/pedidos/${pedidoEnviar.id}`
        : 'http://localhost:8080/api/pedidos';
      const method = pedidoEnviar.id ? axios.put : axios.post;

      await method(url, pedidoEnviar, { headers });

      setFormVisible(false);
      setEditingPedido(null);
      setErrores({});
      alert(pedidoEnviar.id ? 'Pedido actualizado correctamente.' : 'Pedido creado correctamente.');
      cargarDatos();
    } catch (error) {
      console.error('Error al guardar pedido:', error);
      alert(`Error: ${error.response?.data?.message || error.message}`);
    }
  };

  if (loading) return <div className="p-4">Cargando datos...</div>;

  return (
    <div className="p-4 max-w-5xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Administrar Pedidos</h2>

      {formVisible ? (
        <form onSubmit={handleGuardar} className="space-y-4 bg-white p-6 rounded-xl shadow-md mb-6">

          <select
            name="empresaMensajeria"
            value={editingPedido?.empresaMensajeria?.id || ''}
            onChange={handleInputChange}
            className={`w-full px-4 py-2 border rounded-md ${errores.empresaMensajeria ? 'border-red-500' : 'border-gray-300'}`}
          >
            <option value="">Selecciona empresa</option>
            {empresas.map(e => <option key={e.id} value={e.id}>{e.nombre}</option>)}
          </select>
          {errores.empresaMensajeria && <p className="text-red-600">{errores.empresaMensajeria}</p>}

          <select
            name="cliente"
            value={editingPedido?.cliente?.id || ''}
            onChange={handleInputChange}
            className={`w-full px-4 py-2 border rounded-md ${errores.cliente ? 'border-red-500' : 'border-gray-300'}`}
          >
            <option value="">Selecciona cliente</option>
            {clientes.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
          </select>
          {errores.cliente && <p className="text-red-600">{errores.cliente}</p>}

          <input
            name="direccionRecogida"
            placeholder="Dirección Recogida"
            value={editingPedido?.direccionRecogida || ''}
            onChange={handleInputChange}
            className={`w-full px-4 py-2 border rounded-md ${errores.direccionRecogida ? 'border-red-500' : 'border-gray-300'}`}
          />
          {errores.direccionRecogida && <p className="text-red-600">{errores.direccionRecogida}</p>}

          <input
            name="direccionEntrega"
            placeholder="Dirección Entrega"
            value={editingPedido?.direccionEntrega || ''}
            onChange={handleInputChange}
            className={`w-full px-4 py-2 border rounded-md ${errores.direccionEntrega ? 'border-red-500' : 'border-gray-300'}`}
          />
          {errores.direccionEntrega && <p className="text-red-600">{errores.direccionEntrega}</p>}

          <input
            name="telefonoRecogida"
            placeholder="Teléfono Recogida"
            value={editingPedido?.telefonoRecogida || ''}
            onChange={handleInputChange}
            className={`w-full px-4 py-2 border rounded-md ${errores.telefonoRecogida ? 'border-red-500' : 'border-gray-300'}`}
          />
          {errores.telefonoRecogida && <p className="text-red-600">{errores.telefonoRecogida}</p>}

          <input
            name="telefonoEntrega"
            placeholder="Teléfono Entrega"
            value={editingPedido?.telefonoEntrega || ''}
            onChange={handleInputChange}
            className={`w-full px-4 py-2 border rounded-md ${errores.telefonoEntrega ? 'border-red-500' : 'border-gray-300'}`}
          />
          {errores.telefonoEntrega && <p className="text-red-600">{errores.telefonoEntrega}</p>}

          {/* Nuevo campo tipoPaquete */}
          <input
            name="tipoPaquete"
            placeholder="Tipo de paquete"
            value={editingPedido?.tipoPaquete || ''}
            onChange={handleInputChange}
            className={`w-full px-4 py-2 border rounded-md ${errores.tipoPaquete ? 'border-red-500' : 'border-gray-300'}`}
          />
          {errores.tipoPaquete && <p className="text-red-600">{errores.tipoPaquete}</p>}

          <select
            name="mensajero"
            value={editingPedido?.mensajero?.id || ''}
            onChange={handleInputChange}
            className={`w-full px-4 py-2 border rounded-md ${errores.mensajero ? 'border-red-500' : 'border-gray-300'}`}
          >
            <option value="">Sin mensajero actual</option>
            {mensajeros.map(m => (
              <option key={m.id} value={m.id}>{m.nombreUsuario}</option>
            ))}
          </select>
          {errores.mensajero && <p className="text-red-600">{errores.mensajero}</p>}

          {/* Campo Estado */}
<select
  name="estado"
  value={editingPedido?.estado || ''}
  onChange={handleInputChange}
  className={`w-full px-4 py-2 border rounded-md ${errores.estado ? 'border-red-500' : 'border-gray-300'}`}
>
  <option value="">Selecciona estado</option>
  <option value="PENDIENTE">Pendiente</option>
  <option value="EN_TRANSITO">En transito</option>
  <option value="ENTREGADO">Entregado</option>
  <option value="ASIGNADO">Asignado</option>
</select>
{errores.estado && <p className="text-red-600">{errores.estado}</p>}

{/* Campo Notas */}
<textarea
  name="notas"
  placeholder="Notas"
  value={editingPedido?.notas || ''}
  onChange={handleInputChange}
  className={`w-full px-4 py-2 border rounded-md ${errores.notas ? 'border-red-500' : 'border-gray-300'}`}
/>
{errores.notas && <p className="text-red-600">{errores.notas}</p>}


          <button
            type="submit"
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
          >
            Guardar
          </button>
          <button
            type="button"
            onClick={() => { setFormVisible(false); setEditingPedido(null); setErrores({}); }}
            className="ml-4 px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
          >
            Cancelar
          </button>
        </form>
      ) : (
        <button
          onClick={() => {
            setEditingPedido({
              empresaMensajeria: { id: '' },
              cliente: { id: '' },
              mensajero: { id: '' },
              direccionRecogida: '',
              direccionEntrega: '',
              telefonoRecogida: '',
              telefonoEntrega: '',
              tipoPaquete: '',
              estado: 'PENDIENTE',  
              notas: '',           
            });
            setMensajeros([]);
            setErrores({});
            setFormVisible(true);
          }}
          className="mb-6 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Nuevo Pedido
        </button>
      )}

      <table className="w-full text-left border-collapse border border-gray-300">
        <thead>
          <tr className="bg-gray-200">
            <th className="border border-gray-300 px-2 py-1">ID</th>
            <th className="border border-gray-300 px-2 py-1">Empresa</th>
            <th className="border border-gray-300 px-2 py-1">Cliente</th>
            <th className="border border-gray-300 px-2 py-1">Recogida</th>
            <th className="border border-gray-300 px-2 py-1">Entrega</th>
            <th className="border border-gray-300 px-2 py-1">Tel Recogida</th>
            <th className="border border-gray-300 px-2 py-1">Tel Entrega</th>
            <th className="border border-gray-300 px-2 py-1">Tipo Paquete</th>
            <th className="border border-gray-300 px-2 py-1">Estado</th>
            <th className="border border-gray-300 px-2 py-1">Notas</th>
            <th className="border border-gray-300 px-2 py-1">Mensajero</th>
            <th className="border border-gray-300 px-2 py-1">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {pedidos.map(pedido => (
            <tr key={pedido.id} className="border border-gray-300 hover:bg-gray-100">
              <td className="border border-gray-300 px-2 py-1">{pedido.id}</td>
              <td className="border border-gray-300 px-2 py-1">{pedido.empresaMensajeria?.nombre || '-'}</td>
              <td className="border border-gray-300 px-2 py-1">{pedido.cliente?.nombre || 'No esta registrado'}</td>
              <td className="border border-gray-300 px-2 py-1">{pedido.direccionRecogida}</td>
              <td className="border border-gray-300 px-2 py-1">{pedido.direccionEntrega}</td>
              <td className="border border-gray-300 px-2 py-1">{pedido.telefonoRecogida}</td>
              <td className="border border-gray-300 px-2 py-1">{pedido.telefonoEntrega}</td>
              <td className="border border-gray-300 px-2 py-1">{pedido.tipoPaquete}</td>
              <td className="border border-gray-300 px-2 py-1">{pedido.estado || '-'}</td>
              <td className="border border-gray-300 px-2 py-1">{pedido.notas || '-'}</td>
              <td className="border border-gray-300 px-2 py-1">{pedido.mensajero?.nombreUsuario || 'Sin mensajero'}</td>
              <td className="border border-gray-300 px-2 py-1">
                <button
                  onClick={() => handleEditar(pedido)}
                  className="mr-2 px-2 py-1 bg-yellow-400 text-white rounded hover:bg-yellow-500"
                >
                  Editar
                </button>
                <button
                  onClick={() => handleEliminar(pedido.id)}
                  className="px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                >
                  Eliminar
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
