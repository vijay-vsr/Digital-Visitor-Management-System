import React from 'react';
import { Printer, CheckCircle2, Clock, Building2, User, Calendar, QrCode, Shield, Download } from 'lucide-react';

export default function VisitorPass({ visitor, onCheckIn, onClose }) {
  if (!visitor) return null;

  const handlePrint = () => {
    window.print();
  };

  const statusColors = {
    'Checked In': 'bg-emerald-100 text-emerald-800 border-emerald-300',
    'Checked Out': 'bg-slate-100 text-slate-700 border-slate-300',
    'Expected': 'bg-blue-100 text-blue-800 border-blue-300',
    'Cancelled': 'bg-rose-100 text-rose-800 border-rose-300',
  };

  return (
    <div className="flex flex-col items-center">
      {/* Action bar (hidden when printing) */}
      <div className="w-full flex items-center justify-between pb-4 mb-4 border-b border-slate-200 print:hidden">
        <div className="text-sm text-slate-500 font-medium">
          Official Office Visitor Badge
        </div>
        <div className="flex items-center gap-2">
          {onCheckIn && visitor.status === 'Expected' && (
            <button
              onClick={() => onCheckIn(visitor.id)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg shadow-sm transition"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              Check In Now
            </button>
          )}
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold rounded-lg shadow-sm transition"
          >
            <Printer className="w-3.5 h-3.5" />
            Print Pass
          </button>
        </div>
      </div>

      {/* Printable Badge Card */}
      <div
        id="printable-pass"
        className="w-full max-w-sm bg-white rounded-2xl border-2 border-slate-200 shadow-xl overflow-hidden relative"
      >
        {/* Top lanyard hole visual */}
        <div className="w-16 h-3 bg-slate-200 rounded-full mx-auto mt-3 border border-slate-300"></div>

        {/* Badge Header */}
        <div className="bg-gradient-to-r from-brand-700 to-indigo-800 text-white p-4 text-center mt-2">
          <div className="flex items-center justify-center gap-2 mb-0.5">
            <Shield className="w-5 h-5 text-brand-300" />
            <span className="font-bold tracking-wide text-base">APEX GLOBAL TECH</span>
          </div>
          <p className="text-[11px] text-brand-200 font-medium tracking-widest uppercase">
            Official Visitor Pass
          </p>
        </div>

        {/* Visitor Info Body */}
        <div className="p-5 flex flex-col items-center text-center">
          {/* Status Chip */}
          <span
            className={`px-3 py-0.5 rounded-full text-xs font-bold border mb-3 ${
              statusColors[visitor.status] || 'bg-slate-100 text-slate-800'
            }`}
          >
            {visitor.status}
          </span>

          {/* Visitor Name */}
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight mb-1">
            {visitor.full_name}
          </h2>

          {/* Organization */}
          <p className="text-sm font-medium text-slate-600 flex items-center gap-1 mb-4">
            <Building2 className="w-4 h-4 text-slate-400" />
            {visitor.company || 'Independent Visitor'}
          </p>

          {/* Badge Details Grid */}
          <div className="w-full bg-slate-50 rounded-xl p-3 border border-slate-200/80 text-left text-xs space-y-2 mb-4">
            <div className="flex justify-between items-center py-0.5 border-b border-slate-200/60">
              <span className="text-slate-500 font-medium flex items-center gap-1">
                <User className="w-3.5 h-3.5 text-slate-400" /> Host:
              </span>
              <span className="font-bold text-slate-800">{visitor.person_to_meet}</span>
            </div>

            <div className="flex justify-between items-center py-0.5 border-b border-slate-200/60">
              <span className="text-slate-500 font-medium">Purpose:</span>
              <span className="font-semibold text-slate-800">{visitor.purpose}</span>
            </div>

            <div className="flex justify-between items-center py-0.5 border-b border-slate-200/60">
              <span className="text-slate-500 font-medium flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-slate-400" /> Date:
              </span>
              <span className="font-medium text-slate-800">{visitor.visit_date}</span>
            </div>

            {visitor.check_in_time ? (
              <div className="flex justify-between items-center py-0.5 border-b border-slate-200/60">
                <span className="text-slate-500 font-medium flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-emerald-600" /> Checked In:
                </span>
                <span className="font-bold text-emerald-700">{visitor.check_in_time}</span>
              </div>
            ) : visitor.expected_arrival ? (
              <div className="flex justify-between items-center py-0.5 border-b border-slate-200/60">
                <span className="text-slate-500 font-medium flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-slate-400" /> Expected At:
                </span>
                <span className="font-medium text-slate-800">{visitor.expected_arrival}</span>
              </div>
            ) : null}

            {visitor.id_proof_type && (
              <div className="flex justify-between items-center py-0.5">
                <span className="text-slate-500 font-medium">ID Verified:</span>
                <span className="font-medium text-slate-800">{visitor.id_proof_type}</span>
              </div>
            )}
          </div>

          {/* QR Barcode Section */}
          <div className="flex flex-col items-center justify-center p-3 bg-white border border-slate-200 rounded-xl w-full">
            {/* High visual fidelity simulated QR code */}
            <div className="w-24 h-24 border-2 border-slate-800 p-1 rounded-lg flex items-center justify-center bg-slate-50 relative overflow-hidden">
              <QrCode className="w-20 h-20 text-slate-900" />
            </div>
            <p className="mt-2 font-mono font-bold text-sm text-slate-900 tracking-wider">
              {visitor.visitor_id}
            </p>
            <p className="text-[10px] text-slate-400 mt-0.5">Scan at reception terminal</p>
          </div>

          {/* Security Notice Footer */}
          <div className="mt-3 pt-3 border-t border-slate-200 w-full text-[10px] text-slate-400 text-center leading-tight">
            Please wear this badge visibly while inside premises. Return badge to reception upon checkout.
          </div>
        </div>
      </div>

      {onClose && (
        <button
          onClick={onClose}
          className="mt-4 text-xs font-semibold text-slate-500 hover:text-slate-700 underline print:hidden"
        >
          Close Pass Window
        </button>
      )}
    </div>
  );
}
