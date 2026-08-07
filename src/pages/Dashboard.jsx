import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Users, DollarSign, TrendingUp, Calendar, UserCheck, UserX,
  Activity, Clock, AlertTriangle
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  AreaChart, Area, PieChart, Pie, Cell
} from 'recharts';
import { dashboardService } from '../services';
import { StatCard, SkeletonCard, Card, SectionHeader, Select } from '../components/ui';
import { AVAILABLE_YEARS, DEFAULT_YEAR } from '../utils/constants';

const CURRENCY = '₹';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload?.length) {
    return (
      <div className="card p-3 shadow-xl text-xs flex flex-col gap-1 border">
        <span className="font-semibold text-slate-400">{label}</span>
        <span className="font-bold text-indigo-500 text-sm">
          {CURRENCY}{payload[0]?.value?.toLocaleString('en-IN')}
        </span>
      </div>
    );
  }
  return null;
};

const Dashboard = () => {
  const [year, setYear] = useState(DEFAULT_YEAR);

  const { data, isLoading } = useQuery({
    queryKey: ['dashboard', year],
    queryFn: () => dashboardService.getData(year).then((r) => r.data.data),
  });

  const stats = data?.stats;
  const chartData = data?.monthlyChartData || [];
  const latestPayments = data?.latestPayments || [];
  const dueMonths = data?.dueMonths || [];

  const currentMonthIdx = new Date().getMonth();
  const MONTHS = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december'];
  const currentMonthName = MONTHS[currentMonthIdx];
  const currentMonthCollection = data?.monthlyTotals?.[currentMonthName] || 0;

  // Active vs Pending Pie Chart Data
  const pieData = [
    { name: 'Up to Date', value: Math.max(0, (stats?.activeMembers || 0) - (stats?.pendingMembers || 0)), color: '#10b981' },
    { name: 'Pending Members', value: stats?.pendingMembers || 0, color: '#f59e0b' },
    { name: 'Inactive', value: stats?.inactiveMembers || 0, color: '#ef4444' },
  ];

  const dueRangeLabel = dueMonths.length > 0
    ? `${dueMonths[0].slice(0, 3).toUpperCase()}–${dueMonths[dueMonths.length - 1].slice(0, 3).toUpperCase()} due`
    : 'No due months';

  return (
    <div className="space-y-6 animate-fade-up">
      {/* Header */}
      <SectionHeader
        title="Dashboard Overview"
        subtitle={`Real-time contribution analytics & pending payment tracking for Year ${year}`}
        action={
          <div className="flex items-center gap-2">
            <label className="text-xs font-semibold" style={{ color: 'var(--text-2)' }}>Financial Year:</label>
            <Select
              value={year}
              onChange={(e) => setYear(parseInt(e.target.value))}
              className="w-32 !py-1.5 font-bold"
            >
              {AVAILABLE_YEARS.map((y) => <option key={y} value={y}>{y}</option>)}
            </Select>
          </div>
        }
      />

      {/* Responsive Cards Grid: Desktop 4, Tablet 2, Mobile 1 per row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)
        ) : (
          <>
            <StatCard
              index={0}
              title="Total Members"
              value={stats?.totalMembers || 0}
              subtitle={`${stats?.activeMembers || 0} active · ${stats?.inactiveMembers || 0} inactive`}
              icon={Users}
              color="indigo"
            />
            <StatCard
              index={1}
              title="Grand Total Collection"
              value={`${CURRENCY}${(stats?.totalCollected || 0).toLocaleString('en-IN')}`}
              subtitle={`Total collected in ${year}`}
              icon={DollarSign}
              color="emerald"
            />
            <StatCard
              index={2}
              title="Pending Members"
              value={`${stats?.pendingMembers || 0} Members`}
              subtitle={dueRangeLabel}
              icon={AlertTriangle}
              color="amber"
            />
            <StatCard
              index={3}
              title="Pending Amount"
              value={`${CURRENCY}${(stats?.pendingAmount || 0).toLocaleString('en-IN')}`}
              subtitle={`Unpaid for ${dueRangeLabel}`}
              icon={UserX}
              color="rose"
            />
          </>
        )}
      </div>

      {/* Secondary Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          index={4}
          title="Current Month Collection"
          value={`${CURRENCY}${currentMonthCollection.toLocaleString('en-IN')}`}
          subtitle={`${currentMonthName.toUpperCase()} collection (${year})`}
          icon={Calendar}
          color="sky"
        />
        <StatCard
          index={5}
          title="Active Members"
          value={stats?.activeMembers || 0}
          subtitle="Contributing members"
          icon={UserCheck}
          color="emerald"
        />
        <StatCard
          index={6}
          title="Evaluated Due Months"
          value={`${stats?.dueMonthsCount || 0} Months`}
          subtitle={`Due on/before 10th of month`}
          icon={Activity}
          color="violet"
        />
        <StatCard
          index={7}
          title="Financial Year"
          value={`CY ${year}`}
          subtitle="Jan 1 - Dec 31"
          icon={Calendar}
          color="indigo"
        />
      </div>

      {/* Charts & Activity Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Chart: Monthly Collection (Area Chart) */}
        <Card className="lg:col-span-2 p-5 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-base" style={{ color: 'var(--text-1)' }}>Monthly Collection Trend ({year})</h3>
              <p className="text-xs" style={{ color: 'var(--text-3)' }}>Monthly collections for year {year}</p>
            </div>
            <div className="flex items-center gap-2 text-xs font-semibold text-indigo-500">
              <span className="w-2.5 h-2.5 rounded-full bg-indigo-500" /> Collection ({CURRENCY})
            </div>
          </div>

          <div className="h-64 sm:h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="month" tick={{ fill: 'var(--text-3)', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: 'var(--text-3)', fontSize: 11 }} axisLine={false} tickLine={false}
                  tickFormatter={(v) => `₹${v >= 1000 ? `${(v/1000).toFixed(1)}k` : v}`} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="total" stroke="#6366f1" strokeWidth={2.5}
                  fill="url(#chartGradient)" dot={{ fill: '#6366f1', r: 4 }} activeDot={{ r: 6, fill: '#818cf8' }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Member Status Breakdown (Pie Chart) */}
        <Card className="p-5 flex flex-col gap-4">
          <div>
            <h3 className="font-bold text-base" style={{ color: 'var(--text-1)' }}>Active vs Pending ({year})</h3>
            <p className="text-xs" style={{ color: 'var(--text-3)' }}>Participation status ({dueRangeLabel})</p>
          </div>

          <div className="h-48 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-2 pt-2 border-t" style={{ borderColor: 'var(--border)' }}>
            {pieData.map((item) => (
              <div key={item.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ background: item.color }} />
                  <span style={{ color: 'var(--text-2)' }}>{item.name}</span>
                </div>
                <span className="font-semibold" style={{ color: 'var(--text-1)' }}>{item.value}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Bottom Section: Recent Payments & Latest Activities */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Payments Card */}
        <Card className="p-5 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-base flex items-center gap-2" style={{ color: 'var(--text-1)' }}>
              <Activity size={18} className="text-indigo-500" /> Recent Payments ({year})
            </h3>
            <span className="text-xs font-medium" style={{ color: 'var(--text-3)' }}>Year {year}</span>
          </div>

          <div className="space-y-2.5">
            {latestPayments.length === 0 ? (
              <p className="text-xs py-6 text-center" style={{ color: 'var(--text-3)' }}>No payment records found for {year}.</p>
            ) : (
              latestPayments.map((payment) => (
                <div key={payment.id} className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-500/5 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-indigo-500/10 text-indigo-500 font-bold text-xs flex items-center justify-center">
                      {payment.memberName?.charAt(0)?.toUpperCase()}
                    </div>
                    <div>
                      <p className="text-xs font-semibold" style={{ color: 'var(--text-1)' }}>{payment.memberName}</p>
                      <p className="text-[10px]" style={{ color: 'var(--text-3)' }}>Member #{payment.memberNumber} · Year {payment.year}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-bold text-emerald-500">+{CURRENCY}{payment.total?.toLocaleString('en-IN')}</p>
                    <p className="text-[10px]" style={{ color: 'var(--text-3)' }}>Recorded</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>

        {/* Latest Activities Card */}
        <Card className="p-5 flex flex-col gap-4">
          <h3 className="font-bold text-base flex items-center gap-2" style={{ color: 'var(--text-1)' }}>
            <Clock size={18} className="text-amber-500" /> System Activities
          </h3>

          <div className="space-y-4">
            <div className="flex gap-3 text-xs">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 mt-1 flex-shrink-0" />
              <div>
                <p className="font-medium" style={{ color: 'var(--text-1)' }}>Multi-Year Architecture Active</p>
                <p className="text-[10px]" style={{ color: 'var(--text-3)' }}>Supporting years {AVAILABLE_YEARS.join(', ')}.</p>
              </div>
            </div>

            <div className="flex gap-3 text-xs">
              <div className="w-2.5 h-2.5 rounded-full bg-indigo-500 mt-1 flex-shrink-0" />
              <div>
                <p className="font-medium" style={{ color: 'var(--text-1)' }}>PDF Master Report Engine Active</p>
                <p className="text-[10px]" style={{ color: 'var(--text-3)' }}>Generating A4 Portrait ledger for Year {year}.</p>
              </div>
            </div>

            <div className="flex gap-3 text-xs">
              <div className="w-2.5 h-2.5 rounded-full bg-amber-500 mt-1 flex-shrink-0" />
              <div>
                <p className="font-medium" style={{ color: 'var(--text-1)' }}>MongoDB Atlas Connected</p>
                <p className="text-[10px]" style={{ color: 'var(--text-3)' }}>{stats?.activeMembers || 0} active members loaded.</p>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
