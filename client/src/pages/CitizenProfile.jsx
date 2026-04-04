import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Mail, Calendar, Edit2, Check, X, Shield, Award, Star, Activity, ArrowRight, LayoutGrid } from 'lucide-react';
import api from '../api/axios';
import toast from 'react-hot-toast';

const CitizenProfile = () => {
  const { user, login } = useAuth();
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Edit state
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(user?.name || '');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchProfileData();
  }, []);

  const fetchProfileData = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/api/issues/my-reports');
      setIssues(data);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load profile data');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    if (!editName.trim()) {
      toast.error('Name cannot be empty');
      return;
    }
    
    try {
      setSaving(true);
      const { data } = await api.patch('/api/auth/update-profile', { name: editName });
      
      // Update local auth context
      login(localStorage.getItem('token'), data);
      
      toast.success('Profile updated successfully');
      setIsEditing(false);
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const cancelEdit = () => {
    setIsEditing(false);
    setEditName(user?.name || '');
  };

  // Derive stats
  const totalReports = issues.length;
  const resolvedReports = issues.filter(i => i.status === 'resolved').length;
  const inProgressReports = issues.filter(i => i.status === 'in_progress').length;
  const pendingReports = issues.filter(i => i.status === 'reported').length;

  const recentActivity = issues.slice(0, 3); // top 3 most recent

  // Badges logic
  const hasFirstReport = totalReports >= 1;
  const hasActiveCitizen = totalReports >= 5;
  const hasProblemSolver = resolvedReports >= 1;

  // Format date
  const memberSince = user?.createdAt 
    ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    : 'Recently';

  // Get initials
  const initials = user?.name ? user.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : 'U';

  const getStatusBadge = (status) => {
    switch (status) {
      case 'resolved':
        return <span className="px-2 py-1 text-xs font-medium rounded-full bg-emerald-100 text-emerald-800">Resolved</span>;
      case 'in_progress':
        return <span className="px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800">In Progress</span>;
      default:
        return <span className="px-2 py-1 text-xs font-medium rounded-full bg-slate-100 text-slate-800">Reported</span>;
    }
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto py-8 px-4 sm:px-6 lg:px-8 mt-12 animate-pulse">
        <div className="h-48 bg-slate-200 rounded-2xl mb-8"></div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          {[1,2,3,4].map(i => <div key={i} className="h-24 bg-slate-200 rounded-xl"></div>)}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto py-8 px-4 sm:px-6 lg:px-8 animate-fade-in">
      
      {/* 1. Profile Hero */}
      <div className="bg-gradient-to-r from-brand-navy to-brand-blue rounded-2xl shadow-lg mb-8 relative overflow-hidden">
        {/* Subtle background decoration */}
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-white opacity-5 blur-2xl"></div>
        <div className="absolute bottom-0 right-32 mb-8 w-12 h-12 rounded-full border border-white opacity-10 animate-float"></div>
        
        <div className="p-8 sm:p-10 relative z-10 flex flex-col sm:flex-row items-center sm:items-start gap-6 text-white text-center sm:text-left">
          
          <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-white/20 border-4 border-white/30 flex items-center justify-center text-4xl font-bold shadow-xl shrink-0">
            {initials}
          </div>
          
          <div className="flex-1 mt-2">
            {isEditing ? (
              <div className="flex flex-col sm:flex-row gap-3 items-center sm:items-start mb-3 max-w-sm">
                <input 
                  type="text" 
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="px-3 py-2 bg-white/20 border border-white/30 rounded-lg text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-white/50 w-full"
                  placeholder="Your Name"
                  autoFocus
                />
                <div className="flex gap-2">
                  <button onClick={handleSaveProfile} disabled={saving} className="p-2 bg-emerald-500 rounded-lg hover:bg-emerald-600 transition disabled:opacity-50">
                    <Check className="w-5 h-5 text-white" />
                  </button>
                  <button onClick={cancelEdit} disabled={saving} className="p-2 bg-white/20 rounded-lg hover:bg-white/30 transition disabled:opacity-50">
                    <X className="w-5 h-5 text-white" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center sm:justify-start gap-3 mb-2">
                <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">{user?.name}</h1>
                <button onClick={() => setIsEditing(true)} className="p-1.5 text-white/70 hover:text-white hover:bg-white/10 rounded-md transition" title="Edit Name">
                  <Edit2 className="w-4 h-4" />
                </button>
              </div>
            )}
            
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-6 text-brand-pale/80 text-sm font-medium">
              <span className="flex items-center justify-center sm:justify-start gap-1.5">
                <Mail className="w-4 h-4" /> {user?.email}
              </span>
              <span className="flex items-center justify-center sm:justify-start gap-1.5">
                <Calendar className="w-4 h-4" /> Member since {memberSince}
              </span>
            </div>
          </div>
          
          <div className="sm:self-center shrink-0">
             <Link to="/report-issue" className="inline-flex items-center justify-center px-5 py-2.5 bg-white text-brand-navy font-bold rounded-lg hover:bg-brand-pale transition-colors shadow-lg">
                Report Issue
             </Link>
          </div>
        </div>
      </div>

      {/* 2. Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm flex flex-col">
          <div className="text-slate-500 text-sm font-medium mb-1 flex items-center gap-2">
            <LayoutGrid className="w-4 h-4 text-brand-blue" />
            Total Reports
          </div>
          <div className="text-3xl font-bold text-brand-navy">{totalReports}</div>
        </div>
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm flex flex-col">
          <div className="text-slate-500 text-sm font-medium mb-1 flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-500" />
            Resolved
          </div>
          <div className="text-3xl font-bold text-emerald-600">{resolvedReports}</div>
        </div>
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm flex flex-col">
          <div className="text-slate-500 text-sm font-medium mb-1 flex items-center gap-2">
            <Activity className="w-4 h-4 text-yellow-500" />
            In Progress
          </div>
          <div className="text-3xl font-bold text-yellow-600">{inProgressReports}</div>
        </div>
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm flex flex-col">
          <div className="text-slate-500 text-sm font-medium mb-1 flex items-center gap-2">
             <div className="w-2 h-2 rounded-full bg-slate-400 ml-1 mr-1"></div>
            Pending
          </div>
          <div className="text-3xl font-bold text-slate-700">{pendingReports}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        
        {/* 3. Recent Activity */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden h-full">
            <div className="flex items-center justify-between p-5 border-b border-slate-100">
              <h2 className="text-lg font-bold text-brand-navy flex items-center gap-2">
                <Activity className="w-5 h-5 text-brand-blue" />
                Recent Activity
              </h2>
              <Link to="/my-reports" className="text-sm font-medium text-brand-blue hover:text-brand-mid transition">
                View All →
              </Link>
            </div>
            
            <div className="divide-y divide-slate-100">
              {recentActivity.length > 0 ? (
                recentActivity.map(issue => (
                  <div key={issue._id} className="p-5 hover:bg-slate-50 transition group">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-semibold text-slate-800 line-clamp-1">{issue.title}</h3>
                      {getStatusBadge(issue.status)}
                    </div>
                    <div className="flex items-center gap-3 text-sm text-slate-500 mb-3">
                      <span className="bg-slate-100 px-2 py-0.5 rounded-md text-xs">{issue.category}</span>
                      <span>{new Date(issue.createdAt).toLocaleDateString()}</span>
                    </div>
                    <Link to={`/issues/${issue._id}`} className="text-brand-blue text-sm font-medium inline-flex items-center group-hover:underline">
                      View details <ArrowRight className="w-4 h-4 ml-1 opacity-0 group-hover:opacity-100 transition-opacity transform -translate-x-2 group-hover:translate-x-0" />
                    </Link>
                  </div>
                ))
              ) : (
                <div className="p-10 text-center text-slate-500">
                  <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Activity className="w-6 h-6 text-slate-400" />
                  </div>
                  <p>No activity yet.</p>
                  <p className="text-sm mt-1">Start by reporting your first issue!</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 4. Badges & Impact */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden h-full">
            <div className="p-5 border-b border-slate-100">
              <h2 className="text-lg font-bold text-brand-navy flex items-center gap-2">
                <Award className="w-5 h-5 text-brand-blue" />
                Civic Impact
              </h2>
            </div>
            
            <div className="p-5 space-y-4">
              
              <div className={`flex items-center gap-4 p-3 rounded-xl border ${hasFirstReport ? 'border-brand-blue/20 bg-brand-pale' : 'border-slate-100 bg-slate-50 opacity-60'}`}>
                <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${hasFirstReport ? 'bg-brand-blue text-white' : 'bg-slate-200 text-slate-400'}`}>
                  <Shield className="w-6 h-6" />
                </div>
                <div>
                  <h4 className={`font-semibold ${hasFirstReport ? 'text-brand-navy' : 'text-slate-500'}`}>Initiator</h4>
                  <p className="text-xs text-slate-500">Reported first issue</p>
                </div>
              </div>

              <div className={`flex items-center gap-4 p-3 rounded-xl border ${hasActiveCitizen ? 'border-purple-200 bg-purple-50' : 'border-slate-100 bg-slate-50 opacity-60'}`}>
                <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${hasActiveCitizen ? 'bg-purple-500 text-white shadow-md' : 'bg-slate-200 text-slate-400'}`}>
                  <Star className="w-6 h-6" />
                </div>
                <div>
                  <h4 className={`font-semibold ${hasActiveCitizen ? 'text-purple-900' : 'text-slate-500'}`}>Active Citizen</h4>
                  <p className="text-xs text-slate-500">Reported 5+ issues</p>
                </div>
              </div>

              <div className={`flex items-center gap-4 p-3 rounded-xl border ${hasProblemSolver ? 'border-emerald-200 bg-emerald-50' : 'border-slate-100 bg-slate-50 opacity-60'}`}>
                <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${hasProblemSolver ? 'bg-emerald-500 text-white shadow-md' : 'bg-slate-200 text-slate-400'}`}>
                  <Check className="w-6 h-6" />
                </div>
                <div>
                  <h4 className={`font-semibold ${hasProblemSolver ? 'text-emerald-900' : 'text-slate-500'}`}>Problem Solver</h4>
                  <p className="text-xs text-slate-500">1+ issues resolved</p>
                </div>
              </div>

            </div>
          </div>
        </div>

      </div>

    </div>
  );
};

export default CitizenProfile;
