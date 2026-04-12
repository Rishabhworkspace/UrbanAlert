import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { Activity, AlertTriangle, CheckCircle, TrendingUp, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../api/axios';
import GovSidebar from '../components/GovSidebar';

const COLORS = ['#0F2D54', '#1B4F8A', '#2E6DB4', '#6366f1', '#94a3b8'];
const STATUS_COLORS = {
  reported: '#ef4444',
  in_progress: '#f59e0b',
  resolved: '#10b981'
};
const PRIORITY_COLORS = {
  critical: '#dc2626',
  high: '#ea580c',
  medium: '#2563eb',
  low: '#64748b'
};

const GovAnalytics = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const res = await api.get('/api/issues/stats');
      setStats(res.data);
    } catch (error) {
      toast.error('Failed to load analytics data');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !stats) {
    return (
      <div className="flex bg-slate-50 min-h-[calc(100vh-64px)]">
        <GovSidebar />
        <main className="flex-1 p-8 flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-brand-blue/30 border-t-brand-blue rounded-full animate-spin"></div>
        </main>
      </div>
    );
  }

  // Format data for charts
  const categoryData = Object.keys(stats.byCategory || {}).map(key => ({
    name: key,
    value: stats.byCategory[key]
  })).sort((a, b) => b.value - a.value);

  const statusData = [
    { name: 'Reported', value: stats.reported, color: STATUS_COLORS.reported },
    { name: 'In Progress', value: stats.in_progress, color: STATUS_COLORS.in_progress },
    { name: 'Resolved', value: stats.resolved, color: STATUS_COLORS.resolved }
  ];

  const priorityData = Object.keys(stats.byPriority || {}).map(key => ({
    name: key.toUpperCase(),
    value: stats.byPriority[key],
    color: PRIORITY_COLORS[key] || '#94a3b8'
  }));

  const resolutionRate = stats.total > 0 
    ? Math.round((stats.resolved / stats.total) * 100) 
    : 0;

  return (
    <div className="flex bg-slate-50 min-h-[calc(100vh-64px)]">
      <GovSidebar />
      <main className="flex-1 p-8 overflow-y-auto h-[calc(100vh-64px)]">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-brand-navy">Analytics Dashboard</h1>
            <p className="text-slate-500 mt-1">Overview of civic issues and resolution performance.</p>
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-slate-500 font-medium">Total Issues</h3>
                <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center">
                  <Activity className="w-5 h-5" />
                </div>
              </div>
              <p className="text-3xl font-bold text-slate-800">{stats.total}</p>
            </div>
            
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-slate-500 font-medium">Resolution Rate</h3>
                <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-5 h-5" />
                </div>
              </div>
              <p className="text-3xl font-bold text-slate-800">{resolutionRate}%</p>
            </div>
            
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-slate-500 font-medium">Pending Action</h3>
                <div className="w-10 h-10 bg-red-50 text-red-600 rounded-lg flex items-center justify-center">
                  <AlertCircle className="w-5 h-5" />
                </div>
              </div>
              <p className="text-3xl font-bold text-slate-800">{stats.reported}</p>
            </div>
            
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-slate-500 font-medium">In Progress</h3>
                <div className="w-10 h-10 bg-amber-50 text-amber-600 rounded-lg flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5" />
                </div>
              </div>
              <p className="text-3xl font-bold text-slate-800">{stats.in_progress}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Category Chart */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
              <h3 className="text-lg font-bold text-brand-navy mb-6">Issues by Category</h3>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={categoryData} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                    <XAxis type="number" />
                    <YAxis dataKey="name" type="category" width={100} tick={{ fontSize: 12 }} />
                    <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                    <Bar dataKey="value" fill="#1B4F8A" radius={[0, 4, 4, 0]}>
                      {
                        categoryData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))
                      }
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Status Chart */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
              <h3 className="text-lg font-bold text-brand-navy mb-6">Current Status Distribution</h3>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={statusData}
                      cx="50%"
                      cy="50%"
                      innerRadius={80}
                      outerRadius={110}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {statusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                    <Legend verticalAlign="bottom" height={36} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
            
            {/* Priority Chart */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 lg:col-span-2">
              <h3 className="text-lg font-bold text-brand-navy mb-6">Issues by Priority</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={priorityData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                    <Bar dataKey="value" fill="#1B4F8A" radius={[4, 4, 0, 0]} maxBarSize={60}>
                      {
                        priorityData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))
                      }
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
          
        </div>
      </main>
    </div>
  );
};

export default GovAnalytics;
