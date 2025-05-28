// src/context/AuthContext.jsx
import { createContext, useContext, useEffect, useState } from 'react';
import { jwtDecode } from 'jwt-decode';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [auth, setAuth] = useState({ user: null, role: null });

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decoded = jwtDecode(token);
        const roles = decoded.authorities || decoded.roles || [];
        const roleNames = roles.map(r => typeof r === 'string' ? r : r.authority || r);
        setAuth({ user: decoded.sub, role: roleNames[0] });
      } catch (err) {
        console.error("Error decoding token:", err);
      }
    }
  }, []);

  const login = (token) => {
    localStorage.setItem('token', token);
    const decoded = jwtDecode(token);
    const roles = decoded.authorities || decoded.roles || [];
    const roleNames = roles.map(r => typeof r === 'string' ? r : r.authority || r);
    setAuth({ user: decoded.sub, role: roleNames[0] });
  };

  const logout = () => {
    localStorage.removeItem('token');
    setAuth({ user: null, role: null });
  };

  return (
    <AuthContext.Provider value={{ auth, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
