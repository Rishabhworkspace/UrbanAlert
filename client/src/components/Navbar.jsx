import React, { useContext, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { MapPin, LogOut, User as UserIcon, LayoutDashboard, FileText, Menu, X, ClipboardList, Users } from 'lucide-react';
import { AuthContext } from '../contexts/AuthContext';

const Navbar = () => {
  const { isAuthenticated, user, logout } = useContext(AuthContext);
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    setMobileOpen(false);
    navigate('/');
  };

  return (
    <nav className="bg-white shadow-sm border-b border-slate-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to={isAuthenticated ? (user?.role === 'government' ? '/gov/dashboard' : '/my-reports') : '/'} className="flex items-center space-x-2">
              <div className="bg-brand-blue p-1.5 rounded-lg">
                <MapPin className="text-white w-5 h-5" />
              </div>
              <span className="text-xl font-bold text-brand-navy">UrbanAlert</span>
            </Link>
          </div>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center space-x-3">
            {!isAuthenticated ? (
              <>
                <Link to="/login" className="text-slate-600 hover:text-brand-blue font-medium px-3 py-2 rounded-md transition-colors">
                  Login
                </Link>
                <Link to="/register" className="bg-brand-blue text-white hover:bg-brand-mid px-4 py-2 rounded-lg font-medium transition-colors">
                  Register
                </Link>
              </>
            ) : (
              <div className="flex items-center space-x-3">
                {user?.role === 'citizen' ? (
                  <>
                    <Link to="/report-issue" className="text-slate-600 hover:text-brand-blue font-medium px-3 py-2 rounded-md transition-colors flex items-center">
                      <FileText className="w-4 h-4 mr-1"/> Report Issue
                    </Link>
                    <Link to="/community-issues" className="text-slate-600 hover:text-brand-blue font-medium px-3 py-2 rounded-md transition-colors flex items-center">
                      <Users className="w-4 h-4 mr-1"/> Community Issues
                    </Link>
                    <Link to="/my-reports" className="text-slate-600 hover:text-brand-blue font-medium px-3 py-2 rounded-md transition-colors flex items-center">
                      <ClipboardList className="w-4 h-4 mr-1"/> My Reports
                    </Link>
                    <Link to="/profile" className="text-slate-600 hover:text-brand-blue font-medium p-2 rounded-full transition-colors">
                      <UserIcon className="w-5 h-5" />
                    </Link>
                  </>
                ) : (
                  <>
                    <Link to="/gov/dashboard" className="text-slate-600 hover:text-brand-blue font-medium px-3 py-2 rounded-md transition-colors flex items-center">
                      <LayoutDashboard className="w-4 h-4 mr-1"/> Dashboard
                    </Link>
                    <Link to="/gov/profile" className="text-slate-600 hover:text-brand-blue font-medium p-2 rounded-full transition-colors">
                      <UserIcon className="w-5 h-5" />
                    </Link>
                  </>
                )}
                <button onClick={handleLogout} className="text-red-600 hover:bg-red-50 p-2 rounded-full transition-colors" title="Logout">
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>

          {/* Mobile Hamburger */}
          <button className="md:hidden flex items-center p-2 text-slate-600" onClick={() => setMobileOpen(!mobileOpen)}>
            {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Dropdown */}
      {mobileOpen && (
        <div className="md:hidden bg-white border-t border-slate-200 shadow-lg animate-fade-in">
          <div className="px-4 py-3 space-y-2">
            {!isAuthenticated ? (
              <>
                <Link to="/login" onClick={() => setMobileOpen(false)} className="block px-3 py-2.5 rounded-lg text-slate-700 hover:bg-slate-50 font-medium">Login</Link>
                <Link to="/register" onClick={() => setMobileOpen(false)} className="block px-3 py-2.5 rounded-lg bg-brand-blue text-white text-center font-medium">Register</Link>
              </>
            ) : (
              <>
                {user?.role === 'citizen' ? (
                  <>
                    <Link to="/report-issue" onClick={() => setMobileOpen(false)} className="flex items-center px-3 py-2.5 rounded-lg text-slate-700 hover:bg-slate-50 font-medium">
                      <FileText className="w-4 h-4 mr-2"/> Report Issue
                    </Link>
                    <Link to="/community-issues" onClick={() => setMobileOpen(false)} className="flex items-center px-3 py-2.5 rounded-lg text-slate-700 hover:bg-slate-50 font-medium">
                      <Users className="w-4 h-4 mr-2"/> Community Issues
                    </Link>
                    <Link to="/my-reports" onClick={() => setMobileOpen(false)} className="flex items-center px-3 py-2.5 rounded-lg text-slate-700 hover:bg-slate-50 font-medium">
                      <ClipboardList className="w-4 h-4 mr-2"/> My Reports
                    </Link>
                    <Link to="/profile" onClick={() => setMobileOpen(false)} className="flex items-center px-3 py-2.5 rounded-lg text-slate-700 hover:bg-slate-50 font-medium">
                      <UserIcon className="w-4 h-4 mr-2"/> Profile
                    </Link>
                  </>
                ) : (
                  <>
                    <Link to="/gov/dashboard" onClick={() => setMobileOpen(false)} className="flex items-center px-3 py-2.5 rounded-lg text-slate-700 hover:bg-slate-50 font-medium">
                      <LayoutDashboard className="w-4 h-4 mr-2"/> Dashboard
                    </Link>
                    <Link to="/gov/profile" onClick={() => setMobileOpen(false)} className="flex items-center px-3 py-2.5 rounded-lg text-slate-700 hover:bg-slate-50 font-medium">
                      <UserIcon className="w-4 h-4 mr-2"/> Profile
                    </Link>
                  </>
                )}
                <button onClick={handleLogout} className="flex items-center w-full px-3 py-2.5 rounded-lg text-red-600 hover:bg-red-50 font-medium border-t border-slate-100 mt-2 pt-3">
                  <LogOut className="w-4 h-4 mr-2"/> Logout
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
