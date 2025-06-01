import { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import Footer  from '../../components/Footer.jsx';

export default function AdminEmpresas() {
  const [empresas, setEmpresas] = useState([]);
  const [formVisible, setFormVisible] = useState(false);
  const [editingEmpresa, setEditingEmpresa] = useState(null);
  const [errores, setErrores] = useState({});
  const [loading, setLoading] = useState(true);
  const [filtroNombre, setFiltroNombre] = useState('');
  const formRef = useRef(null);

  const token = localStorage.getItem('token');
  const headers = {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  };

  useEffect(() => {
    cargarEmpresas();
  }, []);

  const empresasFiltradas = empresas.filter(empresa =>
    empresa.nombre.toLowerCase().includes(filtroNombre.toLowerCase())
  );

  const cargarEmpresas = async () => {
    setLoading(true);
    try {
      const res = await axios.get('http://localhost:8080/api/empresas', { headers });
      if (res.data.status === 'success') {
        setEmpresas(res.data.data);
      }
    } catch (error) {
      console.error('Error al cargar empresas:', error);
    } finally {
      setLoading(false);
    }
  };

  const validarCampo = (name, value) => {
    if (!value.trim()) return 'Este campo es obligatorio';
    if (name === 'nombre' && value.length > 100)
      return 'El nombre no puede superar los 100 caracteres';
    return '';
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditingEmpresa((prev) => ({ ...prev, [name]: value }));
    setErrores((prev) => ({ ...prev, [name]: validarCampo(name, value) }));
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
    setTimeout(() => {
      formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  const handleEliminar = (id) => {
    if (confirm('¿Eliminar empresa?')) {
      axios
        .delete(`http://localhost:8080/api/empresas/${id}`, { headers })
        .then(() => cargarEmpresas())
        .catch((err) => console.error('Error al eliminar empresa:', err));
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

      if (response.data.status === 'success') {
        setFormVisible(false);
        setEditingEmpresa(null);
        setErrores({});
        cargarEmpresas();
      } else {
        alert(`Error al guardar empresa: ${response.data.message}`);
      }
    } catch (err) {
      alert(`Error al guardar empresa: ${err.response?.data?.message || err.message}`);
    }
  };

  const limpiarFiltros = () => {
    setFiltroNombre('');
  };

 return (
  <>
    <div style={{ minHeight: '60vh', display: 'flex', flexDirection: 'column' }}>
      <div className="container py-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h3 className="fw-bold" style={{ fontSize: '30px' }}>
            <i className="bi bi-buildings me-2" style={{ color: '#ff6600' }}></i>
            Empresas registradas
          </h3>
          <button
            onClick={() => {
              setFormVisible(true);
              setEditingEmpresa({ nombre: '' });
              setErrores({});
            }}
            className="btn btn-success"
          >
            <i className="bi bi-plus-lg me-2"></i>
            Nueva empresa
          </button>
        </div>

        <div className="mb-4">
          <div className="row mb-3">
            <div className="col-md-4">
              <div className="card shadow-sm">
                <div className="card-body">
                  <label className="form-label fw-semibold">
                    <i className="bi bi-search me-2" style={{ color: '#6c757d' }}></i>
                    Buscar empresa
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Buscar por nombre"
                    value={filtroNombre}
                    onChange={(e) => setFiltroNombre(e.target.value)}
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
              {filtroNombre && (
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
                Mostrando {empresasFiltradas.length} de {empresas.length} empresas
              </div>
            </div>
          </div>
        </div>


        {formVisible && (
          <div ref={formRef} className="card shadow-sm mb-4 mx-auto" style={{ maxWidth: '500px' }}>
            <div className="card-header bg-primary text-white">
              <i className="bi bi-pencil-square me-2"></i>
              {editingEmpresa?.id ? 'Editar empresa' : 'Nueva empresa'}
            </div>
            <div className="card-body">
              <form onSubmit={handleGuardar}>
                <div className="mb-3">
                  <label className="form-label">
                    <i className="bi bi-buildings me-2" style={{ color: '#ff6600' }}></i>
                    Nombre de la empresa
                  </label>
                  <input
                    type="text"
                    name="nombre"
                    value={editingEmpresa?.nombre || ''}
                    onChange={handleInputChange}
                    className={`form-control ${errores.nombre ? 'is-invalid' : ''}`}
                    placeholder="Nombre de la empresa"
                  />
                  {errores.nombre && (
                    <div className="invalid-feedback">{errores.nombre}</div>
                  )}
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
                      setEditingEmpresa(null);
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

        {loading ? (
          <div className="text-center mt-5">
            <div className="spinner-border text-primary" role="status" />
            <p className="mt-3">Cargando empresas...</p>
          </div>
        ) : empresasFiltradas.length === 0 ? (
          <div className="text-center py-5">
            <i className="bi bi-inbox" style={{ fontSize: '4rem', color: '#dee2e6' }}></i>
            <h4 className="text-muted mt-3">
              {empresas.length === 0 ? 'No hay empresas registradas' : 'No se encontraron resultados'}
            </h4>
            <p className="text-muted">
              {empresas.length === 0 
                ? 'Aún no se han registrado empresas en el sistema.' 
                : `Intenta ajustar el filtro de búsqueda. No se encontraron empresas con "${filtroNombre}".`
              }
            </p>
          </div>
        ) : (
          <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
            {empresasFiltradas.map((empresa) => (
              <div className="col" key={empresa.id}>
                <div className="card h-100 shadow-sm">
                  <div className="card-body text-center">
                    <i className="bi bi-buildings display-4 mb-3" style={{ color: '#ff6600' }}></i>
                    <h5 className="card-title">{empresa.nombre}</h5>
                  </div>
                  <div className="card-footer d-flex justify-content-center gap-2 bg-light">
                    <button
                      className="btn btn-sm btn-outline-primary"
                      onClick={() => handleEditar(empresa)}
                    >
                      <i className="bi bi-pencil-square me-1"></i>Editar
                    </button>
                    <button
                      className="btn btn-sm btn-outline-danger"
                      onClick={() => handleEliminar(empresa.id)}
                    >
                      <i className="bi bi-trash-fill me-1"></i>Eliminar
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
    <Footer />
  </>
);
}