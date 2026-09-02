import React, { useState, useMemo } from 'react';
import { useSalary } from '../../context/SalaryContext';
import { SalaryCalculationSource } from '../../types';
import { calculateSalaryMatrixRow } from '../../data/salaryMatrixData';
import { formatRupiah } from '../../utils/currencyFormatter';
import { EditSalaryMatrixModal } from './EditSalaryMatrixModal';
import { AddSalaryMatrixModal } from './AddSalaryMatrixModal';
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
} from 'lucide-react';

export const SalaryMatrixManagement: React.FC = () => {
  const {
    salaryMatrix,
    updateSalaryMatrixRow,
    addSalaryMatrixRow,
    deleteSalaryMatrixRow,
    importSalaryMatrix,
    updateGlobalUnitValue,
    syncMatrixToEmployeesAndSlips,
    selectedPeriod,
    getCurrentPeriodConfig,
    showToast,
  } = useSalary();

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedLevel, setSelectedLevel] = useState<string>('ALL');
  const [viewMode, setViewMode] = useState<'full' | 'basic_allowance' | 'bpjs' | 'paling_kanan'>('paling_kanan');

  // Modal states
  const [editingRow, setEditingRow] = useState<SalaryCalculationSource | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [inspectRow, setInspectRow] = useState<SalaryCalculationSource | null>(null);
  const [isUnitModalOpen, setIsUnitModalOpen] = useState<boolean>(false);
  const [newUnitValueInput, setNewUnitValueInput] = useState<number>(125000);

  // Filtered rows
  const filteredRows = useMemo(() => {
    return salaryMatrix.filter((row) => {
      const matchQuery =
        !searchQuery ||
        row.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (row.nip && row.nip.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (row.level && row.level.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (row.notes && row.notes.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchCategory =
        selectedCategory === 'ALL' || (row.category && row.category.toUpperCase() === selectedCategory.toUpperCase());

      const matchLevel = selectedLevel === 'ALL' || row.level === selectedLevel;

      return matchQuery && matchCategory && matchLevel;
    });
  }, [salaryMatrix, searchQuery, selectedCategory, selectedLevel]);

  // Aggregate Totals
  const totals = useMemo(() => {
    return filteredRows.reduce(
      (acc, r) => ({
        performanceBasicSalary: acc.performanceBasicSalary + (r.performanceBasicSalary || 0),
        positionAllowanceBasic: acc.positionAllowanceBasic + (r.positionAllowanceBasic || 0),
        bpjsKesFoundation: acc.bpjsKesFoundation + (r.bpjsKesFoundation || 0),
        bpjsKesEmployee: acc.bpjsKesEmployee + (r.bpjsKesEmployee || 0),
        bpjsKtFoundation: acc.bpjsKtFoundation + (r.bpjsKtFoundation || 0),
        bpjsKtEmployee: acc.bpjsKtEmployee + (r.bpjsKtEmployee || 0),
        dedicationAllowanceAmount: acc.dedicationAllowanceAmount + (r.dedicationAllowanceAmount || 0),
        familyAllowanceAmount: acc.familyAllowanceAmount + (r.familyAllowanceAmount || 0),
        foundationAllowanceAmount: acc.foundationAllowanceAmount + (r.foundationAllowanceAmount || 0),
        positionAllowance: acc.positionAllowance + (r.positionAllowance || 0),
        grossSalary: acc.grossSalary + (r.grossSalary || 0),
        regionalAllowanceAmount: acc.regionalAllowanceAmount + (r.regionalAllowanceAmount || 0),
        totalSalaryReceived: acc.totalSalaryReceived + (r.totalSalaryReceived || 0),
        bpjsKesDeduction: acc.bpjsKesDeduction + (r.bpjsKesDeduction || 0),
        bpjsKtDeduction: acc.bpjsKtDeduction + (r.bpjsKtDeduction || 0),
        infaqMasjid: acc.infaqMasjid + (r.infaqMasjid || 0),
        coopLoanDeduction: acc.coopLoanDeduction + (r.coopLoanDeduction || 0),
        regionalDeduction: acc.regionalDeduction + (r.regionalDeduction || 0),
        totalDeduction: acc.totalDeduction + (r.totalDeduction || 0),
        netSalaryPaid: acc.netSalaryPaid + (r.netSalaryPaid || 0),
      }),
      {
        performanceBasicSalary: 0,
        positionAllowanceBasic: 0,
        bpjsKesFoundation: 0,
        bpjsKesEmployee: 0,
        bpjsKtFoundation: 0,
        bpjsKtEmployee: 0,
        dedicationAllowanceAmount: 0,
        familyAllowanceAmount: 0,
        foundationAllowanceAmount: 0,
        positionAllowance: 0,
        grossSalary: 0,
        regionalAllowanceAmount: 0,
        totalSalaryReceived: 0,
        bpjsKesDeduction: 0,
        bpjsKtDeduction: 0,
        infaqMasjid: 0,
        coopLoanDeduction: 0,
        regionalDeduction: 0,
        totalDeduction: 0,
        netSalaryPaid: 0,
      }
    );
  }, [filteredRows]);

  // Handle Excel Export
  const handleExportExcel = () => {
    const exportData = salaryMatrix.map((r, idx) => ({
      No: idx + 1,
      NIP: r.nip || '-',
      'Nama Pegawai': r.name,
      Status: r.employeeStatus,
      Golongan: r.level,
      'Mulai Tugas': r.joinDateStr || '-',
      'Masa Kerja (Th)': r.serviceYears,
      'Masa Kerja (Bln)': r.serviceMonths,
      'Istri/Suami': r.husbandWifeCount,
      Anak: r.childCount,
      PTKP: r.taxStatus,
      'Angka Indeks': r.indexNumber,
      'Prosen Kinerja (%)': r.performancePercent,
      'Nilai Indeks Baru (Rp)': r.indexValueNew,
      'Nilai Indeks Lama (Rp)': r.indexValueOld,
      'Gapok Nilai Kinerja (Rp)': r.performanceBasicSalary,
      'Tunj. Jabatan Struktural (Rp)': r.positionAllowanceBasic,
      'BPJS Kes - Premi': r.bpjsKesPremium,
      'BPJS Kes - Pegawai (1%)': r.bpjsKesEmployee,
      'BPJS Kes - Yayasan (4%)': r.bpjsKesFoundation,
      'BPJS KT - Premi': r.bpjsKtPremium,
      'BPJS KT - Pegawai': r.bpjsKtEmployee,
      'BPJS KT - Yayasan': r.bpjsKtFoundation,
      'Tunj. Pengabdian (%)': r.dedicationAllowancePercent,
      'Tunj. Pengabdian (Rp)': r.dedicationAllowanceAmount,
      'Tunj. Keluarga (%)': r.familyAllowancePercent,
      'Tunj. Keluarga (Rp)': r.familyAllowanceAmount,
      'Tunj. Yayasan / Peralihan (%)': r.foundationAllowancePercent,
      'Tunj. Yayasan / Peralihan (Rp)': r.foundationAllowanceAmount,
      'Tunjangan Jabatan (Rp)': r.positionAllowance,
      'Gaji Kotor (Rp)': r.grossSalary,
      'Tunj. Daerah 10% (Rp)': r.regionalAllowanceAmount,
      'Jumlah Diterima (Rp)': r.totalSalaryReceived,
      'Potongan BPJS Kes (Rp)': r.bpjsKesDeduction,
      'Potongan BPJS KT (Rp)': r.bpjsKtDeduction,
      'Infaq Masjid (Rp)': r.infaqMasjid,
      'Potongan Koperasi (Rp)': r.coopLoanDeduction,
      'Potongan Daerah (Rp)': r.regionalDeduction,
      'Total Potongan (Rp)': r.totalDeduction,
      'GAJI DIBAYAR (THP)': r.netSalaryPaid,
      Keterangan: r.notes || '-',
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Skema Gaji Al Azhar');
    XLSX.writeFile(wb, `Skema_Penghitungan_Gaji_Pokok_${selectedPeriod}.xlsx`);
    showToast('File Excel skema perhitungan gaji berhasil diekspor.', 'success');
  };

  // Handle Excel Import
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const rawJson: any[] = XLSX.utils.sheet_to_json(ws);

        if (!rawJson || rawJson.length === 0) {
          showToast('File Excel kosong atau format tidak dikenali.', 'error');
          return;
        }

        const importedRows: SalaryCalculationSource[] = rawJson.map((row, idx) => {
          const name = row['Nama Pegawai'] || row['Nama'] || row['NAMA'] || `Pegawai ${idx + 1}`;
          const nip = String(row['NIP'] || row['nip'] || row['Nomor Induk'] || '').trim();
          const level = String(row['Golongan'] || row['Gol'] || row['Level'] || 'V C');
          const indexNum = parseFloat(row['Angka Indeks'] || row['Indeks'] || '22') || 22;
          const perfPercent = parseFloat(row['Prosen Kinerja (%)'] || row['Kinerja'] || '100') || 100;
          const gapok = parseFloat(row['Gapok Nilai Kinerja (Rp)'] || row['Gaji Pokok'] || '0') || (indexNum * 125000 * (perfPercent / 100));
          const netPaid = parseFloat(row['GAJI DIBAYAR (THP)'] || row['Gaji Dibayar'] || row['THP'] || '0') || gapok;

          return calculateSalaryMatrixRow({
            id: `matrix-import-${Date.now()}-${idx}`,
            nip: nip || '-',
            name: name,
            employeeStatus: row['Status'] || 'GTY',
            level: level,
            category: row['Kategori'] || 'GURU',
            joinDateStr: row['Mulai Tugas'] || '01/07/2020',
            serviceYears: parseInt(row['Masa Kerja (Th)'] || '0', 10) || 0,
            serviceMonths: parseInt(row['Masa Kerja (Bln)'] || '0', 10) || 0,
            husbandWifeCount: parseInt(row['Istri/Suami'] || '0', 10) || 0,
            childCount: parseInt(row['Anak'] || '0', 10) || 0,
            taxStatus: row['PTKP'] || 'TK/0',
            indexNumber: indexNum,
            performancePercent: perfPercent,
            indexValueNew: parseFloat(row['Nilai Indeks Baru (Rp)'] || '125000') || 125000,
            indexValueOld: parseFloat(row['Nilai Indeks Lama (Rp)'] || '123500') || 123500,
            performanceBasicSalary: gapok,
            positionAllowanceBasic: parseFloat(row['Tunj. Jabatan Struktural (Rp)'] || '0') || 0,
            bpjsKesPremium: parseFloat(row['BPJS Kes - Premi'] || '0') || 0,
            bpjsKesEmployee: parseFloat(row['BPJS Kes - Pegawai (1%)'] || '0') || 0,
            bpjsKesFoundation: parseFloat(row['BPJS Kes - Yayasan (4%)'] || '0') || 0,
            bpjsKtPremium: parseFloat(row['BPJS KT - Premi'] || '0') || 0,
            bpjsKtEmployee: parseFloat(row['BPJS KT - Pegawai'] || '0') || 0,
            bpjsKtFoundation: parseFloat(row['BPJS KT - Yayasan'] || '0') || 0,
            dedicationAllowancePercent: parseFloat(row['Tunj. Pengabdian (%)'] || '0') || 0,
            dedicationAllowanceAmount: parseFloat(row['Tunj. Pengabdian (Rp)'] || '0') || 0,
            familyAllowancePercent: parseFloat(row['Tunj. Keluarga (%)'] || '0') || 0,
            familyAllowanceAmount: parseFloat(row['Tunj. Keluarga (Rp)'] || '0') || 0,
            foundationAllowancePercent: parseFloat(row['Tunj. Yayasan / Peralihan (%)'] || '0') || 0,
            foundationAllowanceAmount: parseFloat(row['Tunj. Yayasan / Peralihan (Rp)'] || '0') || 0,
            positionAllowance: parseFloat(row['Tunjangan Jabatan (Rp)'] || '0') || 0,
            grossSalary: parseFloat(row['Gaji Kotor (Rp)'] || '0') || gapok,
            regionalAllowancePercent: 10,
            regionalAllowanceAmount: parseFloat(row['Tunj. Daerah 10% (Rp)'] || '0') || 0,
            totalSalaryReceived: parseFloat(row['Jumlah Diterima (Rp)'] || '0') || gapok,
            bpjsKesDeduction: parseFloat(row['Potongan BPJS Kes (Rp)'] || '0') || 0,
            bpjsKtDeduction: parseFloat(row['Potongan BPJS KT (Rp)'] || '0') || 0,
            infaqMasjid: parseFloat(row['Infaq Masjid (Rp)'] || '0') || 0,
            coopLoanDeduction: parseFloat(row['Potongan Koperasi (Rp)'] || '0') || 0,
            regionalDeduction: parseFloat(row['Potongan Daerah (Rp)'] || '0') || 0,
            totalDeduction: parseFloat(row['Total Potongan (Rp)'] || '0') || 0,
            netSalaryPaid: netPaid,
            notes: row['Keterangan'] || '',
            lastUpdated: new Date().toISOString(),
          });
        });

        importSalaryMatrix(importedRows);
      } catch (err: any) {
        console.error(err);
        showToast('Gagal memproses file Excel: ' + err.message, 'error');
      }
    };
    reader.readAsBinaryString(file);
    e.target.value = '';
  };

  const periodConfig = getCurrentPeriodConfig();

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* 1. Header Banner & Master Sync Action */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl border border-slate-800 relative overflow-hidden">
        {/* Subtle background glow */}
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-16 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="bg-blue-600/40 text-blue-300 border border-blue-400/30 text-[11px] font-extrabold uppercase px-3 py-1 rounded-full tracking-wider flex items-center gap-1.5 shadow-xs">
                <Calculator className="w-3.5 h-3.5" />
                Sumber Perhitungan Gaji Pokok
              </span>
              <span className="text-xs text-slate-400 font-medium font-mono">
                Periode: {periodConfig.label}
              </span>
            </div>

            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Matriks & Formula Gaji Pokok Pegawai
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Tabel master formula perhitungan gaji pokok, angka indeks, tunjangan pengabdian, keluarga, peralihan yayasan, BPJS & total <strong className="text-emerald-300">Gaji Dibayar (Tabel Paling Kanan)</strong>. Semua nilai dapat diedit secara manual dan disinkronkan ke master pegawai & slip gaji.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => {
                const currentVal = salaryMatrix[0]?.unitValue || 125000;
                setNewUnitValueInput(currentVal);
                setIsUnitModalOpen(true);
              }}
              className="px-3.5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl transition-all shadow-md shadow-amber-500/20 flex items-center gap-2"
              title="Ubah Angka Satuan Gaji (Misal: Rp 125.000) dan Perbarui Semua Perhitungan Otomatis"
            >
              <Percent className="w-4 h-4" />
              <span>Ubah Satuan Indeks Masal</span>
            </button>

            <button
              onClick={syncMatrixToEmployeesAndSlips}
              className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs rounded-xl transition-all shadow-lg shadow-emerald-500/20 flex items-center gap-2"
              title="Perbarui Gaji Pokok & Tunjangan di Data Pegawai dan Slip Gaji sesuai Matriks Ini"
            >
              <ArrowRightLeft className="w-4 h-4" />
              <span>Sinkronkan ke Slip & Master Pegawai</span>
            </button>

            <button
              onClick={() => setIsAddModalOpen(true)}
              className="px-3.5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl transition-all shadow-md shadow-blue-600/30 flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Baris Pegawai</span>
            </button>

            <label className="px-3.5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold text-xs rounded-xl transition-all cursor-pointer flex items-center gap-2">
              <Upload className="w-4 h-4" />
              <span>Impor Excel</span>
              <input
                type="file"
                accept=".xlsx, .xls"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>

            <button
              onClick={handleExportExcel}
              className="px-3.5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold text-xs rounded-xl transition-all flex items-center gap-2"
              title="Download Excel Matriks Perhitungan Lengkap"
            >
              <Download className="w-4 h-4" />
              <span>Ekspor Excel</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Key Aggregate Summary Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
        {/* Total Gapok Kinerja */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
            Total Gapok Kinerja
          </span>
          <div>
            <span className="text-base sm:text-lg font-black font-mono text-blue-700 block">
              {formatRupiah(totals.performanceBasicSalary)}
            </span>
            <span className="text-[10px] text-slate-500 font-medium">
              {filteredRows.length} Pegawai Terdata
            </span>
          </div>
        </div>

        {/* Total Tunjangan Yayasan */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
            Total Tunjangan Yayasan
          </span>
          <div>
            <span className="text-base sm:text-lg font-black font-mono text-purple-700 block">
              {formatRupiah(
                totals.dedicationAllowanceAmount +
                  totals.familyAllowanceAmount +
                  totals.foundationAllowanceAmount +
                  totals.positionAllowance
              )}
            </span>
            <span className="text-[10px] text-purple-600 font-medium">
              Pengabdian, Kel, Jabatan
            </span>
          </div>
        </div>

        {/* Total Subsidi BPJS Yayasan */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
            Total Subsidi BPJS (Yayasan)
          </span>
          <div>
            <span className="text-base sm:text-lg font-black font-mono text-teal-700 block">
              {formatRupiah(totals.bpjsKesFoundation + totals.bpjsKtFoundation)}
            </span>
            <span className="text-[10px] text-teal-600 font-medium">
              Kes: {formatRupiah(totals.bpjsKesFoundation)} | KT: {formatRupiah(totals.bpjsKtFoundation)}
            </span>
          </div>
        </div>

        {/* Total Potongan Pegawai */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
            Total Seluruh Potongan
          </span>
          <div>
            <span className="text-base sm:text-lg font-black font-mono text-rose-700 block">
              {formatRupiah(totals.totalDeduction)}
            </span>
            <span className="text-[10px] text-rose-600 font-medium">
              BPJS, Infaq, Koperasi
            </span>
          </div>
        </div>

        {/* TOTAL GAJI DIBAYAR (TABEL PALING KANAN) */}
        <div className="col-span-2 sm:col-span-1 bg-gradient-to-br from-emerald-600 to-emerald-700 text-white p-4 rounded-2xl shadow-md flex flex-col justify-between border border-emerald-500">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-extrabold text-emerald-100 uppercase tracking-wider block">
              TOTAL GAJI DIBAYAR (THP)
            </span>
            <span className="bg-white/20 text-white text-[9px] font-black px-1.5 py-0.5 rounded">
              TABEL KANAN
            </span>
          </div>
          <div>
            <span className="text-lg sm:text-xl font-black font-mono text-white block">
              {formatRupiah(totals.netSalaryPaid)}
            </span>
            <span className="text-[10px] text-emerald-100 font-medium">
              Total Bersih yang Ditransfer
            </span>
          </div>
        </div>
      </div>

      {/* 3. Filter & View Mode Controls */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 space-y-3 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* View Mode Switcher */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl overflow-x-auto text-xs font-bold">
            <button
              onClick={() => setViewMode('paling_kanan')}
              className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-all flex items-center gap-1.5 ${
                viewMode === 'paling_kanan'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Award className="w-3.5 h-3.5" />
              <span>Gaji Dibayar (Tabel Paling Kanan)</span>
            </button>

            <button
              onClick={() => setViewMode('basic_allowance')}
              className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-all flex items-center gap-1.5 ${
                viewMode === 'basic_allowance'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Gapok & Tunjangan Yayasan</span>
            </button>

            <button
              onClick={() => setViewMode('bpjs')}
              className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-all flex items-center gap-1.5 ${
                viewMode === 'bpjs'
                  ? 'bg-teal-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>BPJS Kes & Ketenagakerjaan</span>
            </button>

            <button
              onClick={() => setViewMode('full')}
              className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-all flex items-center gap-1.5 ${
                viewMode === 'full'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Matriks Lengkap (Semua Kolom PDF)</span>
            </button>
          </div>

          {/* Search Box */}
          <div className="flex items-center gap-2">
            <div className="relative flex-1 sm:w-64">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Cari Nama, NIP, Golongan..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-1.5 text-xs font-medium border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Category Filter */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="text-xs font-semibold px-3 py-1.5 border border-slate-200 rounded-xl bg-white text-slate-700"
            >
              <option value="ALL">Semua Kategori</option>
              <option value="GURU">Guru</option>
              <option value="TATA USAHA">Tata Usaha</option>
              <option value="JANITOR">Janitor</option>
              <option value="SECURITY">Security</option>
            </select>
          </div>
        </div>
      </div>

      {/* 4. The Master Interactive Salary Matrix Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              {/* Top Tier Header */}
              <tr className="bg-slate-900 text-white text-[11px] font-bold uppercase tracking-wider border-b border-slate-800">
                <th className="py-3 px-3 w-10 text-center">No</th>
                <th className="py-3 px-4 min-w-[200px]">Data Pegawai</th>
                <th className="py-3 px-3 text-center">Golongan</th>
                <th className="py-3 px-3 text-center">Indeks</th>

                {(viewMode === 'full' || viewMode === 'basic_allowance') && (
                  <>
                    <th className="py-3 px-3 text-right">Nilai Indeks</th>
                    <th className="py-3 px-3 text-right text-blue-300">Gapok Kinerja</th>
                    <th className="py-3 px-3 text-right">Tunj. Pengabdian</th>
                    <th className="py-3 px-3 text-right">Tunj. Keluarga</th>
                    <th className="py-3 px-3 text-right">Tunj. Yayasan</th>
                    <th className="py-3 px-3 text-right">Tunj. Jabatan</th>
                  </>
                )}

                {(viewMode === 'full' || viewMode === 'bpjs') && (
                  <>
                    <th className="py-3 px-3 text-right text-teal-300">BPJS Kes (Yayasan)</th>
                    <th className="py-3 px-3 text-right text-teal-200">BPJS Kes (Pegawai)</th>
                    <th className="py-3 px-3 text-right text-indigo-300">BPJS KT (Yayasan)</th>
                    <th className="py-3 px-3 text-right text-indigo-200">BPJS KT (Pegawai)</th>
                  </>
                )}

                <th className="py-3 px-3 text-right">Gaji Kotor</th>
                <th className="py-3 px-3 text-right text-amber-300">Tunj. Daerah 10%</th>
                <th className="py-3 px-3 text-right text-rose-300">Total Potongan</th>

                {/* HIGHLIGHTED TABEL PALING KANAN */}
                <th className="py-3 px-4 text-right bg-emerald-700 text-white font-black">
                  GAJI DIBAYAR (THP)
                </th>

                <th className="py-3 px-3 text-center w-24">Aksi</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {filteredRows.length === 0 ? (
                <tr>
                  <td colSpan={18} className="py-12 text-center text-slate-400">
                    <Info className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p className="text-xs font-semibold">Tidak ada data pegawai yang cocok dengan filter pencarian.</p>
                  </td>
                </tr>
              ) : (
                filteredRows.map((row, idx) => (
                  <tr
                    key={row.id}
                    className="hover:bg-blue-50/40 transition-colors group"
                  >
                    <td className="py-2.5 px-3 text-center text-slate-400 font-mono text-[11px]">
                      {idx + 1}
                    </td>

                    {/* Employee Identity */}
                    <td className="py-2.5 px-4">
                      <div className="flex items-center gap-2">
                        <div>
                          <span className="font-bold text-slate-900 hover:text-blue-600 transition-colors block">
                            {row.name}
                          </span>
                          <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-mono">
                            <span>NIP: {row.nip || '-'}</span>
                            <span>•</span>
                            <span className="text-slate-500 font-bold">{row.employeeStatus}</span>
                            {row.notes && <span>• {row.notes}</span>}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Level */}
                    <td className="py-2.5 px-3 text-center">
                      <span className="inline-block px-2 py-0.5 rounded-md bg-slate-100 text-slate-800 font-mono text-[11px] font-bold">
                        {row.level}
                      </span>
                    </td>

                    {/* Index */}
                    <td className="py-2.5 px-3 text-center font-mono font-bold text-blue-700">
                      {row.indexNumber}
                      <span className="text-[10px] text-slate-400 block font-normal">
                        {row.performancePercent}%
                      </span>
                    </td>

                    {/* Basic & Allowance columns */}
                    {(viewMode === 'full' || viewMode === 'basic_allowance') && (
                      <>
                        <td className="py-2.5 px-3 text-right font-mono text-[11px]">
                          {formatRupiah(row.indexValueNew)}
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono font-bold text-blue-700">
                          {formatRupiah(row.performanceBasicSalary)}
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono text-[11px]">
                          {formatRupiah(row.dedicationAllowanceAmount)}
                          <span className="text-[9px] text-slate-400 block">({row.dedicationAllowancePercent}%)</span>
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono text-[11px]">
                          {formatRupiah(row.familyAllowanceAmount)}
                          <span className="text-[9px] text-slate-400 block">({row.familyAllowancePercent}%)</span>
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono text-[11px]">
                          {formatRupiah(row.foundationAllowanceAmount)}
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono text-[11px]">
                          {formatRupiah(row.positionAllowance)}
                        </td>
                      </>
                    )}

                    {/* BPJS Columns */}
                    {(viewMode === 'full' || viewMode === 'bpjs') && (
                      <>
                        <td className="py-2.5 px-3 text-right font-mono text-[11px] text-teal-700">
                          {formatRupiah(row.bpjsKesFoundation)}
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono text-[11px] text-teal-800">
                          {formatRupiah(row.bpjsKesEmployee)}
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono text-[11px] text-indigo-700">
                          {formatRupiah(row.bpjsKtFoundation)}
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono text-[11px] text-indigo-800">
                          {formatRupiah(row.bpjsKtEmployee)}
                        </td>
                      </>
                    )}

                    {/* Gaji Kotor */}
                    <td className="py-2.5 px-3 text-right font-mono font-semibold text-slate-800">
                      {formatRupiah(row.grossSalary)}
                    </td>

                    {/* Tunjangan Daerah */}
                    <td className="py-2.5 px-3 text-right font-mono text-[11px] text-amber-700">
                      {formatRupiah(row.regionalAllowanceAmount)}
                    </td>

                    {/* Total Potongan */}
                    <td className="py-2.5 px-3 text-right font-mono font-bold text-rose-700">
                      {formatRupiah(row.totalDeduction)}
                    </td>

                    {/* TABEL PALING KANAN: GAJI DIBAYAR */}
                    <td className="py-2.5 px-4 text-right font-mono font-black text-sm text-emerald-900 bg-emerald-50/80 border-l border-emerald-200">
                      {formatRupiah(row.netSalaryPaid)}
                    </td>

                    {/* Action buttons */}
                    <td className="py-2.5 px-3 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => setEditingRow(row)}
                          className="p-1.5 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                          title="Edit Manual Nilai & Formula Perhitungan"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setInspectRow(row)}
                          className="p-1.5 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                          title="Rincian Komponen Lengkap"
                        >
                          <FileText className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            if (window.confirm(`Yakin ingin menghapus skema perhitungan untuk ${row.name}?`)) {
                              deleteSalaryMatrixRow(row.id);
                            }
                          }}
                          className="p-1.5 text-rose-500 hover:bg-rose-100 rounded-lg transition-colors"
                          title="Hapus Baris"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>

            {/* Table Footer Totals */}
            <tfoot className="bg-slate-900 text-white font-mono font-bold text-xs border-t-2 border-slate-700">
              <tr>
                <td colSpan={4} className="py-3 px-4 text-left font-sans font-black uppercase tracking-wider">
                  TOTAL REKAPITULASI ({filteredRows.length} PEGAWAI)
                </td>

                {(viewMode === 'full' || viewMode === 'basic_allowance') && (
                  <>
                    <td className="py-3 px-3 text-right text-slate-400">-</td>
                    <td className="py-3 px-3 text-right text-blue-300 font-black">
                      {formatRupiah(totals.performanceBasicSalary)}
                    </td>
                    <td className="py-3 px-3 text-right">
                      {formatRupiah(totals.dedicationAllowanceAmount)}
                    </td>
                    <td className="py-3 px-3 text-right">
                      {formatRupiah(totals.familyAllowanceAmount)}
                    </td>
                    <td className="py-3 px-3 text-right">
                      {formatRupiah(totals.foundationAllowanceAmount)}
                    </td>
                    <td className="py-3 px-3 text-right">
                      {formatRupiah(totals.positionAllowance)}
                    </td>
                  </>
                )}

                {(viewMode === 'full' || viewMode === 'bpjs') && (
                  <>
                    <td className="py-3 px-3 text-right text-teal-300">
                      {formatRupiah(totals.bpjsKesFoundation)}
                    </td>
                    <td className="py-3 px-3 text-right text-teal-200">
                      {formatRupiah(totals.bpjsKesEmployee)}
                    </td>
                    <td className="py-3 px-3 text-right text-indigo-300">
                      {formatRupiah(totals.bpjsKtFoundation)}
                    </td>
                    <td className="py-3 px-3 text-right text-indigo-200">
                      {formatRupiah(totals.bpjsKtEmployee)}
                    </td>
                  </>
                )}

                <td className="py-3 px-3 text-right font-black">
                  {formatRupiah(totals.grossSalary)}
                </td>
                <td className="py-3 px-3 text-right text-amber-300">
                  {formatRupiah(totals.regionalAllowanceAmount)}
                </td>
                <td className="py-3 px-3 text-right text-rose-300 font-black">
                  {formatRupiah(totals.totalDeduction)}
                </td>

                {/* TOTAL GAJI DIBAYAR PALING KANAN */}
                <td className="py-3 px-4 text-right bg-emerald-600 text-white font-black text-sm">
                  {formatRupiah(totals.netSalaryPaid)}
                </td>

                <td className="py-3 px-3 text-center">-</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* 5. Formula Explanation Guide Card */}
      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 text-xs text-slate-700 space-y-3">
        <div className="flex items-center gap-2 font-bold text-slate-900">
          <Info className="w-4 h-4 text-blue-600" />
          <span>Panduan Formula Perhitungan Sumber Gaji Pokok Yayasan Al Azhar</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-[11px]">
          <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-1">
            <span className="font-bold text-blue-700 block">1. Gapok Nilai Kinerja</span>
            <p className="font-mono text-slate-600">
              = (Indeks × Rp 125.000) × (Kinerja %)
            </p>
          </div>
          <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-1">
            <span className="font-bold text-purple-700 block">2. Tunjangan Yayasan</span>
            <p className="font-mono text-slate-600">
              = Pengabdian % + Keluarga % + Peralihan % + Jabatan
            </p>
          </div>
          <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-1">
            <span className="font-bold text-amber-700 block">3. Tunjangan Daerah 10%</span>
            <p className="font-mono text-slate-600">
              = 10% × Gaji Kotor
            </p>
          </div>
          <div className="p-3 bg-white rounded-xl border border-emerald-200 bg-emerald-50/50 space-y-1">
            <span className="font-bold text-emerald-800 block">4. Gaji Dibayar (THP)</span>
            <p className="font-mono text-emerald-900 font-bold">
              = (Gaji Kotor + Tunj. Daerah) - Total Potongan
            </p>
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      {editingRow && (
        <EditSalaryMatrixModal
          data={editingRow}
          isOpen={!!editingRow}
          onClose={() => setEditingRow(null)}
          onSave={(updated) => updateSalaryMatrixRow(updated)}
        />
      )}

      {/* Add Modal */}
      {isAddModalOpen && (
        <AddSalaryMatrixModal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          onAdd={(newRow) => addSalaryMatrixRow(newRow)}
        />
      )}

      {/* Inspect Row Modal */}
      {inspectRow && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div>
                <h3 className="font-black text-base text-slate-900">{inspectRow.name}</h3>
                <p className="text-xs text-slate-500 font-mono">
                  NIP: {inspectRow.nip} • {inspectRow.employeeStatus} • Gol: {inspectRow.level}
                </p>
              </div>
              <button
                onClick={() => setInspectRow(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl space-y-1">
                <span className="text-[10px] text-slate-400 uppercase font-bold">Gaji Pokok Kinerja</span>
                <span className="font-bold font-mono text-blue-700 block">
                  {formatRupiah(inspectRow.performanceBasicSalary)}
                </span>
                <span className="text-[10px] text-slate-500">
                  Indeks: {inspectRow.indexNumber} × Rp 125.000 × {inspectRow.performancePercent}%
                </span>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl space-y-1">
                <span className="text-[10px] text-slate-400 uppercase font-bold">Tunjangan Jabatan</span>
                <span className="font-bold font-mono text-purple-700 block">
                  {formatRupiah(inspectRow.positionAllowance)}
                </span>
                <span className="text-[10px] text-slate-500">
                  Struktural: {formatRupiah(inspectRow.positionAllowanceBasic)}
                </span>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl space-y-1">
                <span className="text-[10px] text-slate-400 uppercase font-bold">Tunj. Pengabdian ({inspectRow.dedicationAllowancePercent}%)</span>
                <span className="font-bold font-mono text-slate-800 block">
                  {formatRupiah(inspectRow.dedicationAllowanceAmount)}
                </span>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl space-y-1">
                <span className="text-[10px] text-slate-400 uppercase font-bold">Tunj. Keluarga ({inspectRow.familyAllowancePercent}%)</span>
                <span className="font-bold font-mono text-slate-800 block">
                  {formatRupiah(inspectRow.familyAllowanceAmount)}
                </span>
              </div>

              <div className="p-3 bg-teal-50 rounded-xl space-y-1">
                <span className="text-[10px] text-teal-800 uppercase font-bold">BPJS Kes (Yayasan 4% / Peg 1%)</span>
                <span className="font-mono text-teal-900 block font-bold">
                  {formatRupiah(inspectRow.bpjsKesFoundation)} / {formatRupiah(inspectRow.bpjsKesEmployee)}
                </span>
              </div>

              <div className="p-3 bg-indigo-50 rounded-xl space-y-1">
                <span className="text-[10px] text-indigo-800 uppercase font-bold">BPJS KT (Yayasan / Peg)</span>
                <span className="font-mono text-indigo-900 block font-bold">
                  {formatRupiah(inspectRow.bpjsKtFoundation)} / {formatRupiah(inspectRow.bpjsKtEmployee)}
                </span>
              </div>

              <div className="p-3 bg-rose-50 rounded-xl space-y-1">
                <span className="text-[10px] text-rose-700 uppercase font-bold">Total Potongan</span>
                <span className="font-bold font-mono text-rose-700 block">
                  {formatRupiah(inspectRow.totalDeduction)}
                </span>
                <span className="text-[10px] text-slate-500">
                  Infaq: {formatRupiah(inspectRow.infaqMasjid)} | Kop: {formatRupiah(inspectRow.coopLoanDeduction)}
                </span>
              </div>

              <div className="p-3 bg-emerald-500 text-white rounded-xl space-y-1 flex flex-col justify-between">
                <span className="text-[10px] text-emerald-100 uppercase font-black">GAJI DIBAYAR (THP)</span>
                <span className="font-black font-mono text-base block">
                  {formatRupiah(inspectRow.netSalaryPaid)}
                </span>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => {
                  const target = inspectRow;
                  setInspectRow(null);
                  setEditingRow(target);
                }}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5"
              >
                <Edit2 className="w-3.5 h-3.5" />
                <span>Edit Data Pegawai Ini</span>
              </button>
              <button
                onClick={() => setInspectRow(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 6. MODAL UBAH SATUAN INDEKS GAJI MASAL */}
      {isUnitModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-5 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-50 border border-amber-200 text-amber-700 flex items-center justify-center font-bold">
                  <Percent className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Ubah Angka Satuan Gaji</h3>
                  <p className="text-xs text-slate-500">Perbarui nilai satuan untuk seluruh 51 pegawai</p>
                </div>
              </div>
              <button
                onClick={() => setIsUnitModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 bg-amber-50/60 border border-amber-200/80 rounded-2xl text-xs text-amber-900 space-y-2">
              <p className="font-semibold">
                💡 Bagaimana Rumus Bekerja:
              </p>
              <p className="text-slate-700 leading-relaxed">
                Mengubah angka satuan (misal dari <span className="font-bold font-mono">Rp 125.000</span> menjadi <span className="font-bold font-mono">{formatRupiah(newUnitValueInput)}</span>) akan langsung memicu penghitungan ulang otomatis pada:
              </p>
              <ul className="list-disc pl-5 space-y-1 text-slate-600">
                <li>Gaji Pokok Satuan (Angka Indeks × Satuan Baru)</li>
                <li>Gaji Pokok Kinerja (% Kinerja × Gaji Pokok Satuan)</li>
                <li>Tunjangan Pengabdian & Keluarga (auto % × Gaji Kinerja)</li>
                <li>BPJS Yayasan & Pegawai</li>
                <li>Gaji Pokok yang Dibayarkan (Tabel Paling Kanan)</li>
              </ul>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Nominal Satuan Gaji Baru (Rp)
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-400">
                  Rp
                </span>
                <input
                  type="number"
                  min={1000}
                  step={1000}
                  value={newUnitValueInput}
                  onChange={(e) => setNewUnitValueInput(Number(e.target.value) || 0)}
                  className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-base font-bold text-slate-900 font-mono focus:ring-2 focus:ring-amber-500 focus:bg-white transition-all outline-hidden"
                />
              </div>
              <p className="text-[11px] text-slate-500 mt-1.5 flex items-center justify-between">
                <span>Nilai terbaca:</span>
                <span className="font-bold text-slate-900 font-mono">{formatRupiah(newUnitValueInput)}</span>
              </p>
            </div>

            <div className="flex justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setIsUnitModalOpen(false)}
                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => {
                  updateGlobalUnitValue(newUnitValueInput);
                  setIsUnitModalOpen(false);
                }}
                className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs transition-all shadow-md shadow-amber-500/20 flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Terapkan Satuan Baru ke Semua</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
