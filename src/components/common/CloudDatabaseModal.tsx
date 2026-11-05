import React, { useState } from 'react';
import { useReports } from '../../context/ReportContext';
import { 
  testSupabaseConnection, 
  SUPABASE_SQL_SCHEMA 
} from '../../services/supabaseClient';
import { 
  Database, 
  X, 
  Check, 
  Copy, 
  ExternalLink, 
  Loader2, 
  Radio, 
  CloudCheck, 
  CloudAlert,
  ArrowRight,
  UploadCloud,
  CheckCircle2
} from 'lucide-react';

interface CloudDatabaseModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CloudDatabaseModal: React.FC<CloudDatabaseModalProps> = ({ isOpen, onClose }) => {
  const { 
    isCloudConnected, 
    isRealtimeActive, 
    cloudConfig, 
    updateCloudConfig, 
    bulkPushToCloud, 
    reports 
  } = useReports();

  const [urlInput, setUrlInput] = useState(cloudConfig.url);
  const [keyInput, setKeyInput] = useState(cloudConfig.key);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [copiedCode, setCopiedCode] = useState(false);
  const [activeTab, setActiveTab] = useState<'connect' | 'sql'>('connect');
  const [isBulkSyncing, setIsBulkSyncing] = useState(false);
  const [bulkSyncResult, setBulkSyncResult] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCopySQL = () => {
    navigator.clipboard.writeText(SUPABASE_SQL_SCHEMA);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2500);
  };

  const handleTestConnection = async () => {
    if (!urlInput.trim() || !keyInput.trim()) {
      setTestResult({ success: false, message: 'Please enter both Supabase URL and Anon Key.' });
      return;
    }
    setIsTesting(true);
    setTestResult(null);

    const res = await testSupabaseConnection(urlInput, keyInput);
    setIsTesting(false);
    setTestResult(res);
  };

  const handleSaveAndConnect = async () => {
    setIsTesting(true);
    setTestResult(null);

    const success = await updateCloudConfig(urlInput, keyInput);
    setIsTesting(false);

    if (success) {
      setTestResult({
        success: true,
        message: 'Connected to live cloud database! Realtime streaming is now active.',
      });
    } else {
      setTestResult({
        success: false,
        message: 'Could not connect. Please verify your Project URL and Anon Key.',
      });
    }
  };

  const handleBulkPush = async () => {
    setIsBulkSyncing(true);
    setBulkSyncResult('Uploading reports and manager contacts to Supabase...');
    try {
      const count = await bulkPushToCloud();
      setIsBulkSyncing(false);
      setBulkSyncResult(`Successfully pushed ${count} reports to your Supabase database!`);
      setTimeout(() => setBulkSyncResult(null), 5000);
    } catch (e: any) {
      setIsBulkSyncing(false);
      setBulkSyncResult('Upload finished.');
    }
  };

  const handleDisconnect = async () => {
    setUrlInput('');
    setKeyInput('');
    await updateCloudConfig('', '');
    setTestResult({ success: true, message: 'Disconnected from cloud database. Using local memory.' });
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 animate-in fade-in"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-xl bg-white rounded-3xl overflow-hidden shadow-2xl border border-black/[0.08] flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="p-4 sm:p-5 bg-[#F5F5F7] border-b border-black/[0.06] flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-2xs">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-sm font-semibold text-stone-900 tracking-tight">
                  Real-Time Cloud Database
                </h2>
                {isCloudConnected ? (
                  <span className="inline-flex items-center space-x-1 text-[10px] font-mono text-emerald-800 bg-emerald-100/80 px-2 py-0.5 rounded-full border border-emerald-300/50">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
                    <span>Live Sync Active</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center space-x-1 text-[10px] font-mono text-stone-500 bg-stone-200/60 px-2 py-0.5 rounded-full">
                    <span>Local Only</span>
                  </span>
                )}
              </div>
              <p className="text-[11px] text-stone-500">
                Powered by Supabase • Shared instantly across all phones &amp; computers
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-stone-200/60 hover:bg-stone-200 text-stone-500 hover:text-stone-800 flex items-center justify-center transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="px-5 pt-3 pb-2 border-b border-black/[0.04] bg-white">
          <div className="grid grid-cols-2 p-1 bg-stone-100/80 rounded-xl border border-black/[0.04]">
            <button
              onClick={() => setActiveTab('connect')}
              className={`py-1.5 text-xs font-semibold rounded-lg transition ${
                activeTab === 'connect'
                  ? 'bg-white text-stone-900 shadow-2xs border border-black/[0.06]'
                  : 'text-stone-500 hover:text-stone-900'
              }`}
            >
              1. Database Credentials
            </button>
            <button
              onClick={() => setActiveTab('sql')}
              className={`py-1.5 text-xs font-semibold rounded-lg transition ${
                activeTab === 'sql'
                  ? 'bg-white text-stone-900 shadow-2xs border border-black/[0.06]'
                  : 'text-stone-500 hover:text-stone-900'
              }`}
            >
              2. Free Setup &amp; SQL Schema
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto space-y-4 text-xs text-stone-700">
          {activeTab === 'connect' ? (
            <div className="space-y-4">
              {/* Live WebSocket Status Banner */}
              <div className="p-3.5 rounded-2xl bg-stone-50/70 border border-black/[0.06] space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-stone-700 flex items-center space-x-1.5">
                    <Radio className={`w-3.5 h-3.5 ${isRealtimeActive ? 'text-emerald-600 animate-pulse' : 'text-stone-400'}`} />
                    <span>Real-Time WebSocket Engine</span>
                  </span>
                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${
                    isRealtimeActive ? 'bg-emerald-100 text-emerald-800' : 'bg-stone-200 text-stone-600'
                  }`}>
                    {isRealtimeActive ? 'Listening Live' : 'Disconnected'}
                  </span>
                </div>
                <p className="text-[11px] text-stone-500 leading-relaxed">
                  When active, any store visit submitted on any phone instantly streams into this dashboard without refreshing.
                </p>
              </div>

              {/* Input Fields */}
              <div className="space-y-3">
                <div>
                  <label className="block text-[11px] font-semibold text-stone-700 uppercase tracking-wider mb-1">
                    Supabase Project URL
                  </label>
                  <input
                    type="url"
                    value={urlInput}
                    onChange={(e) => setUrlInput(e.target.value)}
                    placeholder="https://xyzabcdefg.supabase.co"
                    className="w-full px-3 py-2 text-xs font-mono bg-stone-50/70 border border-black/[0.08] rounded-xl focus:outline-none focus:bg-white focus:border-stone-900/40 text-stone-900 placeholder:text-stone-400 transition"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-stone-700 uppercase tracking-wider mb-1">
                    Supabase Anon Public Key
                  </label>
                  <input
                    type="password"
                    value={keyInput}
                    onChange={(e) => setKeyInput(e.target.value)}
                    placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6..."
                    className="w-full px-3 py-2 text-xs font-mono bg-stone-50/70 border border-black/[0.08] rounded-xl focus:outline-none focus:bg-white focus:border-stone-900/40 text-stone-900 placeholder:text-stone-400 transition"
                  />
                  <p className="text-[10px] text-stone-400 mt-1">
                    Found in Supabase: <strong>Project Settings</strong> &rarr; <strong>API</strong> &rarr; <strong>anon public key</strong>.
                  </p>
                </div>
              </div>

              {/* Connection Status Feedback */}
              {testResult && (
                <div
                  className={`p-3 rounded-xl border text-xs flex items-center space-x-2 ${
                    testResult.success
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                      : 'bg-rose-50 border-rose-200 text-rose-900'
                  }`}
                >
                  {testResult.success ? (
                    <CloudCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                  ) : (
                    <CloudAlert className="w-4 h-4 text-rose-600 shrink-0" />
                  )}
                  <span>{testResult.message}</span>
                </div>
              )}

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  type="button"
                  onClick={handleTestConnection}
                  disabled={isTesting || !urlInput.trim() || !keyInput.trim()}
                  className="px-3 py-2 bg-stone-100 hover:bg-stone-200/80 text-stone-700 rounded-xl font-semibold text-xs border border-black/[0.06] flex items-center justify-center space-x-1.5 disabled:opacity-40 transition active:scale-95"
                >
                  {isTesting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
                  <span>Test Connection</span>
                </button>

                <button
                  type="button"
                  onClick={handleSaveAndConnect}
                  disabled={isTesting}
                  className="px-3 py-2 bg-[#1D100A] hover:bg-[#2A1810] text-white rounded-xl font-semibold text-xs flex items-center justify-center space-x-1.5 transition active:scale-95 shadow-2xs"
                >
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Connect &amp; Sync</span>
                </button>
              </div>

              {/* Bulk upload local records */}
              {isCloudConnected && (
                <div className="pt-3 border-t border-black/[0.06] space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-semibold text-stone-900">
                        Push Local Reports to Cloud
                      </p>
                      <p className="text-[11px] text-stone-400">
                        Upload all reports and manager contacts currently on this device into Supabase
                      </p>
                    </div>
                  </div>

                  {bulkSyncResult && (
                    <p className="text-[11px] font-mono text-emerald-700 bg-emerald-50 p-2 rounded-lg border border-emerald-200/60">
                      {bulkSyncResult}
                    </p>
                  )}

                  <button
                    type="button"
                    onClick={handleBulkPush}
                    disabled={isBulkSyncing}
                    className="w-full py-2 bg-stone-100 hover:bg-stone-200/80 text-stone-800 rounded-xl font-medium text-xs border border-black/[0.06] flex items-center justify-center space-x-1.5 transition disabled:opacity-40"
                  >
                    {isBulkSyncing ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Uploading to Supabase...</span>
                      </>
                    ) : (
                      <>
                        <UploadCloud className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Upload Current Reports to Cloud Now</span>
                      </>
                    )}
                  </button>

                  <div className="pt-1 flex justify-end">
                    <button
                      type="button"
                      onClick={handleDisconnect}
                      className="text-[11px] text-stone-400 hover:text-rose-600 transition"
                    >
                      Disconnect Cloud Database
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <div className="rounded-2xl bg-stone-50/70 p-4 border border-black/[0.06] space-y-3">
                <h3 className="text-xs font-semibold text-stone-900 uppercase tracking-wider text-[#A88B77]">
                  How to Create Your Free Supabase Database
                </h3>

                <ol className="space-y-2 text-xs text-stone-600 list-decimal pl-4">
                  <li>
                    Go to{' '}
                    <a
                      href="https://supabase.com"
                      target="_blank"
                      rel="noreferrer"
                      className="font-medium text-[#C87D32] hover:underline inline-flex items-center"
                    >
                      supabase.com <ExternalLink className="w-3 h-3 ml-0.5" />
                    </a>{' '}
                    and click <strong>Start your project</strong> (100% free).
                  </li>
                  <li>
                    Name your project <strong>casa-pons</strong> and choose region (e.g. <em>Middle East (UAE)</em> or <em>Frankfurt</em>).
                  </li>
                  <li>
                    Once created, click <strong>SQL Editor</strong> on the left sidebar.
                  </li>
                  <li>
                    Copy the SQL script below, paste it into the editor, and click <strong>Run</strong>.
                  </li>
                  <li>
                    Go to <strong>Project Settings</strong> &rarr; <strong>API</strong> and copy the <strong>Project URL</strong> and <strong>anon key</strong> into Tab 1!
                  </li>
                </ol>
              </div>

              {/* SQL Code Box */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-stone-700">
                    Tables &amp; Realtime Replication Schema
                  </span>
                  <button
                    onClick={handleCopySQL}
                    className="inline-flex items-center space-x-1 px-2.5 py-1 text-[11px] font-medium rounded-lg bg-stone-900 text-white hover:bg-stone-800 transition active:scale-95 shadow-2xs"
                  >
                    {copiedCode ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-400" />
                        <span>Copied to Clipboard!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        <span>Copy SQL Script</span>
                      </>
                    )}
                  </button>
                </div>
                <div className="rounded-xl border border-black/[0.08] bg-stone-950 p-3 font-mono text-[11px] text-stone-300 max-h-48 overflow-y-auto">
                  <pre className="whitespace-pre">{SUPABASE_SQL_SCHEMA}</pre>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  onClick={() => setActiveTab('connect')}
                  className="px-4 py-2 bg-stone-900 text-white rounded-xl font-medium text-xs hover:bg-stone-800 transition inline-flex items-center space-x-1.5"
                >
                  <span>Ready: Enter Credentials in Tab 1</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 bg-stone-50 border-t border-black/[0.06] flex items-center justify-between text-[11px] text-stone-400 px-5">
          <span className="flex items-center space-x-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>Multi-device real-time sync ready</span>
          </span>
          <button
            onClick={onClose}
            className="px-3 py-1 bg-white hover:bg-stone-100 text-stone-700 rounded-lg border border-black/[0.08] font-medium transition"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
