import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useSalary } from '../context/SalaryContext';
import { formatRupiah } from '../utils/currencyFormatter';
import {
  FileText,
  UploadCloud,
  Users,
  Building2,
  History,
  ShieldCheck,
  User,
  ArrowRightLeft,
  Calendar,
  RotateCcw,
  Sparkles,
  CheckCircle2,
  CreditCard,
  HelpCircle,
  Clock,
  X,
  FileSpreadsheet,
  Calculator,
  CalendarCheck,
  Briefcase,
  Bus,
  BadgePercent,
  Coins,
  LogOut,
  School,
} from 'lucide-react';

interface SidebarProps {
  onOpenPeriodModal?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ onOpenPeriodModal }) => {
  const { role, currentUser, currentEmployee, setIsSwitcherOpen, logout } = useAuth();
  const {
    records,
    employees,
    companyProfile,
    dutyLetters,
    selectedPeriod,
    availablePeriods,
    activeAdminTab,
    setActiveAdminTab,
    activeEmployeeTab,
    setActiveEmployeeTab,
    isMobileSidebarOpen,
    setIsMobileSidebarOpen,
    resetAllData,
    getCurrentPeriodConfig,
  } = useSalary();

  const currentPeriodConfig = getCurrentPeriodConfig();
  const periodRecords = records.filter((r) => r.period === selectedPeriod);
  const employeeLatest = currentEmployee ? records.find((r) => r.employeeId === currentEmployee.id && r.period === selectedPeriod) : null;

  const handleNavClick = (tab: any) => {
    if (role === 'admin') {
      setActiveAdminTab(tab);
    } else {
      setActiveEmployeeTab(tab);
    }
    setIsMobileSidebarOpen(false);
  };

  const navContent = (
    <div className="flex flex-col h-full justify-between p-4 overflow-y-auto">
      {/* Top section: Logo & Profile */}
      <div className="space-y-4">
        {/* Brand Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-3">
            {companyProfile.schoolLogoUrl ? (
              <img
                src={companyProfile.schoolLogoUrl}
                alt="Logo SMPI Al Azhar 9"
                className="w-9 h-9 object-contain rounded-xl p-0.5 bg-slate-50 border border-slate-200"
              />
            ) : (
              <div className="w-9 h-9 bg-emerald-700 rounded-xl flex items-center justify-center text-white font-bold text-sm shadow-xs border border-emerald-600">
                A9
              </div>
            )}
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-sm tracking-tight text-slate-900 leading-none">
                  slip gaji id
                </span>
                <span className="text-[9px] bg-emerald-100 text-emerald-800 border border-emerald-300/70 px-1.5 py-0.2 rounded-full font-bold uppercase">
                  SMPIA 9
                </span>
              </div>
              <p className="text-[11px] text-emerald-800 font-semibold truncate max-w-[170px]" title={companyProfile.schoolName || 'SMP Islam Al Azhar 9'}>
                {companyProfile.schoolName || 'SMP Islam Al Azhar 9'}
              </p>
            </div>
          </div>

          {/* Close button for mobile drawer */}
          <button
            onClick={() => setIsMobileSidebarOpen(false)}
            className="p-1.5 text-slate-400 hover:text-slate-700 md:hidden rounded-lg hover:bg-slate-100"
            aria-label="Tutup Menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* User Role Card & Switch Button */}
        <div className="p-3 bg-slate-50/80 rounded-2xl border border-slate-200 space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div
                className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold ${
                  role === 'admin' ? 'bg-slate-900 text-white' : 'bg-blue-600 text-white'
                }`}
              >
                {role === 'admin' ? (
                  <ShieldCheck className="w-4 h-4" />
                ) : (
                  <User className="w-4 h-4" />
                )}
              </div>
              <div>
                <div className="text-xs font-bold text-slate-900 leading-tight">
                  {role === 'admin' ? 'Portal Admin HRD' : 'Portal Karyawan'}
                </div>
                <div className="text-[10px] text-slate-500 font-mono truncate max-w-[140px]">
                  {role === 'admin' ? currentUser.email : currentEmployee?.nip}
                </div>
              </div>
            </div>

            <span className="text-[9px] bg-white border border-slate-200 text-slate-700 px-1.5 py-0.5 rounded-md font-bold uppercase">
              {role === 'admin' ? 'Admin' : 'Pegawai'}
            </span>
          </div>

          {/* Active User Name for employee */}
          {role === 'employee' && currentEmployee && (
            <div className="text-xs font-semibold text-slate-800 bg-white p-2 rounded-xl border border-slate-200/70">
              <div className="text-[10px] text-slate-400 font-medium">Nama Pegawai:</div>
              <div className="truncate font-bold text-slate-900">{currentEmployee.name}</div>
              <div className="text-[10px] text-slate-500">{currentEmployee.position}</div>
            </div>
          )}

          {/* Ganti Akun Button */}
          <button
            id="btn-sidebar-role-switch"
            onClick={() => {
              setIsSwitcherOpen(true);
              setIsMobileSidebarOpen(false);
            }}
            className="w-full py-1.5 px-2.5 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl text-[11px] font-bold text-slate-700 flex items-center justify-center gap-1.5 transition-all shadow-2xs hover:border-slate-300"
          >
            <ArrowRightLeft className="w-3 h-3 text-blue-600" />
            <span>Ganti Akun / Peran</span>
          </button>
        </div>

        {/* Periode Widget with Date Range */}
        <div className="p-3 bg-blue-50/50 rounded-2xl border border-blue-100 space-y-1.5">
          <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-blue-800">
            <div className="flex items-center gap-1">
              <Calendar className="w-3 h-3 text-blue-600" />
              <span>Periode Penggajian</span>
            </div>
            {onOpenPeriodModal && role === 'admin' && (
              <button
                onClick={onOpenPeriodModal}
                className="text-[10px] text-blue-600 hover:text-blue-800 underline font-semibold cursor-pointer"
              >
                Ubah Tgl
              </button>
            )}
          </div>
          <div className="text-xs font-black text-slate-900">
            {currentPeriodConfig.label}
          </div>
          <div className="text-[10px] text-slate-600 font-mono bg-white/80 px-2 py-1 rounded-lg border border-blue-200/50 flex items-center justify-between">
            <span>{currentPeriodConfig.startDate || `${selectedPeriod}-01`}</span>
            <span className="text-slate-400">s/d</span>
            <span>{currentPeriodConfig.endDate || `${selectedPeriod}-28`}</span>
          </div>
        </div>

        {/* Navigation Menu */}
        <div className="space-y-1 pt-1">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-3 py-1">
            Menu Utama
          </div>

          {role === 'admin' ? (
            /* Admin Navigation Items */
            <>
              <button
                id="sidebar-tab-slips"
                onClick={() => handleNavClick('slips')}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  activeAdminTab === 'slips'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <FileText className="w-4 h-4" />
                  <span>Manajemen Slip Gaji</span>
                </div>
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded-md font-mono ${
                    activeAdminTab === 'slips'
                      ? 'bg-blue-700 text-white'
                      : 'bg-slate-200 text-slate-700'
                  }`}
                >
                  {periodRecords.length}
                </span>
              </button>

              <button
                id="sidebar-tab-upload"
                onClick={() => handleNavClick('upload')}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  activeAdminTab === 'upload'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <UploadCloud className="w-4 h-4" />
                  <span>Upload File Excel</span>
                </div>
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded-md font-mono ${
                    activeAdminTab === 'upload'
                      ? 'bg-blue-700 text-white'
                      : 'bg-emerald-100 text-emerald-800'
                  }`}
                >
                  Excel
                </span>
              </button>

              <button
                id="sidebar-tab-employees"
                onClick={() => handleNavClick('employees')}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  activeAdminTab === 'employees'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Users className="w-4 h-4" />
                  <span>Kelola Pegawai</span>
                </div>
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded-md font-mono ${
                    activeAdminTab === 'employees'
                      ? 'bg-blue-700 text-white'
                      : 'bg-slate-200 text-slate-700'
                  }`}
                >
                  {employees.length}
                </span>
              </button>

              {/* Dedicated Menu: Sumber Penghitungan Gaji Pokok */}
              <button
                id="sidebar-tab-matrix"
                onClick={() => handleNavClick('matrix')}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  activeAdminTab === 'matrix'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Calculator className="w-4 h-4 text-emerald-500" />
                  <span>Sumber Hitung Gaji</span>
                </div>
                <span
                  className={`text-[9px] px-1.5 py-0.5 rounded-md font-bold uppercase ${
                    activeAdminTab === 'matrix'
                      ? 'bg-blue-700 text-white'
                      : 'bg-emerald-100 text-emerald-800'
                  }`}
                >
                  Master
                </span>
              </button>

              {/* Dedicated Menu: Sumber Penghitungan Transport & UKK */}
              <button
                id="sidebar-tab-transport-ukk"
                onClick={() => handleNavClick('transport-ukk')}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  activeAdminTab === 'transport-ukk'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Bus className="w-4 h-4 text-amber-500" />
                  <span>Hitung Transport & UKK</span>
                </div>
                <span
                  className={`text-[9px] px-1.5 py-0.5 rounded-md font-bold uppercase ${
                    activeAdminTab === 'transport-ukk'
                      ? 'bg-emerald-700 text-white'
                      : 'bg-amber-100 text-amber-800'
                  }`}
                >
                  Otomatis
                </span>
              </button>

              {/* Dedicated Menu: Tunjangan & Potongan Tambahan UKK */}
              <button
                id="sidebar-tab-ukk-adjustments"
                onClick={() => handleNavClick('ukk-adjustments')}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  activeAdminTab === 'ukk-adjustments'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <BadgePercent className="w-4 h-4 text-emerald-500" />
                  <span>Tunjangan & Potongan UKK</span>
                </div>
                <span
                  className={`text-[9px] px-1.5 py-0.5 rounded-md font-bold uppercase ${
                    activeAdminTab === 'ukk-adjustments'
                      ? 'bg-emerald-700 text-white'
                      : 'bg-emerald-100 text-emerald-800'
                  }`}
                >
                  Penyesuaian
                </span>
              </button>

              {/* Dedicated Menu: Upload & Rekap Absensi Pegawai (PDF/JPG) */}
              <button
                id="sidebar-tab-attendance"
                onClick={() => handleNavClick('attendance')}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  activeAdminTab === 'attendance'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <CalendarCheck className="w-4 h-4 text-blue-500" />
                  <span>Upload & Rekap Absensi</span>
                </div>
                <span
                  className={`text-[9px] px-1.5 py-0.5 rounded-md font-bold uppercase ${
                    activeAdminTab === 'attendance'
                      ? 'bg-blue-700 text-white'
                      : 'bg-blue-100 text-blue-800'
                  }`}
                >
                  PDF/JPG
                </span>
              </button>

              {/* Dedicated Menu: Upload & Manajemen Surat Tugas (PDF/JPG) */}
              <button
                id="sidebar-tab-surat-tugas"
                onClick={() => handleNavClick('surat-tugas')}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  activeAdminTab === 'surat-tugas'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Briefcase className="w-4 h-4 text-amber-500" />
                  <span>Upload Surat Tugas</span>
                </div>
                <span
                  className={`text-[9px] px-1.5 py-0.5 rounded-md font-bold uppercase ${
                    activeAdminTab === 'surat-tugas'
                      ? 'bg-blue-700 text-white'
                      : 'bg-amber-100 text-amber-800'
                  }`}
                >
                  {dutyLetters.length} Surat
                </span>
              </button>

              <button
                id="sidebar-tab-settings"
                onClick={() => handleNavClick('settings')}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  activeAdminTab === 'settings'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Building2 className="w-4 h-4" />
                  <span>Kop & Profil Perusahaan</span>
                </div>
              </button>

              <button
                id="sidebar-tab-logs"
                onClick={() => handleNavClick('logs')}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  activeAdminTab === 'logs'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <History className="w-4 h-4" />
                  <span>Log Aktivitas</span>
                </div>
              </button>
            </>
          ) : (
            /* Employee Navigation Items */
            <>
              <button
                id="sidebar-tab-emp-current"
                onClick={() => handleNavClick('ringkasan')}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  activeEmployeeTab === 'ringkasan'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <CreditCard className="w-4 h-4" />
                  <span>Slip Gaji Bulan Ini</span>
                </div>
                {employeeLatest && (
                  <span
                    className={`text-[9px] px-1.5 py-0.5 rounded font-mono ${
                      activeEmployeeTab === 'ringkasan'
                        ? 'bg-blue-700 text-white'
                        : 'bg-emerald-100 text-emerald-800'
                    }`}
                  >
                    Tersedia
                  </span>
                )}
              </button>

              {/* Dedicated Employee Salary Formula & Process Breakdown Menu */}
              <button
                id="sidebar-tab-emp-matrix"
                onClick={() => handleNavClick('skema')}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  activeEmployeeTab === 'skema'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Calculator className="w-4 h-4 text-emerald-500" />
                  <span>Sumber & Alur Gaji Pokok</span>
                </div>
                <span
                  className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider ${
                    activeEmployeeTab === 'skema'
                      ? 'bg-blue-700 text-white'
                      : 'bg-blue-100 text-blue-800'
                  }`}
                >
                  Formula
                </span>
              </button>

              {/* Dedicated Employee Transport & UKK Calculation Breakdown */}
              <button
                id="sidebar-tab-emp-transport-ukk"
                onClick={() => handleNavClick('transport-ukk')}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  activeEmployeeTab === 'transport-ukk'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Bus className="w-4 h-4 text-amber-500" />
                  <span>Rincian Transport & UKK</span>
                </div>
                <span
                  className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider ${
                    activeEmployeeTab === 'transport-ukk'
                      ? 'bg-emerald-700 text-white'
                      : 'bg-amber-100 text-amber-800'
                  }`}
                >
                  Rincian
                </span>
              </button>

              {/* Dedicated Employee UKK Adjustment Breakdown (Tunjangan & Potongan) */}
              <button
                id="sidebar-tab-emp-ukk-adjustments"
                onClick={() => handleNavClick('ukk-adjustments')}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  activeEmployeeTab === 'ukk-adjustments'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <BadgePercent className="w-4 h-4 text-emerald-500" />
                  <span>Penyesuaian & Rekening UKK</span>
                </div>
                <span
                  className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider ${
                    activeEmployeeTab === 'ukk-adjustments'
                      ? 'bg-emerald-700 text-white'
                      : 'bg-emerald-100 text-emerald-800'
                  }`}
                >
                  Transfer
                </span>
              </button>

              {/* Dedicated Employee Attendance Document Menu (Pegawai hanya melihat miliknya) */}
              <button
                id="sidebar-tab-emp-absensi"
                onClick={() => handleNavClick('absensi')}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  activeEmployeeTab === 'absensi'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <CalendarCheck className="w-4 h-4 text-blue-500" />
                  <span>Data Rekap Absensi</span>
                </div>
                <span
                  className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider ${
                    activeEmployeeTab === 'absensi'
                      ? 'bg-blue-700 text-white'
                      : 'bg-emerald-100 text-emerald-800'
                  }`}
                >
                  PDF/JPG
                </span>
              </button>

              {/* Dedicated Employee Duty Letters Menu (Lihat Surat Tugas) */}
              <button
                id="sidebar-tab-emp-surat-tugas"
                onClick={() => handleNavClick('surat-tugas')}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  activeEmployeeTab === 'surat-tugas'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Briefcase className="w-4 h-4 text-amber-500" />
                  <span>Surat Tugas Bulanan</span>
                </div>
                <span
                  className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider ${
                    activeEmployeeTab === 'surat-tugas'
                      ? 'bg-blue-700 text-white'
                      : 'bg-amber-100 text-amber-800'
                  }`}
                >
                  {dutyLetters.length} Surat
                </span>
              </button>

              <button
                id="sidebar-tab-emp-history"
                onClick={() => handleNavClick('riwayat')}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  activeEmployeeTab === 'riwayat'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Calendar className="w-4 h-4" />
                  <span>Riwayat & Arsip Slip</span>
                </div>
              </button>

              <button
                id="sidebar-tab-emp-support"
                onClick={() => handleNavClick('bantuan')}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  activeEmployeeTab === 'bantuan'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <HelpCircle className="w-4 h-4" />
                  <span>Bantuan & Kontak HRD</span>
                </div>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Bottom section: Logout & System Status */}
      <div className="pt-3 border-t border-slate-200 space-y-2">
        <button
          onClick={logout}
          className="w-full py-2.5 px-3 text-rose-600 hover:text-rose-700 hover:bg-rose-50 border border-transparent hover:border-rose-200 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-2"
          title="Keluar dari akun saat ini"
        >
          <LogOut className="w-4 h-4" />
          <span>Keluar / Logout</span>
        </button>

        <div className="px-3 py-2 bg-slate-50 rounded-xl border border-slate-200/60 text-[10px] text-slate-500 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="font-semibold text-slate-700">SMPI Al Azhar 9 Siap</span>
          </div>
          <span className="font-mono text-slate-400">v2.5</span>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* 1. Desktop Fixed Left Sidebar (Does NOT scroll with page) */}
      <aside
        id="desktop-fixed-sidebar"
        className="fixed top-0 bottom-0 left-0 w-64 lg:w-72 bg-white border-r border-slate-200 z-40 hidden md:flex flex-col select-none"
      >
        {navContent}
      </aside>

      {/* 2. Mobile Drawer Sidebar (with backdrop) */}
      {isMobileSidebarOpen && (
        <div
          id="mobile-sidebar-drawer-backdrop"
          className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs md:hidden flex"
          onClick={() => setIsMobileSidebarOpen(false)}
        >
          <div
            className="w-72 max-w-[85vw] bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-left duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {navContent}
          </div>
        </div>
      )}
    </>
  );
};
