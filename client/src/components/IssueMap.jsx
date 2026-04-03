import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix Leaflet's default icon path issues with Webpack/Vite
import iconUrl from 'leaflet/dist/images/marker-icon.png';
import iconRetinaUrl from 'leaflet/dist/images/marker-icon-2x.png';
import shadowUrl from 'leaflet/dist/images/marker-shadow.png';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl,
  iconUrl,
  shadowUrl,
});

// Component to recenter map when lat/lng change
const RecenterMap = ({ lat, lng }) => {
  const map = useMap();
  useEffect(() => {
    if (lat && lng) {
      map.setView([lat, lng], 16);
    }
  }, [lat, lng, map]);
  return null;
};

const IssueMap = ({ lat, lng, className = "h-64 w-full rounded-lg z-0 relative" }) => {
  if (!lat || !lng) {
    return (
      <div className={`${className} bg-slate-100 flex items-center justify-center border border-slate-200`}>
        <p className="text-slate-500 font-medium">No location data available</p>
      </div>
    );
  }

  return (
    <div className={className}>
      <MapContainer 
        center={[lat, lng]} 
        zoom={16} 
        scrollWheelZoom={false}
        className="h-full w-full rounded-lg z-0 absolute inset-0"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={[lat, lng]} />
        <RecenterMap lat={lat} lng={lng} />
      </MapContainer>
    </div>
  );
};

export default IssueMap;
