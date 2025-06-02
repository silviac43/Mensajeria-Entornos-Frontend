import { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import Footer from '../../components/Footer';
import ModalMapa from '../../components/ModalMapa';

export default function AdminPedidos() {
  const [pedidos, setPedidos] = useState([]);
  const [pedidosFiltrados, setPedidosFiltrados] = useState([]);
  const [empresas, setEmpresas] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [clientesFiltrados, setClientesFiltrados] = useState([]);
  const [mensajeros, setMensajeros] = useState([]);
  const [formVisible, setFormVisible] = useState(false);
  const [editingPedido, setEditingPedido] = useState(null);
  const [errores, setErrores] = useState({});
  const [loading, setLoading] = useState(true);
  const [filtroEmpresa, setFiltroEmpresa] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('');
  const [filtroCliente, setFiltroCliente] = useState('');
  const [busquedaCliente, setBusquedaCliente] = useState('');
  const [mostrarListaClientes, setMostrarListaClientes] = useState(false);
  const formRef = useRef(null);
  const clienteInputRef = useRef(null);
  const [mapaVisible, setMapaVisible] = useState(false);
  const [pedidoParaMapa, setPedidoParaMapa] = useState(null);
  const [coordenadas, setCoordenadas] = useState({ recogida: null, entrega: null });
  const [cargandoMapa, setCargandoMapa] = useState(false);

  const token = localStorage.getItem('token');
  const headers = {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  };

  const estadosDisponibles = [
    { value: 'PENDIENTE', label: 'Pendiente', color: '#ffc107' },
    { value: 'ASIGNADO', label: 'Asignado', color: '#007bff' },
    { value: 'EN_TRANSITO', label: 'En Tránsito', color: '#ff6600' },
    { value: 'ENTREGADO', label: 'Entregado', color: '#28a745' }
  ];

  const formatearFecha = (fechaString) => {
    if (!fechaString) return 'No disponible';
    
    try {
      const fecha = new Date(fechaString);
      const dia = fecha.getDate().toString().padStart(2, '0');
      const mes = (fecha.getMonth() + 1).toString().padStart(2, '0');
      const año = fecha.getFullYear();
      const horas = fecha.getHours().toString().padStart(2, '0');
      const minutos = fecha.getMinutes().toString().padStart(2, '0');
      
      return `${dia}/${mes}/${año} ${horas}:${minutos}`;
    } catch (error) {
      return 'Fecha inválida';
    }
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  useEffect(() => {
    aplicarFiltros();
  }, [pedidos, filtroEmpresa, filtroEstado, filtroCliente]);

  useEffect(() => {
    if (busquedaCliente.trim() === '') {
      setClientesFiltrados(clientes);
    } else {
      const filtrados = clientes.filter(cliente =>
        cliente.nombre.toLowerCase().includes(busquedaCliente.toLowerCase()) ||
        cliente.email?.toLowerCase().includes(busquedaCliente.toLowerCase()) ||
        cliente.telefono?.includes(busquedaCliente)
      );
      setClientesFiltrados(filtrados);
    }
  }, [busquedaCliente, clientes]);

  const aplicarFiltros = () => {
    let filtrados = [...pedidos];

    if (filtroEmpresa) {
      filtrados = filtrados.filter(pedido => 
        pedido.empresaMensajeria?.id === parseInt(filtroEmpresa)
      );
    }

    if (filtroEstado) {
      filtrados = filtrados.filter(pedido => pedido.estado === filtroEstado);
    }

    if (filtroCliente) {
      filtrados = filtrados.filter(pedido => 
        pedido.cliente?.id === parseInt(filtroCliente)
      );
    }

    setPedidosFiltrados(filtrados);
  };

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
      setClientesFiltrados(clientesRes.data?.data || []);
      setMensajeros(mensajerosRes.data ? mensajerosRes.data : []);
    } catch (error) {
      console.error('Error al cargar datos:', error);
      setPedidos([]);
      setEmpresas([]);
      setClientes([]);
      setClientesFiltrados([]);
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
        mensajero: null,
      }));
      setErrores(prev => ({
        ...prev,
        empresaMensajeria: value ? '' : 'Debe seleccionar una empresa',
        mensajero: '',
      }));

      setMensajeros([]);

      if (value) {
        try {
          const response = await axios.get(`http://localhost:8080/api/mensajeros/empresa/${empresaId}`, { headers });
          let data = [];
          if (Array.isArray(response.data)) {
            data = response.data;
          } else if (Array.isArray(response.data.data)) {
            data = response.data.data;
          }
          setMensajeros(data);
        } catch (error) {
          console.error('Error al cargar mensajeros por empresa:', error);
          setMensajeros([]);
        }
      }
    } else if (name === 'cliente') {
      const clienteSeleccionado = clientes.find(c => c.id === Number(value));
      
      setEditingPedido(prev => ({
        ...prev,
        cliente: value ? { id: Number(value) } : null,
        direccionRecogida: prev.direccionRecogida || clienteSeleccionado?.direccionRecogida || '',
        direccionEntrega: prev.direccionEntrega || clienteSeleccionado?.direccionEntrega || '',
        telefonoRecogida: prev.telefonoRecogida || clienteSeleccionado?.telefonoRecogida || '',
        telefonoEntrega: prev.telefonoEntrega || clienteSeleccionado?.telefonoEntrega || '',
      }));
      
      setErrores(prev => ({
        ...prev,
        cliente: value ? '' : 'Debe seleccionar una opción',
        direccionRecogida: clienteSeleccionado?.direccionRecogida ? '' : prev.direccionRecogida,
        direccionEntrega: clienteSeleccionado?.direccionEntrega ? '' : prev.direccionEntrega,
        telefonoRecogida: clienteSeleccionado?.telefonoRecogida ? '' : prev.telefonoRecogida,
        telefonoEntrega: clienteSeleccionado?.telefonoEntrega ? '' : prev.telefonoEntrega,
      }));
    } else if (name === 'mensajero') {
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


  const handleBusquedaCliente = (e) => {
    setBusquedaCliente(e.target.value);
    setMostrarListaClientes(true);
  };

  const seleccionarCliente = (cliente) => {
    setFiltroCliente(cliente.id.toString());
    setBusquedaCliente(cliente.nombre);
    setMostrarListaClientes(false);
  };

  const limpiarSeleccionCliente = () => {
    setFiltroCliente('');
    setBusquedaCliente('');
    setMostrarListaClientes(false);
  };

  const validarFormulario = () => {
    const erroresValidacion = {};
    const campos = ['empresaMensajeria', 'cliente', 'direccionRecogida', 'direccionEntrega', 'telefonoRecogida', 'telefonoEntrega', 'tipoPaquete'];
    
    campos.forEach(campo => {
      let valor;
      if (['empresaMensajeria', 'cliente'].includes(campo)) {
        valor = editingPedido?.[campo]?.id;
      } else {
        valor = editingPedido?.[campo];
      }
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

    setTimeout(() => {
      formRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100); 

    const empresaId = pedido?.empresaMensajeria?.id;
    if (empresaId) {
      setMensajeros([]);
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
        .then(() => {
          cargarDatos();
        })
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

  const getEmpresaName = (empresaId) => {
    if (!empresaId || empresas.length === 0) return 'N/A';
    const empresa = empresas.find(e => e.id === empresaId);
    return empresa ? empresa.nombre : 'N/A';
  };

  const getClienteName = (clienteId) => {
    if (!clienteId || clientes.length === 0) return 'No esta registrado';
    const cliente = clientes.find(c => c.id === clienteId);
    return cliente ? cliente.nombre : 'N/A';
  };

  const getMensajeroName = (mensajeroId) => {
    if (!mensajeroId) return 'Sin asignar';
    const mensajero = mensajeros.find(m => m.id === mensajeroId);
    return mensajero ? mensajero.nombreUsuario : 'Sin asignar';
  };

  const getEstadoInfo = (estado) => {
    const estadoInfo = estadosDisponibles.find(e => e.value === estado);
    return estadoInfo || { label: estado || 'Sin estado', color: '#6c757d' };
  };

  const limpiarFiltros = () => {
    setFiltroEmpresa('');
    setFiltroEstado('');
    setFiltroCliente('');
    setBusquedaCliente('');
    setMostrarListaClientes(false);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (clienteInputRef.current && !clienteInputRef.current.contains(event.target)) {
        setMostrarListaClientes(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const geocodificarDireccion = async (direccion) => {
    const limpiarDireccion = (dir) => {
      return dir
        .replace(/,\s*Local\s+\d+/gi, '') 
        .replace(/,\s*Piso\s+\d+/gi, '') 
        .replace(/,\s*Oficina\s+\d+/gi, '') 
        .replace(/,\s*Apartamento\s+\d+/gi, '') 
        .replace(/,\s*Apto\s+\d+/gi, '') 
        .replace(/,\s*Torre\s+[A-Z]\d*/gi, '') 
        .replace(/,\s*Bloque\s+\d+/gi, '') 
        .replace(/\s+/g, ' ') 
        .trim();
    };

    const generarVariacionesBusqueda = (direccion) => {
      const direccionLimpia = limpiarDireccion(direccion);
      
      const variaciones = [
        direccion,
        direccionLimpia,
        `${direccionLimpia}, Colombia`,
        
        `${direccionLimpia}, shopping center, Colombia`,
        `${direccionLimpia}, mall, Colombia`,
        
        `${direccionLimpia}, building, Colombia`,
        `${direccionLimpia}, office building, Colombia`,
        `${direccionLimpia}, tower, Colombia`,
        `${direccionLimpia}, business center, Colombia`,
        
        direccionLimpia.includes('Bogota') ? direccionLimpia : `${direccionLimpia}, Bogotá, Colombia`,
        direccionLimpia.includes('Bogota') ? direccionLimpia : `${direccionLimpia}, Bogotá DC, Colombia`,
        direccionLimpia.includes('Bogota') ? direccionLimpia : `${direccionLimpia}, Bogotá, Cundinamarca, Colombia`,
        
        direccionLimpia.replace('#', 'No. '),
        direccionLimpia.replace('#', '-'),
        direccionLimpia.replace('Avenida', 'Av'),
        direccionLimpia.replace('Carrera', 'Cra'),
        direccionLimpia.replace('Calle', 'Cl'),
        
        direccionLimpia.replace('Centro Comercial', 'CC'),
        direccionLimpia.replace('Centro Comercial', 'Mall'),
        
        direccionLimpia.replace('Torre Empresarial', 'Torre'),
        direccionLimpia.replace('Torre Empresarial', 'Business Tower'),
        direccionLimpia.replace('Edificio', 'Building'),
        direccionLimpia.replace('Torre', 'Tower'),
        direccionLimpia.replace('Centro Empresarial', 'Business Center'),
        direccionLimpia.replace('Complejo Empresarial', 'Business Complex'),
        
        direccionLimpia.replace('Torre Empresarial ', '').replace('Edificio ', '').replace('Torre ', ''),
        `${direccionLimpia.replace('Torre Empresarial ', '').replace('Edificio ', '').replace('Torre ', '')}, Bogotá, Colombia`,
      ];

      return [...new Set(variaciones.filter(v => v && v.trim().length > 0))];
    };

    const formatosDireccion = generarVariacionesBusqueda(direccion);

    for (const formato of formatosDireccion) {
      try {
        const coordenadas = await intentarGeocodificacion(formato);
        if (coordenadas) {
          return coordenadas;
        }
        
        await new Promise(resolve => setTimeout(resolve, 1000));
        
      } catch (error) {
        console.warn(`Error geocodificando "${formato}":`, error.message);
        continue;
      }
    }

    console.error(` No se pudo geocodificar: "${direccion}"`);
    return null;
  };

  const intentarGeocodificacion = async (direccion) => {
    try {
      const coordenadas = await geocodificarConNominatim(direccion);
      if (coordenadas) return coordenadas;
    } catch (error) {
      console.warn('Error con Nominatim:', error.message);
    }

    try {
      const coordenadas = await geocodificarConPhoton(direccion);
      if (coordenadas) return coordenadas;
    } catch (error) {
      console.warn('Error con Photon:', error.message);
    }

    return null;
  };

  const geocodificarConNominatim = async (direccion) => {
    const url = `https://nominatim.openstreetmap.org/search?` + 
      `format=json&` +
      `q=${encodeURIComponent(direccion)}&` +
      `limit=3&` + 
      `countrycodes=co&` +
      `addressdetails=1&` +
      `extratags=1`;

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'DeliveryApp/1.0' 
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();

    if (data && data.length > 0) {
      const resultado = data[0];
      
      const lat = parseFloat(resultado.lat);
      const lng = parseFloat(resultado.lon);
      
      if (lat >= -4.2 && lat <= 12.5 && lng >= -81.8 && lng <= -66.8) {
        return { lat, lng };
      }
    }

    return null;
  };

  const geocodificarConPhoton = async (direccion) => {
    const url = `https://photon.komoot.io/api/?` +
      `q=${encodeURIComponent(direccion)}&` +
      `limit=3&` +
      `lang=es`;

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();

    if (data && data.features && data.features.length > 0) {
      for (const feature of data.features) {
        const properties = feature.properties;
        
        if (properties.country === 'Colombia' || properties.country === 'CO') {
          const [lng, lat] = feature.geometry.coordinates;
          
          if (lat >= -4.2 && lat <= 12.5 && lng >= -81.8 && lng <= -66.8) {
            return { lat, lng };
          }
        }
      }
    }

    return null;
  };

  const mostrarMapa = async (pedido) => {
    setCargandoMapa(true);
    setPedidoParaMapa(pedido);
    setMapaVisible(true);
    
    try {    
      console.log('🗺️ Iniciando geocodificación para:', {
        recogida: pedido.direccionRecogida,
        entrega: pedido.direccionEntrega
      });

      const [coordRecogida, coordEntrega] = await Promise.all([
        geocodificarDireccion(pedido.direccionRecogida),
        geocodificarDireccion(pedido.direccionEntrega)
      ]);
      
      if (!coordRecogida) {
        console.warn('No se pudo geocodificar la dirección de recogida');
      }
      
      if (!coordEntrega) {
        console.warn('No se pudo geocodificar la dirección de entrega');
      }

      if (!coordRecogida && !coordEntrega) {
        alert('No se pudieron encontrar las ubicaciones en el mapa. Verifique las direcciones.');
        return;
      }

      if (!coordRecogida || !coordEntrega) {
        alert('Solo se pudo encontrar una de las ubicaciones. El mapa puede no mostrar la ruta completa.');
      }
      
      setCoordenadas({
        recogida: coordRecogida,
        entrega: coordEntrega
      });
      
    } catch (error) {
      console.error('Error durante la geocodificación:', error);
      alert('Error al cargar las ubicaciones en el mapa. Intente nuevamente.');
    } finally {
      setCargandoMapa(false);
    }
  };

  if (loading) {
    return (
      <>
        <div className="container py-4" style={{ minHeight: 'calc(100vh - 120px)' }}>
          <h3 className="fw-bold" style={{ fontSize: '30px' }}>
            <i className="bi bi-box-seam-fill me-2" style={{ color: '#252850' }}></i>
            Administrar pedidos
          </h3>
          <div className="text-center mt-5">
            <div className="spinner-border text-primary" role="status" />
            <p className="mt-3">Cargando pedidos...</p>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <div className="container py-4" style={{ minHeight: 'calc(100vh - 120px)' }}>
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h3 className="fw-bold" style={{ fontSize: '30px' }}>
            <i className="bi bi-box-seam-fill me-2" style={{ color: '#252850' }}></i>
            Administrar pedidos
          </h3>
          <button
            onClick={() => {
              setFormVisible(true);
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
                notas: ''
              });
              setMensajeros([]);
              setErrores({});
            }}
            className="btn btn-success"
          >
            <i className="bi bi-plus-lg me-2"></i>
            Nuevo pedido
          </button>
        </div>

        <div className="mb-4">
          <div className="row mb-3">
            <div className="col-md-4">
              <div className="card shadow-sm">
                <div className="card-body">
                  <label className="form-label fw-semibold">
                    <i className="bi bi-funnel me-2" style={{ color: '#6c757d' }}></i>
                    Filtrar por empresa
                  </label>
                  <select
                    value={filtroEmpresa}
                    onChange={(e) => setFiltroEmpresa(e.target.value)}
                    className="form-select"
                  >
                    <option value="">Todas las empresas</option>
                    {empresas.map(empresa => (
                      <option key={empresa.id} value={empresa.id}>{empresa.nombre}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
            <div className="col-md-4">
              <div className="card shadow-sm">
                <div className="card-body">
                  <label className="form-label fw-semibold">
                    <i className="bi bi-flag me-2" style={{ color: '#6c757d' }}></i>
                    Filtrar por estado
                  </label>
                  <select
                    value={filtroEstado}
                    onChange={(e) => setFiltroEstado(e.target.value)}
                    className="form-select"
                  >
                    <option value="">Todos los estados</option>
                    {estadosDisponibles.map(estado => (
                      <option key={estado.value} value={estado.value}>{estado.label}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
            <div className="col-md-4">
              <div className="card shadow-sm">
                <div className="card-body">
                  <label className="form-label fw-semibold">
                    <i className="bi bi-person me-2" style={{ color: '#6c757d' }}></i>
                    Filtrar por cliente
                  </label>
                  <div className="position-relative" ref={clienteInputRef}>
                    <div className="input-group">
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Buscar por nombre del cliente"
                        value={busquedaCliente}
                        onChange={handleBusquedaCliente}
                        onFocus={() => setMostrarListaClientes(true)}
                      />
                      {filtroCliente && (
                        <button
                          className="btn btn-outline-secondary"
                          type="button"
                          onClick={limpiarSeleccionCliente}
                          title="Limpiar selección"
                        >
                          <i className="bi bi-x"></i>
                        </button>
                      )}
                    </div>
                    
                    {mostrarListaClientes && clientesFiltrados.length > 0 && (
                      <div 
                        className="position-absolute w-100 bg-white border rounded shadow-lg mt-1" 
                        style={{ zIndex: 1000, maxHeight: '200px', overflowY: 'auto' }}
                      >
                        {clientesFiltrados.slice(0, 10).map(cliente => (
                          <div
                            key={cliente.id}
                            className="px-3 py-2 border-bottom cursor-pointer hover-bg-light"
                            onClick={() => seleccionarCliente(cliente)}
                            style={{ 
                              cursor: 'pointer',
                              transition: 'background-color 0.2s'
                            }}
                            onMouseEnter={(e) => e.target.style.backgroundColor = '#f8f9fa'}
                            onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                          >
                            <div className="fw-semibold">{cliente.nombre}</div>
                            {cliente.email && (
                              <small className="text-muted">{cliente.email}</small>
                            )}
                            {cliente.telefono && (
                              <small className="text-muted ms-2">Tel: {cliente.telefono}</small>
                            )}
                          </div>
                        ))}
                        {clientesFiltrados.length > 10 && (
                          <div className="px-3 py-2 text-muted text-center">
                            <small>... y {clientesFiltrados.length - 10} más</small>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="row">
            <div className="col-md-3">
              {(filtroEmpresa || filtroEstado || filtroCliente) && (
                <button
                  className="btn btn-outline-secondary"
                  onClick={limpiarFiltros}
                >
                  <i className="bi bi-x-circle me-1"></i>
                  Limpiar filtros
                </button>
              )}
            </div>
            <div className="col-md-9 d-flex align-items-center justify-content-end">
              <div className="text-muted">
                <i className="bi bi-info-circle me-1"></i>
                Mostrando {pedidosFiltrados.length} de {pedidos.length} pedidos
              </div>
            </div>
          </div>
        </div>

        {formVisible && (
          <div ref={formRef} className="card shadow-sm mb-4 mx-auto" style={{ maxWidth: '900px' }}>
            <div className="card-header bg-primary text-white">
              <i className="bi bi-box-seam me-2" style={{ color: '#252850' }}></i>
              {editingPedido?.id ? 'Editar pedido' : 'Nuevo pedido'}
            </div>
            <div className="card-body">
              <form onSubmit={handleGuardar}>
                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label className="form-label">
                      <i className="bi bi-buildings me-1" style={{ color: '#ff6600' }}></i>
                      Empresa
                    </label>
                    <select
                      name="empresaMensajeria"
                      value={editingPedido?.empresaMensajeria?.id || ''}
                      onChange={handleInputChange}
                      className={`form-select ${errores.empresaMensajeria ? 'is-invalid' : ''}`}
                    >
                      <option value="">Seleccionar empresa</option>
                      {empresas.map(empresa => (
                        <option key={empresa.id} value={empresa.id}>{empresa.nombre}</option>
                      ))}
                    </select>
                    {errores.empresaMensajeria && (
                      <div className="invalid-feedback">{errores.empresaMensajeria}</div>
                    )}
                  </div>

                  <div className="col-md-6 mb-3">
                    <label className="form-label">
                      <i className="bi bi-hammer me-1" style={{ color: '#20b2aa' }}></i>
                      Cliente
                    </label>
                    <select
                      name="cliente"
                      value={editingPedido?.cliente?.id || ''}
                      onChange={handleInputChange}
                      className={`form-select ${errores.cliente ? 'is-invalid' : ''}`}
                    >
                      <option value="">Seleccionar cliente</option>
                      {clientes.map(cliente => (
                        <option key={cliente.id} value={cliente.id}>{cliente.nombre}</option>
                      ))}
                    </select>
                    {errores.cliente && (
                      <div className="invalid-feedback">{errores.cliente}</div>
                    )}
                  </div>
                </div>

                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label className="form-label">
                      <i className="bi bi-geo-alt-fill me-1" style={{ color: '#dc3545' }}></i>
                      Dirección Recogida
                    </label>
                    <input
                      type="text"
                      name="direccionRecogida"
                      value={editingPedido?.direccionRecogida || ''}
                      onChange={handleInputChange}
                      className={`form-control ${errores.direccionRecogida ? 'is-invalid' : ''}`}
                      placeholder="Dirección de recogida"
                    />
                    {errores.direccionRecogida && (
                      <div className="invalid-feedback">{errores.direccionRecogida}</div>
                    )}
                  </div>

                  <div className="col-md-6 mb-3">
                    <label className="form-label">
                      <i className="bi bi-geo-alt-fill me-1" style={{ color: '#6f42c1' }}></i>
                      Dirección Entrega
                    </label>
                    <input
                      type="text"
                      name="direccionEntrega"
                      value={editingPedido?.direccionEntrega || ''}
                      onChange={handleInputChange}
                      className={`form-control ${errores.direccionEntrega ? 'is-invalid' : ''}`}
                      placeholder="Dirección de entrega"
                    />
                    {errores.direccionEntrega && (
                      <div className="invalid-feedback">{errores.direccionEntrega}</div>
                    )}
                  </div>
                </div>

                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label className="form-label">
                      <i className="bi bi-telephone-fill me-1" style={{ color: '#28a745' }}></i>
                      Teléfono Recogida
                    </label>
                    <input
                      type="text"
                      name="telefonoRecogida"
                      value={editingPedido?.telefonoRecogida || ''}
                      onChange={handleInputChange}
                      className={`form-control ${errores.telefonoRecogida ? 'is-invalid' : ''}`}
                      placeholder="Teléfono de recogida"
                    />
                    {errores.telefonoRecogida && (
                      <div className="invalid-feedback">{errores.telefonoRecogida}</div>
                    )}
                  </div>

                  <div className="col-md-6 mb-3">
                    <label className="form-label">
                      <i className="bi bi-telephone-fill me-1" style={{ color: '#ffc107' }}></i>
                      Teléfono Entrega
                    </label>
                    <input
                      type="text"
                      name="telefonoEntrega"
                      value={editingPedido?.telefonoEntrega || ''}
                      onChange={handleInputChange}
                      className={`form-control ${errores.telefonoEntrega ? 'is-invalid' : ''}`}
                      placeholder="Teléfono de entrega"
                    />
                    {errores.telefonoEntrega && (
                      <div className="invalid-feedback">{errores.telefonoEntrega}</div>
                    )}
                  </div>
                </div>

                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label className="form-label">
                      <i className="bi bi-box me-1" style={{ color: '#252850' }}></i>
                      Tipo de Paquete
                    </label>
                    <input
                      type="text"
                      name="tipoPaquete"
                      value={editingPedido?.tipoPaquete || ''}
                      onChange={handleInputChange}
                      className={`form-control ${errores.tipoPaquete ? 'is-invalid' : ''}`}
                      placeholder="Tipo de paquete"
                    />
                    {errores.tipoPaquete && (
                      <div className="invalid-feedback">{errores.tipoPaquete}</div>
                    )}
                  </div>

                  <div className="col-md-6 mb-3">
                    <label className="form-label">
                      <i className="bi bi-flag-fill me-1" style={{ color: '#fd7e14' }}></i>
                      Estado
                    </label>
                    <select
                      name="estado"
                      value={editingPedido?.estado || ''}
                      onChange={handleInputChange}
                      className="form-select"
                    >
                      {estadosDisponibles.map(estado => (
                        <option key={estado.value} value={estado.value}>{estado.label}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label className="form-label">
                      <i className="bi bi-person-badge me-1" style={{ color: '#6f42c1' }}></i>
                      Mensajero
                    </label>
                    <select
                      name="mensajero"
                      value={editingPedido?.mensajero?.id || ''}
                      onChange={handleInputChange}
                      className="form-select"
                    >
                      <option value="">Sin asignar</option>
                      {mensajeros.map(mensajero => (
                        <option key={mensajero.id} value={mensajero.id}>{mensajero.nombreUsuario}</option>
                      ))}
                    </select>
                  </div>

                  <div className="col-md-6 mb-3">
                    <label className="form-label">
                      <i className="bi bi-chat-text me-1" style={{ color: '#6c757d' }}></i>
                      Notas
                    </label>
                    <textarea
                      name="notas"
                      value={editingPedido?.notas || ''}
                      onChange={handleInputChange}
                      className="form-control"
                      placeholder="Notas adicionales"
                      rows="3"
                    />
                  </div>
                </div>

                <div className="d-flex justify-content-end gap-2">
                  <button type="submit" className="btn btn-primary">
                    <i className="bi bi-save me-1"></i> Guardar
                  </button>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => {
                      setFormVisible(false);
                      setEditingPedido(null);
                      setErrores({});
                    }}
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {pedidosFiltrados.length === 0 ? (
          <div className="text-center py-5">
            <i className="bi bi-inbox" style={{ fontSize: '4rem', color: '#dee2e6' }}></i>
            <h4 className="text-muted mt-3">
              {pedidos.length === 0 ? 'No hay pedidos registrados' : 'No se encontraron resultados'}
            </h4>
            <p className="text-muted">
              {pedidos.length === 0 
                ? 'Aún no se han registrado pedidos en el sistema.' 
                : 'Intenta ajustar los filtros de búsqueda. No se encontraron pedidos que coincidan con los criterios seleccionados.'
              }
            </p>
          </div>
        ) : (
          <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
            {pedidosFiltrados.map(pedido => {
              const estadoInfo = getEstadoInfo(pedido.estado);
              return (
                <div className="col" key={pedido.id}>
                  <div className="card h-100 shadow-sm">
                    <div className="card-body">
                      <div className="text-center mb-3">
                        <i className="bi bi-box-seam-fill" style={{ fontSize: '3rem', color: '#252850' }}></i>
                      </div>
                      
                      <div className="d-flex justify-content-between align-items-center mb-3">
                        <h5 className="card-title mb-0">Pedido #{pedido.id}</h5>
                        <span 
                          className="badge px-2 py-1" 
                          style={{ backgroundColor: estadoInfo.color, fontSize: '0.75rem' }}
                        >
                          {estadoInfo.label}
                        </span>
                      </div>
                      
                      <div className="mb-2">
                        <small className="text-muted">
                          <i className="bi bi-buildings me-1" style={{ color: '#ff6600' }}></i>
                          Empresa:
                        </small>
                        <div className="fw-semibold text-primary">{getEmpresaName(pedido.empresaMensajeria?.id)}</div>
                      </div>

                      <div className="mb-2">
                        <small className="text-muted">
                          <i className="bi bi-hammer me-1" style={{ color: '#20b2aa' }}></i>
                          Cliente:
                        </small>
                        <div>{getClienteName(pedido.cliente?.id)}</div>
                      </div>

                      <div className="mb-2">
                        <small className="text-muted">
                          <i className="bi bi-geo-alt me-1" style={{ color: '#dc3545' }}></i>
                          Recogida:
                        </small>
                        <div className="text-truncate" title={pedido.direccionRecogida}>
                          {pedido.direccionRecogida}
                        </div>
                      </div>

                      <div className="mb-2">
                        <small className="text-muted">
                          <i className="bi bi-geo-alt me-1" style={{ color: '#6f42c1' }}></i>
                          Entrega:
                        </small>
                        <div className="text-truncate" title={pedido.direccionEntrega}>
                          {pedido.direccionEntrega}
                        </div>
                      </div>

                      <div className="mb-2">
                        <small className="text-muted">
                          <i className="bi bi-telephone me-1" style={{ color: '#28a745' }}></i>
                          Tel. Recogida:
                        </small>
                        <div>{pedido.telefonoRecogida}</div>
                      </div>

                      <div className="mb-2">
                        <small className="text-muted">
                          <i className="bi bi-telephone me-1" style={{ color: '#ffc107' }}></i>
                          Tel. Entrega:
                        </small>
                        <div>{pedido.telefonoEntrega}</div>
                      </div>

                      <div className="mb-2">
                        <small className="text-muted">
                          <i className="bi bi-box me-1" style={{ color: '#252850' }}></i>
                          Tipo:
                        </small>
                        <div>{pedido.tipoPaquete}</div>
                      </div>

                      <div className="mb-2">
                        <small className="text-muted">
                          <i className="bi bi-person-badge me-1" style={{ color: '#6f42c1' }}></i>
                          Mensajero:
                        </small>
                        <div className="fw-semibold" style={{ color: pedido.mensajero ? '#28a745' : '#6c757d' }}>
                          {getMensajeroName(pedido.mensajero?.id)}
                        </div>
                      </div>

                      {pedido.notas && (
                        <div className="mb-2">
                          <small className="text-muted">
                            <i className="bi bi-chat-text me-1" style={{ color: '#6c757d' }}></i>
                            Notas:
                          </small>
                          <div className="text-truncate" title={pedido.notas}>
                            {pedido.notas}
                          </div>
                        </div>
                      )}

                      {pedido.fechaCreacion && (
                        <p className="text-muted text-center mt-3" style={{ fontSize: '0.75rem' }}>
                          <span className="me-2">Creado el</span>
                          <i className="bi bi-calendar-event me-1" style={{ color: '#28a745' }}></i>
                          <span className="me-2">{formatearFecha(pedido.fechaCreacion).split(' ')[0].replace(',', '')}</span>
                          <i className="bi bi-clock me-1" style={{ color: '#6c757d' }}></i>
                          <span>{formatearFecha(pedido.fechaCreacion).split(' ')[1]}</span>
                        </p>
                      )}
                    </div>
                    
                    <div className="card-footer d-flex justify-content-center gap-1 bg-light">
                      <button
                        className="btn btn-sm btn-outline-primary"
                        onClick={() => handleEditar(pedido)}
                      >
                        <i className="bi bi-pencil-square me-1"></i>Editar
                      </button>
                      <button
                        className="btn btn-sm btn-outline-info"
                        onClick={() => mostrarMapa(pedido)}
                        title="Ver ruta en mapa"
                      >
                        <i className="bi bi-map me-1"></i>Ruta
                      </button>
                      <button
                        className="btn btn-sm btn-outline-danger"
                        onClick={() => handleEliminar(pedido.id)}
                      >
                        <i className="bi bi-trash-fill me-1"></i>Eliminar
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
        <ModalMapa 
          mapaVisible={mapaVisible}
          cargandoMapa={cargandoMapa}
          pedidoParaMapa={pedidoParaMapa}
          coordenadas={coordenadas}
          setMapaVisible={setMapaVisible}
          setPedidoParaMapa={setPedidoParaMapa}
          setCoordenadas={setCoordenadas}
          setCargandoMapa={setCargandoMapa}
        />
      </div>
      <Footer />
    </>
  );
}