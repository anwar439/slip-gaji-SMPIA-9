import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import {
  CompanyProfile,
  Employee,
  SalaryRecord,
  AuditLog,
  SalaryCalculationSource,
  AttendanceRecord,
  DutyLetter,
  TransportUkkRecord,
  UkkAdjustmentRecord,
} from '../types';
import {
  INITIAL_COMPANY_PROFILE,
  INITIAL_EMPLOYEES,
  generateInitialSalaryRecords,
  AVAILABLE_PERIODS,
} from '../data/mockData';
import { INITIAL_SALARY_MATRIX, calculateSalaryMatrixRow } from '../data/salaryMatrixData';
import { generateInitialAttendanceRecords } from '../utils/attendanceGenerator';
import { generateInitialDutyLetters } from '../utils/dutyLetterGenerator';
import {
  INITIAL_TRANSPORT_UKK_RECORDS,
  calculateTransportUkkRow,
} from '../data/mockTransportUkkData';
import {
  INITIAL_UKK_ADJUSTMENTS,
  calculateUkkAdjustmentRow,
} from '../data/mockUkkAdjustmentsData';
import { synchronizeSalaryRecordFromAllSources } from '../utils/salarySynchronizer';

export interface PeriodConfig {
  value: string; // e.g. "2025-01" or custom ID
  label: string; // e.g. "Januari 2025" or custom
  startDate: string; // e.g. "2025-01-01"
  endDate: string; // e.g. "2025-01-31"
  isNew?: boolean;
}

interface SalaryContextType {
  records: SalaryRecord[];
  employees: Employee[];
  salaryMatrix: SalaryCalculationSource[];
  companyProfile: CompanyProfile;
  auditLogs: AuditLog[];
  attendanceRecords: AttendanceRecord[];
  dutyLetters: DutyLetter[];
  transportUkkRecords: TransportUkkRecord[];
  ukkAdjustmentRecords: UkkAdjustmentRecord[];
  selectedPeriod: string;
  setSelectedPeriod: (period: string) => void;
  availablePeriods: PeriodConfig[];
  activeSlipModal: SalaryRecord | null;
  openSlipModal: (record: SalaryRecord) => void;
  closeSlipModal: () => void;
  toast: { message: string; type: 'success' | 'error' | 'info' } | null;
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;

  // Sidebar / Tab Navigation state
  activeAdminTab:
    | 'slips'
    | 'upload'
    | 'employees'
    | 'matrix'
    | 'transport-ukk'
    | 'ukk-adjustments'
    | 'attendance'
    | 'surat-tugas'
    | 'settings'
    | 'logs';
  setActiveAdminTab: (
    tab:
      | 'slips'
      | 'upload'
      | 'employees'
      | 'matrix'
      | 'transport-ukk'
      | 'ukk-adjustments'
      | 'attendance'
      | 'surat-tugas'
      | 'settings'
      | 'logs'
  ) => void;
  activeEmployeeTab: 'ringkasan' | 'riwayat' | 'skema' | 'transport-ukk' | 'ukk-adjustments' | 'absensi' | 'surat-tugas' | 'bantuan';
  setActiveEmployeeTab: (
    tab: 'ringkasan' | 'riwayat' | 'skema' | 'transport-ukk' | 'ukk-adjustments' | 'absensi' | 'surat-tugas' | 'bantuan'
  ) => void;
  isMobileSidebarOpen: boolean;
  setIsMobileSidebarOpen: (open: boolean) => void;

  // Actions
  importSalaryRecords: (newRecords: SalaryRecord[], actionUser?: string) => void;
  addSalaryRecord: (record: SalaryRecord) => void;
  updateSalaryRecord: (record: SalaryRecord) => void;
  togglePublishStatus: (recordId: string) => void;
  publishAllInPeriod: (period: string) => void;
  deleteSalaryRecord: (recordId: string) => void;
  updatePeriodDateRange: (period: string, startDate: string, endDate: string, label?: string) => void;
  updateCompanyProfile: (profile: Partial<CompanyProfile>) => void;
  addEmployee: (employee: Employee) => void;
  updateEmployee: (employee: Employee) => void;
  deleteEmployee: (employeeId: string) => void;
  deleteMultipleEmployees: (employeeIds: string[]) => void;
  importEmployees: (newEmployees: Employee[], replaceAll?: boolean) => void;
  
  // Matrix Actions
  updateSalaryMatrixRow: (row: SalaryCalculationSource) => void;
  addSalaryMatrixRow: (row: Partial<SalaryCalculationSource>) => void;
  deleteSalaryMatrixRow: (id: string) => void;
  importSalaryMatrix: (rows: SalaryCalculationSource[], replaceAll?: boolean) => void;
  updateGlobalUnitValue: (newUnitValue: number) => void;
  syncMatrixToEmployeesAndSlips: () => void;

  // Attendance Actions
  addAttendanceRecord: (record: AttendanceRecord) => void;
  updateAttendanceRecord: (record: AttendanceRecord) => void;
  deleteAttendanceRecord: (id: string) => void;
  importAttendanceRecords: (records: AttendanceRecord[], replaceAll?: boolean) => void;

  // Duty Letters Actions (Surat Tugas)
  addDutyLetter: (letter: DutyLetter) => void;
  updateDutyLetter: (letter: DutyLetter) => void;
  deleteDutyLetter: (id: string) => void;
  importDutyLetters: (letters: DutyLetter[], replaceAll?: boolean) => void;

  // Transport & UKK Actions
  updateTransportUkkRow: (id: string, updates: Partial<TransportUkkRecord>, recalculate?: boolean) => void;
  addTransportUkkRow: (row: Partial<TransportUkkRecord>) => void;
  deleteTransportUkkRow: (id: string) => void;
  importTransportUkkRecords: (records: TransportUkkRecord[], replaceAll?: boolean) => void;
  resetTransportUkkToDefault: () => void;
  syncTransportUkkToSlips: (period?: string) => { syncedCount: number };

  // UKK Adjustments (Tunjangan & Potongan UKK) Actions
  updateUkkAdjustmentRow: (id: string, updates: Partial<UkkAdjustmentRecord>) => void;
  addUkkAdjustmentRow: (row: Partial<UkkAdjustmentRecord>) => void;
  deleteUkkAdjustmentRow: (id: string) => void;
  importUkkAdjustmentRecords: (records: UkkAdjustmentRecord[], replaceAll?: boolean) => void;
  resetUkkAdjustmentsToDefault: () => void;
  syncUkkAdjustmentsToSlips: (period?: string) => { syncedCount: number };
  syncAllSourcesToSlips: (period?: string) => { syncedCount: number };
  autoSyncFromTransportUkk: (period?: string) => { updatedCount: number };

  resetAllData: () => void;

  // Query helpers
  getEmployeeRecords: (employeeId: string, onlyPublished?: boolean) => SalaryRecord[];
  getEmployeeLatestRecord: (employeeId: string) => SalaryRecord | null;
  getPeriodRecords: (period: string) => SalaryRecord[];
  getEmployeeAttendanceRecords: (employeeId: string, period?: string) => AttendanceRecord[];
  getPeriodAttendanceRecords: (period: string) => AttendanceRecord[];
  getCurrentPeriodConfig: () => PeriodConfig;
  getEmployeeTransportUkk: (nipOrName: string, period?: string) => TransportUkkRecord | null;
  getEmployeeUkkAdjustment: (nipOrName: string, period?: string) => UkkAdjustmentRecord | null;
}

const STORAGE_KEY_RECORDS = 'slip_gaji_records_v2';
const STORAGE_KEY_EMPLOYEES = 'slip_gaji_employees_v2';
const STORAGE_KEY_MATRIX = 'slip_gaji_matrix_v2';
const STORAGE_KEY_PROFILE = 'slip_gaji_profile_v2';
const STORAGE_KEY_LOGS = 'slip_gaji_logs_v2';
const STORAGE_KEY_ATTENDANCE = 'slip_gaji_attendance_records_v1';
const STORAGE_KEY_DUTY_LETTERS = 'slip_gaji_duty_letters_v1';
const STORAGE_KEY_TRANSPORT_UKK = 'slip_gaji_transport_ukk_records_v1';
const STORAGE_KEY_UKK_ADJUSTMENTS = 'slip_gaji_ukk_adjustments_v1';


const SalaryContext = createContext<SalaryContextType | undefined>(undefined);

export const SalaryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [records, setRecords] = useState<SalaryRecord[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_RECORDS);
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return generateInitialSalaryRecords();
  });

  const [employees, setEmployees] = useState<Employee[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_EMPLOYEES);
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return INITIAL_EMPLOYEES;
  });

  const [salaryMatrix, setSalaryMatrix] = useState<SalaryCalculationSource[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_MATRIX);
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return INITIAL_SALARY_MATRIX;
  });

  const [companyProfile, setCompanyProfile] = useState<CompanyProfile>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_PROFILE);
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return INITIAL_COMPANY_PROFILE;
  });

  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_LOGS);
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return [
      {
        id: 'log-1',
        timestamp: new Date().toISOString(),
        action: 'Inisialisasi Sistem',
        user: 'System Admin',
        details: 'Data awal penggajian dan karyawan berhasil dimuat.',
        type: 'upload',
      },
    ];
  });

  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_ATTENDANCE);
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return generateInitialAttendanceRecords(INITIAL_EMPLOYEES);
  });

  const [dutyLetters, setDutyLetters] = useState<DutyLetter[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_DUTY_LETTERS);
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return generateInitialDutyLetters(INITIAL_EMPLOYEES);
  });

  const [transportUkkRecords, setTransportUkkRecords] = useState<TransportUkkRecord[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_TRANSPORT_UKK);
      if (saved) {
        const parsed: TransportUkkRecord[] = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.map((r, idx) => calculateTransportUkkRow({ ...r, no: r.no || idx + 1 }));
        }
      }
    } catch {
      // ignore
    }
    return INITIAL_TRANSPORT_UKK_RECORDS.map((r, idx) => calculateTransportUkkRow({ ...r, no: r.no || idx + 1 }));
  });

  const [ukkAdjustmentRecords, setUkkAdjustmentRecords] = useState<UkkAdjustmentRecord[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_UKK_ADJUSTMENTS);
      if (saved) {
        const parsed: UkkAdjustmentRecord[] = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.map((r, idx) => calculateUkkAdjustmentRow({ ...r, no: r.no || idx + 1 }));
        }
      }
    } catch {
      // ignore
    }
    return INITIAL_UKK_ADJUSTMENTS.map((r, idx) => calculateUkkAdjustmentRow({ ...r, no: r.no || idx + 1 }));
  });

  const [selectedPeriod, setSelectedPeriod] = useState<string>('2026-08');
  const [activeAdminTab, setActiveAdminTab] = useState<
    | 'slips'
    | 'upload'
    | 'employees'
    | 'matrix'
    | 'transport-ukk'
    | 'attendance'
    | 'surat-tugas'
    | 'settings'
    | 'logs'
  >('slips');
  const [activeEmployeeTab, setActiveEmployeeTab] = useState<
    'ringkasan' | 'riwayat' | 'skema' | 'transport-ukk' | 'absensi' | 'surat-tugas' | 'bantuan'
  >('ringkasan');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState<boolean>(false);
  const [activeSlipModal, setActiveSlipModal] = useState<SalaryRecord | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  // Custom period configs store
  const [customPeriodConfigs, setCustomPeriodConfigs] = useState<Record<string, { label: string; startDate: string; endDate: string }>>(() => {
    try {
      const saved = localStorage.getItem('slip_gaji_period_configs_v1');
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return {};
  });

  useEffect(() => {
    try {
      localStorage.setItem('slip_gaji_period_configs_v1', JSON.stringify(customPeriodConfigs));
    } catch (e) {
      console.error(e);
    }
  }, [customPeriodConfigs]);

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_RECORDS, JSON.stringify(records));
    } catch (e) {
      console.error(e);
    }
  }, [records]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_EMPLOYEES, JSON.stringify(employees));
    } catch (e) {
      console.error(e);
    }
  }, [employees]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_MATRIX, JSON.stringify(salaryMatrix));
    } catch (e) {
      console.error(e);
    }
  }, [salaryMatrix]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_PROFILE, JSON.stringify(companyProfile));
    } catch (e) {
      console.error(e);
    }
  }, [companyProfile]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_LOGS, JSON.stringify(auditLogs));
    } catch (e) {
      console.error(e);
    }
  }, [auditLogs]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_ATTENDANCE, JSON.stringify(attendanceRecords));
    } catch (e) {
      console.error(e);
    }
  }, [attendanceRecords]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_DUTY_LETTERS, JSON.stringify(dutyLetters));
    } catch (e) {
      console.error(e);
    }
  }, [dutyLetters]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_TRANSPORT_UKK, JSON.stringify(transportUkkRecords));
    } catch (e) {
      console.error(e);
    }
  }, [transportUkkRecords]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_UKK_ADJUSTMENTS, JSON.stringify(ukkAdjustmentRecords));
    } catch (e) {
      console.error(e);
    }
  }, [ukkAdjustmentRecords]);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  const addAuditLog = (action: string, details: string, type: AuditLog['type'], user: string = 'Admin HRD') => {
    const newLog: AuditLog = {
      id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      timestamp: new Date().toISOString(),
      action,
      user,
      details,
      type,
    };
    setAuditLogs((prev) => [newLog, ...prev.slice(0, 49)]);
  };

  const openSlipModal = (record: SalaryRecord) => {
    setActiveSlipModal(record);
  };

  const closeSlipModal = () => {
    setActiveSlipModal(null);
  };

  const addSalaryRecord = (record: SalaryRecord) => {
    setRecords((prev) => {
      // Check if already exists for this employee and period
      const existingIdx = prev.findIndex(
        (r) => r.employeeNip === record.employeeNip && r.period === record.period
      );
      if (existingIdx >= 0) {
        const next = [...prev];
        next[existingIdx] = record;
        return next;
      }
      return [record, ...prev];
    });

    addAuditLog(
      'Tambah Slip Gaji Manual',
      `Menambahkan slip gaji baru manual untuk ${record.employeeName} (${record.employeeNip}) periode ${record.periodLabel}.`,
      'edit'
    );
    showToast(`Slip gaji untuk ${record.employeeName} berhasil disimpan.`, 'success');
  };

  const updatePeriodDateRange = (period: string, startDate: string, endDate: string, customLabel?: string) => {
    // Determine label
    const label = customLabel || `${startDate} s/d ${endDate}`;
    
    setCustomPeriodConfigs((prev) => ({
      ...prev,
      [period]: {
        label,
        startDate,
        endDate,
      },
    }));

    // Update all records for this period to reflect the new start date, end date, and label
    setRecords((prev) =>
      prev.map((r) => {
        if (r.period === period) {
          return {
            ...r,
            periodStartDate: startDate,
            periodEndDate: endDate,
            periodLabel: label,
          };
        }
        return r;
      })
    );

    addAuditLog(
      'Ubah Periode Penggajian',
      `Rentang tanggal periode ${period} diubah menjadi: ${startDate} s/d ${endDate}.`,
      'edit'
    );
    showToast(`Rentang tanggal periode ${label} berhasil diperbarui.`, 'success');
  };

  const importSalaryRecords = (newRecords: SalaryRecord[], actionUser: string = 'Admin HRD') => {
    setRecords((prev) => {
      // Replace existing records with matching employeeId and period, or append new
      const nextRecords = [...prev];
      newRecords.forEach((newRec) => {
        const existingIdx = nextRecords.findIndex(
          (r) => r.employeeNip === newRec.employeeNip && r.period === newRec.period
        );
        if (existingIdx >= 0) {
          nextRecords[existingIdx] = newRec;
        } else {
          nextRecords.push(newRec);
        }
      });
      return nextRecords;
    });

    addAuditLog(
      'Upload Excel Penggajian',
      `Berhasil mengimpor ${newRecords.length} data slip gaji untuk periode ${newRecords[0]?.periodLabel || selectedPeriod}.`,
      'upload',
      actionUser
    );
    showToast(`Berhasil mengimpor ${newRecords.length} data slip gaji!`, 'success');
  };

  const updateSalaryRecord = (updated: SalaryRecord) => {
    setRecords((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
    if (activeSlipModal && activeSlipModal.id === updated.id) {
      setActiveSlipModal(updated);
    }
    addAuditLog('Perbarui Slip Gaji', `Memperbarui rincian slip gaji NIP: ${updated.employeeNip} (${updated.employeeName}) periode ${updated.periodLabel}.`, 'edit');
    showToast('Data slip gaji berhasil diperbarui.', 'success');
  };

  const togglePublishStatus = (recordId: string) => {
    setRecords((prev) =>
      prev.map((r) => {
        if (r.id === recordId) {
          const newStatus = r.status === 'published' ? 'draft' : 'published';
          const nowStr = new Date().toISOString().replace('T', ' ').substr(0, 19);
          return {
            ...r,
            status: newStatus,
            publishedAt: newStatus === 'published' ? nowStr : undefined,
          };
        }
        return r;
      })
    );
    showToast('Status publikasi slip gaji diubah.', 'info');
  };

  const publishAllInPeriod = (period: string) => {
    const nowStr = new Date().toISOString().replace('T', ' ').substr(0, 19);
    setRecords((prev) =>
      prev.map((r) => {
        if (r.period === period) {
          return {
            ...r,
            status: 'published',
            publishedAt: r.publishedAt || nowStr,
          };
        }
        return r;
      })
    );
    addAuditLog('Publikasi Massal', `Mempublikasikan seluruh slip gaji karyawan untuk periode ${period}.`, 'publish');
    showToast(`Semua slip gaji periode ${period} berhasil diterbitkan ke karyawan.`, 'success');
  };

  const deleteSalaryRecord = (recordId: string) => {
    const record = records.find((r) => r.id === recordId);
    setRecords((prev) => prev.filter((r) => r.id !== recordId));
    if (record) {
      addAuditLog('Hapus Slip Gaji', `Menghapus slip ${record.slipNumber} milik ${record.employeeName}.`, 'delete');
    }
    showToast('Slip gaji telah dihapus.', 'info');
  };

  const updateCompanyProfile = (newProfile: Partial<CompanyProfile>) => {
    setCompanyProfile((prev) => ({ ...prev, ...newProfile }));
    addAuditLog('Pengaturan Perusahaan', 'Memperbarui profil perusahaan dan template kop slip gaji.', 'edit');
    showToast('Pengaturan perusahaan berhasil disimpan.', 'success');
  };

  const addEmployee = (employee: Employee) => {
    setEmployees((prev) => [...prev, employee]);
    addAuditLog('Tambah Karyawan', `Menambahkan karyawan baru: ${employee.name} (${employee.nip}).`, 'edit');
    showToast(`Karyawan ${employee.name} berhasil ditambahkan.`, 'success');
  };

  const updateEmployee = (employee: Employee) => {
    setEmployees((prev) => prev.map((e) => (e.id === employee.id ? employee : e)));
    // Also update cached names in records
    setRecords((prev) =>
      prev.map((r) =>
        r.employeeId === employee.id
          ? {
              ...r,
              employeeName: employee.name,
              employeePosition: employee.position,
              employeeDepartment: employee.department,
            }
          : r
      )
    );
    addAuditLog('Perbarui Karyawan', `Memperbarui data karyawan ${employee.name}.`, 'edit');
    showToast('Data karyawan berhasil diperbarui.', 'success');
  };

  const deleteEmployee = (employeeId: string) => {
    const emp = employees.find((e) => e.id === employeeId);
    setEmployees((prev) => prev.filter((e) => e.id !== employeeId));
    if (emp) {
      addAuditLog('Hapus Pegawai', `Menghapus pegawai ${emp.name} (${emp.nip || emp.subject}).`, 'delete');
    }
    showToast('Pegawai telah dihapus dari database.', 'info');
  };

  const deleteMultipleEmployees = (employeeIds: string[]) => {
    if (employeeIds.length === 0) return;
    setEmployees((prev) => prev.filter((e) => !employeeIds.includes(e.id)));
    addAuditLog('Hapus Masal Pegawai', `Menghapus ${employeeIds.length} pegawai dari database.`, 'delete');
    showToast(`${employeeIds.length} data pegawai berhasil dihapus.`, 'info');
  };

  const importEmployees = (newEmployees: Employee[], replaceAll: boolean = false) => {
    if (newEmployees.length === 0) return;

    if (replaceAll) {
      setEmployees(newEmployees);
      addAuditLog('Impor Pegawai (Ganti Semua)', `Mengganti seluruh database dengan ${newEmployees.length} pegawai dari Excel.`, 'upload');
      showToast(`Database berhasil diperbarui dengan ${newEmployees.length} pegawai.`, 'success');
    } else {
      setEmployees((prev) => {
        const existingMap = new Map(prev.map((e) => [e.nip && e.nip !== '-' ? e.nip : e.name.toLowerCase(), e]));
        const merged = [...prev];

        newEmployees.forEach((newEmp) => {
          const key = newEmp.nip && newEmp.nip !== '-' ? newEmp.nip : newEmp.name.toLowerCase();
          const existingIdx = merged.findIndex((e) => (e.nip && e.nip !== '-' ? e.nip === newEmp.nip : e.name.toLowerCase() === newEmp.name.toLowerCase()));
          if (existingIdx >= 0) {
            merged[existingIdx] = { ...merged[existingIdx], ...newEmp, id: merged[existingIdx].id };
          } else {
            merged.push(newEmp);
          }
        });

        return merged;
      });

      addAuditLog('Impor Pegawai Masal', `Mengimpor/memperbarui ${newEmployees.length} pegawai dari Excel.`, 'upload');
      showToast(`${newEmployees.length} data pegawai berhasil diimpor ke sistem.`, 'success');
    }
  };

  const updateSalaryMatrixRow = (updatedRowInput: SalaryCalculationSource) => {
    const recalculated = calculateSalaryMatrixRow(updatedRowInput);
    
    setSalaryMatrix((prev) => {
      const idx = prev.findIndex((r) => r.id === recalculated.id || (r.nip && r.nip === recalculated.nip));
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = { ...recalculated, lastUpdated: new Date().toISOString() };
        return next;
      }
      return [recalculated, ...prev];
    });

    // Auto sync employee base salary if matched
    if (recalculated.nip) {
      setEmployees((prev) =>
        prev.map((emp) =>
          emp.nip && emp.nip.trim() === recalculated.nip.trim()
            ? {
                ...emp,
                baseSalary: recalculated.performanceBasicSalary,
                level: recalculated.level || emp.level,
                employeeStatus: recalculated.employeeStatus || emp.employeeStatus,
                taxStatus: recalculated.taxStatus || emp.taxStatus,
              }
            : emp
        )
      );
    }

    addAuditLog(
      'Ubah Skema Gaji Pegawai',
      `Memperbarui sumber perhitungan gaji pokok untuk ${recalculated.name} (${recalculated.nip}) - Gaji Dibayar: Rp ${recalculated.netSalaryPaid.toLocaleString('id-ID')}`,
      'edit'
    );
    showToast(`Data perhitungan gaji ${recalculated.name} berhasil diperbarui dan tersinkronisasi.`, 'success');
  };

  const updateGlobalUnitValue = (newUnitValue: number) => {
    if (!newUnitValue || newUnitValue <= 0) return;
    setSalaryMatrix((prev) => {
      return prev.map((row) => {
        return calculateSalaryMatrixRow({
          ...row,
          indexValueNew: newUnitValue,
        });
      });
    });

    addAuditLog(
      'Ubah Satuan Indeks Gaji Global',
      `Memperbarui nilai satuan indeks baru menjadi Rp ${newUnitValue.toLocaleString('id-ID')} untuk seluruh pegawai. Seluruh formula gaji pokok otomatis dihitung ulang.`,
      'edit'
    );
    showToast(`Nilai satuan indeks berhasil diubah ke Rp ${newUnitValue.toLocaleString('id-ID')} dan seluruh matriks dihitung ulang secara real-time.`, 'success');
  };

  const addSalaryMatrixRow = (newRowData: Partial<SalaryCalculationSource>) => {
    const fullRow = calculateSalaryMatrixRow(newRowData);
    setSalaryMatrix((prev) => [fullRow, ...prev]);

    addAuditLog(
      'Tambah Baris Skema Gaji',
      `Menambahkan pegawai baru ke skema perhitungan gaji: ${fullRow.name} (${fullRow.nip}).`,
      'edit'
    );
    showToast(`Pegawai ${fullRow.name} berhasil ditambahkan ke skema perhitungan gaji.`, 'success');
  };

  const deleteSalaryMatrixRow = (id: string) => {
    const target = salaryMatrix.find((r) => r.id === id);
    setSalaryMatrix((prev) => prev.filter((r) => r.id !== id));

    if (target) {
      addAuditLog(
        'Hapus Skema Gaji Pegawai',
        `Menghapus data perhitungan gaji pokok untuk ${target.name} (${target.nip}).`,
        'delete'
      );
      showToast(`Data perhitungan gaji ${target.name} telah dihapus.`, 'info');
    }
  };

  const importSalaryMatrix = (rows: SalaryCalculationSource[], replaceAll: boolean = false) => {
    if (rows.length === 0) return;

    if (replaceAll) {
      setSalaryMatrix(rows);
      addAuditLog('Impor Skema Gaji (Ganti Semua)', `Mengganti seluruh skema perhitungan gaji pokok dengan ${rows.length} data.`, 'upload');
      showToast(`Skema perhitungan gaji diperbarui dengan ${rows.length} data pegawai.`, 'success');
    } else {
      setSalaryMatrix((prev) => {
        const merged = [...prev];
        rows.forEach((row) => {
          const idx = merged.findIndex((m) => (m.nip && row.nip ? m.nip === row.nip : m.name.toLowerCase() === row.name.toLowerCase()));
          if (idx >= 0) {
            merged[idx] = { ...merged[idx], ...row, id: merged[idx].id };
          } else {
            merged.push(row);
          }
        });
        return merged;
      });
      addAuditLog('Impor Skema Gaji', `Memperbarui ${rows.length} data pada matriks perhitungan gaji pokok.`, 'upload');
      showToast(`${rows.length} data skema gaji berhasil diimpor & dihitung otomatis.`, 'success');
    }
  };

  // Synchronize the base salary, position allowance, and take-home-pay from the matrix to Employees and Current Period Salary Slips
  const syncMatrixToEmployeesAndSlips = () => {
    let empUpdatedCount = 0;
    let slipUpdatedCount = 0;

    // 1. Sync to Employees (Gaji Pokok & Tunjangan Dasar)
    setEmployees((prevEmployees) => {
      return prevEmployees.map((emp) => {
        const matrixMatch = salaryMatrix.find((m) => m.nip && emp.nip && m.nip.trim() === emp.nip.trim());
        if (matrixMatch) {
          empUpdatedCount++;
          return {
            ...emp,
            baseSalary: matrixMatch.performanceBasicSalary,
            employeeStatus: matrixMatch.employeeStatus || emp.employeeStatus,
            level: matrixMatch.level || emp.level,
            taxStatus: matrixMatch.taxStatus || emp.taxStatus,
            npwp: matrixMatch.npwp || emp.npwp,
          };
        }
        return emp;
      });
    });

    // 2. Sync to Current Period Salary Slips
    setRecords((prevRecords) => {
      return prevRecords.map((slip) => {
        if (slip.period === selectedPeriod) {
          const matrixMatch = salaryMatrix.find((m) => m.nip && slip.employeeNip && m.nip.trim() === slip.employeeNip.trim());
          if (matrixMatch) {
            slipUpdatedCount++;
            const newBasic = matrixMatch.performanceBasicSalary;
            const newPosition = matrixMatch.positionAllowance;
            const newTotalEarnings = matrixMatch.grossSalary;
            const newTotalDeductions = matrixMatch.totalDeduction;
            const newNet = matrixMatch.netSalaryPaid;

            return {
              ...slip,
              basicSalary: newBasic,
              positionAllowance: newPosition,
              bpjsKesehatan: matrixMatch.bpjsKesDeduction,
              bpjsKetenagakerjaan: matrixMatch.bpjsKtDeduction,
              coopDeduction: matrixMatch.coopLoanDeduction,
              totalEarnings: newTotalEarnings,
              totalDeductions: newTotalDeductions,
              netSalary: newNet,
            };
          }
        }
        return slip;
      });
    });

    addAuditLog(
      'Sinkronisasi Matriks Gaji ke Master',
      `Menyinkronkan data perhitungan gaji pokok dari skema Al Azhar ke ${empUpdatedCount} data pegawai dan ${slipUpdatedCount} slip periode ${selectedPeriod}.`,
      'edit'
    );
    showToast(`Sinkronisasi berhasil! ${empUpdatedCount} Pegawai & ${slipUpdatedCount} Slip Gaji telah diperbarui sesuai skema perhitungan.`, 'success');
  };

  // Attendance Management Actions
  const addAttendanceRecord = (record: AttendanceRecord) => {
    setAttendanceRecords((prev) => {
      // If already exists for this employee and period, replace it
      const filtered = prev.filter(
        (a) => !(a.employeeId === record.employeeId && a.period === record.period) && a.id !== record.id
      );
      return [record, ...filtered];
    });

    addAuditLog(
      'Upload Rekap Absensi Pegawai',
      `Mengunggah berkas absensi (${record.fileType.toUpperCase()}) untuk pegawai ${record.employeeName} periode ${record.periodLabel || record.period}.`,
      'upload'
    );
    showToast(`Berkas absensi ${record.employeeName} (${record.periodLabel || record.period}) berhasil disimpan.`, 'success');
  };

  const updateAttendanceRecord = (record: AttendanceRecord) => {
    setAttendanceRecords((prev) => prev.map((a) => (a.id === record.id ? record : a)));
    addAuditLog(
      'Perbarui Data Absensi Pegawai',
      `Memperbarui rincian rekapitulasi absensi untuk pegawai ${record.employeeName} periode ${record.periodLabel || record.period}.`,
      'edit'
    );
    showToast(`Data absensi ${record.employeeName} berhasil diperbarui.`, 'info');
  };

  const deleteAttendanceRecord = (id: string) => {
    const target = attendanceRecords.find((a) => a.id === id);
    setAttendanceRecords((prev) => prev.filter((a) => a.id !== id));
    if (target) {
      addAuditLog(
        'Hapus Berkas Absensi',
        `Menghapus berkas rekap absensi pegawai ${target.employeeName} periode ${target.periodLabel || target.period}.`,
        'delete'
      );
    }
    showToast('Berkas absensi berhasil dihapus.', 'info');
  };

  const importAttendanceRecords = (newRecords: AttendanceRecord[], replaceAll: boolean = false) => {
    if (replaceAll) {
      setAttendanceRecords(newRecords);
    } else {
      setAttendanceRecords((prev) => {
        const existingKeys = new Set(newRecords.map((r) => `${r.employeeId}-${r.period}`));
        const filteredOld = prev.filter((r) => !existingKeys.has(`${r.employeeId}-${r.period}`));
        return [...newRecords, ...filteredOld];
      });
    }
    addAuditLog(
      'Import Masal Berkas Absensi',
      `Berhasil mengunggah ${newRecords.length} berkas absensi pegawai.`,
      'upload'
    );
    showToast(`Berhasil mengunggah ${newRecords.length} berkas absensi.`, 'success');
  };

  const getEmployeeAttendanceRecords = (employeeId: string, period?: string): AttendanceRecord[] => {
    return attendanceRecords
      .filter((a) => a.employeeId === employeeId && (!period || a.period === period))
      .sort((a, b) => b.period.localeCompare(a.period));
  };

  const getPeriodAttendanceRecords = (period: string): AttendanceRecord[] => {
    return attendanceRecords.filter((a) => a.period === period);
  };

  // Duty Letters (Surat Tugas) Actions
  const addDutyLetter = (letter: DutyLetter) => {
    setDutyLetters((prev) => [letter, ...prev]);
    addAuditLog(
      'Upload Surat Tugas',
      `Menerbitkan surat tugas No. ${letter.letterNumber} (${letter.title}) untuk periode ${letter.periodMonth}/${letter.periodYear}.`,
      'upload'
    );
    showToast(`Surat Tugas No. ${letter.letterNumber} berhasil diterbitkan.`, 'success');
  };

  const updateDutyLetter = (letter: DutyLetter) => {
    setDutyLetters((prev) => prev.map((l) => (l.id === letter.id ? letter : l)));
    addAuditLog(
      'Perbarui Surat Tugas',
      `Memperbarui surat tugas No. ${letter.letterNumber} (${letter.title}).`,
      'edit'
    );
    showToast(`Surat Tugas No. ${letter.letterNumber} berhasil diperbarui.`, 'info');
  };

  const deleteDutyLetter = (id: string) => {
    const target = dutyLetters.find((l) => l.id === id);
    setDutyLetters((prev) => prev.filter((l) => l.id !== id));
    if (target) {
      addAuditLog(
        'Hapus Surat Tugas',
        `Menghapus surat tugas No. ${target.letterNumber} (${target.title}).`,
        'delete'
      );
    }
    showToast('Surat Tugas berhasil dihapus.', 'info');
  };

  const importDutyLetters = (newLetters: DutyLetter[], replaceAll: boolean = false) => {
    if (replaceAll) {
      setDutyLetters(newLetters);
    } else {
      setDutyLetters((prev) => {
        const existingIds = new Set(newLetters.map((l) => l.id));
        const filteredOld = prev.filter((l) => !existingIds.has(l.id));
        return [...newLetters, ...filteredOld];
      });
    }
    addAuditLog(
      'Import Masal Surat Tugas',
      `Berhasil mengunggah ${newLetters.length} berkas surat tugas.`,
      'upload'
    );
    showToast(`Berhasil mengunggah ${newLetters.length} berkas surat tugas.`, 'success');
  };

  // --- Transport & UKK Handlers ---
  const updateTransportUkkRow = (
    id: string,
    updates: Partial<TransportUkkRecord>,
    recalculate: boolean = true
  ) => {
    setTransportUkkRecords((prev) =>
      prev.map((row) => {
        if (row.id !== id) return row;
        const merged = { ...row, ...updates, lastUpdated: new Date().toISOString() };
        return recalculate ? calculateTransportUkkRow(merged) : merged;
      })
    );
  };

  const addTransportUkkRow = (row: Partial<TransportUkkRecord>) => {
    const computed = calculateTransportUkkRow({
      ...row,
      no: transportUkkRecords.length + 1,
      period: row.period || selectedPeriod,
    });
    setTransportUkkRecords((prev) => [...prev, computed]);
    addAuditLog(
      'Tambah Baris Transport & UKK',
      `Menambahkan data hitung ${computed.name || 'Pegawai Baru'} (NIP: ${computed.nip}).`,
      'edit'
    );
    showToast(`Baris hitung untuk ${computed.name || 'Pegawai'} berhasil ditambahkan.`, 'success');
  };

  const deleteTransportUkkRow = (id: string) => {
    const target = transportUkkRecords.find((r) => r.id === id);
    setTransportUkkRecords((prev) => prev.filter((r) => r.id !== id));
    if (target) {
      addAuditLog(
        'Hapus Baris Transport & UKK',
        `Menghapus data hitung ${target.name} (NIP: ${target.nip}).`,
        'delete'
      );
    }
    showToast('Baris perhitungan berhasil dihapus.', 'info');
  };

  const importTransportUkkRecords = (
    newRecords: TransportUkkRecord[],
    replaceAll: boolean = false
  ) => {
    const processed = newRecords.map((r, idx) =>
      calculateTransportUkkRow({
        ...r,
        no: r.no || idx + 1,
        period: r.period || selectedPeriod,
      })
    );
    if (replaceAll) {
      setTransportUkkRecords(processed);
    } else {
      setTransportUkkRecords((prev) => {
        const existingIds = new Set(processed.map((r) => r.id));
        const filtered = prev.filter((r) => !existingIds.has(r.id));
        return [...processed, ...filtered];
      });
    }
    addAuditLog(
      'Import Data Transport & UKK',
      `Berhasil mengimpor ${newRecords.length} data perhitungan transport dan UKK.`,
      'upload'
    );
    showToast(`Berhasil mengimpor ${newRecords.length} baris data transport & UKK.`, 'success');
  };

  const resetTransportUkkToDefault = () => {
    setTransportUkkRecords(INITIAL_TRANSPORT_UKK_RECORDS);
    localStorage.setItem(STORAGE_KEY_TRANSPORT_UKK, JSON.stringify(INITIAL_TRANSPORT_UKK_RECORDS));
    addAuditLog(
      'Reset Data Transport & UKK',
      'Mengembalikan data perhitungan transport dan UKK ke format dokumen resmi demo.',
      'edit'
    );
    showToast('Data Transport & UKK dikembalikan ke kondisi default resmi.', 'info');
  };

  // Sync calculated Transport, UKK & Uang Makan into Salary Records
  const syncTransportUkkToSlips = (period?: string): { syncedCount: number } => {
    const targetPeriod = period || selectedPeriod;
    let count = 0;

    setRecords((prevRecords) => {
      return prevRecords.map((slip) => {
        if (slip.period !== targetPeriod) return slip;

        // Find matching transport/UKK record by NIP or Name
        const match = transportUkkRecords.find(
          (tu) =>
            (tu.nip && tu.nip === slip.employeeNip) ||
            (tu.name && tu.name.toLowerCase().trim() === slip.employeeName.toLowerCase().trim())
        );

        if (!match) return slip;
        count++;

        const newAttendance = {
          ...slip.attendance,
          workDays: match.hariKerja || slip.attendance.workDays,
          presentDays: match.jumlahHadir || slip.attendance.presentDays,
          sickDays: match.sakit || slip.attendance.sickDays,
          permissionDays: match.izin || slip.attendance.permissionDays,
          absentDays: match.alpa || slip.attendance.absentDays,
        };

        const newTransport = match.transporDiterima;
        const newMeal = match.uangMakanDiterima;
        const newAttendanceAllowance = match.ukkBruto || match.ukkKotor || match.ukkDiterima; // UKK Bruto
        const newLatePenalty = match.ukkPotongan; // Potongan Keterlambatan/Absen UKK Sesuai Aturan (<5m 50%, >5m 100%)

        const newTotalEarnings =
          slip.basicSalary +
          slip.positionAllowance +
          newTransport +
          newMeal +
          newAttendanceAllowance +
          slip.overtimePay +
          slip.bonusPay +
          slip.thrPay +
          slip.otherEarnings;

        const newTotalDeductions =
          slip.bpjsKetenagakerjaan +
          slip.bpjsKesehatan +
          slip.pph21 +
          newLatePenalty +
          (slip.absencePenalty || 0) +
          slip.loanDeduction +
          slip.coopDeduction +
          slip.otherDeductions;

        const newNetSalary = Math.max(0, newTotalEarnings - newTotalDeductions);

        return {
          ...slip,
          attendance: newAttendance,
          transportAllowance: newTransport,
          mealAllowance: newMeal,
          attendanceAllowance: newAttendanceAllowance,
          latePenalty: newLatePenalty,
          totalEarnings: newTotalEarnings,
          totalDeductions: newTotalDeductions,
          netSalary: newNetSalary,
        };
      });
    });

    addAuditLog(
      'Sinkronisasi Slip Gaji dari Transport & UKK',
      `Menyinkronkan data komponen gaji (${count} pegawai) untuk periode ${targetPeriod}.`,
      'edit'
    );
    showToast(`Berhasil menyinkronkan komponen Transport & UKK untuk ${count} slip gaji.`, 'success');
    return { syncedCount: count };
  };

  const getEmployeeTransportUkk = (nipOrName: string, period?: string): TransportUkkRecord | null => {
    const targetPeriod = period || selectedPeriod;
    const cleanQuery = nipOrName.toLowerCase().trim();
    return (
      transportUkkRecords.find(
        (r) =>
          (r.period === targetPeriod || !r.period) &&
          ((r.nip && r.nip.toLowerCase().trim() === cleanQuery) ||
            (r.name && r.name.toLowerCase().trim() === cleanQuery))
      ) ||
      transportUkkRecords.find(
        (r) =>
          (r.nip && r.nip.toLowerCase().trim() === cleanQuery) ||
          (r.name && r.name.toLowerCase().trim() === cleanQuery)
      ) ||
      null
    );
  };

  // UKK Adjustments Actions (Tunjangan & Potongan UKK)
  const updateUkkAdjustmentRow = (id: string, updates: Partial<UkkAdjustmentRecord>) => {
    setUkkAdjustmentRecords((prev) =>
      prev.map((row) => {
        if (row.id !== id) return row;
        return calculateUkkAdjustmentRow({ ...row, ...updates, lastUpdated: new Date().toISOString() });
      })
    );
    showToast('Data penyesuaian UKK berhasil diperbarui.', 'success');
  };

  const addUkkAdjustmentRow = (row: Partial<UkkAdjustmentRecord>) => {
    const newRecord = calculateUkkAdjustmentRow({
      ...row,
      no: row.no || ukkAdjustmentRecords.length + 1,
      period: row.period || selectedPeriod,
    });
    setUkkAdjustmentRecords((prev) => [...prev, newRecord]);
    addAuditLog('Tambah Penyesuaian UKK', `Menambahkan penyesuaian UKK untuk ${newRecord.name} (${newRecord.nip}).`, 'edit');
    showToast('Data penyesuaian UKK berhasil ditambahkan.', 'success');
  };

  const deleteUkkAdjustmentRow = (id: string) => {
    const target = ukkAdjustmentRecords.find((r) => r.id === id);
    setUkkAdjustmentRecords((prev) => prev.filter((r) => r.id !== id));
    if (target) {
      addAuditLog('Hapus Penyesuaian UKK', `Menghapus penyesuaian UKK untuk ${target.name} (${target.nip}).`, 'delete');
    }
    showToast('Data penyesuaian UKK berhasil dihapus.', 'info');
  };

  const importUkkAdjustmentRecords = (recordsToImport: UkkAdjustmentRecord[], replaceAll: boolean = true) => {
    const calculated = recordsToImport.map((r, idx) =>
      calculateUkkAdjustmentRow({
        ...r,
        no: r.no || idx + 1,
        period: r.period || selectedPeriod,
      })
    );

    if (replaceAll) {
      setUkkAdjustmentRecords(calculated);
    } else {
      setUkkAdjustmentRecords((prev) => {
        const merged = [...prev];
        calculated.forEach((item) => {
          const idx = merged.findIndex(
            (m) => (m.nip && m.nip === item.nip) || (m.name && m.name.toLowerCase().trim() === item.name.toLowerCase().trim())
          );
          if (idx >= 0) {
            merged[idx] = item;
          } else {
            merged.push(item);
          }
        });
        return merged;
      });
    }

    addAuditLog('Impor Penyesuaian UKK', `Mengimpor ${calculated.length} data penyesuaian tunjangan & potongan UKK.`, 'upload');
    showToast(`Berhasil mengimpor ${calculated.length} data penyesuaian UKK.`, 'success');
  };

  const resetUkkAdjustmentsToDefault = () => {
    const defaultData = INITIAL_UKK_ADJUSTMENTS.map((r, idx) => calculateUkkAdjustmentRow({ ...r, no: r.no || idx + 1 }));
    setUkkAdjustmentRecords(defaultData);
    showToast('Data penyesuaian tunjangan & potongan UKK direset ke data awal.', 'info');
  };

  const autoSyncFromTransportUkk = (period?: string): { updatedCount: number } => {
    const targetPeriod = period || selectedPeriod;
    let count = 0;

    setUkkAdjustmentRecords((prev) => {
      return prev.map((adj) => {
        const match = transportUkkRecords.find(
          (tu) =>
            (tu.nip && tu.nip === adj.nip) ||
            (tu.name && tu.name.toLowerCase().trim() === adj.name.toLowerCase().trim())
        );

        if (match) {
          count++;
          return calculateUkkAdjustmentRow({
            ...adj,
            ukkTransportMakan: match.totalJumlahUang || match.grandTotal || adj.ukkTransportMakan,
            lastUpdated: new Date().toISOString(),
          });
        }
        return adj;
      });
    });

    showToast(`Berhasil memperbarui nilai UKK/Transport/Makan untuk ${count} pegawai dari menu Transport & UKK.`, 'success');
    return { updatedCount: count };
  };

  const syncUkkAdjustmentsToSlips = (period?: string): { syncedCount: number } => {
    const targetPeriod = period || selectedPeriod;
    let count = 0;

    setRecords((prevRecords) => {
      return prevRecords.map((slip) => {
        if (slip.period !== targetPeriod) return slip;

        // Find matching UKK adjustment record
        const adjMatch = ukkAdjustmentRecords.find(
          (adj) =>
            (adj.nip && adj.nip === slip.employeeNip) ||
            (adj.name && adj.name.toLowerCase().trim() === slip.employeeName.toLowerCase().trim())
        );

        // Find matching matrix row for official base salary source
        const matrixMatch = salaryMatrix.find(
          (m) =>
            (m.nip && m.nip === slip.employeeNip) ||
            (m.name && m.name.toLowerCase().trim() === slip.employeeName.toLowerCase().trim())
        );

        if (!adjMatch) return slip;
        count++;

        const bankAccountNumber = adjMatch.bankAccountNumber || slip.bankAccountNumber;
        const bankName = adjMatch.bankName || slip.bankName || 'BSI';
        const tunjanganWaliKelas = adjMatch.tunjanganWaliKelas || 0;
        const tunjanganStaffPimpinan = adjMatch.tunjanganStaffPimpinan || 0;
        const tunjanganLainUkk = adjMatch.tunjanganLain || 0;

        const potonganKesra = adjMatch.potonganKesra || 0;
        const potonganKoperasiYpi = adjMatch.potonganKoperasiYpi || 0;
        const potonganKoperasiYwam = adjMatch.potonganKoperasiYwam || 0;
        const potonganYwAmjp = adjMatch.potonganYwAmjp || 0;
        const potonganLainUkk = adjMatch.potonganLain || 0;

        const ukkGrandTotalAwal = adjMatch.ukkTransportMakan;
        const ukkNetAkhirDiterima = adjMatch.jumlahDiterima;
        const sumberGajiPokokAkhir = matrixMatch ? (matrixMatch.netSalaryPaid || matrixMatch.grossSalary) : slip.basicSalary;

        // Update other earnings with explicit UKK additional allowances
        const additionalEarnings = tunjanganWaliKelas + tunjanganStaffPimpinan + tunjanganLainUkk;
        const newOtherEarnings = (slip.otherEarnings || 0) + additionalEarnings;

        // Update deductions
        const newCoopDeduction = potonganKoperasiYpi + potonganKoperasiYwam;
        const newOtherDeductions = (slip.otherDeductions || 0) + potonganKesra + potonganYwAmjp + potonganLainUkk;

        const newTotalEarnings =
          slip.basicSalary +
          slip.positionAllowance +
          slip.transportAllowance +
          slip.mealAllowance +
          slip.attendanceAllowance +
          slip.overtimePay +
          slip.bonusPay +
          slip.thrPay +
          newOtherEarnings;

        const newTotalDeductions =
          slip.bpjsKetenagakerjaan +
          slip.bpjsKesehatan +
          slip.pph21 +
          slip.latePenalty +
          (slip.absencePenalty || 0) +
          slip.loanDeduction +
          newCoopDeduction +
          newOtherDeductions;

        const newNetSalary = Math.max(0, newTotalEarnings - newTotalDeductions);

        return {
          ...slip,
          bankAccountNumber,
          bankName,
          tunjanganWaliKelas,
          tunjanganStaffPimpinan,
          tunjanganLainUkk,
          potonganKesra,
          potonganKoperasiYpi,
          potonganKoperasiYwam,
          potonganYwAmjp,
          potonganLainUkk,
          ukkGrandTotalAwal,
          ukkNetAkhirDiterima,
          sumberGajiPokokAkhir,
          coopDeduction: newCoopDeduction,
          otherDeductions: newOtherDeductions,
          totalEarnings: newTotalEarnings,
          totalDeductions: newTotalDeductions,
          netSalary: newNetSalary,
        };
      });
    });

    addAuditLog(
      'Sinkronisasi Slip Gaji dari Tunjangan & Potongan UKK',
      `Menyinkronkan penyesuaian UKK & No. Rekening (${count} pegawai) untuk periode ${targetPeriod}.`,
      'edit'
    );
    showToast(`Berhasil menyinkronkan penyesuaian UKK & nomor rekening untuk ${count} slip gaji.`, 'success');
    return { syncedCount: count };
  };

  const syncAllSourcesToSlips = (period?: string): { syncedCount: number } => {
    const targetPeriod = period || selectedPeriod;
    let count = 0;

    setRecords((prevRecords) => {
      return prevRecords.map((slip) => {
        if (slip.period !== targetPeriod) return slip;
        count++;
        return synchronizeSalaryRecordFromAllSources(
          slip,
          salaryMatrix,
          transportUkkRecords,
          ukkAdjustmentRecords,
          employees
        );
      });
    });

    addAuditLog(
      'Sinkronisasi Sumber Data Lengkap',
      `Menyinkronkan semua data slip gaji periode ${targetPeriod} dari Master Gaji Pokok & Semua UKK Akhir (${count} pegawai).`,
      'edit'
    );
    showToast(`Berhasil menyinkronkan seluruh data ${count} slip gaji dari Master Gaji Pokok & UKK Akhir!`, 'success');
    return { syncedCount: count };
  };

  const getEmployeeUkkAdjustment = (nipOrName: string, period?: string): UkkAdjustmentRecord | null => {
    const targetPeriod = period || selectedPeriod;
    const cleanQuery = nipOrName.toLowerCase().trim();
    return (
      ukkAdjustmentRecords.find(
        (r) =>
          (r.period === targetPeriod || !r.period) &&
          ((r.nip && r.nip.toLowerCase().trim() === cleanQuery) ||
            (r.name && r.name.toLowerCase().trim() === cleanQuery))
      ) ||
      ukkAdjustmentRecords.find(
        (r) =>
          (r.nip && r.nip.toLowerCase().trim() === cleanQuery) ||
          (r.name && r.name.toLowerCase().trim() === cleanQuery)
      ) ||
      null
    );
  };

  const resetAllData = () => {
    localStorage.removeItem(STORAGE_KEY_RECORDS);
    localStorage.removeItem(STORAGE_KEY_EMPLOYEES);
    localStorage.removeItem(STORAGE_KEY_MATRIX);
    localStorage.removeItem(STORAGE_KEY_PROFILE);
    localStorage.removeItem(STORAGE_KEY_LOGS);
    localStorage.removeItem(STORAGE_KEY_ATTENDANCE);
    localStorage.removeItem(STORAGE_KEY_DUTY_LETTERS);
    localStorage.removeItem(STORAGE_KEY_TRANSPORT_UKK);
    localStorage.removeItem(STORAGE_KEY_UKK_ADJUSTMENTS);
    setRecords(generateInitialSalaryRecords());
    setEmployees(INITIAL_EMPLOYEES);
    setSalaryMatrix(INITIAL_SALARY_MATRIX);
    setCompanyProfile(INITIAL_COMPANY_PROFILE);
    setAttendanceRecords(generateInitialAttendanceRecords(INITIAL_EMPLOYEES));
    setDutyLetters(generateInitialDutyLetters(INITIAL_EMPLOYEES));
    setTransportUkkRecords(INITIAL_TRANSPORT_UKK_RECORDS);
    setUkkAdjustmentRecords(INITIAL_UKK_ADJUSTMENTS);
    setAuditLogs([
      {
        id: `log-${Date.now()}`,
        timestamp: new Date().toISOString(),
        action: 'Reset Data',
        user: 'Admin HRD',
        details: 'Data penggajian, absensi, surat tugas, transport-UKK, dan penyesuaian tunjangan-potongan direset ke kondisi default.',
        type: 'edit',
      },
    ]);
    showToast('Seluruh data berhasil direset ke kondisi default.', 'info');
  };

  const getEmployeeRecords = (employeeId: string, onlyPublished: boolean = true) => {
    return records
      .filter((r) => r.employeeId === employeeId && (!onlyPublished || r.status === 'published'))
      .sort((a, b) => b.period.localeCompare(a.period));
  };

  const getEmployeeLatestRecord = (employeeId: string) => {
    const empRecords = getEmployeeRecords(employeeId, true);
    return empRecords.length > 0 ? empRecords[0] : null;
  };

  const getPeriodRecords = (period: string) => {
    return records.filter((r) => r.period === period);
  };

  // Get distinct list of periods with proper start/end date metadata
  const availablePeriods: PeriodConfig[] = useMemo(() => {
    const periodSet = new Set<string>();
    records.forEach((r) => periodSet.add(r.period));
    AVAILABLE_PERIODS.forEach((p) => periodSet.add(p.value));

    const sortedPeriods = Array.from(periodSet).sort((a, b) => b.localeCompare(a));
    return sortedPeriods.map((p) => {
      const custom = customPeriodConfigs[p];
      if (custom) {
        return {
          value: p,
          label: custom.label,
          startDate: custom.startDate,
          endDate: custom.endDate,
        };
      }

      // Check if records have explicit start/end dates
      const sampleRec = records.find((r) => r.period === p);
      if (sampleRec?.periodStartDate && sampleRec?.periodEndDate) {
        return {
          value: p,
          label: sampleRec.periodLabel || p,
          startDate: sampleRec.periodStartDate,
          endDate: sampleRec.periodEndDate,
        };
      }

      const match = AVAILABLE_PERIODS.find((ap) => ap.value === p);
      const [yearStr, monthStr] = p.split('-');
      const year = parseInt(yearStr, 10) || 2025;
      const month = parseInt(monthStr, 10) || 1;
      const lastDay = new Date(year, month, 0).getDate();
      const defaultStart = `${p}-01`;
      const defaultEnd = `${p}-${String(lastDay).padStart(2, '0')}`;

      return {
        value: p,
        label: match ? match.label : p,
        startDate: defaultStart,
        endDate: defaultEnd,
        isNew: match?.isNew,
      };
    });
  }, [records, customPeriodConfigs]);

  const getCurrentPeriodConfig = (): PeriodConfig => {
    const found = availablePeriods.find((p) => p.value === selectedPeriod);
    if (found) return found;
    const [yearStr, monthStr] = selectedPeriod.split('-');
    const year = parseInt(yearStr, 10) || 2025;
    const month = parseInt(monthStr, 10) || 1;
    const lastDay = new Date(year, month, 0).getDate();
    return {
      value: selectedPeriod,
      label: selectedPeriod,
      startDate: `${selectedPeriod}-01`,
      endDate: `${selectedPeriod}-${String(lastDay).padStart(2, '0')}`,
    };
  };

  return (
    <SalaryContext.Provider
      value={{
        records,
        employees,
        salaryMatrix,
        companyProfile,
        auditLogs,
        attendanceRecords,
        dutyLetters,
        selectedPeriod,
        setSelectedPeriod,
        availablePeriods,
        activeSlipModal,
        openSlipModal,
        closeSlipModal,
        toast,
        showToast,

        activeAdminTab,
        setActiveAdminTab,
        activeEmployeeTab,
        setActiveEmployeeTab,
        isMobileSidebarOpen,
        setIsMobileSidebarOpen,

        importSalaryRecords,
        addSalaryRecord,
        updateSalaryRecord,
        togglePublishStatus,
        publishAllInPeriod,
        deleteSalaryRecord,
        updatePeriodDateRange,
        updateCompanyProfile,
        addEmployee,
        updateEmployee,
        deleteEmployee,
        deleteMultipleEmployees,
        importEmployees,

        updateSalaryMatrixRow,
        addSalaryMatrixRow,
        deleteSalaryMatrixRow,
        importSalaryMatrix,
        updateGlobalUnitValue,
        syncMatrixToEmployeesAndSlips,

        // Attendance Actions
        addAttendanceRecord,
        updateAttendanceRecord,
        deleteAttendanceRecord,
        importAttendanceRecords,

        // Duty Letter Actions
        addDutyLetter,
        updateDutyLetter,
        deleteDutyLetter,
        importDutyLetters,

        // Transport & UKK Actions
        transportUkkRecords,
        updateTransportUkkRow,
        addTransportUkkRow,
        deleteTransportUkkRow,
        importTransportUkkRecords,
        resetTransportUkkToDefault,
        syncTransportUkkToSlips,

        // UKK Adjustment Actions (Tunjangan & Potongan UKK)
        ukkAdjustmentRecords,
        updateUkkAdjustmentRow,
        addUkkAdjustmentRow,
        deleteUkkAdjustmentRow,
        importUkkAdjustmentRecords,
        resetUkkAdjustmentsToDefault,
        syncUkkAdjustmentsToSlips,
        syncAllSourcesToSlips,
        autoSyncFromTransportUkk,

        resetAllData,

        getEmployeeRecords,
        getEmployeeLatestRecord,
        getPeriodRecords,
        getEmployeeAttendanceRecords,
        getPeriodAttendanceRecords,
        getCurrentPeriodConfig,
        getEmployeeTransportUkk,
        getEmployeeUkkAdjustment,
      }}
    >
      {children}
    </SalaryContext.Provider>
  );
};

export const useSalary = () => {
  const context = useContext(SalaryContext);
  if (!context) {
    throw new Error('useSalary must be used within a SalaryProvider');
  }
  return context;
};
