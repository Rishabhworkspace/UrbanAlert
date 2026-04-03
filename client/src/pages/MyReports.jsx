import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Filter, LayoutGrid, AlertCircle } from 'lucide-react';
import api from '../api/axios';
import toast from 'react-hot-toast';
import IssueCard from '../components/IssueCard';

const MyReports = () => {
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchMyIssues();
  }, []);

  const fetchMyIssues = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/api/issues/my-reports');
      setIssues(data);
    } catch (err) {
      console.error(err);
      if (err.response?.status !== 401) {
        toast.error('Could not load your reports. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const filteredIssues = issues.filter(issue => {
    if (filter === 'all') return true;
    return issue.status === filter;
  });

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-brand-navy">My Reports</h1>
          <p className="text-slate-500 mt-2">Track the progress of civic issues you've reported.</p>
        </div>
        <Link to="/report-issue" className="btn-primary inline-flex items-center justify-center shrink-0">
          <Plus className="w-5 h-5 mr-2" />
          Report New Issue
        </Link>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1,2,3].map(i => (
             <div key={i} className="bg-white rounded-xl border border-slate-200 h-[400px] animate-pulse">
                <div className="h-48 bg-slate-200 rounded-t-xl" />
                <div className="p-5 space-y-4">
                  <div className="h-4 bg-slate-200 rounded w-3/4" />
                  <div className="h-4 bg-slate-200 rounded w-1/4" />
                  <div className="h-16 bg-slate-200 rounded" />
                </div>
             </div>
          ))}
        </div>
      ) : issues.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center max-w-2xl mx-auto mt-12">
          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <LayoutGrid className="w-8 h-8 text-slate-400" />
          </div>
          <h2 className="text-xl font-bold text-brand-navy mb-2">No reports yet</h2>
          <p className="text-slate-500 mb-6">You haven't reported any civic issues in your city. Be a responsible citizen and start reporting!</p>
          <Link to="/report-issue" className="btn-primary inline-flex">
            Report an Issue
          </Link>
        </div>
      ) : (
        <>
          <div className="flex flex-wrap items-center gap-2 mb-6">
            <Filter className="w-4 h-4 text-slate-400 mr-2" />
            <button onClick={() => setFilter('all')} className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${filter === 'all' ? 'bg-brand-navy text-white' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'}`}>
              All ({issues.length})
            </button>
            <button onClick={() => setFilter('reported')} className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${filter === 'reported' ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'}`}>
              Reported
            </button>
            <button onClick={() => setFilter('in_progress')} className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${filter === 'in_progress' ? 'bg-yellow-50 text-yellow-700 border border-yellow-200' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'}`}>
              In Progress
            </button>
            <button onClick={() => setFilter('resolved')} className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${filter === 'resolved' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'}`}>
              Resolved
            </button>
          </div>

          {filteredIssues.length === 0 ? (
            <div className="py-12 text-center">
              <AlertCircle className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h3 className="text-lg font-medium text-slate-800">No issues found</h3>
              <p className="text-slate-500">No reports match the selected filter.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredIssues.map((issue) => (
                <IssueCard key={issue._id} issue={issue} />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default MyReports;
