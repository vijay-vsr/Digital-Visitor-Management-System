import React, { useState, useEffect } from 'react';
import { useToast } from '../context/ToastContext';
import api from '../services/api';
import StatCard from '../components/StatCard';
import {
  BarChart3,
  Calendar,
  Download,
  Users,
  UserCheck,
  TrendingUp,
  RefreshCw,
  PieChart as PieIcon,
  Award,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from 'recharts';

const COLORS = ['#0c87eb', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444', '#06b6d4', '#ec4899'];

export default function ReportsPage() {
  const toast = useToast();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const res = await api.get('/reports');
      if (res.data.success) {
        setData(res.data);
      }
    } catch (err) {
      toast.error('Failed to load reports and analytics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const handleExportCSV = () => {
    window.open('/api/reports/export/csv', '_blank');
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
            <BarChart3 className="w-6 h-6 text-brand-600" />
            Visitor Analytics & Reports
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Insights on office visitor flow, peak traffic trends, and audit summaries.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={fetchReports}
            className="p-2.5 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 text-slate-600 shadow-xs transition"
            title="Refresh Data"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold shadow-md transition"
          >
            <Download className="w-4 h-4" />
            <span>Export Full CSV Audit</span>
          </button>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <StatCard
          title="Today's Footfall"
          value={data?.summary?.dailyVisitors ?? 0}
          icon={Users}
          color="blue"
          subtext="Registered today"
          trend="24 Hours"
        />
        <StatCard
          title="Last 7 Days"
          value={data?.summary?.weeklyVisitors ?? 0}
          icon={TrendingUp}
          color="emerald"
          subtext="Past week footfall"
          trend="Weekly"
        />
        <StatCard
          title="Last 30 Days"
          value={data?.summary?.monthlyVisitors ?? 0}
          icon={Calendar}
          color="purple"
          subtext="Past month footfall"
          trend="Monthly"
        />
        <StatCard
          title="Currently Inside"
          value={data?.summary?.currentlyInside ?? 0}
          icon={UserCheck}
          color="amber"
          subtext="Active in premises"
          trend="Live Now"
        />
      </div>

      {/* 14-Day Traffic Trend Area Chart */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-slate-900">14-Day Traffic Trend</h3>
            <p className="text-xs text-slate-500">Daily registered vs completed check-in arrivals</p>
          </div>
        </div>

        <div className="h-72 w-full">
          {data?.trafficHistory && (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.trafficHistory} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0c87eb" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#0c87eb" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorChecked" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="displayDate" tick={{ fontSize: 11, fill: '#64748b' }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#64748b' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderRadius: '8px',
                    color: '#fff',
                    fontSize: '12px',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="total"
                  name="Total Registrations"
                  stroke="#0c87eb"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorTotal)"
                />
                <Area
                  type="monotone"
                  dataKey="checkedIn"
                  name="Checked In Arrivals"
                  stroke="#10b981"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorChecked)"
                />
                <Legend verticalAlign="top" height={36} wrapperStyle={{ fontSize: '12px' }} />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Grid of 2 Charts: Purpose Breakdown & Most Visited Staff */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Most Visited Employees */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-1.5">
                <Award className="w-4 h-4 text-amber-500" />
                Most Visited Personnel
              </h3>
              <p className="text-xs text-slate-500">Employees receiving the highest visitor volume</p>
            </div>
          </div>

          <div className="h-64 w-full">
            {data?.mostVisitedEmployees && (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  layout="vertical"
                  data={data.mostVisitedEmployees}
                  margin={{ top: 5, right: 20, left: 40, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                  <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11, fill: '#64748b' }} />
                  <YAxis
                    dataKey="person_to_meet"
                    type="category"
                    tick={{ fontSize: 11, fill: '#334155' }}
                    width={110}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      borderRadius: '8px',
                      color: '#fff',
                      fontSize: '12px',
                    }}
                  />
                  <Bar dataKey="visitor_count" name="Visitors" fill="#0c87eb" radius={[0, 6, 6, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Visit Purpose Breakdown */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-1.5">
                <PieIcon className="w-4 h-4 text-brand-500" />
                Visit Purpose Breakdown
              </h3>
              <p className="text-xs text-slate-500">Distribution by reason of entry</p>
            </div>
          </div>

          <div className="h-64 w-full flex items-center justify-center">
            {data?.purposeStats && data.purposeStats.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data.purposeStats}
                    dataKey="count"
                    nameKey="purpose"
                    cx="50%"
                    cy="50%"
                    outerRadius={85}
                    innerRadius={45}
                    paddingAngle={2}
                  >
                    {data.purposeStats.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      borderRadius: '8px',
                      color: '#fff',
                      fontSize: '12px',
                    }}
                  />
                  <Legend verticalAlign="bottom" wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-xs text-slate-400">No data available</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
