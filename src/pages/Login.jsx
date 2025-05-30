import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import logo from '../images/logo.png';
import Footer from '../components/Footer.jsx';

const Login = () => {
  const [formData, setFormData] = useState({ nombreUsuario: '', password: '' });
  const [loginSuccess, setLoginSuccess] = useState(false);
  const navigate = useNavigate();
  const { auth, login } = useAuth();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:8080/auth/login', formData);
      const token = response.data.token;
      login(token);
      setLoginSuccess(true);
      alert('Login exitoso');
    } catch (error) {
      console.error('Error al iniciar sesión:', error.response?.data || error.message);
      alert('Credenciales inválidas');
    }
  };

  useEffect(() => {
    if (loginSuccess && auth.user && auth.role) {
      if (auth.role === 'ROLE_admin_mensajeria') {
        navigate('/admin');
      } else if (auth.role === 'ROLE_operador') {
        navigate('/operador');
      } else if (auth.role === 'ROLE_mensajero') {
        navigate('/mensajero');
      }
    }
  }, [loginSuccess, auth, navigate]);

  return (
    <>
      <div className="login-container">
        <div
          style={{
            background: 'white',
            padding: '2rem',
            borderRadius: '1rem',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
            width: '100%',
            maxWidth: '480px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '1.5rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <h2 style={{ margin: 0, fontSize: '2rem', color: 'var(--color-primary-dark)' }}>
              Inicio de sesión
            </h2>
            <img
              src={logo}
              alt="Logo"
              style={{ width: '160px', height: '120px', borderRadius: '50%' }}
            />
          </div>

          <form onSubmit={handleSubmit}>
            <label>
              Usuario:
              <div style={{ position: 'relative', width: '100%' }}>
                <i 
                  className="bi bi-person-fill" 
                  style={{ 
                    position: 'absolute', 
                    left: '15px', 
                    top: '58%', 
                    transform: 'translateY(-50%)', 
                    color: '#8A6642',
                    fontSize: '18px'
                  }}
                ></i>
                <input
                  type="text"
                  name="nombreUsuario"
                  value={formData.nombreUsuario}
                  onChange={handleChange}
                  required
                  placeholder="Nombre de usuario"
                  style={{ 
                    paddingLeft: '45px', 
                    width: '100%',
                    minWidth: '350px',
                    height: '45px'
                  }}
                />
              </div>
            </label>
            <label>
              Contraseña:
              <div style={{ position: 'relative', width: '100%' }}>
                <i 
                  className="bi bi-lock-fill" 
                  style={{ 
                    position: 'absolute', 
                    left: '15px', 
                    top: '58%', 
                    transform: 'translateY(-50%)', 
                    color: '#FFD700',
                    fontSize: '18px'
                  }}
                ></i>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  placeholder="**********************"
                  style={{ 
                    paddingLeft: '45px', 
                    paddingTop: '15px', 
                    width: '100%',
                    minWidth: '350px',
                    height: '45px'
                  }}
                />
              </div>
            </label>
            <button type="submit">Ingresar</button>
          </form>
        </div>
      </div>

      <Footer />
    </>
  );
};

export default Login;