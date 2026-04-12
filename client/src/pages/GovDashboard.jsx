import React, { useState, useEffect } from 'react';
import { Filter, Search, AlertTriangle, AlertCircle, CheckCircle, Clock, MapPin, BarChart3, TrendingUp, FileText, Trash2, ArrowUpDown, ArrowUp } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../api/axios';
import GovSidebar from '../components/GovSidebar';
import { Link } from 'react-router-dom';

const GovDashboard = () => {
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Stats
  const [stats, setStats] = useState({ total: 0, reported: 0, in_progress: 0, resolved: 0 });
  
  // Update Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedIssue, setSelectedIssue] = useState(null);
  const [updateStatus, setUpdateStatus] = useState('');
  const [updatePriority, setUpdatePriority] = useState('');
  const [govNotes, setGovNotes] = useState('');
  const [updating, setUpdating] = useState(false);

  // Delete Confirm
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

  // Filters State
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('date_desc');

  useEffect(() => {
    fetchIssues();
    fetchStats();
  }, []);

  const fetchIssues = async () => {
    try {
      setLoading(true);
      const res = await api.get('/api/issues/all');
      setIssues(res.data);
    } catch (error) {
      toast.error('Failed to load issues');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const res = await api.get('/api/issues/stats');
      setStats(res.data);
    } catch (error) {
      console.error('Stats fetch error:', error);
    }
  };

  const handleUpdateClick = (issue) => {
    setSelectedIssue(issue);
    setUpdateStatus(issue.status || 'reported');
    setUpdatePriority(issue.priority || 'medium');
    setGovNotes(issue.governmentNotes || '');
    setIsModalOpen(true);
  };

  const submitStatusUpdate = async () => {
    try {
      setUpdating(true);
      const res = await api.patch(`/api/issues/${selectedIssue._id}/status`, { 
        status: updateStatus,
        governmentNotes: govNotes,
        priority: updatePriority
      });
      toast.success('Issue updated successfully');
      
      // Update local state with server response
      setIssues(issues.map(i => i._id === selectedIssue._id ? res.data : i));
      setIsModalOpen(false);
      // Refresh stats after update
      fetchStats();
    } catch (error) {
      toast.error('Failed to update status');
      console.error(error);
    } finally {
      setUpdating(false);
    }
  };

  const handleDelete = async (issueId) => {
    try {
      await api.delete(`/api/issues/${issueId}`);
      toast.success('Issue deleted');
      setIssues(issues.filter(i => i._id !== issueId));
      setDeleteConfirmId(null);
      fetchStats();
    } catch (error) {
      toast.error('Failed to delete issue');
      console.error(error);
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'reported': return 'bg-red-50 text-red-700 border-red-200';
      case 'in_progress': return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      case 'resolved': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      default: return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case 'reported': return <AlertCircle className="w-4 h-4 mr-1.5 inline" />;
      case 'in_progress': return <AlertTriangle className="w-4 h-4 mr-1.5 inline" />;
      case 'resolved': return <CheckCircle className="w-4 h-4 mr-1.5 inline" />;
      default: return null;
    }
  };

  const getPriorityColor = (priority) => {
    switch(priority) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-300';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'medium': return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'low': return 'bg-slate-100 text-slate-600 border-slate-300';
      default: return 'bg-slate-100 text-slate-600 border-slate-300';
    }
  };

  // Filtered and Sorted Issues
  const filteredIssues = issues.filter(issue => {
    if (statusFilter !== 'all' && issue.status !== statusFilter) return false;
    if (searchQuery && !issue.title.toLowerCase().includes(searchQuery.toLowerCase()) 
        && !(issue.address || '').toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const sortedAndFilteredIssues = [...filteredIssues].sort((a, b) => {
    if (sortBy === 'date_desc') return new Date(b.createdAt) - new Date(a.createdAt);
    if (sortBy === 'date_asc') return new Date(a.createdAt) - new Date(b.createdAt);
    if (sortBy === 'upvotes_desc') return (b.upvotes || 0) - (a.upvotes || 0);
    
    if (sortBy.startsWith('priority_')) {
      const pLevel = { critical: 4, high: 3, medium: 2, low: 1 };
      const getP = (issue) => pLevel[issue.priority || issue.aiAnalysis?.suggestedPriority || 'medium'] || 0;
      if (sortBy === 'priority_desc') return getP(b) - getP(a);
      if (sortBy === 'priority_asc') return getP(a) - getP(b);
    }
    return 0;
  });

  // === Stats Cards Config ===
  const statCards = [
    { label: 'Total Issues', value: stats.total, icon: BarChart3, color: 'from-brand-navy to-brand-blue', textColor: 'text-white' },
    { label: 'Reported', value: stats.reported, icon: AlertCircle, color: 'from-red-500 to-red-600', textColor: 'text-white' },
    { label: 'In Progress', value: stats.in_progress, icon: TrendingUp, color: 'from-amber-400 to-amber-500', textColor: 'text-white' },
    { label: 'Resolved', value: stats.resolved, icon: CheckCircle, color: 'from-emerald-500 to-emerald-600', textColor: 'text-white' },
  ];

  return (
    <div className="flex bg-slate-50 min-h-[calc(100vh-64px)] relative">
      {/* Decorative gradient background blob */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-brand-blue/5 rounded-full blur-3xl pointer-events-none"></div>
      <GovSidebar />
      
      <main className="flex-1 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
            <div>
              <h1 className="text-3xl font-bold text-brand-navy">Dashboard</h1>
              <p className="text-slate-500 mt-1">Manage and track incoming civic issues.</p>
            </div>
            
            <div className="flex gap-3">
              <div className="relative">
                <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input 
                  type="text" 
                  placeholder="Search issues..." 
                  className="input-field pl-10 w-full md:w-64"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="relative min-w-[150px]">
                <Filter className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <select 
                  className="input-field pl-9 appearance-none"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="all">All Status</option>
                  <option value="reported">Reported</option>
                  <option value="in_progress">In Progress</option>
                  <option value="resolved">Resolved</option>
                </select>
              </div>
              <div className="relative min-w-[150px]">
                <ArrowUpDown className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <select 
                  className="input-field pl-9 appearance-none"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                >
                  <option value="date_desc">Newest First</option>
                  <option value="date_asc">Oldest First</option>
                  <option value="priority_desc">Highest Priority</option>
                  <option value="priority_asc">Lowest Priority</option>
                  <option value="upvotes_desc">Most Upvoted</option>
                </select>
              </div>
            </div>
          </div>

          {/* Statistics Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {statCards.map((card, idx) => (
              <div key={idx} className={`bg-gradient-to-br ${card.color} rounded-2xl p-6 shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300 transform group`}>
                <div className="flex items-center justify-between mb-4">
                  <span className={`text-sm font-semibold ${card.textColor} opacity-90 tracking-wide uppercase`}>{card.label}</span>
                  <div className="bg-white/20 p-2 rounded-lg group-hover:scale-110 transition-transform">
                    <card.icon className={`w-5 h-5 ${card.textColor}`} />
                  </div>
                </div>
                <p className={`text-4xl font-bold ${card.textColor}`}>{card.value}</p>
              </div>
            ))}
          </div>

          <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-sm border border-slate-200/60 overflow-hidden relative z-10">
            {/* Result count */}
            {!loading && (
              <div className="px-6 py-3 border-b border-slate-100 text-sm text-slate-500">
                Showing <span className="font-semibold text-brand-navy">{sortedAndFilteredIssues.length}</span> of <span className="font-semibold text-brand-navy">{issues.length}</span> issues
              </div>
            )}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-sm font-semibold text-slate-500 tracking-wide uppercase">
                    <th className="py-5 px-6">Issue Details</th>
                    <th className="py-5 px-6 hidden lg:table-cell">Priority / AI</th>
                    <th className="py-5 px-6 hidden lg:table-cell">Date Reported</th>
                    <th className="py-5 px-6 text-center">Engagement</th>
                    <th className="py-5 px-6">Status</th>
                    <th className="py-5 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {loading ? (
                    [...Array(5)].map((_, i) => (
                      <tr key={`skeleton-${i}`} className="animate-pulse">
                        <td className="py-5 px-6">
                          <div className="flex gap-4">
                            <div className="w-12 h-12 rounded-xl bg-slate-200 shrink-0"></div>
                            <div className="flex-1">
                              <div className="h-4 bg-slate-200 rounded w-3/4 mb-2"></div>
                              <div className="h-3 bg-slate-100 rounded w-1/2"></div>
                            </div>
                          </div>
                        </td>
                        <td className="py-5 px-6 hidden lg:table-cell"><div className="h-6 bg-slate-200 rounded w-20 mb-1"></div><div className="h-3 bg-slate-100 rounded w-16"></div></td>
                        <td className="py-5 px-6 hidden lg:table-cell"><div className="h-4 bg-slate-200 rounded w-24"></div></td>
                        <td className="py-5 px-6 text-center"><div className="h-8 bg-slate-200 rounded w-12 mx-auto"></div></td>
                        <td className="py-5 px-6"><div className="h-6 bg-slate-200 rounded-full w-24"></div></td>
                        <td className="py-5 px-6 text-right"><div className="h-8 bg-slate-200 rounded w-20 ml-auto"></div></td>
                      </tr>
                    ))
                  ) : sortedAndFilteredIssues.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="py-16 text-center text-slate-500">
                        <div className="bg-slate-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3">
                          <Search className="w-8 h-8 text-slate-400" />
                        </div>
                        <p className="text-lg font-medium text-brand-navy">No issues found</p>
                        <p className="text-sm">Try adjusting your filters or search query.</p>
                      </td>
                    </tr>
                  ) : (
                    sortedAndFilteredIssues.map((issue) => (
                      <tr key={issue._id} className="hover:bg-brand-pale/30 transition-all duration-300 border-l-4 border-transparent hover:border-l-brand-blue relative group">
                        <td className="py-5 px-6">
                          <div className="flex items-start gap-4">
                            {issue.photoUrl ? (
                              <img 
                                src={issue.photoUrl} 
                                alt="thumbnail" 
                                className="w-12 h-12 rounded-xl object-cover bg-slate-100 shadow-sm shrink-0" 
                                onError={(e) => { e.target.onerror = null; e.target.src = 'https://dummyimage.com/100x100/f8fafc/94a3b8&text=Err' }}
                              />
                            ) : (
                              <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center shrink-0 border border-slate-200/60">
                                <AlertTriangle className="w-5 h-5 text-slate-400" />
                              </div>
                            )}
                            <div>
                              <Link to={`/gov/issues/${issue._id}`} className="font-bold text-brand-navy text-base line-clamp-1 hover:text-brand-blue transition-colors">
                                {issue.title}
                              </Link>
                              
                              <div className="flex flex-wrap items-center gap-2 mt-1.5">
                                <span className="bg-slate-100 text-slate-700 font-bold px-2 py-0.5 rounded text-[10px] uppercase tracking-wider border border-slate-200 shadow-sm">
                                  {issue.category}
                                </span>
                                <div className="w-1 h-1 rounded-full bg-slate-300"></div>
                                <div className="flex items-center gap-1 text-xs text-slate-500">
                                  <MapPin className="w-3 h-3" />
                                  <span className="line-clamp-1 max-w-[180px]">{issue.address || "Location Attached"}</span>
                                </div>
                              </div>
                              
                              {issue.governmentNotes && (
                                <div className="flex items-center gap-1 mt-1.5 text-xs text-blue-600 bg-blue-50/50 w-fit px-2 py-0.5 rounded border border-blue-100/50">
                                  <FileText className="w-3 h-3" />
                                  <span className="line-clamp-1 max-w-[200px]">{issue.governmentNotes}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="py-5 px-6 hidden lg:table-cell">
                          <div className="flex flex-col items-start gap-1.5">
                            <span className={`px-2.5 py-1 rounded-md text-xs font-bold border shadow-sm ${getPriorityColor(issue.priority || issue.aiAnalysis?.suggestedPriority)}`}>
                              {(issue.priority || issue.aiAnalysis?.suggestedPriority || 'medium').toUpperCase()}
                            </span>
                            {issue.aiAnalysis?.confidenceScore && (
                              <span className="text-[10px] text-slate-500 font-semibold ml-0.5 flex items-center gap-1">
                                <TrendingUp className="w-3 h-3"/> AI Match {Math.round(issue.aiAnalysis.confidenceScore * 100)}%
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-5 px-6 hidden lg:table-cell">
                          <div className="flex items-center text-slate-500 text-sm font-medium">
                            <Clock className="w-4 h-4 mr-1.5 shrink-0" />
                            {new Date(issue.createdAt).toLocaleDateString()}
                          </div>
                        </td>
                        <td className="py-5 px-6 text-center">
                          <div className="flex flex-col items-center justify-center">
                            <span className="text-lg font-black text-brand-navy">{issue.upvotes || 0}</span>
                            <span className="text-[9px] text-brand-blue uppercase tracking-widest font-bold flex items-center gap-0.5 mt-0.5 bg-brand-pale px-1.5 py-0.5 rounded border border-brand-blue/20">
                              <ArrowUp className="w-2.5 h-2.5"/> Votes
                            </span>
                          </div>
                        </td>
                        <td className="py-5 px-6">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-bold border inline-flex items-center ${getStatusColor(issue.status)}`}>
                            {getStatusIcon(issue.status)}
                            {issue.status ? issue.status.replace('_', ' ').toUpperCase() : 'REPORTED'}
                          </span>
                        </td>
                        <td className="py-5 px-6 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button 
                              onClick={() => handleUpdateClick(issue)}
                              className="bg-brand-navy/5 text-brand-navy hover:bg-brand-navy hover:text-white text-xs font-bold px-4 py-2 rounded-xl transition-all shadow-sm flex items-center justify-center gap-1"
                            >
                              Update ...
                            </button>
                            {deleteConfirmId === issue._id ? (
                              <div className="flex gap-1">
                                <button onClick={() => handleDelete(issue._id)} className="bg-red-600 text-white text-xs px-2 py-1.5 rounded-lg hover:bg-red-700">Yes</button>
                                <button onClick={() => setDeleteConfirmId(null)} className="bg-slate-200 text-slate-600 text-xs px-2 py-1.5 rounded-lg hover:bg-slate-300">No</button>
                              </div>
                            ) : (
                              <button 
                                onClick={() => setDeleteConfirmId(issue._id)}
                                className="text-slate-400 hover:text-red-500 p-1.5 rounded-lg hover:bg-red-50 transition-colors"
                                title="Delete issue"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>

      {/* Update Status Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6 overflow-hidden animate-fade-up max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold text-brand-navy mb-1">Update Issue</h3>
            <p className="text-sm text-slate-500 mb-5">
              Managing: <span className="font-semibold text-brand-navy">{selectedIssue?.title}</span>
            </p>
            
            <div className="space-y-5">
              {/* Status Selection */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Status</label>
                <div className="grid grid-cols-1 gap-2">
                  <label className={`border rounded-xl p-3 flex items-center cursor-pointer transition-all ${updateStatus === 'reported' ? 'border-red-500 bg-red-50' : 'border-slate-200 hover:bg-slate-50'}`}>
                    <input type="radio" name="status" value="reported" className="hidden" checked={updateStatus === 'reported'} onChange={() => setUpdateStatus('reported')} />
                    <AlertCircle className={`w-5 h-5 mr-3 ${updateStatus === 'reported' ? 'text-red-500' : 'text-slate-400'}`} />
                    <div className="flex-1">
                      <p className={`font-semibold ${updateStatus === 'reported' ? 'text-red-700' : 'text-slate-700'}`}>Reported</p>
                      <p className="text-xs text-slate-500">Issue is open and awaiting action.</p>
                    </div>
                  </label>
                  
                  <label className={`border rounded-xl p-3 flex items-center cursor-pointer transition-all ${updateStatus === 'in_progress' ? 'border-yellow-500 bg-yellow-50' : 'border-slate-200 hover:bg-slate-50'}`}>
                    <input type="radio" name="status" value="in_progress" className="hidden" checked={updateStatus === 'in_progress'} onChange={() => setUpdateStatus('in_progress')} />
                    <AlertTriangle className={`w-5 h-5 mr-3 ${updateStatus === 'in_progress' ? 'text-yellow-500' : 'text-slate-400'}`} />
                    <div className="flex-1">
                      <p className={`font-semibold ${updateStatus === 'in_progress' ? 'text-yellow-700' : 'text-slate-700'}`}>In Progress</p>
                      <p className="text-xs text-slate-500">Work has begun to resolve the issue.</p>
                    </div>
                  </label>
                  
                  <label className={`border rounded-xl p-3 flex items-center cursor-pointer transition-all ${updateStatus === 'resolved' ? 'border-emerald-500 bg-emerald-50' : 'border-slate-200 hover:bg-slate-50'}`}>
                    <input type="radio" name="status" value="resolved" className="hidden" checked={updateStatus === 'resolved'} onChange={() => setUpdateStatus('resolved')} />
                    <CheckCircle className={`w-5 h-5 mr-3 ${updateStatus === 'resolved' ? 'text-emerald-500' : 'text-slate-400'}`} />
                    <div className="flex-1">
                      <p className={`font-semibold ${updateStatus === 'resolved' ? 'text-emerald-700' : 'text-slate-700'}`}>Resolved</p>
                      <p className="text-xs text-slate-500">Issue has been successfully addressed.</p>
                    </div>
                  </label>
                </div>
              </div>

              {/* Priority Override */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Priority</label>
                <select 
                  value={updatePriority} 
                  onChange={(e) => setUpdatePriority(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-brand-mid outline-none transition-all bg-white text-sm"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="critical">Critical</option>
                </select>
              </div>

              {/* Government Notes */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Officer Notes</label>
                <textarea
                  value={govNotes}
                  onChange={(e) => setGovNotes(e.target.value)}
                  rows={3}
                  placeholder="E.g. Crew dispatched, scheduled for next week, awaiting materials..."
                  className="w-full border border-slate-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-brand-mid outline-none transition-all resize-none text-sm"
                  maxLength={500}
                />
                <p className="text-xs text-slate-400 mt-1">These notes will be visible to the citizen who reported the issue.</p>
              </div>
              
              <div className="flex gap-3 mt-8">
                <button 
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-2.5 rounded-lg font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors"
                  disabled={updating}
                >
                  Cancel
                </button>
                <button 
                  onClick={submitStatusUpdate}
                  className="flex-1 py-2.5 rounded-lg font-semibold text-white bg-brand-blue hover:bg-blue-700 transition-colors shadow-sm disabled:opacity-70 flex justify-center items-center"
                  disabled={updating}
                >
                  {updating ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  ) : (
                    'Save Changes'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GovDashboard;
