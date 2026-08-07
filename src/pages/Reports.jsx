import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  FileText, FileSpreadsheet, Printer, BarChart3, DollarSign, Calendar
} from 'lucide-react';
import { reportService, memberService, contributionService } from '../services';
import {
  Button, Select, Card, SectionHeader, StatCard, SkeletonRow
} from '../components/ui';
import { generateAndDownloadPdf, generateAndPrintPdf } from '../utils/generateContributionPdf';
import { AVAILABLE_YEARS, DEFAULT_YEAR } from '../utils/constants';
import toast from 'react-hot-toast';

const MONTHS = ['january', 'february', 'march', 'april', 'may', 'june',
  'july', 'august', 'september', 'october', 'november', 'december'];
const MONTH_LABELS = ['January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'];
const MONTH_SHORT = ['JAN', 'FEB', 'MAR', 'APRIL', 'MAY', 'JUNE',
  'JULY', 'AUG', 'SEPT', 'OCT', 'NOV', 'DEC'];
const CURRENCY = '₹';

const Reports = () => {
  const [year, setYear] = useState(DEFAULT_YEAR);
  const [selectedMonth, setSelectedMonth] = useState('all');
  const [pdfLoading, setPdfLoading] = useState(false);
  const [excelLoading, setExcelLoading] = useState(false);

  // Load dynamic report data for selected year from MongoDB Atlas
  const { data, isLoading } = useQuery({
    queryKey: ['annual-report', year],
    queryFn: () => reportService.getAnnual(year).then((r) => r.data.data),
  });

  const memberRows = data?.memberRows || [];
  const monthlyTotals = data?.monthlyTotals || {};
  const grandTotal = data?.grandTotal || 0;

  // Fetch full members & contributions for programmatically compiling the PDF template for selected year
  const { data: membersList } = useQuery({
    queryKey: ['members-report-list'],
    queryFn: () => memberService.getAllList().then((r) => r.data.data),
  });

  const { data: contributionsList } = useQuery({
    queryKey: ['contributions-report-list', year],
    queryFn: () => contributionService.getAll({ year, limit: 1000 }).then((r) => r.data.data),
  });

  // Programmatically generate and download PDF for selected year
  const handleDownloadPDF = () => {
    setPdfLoading(true);
    try {
      generateAndDownloadPdf({
        members: membersList || memberRows,
        contributions: contributionsList || data?.contributions || [],
        year,
      });
      toast.success(`PDF report generated for Year ${year}!`);
    } catch (err) {
      toast.error('Failed to generate PDF');
    } finally {
      setPdfLoading(false);
    }
  };

  // Programmatically generate PDF and print PDF stream directly for selected year
  const handlePrintPDF = () => {
    try {
      generateAndPrintPdf({
        members: membersList || memberRows,
        contributions: contributionsList || data?.contributions || [],
        year,
      });
      toast.success(`Opening print dialog for Year ${year} PDF report…`);
    } catch (err) {
      toast.error('Failed to print PDF report');
    }
  };

  const handleDownloadExcel = async () => {
    setExcelLoading(true);
    try {
      const response = await reportService.downloadExcel(year);
      const url = URL.createObjectURL(new Blob([response.data]));
      const a = document.createElement('a');
      a.href = url;
      a.download = `annual-report-${year}.xlsx`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success(`Excel report downloaded for Year ${year}!`);
    } catch (err) {
      toast.error('Failed to generate Excel');
    } finally {
      setExcelLoading(false);
    }
  };

  const activeMonths = selectedMonth === 'all'
    ? MONTHS
    : MONTHS.filter((m) => m === selectedMonth);

  return (
    <div className="space-y-6 animate-fade-up">
      {/* Section Header */}
      <SectionHeader
        title="Financial Reports"
        subtitle={`Annual & Monthly contribution summaries for Year ${year}`}
        action={
          <div className="flex flex-wrap items-center gap-2">
            <Select value={year} onChange={(e) => setYear(parseInt(e.target.value))} className="w-32 font-bold">
              {AVAILABLE_YEARS.map((y) => <option key={y} value={y}>{y}</option>)}
            </Select>

            <Select value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)} className="w-36">
              <option value="all">All Months</option>
              {MONTHS.map((m, i) => <option key={m} value={m}>{MONTH_LABELS[i]}</option>)}
            </Select>

            <Button variant="secondary" icon={FileText} onClick={handleDownloadPDF} loading={pdfLoading}>
              Download PDF
            </Button>
            <Button variant="success" icon={FileSpreadsheet} onClick={handleDownloadExcel} loading={excelLoading}>
              Excel
            </Button>
            <Button variant="secondary" icon={Printer} onClick={handlePrintPDF}>
              Print PDF
            </Button>
          </div>
        }
      />

      {/* Dashboard Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          index={0}
          title="Grand Total Collection"
          value={`${CURRENCY}${grandTotal.toLocaleString('en-IN')}`}
          subtitle={`Year ${year} total`}
          icon={DollarSign}
          color="indigo"
        />
        <StatCard
          index={1}
          title="Total Active Members"
          value={data?.totalMembers || 0}
          subtitle="Contributing members"
          icon={BarChart3}
          color="emerald"
        />
        <StatCard
          index={2}
          title="Selected Window"
          value={selectedMonth === 'all' ? `Year ${year}` : `${selectedMonth.toUpperCase()} ${year}`}
          subtitle="Report period"
          icon={Calendar}
          color="amber"
        />
      </div>

      {/* Interactive Web Table View */}
      <Card className="p-4 sm:p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b pb-4 gap-2" style={{ borderColor: 'var(--border)' }}>
          <div>
            <h3 className="font-bold text-base" style={{ color: 'var(--text-1)' }}>
              AMMS - MONTHLY CONTRIBUTIONS — YEAR {year}
            </h3>
            <p className="text-xs" style={{ color: 'var(--text-3)' }}>
              Annual Contributions (January - December {year})
            </p>
          </div>
          <div className="text-right text-xs" style={{ color: 'var(--text-3)' }}>
            <p>Generated: {new Date().toLocaleDateString('en-US')}</p>
          </div>
        </div>

        <div className="table-wrap">
          <table className="data-table text-xs">
            <thead>
              <tr className="bg-slate-800 text-white">
                <th className="!text-white text-center w-12">S.NO</th>
                <th className="!text-white text-left">NAME</th>
                {activeMonths.map((m, i) => (
                  <th key={m} className="text-left !text-white">{MONTH_SHORT[i]}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                Array.from({ length: 6 }).map((_, i) => <SkeletonRow key={i} cols={activeMonths.length + 2} />)
              ) : memberRows.length === 0 ? (
                <tr>
                  <td colSpan={activeMonths.length + 2} className="text-center py-8 text-slate-400">
                    No data recorded for {year}.
                  </td>
                </tr>
              ) : (
                <>
                  {memberRows.map((row, idx) => (
                    <tr key={row._id}>
                      <td className="font-mono text-xs text-center" style={{ color: 'var(--text-3)' }}>{idx + 1}</td>
                      <td className="font-medium" style={{ color: 'var(--text-1)' }}>{row.name}</td>
                      {activeMonths.map((m) => (
                        <td key={m} className={`text-left ${row[m] > 0 ? 'text-slate-900 font-normal' : 'text-slate-400'}`}>
                          {row[m] > 0 ? `${CURRENCY} ${row[m].toLocaleString('en-IN')}` : `${CURRENCY} `}
                        </td>
                      ))}
                    </tr>
                  ))}

                  <tr className="border-t-2 font-bold bg-slate-50" style={{ borderColor: 'var(--border)' }}>
                    <td colSpan={2} className="text-right pr-4">Total Summary</td>
                    {activeMonths.map((m) => (
                      <td key={m} className="text-left py-2">
                        <div className="text-[10px] text-slate-500 font-normal">Sum:</div>
                        <div className="text-xs text-slate-900">{CURRENCY}{(monthlyTotals[m] || 0).toLocaleString('en-IN')}</div>
                      </td>
                    ))}
                  </tr>
                </>
              )}
            </tbody>
          </table>
        </div>

        <div className="text-center pt-4 text-xs font-semibold text-blue-600 border-t" style={{ borderColor: 'var(--border)' }}>
          Grand Total: {CURRENCY}{grandTotal.toLocaleString('en-IN')}
        </div>
      </Card>
    </div>
  );
};

export default Reports;
