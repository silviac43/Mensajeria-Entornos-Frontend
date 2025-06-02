import React, { useEffect, useRef, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const iconoRecogida = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const iconoEntrega = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const obtenerRutaOSRM = async (coordInicio, coordFin) => {
  try {
    const url = `https://router.project-osrm.org/route/v1/driving/${coordInicio.lng},${coordInicio.lat};${coordFin.lng},${coordFin.lat}?overview=full&geometries=geojson`;
    
    const response = await fetch(url);
    const data = await response.json();
    
    if (data.routes && data.routes[0]) {
      const coordinates = data.routes[0].geometry.coordinates;
      const ruta = coordinates.map(coord => [coord[1], coord[0]]); 
      const distancia = data.routes[0].distance;
      const duracion = data.routes[0].duration;
      
      return {
        ruta,
        distancia: Math.round(distancia / 1000 * 100) / 100, 
        duracion: Math.round(duracion / 60), 
        servicio: 'OSRM'
      };
    }
  } catch (error) {
    console.error('Error con OSRM:', error);
  }
  return null;
};

const obtenerRutaReal = async (coordInicio, coordFin) => {
  console.log('Obteniendo ruta real entre puntos...');
  
  let rutaData = await obtenerRutaOSRM(coordInicio, coordFin);
  if (rutaData) {
    console.log('Ruta obtenida con OSRM');
    return rutaData;
  }
    
  console.log('No se pudo obtener ruta de ningún servicio');
  return null;
};

const ComponenteMapaConRuta = ({ coordenadas, pedido}) => {
  const [rutaData, setRutaData] = useState(null);
  const [cargandoRuta, setCargandoRuta] = useState(false);
  const mapRef = useRef();

  useEffect(() => {
    if (coordenadas.recogida && coordenadas.entrega) {
      cargarRuta();
    }
  }, [coordenadas]);

  const cargarRuta = async () => {
    setCargandoRuta(true);
    setRutaData(null);
    
    try {
      const ruta = await obtenerRutaReal(coordenadas.recogida, coordenadas.entrega);
      setRutaData(ruta);
    } catch (error) {
      console.error('Error cargando ruta:', error);
    } finally {
      setCargandoRuta(false);
    }
  };

  const calcularCentroYZoom = () => {
    if (!coordenadas.recogida || !coordenadas.entrega) return { center: [4.6097, -74.0817], zoom: 12 };

    const latRecogida = parseFloat(coordenadas.recogida.lat);
    const lngRecogida = parseFloat(coordenadas.recogida.lng);
    const latEntrega = parseFloat(coordenadas.entrega.lat);
    const lngEntrega = parseFloat(coordenadas.entrega.lng);

    const centerLat = (latRecogida + latEntrega) / 2;
    const centerLng = (lngRecogida + lngEntrega) / 2;

    return { center: [centerLat, centerLng], zoom: 13 };
  };

  const { center, zoom } = calcularCentroYZoom();

  return (
    <div>
      {rutaData && (
        <div className="alert alert-info mb-3">
          <div className="row">
            <div className="col-md-4">
              <i className="bi bi-rulers me-2"></i>
              <strong>Distancia:</strong> {rutaData.distancia} km
            </div>
            <div className="col-md-4">
              <i className="bi bi-clock me-2"></i>
              <strong>Tiempo estimado:</strong> {rutaData.duracion} min
            </div>
            <div className="col-md-4">
              <i className="bi bi-signpost me-2"></i>
              <strong>Servicio:</strong> {rutaData.servicio}
            </div>
          </div>
        </div>
      )}
      
      {cargandoRuta && (
        <div className="text-center mb-3">
          <div className="spinner-border spinner-border-sm text-primary me-2" role="status"></div>
          <span>Calculando ruta real...</span>
        </div>
      )}

      <div style={{ height: '400px', width: '100%' }}>
        <MapContainer
          center={center}
          zoom={zoom}
          style={{ height: '100%', width: '100%' }}
          ref={mapRef}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          
          {coordenadas.recogida && (
            <Marker
              position={[parseFloat(coordenadas.recogida.lat), parseFloat(coordenadas.recogida.lng)]}
              icon={iconoRecogida}
            >
              <Popup>
                <div>
                  <i className="bi bi-geo-alt-fill me-2 text-success"></i>
                  <strong>Punto de Recogida</strong><br />
                  {pedido?.direccionRecogida}
                </div>
              </Popup>
            </Marker>
          )}

          {coordenadas.entrega && (
            <Marker
              position={[parseFloat(coordenadas.entrega.lat), parseFloat(coordenadas.entrega.lng)]}
              icon={iconoEntrega}
            >
              <Popup>
                <div>
                  <i className="bi bi-bullseye me-2 text-danger"></i>
                  <strong>Punto de Entrega</strong><br />
                  {pedido?.direccionEntrega}
                </div>
              </Popup>
            </Marker>
          )}

          {rutaData && rutaData.ruta && (
            <Polyline
              positions={rutaData.ruta}
              color="#2563eb"
              weight={4}
              opacity={0.8}
            />
          )}

          {!rutaData && !cargandoRuta && coordenadas.recogida && coordenadas.entrega && (
            <Polyline
              positions={[
                [parseFloat(coordenadas.recogida.lat), parseFloat(coordenadas.recogida.lng)],
                [parseFloat(coordenadas.entrega.lat), parseFloat(coordenadas.entrega.lng)]
              ]}
              color="#dc2626"
              weight={3}
              opacity={0.6}
              dashArray="10, 10"
            />
          )}
        </MapContainer>
      </div>

      <div className="text-center mt-3">
        <button 
          className="btn btn-outline-primary btn-sm"
          onClick={cargarRuta}
          disabled={cargandoRuta}
        >
          <i className="bi bi-arrow-clockwise me-2"></i>
          {cargandoRuta ? 'Cargando...' : 'Recalcular Ruta'}
        </button>
      </div>
    </div>
  );
};

const ModalMapa= ({ 
  mapaVisible, 
  cargandoMapa, 
  pedidoParaMapa, 
  coordenadas, 
  setMapaVisible, 
  setPedidoParaMapa, 
  setCoordenadas, 
  setCargandoMapa
}) => {
  if (!mapaVisible) return null;

  return (
    <div style={{ 
      position: 'fixed', 
      top: 0, 
      left: 0, 
      right: 0, 
      bottom: 0, 
      backgroundColor: 'rgba(0,0,0,0.5)', 
      zIndex: 9999,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <div style={{ 
        backgroundColor: 'white', 
        padding: '20px', 
        borderRadius: '8px',
        maxWidth: '900px',
        width: '95%',
        maxHeight: '95vh',
        overflow: 'auto'
      }}>
        {cargandoMapa ? (
          <div className="text-center py-4">
            <div className="spinner-border text-primary mb-3" role="status"></div>
            <p>Cargando ubicaciones en el mapa</p>
            <button 
              className="btn btn-secondary"
              onClick={() => {
                setMapaVisible(false);
                setPedidoParaMapa(null);
                setCoordenadas({ recogida: null, entrega: null });
                setCargandoMapa(false);
              }}
            >
              Cancelar
            </button>
          </div>
        ) : (
          <div>
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5>
                <i className="bi bi-map me-2"></i>
                Ruta del Pedido #{pedidoParaMapa?.id}
              </h5>
              <button 
                className="btn btn-outline-secondary btn-sm"
                onClick={() => {
                  setMapaVisible(false);
                  setPedidoParaMapa(null);
                  setCoordenadas({ recogida: null, entrega: null });
                }}
              >
                <i className="bi bi-x-lg"></i> Cerrar
              </button>
            </div>
            
            <div className="mb-3">
              <div className="row">
                <div className="col-md-6">
                  <p>
                    <i className="bi bi-circle-fill text-success me-2"></i>
                    <strong>Recogida:</strong> {pedidoParaMapa?.direccionRecogida}
                  </p>
                </div>
                <div className="col-md-6">
                  <p>
                    <i className="bi bi-circle-fill text-danger me-2"></i>
                    <strong>Entrega:</strong> {pedidoParaMapa?.direccionEntrega}
                  </p>
                </div>
              </div>
            </div>

            <ComponenteMapaConRuta 
              coordenadas={coordenadas} 
              pedido={pedidoParaMapa}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default ModalMapa;