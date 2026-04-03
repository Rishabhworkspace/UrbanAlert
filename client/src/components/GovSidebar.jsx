import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Map as MapIcon, BarChart3, User, LogOut, MapPin, Building2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const GovSidebar = () => {
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/gov/login');
  };

  const navItems = [
    { name: 'Dashboard', path: '/gov/dashboard', icon: LayoutDashboard },
    { name: 'Live Map', path: '/gov/map', icon: MapIcon },
    { name: 'Analytics', path: '/gov/analytics', icon: BarChart3 },
    { name: 'Profile', path: '/gov/profile', icon: User },
  ];

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col h-[calc(100vh-64px)] overflow-y-auto sticky top-16">
      <div className="p-6 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="bg-brand-blue/20 p-2 rounded-lg">
            <Building2 className="w-6 h-6 text-brand-blue" />
          </div>
          <div>
            <h2 className="text-white font-bold tracking-tight leading-tight">Gov Portal</h2>
            <p className="text-slate-400 text-xs">Officer Dashboard</p>
          </div>
        </div>
      </div>
      
      <div className="flex-1 py-6 px-4">
        <p className="text-slate-500 text-xs font-semibold tracking-wider uppercase mb-3 px-3">Menu</p>
        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.name}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-brand-blue/10 text-brand-blue'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800'
                  }`
                }
              >
                <Icon className="w-5 h-5" />
                {item.name}
              </NavLink>
            );
          })}
        </nav>
      </div>

      <div className="p-4 border-t border-slate-800">
        <div className="bg-slate-800 rounded-lg p-3 mb-3">
          <p className="text-white text-sm font-medium truncate">{user?.name || 'Officer'}</p>
          <p className="text-slate-400 text-xs truncate">{user?.email || 'officer@gov.in'}</p>
        </div>
        <button 
          onClick={handleLogout}
          className="w-full flex justify-center items-center gap-2 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-red-400/10 rounded-lg transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Log Out
        </button>
      </div>
    </aside>
  );
};

export default GovSidebar;
