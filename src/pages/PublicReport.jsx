import { useState, useRef, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  Search, Globe, Calendar, AlertCircle, RefreshCw, ChevronRight,
  Building2, Info, ShieldCheck
} from 'lucide-react';
import axios from 'axios';

// ─── Constants ────────────────────────────────────────────────────────────────
const MONTHS = ['january', 'february', 'march', 'april', 'may', 'june',
  'july', 'august', 'september', 'october', 'november', 'december'];
const MONTH_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const CURRENCY = '₹';

// Dedicated public axios instance — no auth headers
let rawPublicUrl = import.meta.env.VITE_API_URL || 'https://amss-cms-backend.onrender.com/api';
rawPublicUrl = rawPublicUrl.trim().replace(/\/+$/, '');
if (!rawPublicUrl.endsWith('/api')) rawPublicUrl = `${rawPublicUrl}/api`;

const publicApi = axios.create({ baseURL: rawPublicUrl });

const fmt = (n) => `${CURRENCY}${(n || 0).toLocaleString('en-IN')}`;

// ─── Header Component ─────────────────────────────────────────────────────────

function PageHeader({ year, lastUpdated, orgName }) {
  const dateStr = lastUpdated
    ? new Date(lastUpdated).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
    : '—';

  return (
    <header className="pub-header no-print-hide">
      <div className="pub-header-inner">
        <div className="pub-logo-wrap">
          <div className="pub-logo-icon">
            <img
              src="/logo.jpg"
              alt="AMSS Logo"
              className="w-full h-full object-cover"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
                if (e.currentTarget.nextSibling) {
                  e.currentTarget.nextSibling.style.display = 'flex';
                }
              }}
            />
            <div style={{ display: 'none' }} className="w-full h-full items-center justify-center bg-emerald-800 text-white">
              <Building2 size={24} />
            </div>
          </div>
          <div className="pub-logo-text">
            <span className="pub-org-name">{orgName || 'A.M.S. SOCIETY'}</span>
            <span className="pub-report-title">Monthly Contribution Report</span>
          </div>
        </div>
        <div className="pub-header-meta">
          <span className="pub-meta-pill">
            <Calendar size={12} /> Year {year}
          </span>
          <span className="pub-meta-pill">
            <RefreshCw size={12} /> Updated {dateStr}
          </span>
          <Link to="/login" className="pub-meta-pill hover:bg-white/25 transition-colors" title="CMS Admin Login">
            <ShieldCheck size={12} /> Admin Login
          </Link>
        </div>
      </div>
    </header>
  );
}

// ─── Year Selector ────────────────────────────────────────────────────────────

function YearSelector({ years, selectedYear, onSelect, loading }) {
  if (!years.length) return null;
  return (
    <div className="pub-year-bar no-print-hide">
      <span className="pub-year-label"><Globe size={14} /> Published Years:</span>
      <div className="pub-year-pills">
        {years.map((y) => (
          <button
            key={y.year}
            onClick={() => onSelect(y.year)}
            disabled={loading}
            className={`pub-year-pill ${selectedYear === y.year ? 'active' : ''}`}
          >
            {y.year}
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── Search Bar ───────────────────────────────────────────────────────────────

function SearchBar({ value, onChange }) {
  return (
    <div className="pub-search-wrap no-print-hide">
      <Search size={16} className="pub-search-icon" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Search member name…"
        className="pub-search-input"
      />
    </div>
  );
}

// ─── Table Component ──────────────────────────────────────────────────────────

function ContributionTable({ rows, monthlyTotals, grandTotal, loading }) {
  if (loading) return <TableSkeleton />;

  return (
    <div className="pub-table-outer">
      {/* Swipe hint — visible only on mobile */}
      <div className="pub-swipe-hint no-print-hide">
        <Info size={12} /> Swipe left to view all 12 months
        <ChevronRight size={12} />
      </div>

      <div className="pub-table-scroll">
        <table className="pub-table">
          <thead>
            <tr>
              <th className="pub-th-sticky pub-col-sno">S.No</th>
              <th className="pub-th-sticky pub-col-name">Member Name</th>
              {MONTHS.map((m, i) => (
                <th key={m} className="pub-th-month">{MONTH_SHORT[i]}</th>
              ))}
              <th className="pub-th-total">Total</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={15} className="pub-empty-cell">
                  No contribution records found for this year.
                </td>
              </tr>
            ) : (
              <>
                {rows.map((row, idx) => (
                  <tr key={row.memberNumber ?? idx} className={idx % 2 === 0 ? 'pub-row-even' : 'pub-row-odd'}>
                    <td className="pub-td-sticky pub-td-sno">{idx + 1}</td>
                    <td className="pub-td-sticky pub-td-name">
                      <div className="pub-name-wrap">
                        <span className="pub-name-text">{row.name}</span>
                        {row.status === 'inactive' && (
                          <span className="pub-inactive-badge">Inactive</span>
                        )}
                      </div>
                    </td>
                    {MONTHS.map((m) => {
                      const isInactive = row[`${m}_inactive`];
                      return (
                        <td
                          key={m}
                          className={`pub-td-month ${
                            isInactive
                              ? 'pub-amount-inactive'
                              : row[m] > 0
                              ? 'pub-amount-paid'
                              : 'pub-amount-zero'
                          }`}
                        >
                          {isInactive ? 'Inactive' : row[m] > 0 ? fmt(row[m]) : '—'}
                        </td>
                      );
                    })}
                    <td className="pub-td-total">{fmt(row.total)}</td>
                  </tr>
                ))}

                {/* Monthly totals row */}
                <tr className="pub-totals-row">
                  <td className="pub-td-sticky pub-td-sno pub-totals-label-sno"></td>
                  <td className="pub-td-sticky pub-td-name pub-totals-label">TOTAL COLLECTION</td>
                  {MONTHS.map((m) => (
                    <td key={m} className="pub-td-month pub-totals-cell">
                      {fmt(monthlyTotals[m] || 0)}
                    </td>
                  ))}
                  <td className="pub-td-total pub-totals-grand">{fmt(grandTotal)}</td>
                </tr>
              </>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function TableSkeleton() {
  return (
    <div className="pub-skeleton-wrap">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="pub-skeleton-row">
          <div className="pub-skel pub-skel-sno" />
          <div className="pub-skel pub-skel-name" />
          {Array.from({ length: 12 }).map((__, j) => (
            <div key={j} className="pub-skel pub-skel-month" />
          ))}
          <div className="pub-skel pub-skel-total" />
        </div>
      ))}
    </div>
  );
}

function ErrorState({ error, onRetry }) {
  const is403 = error?.response?.status === 403;
  const is400 = error?.response?.status === 400;
  return (
    <div className="pub-error-state">
      <AlertCircle size={40} className="pub-error-icon" />
      <h2 className="pub-error-title">
        {is403 ? 'Report Not Published' : is400 ? 'Invalid Year' : 'Unable to Load Report'}
      </h2>
      <p className="pub-error-desc">
        {error?.response?.data?.message ||
          (is403 ? 'This year\'s report has not been published by the administrator yet.' :
            'An error occurred while fetching the report. Please try again.')}
      </p>
      {!is403 && !is400 && (
        <button className="pub-btn pub-btn-green" onClick={onRetry}>
          <RefreshCw size={14} /> Try Again
        </button>
      )}
    </div>
  );
}

function NoYearsState() {
  return (
    <div className="pub-error-state">
      <Globe size={40} className="pub-error-icon" />
      <h2 className="pub-error-title">No Reports Published Yet</h2>
      <p className="pub-error-desc">
        The administrator has not published any annual contribution reports yet. Please check back later.
      </p>
    </div>
  );
}

// ─── Main Public Report Page ──────────────────────────────────────────────────

const PublicReport = () => {
  const [selectedYear, setSelectedYear] = useState(null);
  const [search, setSearch] = useState('');
  const tableRef = useRef(null);

  // 1. Fetch published years list
  const {
    data: publishedYears = [],
    isLoading: yearsLoading,
    isError: yearsError,
  } = useQuery({
    queryKey: ['public-years'],
    queryFn: () => publicApi.get('/public/years').then((r) => r.data.data),
    onSuccess: (data) => {
      if (data.length && !selectedYear) {
        setSelectedYear(data[0].year);
      }
    },
    staleTime: 60000,
    retry: 2,
  });

  // Auto-select the most recent year once loaded
  const activeYear = selectedYear ?? (publishedYears[0]?.year ?? null);

  // 2. Fetch the report for the selected year
  const {
    data: report,
    isLoading: reportLoading,
    isError: reportError,
    error: reportErrorObj,
    refetch,
  } = useQuery({
    queryKey: ['public-report', activeYear],
    queryFn: () => publicApi.get(`/public/reports/${activeYear}`).then((r) => r.data.data),
    enabled: !!activeYear,
    staleTime: 30000,
    retry: 1,
  });

  // Filter rows by search
  const filteredRows = useMemo(() => {
    if (!report?.memberRows) return [];
    if (!search.trim()) return report.memberRows;
    const q = search.trim().toLowerCase();
    return report.memberRows.filter((r) => r.name.toLowerCase().includes(q));
  }, [report?.memberRows, search]);

  // Recalculate totals for filtered view
  const filteredMonthlyTotals = useMemo(() => {
    const totals = {};
    MONTHS.forEach((m) => {
      totals[m] = filteredRows.reduce((s, r) => s + (r[m] || 0), 0);
    });
    return totals;
  }, [filteredRows]);

  const filteredGrandTotal = useMemo(
    () => filteredRows.reduce((s, r) => s + (r.total || 0), 0),
    [filteredRows]
  );

  if (yearsLoading) return <FullPageLoader />;
  if (yearsError || publishedYears.length === 0) return (
    <div className="pub-page">
      <PublicPageShell>
        <NoYearsState />
      </PublicPageShell>
    </div>
  );

  return (
    <div className="pub-page">
      <style>{PUBLIC_CSS}</style>

      <PublicPageShell>
        {/* Header with Organization Logo */}
        <PageHeader
          year={activeYear}
          lastUpdated={report?.lastUpdated}
          orgName={report?.organizationName}
        />

        {/* Published Year Selector */}
        <YearSelector
          years={publishedYears}
          selectedYear={activeYear}
          onSelect={setSelectedYear}
          loading={reportLoading}
        />

        {/* Search Bar */}
        <div className="pub-controls no-print-hide">
          <SearchBar value={search} onChange={setSearch} />
        </div>

        {/* Contribution Data Table */}
        {reportError ? (
          <ErrorState error={reportErrorObj} onRetry={refetch} />
        ) : (
          <div ref={tableRef}>
            <ContributionTable
              rows={filteredRows}
              monthlyTotals={filteredMonthlyTotals}
              grandTotal={filteredGrandTotal}
              loading={reportLoading}
            />
          </div>
        )}

        {/* Footer */}
        <footer className="pub-footer no-print-hide">
          <p>
            Aadarsha Mitra Seva Sangham — Read-only public contribution report.
          </p>
        </footer>
      </PublicPageShell>
    </div>
  );
};

function PublicPageShell({ children }) {
  return (
    <div className="pub-shell">
      <div className="pub-container">{children}</div>
    </div>
  );
}

function FullPageLoader() {
  return (
    <div className="pub-page pub-page-center">
      <style>{PUBLIC_CSS}</style>
      <div className="pub-loader-wrap">
        <div className="pub-loader-ring" />
        <p className="pub-loader-text">Loading Report…</p>
      </div>
    </div>
  );
}

// ─── Scoped CSS ───────────────────────────────────────────────────────────────
const PUBLIC_CSS = `
/* Reset & base */
.pub-page { min-height: 100vh; background: #f0fdf4; font-family: system-ui, -apple-system, sans-serif; }
.pub-page-center { display: flex; align-items: center; justify-content: center; }
.pub-shell { padding: 0; }
.pub-container { max-width: 1400px; margin: 0 auto; padding: 0 0 32px; }

/* Header */
.pub-header { background: linear-gradient(135deg, #064e3b 0%, #065f46 60%, #047857 100%);
  color: white; padding: 14px 20px; }
.pub-header-inner { max-width: 1400px; margin: 0 auto; display: flex; align-items: center;
  justify-content: space-between; gap: 12px; flex-wrap: wrap; }
.pub-logo-wrap { display: flex; align-items: center; gap: 12px; }
.pub-logo-icon { width: 44px; height: 44px; background: white;
  border-radius: 12px; display: flex; align-items: center; justify-content: center;
  flex-shrink: 0; overflow: hidden; border: 2px solid rgba(255,255,255,0.4);
  box-shadow: 0 2px 6px rgba(0,0,0,0.18); }
.pub-logo-text { display: flex; flex-direction: column; }
.pub-org-name { font-size: 16px; font-weight: 800; letter-spacing: -0.3px; color: #ffffff; }
.pub-report-title { font-size: 11px; color: #a7f3d0; margin-top: 1px; font-weight: 500; }
.pub-header-meta { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
.pub-meta-pill { display: inline-flex; align-items: center; gap: 5px; font-size: 11px;
  background: rgba(255,255,255,0.15); border-radius: 20px; padding: 4px 10px;
  color: #d1fae5; font-weight: 600; text-decoration: none; }

/* Year selector */
.pub-year-bar { display: flex; align-items: center; gap: 10px; flex-wrap: wrap;
  padding: 12px 20px; background: white; border-bottom: 1px solid #d1fae5; }
.pub-year-label { font-size: 12px; font-weight: 700; color: #065f46;
  display: flex; align-items: center; gap: 6px; white-space: nowrap; }
.pub-year-pills { display: flex; gap: 6px; flex-wrap: wrap; }
.pub-year-pill { font-size: 12px; font-weight: 700; padding: 4px 14px; border-radius: 20px;
  border: 2px solid #d1fae5; background: white; color: #065f46; cursor: pointer;
  transition: all 0.15s; }
.pub-year-pill:hover { background: #d1fae5; }
.pub-year-pill.active { background: #065f46; color: white; border-color: #065f46; }
.pub-year-pill:disabled { opacity: 0.5; cursor: not-allowed; }

/* Controls / Search Bar */
.pub-controls { display: flex; align-items: center; padding: 14px 20px 8px; }
.pub-search-wrap { position: relative; width: 100%; max-width: 380px; }
.pub-search-icon { position: absolute; left: 12px; top: 50%; transform: translateY(-50%);
  color: #9ca3af; pointer-events: none; }
.pub-search-input { width: 100%; padding: 10px 14px 10px 38px; border-radius: 12px;
  border: 1.5px solid #d1fae5; background: white; font-size: 13px; color: #111827;
  outline: none; transition: border-color 0.15s, box-shadow 0.15s; box-sizing: border-box; }
.pub-search-input:focus { border-color: #059669; box-shadow: 0 0 0 3px rgba(5,150,105,0.12); }
.pub-btn-green { background: #059669; color: white; border: none; padding: 8px 16px; border-radius: 8px; font-weight: 600; cursor: pointer; }

/* Table outer */
.pub-table-outer { padding: 8px 0; }
.pub-swipe-hint { display: flex; align-items: center; gap: 5px; font-size: 11px;
  color: #059669; font-weight: 600; padding: 4px 20px 6px;
  background: #f0fdf4; }
@media (min-width: 1024px) { .pub-swipe-hint { display: none; } }
.pub-table-scroll { overflow-x: auto; -webkit-overflow-scrolling: touch;
  border-top: 1px solid #d1fae5; border-bottom: 1px solid #d1fae5; }

/* Table */
.pub-table { width: max-content; min-width: 100%; border-collapse: separate;
  border-spacing: 0; font-size: 13px; }

/* Sticky header */
.pub-table thead th {
  position: sticky; top: 0; z-index: 10;
  background: #064e3b; color: white;
  padding: 11px 12px; font-weight: 700; font-size: 11px;
  letter-spacing: 0.5px; border-bottom: 2px solid #047857;
  white-space: nowrap;
}
.pub-th-sticky { z-index: 20 !important; }
.pub-col-sno { width: 48px; min-width: 48px; text-align: center; left: 0; }
.pub-col-name { width: 170px; min-width: 150px; text-align: left;
  left: 48px; border-right: 2px solid #047857; }
.pub-th-month { min-width: 76px; text-align: right; }
.pub-th-total { min-width: 96px; text-align: right;
  background: #065f46 !important; border-left: 2px solid #047857; }

/* Sticky data cells */
.pub-td-sticky { position: sticky; background: inherit; z-index: 5; }
.pub-td-sno { left: 0; width: 48px; min-width: 48px; text-align: center;
  font-size: 12px; color: #6b7280; font-variant-numeric: tabular-nums; }
.pub-td-name { left: 48px; width: 170px; min-width: 150px;
  font-weight: 600; color: #111827; border-right: 2px solid #d1fae5;
  padding-right: 12px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
  max-width: 170px; }
.pub-td-month { text-align: right; padding: 10px 12px;
  font-variant-numeric: tabular-nums; white-space: nowrap; }
.pub-td-total { text-align: right; padding: 10px 12px;
  font-weight: 700; color: #064e3b; border-left: 2px solid #d1fae5;
  font-variant-numeric: tabular-nums; white-space: nowrap; }

/* Row styles */
table td, table th { padding: 9px 12px; }
.pub-row-even { background: #ffffff; }
.pub-row-odd { background: #f9fffe; }
.pub-row-even:hover, .pub-row-odd:hover { background: #ecfdf5; }
.pub-amount-paid { color: #111827; }
.pub-amount-zero { color: #d1d5db; font-size: 12px; }
.pub-amount-inactive { color: #9ca3af; font-size: 11px; font-style: italic; }
.pub-name-wrap { display: flex; align-items: center; gap: 6px; }
.pub-name-text { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.pub-inactive-badge {
  display: inline-block; font-size: 9px; font-weight: 700; text-transform: uppercase;
  padding: 1px 5px; border-radius: 4px; background: #fef3c7; color: #b45309;
  border: 1px solid #fde68a; flex-shrink: 0;
}

/* Totals row */
.pub-totals-row { background: #064e3b !important; }
.pub-totals-label-sno { background: #064e3b !important; }
.pub-totals-label { background: #064e3b !important; color: white !important;
  font-weight: 800 !important; font-size: 11px; letter-spacing: 0.5px; }
.pub-totals-cell { color: #d1fae5 !important; font-weight: 700; border-top: 2px solid #047857; }
.pub-totals-grand { color: #fbbf24 !important; font-weight: 800;
  font-size: 14px; border-left: 2px solid #047857 !important; border-top: 2px solid #047857; }

/* Empty */
.pub-empty-cell { text-align: center; padding: 48px 20px !important;
  color: #9ca3af; font-size: 14px; }

/* Error state */
.pub-error-state { display: flex; flex-direction: column; align-items: center;
  justify-content: center; padding: 60px 24px; text-align: center; gap: 16px; }
.pub-error-icon { color: #d97706; }
.pub-error-title { font-size: 20px; font-weight: 800; color: #111827; margin: 0; }
.pub-error-desc { font-size: 14px; color: #6b7280; max-width: 400px; margin: 0; line-height: 1.6; }

/* Skeleton */
.pub-skeleton-wrap { padding: 12px 20px; display: flex; flex-direction: column; gap: 10px; }
.pub-skeleton-row { display: flex; gap: 8px; align-items: center; }
.pub-skel { background: linear-gradient(90deg, #d1fae5 25%, #a7f3d0 50%, #d1fae5 75%);
  background-size: 200% 100%; animation: pub-shimmer 1.5s infinite;
  border-radius: 6px; height: 32px; flex-shrink: 0; }
.pub-skel-sno { width: 40px; }
.pub-skel-name { width: 150px; }
.pub-skel-month { width: 60px; }
.pub-skel-total { width: 80px; }
@keyframes pub-shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }

/* Loader */
.pub-loader-wrap { display: flex; flex-direction: column; align-items: center; gap: 16px; }
.pub-loader-ring { width: 48px; height: 48px; border-radius: 50%;
  border: 4px solid #d1fae5; border-top-color: #059669;
  animation: pub-spin 0.8s linear infinite; }
.pub-loader-text { font-size: 15px; color: #065f46; font-weight: 600; }
@keyframes pub-spin { to { transform: rotate(360deg); } }

/* Footer */
.pub-footer { text-align: center; padding: 24px 20px 36px;
  font-size: 12px; color: #9ca3af; border-top: 1px solid #d1fae5;
  margin-top: 24px; }

/* Mobile: 320–430px critical fixes */
@media (max-width: 430px) {
  .pub-header { padding: 12px 14px; }
  .pub-org-name { font-size: 14px; }
  .pub-logo-icon { width: 38px; height: 38px; }
  .pub-controls { padding: 10px 14px 4px; }
  .pub-col-sno { width: 36px; min-width: 36px; }
  .pub-col-name { width: 130px; min-width: 115px; left: 36px; }
  .pub-td-sno { width: 36px; left: 0; }
  .pub-td-name { left: 36px; max-width: 130px; }
  .pub-th-month { min-width: 64px; font-size: 10px; }
  table td, table th { padding: 8px 8px; font-size: 11px; }
}
`;

export default PublicReport;
