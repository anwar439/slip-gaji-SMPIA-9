import React, { useState, useId } from 'react';
import { Calendar, ChevronLeft, ChevronRight, Check, Sparkles, Hash } from 'lucide-react';
import { INDONESIAN_MONTHS, getIndonesianPeriodLabel } from '../data/mockData';
import { PeriodConfig } from '../context/SalaryContext';

interface MonthYearPeriodPickerProps {
  id?: string;
  selectedPeriod: string; // "YYYY-MM"
  onPeriodChange: (newPeriod: string) => void;
  availablePeriods?: PeriodConfig[];
  periodsWithData?: string[];
  theme?: 'dark' | 'emerald' | 'light';
  label?: string;
  className?: string;
  showQuickJump?: boolean;
}

// Years list supporting beyond 2027 (2023 to 2040)
const DEFAULT_YEARS = [
  2023, 2024, 2025, 2026, 2027, 2028, 2029, 2030, 2031, 2032, 2033, 2034, 2035, 2036, 2037, 2038, 2039, 2040
];

export const MonthYearPeriodPicker: React.FC<MonthYearPeriodPickerProps> = ({
  id,
  selectedPeriod,
  onPeriodChange,
  availablePeriods = [],
  periodsWithData = [],
  theme = 'dark',
  label = 'Pilih Periode:',
  className = '',
  showQuickJump = true,
}) => {
  const compId = id || useId();
  const [isCustomYearMode, setIsCustomYearMode] = useState(false);
  const [customYearInput, setCustomYearInput] = useState('');

  // Parse current year & month from selectedPeriod (format "YYYY-MM")
  const parts = (selectedPeriod || '2026-08').split('-');
  const currentYear = parseInt(parts[0], 10) || 2026;
  const currentMonth = (parts[1] || '08').padStart(2, '0');

  // Ensure year list includes current year even if user entered something like 2040
  const yearOptions = Array.from(new Set([...DEFAULT_YEARS, currentYear])).sort((a, b) => a - b);

  const handleMonthChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newMonth = e.target.value;
    onPeriodChange(`${currentYear}-${newMonth}`);
  };

  const handleYearChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    if (val === 'CUSTOM') {
      setIsCustomYearMode(true);
      setCustomYearInput(currentYear.toString());
      return;
    }
    const newYear = parseInt(val, 10);
    onPeriodChange(`${newYear}-${currentMonth}`);
  };

  const handleApplyCustomYear = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = parseInt(customYearInput, 10);
    if (!isNaN(parsed) && parsed >= 2000 && parsed <= 2100) {
      onPeriodChange(`${parsed}-${currentMonth}`);
      setIsCustomYearMode(false);
    }
  };

  const handlePrevMonth = () => {
    let m = parseInt(currentMonth, 10) - 1;
    let y = currentYear;
    if (m < 1) {
      m = 12;
      y -= 1;
    }
    const mStr = String(m).padStart(2, '0');
    onPeriodChange(`${y}-${mStr}`);
  };

  const handleNextMonth = () => {
    let m = parseInt(currentMonth, 10) + 1;
    let y = currentYear;
    if (m > 12) {
      m = 1;
      y += 1;
    }
    const mStr = String(m).padStart(2, '0');
    onPeriodChange(`${y}-${mStr}`);
  };

  const hasData = periodsWithData.includes(selectedPeriod);
  const currentLabel = getIndonesianPeriodLabel(selectedPeriod);

  // Theme-specific styles
  const styles = {
    dark: {
      container: 'bg-slate-900/90 text-white border-slate-800',
      select: 'bg-slate-800 text-white border-slate-700 hover:bg-slate-750 focus:border-blue-500 focus:ring-blue-500/20',
      button: 'text-slate-300 hover:text-white hover:bg-slate-800 active:bg-slate-700',
      badgeActive: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
      badgeNew: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
      label: 'text-slate-400',
    },
    emerald: {
      container: 'bg-emerald-950/80 text-white border-emerald-800/80 backdrop-blur-xs',
      select: 'bg-emerald-900/90 text-white border-emerald-700 hover:bg-emerald-800 focus:border-emerald-400 focus:ring-emerald-400/20',
      button: 'text-emerald-200 hover:text-white hover:bg-emerald-800/80 active:bg-emerald-700',
      badgeActive: 'bg-emerald-400/20 text-emerald-200 border-emerald-400/40',
      badgeNew: 'bg-teal-400/20 text-teal-200 border-teal-400/40',
      label: 'text-emerald-200/80',
    },
    light: {
      container: 'bg-white text-slate-800 border-slate-200 shadow-xs',
      select: 'bg-slate-50 text-slate-800 border-slate-300 hover:bg-white focus:border-blue-500 focus:ring-blue-500/20',
      button: 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 active:bg-slate-200',
      badgeActive: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      badgeNew: 'bg-blue-50 text-blue-700 border-blue-200',
      label: 'text-slate-500',
    },
  }[theme];

  return (
    <div id={`${compId}-container`} className={`flex flex-col gap-1.5 ${className}`}>
      {label && (
        <div className="flex items-center justify-between gap-2">
          <label htmlFor={`${compId}-month`} className={`text-[11px] font-bold uppercase tracking-wider ${styles.label}`}>
            {label}
          </label>
          <div className="flex items-center gap-1.5">
            {hasData ? (
              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border ${styles.badgeActive}`}>
                <Check className="w-2.5 h-2.5" /> Ada Data
              </span>
            ) : (
              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium border ${styles.badgeNew}`}>
                <Sparkles className="w-2.5 h-2.5" /> Periode Baru
              </span>
            )}
            {currentYear > 2027 && (
              <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                &gt;2027
              </span>
            )}
          </div>
        </div>
      )}

      <div className="flex flex-wrap items-center gap-1.5">
        {/* Prev Month Button */}
        <button
          type="button"
          onClick={handlePrevMonth}
          title="Bulan Sebelumnya"
          aria-label="Bulan Sebelumnya"
          className={`p-2 rounded-xl border transition-colors ${styles.button} ${theme === 'light' ? 'border-slate-200' : 'border-white/10'}`}
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {/* Month Selector */}
        <div className="relative">
          <select
            id={`${compId}-month`}
            value={currentMonth}
            onChange={handleMonthChange}
            aria-label="Pilih Bulan"
            className={`text-xs sm:text-sm font-bold py-2.5 pl-3 pr-8 rounded-xl border focus:outline-hidden focus:ring-2 cursor-pointer transition-all ${styles.select}`}
          >
            {INDONESIAN_MONTHS.map((m) => (
              <option key={m.value} value={m.value} className="text-slate-900 bg-white">
                {m.name}
              </option>
            ))}
          </select>
        </div>

        {/* Year Selector */}
        {!isCustomYearMode ? (
          <div className="relative">
            <select
              id={`${compId}-year`}
              value={currentYear}
              onChange={handleYearChange}
              aria-label="Pilih Tahun"
              className={`text-xs sm:text-sm font-bold py-2.5 pl-3 pr-8 rounded-xl border focus:outline-hidden focus:ring-2 cursor-pointer transition-all ${styles.select}`}
            >
              {yearOptions.map((y) => (
                <option key={y} value={y} className="text-slate-900 bg-white">
                  Tahun {y} {y > 2027 ? '★' : ''}
                </option>
              ))}
              <option value="CUSTOM" className="text-blue-600 bg-white font-semibold">
                + Masukkan Tahun Lain...
              </option>
            </select>
          </div>
        ) : (
          <form onSubmit={handleApplyCustomYear} className="flex items-center gap-1">
            <input
              type="number"
              min={2000}
              max={2100}
              value={customYearInput}
              onChange={(e) => setCustomYearInput(e.target.value)}
              placeholder="YYYY"
              className="w-20 text-xs sm:text-sm font-bold py-2 px-2.5 rounded-xl border bg-white text-slate-900 border-blue-500 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              autoFocus
            />
            <button
              type="submit"
              className="px-2.5 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-500 transition-colors"
            >
              OK
            </button>
            <button
              type="button"
              onClick={() => setIsCustomYearMode(false)}
              className="px-2 py-2 rounded-xl bg-slate-700 text-slate-300 text-xs hover:bg-slate-600 transition-colors"
            >
              Batal
            </button>
          </form>
        )}

        {/* Next Month Button */}
        <button
          type="button"
          onClick={handleNextMonth}
          title="Bulan Berikutnya"
          aria-label="Bulan Berikutnya"
          className={`p-2 rounded-xl border transition-colors ${styles.button} ${theme === 'light' ? 'border-slate-200' : 'border-white/10'}`}
        >
          <ChevronRight className="w-4 h-4" />
        </button>

        {/* Quick Jump Dropdown for predefined/existing periods if provided */}
        {showQuickJump && availablePeriods.length > 0 && (
          <div className="hidden md:block ml-1">
            <select
              id={`${compId}-quick-jump`}
              value={selectedPeriod}
              onChange={(e) => onPeriodChange(e.target.value)}
              aria-label="Lompat ke Periode Terdaftar"
              title="Lompat ke daftar periode yang terdaftar"
              className={`text-xs py-2.5 px-3 rounded-xl border focus:outline-hidden cursor-pointer transition-all ${styles.select}`}
            >
              <option value="" disabled className="text-slate-400 bg-white">
                -- Daftar Periode Terdaftar --
              </option>
              {availablePeriods.map((p) => {
                const isSelected = p.value === selectedPeriod;
                return (
                  <option key={p.value} value={p.value} className="text-slate-900 bg-white">
                    {p.label} {p.isNew ? '(Baru)' : ''} {isSelected ? '✓' : ''}
                  </option>
                );
              })}
            </select>
          </div>
        )}
      </div>

      <div className="flex items-center gap-1.5 text-[11px] opacity-80">
        <Calendar className="w-3 h-3" />
        <span>Periode Aktif: <strong>{currentLabel}</strong></span>
      </div>
    </div>
  );
};
