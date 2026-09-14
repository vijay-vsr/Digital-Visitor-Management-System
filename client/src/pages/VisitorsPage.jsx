import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import api from '../services/api';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';
import VisitorPass from '../components/VisitorPass';
import {
  Users,
  Search,
  Filter,
  Download,
  Eye,
  Edit2,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Plus,
  Calendar,
  CheckCircle2,
  XCircle,
  Clock,
} from 'lucide-react';
import { Link } from 'react-router-dom';

export default function VisitorsPage() {
  const { isAdmin } = useAuth();
  const toast = useToast();

  const [visitors, setVisitors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 1 });

  // Filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [dateFilter, setDateFilter] = useState('');

  // Modals
  const [viewVisitor, setViewVisitor] = useState(null);
  const [editVisitor, setEditVisitor] = useState(null);
  const [deleteVisitorTarget, setDeleteVisitorTarget] = useState(null);
  const [savingEdit, setSavingEdit] = useState(false);

  const fetchVisitors = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page,
        limit: 10,
      });

      if (search.trim()) params.append('search', search.trim());
      if (statusFilter && statusFilter !== 'All') params.append('status', statusFilter);
      if (dateFilter) params.append('date', dateFilter);

      const res = await api.get(`/visitors?${params.toString()}`);
      if (res.data.success) {
        setVisitors(res.data.visitors);
        setPagination(res.data.pagination);
      }
    } catch (err) {
      toast.error('Failed to load visitor records.');
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter, dateFilter, toast]);

  useEffect(() => {
    fetchVisitors(1);
  }, [fetchVisitors]);

  // Handle Edit Save
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setSavingEdit(true);
    try {
      const res = await api.put(`/visitors/${editVisitor.id}`, editVisitor);
      if (res.data.success) {
        toast.success(res.data.message);
        setEditVisitor(null);
        fetchVisitors(pagination.page);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update visitor');
    } finally {
      setSavingEdit(false);
    }
  };

  // Handle Delete Confirm
  const handleDeleteConfirm = async () => {
    if (!deleteVisitorTarget) return;
    try {
      const res = await api.delete(`/visitors/${deleteVisitorTarget.id}`);
      if (res.data.success) {
        toast.success(res.data.message);
        setDeleteVisitorTarget(null);
        fetchVisitors(pagination.page);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete record');
    }
  };

  // Export CSV
  const handleExportCSV = () => {
    const params = new URLSearchParams();
    if (statusFilter && statusFilter !== 'All') params.append('status', statusFilter);
    if (dateFilter) params.append('startDate', dateFilter);

    window.open(`/api/reports/export/csv?${params.toString()}`, '_blank');
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
        return 'bg-rose-100 text-rose-800 border-rose-200';
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
            <Users className="w-6 h-6 text-brand-600" />
            Visitor Directory & Management
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Search, filter, edit, and audit complete office visitor history records.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700 shadow-xs transition"
          >
            <Download className="w-4 h-4 text-slate-500" />
            <span>Export CSV</span>
          </button>
          <Link
            to="/register"
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold shadow-md transition"
          >
            <Plus className="w-4 h-4" />
            <span>New Visitor</span>
          </Link>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex flex-col md:flex-row items-center gap-3">
        {/* Search Input */}
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search visitor ID, name, company, host..."
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>

        {/* Status Filter */}
        <div className="w-full sm:w-44">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
          >
            <option value="All">All Statuses</option>
            <option value="Expected">Expected</option>
            <option value="Checked In">Checked In</option>
            <option value="Checked Out">Checked Out</option>
          </select>
        </div>

        {/* Date Filter */}
        <div className="w-full sm:w-44">
          <input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>

        {dateFilter && (
          <button
            onClick={() => setDateFilter('')}
            className="text-xs text-slate-500 hover:text-slate-800 underline px-2"
          >
            Clear Date
          </button>
        )}
      </div>

      {/* Visitors Data Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-100">
              <tr>
                <th className="px-4 py-3.5">Visitor ID</th>
                <th className="px-4 py-3.5">Full Name</th>
                <th className="px-4 py-3.5">Company</th>
                <th className="px-4 py-3.5">Host Employee</th>
                <th className="px-4 py-3.5">Purpose</th>
                <th className="px-4 py-3.5">Visit Date</th>
                <th className="px-4 py-3.5">Check-In</th>
                <th className="px-4 py-3.5">Check-Out</th>
                <th className="px-4 py-3.5">Status</th>
                <th className="px-4 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan="10" className="text-center py-12 text-slate-400">
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
                      <span>Loading visitor directory...</span>
                    </div>
                  </td>
                </tr>
              ) : visitors.length === 0 ? (
                <tr>
                  <td colSpan="10" className="text-center py-12 text-slate-400">
                    No visitor records found matching your filters.
                  </td>
                </tr>
              ) : (
                visitors.map((v) => (
                  <tr key={v.id} className="hover:bg-slate-50/80 transition">
                    <td className="px-4 py-3.5 font-mono font-bold text-slate-800">
                      {v.visitor_id}
                    </td>
                    <td className="px-4 py-3.5 font-semibold text-slate-900">
                      <div>{v.full_name}</div>
                      <div className="text-[10px] text-slate-400 font-normal">{v.phone}</div>
                    </td>
                    <td className="px-4 py-3.5 text-slate-600">{v.company || '-'}</td>
                    <td className="px-4 py-3.5 text-slate-700 font-medium">{v.person_to_meet}</td>
                    <td className="px-4 py-3.5 text-slate-600">{v.purpose}</td>
                    <td className="px-4 py-3.5 text-slate-500">{v.visit_date}</td>
                    <td className="px-4 py-3.5 text-slate-600 font-mono text-[11px]">
                      {v.check_in_time ? v.check_in_time.slice(11, 16) : '-'}
                    </td>
                    <td className="px-4 py-3.5 text-slate-600 font-mono text-[11px]">
                      {v.check_out_time ? v.check_out_time.slice(11, 16) : '-'}
                    </td>
                    <td className="px-4 py-3.5">
                      <span
                        className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold border ${getStatusBadge(
                          v.status
                        )}`}
                      >
                        {v.status}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => setViewVisitor(v)}
                          className="p-1 text-slate-500 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition"
                          title="View Digital Pass"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setEditVisitor(v)}
                          className="p-1 text-slate-500 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition"
                          title="Edit Visitor"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        {isAdmin && (
                          <button
                            onClick={() => setDeleteVisitorTarget(v)}
                            className="p-1 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                            title="Delete Visitor"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="p-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <div>
            Showing{' '}
            <span className="font-semibold text-slate-800">
              {visitors.length > 0 ? (pagination.page - 1) * pagination.limit + 1 : 0}
            </span>{' '}
            to{' '}
            <span className="font-semibold text-slate-800">
              {Math.min(pagination.page * pagination.limit, pagination.total)}
            </span>{' '}
            of <span className="font-semibold text-slate-800">{pagination.total}</span> records
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => fetchVisitors(pagination.page - 1)}
              disabled={pagination.page <= 1}
              className="p-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 transition"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="font-medium text-slate-700">
              Page {pagination.page} of {pagination.totalPages}
            </span>
            <button
              onClick={() => fetchVisitors(pagination.page + 1)}
              disabled={pagination.page >= pagination.totalPages}
              className="p-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 transition"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* View Pass Modal */}
      <Modal
        isOpen={!!viewVisitor}
        onClose={() => setViewVisitor(null)}
        title="Digital Visitor Pass"
        maxWidth="max-w-md"
      >
        {viewVisitor && (
          <VisitorPass
            visitor={viewVisitor}
            onClose={() => setViewVisitor(null)}
          />
        )}
      </Modal>

      {/* Edit Visitor Modal */}
      <Modal
        isOpen={!!editVisitor}
        onClose={() => setEditVisitor(null)}
        title={`Edit Visitor (${editVisitor?.visitor_id})`}
        maxWidth="max-w-xl"
      >
        {editVisitor && (
          <form onSubmit={handleEditSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name</label>
                <input
                  type="text"
                  value={editVisitor.full_name || ''}
                  onChange={(e) =>
                    setEditVisitor((prev) => ({ ...prev, full_name: e.target.value }))
                  }
                  required
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Phone Number</label>
                <input
                  type="text"
                  value={editVisitor.phone || ''}
                  onChange={(e) =>
                    setEditVisitor((prev) => ({ ...prev, phone: e.target.value }))
                  }
                  required
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Company</label>
                <input
                  type="text"
                  value={editVisitor.company || ''}
                  onChange={(e) =>
                    setEditVisitor((prev) => ({ ...prev, company: e.target.value }))
                  }
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Host Employee</label>
                <input
                  type="text"
                  value={editVisitor.person_to_meet || ''}
                  onChange={(e) =>
                    setEditVisitor((prev) => ({ ...prev, person_to_meet: e.target.value }))
                  }
                  required
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Purpose</label>
                <input
                  type="text"
                  value={editVisitor.purpose || ''}
                  onChange={(e) =>
                    setEditVisitor((prev) => ({ ...prev, purpose: e.target.value }))
                  }
                  required
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Status</label>
                <select
                  value={editVisitor.status || 'Expected'}
                  onChange={(e) =>
                    setEditVisitor((prev) => ({ ...prev, status: e.target.value }))
                  }
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white"
                >
                  <option value="Expected">Expected</option>
                  <option value="Checked In">Checked In</option>
                  <option value="Checked Out">Checked Out</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">Notes</label>
                <textarea
                  rows="2"
                  value={editVisitor.notes || ''}
                  onChange={(e) =>
                    setEditVisitor((prev) => ({ ...prev, notes: e.target.value }))
                  }
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setEditVisitor(null)}
                className="px-4 py-2 text-xs font-semibold rounded-xl border border-slate-300 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={savingEdit}
                className="px-5 py-2 text-xs font-bold rounded-xl bg-brand-600 hover:bg-brand-700 text-white shadow-xs"
              >
                {savingEdit ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        )}
      </Modal>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={!!deleteVisitorTarget}
        onClose={() => setDeleteVisitorTarget(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete Visitor Record"
        message={
          deleteVisitorTarget
            ? `Are you sure you want to permanently delete visitor record ${deleteVisitorTarget.visitor_id} (${deleteVisitorTarget.full_name})? This action cannot be undone.`
            : ''
        }
        confirmText="Delete Record"
        type="danger"
      />
    </div>
  );
}
