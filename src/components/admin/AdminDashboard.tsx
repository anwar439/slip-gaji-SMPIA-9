import React, { useState } from 'react';
import { useSalary } from '../../context/SalaryContext';
import { SalaryManagementTable } from './SalaryManagementTable';
import { ExcelUploadSection } from './ExcelUploadSection';
import { EmployeeManagement } from './EmployeeManagement';
import { SalaryMatrixManagement } from './SalaryMatrixManagement';
import { TransportUkkManagement } from './TransportUkkManagement';
import { UkkAdjustmentManagement } from './UkkAdjustmentManagement';
import { AttendanceManagement } from './AttendanceManagement';
import { DutyLetterManagement } from './DutyLetterManagement';
import { CompanySettings } from './CompanySettings';
import { formatRupiah, formatIndonesianDate } from '../../utils/currencyFormatter';
import {
  FileText,
  UploadCloud,
  Users,
  Building2,
  ShieldCheck,
  History,
  TrendingUp,
  CheckCircle2,
  Layers,
  ArrowUpRight,
  Calculator,
  CalendarCheck,
  Briefcase,
  Bus,
  BadgePercent,
} from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const {
    records,
    employees,
    selectedPeriod,
    availablePeriods,
    auditLogs,
    activeAdminTab,
    setActiveAdminTab,
  } = useSalary();

  // Stats for the active period
  const periodRecords = records.filter((r) => r.period === selectedPeriod);
  const totalPayroll = periodRecords.reduce((sum, r) => sum + r.netSalary, 0);
  const totalAllowances = periodRecords.reduce((sum, r) => sum + (r.totalEarnings - r.basicSalary), 0);
  const totalDeductions = periodRecords.reduce((sum, r) => sum + r.totalDeductions, 0);
  const totalPublished = periodRecords.filter((r) => r.status === 'published').length;
  const activeLabel = availablePeriods.find((p) => p.value === selectedPeriod)?.label || selectedPeriod;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* 1. Header Overview */}
      <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-bold text-blue-700 bg-blue-50 border border-blue-200/60 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
              Admin HRD Panel
            </span>
            <span className="text-xs text-slate-400 font-medium">• Periode: {activeLabel}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            Manajemen Penggajian & Slip Gaji
          </h1>
          <p className="text-slate-500 font-medium text-xs sm:text-sm mt-1">
            Unggah berkas Excel gaji, verifikasi pendapatan & potongan, serta publikasikan slip PDF resmi.
          </p>
        </div>

        {/* Quick Upload Shortcut */}
        <div className="flex items-center gap-3">
          <button
            id="btn-quick-nav-upload"
            onClick={() => setActiveAdminTab('upload')}
            className="bg-slate-900 text-white px-5 sm:px-6 py-2.5 sm:py-3 rounded-xl flex items-center gap-2 font-semibold shadow-lg shadow-slate-200 hover:bg-slate-800 transition-all text-xs sm:text-sm"
          >
            <UploadCloud className="w-4 h-4" />
            <span>Upload File Excel</span>
          </button>
        </div>
      </header>

      {/* 2. Key Metrics Grid - Clean Minimalism Spec */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Total Payroll - Hero Blue Card */}
        <div className="bg-blue-600 rounded-2xl p-6 text-white shadow-xl shadow-blue-100 flex flex-col justify-between">
          <div>
            <p className="text-blue-100 text-xs font-medium uppercase tracking-wider mb-1">
              Total Pengeluaran Gaji
            </p>
            <p className="text-2xl sm:text-3xl font-bold tracking-tight">
              {formatRupiah(totalPayroll)}
            </p>
          </div>
          <div className="text-xs text-blue-100 mt-4 pt-3 border-t border-blue-500/40 flex justify-between items-center">
            <span>{periodRecords.length} Slip Karyawan</span>
            <span className="text-[11px] bg-blue-700/60 px-2 py-0.5 rounded font-mono">
              Net THP
            </span>
          </div>
        </div>

        {/* Total Karyawan */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs flex flex-col justify-between">
          <div>
            <p className="text-slate-400 text-xs font-medium uppercase tracking-wider mb-1">
              Total Pegawai Aktif
            </p>
            <p className="text-2xl sm:text-3xl font-bold text-slate-800">
              {employees.length} Pegawai
            </p>
          </div>
          <div className="text-xs text-emerald-600 font-medium mt-4 pt-3 border-t border-slate-100 flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
            <span>100% Terverifikasi</span>
          </div>
        </div>

        {/* Status Publikasi */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs flex flex-col justify-between">
          <div>
            <p className="text-slate-400 text-xs font-medium uppercase tracking-wider mb-1">
              Status Terbit Slip
            </p>
            <p className="text-2xl sm:text-3xl font-bold text-slate-800">
              {totalPublished} / {periodRecords.length}
            </p>
          </div>
          <div className="text-xs text-slate-500 mt-4 pt-3 border-t border-slate-100">
            <span>Draft: {periodRecords.length - totalPublished} data</span>
          </div>
        </div>

        {/* Rata-Rata Gaji */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs flex flex-col justify-between">
          <div>
            <p className="text-slate-400 text-xs font-medium uppercase tracking-wider mb-1">
              Rata-Rata THP / Orang
            </p>
            <p className="text-2xl sm:text-3xl font-bold text-slate-800">
              {formatRupiah(periodRecords.length > 0 ? Math.round(totalPayroll / periodRecords.length) : 0)}
            </p>
          </div>
          <div className="text-xs text-slate-500 mt-4 pt-3 border-t border-slate-100">
            <span>Potongan: {formatRupiah(totalDeductions)}</span>
          </div>
        </div>
      </div>

      {/* 3. Tab Navigation - Clean Minimalism Spec */}
      <div className="flex items-center gap-2 border-b border-slate-200 overflow-x-auto text-xs sm:text-sm font-semibold pb-2">
        <button
          id="admin-tab-slips"
          onClick={() => setActiveAdminTab('slips')}
          className={`px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 whitespace-nowrap ${
            activeAdminTab === 'slips'
              ? 'bg-blue-50 text-blue-700 font-semibold shadow-2xs border border-blue-200/50'
              : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50 font-medium'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Manajemen Slip Gaji ({periodRecords.length})</span>
        </button>

        <button
          id="admin-tab-upload"
          onClick={() => setActiveAdminTab('upload')}
          className={`px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 whitespace-nowrap ${
            activeAdminTab === 'upload'
              ? 'bg-blue-50 text-blue-700 font-semibold shadow-2xs border border-blue-200/50'
              : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50 font-medium'
          }`}
        >
          <UploadCloud className="w-4 h-4" />
          <span>Upload Excel Gaji</span>
        </button>

        <button
          id="admin-tab-employees"
          onClick={() => setActiveAdminTab('employees')}
          className={`px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 whitespace-nowrap ${
            activeAdminTab === 'employees'
              ? 'bg-blue-50 text-blue-700 font-semibold shadow-2xs border border-blue-200/50'
              : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50 font-medium'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Data Karyawan ({employees.length})</span>
        </button>

        {/* Dedicated Menu: Sumber Penghitungan Gaji Pokok */}
        <button
          id="admin-tab-matrix"
          onClick={() => setActiveAdminTab('matrix')}
          className={`px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 whitespace-nowrap ${
            activeAdminTab === 'matrix'
              ? 'bg-emerald-50 text-emerald-800 font-semibold shadow-2xs border border-emerald-300'
              : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50 font-medium'
          }`}
        >
          <Calculator className="w-4 h-4 text-emerald-600" />
          <span>Sumber Hitung Gaji</span>
        </button>

        {/* Dedicated Menu: Sumber Penghitungan Transport & UKK */}
        <button
          id="admin-tab-transport-ukk"
          onClick={() => setActiveAdminTab('transport-ukk')}
          className={`px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 whitespace-nowrap ${
            activeAdminTab === 'transport-ukk'
              ? 'bg-emerald-600 text-white font-semibold shadow-2xs'
              : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50 font-medium'
          }`}
        >
          <Bus className="w-4 h-4 text-amber-400" />
          <span>Sumber Hitung Transport & UKK</span>
        </button>

        {/* Dedicated Menu: Tunjangan & Potongan UKK */}
        <button
          id="admin-tab-ukk-adjustments"
          onClick={() => setActiveAdminTab('ukk-adjustments')}
          className={`px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 whitespace-nowrap ${
            activeAdminTab === 'ukk-adjustments'
              ? 'bg-emerald-600 text-white font-semibold shadow-2xs'
              : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50 font-medium'
          }`}
        >
          <BadgePercent className="w-4 h-4 text-emerald-500" />
          <span>Tunjangan & Potongan UKK</span>
        </button>

        {/* Dedicated Menu: Upload & Rekap Absensi Pegawai (PDF/JPG) */}
        <button
          id="admin-tab-attendance"
          onClick={() => setActiveAdminTab('attendance')}
          className={`px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 whitespace-nowrap ${
            activeAdminTab === 'attendance'
              ? 'bg-blue-600 text-white font-semibold shadow-2xs'
              : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50 font-medium'
          }`}
        >
          <CalendarCheck className="w-4 h-4 text-blue-400" />
          <span>Upload & Rekap Absensi (PDF/JPG)</span>
        </button>

        {/* Dedicated Menu: Upload & Manajemen Surat Tugas (PDF/JPG) */}
        <button
          id="admin-tab-surat-tugas"
          onClick={() => setActiveAdminTab('surat-tugas')}
          className={`px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 whitespace-nowrap ${
            activeAdminTab === 'surat-tugas'
              ? 'bg-amber-600 text-white font-semibold shadow-2xs'
              : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50 font-medium'
          }`}
        >
          <Briefcase className="w-4 h-4 text-amber-500" />
          <span>Upload Surat Tugas (PDF/JPG)</span>
        </button>

        <button
          id="admin-tab-settings"
          onClick={() => setActiveAdminTab('settings')}
          className={`px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 whitespace-nowrap ${
            activeAdminTab === 'settings'
              ? 'bg-blue-50 text-blue-700 font-semibold shadow-2xs border border-blue-200/50'
              : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50 font-medium'
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>Pengaturan Perusahaan & Kop</span>
        </button>

        <button
          id="admin-tab-logs"
          onClick={() => setActiveAdminTab('logs')}
          className={`px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 whitespace-nowrap ${
            activeAdminTab === 'logs'
              ? 'bg-blue-50 text-blue-700 font-semibold shadow-2xs border border-blue-200/50'
              : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50 font-medium'
          }`}
        >
          <History className="w-4 h-4" />
          <span>Log Audit ({auditLogs.length})</span>
        </button>
      </div>

      {/* 4. Tab Views */}
      <div className="animate-in fade-in duration-200">
        {activeAdminTab === 'slips' && <SalaryManagementTable />}
        {activeAdminTab === 'upload' && <ExcelUploadSection onSuccess={() => setActiveAdminTab('slips')} />}
        {activeAdminTab === 'employees' && <EmployeeManagement />}
        {activeAdminTab === 'matrix' && <SalaryMatrixManagement />}
        {activeAdminTab === 'transport-ukk' && <TransportUkkManagement />}
        {activeAdminTab === 'ukk-adjustments' && <UkkAdjustmentManagement />}
        {activeAdminTab === 'attendance' && <AttendanceManagement />}
        {activeAdminTab === 'surat-tugas' && <DutyLetterManagement />}
        {activeAdminTab === 'settings' && <CompanySettings />}
        {activeAdminTab === 'logs' && (
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
            <h2 className="text-base font-bold text-slate-900">Log Aktivitas & Audit Trail</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 uppercase text-[10px] font-bold">
                  <tr>
                    <th className="py-3 px-4">Waktu</th>
                    <th className="py-3 px-4">Aksi</th>
                    <th className="py-3 px-4">Pengguna</th>
                    <th className="py-3 px-4">Rincian</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono">
                  {auditLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50">
                      <td className="py-3 px-4 text-slate-500 whitespace-nowrap">
                        {new Date(log.timestamp).toLocaleString('id-ID')}
                      </td>
                      <td className="py-3 px-4 font-sans font-bold text-slate-900">{log.action}</td>
                      <td className="py-3 px-4 font-sans text-slate-700">{log.user}</td>
                      <td className="py-3 px-4 font-sans text-slate-600">{log.details}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
