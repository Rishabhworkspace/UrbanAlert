import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import api from '../api/axios';
import GovSidebar from '../components/GovSidebar';
import { MapPin, ArrowRight } from 'lucide-react';

// Fix for default Leaflet markers missing in React
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom icons based on status
const createIcon = (color) => new L.Icon({
  iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-${color}.png`,
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const icons = {
  reported: createIcon('red'),
  in_progress: createIcon('orange'),
  resolved: createIcon('green'),
  default: createIcon('blue')
};


const GovMap = () => {
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchIssues();
  }, []);

  const fetchIssues = async () => {
    try {
      setLoading(true);
      const res = await api.get('/api/issues/all');
      // Filter only issues that have valid coordinates
      const mappedIssues = res.data.filter(issue => 
        issue.location && 
        issue.location.coordinates && 
        issue.location.coordinates.length === 2
      );
      setIssues(mappedIssues);
    } catch (error) {
      console.error('Failed to fetch issues for map:', error);
    } finally {
      setLoading(false);
    }
  };

  // Center on India by default, or the first issue if available
  const center = issues.length > 0 
    ? [issues[0].location.coordinates[1], issues[0].location.coordinates[0]] 
    : [20.5937, 78.9629]; // Approximate center of India
  const zoom = issues.length > 0 ? 12 : 5;

  return (
    <div className="flex bg-slate-50 min-h-[calc(100vh-64px)] overflow-hidden">
      <GovSidebar />
      <main className="flex-1 flex flex-col h-[calc(100vh-64px)]">
        <div className="p-4 border-b border-slate-200 bg-white shadow-sm z-10 flex justify-between items-center">
          <div>
            <h1 className="text-xl font-bold text-brand-navy flex items-center gap-2">
              <MapPin className="w-5 h-5 text-brand-blue" /> Live Issues Map
            </h1>
            <p className="text-sm text-slate-500">Real-time geographical distribution of civic issues</p>
          </div>
          <div className="flex gap-4 text-xs font-semibold">
            <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-red-500 block"></span> Reported</div>
            <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-orange-500 block"></span> In Progress</div>
            <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-green-500 block"></span> Resolved</div>
          </div>
        </div>
        
        <div className="flex-1 relative">
          {loading ? (
             <div className="absolute inset-0 bg-slate-50 flex items-center justify-center z-20">
               <div className="flex flex-col items-center">
                 <div className="w-8 h-8 border-4 border-brand-blue/30 border-t-brand-blue rounded-full animate-spin mb-4"></div>
                 <p className="text-slate-500 font-medium">Loading map data...</p>
               </div>
             </div>
          ) : (
            <MapContainer center={center} zoom={zoom} style={{ height: '100%', width: '100%', zIndex: 0 }}>
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              {issues.map(issue => (
                <Marker 
                  key={issue._id} 
                  position={[issue.location.coordinates[1], issue.location.coordinates[0]]}
                  icon={icons[issue.status] || icons.default}
                >
                  <Popup>
                    <div className="text-sm min-w-[160px]">
                      <p className="font-bold text-brand-navy mb-1 line-clamp-2">{issue.title}</p>
                      <p className="text-xs text-slate-500 mb-2 capitalize">{issue.category} • {(issue.status || 'reported').replace('_', ' ')}</p>
                      <button
                        onClick={() => navigate(`/gov/issues/${issue._id}`)}
                        className="flex items-center gap-1 text-xs font-semibold text-brand-blue hover:underline"
                      >
                        View Details <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          )}
        </div>
      </main>
    </div>
  );
};

export default GovMap;
