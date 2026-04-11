import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Filter, Users, AlertCircle } from 'lucide-react';
import api from '../api/axios';
import toast from 'react-hot-toast';
import IssueCard from '../components/IssueCard';

const CommunityIssues = () => {
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState('default');

  useEffect(() => {
    fetchCommunityIssues();
  }, []);

  const fetchCommunityIssues = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/api/issues/community');
      setIssues(data);
    } catch (err) {
      console.error(err);
      if (err.response?.status !== 401) {
        toast.error('Could not load community reports. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const filteredIssues = issues.filter(issue => {
    if (filter === 'all') return true;
    return issue.status === filter;
  });

  const sortedAndFilteredIssues = [...filteredIssues].sort((a, b) => {
    if (sortBy === 'upvotes_desc') return (b.upvotes || 0) - (a.upvotes || 0);
    if (sortBy === 'recent') return new Date(b.createdAt) - new Date(a.createdAt);
    if (sortBy === 'priority_desc') {
        const pLevel = { critical: 4, high: 3, medium: 2, low: 1 };
        return (pLevel[b.priority] || 0) - (pLevel[a.priority] || 0);
    }
    return 0; // default
  });

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-brand-navy">Community Issues</h1>
          <p className="text-slate-500 mt-2">See what's happening around your city and upvote issues.</p>
        </div>
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
            <Users className="w-8 h-8 text-slate-400" />
          </div>
          <h2 className="text-xl font-bold text-brand-navy mb-2">No Community Reports</h2>
          <p className="text-slate-500 mb-6">There are currently no civic issues reported in the community.</p>
          <Link to="/report-issue" className="btn-primary inline-flex">
            Be the First to Report
          </Link>
        </div>
      ) : (
        <>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div className="flex flex-wrap items-center gap-2">
              <Filter className="w-4 h-4 text-slate-400 mr-2 hidden sm:block" />
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
            
            <div className="min-w-[150px]">
              <select 
                value={sortBy} 
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full sm:w-auto bg-white border border-slate-200 text-slate-700 text-sm font-medium rounded-lg focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue block p-2 outline-none cursor-pointer shadow-sm hover:bg-slate-50 transition-colors"
              >
                <option value="default">Default Sort</option>
                <option value="recent">Most Recent</option>
                <option value="upvotes_desc">Most Upvoted</option>
                <option value="priority_desc">Highest Priority</option>
              </select>
            </div>
          </div>

          {sortedAndFilteredIssues.length === 0 ? (
            <div className="py-12 text-center bg-white rounded-xl border border-slate-200 mt-4">
              <AlertCircle className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h3 className="text-lg font-medium text-slate-800">No issues found</h3>
              <p className="text-slate-500">No reports match the selected filter.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {sortedAndFilteredIssues.map(issue => (
                <IssueCard key={issue._id} issue={issue} />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default CommunityIssues;
