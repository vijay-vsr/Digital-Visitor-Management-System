import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import api from '../services/api';
import VisitorPass from '../components/VisitorPass';
import {
  UserPlus,
  User,
  Phone,
  Mail,
  Building2,
  Calendar,
  Clock,
  FileBadge,
  CheckCircle2,
  ArrowLeft,
  Users,
  AlertCircle,
} from 'lucide-react';

export default function RegisterVisitor() {
  const { isAuthenticated, user } = useAuth();
  const toast = useToast();

  const [employees, setEmployees] = useState([]);
  const [loadingEmployees, setLoadingEmployees] = useState(true);

  // Form State
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
    expected_arrival: '10:00',
    expected_departure: '12:00',
    notes: '',
    auto_check_in: false,
  });

  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [registeredVisitor, setRegisteredVisitor] = useState(null);

  useEffect(() => {
    async function loadEmployees() {
      try {
        const res = await api.get('/employees?activeOnly=true');
        if (res.data.success) {
          setEmployees(res.data.employees);
        }
      } catch (err) {
        console.error('Failed to load employees for dropdown', err);
      } finally {
        setLoadingEmployees(false);
      }
    }
    loadEmployees();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const handleEmployeeSelect = (e) => {
    const empId = e.target.value;
    const emp = employees.find((x) => String(x.id) === String(empId));
    setFormData((prev) => ({
      ...prev,
      employee_id: empId,
      person_to_meet: emp ? `${emp.name} (${emp.department})` : '',
    }));
    if (errors.person_to_meet) {
      setErrors((prev) => ({ ...prev, person_to_meet: null }));
    }
  };

  const validate = () => {
    const errs = {};
    if (!formData.full_name.trim()) errs.full_name = 'Visitor full name is required.';
    if (!formData.phone.trim()) errs.phone = 'Contact phone number is required.';
    if (!formData.person_to_meet.trim()) errs.person_to_meet = 'Please select the person to meet.';
    if (!formData.purpose) errs.purpose = 'Purpose of visit is required.';
    if (!formData.visit_date) errs.visit_date = 'Visit date is required.';

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    try {
      const res = await api.post('/visitors', formData);
      if (res.data.success) {
        toast.success(res.data.message);
        setRegisteredVisitor(res.data.visitor);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to register visitor.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleReset = () => {
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
      expected_departure: '12:00',
      notes: '',
      auto_check_in: false,
    });
    setErrors({});
    setRegisteredVisitor(null);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
            <UserPlus className="w-6 h-6 text-brand-600" />
            Visitor Registration
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Register an upcoming or walk-in visitor to generate their digital badge pass.
          </p>
        </div>
      </div>

      {registeredVisitor ? (
        /* Success Screen: Display Visitor Pass */
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-md">
          <div className="text-center mb-6">
            <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-3">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-bold text-slate-900">Registration Complete!</h2>
            <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
              Visitor ID <span className="font-mono font-bold text-brand-600">{registeredVisitor.visitor_id}</span> generated. The visitor pass is ready for printing or verification.
            </p>
          </div>

          <div className="flex justify-center my-6">
            <VisitorPass
              visitor={registeredVisitor}
              onCheckIn={async (id) => {
                try {
                  const res = await api.post(`/visitors/${id}/checkin`);
                  if (res.data.success) {
                    toast.success(res.data.message);
                    setRegisteredVisitor(res.data.visitor);
                  }
                } catch (err) {
                  toast.error(err.response?.data?.message || 'Check-in failed');
                }
              }}
            />
          </div>

          <div className="flex justify-center gap-3 pt-4 border-t border-slate-100 print:hidden">
            <button
              onClick={handleReset}
              className="px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-semibold text-xs transition shadow-sm"
            >
              Register Another Visitor
            </button>
            <a
              href="/visitors"
              className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition"
            >
              View Visitors List
            </a>
          </div>
        </div>
      ) : (
        /* Registration Form */
        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm space-y-6"
        >
          {/* Section 1: Personal Details */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 mb-4 pb-2 border-b border-slate-100 flex items-center gap-2">
              <User className="w-4 h-4 text-brand-600" />
              1. Visitor Information
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Full Name <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    name="full_name"
                    value={formData.full_name}
                    onChange={handleChange}
                    placeholder="e.g. Johnathan Vance"
                    className={`w-full pl-9 pr-3 py-2 text-xs rounded-xl border ${
                      errors.full_name ? 'border-rose-500 ring-1 ring-rose-500' : 'border-slate-300'
                    } focus:outline-none focus:ring-2 focus:ring-brand-500`}
                  />
                </div>
                {errors.full_name && <p className="text-xs text-rose-500 mt-1">{errors.full_name}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Phone Number <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="e.g. +1-555-0192"
                    className={`w-full pl-9 pr-3 py-2 text-xs rounded-xl border ${
                      errors.phone ? 'border-rose-500 ring-1 ring-rose-500' : 'border-slate-300'
                    } focus:outline-none focus:ring-2 focus:ring-brand-500`}
                  />
                </div>
                {errors.phone && <p className="text-xs text-rose-500 mt-1">{errors.phone}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="e.g. visitor@company.com"
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Company / Organization
                </label>
                <div className="relative">
                  <Building2 className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    name="company"
                    value={formData.company}
                    onChange={handleChange}
                    placeholder="e.g. CloudScale Innovations"
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Meeting & Purpose Details */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 mb-4 pb-2 border-b border-slate-100 flex items-center gap-2">
              <Building2 className="w-4 h-4 text-brand-600" />
              2. Host & Visit Purpose
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Person to Meet (Host) <span className="text-rose-500">*</span>
                </label>
                <select
                  value={formData.employee_id}
                  onChange={handleEmployeeSelect}
                  className={`w-full px-3 py-2 text-xs rounded-xl border ${
                    errors.person_to_meet ? 'border-rose-500 ring-1 ring-rose-500' : 'border-slate-300'
                  } bg-white focus:outline-none focus:ring-2 focus:ring-brand-500`}
                >
                  <option value="">-- Select Host Employee --</option>
                  {employees.map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      {emp.name} — {emp.designation} ({emp.department})
                    </option>
                  ))}
                </select>
                {errors.person_to_meet && (
                  <p className="text-xs text-rose-500 mt-1">{errors.person_to_meet}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Purpose of Visit <span className="text-rose-500">*</span>
                </label>
                <select
                  name="purpose"
                  value={formData.purpose}
                  onChange={handleChange}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                >
                  <option value="Meeting">Business Meeting</option>
                  <option value="Interview">Job Interview</option>
                  <option value="Delivery">Courier / Delivery</option>
                  <option value="Vendor">Vendor / Supplier</option>
                  <option value="Technical Discussion">Technical Discussion</option>
                  <option value="Maintenance">Facility Maintenance</option>
                  <option value="Client Meeting">Client Consultation</option>
                  <option value="Audit">Audit / Compliance</option>
                  <option value="Personal">Personal Visit</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Number of Visitors
                </label>
                <div className="relative">
                  <Users className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="number"
                    min="1"
                    max="20"
                    name="number_of_visitors"
                    value={formData.number_of_visitors}
                    onChange={handleChange}
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Visit Date <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="date"
                    name="visit_date"
                    value={formData.visit_date}
                    onChange={handleChange}
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Expected Arrival Time
                </label>
                <div className="relative">
                  <Clock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="time"
                    name="expected_arrival"
                    value={formData.expected_arrival}
                    onChange={handleChange}
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Expected Departure Time
                </label>
                <div className="relative">
                  <Clock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="time"
                    name="expected_departure"
                    value={formData.expected_departure}
                    onChange={handleChange}
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: Identity Verification */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 mb-4 pb-2 border-b border-slate-100 flex items-center gap-2">
              <FileBadge className="w-4 h-4 text-brand-600" />
              3. Identification & Notes
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  ID Proof Type
                </label>
                <select
                  name="id_proof_type"
                  value={formData.id_proof_type}
                  onChange={handleChange}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                >
                  <option value="National ID">National ID Card</option>
                  <option value="Driving License">Driving License</option>
                  <option value="Passport">Passport</option>
                  <option value="Employee ID">Company Employee ID</option>
                  <option value="Other">Other Official ID</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  ID Proof Number (Demo / Academic)
                </label>
                <input
                  type="text"
                  name="id_proof_number"
                  value={formData.id_proof_number}
                  onChange={handleChange}
                  placeholder="e.g. DL-982341"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Notes / Instructions
                </label>
                <textarea
                  rows="2"
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  placeholder="Any luggage items, laptops, or special instructions..."
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>
            </div>
          </div>

          {/* Quick Check-in Checkbox for Staff */}
          {isAuthenticated && (
            <div className="p-3 bg-brand-50/60 rounded-xl border border-brand-100 flex items-center gap-3">
              <input
                type="checkbox"
                id="auto_check_in"
                name="auto_check_in"
                checked={formData.auto_check_in}
                onChange={handleChange}
                className="w-4 h-4 rounded text-brand-600 focus:ring-brand-500 border-slate-300"
              />
              <label htmlFor="auto_check_in" className="text-xs font-medium text-brand-900 cursor-pointer">
                <strong>Direct Check-In:</strong> Mark visitor as "Checked In" immediately upon registration (for walk-in visitors currently standing at the desk).
              </label>
            </div>
          )}

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={handleReset}
              className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-semibold text-xs hover:bg-slate-50 transition"
            >
              Clear Form
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs shadow-md transition flex items-center gap-2 disabled:opacity-60"
            >
              {submitting ? (
                <span>Registering...</span>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Register & Generate Pass</span>
                </>
              )}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
