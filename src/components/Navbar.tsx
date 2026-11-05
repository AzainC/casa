import React, { useState } from 'react';
import { useReports } from '../context/ReportContext';
import {
  ClipboardCheck,
  LayoutDashboard,
  Smartphone,
  Maximize2,
  User,
  CheckCircle2
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const {
    activeView,
    setActiveView,
    isMobileFrame,
    setIsMobileFrame,
    activeMerchandiser,
    setActiveMerchandiser,
    reports
  } = useReports();

  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [tempName, setTempName] = useState(activeMerchandiser.name);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (tempName.trim()) {
      setActiveMerchandiser({ ...activeMerchandiser, name: tempName.trim() });
      setIsEditingProfile(false);
    }
  };

  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  const todayStr = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;

  const todayCount = reports.filter(r => {
    return r.formattedDate === todayStr || (r.timestamp && r.timestamp.startsWith(todayStr));
  }).length;

  return (
    <>
      <header className="sticky top-0 z-40 bg-white/85 backdrop-blur-2xl text-stone-900 border-b border-black/[0.06] transition-colors">
        <div className="max-w-6xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 gap-2">
            {/* Brand Logo & Title */}
            <div className="flex items-center space-x-2 shrink-0">
              <div className="w-8 h-8 flex items-center justify-center shadow-2xs">
                <img src="/logo.png" alt="Casa Pons Logo" className="w-6 h-6 object-contain" />
              </div>
              <div className="flex items-center space-x-1.5">
                <span className="font-semibold text-sm tracking-tight text-stone-950">Casa Pons</span>
                <span className="text-[10px] text-stone-400 font-medium hidden md:inline">Retail Operations</span>
              </div>
            </div>

            {/* Navigation Mode Switcher Pills (Hidden on Mobile, Visible on Tablet/Desktop) */}
            <div className="nav-desktop-switcher items-center bg-stone-200/60 p-1 rounded-full border border-black/[0.04]">
              <button
                onClick={() => setActiveView('merchandiser')}
                className={`flex items-center space-x-1.5 px-3.5 py-1 rounded-full text-xs transition duration-200 ${activeView === 'merchandiser'
                  ? 'bg-white text-stone-950 font-semibold shadow-[0_1px_3px_rgba(0,0,0,0.08)]'
                  : 'text-stone-500 hover:text-stone-900 font-medium'
                  }`}
              >
                <ClipboardCheck className="w-3.5 h-3.5" />
                <span>Log Visit</span>
              </button>
              <button
                onClick={() => setActiveView('manager')}
                className={`flex items-center space-x-1.5 px-3.5 py-1 rounded-full text-xs transition duration-200 ${activeView === 'manager'
                  ? 'bg-white text-stone-950 font-semibold shadow-[0_1px_3px_rgba(0,0,0,0.08)]'
                  : 'text-stone-500 hover:text-stone-900 font-medium'
                  }`}
              >
                <LayoutDashboard className="w-3.5 h-3.5" />
                <span>Manager Hub</span>
                {todayCount > 0 && (
                  <span className="ml-1 px-1.5 py-0.2 rounded-full text-[9px] bg-stone-900 text-white font-mono font-medium">
                    {todayCount}
                  </span>
                )}
              </button>
            </div>

            {/* Right Utilities: Simulator Frame (Desktop only) & Merchandiser Profile */}
            <div className="flex items-center space-x-1.5 shrink-0">
              {/* Mobile Simulator Frame Toggle (Desktop only) */}
              <button
                onClick={() => setIsMobileFrame(!isMobileFrame)}
                title={isMobileFrame ? 'Switch to Full Screen View' : 'Preview in Mobile Device Bezel'}
                className="hidden md:flex items-center space-x-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-stone-100/80 hover:bg-stone-200/60 text-stone-700 border border-black/[0.04] transition"
              >
                {isMobileFrame ? (
                  <>
                    <Maximize2 className="w-3.5 h-3.5 text-stone-700" />
                    <span>Full View</span>
                  </>
                ) : (
                  <>
                    <Smartphone className="w-3.5 h-3.5 text-stone-700" />
                    <span>Phone View</span>
                  </>
                )}
              </button>

              {/* Merchandiser Profile Pill */}
              <div className="relative">
                <button
                  onClick={() => setIsEditingProfile(!isEditingProfile)}
                  className="flex items-center space-x-1.5 px-2 py-1 rounded-full bg-stone-100/80 hover:bg-stone-200/60 border border-black/[0.04] transition active:scale-95"
                  title="Merchandiser Profile"
                >
                  <div className="w-6 h-6 rounded-full bg-stone-900 text-white flex items-center justify-center font-bold text-[10px]">
                    {activeMerchandiser.name.charAt(0)}
                  </div>
                  <div className="text-left hidden lg:block pr-1">
                    <div className="text-xs font-semibold text-stone-900 truncate max-w-[80px]">
                      {activeMerchandiser.name}
                    </div>
                  </div>
                </button>

                {/* Profile Edit Dropdown Modal */}
                {isEditingProfile && (
                  <div className="absolute right-0 mt-2 w-72 rounded-2xl bg-white/95 backdrop-blur-2xl border border-black/[0.08] shadow-2xl p-4 z-50 text-stone-800 animate-in fade-in zoom-in-95">
                    <div className="flex items-center justify-between pb-2.5 mb-3 border-b border-black/[0.06]">
                      <div className="flex items-center space-x-1.5 text-xs font-semibold text-stone-900 tracking-tight">
                        <User className="w-3.5 h-3.5 text-stone-500" />
                        <span>Merchandiser Identity</span>
                      </div>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/60 flex items-center">
                        <CheckCircle2 className="w-2.5 h-2.5 mr-1 text-emerald-600" /> Active
                      </span>
                    </div>

                    <form onSubmit={handleSaveProfile} className="space-y-3">
                      <div>
                        <label className="block text-[11px] font-medium text-stone-500 mb-1">
                          Merchandiser Full Name
                        </label>
                        <input
                          type="text"
                          value={tempName}
                          onChange={(e) => setTempName(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl bg-stone-50/80 border border-black/[0.08] text-stone-900 text-xs focus:bg-white focus:outline-none focus:border-stone-900/40 transition placeholder:text-stone-400 font-medium"
                          placeholder="Casapons"
                          required
                        />
                      </div>
                      <div className="flex items-center justify-end space-x-1.5 pt-2">
                        <button
                          type="button"
                          onClick={() => setIsEditingProfile(false)}
                          className="px-2.5 py-1.5 rounded-xl text-xs text-stone-500 hover:text-stone-800 transition"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-stone-900 hover:bg-stone-800 text-white shadow-2xs transition active:scale-95"
                        >
                          Save
                        </button>
                      </div>
                    </form>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>
    </>
  );
};
