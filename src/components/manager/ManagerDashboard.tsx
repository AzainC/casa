import React, { useState, useMemo } from 'react';
import { useReports } from '../../context/ReportContext';
import type { VisitReport, ChainType, StoreLocation, TimePeriodPreset, UncompletedStoreInfo } from '../../types';
import { STORES_DATA } from '../../data/stores';
import { ReportDetailModal } from './ReportDetailModal';
import { 
  Building2, 
  Fuel, 
  Search, 
  Eye, 
  User, 
  Clock, 
  MapPin, 
  Package, 
  Trash2, 
  Calendar, 
  RefreshCw, 
  CheckCircle2, 
  AlertCircle, 
  PlusCircle,
  Phone,
  UserCheck
} from 'lucide-react';

export const ManagerDashboard: React.FC = () => {
  const { 
    reports, 
    deleteReport, 
    selectedReport, 
    setSelectedReport, 
    resetToDefaults,
    setActiveView,
    setPendingStoreToLog,
    getStoreManager
  } = useReports();

  // Active Tab: Visited Branches vs Uncompleted Branches
  const [activeTab, setActiveTab] = useState<'visited' | 'uncompleted'>('visited');

  // Time Period State
  const [periodPreset, setPeriodPreset] = useState<TimePeriodPreset>('this-month');
  const [selectedMonth, setSelectedMonth] = useState<string>('2026-10'); // YYYY-MM
  const [customStartDate, setCustomStartDate] = useState<string>('2026-10-01');
  const [customEndDate, setCustomEndDate] = useState<string>('2026-10-21');

  // Filtering State
  const [chainFilter, setChainFilter] = useState<'All' | ChainType>('All');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [orderFilter, setOrderFilter] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Available Months
  const availableMonths = [
    { value: '2026-10', label: 'October 2026 (Current)' },
    { value: '2026-09', label: 'September 2026' },
    { value: '2026-08', label: 'August 2026' },
    { value: '2026-07', label: 'July 2026' },
  ];

  // Compute Active Date Range Boundaries
  const dateRange = useMemo(() => {
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];

    if (periodPreset === 'today') {
      return { start: todayStr, end: todayStr, label: `Today (${todayStr})` };
    }

    if (periodPreset === 'this-week') {
      const startOfWeek = new Date();
      startOfWeek.setDate(now.getDate() - now.getDay());
      const startStr = startOfWeek.toISOString().split('T')[0];
      return { start: startStr, end: todayStr, label: `This Week (${startStr} to ${todayStr})` };
    }

    if (periodPreset === 'last-30-days') {
      const past30 = new Date();
      past30.setDate(now.getDate() - 30);
      const startStr = past30.toISOString().split('T')[0];
      return { start: startStr, end: todayStr, label: `Last 30 Days` };
    }

    if (periodPreset === 'last-month') {
      return { start: '2026-09-01', end: '2026-09-30', label: 'September 2026' };
    }

    if (periodPreset === 'custom') {
      return {
        start: customStartDate,
        end: customEndDate,
        label: `${customStartDate} to ${customEndDate}`,
      };
    }

    // Default: 'this-month' (linked to selectedMonth)
    const [year, month] = selectedMonth.split('-');
    const lastDayOfMonth = new Date(parseInt(year), parseInt(month), 0).getDate();
    const startStr = `${selectedMonth}-01`;
    const endStr = `${selectedMonth}-${String(lastDayOfMonth).padStart(2, '0')}`;
    const monthObj = availableMonths.find(m => m.value === selectedMonth);
    return {
      start: startStr,
      end: endStr,
      label: monthObj ? monthObj.label : `${selectedMonth}`,
    };
  }, [periodPreset, selectedMonth, customStartDate, customEndDate]);

  // Filter reports within the date range
  const periodReports = useMemo(() => {
    return reports.filter((rep) => {
      const repDate = rep.formattedDate;
      return repDate >= dateRange.start && repDate <= dateRange.end;
    });
  }, [reports, dateRange]);

  // All stores visited during this period
  const visitedStoreIdsInPeriod = useMemo(() => {
    return new Set(periodReports.map((r) => r.store.id));
  }, [periodReports]);

  // Uncompleted Stores for this period
  const uncompletedStores = useMemo<UncompletedStoreInfo[]>(() => {
    return STORES_DATA.filter((store) => !visitedStoreIdsInPeriod.has(store.id)).map((store) => {
      const allStoreVisits = reports
        .filter((r) => r.store.id === store.id)
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

      const latest = allStoreVisits[0];
      let daysDiff: number | null = null;
      if (latest) {
        const diffMs = new Date().getTime() - new Date(latest.timestamp).getTime();
        daysDiff = Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)));
      }

      const knownManager = getStoreManager(store.id);

      return {
        store,
        lastVisitDate: latest ? latest.formattedDate : null,
        lastVisitReportId: latest ? latest.id : undefined,
        daysSinceLastVisit: daysDiff,
        managerContact: knownManager,
      };
    });
  }, [visitedStoreIdsInPeriod, reports, getStoreManager]);

  // Filtered Visited Reports
  const filteredVisitedReports = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();

    return periodReports.filter((rep) => {
      if (chainFilter !== 'All' && rep.store.chain !== chainFilter) return false;
      if (statusFilter !== 'All' && rep.status !== statusFilter) return false;
      if (orderFilter !== 'All' && rep.orderNeeded !== orderFilter) return false;

      if (!q) return true;
      return (
        rep.store.name.toLowerCase().includes(q) ||
        rep.merchandiserName.toLowerCase().includes(q) ||
        rep.merchandiserId.toLowerCase().includes(q) ||
        (rep.managerName && rep.managerName.toLowerCase().includes(q)) ||
        (rep.managerPhone && rep.managerPhone.includes(q)) ||
        rep.store.chain.toLowerCase().includes(q) ||
        rep.store.region.toLowerCase().includes(q) ||
        rep.id.toLowerCase().includes(q)
      );
    });
  }, [periodReports, chainFilter, statusFilter, orderFilter, searchQuery]);

  // Filtered Uncompleted Stores
  const filteredUncompletedStores = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();

    return uncompletedStores.filter((item) => {
      if (chainFilter !== 'All' && item.store.chain !== chainFilter) return false;

      if (!q) return true;
      return (
        item.store.name.toLowerCase().includes(q) ||
        item.store.chain.toLowerCase().includes(q) ||
        item.store.region.toLowerCase().includes(q) ||
        (item.managerContact?.name && item.managerContact.name.toLowerCase().includes(q)) ||
        (item.managerContact?.phone && item.managerContact.phone.includes(q))
      );
    });
  }, [uncompletedStores, chainFilter, searchQuery]);

  // KPI Metrics
  const stats = useMemo(() => {
    const totalNetwork = STORES_DATA.length; // 113
    const visitedCount = visitedStoreIdsInPeriod.size;
    const uncompletedCount = totalNetwork - visitedCount;
    const coverageRate = Math.round((visitedCount / totalNetwork) * 100);

    const ordersNeeded = periodReports.filter((r) => r.orderNeeded === 'Yes').length;
    const totalOutOfStock = periodReports.reduce((sum, r) => sum + r.outOfStockCount, 0);

    return {
      totalNetwork,
      visitedCount,
      uncompletedCount,
      coverageRate,
      ordersNeeded,
      totalOutOfStock,
    };
  }, [visitedStoreIdsInPeriod, periodReports]);

  const handleLogUncompletedBranch = (store: StoreLocation) => {
    setPendingStoreToLog(store);
    setActiveView('merchandiser');
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Apple-style Minimal Top Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-2 border-b border-black/[0.06]">
        <div>
          <div className="flex items-center space-x-2 text-xs font-medium text-stone-400 mb-1">
            <span className="uppercase tracking-wider text-[10px]">Casa Pons Field Tracking</span>
            <span>•</span>
            <span className="text-stone-700 bg-stone-100 px-2 py-0.2 rounded-full font-medium">
              113 Retail Stations
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-stone-900">
            Manager Overview
          </h1>
          <p className="text-xs sm:text-sm text-stone-500 mt-1 max-w-xl">
            Store visit progress, store manager directory, inventory health, and replenishment status.
          </p>
        </div>

        {/* Minimal Utilities */}
        <div className="flex items-center space-x-2 shrink-0">
          <button
            onClick={resetToDefaults}
            title="Reset to default multi-month records"
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-stone-50 text-stone-600 border border-stone-200 text-xs font-medium transition shadow-2xs"
          >
            <RefreshCw className="w-3.5 h-3.5 text-stone-400" />
            <span>Reset Demo Data</span>
          </button>
        </div>
      </div>

      {/* Time Period & Month Selector Bar */}
      <div className="bg-white rounded-2xl p-4 border border-black/[0.06] shadow-2xs space-y-3">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          {/* Preset Buttons */}
          <div className="flex items-center space-x-1 overflow-x-auto pb-1 lg:pb-0 text-xs">
            <span className="text-[10px] font-semibold text-stone-400 uppercase tracking-wider mr-1 flex items-center">
              <Calendar className="w-3.5 h-3.5 mr-1 text-stone-400" />
              Period:
            </span>
            <button
              onClick={() => setPeriodPreset('this-month')}
              className={`px-3 py-1.5 rounded-lg font-medium transition ${
                periodPreset === 'this-month'
                  ? 'bg-stone-900 text-white shadow-2xs'
                  : 'bg-stone-100/70 text-stone-600 hover:bg-stone-100'
              }`}
            >
              This Month
            </button>
            <button
              onClick={() => setPeriodPreset('today')}
              className={`px-3 py-1.5 rounded-lg font-medium transition ${
                periodPreset === 'today'
                  ? 'bg-stone-900 text-white shadow-2xs'
                  : 'bg-stone-100/70 text-stone-600 hover:bg-stone-100'
              }`}
            >
              Today
            </button>
            <button
              onClick={() => setPeriodPreset('this-week')}
              className={`px-3 py-1.5 rounded-lg font-medium transition ${
                periodPreset === 'this-week'
                  ? 'bg-stone-900 text-white shadow-2xs'
                  : 'bg-stone-100/70 text-stone-600 hover:bg-stone-100'
              }`}
            >
              This Week
            </button>
            <button
              onClick={() => setPeriodPreset('last-30-days')}
              className={`px-3 py-1.5 rounded-lg font-medium transition ${
                periodPreset === 'last-30-days'
                  ? 'bg-stone-900 text-white shadow-2xs'
                  : 'bg-stone-100/70 text-stone-600 hover:bg-stone-100'
              }`}
            >
              Last 30 Days
            </button>
            <button
              onClick={() => setPeriodPreset('last-month')}
              className={`px-3 py-1.5 rounded-lg font-medium transition ${
                periodPreset === 'last-month'
                  ? 'bg-stone-900 text-white shadow-2xs'
                  : 'bg-stone-100/70 text-stone-600 hover:bg-stone-100'
              }`}
            >
              Last Month
            </button>
            <button
              onClick={() => setPeriodPreset('custom')}
              className={`px-3 py-1.5 rounded-lg font-medium transition ${
                periodPreset === 'custom'
                  ? 'bg-stone-900 text-white shadow-2xs'
                  : 'bg-stone-100/70 text-stone-600 hover:bg-stone-100'
              }`}
            >
              Custom Range
            </button>
          </div>

          {/* Month Dropdown or Custom Date Range Inputs */}
          <div className="flex items-center space-x-2 self-start lg:self-auto text-xs">
            {periodPreset === 'this-month' && (
              <div className="flex items-center space-x-1.5">
                <span className="text-[11px] text-stone-400 font-medium">Month:</span>
                <select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  className="px-2.5 py-1.5 rounded-xl bg-stone-100 border border-stone-200 text-stone-800 font-medium focus:outline-none"
                >
                  {availableMonths.map((m) => (
                    <option key={m.value} value={m.value}>
                      {m.label}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {periodPreset === 'custom' && (
              <div className="flex items-center space-x-1.5 bg-stone-100 p-1 rounded-xl border border-stone-200">
                <input
                  type="date"
                  value={customStartDate}
                  onChange={(e) => setCustomStartDate(e.target.value)}
                  className="px-2 py-1 rounded-lg text-xs bg-white text-stone-800 border border-stone-200 focus:outline-none"
                />
                <span className="text-stone-400 text-[10px]">to</span>
                <input
                  type="date"
                  value={customEndDate}
                  onChange={(e) => setCustomEndDate(e.target.value)}
                  className="px-2 py-1 rounded-lg text-xs bg-white text-stone-800 border border-stone-200 focus:outline-none"
                />
              </div>
            )}
          </div>
        </div>

        {/* Active Period Label */}
        <div className="pt-2 border-t border-stone-100 flex items-center justify-between text-xs text-stone-500">
          <div className="flex items-center space-x-1.5">
            <Clock className="w-3.5 h-3.5 text-stone-400" />
            <span>
              Auditing Window: <strong className="text-stone-800">{dateRange.label}</strong>
            </span>
          </div>
          <span className="font-mono text-[11px] text-stone-400">
            {periodReports.length} reports logged
          </span>
        </div>
      </div>

      {/* Network Coverage Progress (Apple Minimalist) */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-black/[0.06] shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-semibold text-stone-900 uppercase tracking-wider">
                Station Network Progress
              </span>
              <span className="text-xs font-mono font-medium text-stone-400">
                ({stats.visitedCount} of {stats.totalNetwork} Branches Visited)
              </span>
            </div>
            <p className="text-xs text-stone-400 mt-0.5">
              {stats.uncompletedCount} branches pending visits during this period.
            </p>
          </div>

          <div className="flex items-baseline space-x-1">
            <span className="text-2xl font-semibold tracking-tight text-stone-900">
              {stats.coverageRate}%
            </span>
            <span className="text-xs text-stone-400 font-medium">completed</span>
          </div>
        </div>

        {/* Minimal Progress Bar */}
        <div className="w-full h-2 bg-stone-100 rounded-full overflow-hidden flex">
          <div
            className="h-full bg-stone-900 transition-all duration-500 rounded-full"
            style={{ width: `${stats.coverageRate}%` }}
          />
        </div>

        {/* Clean Metric Counters */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-3 mt-3 border-t border-stone-100 text-xs">
          <div className="flex items-center space-x-2">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span className="text-stone-500 font-medium">Visited:</span>
            <strong className="text-stone-900 font-mono">{stats.visitedCount}</strong>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-1.5 h-1.5 rounded-full bg-rose-500" />
            <span className="text-stone-500 font-medium">Uncompleted:</span>
            <strong className="text-rose-600 font-mono">{stats.uncompletedCount}</strong>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
            <span className="text-stone-500 font-medium">Orders Placed:</span>
            <strong className="text-stone-900 font-mono">{stats.ordersNeeded}</strong>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-1.5 h-1.5 rounded-full bg-stone-400" />
            <span className="text-stone-500 font-medium">OOS Flags:</span>
            <strong className="text-stone-900 font-mono">{stats.totalOutOfStock}</strong>
          </div>
        </div>
      </div>

      {/* Segmented Tab Navigation: Visited vs Uncompleted */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="inline-flex p-1 bg-stone-200/60 rounded-xl text-xs font-medium">
          <button
            onClick={() => setActiveTab('visited')}
            className={`px-4 py-1.5 rounded-lg transition-all duration-150 flex items-center space-x-1.5 ${
              activeTab === 'visited'
                ? 'bg-white text-stone-900 shadow-2xs font-semibold'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <CheckCircle2 className={`w-3.5 h-3.5 ${activeTab === 'visited' ? 'text-stone-900' : 'text-stone-400'}`} />
            <span>Visited Branches</span>
            <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-stone-100 text-stone-700 font-mono">
              {filteredVisitedReports.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('uncompleted')}
            className={`px-4 py-1.5 rounded-lg transition-all duration-150 flex items-center space-x-1.5 ${
              activeTab === 'uncompleted'
                ? 'bg-white text-stone-900 shadow-2xs font-semibold'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <AlertCircle className={`w-3.5 h-3.5 ${activeTab === 'uncompleted' ? 'text-rose-500' : 'text-stone-400'}`} />
            <span>Uncompleted Branches</span>
            <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-rose-50 text-rose-700 font-mono font-medium">
              {filteredUncompletedStores.length}
            </span>
          </button>
        </div>

        {/* Chain Filters: All, Choithrams, Emarat */}
        <div className="flex items-center space-x-1 text-xs">
          <button
            onClick={() => setChainFilter('All')}
            className={`px-2.5 py-1 rounded-lg font-medium transition ${
              chainFilter === 'All'
                ? 'bg-stone-900 text-white'
                : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
            }`}
          >
            All Chains
          </button>
          <button
            onClick={() => setChainFilter('Choithrams')}
            className={`px-2.5 py-1 rounded-lg font-medium transition flex items-center space-x-1 ${
              chainFilter === 'Choithrams'
                ? 'bg-emerald-800 text-white'
                : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
            }`}
          >
            <Building2 className="w-3 h-3" />
            <span>Choithrams (24)</span>
          </button>
          <button
            onClick={() => setChainFilter('Emarat')}
            className={`px-2.5 py-1 rounded-lg font-medium transition flex items-center space-x-1 ${
              chainFilter === 'Emarat'
                ? 'bg-amber-800 text-white'
                : 'bg-amber-50 text-amber-800 hover:bg-amber-100'
            }`}
          >
            <Fuel className="w-3 h-3" />
            <span>Emarat (89)</span>
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white rounded-2xl p-3 border border-black/[0.06] shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={
              activeTab === 'visited'
                ? 'Search visited stores, merchandisers, manager...'
                : 'Search uncompleted station names, manager...'
            }
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:border-stone-400 text-stone-900 placeholder:text-stone-400 font-medium"
          />
        </div>

        {/* Visited Specific Secondary Filters */}
        {activeTab === 'visited' && (
          <div className="flex items-center space-x-2 self-start sm:self-auto text-xs">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-2.5 py-1.5 bg-stone-50 border border-stone-200 rounded-xl text-stone-700 font-medium text-xs focus:outline-none"
            >
              <option value="All">All Statuses</option>
              <option value="Completed">Completed</option>
              <option value="Urgent Restock">Urgent Restock</option>
              <option value="Pending Review">Pending Review</option>
            </select>

            <select
              value={orderFilter}
              onChange={(e) => setOrderFilter(e.target.value)}
              className="px-2.5 py-1.5 bg-stone-50 border border-stone-200 rounded-xl text-stone-700 font-medium text-xs focus:outline-none"
            >
              <option value="All">All Order States</option>
              <option value="Yes">Order Placed (Yes)</option>
              <option value="Follow-up required">Follow-up Required</option>
              <option value="No">No Order Needed</option>
            </select>
          </div>
        )}
      </div>

      {/* TAB 1: VISITED STORES FEED (Includes Store Manager Name & Phone) */}
      {activeTab === 'visited' && (
        <div className="space-y-3">
          {filteredVisitedReports.length === 0 ? (
            <div className="bg-white rounded-2xl p-10 text-center border border-black/[0.06] space-y-2">
              <Clock className="w-8 h-8 mx-auto text-stone-300" />
              <p className="font-semibold text-stone-800 text-sm">No Store Visits Recorded in this Period</p>
              <p className="text-xs text-stone-400 max-w-sm mx-auto">
                No merchandiser reports match the period "{dateRange.label}". Switch to the Uncompleted Branches tab to see which stations are pending.
              </p>
            </div>
          ) : (
            filteredVisitedReports.map((report) => (
              <div
                key={report.id}
                onClick={() => setSelectedReport(report)}
                className="bg-white rounded-2xl p-4 sm:p-5 border border-black/[0.06] hover:border-black/20 shadow-2xs hover:shadow-xs transition-all duration-150 cursor-pointer group"
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                  {/* Station Identity & Merchandiser Details */}
                  <div className="flex items-start space-x-3.5">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white shrink-0 ${
                        report.store.chain === 'Choithrams'
                          ? 'bg-emerald-800'
                          : 'bg-amber-700'
                      }`}
                    >
                      {report.store.chain === 'Choithrams' ? (
                        <Building2 className="w-5 h-5" />
                      ) : (
                        <Fuel className="w-5 h-5" />
                      )}
                    </div>

                    <div>
                      <div className="flex items-center space-x-2">
                        <span
                          className={`text-[9px] uppercase font-bold px-1.5 py-0.2 rounded ${
                            report.store.chain === 'Choithrams'
                              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200/60'
                              : 'bg-amber-50 text-amber-800 border border-amber-200/60'
                          }`}
                        >
                          {report.store.chain}
                        </span>
                        <span className="text-[11px] text-stone-400 font-mono">{report.id}</span>
                        <span className="text-stone-300">•</span>
                        <span className="text-[11px] text-stone-500 flex items-center">
                          <MapPin className="w-3 h-3 mr-0.5 text-stone-400" />
                          {report.store.region}
                        </span>
                      </div>

                      <h3 className="text-base font-semibold text-stone-900 group-hover:text-amber-800 transition-colors mt-0.5">
                        {report.store.name}
                      </h3>

                      {/* Merchandiser & Store Manager Contact Column */}
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-stone-500 mt-1">
                        <span className="flex items-center text-stone-700 font-medium">
                          <User className="w-3 h-3 mr-1 text-stone-400" />
                          {report.merchandiserName} ({report.merchandiserId})
                        </span>

                        {/* Store Manager Column Info */}
                        {report.managerName && (
                          <>
                            <span className="text-stone-300">•</span>
                            <span className="flex items-center text-stone-700 font-medium">
                              <UserCheck className="w-3 h-3 mr-1 text-stone-400" />
                              Mgr: <strong>{report.managerName}</strong>
                              {report.managerPhone && (
                                <a
                                  href={`tel:${report.managerPhone}`}
                                  onClick={(e) => e.stopPropagation()}
                                  className="ml-1 text-[11px] font-mono text-emerald-700 hover:underline inline-flex items-center"
                                  title="Call Store Manager"
                                >
                                  <Phone className="w-2.5 h-2.5 mr-0.5" />
                                  {report.managerPhone}
                                </a>
                              )}
                            </span>
                          </>
                        )}

                        <span className="text-stone-300">•</span>
                        <span className="flex items-center text-stone-400">
                          <Clock className="w-3 h-3 mr-1" />
                          {report.formattedDate} at {report.formattedTime}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Stock, Order Outcome & Actions */}
                  <div className="flex flex-wrap items-center gap-3 lg:justify-end border-t lg:border-t-0 pt-2.5 lg:pt-0 border-stone-100">
                    {/* Stock on Hand */}
                    <div className="bg-stone-50 px-3 py-1.5 rounded-xl border border-stone-200/60 text-xs">
                      <span className="text-[10px] text-stone-400 uppercase font-medium block">
                        Stock
                      </span>
                      <span className="font-mono font-semibold text-stone-900">
                        {report.totalStockOnHand} PCS
                      </span>
                      {report.outOfStockCount > 0 ? (
                        <span className="text-[10px] font-semibold text-rose-600 block">
                          {report.outOfStockCount} OOS
                        </span>
                      ) : (
                        <span className="text-[10px] text-emerald-700 font-medium block">
                          Stocked
                        </span>
                      )}
                    </div>

                    {/* Order Status */}
                    <div className="bg-stone-50 px-3 py-1.5 rounded-xl border border-stone-200/60 text-xs">
                      <span className="text-[10px] text-stone-400 uppercase font-medium block">
                        Order
                      </span>
                      <span
                        className={`inline-flex items-center px-2 py-0.2 rounded-full text-[10px] font-medium ${
                          report.orderNeeded === 'Yes'
                            ? 'bg-emerald-50 text-emerald-800 border border-emerald-200/60'
                            : report.orderNeeded === 'Follow-up required'
                            ? 'bg-amber-50 text-amber-800 border border-amber-200/60'
                            : 'bg-stone-100 text-stone-600'
                        }`}
                      >
                        {report.orderNeeded}
                      </span>
                    </div>

                    {/* Photo thumbnail */}
                    {report.photos && report.photos.length > 0 && (
                      <div className="w-10 h-10 rounded-xl overflow-hidden border border-stone-200 bg-stone-900 shrink-0">
                        <img
                          src={report.photos[0].dataUrl}
                          alt=""
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex items-center space-x-1">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedReport(report);
                        }}
                        className="p-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 transition"
                        title="View Full Report"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (confirm(`Delete report ${report.id} for ${report.store.name}?`)) {
                            deleteReport(report.id);
                          }
                        }}
                        className="p-2 rounded-xl bg-stone-50 hover:bg-rose-50 text-stone-400 hover:text-rose-600 transition"
                        title="Delete Report"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* TAB 2: UNCOMPLETED BRANCHES LIST (Includes Known Store Manager Contact) */}
      {activeTab === 'uncompleted' && (
        <div className="space-y-3">
          <div className="p-3 bg-stone-50 border border-stone-200/80 rounded-2xl flex items-center justify-between text-xs text-stone-700">
            <div className="flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
              <span>
                <strong>{filteredUncompletedStores.length} branches</strong> have not been audited in <strong>{dateRange.label}</strong>.
              </span>
            </div>
            <span className="text-[11px] text-stone-500 hidden sm:inline">
              Store manager details auto-fill upon audit
            </span>
          </div>

          {filteredUncompletedStores.length === 0 ? (
            <div className="bg-white rounded-2xl p-10 text-center border border-black/[0.06] space-y-2">
              <CheckCircle2 className="w-8 h-8 mx-auto text-emerald-500" />
              <p className="font-semibold text-stone-800 text-sm">100% Station Coverage Reached!</p>
              <p className="text-xs text-stone-400 max-w-sm mx-auto">
                All branches matching criteria have been visited during {dateRange.label}.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
              {filteredUncompletedStores.map((item) => (
                <div
                  key={item.store.id}
                  className="bg-white rounded-2xl p-3.5 sm:p-4 border border-black/[0.06] hover:border-black/15 shadow-2xs flex items-center justify-between gap-3 transition"
                >
                  <div className="flex items-start space-x-3 min-w-0">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-white shrink-0 ${
                        item.store.chain === 'Choithrams' ? 'bg-emerald-800' : 'bg-amber-700'
                      }`}
                    >
                      {item.store.chain === 'Choithrams' ? (
                        <Building2 className="w-4 h-4" />
                      ) : (
                        <Fuel className="w-4 h-4" />
                      )}
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center space-x-1.5">
                        <span
                          className={`text-[9px] uppercase font-bold px-1.5 py-0.2 rounded ${
                            item.store.chain === 'Choithrams'
                              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200/60'
                              : 'bg-amber-50 text-amber-800 border border-amber-200/60'
                          }`}
                        >
                          {item.store.chain}
                        </span>
                        <span className="text-[11px] text-stone-400 flex items-center truncate">
                          <MapPin className="w-2.5 h-2.5 mr-0.5" />
                          {item.store.region}
                        </span>
                      </div>

                      <h4 className="text-sm font-semibold text-stone-900 truncate mt-0.5">
                        {item.store.name}
                      </h4>

                      {/* Known Manager Contact info if retained */}
                      {item.managerContact ? (
                        <p className="text-[11px] text-stone-600 mt-0.5 flex items-center truncate">
                          <UserCheck className="w-3 h-3 mr-1 text-stone-400 shrink-0" />
                          <span>Manager: <strong>{item.managerContact.name}</strong></span>
                          {item.managerContact.phone && (
                            <a
                              href={`tel:${item.managerContact.phone}`}
                              className="ml-1 text-emerald-700 font-mono hover:underline truncate"
                              title="Call Store Manager"
                            >
                              ({item.managerContact.phone})
                            </a>
                          )}
                        </p>
                      ) : (
                        <p className="text-[11px] text-stone-400 mt-0.5">
                          {item.lastVisitDate ? (
                            <span>Last visit: {item.lastVisitDate}</span>
                          ) : (
                            <span className="text-rose-600 font-medium">Never audited</span>
                          )}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* 1-Tap Shortcut Button */}
                  <button
                    type="button"
                    onClick={() => handleLogUncompletedBranch(item.store)}
                    className="shrink-0 px-3 py-1.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-xs font-medium flex items-center space-x-1 shadow-2xs transition active:scale-[0.98]"
                    title="Log visit for this branch"
                  >
                    <PlusCircle className="w-3.5 h-3.5" />
                    <span>Log Visit</span>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Detail Inspection Modal */}
      {selectedReport && (
        <ReportDetailModal
          report={selectedReport}
          onClose={() => setSelectedReport(null)}
        />
      )}
    </div>
  );
};
