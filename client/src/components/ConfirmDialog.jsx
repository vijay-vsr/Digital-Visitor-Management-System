import React from 'react';
import Modal from './Modal';
import { AlertTriangle, AlertCircle, Info } from 'lucide-react';

export default function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title = 'Confirm Action',
  message = 'Are you sure you want to proceed?',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  type = 'danger',
  isLoading = false,
}) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="max-w-md">
      <div className="flex flex-col items-center text-center">
        <div
          className={`w-14 h-14 rounded-full flex items-center justify-center mb-4 ${
            type === 'danger'
              ? 'bg-rose-100 text-rose-600'
              : type === 'warning'
              ? 'bg-amber-100 text-amber-600'
              : 'bg-sky-100 text-brand-600'
          }`}
        >
          {type === 'danger' ? (
            <AlertCircle className="w-8 h-8" />
          ) : type === 'warning' ? (
            <AlertTriangle className="w-8 h-8" />
          ) : (
            <Info className="w-8 h-8" />
          )}
        </div>

        <h3 className="text-xl font-bold text-slate-900 mb-2">{title}</h3>
        <p className="text-slate-600 text-sm mb-6 max-w-sm">{message}</p>

        <div className="flex gap-3 w-full justify-center">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="flex-1 px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-medium hover:bg-slate-50 transition disabled:opacity-50"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className={`flex-1 px-4 py-2.5 rounded-xl text-white font-medium shadow-sm transition disabled:opacity-50 ${
              type === 'danger'
                ? 'bg-rose-600 hover:bg-rose-700'
                : 'bg-brand-600 hover:bg-brand-700'
            }`}
          >
            {isLoading ? 'Processing...' : confirmText}
          </button>
        </div>
      </div>
    </Modal>
  );
}
