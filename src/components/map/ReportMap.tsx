import React, { useEffect, useMemo, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import type { Report, ReportStatus } from '../../types';

// Resolve Leaflet default asset issue
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
});

// Real coordinates center of Pekanbaru
const PEKANBARU_CENTER: [number, number] = [0.5071, 101.4478];

interface ReportMapProps {
  reports?: Report[];
  interactive?: boolean;
  selectedCoords?: [number, number];
  onCoordsChange?: (coords: [number, number], streetName: string, districtName: string, subdistrictName: string) => void;
  height?: string;
  zoom?: number;
}

// Simulated Reverse Geocoding Database for Pekanbaru Locations
const MOCK_LOCATIONS_DATABASE = [
  { lat: 0.465, lng: 101.391, street: 'Jl. H.R. Soebrantas No. 45', subdistrict: 'Tuah Karya', district: 'Tuah Madani' },
  { lat: 0.498, lng: 101.448, street: 'Jl. Jenderal Sudirman No. 120', subdistrict: 'Tangkerang Selatan', district: 'Bukit Raya' },
  { lat: 0.472, lng: 101.424, street: 'Jl. Arifin Ahmad No. 8', subdistrict: 'Tangkerang Barat', district: 'Marpoyan Damai' },
  { lat: 0.531, lng: 101.433, street: 'Jl. Riau No. 12', subdistrict: 'Padang Terubuk', district: 'Senapelan' },
  { lat: 0.481, lng: 101.385, street: 'Jl. Manyar Sakti', subdistrict: 'Simpang Baru', district: 'Bina Widya' },
  { lat: 0.512, lng: 101.418, street: 'Jl. Tuanku Tambusai (Nangka)', subdistrict: 'Tangkerang Tengah', district: 'Marpoyan Damai' },
  { lat: 0.452, lng: 101.402, street: 'Jl. Suka Karya', subdistrict: 'Tuah Karya', district: 'Tuah Madani' },
  { lat: 0.491, lng: 101.455, street: 'Jl. Kaharuddin Nasution', subdistrict: 'Simpang Tiga', district: 'Bukit Raya' },
  { lat: 0.528, lng: 101.472, street: 'Jl. Harapan Raya (Imam Munandar)', subdistrict: 'Tangkerang Timur', district: 'Tenayan Raya' },
  { lat: 0.538, lng: 101.403, street: 'Jl. Soekarno - Hatta', subdistrict: 'Tobek Godang', district: 'Bina Widya' }
];

const getGeocodingAddress = (lat: number, lng: number) => {
  // Find closest point in our simulated database
  let closest = MOCK_LOCATIONS_DATABASE[0];
  let minDistance = Infinity;

  MOCK_LOCATIONS_DATABASE.forEach(loc => {
    const dist = Math.pow(loc.lat - lat, 2) + Math.pow(loc.lng - lng, 2);
    if (dist < minDistance) {
      minDistance = dist;
      closest = loc;
    }
  });

  // If distance is very far, output generic address, otherwise closest street
  if (minDistance > 0.05) {
    return {
      street: `Jl. Lintas Pekanbaru (Koor: ${lat.toFixed(4)}, ${lng.toFixed(4)})`,
      subdistrict: 'Simpang Baru',
      district: 'Bina Widya'
    };
  }

  return {
    street: closest.street,
    subdistrict: closest.subdistrict,
    district: closest.district
  };
};

// Custom HTML status markers generator
const getMarkerIcon = (status: ReportStatus) => {
  let color = '#3B82F6'; // Default Blue
  switch (status) {
    case 'Menunggu Verifikasi Admin':
      // Baru (Biru)
      color = '#0F4C81';
      break;
    case 'Diverifikasi':
    case 'Menunggu Penugasan Teknisi':
      // Diverifikasi (Kuning/Sky)
      color = '#1D9BF0';
      break;
    case 'Sedang Diproses':
      // Sedang Diproses (Ungu)
      color = '#A855F7';
      break;
    case 'Selesai':
      // Selesai (Hijau)
      color = '#22C55E';
      break;
    case 'Ditolak':
      color = '#EF4444';
      break;
  }

  return L.divIcon({
    html: `
      <div class="custom-map-marker relative flex items-center justify-center">
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 2C8.13 2 5 5.13 5 9C5 14.25 12 22 12 22C12 22 19 14.25 19 9C19 5.13 15.87 2 12 2ZM12 11.5C10.62 11.5 9.5 10.38 9.5 9C9.5 7.62 10.62 6.5 12 6.5C13.38 6.5 14.5 7.62 14.5 9C14.5 10.38 13.38 11.5 12 11.5Z" fill="${color}" stroke="#ffffff" stroke-width="1.5"/>
        </svg>
        ${status === 'Sedang Diproses' ? `
          <div class="absolute -inset-2 rounded-full border-2 animate-ping" style="border-color: ${color}; opacity: 0.6; pointer-events: none;"></div>
        ` : ''}
      </div>
    `,
    className: '',
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32]
  });
};

// Component: Map Updater
const MapController: React.FC<{ center: [number, number] }> = ({ center }) => {
  const map = useMap();
  useEffect(() => {
    map.setView(center, map.getZoom());
  }, [center, map]);
  return null;
};

// Component: Geolocation button — defined outside so component identity is stable across renders
const GeolocateControl: React.FC<{
  onGeolocate: (map: L.Map) => void;
}> = ({ onGeolocate }) => {
  const map = useMap();
  return (
    <div className="absolute top-20 left-2 z-[1000] leaflet-bar bg-white dark:bg-card border border-border rounded shadow">
      <button
        type="button"
        onClick={() => onGeolocate(map)}
        title="Lokasi Saya"
        className="w-8 h-8 flex items-center justify-center text-foreground hover:bg-muted font-bold text-lg rounded"
      >
        📍
      </button>
    </div>
  );
};

// Component: Click Event Handler for interactive map
const LocationSelector: React.FC<{
  onSelect: (lat: number, lng: number) => void;
}> = ({ onSelect }) => {
  const eventHandlers = useMemo(() => ({
    click(e: L.LeafletMouseEvent) {
      onSelect(e.latlng.lat, e.latlng.lng);
    }
  }), [onSelect]);
  useMapEvents(eventHandlers);
  return null;
};

export const ReportMap: React.FC<ReportMapProps> = ({
  reports = [],
  interactive = false,
  selectedCoords,
  onCoordsChange,
  height = '400px',
  zoom = 13
}) => {
  // Derive map center & marker position directly from prop — avoids internal state sync
  const mapCenter = selectedCoords || PEKANBARU_CENTER;
  const markerPosition = selectedCoords || PEKANBARU_CENTER;

  const draggableMarkerEvents = useMemo(() => ({
    dragend(e: L.LeafletEvent) {
      const marker = e.target;
      if (marker) {
        const position = marker.getLatLng();
        const lat = position.lat;
        const lng = position.lng;
        
        if (onCoordsChange) {
          const addInfo = getGeocodingAddress(lat, lng);
          onCoordsChange([lat, lng], addInfo.street, addInfo.district, addInfo.subdistrict);
        }
      }
    }
  }), [onCoordsChange]);

  const handleSelectLocation = useCallback((lat: number, lng: number) => {
    if (!interactive) return;
    if (onCoordsChange) {
      const addInfo = getGeocodingAddress(lat, lng);
      onCoordsChange([lat, lng], addInfo.street, addInfo.district, addInfo.subdistrict);
    }
  }, [interactive, onCoordsChange]);

  // Geolocate Browser helper
  const handleGeolocate = useCallback((map: L.Map) => {
    map.locate({ setView: true, maxZoom: 16 });
    map.on('locationfound', (e) => {
      const lat = e.latlng.lat;
      const lng = e.latlng.lng;
      handleSelectLocation(lat, lng);
    });
  }, [handleSelectLocation]);

  return (
    <div className="relative border border-border rounded-2xl overflow-hidden shadow-sm" style={{ height }}>
      <MapContainer
        center={mapCenter}
        zoom={zoom}
        scrollWheelZoom={true}
        className="w-full h-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <MapController center={mapCenter} />
        
        {interactive && <GeolocateControl onGeolocate={handleGeolocate} />}

        {interactive ? (
          <>
            <LocationSelector onSelect={handleSelectLocation} />
            <Marker
              position={markerPosition}
              draggable={true}
              eventHandlers={draggableMarkerEvents}
              icon={getMarkerIcon('Menunggu Verifikasi Admin')}
            >
              <Popup>
                <div className="text-center font-medium">
                  Lokasi Kerusakan<br />
                  <span className="text-xs text-muted-foreground">(Geser marker untuk menyesuaikan lokasi)</span>
                </div>
              </Popup>
            </Marker>
          </>
        ) : (
          reports.map(report => (
            <Marker
              key={report.id}
              position={[report.latitude, report.longitude]}
              icon={getMarkerIcon(report.status)}
            >
              <Popup>
                <div className="w-56 p-1 text-card-foreground">
                  {report.images_before && report.images_before.length > 0 && (
                    <img
                      src={report.images_before[0]}
                      alt={report.title}
                      className="w-full h-24 object-cover rounded-lg mb-2 border border-border"
                    />
                  )}
                  <h4 className="font-bold text-sm text-primary dark:text-foreground line-clamp-1">{report.title}</h4>
                  <p className="text-xs text-muted-foreground font-semibold mb-1">{report.ticket_number}</p>
                  
                  <div className="text-xs text-foreground/80 mb-2 line-clamp-2">
                    {report.street_name}, Kec. {report.district}
                  </div>
                  
                  <div className="flex flex-col gap-1.5 mb-2">
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">Tingkat:</span>
                      <span className={`font-semibold ${
                        report.severity === 'Berat' ? 'text-danger' : 
                        report.severity === 'Sedang' ? 'text-warning' : 'text-success'
                      }`}>{report.severity}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">Status:</span>
                      <span className="font-semibold text-secondary">{report.status}</span>
                    </div>
                  </div>
                  
                  <a
                    href={`#/report/${report.ticket_number}`}
                    className="block text-center w-full py-1.5 text-xs font-semibold bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
                  >
                    Detail Pekerjaan →
                  </a>
                </div>
              </Popup>
              </Marker>
            ))
          )}
      </MapContainer>
    </div>
  );
};
