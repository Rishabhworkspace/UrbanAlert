import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import toast from 'react-hot-toast';
import api from '../api/axios';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      return toast.error('Passwords do not match');
    }
    if (formData.password.length < 6) {
      return toast.error('Password must be at least 6 characters');
    }

    setLoading(true);
    try {
      const { data } = await api.post('/api/auth/register', {
        name: formData.name,
        email: formData.email,
        password: formData.password
      });
      login(data.token, data.user);
      toast.success('Registration successful! Welcome to UrbanAlert.');
      navigate('/my-reports');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="py-12 px-4 sm:px-6 lg:px-8 flex justify-center items-center min-h-[calc(100vh-64px)]">
      <div className="max-w-md w-full bg-white p-8 rounded-xl shadow-lg border border-slate-200">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-brand-navy">Create an Account</h2>
          <p className="text-slate-500 mt-2">Join UrbanAlert to start reporting civic issues in your area.</p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
            <input type="text" name="name" required value={formData.name} onChange={handleChange} 
              className="w-full border border-slate-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-brand-mid focus:border-brand-mid outline-none transition-all"
              placeholder="John Doe" />
          </div>
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
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Confirm Password</label>
            <input type="password" name="confirmPassword" required value={formData.confirmPassword} onChange={handleChange}
              className="w-full border border-slate-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-brand-mid focus:border-brand-mid outline-none transition-all"
              placeholder="••••••••" />
          </div>
          
          <button type="submit" disabled={loading} className="btn-primary w-full mt-6">
            {loading ? 'Registering...' : 'Register as Citizen'}
          </button>
        </form>
        
        <div className="mt-6 text-center text-sm text-slate-600">
          Already have an account? <Link to="/login" className="text-brand-blue font-semibold hover:underline">Login here</Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
