import React, { useState } from 'react';
import { useReports } from '../context/ReportContext';
import { GoogleSheetsModal } from './common/GoogleSheetsModal';
import { CloudDatabaseModal } from './common/CloudDatabaseModal';
import { 
  ClipboardCheck, 
  LayoutDashboard, 
  Smartphone, 
  Maximize2, 
  User, 
  CheckCircle2,
  RefreshCw,
  FileSpreadsheet,
  Database
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const { 
    activeView, 
    setActiveView, 
    isMobileFrame, 
    setIsMobileFrame, 
    activeMerchandiser, 
    setActiveMerchandiser,
    reports,
    resetToDefaults,
    sheetsWebhookUrl,
    isCloudConnected,
    isRealtimeActive
  } = useReports();

  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isSheetsModalOpen, setIsSheetsModalOpen] = useState(false);
  const [isCloudModalOpen, setIsCloudModalOpen] = useState(false);
  const [tempName, setTempName] = useState(activeMerchandiser.name);
  const [tempId, setTempId] = useState(activeMerchandiser.id);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (tempName.trim()) {
      setActiveMerchandiser({ name: tempName.trim(), id: tempId.trim() || 'CP-M01' });
      setIsEditingProfile(false);
    }
  };

  const todayCount = reports.filter(r => {
    const today = new Date().toISOString().split('T')[0];
    return r.formattedDate === today;
  }).length;

  return (
    <>
      <header className="sticky top-0 z-40 bg-[#1D100A]/90 backdrop-blur-xl text-[#FAF7F2] border-b border-white/10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14">
            {/* Brand Logo & Title */}
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-lg bg-stone-800 border border-white/15 flex items-center justify-center">
                <span className="font-serif font-black text-xs tracking-wider text-[#FDE68A]">CP</span>
              </div>
              <div>
                <div className="flex items-center space-x-1.5">
                  <span className="font-semibold text-sm tracking-tight text-white">Casa Pons</span>
                  <span className="text-[10px] text-stone-400 font-normal hidden sm:inline">• Field Ops</span>
                </div>
              </div>
            </div>

            {/* Navigation Mode Switcher Pills (Apple Segmented Style) */}
            <div className="flex items-center bg-white/10 p-0.5 rounded-full border border-white/5">
              <button
                onClick={() => setActiveView('merchandiser')}
                className={`flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-medium transition ${
                  activeView === 'merchandiser'
                    ? 'bg-white text-stone-900 shadow-xs'
                    : 'text-stone-300 hover:text-white'
                }`}
              >
                <ClipboardCheck className="w-3.5 h-3.5" />
                <span>Log Visit</span>
              </button>
              <button
                onClick={() => setActiveView('manager')}
                className={`flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-medium transition ${
                  activeView === 'manager'
                    ? 'bg-white text-stone-900 shadow-xs'
                    : 'text-stone-300 hover:text-white'
                }`}
              >
                <LayoutDashboard className="w-3.5 h-3.5" />
                <span>Dashboard</span>
                {todayCount > 0 && (
                  <span className="ml-1 px-1.5 py-0.2 rounded-full text-[9px] bg-emerald-500/20 text-emerald-300 font-mono">
                    {todayCount}
                  </span>
                )}
              </button>
            </div>

            {/* Right Utilities: Live Cloud Database, Mobile Frame Switcher & User Profile */}
            <div className="flex items-center space-x-1.5">
              {/* Real-time Cloud Database Button */}
              <button
                onClick={() => setIsCloudModalOpen(true)}
                title={isCloudConnected ? 'Connected to Live Cloud Database' : 'Connect Real-Time Cloud Database'}
                className={`flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium border transition ${
                  isCloudConnected
                    ? 'bg-emerald-950/70 hover:bg-emerald-950 text-emerald-300 border-emerald-700/60 shadow-2xs'
                    : 'bg-[#3D2314] hover:bg-[#4E2E1B] text-[#E5D5C5] border-[#5A3825]'
                }`}
              >
                <Database className={`w-3.5 h-3.5 ${isCloudConnected ? 'text-emerald-400' : 'text-stone-400'}`} />
                <span className="hidden sm:inline">
                  {isCloudConnected ? 'Live Cloud' : 'Connect Cloud'}
                </span>
                {isRealtimeActive && (
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse hidden sm:inline" />
                )}
              </button>

              {/* Mobile Simulator Frame Toggle (only helpful on large screens) */}
              <button
                onClick={() => setIsMobileFrame(!isMobileFrame)}
                title={isMobileFrame ? 'Switch to Full Screen View' : 'Preview in Mobile Device Bezel'}
                className="hidden md:flex items-center space-x-1 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-[#3D2314] hover:bg-[#4E2E1B] text-[#E5D5C5] border border-[#5A3825] transition"
              >
                {isMobileFrame ? (
                  <>
                    <Maximize2 className="w-3.5 h-3.5 text-[#FDE68A]" />
                    <span>Full View</span>
                  </>
                ) : (
                  <>
                    <Smartphone className="w-3.5 h-3.5 text-[#FDE68A]" />
                    <span>Mobile Frame</span>
                  </>
                )}
              </button>

              {/* Merchandiser Profile Pill */}
              <div className="relative">
              <button
                onClick={() => setIsEditingProfile(!isEditingProfile)}
                className="flex items-center space-x-2 px-2.5 py-1.5 rounded-lg text-xs bg-[#3D2314] hover:bg-[#4E2E1B] border border-[#5A3825] transition"
              >
                <div className="w-5 h-5 rounded-full bg-[#C87D32] text-white flex items-center justify-center font-bold text-[10px]">
                  {activeMerchandiser.name.charAt(0)}
                </div>
                <div className="text-left hidden lg:block">
                  <div className="text-xs font-medium text-white truncate max-w-[100px]">
                    {activeMerchandiser.name}
                  </div>
                  <div className="text-[10px] text-[#D1C7BD] font-mono leading-none">
                    {activeMerchandiser.id}
                  </div>
                </div>
              </button>

              {/* Profile Edit Dropdown Modal */}
              {isEditingProfile && (
                <div className="absolute right-0 mt-2 w-72 rounded-xl bg-[#2A1810] border border-[#5A3825] shadow-2xl p-4 z-50 animate-in fade-in slide-in-from-top-2">
                  <div className="flex items-center justify-between pb-2 mb-3 border-b border-[#4A2E20]">
                    <div className="flex items-center space-x-1.5 text-xs font-bold text-[#FDE68A]">
                      <User className="w-3.5 h-3.5" />
                      <span>Merchandiser Identity</span>
                    </div>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800/60 flex items-center">
                      <CheckCircle2 className="w-2.5 h-2.5 mr-1" /> Ready
                    </span>
                  </div>

                  <form onSubmit={handleSaveProfile} className="space-y-3">
                    <div>
                      <label className="block text-[11px] font-medium text-[#D1C7BD] mb-1">
                        Merchandiser Full Name
                      </label>
                      <input
                        type="text"
                        value={tempName}
                        onChange={(e) => setTempName(e.target.value)}
                        className="w-full px-2.5 py-1.5 rounded-lg bg-[#1D100A] border border-[#5A3825] text-white text-xs focus:outline-none focus:border-[#C87D32]"
                        placeholder="e.g. Karim Al Zaabi"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-medium text-[#D1C7BD] mb-1">
                        Employee Badge ID
                      </label>
                      <input
                        type="text"
                        value={tempId}
                        onChange={(e) => setTempId(e.target.value)}
                        className="w-full px-2.5 py-1.5 rounded-lg bg-[#1D100A] border border-[#5A3825] text-white text-xs font-mono focus:outline-none focus:border-[#C87D32]"
                        placeholder="e.g. CP-M12"
                      />
                    </div>
                    <div className="flex items-center justify-between pt-2">
                      <button
                        type="button"
                        onClick={resetToDefaults}
                        className="text-[10px] text-amber-400 hover:text-amber-300 flex items-center"
                        title="Reset sample reports"
                      >
                        <RefreshCw className="w-3 h-3 mr-1" /> Reset Data
                      </button>
                      <div className="flex space-x-1.5">
                        <button
                          type="button"
                          onClick={() => setIsEditingProfile(false)}
                          className="px-2.5 py-1 rounded-md text-xs text-[#D1C7BD] hover:bg-white/10"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="px-3 py-1 rounded-md text-xs font-semibold bg-[#C87D32] hover:bg-[#B45309] text-white shadow"
                        >
                          Save
                        </button>
                      </div>
                    </div>
                  </form>
                </div>
              )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Google Sheets Cloud Sync Modal */}
      <GoogleSheetsModal
        isOpen={isSheetsModalOpen}
        onClose={() => setIsSheetsModalOpen(false)}
      />

      {/* Supabase Realtime Cloud Database Modal */}
      <CloudDatabaseModal
        isOpen={isCloudModalOpen}
        onClose={() => setIsCloudModalOpen(false)}
      />
    </>
  );
};
