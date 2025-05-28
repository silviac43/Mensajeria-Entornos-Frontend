import React, { useEffect, useState } from 'react';
import axios from 'axios';

const OperadorMensajeros = () => {
  const [mensajeros, setMensajeros] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [empresaOperador, setEmpresaOperador] = useState(null);

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

        const empresaId = operador.empresaMensajeria.id;
        setEmpresaOperador({ id: empresaId });
        await cargarMensajeros(empresaId);
      } catch (err) {
        setError('Error al obtener datos del operador');
        setLoading(false);
      }
    };

    cargarDatos();
  }, []);

  if (loading) {
    return <div className="p-4">Cargando mensajeros...</div>;
  }

  if (error) {
    return (
      <div className="p-4 text-red-600">
        <strong>{error}</strong>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Mensajeros de la Empresa</h2>
      <table className="w-full border border-gray-300 bg-white rounded shadow">
        <thead className="bg-gray-200">
          <tr>
            <th className="p-2 border">Nombre de Usuario</th>
            <th className="p-2 border">Email</th>
            <th className="p-2 border">Disponible</th>
            <th className="p-2 border">Fecha de Registro</th>
          </tr>
        </thead>
        <tbody>
          {mensajeros.length === 0 ? (
            <tr>
              <td colSpan="4" className="p-4 text-center text-gray-500">
                No hay mensajeros registrados para esta empresa.
              </td>
            </tr>
          ) : (
            mensajeros.map((m) => (
              <tr key={m.id} className="text-center border-t hover:bg-gray-50">
                <td className="p-2 border">{m.nombreUsuario}</td>
                <td className="p-2 border">{m.email}</td>
                <td className="p-2 border">{m.disponibilidad ? 'Sí' : 'No'}</td>
                <td className="p-2 border">{new Date(m.fechaCreacion).toLocaleString()}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default OperadorMensajeros;
