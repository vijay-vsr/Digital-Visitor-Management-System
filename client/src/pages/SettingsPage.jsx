import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import api from '../services/api';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';
import {
  Settings,
  Shield,
  Building,
  UserPlus,
  Trash2,
  Mail,
  Lock,
  Phone,
  Save,
  CheckCircle2,
} from 'lucide-react';

export default function SettingsPage() {
  const { user } = useAuth();
  const toast = useToast();

  const [settings, setSettings] = useState({
    office_name: '',
    office_address: '',
    contact_phone: '',
    contact_email: '',
    visitor_pass_instructions: '',
  });
  const [usersList, setUsersList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savingSettings, setSavingSettings] = useState(false);

  // New staff modal
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    password: '',
    role: 'security',
  });
  const [deletingUser, setDeletingUser] = useState(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const [settingsRes, usersRes] = await Promise.all([
        api.get('/users/settings'),
        api.get('/users'),
      ]);

      if (settingsRes.data.success) {
        setSettings((prev) => ({ ...prev, ...settingsRes.data.settings }));
      }
      if (usersRes.data.success) {
        setUsersList(usersRes.data.users);
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to load system settings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSaveSettings = async (e) => {
    e.preventDefault();
    setSavingSettings(true);
    try {
      const res = await api.put('/users/settings', { settings });
      if (res.data.success) {
        toast.success(res.data.message);
      }
    } catch (err) {
      toast.error('Failed to save settings.');
    } finally {
      setSavingSettings(false);
    }
  };

  const handleAddUser = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/users', newUser);
      if (res.data.success) {
        toast.success(res.data.message);
        setIsAddUserOpen(false);
        setNewUser({ name: '', email: '', password: '', role: 'security' });
        loadData();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create user account');
    }
  };

  const handleDeleteUserConfirm = async () => {
    if (!deletingUser) return;
    try {
      const res = await api.delete(`/users/${deletingUser.id}`);
      if (res.data.success) {
        toast.success(res.data.message);
        setDeletingUser(null);
        loadData();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete user');
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
          <Settings className="w-6 h-6 text-brand-600" />
          System Settings & Staff Management
        </h1>
        <p className="text-xs sm:text-sm text-slate-500">
          Configure office profile, pass print notice, and security desk access credentials.
        </p>
      </div>

      {/* Office Profile Configuration */}
      <form
        onSubmit={handleSaveSettings}
        className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-4"
      >
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Building className="w-4 h-4 text-brand-600" />
              Office Organization Profile
            </h2>
            <p className="text-xs text-slate-500">Displayed on passes and public kiosk header</p>
          </div>
          <button
            type="submit"
            disabled={savingSettings}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs shadow-md transition disabled:opacity-50"
          >
            <Save className="w-3.5 h-3.5" />
            <span>{savingSettings ? 'Saving...' : 'Save Settings'}</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Company / Office Name</label>
            <input
              type="text"
              value={settings.office_name || ''}
              onChange={(e) => setSettings((prev) => ({ ...prev, office_name: e.target.value }))}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Office Address</label>
            <input
              type="text"
              value={settings.office_address || ''}
              onChange={(e) => setSettings((prev) => ({ ...prev, office_address: e.target.value }))}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Reception Phone</label>
            <input
              type="text"
              value={settings.contact_phone || ''}
              onChange={(e) => setSettings((prev) => ({ ...prev, contact_phone: e.target.value }))}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Reception Email</label>
            <input
              type="email"
              value={settings.contact_email || ''}
              onChange={(e) => setSettings((prev) => ({ ...prev, contact_email: e.target.value }))}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Visitor Pass Instructions (Printed on badge)
            </label>
            <textarea
              rows="2"
              value={settings.visitor_pass_instructions || ''}
              onChange={(e) =>
                setSettings((prev) => ({ ...prev, visitor_pass_instructions: e.target.value }))
              }
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300"
            />
          </div>
        </div>
      </form>

      {/* Staff Accounts Management */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Shield className="w-4 h-4 text-brand-600" />
              Security & Staff User Accounts
            </h2>
            <p className="text-xs text-slate-500">Personnel authorized to login and process visitors</p>
          </div>

          <button
            onClick={() => setIsAddUserOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-xs transition"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Add Staff User</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-100">
              <tr>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Role</th>
                <th className="px-4 py-3">Created</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {usersList.map((u) => (
                <tr key={u.id} className="hover:bg-slate-50 transition">
                  <td className="px-4 py-3 font-semibold text-slate-900">{u.name}</td>
                  <td className="px-4 py-3 text-slate-600">{u.email}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        u.role === 'admin'
                          ? 'bg-indigo-100 text-indigo-800 border border-indigo-200'
                          : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                      }`}
                    >
                      {u.role === 'admin' ? 'Administrator' : 'Reception / Security'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-400 text-[11px]">
                    {u.created_at ? u.created_at.slice(0, 10) : '-'}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {u.id !== user?.id && (
                      <button
                        onClick={() => setDeletingUser(u)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                        title="Delete User"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add User Modal */}
      <Modal isOpen={isAddUserOpen} onClose={() => setIsAddUserOpen(false)} title="Create Staff Account">
        <form onSubmit={handleAddUser} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Staff Member Name</label>
            <input
              type="text"
              value={newUser.name}
              onChange={(e) => setNewUser((prev) => ({ ...prev, name: e.target.value }))}
              required
              placeholder="e.g. Marcus Vance"
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address</label>
            <input
              type="email"
              value={newUser.email}
              onChange={(e) => setNewUser((prev) => ({ ...prev, email: e.target.value }))}
              required
              placeholder="e.g. guard1@office.com"
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Password</label>
            <input
              type="password"
              value={newUser.password}
              onChange={(e) => setNewUser((prev) => ({ ...prev, password: e.target.value }))}
              required
              placeholder="Enter temporary password"
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Assigned Role</label>
            <select
              value={newUser.role}
              onChange={(e) => setNewUser((prev) => ({ ...prev, role: e.target.value }))}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white"
            >
              <option value="security">Reception / Security Staff</option>
              <option value="admin">System Administrator</option>
            </select>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsAddUserOpen(false)}
              className="px-4 py-2 text-xs font-semibold rounded-xl border border-slate-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold rounded-xl bg-brand-600 hover:bg-brand-700 text-white shadow-xs"
            >
              Create Account
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete User Confirm */}
      <ConfirmDialog
        isOpen={!!deletingUser}
        onClose={() => setDeletingUser(null)}
        onConfirm={handleDeleteUserConfirm}
        title="Delete Staff Account"
        message={
          deletingUser
            ? `Are you sure you want to revoke access and remove ${deletingUser.name} (${deletingUser.email})?`
            : ''
        }
        confirmText="Remove Account"
        type="danger"
      />
    </div>
  );
}
