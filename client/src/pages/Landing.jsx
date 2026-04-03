import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  MapPin, Shield, Camera, Search, ArrowRight, Activity, 
  Users, CheckCircle, BarChart3, Zap
} from 'lucide-react';

const Landing = () => {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 font-sans overflow-hidden">
      {/* 
        HERO SECTION
        A premium, dynamic banner with geometric/gradient background.
      */}
      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden items-center justify-center flex flex-col min-h-[90vh]">
        {/* Dynamic Background Elements */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10">
          <div className="absolute -top-[10%] -right-[10%] w-[50%] h-[50%] rounded-full bg-brand-blue/10 blur-3xl animate-float" style={{ animationDuration: '8s' }}></div>
          <div className="absolute top-[20%] -left-[10%] w-[40%] h-[40%] rounded-full bg-blue-300/20 blur-3xl animate-float" style={{ animationDuration: '6s', animationDelay: '1s' }}></div>
          <div className="absolute bottom-[0%] right-[20%] w-[60%] h-[60%] rounded-full bg-indigo-200/20 blur-3xl animate-float" style={{ animationDuration: '10s' }}></div>
          
          {/* Subtle Grid Pattern */}
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMSIgY3k9IjEiIHI9IjEiIGZpbGw9InJnYmEoMCwgMCwgMCwgMC4wNSkiLz48L3N2Zz4=')] opacity-50 mask-image:linear-gradient(to_bottom,white,transparent)"></div>
        </div>

        <div className="container mx-auto px-6 relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 mt-8 md:mt-0 rounded-full bg-white/60 border border-white/80 shadow-sm backdrop-blur-sm text-brand-blue text-sm font-semibold mb-8 animate-fade-up" style={{ animationDelay: '0.1s' }}>
            <Zap size={16} className="text-yellow-500 fill-yellow-500" />
            <span>AI-Powered Civic Reporting Platform</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-extrabold text-brand-navy tracking-tight leading-tight mb-8 animate-fade-up" style={{ animationDelay: '0.2s' }}>
            Report. Track. <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-blue to-indigo-500">Resolve.</span>
          </h1>
          
          <p className="text-xl md:text-2xl text-slate-600 mb-12 max-w-3xl mx-auto animate-fade-up leading-relaxed" style={{ animationDelay: '0.3s' }}>
            Transform your city using community intelligence. Snap a photo of a civic issue, and let our AI analyze, route, and track it straight to local authorities.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-5 animate-fade-up" style={{ animationDelay: '0.4s' }}>
            <Link to="/register" className="w-full sm:w-auto px-8 py-4 bg-brand-blue hover:bg-brand-mid text-white rounded-xl font-bold text-lg shadow-lg shadow-brand-blue/30 transition-all hover:-translate-y-1 flex items-center justify-center gap-2">
              <Camera size={20} />
              Start Reporting
            </Link>
            <Link to="/gov/login" className="w-full sm:w-auto px-8 py-4 bg-white hover:bg-slate-50 text-brand-navy border border-slate-200 rounded-xl font-bold text-lg shadow-sm transition-all hover:-translate-y-1 flex items-center justify-center gap-2">
              <Shield size={20} className="text-slate-400" />
              Gov Portal Login
            </Link>
          </div>
        </div>
      </section>

      {/* 
        STATISTICS SECTION 
      */}
      <section className="py-12 bg-brand-navy text-white relative">
        {/* Subtle decorative line */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-brand-blue via-indigo-400 to-brand-blue"></div>
        
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center divide-y md:divide-y-0 md:divide-x divide-white/10">
            <div className="p-4">
              <h4 className="text-5xl font-black mb-2 text-transparent bg-clip-text bg-gradient-to-b from-white to-white/70">12K+</h4>
              <p className="text-brand-pale/70 font-medium tracking-wide uppercase text-sm">Issues Resolved</p>
            </div>
            <div className="p-4 pt-8 md:pt-4">
              <h4 className="text-5xl font-black mb-2 text-transparent bg-clip-text bg-gradient-to-b from-white to-white/70">48h</h4>
              <p className="text-brand-pale/70 font-medium tracking-wide uppercase text-sm">Average Response Time</p>
            </div>
            <div className="p-4 pt-8 md:pt-4">
              <h4 className="text-5xl font-black mb-2 text-transparent bg-clip-text bg-gradient-to-b from-white to-white/70">50+</h4>
              <p className="text-brand-pale/70 font-medium tracking-wide uppercase text-sm">Partnered Municipalities</p>
            </div>
          </div>
        </div>
      </section>

      {/* 
        HOW IT WORKS SECTION 
      */}
      <section className="py-24 bg-white relative">
        <div className="container mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-brand-blue font-semibold tracking-wider uppercase text-sm mb-3">Simple Process</h2>
            <h3 className="text-3xl md:text-4xl font-extrabold text-brand-navy mb-6">How UrbanAlert Works</h3>
            <p className="text-slate-600 text-lg">
              We've streamlined the process of reporting civic faults so you can make an impact in under 60 seconds anywhere, anytime.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
            {/* Connecting Line */}
            <div className="hidden md:block absolute top-[60px] left-[15%] w-[70%] h-0.5 bg-gradient-to-r from-brand-blue/10 via-brand-blue/40 to-brand-blue/10"></div>
            
            {/* Step 1 */}
            <div className="relative flex flex-col items-center text-center z-10 group">
              <div className="w-20 h-20 bg-brand-pale rounded-2xl flex items-center justify-center mb-6 shadow-sm border border-white group-hover:-translate-y-2 group-hover:shadow-lg transition-all duration-300 relative">
                <div className="absolute -top-3 -right-3 w-8 h-8 bg-brand-blue text-white rounded-full flex items-center justify-center font-bold border-4 border-white shadow-sm">1</div>
                <Camera size={32} className="text-brand-blue" />
              </div>
              <h4 className="text-xl font-bold text-brand-navy mb-3">Snap & Report</h4>
              <p className="text-slate-500 leading-relaxed">
                See a pothole, broken streetlight, or illegal dumping? Just snap a photo. We automatically grab the precise GPS coordinates to pinpoint the location.
              </p>
            </div>

            {/* Step 2 */}
            <div className="relative flex flex-col items-center text-center z-10 group">
              <div className="w-20 h-20 bg-brand-pale rounded-2xl flex items-center justify-center mb-6 shadow-sm border border-white group-hover:-translate-y-2 group-hover:shadow-lg transition-all duration-300 relative">
                <div className="absolute -top-3 -right-3 w-8 h-8 bg-brand-blue text-white rounded-full flex items-center justify-center font-bold border-4 border-white shadow-sm">2</div>
                <Activity size={32} className="text-brand-blue" />
              </div>
              <h4 className="text-xl font-bold text-brand-navy mb-3">AI Engine Analyzes</h4>
              <p className="text-slate-500 leading-relaxed">
                Our advanced AI categorizes the issue, determines its severity, and instantly routes it to the correct government department.
              </p>
            </div>

            {/* Step 3 */}
            <div className="relative flex flex-col items-center text-center z-10 group">
              <div className="w-20 h-20 bg-brand-pale rounded-2xl flex items-center justify-center mb-6 shadow-sm border border-white group-hover:-translate-y-2 group-hover:shadow-lg transition-all duration-300 relative">
                <div className="absolute -top-3 -right-3 w-8 h-8 bg-brand-blue text-white rounded-full flex items-center justify-center font-bold border-4 border-white shadow-sm">3</div>
                <CheckCircle size={32} className="text-brand-blue" />
              </div>
              <h4 className="text-xl font-bold text-brand-navy mb-3">Track to Resolution</h4>
              <p className="text-slate-500 leading-relaxed">
                Get real-time updates as city officials pick up the task and mark it resolved. A transparent civic process.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 
        FEATURES / PLATFORM BENEFITS SECTION 
      */}
      <section className="py-24 bg-slate-50 overflow-hidden">
        <div className="container mx-auto px-6">
          <div className="flex flex-col lg:flex-row items-center gap-16">
            
            {/* Features Info */}
            <div className="lg:w-1/2">
              <h2 className="text-brand-blue font-semibold tracking-wider uppercase text-sm mb-3">Core Features</h2>
              <h3 className="text-3xl md:text-4xl font-extrabold text-brand-navy mb-6">Designed for Citizens and Governments Alike</h3>
              <p className="text-slate-600 text-lg mb-10">
                UrbanAlert bridges the gap between those who experience civic problems and those who fix them, ensuring accountability and speed.
              </p>

              <div className="space-y-8">
                <div className="flex gap-4">
                  <div className="w-12 h-12 shrink-0 rounded-xl bg-blue-100 flex items-center justify-center shadow-sm">
                    <Search size={24} className="text-brand-blue" />
                  </div>
                  <div>
                    <h4 className="text-xl font-bold text-brand-navy mb-2">Smart Categorization</h4>
                    <p className="text-slate-600">Stop guessing which department handles what. Our Gemini AI model automatically classifies your uploaded image.</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-12 h-12 shrink-0 rounded-xl bg-indigo-100 flex items-center justify-center shadow-sm">
                    <MapPin size={24} className="text-indigo-600" />
                  </div>
                  <div>
                    <h4 className="text-xl font-bold text-brand-navy mb-2">Pinpoint Geolocation</h4>
                    <p className="text-slate-600">Accurate map markers prevent authorities from searching empty streets, speeding up resolution times.</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-12 h-12 shrink-0 rounded-xl bg-green-100 flex items-center justify-center shadow-sm">
                    <BarChart3 size={24} className="text-green-600" />
                  </div>
                  <div>
                    <h4 className="text-xl font-bold text-brand-navy mb-2">Advanced Gov Analytics</h4>
                    <p className="text-slate-600">Governments receive a powerful dashboard to prioritize high-severity problems and view heatmaps of their districts.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Interactive Mockup/Cards */}
            <div className="lg:w-1/2 w-full">
              <div className="relative">
                {/* Background Decor */}
                <div className="absolute inset-0 bg-gradient-to-tr from-brand-blue to-indigo-400 rounded-[2rem] transform rotate-3 opacity-20 scale-105"></div>
                <div className="absolute inset-0 bg-gradient-to-bl from-brand-blue to-indigo-400 rounded-[2rem] transform -rotate-3 opacity-20 scale-105"></div>
                
                {/* Main Mockup Container */}
                <div className="relative bg-white rounded-[2rem] shadow-2xl border border-slate-100 p-6 md:p-8">
                  {/* Mock Navbar */}
                  <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded bg-brand-blue flex items-center justify-center">
                        <Shield size={16} className="text-white" />
                      </div>
                      <span className="font-bold text-brand-navy">Dashboard</span>
                    </div>
                    <div className="flex gap-2">
                      <div className="w-3 h-3 rounded-full bg-slate-200"></div>
                      <div className="w-3 h-3 rounded-full bg-slate-200"></div>
                    </div>
                  </div>

                  {/* Mock Content */}
                  <div className="space-y-4">
                    {/* Mock Card 1 */}
                    <div className="bg-slate-50 rounded-xl p-4 flex items-start gap-4 border border-slate-100 transform transition-transform hover:-translate-y-1 hover:shadow-md cursor-pointer">
                      <div className="w-16 h-16 rounded-lg bg-orange-200 flex-shrink-0 relative overflow-hidden">
                        <img src="https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&q=80&w=200" alt="pothole" className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-start mb-1">
                          <h5 className="font-bold text-slate-800">Massive Pothole on 5th Ave</h5>
                          <span className="text-xs font-bold bg-yellow-100 text-yellow-800 px-2 py-1 rounded">Pending</span>
                        </div>
                        <p className="text-xs text-slate-500 mb-2">Reported 2h ago • Infrastructure</p>
                        <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                          <div className="bg-yellow-400 w-1/3 h-full"></div>
                        </div>
                      </div>
                    </div>

                    {/* Mock Card 2 */}
                    <div className="bg-slate-50 rounded-xl p-4 flex items-start gap-4 border border-slate-100 transform transition-transform hover:-translate-y-1 hover:shadow-md cursor-pointer">
                      <div className="w-16 h-16 rounded-lg bg-slate-200 flex-shrink-0 relative overflow-hidden">
                        <img src="https://images.unsplash.com/photo-1533903345306-15d1c30952de?auto=format&fit=crop&q=80&w=200" alt="garbage" className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-start mb-1">
                          <h5 className="font-bold text-slate-800">Illegal Dumping near Park</h5>
                          <span className="text-xs font-bold bg-green-100 text-green-800 px-2 py-1 rounded">Resolved</span>
                        </div>
                        <p className="text-xs text-slate-500 mb-2">Reported 1d ago • Sanitation</p>
                        <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                          <div className="bg-green-500 w-full h-full"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 
        CTA SECTION 
      */}
      <section className="py-20 relative overflow-hidden bg-brand-navy">
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-brand-blue via-brand-navy to-brand-navy"></div>
        <div className="container mx-auto px-6 relative z-10 text-center">
          <h2 className="text-4xl md:text-5xl font-extrabold text-white mb-6">Ready to improve your city?</h2>
          <p className="text-lg text-brand-pale/80 mb-10 max-w-2xl mx-auto">
            Join thousands of active citizens making a real difference. Your voice matters, and a better city is just a photo away.
          </p>
          <Link to="/register" className="inline-flex items-center gap-2 px-8 py-4 bg-white text-brand-navy rounded-xl font-bold text-lg shadow-xl shadow-white/10 transition-all hover:-translate-y-1 hover:bg-brand-pale group">
            Create an Account Now
            <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </section>

      {/* 
        FOOTER SKELETON 
      */}
      <footer className="bg-slate-900 border-t border-slate-800 py-12 text-slate-400">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-2">
              <MapPin className="text-brand-blue" />
              <span className="font-bold text-xl text-white tracking-tight">Urban<span className="text-brand-blue">Alert</span></span>
            </div>
            <div className="flex gap-6 text-sm">
              <Link to="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
              <Link to="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
              <Link to="/gov/login" className="hover:text-brand-blue transition-colors text-slate-300 font-medium">Government Login</Link>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-slate-800 text-center text-sm text-slate-500">
            &copy; {new Date().getFullYear()} UrbanAlert Platform. All rights reserved. Let's fix things together.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
