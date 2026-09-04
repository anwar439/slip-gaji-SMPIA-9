import React, { useState, useMemo } from 'react';
import { useSalary } from '../../context/SalaryContext';
import { UkkAdjustmentRecord } from '../../types';
import {
  Search,
  Plus,
  Download,
  Upload,
  RefreshCw,
  Edit2,
  Trash2,
  CheckCircle,
  FileSpreadsheet,
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
  Building2,
  CreditCard,
  UserCheck,
  AlertCircle,
  X,
  Save,
  RotateCcw,
} from 'lucide-react';
import * as XLSX from 'xlsx';

export const UkkAdjustmentManagement: React.FC = () => {
  const {
    ukkAdjustmentRecords,
    updateUkkAdjustmentRow,
    addUkkAdjustmentRow,
    deleteUkkAdjustmentRow,
    importUkkAdjustmentRecords,
    resetUkkAdjustmentsToDefault,
    syncUkkAdjustmentsToSlips,
    autoSyncFromTransportUkk,
    selectedPeriod,
    availablePeriods,
    setSelectedPeriod,
    employees,
    transportUkkRecords,
    showToast,
  } = useSalary();

  const [searchTerm, setSearchTerm] = useState('');
  const [editingRowId, setEditingRowId] = useState<string | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedRecordForModal, setSelectedRecordForModal] = useState<UkkAdjustmentRecord | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [selectedEmpIdForAdd, setSelectedEmpIdForAdd] = useState<string>('');

  const handleSelectEmployeeForAdd = (empId: string) => {
    setSelectedEmpIdForAdd(empId);
    const emp = employees.find((e) => e.id === empId);
    if (!emp) return;

    // Check if employee has existing transport UKK record
    const cleanEmpName = emp.name.toLowerCase().trim();
    const cleanEmpNip = (emp.nip || '').trim();
    const foundUkk = transportUkkRecords.find((u) => {
      if (cleanEmpNip && u.nip && u.nip.trim() === cleanEmpNip) return true;
      if (u.name && u.name.toLowerCase().trim() === cleanEmpName) return true;
      return false;
    });

    const isWaliKelas = (emp.position || '').toLowerCase().includes('wali kelas');
    const isPimpinan = (emp.position || '').toLowerCase().includes('kepala') || (emp.position || '').toLowerCase().includes('wakil');

    setNewFormData((prev) => ({
      ...prev,
      name: emp.name,
      nip: emp.nip || '',
      bankAccountNumber: emp.accountNumber || '',
      bankName: emp.bankName || 'BSI',
      ukkTransportMakan: foundUkk ? (foundUkk.totalDiterimaUkk || foundUkk.transportUkkDiterima || 0) : prev.ukkTransportMakan || 0,
      tunjanganWaliKelas: isWaliKelas ? 350000 : 0,
      tunjanganStaffPimpinan: isPimpinan ? 1000000 : 0,
      notes: `Pegawai: ${emp.position} (${emp.department})`,
    }));
  };

  // Form state for Add Modal
  const [newFormData, setNewFormData] = useState<Partial<UkkAdjustmentRecord>>({
    nip: '',
    bankAccountNumber: '',
    bankName: 'BSI',
    name: '',
    ukkTransportMakan: 0,
    tunjanganWaliKelas: 0,
    tunjanganStaffPimpinan: 0,
    tunjanganLain: 0,
    potonganKesra: 0,
    potonganKoperasiYpi: 0,
    potonganKoperasiYwam: 0,
    potonganYwAmjp: 0,
    potonganLain: 0,
    notes: '',
  });

  // Filtered rows
  const filteredRecords = useMemo(() => {
    return ukkAdjustmentRecords.filter((record) => {
      const matchSearch =
        searchTerm === '' ||
        record.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.nip.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (record.bankAccountNumber && record.bankAccountNumber.includes(searchTerm));
      return matchSearch;
    });
  }, [ukkAdjustmentRecords, searchTerm]);

  // Aggregate Totals
  const totals = useMemo(() => {
    return ukkAdjustmentRecords.reduce(
      (acc, r) => {
        acc.ukkTransportMakan += Number(r.ukkTransportMakan) || 0;
        acc.tunjanganWaliKelas += Number(r.tunjanganWaliKelas) || 0;
        acc.tunjanganStaffPimpinan += Number(r.tunjanganStaffPimpinan) || 0;
        acc.tunjanganLain += Number(r.tunjanganLain) || 0;
        acc.totalPenambahan += Number(r.totalPenambahan) || 0;
        acc.potonganKesra += Number(r.potonganKesra) || 0;
        acc.potonganKoperasiYpi += Number(r.potonganKoperasiYpi) || 0;
        acc.potonganKoperasiYwam += Number(r.potonganKoperasiYwam) || 0;
        acc.potonganYwAmjp += Number(r.potonganYwAmjp) || 0;
        acc.potonganLain += Number(r.potonganLain) || 0;
        acc.totalPotongan += Number(r.totalPotongan) || 0;
        acc.jumlahDiterima += Number(r.jumlahDiterima) || 0;
        return acc;
      },
      {
        ukkTransportMakan: 0,
        tunjanganWaliKelas: 0,
        tunjanganStaffPimpinan: 0,
        tunjanganLain: 0,
        totalPenambahan: 0,
        potonganKesra: 0,
        potonganKoperasiYpi: 0,
        potonganKoperasiYwam: 0,
        potonganYwAmjp: 0,
        potonganLain: 0,
        totalPotongan: 0,
        jumlahDiterima: 0,
      }
    );
  }, [ukkAdjustmentRecords]);

  // Inline Cell Edit Handler
  const handleCellChange = (id: string, field: keyof UkkAdjustmentRecord, value: string | number) => {
    let numericVal = typeof value === 'string' ? parseFloat(value.replace(/[^0-9.-]+/g, '')) || 0 : value;
    updateUkkAdjustmentRow(id, { [field]: numericVal });
  };

  // Sync to Slips
  const handleSyncToSlips = () => {
    setIsSyncing(true);
    setTimeout(() => {
      const result = syncUkkAdjustmentsToSlips(selectedPeriod);
      setIsSyncing(false);
      showToast(
        `Sukses! ${result.syncedCount} Slip Gaji berhasil diperbarui dengan penyesuaian UKK & nomor rekening.`,
        'success'
      );
    }, 400);
  };

  // Auto sync from Transport & UKK
  const handleAutoPullFromTransportUkk = () => {
    const result = autoSyncFromTransportUkk(selectedPeriod);
    showToast(
      `Sukses menarik nilai UKK/Transport/Makan untuk ${result.updatedCount} pegawai.`,
      'success'
    );
  };

  // Export to Excel
  const handleExportExcel = () => {
    const dataForExport = ukkAdjustmentRecords.map((r, idx) => ({
      NO: r.no || idx + 1,
      NIK: r.nip,
      'NO. REKENING': r.bankAccountNumber,
      'BANK PENYALUR': r.bankName || 'BSI',
      'NAMA PEGAWAI': r.name,
      'UKK, TRANPORT, U.MAKAN': r.ukkTransportMakan,
      'TUNJANGAN WALI KELAS': r.tunjanganWaliKelas,
      'TUNJANGAN STAFF PIMP': r.tunjanganStaffPimpinan,
      'TUNJANGAN LAIN': r.tunjanganLain || 0,
      'JUMLAH (PENAMBAHAN)': r.totalPenambahan,
      'KESRA (7114044584)': r.potonganKesra,
      'KOPERASI YPI (7210808088)': r.potonganKoperasiYpi,
      'KOPERASI YWAM (7210808088)': r.potonganKoperasiYwam,
      'YW AMJP (8980008003)': r.potonganYwAmjp,
      'POTONGAN LAIN': r.potonganLain || 0,
      'TOTAL POTONGAN': r.totalPotongan,
      'JUMLAH DITERIMA': r.jumlahDiterima,
    }));

    // Add totals row
    dataForExport.push({
      NO: 'TOTAL' as any,
      NIK: '',
      'NO. REKENING': '',
      'BANK PENYALUR': '',
      'NAMA PEGAWAI': `${ukkAdjustmentRecords.length} Pegawai`,
      'UKK, TRANPORT, U.MAKAN': totals.ukkTransportMakan,
      'TUNJANGAN WALI KELAS': totals.tunjanganWaliKelas,
      'TUNJANGAN STAFF PIMP': totals.tunjanganStaffPimpinan,
      'TUNJANGAN LAIN': totals.tunjanganLain,
      'JUMLAH (PENAMBAHAN)': totals.totalPenambahan,
      'KESRA (7114044584)': totals.potonganKesra,
      'KOPERASI YPI (7210808088)': totals.potonganKoperasiYpi,
      'KOPERASI YWAM (7210808088)': totals.potonganKoperasiYwam,
      'YW AMJP (8980008003)': totals.potonganYwAmjp,
      'POTONGAN LAIN': totals.potonganLain,
      'TOTAL POTONGAN': totals.totalPotongan,
      'JUMLAH DITERIMA': totals.jumlahDiterima,
    });

    const worksheet = XLSX.utils.json_to_sheet(dataForExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Tunjangan_Potongan_UKK');
    XLSX.writeFile(workbook, `Tunjangan_Potongan_UKK_${selectedPeriod}.xlsx`);
    showToast('File Excel Tunjangan & Potongan UKK berhasil diunduh.', 'success');
  };

  // Import from Excel
  const handleImportExcel = (e: React.ChangeEvent<HTMLInputElement>) => {
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
          showToast('File Excel kosong atau tidak valid.', 'error');
          return;
        }

        const parsedRecords: Partial<UkkAdjustmentRecord>[] = [];

        rawJson.forEach((row, idx) => {
          // Skip summary row if any
          const nipVal = String(row['NIK'] || row['nip'] || row['NIP'] || '').trim();
          const nameVal = String(row['NAMA PEGAWAI'] || row['nama'] || row['name'] || row['Nama'] || '').trim();
          if (!nameVal || nipVal.toLowerCase() === 'total' || nameVal.toLowerCase().includes('total')) return;

          parsedRecords.push({
            id: `adj-imp-${Date.now()}-${idx}`,
            no: Number(row['NO'] || row['no']) || idx + 1,
            nip: nipVal,
            bankAccountNumber: String(row['NO. REKENING'] || row['rekening'] || row['No Rekening'] || '').trim(),
            bankName: String(row['BANK PENYALUR'] || row['bank'] || 'BSI').trim(),
            name: nameVal,
            ukkTransportMakan: Number(row['UKK, TRANPORT, U.MAKAN'] || row['ukkTransportMakan'] || 0),
            tunjanganWaliKelas: Number(row['TUNJANGAN WALI KELAS'] || row['tunjanganWaliKelas'] || 0),
            tunjanganStaffPimpinan: Number(row['TUNJANGAN STAFF PIMP'] || row['tunjanganStaffPimpinan'] || 0),
            tunjanganLain: Number(row['TUNJANGAN LAIN'] || row['tunjanganLain'] || 0),
            potonganKesra: Number(row['KESRA (7114044584)'] || row['potonganKesra'] || row['KESRA'] || 0),
            potonganKoperasiYpi: Number(row['KOPERASI YPI (7210808088)'] || row['potonganKoperasiYpi'] || row['KOP YPI'] || 0),
            potonganKoperasiYwam: Number(row['KOPERASI YWAM (7210808088)'] || row['potonganKoperasiYwam'] || row['KOP YWAM'] || 0),
            potonganYwAmjp: Number(row['YW AMJP (8980008003)'] || row['potonganYwAmjp'] || row['YW AMJP'] || 0),
            potonganLain: Number(row['POTONGAN LAIN'] || row['potonganLain'] || 0),
            period: selectedPeriod,
          });
        });

        if (parsedRecords.length > 0) {
          importUkkAdjustmentRecords(parsedRecords as UkkAdjustmentRecord[], true);
        } else {
          showToast('Tidak ada baris data valid yang ditemukan.', 'error');
        }
      } catch (err) {
        console.error(err);
        showToast('Gagal memproses file Excel. Pastikan format kolom sesuai.', 'error');
      }
    };
    reader.readAsBinaryString(file);
    e.target.value = '';
  };

  const formatRp = (num: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(num || 0);
  };

  const handleSaveDetailModal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRecordForModal) return;
    updateUkkAdjustmentRow(selectedRecordForModal.id, selectedRecordForModal);
    setIsDetailModalOpen(false);
    setSelectedRecordForModal(null);
  };

  const handleSaveAddModal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFormData.name || !newFormData.nip) {
      showToast('Nama dan NIK/NIP wajib diisi.', 'error');
      return;
    }
    addUkkAdjustmentRow(newFormData);
    setIsAddModalOpen(false);
    setNewFormData({
      nip: '',
      bankAccountNumber: '',
      bankName: 'BSI',
      name: '',
      ukkTransportMakan: 0,
      tunjanganWaliKelas: 0,
      tunjanganStaffPimpinan: 0,
      tunjanganLain: 0,
      potonganKesra: 0,
      potonganKoperasiYpi: 0,
      potonganKoperasiYwam: 0,
      potonganYwAmjp: 0,
      potonganLain: 0,
      notes: '',
    });
  };

  return (
    <div className="space-y-6 pb-12" id="ukk-adjustment-management-page">
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 text-xs font-semibold bg-emerald-100 text-emerald-800 rounded-full">
              Penyesuaian UKK & Tunjangan
            </span>
            <span className="text-xs text-slate-500 font-medium">
              SMP Islam Al Azhar 9
            </span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Tunjangan & Potongan Tambahan UKK
          </h1>
          <p className="text-sm text-slate-600 mt-1 max-w-3xl leading-relaxed">
            Kelola penambahan tunjangan (Wali Kelas, Staff Pimpinan) serta potongan wajib (Koperasi YPI, Koperasi YWAM, Kesra, YW AMJP) yang langsung memperbarui <strong>Grand Total UKK Diterima</strong> dan <strong>Slip Gaji Akhir Pegawai</strong>.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center gap-2 bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200">
            <span className="text-xs font-semibold text-slate-600">Periode:</span>
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="bg-transparent text-xs font-bold text-slate-800 focus:outline-none cursor-pointer"
            >
              {availablePeriods.map((p) => (
                <option key={p.value} value={p.value}>
                  {p.label}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={handleAutoPullFromTransportUkk}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-xl transition-all shadow-2xs"
            title="Tarik nilai grand total dari perhitungan Transport & UKK"
          >
            <RefreshCw className="w-3.5 h-3.5 text-slate-600" />
            Tarik dari Hitung UKK
          </button>

          <button
            onClick={handleSyncToSlips}
            disabled={isSyncing}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 active:scale-98 rounded-xl shadow-xs transition-all disabled:opacity-50"
          >
            <CheckCircle className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
            {isSyncing ? 'Menyinkronkan...' : 'Sinkronkan ke Slip Gaji'}
          </button>
        </div>
      </div>

      {/* Metric Summary Cards matching uploaded table */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* UKK Transport Makan */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-600">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              UKK, Transpor & Makan
            </span>
            <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-lg font-bold text-slate-900">
              {formatRp(totals.ukkTransportMakan)}
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">
              Grand total dari 22 pegawai
            </div>
          </div>
        </div>

        {/* Tunjangan Tambahan */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-600">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              (+) Tunjangan Tambahan
            </span>
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
              <ArrowUpRight className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-lg font-bold text-emerald-700">
              +{formatRp(totals.tunjanganWaliKelas + totals.tunjanganStaffPimpinan + totals.tunjanganLain)}
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5 flex items-center justify-between">
              <span>Wali: {formatRp(totals.tunjanganWaliKelas)}</span>
              <span>Staff: {formatRp(totals.tunjanganStaffPimpinan)}</span>
            </div>
          </div>
        </div>

        {/* Subtotal Pendapatan UKK (Jumlah) */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-600">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Jumlah Pendapatan
            </span>
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
              <Building2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-lg font-bold text-indigo-900">
              {formatRp(totals.totalPenambahan)}
            </div>
            <div className="text-[11px] text-indigo-600 font-medium mt-0.5">
              UKK + Tunj. Wali + Tunj. Staff
            </div>
          </div>
        </div>

        {/* Total Potongan Tambahan */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-600">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              (-) Potongan Tambahan
            </span>
            <div className="p-2 bg-rose-50 text-rose-600 rounded-xl">
              <ArrowDownRight className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-lg font-bold text-rose-600">
              -{formatRp(totals.totalPotongan)}
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5 flex items-center justify-between">
              <span>YPI: {formatRp(totals.potonganKoperasiYpi)}</span>
              <span>YWAM: {formatRp(totals.potonganKoperasiYwam)}</span>
            </div>
          </div>
        </div>

        {/* Grand Total Diterima */}
        <div className="bg-emerald-900 text-white p-4 rounded-2xl shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-emerald-200">
            <span className="text-xs font-bold uppercase tracking-wider">
              (=) JUMLAH DITERIMA
            </span>
            <div className="p-2 bg-emerald-800 text-emerald-300 rounded-xl">
              <CreditCard className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-lg font-black tracking-tight text-white">
              {formatRp(totals.jumlahDiterima)}
            </div>
            <div className="text-[11px] text-emerald-300 mt-0.5">
              Transfer UKK Akhir Pegawai
            </div>
          </div>
        </div>
      </div>

      {/* Information Banner */}
      <div className="bg-amber-50/80 border border-amber-200 rounded-2xl p-4 flex items-start gap-3 text-amber-900 text-xs">
        <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-bold">
            Petunjuk Penyesuaian UKK & Sinkronisasi Slip Gaji:
          </p>
          <p className="text-amber-800 leading-relaxed">
            1. Seluruh kolom nominal di bawah dapat <strong>diedit langsung di tabel (inline edit)</strong> atau melalui tombol <strong>Edit Detail</strong>.<br />
            2. Nilai <strong>UKK, Transpor & Makan</strong> dapat ditarik otomatis dari tab <em>Hitung Transport & UKK</em>.<br />
            3. Klik tombol <strong>"Sinkronkan ke Slip Gaji"</strong> setelah melakukan perubahan agar data <strong>No. Rekening, Tunjangan Wali/Staff, Potongan Koperasi YPI/YWAM</strong> otomatis terisi pada slip gaji bulan ini.
          </p>
        </div>
      </div>

      {/* Table & Toolbar Container */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {/* Toolbar */}
        <div className="p-4 border-b border-slate-200 flex flex-col md:flex-row items-center justify-between gap-3 bg-slate-50/60">
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Cari Nama, NIK, No. Rekening..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
            />
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto justify-end">
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded-xl shadow-2xs transition-all"
            >
              <Plus className="w-3.5 h-3.5 text-emerald-600" />
              Tambah Pegawai
            </button>

            <button
              onClick={handleExportExcel}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded-xl shadow-2xs transition-all"
              title="Unduh data dalam format Excel"
            >
              <Download className="w-3.5 h-3.5 text-emerald-600" />
              Export Excel
            </button>

            <label className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded-xl shadow-2xs transition-all cursor-pointer">
              <Upload className="w-3.5 h-3.5 text-blue-600" />
              Import Excel
              <input
                type="file"
                accept=".xlsx, .xls"
                onChange={handleImportExcel}
                className="hidden"
              />
            </label>

            <button
              onClick={resetUkkAdjustmentsToDefault}
              className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 border border-slate-300 rounded-xl transition-all"
              title="Reset ke data default tabel awal"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Data Table */}
        <div className="overflow-x-auto max-h-[640px]">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-100/90 sticky top-0 z-10 text-slate-700 border-b border-slate-200 uppercase font-bold text-[10px] tracking-wider">
              <tr>
                <th className="py-3 px-2 text-center w-10 border-r border-slate-200">No</th>
                <th className="py-3 px-3 border-r border-slate-200 min-w-[100px]">NIK / NIP</th>
                <th className="py-3 px-3 border-r border-slate-200 min-w-[120px]">No. Rekening</th>
                <th className="py-3 px-4 border-r border-slate-200 min-w-[160px]">Nama Pegawai</th>
                <th className="py-3 px-3 text-right bg-blue-50/50 border-r border-slate-200 min-w-[130px]">
                  UKK, Transpor, U.Makan
                </th>
                <th className="py-3 px-3 text-right bg-emerald-50/50 border-r border-slate-200 min-w-[120px]">
                  Tunj. Wali Kelas
                </th>
                <th className="py-3 px-3 text-right bg-emerald-50/50 border-r border-slate-200 min-w-[120px]">
                  Tunj. Staff Pimp
                </th>
                <th className="py-3 px-3 text-right bg-indigo-50/60 border-r border-slate-200 font-black min-w-[130px] text-indigo-900">
                  Jumlah (Penambahan)
                </th>
                <th className="py-3 px-2 text-right bg-rose-50/30 border-r border-slate-200 min-w-[90px]">
                  Kesra (7114...)
                </th>
                <th className="py-3 px-3 text-right bg-rose-50/40 border-r border-slate-200 min-w-[110px]">
                  Kop. YPI (7210...)
                </th>
                <th className="py-3 px-3 text-right bg-rose-50/50 border-r border-slate-200 min-w-[120px]">
                  Kop. YWAM (7210...)
                </th>
                <th className="py-3 px-2 text-right bg-rose-50/30 border-r border-slate-200 min-w-[90px]">
                  YW AMJP (8980...)
                </th>
                <th className="py-3 px-4 text-right bg-emerald-100/70 border-r border-slate-200 font-black text-emerald-950 min-w-[140px]">
                  Jumlah Diterima
                </th>
                <th className="py-3 px-3 text-center min-w-[80px]">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200/80 font-medium text-slate-800">
              {filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan={14} className="py-12 text-center text-slate-400">
                    Tidak ada data penyesuaian UKK yang cocok dengan pencarian "{searchTerm}".
                  </td>
                </tr>
              ) : (
                filteredRecords.map((row, idx) => (
                  <tr
                    key={row.id}
                    className="hover:bg-slate-50/80 transition-colors group"
                  >
                    <td className="py-2.5 px-2 text-center text-slate-500 border-r border-slate-200 font-semibold text-[11px]">
                      {row.no || idx + 1}
                    </td>
                    <td className="py-2.5 px-3 border-r border-slate-200 font-mono text-[11px] text-slate-600">
                      {row.nip}
                    </td>
                    <td className="py-2.5 px-3 border-r border-slate-200">
                      <input
                        type="text"
                        value={row.bankAccountNumber || ''}
                        onChange={(e) => updateUkkAdjustmentRow(row.id, { bankAccountNumber: e.target.value })}
                        className="w-full font-mono text-[11px] text-slate-700 bg-transparent hover:bg-white focus:bg-white focus:ring-1 focus:ring-emerald-500 rounded px-1.5 py-0.5 border border-transparent hover:border-slate-300 transition-all"
                        placeholder="No Rekening..."
                      />
                    </td>
                    <td className="py-2.5 px-4 border-r border-slate-200 font-bold text-slate-900">
                      {row.name}
                    </td>
                    {/* UKK Transport Makan */}
                    <td className="py-2.5 px-3 text-right border-r border-slate-200 bg-blue-50/20 font-mono">
                      <input
                        type="number"
                        value={row.ukkTransportMakan || 0}
                        onChange={(e) => handleCellChange(row.id, 'ukkTransportMakan', e.target.value)}
                        className="w-full text-right font-mono text-[11px] text-slate-900 bg-transparent hover:bg-white focus:bg-white focus:ring-1 focus:ring-blue-500 rounded px-1.5 py-0.5 border border-transparent hover:border-slate-300"
                      />
                    </td>
                    {/* Tunjangan Wali Kelas */}
                    <td className="py-2.5 px-3 text-right border-r border-slate-200 bg-emerald-50/20 font-mono">
                      <input
                        type="number"
                        value={row.tunjanganWaliKelas || 0}
                        onChange={(e) => handleCellChange(row.id, 'tunjanganWaliKelas', e.target.value)}
                        className="w-full text-right font-mono text-[11px] font-semibold text-emerald-800 bg-transparent hover:bg-white focus:bg-white focus:ring-1 focus:ring-emerald-500 rounded px-1.5 py-0.5 border border-transparent hover:border-slate-300"
                      />
                    </td>
                    {/* Tunjangan Staff Pimpinan */}
                    <td className="py-2.5 px-3 text-right border-r border-slate-200 bg-emerald-50/20 font-mono">
                      <input
                        type="number"
                        value={row.tunjanganStaffPimpinan || 0}
                        onChange={(e) => handleCellChange(row.id, 'tunjanganStaffPimpinan', e.target.value)}
                        className="w-full text-right font-mono text-[11px] font-semibold text-emerald-800 bg-transparent hover:bg-white focus:bg-white focus:ring-1 focus:ring-emerald-500 rounded px-1.5 py-0.5 border border-transparent hover:border-slate-300"
                      />
                    </td>
                    {/* JUMLAH (Penambahan) */}
                    <td className="py-2.5 px-3 text-right border-r border-slate-200 bg-indigo-50/40 font-mono font-bold text-indigo-950">
                      {formatRp(row.totalPenambahan)}
                    </td>
                    {/* Potongan Kesra */}
                    <td className="py-2.5 px-2 text-right border-r border-slate-200 bg-rose-50/10 font-mono">
                      <input
                        type="number"
                        value={row.potonganKesra || 0}
                        onChange={(e) => handleCellChange(row.id, 'potonganKesra', e.target.value)}
                        className="w-full text-right font-mono text-[11px] text-slate-600 bg-transparent hover:bg-white focus:bg-white focus:ring-1 focus:ring-rose-500 rounded px-1 py-0.5 border border-transparent hover:border-slate-300"
                      />
                    </td>
                    {/* Potongan Koperasi YPI */}
                    <td className="py-2.5 px-3 text-right border-r border-slate-200 bg-rose-50/20 font-mono">
                      <input
                        type="number"
                        value={row.potonganKoperasiYpi || 0}
                        onChange={(e) => handleCellChange(row.id, 'potonganKoperasiYpi', e.target.value)}
                        className="w-full text-right font-mono text-[11px] font-semibold text-rose-700 bg-transparent hover:bg-white focus:bg-white focus:ring-1 focus:ring-rose-500 rounded px-1 py-0.5 border border-transparent hover:border-slate-300"
                      />
                    </td>
                    {/* Potongan Koperasi YWAM */}
                    <td className="py-2.5 px-3 text-right border-r border-slate-200 bg-rose-50/30 font-mono">
                      <input
                        type="number"
                        value={row.potonganKoperasiYwam || 0}
                        onChange={(e) => handleCellChange(row.id, 'potonganKoperasiYwam', e.target.value)}
                        className="w-full text-right font-mono text-[11px] font-semibold text-rose-700 bg-transparent hover:bg-white focus:bg-white focus:ring-1 focus:ring-rose-500 rounded px-1 py-0.5 border border-transparent hover:border-slate-300"
                      />
                    </td>
                    {/* Potongan YW AMJP */}
                    <td className="py-2.5 px-2 text-right border-r border-slate-200 bg-rose-50/10 font-mono">
                      <input
                        type="number"
                        value={row.potonganYwAmjp || 0}
                        onChange={(e) => handleCellChange(row.id, 'potonganYwAmjp', e.target.value)}
                        className="w-full text-right font-mono text-[11px] text-slate-600 bg-transparent hover:bg-white focus:bg-white focus:ring-1 focus:ring-rose-500 rounded px-1 py-0.5 border border-transparent hover:border-slate-300"
                      />
                    </td>
                    {/* JUMLAH DITERIMA (UKK Akhir) */}
                    <td className="py-2.5 px-4 text-right border-r border-slate-200 bg-emerald-50/60 font-mono font-black text-emerald-900 text-xs">
                      {formatRp(row.jumlahDiterima)}
                    </td>
                    {/* Action buttons */}
                    <td className="py-2.5 px-3 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => {
                            setSelectedRecordForModal(row);
                            setIsDetailModalOpen(true);
                          }}
                          className="p-1 text-slate-400 hover:text-emerald-700 hover:bg-emerald-50 rounded transition-colors"
                          title="Edit Rincian Lengkap"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => deleteUkkAdjustmentRow(row.id)}
                          className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors"
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
            {/* Table Footer with exact sums */}
            <tfoot className="bg-slate-100/95 font-bold text-slate-900 text-xs border-t-2 border-slate-300 sticky bottom-0 z-10">
              <tr>
                <td colSpan={4} className="py-3 px-4 text-left border-r border-slate-200">
                  <div className="flex items-center justify-between">
                    <span>TOTAL KESELURUHAN</span>
                    <span className="text-[11px] font-normal text-slate-500">
                      ({filteredRecords.length} Pegawai)
                    </span>
                  </div>
                </td>
                <td className="py-3 px-3 text-right border-r border-slate-200 font-mono text-slate-900 bg-blue-50/60">
                  {formatRp(totals.ukkTransportMakan)}
                </td>
                <td className="py-3 px-3 text-right border-r border-slate-200 font-mono text-emerald-800 bg-emerald-50/60">
                  {formatRp(totals.tunjanganWaliKelas)}
                </td>
                <td className="py-3 px-3 text-right border-r border-slate-200 font-mono text-emerald-800 bg-emerald-50/60">
                  {formatRp(totals.tunjanganStaffPimpinan)}
                </td>
                <td className="py-3 px-3 text-right border-r border-slate-200 font-mono font-black text-indigo-950 bg-indigo-100/70">
                  {formatRp(totals.totalPenambahan)}
                </td>
                <td className="py-3 px-2 text-right border-r border-slate-200 font-mono text-slate-700">
                  {formatRp(totals.potonganKesra)}
                </td>
                <td className="py-3 px-3 text-right border-r border-slate-200 font-mono text-rose-700 bg-rose-50/60">
                  {formatRp(totals.potonganKoperasiYpi)}
                </td>
                <td className="py-3 px-3 text-right border-r border-slate-200 font-mono text-rose-700 bg-rose-50/60">
                  {formatRp(totals.potonganKoperasiYwam)}
                </td>
                <td className="py-3 px-2 text-right border-r border-slate-200 font-mono text-slate-700">
                  {formatRp(totals.potonganYwAmjp)}
                </td>
                <td className="py-3 px-4 text-right border-r border-slate-200 font-mono font-black text-emerald-950 bg-emerald-200/80 text-sm">
                  {formatRp(totals.jumlahDiterima)}
                </td>
                <td></td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* MODAL: Edit Detail Pegawai */}
      {isDetailModalOpen && selectedRecordForModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full border border-slate-200 shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-emerald-100 text-emerald-700 rounded-xl">
                  <UserCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Edit Rincian Penyesuaian UKK
                  </h3>
                  <p className="text-xs text-slate-500">
                    {selectedRecordForModal.name} ({selectedRecordForModal.nip})
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsDetailModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200/60"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveDetailModal} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    No. Rekening Bank
                  </label>
                  <input
                    type="text"
                    value={selectedRecordForModal.bankAccountNumber || ''}
                    onChange={(e) =>
                      setSelectedRecordForModal({
                        ...selectedRecordForModal,
                        bankAccountNumber: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    placeholder="Contoh: 7000742125"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Nama Bank Penyalur
                  </label>
                  <input
                    type="text"
                    value={selectedRecordForModal.bankName || 'BSI'}
                    onChange={(e) =>
                      setSelectedRecordForModal({
                        ...selectedRecordForModal,
                        bankName: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    placeholder="BSI / Bank Syariah Indonesia"
                  />
                </div>
              </div>

              {/* Pendapatan UKK & Tunjangan */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Komponen Penambahan (Earnings)
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      UKK, Transpor & Makan (Rp)
                    </label>
                    <input
                      type="number"
                      value={selectedRecordForModal.ukkTransportMakan || 0}
                      onChange={(e) =>
                        setSelectedRecordForModal({
                          ...selectedRecordForModal,
                          ukkTransportMakan: parseFloat(e.target.value) || 0,
                        })
                      }
                      className="w-full px-3 py-2 text-xs font-mono border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-emerald-800 mb-1">
                      Tunjangan Wali Kelas (Rp)
                    </label>
                    <input
                      type="number"
                      value={selectedRecordForModal.tunjanganWaliKelas || 0}
                      onChange={(e) =>
                        setSelectedRecordForModal({
                          ...selectedRecordForModal,
                          tunjanganWaliKelas: parseFloat(e.target.value) || 0,
                        })
                      }
                      className="w-full px-3 py-2 text-xs font-mono font-semibold text-emerald-800 border border-emerald-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-emerald-50/40"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-emerald-800 mb-1">
                      Tunjangan Staff Pimpinan (Rp)
                    </label>
                    <input
                      type="number"
                      value={selectedRecordForModal.tunjanganStaffPimpinan || 0}
                      onChange={(e) =>
                        setSelectedRecordForModal({
                          ...selectedRecordForModal,
                          tunjanganStaffPimpinan: parseFloat(e.target.value) || 0,
                        })
                      }
                      className="w-full px-3 py-2 text-xs font-mono font-semibold text-emerald-800 border border-emerald-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-emerald-50/40"
                    />
                  </div>
                </div>
              </div>

              {/* Potongan Tambahan */}
              <div className="bg-rose-50/40 p-4 rounded-xl border border-rose-200/80 space-y-3">
                <h4 className="text-xs font-bold text-rose-900 uppercase tracking-wider">
                  Komponen Pemotongan Tambahan (Deductions)
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      KESRA (7114...)
                    </label>
                    <input
                      type="number"
                      value={selectedRecordForModal.potonganKesra || 0}
                      onChange={(e) =>
                        setSelectedRecordForModal({
                          ...selectedRecordForModal,
                          potonganKesra: parseFloat(e.target.value) || 0,
                        })
                      }
                      className="w-full px-3 py-2 text-xs font-mono border border-slate-300 rounded-xl focus:ring-2 focus:ring-rose-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-rose-800 mb-1">
                      KOPERASI YPI (7210...)
                    </label>
                    <input
                      type="number"
                      value={selectedRecordForModal.potonganKoperasiYpi || 0}
                      onChange={(e) =>
                        setSelectedRecordForModal({
                          ...selectedRecordForModal,
                          potonganKoperasiYpi: parseFloat(e.target.value) || 0,
                        })
                      }
                      className="w-full px-3 py-2 text-xs font-mono font-semibold text-rose-800 border border-rose-300 rounded-xl focus:ring-2 focus:ring-rose-500 focus:outline-none bg-rose-50/60"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-rose-800 mb-1">
                      KOPERASI YWAM (7210...)
                    </label>
                    <input
                      type="number"
                      value={selectedRecordForModal.potonganKoperasiYwam || 0}
                      onChange={(e) =>
                        setSelectedRecordForModal({
                          ...selectedRecordForModal,
                          potonganKoperasiYwam: parseFloat(e.target.value) || 0,
                        })
                      }
                      className="w-full px-3 py-2 text-xs font-mono font-semibold text-rose-800 border border-rose-300 rounded-xl focus:ring-2 focus:ring-rose-500 focus:outline-none bg-rose-50/60"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      YW AMJP (8980...)
                    </label>
                    <input
                      type="number"
                      value={selectedRecordForModal.potonganYwAmjp || 0}
                      onChange={(e) =>
                        setSelectedRecordForModal({
                          ...selectedRecordForModal,
                          potonganYwAmjp: parseFloat(e.target.value) || 0,
                        })
                      }
                      className="w-full px-3 py-2 text-xs font-mono border border-slate-300 rounded-xl focus:ring-2 focus:ring-rose-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Catatan / Keterangan
                </label>
                <input
                  type="text"
                  value={selectedRecordForModal.notes || ''}
                  onChange={(e) =>
                    setSelectedRecordForModal({
                      ...selectedRecordForModal,
                      notes: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  placeholder="Keterangan penyesuaian khusus..."
                />
              </div>

              <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsDetailModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-1.5 px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs"
                >
                  <Save className="w-4 h-4" />
                  Simpan Perubahan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Tambah Pegawai */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full border border-slate-200 shadow-xl overflow-hidden">
            <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <h3 className="text-base font-bold text-slate-900">
                Tambah Data Penyesuaian Pegawai
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200/60"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveAddModal} className="p-6 space-y-4">
              {/* Quick select employee from Kelola Pegawai */}
              <div className="bg-emerald-50/70 p-3.5 rounded-xl border border-emerald-200">
                <label className="block text-xs font-bold text-emerald-900 mb-1 flex items-center gap-1.5">
                  <UserCheck className="w-4 h-4 text-emerald-600" />
                  <span>Pilih Pegawai Terdaftar dari Kelola Pegawai</span>
                </label>
                <select
                  value={selectedEmpIdForAdd}
                  onChange={(e) => handleSelectEmployeeForAdd(e.target.value)}
                  className="w-full px-3 py-2 text-xs font-semibold rounded-xl border border-emerald-300 bg-white text-slate-800 shadow-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                >
                  <option value="">-- Pilih Pegawai (Otomatis Tarik Nama, NIP, Rekening & UKK) --</option>
                  {employees.map((e) => (
                    <option key={e.id} value={e.id}>
                      {e.name} ({e.nip || 'Tanpa NIP'}) • {e.position} • {e.department}
                    </option>
                  ))}
                </select>
                <p className="text-[11px] text-emerald-700/80 mt-1">
                  Memilih pegawai otomatis mengisi NIP, No. Rekening Bank, serta menarik estimasi UKK & tunjangan terkait.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Nama Lengkap Pegawai *
                </label>
                <input
                  type="text"
                  required
                  value={newFormData.name || ''}
                  onChange={(e) => setNewFormData({ ...newFormData, name: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  placeholder="Nama pegawai..."
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    NIK / NIP *
                  </label>
                  <input
                    type="text"
                    required
                    value={newFormData.nip || ''}
                    onChange={(e) => setNewFormData({ ...newFormData, nip: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    placeholder="102041398"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    No. Rekening
                  </label>
                  <input
                    type="text"
                    value={newFormData.bankAccountNumber || ''}
                    onChange={(e) =>
                      setNewFormData({ ...newFormData, bankAccountNumber: e.target.value })
                    }
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    placeholder="7000742125"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    UKK / Transpor
                  </label>
                  <input
                    type="number"
                    value={newFormData.ukkTransportMakan || 0}
                    onChange={(e) =>
                      setNewFormData({
                        ...newFormData,
                        ukkTransportMakan: parseFloat(e.target.value) || 0,
                      })
                    }
                    className="w-full px-3 py-2 text-xs font-mono border border-slate-300 rounded-xl focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-emerald-800 mb-1">
                    Tunj. Wali
                  </label>
                  <input
                    type="number"
                    value={newFormData.tunjanganWaliKelas || 0}
                    onChange={(e) =>
                      setNewFormData({
                        ...newFormData,
                        tunjanganWaliKelas: parseFloat(e.target.value) || 0,
                      })
                    }
                    className="w-full px-3 py-2 text-xs font-mono border border-emerald-300 rounded-xl focus:outline-none bg-emerald-50/30"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-emerald-800 mb-1">
                    Tunj. Staff
                  </label>
                  <input
                    type="number"
                    value={newFormData.tunjanganStaffPimpinan || 0}
                    onChange={(e) =>
                      setNewFormData({
                        ...newFormData,
                        tunjanganStaffPimpinan: parseFloat(e.target.value) || 0,
                      })
                    }
                    className="w-full px-3 py-2 text-xs font-mono border border-emerald-300 rounded-xl focus:outline-none bg-emerald-50/30"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-rose-800 mb-1">
                    Koperasi YPI (Rp)
                  </label>
                  <input
                    type="number"
                    value={newFormData.potonganKoperasiYpi || 0}
                    onChange={(e) =>
                      setNewFormData({
                        ...newFormData,
                        potonganKoperasiYpi: parseFloat(e.target.value) || 0,
                      })
                    }
                    className="w-full px-3 py-2 text-xs font-mono border border-rose-300 rounded-xl focus:outline-none bg-rose-50/30"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-rose-800 mb-1">
                    Koperasi YWAM (Rp)
                  </label>
                  <input
                    type="number"
                    value={newFormData.potonganKoperasiYwam || 0}
                    onChange={(e) =>
                      setNewFormData({
                        ...newFormData,
                        potonganKoperasiYwam: parseFloat(e.target.value) || 0,
                      })
                    }
                    className="w-full px-3 py-2 text-xs font-mono border border-rose-300 rounded-xl focus:outline-none bg-rose-50/30"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-1.5 px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs"
                >
                  <Plus className="w-4 h-4" />
                  Tambahkan Pegawai
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
