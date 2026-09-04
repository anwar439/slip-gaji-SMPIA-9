import React, { useState, useMemo, useRef } from 'react';
import { useSalary } from '../../context/SalaryContext';
import { TransportUkkRecord } from '../../types';
import { calculateTransportUkkRow } from '../../data/mockTransportUkkData';
import { getIndonesianPeriodLabel } from '../../data/mockData';
import { formatRupiah } from '../../utils/currencyFormatter';
import { MonthYearPeriodPicker } from '../MonthYearPeriodPicker';
import * as XLSX from 'xlsx';
import {
  Calculator,
  Search,
  Plus,
  Download,
  Upload,
  RefreshCw,
  Edit2,
  Trash2,
  FileSpreadsheet,
  CheckCircle2,
  SlidersHorizontal,
  ChevronRight,
  TrendingUp,
  ShieldCheck,
  Building2,
  Sparkles,
  Info,
  Layers,
  Award,
  ArrowRightLeft,
  X,
  FileText,
  Percent,
  Bus,
  Utensils,
  UserCheck,
  AlertTriangle,
  Clock,
  DollarSign,
  Filter,
  Save,
  Calendar,
} from 'lucide-react';

export const TransportUkkManagement: React.FC = () => {
  const {
    transportUkkRecords,
    updateTransportUkkRow,
    addTransportUkkRow,
    deleteTransportUkkRow,
    importTransportUkkRecords,
    resetTransportUkkToDefault,
    syncTransportUkkToSlips,
    saveTransportUkkChanges,
    initializePeriodTransportUkk,
    initializePeriodSalarySlips,
    selectedPeriod,
    setSelectedPeriod,
    availablePeriods,
    records,
    getCurrentPeriodConfig,
    employees,
    showToast,
  } = useSalary();

  // Period management for Transport & UKK
  const [selectedTransportPeriod, setSelectedTransportPeriod] = useState<string>(selectedPeriod || '2026-08');
  const [recentlySavedRowId, setRecentlySavedRowId] = useState<string | null>(null);
  const [lastSavedTime, setLastSavedTime] = useState<string>('Baru saja');
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving'>('saved');

  // Keep selectedTransportPeriod in sync with global selectedPeriod if it changes externally
  React.useEffect(() => {
    if (selectedPeriod && selectedPeriod !== selectedTransportPeriod) {
      setSelectedTransportPeriod(selectedPeriod);
    }
  }, [selectedPeriod]);

  const handlePeriodChange = (newPeriod: string) => {
    setSelectedTransportPeriod(newPeriod);
    setSelectedPeriod(newPeriod);
  };

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUnit, setSelectedUnit] = useState<string>('ALL');
  const [activeColumnView, setActiveColumnView] = useState<'all' | 'kehadiran' | 'ukk' | 'transport_makan'>('all');

  // Modals
  const [editingRecord, setEditingRecord] = useState<TransportUkkRecord | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [inspectRecord, setInspectRecord] = useState<TransportUkkRecord | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);

  // Quick inline edit state
  const [inlineEditId, setInlineEditId] = useState<string | null>(null);
  const [inlineField, setInlineField] = useState<keyof TransportUkkRecord | null>(null);
  const [inlineValue, setInlineValue] = useState<string>('');

  const fileInputRef = useRef<HTMLInputElement>(null);
  const periodConfig = getCurrentPeriodConfig();

  // Find all periods that have records
  const periodsWithTransportData = useMemo(() => {
    const periods = new Set<string>();
    transportUkkRecords.forEach((r) => {
      if (r.period) periods.add(r.period);
    });
    if (periods.size === 0) periods.add('2026-08');
    return Array.from(periods);
  }, [transportUkkRecords]);

  // Raw records strictly for active selectedTransportPeriod
  const currentPeriodRawRecords = useMemo(() => {
    return transportUkkRecords.filter((r) =>
      r.period === selectedTransportPeriod || (!r.period && selectedTransportPeriod === '2026-08')
    );
  }, [transportUkkRecords, selectedTransportPeriod]);

  // Distinct units for current period
  const availableUnits = useMemo(() => {
    const units = new Set<string>();
    currentPeriodRawRecords.forEach((r) => {
      if (r.unitKerja) units.add(r.unitKerja);
    });
    return Array.from(units).sort();
  }, [currentPeriodRawRecords]);

  // Filtered records for current period
  const filteredRecords = useMemo(() => {
    return currentPeriodRawRecords.filter((r) => {
      const matchSearch =
        searchQuery.trim() === '' ||
        r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (r.nip && r.nip.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (r.jabatan && r.jabatan.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (r.unitKerja && r.unitKerja.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchUnit = selectedUnit === 'ALL' || r.unitKerja === selectedUnit;

      return matchSearch && matchUnit;
    });
  }, [currentPeriodRawRecords, searchQuery, selectedUnit]);

  // Aggregated totals
  const stats = useMemo(() => {
    let totalHariKerja = 0;
    let totalHadir = 0;
    let totalSakit = 0;
    let totalIzin = 0;
    let totalAlpa = 0;
    let totalCuti = 0;
    let totalDinluar = 0;
    let totalTidakMasuk = 0;
    let totalTerlambatMenit = 0;
    let totalUkkBruto = 0;
    let totalPotonganUkk = 0;
    let totalUkk = 0;
    let totalTransporBruto = 0;
    let totalTranspor = 0;
    let totalMakan = 0;
    let totalGrand = 0;

    filteredRecords.forEach((r) => {
      const ukkNet = Number(r.ukkDiterima) || 0;
      const transporNet = Number(r.transporDiterima) || 0;
      const makanNet = Number(r.uangMakanDiterima) || 0;
      const grand = Number(r.grandTotal) || Number(r.totalJumlahUang) || (ukkNet + transporNet + makanNet);

      totalHariKerja += Number(r.hariKerja) || 0;
      totalHadir += Number(r.jumlahHadir) || 0;
      totalSakit += Number(r.sakit) || 0;
      totalIzin += Number(r.izin) || 0;
      totalAlpa += Number(r.alpa) || 0;
      totalCuti += Number(r.cuti) || 0;
      totalDinluar += Number(r.dinluar) || 0;
      totalTidakMasuk += Number(r.jumlahTidakMasuk) || (Number(r.sakit || 0) + Number(r.izin || 0) + Number(r.alpa || 0) + Number(r.cuti || 0) + Number(r.dinluar || 0));
      totalTerlambatMenit += Number(r.terlambatMenit) || 0;
      totalUkkBruto += Number(r.ukkBruto || r.ukkKotor) || 0;
      totalPotonganUkk += Number(r.ukkPotongan) || 0;
      totalUkk += ukkNet;
      totalTransporBruto += Number(r.transporBruto) || (Number(r.jumlahHadir || 0) * Number(r.tarifTransporHarian || r.transporPerhari || 0));
      totalTranspor += transporNet;
      totalMakan += makanNet;
      totalGrand += grand;
    });

    return {
      count: filteredRecords.length,
      totalHariKerja,
      totalHadir,
      totalSakit,
      totalIzin,
      totalAlpa,
      totalCuti,
      totalDinluar,
      totalTidakMasuk,
      totalTerlambatMenit,
      totalUkkBruto,
      totalPotonganUkk,
      totalUkk,
      totalTransporBruto,
      totalTranspor,
      totalMakan,
      totalGrand,
    };
  }, [filteredRecords]);

  // Handle Quick Inline Edit Save with full attendance & UKK/Transport synchronization
  const handleInlineSave = (id: string) => {
    if (!inlineField) {
      setInlineEditId(null);
      return;
    }
    const numVal = parseFloat(inlineValue) || 0;
    const targetRow = transportUkkRecords.find((r) => r.id === id);
    if (!targetRow) return;

    const updates: Partial<TransportUkkRecord> = { [inlineField]: numVal };

    // When attendance fields are edited, recalculate jumlahHadir so UKK Bruto, Transpor, and Uang Makan ALL sync!
    if (['sakit', 'izin', 'alpa', 'cuti', 'dinluar', 'hariKerja'].includes(inlineField)) {
      const hk = inlineField === 'hariKerja' ? numVal : (targetRow.hariKerja || 0);
      const s = inlineField === 'sakit' ? numVal : (targetRow.sakit || 0);
      const i = inlineField === 'izin' ? numVal : (targetRow.izin || 0);
      const a = inlineField === 'alpa' ? numVal : (targetRow.alpa || 0);
      const c = inlineField === 'cuti' ? numVal : (targetRow.cuti || 0);
      const d = inlineField === 'dinluar' ? numVal : (targetRow.dinluar || 0);
      const newTidakMasuk = s + i + a + c + d;
      const newHadir = Math.max(0, hk - newTidakMasuk);
      updates.jumlahTidakMasuk = newTidakMasuk;
      updates.jumlahHadir = newHadir;
    }

    if (inlineField === 'jumlahHadir') {
      updates.jumlahHadir = numVal;
      if (targetRow.hariKerja > 0) {
        updates.jumlahTidakMasuk = Math.max(0, targetRow.hariKerja - numVal);
      }
    }

    // Save and update
    updateTransportUkkRow(id, updates, true);
    setInlineEditId(null);
    setInlineField(null);

    // Save indicator and timestamp
    setRecentlySavedRowId(id);
    setLastSavedTime(new Date().toLocaleTimeString('id-ID'));
    setSaveStatus('saved');
    setTimeout(() => setRecentlySavedRowId(null), 3500);
  };

  // Manual save all Transport & UKK changes to Database
  const handleManualSaveToDatabase = () => {
    saveTransportUkkChanges(selectedTransportPeriod);
    setLastSavedTime(new Date().toLocaleTimeString('id-ID'));
    setSaveStatus('saved');
  };

  // Initialize new period from master employee data
  const handleInitializePeriod = () => {
    initializePeriodTransportUkk(selectedTransportPeriod);
    setLastSavedTime(new Date().toLocaleTimeString('id-ID'));
  };

  // Sync to Slips handler - syncs specifically to the selected period
  const handleSyncToSlips = () => {
    setIsSyncing(true);
    setTimeout(() => {
      syncTransportUkkToSlips(selectedTransportPeriod);
      setIsSyncing(false);
    }, 400);
  };

  // Export to Excel
  const handleExportExcel = () => {
    const exportData = filteredRecords.map((r, idx) => {
      const grand = Number(r.grandTotal) || Number(r.totalJumlahUang) || ((r.ukkDiterima || 0) + (r.transporDiterima || 0) + (r.uangMakanDiterima || 0));
      return {
        No: idx + 1,
        'Nama Pegawai': r.name,
        NIP: r.nip || '-',
        Jabatan: r.jabatan || '-',
        'Unit Kerja': r.unitKerja || '-',
        'Hari Kerja': r.hariKerja,
        'Jml Hadir': r.jumlahHadir,
        Sakit: r.sakit,
        Izin: r.izin,
        Alpa: r.alpa,
        Cuti: r.cuti,
        'Datang Lambat < 5m (50% UKK)': r.datangLambatMin5 || 0,
        'Datang Lambat > 5m (100% UKK)': r.datangLambatPlus5 || 0,
        'Pulang Cepat < 5m (50% UKK)': r.pulangCepatMin5 || 0,
        'Pulang Cepat > 5m (100% UKK)': r.pulangCepatPlus5 || 0,
        'Jml Terlambat (menit)': r.terlambatMenit,
        'Tarif UKK Harian': r.ukkPerhari || 132250,
        'UKK Bruto': r.ukkBruto || r.ukkKotor,
        'Potongan UKK (Rp)': r.ukkPotongan,
        'Pot. Terlambat (%)': `${r.potonganTerlambatPersen || 0}%`,
        'Pot. Absensi (%)': `${r.potonganAbsenPersen || 0}%`,
        'Total Pot (%)': `${r.totalPotonganPersen}%`,
        'UKK Diterima': r.ukkDiterima,
        'Tarif Transpor / Hari': r.tarifTransporHarian || r.transporPerhari,
        'Transpor Bruto': r.transporBruto,
        'Transpor Diterima': r.transporDiterima,
        'Tarif Makan / Hari': r.tarifUangMakanHarian || r.uangMakanPerhari,
        'Uang Makan Diterima': r.uangMakanDiterima,
        'GRAND TOTAL DITERIMA': grand,
      };
    });

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Perhitungan_Transport_UKK');
    XLSX.writeFile(wb, `Sumber_Hitung_Transport_UKK_${selectedPeriod}.xlsx`);
    showToast('File Excel berhasil diunduh.', 'success');
  };

  // Download official CSV Template
  const handleDownloadTemplate = () => {
    const templateData = [
      {
        No: 1,
        'Nama Pegawai': 'Dr. H. Ahmad Fauzi, M.Pd.',
        NIP: '197503122000031001',
        Jabatan: 'Kepala Bagian Keuangan',
        'Unit Kerja': 'Biro Keuangan',
        'Hari Kerja': 23,
        'Jml Hadir': 23,
        Sakit: 0,
        Izin: 0,
        Alpa: 0,
        Cuti: 0,
        'Datang Lambat (-5)': 0,
        'Datang Lambat (+5)': 0,
        'Pulang Cepat (-5)': 0,
        'Pulang Cepat (+5)': 0,
        'UKK Per Hari': 158250,
        'UKK Bruto': 4085950,
        'Tarif Transpor / Hari': 84250,
        'Tarif Makan / Hari': 30000,
      },
      {
        No: 2,
        'Nama Pegawai': 'Muhammad Rizki, S.Pd.',
        NIP: '102041399',
        Jabatan: 'Guru Matematika',
        'Unit Kerja': 'SMP Islam Al Azhar 9',
        'Hari Kerja': 23,
        'Jml Hadir': 22,
        Sakit: 0,
        Izin: 0,
        Alpa: 0,
        Cuti: 0,
        'Datang Lambat (-5)': 1,
        'Datang Lambat (+5)': 0,
        'Pulang Cepat (-5)': 0,
        'Pulang Cepat (+5)': 0,
        'UKK Per Hari': 132250,
        'UKK Bruto': 3484270,
        'Tarif Transpor / Hari': 59750,
        'Tarif Makan / Hari': 30000,
      },
      {
        No: 3,
        'Nama Pegawai': 'Siti Nurhaliza, S.E.',
        NIP: '198205142005012003',
        Jabatan: 'Staf Administrasi Keuangan',
        'Unit Kerja': 'Biro Keuangan',
        'Hari Kerja': 23,
        'Jml Hadir': 21,
        Sakit: 1,
        Izin: 1,
        Alpa: 0,
        Cuti: 0,
        'Datang Lambat (-5)': 0,
        'Datang Lambat (+5)': 1,
        'Pulang Cepat (-5)': 0,
        'Pulang Cepat (+5)': 0,
        'UKK Per Hari': 132250,
        'UKK Bruto': 3484270,
        'Tarif Transpor / Hari': 59750,
        'Tarif Makan / Hari': 30000,
      },
    ];

    const ws = XLSX.utils.json_to_sheet(templateData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Template_Transport_UKK');
    XLSX.writeFile(wb, 'Template_Import_Transport_UKK.xlsx');
    showToast('Template Excel berhasil diunduh.', 'info');
  };

  return (
    <div id="transport-ukk-management" className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-semibold">
              <Calculator className="w-3.5 h-3.5" />
              Formula Terintegrasi & Sinkronisasi Otomatis
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              Sumber Penghitungan Transport & UKK
            </h1>
            <p className="text-sm text-emerald-100/80 max-w-2xl leading-relaxed">
              Modul khusus perhitungan rincian kehadiran, pemotongan, Uang Kehadiran/Kinerja (UKK),
              Transpor, dan Uang Makan dengan formula yang saling tersinkronisasi. Semua perubahan data
              akan langsung menghitung ulang hasil akhir dan dapat disinkronkan ke slip gaji pegawai.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              id="sync-to-slips-btn"
              onClick={handleSyncToSlips}
              disabled={isSyncing}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold text-sm shadow-lg hover:shadow-emerald-500/20 transition-all active:scale-95 disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
              Sinkronkan ke Slip Gaji
            </button>
            <button
              id="open-import-modal-btn"
              onClick={() => setIsImportModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-medium text-sm transition-all"
            >
              <Upload className="w-4 h-4" />
              Upload Data
            </button>
            <button
              id="export-excel-btn"
              onClick={handleExportExcel}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-medium text-sm transition-all"
            >
              <Download className="w-4 h-4" />
              Export
            </button>
          </div>
        </div>
      </div>

      {/* Period Selection & Database Save Toolbar */}
      <div className="bg-slate-900 border border-emerald-500/30 rounded-2xl p-4 sm:p-5 shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex-1">
          <MonthYearPeriodPicker
            id="transport-ukk-period-picker"
            selectedPeriod={selectedTransportPeriod}
            onPeriodChange={handlePeriodChange}
            availablePeriods={availablePeriods}
            periodsWithData={periodsWithTransportData}
            theme="emerald"
            label="Pilih Periode Pengelolaan Transport & UKK:"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 self-start md:self-auto pt-2 md:pt-0">
          <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 text-xs font-semibold shadow-inner">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Tersimpan di Database</span>
            <span className="text-[10px] text-emerald-400/80">({lastSavedTime})</span>
          </div>

          <button
            id="save-transport-db-btn"
            type="button"
            onClick={handleManualSaveToDatabase}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white text-xs font-bold shadow-md shadow-emerald-700/30 transition-all cursor-pointer"
            title="Simpan seluruh data periode ini ke database"
          >
            <Save className="w-4 h-4" />
            Simpan Perubahan
          </button>
        </div>
      </div>

      {/* Empty State Card if Period has no data */}
      {currentPeriodRawRecords.length === 0 && (
        <div className="p-6 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border-2 border-dashed border-amber-300 dark:border-amber-700 text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-amber-100 dark:bg-amber-900/60 text-amber-600 dark:text-amber-300 flex items-center justify-center mx-auto">
            <Calendar className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
              Belum Ada Data Transport & UKK untuk Periode {getIndonesianPeriodLabel(selectedTransportPeriod)}
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 max-w-lg mx-auto mt-1">
              Setiap bulan memiliki data perhitungan mandiri dan tersimpan di database. Anda dapat menginisialisasi periode ini dari master pegawai atau mengunggah data Excel.
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
            <button
              type="button"
              onClick={handleInitializePeriod}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-sm cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              Inisialisasi Data Periode Ini ({employees.length} Pegawai)
            </button>
            <button
              type="button"
              onClick={() => setIsImportModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold hover:bg-slate-50 cursor-pointer"
            >
              <Upload className="w-4 h-4" />
              Upload Data Excel
            </button>
            <button
              type="button"
              onClick={() => setIsAddModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold hover:bg-slate-50 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Tambah Manual
            </button>
          </div>
        </div>
      )}

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-medium mb-1">
            <span>Pegawai Terhitung</span>
            <UserCheck className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-bold text-slate-800 dark:text-slate-100">
            {stats.count} <span className="text-xs font-normal text-slate-400">orang</span>
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Total {stats.totalHadir} kehadiran
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-medium mb-1">
            <span>Total UKK Diterima</span>
            <Award className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-xl font-bold text-blue-600 dark:text-blue-400">
            {formatRupiah(stats.totalUkk)}
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Potongan: {formatRupiah(stats.totalPotonganUkk)}
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-medium mb-1">
            <span>Total Transpor</span>
            <Bus className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-xl font-bold text-amber-600 dark:text-amber-400">
            {formatRupiah(stats.totalTranspor)}
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Berdasarkan presensi harian
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-medium mb-1">
            <span>Total Uang Makan</span>
            <Utensils className="w-4 h-4 text-purple-500" />
          </div>
          <div className="text-xl font-bold text-purple-600 dark:text-purple-400">
            {formatRupiah(stats.totalMakan)}
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Uang makan per kehadiran
          </div>
        </div>

        <div className="bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between text-emerald-700 dark:text-emerald-300 text-xs font-semibold mb-1">
            <span>GRAND TOTAL</span>
            <DollarSign className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div className="text-xl font-extrabold text-emerald-700 dark:text-emerald-300">
            {formatRupiah(stats.totalGrand)}
          </div>
          <div className="text-xs text-emerald-600 dark:text-emerald-400 mt-1 font-medium">
            Akumulasi UKK + Transpor + Makan
          </div>
        </div>
      </div>

      {/* Control Bar: Search, Filters, Column Switcher, Action Buttons */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-sm space-y-3">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Search & Unit Filter */}
          <div className="flex flex-wrap items-center gap-3 flex-1">
            <div className="relative flex-1 min-w-[240px]">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                id="search-transport-ukk"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari nama pegawai, NIP, atau jabatan..."
                className="w-full pl-9 pr-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              />
            </div>

            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-slate-400" />
              <select
                id="filter-unit-kerja"
                value={selectedUnit}
                onChange={(e) => setSelectedUnit(e.target.value)}
                className="px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              >
                <option value="ALL">Semua Unit Kerja</option>
                {availableUnits.map((u) => (
                  <option key={u} value={u}>
                    {u}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* View Toggles & Add Button */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="inline-flex rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 p-0.5 text-xs font-medium text-slate-600 dark:text-slate-300">
              <button
                type="button"
                onClick={() => setActiveColumnView('all')}
                className={`px-3 py-1.5 rounded-md transition-all ${
                  activeColumnView === 'all'
                    ? 'bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 shadow-xs font-semibold'
                    : 'hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Semua Kolom
              </button>
              <button
                type="button"
                onClick={() => setActiveColumnView('kehadiran')}
                className={`px-3 py-1.5 rounded-md transition-all ${
                  activeColumnView === 'kehadiran'
                    ? 'bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 shadow-xs font-semibold'
                    : 'hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Rekap Kehadiran
              </button>
              <button
                type="button"
                onClick={() => setActiveColumnView('ukk')}
                className={`px-3 py-1.5 rounded-md transition-all ${
                  activeColumnView === 'ukk'
                    ? 'bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 shadow-xs font-semibold'
                    : 'hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                UKK & Potongan
              </button>
              <button
                type="button"
                onClick={() => setActiveColumnView('transport_makan')}
                className={`px-3 py-1.5 rounded-md transition-all ${
                  activeColumnView === 'transport_makan'
                    ? 'bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 shadow-xs font-semibold'
                    : 'hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Transpor & Makan
              </button>
            </div>

            <button
              id="add-transport-row-btn"
              onClick={() => setIsAddModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold shadow-sm transition-all"
            >
              <Plus className="w-4 h-4" />
              Tambah Peserta Baru
            </button>

            <button
              id="reset-transport-default-btn"
              onClick={() => {
                if (confirm('Kembalikan data perhitungan transport & UKK ke kondisi default resmi demo?')) {
                  resetTransportUkkToDefault();
                }
              }}
              title="Reset ke Default Dokumen"
              className="p-2 rounded-lg border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-all"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Sync Info Hint */}
        <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/60 px-3 py-2 rounded-lg border border-slate-200/80 dark:border-slate-800">
          <div className="flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
            <span>
              <strong>Rumus Terkoneksi:</strong> Setiap angka kehadiran, sakit, izin, alpa, menit terlambat,
              atau tarif dapat diedit. Nilai potongan, UKK bersih, transpor, uang makan, dan grand total
              otomatis dihitung ulang secara real-time.
            </span>
          </div>
          <span className="font-semibold text-emerald-600 dark:text-emerald-400 shrink-0 ml-2">
            Periode: {periodConfig.label}
          </span>
        </div>
      </div>

      {/* Main Table Container */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto max-h-[640px] relative">
          <table className="w-full text-xs text-left border-collapse">
            {/* Top Table Header */}
            <thead className="bg-slate-100 dark:bg-slate-800/90 text-slate-700 dark:text-slate-200 sticky top-0 z-20 font-semibold select-none shadow-xs">
              {/* Grouping Row */}
              <tr className="border-b border-slate-200 dark:border-slate-700 text-center uppercase tracking-wider text-[10px]">
                <th colSpan={4} className="py-2.5 px-3 bg-slate-200/80 dark:bg-slate-800 text-left">
                  Identitas Pegawai
                </th>
                {(activeColumnView === 'all' || activeColumnView === 'kehadiran') && (
                  <th colSpan={6} className="py-2.5 px-3 bg-blue-100/80 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300 border-l border-r border-slate-200 dark:border-slate-700">
                    Rekapitulasi Kehadiran
                  </th>
                )}
                {(activeColumnView === 'all' || activeColumnView === 'kehadiran' || activeColumnView === 'ukk') && (
                  <th colSpan={7} className="py-2.5 px-3 bg-rose-100/80 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 border-r border-slate-200 dark:border-slate-700">
                    Potongan Kinerja / Absen (UKK)
                  </th>
                )}
                {(activeColumnView === 'all' || activeColumnView === 'ukk') && (
                  <th colSpan={3} className="py-2.5 px-3 bg-indigo-100/80 dark:bg-indigo-950/60 text-indigo-800 dark:text-indigo-300 border-r border-slate-200 dark:border-slate-700">
                    Uang Kehadiran & Kinerja (UKK)
                  </th>
                )}
                {(activeColumnView === 'all' || activeColumnView === 'transport_makan') && (
                  <th colSpan={4} className="py-2.5 px-3 bg-amber-100/80 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border-r border-slate-200 dark:border-slate-700">
                    Biaya Transportasi
                  </th>
                )}
                {(activeColumnView === 'all' || activeColumnView === 'transport_makan') && (
                  <th colSpan={2} className="py-2.5 px-3 bg-purple-100/80 dark:bg-purple-950/60 text-purple-800 dark:text-purple-300 border-r border-slate-200 dark:border-slate-700">
                    Uang Makan
                  </th>
                )}
                <th colSpan={2} className="py-2.5 px-3 bg-emerald-200/80 dark:bg-emerald-950/80 text-emerald-900 dark:text-emerald-200">
                  Hasil Akhir & Aksi
                </th>
              </tr>

              {/* Detailed Columns */}
              <tr className="border-b border-slate-300 dark:border-slate-700 font-bold">
                <th className="py-2 px-2 text-center w-10">No</th>
                <th className="py-2 px-3 min-w-[180px]">Nama Pegawai</th>
                <th className="py-2 px-3 min-w-[120px]">NIP</th>
                <th className="py-2 px-3 min-w-[140px]">Jabatan / Unit</th>

                {/* Kehadiran */}
                {(activeColumnView === 'all' || activeColumnView === 'kehadiran') && (
                  <>
                    <th className="py-2 px-2 text-center bg-blue-50/50 dark:bg-blue-950/30 w-16" title="Hari Kerja Efektif">HK</th>
                    <th className="py-2 px-2 text-center bg-blue-50/50 dark:bg-blue-950/30 w-16 text-emerald-600 dark:text-emerald-400" title="Jumlah Hadir">Hadir</th>
                    <th className="py-2 px-2 text-center bg-blue-50/50 dark:bg-blue-950/30 w-12 text-amber-600" title="Sakit">S</th>
                    <th className="py-2 px-2 text-center bg-blue-50/50 dark:bg-blue-950/30 w-12 text-blue-600" title="Izin">I</th>
                    <th className="py-2 px-2 text-center bg-blue-50/50 dark:bg-blue-950/30 w-12 text-rose-600" title="Alpa">A</th>
                    <th className="py-2 px-2 text-center bg-blue-50/50 dark:bg-blue-950/30 w-12 text-slate-600" title="Cuti">C</th>
                  </>
                )}

                {/* Potongan */}
                {(activeColumnView === 'all' || activeColumnView === 'kehadiran' || activeColumnView === 'ukk') && (
                  <>
                    <th className="py-2 px-1.5 text-center bg-rose-50/50 dark:bg-rose-950/30 w-14 text-[11px]" title="Datang Lambat < 5 Menit (Potongan 50% UKK Hari Itu)">TL &lt;5m</th>
                    <th className="py-2 px-1.5 text-center bg-rose-100/60 dark:bg-rose-950/50 w-14 text-[11px] text-rose-700 dark:text-rose-300 font-bold" title="Datang Lambat > 5 Menit (UKK Hari Itu Hilang 100%)">TL &gt;5m</th>
                    <th className="py-2 px-1.5 text-center bg-rose-50/50 dark:bg-rose-950/30 w-14 text-[11px]" title="Pulang Cepat < 5 Menit (Potongan 50% UKK Hari Itu)">PC &lt;5m</th>
                    <th className="py-2 px-1.5 text-center bg-rose-100/60 dark:bg-rose-950/50 w-14 text-[11px] text-rose-700 dark:text-rose-300 font-bold" title="Pulang Cepat > 5 Menit (UKK Hari Itu Hilang 100%)">PC &gt;5m</th>
                    <th className="py-2 px-2 text-center bg-rose-50/50 dark:bg-rose-950/30 w-14" title="Potongan Keterlambatan (%)">Pot. TL</th>
                    <th className="py-2 px-2 text-center bg-rose-50/50 dark:bg-rose-950/30 w-14" title="Potongan Absensi / Alpa (%)">Pot. Abs</th>
                    <th className="py-2 px-2 text-center bg-rose-100/70 dark:bg-rose-900/40 text-rose-700 dark:text-rose-300 w-16 font-extrabold" title="Total Potongan Persen">Total %</th>
                  </>
                )}

                {/* UKK */}
                {(activeColumnView === 'all' || activeColumnView === 'ukk') && (
                  <>
                    <th className="py-2 px-3 text-right bg-indigo-50/50 dark:bg-indigo-950/30 min-w-[100px]">UKK Bruto</th>
                    <th className="py-2 px-3 text-right bg-indigo-50/50 dark:bg-indigo-950/30 text-rose-600 min-w-[90px]">Pot. UKK</th>
                    <th className="py-2 px-3 text-right bg-indigo-100/70 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 font-extrabold min-w-[110px]">UKK Diterima</th>
                  </>
                )}

                {/* Transpor */}
                {(activeColumnView === 'all' || activeColumnView === 'transport_makan') && (
                  <>
                    <th className="py-2 px-2 text-right bg-amber-50/50 dark:bg-amber-950/30 min-w-[85px]">Tarif/Hari</th>
                    <th className="py-2 px-3 text-right bg-amber-50/50 dark:bg-amber-950/30 min-w-[95px]">Bruto</th>
                    <th className="py-2 px-2 text-right bg-amber-50/50 dark:bg-amber-950/30 text-rose-600 min-w-[75px]">Pot.</th>
                    <th className="py-2 px-3 text-right bg-amber-100/70 dark:bg-amber-900/40 text-amber-800 dark:text-amber-300 font-extrabold min-w-[105px]">Transpor Net</th>
                  </>
                )}

                {/* Uang Makan */}
                {(activeColumnView === 'all' || activeColumnView === 'transport_makan') && (
                  <>
                    <th className="py-2 px-2 text-right bg-purple-50/50 dark:bg-purple-950/30 min-w-[85px]">Tarif/Hari</th>
                    <th className="py-2 px-3 text-right bg-purple-100/70 dark:bg-purple-900/40 text-purple-800 dark:text-purple-300 font-extrabold min-w-[105px]">U. Makan Net</th>
                  </>
                )}

                {/* Grand Total */}
                <th className="py-2 px-3 text-right bg-emerald-100 dark:bg-emerald-950 text-emerald-900 dark:text-emerald-200 font-extrabold min-w-[125px]">
                  GRAND TOTAL
                </th>
                <th className="py-2 px-2 text-center w-20">Aksi</th>
              </tr>
            </thead>

            {/* Table Body */}
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan={24} className="py-12 text-center text-slate-400">
                    <FileSpreadsheet className="w-10 h-10 mx-auto mb-2 text-slate-300 dark:text-slate-600" />
                    <p className="font-semibold text-slate-600 dark:text-slate-300">Tidak ada data ditemukan</p>
                    <p className="text-xs text-slate-400 mt-1">Coba ubah kata kunci pencarian atau unggah berkas baru.</p>
                  </td>
                </tr>
              ) : (
                filteredRecords.map((r, idx) => (
                  <tr
                    key={r.id}
                    className={`hover:bg-emerald-50/40 dark:hover:bg-slate-800/60 transition-all group ${
                      r.id === recentlySavedRowId
                        ? 'bg-emerald-100/70 dark:bg-emerald-950/60 ring-2 ring-emerald-500/80 z-10'
                        : ''
                    }`}
                  >
                    <td className="py-2.5 px-2 text-center font-medium text-slate-400">{idx + 1}</td>
                    <td className="py-2.5 px-3">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-slate-900 dark:text-slate-100">{r.name}</span>
                        {r.id === recentlySavedRowId && (
                          <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-600 text-white shadow-xs animate-bounce">
                            ✓ Tersimpan
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] text-slate-400">{r.golongan || 'Gol. -'}</div>
                    </td>
                    <td className="py-2.5 px-3 font-mono text-[11px] text-slate-600 dark:text-slate-400">
                      {r.nip || '-'}
                    </td>
                    <td className="py-2.5 px-3">
                      <div className="text-slate-800 dark:text-slate-200 font-medium truncate max-w-[140px]" title={r.jabatan}>
                        {r.jabatan || '-'}
                      </div>
                      <div className="text-[10px] text-slate-400 truncate max-w-[140px]" title={r.unitKerja}>
                        {r.unitKerja || '-'}
                      </div>
                    </td>

                    {/* Kehadiran Columns with quick edit click */}
                    {(activeColumnView === 'all' || activeColumnView === 'kehadiran') && (
                      <>
                        <td
                          className="py-2.5 px-2 text-center font-medium text-slate-700 dark:text-slate-300 cursor-pointer hover:bg-emerald-100/50"
                          onClick={() => {
                            setInlineEditId(r.id);
                            setInlineField('hariKerja');
                            setInlineValue(String(r.hariKerja));
                          }}
                          title="Klik untuk edit Hari Kerja"
                        >
                          {inlineEditId === r.id && inlineField === 'hariKerja' ? (
                            <input
                              type="number"
                              autoFocus
                              value={inlineValue}
                              onChange={(e) => setInlineValue(e.target.value)}
                              onBlur={() => handleInlineSave(r.id)}
                              onKeyDown={(e) => e.key === 'Enter' && handleInlineSave(r.id)}
                              className="w-12 text-center py-0.5 border border-emerald-500 rounded bg-white text-slate-900"
                            />
                          ) : (
                            r.hariKerja
                          )}
                        </td>

                        <td
                          className="py-2.5 px-2 text-center font-bold text-emerald-600 dark:text-emerald-400 cursor-pointer hover:bg-emerald-100/50"
                          onClick={() => {
                            setInlineEditId(r.id);
                            setInlineField('jumlahHadir');
                            setInlineValue(String(r.jumlahHadir));
                          }}
                          title="Klik untuk edit Jumlah Hadir"
                        >
                          {inlineEditId === r.id && inlineField === 'jumlahHadir' ? (
                            <input
                              type="number"
                              autoFocus
                              value={inlineValue}
                              onChange={(e) => setInlineValue(e.target.value)}
                              onBlur={() => handleInlineSave(r.id)}
                              onKeyDown={(e) => e.key === 'Enter' && handleInlineSave(r.id)}
                              className="w-12 text-center py-0.5 border border-emerald-500 rounded bg-white text-slate-900"
                            />
                          ) : (
                            r.jumlahHadir
                          )}
                        </td>

                        <td
                          className={`py-2.5 px-2 text-center cursor-pointer hover:bg-emerald-100/50 ${
                            r.sakit > 0 ? 'font-bold text-amber-600' : 'text-slate-400'
                          }`}
                          onClick={() => {
                            setInlineEditId(r.id);
                            setInlineField('sakit');
                            setInlineValue(String(r.sakit));
                          }}
                        >
                          {inlineEditId === r.id && inlineField === 'sakit' ? (
                            <input
                              type="number"
                              autoFocus
                              value={inlineValue}
                              onChange={(e) => setInlineValue(e.target.value)}
                              onBlur={() => handleInlineSave(r.id)}
                              onKeyDown={(e) => e.key === 'Enter' && handleInlineSave(r.id)}
                              className="w-10 text-center py-0.5 border border-emerald-500 rounded bg-white text-slate-900"
                            />
                          ) : (
                            r.sakit || 0
                          )}
                        </td>

                        <td
                          className={`py-2.5 px-2 text-center cursor-pointer hover:bg-emerald-100/50 ${
                            r.izin > 0 ? 'font-bold text-blue-600' : 'text-slate-400'
                          }`}
                          onClick={() => {
                            setInlineEditId(r.id);
                            setInlineField('izin');
                            setInlineValue(String(r.izin));
                          }}
                        >
                          {inlineEditId === r.id && inlineField === 'izin' ? (
                            <input
                              type="number"
                              autoFocus
                              value={inlineValue}
                              onChange={(e) => setInlineValue(e.target.value)}
                              onBlur={() => handleInlineSave(r.id)}
                              onKeyDown={(e) => e.key === 'Enter' && handleInlineSave(r.id)}
                              className="w-10 text-center py-0.5 border border-emerald-500 rounded bg-white text-slate-900"
                            />
                          ) : (
                            r.izin || 0
                          )}
                        </td>

                        <td
                          className={`py-2.5 px-2 text-center cursor-pointer hover:bg-emerald-100/50 ${
                            r.alpa > 0 ? 'font-bold text-rose-600 bg-rose-50 dark:bg-rose-950/40 rounded' : 'text-slate-400'
                          }`}
                          onClick={() => {
                            setInlineEditId(r.id);
                            setInlineField('alpa');
                            setInlineValue(String(r.alpa));
                          }}
                        >
                          {inlineEditId === r.id && inlineField === 'alpa' ? (
                            <input
                              type="number"
                              autoFocus
                              value={inlineValue}
                              onChange={(e) => setInlineValue(e.target.value)}
                              onBlur={() => handleInlineSave(r.id)}
                              onKeyDown={(e) => e.key === 'Enter' && handleInlineSave(r.id)}
                              className="w-10 text-center py-0.5 border border-emerald-500 rounded bg-white text-slate-900"
                            />
                          ) : (
                            r.alpa || 0
                          )}
                        </td>

                        <td className="py-2.5 px-2 text-center text-slate-400">
                          {r.cuti || 0}
                        </td>
                      </>
                    )}

                    {/* Potongan Columns */}
                    {(activeColumnView === 'all' || activeColumnView === 'kehadiran' || activeColumnView === 'ukk') && (
                      <>
                        {/* Datang Lambat < 5m (Potongan 50% UKK) */}
                        <td
                          className={`py-2.5 px-1.5 text-center cursor-pointer hover:bg-emerald-100/50 ${
                            (r.datangLambatMin5 || 0) > 0 ? 'text-amber-600 font-bold bg-amber-50/50 dark:bg-amber-950/30' : 'text-slate-400'
                          }`}
                          onClick={() => {
                            setInlineEditId(r.id);
                            setInlineField('datangLambatMin5');
                            setInlineValue(String(r.datangLambatMin5 || 0));
                          }}
                          title="Klik untuk edit: Terlambat < 5 Menit (Potongan 50% UKK Harian)"
                        >
                          {inlineEditId === r.id && inlineField === 'datangLambatMin5' ? (
                            <input
                              type="number"
                              autoFocus
                              value={inlineValue}
                              onChange={(e) => setInlineValue(e.target.value)}
                              onBlur={() => handleInlineSave(r.id)}
                              onKeyDown={(e) => e.key === 'Enter' && handleInlineSave(r.id)}
                              className="w-10 text-center py-0.5 border border-emerald-500 rounded bg-white text-slate-900"
                            />
                          ) : (
                            r.datangLambatMin5 || 0
                          )}
                        </td>

                        {/* Datang Lambat > 5m (Hilang 100% UKK) */}
                        <td
                          className={`py-2.5 px-1.5 text-center cursor-pointer hover:bg-emerald-100/50 ${
                            (r.datangLambatPlus5 || 0) > 0 ? 'text-rose-600 font-extrabold bg-rose-50 dark:bg-rose-950/40' : 'text-slate-400'
                          }`}
                          onClick={() => {
                            setInlineEditId(r.id);
                            setInlineField('datangLambatPlus5');
                            setInlineValue(String(r.datangLambatPlus5 || 0));
                          }}
                          title="Klik untuk edit: Terlambat > 5 Menit (UKK Hari Itu Hilang 100%)"
                        >
                          {inlineEditId === r.id && inlineField === 'datangLambatPlus5' ? (
                            <input
                              type="number"
                              autoFocus
                              value={inlineValue}
                              onChange={(e) => setInlineValue(e.target.value)}
                              onBlur={() => handleInlineSave(r.id)}
                              onKeyDown={(e) => e.key === 'Enter' && handleInlineSave(r.id)}
                              className="w-10 text-center py-0.5 border border-emerald-500 rounded bg-white text-slate-900"
                            />
                          ) : (
                            r.datangLambatPlus5 || 0
                          )}
                        </td>

                        {/* Pulang Cepat < 5m (Potongan 50% UKK) */}
                        <td
                          className={`py-2.5 px-1.5 text-center cursor-pointer hover:bg-emerald-100/50 ${
                            (r.pulangCepatMin5 || 0) > 0 ? 'text-amber-600 font-bold bg-amber-50/50 dark:bg-amber-950/30' : 'text-slate-400'
                          }`}
                          onClick={() => {
                            setInlineEditId(r.id);
                            setInlineField('pulangCepatMin5');
                            setInlineValue(String(r.pulangCepatMin5 || 0));
                          }}
                          title="Klik untuk edit: Pulang Cepat < 5 Menit (Potongan 50% UKK Harian)"
                        >
                          {inlineEditId === r.id && inlineField === 'pulangCepatMin5' ? (
                            <input
                              type="number"
                              autoFocus
                              value={inlineValue}
                              onChange={(e) => setInlineValue(e.target.value)}
                              onBlur={() => handleInlineSave(r.id)}
                              onKeyDown={(e) => e.key === 'Enter' && handleInlineSave(r.id)}
                              className="w-10 text-center py-0.5 border border-emerald-500 rounded bg-white text-slate-900"
                            />
                          ) : (
                            r.pulangCepatMin5 || 0
                          )}
                        </td>

                        {/* Pulang Cepat > 5m (Hilang 100% UKK) */}
                        <td
                          className={`py-2.5 px-1.5 text-center cursor-pointer hover:bg-emerald-100/50 ${
                            (r.pulangCepatPlus5 || 0) > 0 ? 'text-rose-600 font-extrabold bg-rose-50 dark:bg-rose-950/40' : 'text-slate-400'
                          }`}
                          onClick={() => {
                            setInlineEditId(r.id);
                            setInlineField('pulangCepatPlus5');
                            setInlineValue(String(r.pulangCepatPlus5 || 0));
                          }}
                          title="Klik untuk edit: Pulang Cepat > 5 Menit (UKK Hari Itu Hilang 100%)"
                        >
                          {inlineEditId === r.id && inlineField === 'pulangCepatPlus5' ? (
                            <input
                              type="number"
                              autoFocus
                              value={inlineValue}
                              onChange={(e) => setInlineValue(e.target.value)}
                              onBlur={() => handleInlineSave(r.id)}
                              onKeyDown={(e) => e.key === 'Enter' && handleInlineSave(r.id)}
                              className="w-10 text-center py-0.5 border border-emerald-500 rounded bg-white text-slate-900"
                            />
                          ) : (
                            r.pulangCepatPlus5 || 0
                          )}
                        </td>

                        <td className="py-2.5 px-2 text-center text-slate-600 dark:text-slate-400 font-medium">
                          {r.potonganTerlambatPersen > 0 ? `${r.potonganTerlambatPersen}%` : '-'}
                        </td>
                        <td className="py-2.5 px-2 text-center text-slate-600 dark:text-slate-400 font-medium">
                          {r.potonganAbsenPersen > 0 ? `${r.potonganAbsenPersen}%` : '-'}
                        </td>
                        <td className="py-2.5 px-2 text-center font-bold text-rose-600 bg-rose-50/50 dark:bg-rose-950/20">
                          {r.totalPotonganPersen > 0 ? `${r.totalPotonganPersen}%` : '0%'}
                        </td>
                      </>
                    )}

                    {/* UKK Columns */}
                    {(activeColumnView === 'all' || activeColumnView === 'ukk') && (
                      <>
                        <td
                          className="py-2.5 px-3 text-right text-slate-700 dark:text-slate-300 font-medium cursor-pointer hover:bg-emerald-100/50"
                          onClick={() => {
                            setInlineEditId(r.id);
                            setInlineField('ukkBruto');
                            setInlineValue(String(r.ukkBruto));
                          }}
                          title="Klik untuk edit UKK Bruto"
                        >
                          {inlineEditId === r.id && inlineField === 'ukkBruto' ? (
                            <input
                              type="number"
                              autoFocus
                              value={inlineValue}
                              onChange={(e) => setInlineValue(e.target.value)}
                              onBlur={() => handleInlineSave(r.id)}
                              onKeyDown={(e) => e.key === 'Enter' && handleInlineSave(r.id)}
                              className="w-24 text-right py-0.5 border border-emerald-500 rounded bg-white text-slate-900"
                            />
                          ) : (
                            formatRupiah(r.ukkBruto)
                          )}
                        </td>

                        <td className="py-2.5 px-3 text-right text-rose-600">
                          {r.ukkPotongan > 0 ? `-${formatRupiah(r.ukkPotongan)}` : '-'}
                        </td>
                        <td className="py-2.5 px-3 text-right font-bold text-indigo-700 dark:text-indigo-300 bg-indigo-50/30 dark:bg-indigo-950/20">
                          {formatRupiah(r.ukkDiterima)}
                        </td>
                      </>
                    )}

                    {/* Transpor Columns */}
                    {(activeColumnView === 'all' || activeColumnView === 'transport_makan') && (
                      <>
                        <td
                          className="py-2.5 px-2 text-right text-slate-600 dark:text-slate-400 cursor-pointer hover:bg-emerald-100/50"
                          onClick={() => {
                            setInlineEditId(r.id);
                            setInlineField('tarifTransporHarian');
                            setInlineValue(String(r.tarifTransporHarian));
                          }}
                          title="Klik untuk edit tarif transpor harian"
                        >
                          {inlineEditId === r.id && inlineField === 'tarifTransporHarian' ? (
                            <input
                              type="number"
                              autoFocus
                              value={inlineValue}
                              onChange={(e) => setInlineValue(e.target.value)}
                              onBlur={() => handleInlineSave(r.id)}
                              onKeyDown={(e) => e.key === 'Enter' && handleInlineSave(r.id)}
                              className="w-20 text-right py-0.5 border border-emerald-500 rounded bg-white text-slate-900"
                            />
                          ) : (
                            formatRupiah(r.tarifTransporHarian)
                          )}
                        </td>
                        <td className="py-2.5 px-3 text-right text-slate-600 dark:text-slate-400">
                          {formatRupiah(r.transporBruto)}
                        </td>
                        <td className="py-2.5 px-2 text-right text-rose-600">
                          {r.transporPotongan > 0 ? `-${formatRupiah(r.transporPotongan)}` : '-'}
                        </td>
                        <td className="py-2.5 px-3 text-right font-bold text-amber-800 dark:text-amber-300 bg-amber-50/30 dark:bg-amber-950/20">
                          {formatRupiah(r.transporDiterima)}
                        </td>
                      </>
                    )}

                    {/* Uang Makan Columns */}
                    {(activeColumnView === 'all' || activeColumnView === 'transport_makan') && (
                      <>
                        <td
                          className="py-2.5 px-2 text-right text-slate-600 dark:text-slate-400 cursor-pointer hover:bg-emerald-100/50"
                          onClick={() => {
                            setInlineEditId(r.id);
                            setInlineField('tarifUangMakanHarian');
                            setInlineValue(String(r.tarifUangMakanHarian));
                          }}
                          title="Klik untuk edit tarif uang makan harian"
                        >
                          {inlineEditId === r.id && inlineField === 'tarifUangMakanHarian' ? (
                            <input
                              type="number"
                              autoFocus
                              value={inlineValue}
                              onChange={(e) => setInlineValue(e.target.value)}
                              onBlur={() => handleInlineSave(r.id)}
                              onKeyDown={(e) => e.key === 'Enter' && handleInlineSave(r.id)}
                              className="w-20 text-right py-0.5 border border-emerald-500 rounded bg-white text-slate-900"
                            />
                          ) : (
                            formatRupiah(r.tarifUangMakanHarian)
                          )}
                        </td>
                        <td className="py-2.5 px-3 text-right font-bold text-purple-800 dark:text-purple-300 bg-purple-50/30 dark:bg-purple-950/20">
                          {formatRupiah(r.uangMakanDiterima)}
                        </td>
                      </>
                    )}

                    {/* Grand Total */}
                    <td className="py-2.5 px-3 text-right font-extrabold text-emerald-700 dark:text-emerald-300 bg-emerald-50/50 dark:bg-emerald-950/40">
                      {formatRupiah(Number(r.grandTotal) || Number(r.totalJumlahUang) || ((r.ukkDiterima || 0) + (r.transporDiterima || 0) + (r.uangMakanDiterima || 0)))}
                    </td>

                    {/* Action buttons */}
                    <td className="py-2.5 px-2 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          type="button"
                          onClick={() => setEditingRecord(r)}
                          title="Edit Rincian Lengkap"
                          className="p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            if (confirm(`Hapus peserta "${r.name}" (${r.nip || 'NIP -'}) dari daftar perhitungan?`)) {
                              deleteTransportUkkRow(r.id);
                              showToast(`Peserta ${r.name} berhasil dihapus.`, 'success');
                            }
                          }}
                          title="Hapus Peserta"
                          className="p-1 rounded hover:bg-rose-100 dark:hover:bg-rose-950/50 text-rose-600"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>

            {/* Table Footer Summary Row */}
            {filteredRecords.length > 0 && (
              <tfoot className="bg-slate-100 dark:bg-slate-900 border-t-2 border-slate-300 dark:border-slate-700 text-xs font-bold sticky bottom-0 z-10 shadow-md">
                <tr>
                  <td colSpan={4} className="py-3 px-3 text-left text-slate-900 dark:text-slate-100 uppercase tracking-wide">
                    TOTAL REKAPITULASI ({stats.count} PESERTA / PEGAWAI)
                  </td>

                  {/* Kehadiran footer columns (6 cols: HK, Hadir, S, I, A, C) */}
                  {(activeColumnView === 'all' || activeColumnView === 'kehadiran') && (
                    <>
                      <td className="py-3 px-2 text-center text-slate-800 dark:text-slate-200">{stats.totalHariKerja}</td>
                      <td className="py-3 px-2 text-center text-emerald-700 dark:text-emerald-300 font-extrabold bg-emerald-50/50 dark:bg-emerald-950/30">
                        {stats.totalHadir}
                      </td>
                      <td className="py-3 px-2 text-center text-amber-700 dark:text-amber-300">{stats.totalSakit}</td>
                      <td className="py-3 px-2 text-center text-blue-700 dark:text-blue-300">{stats.totalIzin}</td>
                      <td className="py-3 px-2 text-center text-rose-700 dark:text-rose-300">{stats.totalAlpa}</td>
                      <td className="py-3 px-2 text-center text-slate-600 dark:text-slate-400">{stats.totalCuti}</td>
                    </>
                  )}

                  {/* Potongan footer columns (7 cols: TL<5m, TL>5m, PC<5m, PC>5m, Pot.TL, Pot.Abs, Total%) */}
                  {(activeColumnView === 'all' || activeColumnView === 'kehadiran' || activeColumnView === 'ukk') && (
                    <>
                      <td className="py-3 px-1 text-center text-amber-700 dark:text-amber-300 font-bold" title="Total TL < 5m">
                        {filteredRecords.reduce((acc, curr) => acc + (curr.datangLambatMin5 || 0), 0)}
                      </td>
                      <td className="py-3 px-1 text-center text-rose-700 dark:text-rose-300 font-extrabold" title="Total TL > 5m">
                        {filteredRecords.reduce((acc, curr) => acc + (curr.datangLambatPlus5 || 0), 0)}
                      </td>
                      <td className="py-3 px-1 text-center text-amber-700 dark:text-amber-300 font-bold" title="Total PC < 5m">
                        {filteredRecords.reduce((acc, curr) => acc + (curr.pulangCepatMin5 || 0), 0)}
                      </td>
                      <td className="py-3 px-1 text-center text-rose-700 dark:text-rose-300 font-extrabold" title="Total PC > 5m">
                        {filteredRecords.reduce((acc, curr) => acc + (curr.pulangCepatPlus5 || 0), 0)}
                      </td>
                      <td className="py-3 px-2 text-center text-slate-400">-</td>
                      <td className="py-3 px-2 text-center text-slate-400">-</td>
                      <td className="py-3 px-2 text-center text-rose-600 font-bold">-</td>
                    </>
                  )}

                  {/* UKK footer columns */}
                  {(activeColumnView === 'all' || activeColumnView === 'ukk') && (
                    <>
                      <td className="py-3 px-3 text-right text-slate-800 dark:text-slate-200">
                        {formatRupiah(stats.totalUkkBruto)}
                      </td>
                      <td className="py-3 px-3 text-right text-rose-700 dark:text-rose-400">
                        -{formatRupiah(stats.totalPotonganUkk)}
                      </td>
                      <td className="py-3 px-3 text-right font-black text-indigo-900 dark:text-indigo-200 bg-indigo-50/60 dark:bg-indigo-950/40">
                        {formatRupiah(stats.totalUkk)}
                      </td>
                    </>
                  )}

                  {/* Transport & Makan footer columns */}
                  {(activeColumnView === 'all' || activeColumnView === 'transport_makan') && (
                    <>
                      <td className="py-3 px-2 text-right text-slate-400">-</td>
                      <td className="py-3 px-3 text-right font-black text-amber-900 dark:text-amber-200 bg-amber-50/60 dark:bg-amber-950/40">
                        {formatRupiah(stats.totalTranspor)}
                      </td>
                      <td className="py-3 px-2 text-right text-slate-400">-</td>
                      <td className="py-3 px-3 text-right font-black text-purple-900 dark:text-purple-200 bg-purple-50/60 dark:bg-purple-950/40">
                        {formatRupiah(stats.totalMakan)}
                      </td>
                    </>
                  )}

                  {/* Grand Total Footer */}
                  <td className="py-3 px-3 text-right text-sm font-black text-emerald-800 dark:text-emerald-200 bg-emerald-100/80 dark:bg-emerald-950/80 border-l border-r border-emerald-300 dark:border-emerald-700">
                    {formatRupiah(stats.totalGrand)}
                  </td>
                  <td className="py-3 px-2 text-center text-slate-400">-</td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>

      {/* Edit Record Modal */}
      {editingRecord && (
        <EditTransportUkkModal
          record={editingRecord}
          onClose={() => setEditingRecord(null)}
          onSave={(updated) => {
            updateTransportUkkRow(editingRecord.id, updated, true);
            setEditingRecord(null);
            showToast(`Data perhitungan ${updated.name} berhasil diperbarui.`, 'success');
          }}
        />
      )}

      {/* Add Record Modal */}
      {isAddModalOpen && (
        <AddTransportUkkModal
          employees={employees}
          onClose={() => setIsAddModalOpen(false)}
          onAdd={(newRow) => {
            addTransportUkkRow(newRow);
            setIsAddModalOpen(false);
          }}
        />
      )}

      {/* Import / Upload Modal */}
      {isImportModalOpen && (
        <ImportTransportUkkModal
          onClose={() => setIsImportModalOpen(false)}
          onImport={(records, replaceAll) => {
            importTransportUkkRecords(records, replaceAll);
            setIsImportModalOpen(false);
          }}
          onDownloadTemplate={handleDownloadTemplate}
        />
      )}
    </div>
  );
};

// ----------------------------------------------------
// EDIT MODAL COMPONENT (WITH REAL-TIME PREVIEW CALCULATOR)
// ----------------------------------------------------
interface EditModalProps {
  record: TransportUkkRecord;
  onClose: () => void;
  onSave: (updated: TransportUkkRecord) => void;
}

const EditTransportUkkModal: React.FC<EditModalProps> = ({ record, onClose, onSave }) => {
  const [formData, setFormData] = useState<TransportUkkRecord>({
    ...record,
    name: record.name || '',
    nip: record.nip || '',
    jabatan: record.jabatan || '',
    unitKerja: record.unitKerja || '',
    golongan: record.golongan || '',
    hariKerja: record.hariKerja ?? 22,
    jumlahHadir: record.jumlahHadir ?? 22,
    sakit: record.sakit ?? 0,
    izin: record.izin ?? 0,
    alpa: record.alpa ?? 0,
    cuti: record.cuti ?? 0,
    terlambatMenit: record.terlambatMenit ?? 0,
    ukkBruto: record.ukkBruto ?? 0,
    tarifTransporHarian: record.tarifTransporHarian ?? 0,
    tarifUangMakanHarian: record.tarifUangMakanHarian ?? 0,
  });

  // Calculate live dynamic preview
  const preview = useMemo(() => {
    return calculateTransportUkkRow(formData);
  }, [formData]);

  const handleChange = (field: keyof TransportUkkRecord, value: any) => {
    setFormData((prev) => {
      const updated = {
        ...prev,
        [field]: value,
      };

      // If attendance fields changed, automatically recalculate jumlahHadir so UKK Bruto, Transpor, and Uang Makan sync!
      if (['sakit', 'izin', 'alpa', 'cuti', 'dinluar', 'hariKerja'].includes(field as string)) {
        const hk = field === 'hariKerja' ? Number(value) : (Number(prev.hariKerja) || 0);
        const s = field === 'sakit' ? Number(value) : (Number(prev.sakit) || 0);
        const i = field === 'izin' ? Number(value) : (Number(prev.izin) || 0);
        const a = field === 'alpa' ? Number(value) : (Number(prev.alpa) || 0);
        const c = field === 'cuti' ? Number(value) : (Number(prev.cuti) || 0);
        const d = field === 'dinluar' ? Number(value) : (Number(prev.dinluar) || 0);
        const newTidakMasuk = s + i + a + c + d;
        const newHadir = Math.max(0, hk - newTidakMasuk);
        updated.jumlahTidakMasuk = newTidakMasuk;
        updated.jumlahHadir = newHadir;
      }

      if (field === 'jumlahHadir') {
        const newHadir = Number(value) || 0;
        updated.jumlahHadir = newHadir;
        if (prev.hariKerja && prev.hariKerja > 0) {
          updated.jumlahTidakMasuk = Math.max(0, prev.hariKerja - newHadir);
        }
      }

      return updated;
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-4xl shadow-2xl overflow-hidden my-8">
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Calculator className="w-5 h-5 text-emerald-400" />
            <div>
              <h3 className="text-lg font-bold">Edit Sumber Hitung Transport & UKK</h3>
              <p className="text-xs text-slate-300">{formData.name} - NIP: {formData.nip || '-'}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Section 1: Identitas */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-1.5">
              <UserCheck className="w-4 h-4 text-emerald-500" />
              Identitas Pegawai
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Nama Pegawai</label>
                <input
                  type="text"
                  value={formData.name || ''}
                  onChange={(e) => handleChange('name', e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">NIP</label>
                <input
                  type="text"
                  value={formData.nip || ''}
                  onChange={(e) => handleChange('nip', e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm font-mono"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Jabatan</label>
                <input
                  type="text"
                  value={formData.jabatan || ''}
                  onChange={(e) => handleChange('jabatan', e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Rekapitulasi Kehadiran & Terlambat */}
          <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-blue-500" />
              Parameter Kehadiran
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-6 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Hari Kerja</label>
                <input
                  type="number"
                  value={formData.hariKerja ?? 0}
                  onChange={(e) => handleChange('hariKerja', parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm font-semibold"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-emerald-600 dark:text-emerald-400 mb-1">Jml Hadir</label>
                <input
                  type="number"
                  value={formData.jumlahHadir ?? 0}
                  onChange={(e) => handleChange('jumlahHadir', parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2 rounded-lg border border-emerald-300 dark:border-emerald-700 bg-emerald-50/50 dark:bg-emerald-950/30 text-sm font-bold text-emerald-700 dark:text-emerald-300"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-amber-600 mb-1">Sakit (Hari)</label>
                <input
                  type="number"
                  value={formData.sakit ?? 0}
                  onChange={(e) => handleChange('sakit', parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-blue-600 mb-1">Izin (Hari)</label>
                <input
                  type="number"
                  value={formData.izin ?? 0}
                  onChange={(e) => handleChange('izin', parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-rose-600 mb-1">Alpa (Hari)</label>
                <input
                  type="number"
                  value={formData.alpa ?? 0}
                  onChange={(e) => handleChange('alpa', parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2 rounded-lg border border-rose-300 dark:border-rose-700 bg-rose-50/50 dark:bg-rose-950/30 text-sm font-bold text-rose-700"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Cuti (Hari)</label>
                <input
                  type="number"
                  value={formData.cuti ?? 0}
                  onChange={(e) => handleChange('cuti', parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm"
                />
              </div>
            </div>
          </div>

          {/* Section 2.5: Aturan Keterlambatan & Pulang Cepat (Memotong UKK) */}
          <div className="p-4 rounded-xl bg-rose-50/60 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800/60 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-rose-800 dark:text-rose-300 flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-rose-600" />
                Parameter Keterlambatan & Pulang Cepat (Aturan UKK)
              </h4>
              <span className="text-[11px] font-semibold text-rose-700 dark:text-rose-400 bg-rose-100 dark:bg-rose-900/60 px-2.5 py-0.5 rounded-full">
                &lt; 5m: Pot. 50% | &gt; 5m: Hilang 100%
              </span>
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-white dark:bg-slate-900 p-2.5 rounded-lg border border-rose-200 dark:border-rose-900">
                <label className="block text-[11px] font-semibold text-amber-700 dark:text-amber-400 mb-1">
                  Datang Lambat &lt; 5m
                </label>
                <input
                  type="number"
                  value={formData.datangLambatMin5 ?? 0}
                  onChange={(e) => handleChange('datangLambatMin5', parseInt(e.target.value) || 0)}
                  className="w-full px-2.5 py-1.5 rounded border border-amber-300 dark:border-amber-700 text-sm font-bold text-amber-700"
                />
                <span className="text-[10px] text-slate-500 mt-1 block">Potongan 50% per kejadian</span>
              </div>

              <div className="bg-white dark:bg-slate-900 p-2.5 rounded-lg border border-rose-300 dark:border-rose-800">
                <label className="block text-[11px] font-bold text-rose-700 dark:text-rose-400 mb-1">
                  Datang Lambat &gt; 5m
                </label>
                <input
                  type="number"
                  value={formData.datangLambatPlus5 ?? 0}
                  onChange={(e) => handleChange('datangLambatPlus5', parseInt(e.target.value) || 0)}
                  className="w-full px-2.5 py-1.5 rounded border border-rose-400 dark:border-rose-700 text-sm font-bold text-rose-700 bg-rose-50/50 dark:bg-rose-950/40"
                />
                <span className="text-[10px] text-rose-600 font-semibold mt-1 block">UKK Hari Itu Hilang 100%</span>
              </div>

              <div className="bg-white dark:bg-slate-900 p-2.5 rounded-lg border border-rose-200 dark:border-rose-900">
                <label className="block text-[11px] font-semibold text-amber-700 dark:text-amber-400 mb-1">
                  Pulang Cepat &lt; 5m
                </label>
                <input
                  type="number"
                  value={formData.pulangCepatMin5 ?? 0}
                  onChange={(e) => handleChange('pulangCepatMin5', parseInt(e.target.value) || 0)}
                  className="w-full px-2.5 py-1.5 rounded border border-amber-300 dark:border-amber-700 text-sm font-bold text-amber-700"
                />
                <span className="text-[10px] text-slate-500 mt-1 block">Potongan 50% per kejadian</span>
              </div>

              <div className="bg-white dark:bg-slate-900 p-2.5 rounded-lg border border-rose-300 dark:border-rose-800">
                <label className="block text-[11px] font-bold text-rose-700 dark:text-rose-400 mb-1">
                  Pulang Cepat &gt; 5m
                </label>
                <input
                  type="number"
                  value={formData.pulangCepatPlus5 ?? 0}
                  onChange={(e) => handleChange('pulangCepatPlus5', parseInt(e.target.value) || 0)}
                  className="w-full px-2.5 py-1.5 rounded border border-rose-400 dark:border-rose-700 text-sm font-bold text-rose-700 bg-rose-50/50 dark:bg-rose-950/40"
                />
                <span className="text-[10px] text-rose-600 font-semibold mt-1 block">UKK Hari Itu Hilang 100%</span>
              </div>
            </div>
          </div>

          {/* Section 3: Tarif & UKK Bruto */}
          <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-1.5">
              <DollarSign className="w-4 h-4 text-emerald-500" />
              Tarif & Basis Perhitungan
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-medium text-slate-700 dark:text-slate-300">UKK Bruto (Rp)</label>
                  <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">Tersinkron: {formatRupiah(preview.ukkBruto)}</span>
                </div>
                <input
                  type="number"
                  value={preview.ukkBruto}
                  onChange={(e) => {
                    const val = parseFloat(e.target.value) || 0;
                    handleChange('ukkBruto', val);
                    handleChange('baseUkkBruto', val);
                  }}
                  className="w-full px-3 py-2 rounded-lg border border-emerald-400/60 dark:border-emerald-700/60 bg-emerald-50/30 dark:bg-emerald-950/20 text-sm font-bold text-emerald-700 dark:text-emerald-300"
                />
                <span className="text-[10px] text-slate-500 mt-1 block">Tersinkronisasi {preview.jumlahHadir} hari hadir</span>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Tarif Transpor / Hari (Rp)</label>
                <input
                  type="number"
                  value={formData.tarifTransporHarian ?? 0}
                  onChange={(e) => handleChange('tarifTransporHarian', parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm font-semibold"
                />
                <span className="text-[10px] text-slate-500 mt-1 block">Hasil: {formatRupiah(preview.transporDiterima)}</span>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Tarif Uang Makan / Hari (Rp)</label>
                <input
                  type="number"
                  value={formData.tarifUangMakanHarian ?? 0}
                  onChange={(e) => handleChange('tarifUangMakanHarian', parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm font-semibold"
                />
                <span className="text-[10px] text-slate-500 mt-1 block">Hasil: {formatRupiah(preview.uangMakanDiterima)}</span>
              </div>
            </div>
          </div>

          {/* Section 4: Real-time Live Formula Preview */}
          <div className="p-4 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-3">
            <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
              <span className="flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-emerald-500" />
                Hasil Perhitungan Rumus Otomatis (Live Preview)
              </span>
              <span className="text-rose-600 font-semibold">Total Potongan: {preview.totalPotonganPersen}%</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 text-xs">
              <div className="p-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                <div className="text-slate-400 text-[10px]">UKK Bruto</div>
                <div className="text-sm font-bold text-slate-900 dark:text-slate-100 mt-0.5">
                  {formatRupiah(preview.ukkBruto)}
                </div>
                <div className="text-[10px] text-emerald-600 mt-0.5">{preview.jumlahHadir} hari hadir</div>
              </div>

              <div className="p-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                <div className="text-slate-400 text-[10px]">UKK Diterima</div>
                <div className="text-sm font-bold text-indigo-600 dark:text-indigo-400 mt-0.5">
                  {formatRupiah(preview.ukkDiterima)}
                </div>
                <div className="text-[10px] text-rose-500 mt-0.5">Pot: -{formatRupiah(preview.ukkPotongan)}</div>
              </div>

              <div className="p-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                <div className="text-slate-400 text-[10px]">Transpor Diterima</div>
                <div className="text-sm font-bold text-amber-600 dark:text-amber-400 mt-0.5">
                  {formatRupiah(preview.transporDiterima)}
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5">{preview.jumlahHadir} x {formatRupiah(preview.tarifTransporHarian)}</div>
              </div>

              <div className="p-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                <div className="text-slate-400 text-[10px]">Uang Makan</div>
                <div className="text-sm font-bold text-purple-600 dark:text-purple-400 mt-0.5">
                  {formatRupiah(preview.uangMakanDiterima)}
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5">{preview.jumlahHadir} x {formatRupiah(preview.tarifUangMakanHarian)}</div>
              </div>

              <div className="col-span-2 sm:col-span-1 p-2.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-300 dark:border-emerald-700">
                <div className="text-emerald-700 dark:text-emerald-300 font-semibold text-[10px]">GRAND TOTAL</div>
                <div className="text-base font-extrabold text-emerald-700 dark:text-emerald-300 mt-0.5">
                  {formatRupiah(preview.grandTotal)}
                </div>
                <div className="text-[10px] text-emerald-600 mt-0.5">Sinkron ke Slip Gaji</div>
              </div>
            </div>
          </div>
        </div>

        <div className="px-6 py-4 bg-slate-50 dark:bg-slate-800/60 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-sm font-medium hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={() => onSave(preview)}
            className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold shadow-md transition-all"
          >
            Simpan Perubahan
          </button>
        </div>
      </div>
    </div>
  );
};

// ----------------------------------------------------
// ADD MODAL COMPONENT
// ----------------------------------------------------
interface AddModalProps {
  employees: any[];
  onClose: () => void;
  onAdd: (newRow: Partial<TransportUkkRecord>) => void;
}

const AddTransportUkkModal: React.FC<AddModalProps> = ({ employees, onClose, onAdd }) => {
  const [selectedEmpId, setSelectedEmpId] = useState<string>('');
  const [formData, setFormData] = useState<Partial<TransportUkkRecord>>({
    name: '',
    nip: '',
    jabatan: '',
    golongan: 'III/a',
    unitKerja: 'Biro Administrasi',
    employeeStatus: 'GTY',
    hariKerja: 23,
    jumlahHadir: 23,
    sakit: 0,
    izin: 0,
    alpa: 0,
    cuti: 0,
    dinluar: 0,
    terlambatMenit: 0,
    ukkBruto: 2500000,
    tarifTransporHarian: 59750,
    tarifUangMakanHarian: 30000,
  });

  const handleSelectEmployee = (empId: string) => {
    setSelectedEmpId(empId);
    const found = employees.find((e) => e.id === empId);
    if (found) {
      // Intelligent defaults based on position/status
      const isGuru = (found.position || '').toLowerCase().includes('guru') || (found.position || '').toLowerCase().includes('pengajar');
      const isPimpinan = (found.position || '').toLowerCase().includes('kepala') || (found.position || '').toLowerCase().includes('wakil');
      
      const defaultTranspor = isPimpinan ? 84250 : isGuru ? 59750 : 50000;
      const defaultUkk = isPimpinan ? 4085950 : isGuru ? 3484270 : 1800000;
      const defaultMakan = 30000;

      setFormData((prev) => ({
        ...prev,
        name: found.name,
        nip: found.nip || '',
        jabatan: found.position || '',
        golongan: found.grade || 'III/a',
        unitKerja: found.department || 'Biro Administrasi',
        employeeStatus: found.status === 'tetap' ? 'GTY' : 'GTT',
        ukkBruto: defaultUkk,
        tarifTransporHarian: defaultTranspor,
        tarifUangMakanHarian: defaultMakan,
      }));
    }
  };

  const preview = useMemo(() => {
    return calculateTransportUkkRow(formData as TransportUkkRecord);
  }, [formData]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-3xl shadow-2xl overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200">
        <div className="px-6 py-4 bg-gradient-to-r from-emerald-700 to-teal-800 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 bg-white/10 rounded-lg">
              <Plus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold">Tambah Peserta Baru (Transport & UKK)</h3>
              <p className="text-xs text-emerald-100">Tambahkan pegawai/peserta ke daftar perhitungan tunjangan periode ini</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/10 text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          {/* Quick Select Employee */}
          <div className="bg-emerald-50/50 dark:bg-emerald-950/30 p-3.5 rounded-xl border border-emerald-200/80 dark:border-emerald-800/60">
            <label className="block text-xs font-bold text-emerald-900 dark:text-emerald-300 mb-1.5">
              ⚡ Pilih Cepat dari Database Pegawai (Otomatis Isi Data & Tarif)
            </label>
            <select
              value={selectedEmpId}
              onChange={(e) => handleSelectEmployee(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-emerald-300 dark:border-emerald-700 bg-white dark:bg-slate-800 text-sm font-medium text-slate-800 dark:text-slate-100 shadow-xs focus:ring-2 focus:ring-emerald-500"
            >
              <option value="">-- Ketik Bebas / Input Manual Peserta Baru --</option>
              {employees.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.name} ({e.nip || 'NIP -'}) • {e.position} • {e.department}
                </option>
              ))}
            </select>
          </div>

          {/* Participant Information */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              1. Identitas Peserta / Pegawai
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Nama Lengkap <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.name || ''}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Nama Pegawai / Guru"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">NIP</label>
                <input
                  type="text"
                  value={formData.nip || ''}
                  onChange={(e) => setFormData({ ...formData, nip: e.target.value })}
                  placeholder="Nomor Induk Pegawai"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm font-mono focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Jabatan</label>
                <input
                  type="text"
                  value={formData.jabatan || ''}
                  onChange={(e) => setFormData({ ...formData, jabatan: e.target.value })}
                  placeholder="Contoh: Guru Matematika"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Unit Kerja</label>
                <input
                  type="text"
                  value={formData.unitKerja || ''}
                  onChange={(e) => setFormData({ ...formData, unitKerja: e.target.value })}
                  placeholder="SMP Islam Al Azhar 9"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Golongan</label>
                <input
                  type="text"
                  value={formData.golongan || ''}
                  onChange={(e) => setFormData({ ...formData, golongan: e.target.value })}
                  placeholder="III/a"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Status Kepegawaian</label>
                <select
                  value={formData.employeeStatus || 'GTY'}
                  onChange={(e) => setFormData({ ...formData, employeeStatus: e.target.value as any })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm font-semibold"
                >
                  <option value="GTY">GTY (Guru Tetap Yayasan)</option>
                  <option value="PTY">PTY (Pegawai Tetap Yayasan)</option>
                  <option value="GTT">GTT (Guru Tidak Tetap)</option>
                  <option value="PTT">PTT (Pegawai Tidak Tetap)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Kehadiran Section */}
          <div className="space-y-3 pt-3 border-t border-slate-200 dark:border-slate-800">
            <h4 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              2. Data Kehadiran & Absensi
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Hari Kerja Standar</label>
                <input
                  type="number"
                  min={0}
                  value={formData.hariKerja ?? 23}
                  onChange={(e) => {
                    const hk = parseInt(e.target.value) || 0;
                    setFormData((prev) => ({
                      ...prev,
                      hariKerja: hk,
                      jumlahHadir: Math.max(0, hk - ((prev.sakit || 0) + (prev.izin || 0) + (prev.alpa || 0) + (prev.cuti || 0) + (prev.dinluar || 0))),
                    }));
                  }}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-emerald-700 dark:text-emerald-400 mb-1">Jumlah Hadir</label>
                <input
                  type="number"
                  min={0}
                  value={formData.jumlahHadir ?? 23}
                  onChange={(e) => setFormData({ ...formData, jumlahHadir: parseInt(e.target.value) || 0 })}
                  className="w-full px-3 py-2 rounded-lg border-2 border-emerald-500 bg-emerald-50/60 dark:bg-emerald-950/40 text-sm font-bold text-emerald-800 dark:text-emerald-200"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Sakit (Hari)</label>
                <input
                  type="number"
                  min={0}
                  value={formData.sakit ?? 0}
                  onChange={(e) => setFormData({ ...formData, sakit: parseInt(e.target.value) || 0 })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Alpa (Hari)</label>
                <input
                  type="number"
                  min={0}
                  value={formData.alpa ?? 0}
                  onChange={(e) => setFormData({ ...formData, alpa: parseInt(e.target.value) || 0 })}
                  className="w-full px-3 py-2 rounded-lg border border-rose-300 dark:border-rose-700 bg-rose-50/40 text-sm"
                />
              </div>
            </div>

            {/* Aturan UKK: Terlambat & Pulang Cepat */}
            <div className="p-3.5 rounded-xl bg-rose-50/60 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-rose-800 dark:text-rose-300">
                  Parameter Pemotong UKK (Aturan Terlambat & Pulang Cepat):
                </span>
                <span className="text-[10px] font-semibold text-rose-600 bg-rose-100 px-2 py-0.5 rounded">
                  &lt; 5m = 50% | &gt; 5m = 100%
                </span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                <div>
                  <label className="block text-[11px] text-amber-700 dark:text-amber-400 font-semibold mb-1">TL &lt; 5m</label>
                  <input
                    type="number"
                    min={0}
                    value={formData.datangLambatMin5 ?? 0}
                    onChange={(e) => setFormData({ ...formData, datangLambatMin5: parseInt(e.target.value) || 0 })}
                    className="w-full px-2 py-1 rounded border border-amber-300 bg-white dark:bg-slate-800 text-sm font-bold text-amber-700"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-rose-700 dark:text-rose-400 font-bold mb-1">TL &gt; 5m (100%)</label>
                  <input
                    type="number"
                    min={0}
                    value={formData.datangLambatPlus5 ?? 0}
                    onChange={(e) => setFormData({ ...formData, datangLambatPlus5: parseInt(e.target.value) || 0 })}
                    className="w-full px-2 py-1 rounded border border-rose-400 bg-rose-50 dark:bg-rose-950/40 text-sm font-bold text-rose-700"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-amber-700 dark:text-amber-400 font-semibold mb-1">PC &lt; 5m</label>
                  <input
                    type="number"
                    min={0}
                    value={formData.pulangCepatMin5 ?? 0}
                    onChange={(e) => setFormData({ ...formData, pulangCepatMin5: parseInt(e.target.value) || 0 })}
                    className="w-full px-2 py-1 rounded border border-amber-300 bg-white dark:bg-slate-800 text-sm font-bold text-amber-700"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-rose-700 dark:text-rose-400 font-bold mb-1">PC &gt; 5m (100%)</label>
                  <input
                    type="number"
                    min={0}
                    value={formData.pulangCepatPlus5 ?? 0}
                    onChange={(e) => setFormData({ ...formData, pulangCepatPlus5: parseInt(e.target.value) || 0 })}
                    className="w-full px-2 py-1 rounded border border-rose-400 bg-rose-50 dark:bg-rose-950/40 text-sm font-bold text-rose-700"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Tarif & Nilai UKK, Transpor, Uang Makan */}
          <div className="space-y-3 pt-3 border-t border-slate-200 dark:border-slate-800">
            <h4 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              3. Komponen Tarif Tunjangan & UKK
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-indigo-700 dark:text-indigo-400 mb-1">
                  UKK Bruto (Rp)
                </label>
                <input
                  type="number"
                  step={1000}
                  value={formData.ukkBruto ?? 2500000}
                  onChange={(e) => setFormData({ ...formData, ukkBruto: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2 rounded-lg border border-indigo-200 dark:border-indigo-800 bg-indigo-50/30 dark:bg-indigo-950/20 text-sm font-semibold text-indigo-900 dark:text-indigo-200"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-amber-700 dark:text-amber-400 mb-1">
                  Tarif Transpor / Hari (Rp)
                </label>
                <input
                  type="number"
                  step={250}
                  value={formData.tarifTransporHarian ?? 59750}
                  onChange={(e) => setFormData({ ...formData, tarifTransporHarian: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2 rounded-lg border border-amber-200 dark:border-amber-800 bg-amber-50/30 dark:bg-amber-950/20 text-sm font-semibold text-amber-900 dark:text-amber-200"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-purple-700 dark:text-purple-400 mb-1">
                  Tarif Uang Makan / Hari (Rp)
                </label>
                <input
                  type="number"
                  step={1000}
                  value={formData.tarifUangMakanHarian ?? 30000}
                  onChange={(e) => setFormData({ ...formData, tarifUangMakanHarian: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2 rounded-lg border border-purple-200 dark:border-purple-800 bg-purple-50/30 dark:bg-purple-950/20 text-sm font-semibold text-purple-900 dark:text-purple-200"
                />
              </div>
            </div>
          </div>

          {/* Live Dynamic Preview Card */}
          <div className="p-4 rounded-xl bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/40 dark:to-teal-950/30 border border-emerald-200 dark:border-emerald-800 shadow-xs">
            <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-900 dark:text-emerald-200 mb-2">
              <Sparkles className="w-4 h-4 text-emerald-600" />
              <span>Hasil Perhitungan Otomatis (Live Real-Time):</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              <div className="p-2 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800">
                <div className="text-[10px] text-slate-400">UKK Diterima (Net)</div>
                <div className="font-bold text-indigo-700 dark:text-indigo-300 mt-0.5">{formatRupiah(preview.ukkDiterima)}</div>
              </div>
              <div className="p-2 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800">
                <div className="text-[10px] text-slate-400">Transpor Net ({preview.jumlahHadir} hari)</div>
                <div className="font-bold text-amber-700 dark:text-amber-300 mt-0.5">{formatRupiah(preview.transporDiterima)}</div>
              </div>
              <div className="p-2 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800">
                <div className="text-[10px] text-slate-400">Uang Makan ({preview.jumlahHadir} hari)</div>
                <div className="font-bold text-purple-700 dark:text-purple-300 mt-0.5">{formatRupiah(preview.uangMakanDiterima)}</div>
              </div>
              <div className="p-2 bg-emerald-600 text-white rounded-lg shadow-xs">
                <div className="text-[10px] text-emerald-100 font-medium">GRAND TOTAL AKHIR</div>
                <div className="font-extrabold text-sm text-white mt-0.5">{formatRupiah(preview.grandTotal)}</div>
              </div>
            </div>
          </div>
        </div>

        <div className="px-6 py-4 bg-slate-50 dark:bg-slate-800/60 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="text-xs text-slate-500 dark:text-slate-400">
            {formData.name ? (
              <span>Siap menambahkan: <strong>{formData.name}</strong></span>
            ) : (
              <span>Isi nama peserta terlebih dahulu</span>
            )}
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-sm font-medium hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              Batal
            </button>
            <button
              type="button"
              disabled={!formData.name}
              onClick={() => onAdd(formData)}
              className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold shadow-md disabled:opacity-50 flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              Tambahkan Peserta
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ----------------------------------------------------
// IMPORT MODAL COMPONENT (EXCEL / CSV PARSER WITH AUTO-CALCULATION)
// ----------------------------------------------------
interface ImportModalProps {
  onClose: () => void;
  onImport: (records: TransportUkkRecord[], replaceAll: boolean) => void;
  onDownloadTemplate: () => void;
}

const ImportTransportUkkModal: React.FC<ImportModalProps> = ({
  onClose,
  onImport,
  onDownloadTemplate,
}) => {
  const [parsedRows, setParsedRows] = useState<TransportUkkRecord[]>([]);
  const [replaceAll, setReplaceAll] = useState<boolean>(false);
  const [fileName, setFileName] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setIsProcessing(true);

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const data = evt.target?.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(sheet) as any[];

        const mapped: TransportUkkRecord[] = jsonData.map((row, idx) => {
          const rawRecord: Partial<TransportUkkRecord> = {
            id: `tu-import-${Date.now()}-${idx}`,
            no: row.No || row.no || idx + 1,
            name: row['Nama Pegawai'] || row.Nama || row.name || `Pegawai ${idx + 1}`,
            nip: String(row.NIP || row.nip || ''),
            jabatan: row.Jabatan || row.jabatan || 'Staf',
            unitKerja: row['Unit Kerja'] || row.Unit || row.unitKerja || 'Biro Administrasi',
            golongan: row.Golongan || row.golongan || 'III/a',
            hariKerja: parseInt(row['Hari Kerja'] || row.hariKerja || 22),
            jumlahHadir: parseInt(row['Jml Hadir'] || row['Jumlah Hadir'] || row.jumlahHadir || 22),
            sakit: parseInt(row.Sakit || row.sakit || 0),
            izin: parseInt(row.Izin || row.izin || 0),
            alpa: parseInt(row.Alpa || row.alpa || 0),
            cuti: parseInt(row.Cuti || row.cuti || 0),
            terlambatMenit: parseInt(row['Terlambat (menit)'] || row['Terlambat'] || row.terlambatMenit || 0),
            ukkBruto: parseFloat(row['UKK Bruto'] || row.ukkBruto || 1800000),
            tarifTransporHarian: parseFloat(row['Tarif Transpor / Hari'] || row.tarifTransporHarian || 50000),
            tarifUangMakanHarian: parseFloat(row['Tarif Makan / Hari'] || row.tarifUangMakanHarian || 40000),
          };

          // Automatically pass through formula engine
          return calculateTransportUkkRow(rawRecord);
        });

        setParsedRows(mapped);
        setIsProcessing(false);
      } catch (err) {
        console.error(err);
        alert('Gagal memproses berkas Excel / CSV. Pastikan format kolom sesuai dengan template.');
        setIsProcessing(false);
      }
    };
    reader.readAsBinaryString(file);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-4xl shadow-2xl overflow-hidden my-8">
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Upload className="w-5 h-5 text-emerald-400" />
            <h3 className="text-lg font-bold">Upload Data Sumber Perhitungan Transport & UKK</h3>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-slate-800 text-slate-400">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Upload Dropzone */}
          <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-emerald-500 dark:hover:border-emerald-500 rounded-2xl p-6 text-center transition-all bg-slate-50 dark:bg-slate-800/40">
            <FileSpreadsheet className="w-12 h-12 mx-auto text-emerald-600 dark:text-emerald-400 mb-3" />
            <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100 mb-1">
              Pilih Berkas Excel (.xlsx, .xls) atau CSV
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto mb-4">
              Sistem akan secara otomatis membaca kolom rekap kehadiran, tarif, dan menjalankan seluruh
              rumus pemotongan serta total akhir.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-3">
              <label className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold cursor-pointer shadow-sm">
                <Upload className="w-4 h-4" />
                Pilih Berkas Dari Komputer
                <input
                  type="file"
                  accept=".xlsx, .xls, .csv"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>

              <button
                type="button"
                onClick={onDownloadTemplate}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-medium hover:bg-slate-100"
              >
                <Download className="w-4 h-4" />
                Unduh Format Template
              </button>
            </div>

            {fileName && (
              <div className="mt-3 text-xs text-emerald-600 dark:text-emerald-400 font-semibold">
                Berkas Terpilih: {fileName} ({parsedRows.length} data terbaca)
              </div>
            )}
          </div>

          {/* Preview Parsed Data */}
          {parsedRows.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h5 className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                  Pratinjau Hasil Perhitungan ({parsedRows.length} baris)
                </h5>
                <label className="inline-flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={replaceAll}
                    onChange={(e) => setReplaceAll(e.target.checked)}
                    className="rounded text-emerald-600 focus:ring-emerald-500"
                  />
                  <span>Ganti seluruh data saat ini (Replace All)</span>
                </label>
              </div>

              <div className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden max-h-56 overflow-y-auto text-xs">
                <table className="w-full text-left">
                  <thead className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-semibold sticky top-0">
                    <tr>
                      <th className="py-2 px-3">No</th>
                      <th className="py-2 px-3">Nama Pegawai</th>
                      <th className="py-2 px-3">Hadir / HK</th>
                      <th className="py-2 px-3 text-right">UKK Diterima</th>
                      <th className="py-2 px-3 text-right">Transpor Net</th>
                      <th className="py-2 px-3 text-right">Uang Makan</th>
                      <th className="py-2 px-3 text-right font-bold text-emerald-600">Grand Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                    {parsedRows.map((r, i) => (
                      <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                        <td className="py-2 px-3 text-slate-400">{i + 1}</td>
                        <td className="py-2 px-3 font-semibold">{r.name}</td>
                        <td className="py-2 px-3">{r.jumlahHadir} / {r.hariKerja}</td>
                        <td className="py-2 px-3 text-right">{formatRupiah(r.ukkDiterima)}</td>
                        <td className="py-2 px-3 text-right">{formatRupiah(r.transporDiterima)}</td>
                        <td className="py-2 px-3 text-right">{formatRupiah(r.uangMakanDiterima)}</td>
                        <td className="py-2 px-3 text-right font-bold text-emerald-600">{formatRupiah(r.grandTotal)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        <div className="px-6 py-4 bg-slate-50 dark:bg-slate-800/60 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-sm font-medium hover:bg-slate-100"
          >
            Batal
          </button>
          <button
            type="button"
            disabled={parsedRows.length === 0}
            onClick={() => onImport(parsedRows, replaceAll)}
            className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold shadow-md disabled:opacity-50"
          >
            Impor {parsedRows.length} Data Sekarang
          </button>
        </div>
      </div>
    </div>
  );
};
