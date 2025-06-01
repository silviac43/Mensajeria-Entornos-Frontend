import { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import Footer from '../../components/Footer.jsx';

const ROLES = [
  'admin_mensajeria',
  'operador',
  'mensajero'
];

const rolNombre = {
  admin_mensajeria: 'Administrador',
  operador: 'Operador',
  mensajero: 'Mensajero'
};

const rolImagen = {
  admin_mensajeria: '/src/images/admin.png',
  operador: '/src/images/operador.jpg',
  mensajero: '/src/images/mensajero.png'
};

export default function AdminUsuarios() {
  const [usuarios, setUsuarios] = useState([]);
  const [empresas, setEmpresas] = useState([]);
  const [formVisible, setFormVisible] = useState(false);
  const [editingUsuario, setEditingUsuario] = useState(null);
  const [errores, setErrores] = useState({});
  const [loading, setLoading] = useState(true);
  const [filtroNombre, setFiltroNombre] = useState('');
  const [filtroEmpresa, setFiltroEmpresa] = useState('');
  const [filtroRol, setFiltroRol] = useState(''); 
  const formRef = useRef(null);

  const token = localStorage.getItem('token');
  const headers = {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json'
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  const [usuarioActualId, setUsuarioActualId] = useState(null);

  const usuariosFiltrados = usuarios.filter(usuario => {
    const coincideNombre = usuario.nombreUsuario.toLowerCase().includes(filtroNombre.toLowerCase()) ||
                          usuario.email.toLowerCase().includes(filtroNombre.toLowerCase());
    
    const coincideEmpresa = filtroEmpresa === '' || 
                           (usuario.empresaMensajeria?.id && 
                            usuario.empresaMensajeria.id.toString() === filtroEmpresa);
    
    const coincideRol = filtroRol === '' || usuario.rol === filtroRol;
    
    return coincideNombre && coincideEmpresa && coincideRol;
  });

  const cargarDatos = async () => {
    setLoading(true);
    try {
      const [usuariosRes, empresasRes, meRes] = await Promise.all([
        axios.get('http://localhost:8080/admin/users', { headers }),
        axios.get('http://localhost:8080/api/empresas', { headers }),
        axios.get('http://localhost:8080/auth/me', { headers }),
      ]);

      setUsuarioActualId(meRes.data.id); 

      const usuariosFiltrados = usuariosRes.data.filter(
        usuario => usuario.id !== meRes.data.id
      );
      setUsuarios(usuariosFiltrados);

      if (empresasRes.data.status === 'success') {
        setEmpresas(empresasRes.data.data);
      } else {
        console.error('Error al cargar empresas:', empresasRes.data);
      }
    } catch (error) {
      console.error('Error al cargar datos:', error);
    } finally {
      setLoading(false);
    }
  };

  const validarCampo = (name, value) => {
    let error = '';
    if (!value || !value.toString().trim()) {
      error = 'Este campo es obligatorio';
    } else {
      if (name === 'email') {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
          error = 'Email no es válido';
        }
      }
      if (name === 'nombreUsuario') {
        if (value.length < 3) {
          error = 'El nombre de usuario debe tener al menos 3 caracteres';
        }
      }
    }
    return error;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    if (name === 'empresaMensajeria') {
      setEditingUsuario(prev => ({
        ...prev,
        empresaMensajeria: { id: Number(value) }
      }));
      setErrores(prev => ({
        ...prev,
        empresaMensajeria: value ? '' : 'Debe seleccionar una empresa'
      }));
    } else if (name === 'rol') {
      setEditingUsuario(prev => ({ ...prev, rol: value }));
      setErrores(prev => ({
        ...prev,
        rol: value ? '' : 'Debe seleccionar un rol'
      }));
    } else {
      setEditingUsuario(prev => ({ ...prev, [name]: value }));
      const errorCampo = validarCampo(name, value);
      setErrores(prev => ({ ...prev, [name]: errorCampo }));
    }
  };

  const validarFormulario = () => {
    const erroresValidacion = {};
    ['email', 'nombreUsuario', 'rol', 'empresaMensajeria'].forEach(campo => {
      let valor;
      if (campo === 'empresaMensajeria') {
        valor = editingUsuario?.empresaMensajeria?.id;
      } else {
        valor = editingUsuario?.[campo];
      }
      const error = validarCampo(campo, valor);
      if (error) erroresValidacion[campo] = error;
    });
    setErrores(erroresValidacion);
    return Object.keys(erroresValidacion).length === 0;
  };

  const handleEditar = (usuario) => {
    const usuarioSinPass = { ...usuario };
    delete usuarioSinPass.password;
    setEditingUsuario(usuarioSinPass);
    setFormVisible(true);
    setErrores({});
    setTimeout(() => {
      formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  const handleEliminar = (id) => {
    if (confirm('¿Eliminar usuario?')) {
      axios.delete(`http://localhost:8080/admin/users/${id}`, { headers })
        .then(() => {
          cargarDatos();
        })
        .catch(err => console.error('Error al eliminar usuario:', err));
    }
  };

  const handleGuardar = async (e) => {
    e.preventDefault();
    if (!validarFormulario()) return;

    try {
      let usuarioEnviar = { ...editingUsuario };

      if (usuarioEnviar.empresaMensajeria && typeof usuarioEnviar.empresaMensajeria === 'object') {
        usuarioEnviar.empresaMensajeria = { id: usuarioEnviar.empresaMensajeria.id };
      }

      const url = usuarioEnviar.id
        ? `http://localhost:8080/admin/users/${usuarioEnviar.id}`
        : 'http://localhost:8080/admin/users';

      const method = usuarioEnviar.id ? axios.put : axios.post;

      await method(url, usuarioEnviar, { headers });

      setFormVisible(false);
      setEditingUsuario(null);
      setErrores({});

      if (usuarioEnviar.id) {
        alert('Usuario actualizado correctamente.');
      } else {
        alert('Usuario creado correctamente. La contraseña fue enviada al correo registrado.');
      }

      cargarDatos();
    } catch (error) {
      console.error('Error al guardar usuario:', error);
      alert(`Error al guardar usuario: ${error.response?.data?.message || error.message}`);
    }
  };

  const handleResetPassword = async (id) => {
    if (confirm('¿Restablecer contraseña? Se generará una contraseña nueva y se enviará al correo.')) {
      try {
        await axios.put(`http://localhost:8080/admin/users/reset-password/${id}`, {}, { headers });
        alert('Contraseña restablecida y enviada por correo.');
      } catch (error) {
        console.error('Error al restablecer contraseña:', error);
        alert('Error al restablecer contraseña.');
      }
    }
  };

  const limpiarFiltros = () => {
    setFiltroNombre('');
    setFiltroEmpresa('');
    setFiltroRol('');
  };

  if (loading) {
    return (
      <>
      <div className="container py-4">
        <h3 className="fw-bold" style={{ fontSize: '30px' }}>
          <i className="bi bi-people me-2" style={{ color: '#6f42c1' }}></i>
          Administrar usuarios
        </h3>
        <div className="text-center mt-5">
          <div className="spinner-border text-primary" role="status" />
          <p className="mt-3">Cargando usuarios...</p>
        </div>
      </div>
      <Footer />
      </>
    );
  }

  return (
    <>
    <div className="container py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h3 className="fw-bold" style={{ fontSize: '30px' }}>
          <i className="bi bi-people me-2" style={{ color: '#6f42c1' }}></i>
          Administrar usuarios
        </h3>
        <button
          onClick={() => {
            setFormVisible(true);
            setEditingUsuario({
              nombreUsuario: '',
              email: '',
              rol: '',
              empresaMensajeria: { id: '' }
            });
            setErrores({});
          }}
          className="btn btn-success"
        >
          <i className="bi bi-plus-lg me-2"></i>
          Nuevo usuario
        </button>
      </div>

      <div className="mb-4">
        <div className="row mb-3">
          <div className="col-md-3">
            <div className="card shadow-sm">
              <div className="card-body">
                <label className="form-label fw-semibold">
                  <i className="bi bi-search me-2" style={{ color: '#6c757d' }}></i>
                  Buscar usuario
                </label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Buscar por nombre o email"
                  value={filtroNombre}
                  onChange={(e) => setFiltroNombre(e.target.value)}
                />
              </div>
            </div>
          </div>
          <div className="col-md-3">
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
          <div className="col-md-3">
            <div className="card shadow-sm">
              <div className="card-body">
                <label className="form-label fw-semibold">
                  <i className="bi bi-person-badge me-2" style={{ color: '#6c757d' }}></i>
                  Filtrar por rol
                </label>
                <select
                  value={filtroRol}
                  onChange={(e) => setFiltroRol(e.target.value)}
                  className="form-select"
                >
                  <option value="">Todos los roles</option>
                  {ROLES.map(rol => (
                    <option key={rol} value={rol}>{rolNombre[rol]}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
          <div className="col-md-3">
          </div>
        </div>
        
        <div className="row">
          <div className="col-md-3">
            {(filtroNombre || filtroEmpresa || filtroRol) && (
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
              Mostrando {usuariosFiltrados.length} de {usuarios.length} usuarios
            </div>
          </div>
        </div>
      </div>

      {formVisible && (
        <div ref={formRef} className="card shadow-sm mb-4 mx-auto" style={{ maxWidth: '600px' }}>
          <div className="card-header bg-primary text-white">
            <i className="bi bi-person-plus me-2"></i>
            {editingUsuario?.id ? 'Editar usuario' : 'Nuevo usuario'}
          </div>
          <div className="card-body">
            <form onSubmit={handleGuardar}>
              <div className="row">
                <div className="col-md-6 mb-3">
                  <label className="form-label">
                    <i className="bi bi-person me-1" style={{ color: '#6f42c1' }}></i>
                    Nombre de usuario
                  </label>
                  <input
                    type="text"
                    name="nombreUsuario"
                    value={editingUsuario?.nombreUsuario || ''}
                    onChange={handleInputChange}
                    className={`form-control ${errores.nombreUsuario ? 'is-invalid' : ''}`}
                    placeholder="Nombre de usuario"
                  />
                  {errores.nombreUsuario && (
                    <div className="invalid-feedback">{errores.nombreUsuario}</div>
                  )}
                </div>

                <div className="col-md-6 mb-3">
                  <label className="form-label">
                    <i className="bi bi-envelope me-1" style={{ color: '#007bff' }}></i>
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={editingUsuario?.email || ''}
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
                    <i className="bi bi-award-fill" style={{ color: '#ff0080' }}></i>
                    Rol
                  </label>
                  <select
                    name="rol"
                    value={editingUsuario?.rol || ''}
                    onChange={handleInputChange}
                    className={`form-select ${errores.rol ? 'is-invalid' : ''}`}
                  >
                    <option value="">Seleccionar rol</option>
                    {ROLES.map(rol => (
                      <option key={rol} value={rol}>{rolNombre[rol]}</option>
                    ))}
                  </select>
                  {errores.rol && (
                    <div className="invalid-feedback">{errores.rol}</div>
                  )}
                </div>

                <div className="col-md-6 mb-3">
                  <label className="form-label">
                    <i className="bi bi-buildings me-2" style={{ color: '#ff6600' }}></i>
                    Empresa
                  </label>
                  <select
                    name="empresaMensajeria"
                    value={editingUsuario?.empresaMensajeria?.id || ''}
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
                    setEditingUsuario(null);
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

      {usuariosFiltrados.length === 0 ? (
        <div className="text-center py-5">
          <i className="bi bi-inbox" style={{ fontSize: '4rem', color: '#dee2e6' }}></i>
          <h4 className="text-muted mt-3">
            {usuarios.length === 0 ? 'No hay usuarios registrados' : 'No se encontraron usuarios'}
          </h4>
          <p className="text-muted">
            {usuarios.length === 0 
              ? 'Aún no se han registrado usuarios en el sistema.' 
              : 'Intenta ajustar los filtros de búsqueda. No se encontraron usuarios con los criterios seleccionados.'
            }
          </p>
        </div>
      ) : (
        <div className="row row-cols-1 row-cols-md-2 row-cols-lg-4 g-4">
          {usuariosFiltrados.map(usuario => (
            <div className="col" key={usuario.id}>
              <div className="card h-100 shadow-sm">
                <div className="card-body text-center">
                  <img
                    src={rolImagen[usuario.rol] || '/src/images/default.png'}
                    alt={rolNombre[usuario.rol] || 'Usuario'}
                    className="rounded-circle mb-3"
                    style={{ width: '80px', height: '80px', objectFit: 'cover' , border: '3px solid #ccc',}}
                    onError={(e) => {
                      e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAiIGhlaWdodD0iODAiIHZpZXdCb3g9IjAgMCA4MCA4MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iNDAiIGN5PSI0MCIgcj0iNDAiIGZpbGw9IiNmMGYwZjAiLz4KPHN2ZyB4PSIyMCIgeT0iMjAiIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSIjOTk5Ij4KPHA+VXN1YXJpbzwvcD4KPHN2Zz4=';
                    }}
                  />
                  <h5 className="card-title mb-2">{usuario.nombreUsuario}</h5>
                  <div className="mb-2 text-start">
                    <i className="bi bi-envelope me-1" style={{ color: '#007bff' }}></i>
                    Email:
                    <div className="fw-semibold text-primary">{usuario.email}</div>
                  </div>

                  <div className="mb-2 text-start">
                    <i className="bi bi-award-fill" style={{ color: '#ff0080' }}></i>
                    Rol:
                    <div>{rolNombre[usuario.rol]}</div>
                  </div>

                  <div className="mb-2 text-start">
                    <i className="bi-buildings me-2" style={{ color: '#ff6600' }}></i>
                    Empresa:
                    <div>{usuario.empresaMensajeria?.nombre || 'N/A'}</div>
                  </div>

                  <div className="mb-2 text-start">
                    <i className="bi bi-calendar-event me-1" style={{ color: '#28a745' }}></i>
                     Se unió el día:
                    <div>{new Date(usuario.fechaCreacion).toLocaleDateString('es-ES')}</div>
                  </div>
                    
                </div>
                <div className="card-footer d-flex justify-content-center gap-1 bg-light flex-wrap">
                  <button
                    className="btn btn-sm btn-outline-primary"
                    onClick={() => handleEditar(usuario)}
                  >
                    <i className="bi bi-pencil-square me-1"></i>Editar
                  </button>
                  <button
                    className="btn btn-sm btn-outline-danger"
                    onClick={() => handleEliminar(usuario.id)}
                  >
                    <i className="bi bi-trash-fill me-1"></i>Eliminar
                  </button>
                  <button
                    className="btn btn-sm btn-outline-success"
                    onClick={() => handleResetPassword(usuario.id)}
                  >
                    <i className="bi bi-key me-1"></i>Reset
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
    <Footer />
    </>
  );
}