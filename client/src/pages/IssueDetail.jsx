import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { MapPin, Clock, ArrowUp, ArrowLeft, CheckCircle, AlertTriangle, AlertCircle, FileText, Tag, Zap, Shield } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../api/axios';
import IssueMap from '../components/IssueMap';
import { useAuth } from '../contexts/AuthContext';

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

const IssueDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [issue, setIssue] = useState(null);
  const [loading, setLoading] = useState(true);
  const [upvoting, setUpvoting] = useState(false);

  useEffect(() => {
    fetchIssue();
  }, [id]);

  const fetchIssue = async () => {
    try {
      setLoading(true);
      const { data } = await api.get(`/api/issues/${id}`);
      setIssue(data);
    } catch (err) {
      console.error(err);
      if (err.response?.status === 404) {
        toast.error('Issue not found');
        navigate('/my-reports');
      } else if (err.response?.status === 403) {
        toast.error('Not authorized to view this issue');
        navigate('/my-reports');
      } else {
        toast.error('Failed to load issue details');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleUpvote = async () => {
    try {
      setUpvoting(true);
      const { data } = await api.patch(`/api/issues/${id}/upvote`);
      setIssue(prev => ({ ...prev, upvotes: data.upvotes, upvotedBy: data.upvotedBy }));
      toast.success('Issue upvoted!');
    } catch (err) {
      if (err.response?.status === 400) {
        toast.error('You have already upvoted this issue');
      } else {
        toast.error('Failed to upvote');
      }
    } finally {
      setUpvoting(false);
    }
  };

  const userId = user?.id || user?._id;
  const hasUpvoted = issue?.upvotedBy?.some(u => {
    const uId = typeof u === 'object' ? (u._id || u.id) : u;
    return uId === userId;
  });

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto py-8 px-4">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-slate-200 rounded w-1/3"></div>
          <div className="h-64 bg-slate-200 rounded-xl"></div>
          <div className="h-4 bg-slate-200 rounded w-2/3"></div>
          <div className="h-4 bg-slate-200 rounded w-1/2"></div>
          <div className="h-32 bg-slate-200 rounded-xl"></div>
        </div>
      </div>
    );
  }

  if (!issue) {
    return (
      <div className="max-w-4xl mx-auto py-16 px-4 text-center">
        <h2 className="text-2xl font-bold text-brand-navy mb-2">Issue Not Found</h2>
        <p className="text-slate-500 mb-6">The issue you're looking for doesn't exist or has been removed.</p>
        <Link to="/my-reports" className="btn-primary">Back to My Reports</Link>
      </div>
    );
  }

  const priority = issue.priority || issue.aiAnalysis?.suggestedPriority || 'medium';
  const photoUrl = issue.photoUrl || 'https://dummyimage.com/800x400/f8fafc/94a3b8&text=No+Photo';
  const lat = issue.location?.coordinates?.[1];
  const lng = issue.location?.coordinates?.[0];

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      {/* Back Nav */}
      <Link to="/my-reports" className="inline-flex items-center text-brand-blue hover:text-brand-navy font-medium mb-6 text-sm transition-colors">
        <ArrowLeft className="w-4 h-4 mr-1.5" />
        Back to My Reports
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

        {/* Upvote Button */}
        <button 
          onClick={handleUpvote}
          disabled={upvoting || hasUpvoted}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold transition-all shadow-sm ${
            hasUpvoted 
              ? 'bg-brand-blue text-white cursor-not-allowed' 
              : 'bg-white border border-slate-200 text-brand-navy hover:bg-brand-pale hover:border-brand-blue/30'
          }`}
        >
          <ArrowUp className="w-5 h-5" />
          <span>{issue.upvotes || 0}</span>
          <span className="text-sm">{hasUpvoted ? 'Upvoted' : 'Upvote'}</span>
        </button>
      </div>

      {/* Photo */}
      <div className="rounded-xl overflow-hidden border border-slate-200 mb-8 bg-slate-100">
        <img 
          src={photoUrl}
          alt={issue.title}
          className="w-full h-auto max-h-[400px] object-cover"
          onError={(e) => { e.target.onerror = null; e.target.src = 'https://dummyimage.com/800x400/f8fafc/94a3b8&text=Image+Error' }}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Description */}
          <section className="bg-white rounded-xl border border-slate-200 p-6">
            <h2 className="text-lg font-bold text-brand-navy mb-3">Description</h2>
            <p className="text-slate-600 leading-relaxed whitespace-pre-wrap">{issue.description}</p>
          </section>

          {/* Government Notes */}
          {issue.governmentNotes && (
            <section className="bg-blue-50 rounded-xl border border-blue-200 p-6">
              <div className="flex items-center gap-2 mb-3">
                <FileText className="w-5 h-5 text-blue-600" />
                <h2 className="text-lg font-bold text-blue-800">Officer Update</h2>
              </div>
              <p className="text-blue-800 leading-relaxed">{issue.governmentNotes}</p>
              {issue.assignedTo && (
                <p className="text-xs text-blue-600 mt-3 font-medium">
                  Assigned to: {issue.assignedTo.name || 'Government Officer'}
                </p>
              )}
            </section>
          )}

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
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
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
                  <span className="text-xs text-slate-500 font-medium">Suggested Priority</span>
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
                        className="h-full bg-gradient-to-r from-brand-blue to-brand-navy rounded-full transition-all duration-500"
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

          {/* Meta Info */}
          <section className="bg-white rounded-xl border border-slate-200 p-6">
            <h3 className="text-sm font-bold text-brand-navy mb-3 flex items-center gap-2">
              <Shield className="w-4 h-4 text-brand-blue" />
              Details
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-500">Reported</span>
                <span className="font-medium text-brand-navy">{new Date(issue.createdAt).toLocaleDateString()}</span>
              </div>
              {issue.updatedAt && issue.updatedAt !== issue.createdAt && (
                <div className="flex justify-between">
                  <span className="text-slate-500">Last Updated</span>
                  <span className="font-medium text-brand-navy">{new Date(issue.updatedAt).toLocaleDateString()}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-slate-500">Upvotes</span>
                <span className="font-medium text-brand-navy">{issue.upvotes || 0}</span>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default IssueDetail;
