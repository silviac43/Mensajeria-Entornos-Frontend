import { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import Footer from '../../components/Footer';
import ModalMapa from '../../components/ModalMapa';

export default function OperadorClientes() {
  const [clientes, setClientes] = useState([]);
  const [clientesFiltrados, setClientesFiltrados] = useState([]);
  const [operadorData, setOperadorData] = useState(null);
  const [empresaOperador, setEmpresaOperador] = useState(null);
  const [formVisible, setFormVisible] = useState(false);
  const [editingCliente, setEditingCliente] = useState(null);
  const [errores, setErrores] = useState({});
  const [loading, setLoading] = useState(true);
  const [filtroNombre, setFiltroNombre] = useState('');
  const formRef = useRef(null);
  const [mapaVisible, setMapaVisible] = useState(false);
  const [clienteParaMapa, setClienteParaMapa] = useState(null);
  const [coordenadas, setCoordenadas] = useState({ recogida: null, entrega: null });
  const [cargandoMapa, setCargandoMapa] = useState(false);

  const token = localStorage.getItem('token');
  const headers = {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json'
  };

  const obtenerInformacionOperador = async () => {
    try {
      const token = localStorage.getItem('token'); 
      
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

  useEffect(() => {
    aplicarFiltro();
  }, [clientes, filtroNombre]);

  const aplicarFiltro = () => {
    let filtrados = clientes;
    
    if (filtroNombre) {
      filtrados = filtrados.filter(cliente =>
        cliente.nombre.toLowerCase().includes(filtroNombre.toLowerCase())
      );
    }
    
    setClientesFiltrados(filtrados);
  };

  const limpiarFiltros = () => {
    setFiltroNombre('');
  };

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
    if (!value || !value.toString().trim()) {
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

  const handleEditar = (cliente) => {
    console.log('Editando cliente:', cliente);
    setEditingCliente(cliente);
    setFormVisible(true);
    setErrores({});
    setTimeout(() => {
      formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  const handleEliminar = (id) => {
    if (confirm('¿Eliminar cliente?')) {
      axios.delete(`http://localhost:8080/api/clientes/${id}`, { headers })
        .then(() => {
          console.log('Cliente eliminado correctamente');
          cargarDatos();
        })
        .catch(err => console.error('Error al eliminar cliente:', err));
    }
  };

  const handleGuardar = async (e) => {
    e.preventDefault();
    if (!validarFormulario()) return;

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
        
        if (cliente.id) {
          alert('Cliente actualizado correctamente.');
        } else {
          alert('Cliente creado correctamente.');
        }
        
        cargarDatos();
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

  const mostrarMapa = async (cliente) => {
    setCargandoMapa(true);
    setClienteParaMapa(cliente);
    setMapaVisible(true);
    
    try {    
      console.log('🗺️ Iniciando geocodificación para:', {
        recogida: cliente.direccionRecogida,
        entrega: cliente.direccionEntrega
      });

      const [coordRecogida, coordEntrega] = await Promise.all([
        geocodificarDireccion(cliente.direccionRecogida),
        geocodificarDireccion(cliente.direccionEntrega)
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
          <div>
            <h3 className="fw-bold mb-2" style={{ fontSize: '30px' }}>
              <i className="bi bi-hammer me-2" style={{ color: '#20b2aa' }}></i>
              Administrar clientes
            </h3>
            <p className="text-muted mb-0 fw-semibold">
              <i className="bi bi-buildings me-1" style={{ color: '#ff6600' }}></i>
              Empresa: <span className="fw-semibold">{operadorData?.empresaMensajeria?.nombre || 'Cargando...'}</span>
            </p>
          </div>
          <div className="text-center mt-5">
            <div className="spinner-border text-primary" role="status" />
            <p className="mt-3">Cargando clientes...</p>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  if (!empresaOperador) {
    return (
      <>
        <div className="container py-4" style={{ minHeight: 'calc(100vh - 120px)' }}>
          <div>
            <h3 className="fw-bold mb-2" style={{ fontSize: '30px' }}>
              <i className="bi bi-hammer me-2" style={{ color: '#20b2aa' }}></i>
              Administrar clientes
            </h3>
            <p className="text-muted mb-0 fw-semibold">
              <i className="bi bi-buildings me-1" style={{ color: '#ff6600' }}></i>
              Empresa: <span className="fw-semibold">{operadorData?.empresaMensajeria?.nombre || 'Cargando...'}</span>
            </p>
          </div>
          <div className="alert alert-danger mt-4">
            <i className="bi bi-exclamation-triangle-fill me-2"></i>
            No se pudo determinar la empresa del operador. Verifique su sesión.
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
          <div>
            <h3 className="fw-bold mb-2" style={{ fontSize: '30px' }}>
              <i className="bi bi-hammer me-2" style={{ color: '#20b2aa' }}></i>
              Administrar clientes
            </h3>
            <p className="text-muted mb-0 fw-semibold">
              <i className="bi bi-buildings me-1" style={{ color: '#ff6600' }}></i>
              Empresa: <span className="fw-semibold">{operadorData?.empresaMensajeria?.nombre || 'Cargando...'}</span>
            </p>
          </div>
          <button
            onClick={() => {
              setFormVisible(true);
              setEditingCliente({
                nombre: '',
                telefonoRecogida: '',
                direccionRecogida: '',
                telefonoEntrega: '',
                direccionEntrega: '',
                email: ''
              });
              setErrores({});
            }}
            className="btn btn-success"
          >
            <i className="bi bi-plus-lg me-2"></i>
            Nuevo cliente
          </button>
        </div>

      <div className="mb-4">
        <div className="row mb-3">
          <div className="col-md-4">
            <div className="card shadow-sm">
              <div className="card-body">
                <label className="form-label fw-semibold">
                  <i className="bi bi-search me-2" style={{ color: '#6c757d' }}></i>
                  Buscar cliente
                </label>
                <input
                  type="text"
                  value={filtroNombre}
                  onChange={(e) => setFiltroNombre(e.target.value)}
                  className="form-control"
                  placeholder="Buscar por nombre"
                />
              </div>
            </div>
          </div>
          <div className="col-md-4">
          </div>
          <div className="col-md-4">
          </div>
        </div>
        
        <div className="row">
          <div className="col-md-3">
            {(filtroNombre) && (
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
              Mostrando {clientesFiltrados.length} de {clientes.length} clientes
            </div>
          </div>
        </div>
      </div>

        {formVisible && (
          <div ref={formRef} className="card shadow-sm mb-4 mx-auto" style={{ maxWidth: '700px' }}>
            <div className="card-header bg-primary text-white">
              <i className="bi bi-hammer me-2"></i>
              {editingCliente?.id ? 'Editar cliente' : 'Nuevo cliente'}
            </div>
            <div className="card-body">
              <form onSubmit={handleGuardar}>
                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label className="form-label">
                      <i className="bi bi-hammer me-1" style={{ color: '#20b2aa' }}></i>
                      Nombre
                    </label>
                    <input
                      type="text"
                      name="nombre"
                      value={editingCliente?.nombre || ''}
                      onChange={handleInputChange}
                      className={`form-control ${errores.nombre ? 'is-invalid' : ''}`}
                      placeholder="Nombre del cliente"
                    />
                    {errores.nombre && (
                      <div className="invalid-feedback">{errores.nombre}</div>
                    )}
                  </div>

                  <div className="col-md-6 mb-3">
                    <label className="form-label">
                      <i className="bi bi-envelope-fill me-1" style={{ color: '#007bff' }}></i>
                      Email
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={editingCliente?.email || ''}
                      onChange={handleInputChange}
                      className={`form-control ${errores.email ? 'is-invalid' : ''}`}
                      placeholder="correo@ejemplo.com"
                    />
                    {errores.email && (
                      <div className="invalid-feedback">{errores.email}</div>
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
                      value={editingCliente?.telefonoRecogida || ''}
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
                      value={editingCliente?.telefonoEntrega || ''}
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
                      <i className="bi bi-geo-alt-fill me-1" style={{ color: '#dc3545' }}></i>
                      Dirección Recogida
                    </label>
                    <input
                      type="text"
                      name="direccionRecogida"
                      value={editingCliente?.direccionRecogida || ''}
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
                      value={editingCliente?.direccionEntrega || ''}
                      onChange={handleInputChange}
                      className={`form-control ${errores.direccionEntrega ? 'is-invalid' : ''}`}
                      placeholder="Dirección de entrega"
                    />
                    {errores.direccionEntrega && (
                      <div className="invalid-feedback">{errores.direccionEntrega}</div>
                    )}
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
                      setEditingCliente(null);
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

        <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
          {clientesFiltrados.map(cliente => (
            <div className="col" key={cliente.id}>
              <div className="card h-100 shadow-sm">
                <div className="card-body">
                  <div className="text-center mb-3">
                    <i className="bi bi-hammer" style={{ fontSize: '3rem', color: '#20b2aa' }}></i>
                  </div>
                  
                  <h5 className="card-title text-center mb-3">{cliente.nombre}</h5>
                  
                  <div className="mb-2">
                    <small className="text-muted">
                      <i className="bi bi-envelope me-1" style={{ color: '#007bff' }}></i>
                      Email:
                    </small>
                    <div className="fw-semibold text-primary">{cliente.email}</div>
                  </div>

                  <div className="mb-2">
                    <small className="text-muted">
                      <i className="bi bi-telephone me-1" style={{ color: '#28a745' }}></i>
                      Tel. Recogida:
                    </small>
                    <div>{cliente.telefonoRecogida}</div>
                  </div>

                  <div className="mb-2">
                    <small className="text-muted">
                      <i className="bi bi-telephone me-1" style={{ color: '#ffc107' }}></i>
                      Tel. Entrega:
                    </small>
                    <div>{cliente.telefonoEntrega}</div>
                  </div>

                  <div className="mb-2">
                    <small className="text-muted">
                      <i className="bi bi-geo-alt me-1" style={{ color: '#dc3545' }}></i>
                      Dir. Recogida:
                    </small>
                    <div className="text-truncate" title={cliente.direccionRecogida}>
                      {cliente.direccionRecogida}
                    </div>
                  </div>

                  <div className="mb-2">
                    <small className="text-muted">
                      <i className="bi bi-geo-alt me-1" style={{ color: '#6f42c1' }}></i>
                      Dir. Entrega:
                    </small>
                    <div className="text-truncate" title={cliente.direccionEntrega}>
                      {cliente.direccionEntrega}
                    </div>
                  </div>

                  {cliente.fechaCreacion && (
                    <p className="text-muted text-center mt-3" style={{ fontSize: '0.75rem' }}>
                      Desde {new Date(cliente.fechaCreacion).toLocaleDateString()}
                    </p>
                  )}
                </div>
                
                  <div className="card-footer d-flex justify-content-center gap-1 bg-light">
                      <button
                        className="btn btn-sm btn-outline-primary"
                        onClick={() => handleEditar(cliente)}
                      >
                        <i className="bi bi-pencil-square me-1"></i>Editar
                      </button>
                      <button
                        className="btn btn-sm btn-outline-info"
                        onClick={() => mostrarMapa(cliente)}
                        title="Ver ruta en mapa"
                      >
                        <i className="bi bi-map me-1"></i>Ruta
                      </button>
                      <button
                        className="btn btn-sm btn-outline-danger"
                        onClick={() => handleEliminar(cliente.id)}
                      >
                        <i className="bi bi-trash-fill me-1"></i>Eliminar
                      </button>
                  </div>
              </div>
            </div>
          ))}
      </div>
      {clientesFiltrados.length === 0 && (
            <div className="text-center py-5">
              <i className="bi bi-inbox" style={{ fontSize: '4rem', color: '#dee2e6' }}></i>
              <h4 className="text-muted mt-3">
                {clientes.length === 0 ? 'No hay clientes registrados' : 'No se encontraron resultados'}
              </h4>
              <p className="text-muted">
                {clientes.length === 0 
                  ? 'Aún no se han registrado clientes en el sistema.' 
                  : `Intenta ajustar el filtro de búsqueda. No se encontraron clientes con "${filtroNombre}".`
                }
              </p>
            </div>
          )}
          <ModalMapa 
          mapaVisible={mapaVisible}
          cargandoMapa={cargandoMapa}
          pedidoParaMapa={clienteParaMapa}
          coordenadas={coordenadas}
          setMapaVisible={setMapaVisible}
          setPedidoParaMapa={setClienteParaMapa}
          setCoordenadas={setCoordenadas}
          setCargandoMapa={setCargandoMapa}
        />
        </div>
      <Footer />
    </>
  );
}