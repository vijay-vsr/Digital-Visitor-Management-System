import React, { useState, useEffect } from 'react';
import { useToast } from '../context/ToastContext';
import api from '../services/api';
import Modal from '../components/Modal';
import VisitorPass from '../components/VisitorPass';
import {
  LogIn,
  Search,
  User,
  Phone,
  Building2,
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  QrCode,
  Eye,
  RefreshCw,
} from 'lucide-react';

export default function CheckInPage() {
  const toast = useToast();

  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [expectedVisitors, setExpectedVisitors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [checkingInId, setCheckingInId] = useState(null);
  const [selectedPass, setSelectedPass] = useState(null);

  // Fetch today's expected visitors on load
  const fetchExpectedToday = async () => {
    try {
      const res = await api.get('/visitors?status=Expected&date=today&limit=20');
      if (res.data.success) {
        setExpectedVisitors(res.data.visitors);
      }
    } catch (err) {
      console.error('Failed to fetch expected visitors', err);
    }
  };

  useEffect(() => {
    fetchExpectedToday();
  }, []);

  // Search handler
  const handleSearch = async (e) => {
    e?.preventDefault();
    if (!searchTerm.trim()) {
      setSearchResults([]);
      return;
    }

    setLoading(true);
    try {
      const res = await api.get(`/visitors?search=${encodeURIComponent(searchTerm.trim())}&limit=10`);
      if (res.data.success) {
        setSearchResults(res.data.visitors);
        if (res.data.visitors.length === 0) {
          toast.info('No visitor found matching your query.');
        }
      }
    } catch (err) {
      toast.error('Search query failed.');
    } finally {
      setLoading(false);
    }
  };

  // Check In action
  const handleCheckIn = async (visitorId) => {
    setCheckingInId(visitorId);
    try {
      const res = await api.post(`/visitors/${visitorId}/checkin`);
      if (res.data.success) {
        toast.success(res.data.message);
        // Update local state
        setSearchResults((prev) =>
          prev.map((v) => (v.id === visitorId ? res.data.visitor : v))
        );
        setExpectedVisitors((prev) => prev.filter((v) => v.id !== visitorId));
        if (selectedPass && selectedPass.id === visitorId) {
          setSelectedPass(res.data.visitor);
        }
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Check-in failed');
    } finally {
      setCheckingInId(null);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
            <LogIn className="w-6 h-6 text-brand-600" />
            Visitor Check-In Desk
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Search visitor by pass ID, full name, or phone number to verify identity and record entry.
          </p>
        </div>
        <button
          onClick={fetchExpectedToday}
          className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition shadow-xs self-start"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Refresh Arrivals
        </button>
      </div>

      {/* Search Box */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs">
        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-5 h-5 text-slate-400 absolute left-4 top-3.5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by Visitor ID (e.g. VMS-...), Name, or Phone..."
              className="w-full pl-11 pr-4 py-3 text-sm rounded-2xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500 font-medium"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3 bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs rounded-2xl shadow-md transition flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {loading ? 'Searching...' : 'Search Visitor'}
          </button>
        </form>

        {/* Search Results Display */}
        {searchResults.length > 0 && (
          <div className="mt-6 pt-6 border-t border-slate-100 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Search Results ({searchResults.length})
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {searchResults.map((v) => (
                <div
                  key={v.id}
                  className="bg-slate-50/70 border border-slate-200 rounded-2xl p-4 flex flex-col justify-between"
                >
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div>
                      <span className="font-mono font-bold text-xs text-brand-600">
                        {v.visitor_id}
                      </span>
                      <h4 className="text-base font-bold text-slate-900">{v.full_name}</h4>
                      <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                        <Building2 className="w-3.5 h-3.5" /> {v.company || 'Independent'}
                      </p>
                    </div>

                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${
                        v.status === 'Checked In'
                          ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                          : v.status === 'Checked Out'
                          ? 'bg-slate-200 text-slate-700 border-slate-300'
                          : 'bg-blue-100 text-blue-800 border-blue-200'
                      }`}
                    >
                      {v.status}
                    </span>
                  </div>

                  <div className="text-xs text-slate-600 space-y-1 py-2 border-t border-slate-200/60 mb-3">
                    <p>
                      <strong>Host:</strong> {v.person_to_meet}
                    </p>
                    <p>
                      <strong>Purpose:</strong> {v.purpose}
                    </p>
                    <p>
                      <strong>Phone:</strong> {v.phone}
                    </p>
                    {v.check_in_time && (
                      <p className="text-emerald-700 font-semibold">
                        <strong>Checked in at:</strong> {v.check_in_time}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-2 pt-2 border-t border-slate-200/60">
                    <button
                      onClick={() => setSelectedPass(v)}
                      className="flex-1 px-3 py-2 rounded-xl bg-white border border-slate-300 text-slate-700 text-xs font-semibold hover:bg-slate-100 transition flex items-center justify-center gap-1"
                    >
                      <Eye className="w-3.5 h-3.5" /> Pass
                    </button>

                    {v.status === 'Expected' ? (
                      <button
                        onClick={() => handleCheckIn(v.id)}
                        disabled={checkingInId === v.id}
                        className="flex-1 px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition shadow-xs flex items-center justify-center gap-1 disabled:opacity-60"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        {checkingInId === v.id ? 'Checking In...' : 'Check In'}
                      </button>
                    ) : v.status === 'Checked In' ? (
                      <span className="flex-1 px-3 py-2 rounded-xl bg-emerald-50 text-emerald-700 text-xs font-bold text-center border border-emerald-200">
                        Already Checked In
                      </span>
                    ) : (
                      <span className="flex-1 px-3 py-2 rounded-xl bg-slate-100 text-slate-500 text-xs font-medium text-center">
                        Visit Completed
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Expected Today Queue */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Expected Arrivals Today ({expectedVisitors.length})
            </h3>
            <p className="text-xs text-slate-500">
              Visitors pre-registered for today awaiting arrival at reception
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-100">
              <tr>
                <th className="px-5 py-3.5">Visitor ID</th>
                <th className="px-5 py-3.5">Visitor Name</th>
                <th className="px-5 py-3.5">Company</th>
                <th className="px-5 py-3.5">Host Employee</th>
                <th className="px-5 py-3.5">Purpose</th>
                <th className="px-5 py-3.5">Expected Arrival</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {expectedVisitors.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center py-8 text-slate-400">
                    No expected arrivals pending for today.
                  </td>
                </tr>
              ) : (
                expectedVisitors.map((v) => (
                  <tr key={v.id} className="hover:bg-slate-50/80 transition">
                    <td className="px-5 py-3.5 font-mono font-bold text-brand-600">
                      {v.visitor_id}
                    </td>
                    <td className="px-5 py-3.5 font-semibold text-slate-900">
                      {v.full_name}
                    </td>
                    <td className="px-5 py-3.5 text-slate-600">{v.company}</td>
                    <td className="px-5 py-3.5 text-slate-700">{v.person_to_meet}</td>
                    <td className="px-5 py-3.5 text-slate-600">{v.purpose}</td>
                    <td className="px-5 py-3.5 text-slate-600 font-medium">
                      {v.expected_arrival || 'Anytime'}
                    </td>
                    <td className="px-5 py-3.5 text-right space-x-2">
                      <button
                        onClick={() => setSelectedPass(v)}
                        className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-[11px] transition"
                      >
                        Badge
                      </button>
                      <button
                        onClick={() => handleCheckIn(v.id)}
                        disabled={checkingInId === v.id}
                        className="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] transition shadow-xs disabled:opacity-60"
                      >
                        {checkingInId === v.id ? 'Checking In...' : 'Check In'}
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
        isOpen={!!selectedPass}
        onClose={() => setSelectedPass(null)}
        title="Visitor Pass Verification"
        maxWidth="max-w-md"
      >
        {selectedPass && (
          <VisitorPass
            visitor={selectedPass}
            onCheckIn={handleCheckIn}
            onClose={() => setSelectedPass(null)}
          />
        )}
      </Modal>
    </div>
  );
}
