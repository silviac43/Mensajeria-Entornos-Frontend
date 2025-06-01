import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Footer from '../../components/Footer';
import mensajeroImg from '../../images/mensajero.png';

const OperadorMensajeros = () => {
  const [mensajeros, setMensajeros] = useState([]);
  const [mensajerosFiltrados, setMensajerosFiltrados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [operadorData, setOperadorData] = useState(null);
  const [filtros, setFiltros] = useState({
    nombreUsuario: '',
    email: '',
    disponibilidad: ''
  });

  const token = localStorage.getItem('token');
  const headers = {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  };

  const obtenerInformacionOperador = async () => {
    try {
      if (!token) {
        throw new Error('No hay token de autenticación');
      }

      const response = await axios.get('http://localhost:8080/auth/me', {
        headers,
      });

      return response.data;
    } catch (error) {
      console.error('Error al obtener información del operador:', error);
      throw error;
    }
  };

  const cargarMensajeros = async (empresaId) => {
    try {
      const response = await axios.get(
        `http://localhost:8080/api/mensajeros/empresa/${empresaId}`,
        { headers }
      );

      if (response.status === 200 && response.data.data) {
        setMensajeros(response.data.data);
        setMensajerosFiltrados(response.data.data);
        setError('');
      } else {
        setError('Error al cargar los mensajeros: ' + (response.data.message || 'Error desconocido'));
      }
    } catch (err) {
      console.error('Error al cargar mensajeros:', err);
      setError('Error al cargar los mensajeros');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const cargarDatos = async () => {
      setLoading(true);
      try {
        const operador = await obtenerInformacionOperador();
        if (!operador?.empresaMensajeria?.id) {
          setError('No se pudo obtener la empresa del operador');
          setLoading(false);
          return;
        }

        setOperadorData(operador);
        const empresaId = operador.empresaMensajeria.id;
        await cargarMensajeros(empresaId);
      } catch (err) {
        setError('Error al obtener datos del operador');
        setLoading(false);
      }
    };

    cargarDatos();
  }, []);

  useEffect(() => {
    aplicarFiltros();
  }, [mensajeros, filtros]);

  const aplicarFiltros = () => {
    let filtrado = [...mensajeros];

    if (filtros.nombreUsuario) {
      filtrado = filtrado.filter(m => 
        m.nombreUsuario?.toLowerCase().includes(filtros.nombreUsuario.toLowerCase())
      );
    }

    if (filtros.email) {
      filtrado = filtrado.filter(m => 
        m.email?.toLowerCase().includes(filtros.email.toLowerCase())
      );
    }

    if (filtros.disponibilidad !== '') {
      const disponible = filtros.disponibilidad === 'true';
      filtrado = filtrado.filter(m => m.disponibilidad === disponible);
    }

    setMensajerosFiltrados(filtrado);
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
      nombreUsuario: '',
      email: '',
      disponibilidad: ''
    });
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

  const getDisponibilidadBadge = (disponible) => {
    return disponible ? {
      class: 'bg-success bg-opacity-10 text-success',
      icon: 'bi-check-circle',
      text: 'Disponible'
    } : {
      class: 'bg-danger bg-opacity-10 text-danger',
      icon: 'bi-x-circle',
      text: 'No disponible'
    };
  };

  if (loading) {
    return (
      <>
        <div className="container py-4" style={{ minHeight: 'calc(100vh - 120px)' }}>
          <h3 className="fw-bold" style={{ fontSize: '30px' }}>
            <i className="bi bi-people me-2" style={{ color: '#6f42c1' }}></i>
            Mensajeros
          </h3>
          <p className="text-muted mb-0 fw-semibold">
            <i className="bi bi-buildings me-1" style={{ color: '#ff6600' }}></i>
            Empresa: <span className="fw-semibold">Cargando...</span>
          </p>
          <div className="text-center mt-5">
            <div className="spinner-border text-primary" role="status" />
            <p className="mt-3">Cargando mensajeros...</p>
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
        <div className="d-flex justify-content-between align-items-start mb-4">
          <div>
            <h3 className="fw-bold mb-2" style={{ fontSize: '30px' }}>
              <i className="bi bi-people me-2" style={{ color: '#6f42c1' }}></i>
              Mensajeros
            </h3>
            <p className="text-muted mb-0 fw-semibold">
              <i className="bi bi-buildings me-1" style={{ color: '#ff6600' }}></i>
              Empresa: <span className="fw-semibold">{operadorData?.empresaMensajeria?.nombre || 'Cargando...'}</span>
            </p>
          </div>
          <div className="text-muted">
            <i className="bi bi-info-circle me-1"></i>
            Mostrando {mensajerosFiltrados.length} de {mensajeros.length} mensajeros
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
            <div className="row g-3">
              <div className="col-md-3">
                <label className="form-label fw-semibold">
                  <i className="bi bi-person me-1" style={{ color: '#6f42c1' }}></i>
                  Nombre de usuario
                </label>
                <input
                  type="text"
                  name="nombreUsuario"
                  value={filtros.nombreUsuario}
                  onChange={handleFiltroChange}
                  className="form-control"
                  placeholder="Buscar por nombre de usuario"
                />
              </div>
              <div className="col-md-3">
                <label className="form-label fw-semibold">
                  <i className="bi bi-envelope me-1" style={{ color: '#007bff' }}></i>
                  Email
                </label>
                <input
                  type="text"
                  name="email"
                  value={filtros.email}
                  onChange={handleFiltroChange}
                  className="form-control"
                  placeholder="Buscar por email"
                />
              </div>
              <div className="col-md-3">
                <label className="form-label fw-semibold">
                  <i className="bi bi-toggle-on me-1" style={{ color: '#28a745' }}></i>
                  Disponibilidad
                </label>
                <select
                  name="disponibilidad"
                  value={filtros.disponibilidad}
                  onChange={handleFiltroChange}
                  className="form-control"
                >
                  <option value="">Todos</option>
                  <option value="true">Disponibles</option>
                  <option value="false">No disponibles</option>
                </select>
              </div>
              {(filtros.nombreUsuario || filtros.email || filtros.disponibilidad) && (
                <div className="col-md-3 d-flex align-items-end">
                  <button
                    onClick={limpiarFiltros}
                    className="btn btn-outline-secondary w-100"
                  >
                    <i className="bi bi-x-circle me-1"></i>
                    Limpiar
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {mensajerosFiltrados.length === 0 ? (
          <div className="text-center py-5">
            <i className="bi bi-inbox" style={{ fontSize: '4rem', color: '#dee2e6' }}></i>
            <h4 className="text-muted mt-3">
              {mensajeros.length === 0 ? 'No hay mensajeros registrados' : 'No se encontraron resultados'}
            </h4>
            <p className="text-muted">
              {mensajeros.length === 0 
                ? 'Aún no hay mensajeros registrados para su empresa.' 
                : `Intenta ajustar el filtro de búsqueda. No se encontraron mensajeros con esos parámetros.`
              }
            </p>
          </div>
        ) : (
          <div className="row row-cols-1 row-cols-md-2 row-cols-xl-3 g-4">
            {mensajerosFiltrados.map((mensajero) => {
              const disponibilidad = getDisponibilidadBadge(mensajero.disponibilidad);
              return (
                <div className="col" key={mensajero.id}>
                  <div className="card h-100 shadow-sm border-0">
                    <div className="card-body">
                      <div className="d-flex justify-content-between align-items-start mb-3">
                        <div className="d-flex align-items-center">
                          <div className="rounded-circle bg-light p-2 me-3" style={{ width: '60px', height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <img 
                              src={mensajeroImg} 
                              alt="Mensajero" 
                              style={{ width: '40px', height: '40px', objectFit: 'contain' }}
                            />
                          </div>
                          <div>
                            <h6 className="mb-0 fw-bold">{mensajero.nombreUsuario}</h6>
                            <small className="text-muted">Mensajero</small>
                          </div>
                        </div>
                        <span className={`badge ${disponibilidad.class}`}>
                          <i className={`${disponibilidad.icon} me-1`}></i>
                          {disponibilidad.text}
                        </span>
                      </div>

                      <div className="mb-3">
                        <div className="d-flex align-items-center mb-2">
                          <i className="bi bi-envelope me-2" style={{ color: '#007bff' }}></i>
                          <small className="text-muted">Email:</small>
                        </div>
                        <div className="fw-semibold text-primary">
                          {mensajero.email}
                        </div>
                      </div>

                      <div className="border-top pt-3">
                        <div className="d-flex align-items-center mb-2">
                          <i className="bi bi-calendar-plus me-2" style={{ color: '#28a745' }}></i>
                          <small className="text-muted">Fecha de registro:</small>
                        </div>
                        <div className="text-muted">
                          <span>{formatearFecha(mensajero.fechaCreacion).split(' ')[0].replace(',', '')}</span>
                        </div>
                      </div>

                      <div className="mt-3 pt-3 border-top">
                        <div className="d-flex justify-content-between align-items-center">
                          <div className="d-flex align-items-center">
                            <i className="bi bi-shield-check me-2" style={{ color: '#20c997' }}></i>
                            <small className="text-muted">ID: {mensajero.id}</small>
                          </div>
                          <div className="d-flex align-items-center">
                            <i className="bi bi-gear me-2" style={{ color: '#6c757d' }}></i>
                            <small className="text-muted">Activo</small>
                          </div>
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
};

export default OperadorMensajeros;