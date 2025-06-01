import { useEffect, useState } from 'react';
import axios from 'axios';
import Footer from '../../components/Footer';

export default function AdminHistorialPedidos() {
  const [historial, setHistorial] = useState([]);
  const [historialFiltrado, setHistorialFiltrado] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filtros, setFiltros] = useState({
    pedidoId: '',
    tipoCambio: '',
    usuario: '',
    fechaDesde: '',
    fechaHasta: ''
  });

  const token = localStorage.getItem('token');
  const headers = {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  };

  useEffect(() => {
    const fetchHistorial = async () => {
      setLoading(true);
      try {
        const response = await axios.get('http://localhost:8080/api/historialpedido', { headers });
        const data = response.data;
        console.log('Respuesta del historial completo:', data);

        setHistorial(response.data.data);
        setHistorialFiltrado(response.data.data);
      } catch (err) {
        console.error('Error al obtener historial:', err);
        setError('Error al conectar con el servidor');
      } finally {
        setLoading(false);
      }
    };

    fetchHistorial();
  }, []);

  useEffect(() => {
    aplicarFiltros();
  }, [historial, filtros]);

  const aplicarFiltros = () => {
    let filtrado = [...historial];

    if (filtros.pedidoId) {
      filtrado = filtrado.filter(h => 
        h.pedido?.id?.toString().includes(filtros.pedidoId)
      );
    }

    if (filtros.tipoCambio) {
      filtrado = filtrado.filter(h => 
        h.tipoCambio?.toLowerCase().includes(filtros.tipoCambio.toLowerCase())
      );
    }

    if (filtros.usuario) {
      filtrado = filtrado.filter(h => 
        h.usuario?.nombreUsuario?.toLowerCase().includes(filtros.usuario.toLowerCase())
      );
    }

    if (filtros.fechaDesde) {
      const fechaDesde = new Date(filtros.fechaDesde);
      filtrado = filtrado.filter(h => 
        new Date(h.fechaCambio) >= fechaDesde
      );
    }

    if (filtros.fechaHasta) {
      const fechaHasta = new Date(filtros.fechaHasta);
      fechaHasta.setHours(23, 59, 59, 999);
      filtrado = filtrado.filter(h => 
        new Date(h.fechaCambio) <= fechaHasta
      );
    }

    setHistorialFiltrado(filtrado);
  };

  const handleFiltroChange = (e) => {
    const { name, value } = e.target;
    setFiltros(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const limpiarFiltros = () => {
    setFiltros({
      pedidoId: '',
      tipoCambio: '',
      usuario: '',
      fechaDesde: '',
      fechaHasta: ''
    });
  };

  const getTipoCambioIcon = () => {
    return { icon: 'bi-arrow-repeat', color: '#007bff' };
  };

  const formatearFecha = (fecha) => {
    return new Date(fecha).toLocaleString('es-ES', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <>
        <div className="container py-4" style={{ minHeight: 'calc(100vh - 120px)' }}>
          <h3 className="fw-bold" style={{ fontSize: '30px' }}>
            <i className="bi bi-clock-history me-2" style={{ color: '#cca9bd' }}></i>
            Historial de pedidos
          </h3>
          <div className="text-center mt-5">
            <div className="spinner-border text-primary" role="status" />
            <p className="mt-3">Cargando historial...</p>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  if (error) {
    return (
      <>
        <div className="container py-4">
          <div className="alert alert-danger">
            <i className="bi bi-exclamation-triangle me-2"></i>
            {error}
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
            <i className="bi bi-clock-history me-2" style={{ color: '#cca9bd' }}></i>
            Historial de pedidos
          </h3>
          <div className="text-muted">
            <i className="bi bi-info-circle me-1"></i>
            Mostrando {historialFiltrado.length} de {historial.length} registros
          </div>
        </div>

        <div className="card shadow-sm mb-4">
          <div className="card-header bg-light">
            <h5 className="mb-0">
              <i className="bi bi-funnel me-2" style={{ color: '#6c757d' }}></i>
              Filtros de búsqueda
            </h5>
          </div>
          <div className="card-body">
            <div className="row g-3 mb-3">
              <div className="col-md-4">
                <label className="form-label fw-semibold">
                  <i className="bi bi-hash me-1" style={{ color: '#007bff' }}></i>
                  ID pedido
                </label>
                <input
                  type="text"
                  name="pedidoId"
                  value={filtros.pedidoId}
                  onChange={handleFiltroChange}
                  className="form-control"
                  placeholder="Buscar por ID"
                />
              </div>
              <div className="col-md-4">
                <label className="form-label fw-semibold">
                  <i className="bi bi-tag me-1" style={{ color: '#4b3621' }}></i>
                  Tipo de cambio
                </label>
                <input
                  type="text"
                  name="tipoCambio"
                  value={filtros.tipoCambio}
                  onChange={handleFiltroChange}
                  className="form-control"
                  placeholder="Estado, Asignación, Mensajero, etc."
                />
              </div>
              <div className="col-md-4">
                <label className="form-label fw-semibold">
                  <i className="bi bi-person me-1" style={{ color: '#6f42c1' }}></i>
                  Usuario
                </label>
                <input
                  type="text"
                  name="usuario"
                  value={filtros.usuario}
                  onChange={handleFiltroChange}
                  className="form-control"
                  placeholder="Buscar por nombre de usuario"
                />
              </div>
            </div>
            
            <div className="row g-3 mb-3">
              <div className="col-md-4">
                <label className="form-label fw-semibold">
                  <i className="bi bi-calendar-check me-1" style={{ color: '#28a745' }}></i>
                  Desde
                </label>
                <input
                  type="date"
                  name="fechaDesde"
                  value={filtros.fechaDesde}
                  onChange={handleFiltroChange}
                  className="form-control"
                />
              </div>
              <div className="col-md-4">
                <label className="form-label fw-semibold">
                  <i className="bi bi-calendar-check me-1" style={{ color: '#ffa420' }}></i>
                  Hasta
                </label>
                <input
                  type="date"
                  name="fechaHasta"
                  value={filtros.fechaHasta}
                  onChange={handleFiltroChange}
                  className="form-control"
                />
              </div>
              <div className="col-md-4 d-flex flex-column justify-content-end align-items-end">
                                {(filtros.pedidoId || filtros.tipoCambio || filtros.usuario || filtros.fechaDesde || filtros.fechaHasta) && (
                  <button
                    onClick={limpiarFiltros}
                    className="btn btn-outline-secondary"
                  >
                    <i className="bi bi-x-circle me-1"></i>
                    Limpiar filtros
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {historialFiltrado.length === 0 ? (
          <div className="text-center py-5">
            <i className="bi bi-inbox" style={{ fontSize: '4rem', color: '#dee2e6' }}></i>
            <h4 className="text-muted mt-3">
              {historial.length === 0 ? 'No hay cambios registrados' : 'No se encontraron resultados'}
            </h4>
            <p className="text-muted">
              {historial.length === 0 
                ? 'Aún no se han registrado cambios en los pedidos.' 
                : 'Intenta ajustar los filtros de búsqueda.'
              }
            </p>
          </div>
        ) : (
          <div className="row row-cols-1 row-cols-md-2 row-cols-xl-3 g-4">
            {historialFiltrado.map((h) => {
              const tipoInfo = getTipoCambioIcon();
              return (
                <div className="col" key={h.id}>
                  <div className="card h-100 shadow-sm border-0">
                    <div className="card-body">
                     <div className="d-flex justify-content-between align-items-center mb-3">
                      <div className="d-flex align-items-center">
                        <i
                          className={`${tipoInfo.icon} me-2`}
                          style={{ fontSize: '1.5rem', color: "#cca9bd" }}
                        ></i>
                        <div>
                          <h6 className="mb-0 fw-bold">{h.tipoCambio}</h6>
                          <small className="text-muted">Pedido #{h.pedido?.id ?? 'N/A'}</small>
                        </div>
                      </div>

                      <div className="text-muted small d-flex align-items-center" style={{ gap: '0.5rem' }}>
                        <i className="bi bi-calendar-event" style={{ color: '#28a745' }}></i>
                        <span>{formatearFecha(h.fechaCambio).split(' ')[0].replace(',', '')}</span>
                        <i className="bi bi-clock" style={{ color: '#6c757d' }}></i>
                        <span>{formatearFecha(h.fechaCambio).split(' ')[1]}</span>
                      </div>
                    </div>

                      <div className="mb-3">
                        <div className="d-flex align-items-center mb-2">
                          <i className="bi bi-person-badge me-2" style={{ color: '#6f42c1' }}></i>
                          <small className="text-muted">Cambio realizado por:</small>
                        </div>
                        <div className="fw-semibold text-primary">
                          {h.usuario?.nombreUsuario ?? 'N/A'}
                        </div>
                      </div>

                      <div className="border-top pt-3">
                        <div className="d-flex align-items-center mb-2">
                          <i className="bi bi-arrow-left-right me-2" style={{ color: '#6c757d' }}></i>
                          <small className="text-muted">Cambio realizado:</small>
                        </div>
                        <div className="change-display">
                          {h.valorAnterior != null ? (
                            <div className="d-flex flex-column gap-1">
                              <div className="d-flex align-items-center">
                                <span className="badge bg-danger bg-opacity-10 text-danger me-2">
                                  <i className="bi bi-dash-circle me-1"></i>
                                  Anterior
                                </span>
                                <span className="text-decoration-line-through text-muted">
                                  {h.valorAnterior}
                                </span>
                              </div>
                              <div className="d-flex align-items-center">
                                <span className="badge bg-success bg-opacity-10 text-success me-2">
                                  <i className="bi bi-check-circle me-1"></i>
                                  Nuevo
                                </span>
                                <span className="fw-bold text-success">
                                  {h.valorNuevo}
                                </span>
                              </div>
                            </div>
                          ) : (
                            <div className="d-flex align-items-center">
                              <span className="badge bg-primary bg-opacity-10 text-primary me-2">
                                <i className="bi bi-plus-circle me-1"></i>
                                Valor
                              </span>
                              <span className="fw-bold text-primary">
                                {h.valorNuevo ?? '-'}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
      <Footer />
    </>
  );
}