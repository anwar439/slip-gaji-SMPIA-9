import React, { useState } from 'react';
import { useSalary } from '../../context/SalaryContext';
import { formatRupiah, formatIndonesianDate } from '../../utils/currencyFormatter';
import { exportSalaryRecordsToExcel } from '../../utils/excelHelper';
import {
  Search,
  Filter,
  Download,
  Eye,
  CheckCircle,
  Clock,
  Edit,
  Trash2,
  FileSpreadsheet,
  Plus,
  CheckCheck,
  Calendar,
  DollarSign,
  TrendingDown,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  Sparkles,
} from 'lucide-react';
import { SalaryRecord } from '../../types';
import { ManualSalarySlipModal } from './ManualSalarySlipModal';
import { PeriodDateRangeModal } from '../PeriodDateRangeModal';
import { synchronizeSalaryRecordFromAllSources } from '../../utils/salarySynchronizer';

export const SalaryManagementTable: React.FC = () => {
  const {
    records,
    selectedPeriod,
    setSelectedPeriod,
    availablePeriods,
    openSlipModal,
    togglePublishStatus,
    publishAllInPeriod,
    deleteSalaryRecord,
    showToast,
    getCurrentPeriodConfig,
    syncAllSourcesToSlips,
    salaryMatrix,
    transportUkkRecords,
    ukkAdjustmentRecords,
    employees,
  } = useSalary();

  const currentPeriodConfig = getCurrentPeriodConfig();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDept, setSelectedDept] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState<'ALL' | 'published' | 'draft'>('ALL');
  
  // Modals
  const [isManualModalOpen, setIsManualModalOpen] = useState(false);
  const [recordToEdit, setRecordToEdit] = useState<SalaryRecord | null>(null);
  const [isPeriodModalOpen, setIsPeriodModalOpen] = useState(false);

  // Expanded row ID for quick breakdown inspection
  const [expandedRowId, setExpandedRowId] = useState<string | null>(null);

  // Filter records for active period and ensure full source synchronization
  const rawPeriodRecords = records.filter((r) => r.period === selectedPeriod);
  const periodRecords = rawPeriodRecords.map((r) =>
    synchronizeSalaryRecordFromAllSources(
      r,
      salaryMatrix,
      transportUkkRecords,
      ukkAdjustmentRecords,
      employees
    )
  );

  // Extract departments
  const departments = Array.from(new Set(periodRecords.map((r) => r.employeeDepartment))).filter(Boolean);

  const filteredRecords = periodRecords.filter((r) => {
    const matchesSearch =
      r.employeeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.employeeNip.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.employeePosition.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesDept = selectedDept === 'ALL' || r.employeeDepartment === selectedDept;
    const matchesStatus = selectedStatus === 'ALL' || r.status === selectedStatus;

    return matchesSearch && matchesDept && matchesStatus;
  });

  const totalPayroll = periodRecords.reduce((sum, r) => sum + r.netSalary, 0);
  const totalSumberGajiPokokAkhir = periodRecords.reduce((sum, r) => sum + (r.sumberGajiPokokAkhir || r.basicSalary || 0), 0);
  const totalUkkAwal = periodRecords.reduce((sum, r) => sum + (r.ukkGrandTotalAwal || (r.transportAllowance || 0) + (r.mealAllowance || 0)), 0);
  const totalUkkAkhirDiterima = periodRecords.reduce((sum, r) => sum + (r.ukkNetAkhirDiterima || (r.transportAllowance || 0) + (r.mealAllowance || 0)), 0);
  const totalEarningsAll = periodRecords.reduce((sum, r) => sum + r.totalEarnings, 0);
  const totalDeductionsAll = periodRecords.reduce((sum, r) => sum + r.totalDeductions, 0);
  const totalPublished = periodRecords.filter((r) => r.status === 'published').length;
  const totalDraft = periodRecords.filter((r) => r.status === 'draft').length;

  const handleExportExcel = () => {
    exportSalaryRecordsToExcel(periodRecords, currentPeriodConfig.label);
    showToast(`Laporan gaji periode ${currentPeriodConfig.label} berhasil diekspor ke Excel!`, 'success');
  };

  const handleOpenEditModal = (rec: SalaryRecord) => {
    setRecordToEdit(rec);
    setIsManualModalOpen(true);
  };

  const handleOpenAddNewModal = () => {
    setRecordToEdit(null);
    setIsManualModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* 1. Header Toolbar & Period Selector */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs flex flex-col xl:flex-row xl:items-center justify-between gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
              Periode Penggajian:
            </label>
            <div className="flex items-center gap-2">
              <select
                id="select-admin-period"
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                aria-label="Pilih Periode Penggajian"
                className="bg-slate-900 text-white text-xs sm:text-sm font-bold py-2.5 px-3.5 rounded-xl border border-slate-800 focus:ring-2 focus:ring-blue-500 focus:outline-hidden cursor-pointer"
              >
                {availablePeriods.map((p) => (
                  <option key={p.value} value={p.value}>
                    {p.label} {p.isNew ? '(Baru)' : ''}
                  </option>
                ))}
              </select>

              <button
                id="btn-change-date-range"
                onClick={() => setIsPeriodModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-3 py-2.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-xl text-xs font-bold transition-colors border border-blue-200"
                title="Atur rentang tanggal (dari tgl s/d tgl)"
              >
                <Calendar className="w-4 h-4 text-blue-600" />
                <span>Atur Rentang Tgl</span>
              </button>
            </div>
            <div className="text-[11px] text-slate-500 mt-1 font-mono">
              Rentang: <strong className="text-slate-700">{currentPeriodConfig.startDate}</strong> s/d <strong className="text-slate-700">{currentPeriodConfig.endDate}</strong>
            </div>
          </div>

          <div className="sm:pl-4 sm:border-l border-slate-200 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div>
              <div className="text-slate-500 text-[10px] uppercase font-bold">Gaji Pokok Akhir</div>
              <div className="text-xs sm:text-sm font-black text-slate-900 font-mono">{formatRupiah(totalSumberGajiPokokAkhir)}</div>
            </div>
            <div>
              <div className="text-slate-500 text-[10px] uppercase font-bold">UKK Awal</div>
              <div className="text-xs sm:text-sm font-black text-amber-900 font-mono">{formatRupiah(totalUkkAwal)}</div>
            </div>
            <div>
              <div className="text-slate-500 text-[10px] uppercase font-bold">UKK Akhir Diterima</div>
              <div className="text-xs sm:text-sm font-black text-emerald-900 font-mono">{formatRupiah(totalUkkAkhirDiterima)}</div>
            </div>
            <div>
              <div className="text-blue-600 text-[10px] uppercase font-bold">Total Dibayarkan</div>
              <div className="text-xs sm:text-sm font-black text-blue-900 font-mono">{formatRupiah(totalPayroll)}</div>
            </div>
          </div>
        </div>

        {/* Global Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            id="btn-sync-all-sources"
            onClick={() => syncAllSourcesToSlips(selectedPeriod)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-emerald-100"
            title="Sinkronkan seluruh data dari Master Gaji Pokok & UKK Akhir"
          >
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>Sinkronkan Sumber Data</span>
          </button>

          <button
            id="btn-add-manual-slip"
            onClick={handleOpenAddNewModal}
            className="inline-flex items-center gap-1.5 px-3.5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-blue-100"
          >
            <Plus className="w-4 h-4" />
            <span>+ Tambah Slip Manual</span>
          </button>

          <button
            id="btn-export-admin-excel"
            onClick={handleExportExcel}
            className="inline-flex items-center gap-1.5 px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold transition-colors border border-slate-200"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span>Ekspor Excel</span>
          </button>

          <button
            id="btn-publish-all-period"
            onClick={() => {
              if (confirm(`Terbitkan semua (${periodRecords.length}) slip gaji periode ini ke akun karyawan?`)) {
                publishAllInPeriod(selectedPeriod);
              }
            }}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white rounded-xl text-xs font-bold transition-colors shadow-sm"
          >
            <CheckCheck className="w-4 h-4" />
            <span>Terbitkan Semua</span>
          </button>
        </div>
      </div>

      {/* 2. Filters & Search Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            id="input-search-slip"
            type="text"
            placeholder="Cari Nama, NIP, atau Jabatan..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 placeholder-slate-400 focus:bg-white focus:ring-2 focus:ring-blue-600 focus:outline-hidden"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto justify-end">
          {/* Dept Filter */}
          <select
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
            aria-label="Filter Departemen"
            className="text-xs bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-slate-700 font-semibold focus:outline-hidden"
          >
            <option value="ALL">Semua Departemen</option>
            {departments.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value as any)}
            aria-label="Filter Status Slip"
            className="text-xs bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-slate-700 font-semibold focus:outline-hidden"
          >
            <option value="ALL">Semua Status ({periodRecords.length})</option>
            <option value="published">Terbit ({totalPublished})</option>
            <option value="draft">Draft / Review ({totalDraft})</option>
          </select>
        </div>
      </div>

      {/* 3. Comprehensive Salary Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase text-[10px] tracking-wider">
              <tr>
                <th className="py-3.5 px-4">Pegawai & Jabatan</th>
                <th className="py-3.5 px-4">Sumber Gaji Pokok Akhir</th>
                <th className="py-3.5 px-4">UKK Awal</th>
                <th className="py-3.5 px-4">UKK Akhir Diterima</th>
                <th className="py-3.5 px-4 font-mono font-bold text-slate-900">Total Dibayarkan</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <div className="max-w-md mx-auto space-y-2">
                      <AlertCircle className="w-8 h-8 text-slate-300 mx-auto" />
                      <div className="font-bold text-slate-600">Tidak ada data slip gaji ditemukan</div>
                      <p className="text-xs text-slate-400">
                        Belum ada slip untuk periode ini. Silakan klik <strong>+ Tambah Slip Manual</strong> atau upload file Excel di menu Upload.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredRecords.map((rec) => {
                  const isExpanded = expandedRowId === rec.id;
                  const gapokAkhir = rec.sumberGajiPokokAkhir || rec.basicSalary || 0;
                  const ukkAwal = rec.ukkGrandTotalAwal || ((rec.transportAllowance || 0) + (rec.mealAllowance || 0));
                  const ukkAkhir = rec.ukkNetAkhirDiterima || ((rec.transportAllowance || 0) + (rec.mealAllowance || 0));

                  return (
                    <React.Fragment key={rec.id}>
                      <tr className={`hover:bg-slate-50/80 transition-colors ${isExpanded ? 'bg-blue-50/30' : ''}`}>
                        {/* Pegawai */}
                        <td className="py-3.5 px-4">
                          <div className="font-bold text-slate-900 text-xs sm:text-sm flex items-center gap-1.5">
                            <span>{rec.employeeName}</span>
                            <button
                              onClick={() => setExpandedRowId(isExpanded ? null : rec.id)}
                              className="text-slate-400 hover:text-blue-600 p-0.5"
                              title="Lihat rincian lengkap komponen & potongan"
                            >
                              {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                            </button>
                          </div>
                          <div className="text-[10px] font-mono text-slate-500">
                            {rec.employeeNip} • {rec.employeePosition} ({rec.employeeDepartment})
                          </div>
                        </td>

                        {/* Sumber Gaji Pokok Akhir */}
                        <td className="py-3.5 px-4">
                          <div className="font-mono font-bold text-slate-900">
                            {formatRupiah(gapokAkhir)}
                          </div>
                          <div className="text-[10px] text-slate-400">Master Gaji Pokok</div>
                        </td>

                        {/* UKK Awal */}
                        <td className="py-3.5 px-4">
                          <div className="font-mono text-slate-700 font-semibold">
                            {formatRupiah(ukkAwal)}
                          </div>
                          <div className="text-[10px] text-slate-400">Transpor + Makan + UKK</div>
                        </td>

                        {/* UKK Akhir Diterima */}
                        <td className="py-3.5 px-4">
                          <div className="font-mono text-emerald-700 font-bold">
                            {formatRupiah(ukkAkhir)}
                          </div>
                          <div className="text-[10px] text-emerald-600/80">Setelah Penyesuaian</div>
                        </td>

                        {/* Total Dibayarkan */}
                        <td className="py-3.5 px-4 font-mono font-black text-blue-900 text-sm">
                          {formatRupiah(rec.netSalary)}
                        </td>

                        {/* Status Terbit */}
                        <td className="py-3.5 px-4">
                          <button
                            onClick={() => togglePublishStatus(rec.id)}
                            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold transition-transform active:scale-95 ${
                              rec.status === 'published'
                                ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                                : 'bg-amber-100 text-amber-800 hover:bg-amber-200'
                            }`}
                            title="Klik untuk ubah status terbit"
                          >
                            {rec.status === 'published' ? (
                              <>
                                <CheckCircle className="w-3 h-3 text-emerald-600" />
                                <span>Terbit</span>
                              </>
                            ) : (
                              <>
                                <Clock className="w-3 h-3 text-amber-600" />
                                <span>Draft</span>
                              </>
                            )}
                          </button>
                        </td>

                        {/* Aksi */}
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              id={`btn-preview-slip-${rec.id}`}
                              onClick={() => openSlipModal(rec)}
                              className="p-1.5 text-slate-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
                              title="Pratinjau & Unduh PDF Slip Resmi"
                            >
                              <Eye className="w-4 h-4" />
                            </button>

                            <button
                              id={`btn-edit-slip-${rec.id}`}
                              onClick={() => handleOpenEditModal(rec)}
                              className="p-1.5 text-slate-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors"
                              title="Edit Rincian Slip Manual"
                            >
                              <Edit className="w-4 h-4" />
                            </button>

                            <button
                              id={`btn-delete-slip-${rec.id}`}
                              onClick={() => {
                                if (confirm(`Hapus data slip gaji ${rec.employeeName}?`)) {
                                  deleteSalaryRecord(rec.id);
                                }
                              }}
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                              title="Hapus Slip"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>

                      {/* Expandable detailed breakdown drawer */}
                      {isExpanded && (
                        <tr className="bg-slate-50/70 border-y border-slate-200">
                          <td colSpan={7} className="p-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                              {/* All Incomes Breakdown */}
                              <div className="p-3 bg-white rounded-xl border border-emerald-200 space-y-1.5">
                                <div className="font-bold text-emerald-900 uppercase text-[10px] tracking-wider pb-1 border-b border-emerald-100 flex items-center justify-between">
                                  <span>Rincian Pemasukan Lengkap (Excel / Manual)</span>
                                  <span className="font-mono text-emerald-700">+{formatRupiah(rec.totalEarnings)}</span>
                                </div>
                                <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-[11px]">
                                  <div className="flex justify-between">
                                    <span className="text-slate-500">Gaji Pokok:</span>
                                    <span className="font-mono font-semibold">{formatRupiah(rec.basicSalary)}</span>
                                  </div>
                                  {rec.dailySalaryTotal && rec.dailySalaryTotal > 0 ? (
                                    <div className="flex justify-between text-emerald-700">
                                      <span>Gaji Harian ({rec.dailySalaryDays} hr):</span>
                                      <span className="font-mono font-semibold">{formatRupiah(rec.dailySalaryTotal)}</span>
                                    </div>
                                  ) : null}
                                  <div className="flex justify-between">
                                    <span className="text-slate-500">Tunj. Jabatan:</span>
                                    <span className="font-mono font-semibold">{formatRupiah(rec.positionAllowance)}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-slate-500">Tunj. Transport:</span>
                                    <span className="font-mono font-semibold">{formatRupiah(rec.transportAllowance)}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-slate-500">Uang Makan:</span>
                                    <span className="font-mono font-semibold">{formatRupiah(rec.mealAllowance)}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-slate-500">Tunj. Kehadiran:</span>
                                    <span className="font-mono font-semibold">{formatRupiah(rec.attendanceAllowance)}</span>
                                  </div>
                                  {rec.overtimePay > 0 && (
                                    <div className="flex justify-between text-amber-800 font-semibold">
                                      <span>Upah Lembur:</span>
                                      <span className="font-mono">{formatRupiah(rec.overtimePay)}</span>
                                    </div>
                                  )}
                                  {rec.bonusPay > 0 && (
                                    <div className="flex justify-between text-emerald-800 font-semibold">
                                      <span>Bonus Kinerja:</span>
                                      <span className="font-mono">{formatRupiah(rec.bonusPay)}</span>
                                    </div>
                                  )}
                                  {rec.thrPay > 0 && (
                                    <div className="flex justify-between text-purple-800 font-semibold">
                                      <span>THR:</span>
                                      <span className="font-mono">{formatRupiah(rec.thrPay)}</span>
                                    </div>
                                  )}
                                  {rec.otherEarnings > 0 && (
                                    <div className="flex justify-between text-slate-700">
                                      <span>Lainnya ({rec.otherEarningsNote || 'Lain-lain'}):</span>
                                      <span className="font-mono font-semibold">{formatRupiah(rec.otherEarnings)}</span>
                                    </div>
                                  )}
                                </div>
                              </div>

                              {/* All Deductions Breakdown */}
                              <div className="p-3 bg-white rounded-xl border border-rose-200 space-y-1.5">
                                <div className="font-bold text-rose-900 uppercase text-[10px] tracking-wider pb-1 border-b border-rose-100 flex items-center justify-between">
                                  <span>Rincian Pemotongan Lengkap</span>
                                  <span className="font-mono text-rose-700">-{formatRupiah(rec.totalDeductions)}</span>
                                </div>
                                <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-[11px]">
                                  <div className="flex justify-between">
                                    <span className="text-slate-500">BPJS Ketenagakerjaan:</span>
                                    <span className="font-mono font-semibold">{formatRupiah(rec.bpjsKetenagakerjaan)}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-slate-500">BPJS Kesehatan:</span>
                                    <span className="font-mono font-semibold">{formatRupiah(rec.bpjsKesehatan)}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-slate-500">Pajak PPh 21:</span>
                                    <span className="font-mono font-semibold">{formatRupiah(rec.pph21)}</span>
                                  </div>
                                  {rec.latePenalty > 0 && (
                                    <div className="flex justify-between text-rose-700 font-semibold">
                                      <span>Potongan Terlambat ({rec.attendance.lateHours} jam):</span>
                                      <span className="font-mono">{formatRupiah(rec.latePenalty)}</span>
                                    </div>
                                  )}
                                  {rec.absencePenalty && rec.absencePenalty > 0 ? (
                                    <div className="flex justify-between text-rose-700 font-semibold">
                                      <span>Potongan Mangkir / Alpha:</span>
                                      <span className="font-mono">{formatRupiah(rec.absencePenalty)}</span>
                                    </div>
                                  ) : null}
                                  {rec.loanDeduction > 0 && (
                                    <div className="flex justify-between text-slate-700">
                                      <span>Kasbon / Pinjaman:</span>
                                      <span className="font-mono font-semibold">{formatRupiah(rec.loanDeduction)}</span>
                                    </div>
                                  )}
                                  {rec.coopDeduction > 0 && (
                                    <div className="flex justify-between text-slate-700">
                                      <span>Iuran Koperasi:</span>
                                      <span className="font-mono font-semibold">{formatRupiah(rec.coopDeduction)}</span>
                                    </div>
                                  )}
                                  {rec.otherDeductions > 0 && (
                                    <div className="flex justify-between text-slate-700">
                                      <span>Potongan Lain ({rec.otherDeductionsNote || 'Lain-lain'}):</span>
                                      <span className="font-mono font-semibold">{formatRupiah(rec.otherDeductions)}</span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Manual Salary Slip Editor Modal (Add New or Edit) */}
      <ManualSalarySlipModal
        isOpen={isManualModalOpen}
        onClose={() => {
          setIsManualModalOpen(false);
          setRecordToEdit(null);
        }}
        recordToEdit={recordToEdit}
      />

      {/* Period Date Range Modal */}
      <PeriodDateRangeModal
        isOpen={isPeriodModalOpen}
        onClose={() => setIsPeriodModalOpen(false)}
      />
    </div>
  );
};
