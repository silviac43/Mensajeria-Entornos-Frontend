import { useEffect, useState } from "react";
import axios from "axios";

export default function MensajeroPedidos() {
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const token = localStorage.getItem("token");
  const headers = {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };

  const obtenerInfoMensajero = async () => {
    try {
      const res = await axios.get("http://localhost:8080/auth/me", {
        headers: { Authorization: `Bearer ${token}` },
      });
      return res.data;
    } catch (err) {
      throw err;
    }
  };

  useEffect(() => {
    const cargarPedidos = async () => {
      setLoading(true);
      try {
        const mensajero = await obtenerInfoMensajero();
        const mensajeroId = mensajero.id;

        const res = await axios.get(
          `http://localhost:8080/api/pedidos/mensajero/${mensajeroId}`,
          { headers }
        );

        if (res.data.status === 200) {
          setPedidos(res.data.data);
          setError(null);
        } else {
          setError(res.data.message || "Error desconocido");
        }
      } catch (err) {
        console.error("Error al cargar pedidos:", err);
        setError(err.response?.data?.message || err.message);
      } finally {
        setLoading(false);
      }
    };

    cargarPedidos();
  }, []);

  if (loading) return <p>Cargando pedidos...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div>
      <h2>Pedidos asignados</h2>
      {pedidos.length === 0 ? (
        <p>No hay pedidos asignados.</p>
      ) : (
        <ul>
          {pedidos.map((pedido) => (
            <li key={pedido.id} style={{ marginBottom: "1rem" }}>
              <p><strong>Pedido #{pedido.id}</strong></p>
              <p>Cliente: {pedido.cliente.nombre}</p>
              <p>Dirección de recogida: {pedido.direccionRecogida}</p>
              <p>Teléfono de recogida: {pedido.telefonoRecogida}</p>
              <p>Dirección de entrega: {pedido.direccionEntrega}</p>
              <p>Teléfono de entrega: {pedido.telefonoEntrega}</p>
              <p>Tipo de paquete: {pedido.tipoPaquete}</p>
              <p>Notas: {pedido.notas}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
