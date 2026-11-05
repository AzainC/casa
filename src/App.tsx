import React from 'react';
import { ReportProvider, useReports } from './context/ReportContext';
import { Navbar } from './components/Navbar';
import { VisitReportForm } from './components/merchandiser/VisitReportForm';
import { ManagerDashboard } from './components/manager/ManagerDashboard';
import { AdminPanel } from './components/admin/AdminPanel';
import { DeviceFrame } from './components/common/DeviceFrame';
import { ClipboardCheck, LayoutDashboard } from 'lucide-react';

const MainApp: React.FC = () => {
  const { activeView, setActiveView, isMobileFrame, reports } = useReports();

  return (
    <div className="min-h-screen bg-[#F5F5F7] text-stone-900 flex flex-col font-sans selection:bg-stone-900 selection:text-white">
      {/* Top Navigation */}
      <Navbar />

      {/* Main Content Area */}
      <main className="flex-1 pb-24 sm:pb-8">
        {activeView === 'admin' ? (
          <AdminPanel />
        ) : activeView === 'merchandiser' ? (
          <DeviceFrame enabled={isMobileFrame}>
            <VisitReportForm />
          </DeviceFrame>
        ) : (
          <ManagerDashboard />
        )}
      </main>

      {/* Mobile Bottom Navigation Bar (Docked like before, visible on mobile, hidden on desktop and in Admin) */}
      {activeView !== 'admin' && (
        <nav className="bottom-mobile-nav fixed bottom-0 left-0 right-0 z-40 bg-white/90 backdrop-blur-2xl border-t border-black/[0.08] px-6 pt-2 pb-[max(0.6rem,env(safe-area-inset-bottom))] flex items-center justify-around shadow-[0_-8px_24px_rgba(0,0,0,0.06)]">
          <button
            onClick={() => setActiveView('merchandiser')}
            className={`flex flex-col items-center space-y-0.5 py-1 px-4 rounded-xl transition ${
              activeView === 'merchandiser'
                ? 'text-stone-950 font-semibold'
                : 'text-stone-400 hover:text-stone-600'
            }`}
          >
            <ClipboardCheck className="w-5 h-5" />
            <span className="text-[10px] tracking-tight">Log Visit</span>
          </button>

          <div className="h-6 w-px bg-black/[0.06]" />

          <button
            onClick={() => setActiveView('manager')}
            className={`flex flex-col items-center space-y-0.5 py-1 px-4 rounded-xl transition relative ${
              activeView === 'manager'
                ? 'text-stone-950 font-semibold'
                : 'text-stone-400 hover:text-stone-600'
            }`}
          >
            <LayoutDashboard className="w-5 h-5" />
            <span className="text-[10px] tracking-tight">Manager Hub</span>
            {reports.length > 0 && (
              <span className="absolute -top-1 -right-1 px-1.5 py-0.2 rounded-full bg-stone-900 text-white text-[9px] font-mono font-medium">
                {reports.length}
              </span>
            )}
          </button>
        </nav>
      )}
    </div>
  );
};

export default function App() {
  return (
    <ReportProvider>
      <MainApp />
    </ReportProvider>
  );
}
