import { useEffect, useState } from "react";
import axios from "axios";
import Footer from '../../components/Footer';
import ModalMapa from '../../components/ModalMapa';

export default function MensajeroPedidos() {
  const [pedidos, setPedidos] = useState([]);
  const [pedidosFiltrados, setPedidosFiltrados] = useState([]);
  const [mensajero, setMensajero] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filtroEstado, setFiltroEstado] = useState('');
  const [mapaVisible, setMapaVisible] = useState(false);
  const [pedidoParaMapa, setPedidoParaMapa] = useState(null);
  const [coordenadas, setCoordenadas] = useState({ recogida: null, entrega: null });
  const [cargandoMapa, setCargandoMapa] = useState(false);

  const token = localStorage.getItem("token");
  const headers = {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };

  const estadosDisponibles = [
    { value: 'PENDIENTE', label: 'Pendiente', color: '#ffc107' },
    { value: 'ASIGNADO', label: 'Asignado', color: '#007bff' },
    { value: 'EN_TRANSITO', label: 'En Tránsito', color: '#ff6600' },
    { value: 'ENTREGADO', label: 'Entregado', color: '#28a745' }
  ];

  const obtenerInfoMensajero = async () => {
    try {
      const res = await axios.get("http://localhost:8080/auth/me", {
        headers: { Authorization: `Bearer ${token}` },
      });
      return res.data;
    } catch (err) {
      throw err;
    }
  };

  useEffect(() => {
    const cargarPedidos = async () => {
      setLoading(true);
      try {
        const mensajeroInfo = await obtenerInfoMensajero();
        const mensajeroId = mensajeroInfo.id;
        setMensajero(mensajeroInfo);

        const res = await axios.get(
          `http://localhost:8080/api/pedidos/mensajero/${mensajeroId}`,
          { headers }
        );

        if (res.data.status === 200) {
          setPedidos(res.data.data);
          setError(null);
        } else {
          setError(res.data.message || "Error desconocido");
        }
      } catch (err) {
        console.error("Error al cargar pedidos:", err);
        setError(err.response?.data?.message || err.message);
      } finally {
        setLoading(false);
      }
    };

    cargarPedidos();
  }, []);

  useEffect(() => {
    aplicarFiltros();
  }, [pedidos, filtroEstado]);

  const aplicarFiltros = () => {
    let filtrados = [...pedidos];

    if (filtroEstado) {
      filtrados = filtrados.filter(pedido => pedido.estado === filtroEstado);
    }

    setPedidosFiltrados(filtrados);
  };

  const getEstadoInfo = (estado) => {
    const estadoInfo = estadosDisponibles.find(e => e.value === estado);
    return estadoInfo || { label: estado || 'Sin estado', color: '#6c757d' };
  };

  const limpiarFiltros = () => {
    setFiltroEstado('');
  };

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
          <h3 className="fw-bold mb-2" style={{ fontSize: '30px' }}>
            <i className="bi bi-person-badge-fill me-2" style={{ color: '#6f42c1' }}></i>
            Mis pedidos 
          </h3>
            <p className="text-muted mb-0 fw-semibold">
              <i className="bi bi-buildings me-1" style={{ color: '#ff6600' }}></i>
              Empresa: <span className="fw-semibold">{mensajero?.empresaMensajeria?.nombre}</span>
            </p>
          <div className="text-center mt-5">
            <div className="spinner-border text-primary" role="status" />
            <p className="mt-3">Cargando pedidos...</p>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  if (error) {
    return (
      <>
        <div className="container py-4" style={{ minHeight: 'calc(100vh - 120px)' }}>
          <div className="alert alert-danger" role="alert">
            <i className="bi bi-exclamation-triangle-fill me-2"></i>
            Error: {error}
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <div className="container py-4" style={{ minHeight: 'calc(100vh - 120px)' }}>
        <div className="mb-4">
          <h3 className="fw-bold mb-2" style={{ fontSize: '30px' }}>
            <i className="bi bi-person-badge-fill me-2" style={{ color: '#6f42c1' }}></i>
            Mis pedidos 
          </h3>
          <p className="text-muted mb-0 fw-semibold">
            <i className="bi bi-buildings me-1" style={{ color: '#ff6600' }}></i>
            Empresa: <span className="fw-semibold">{mensajero?.empresaMensajeria?.nombre}</span>
          </p>
        </div>

      <div className="row mb-4">
        <div className="col-md-3">
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
        
        {estadosDisponibles.slice(0, 4).map(estado => {
          const count = pedidos.filter(p => p.estado === estado.value).length;
          return (
            <div key={estado.value} className="col-md-2">
              <div className="card shadow-sm h-100">
                <div className="card-body text-center d-flex flex-column justify-content-center p-2">
                  <div style={{ color: estado.color, fontSize: '1.5rem' }}>
                    <i className="bi bi-flag-fill"></i>
                  </div>
                  <h6 className="card-title mb-0">{count}</h6>
                  <small className="text-muted">{estado.label}</small>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="row mb-4">
        <div className="col-md-3">
          {filtroEstado && (
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
                        <i className="bi bi-person-fill me-1" style={{ color: '#20b2aa' }}></i>
                        Cliente:
                      </small>
                      <div className="fw-semibold">{pedido.cliente?.nombre || 'No registrado'}</div>
                    </div>

                    <div className="mb-2">
                      <small className="text-muted">
                        <i className="bi bi-geo-alt-fill me-1" style={{ color: '#dc3545' }}></i>
                        Recogida:
                      </small>
                      <div className="text-truncate" title={pedido.direccionRecogida}>
                        {pedido.direccionRecogida}
                      </div>
                    </div>

                    <div className="mb-2">
                      <small className="text-muted">
                        <i className="bi bi-geo-alt-fill me-1" style={{ color: '#6f42c1' }}></i>
                        Entrega:
                      </small>
                      <div className="text-truncate" title={pedido.direccionEntrega}>
                        {pedido.direccionEntrega}
                      </div>
                    </div>

                    <div className="mb-2">
                      <small className="text-muted">
                        <i className="bi bi-telephone-fill me-1" style={{ color: '#28a745' }}></i>
                        Tel. Recogida:
                      </small>
                      <div>
                        <a href={`tel:${pedido.telefonoRecogida}`} className="text-decoration-none">
                          {pedido.telefonoRecogida}
                        </a>
                      </div>
                    </div>

                    <div className="mb-2">
                      <small className="text-muted">
                        <i className="bi bi-telephone-fill me-1" style={{ color: '#ffc107' }}></i>
                        Tel. Entrega:
                      </small>
                      <div>
                        <a href={`tel:${pedido.telefonoEntrega}`} className="text-decoration-none">
                          {pedido.telefonoEntrega}
                        </a>
                      </div>
                    </div>

                    <div className="mb-2">
                      <small className="text-muted">
                        <i className="bi bi-box me-1" style={{ color: '#252850' }}></i>
                        Tipo:
                      </small>
                      <div>{pedido.tipoPaquete}</div>
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
                        className="btn btn-sm btn-outline-info"
                        onClick={() => mostrarMapa(pedido)}
                        title="Ver ruta en mapa"
                      >
                        <i className="bi bi-map me-1"></i>Ruta
                      </button>
                    </div>
                </div>
              </div>
            );
          })}
        </div>
        {pedidosFiltrados.length === 0 && (
            <div className="col-12">
              <div className="text-center text-muted py-5">
                <i className="bi bi-inbox" style={{ fontSize: '4rem', color: '#6c757d' }}></i>
                <h4 className="mt-3">
                  {filtroEstado ? 'No hay pedidos que coincidan con el filtro seleccionado' : 'No hay pedidos asignados'}
                </h4>
                <p>
                  {filtroEstado ? 'Prueba con un filtro diferente o limpia los filtros.' : 'Los pedidos aparecerán aquí cuando te sean asignados.'}
                </p>
              </div>
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