import React, { useState, useEffect } from 'react';
import { useToast } from '../context/ToastContext';
import api from '../services/api';
import ConfirmDialog from '../components/ConfirmDialog';
import {
  LogOut,
  Clock,
  User,
  Building2,
  Search,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  Calendar,
} from 'lucide-react';

export default function CheckOutPage() {
  const toast = useToast();

  const [insideVisitors, setInsideVisitors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedForCheckout, setSelectedForCheckout] = useState(null);
  const [checkingOut, setCheckingOut] = useState(false);

  const fetchInsideVisitors = async () => {
    setLoading(true);
    try {
      const res = await api.get('/visitors/inside');
      if (res.data.success) {
        setInsideVisitors(res.data.visitors);
      }
    } catch (err) {
      toast.error('Failed to load inside visitors.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInsideVisitors();
  }, []);

  const handleConfirmCheckout = async () => {
    if (!selectedForCheckout) return;

    setCheckingOut(true);
    try {
      const res = await api.post(`/visitors/${selectedForCheckout.id}/checkout`);
      if (res.data.success) {
        toast.success(res.data.message);
        setInsideVisitors((prev) => prev.filter((v) => v.id !== selectedForCheckout.id));
        setSelectedForCheckout(null);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Check-out failed');
    } finally {
      setCheckingOut(false);
    }
  };

  // Helper for elapsed duration calculation
  const getDuration = (checkInTime) => {
    if (!checkInTime) return 'Just now';
    try {
      const start = new Date(checkInTime.replace(' ', 'T'));
      const now = new Date();
      const diffMs = now - start;
      if (isNaN(diffMs) || diffMs < 0) return 'Just now';

      const diffMins = Math.floor(diffMs / (1000 * 60));
      const hours = Math.floor(diffMins / 60);
      const mins = diffMins % 60;

      if (hours > 0) {
        return `${hours}h ${mins}m`;
      }
      return `${mins}m`;
    } catch {
      return 'N/A';
    }
  };

  const filteredVisitors = insideVisitors.filter((v) => {
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase();
    return (
      v.full_name?.toLowerCase().includes(term) ||
      v.visitor_id?.toLowerCase().includes(term) ||
      v.company?.toLowerCase().includes(term) ||
      v.person_to_meet?.toLowerCase().includes(term)
    );
  });

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
            <LogOut className="w-6 h-6 text-brand-600" />
            Visitor Check-Out Desk
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Currently checked-in visitors inside office premises ({insideVisitors.length} active).
          </p>
        </div>

        <button
          onClick={fetchInsideVisitors}
          className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition shadow-xs self-start"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          Refresh Live Status
        </button>
      </div>

      {/* Filter / Search bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Filter inside visitors..."
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>

        <div className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200 flex items-center gap-2 self-start sm:self-auto">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>{insideVisitors.length} Visitors Currently Inside</span>
        </div>
      </div>

      {/* Visitors List / Cards */}
      {insideVisitors.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200/80 shadow-xs">
          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto text-slate-400 mb-3">
            <CheckCircle2 className="w-8 h-8 text-emerald-500" />
          </div>
          <h3 className="text-lg font-bold text-slate-800">All Visitors Checked Out</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
            There are currently no active visitors inside the office premises.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredVisitors.map((v) => (
            <div
              key={v.id}
              className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:shadow-md transition flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div>
                    <span className="font-mono font-bold text-xs text-brand-600">
                      {v.visitor_id}
                    </span>
                    <h3 className="text-base font-bold text-slate-900 mt-0.5">{v.full_name}</h3>
                    <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                      <Building2 className="w-3.5 h-3.5 text-slate-400" /> {v.company || 'Independent'}
                    </p>
                  </div>

                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                    Inside ({getDuration(v.check_in_time)})
                  </span>
                </div>

                <div className="bg-slate-50 rounded-xl p-3 text-xs space-y-1.5 mb-4 border border-slate-100">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Host:</span>
                    <span className="font-semibold text-slate-800">{v.person_to_meet}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Purpose:</span>
                    <span className="font-medium text-slate-700">{v.purpose}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Checked In:</span>
                    <span className="font-medium text-emerald-700">{v.check_in_time}</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setSelectedForCheckout(v)}
                className="w-full py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-xs transition flex items-center justify-center gap-1.5"
              >
                <LogOut className="w-3.5 h-3.5 text-rose-400" />
                <span>Check Out Visitor</span>
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Confirmation Dialog */}
      <ConfirmDialog
        isOpen={!!selectedForCheckout}
        onClose={() => setSelectedForCheckout(null)}
        onConfirm={handleConfirmCheckout}
        isLoading={checkingOut}
        type="warning"
        title="Confirm Visitor Departure"
        message={
          selectedForCheckout
            ? `Confirm check-out for ${selectedForCheckout.full_name} (${selectedForCheckout.visitor_id})? This will record the exit timestamp and close the visit pass.`
            : ''
        }
        confirmText="Confirm Check-Out"
      />
    </div>
  );
}
