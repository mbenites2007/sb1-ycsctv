import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, ZoomControl, ScaleControl, AttributionControl } from 'react-leaflet';
import L from 'leaflet';
import { Order } from '../../types';
import { formatCurrency } from '../../utils/currency';
import { MapPin } from 'lucide-react';

// Corrigir ícones do Leaflet
const icon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

// Componente personalizado para o botão de Box Zoom
const BoxZoomControl = () => {
  const [active, setActive] = useState(false);
  const map = L.Map.instance;

  const toggleBoxZoom = () => {
    if (!active) {
      map.boxZoom.enable();
      map.dragging.disable();
      document.body.style.cursor = 'crosshair';
    } else {
      map.boxZoom.disable();
      map.dragging.enable();
      document.body.style.cursor = '';
    }
    setActive(!active);
  };

  return (
    <div className="leaflet-control leaflet-bar">
      <a
        href="#"
        onClick={(e) => {
          e.preventDefault();
          toggleBoxZoom();
        }}
        className={`leaflet-control-zoom-box ${active ? 'active' : ''}`}
        title="Zoom por área - Clique e arraste para selecionar uma área"
      >
        <span className="material-icons">search</span>
      </a>
    </div>
  );
};

interface OrderMapProps {
  orders: Order[];
}

interface Location {
  lat: number;
  lon: number;
  display_name: string;
}

const OrderMap: React.FC<OrderMapProps> = ({ orders }) => {
  const [locations, setLocations] = useState<Map<string, Location>>(new Map());
  const [isLoading, setIsLoading] = useState(true);
  const [map, setMap] = useState<L.Map | null>(null);

  useEffect(() => {
    const fetchLocations = async () => {
      const newLocations = new Map<string, Location>();
      
      for (const order of orders) {
        const locationKey = `${order.clientCity}-${order.clientState}`;
        
        if (!newLocations.has(locationKey) && order.clientCity && order.clientState) {
          try {
            const query = encodeURIComponent(`${order.clientCity}, ${order.clientState}, Brazil`);
            const response = await fetch(
              `https://nominatim.openstreetmap.org/search?format=json&q=${query}`
            );
            const data = await response.json();
            
            if (data && data[0]) {
              newLocations.set(locationKey, {
                lat: parseFloat(data[0].lat),
                lon: parseFloat(data[0].lon),
                display_name: data[0].display_name
              });
            }
          } catch (error) {
            console.error('Erro ao buscar localização:', error);
          }
          
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }
      
      setLocations(newLocations);
      setIsLoading(false);
    };

    fetchLocations();
  }, [orders]);

  useEffect(() => {
    if (map) {
      // Habilitar Box Zoom
      map.boxZoom.enable();

      // Adicionar controles adicionais ao mapa
      L.control.scale({ imperial: false }).addTo(map);

      // Adicionar controle de camadas
      const baseMaps = {
        "OpenStreetMap": L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'),
        "Satélite": L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}')
      };

      L.control.layers(baseMaps).addTo(map);

      // Adicionar evento para resetar cursor quando o box zoom terminar
      map.on('boxzoomend', () => {
        document.body.style.cursor = '';
      });
    }
  }, [map]);

  const getStatusColor = (status: Order['status']) => {
    switch (status) {
      case 'draft':
        return 'bg-gray-100 text-gray-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'canceled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: Order['status']) => {
    switch (status) {
      case 'draft':
        return 'Rascunho';
      case 'pending':
        return 'Pendente';
      case 'approved':
        return 'Aprovado';
      case 'canceled':
        return 'Cancelado';
      default:
        return status;
    }
  };

  const groupOrdersByLocation = () => {
    const grouped = new Map<string, Order[]>();
    
    orders.forEach(order => {
      if (order.clientCity && order.clientState) {
        const key = `${order.clientCity}-${order.clientState}`;
        if (!grouped.has(key)) {
          grouped.set(key, []);
        }
        grouped.get(key)?.push(order);
      }
    });
    
    return grouped;
  };

  const groupedOrders = groupOrdersByLocation();

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-4">
        <div className="flex items-center justify-center h-[600px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
            <p className="mt-2 text-sm text-gray-500">Carregando mapa...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center space-x-2">
          <MapPin className="h-5 w-5 text-indigo-600" />
          <h2 className="text-lg font-semibold text-gray-900">
            Distribuição Geográfica dos Orçamentos
          </h2>
        </div>
      </div>
      
      <div className="h-[600px] relative">
        <MapContainer
          center={[-14.235, -51.925]}
          zoom={4}
          style={{ height: '100%', width: '100%' }}
          whenCreated={setMap}
          zoomControl={false}
          attributionControl={false}
          boxZoom={true}
        >
          {/* Controles do mapa */}
          <ZoomControl position="bottomright" />
          <ScaleControl position="bottomleft" imperial={false} />
          <AttributionControl position="bottomright" prefix={false} />
          
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          
          {Array.from(groupedOrders.entries()).map(([locationKey, locationOrders]) => {
            const location = locations.get(locationKey);
            if (!location) return null;

            const totalValue = locationOrders.reduce((sum, order) => sum + order.total, 0);
            
            return (
              <Marker
                key={locationKey}
                position={[location.lat, location.lon]}
                icon={icon}
              >
                <Popup>
                  <div className="max-w-xs">
                    <h3 className="font-semibold text-gray-900 mb-2">
                      {locationOrders[0].clientCity}, {locationOrders[0].clientState}
                    </h3>
                    <div className="space-y-2">
                      <p className="text-sm text-gray-600">
                        Total de orçamentos: {locationOrders.length}
                      </p>
                      <p className="text-sm font-medium text-gray-900">
                        Valor total: {formatCurrency(totalValue)}
                      </p>
                      <div className="mt-2 space-y-1">
                        {locationOrders.map(order => (
                          <div
                            key={order.id}
                            className="text-sm border-t pt-2 first:border-t-0 first:pt-0"
                          >
                            <div className="flex justify-between items-center">
                              <span className="font-medium">#{order.code}</span>
                              <span className={`px-2 py-0.5 rounded-full text-xs ${getStatusColor(order.status)}`}>
                                {getStatusText(order.status)}
                              </span>
                            </div>
                            <p className="text-gray-600 text-xs mt-1">
                              {order.clientName}
                            </p>
                            <p className="text-gray-900 font-medium text-xs mt-0.5">
                              {formatCurrency(order.total)}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </Popup>
              </Marker>
            );
          })}
        </MapContainer>
      </div>
    </div>
  );
};

export default OrderMap;