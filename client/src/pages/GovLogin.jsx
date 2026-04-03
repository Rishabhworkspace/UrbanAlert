import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import { Shield } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../api/axios';

const GovLogin = () => {
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
      const { data } = await api.post('/api/auth/login', { ...formData, source: 'government' });
      
      login(data.token, data.user);
      navigate('/gov/dashboard');
      toast.success('Welcome to Government Portal');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="py-12 px-4 flex justify-center items-center min-h-[calc(100vh-64px)] bg-slate-100">
      <div className="max-w-md w-full bg-white rounded-xl shadow-2xl overflow-hidden border border-slate-200">
        <div className="bg-brand-navy p-8 text-center text-white">
          <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-white/20">
             <Shield className="text-yellow-400 w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold">Government Portal</h2>
          <p className="text-white/80 mt-2 text-sm">Authorised Government Officers Only</p>
        </div>
        
        <div className="p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Official Email</label>
              <input type="email" name="email" required value={formData.email} onChange={handleChange}
                className="w-full border border-slate-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-brand-navy focus:border-brand-navy outline-none transition-all"
                placeholder="officer@urbanalert.gov.in" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
              <input type="password" name="password" required value={formData.password} onChange={handleChange}
                className="w-full border border-slate-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-brand-navy focus:border-brand-navy outline-none transition-all"
                placeholder="••••••••" />
            </div>
            
            <button type="submit" disabled={loading} className="w-full bg-brand-navy hover:bg-slate-800 text-white font-semibold py-2.5 px-5 rounded-lg transition-all duration-200 hover:shadow-lg disabled:bg-slate-400 mt-6">
              {loading ? 'Authenticating...' : 'Sign In to Portal'}
            </button>
          </form>
          
          <div className="mt-8 text-center pt-4 border-t border-slate-100">
            <div className="text-sm text-slate-500">
              Are you a citizen? <Link to="/login" className="text-brand-blue font-semibold hover:underline">Login here</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GovLogin;
