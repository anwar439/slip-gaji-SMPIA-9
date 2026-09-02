import React, { useState } from 'react';
import { useSalary } from '../context/SalaryContext';
import { Calendar, X, Check, Clock, Plus, Sparkles, ArrowRight, CalendarDays, Settings2 } from 'lucide-react';

interface PeriodDateRangeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const MONTHS_LIST = [
  { value: '01', num: 1, name: 'Januari' },
  { value: '02', num: 2, name: 'Februari' },
  { value: '03', num: 3, name: 'Maret' },
  { value: '04', num: 4, name: 'April' },
  { value: '05', num: 5, name: 'Mei' },
  { value: '06', num: 6, name: 'Juni' },
  { value: '07', num: 7, name: 'Juli' },
  { value: '08', num: 8, name: 'Agustus' },
  { value: '09', num: 9, name: 'September' },
  { value: '10', num: 10, name: 'Oktober' },
  { value: '11', num: 11, name: 'November' },
  { value: '12', num: 12, name: 'Desember' },
];

const ACADEMIC_YEAR_2627 = [
  { code: '2026-07', label: 'Juli 2026', start: '2026-07-01', end: '2026-07-31' },
  { code: '2026-08', label: 'Agustus 2026', start: '2026-08-01', end: '2026-08-31' },
  { code: '2026-09', label: 'September 2026', start: '2026-09-01', end: '2026-09-30' },
  { code: '2026-10', label: 'Oktober 2026', start: '2026-10-01', end: '2026-10-31' },
  { code: '2026-11', label: 'November 2026', start: '2026-11-01', end: '2026-11-30' },
  { code: '2026-12', label: 'Desember 2026', start: '2026-12-01', end: '2026-12-31' },
  { code: '2027-01', label: 'Januari 2027', start: '2027-01-01', end: '2027-01-31' },
  { code: '2027-02', label: 'Februari 2027', start: '2027-02-01', end: '2027-02-28' },
  { code: '2027-03', label: 'Maret 2027', start: '2027-03-01', end: '2027-03-31' },
  { code: '2027-04', label: 'April 2027', start: '2027-04-01', end: '2027-04-30' },
  { code: '2027-05', label: 'Mei 2027', start: '2027-05-01', end: '2027-05-31' },
  { code: '2027-06', label: 'Juni 2027', start: '2027-06-01', end: '2027-06-30' },
];

export const PeriodDateRangeModal: React.FC<PeriodDateRangeModalProps> = ({ isOpen, onClose }) => {
  const {
    selectedPeriod,
    setSelectedPeriod,
    availablePeriods,
    updatePeriodDateRange,
    getCurrentPeriodConfig,
    showToast,
  } = useSalary();

  const currentConfig = getCurrentPeriodConfig();

  // Mode: 'academic_2627' | 'manual_picker'
  const [activeTab, setActiveTab] = useState<'academic_2627' | 'manual_picker'>('academic_2627');

  // Active Period Form State
  const [activePeriodId, setActivePeriodId] = useState(selectedPeriod);
  const [startDate, setStartDate] = useState(currentConfig.startDate || `${selectedPeriod}-01`);
  const [endDate, setEndDate] = useState(currentConfig.endDate || `${selectedPeriod}-28`);
  const [customLabel, setCustomLabel] = useState(currentConfig.label || '');

  // Manual Builder State
  const [manualYear, setManualYear] = useState<number>(2026);
  const [manualMonth, setManualMonth] = useState<string>('08');
  const [manualStartDate, setManualStartDate] = useState<string>('2026-08-01');
  const [manualEndDate, setManualEndDate] = useState<string>('2026-08-31');
  const [manualLabel, setManualLabel] = useState<string>('Agustus 2026');

  if (!isOpen) return null;

  const handlePeriodChange = (periodId: string) => {
    setActivePeriodId(periodId);
    const cfg = availablePeriods.find((p) => p.value === periodId);
    if (cfg) {
      setStartDate(cfg.startDate);
      setEndDate(cfg.endDate);
      setCustomLabel(cfg.label);
    } else {
      const matchAcademic = ACADEMIC_YEAR_2627.find((a) => a.code === periodId);
      if (matchAcademic) {
        setStartDate(matchAcademic.start);
        setEndDate(matchAcademic.end);
        setCustomLabel(matchAcademic.label);
      }
    }
  };

  const handleSelectAcademicMonth = (item: { code: string; label: string; start: string; end: string }) => {
    setActivePeriodId(item.code);
    setStartDate(item.start);
    setEndDate(item.end);
    setCustomLabel(item.label);
    updatePeriodDateRange(item.code, item.start, item.end, item.label);
    setSelectedPeriod(item.code);
    showToast(`Periode aktif diubah ke ${item.label} (${item.start} s/d ${item.end})`, 'success');
    onClose();
  };

  const handleSaveCurrentPeriodDates = (e: React.FormEvent) => {
    e.preventDefault();
    updatePeriodDateRange(activePeriodId, startDate, endDate, customLabel);
    setSelectedPeriod(activePeriodId);
    showToast(`Rentang tanggal periode ${customLabel || activePeriodId} berhasil disimpan!`, 'success');
    onClose();
  };

  const handleApplyManualPeriod = (e: React.FormEvent) => {
    e.preventDefault();
    const periodCode = `${manualYear}-${manualMonth}`;
    const finalLabel = manualLabel.trim() || `${MONTHS_LIST.find((m) => m.value === manualMonth)?.name} ${manualYear}`;
    updatePeriodDateRange(periodCode, manualStartDate, manualEndDate, finalLabel);
    setSelectedPeriod(periodCode);
    showToast(`Periode manual ${finalLabel} (${manualStartDate} s/d ${manualEndDate}) berhasil diterapkan!`, 'success');
    onClose();
  };

  // Sync manual builder dates when month or year changes
  const handleManualMonthYearChange = (year: number, monthVal: string) => {
    setManualYear(year);
    setManualMonth(monthVal);
    const monthNum = parseInt(monthVal, 10);
    const lastDay = new Date(year, monthNum, 0).getDate();
    const sDate = `${year}-${monthVal}-01`;
    const eDate = `${year}-${monthVal}-${String(lastDay).padStart(2, '0')}`;
    const mName = MONTHS_LIST.find((m) => m.value === monthVal)?.name || '';
    setManualStartDate(sDate);
    setManualEndDate(eDate);
    setManualLabel(`${mName} ${year}`);
  };

  // Preset helpers for current form
  const applyPresetMonth = (yearMonth: string) => {
    const [y, m] = yearMonth.split('-');
    const year = parseInt(y, 10) || 2026;
    const month = parseInt(m, 10) || 8;
    const lastDay = new Date(year, month, 0).getDate();
    setStartDate(`${yearMonth}-01`);
    setEndDate(`${yearMonth}-${String(lastDay).padStart(2, '0')}`);
  };

  const applyCutoffCycle = (yearMonth: string) => {
    const [y, m] = yearMonth.split('-');
    const year = parseInt(y, 10) || 2026;
    const month = parseInt(m, 10) || 8;
    const prevMonth = month === 1 ? 12 : month - 1;
    const prevYear = month === 1 ? year - 1 : year;
    
    setStartDate(`${prevYear}-${String(prevMonth).padStart(2, '0')}-21`);
    setEndDate(`${yearMonth}-20`);
  };

  const applyCutoff25to24 = (yearMonth: string) => {
    const [y, m] = yearMonth.split('-');
    const year = parseInt(y, 10) || 2026;
    const month = parseInt(m, 10) || 8;
    const prevMonth = month === 1 ? 12 : month - 1;
    const prevYear = month === 1 ? year - 1 : year;
    
    setStartDate(`${prevYear}-${String(prevMonth).padStart(2, '0')}-25`);
    setEndDate(`${yearMonth}-24`);
  };

  return (
    <div
      id="period-date-modal-backdrop"
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4"
    >
      <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* MODAL HEADER */}
        <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 text-white p-5 sm:p-6 flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-blue-600 flex items-center justify-center text-white font-bold shadow-md shadow-blue-900/50">
              <Calendar className="w-6 h-6" />
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-200 text-[11px] font-bold mb-1">
                <span>Tahun Ajaran / Periode 2026 - 2027</span>
              </div>
              <h2 className="text-base sm:text-lg font-bold text-white leading-tight">
                Pilih Periode & Rentang Tanggal Penggajian
              </h2>
              <p className="text-xs text-slate-300">
                Pilih bulan & tahun, serta tentukan tanggal mulai (dari) s/d tanggal akhir (sampai) secara manual
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* TAB NAVIGATION */}
        <div className="flex border-b border-slate-100 bg-slate-50 px-6 pt-3 gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('academic_2627')}
            className={`pb-3 px-4 text-xs font-bold transition-all border-b-2 flex items-center gap-2 ${
              activeTab === 'academic_2627'
                ? 'border-blue-600 text-blue-700 font-black'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <CalendarDays className="w-4 h-4" />
            <span>Periode TA 2026/2027 (Juli 2026 - Juni 2027)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('manual_picker')}
            className={`pb-3 px-4 text-xs font-bold transition-all border-b-2 flex items-center gap-2 ${
              activeTab === 'manual_picker'
                ? 'border-blue-600 text-blue-700 font-black'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Settings2 className="w-4 h-4" />
            <span>Atur Manual (Bebas Bulan & Tahun & Tanggal)</span>
          </button>
        </div>

        {/* MODAL BODY */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          
          {/* TAB 1: ACADEMIC YEAR 2026/2027 PRESETS */}
          {activeTab === 'academic_2627' && (
            <div className="space-y-5">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
                    Pilih Bulan Tahun Ajaran 2026 / 2027:
                  </label>
                  <span className="text-[11px] text-blue-600 font-bold">12 Bulan Tersedia</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
                  {ACADEMIC_YEAR_2627.map((item) => {
                    const isSelected = selectedPeriod === item.code;
                    const isActiveEditing = activePeriodId === item.code;

                    return (
                      <button
                        key={item.code}
                        type="button"
                        onClick={() => handlePeriodChange(item.code)}
                        className={`p-3 rounded-2xl border text-left transition-all flex flex-col justify-between ${
                          isActiveEditing
                            ? 'border-blue-600 bg-blue-50/80 text-blue-900 ring-2 ring-blue-500/20 shadow-xs'
                            : isSelected
                            ? 'border-emerald-400 bg-emerald-50/50 text-emerald-900'
                            : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-700'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-xs">{item.label}</span>
                          {isSelected && (
                            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-200 text-emerald-800">
                              Aktif
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] text-slate-500 font-mono mt-1">
                          {item.start.slice(5)} s/d {item.end.slice(5)}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Detail Rentang Tanggal untuk Periode Terpilih */}
              <form onSubmit={handleSaveCurrentPeriodDates} className="bg-slate-50 rounded-2xl p-5 border border-slate-200/80 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                    Ubah Rentang Tanggal untuk: <span className="text-blue-600">{customLabel || activePeriodId}</span>
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">
                      Dari Tanggal (Mulai):
                    </label>
                    <input
                      type="date"
                      value={startDate || ''}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:ring-2 focus:ring-blue-600"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">
                      Sampai Tanggal (Selesai):
                    </label>
                    <input
                      type="date"
                      value={endDate || ''}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:ring-2 focus:ring-blue-600"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">
                    Label Tampilan Periode:
                  </label>
                  <input
                    type="text"
                    value={customLabel || ''}
                    onChange={(e) => setCustomLabel(e.target.value)}
                    placeholder="Contoh: Agustus 2026"
                    className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:ring-2 focus:ring-blue-600"
                  />
                </div>

                {/* Quick presets */}
                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <span className="text-[10px] font-bold text-slate-500 uppercase">Pilihan Cepat:</span>
                  <button
                    type="button"
                    onClick={() => applyPresetMonth(activePeriodId)}
                    className="px-2.5 py-1 bg-white border border-slate-200 hover:border-slate-300 rounded-lg text-[11px] font-semibold text-slate-700 shadow-2xs"
                  >
                    Bulan Penuh (Tgl 01 s/d Akhir)
                  </button>
                  <button
                    type="button"
                    onClick={() => applyCutoffCycle(activePeriodId)}
                    className="px-2.5 py-1 bg-white border border-slate-200 hover:border-slate-300 rounded-lg text-[11px] font-semibold text-slate-700 shadow-2xs"
                  >
                    Cut-Off (Tgl 21 s/d Tgl 20)
                  </button>
                  <button
                    type="button"
                    onClick={() => applyCutoff25to24(activePeriodId)}
                    className="px-2.5 py-1 bg-white border border-slate-200 hover:border-slate-300 rounded-lg text-[11px] font-semibold text-slate-700 shadow-2xs"
                  >
                    Cut-Off (Tgl 25 s/d Tgl 24)
                  </button>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl text-xs font-bold transition-colors"
                  >
                    Tutup
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-blue-200 flex items-center gap-1.5"
                  >
                    <Check className="w-4 h-4" />
                    <span>Gunakan Periode Ini</span>
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* TAB 2: MANUAL BUILDER (BEBAS BULAN & TAHUN & TANGGAL) */}
          {activeTab === 'manual_picker' && (
            <form onSubmit={handleApplyManualPeriod} className="space-y-5">
              <div className="bg-blue-50 border border-blue-200/80 rounded-2xl p-4 text-xs text-blue-900">
                <p className="font-bold mb-0.5">Pengaturan Periode & Rentang Tanggal Manual</p>
                <p className="text-blue-800 text-[11px]">
                  Tentukan tahun, bulan, dan rentang tanggal spesifik (dari tanggal berapa sampai tanggal berapa) sesuai jadwal penggajian sekolah.
                </p>
              </div>

              {/* 1. Pilih Tahun */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                  1. Pilih / Masukkan Tahun:
                </label>
                <div className="flex flex-wrap items-center gap-2">
                  {[2026, 2027, 2025, 2024, 2028].map((yr) => (
                    <button
                      key={yr}
                      type="button"
                      onClick={() => handleManualMonthYearChange(yr, manualMonth)}
                      className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                        manualYear === yr
                          ? 'bg-blue-600 text-white shadow-xs'
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                      }`}
                    >
                      {yr}
                    </button>
                  ))}
                  <div className="flex items-center gap-1 bg-slate-100 px-2 py-1 rounded-xl">
                    <span className="text-[11px] text-slate-500">Tahun Lain:</span>
                    <input
                      type="number"
                      value={manualYear ?? 2026}
                      onChange={(e) => handleManualMonthYearChange(parseInt(e.target.value, 10) || 2026, manualMonth)}
                      className="w-16 px-2 py-1 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-900"
                    />
                  </div>
                </div>
              </div>

              {/* 2. Pilih Bulan */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                  2. Pilih Bulan:
                </label>
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
                  {MONTHS_LIST.map((m) => (
                    <button
                      key={m.value}
                      type="button"
                      onClick={() => handleManualMonthYearChange(manualYear, m.value)}
                      className={`py-2 px-2.5 rounded-xl text-xs font-bold transition-all text-center ${
                        manualMonth === m.value
                          ? 'bg-blue-600 text-white shadow-xs'
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                      }`}
                    >
                      {m.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* 3. Rentang Tanggal Manual: Dari Tgl s/d Sampai Tgl */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                  3. Rentang Tanggal Penggajian (Dari Tanggal s/d Sampai Tanggal):
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">
                      Dari Tanggal (Mulai):
                    </label>
                    <input
                      type="date"
                      value={manualStartDate || ''}
                      onChange={(e) => setManualStartDate(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm font-bold text-slate-900 focus:ring-2 focus:ring-blue-600"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">
                      Sampai Tanggal (Selesai):
                    </label>
                    <input
                      type="date"
                      value={manualEndDate || ''}
                      onChange={(e) => setManualEndDate(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm font-bold text-slate-900 focus:ring-2 focus:ring-blue-600"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">
                    Label Nama Periode (Bisa Dikustom):
                  </label>
                  <input
                    type="text"
                    value={manualLabel || ''}
                    onChange={(e) => setManualLabel(e.target.value)}
                    placeholder="Contoh: Agustus 2026 atau Gaji Agustus (21 Juli - 20 Agustus)"
                    className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:ring-2 focus:ring-blue-600"
                    required
                  />
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors"
                >
                  Batal
                </button>

                <button
                  type="submit"
                  className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-blue-200 flex items-center gap-2"
                >
                  <Check className="w-4 h-4" />
                  <span>Simpan & Terapkan Periode</span>
                </button>
              </div>
            </form>
          )}

        </div>
      </div>
    </div>
  );
};
