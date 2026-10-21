import React from 'react';
import { ReportProvider, useReports } from './context/ReportContext';
import { Navbar } from './components/Navbar';
import { VisitReportForm } from './components/merchandiser/VisitReportForm';
import { ManagerDashboard } from './components/manager/ManagerDashboard';
import { DeviceFrame } from './components/common/DeviceFrame';
import { ClipboardCheck, LayoutDashboard } from 'lucide-react';

const MainApp: React.FC = () => {
  const { activeView, setActiveView, isMobileFrame, reports } = useReports();

  return (
    <div className="min-h-screen bg-[#FBF9F5] text-stone-900 flex flex-col font-sans selection:bg-[#C87D32]/20 selection:text-[#78350F]">
      {/* Top Navigation */}
      <Navbar />

      {/* Main Content Area */}
      <main className="flex-1 pb-16 sm:pb-8">
        {activeView === 'merchandiser' ? (
          <DeviceFrame enabled={isMobileFrame}>
            <VisitReportForm />
          </DeviceFrame>
        ) : (
          <ManagerDashboard />
        )}
      </main>

      {/* Mobile Floating Bottom Bar (visible on mobile / small screens) */}
      <nav className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#1D100A]/92 backdrop-blur-xl border-t border-white/[0.08] px-4 py-2 flex items-center justify-around shadow-lg">
        <button
          onClick={() => setActiveView('merchandiser')}
          className={`flex flex-col items-center space-y-0.5 py-1 px-4 rounded-xl transition ${
            activeView === 'merchandiser'
              ? 'text-white font-medium'
              : 'text-stone-400 hover:text-stone-200'
          }`}
        >
          <ClipboardCheck className="w-5 h-5" />
          <span className="text-[10px] tracking-tight">Log Visit</span>
        </button>

        <div className="h-5 w-px bg-white/10" />

        <button
          onClick={() => setActiveView('manager')}
          className={`flex flex-col items-center space-y-0.5 py-1 px-4 rounded-xl transition relative ${
            activeView === 'manager'
              ? 'text-white font-medium'
              : 'text-stone-400 hover:text-stone-200'
          }`}
        >
          <LayoutDashboard className="w-5 h-5" />
          <span className="text-[10px] tracking-tight">Manager Hub</span>
          {reports.length > 0 && (
            <span className="absolute -top-1 right-2 px-1 rounded-full bg-[#C87D32] text-white text-[9px] font-mono font-medium">
              {reports.length}
            </span>
          )}
        </button>
      </nav>
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
