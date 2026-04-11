import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { MapPin, Navigation, Info, UploadCloud, Image as ImageIcon, X } from 'lucide-react';
import api from '../api/axios';
import IssueMap from '../components/IssueMap';
import { reverseGeocode } from '../utils/geocode';

const CATEGORIES = ['Pothole', 'Garbage', 'Street Light', 'Flooding', 'Other'];

const ReportIssue = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: CATEGORIES[0],
    priority: 'low'
  });

  // Location State
  const [gpsLat, setGpsLat] = useState(null);
  const [gpsLng, setGpsLng] = useState(null);
  const [gpsAddress, setGpsAddress] = useState('');
  const [manualAddress, setManualAddress] = useState('');
  const [locationStatus, setLocationStatus] = useState('idle'); // idle|loading|success|error

  // Photo State
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleUseMyLocation = () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported by your browser');
      setLocationStatus('error');
      return;
    }

    setLocationStatus('loading');
    toast.loading('Detecting location...', { id: 'gpsToast' });

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        setGpsLat(latitude);
        setGpsLng(longitude);
        
        // Reverse Geocode
        try {
          const address = await reverseGeocode(latitude, longitude);
          setGpsAddress(address);
          setLocationStatus('success');
          toast.success('Location detected!', { id: 'gpsToast' });
        } catch (error) {
          setLocationStatus('success'); // location found, but geocode failed
          toast.error('Could not determine address name, but coordinates saved.', { id: 'gpsToast' });
        }
      },
      (error) => {
        console.error('GPS Error:', error);
        setLocationStatus('error');
        toast.error('Could not get your location. Please check browser permissions.', { id: 'gpsToast' });
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size must be less than 5MB');
      return;
    }
    
    if (!file.type.startsWith('image/')) {
      toast.error('Only image files are allowed');
      return;
    }

    setPhotoFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setPhotoPreview(reader.result);
    reader.readAsDataURL(file);
  };

  const clearPhoto = () => {
    setPhotoFile(null);
    setPhotoPreview(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const finalAddress = manualAddress.trim() !== '' ? manualAddress.trim() : gpsAddress;

    if (!finalAddress && !gpsLat) {
      return toast.error('Please provide a location (either via GPS or manually)');
    }

    const payload = new FormData();
    payload.append('title', formData.title);
    payload.append('description', formData.description);
    payload.append('category', formData.category);
    payload.append('priority', formData.priority);
    
    if (gpsLat && gpsLng) {
      payload.append('latitude', gpsLat);
      payload.append('longitude', gpsLng);
    }
    
    if (finalAddress) {
      payload.append('address', finalAddress);
    }
    
    if (photoFile) {
      payload.append('photo', photoFile);
    }

    setLoading(true);
    const loadingToast = toast.loading('Submitting issue...');
    
    try {
      await api.post('/api/issues', payload);
      toast.success('Issue reported successfully!', { id: loadingToast });
      navigate('/my-reports');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit issue', { id: loadingToast });
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-brand-navy">Report an Issue</h1>
        <p className="text-slate-500 mt-2">Help us improve the city by reporting civic problems in your area.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        
        {/* Section 1: Issue Details */}
        <section className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h2 className="text-xl font-semibold text-brand-navy mb-4 flex items-center">
            <Info className="w-5 h-5 mr-2 text-brand-blue" />
            Issue Details
          </h2>
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Title</label>
              <input type="text" name="title" required value={formData.title} onChange={handleInputChange} 
                className="w-full border border-slate-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-brand-mid outline-none transition-all"
                placeholder="e.g. Deep pothole on Main Street" maxLength={200} />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
              <select name="category" value={formData.category} onChange={handleInputChange}
                className="w-full border border-slate-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-brand-mid outline-none transition-all bg-white">
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Priority</label>
              <select name="priority" value={formData.priority} onChange={handleInputChange}
                className="w-full border border-slate-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-brand-mid outline-none transition-all bg-white">
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
              <textarea name="description" required value={formData.description} onChange={handleInputChange} rows={4}
                className="w-full border border-slate-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-brand-mid outline-none transition-all resize-none"
                placeholder="Describe the issue in detail..." />
            </div>
          </div>
        </section>

        {/* Section 2: Location (Dual Input) */}
        <section className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h2 className="text-xl font-semibold text-brand-navy mb-4 flex items-center">
            <MapPin className="w-5 h-5 mr-2 text-brand-blue" />
            Location
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            
            {/* GPS Subsection */}
            <div className="space-y-4 pt-1">
              <div>
                <span className="block text-sm font-medium text-slate-700 mb-2">GPS Auto-Detect</span>
                <button 
                  type="button" 
                  onClick={handleUseMyLocation}
                  disabled={locationStatus === 'loading'}
                  className="w-full bg-slate-100 hover:bg-slate-200 text-brand-navy font-medium py-3 px-4 rounded-lg flex items-center justify-center transition-colors border border-slate-200 disabled:opacity-50"
                >
                  <Navigation className={`w-5 h-5 mr-2 ${locationStatus === 'loading' ? 'animate-pulse' : ''}`} />
                  {locationStatus === 'loading' ? 'Detecting...' : 'Use My Current Location'}
                </button>
              </div>

              {locationStatus === 'success' && gpsLat && (
                <div className="animate-fade-in">
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Detected Address</label>
                  <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-sm text-slate-700 font-medium">
                    {gpsAddress || `${gpsLat.toFixed(6)}, ${gpsLng.toFixed(6)}`}
                  </div>
                  <div className="mt-3 overflow-hidden rounded-lg border border-slate-200 shadow-sm relative z-0">
                    <IssueMap lat={gpsLat} lng={gpsLng} className="h-40 w-full" />
                  </div>
                </div>
              )}
            </div>

            {/* Manual Subsection */}
            <div className="space-y-2 border-t md:border-t-0 md:border-l border-slate-200 pt-6 md:pt-0 md:pl-8">
              <label className="block text-sm font-medium text-slate-700 mb-1">Or describe the location manually</label>
              <textarea 
                name="manualAddress" 
                value={manualAddress} 
                onChange={(e) => setManualAddress(e.target.value)}
                rows={4}
                maxLength={300}
                className="w-full border border-slate-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-brand-mid outline-none transition-all resize-none"
                placeholder="e.g. Near Sector 4 Bus Stand, opposite the city mall" 
              />
              <p className="text-xs text-slate-500">Add landmarks, street names, or area names for clarity. This can be used instead of or in addition to GPS.</p>
            </div>
            
          </div>
        </section>

        {/* Section 3: Photo Upload */}
        <section className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h2 className="text-xl font-semibold text-brand-navy mb-4 flex items-center">
            <ImageIcon className="w-5 h-5 mr-2 text-brand-blue" />
            Photo Evidence
          </h2>
          
          {!photoPreview ? (
            <label className="relative flex flex-col items-center justify-center w-full h-48 border-2 border-slate-300 border-dashed rounded-xl cursor-pointer bg-slate-50 hover:bg-brand-pale transition-colors group">
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <UploadCloud className="w-10 h-10 text-slate-400 group-hover:text-brand-blue mb-3 transition-colors" />
                <p className="mb-2 text-sm text-slate-700"><span className="font-semibold text-brand-blue">Click to upload</span> or drag and drop</p>
                <p className="text-xs text-slate-500">PNG, JPG or JPEG (MAX. 5MB)</p>
              </div>
              <input type="file" className="hidden" accept="image/jpeg, image/png, image/jpg" onChange={handlePhotoUpload} />
            </label>
          ) : (
            <div className="relative rounded-xl overflow-hidden border border-slate-200 bg-black/5 animate-fade-in group">
              <img src={photoPreview} alt="Preview" className="w-full h-64 object-contain" />
              <button 
                type="button" 
                onClick={clearPhoto}
                className="absolute top-3 right-3 bg-white/90 hover:bg-white text-red-600 p-2 rounded-full shadow-md transition-all z-10"
                title="Remove photo"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          )}
        </section>

        <div className="pt-4 border-t border-slate-200 flex justify-end">
          <button type="submit" disabled={loading} className="btn-primary py-3 px-8 text-lg">
            {loading ? 'Submitting...' : 'Submit Issue Report'}
          </button>
        </div>
        
      </form>
    </div>
  );
};

export default ReportIssue;
