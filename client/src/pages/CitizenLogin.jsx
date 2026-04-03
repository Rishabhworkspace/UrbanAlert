import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import { MapPin } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../api/axios';

const CitizenLogin = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Pass source parameter to distinguish login portals
      const { data } = await api.post('/api/auth/login', { ...formData, source: 'citizen' });
      login(data.token, data.user);
      
      navigate('/my-reports');
      toast.success('Welcome back!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="py-12 px-4 flex justify-center items-center min-h-[calc(100vh-64px)] bg-slate-50">
      <div className="max-w-md w-full bg-white p-8 rounded-xl shadow-lg border border-slate-200">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-brand-pale rounded-full flex items-center justify-center mx-auto mb-4">
             <MapPin className="text-brand-blue w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-brand-navy">Citizen Portal</h2>
          <p className="text-slate-500 mt-2">Sign in to report and track civic issues</p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
            <input type="email" name="email" required value={formData.email} onChange={handleChange}
              className="w-full border border-slate-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-brand-mid focus:border-brand-mid outline-none transition-all"
              placeholder="john@example.com" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
            <input type="password" name="password" required value={formData.password} onChange={handleChange}
              className="w-full border border-slate-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-brand-mid focus:border-brand-mid outline-none transition-all"
              placeholder="••••••••" />
          </div>
          
          <button type="submit" disabled={loading} className="btn-primary w-full mt-6">
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
        
        <div className="mt-6 text-center space-y-4">
          <div className="text-sm text-slate-600">
            Don't have an account? <Link to="/register" className="text-brand-blue font-semibold hover:underline">Register here</Link>
          </div>
          
          <div className="pt-4 border-t border-slate-100 text-sm text-slate-500">
            Are you a government officer? <br/>
            <Link to="/gov/login" className="text-brand-navy font-semibold hover:underline mt-1 inline-block">Go to Government Login →</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CitizenLogin;
