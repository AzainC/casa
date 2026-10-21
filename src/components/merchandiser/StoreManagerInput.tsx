import React from 'react';
import type { StoreLocation } from '../../types';
import { UserCheck, Phone, Sparkles } from 'lucide-react';

interface StoreManagerInputProps {
  selectedStore: StoreLocation | null;
  managerName: string;
  managerPhone: string;
  isAutoFilled: boolean;
  onNameChange: (val: string) => void;
  onPhoneChange: (val: string) => void;
}

export const StoreManagerInput: React.FC<StoreManagerInputProps> = ({
  selectedStore,
  managerName,
  managerPhone,
  isAutoFilled,
  onNameChange,
  onPhoneChange,
}) => {
  if (!selectedStore) return null;

  return (
    <div className="bg-white rounded-2xl p-4 sm:p-5 border border-stone-200/70 shadow-2xs space-y-3 transition-all animate-in fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
        <div>
          <label className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider flex items-center">
            <UserCheck className="w-3.5 h-3.5 mr-1.5 text-stone-400" />
            Store Manager / Person-in-Charge
          </label>
          <p className="text-xs text-stone-400 mt-0.5">
            Key retail contact for purchase orders, merchandiser sign-off, and deliveries.
          </p>
        </div>

        {isAutoFilled && (
          <span className="self-start sm:self-auto inline-flex items-center space-x-1 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200/60 text-[10px] font-medium">
            <Sparkles className="w-3 h-3 text-emerald-600" />
            <span>Retained from previous visit</span>
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
        {/* Manager Name */}
        <div>
          <label className="block text-[11px] font-medium text-stone-600 mb-1">
            Manager Name
          </label>
          <input
            type="text"
            value={managerName}
            onChange={(e) => onNameChange(e.target.value)}
            placeholder="e.g. Mohammad Rashid"
            className="w-full px-3 py-2 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:border-stone-400 text-stone-900 placeholder:text-stone-400 font-medium transition"
          />
        </div>

        {/* Manager Contact Phone Number */}
        <div>
          <label className="block text-[11px] font-medium text-stone-600 mb-1 flex items-center justify-between">
            <span>Contact Phone Number</span>
            {managerPhone && (
              <a
                href={`tel:${managerPhone}`}
                className="text-[10px] text-emerald-700 hover:underline flex items-center"
              >
                <Phone className="w-2.5 h-2.5 mr-0.5" /> Call
              </a>
            )}
          </label>
          <input
            type="tel"
            value={managerPhone}
            onChange={(e) => onPhoneChange(e.target.value)}
            placeholder="e.g. +971 50 123 4567"
            className="w-full px-3 py-2 text-xs font-mono bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:border-stone-400 text-stone-900 placeholder:text-stone-400 transition"
          />
        </div>
      </div>
    </div>
  );
};
