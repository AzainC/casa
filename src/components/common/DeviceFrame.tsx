import React from 'react';
import { Smartphone, Wifi, Battery, Signal } from 'lucide-react';

interface DeviceFrameProps {
  children: React.ReactNode;
  enabled: boolean;
}

export const DeviceFrame: React.FC<DeviceFrameProps> = ({ children, enabled }) => {
  if (!enabled) {
    return <>{children}</>;
  }

  const now = new Date();
  const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });

  return (
    <div className="py-6 px-4 flex justify-center items-center min-h-[calc(100vh-4rem)] bg-stone-900/10">
      <div className="relative w-full max-w-[420px] rounded-[52px] bg-stone-900 p-3 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.4)] border-4 border-stone-800 ring-1 ring-white/10">
        {/* Device Top Bezel & Speaker / Dynamic Island */}
        <div className="absolute top-4 left-1/2 -translate-x-1/2 w-28 h-6 bg-black rounded-full z-50 flex items-center justify-between px-3">
          <div className="w-2.5 h-2.5 rounded-full bg-stone-800/80 border border-stone-700/60" />
          <div className="w-3 h-3 rounded-full bg-[#1E293B] border border-blue-900/40" />
        </div>

        {/* Screen Bezel Container */}
        <div className="rounded-[40px] overflow-hidden bg-[#FAF7F2] max-h-[820px] h-[820px] flex flex-col relative shadow-inner">
          {/* iOS-Style Status Bar */}
          <div className="h-10 bg-[#2A1810] text-white flex items-center justify-between px-7 shrink-0 text-xs font-semibold z-40 select-none">
            <span>{timeStr}</span>
            <div className="flex items-center space-x-1.5 text-stone-200">
              <Signal className="w-3.5 h-3.5" />
              <Wifi className="w-3.5 h-3.5" />
              <Battery className="w-4 h-4 text-emerald-400" />
            </div>
          </div>

          {/* Screen Scrollable Content */}
          <div className="flex-1 overflow-y-auto no-scrollbar pb-8">
            {children}
          </div>

          {/* iOS Bottom Home Bar */}
          <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-32 h-1 bg-stone-800/40 rounded-full pointer-events-none z-50" />
        </div>
      </div>
    </div>
  );
};
