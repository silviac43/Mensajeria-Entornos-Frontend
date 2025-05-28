import { useEffect, useState } from 'react';
import axios from 'axios';

export default function HistorialPedidosOperador() {
  const [historial, setHistorial] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const token = localStorage.getItem('token');
  const headers = {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  };

  // Función para obtener info del operador, incluyendo la empresa
  const obtenerInformacionOperador = async () => {
    try {
      if (!token) throw new Error('No hay token de autenticación');
      const response = await axios.get('http://localhost:8080/auth/me', { headers });
      return response.data;
    } catch (error) {
      console.error('Error al obtener información del operador:', error);
      throw error;
    }
  };

  // Cargar historial filtrado por empresa
  const cargarHistorialPorEmpresa = async (empresaId) => {
    try {
      const response = await axios.get(
        `http://localhost:8080/api/historialpedido/empresa/${empresaId}`,
        { headers }
      );

      if (response.status === 200 && response.data.data) {
        setHistorial(response.data.data);
        setError('');
      } else {
        setError('Error al cargar el historial: ' + (response.data.message || 'Error desconocido'));
      }
    } catch (err) {
      console.error('Error al cargar historial:', err);
      setError('Error al cargar el historial de pedidos');
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
        await cargarHistorialPorEmpresa(operador.empresaMensajeria.id);
      } catch (err) {
        setError('Error al obtener datos del operador');
        setLoading(false);
      }
    };

    cargarDatos();
  }, []);

  return (
    <div className="p-4 bg-white rounded-xl shadow-md max-w-6xl mx-auto mt-6">
      <h2 className="text-2xl font-bold mb-4">Historial de Pedidos - Mi Empresa</h2>

      {loading ? (
        <div className="text-center py-8 text-lg">Cargando historial...</div>
      ) : error ? (
        <div className="text-red-600 py-4">{error}</div>
      ) : historial.length === 0 ? (
        <div className="text-gray-600 py-4">No hay cambios registrados para su empresa.</div>
      ) : (
        <table className="w-full table-auto border text-left shadow-sm rounded overflow-hidden">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-2">Pedido ID</th>
              <th className="px-4 py-2">Fecha</th>
              <th className="px-4 py-2">Tipo de Cambio</th>
              <th className="px-4 py-2">Usuario</th>
              <th className="px-4 py-2">Cambio</th>
            </tr>
          </thead>
          <tbody>
            {historial.map((h) => (
              <tr key={h.id} className="border-t hover:bg-gray-50 transition">
                <td className="px-4 py-2">{h.pedido?.id ?? 'N/A'}</td>
                <td className="px-4 py-2">{new Date(h.fechaCambio).toLocaleString()}</td>
                <td className="px-4 py-2">{h.tipoCambio}</td>
                <td className="px-4 py-2">{h.usuario?.nombreUsuario ?? 'N/A'}</td>
                <td className="px-4 py-2">
                  {h.valorAnterior != null ? (
                    <>
                      <span className="text-gray-500 line-through mr-2">{h.valorAnterior}</span>
                      <span className="text-green-600 font-semibold">{h.valorNuevo}</span>
                    </>
                  ) : (
                    <span className="text-green-600 font-semibold">{h.valorNuevo ?? '-'}</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
