import React, { useState, useRef, useEffect } from 'react';
import { MapPin, Clock, ArrowUp, CheckCircle, AlertTriangle, AlertCircle, FileText } from 'lucide-react';
import { Link } from 'react-router-dom';
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
    case 'reported': return <AlertCircle className="w-4 h-4 mr-1.5" />;
    case 'in_progress': return <AlertTriangle className="w-4 h-4 mr-1.5" />;
    case 'resolved': return <CheckCircle className="w-4 h-4 mr-1.5" />;
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

const getRelativeTime = (dateString) => {
  const diffDays = Math.floor((new Date() - new Date(dateString)) / (1000 * 60 * 60 * 24));
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  return `${diffDays} days ago`;
};

const IssueCard = ({ issue, isGov = false }) => {
  const { user } = useAuth();
  const [showVoters, setShowVoters] = useState(false);
  const popupRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (popupRef.current && !popupRef.current.contains(event.target)) {
        setShowVoters(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const photoUrl = issue.photoUrl || 'https://placehold.co/600x400/f8fafc/94a3b8?text=No+Photo';
  const statusStr = issue.status ? issue.status.replace('_', ' ').toUpperCase() : 'REPORTED';
  const priority = issue.priority || issue.aiAnalysis?.suggestedPriority || 'medium';

  const repName = issue.reportedBy?.name || 'Anonymous';
  const upvoterNames = (issue.upvotedBy || [])
    .map(u => u.name || 'Anonymous')
    .filter(n => n !== repName);
  
  const allReporters = [...new Set([repName, ...upvoterNames])];

  // If the logged-in user is one of the reporters, prioritize showing their name
  const isUserReporter = user?.name && allReporters.includes(user.name);
  const displayReporterName = isUserReporter ? user.name : repName;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition-all group flex flex-col h-full">
      <div className="relative h-48 overflow-hidden bg-slate-100">
        <img 
          src={photoUrl} 
          alt={issue.title} 
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
          onError={(e) => { e.target.src = 'https://placehold.co/600x400/f8fafc/94a3b8?text=Image+Error' }}
        />
        <div className="absolute top-3 left-3 flex gap-2">
          <span className={`px-2.5 py-1 rounded-full text-xs font-bold border flex items-center shadow-sm backdrop-blur-md bg-white/90 ${getStatusColor(issue.status)}`}>
            {getStatusIcon(issue.status)}
            {statusStr}
          </span>
          <span className={`px-2 py-1 rounded-full text-xs font-bold border shadow-sm backdrop-blur-md bg-white/90 ${getPriorityColor(priority)}`}>
            {priority.toUpperCase()}
          </span>
        </div>
      </div>
      
      <div className="p-5 flex-1 flex flex-col">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-bold text-lg text-brand-navy line-clamp-1 flex-1 pr-4" title={issue.title}>
            {issue.title}
          </h3>
          <span className="bg-brand-pale text-brand-navy text-xs font-semibold px-2 py-1 rounded border border-brand-blue/20 whitespace-nowrap">
            {issue.category}
          </span>
        </div>
        
        <p className="text-slate-500 text-sm line-clamp-2 mt-1 mb-3 flex-1">
          {issue.description}
        </p>

        {/* Government Notes Section */}
        {issue.governmentNotes && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-3">
            <div className="flex items-center gap-1.5 mb-1">
              <FileText className="w-3.5 h-3.5 text-blue-600" />
              <span className="text-xs font-bold text-blue-700 uppercase tracking-wider">Officer Update</span>
            </div>
            <p className="text-xs text-blue-800 line-clamp-2">{issue.governmentNotes}</p>
          </div>
        )}

        <div className="space-y-2 mt-auto pt-4 border-t border-slate-100">
          <div className="flex items-start text-xs text-slate-500">
            <MapPin className="w-4 h-4 mr-1.5 shrink-0 text-slate-400 mt-0.5" />
            <span className="line-clamp-1" title={issue.address || 'GPS coordinates'}>
              {issue.address || (issue.location?.coordinates ? `${issue.location.coordinates[1].toFixed(4)}, ${issue.location.coordinates[0].toFixed(4)}` : 'Location unknown')}
            </span>
          </div>
          
          <div className="text-xs text-slate-500 mb-3 border-b border-slate-50 pb-2">
            Reported by: <span className="font-medium text-slate-700">{displayReporterName}</span>
          </div>

          <div className="flex items-center justify-between text-xs text-slate-500">
            <div className="flex items-center">
              <Clock className="w-4 h-4 mr-1.5 text-slate-400" />
              <span>{getRelativeTime(issue.createdAt || new Date())}</span>
            </div>
            
            <div className="relative" ref={popupRef}>
              <button 
                onClick={(e) => { e.preventDefault(); setShowVoters(!showVoters); }}
                className="flex items-center text-brand-blue font-medium bg-brand-pale px-2 py-0.5 rounded-full border border-brand-blue/20 hover:bg-brand-blue/10 transition-colors"
                title="See who reported this"
              >
                <ArrowUp className="w-3 h-3 mr-1" />
                {issue.upvotes || 0}
              </button>
              
              {showVoters && (
                <div className="absolute bottom-full right-0 mb-2 w-48 bg-white border border-slate-200 shadow-xl rounded-lg p-3 z-20 text-left cursor-default">
                  <h4 className="text-xs font-bold text-slate-800 mb-2 border-b border-slate-100 pb-1">Reported by:</h4>
                  <ul className="text-xs text-slate-600 max-h-32 overflow-y-auto space-y-1">
                    {allReporters.map((name, idx) => (
                      <li key={idx} className="flex items-center">
                        <div className="w-1.5 h-1.5 rounded-full bg-brand-blue mr-2"></div>
                        <span className="truncate">{name}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
        
        <div className="mt-5">
           <Link 
            to={isGov ? `/gov/issues/${issue._id}` : `/issues/${issue._id}`} 
            className="w-full block text-center bg-slate-50 hover:bg-slate-100 text-brand-navy font-semibold py-2 rounded-lg border border-slate-200 transition-colors text-sm"
          >
            {isGov ? 'Manage Issue' : 'View Details'}
          </Link>
        </div>
      </div>
    </div>
  );
};

export default IssueCard;
