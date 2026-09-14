import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import api from '../services/api';
import StatCard from '../components/StatCard';
import Modal from '../components/Modal';
import VisitorPass from '../components/VisitorPass';
import {
  Users,
  LogIn,
  LogOut,
  UserCheck,
  UserPlus,
  BarChart3,
  RefreshCw,
  Clock,
  ArrowRight,
  CheckCircle2,
  Calendar,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';

const COLORS = ['#0c87eb', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444', '#06b6d4'];

export default function DashboardPage() {
  const { user, isAdmin } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const [stats, setStats] = useState({
    totalVisitorsToday: 0,
    currentlyInside: 0,
    checkedOutToday: 0,
    expectedToday: 0,
    totalEmployees: 0,
  });
  const [recentVisitors, setRecentVisitors] = useState([]);
  const [trafficData, setTrafficData] = useState([]);
  const [purposeStats, setPurposeStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedVisitor, setSelectedVisitor] = useState(null);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const res = await api.get('/dashboard/stats');
      if (res.data.success) {
        setStats(res.data.stats);
        setRecentVisitors(res.data.recentVisitors);
        setTrafficData(res.data.trafficData);
        setPurposeStats(res.data.purposeStats);
      }
    } catch (err) {
      toast.error('Failed to load dashboard data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleQuickCheckIn = async (visitorId) => {
    try {
      const res = await api.post(`/visitors/${visitorId}/checkin`);
      if (res.data.success) {
        toast.success(res.data.message);
        setSelectedVisitor(null);
        fetchDashboardData();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Check-in failed');
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Checked In':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'Checked Out':
        return 'bg-slate-100 text-slate-700 border-slate-200';
      case 'Expected':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Welcome Banner */}
      <div className="bg-gradient-to-r from-brand-700 via-brand-800 to-indigo-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="relative z-10 max-w-xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-xs font-semibold text-brand-200 mb-3 border border-white/10">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            System Active &bull; {isAdmin ? 'Administrator Portal' : 'Security Desk'}
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Welcome, {user?.name}!
          </h1>
          <p className="text-brand-100 text-xs sm:text-sm mt-1 leading-relaxed">
            Monitor live visitor entries, manage daily check-ins, view digital badge passes, and ensure secure workplace premises.
          </p>
        </div>

        {/* Quick actions row inside banner */}
        <div className="flex flex-wrap items-center gap-2.5 relative z-10">
          <Link
            to="/register"
            className="flex items-center gap-2 px-4 py-2.5 bg-white text-brand-900 hover:bg-brand-50 rounded-xl font-bold text-xs shadow-md transition"
          >
            <UserPlus className="w-4 h-4 text-brand-600" />
            Register Visitor
          </Link>
          <Link
            to="/check-in"
            className="flex items-center gap-2 px-4 py-2.5 bg-brand-600 hover:bg-brand-500 text-white rounded-xl font-bold text-xs border border-white/20 shadow-md transition"
          >
            <LogIn className="w-4 h-4" />
            Check In
          </Link>
          <button
            onClick={fetchDashboardData}
            className="p-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl transition border border-white/10"
            title="Refresh statistics"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {/* Background decorative circles */}
        <div className="absolute right-0 top-0 translate-x-12 -translate-y-8 w-72 h-72 bg-white/5 rounded-full pointer-events-none" />
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <StatCard
          title="Total Visitors Today"
          value={stats.totalVisitorsToday}
          icon={Users}
          color="blue"
          subtext="Registered for today"
          trend="Today"
          onClick={() => navigate('/visitors?date=today')}
        />
        <StatCard
          title="Currently Inside"
          value={stats.currentlyInside}
          icon={UserCheck}
          color="emerald"
          subtext="Active in premises"
          trend="Live"
          onClick={() => navigate('/check-out')}
        />
        <StatCard
          title="Checked Out Today"
          value={stats.checkedOutToday}
          icon={LogOut}
          color="purple"
          subtext="Completed visits"
          trend="Finished"
          onClick={() => navigate('/visitors?status=Checked+Out&date=today')}
        />
        <StatCard
          title="Total Staff Members"
          value={stats.totalEmployees}
          icon={Calendar}
          color="amber"
          subtext="Active host employees"
          trend="Directory"
          onClick={() => (isAdmin ? navigate('/employees') : null)}
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 7-Day Traffic Bar Chart */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900">7-Day Visitor Traffic</h3>
              <p className="text-xs text-slate-500">Daily registered vs attended visitors</p>
            </div>
            <Link
              to="/reports"
              className="text-xs font-semibold text-brand-600 hover:text-brand-700 flex items-center gap-1"
            >
              Detailed Reports <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={trafficData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="day" tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} />
                <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    border: 'none',
                    borderRadius: '8px',
                    color: '#fff',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="total" name="Total Registered" fill="#0c87eb" radius={[6, 6, 0, 0]} />
                <Bar dataKey="attended" name="Attended" fill="#10b981" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Visit Purpose Breakdown Pie Chart */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900 mb-1">Visit Purpose Distribution</h3>
            <p className="text-xs text-slate-500 mb-4">Top reasons for office visits</p>
          </div>

          <div className="h-56 w-full flex items-center justify-center">
            {purposeStats && purposeStats.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={purposeStats}
                    dataKey="count"
                    nameKey="purpose"
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={3}
                  >
                    {purposeStats.map((entry, index) => (
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
                  <Legend
                    verticalAlign="bottom"
                    iconSize={8}
                    wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-xs text-slate-400">No purpose data recorded yet</div>
            )}
          </div>
        </div>
      </div>

      {/* Recent Visitors Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900">Recent Visitors</h3>
            <p className="text-xs text-slate-500">Latest visitor entries and arrivals</p>
          </div>
          <Link
            to="/visitors"
            className="text-xs font-semibold text-brand-600 hover:text-brand-700 flex items-center gap-1"
          >
            View All <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 text-slate-500 font-semibold border-b border-slate-100">
              <tr>
                <th className="px-5 py-3.5">Visitor ID</th>
                <th className="px-5 py-3.5">Full Name</th>
                <th className="px-5 py-3.5">Company</th>
                <th className="px-5 py-3.5">Host Employee</th>
                <th className="px-5 py-3.5">Purpose</th>
                <th className="px-5 py-3.5">Date</th>
                <th className="px-5 py-3.5">Status</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {recentVisitors.length === 0 ? (
                <tr>
                  <td colSpan="8" className="text-center py-8 text-slate-400">
                    No visitor records found.
                  </td>
                </tr>
              ) : (
                recentVisitors.map((v) => (
                  <tr key={v.id} className="hover:bg-slate-50/80 transition">
                    <td className="px-5 py-3.5 font-mono font-bold text-slate-700">
                      {v.visitor_id}
                    </td>
                    <td className="px-5 py-3.5 font-semibold text-slate-900">
                      {v.full_name}
                    </td>
                    <td className="px-5 py-3.5 text-slate-600">{v.company}</td>
                    <td className="px-5 py-3.5 text-slate-700">{v.person_to_meet}</td>
                    <td className="px-5 py-3.5 text-slate-600">{v.purpose}</td>
                    <td className="px-5 py-3.5 text-slate-500">{v.visit_date}</td>
                    <td className="px-5 py-3.5">
                      <span
                        className={`inline-flex px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${getStatusBadge(
                          v.status
                        )}`}
                      >
                        {v.status}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <button
                        onClick={() => setSelectedVisitor(v)}
                        className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-[11px] transition"
                      >
                        View Pass
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Visitor Pass Modal */}
      <Modal
        isOpen={!!selectedVisitor}
        onClose={() => setSelectedVisitor(null)}
        title="Digital Visitor Pass Badge"
        maxWidth="max-w-md"
      >
        {selectedVisitor && (
          <VisitorPass
            visitor={selectedVisitor}
            onCheckIn={handleQuickCheckIn}
            onClose={() => setSelectedVisitor(null)}
          />
        )}
      </Modal>
    </div>
  );
}
