// src/pages/Login.jsx
import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

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
      setLoginSuccess(true); // marca que login fue exitoso
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
      } else {
        navigate('/');
      }
    }
  }, [auth, loginSuccess, navigate]);

  return (
    <main className="login-container">
      <h2>Iniciar sesión</h2>
      <form onSubmit={handleSubmit}>
        <label htmlFor="nombreUsuario">Usuario:</label>
        <input id="nombreUsuario" type="text" name="nombreUsuario" onChange={handleChange} required />

        <label htmlFor="password">Contraseña:</label>
        <input id="password" type="password" name="password" onChange={handleChange} required />

        <button type="submit">Entrar</button>
      </form>
    </main>
  );
};

export default Login;
