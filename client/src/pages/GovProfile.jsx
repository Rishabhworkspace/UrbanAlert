import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import GovSidebar from '../components/GovSidebar';
import { Shield, Mail, Building2, User, CheckCircle, Clock } from 'lucide-react';

const GovProfile = () => {
  const { user } = useAuth();

  return (
    <div className="flex bg-slate-50 min-h-[calc(100vh-64px)]">
      <GovSidebar />
      <main className="flex-1 p-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-brand-navy mb-2">Officer Profile</h1>
          <p className="text-slate-500 mb-8">Manage your government account details.</p>

          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden mb-8">
            <div className="h-32 bg-brand-navy bg-gradient-to-r from-brand-navy to-brand-blue"></div>
            <div className="px-8 pb-8">
              {/* Avatar */}
              <div className="w-24 h-24 rounded-xl bg-white p-2 shadow-md flex items-center justify-center -mt-12 mb-4 z-10 relative border border-slate-100">
                <div className="w-full h-full bg-slate-100 rounded-lg flex items-center justify-center">
                  <Shield className="w-10 h-10 text-brand-blue" />
                </div>
              </div>
              
              {/* User Identity */}
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-slate-800">{user?.name}</h2>
                <div className="flex items-center text-slate-500 mt-1 gap-4">
                  <span className="flex items-center gap-1"><Mail className="w-4 h-4" /> {user?.email}</span>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-8 border-t border-slate-100 pt-8">
                <div>
                  <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
                    <User className="w-5 h-5 text-brand-blue" /> Account Information
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-slate-500">Full Name</p>
                      <p className="font-medium text-slate-800">{user?.name}</p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-500">Official Email ID</p>
                      <p className="font-medium text-slate-800">{user?.email}</p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-500">Role level</p>
                      <p className="font-medium text-slate-800 capitalize">{user?.role}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
        </div>
      </main>
    </div>
  );
};

export default GovProfile;
