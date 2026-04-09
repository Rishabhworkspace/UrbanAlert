import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';

// Public Pages
import Landing from './pages/Landing';
import Register from './pages/Register';
import CitizenLogin from './pages/CitizenLogin';
import GovLogin from './pages/GovLogin';

import ReportIssue from './pages/ReportIssue';
import MyReports from './pages/MyReports';
import CommunityIssues from './pages/CommunityIssues';
import IssueDetail from './pages/IssueDetail';

import CitizenProfile from './pages/CitizenProfile';
import GovDashboard from './pages/GovDashboard';
import GovIssueDetail from './pages/GovIssueDetail';
import GovProfile from './pages/GovProfile';
import GovMap from './pages/GovMap';
import GovAnalytics from './pages/GovAnalytics';
import NotFound from './pages/NotFound';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Navbar />
        <Toaster position="top-right" />
        <main className="min-h-screen bg-slate-50">
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/register" element={<Register />} />
            <Route path="/login" element={<CitizenLogin />} />
            <Route path="/gov/login" element={<GovLogin />} />
            
            <Route path="/report-issue" element={<ProtectedRoute role="citizen"><ReportIssue /></ProtectedRoute>} />
            <Route path="/my-reports" element={<ProtectedRoute role="citizen"><MyReports /></ProtectedRoute>} />
            <Route path="/community-issues" element={<ProtectedRoute role="citizen"><CommunityIssues /></ProtectedRoute>} />
            <Route path="/issues/:id" element={<ProtectedRoute role="citizen"><IssueDetail /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute role="citizen"><CitizenProfile /></ProtectedRoute>} />
            
            <Route path="/gov/dashboard" element={<ProtectedRoute role="government"><GovDashboard /></ProtectedRoute>} />
            <Route path="/gov/issues/:id" element={<ProtectedRoute role="government"><GovIssueDetail /></ProtectedRoute>} />
            <Route path="/gov/map" element={<ProtectedRoute role="government"><GovMap /></ProtectedRoute>} />
            <Route path="/gov/analytics" element={<ProtectedRoute role="government"><GovAnalytics /></ProtectedRoute>} />
            <Route path="/gov/profile" element={<ProtectedRoute role="government"><GovProfile /></ProtectedRoute>} />
            
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
      </Router>
    </AuthProvider>
  );
}

export default App;
