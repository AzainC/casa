import React, { useState } from 'react';
import { useReports } from '../../context/ReportContext';
import { testGoogleSheetsConnection, syncReportToGoogleSheets } from '../../services/googleSheetsService';
import { 
  FileSpreadsheet, 
  X, 
  Check, 
  Copy, 
  ExternalLink, 
  Loader2, 
  CloudCheck, 
  CloudAlert,
  ArrowRight
} from 'lucide-react';

interface GoogleSheetsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const APPS_SCRIPT_TEMPLATE = `/**
 * Casa Pons Merchandising Logs - Google Sheets Sync
 * Automatically creates headers and appends every merchandiser visit report in real time.
 */

function doPost(e) {
  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    var payload = JSON.parse(e.postData.contents);
    
    // Check if test ping
    if (payload.action === 'ping') {
      return ContentService.createTextOutput(JSON.stringify({ status: 'ok', message: 'Connection successful' }))
        .setMimeType(ContentService.MimeType.JSON);
    }
    
    // Ensure header row exists
    ensureHeaders(sheet);
    
    // Prepare row data
    var row = [
      payload.timestamp || new Date().toISOString(),
      payload.date || '',
      payload.time || '',
      payload.id || '',
      payload.merchandiserName || '',
      payload.merchandiserId || '',
      payload.chain || '',
      payload.storeName || '',
      payload.emirate || '',
      payload.area || '',
      payload.managerName || '',
      payload.managerPhone || '',
      payload.totalStockOnHand || 0,
      payload.outOfStockCount || 0,
      payload.expiringSoonCount || 0,
      payload.sku_smokedAlmonds || '',
      payload.sku_roastedCashews || '',
      payload.sku_rawWalnuts || '',
      payload.sku_pistachios || '',
      payload.sku_mixedNuts || '',
      payload.orderNeeded || '',
      payload.orderDetails || '',
      payload.orderNotes || '',
      payload.displayCondition || '',
      payload.isClean || '',
      payload.displayNotes || '',
      payload.status || '',
      payload.photoCount || 0
    ];
    
    sheet.appendRow(row);
    
    // Format recently added row
    var lastRow = sheet.getLastRow();
    sheet.getRange(lastRow, 1, 1, row.length).setFontFamily('Arial').setFontSize(10);
    
    return ContentService.createTextOutput(JSON.stringify({ status: 'success', row: lastRow }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ status: 'error', error: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function ensureHeaders(sheet) {
  if (sheet.getLastRow() === 0) {
    var headers = [
      'Timestamp',
      'Date',
      'Time',
      'Report ID',
      'Merchandiser Name',
      'Merchandiser ID',
      'Chain',
      'Store Location',
      'Emirate',
      'Area',
      'Store Manager Name',
      'Store Manager Phone',
      'Total Stock On Hand (PCS)',
      'Out of Stock SKUs',
      'Expiring Soon SKUs',
      'Smoked Almonds 150g',
      'Roasted Cashews 150g',
      'Raw Walnuts Halves 200g',
      'Roasted Pistachios 150g',
      'Mixed Nuts Deluxe 200g',
      'Order Needed?',
      'Requested Order Items',
      'Order Notes / LPO',
      'Display Rating',
      'Shelves Cleanliness',
      'Display Notes',
      'Overall Status',
      'Photos Attached'
    ];
    sheet.appendRow(headers);
    var headerRange = sheet.getRange(1, 1, 1, headers.length);
    headerRange.setBackground('#2A1810')
               .setFontColor('#FFFFFF')
               .setFontWeight('bold')
               .setFontSize(10);
    sheet.setFrozenRows(1);
  }
}`;

export const GoogleSheetsModal: React.FC<GoogleSheetsModalProps> = ({ isOpen, onClose }) => {
  const { sheetsWebhookUrl, updateSheetsWebhookUrl, syncStatus, reports } = useReports();
  const [urlInput, setUrlInput] = useState(sheetsWebhookUrl);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [copiedCode, setCopiedCode] = useState(false);
  const [activeTab, setActiveTab] = useState<'setup' | 'settings'>('setup');
  const [isBulkSyncing, setIsBulkSyncing] = useState(false);
  const [bulkSyncProgress, setBulkSyncProgress] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCopyScript = () => {
    navigator.clipboard.writeText(APPS_SCRIPT_TEMPLATE);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2500);
  };

  const handleSaveUrl = () => {
    updateSheetsWebhookUrl(urlInput);
    setTestResult({
      success: true,
      message: urlInput.trim() ? 'Webhook URL saved successfully' : 'Webhook URL cleared',
    });
  };

  const handleTestConnection = async () => {
    if (!urlInput.trim()) {
      setTestResult({ success: false, message: 'Please enter a Webhook URL first.' });
      return;
    }
    setIsTesting(true);
    setTestResult(null);

    const ok = await testGoogleSheetsConnection(urlInput);
    setIsTesting(false);
    if (ok) {
      setTestResult({ success: true, message: 'Connection successful! Google Sheet is reachable.' });
    } else {
      setTestResult({
        success: false,
        message: 'Could not reach URL. Please verify deployment access is set to "Anyone".',
      });
    }
  };

  const handleBulkSync = async () => {
    if (!sheetsWebhookUrl) {
      setTestResult({ success: false, message: 'Please save a valid Webhook URL first.' });
      return;
    }
    setIsBulkSyncing(true);
    setBulkSyncProgress(`Syncing 0 / ${reports.length}...`);

    for (let i = 0; i < reports.length; i++) {
      setBulkSyncProgress(`Syncing ${i + 1} / ${reports.length}: ${reports[i].store.name}...`);
      await syncReportToGoogleSheets(reports[i], sheetsWebhookUrl);
      // Small pause to prevent rate limiting
      await new Promise((r) => setTimeout(r, 400));
    }

    setIsBulkSyncing(false);
    setBulkSyncProgress(`Synced all ${reports.length} reports to Google Sheets!`);
    setTimeout(() => setBulkSyncProgress(null), 4000);
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
        <div className="p-4 sm:p-5 bg-[#FAF7F2] border-b border-black/[0.06] flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-2xs">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-stone-900 tracking-tight flex items-center space-x-2">
                <span>Google Sheets Cloud Sync</span>
                {sheetsWebhookUrl ? (
                  <span className="inline-flex items-center space-x-1 text-[10px] font-mono text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded-full">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
                    <span>Connected</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center space-x-1 text-[10px] font-mono text-stone-500 bg-stone-200/60 px-2 py-0.5 rounded-full">
                    <span>Not Connected</span>
                  </span>
                )}
              </h2>
              <p className="text-[11px] text-stone-500">
                Automatically append all merchandiser visit reports into a live Google Sheet
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

        {/* Tab switcher */}
        <div className="px-5 pt-3 pb-2 border-b border-black/[0.04] bg-white">
          <div className="grid grid-cols-2 p-1 bg-stone-100/80 rounded-xl border border-black/[0.04]">
            <button
              onClick={() => setActiveTab('setup')}
              className={`py-1.5 text-xs font-semibold rounded-lg transition ${
                activeTab === 'setup'
                  ? 'bg-white text-stone-900 shadow-2xs border border-black/[0.06]'
                  : 'text-stone-500 hover:text-stone-900'
              }`}
            >
              1. Setup Instructions & Script
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className={`py-1.5 text-xs font-semibold rounded-lg transition ${
                activeTab === 'settings'
                  ? 'bg-white text-stone-900 shadow-2xs border border-black/[0.06]'
                  : 'text-stone-500 hover:text-stone-900'
              }`}
            >
              2. Webhook URL & Sync
            </button>
          </div>
        </div>

        {/* Body content */}
        <div className="p-5 overflow-y-auto space-y-4 text-xs text-stone-700">
          {activeTab === 'setup' ? (
            <div className="space-y-4">
              <div className="rounded-2xl bg-stone-50/70 p-4 border border-black/[0.06] space-y-3">
                <h3 className="text-xs font-semibold text-stone-900 uppercase tracking-wider text-[#A88B77]">
                  Quick 3-Minute Setup
                </h3>

                <ol className="space-y-2.5 text-xs text-stone-600 list-decimal pl-4">
                  <li>
                    Create a new sheet at{' '}
                    <a
                      href="https://sheets.new"
                      target="_blank"
                      rel="noreferrer"
                      className="font-medium text-[#C87D32] hover:underline inline-flex items-center"
                    >
                      sheets.new <ExternalLink className="w-3 h-3 ml-0.5" />
                    </a>{' '}
                    and name it <strong>Casa Pons Merchandising Logs</strong>.
                  </li>
                  <li>
                    In the sheet top menu, click <strong>Extensions</strong> &rarr;{' '}
                    <strong>Apps Script</strong>.
                  </li>
                  <li>
                    Replace the default code with the script below, and click <strong>Save</strong>.
                  </li>
                  <li>
                    Click the blue <strong>Deploy</strong> button &rarr;{' '}
                    <strong>New deployment</strong>:
                    <ul className="list-disc pl-4 mt-1 text-[11px] text-stone-500 space-y-0.5">
                      <li>Select type: <strong>Web app</strong></li>
                      <li>Execute as: <strong>Me</strong></li>
                      <li>Who has access: <strong>Anyone</strong> (crucial so mobile phones can submit)</li>
                    </ul>
                  </li>
                  <li>
                    Click <strong>Deploy</strong>, copy the generated <strong>Web App URL</strong>, and paste it into Tab 2!
                  </li>
                </ol>
              </div>

              {/* Script Box */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-stone-700">
                    Google Apps Script Code
                  </span>
                  <button
                    onClick={handleCopyScript}
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
                        <span>Copy Apps Script Code</span>
                      </>
                    )}
                  </button>
                </div>
                <div className="rounded-xl border border-black/[0.08] bg-stone-950 p-3 font-mono text-[11px] text-stone-300 max-h-48 overflow-y-auto">
                  <pre className="whitespace-pre">{APPS_SCRIPT_TEMPLATE}</pre>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  onClick={() => setActiveTab('settings')}
                  className="px-4 py-2 bg-[#1D100A] text-white rounded-xl font-medium text-xs hover:bg-[#2A1810] transition inline-flex items-center space-x-1.5"
                >
                  <span>Next: Connect Webhook URL</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="block text-[11px] font-semibold text-stone-700 uppercase tracking-wider">
                  Google Apps Script Web App URL
                </label>
                <input
                  type="url"
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  placeholder="https://script.google.com/macros/s/.../exec"
                  className="w-full px-3 py-2 text-xs font-mono bg-stone-50/70 border border-black/[0.08] rounded-xl focus:outline-none focus:bg-white focus:border-stone-900/40 text-stone-900 placeholder:text-stone-400 transition"
                />
                <p className="text-[11px] text-stone-400">
                  Must end with <code className="font-mono text-stone-600">/exec</code>.
                </p>
              </div>

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
                  disabled={isTesting || !urlInput.trim()}
                  className="px-3 py-2 bg-stone-100 hover:bg-stone-200/80 text-stone-700 rounded-xl font-semibold text-xs border border-black/[0.06] flex items-center justify-center space-x-1.5 disabled:opacity-40 transition active:scale-95"
                >
                  {isTesting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
                  <span>Test Connection</span>
                </button>

                <button
                  type="button"
                  onClick={handleSaveUrl}
                  className="px-3 py-2 bg-[#1D100A] hover:bg-[#2A1810] text-white rounded-xl font-semibold text-xs flex items-center justify-center space-x-1.5 transition active:scale-95 shadow-2xs"
                >
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Save &amp; Connect</span>
                </button>
              </div>

              {/* Bulk sync existing records */}
              {sheetsWebhookUrl && reports.length > 0 && (
                <div className="pt-4 border-t border-black/[0.06] space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-semibold text-stone-900">
                        Sync Existing Reports ({reports.length})
                      </p>
                      <p className="text-[11px] text-stone-400">
                        Upload all historical reports currently stored in browser memory to the sheet
                      </p>
                    </div>
                  </div>

                  {bulkSyncProgress && (
                    <p className="text-[11px] font-mono text-emerald-700 bg-emerald-50 p-2 rounded-lg border border-emerald-200/60">
                      {bulkSyncProgress}
                    </p>
                  )}

                  <button
                    type="button"
                    onClick={handleBulkSync}
                    disabled={isBulkSyncing}
                    className="w-full py-2 bg-stone-100 hover:bg-stone-200/80 text-stone-800 rounded-xl font-medium text-xs border border-black/[0.06] flex items-center justify-center space-x-1.5 transition disabled:opacity-40"
                  >
                    {isBulkSyncing ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Syncing to Google Sheets...</span>
                      </>
                    ) : (
                      <>
                        <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Sync All {reports.length} Reports to Sheet Now</span>
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 bg-stone-50 border-t border-black/[0.06] flex items-center justify-between text-[11px] text-stone-400 px-5">
          <span>Status: {syncStatus.message}</span>
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
