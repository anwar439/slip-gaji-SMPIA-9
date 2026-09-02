import React, { useState, useMemo, useRef } from 'react';
import { useSalary } from '../../context/SalaryContext';
import { DutyLetter } from '../../types';
import {
  formatFileSize,
  formatDateRangeIndonesian,
  INDONESIAN_MONTHS,
} from '../../utils/dutyLetterGenerator';
import { DutyLetterPreviewModal } from '../DutyLetterPreviewModal';
import {
  Upload,
  Search,
  Calendar,
  CalendarDays,
  Eye,
  Download,
  Trash2,
  CheckCircle2,
  AlertCircle,
  FileText,
  Image as ImageIcon,
  Briefcase,
  Plus,
  X,
} from 'lucide-react';

export const DutyLetterManagement: React.FC = () => {
  const { dutyLetters, addDutyLetter, deleteDutyLetter, showToast } = useSalary();

  // Filters state
  const [selectedMonth, setSelectedMonth] = useState<number | 'all'>('all');
  const [selectedYear, setSelectedYear] = useState<number | 'all'>(2026);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterStartDate, setFilterStartDate] = useState<string>('');
  const [filterEndDate, setFilterEndDate] = useState<string>('');

  // Active preview modal
  const [previewLetter, setPreviewLetter] = useState<DutyLetter | null>(null);

  // Upload Form State (Simple: Upload surat & tanggalnya)
  const [formTitle, setFormTitle] = useState<string>('');
  const [formStartDate, setFormStartDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [formEndDate, setFormEndDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [uploadedFile, setUploadedFile] = useState<{
    data: string;
    name: string;
    size: number;
    type: 'pdf' | 'jpg';
  } | null>(null);
  const [isDragOver, setIsDragOver] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Calculate Month and Year from Start Date
  const formPeriodMonth = useMemo(() => {
    if (!formStartDate) return new Date().getMonth() + 1;
    return new Date(formStartDate).getMonth() + 1;
  }, [formStartDate]);

  const formPeriodYear = useMemo(() => {
    if (!formStartDate) return new Date().getFullYear();
    return new Date(formStartDate).getFullYear();
  }, [formStartDate]);

  // Available Years from existing records
  const availableYears = useMemo(() => {
    const years = new Set<number>([2026, 2027, 2025, 2024, 2028]);
    dutyLetters.forEach((l) => years.add(l.periodYear));
    return Array.from(years).sort((a, b) => b - a);
  }, [dutyLetters]);

  // Handle File Selection (PDF / JPG)
  const processFile = (file: File) => {
    const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
    const isImage = file.type.startsWith('image/') || /\.(jpg|jpeg|png)$/i.test(file.name);

    if (!isPdf && !isImage) {
      showToast('Harap upload file berkas berformat PDF atau Gambar (JPG / PNG)', 'error');
      return;
    }

    if (file.size > 25 * 1024 * 1024) {
      showToast('Ukuran file maksimal adalah 25MB', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUri = e.target?.result as string;
      const cleanName = file.name.replace(/\.[^/.]+$/, '').replace(/[_-]/g, ' ');
      
      setUploadedFile({
        data: dataUri,
        name: file.name,
        size: file.size,
        type: isPdf ? 'pdf' : 'jpg',
      });

      if (!formTitle) {
        setFormTitle(cleanName);
      }
      showToast(`Berkas "${file.name}" siap disimpan!`, 'success');
    };
    reader.readAsDataURL(file);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  // Submit Save Letter
  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();

    if (!uploadedFile) {
      showToast('Silakan pilih berkas surat tugas (PDF atau JPG) terlebih dahulu', 'error');
      return;
    }

    if (!formStartDate) {
      showToast('Silakan tentukan tanggal surat tugas', 'error');
      return;
    }

    const start = formStartDate;
    const end = formEndDate || formStartDate;

    const newLetter: DutyLetter = {
      id: `st-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
      title: formTitle.trim() || uploadedFile.name.replace(/\.[^/.]+$/, ''),
      startDate: start,
      endDate: end,
      periodMonth: formPeriodMonth,
      periodYear: formPeriodYear,
      period: `${formPeriodYear}-${String(formPeriodMonth).padStart(2, '0')}`,
      fileName: uploadedFile.name,
      fileType: uploadedFile.type,
      fileData: uploadedFile.data,
      fileSize: uploadedFile.size,
      uploadDate: new Date().toISOString(),
      uploadedBy: 'Admin HRD',
      assignedToType: 'all',
      assignedEmployees: [],
      status: 'active',
      location: 'SMP Islam Al Azhar 9 Kemang Pratama',
      issuer: 'Kepala Sekolah',
      description: 'Penugasan Kedinasan',
    };

    addDutyLetter(newLetter);
    showToast(`Surat Tugas "${newLetter.title}" berhasil diupload!`, 'success');

    // Reset Form
    setUploadedFile(null);
    setFormTitle('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Filtered Letters List
  const filteredLetters = useMemo(() => {
    return dutyLetters.filter((letter) => {
      // Year Filter
      if (selectedYear !== 'all' && letter.periodYear !== selectedYear) return false;

      // Month Filter
      if (selectedMonth !== 'all' && letter.periodMonth !== selectedMonth) return false;

      // Specific Date Range Filter
      if (filterStartDate && letter.endDate < filterStartDate) return false;
      if (filterEndDate && letter.startDate > filterEndDate) return false;

      // Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = letter.title.toLowerCase().includes(q);
        const matchFile = letter.fileName.toLowerCase().includes(q);
        if (!matchTitle && !matchFile) return false;
      }

      return true;
    });
  }, [dutyLetters, selectedYear, selectedMonth, filterStartDate, filterEndDate, searchQuery]);

  return (
    <div className="space-y-6">
      
      {/* 1. HEADER RINGKAS */}
      <div className="bg-gradient-to-r from-amber-600 to-amber-700 rounded-3xl p-6 text-white shadow-lg relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 text-amber-100 text-xs font-semibold backdrop-blur-xs mb-2">
              <Briefcase className="w-3.5 h-3.5" />
              <span>Manajemen Berkas Tugas</span>
            </div>
            <h2 className="text-xl md:text-2xl font-black tracking-tight text-white">
              Upload Surat Tugas (PDF / JPG)
            </h2>
            <p className="text-amber-100 text-xs md:text-sm mt-1 max-w-2xl">
              Cukup upload file surat tugas (PDF/JPG) dan tentukan tanggalnya. Seluruh surat dapat langsung dilihat dan diunduh oleh semua pegawai.
            </p>
          </div>
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20 text-center shrink-0">
            <span className="text-xs text-amber-100 uppercase tracking-wider font-semibold block">Total Surat Tersimpan</span>
            <span className="text-2xl font-black text-white">{dutyLetters.length}</span>
            <span className="text-[10px] text-amber-200 block">Dokumen Resmi</span>
          </div>
        </div>
      </div>

      {/* 2. FORM UPLOAD SIMPLE & LANGSUNG */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs">
        <div className="flex items-center gap-2.5 mb-4 pb-3 border-b border-slate-100">
          <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
            <Plus className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-slate-800 text-base">Upload Surat Tugas Baru</h3>
            <p className="text-xs text-slate-500">Pilih berkas dokumen dan tentukan tanggal pelaksanaannya</p>
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-4">
          {/* DRAG & DROP ZONE */}
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragOver(true);
            }}
            onDragLeave={() => setIsDragOver(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-2 ${
              uploadedFile
                ? 'border-emerald-400 bg-emerald-50/50'
                : isDragOver
                ? 'border-amber-500 bg-amber-50'
                : 'border-slate-300 hover:border-amber-400 hover:bg-slate-50'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,image/jpeg,image/png,image/jpg"
              onChange={handleFileInputChange}
              className="hidden"
            />

            {uploadedFile ? (
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                  {uploadedFile.type === 'pdf' ? (
                    <FileText className="w-6 h-6" />
                  ) : (
                    <ImageIcon className="w-6 h-6" />
                  )}
                </div>
                <div className="text-left">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-800 text-sm truncate max-w-sm">
                      {uploadedFile.name}
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full uppercase bg-emerald-200 text-emerald-800 font-mono">
                      {uploadedFile.type}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500">{formatFileSize(uploadedFile.size)} • Klik untuk ganti berkas</p>
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setUploadedFile(null);
                  }}
                  className="p-1.5 hover:bg-rose-100 text-rose-600 rounded-lg ml-2"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <>
                <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center shadow-xs">
                  <Upload className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-800">
                    Klik atau Tarik Berkas Surat ke Sini (PDF atau JPG/PNG)
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Mendukung file scan PDF atau foto dokumen surat fisik JPG/PNG (Maks 25MB)
                  </p>
                </div>
              </>
            )}
          </div>

          {/* INPUT DATA TANGGAL & JUDUL */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Nama / Perihal Surat Tugas <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formTitle}
                onChange={(e) => setFormTitle(e.target.value)}
                placeholder="Contoh: Surat Tugas Pengawas Ujian PTS"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Dari Tanggal <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                required
                value={formStartDate}
                onChange={(e) => {
                  setFormStartDate(e.target.value);
                  if (formEndDate < e.target.value) {
                    setFormEndDate(e.target.value);
                  }
                }}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Sampai Tanggal (Selesai)
              </label>
              <input
                type="date"
                value={formEndDate}
                min={formStartDate}
                onChange={(e) => setFormEndDate(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
              />
            </div>
          </div>

          {/* SUBMIT BUTTON */}
          <div className="flex items-center justify-end pt-2">
            <button
              type="submit"
              disabled={!uploadedFile}
              className={`w-full sm:w-auto px-6 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-md ${
                uploadedFile
                  ? 'bg-amber-600 hover:bg-amber-500 text-white cursor-pointer'
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed'
              }`}
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Simpan & Upload Surat Tugas</span>
            </button>
          </div>
        </form>
      </div>

      {/* 3. FILTER BULAN & TAHUN */}
      <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-amber-600" />
            <h3 className="font-bold text-slate-800 text-sm">Pilih Bulan & Tahun Surat Tugas</h3>
          </div>

          {/* Search Box */}
          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari nama surat tugas..."
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
              value={filterStartDate}
              onChange={(e) => setFilterStartDate(e.target.value)}
              className="bg-white border border-slate-200 rounded-lg px-2 py-1 text-xs"
            />
            <span className="text-slate-400">s/d</span>
            <input
              type="date"
              value={filterEndDate}
              onChange={(e) => setFilterEndDate(e.target.value)}
              className="bg-white border border-slate-200 rounded-lg px-2 py-1 text-xs"
            />
            {(filterStartDate || filterEndDate) && (
              <button
                onClick={() => {
                  setFilterStartDate('');
                  setFilterEndDate('');
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

      {/* 4. DAFTAR SURAT TUGAS TERSIMPAN */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-amber-600" />
            <h3 className="font-bold text-slate-800 text-base">
              Daftar Surat Tugas
            </h3>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800">
              {filteredLetters.length} Berkas
            </span>
          </div>
        </div>

        {filteredLetters.length === 0 ? (
          <div className="p-12 text-center border border-dashed border-slate-200 rounded-2xl bg-slate-50/50">
            <Briefcase className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-sm font-bold text-slate-700">Belum Ada Surat Tugas untuk Periode Ini</p>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              Gunakan formulir upload di atas untuk mengunggah file surat tugas baru (PDF atau JPG).
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
                    <div className="flex items-start justify-between gap-3">
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

                      <button
                        onClick={() => {
                          if (window.confirm(`Hapus surat tugas "${letter.title}"?`)) {
                            deleteDutyLetter(letter.id);
                            showToast('Surat tugas berhasil dihapus', 'info');
                          }
                        }}
                        className="p-1.5 text-slate-300 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                        title="Hapus Surat Tugas"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Title & Info */}
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
                      className="flex-1 py-2 px-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-xs"
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

      {/* 5. PREVIEW MODAL */}
      {previewLetter && (
        <DutyLetterPreviewModal
          letter={previewLetter}
          onClose={() => setPreviewLetter(null)}
        />
      )}
    </div>
  );
};
