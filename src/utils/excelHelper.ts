import * as XLSX from 'xlsx';
import { Employee, SalaryRecord } from '../types';

export interface ParsedExcelResult {
  success: boolean;
  records: Array<{
    nip: string;
    name: string;
    position: string;
    department: string;
    period: string;
    periodStartDate?: string;
    periodEndDate?: string;
    paymentDate: string;
    attendance: {
      workDays: number;
      presentDays: number;
      sickDays: number;
      permissionDays: number;
      paidLeaveDays: number;
      absentDays: number;
      lateHours: number;
    };
    basicSalary: number;
    dailySalaryRate?: number;
    dailySalaryDays?: number;
    dailySalaryTotal?: number;
    positionAllowance: number;
    transportAllowance: number;
    mealAllowance: number;
    attendanceAllowance: number;
    overtimePay: number;
    bonusPay: number;
    thrPay: number;
    otherEarnings: number;
    otherEarningsNote: string;
    totalEarnings: number;

    bpjsKetenagakerjaan: number;
    bpjsKesehatan: number;
    pph21: number;
    latePenalty: number;
    absencePenalty?: number;
    loanDeduction: number;
    coopDeduction: number;
    otherDeductions: number;
    otherDeductionsNote: string;
    totalDeductions: number;

    netSalary: number;
    notes: string;
    isValid: boolean;
    validationErrors: string[];
  }>;
  totalRows: number;
  validRows: number;
  invalidRows: number;
  errors: string[];
}

/**
 * Downloads a pre-formatted Excel template for easy payroll uploads
 */
export function downloadSalaryTemplateExcel(employees: Employee[], targetPeriod: string = '2025-02') {
  const templateData = employees.map((emp) => {
    const positionAllowance = emp.position.includes('Senior') ? 2500000 : 1500000;
    const transportAllowance = 800000;
    const mealAllowance = 1100000;
    const attendanceAllowance = 500000;
    const bpjsTk = Math.round(emp.baseSalary * 0.03);
    const bpjsKes = Math.round(emp.baseSalary * 0.01);
    const pph21 = Math.round(emp.baseSalary * 0.045);
    const coop = 100000;

    return {
      'NIP': emp.nip,
      'Nama Karyawan': emp.name,
      'Jabatan': emp.position,
      'Departemen': emp.department,
      'Periode (YYYY-MM)': targetPeriod,
      'Tgl Mulai Periode': `${targetPeriod}-01`,
      'Tgl Akhir Periode': `${targetPeriod}-28`,
      'Tanggal Bayar (YYYY-MM-DD)': `${targetPeriod}-25`,
      'Hari Kerja': 22,
      'Hadir': 22,
      'Sakit': 0,
      'Izin': 0,
      'Cuti': 0,
      'Alpha / Mangkir': 0,
      'Jam Terlambat': 0,
      'Gaji Pokok (Rp)': emp.baseSalary,
      'Tarif Gaji Harian (Rp)': 0,
      'Jumlah Hari Harian': 0,
      'Total Gaji Harian (Rp)': 0,
      'Tunjangan Jabatan (Rp)': positionAllowance,
      'Tunjangan Transport (Rp)': transportAllowance,
      'Tunjangan Makan (Rp)': mealAllowance,
      'Tunjangan Kehadiran (Rp)': attendanceAllowance,
      'Lembur (Rp)': 0,
      'Bonus / Insentif (Rp)': 0,
      'THR (Rp)': 0,
      'Pendapatan Lainnya (Rp)': 0,
      'Keterangan Pendapatan Lain': '',
      'BPJS Ketenagakerjaan (Rp)': bpjsTk,
      'BPJS Kesehatan (Rp)': bpjsKes,
      'PPh 21 (Rp)': pph21,
      'Potongan Terlambat (Rp)': 0,
      'Potongan Mangkir (Rp)': 0,
      'Kasbon / Pinjaman (Rp)': 0,
      'Iuran Koperasi (Rp)': coop,
      'Potongan Lainnya (Rp)': 0,
      'Keterangan Potongan Lain': '',
      'Catatan HRD': 'Slip gaji resmi periode ini telah diverifikasi.',
    };
  });

  const worksheet = XLSX.utils.json_to_sheet(templateData);

  // Set column widths for readability
  const colWidths = [
    { wch: 14 }, // NIP
    { wch: 26 }, // Nama
    { wch: 24 }, // Jabatan
    { wch: 22 }, // Departemen
    { wch: 18 }, // Periode
    { wch: 18 }, // Tgl Mulai
    { wch: 18 }, // Tgl Akhir
    { wch: 22 }, // Tanggal Bayar
    { wch: 12 }, // Hari Kerja
    { wch: 10 }, // Hadir
    { wch: 8 },  // Sakit
    { wch: 8 },  // Izin
    { wch: 8 },  // Cuti
    { wch: 14 }, // Alpha
    { wch: 14 }, // Jam Terlambat
    { wch: 16 }, // Gaji Pokok
    { wch: 20 }, // Tarif Harian
    { wch: 18 }, // Hari Harian
    { wch: 20 }, // Total Harian
    { wch: 18 }, // Tunjangan Jabatan
    { wch: 20 }, // Tunjangan Transport
    { wch: 18 }, // Tunjangan Makan
    { wch: 20 }, // Tunjangan Kehadiran
    { wch: 14 }, // Lembur
    { wch: 18 }, // Bonus
    { wch: 14 }, // THR
    { wch: 20 }, // Pendapatan Lain
    { wch: 26 }, // Ket Pendapatan Lain
    { wch: 22 }, // BPJS TK
    { wch: 18 }, // BPJS Kes
    { wch: 14 }, // PPh 21
    { wch: 20 }, // Pot Terlambat
    { wch: 20 }, // Pot Mangkir
    { wch: 20 }, // Kasbon
    { wch: 18 }, // Koperasi
    { wch: 18 }, // Pot Lain
    { wch: 26 }, // Ket Pot Lain
    { wch: 30 }, // Catatan
  ];
  worksheet['!cols'] = colWidths;

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Data_Gaji');

  // Generate binary and download
  XLSX.writeFile(workbook, `Template_Upload_Gaji_${targetPeriod}.xlsx`);
}

/**
 * Normalizes an object key by removing spaces, special chars, and lowercasing
 */
function normalizeKey(key: string): string {
  return key
    .toLowerCase()
    .replace(/[^\w\s]/gi, '')
    .replace(/\s+/g, '_')
    .trim();
}

function parseNumber(val: any): number {
  if (val === undefined || val === null || val === '') return 0;
  if (typeof val === 'number') return Math.max(0, val);
  const cleaned = String(val).replace(/[^0-9.-]+/g, '');
  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? 0 : Math.max(0, parsed);
}

/**
 * Parses uploaded Excel file buffer
 */
export async function parseSalaryExcel(file: File, defaultPeriod: string = '2025-02'): Promise<ParsedExcelResult> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        
        const rawJson: any[] = XLSX.utils.sheet_to_json(worksheet, { defval: '' });

        if (!rawJson || rawJson.length === 0) {
          resolve({
            success: false,
            records: [],
            totalRows: 0,
            validRows: 0,
            invalidRows: 0,
            errors: ['File Excel kosong atau format tidak sesuai.'],
          });
          return;
        }

        const parsedRecords: ParsedExcelResult['records'] = [];
        let validCount = 0;
        let invalidCount = 0;
        const generalErrors: string[] = [];

        rawJson.forEach((row, idx) => {
          const rowNumber = idx + 2; // Accounting for header
          const normalizedRow: Record<string, any> = {};
          
          Object.keys(row).forEach((key) => {
            normalizedRow[normalizeKey(key)] = row[key];
          });

          // Helper getter for multiple possible column aliases
          const getVal = (aliases: string[]): any => {
            for (const alias of aliases) {
              const norm = normalizeKey(alias);
              if (normalizedRow[norm] !== undefined && normalizedRow[norm] !== '') {
                return normalizedRow[norm];
              }
            }
            return '';
          };

          const nip = String(getVal(['nip', 'nomor_induk', 'id_karyawan', 'nik']) || '').trim();
          const name = String(getVal(['nama', 'nama_karyawan', 'employee_name']) || '').trim();
          const position = String(getVal(['jabatan', 'position', 'role']) || '-').trim();
          const department = String(getVal(['departemen', 'divisi', 'department']) || '-').trim();
          const period = String(getVal(['periode', 'period', 'bulan']) || defaultPeriod).trim();
          const periodStartDate = String(getVal(['tgl_mulai_periode', 'start_date', 'dari_tanggal', 'period_start_date']) || `${period}-01`).trim();
          const periodEndDate = String(getVal(['tgl_akhir_periode', 'end_date', 'sampai_tanggal', 'period_end_date']) || `${period}-28`).trim();
          const paymentDate = String(getVal(['tanggal_bayar', 'payment_date', 'tgl_transfer']) || `${period}-25`).trim();

          const workDays = parseNumber(getVal(['hari_kerja', 'work_days'])) || 22;
          const presentDays = parseNumber(getVal(['hadir', 'hari_hadir', 'present_days'])) || workDays;
          const sickDays = parseNumber(getVal(['sakit', 'sick_days'])) || 0;
          const permissionDays = parseNumber(getVal(['izin', 'ijin', 'permission_days'])) || 0;
          const paidLeaveDays = parseNumber(getVal(['cuti', 'leave_days'])) || 0;
          const absentDays = parseNumber(getVal(['alpha', 'alpa', 'mangkir', 'absent_days'])) || 0;
          const lateHours = parseNumber(getVal(['jam_terlambat', 'terlambat', 'late_hours'])) || 0;

          // Earnings
          const basicSalary = parseNumber(getVal(['gaji_pokok', 'basic_salary', 'gapok']));
          
          // Daily wages
          const dailySalaryRate = parseNumber(getVal(['tarif_gaji_harian', 'daily_salary_rate', 'tarif_harian']));
          const dailySalaryDays = parseNumber(getVal(['jumlah_hari_harian', 'daily_salary_days', 'hari_harian']));
          let dailySalaryTotal = parseNumber(getVal(['total_gaji_harian', 'daily_salary_total', 'gaji_harian']));
          if (dailySalaryTotal === 0 && dailySalaryRate > 0 && dailySalaryDays > 0) {
            dailySalaryTotal = dailySalaryRate * dailySalaryDays;
          }

          const positionAllowance = parseNumber(getVal(['tunjangan_jabatan', 'position_allowance']));
          const transportAllowance = parseNumber(getVal(['tunjangan_transport', 'transport_allowance', 'uang_transport']));
          const mealAllowance = parseNumber(getVal(['tunjangan_makan', 'meal_allowance', 'uang_makan']));
          const attendanceAllowance = parseNumber(getVal(['tunjangan_kehadiran', 'attendance_allowance']));
          const overtimePay = parseNumber(getVal(['lembur', 'uang_lembur', 'overtime']));
          const bonusPay = parseNumber(getVal(['bonus', 'insentif', 'bonus_kinerja']));
          const thrPay = parseNumber(getVal(['thr', 'tunjangan_hari_raya']));
          const otherEarnings = parseNumber(getVal(['pendapatan_lain', 'pendapatan_lainnya', 'other_income']));
          const otherEarningsNote = String(getVal(['keterangan_pendapatan_lain', 'ket_pendapatan_lain', 'note_income']) || '');

          const totalEarnings =
            basicSalary +
            dailySalaryTotal +
            positionAllowance +
            transportAllowance +
            mealAllowance +
            attendanceAllowance +
            overtimePay +
            bonusPay +
            thrPay +
            otherEarnings;

          // Deductions
          const bpjsKetenagakerjaan = parseNumber(getVal(['bpjs_ketenagakerjaan', 'bpjs_tk', 'jht', 'bpjstk']));
          const bpjsKesehatan = parseNumber(getVal(['bpjs_kesehatan', 'bpjs_kes', 'bpjskes']));
          const pph21 = parseNumber(getVal(['pph_21', 'pph21', 'pajak_pph21', 'pajak']));
          const latePenalty = parseNumber(getVal(['potongan_terlambat', 'denda_terlambat', 'potongan_absensi']));
          const absencePenalty = parseNumber(getVal(['potongan_mangkir', 'denda_alpha', 'potongan_alpha', 'absence_penalty']));
          const loanDeduction = parseNumber(getVal(['pinjaman_kasbon', 'kasbon', 'pinjaman', 'loan']));
          const coopDeduction = parseNumber(getVal(['iuran_koperasi', 'koperasi', 'potongan_koperasi']));
          const otherDeductions = parseNumber(getVal(['potongan_lain', 'potongan_lainnya', 'other_deductions']));
          const otherDeductionsNote = String(getVal(['keterangan_potongan_lain', 'ket_potongan_lain', 'note_deduction']) || '');

          const totalDeductions =
            bpjsKetenagakerjaan +
            bpjsKesehatan +
            pph21 +
            latePenalty +
            absencePenalty +
            loanDeduction +
            coopDeduction +
            otherDeductions;

          const netSalary = totalEarnings - totalDeductions;
          const notes = String(getVal(['catatan_hrd', 'catatan', 'notes', 'keterangan']) || 'Slip gaji resmi periode ini.');

          const rowErrors: string[] = [];
          if (!nip) rowErrors.push('NIP tidak boleh kosong');
          if (!name) rowErrors.push('Nama Karyawan tidak boleh kosong');
          if (basicSalary <= 0 && dailySalaryTotal <= 0) rowErrors.push('Gaji Pokok atau Gaji Harian harus lebih besar dari 0');
          if (netSalary < 0) rowErrors.push('Total Potongan melebihi Total Pendapatan');

          const isValid = rowErrors.length === 0;
          if (isValid) {
            validCount++;
          } else {
            invalidCount++;
          }

          parsedRecords.push({
            nip,
            name,
            position,
            department,
            period,
            periodStartDate,
            periodEndDate,
            paymentDate,
            attendance: {
              workDays,
              presentDays,
              sickDays,
              permissionDays,
              paidLeaveDays,
              absentDays,
              lateHours,
            },
            basicSalary,
            dailySalaryRate,
            dailySalaryDays,
            dailySalaryTotal,
            positionAllowance,
            transportAllowance,
            mealAllowance,
            attendanceAllowance,
            overtimePay,
            bonusPay,
            thrPay,
            otherEarnings,
            otherEarningsNote,
            totalEarnings,

            bpjsKetenagakerjaan,
            bpjsKesehatan,
            pph21,
            latePenalty,
            absencePenalty,
            loanDeduction,
            coopDeduction,
            otherDeductions,
            otherDeductionsNote,
            totalDeductions,

            netSalary,
            notes,
            isValid,
            validationErrors: rowErrors,
          });
        });

        resolve({
          success: validCount > 0,
          records: parsedRecords,
          totalRows: parsedRecords.length,
          validRows: validCount,
          invalidRows: invalidCount,
          errors: generalErrors,
        });
      } catch (err: any) {
        reject(new Error(`Gagal membaca file Excel: ${err.message || err}`));
      }
    };

    reader.onerror = () => {
      reject(new Error('Gagal membaca file upload.'));
    };

    reader.readAsArrayBuffer(file);
  });
}

/**
 * Export current payroll records to an Excel file
 */
export function exportSalaryRecordsToExcel(records: SalaryRecord[], periodLabel: string) {
  const exportData = records.map((rec) => ({
    'No Slip': rec.slipNumber,
    'NIP': rec.employeeNip,
    'Nama': rec.employeeName,
    'Jabatan': rec.employeePosition,
    'Departemen': rec.employeeDepartment,
    'Periode': rec.periodLabel,
    'Tgl Mulai Periode': rec.periodStartDate || '',
    'Tgl Akhir Periode': rec.periodEndDate || '',
    'Tanggal Bayar': rec.paymentDate,
    'Status': rec.status === 'published' ? 'Terbit' : 'Draft',
    'Gaji Pokok': rec.basicSalary,
    'Gaji Harian Total': rec.dailySalaryTotal || 0,
    'Tunjangan Jabatan': rec.positionAllowance,
    'Tunjangan Transport': rec.transportAllowance,
    'Tunjangan Makan': rec.mealAllowance,
    'Tunjangan Kehadiran': rec.attendanceAllowance,
    'Lembur': rec.overtimePay,
    'Bonus/Insentif': rec.bonusPay,
    'THR': rec.thrPay,
    'Pendapatan Lain': rec.otherEarnings,
    'TOTAL PENDAPATAN': rec.totalEarnings,
    'BPJS TK': rec.bpjsKetenagakerjaan,
    'BPJS Kesehatan': rec.bpjsKesehatan,
    'PPh 21': rec.pph21,
    'Potongan Terlambat': rec.latePenalty,
    'Potongan Mangkir': rec.absencePenalty || 0,
    'Kasbon': rec.loanDeduction,
    'Iuran Koperasi': rec.coopDeduction,
    'Potongan Lain': rec.otherDeductions,
    'TOTAL POTONGAN': rec.totalDeductions,
    'GAJI BERSIH (THP)': rec.netSalary,
  }));

  const worksheet = XLSX.utils.json_to_sheet(exportData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Laporan_Gaji');
  XLSX.writeFile(workbook, `Laporan_Gaji_${periodLabel.replace(/\s+/g, '_')}.xlsx`);
}

export interface ParsedEmployeeExcelResult {
  success: boolean;
  employees: Array<Employee & { isValid: boolean; validationErrors: string[] }>;
  totalRows: number;
  validRows: number;
  invalidRows: number;
  errors: string[];
}

/**
 * Downloads standard Excel template for mass employee upload matching the PDF structure
 */
export function downloadEmployeeTemplateExcel(sampleEmployees?: Employee[]) {
  const defaultList: Partial<Employee>[] = (sampleEmployees && sampleEmployees.length > 0)
    ? sampleEmployees
    : [
        {
          no: 1,
          nip: '102041398',
          nik: '3275071104790022',
          nuptk: '1743752658200002',
          name: 'Amirudin, M.Pd.',
          gender: 'L',
          birthPlace: 'Serang',
          birthDate: '11 April 1979',
          employeeStatus: 'GTY',
          level: 'VI C',
          statusClassification: 'GTY, Gol. VI C',
          subject: 'Bahasa Arab',
          category: 'GURU SMP ISLAM AL AZHAR 9',
          email: 'abuhilyahamir@gmail.com',
          phone: '0813-9869-8655',
        },
        {
          no: 2,
          nip: '107101784',
          nik: '3275022109830026',
          nuptk: '2253761662130153',
          name: 'Andi Krisdianto, S.Pd.I.',
          gender: 'L',
          birthPlace: 'Jakarta',
          birthDate: '21 September 1983',
          employeeStatus: 'GTY',
          level: 'V D',
          statusClassification: 'GTY, Gol. V D',
          subject: 'Pend. Agama Islam',
          category: 'GURU SMP ISLAM AL AZHAR 9',
          email: 'muhandika91@gmail.com',
          phone: '0815-1421-4330',
        },
        {
          no: 1,
          nip: '0899080979086',
          nik: '',
          nuptk: '',
          name: 'Dwi Marjuki, S.Kom.',
          gender: 'L',
          birthPlace: 'Jakarta',
          birthDate: '08 September 1979',
          employeeStatus: 'KTY',
          level: '',
          statusClassification: 'KTY',
          subject: 'Kepala Tata Usaha',
          category: 'TATA USAHA SMP ISLAM AL AZHAR 9',
          email: 'dwimarjuki@gmail.com',
          phone: '0812-9779-6138',
        },
        {
          no: 1,
          nip: '',
          nik: '',
          nuptk: '',
          name: 'Ribad',
          gender: 'L',
          birthPlace: 'Subang',
          birthDate: '09 Juli 1973',
          employeeStatus: 'KTT',
          level: '',
          statusClassification: 'KTT',
          subject: 'Supervisor',
          category: 'JANITOR SMP ISLAM AL AZHAR 9',
          email: 'ribaddirahman@gmail.com',
          phone: '0812-1834-0775',
        },
        {
          no: 1,
          nip: '',
          nik: '',
          nuptk: '',
          name: 'Anwar Sadat',
          gender: 'L',
          birthPlace: 'Palembang',
          birthDate: '18 Juli 1972',
          employeeStatus: 'KTY',
          level: '',
          statusClassification: 'KTY',
          subject: 'Security',
          category: 'SECURITY SMP ISLAM AL AZHAR 9',
          email: 'Bapak19408@gmail.com',
          phone: '0822-9817-7335',
        },
      ];

  const templateData = defaultList.map((emp, index) => ({
    'No': emp.no || index + 1,
    'NIP': emp.nip || '',
    'NIK': emp.nik || '',
    'NUPTK': emp.nuptk || '',
    'N A M E': emp.name,
    'L/P': emp.gender || 'L',
    'PLACE': emp.birthPlace || '',
    'DATE OF BIRTH': emp.birthDate || '',
    'EMPLOYEE STATUS': emp.employeeStatus || 'GTY',
    'LEVEL': emp.level || '',
    'EMPLOYEE STATUS AND CLASSIFICATION': emp.statusClassification || '',
    'SUBJECT': emp.subject || emp.position || '',
    'EMAIL': emp.email,
    'NO. HANDPHONE': emp.phone,
    'KATEGORI': emp.category || 'GURU SMP ISLAM AL AZHAR 9',
    'GAJI POKOK (Rp)': emp.baseSalary || 6000000,
  }));

  const worksheet = XLSX.utils.json_to_sheet(templateData);

  // Styling / Widths
  worksheet['!cols'] = [
    { wch: 6 },  // No
    { wch: 18 }, // NIP
    { wch: 22 }, // NIK
    { wch: 22 }, // NUPTK
    { wch: 30 }, // N A M E
    { wch: 8 },  // L/P
    { wch: 16 }, // PLACE
    { wch: 20 }, // DATE OF BIRTH
    { wch: 18 }, // EMPLOYEE STATUS
    { wch: 10 }, // LEVEL
    { wch: 32 }, // EMPLOYEE STATUS AND CLASSIFICATION
    { wch: 26 }, // SUBJECT
    { wch: 30 }, // EMAIL
    { wch: 20 }, // NO. HANDPHONE
    { wch: 34 }, // KATEGORI
    { wch: 18 }, // GAJI POKOK
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Data_Pegawai');
  XLSX.writeFile(workbook, 'Template_Kelola_Pegawai_Al_Azhar.xlsx');
}

/**
 * Parses uploaded Employee Excel file matching the PDF / custom structure
 */
export async function parseEmployeeExcel(file: File): Promise<ParsedEmployeeExcelResult> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];

        const rawJson: any[] = XLSX.utils.sheet_to_json(worksheet, { defval: '' });

        if (!rawJson || rawJson.length === 0) {
          resolve({
            success: false,
            employees: [],
            totalRows: 0,
            validRows: 0,
            invalidRows: 0,
            errors: ['File Excel pegawai kosong atau format lembar kerja tidak sesuai.'],
          });
          return;
        }

        const parsedEmployees: Array<Employee & { isValid: boolean; validationErrors: string[] }> = [];
        let validCount = 0;
        let invalidCount = 0;
        const generalErrors: string[] = [];

        rawJson.forEach((row, idx) => {
          const rowNumber = idx + 2;
          const normalizedRow: Record<string, any> = {};

          Object.keys(row).forEach((key) => {
            normalizedRow[normalizeKey(key)] = row[key];
          });

          const getVal = (aliases: string[]): any => {
            for (const alias of aliases) {
              const norm = normalizeKey(alias);
              if (normalizedRow[norm] !== undefined && normalizedRow[norm] !== '') {
                return normalizedRow[norm];
              }
            }
            return '';
          };

          const no = parseNumber(getVal(['no', 'nomor', 'num'])) || idx + 1;
          const nip = String(getVal(['nip', 'nomor_induk_pegawai', 'id_pegawai']) || '-').trim();
          const nik = String(getVal(['nik', 'nomor_induk_kependudukan', 'ktp']) || '-').trim();
          const nuptk = String(getVal(['nuptk', 'no_nuptk']) || '-').trim();
          const name = String(getVal(['name', 'n_a_m_e', 'nama', 'nama_lengkap', 'nama_pegawai', 'nama_karyawan']) || '').trim();
          
          let gender = String(getVal(['lp', 'l_p', 'gender', 'jenis_kelamin', 'sex']) || 'L').trim().toUpperCase();
          if (gender.startsWith('P') || gender.startsWith('W')) gender = 'P';
          else gender = 'L';

          const birthPlace = String(getVal(['place', 'tempat_lahir', 'birth_place', 'tempat']) || '-').trim();
          const birthDate = String(getVal(['date_of_birth', 'tanggal_lahir', 'tgl_lahir', 'dob', 'birth_date']) || '-').trim();
          const employeeStatus = String(getVal(['employee_status', 'status_pegawai', 'status_kepegawaian', 'status']) || 'GTY').trim();
          const level = String(getVal(['level', 'golongan', 'gol', 'tingkat']) || '-').trim();
          
          let statusClassification = String(
            getVal([
              'employee_status_and_classification',
              'employee_status_and_classfication',
              'status_dan_klasifikasi',
              'klasifikasi',
              'status_golongan',
            ]) || ''
          ).trim();

          if (!statusClassification) {
            if (level && level !== '-') {
              statusClassification = `${employeeStatus}, Gol. ${level}`;
            } else {
              statusClassification = employeeStatus;
            }
          }

          const subject = String(getVal(['subject', 'mata_pelajaran', 'mapel', 'jabatan', 'posisi', 'tugas']) || 'Staff').trim();
          
          let category = String(getVal(['kategori', 'category', 'unit', 'divisi', 'departemen', 'department']) || '').trim();
          if (!category) {
            // Auto detect from subject or status
            if (employeeStatus.startsWith('G') || subject.toLowerCase().includes('guru') || subject.toLowerCase().includes('bahasa') || subject.toLowerCase().includes('ipa') || subject.toLowerCase().includes('ips') || subject.toLowerCase().includes('matematika') || subject.toLowerCase().includes('agama') || subject.toLowerCase().includes('tahfizh')) {
              category = 'GURU SMP ISLAM AL AZHAR 9';
            } else if (subject.toLowerCase().includes('tata usaha') || subject.toLowerCase().includes('psb') || subject.toLowerCase().includes('pustakawati') || subject.toLowerCase().includes('kantor') || subject.toLowerCase().includes('konsultan')) {
              category = 'TATA USAHA SMP ISLAM AL AZHAR 9';
            } else if (subject.toLowerCase().includes('janitor') || subject.toLowerCase().includes('supervisor') || subject.toLowerCase().includes('kebersihan')) {
              category = 'JANITOR SMP ISLAM AL AZHAR 9';
            } else if (subject.toLowerCase().includes('security') || subject.toLowerCase().includes('satpam') || subject.toLowerCase().includes('keamanan')) {
              category = 'SECURITY SMP ISLAM AL AZHAR 9';
            } else {
              category = 'GURU SMP ISLAM AL AZHAR 9';
            }
          }

          const email = String(getVal(['email', 'surel', 'e_mail']) || `${name.toLowerCase().replace(/[^a-z0-9]/g, '')}@smpia9.sch.id`).trim();
          const phone = String(getVal(['no_handphone', 'nohandphone', 'handphone', 'hp', 'no_hp', 'telepon', 'phone']) || '-').trim();
          const password = String(getVal(['password', 'kata_sandi', 'pass', 'pwd']) || nip || '123456').trim();
          
          const baseSalary = parseNumber(getVal(['gaji_pokok', 'basic_salary', 'gapok', 'gaji'])) || (
            category.includes('GURU') ? 6500000 : category.includes('TATA USAHA') ? 5800000 : 4700000
          );

          const rowErrors: string[] = [];
          if (!name) {
            rowErrors.push(`Baris ${rowNumber}: Nama Pegawai tidak boleh kosong.`);
          }

          const isValid = rowErrors.length === 0;
          if (isValid) {
            validCount++;
          } else {
            invalidCount++;
          }

          const cleanId = `emp-${Date.now()}-${idx}-${Math.random().toString(36).substr(2, 4)}`;

          parsedEmployees.push({
            id: cleanId,
            no,
            nip,
            nik,
            nuptk,
            name,
            gender,
            birthPlace,
            birthDate,
            employeeStatus,
            level,
            statusClassification,
            subject,
            category,
            position: subject,
            department: category,
            email,
            phone,
            password: password || nip || '123456',
            joinDate: '2020-01-01',
            bankName: 'BSI',
            accountNumber: '7102-9381-00',
            taxStatus: 'K/1',
            employmentStatus: employeeStatus.includes('TT') || employeeStatus.includes('CPG') ? 'Kontrak' : 'Tetap',
            baseSalary,
            isValid,
            validationErrors: rowErrors,
          });
        });

        resolve({
          success: validCount > 0,
          employees: parsedEmployees,
          totalRows: parsedEmployees.length,
          validRows: validCount,
          invalidRows: invalidCount,
          errors: generalErrors,
        });
      } catch (err: any) {
        reject(new Error(`Gagal membaca file Excel Pegawai: ${err.message || err}`));
      }
    };

    reader.onerror = () => {
      reject(new Error('Gagal membaca file upload.'));
    };

    reader.readAsArrayBuffer(file);
  });
}

/**
 * Export all employee master data to Excel matching the PDF layout
 */
export function exportEmployeesToExcel(employees: Employee[]) {
  const exportData = employees.map((emp, index) => ({
    'No': emp.no || index + 1,
    'NIP': emp.nip || '-',
    'NIK': emp.nik || '-',
    'NUPTK': emp.nuptk || '-',
    'N A M E': emp.name,
    'L/P': emp.gender || 'L',
    'PLACE': emp.birthPlace || '-',
    'DATE OF BIRTH': emp.birthDate || '-',
    'EMPLOYEE STATUS': emp.employeeStatus || '-',
    'LEVEL': emp.level || '-',
    'EMPLOYEE STATUS AND CLASSIFICATION': emp.statusClassification || '-',
    'SUBJECT': emp.subject || emp.position || '-',
    'EMAIL': emp.email,
    'NO. HANDPHONE': emp.phone,
    'KATEGORI': emp.category || emp.department || '-',
    'GAJI POKOK (Rp)': emp.baseSalary,
  }));

  const worksheet = XLSX.utils.json_to_sheet(exportData);

  worksheet['!cols'] = [
    { wch: 6 },  // No
    { wch: 18 }, // NIP
    { wch: 22 }, // NIK
    { wch: 22 }, // NUPTK
    { wch: 30 }, // N A M E
    { wch: 8 },  // L/P
    { wch: 16 }, // PLACE
    { wch: 20 }, // DATE OF BIRTH
    { wch: 18 }, // EMPLOYEE STATUS
    { wch: 10 }, // LEVEL
    { wch: 32 }, // EMPLOYEE STATUS AND CLASSIFICATION
    { wch: 26 }, // SUBJECT
    { wch: 30 }, // EMAIL
    { wch: 20 }, // NO. HANDPHONE
    { wch: 34 }, // KATEGORI
    { wch: 18 }, // GAJI POKOK
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Database_Pegawai');
  XLSX.writeFile(workbook, `Data_Pegawai_SMP_Al_Azhar_9_${new Date().toISOString().split('T')[0]}.xlsx`);
}
