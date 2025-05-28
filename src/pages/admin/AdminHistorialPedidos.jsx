import { useEffect, useState } from 'react';
import axios from 'axios';

export default function HistorialPedidos() {
  const [historial, setHistorial] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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
      } catch (err) {
        console.error('Error al obtener historial:', err);
        setError('Error al conectar con el servidor');
      } finally {
        setLoading(false);
      }
    };

    fetchHistorial();
  }, []);

  return (
    <div className="p-4 bg-white rounded-xl shadow-md max-w-6xl mx-auto mt-6">
      <h2 className="text-2xl font-bold mb-4">Historial de Todos los Pedidos</h2>

      {loading ? (
        <div className="text-center py-8 text-lg">Cargando historial...</div>
      ) : error ? (
        <div className="text-red-600 py-4">{error}</div>
      ) : historial.length === 0 ? (
        <div className="text-gray-600 py-4">No hay cambios registrados.</div>
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
