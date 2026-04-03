import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { MapPin, Clock, ArrowLeft, CheckCircle, AlertTriangle, AlertCircle, FileText, Tag, Zap, Shield, User, Save, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../api/axios';
import GovSidebar from '../components/GovSidebar';
import IssueMap from '../components/IssueMap';

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
    case 'reported': return <AlertCircle className="w-5 h-5" />;
    case 'in_progress': return <AlertTriangle className="w-5 h-5" />;
    case 'resolved': return <CheckCircle className="w-5 h-5" />;
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

const GovIssueDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [issue, setIssue] = useState(null);
  const [loading, setLoading] = useState(true);

  // Edit State
  const [editStatus, setEditStatus] = useState('');
  const [editPriority, setEditPriority] = useState('');
  const [editNotes, setEditNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    fetchIssue();
  }, [id]);

  const fetchIssue = async () => {
    try {
      setLoading(true);
      const { data } = await api.get(`/api/issues/${id}`);
      setIssue(data);
      setEditStatus(data.status || 'reported');
      setEditPriority(data.priority || data.aiAnalysis?.suggestedPriority || 'medium');
      setEditNotes(data.governmentNotes || '');
    } catch (err) {
      console.error(err);
      toast.error('Failed to load issue');
      navigate('/gov/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const { data } = await api.patch(`/api/issues/${id}/status`, {
        status: editStatus,
        priority: editPriority,
        governmentNotes: editNotes
      });
      setIssue(data);
      toast.success('Issue updated successfully');
      // Refetch to get populated statusHistory
      fetchIssue();
    } catch (err) {
      toast.error('Failed to update issue');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      setDeleting(true);
      await api.delete(`/api/issues/${id}`);
      toast.success('Issue deleted');
      navigate('/gov/dashboard');
    } catch (err) {
      toast.error('Failed to delete issue');
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex bg-slate-50 min-h-[calc(100vh-64px)]">
        <GovSidebar />
        <main className="flex-1 p-8">
          <div className="max-w-5xl mx-auto animate-pulse space-y-6">
            <div className="h-8 bg-slate-200 rounded w-1/3"></div>
            <div className="h-64 bg-slate-200 rounded-xl"></div>
            <div className="h-32 bg-slate-200 rounded-xl"></div>
          </div>
        </main>
      </div>
    );
  }

  if (!issue) return null;

  const priority = issue.priority || issue.aiAnalysis?.suggestedPriority || 'medium';
  const photoUrl = issue.photoUrl || 'https://placehold.co/800x400/f8fafc/94a3b8?text=No+Photo';
  const lat = issue.location?.coordinates?.[1];
  const lng = issue.location?.coordinates?.[0];

  return (
    <div className="flex bg-slate-50 min-h-[calc(100vh-64px)]">
      <GovSidebar />
      
      <main className="flex-1 p-8">
        <div className="max-w-5xl mx-auto">
          {/* Back Nav */}
          <Link to="/gov/dashboard" className="inline-flex items-center text-brand-blue hover:text-brand-navy font-medium mb-6 text-sm transition-colors">
            <ArrowLeft className="w-4 h-4 mr-1.5" />
            Back to Dashboard
          </Link>

          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6">
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-brand-navy">{issue.title}</h1>
              <div className="flex flex-wrap items-center gap-3 mt-3">
                <span className={`px-3 py-1 rounded-full text-sm font-bold border flex items-center gap-1.5 ${getStatusColor(issue.status)}`}>
                  {getStatusIcon(issue.status)}
                  {issue.status ? issue.status.replace('_', ' ').toUpperCase() : 'REPORTED'}
                </span>
                <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${getPriorityColor(priority)}`}>
                  {priority.toUpperCase()} PRIORITY
                </span>
                <span className="bg-brand-pale text-brand-navy px-2.5 py-1 rounded-full text-xs font-semibold border border-brand-blue/20">
                  {issue.category}
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Photo */}
              <div className="rounded-xl overflow-hidden border border-slate-200 bg-slate-100">
                <img 
                  src={photoUrl}
                  alt={issue.title}
                  className="w-full h-auto max-h-[350px] object-cover"
                  onError={(e) => { e.target.src = 'https://placehold.co/800x400/f8fafc/94a3b8?text=Image+Error' }}
                />
              </div>

              {/* Description */}
              <section className="bg-white rounded-xl border border-slate-200 p-6">
                <h2 className="text-lg font-bold text-brand-navy mb-3">Description</h2>
                <p className="text-slate-600 leading-relaxed whitespace-pre-wrap">{issue.description}</p>
              </section>

              {/* Status Timeline */}
              {issue.statusHistory && issue.statusHistory.length > 0 && (
                <section className="bg-white rounded-xl border border-slate-200 p-6">
                  <h2 className="text-lg font-bold text-brand-navy mb-4">Status Timeline</h2>
                  <div className="space-y-4">
                    {issue.statusHistory.map((entry, idx) => (
                      <div key={idx} className="flex gap-4">
                        <div className="flex flex-col items-center">
                          <div className={`w-3 h-3 rounded-full mt-1.5 ${
                            entry.status === 'resolved' ? 'bg-emerald-500' :
                            entry.status === 'in_progress' ? 'bg-yellow-500' : 'bg-red-500'
                          }`} />
                          {idx < issue.statusHistory.length - 1 && (
                            <div className="w-px h-full bg-slate-200 mt-1" />
                          )}
                        </div>
                        <div className="pb-4 flex-1">
                          <p className="text-sm font-bold text-brand-navy">
                            {entry.status?.replace('_', ' ').toUpperCase()}
                          </p>
                          <p className="text-xs text-slate-500 mt-0.5">
                            {new Date(entry.changedAt).toLocaleString()}
                            {entry.changedBy?.name && ` • by ${entry.changedBy.name}`}
                          </p>
                          {entry.note && (
                            <p className="text-sm text-slate-600 mt-1 bg-slate-50 rounded-lg p-2 border border-slate-100">
                              {entry.note}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* Reporter Info */}
              <section className="bg-white rounded-xl border border-slate-200 p-6">
                <h2 className="text-lg font-bold text-brand-navy mb-3 flex items-center gap-2">
                  <User className="w-5 h-5 text-brand-blue" />
                  Reporter Information
                </h2>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-slate-500 block">Name</span>
                    <span className="font-medium text-brand-navy">{issue.reportedBy?.name || 'Unknown'}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Email</span>
                    <span className="font-medium text-brand-navy">{issue.reportedBy?.email || 'Unknown'}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Date Reported</span>
                    <span className="font-medium text-brand-navy">{new Date(issue.createdAt).toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Upvotes</span>
                    <span className="font-medium text-brand-navy">{issue.upvotes || 0}</span>
                  </div>
                </div>
              </section>
            </div>

            {/* Sidebar — Management Controls */}
            <div className="space-y-6">
              {/* Update Controls */}
              <section className="bg-white rounded-xl border border-slate-200 p-6">
                <h3 className="text-sm font-bold text-brand-navy mb-4 flex items-center gap-2">
                  <Shield className="w-4 h-4 text-brand-blue" />
                  Manage Issue
                </h3>

                <div className="space-y-4">
                  {/* Status */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Status</label>
                    <select 
                      value={editStatus}
                      onChange={(e) => setEditStatus(e.target.value)}
                      className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-brand-mid outline-none bg-white"
                    >
                      <option value="reported">Reported</option>
                      <option value="in_progress">In Progress</option>
                      <option value="resolved">Resolved</option>
                    </select>
                  </div>

                  {/* Priority */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Priority</label>
                    <select 
                      value={editPriority}
                      onChange={(e) => setEditPriority(e.target.value)}
                      className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-brand-mid outline-none bg-white"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="critical">Critical</option>
                    </select>
                  </div>

                  {/* Officer Notes */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Officer Notes</label>
                    <textarea
                      value={editNotes}
                      onChange={(e) => setEditNotes(e.target.value)}
                      rows={4}
                      placeholder="Add notes about resolution, crew dispatch, schedule..."
                      className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-brand-mid outline-none resize-none"
                      maxLength={500}
                    />
                    <p className="text-xs text-slate-400 mt-1">Visible to the reporting citizen.</p>
                  </div>

                  {/* Save Button */}
                  <button 
                    onClick={handleSave}
                    disabled={saving}
                    className="w-full bg-brand-blue text-white font-semibold py-2.5 rounded-lg hover:bg-blue-700 transition-colors shadow-sm disabled:opacity-70 flex items-center justify-center gap-2"
                  >
                    {saving ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        <Save className="w-4 h-4" />
                        Save Changes
                      </>
                    )}
                  </button>
                </div>
              </section>

              {/* Location */}
              <section className="bg-white rounded-xl border border-slate-200 p-6">
                <h3 className="text-sm font-bold text-brand-navy mb-3 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-brand-blue" />
                  Location
                </h3>
                <p className="text-sm text-slate-600 mb-3">{issue.address || 'GPS Coordinates Provided'}</p>
                {lat && lng && (
                  <div className="rounded-lg overflow-hidden border border-slate-200">
                    <IssueMap lat={lat} lng={lng} className="h-40 w-full" />
                  </div>
                )}
              </section>

              {/* AI Analysis */}
              {issue.aiAnalysis && (
                <section className="bg-white rounded-xl border border-slate-200 p-6">
                  <h3 className="text-sm font-bold text-brand-navy mb-3 flex items-center gap-2">
                    <Zap className="w-4 h-4 text-amber-500" />
                    AI Analysis
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-slate-500 font-medium">AI Priority</span>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-bold border ${getPriorityColor(issue.aiAnalysis.suggestedPriority)}`}>
                        {(issue.aiAnalysis.suggestedPriority || 'medium').toUpperCase()}
                      </span>
                    </div>
                    {issue.aiAnalysis.confidenceScore && (
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs text-slate-500 font-medium">Confidence</span>
                          <span className="text-xs font-bold text-brand-navy">{Math.round(issue.aiAnalysis.confidenceScore * 100)}%</span>
                        </div>
                        <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-brand-blue to-brand-navy rounded-full"
                            style={{ width: `${issue.aiAnalysis.confidenceScore * 100}%` }}
                          />
                        </div>
                      </div>
                    )}
                    {issue.aiAnalysis.autoTags?.length > 0 && (
                      <div>
                        <span className="text-xs text-slate-500 font-medium mb-2 block">Auto Tags</span>
                        <div className="flex flex-wrap gap-1.5">
                          {issue.aiAnalysis.autoTags.map((tag, idx) => (
                            <span key={idx} className="bg-slate-100 text-slate-600 text-xs px-2 py-0.5 rounded-full border border-slate-200 flex items-center gap-1">
                              <Tag className="w-3 h-3" />
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </section>
              )}

              {/* Danger Zone */}
              <section className="bg-red-50 rounded-xl border border-red-200 p-6">
                <h3 className="text-sm font-bold text-red-800 mb-3">Danger Zone</h3>
                {showDeleteConfirm ? (
                  <div>
                    <p className="text-sm text-red-700 mb-3">Are you sure? This action cannot be undone.</p>
                    <div className="flex gap-2">
                      <button 
                        onClick={handleDelete}
                        disabled={deleting}
                        className="flex-1 bg-red-600 text-white text-sm font-semibold py-2 rounded-lg hover:bg-red-700 disabled:opacity-70 flex items-center justify-center gap-1"
                      >
                        {deleting ? (
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                          <>
                            <Trash2 className="w-4 h-4" />
                            Delete
                          </>
                        )}
                      </button>
                      <button 
                        onClick={() => setShowDeleteConfirm(false)}
                        className="flex-1 bg-white text-slate-700 text-sm font-semibold py-2 rounded-lg border border-slate-200 hover:bg-slate-50"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <button 
                    onClick={() => setShowDeleteConfirm(true)}
                    className="w-full bg-white text-red-700 text-sm font-semibold py-2 rounded-lg border border-red-200 hover:bg-red-100 transition-colors flex items-center justify-center gap-2"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete This Issue
                  </button>
                )}
              </section>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default GovIssueDetail;
