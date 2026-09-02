import React, { useState, useMemo } from 'react';
import { useSalary } from '../../context/SalaryContext';
import { DutyLetter, Employee } from '../../types';
import {
  formatFileSize,
  formatDateRangeIndonesian,
  INDONESIAN_MONTHS,
} from '../../utils/dutyLetterGenerator';
import { DutyLetterPreviewModal } from '../DutyLetterPreviewModal';
import {
  FileText,
  Search,
  Calendar,
  CalendarDays,
  Eye,
  Download,
  Image as ImageIcon,
  Briefcase,
  X,
} from 'lucide-react';

interface EmployeeDutyLetterViewProps {
  currentEmployee?: Employee;
}

export const EmployeeDutyLetterView: React.FC<EmployeeDutyLetterViewProps> = () => {
  const { dutyLetters } = useSalary();

  // Filters
  const [selectedMonth, setSelectedMonth] = useState<number | 'all'>('all');
  const [selectedYear, setSelectedYear] = useState<number | 'all'>(2026);
  const [dateRangeStart, setDateRangeStart] = useState<string>('');
  const [dateRangeEnd, setDateRangeEnd] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Preview modal
  const [previewLetter, setPreviewLetter] = useState<DutyLetter | null>(null);

  // Available Years
  const availableYears = useMemo(() => {
    const years = new Set<number>([2026, 2027, 2025, 2024, 2028]);
    dutyLetters.forEach((l) => years.add(l.periodYear));
    return Array.from(years).sort((a, b) => b - a);
  }, [dutyLetters]);

  // Filtered letters
  const filteredLetters = useMemo(() => {
    return dutyLetters.filter((letter) => {
      // Month & Year Filter
      if (selectedMonth !== 'all' && letter.periodMonth !== selectedMonth) {
        return false;
      }
      if (selectedYear !== 'all' && letter.periodYear !== selectedYear) {
        return false;
      }

      // Specific Date Range
      if (dateRangeStart && letter.endDate < dateRangeStart) return false;
      if (dateRangeEnd && letter.startDate > dateRangeEnd) return false;

      // Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = letter.title.toLowerCase().includes(q);
        const matchFile = letter.fileName.toLowerCase().includes(q);
        if (!matchTitle && !matchFile) return false;
      }

      return true;
    });
  }, [dutyLetters, selectedMonth, selectedYear, dateRangeStart, dateRangeEnd, searchQuery]);

  return (
    <div className="space-y-6">
      
      {/* 1. HEADER RINGKAS PEGAWAI */}
      <div className="bg-gradient-to-r from-amber-600 to-amber-700 rounded-3xl p-6 text-white shadow-lg relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 text-amber-100 text-xs font-semibold backdrop-blur-xs mb-2">
              <Briefcase className="w-3.5 h-3.5" />
              <span>Dokumen Resmi Kedinasan</span>
            </div>
            <h2 className="text-xl md:text-2xl font-black tracking-tight text-white">
              Surat Tugas Pegawai
            </h2>
            <p className="text-amber-100 text-xs md:text-sm mt-1 max-w-2xl">
              Lihat dan unduh berkas surat perintah tugas kedinasan resmi (PDF/JPG) sesuai tanggal, bulan, dan tahun.
            </p>
          </div>
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20 text-center shrink-0">
            <span className="text-xs text-amber-100 uppercase tracking-wider font-semibold block">Surat Tugas Tersedia</span>
            <span className="text-2xl font-black text-white">{dutyLetters.length}</span>
            <span className="text-[10px] text-amber-200 block">Dapat Diakses</span>
          </div>
        </div>
      </div>

      {/* 2. FILTER BULAN & TAHUN */}
      <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-amber-600" />
            <h3 className="font-bold text-slate-800 text-sm">Pilih Bulan & Tahun</h3>
          </div>

          {/* Search Box */}
          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari surat tugas..."
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:ring-2 focus:ring-amber-500"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Year Select & Specific Date Range */}
        <div className="flex flex-wrap items-center gap-3 pt-1">
          {/* Pilih Tahun */}
          <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl">
            <span className="text-[11px] font-bold text-slate-600 px-2">Tahun:</span>
            {availableYears.map((yr) => (
              <button
                key={yr}
                onClick={() => setSelectedYear(yr)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  selectedYear === yr
                    ? 'bg-amber-600 text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-200'
                }`}
              >
                {yr}
              </button>
            ))}
            <button
              onClick={() => setSelectedYear('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                selectedYear === 'all'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-200'
              }`}
            >
              Semua Tahun
            </button>
          </div>

          {/* Filter Rentang Tanggal Spesifik */}
          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl p-1.5 text-xs">
            <span className="text-[11px] font-semibold text-slate-500">Rentang:</span>
            <input
              type="date"
              value={dateRangeStart}
              onChange={(e) => setDateRangeStart(e.target.value)}
              className="bg-white border border-slate-200 rounded-lg px-2 py-1 text-xs"
            />
            <span className="text-slate-400">s/d</span>
            <input
              type="date"
              value={dateRangeEnd}
              onChange={(e) => setDateRangeEnd(e.target.value)}
              className="bg-white border border-slate-200 rounded-lg px-2 py-1 text-xs"
            />
            {(dateRangeStart || dateRangeEnd) && (
              <button
                onClick={() => {
                  setDateRangeStart('');
                  setDateRangeEnd('');
                }}
                className="text-[10px] text-rose-600 hover:underline font-bold px-1"
              >
                Reset
              </button>
            )}
          </div>
        </div>

        {/* Month Selector Buttons */}
        <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-13 gap-1.5 pt-2 border-t border-slate-100">
          <button
            onClick={() => setSelectedMonth('all')}
            className={`py-1.5 px-2 rounded-xl text-xs font-bold transition-all text-center ${
              selectedMonth === 'all'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Semua
          </button>
          {INDONESIAN_MONTHS.map((m) => {
            const countInMonth = dutyLetters.filter(
              (l) =>
                (selectedYear === 'all' || l.periodYear === selectedYear) &&
                l.periodMonth === m.value
            ).length;

            return (
              <button
                key={m.value}
                onClick={() => setSelectedMonth(m.value)}
                className={`py-1.5 px-2 rounded-xl text-xs font-bold transition-all text-center relative ${
                  selectedMonth === m.value
                    ? 'bg-amber-600 text-white shadow-xs'
                    : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200/60'
                }`}
              >
                <span>{m.label.substring(0, 3)}</span>
                {countInMonth > 0 && (
                  <span
                    className={`ml-1 text-[9px] px-1 py-0.2 rounded-full font-mono ${
                      selectedMonth === m.value
                        ? 'bg-white text-amber-800 font-bold'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {countInMonth}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. DAFTAR SURAT TUGAS UNTUK PEGAWAI */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-amber-600" />
            <h3 className="font-bold text-slate-800 text-base">
              Berkas Surat Tugas
            </h3>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800">
              {filteredLetters.length} Dokumen
            </span>
          </div>
        </div>

        {filteredLetters.length === 0 ? (
          <div className="p-12 text-center border border-dashed border-slate-200 rounded-2xl bg-slate-50/50">
            <Briefcase className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-sm font-bold text-slate-700">Tidak Ada Surat Tugas pada Periode Ini</p>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              Silakan pilih bulan atau tahun lain pada menu filter di atas.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredLetters.map((letter) => {
              const isPdf = letter.fileType === 'pdf';

              return (
                <div
                  key={letter.id}
                  className="bg-white border border-slate-200 hover:border-amber-400 rounded-2xl p-4 transition-all hover:shadow-md flex flex-col justify-between group"
                >
                  <div className="space-y-3">
                    {/* File Header */}
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                          isPdf
                            ? 'bg-rose-100 text-rose-700'
                            : 'bg-blue-100 text-blue-700'
                        }`}
                      >
                        {isPdf ? <FileText className="w-5 h-5" /> : <ImageIcon className="w-5 h-5" />}
                      </div>
                      <div className="min-w-0">
                        <span
                          className={`text-[9px] font-bold px-2 py-0.5 rounded uppercase font-mono ${
                            isPdf
                              ? 'bg-rose-50 text-rose-700 border border-rose-200'
                              : 'bg-blue-50 text-blue-700 border border-blue-200'
                          }`}
                        >
                          {isPdf ? 'PDF' : 'JPG'}
                        </span>
                        <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                          {formatFileSize(letter.fileSize)}
                        </p>
                      </div>
                    </div>

                    {/* Title */}
                    <div>
                      <h4 className="font-bold text-slate-800 text-sm leading-snug line-clamp-2">
                        {letter.title}
                      </h4>
                    </div>

                    {/* Date Badge */}
                    <div className="bg-amber-50 border border-amber-200/70 rounded-xl p-2.5 text-xs flex items-center gap-2 text-amber-900">
                      <CalendarDays className="w-4 h-4 text-amber-600 shrink-0" />
                      <span className="font-semibold text-[11px]">
                        {formatDateRangeIndonesian(letter.startDate, letter.endDate)}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="pt-4 mt-3 border-t border-slate-100 flex items-center gap-2">
                    <button
                      onClick={() => setPreviewLetter(letter)}
                      className="flex-1 py-2 px-3 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-xs"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Lihat Surat</span>
                    </button>
                    <a
                      href={letter.fileData}
                      download={letter.fileName || `Surat_Tugas_${letter.startDate}.${isPdf ? 'pdf' : 'jpg'}`}
                      className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all flex items-center justify-center"
                      title="Download Berkas Asli"
                    >
                      <Download className="w-4 h-4" />
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 4. PREVIEW MODAL */}
      {previewLetter && (
        <DutyLetterPreviewModal
          letter={previewLetter}
          onClose={() => setPreviewLetter(null)}
        />
      )}
    </div>
  );
};
