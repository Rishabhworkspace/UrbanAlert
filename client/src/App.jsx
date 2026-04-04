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
import IssueDetail from './pages/IssueDetail';

import CitizenProfile from './pages/CitizenProfile';
import GovDashboard from './pages/GovDashboard';
import GovIssueDetail from './pages/GovIssueDetail';
const LiveMap = () => <div>Live Map Placeholder</div>;
const Analytics = () => <div>Analytics Placeholder</div>;
const GovProfile = () => <div>Gov Profile Placeholder</div>;
const NotFound = () => (
  <div style={{ minHeight: '80vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '1rem', textAlign: 'center' }}>
    <h1 style={{ fontSize: '4rem', fontWeight: 800, color: '#0F2D54', opacity: 0.2 }}>404</h1>
    <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#0F2D54', marginTop: '1rem' }}>Page Not Found</h2>
    <p style={{ color: '#64748b', marginTop: '0.5rem' }}>The page you're looking for doesn't exist or has been moved.</p>
    <a href="/" style={{ marginTop: '1.5rem', padding: '0.5rem 1.5rem', background: '#1B4F8A', color: 'white', borderRadius: '0.5rem', textDecoration: 'none', fontWeight: 600 }}>Go Home</a>
  </div>
);

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
            <Route path="/issues/:id" element={<ProtectedRoute role="citizen"><IssueDetail /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute role="citizen"><CitizenProfile /></ProtectedRoute>} />
            
            <Route path="/gov/dashboard" element={<ProtectedRoute role="government"><GovDashboard /></ProtectedRoute>} />
            <Route path="/gov/issues/:id" element={<ProtectedRoute role="government"><GovIssueDetail /></ProtectedRoute>} />
            <Route path="/gov/map" element={<ProtectedRoute role="government"><LiveMap /></ProtectedRoute>} />
            <Route path="/gov/analytics" element={<ProtectedRoute role="government"><Analytics /></ProtectedRoute>} />
            <Route path="/gov/profile" element={<ProtectedRoute role="government"><GovProfile /></ProtectedRoute>} />
            
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
      </Router>
    </AuthProvider>
  );
}

export default App;
