import React, { useState, useEffect } from 'react';
import api from '../services/api';
import VisitorPass from '../components/VisitorPass';
import {
  Shield,
  User,
  Phone,
  Mail,
  Building2,
  Calendar,
  Clock,
  CheckCircle2,
  QrCode,
  FileBadge,
} from 'lucide-react';

export default function PublicKioskPage() {
  const [employees, setEmployees] = useState([]);
  const [officeSettings, setOfficeSettings] = useState(null);

  const todayStr = new Date().toISOString().split('T')[0];
  const [formData, setFormData] = useState({
    full_name: '',
    phone: '',
    email: '',
    company: '',
    person_to_meet: '',
    employee_id: '',
    purpose: 'Meeting',
    number_of_visitors: 1,
    id_proof_type: 'National ID',
    id_proof_number: '',
    visit_date: todayStr,
    expected_arrival: '',
    expected_departure: '',
    notes: '',
  });

  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [passData, setPassData] = useState(null);

  useEffect(() => {
    // Set default arrival to current time HH:MM
    const now = new Date();
    const hh = String(now.getHours()).padStart(2, '0');
    const mm = String(now.getMinutes()).padStart(2, '0');
    setFormData((prev) => ({ ...prev, expected_arrival: `${hh}:${mm}` }));

    async function loadData() {
      try {
        const [empRes, setRes] = await Promise.all([
          api.get('/employees?activeOnly=true'),
          api.get('/users/settings'),
        ]);
        if (empRes.data.success) setEmployees(empRes.data.employees);
        if (setRes.data.success) setOfficeSettings(setRes.data.settings);
      } catch (e) {
        console.error('Kiosk data load error', e);
      }
    }
    loadData();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: null }));
  };

  const handleEmployeeSelect = (e) => {
    const empId = e.target.value;
    const emp = employees.find((x) => String(x.id) === String(empId));
    setFormData((prev) => ({
      ...prev,
      employee_id: empId,
      person_to_meet: emp ? `${emp.name} (${emp.department})` : '',
    }));
  };

  const validate = () => {
    const errs = {};
    if (!formData.full_name.trim()) errs.full_name = 'Your name is required';
    if (!formData.phone.trim()) errs.phone = 'Your phone number is required';
    if (!formData.person_to_meet.trim()) errs.person_to_meet = 'Please select the person you are visiting';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    try {
      // Register with auto_check_in = true since the guest is standing at the kiosk!
      const res = await api.post('/visitors', {
        ...formData,
        auto_check_in: true,
      });
      if (res.data.success) {
        setPassData(res.data.visitor);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Registration failed.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleReset = () => {
    setPassData(null);
    setFormData({
      full_name: '',
      phone: '',
      email: '',
      company: '',
      person_to_meet: '',
      employee_id: '',
      purpose: 'Meeting',
      number_of_visitors: 1,
      id_proof_type: 'National ID',
      id_proof_number: '',
      visit_date: todayStr,
      expected_arrival: '10:00',
      expected_departure: '',
      notes: '',
    });
  };

  return (
    <div className="w-full max-w-2xl mx-auto py-4">
      {passData ? (
        <div className="bg-white rounded-3xl p-6 sm:p-8 text-slate-800 shadow-2xl">
          <div className="text-center mb-6">
            <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-3">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-black text-slate-900">Check-In Successful!</h2>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
              Your visit has been recorded. Please print or collect your visitor pass badge below.
            </p>
          </div>

          <div className="flex justify-center my-6">
            <VisitorPass visitor={passData} />
          </div>

          <div className="text-center pt-4 border-t border-slate-100 print:hidden">
            <button
              onClick={handleReset}
              className="px-6 py-3 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs shadow-md transition"
            >
              Done & Return to Kiosk Start
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-slate-800/95 backdrop-blur-xl border border-slate-700 rounded-3xl p-6 sm:p-8 shadow-2xl">
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-brand-600 text-white mb-2 shadow-md">
              <QrCode className="w-6 h-6" />
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Welcome to {officeSettings?.office_name || 'Apex Global Technologies'}
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Please enter your details below to register and receive your visitor pass badge.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Full Name <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  name="full_name"
                  value={formData.full_name}
                  onChange={handleChange}
                  placeholder="e.g. Jonathan Vance"
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-900/90 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
                {errors.full_name && <p className="text-xs text-rose-400 mt-1">{errors.full_name}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Phone Number <span className="text-rose-400">*</span>
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="e.g. +1-555-2490"
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-900/90 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
                {errors.phone && <p className="text-xs text-rose-400 mt-1">{errors.phone}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="visitor@company.com"
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-900/90 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Company</label>
                <input
                  type="text"
                  name="company"
                  value={formData.company}
                  onChange={handleChange}
                  placeholder="e.g. CloudScale Solutions"
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-900/90 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Host Person to Meet <span className="text-rose-400">*</span>
                </label>
                <select
                  value={formData.employee_id}
                  onChange={handleEmployeeSelect}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                >
                  <option value="">-- Select Host --</option>
                  {employees.map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      {emp.name} ({emp.department})
                    </option>
                  ))}
                </select>
                {errors.person_to_meet && (
                  <p className="text-xs text-rose-400 mt-1">{errors.person_to_meet}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Purpose of Visit
                </label>
                <select
                  name="purpose"
                  value={formData.purpose}
                  onChange={handleChange}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                >
                  <option value="Meeting">Business Meeting</option>
                  <option value="Interview">Job Interview</option>
                  <option value="Delivery">Delivery</option>
                  <option value="Vendor">Vendor Meeting</option>
                  <option value="Technical Discussion">Technical Discussion</option>
                  <option value="Personal">Personal</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  ID Proof Type
                </label>
                <select
                  name="id_proof_type"
                  value={formData.id_proof_type}
                  onChange={handleChange}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                >
                  <option value="National ID">National ID Card</option>
                  <option value="Driving License">Driving License</option>
                  <option value="Passport">Passport</option>
                  <option value="Employee ID">Company ID</option>
                  <option value="Other">Other ID</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  ID Proof Number
                </label>
                <input
                  type="text"
                  name="id_proof_number"
                  value={formData.id_proof_number}
                  onChange={handleChange}
                  placeholder="e.g. DL-12345"
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-900/90 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full mt-4 py-3 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white font-bold text-sm shadow-xl shadow-brand-500/25 transition disabled:opacity-50"
            >
              {submitting ? 'Checking In...' : 'Register & Print Visitor Pass'}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
