export type UserRole = 'admin' | 'employee';

export interface Employee {
  id: string;
  no?: number;
  nip: string; // Nomor Induk Pegawai
  nik?: string; // Nomor Induk Kependudukan
  nuptk?: string; // NUPTK
  name: string; // N A M E
  gender?: 'L' | 'P' | string; // L/P
  birthPlace?: string; // PLACE
  birthDate?: string; // DATE OF BIRTH
  employeeStatus?: string; // EMPLOYEE STATUS (GTY, GTYK, CPG, GTT, KTY, KTT)
  level?: string; // LEVEL (VI C, V D, V B, V A, dll)
  statusClassification?: string; // EMPLOYEE STATUS AND CLASSIFICATION (e.g. GTY, Gol. VI C)
  subject?: string; // SUBJECT / MATA PELAJARAN / JABATAN
  category?: 'GURU' | 'TATA USAHA' | 'JANITOR' | 'SECURITY' | string; // Unit Kategori
  email: string;
  phone: string;
  position: string; // Jabatan / Subject
  department: string; // Unit / Kategori
  joinDate?: string; // YYYY-MM-DD
  bankName?: string; // e.g. "BCA", "Mandiri", "BRI", "BNI", "BSI"
  accountNumber?: string;
  taxStatus?: string; // PTKP: TK/0, K/0, K/1, K/2, K/3
  npwp?: string;
  employmentStatus?: 'Tetap' | 'Kontrak' | 'Probation' | 'Magang' | string;
  avatarUrl?: string;
  baseSalary: number; // Standard basic salary
  dailyRate?: number; // Tarif harian jika berlaku
  password?: string; // Password login mandiri pegawai (diisi/dikelola Admin)
}

export interface AttendanceData {
  workDays: number; // Hari kerja normal sebulan (e.g. 22)
  presentDays: number; // Hadir
  sickDays: number; // Sakit
  permissionDays: number; // Izin
  paidLeaveDays: number; // Cuti
  absentDays: number; // Alpha / Tanpa Keterangan
  lateHours: number; // Jam Keterlambatan (jam/menit)
}

export interface SalaryRecord {
  id: string;
  slipNumber: string; // e.g. "SLIP/202501/EMP-001"
  employeeId: string;
  employeeNip: string;
  employeeName: string;
  employeePosition: string;
  employeeDepartment: string;
  period: string; // Format "YYYY-MM" e.g. "2025-01" or custom ID
  periodLabel: string; // e.g. "Januari 2025" or "01/01/2026 - 31/01/2026"
  periodStartDate?: string; // Format "YYYY-MM-DD" e.g. "2026-01-01"
  periodEndDate?: string; // Format "YYYY-MM-DD" e.g. "2026-01-31"
  paymentDate: string; // Format "YYYY-MM-DD" e.g. "2025-01-25"
  status: 'draft' | 'published';
  attendance: AttendanceData;

  // 1. PENDAPATAN (EARNINGS)
  basicSalary: number; // Gaji Pokok
  dailySalaryRate?: number; // Tarif Gaji Harian per hari (Rp)
  dailySalaryDays?: number; // Jumlah Hari Gaji Harian (hari)
  dailySalaryTotal?: number; // Total Gaji Harian (Tarif x Hari)
  positionAllowance: number; // Tunjangan Jabatan
  transportAllowance: number; // Tunjangan Transport
  mealAllowance: number; // Tunjangan Uang Makan
  attendanceAllowance: number; // Tunjangan Kehadiran
  overtimePay: number; // Upah Lembur
  bonusPay: number; // Bonus Kinerja / Insentif
  thrPay: number; // Tunjangan Hari Raya (THR)
  otherEarnings: number; // Pendapatan Lainnya
  otherEarningsNote?: string;
  totalEarnings: number; // Total Pendapatan Kotor (Bruto)

  // 2. POTONGAN (DEDUCTIONS)
  bpjsKetenagakerjaan: number; // BPJS TK (JHT 2% + JP 1%)
  bpjsKesehatan: number; // BPJS Kesehatan (1%)
  pph21: number; // Pajak PPh Pasal 21
  latePenalty: number; // Potongan Keterlambatan
  absencePenalty?: number; // Potongan Alpha / Mangkir
  loanDeduction: number; // Potongan Kasbon / Pinjaman
  coopDeduction: number; // Iuran Koperasi / Simpan Pinjam
  otherDeductions: number; // Potongan Lainnya
  otherDeductionsNote?: string;
  totalDeductions: number; // Total Potongan

  // 3. HASIL AKHIR (TAKE HOME PAY)
  netSalary: number; // Gaji Bersih (Total Earnings - Total Deductions)
  notes?: string;
  publishedAt?: string;
  uploadedAt: string;

  // 4. PENYESUAIAN TAMBAHAN TUNJANGAN & POTONGAN UKK (Rekapitulasi Akhir)
  bankAccountNumber?: string; // No. Rekening Bank Pegawai (e.g. 7000742125)
  bankName?: string; // Bank Penyalur (e.g. BSI / Bank Syariah Indonesia)
  employeeStatusTag?: string; // e.g. "GTY"
  levelTag?: string; // e.g. "V B"
  hariKerja?: number; // Total Hari Kerja resmi
  datangLambatMin5?: number; // DL-5 (Keterlambatan < 5 menit)
  datangLambatPlus5?: number; // DL+5 (Keterlambatan >= 5 menit)
  pulangCepatMin5?: number; // PC-5 (Pulang Cepat < 5 menit)
  pulangCepatPlus5?: number; // PC+5 (Pulang Cepat >= 5 menit)

  // A. GAJI BULANAN LENGKAP (MASTER GAJI POKOK)
  gajiPokokBulanan?: number; // 1. Gaji Pokok
  tunjanganPengabdian?: number; // 2. Tunjangan Pengabdian
  tunjanganKeluarga?: number; // 3. Tunjangan Keluarga
  tunjanganYayasan?: number; // 4. Tunjangan Yayasan
  tunjanganJabatanBulanan?: number; // 5. Tunjangan Jabatan
  bantuanPajak?: number; // 6. Bantuan Pajak
  subtotalPendapatanBulanan?: number; // Subtotal Pendapatan A

  potonganJht?: number; // 1. JHT
  potonganDanaPesangon?: number; // 2. Dana Pesangon
  potonganYayasan?: number; // 3. Yayasan
  potonganBpjsKesehatan?: number; // 4. BPJS Kesehatan
  potonganBpjsKetenagakerjaan?: number; // 5. BPJS Ketenagakerjaan
  potonganZis?: number; // 6. ZIS 2,5 %
  potonganKoperasiAlAzhar?: number; // 7. Koperasi Al Azhar
  potonganForsipa?: number; // 8. Forsipa
  potonganIpSppYwamjp?: number; // 9. Pot. IP/SPP YWAMJP
  potonganPajak?: number; // 10. Pajak
  subtotalPotonganBulanan?: number; // Subtotal Potongan A
  totalGajiBulananBersih?: number; // Jumlah Gaji Bulanan Bersih (Pendapatan A - Potongan A)

  // B. REKAP HARIAN LENGKAP (UKK AKHIR YANG DIBAYARKAN)
  ukkKotorHarian?: number; // 1. UKK Bruto
  transportHarian?: number; // 2. Transpot Harian
  uangMakanHarian?: number; // 3. Uang Makan
  tunjanganKepalaUrusan?: number; // 4. Tunjangan Kepala Urusan / Staff Pimpinan
  tunjanganWaliKelas?: number; // 5. Tunjangan Wali Kelas
  tunjanganStaffPimpinan?: number; // Tunjangan Staff Pimpinan
  tunjanganLainUkk?: number; // Tunjangan Tambahan Lainnya
  subtotalPendapatanHarian?: number; // Subtotal Pendapatan B

  potonganUkkHarian?: number; // 1. UKK Potongan (Keterlambatan/Absensi)
  potonganKoperasiYpi?: number; // 2. Koperasi YW Al Muhajirien 1
  potonganKesra?: number; // 3. Kesra Karyawan
  potonganKoperasiYwam?: number; // 4. Koperasi YW Al Muhajirien 2
  potonganYwAmjp?: number; // 5. YW Al Muhajirien Jakapermai
  potonganLainUkk?: number; // Potongan Tambahan UKK Lainnya
  subtotalPotonganHarian?: number; // Subtotal Potongan B
  totalRekapHarianBersih?: number; // Jumlah Rekap Harian Bersih (Pendapatan B - Potongan B)

  // C. TOTAL AKHIR
  jumlahYangDibayarkan?: number; // Total Gaji Dibayar (Gaji Bulanan Bersih + Rekap Harian Bersih)
  ukkGrandTotalAwal?: number; // UKK, Transport & Uang Makan (Awal)
  ukkNetAkhirDiterima?: number; // Jumlah Diterima (UKK Akhir setelah Tunjangan & Potongan)
  sumberGajiPokokAkhir?: number; // Gaji Pokok Bersih Dibayar dari Matriks Gaji
}

export interface CompanyProfile {
  name: string; // e.g. "SMP ISLAM AL AZHAR 9"
  schoolName?: string; // e.g. "SMP Islam Al Azhar 9 Bekasi"
  foundationName?: string; // e.g. "Yayasan Wakaf Al Muhajirien Jakapermai"
  principalName?: string; // Nama Kepala Sekolah, e.g. "Amirudin, M.Pd."
  principalNip?: string; // NIP Kepala Sekolah, e.g. "102041398"
  principalTitle?: string; // Gelar / Jabatan, e.g. "Kepala Sekolah SMPI Al Azhar 9"
  schoolLogoUrl?: string; // Base64 data URL / image URL logo sekolah
  foundationLogoUrl?: string; // Base64 data URL / image URL logo yayasan
  signatureImageUrl?: string; // Base64 data URL / image URL tanda tangan digital kepala sekolah
  stampImageUrl?: string; // Base64 data URL / image URL stempel digital sekolah
  address: string;
  city: string;
  province: string;
  postalCode: string;
  phone: string;
  email: string;
  website: string;
  npwp: string;
  logoText: string;
  hrDirectorName: string;
  hrDirectorTitle: string;
  financeName: string;
  financeTitle: string;
  stampText: string;
  footerNote: string;
}

export interface ExcelSalaryRow {
  nip: string;
  nama: string;
  jabatan?: string;
  departemen?: string;
  periode?: string; // YYYY-MM or "Januari 2025"
  periode_mulai?: string;
  periode_selesai?: string;
  tanggal_bayar?: string;
  hari_kerja?: number;
  hari_hadir?: number;
  sakit?: number;
  izin?: number;
  cuti?: number;
  alpha?: number;
  jam_terlambat?: number;
  gaji_pokok: number;
  gaji_harian_rate?: number;
  gaji_harian_hari?: number;
  total_gaji_harian?: number;
  tunjangan_jabatan?: number;
  tunjangan_transport?: number;
  tunjangan_makan?: number;
  tunjangan_kehadiran?: number;
  lembur?: number;
  bonus?: number;
  thr?: number;
  pendapatan_lain?: number;
  ket_pendapatan_lain?: string;
  bpjs_tk?: number;
  bpjs_kes?: number;
  pph21?: number;
  potongan_terlambat?: number;
  potongan_alpha?: number;
  pinjaman_kasbon?: number;
  koperasi?: number;
  potongan_lain?: number;
  ket_potongan_lain?: string;
  catatan?: string;
}

export interface SalaryCalculationSource {
  id: string;
  no: number;
  nip: string;
  npwp?: string;
  name: string;
  employeeStatus: string; // GTY, GTYK, CPG, GTT, KTY, KTT
  level: string; // VI D, VI C, V D, V C, V B, V A
  category?: string; // GURU, TATA USAHA, JANITOR, SECURITY

  // 1. Kolom & Angka Indeks Nilai Kinerja
  indexNumber: number; // Angka (e.g. 25, 22, 26, 21, 20, 19)
  performancePercent: number; // Prosen % (e.g. 100, 80, 50)
  percentBase: number; // 100
  indexValueOld: number; // 123,500
  indexValueNew: number; // 125,000
  indexDiff: number; // 1,500
  performanceScorePercent: number; // 100
  performanceBasicSalary: number; // Gapok Nilai Kinerja (Angka * Indeks * Prosen)
  positionAllowanceBasic: number; // Tunjangan Jabatan dasar (Rp 3.500.000, 3.000.000)
  totalSalaryAndAllowance: number; // Jumlah Gaji & Tunjangan

  // 2. BPJS Kesehatan
  bpjsKesName?: string;
  bpjsKesPremium: number; // Premi BPJS Kes
  bpjsKesEmployee: number; // Pegawai (1%)
  bpjsKesFoundation: number; // Yayasan (4%)

  // 3. BPJS Ketenagakerjaan
  bpjsKtName?: string;
  bpjsKtPremium: number; // Premi BPJS KT
  bpjsKtEmployee: number; // Pegawai
  bpjsKtFoundation: number; // Yayasan

  // 4. JHT / Jiwasraya
  certificateNumber?: string;
  jhtPerYear?: number;
  jhtDeduction?: number;

  // 5. Masa Kerja & Keluarga
  joinDateStr?: string; // Format DD/MM/YYYY
  serviceYears: number; // Tahun masa kerja
  serviceMonths: number; // Bulan masa kerja
  gender: 'L' | 'P' | string;
  taxStatus: string; // K/3, K/2, K/1, K/0, TK/0, P
  husbandWifeCount: number; // 1 or 0
  childCount: number; // 0, 1, 2, 3

  // 6. Tunjangan-Tunjangan Yayasan
  baseSalaryComponent: number; // Gaji Pokok Dasar
  dedicationAllowancePercent: number; // % Tunjangan Pengabdian (Masa Kerja)
  dedicationAllowanceAmount: number; // Rp Tunjangan Pengabdian
  familyAllowancePercent: number; // % Tunjangan Keluarga
  familyAllowanceAmount: number; // Rp Tunjangan Keluarga
  foundationAllowancePercent: number; // % Tunjangan Yayasan / Peralihan
  foundationAllowanceAmount: number; // Rp Tunjangan Yayasan / Peralihan
  positionAllowance: number; // Tunjangan Jabatan Rp
  totalAllowances: number; // Jumlah Tunjangan
  grossSalary: number; // Gaji Kotor = Gapok + Jumlah Tunjangan
  regionalAllowancePercent: number; // 10% Tunjangan Daerah
  regionalAllowanceAmount: number; // Rp Tunjangan Daerah
  otherAssistance: number; // Bantuan Lain-lain
  totalSalaryReceived: number; // Jumlah Gaji Diterima = Gaji Kotor + Tunjangan Daerah

  // 7. Potongan-Potongan
  bpjsKesDeduction: number; // Potongan BPJS Kesehatan
  bpjsKtDeduction: number; // Potongan BPJS Ketenagakerjaan
  infaqMasjid: number; // Infaq Masjid
  coopLoanDeduction: number; // Koperasi / Kasbon Pinjaman
  regionalDeduction: number; // Potongan Daerah (sama dengan Tunjangan Daerah)
  otherDeduction: number; // Potongan Lainnya
  totalDeduction: number; // Total Potongan

  // 8. HASIL AKHIR (TABEL PALING KANAN - SUMBER GAJI DIBAYAR)
  netSalaryPaid: number; // Gaji Dibayar / Take Home Pay (Jumlah Gaji Diterima - Total Potongan)
  notes?: string;
  lastUpdated?: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  action: string;
  user: string;
  details: string;
  type: 'upload' | 'publish' | 'edit' | 'delete' | 'download';
}

export interface AttendanceSummary {
  workDays: number; // Hari kerja efektif
  presentDays: number; // Hari hadir
  leaveDays: number; // Cuti / Izin
  sickDays: number; // Sakit
  alphaDays: number; // Alpa / Tanpa keterangan
  lateMinutes: number; // Menit keterlambatan
  overtimeHours?: number; // Jam lembur
}

export interface AttendanceRecord {
  id: string;
  employeeId: string;
  employeeName: string;
  employeeNip?: string;
  employeePosition?: string;
  period: string; // e.g. "2025-01"
  periodLabel?: string; // e.g. "Januari 2025"
  fileName: string;
  fileType: 'pdf' | 'image' | string;
  fileMimeType?: string; // e.g. "application/pdf" | "image/jpeg" | "image/png"
  fileData: string; // Base64 data URI for viewing & downloading
  fileSize: number; // in bytes
  uploadDate: string;
  uploadedBy: string;
  summary: AttendanceSummary;
  notes?: string;
  isVerified?: boolean;
}

export interface AssignedStaff {
  employeeId: string;
  employeeName: string;
  employeeNip?: string;
  roleInDuty?: string; // e.g. "Ketua Pelaksana", "Pengawas Ruang", "Anggota", "Narasumber"
}

export interface DutyLetter {
  id: string;
  letterNumber?: string;
  title: string; // Perihal / Nama Kegiatan Tugas
  description: string; // Uraian Tugas / Instruksi
  assignedToType: 'all' | 'specific'; // Semua Pegawai atau Daftar Tertentu
  assignedEmployees: AssignedStaff[]; // Daftar Pegawai yang ditugaskan
  startDate: string; // Format "YYYY-MM-DD"
  endDate: string; // Format "YYYY-MM-DD"
  periodMonth: number; // 1 - 12
  periodYear: number; // e.g. 2025, 2026
  period: string; // "YYYY-MM"
  location: string; // Tempat / Lokasi Penugasan
  issuer: string; // Pejabat Penandatangan (e.g. Kepala Sekolah / Direktur)
  fileName: string;
  fileType: 'pdf' | 'image' | string;
  fileMimeType?: string;
  fileData: string; // Base64 data URI
  fileSize: number; // in bytes
  uploadDate: string;
  uploadedBy: string;
  status: 'active' | 'completed' | 'archived';
  notes?: string;
}

export interface TransportUkkRecord {
  id: string;
  no: number;
  nip: string;
  name: string;
  jabatan?: string;
  unitKerja?: string;
  golongan?: string;
  employeeStatus: string; // GTY, GTYK, CPG, GTT, KTY, dll.
  
  // Datang Lambat & Keterlambatan
  datangLambatMin5: number; // -5 (kategori ringan / <5 menit)
  datangLambatPlus5: number; // +5 (kategori berat / >5 menit)
  terlambatMenit?: number;
  potonganTerlambatPersen?: number;
  
  // Pulang Cepat
  pulangCepatMin5: number; // -5 (pulang cepat <5 menit)
  pulangCepatPlus5: number; // +5 (pulang cepat >5 menit)

  // Hari Kerja & Tidak Masuk
  hariKerja: number; // Hari kerja normal dalam periode (misal 23, 22, 21, 25)
  sakit: number; // Sakit
  izin: number; // Izin
  alpa: number; // Alpa
  cuti?: number; // Cuti
  dinluar: number; // Dinas Luar / Lainnya
  jumlahTidakMasuk: number; // Total Tidak Masuk = sakit + izin + alpa + dinluar
  kondite: number; // Kondite
  subuhOnline: number; // Subuh Online
  potonganAbsenPersen?: number;
  totalPotonganPersen?: number;

  // Hasil Hadir
  jumlahHadir: number; // Jumlah Hadir = hariKerja - jumlahTidakMasuk

  // 1. KERAJINAN KERJA (UKK)
  ukkPerhari: number; // Tarif UKK Perhari Rp. (misal 158.250 / 147.750 / 132.250 / 66.125)
  ukkKinerjaPersen: number; // % Kinerja (misal 97.00, 97.87, 95.53, dll.)
  ukkKotor: number; // Kotor Rp. (Sebelum Potongan)
  ukkBruto?: number; // Alias untuk ukkKotor
  ukkPotongan: number; // Potongan Rp.
  ukkDiterima: number; // Diterima Rp. = ukkKotor - ukkPotongan

  // 2. TRANSPOR
  transporPerhari: number; // Tarif Transpor Perhari Rp. (misal 84.250 / 73.250 / 59.750)
  tarifTransporHarian?: number; // Alias untuk transporPerhari
  transporBruto?: number;
  transporPotongan: number; // Potongan Transpor Rp. (default 0)
  transporDiterima: number; // Transpor Rp. = (jumlahHadir * transporPerhari) - transporPotongan

  // 3. UANG MAKAN
  uangMakanPerhari: number; // Tarif Uang Makan Perhari Rp. (misal 30.000)
  tarifUangMakanHarian?: number; // Alias untuk uangMakanPerhari
  uangMakanDiterima: number; // Uang Makan Rp. = jumlahHadir * uangMakanPerhari

  // 4. HASIL AKHIR (JUMLAH Rp.)
  totalJumlahUang: number; // Grand Total = ukkDiterima + transporDiterima + uangMakanDiterima
  grandTotal?: number; // Alias untuk totalJumlahUang

  period: string; // Format "YYYY-MM" e.g. "2026-08"
  periodLabel?: string; // e.g. "Agustus 2026 (16 Juli 2026 - 13 Agustus 2026)"
  periodStartDate?: string;
  periodEndDate?: string;
  notes?: string;
  lastUpdated?: string;
}

export interface UkkAdjustmentRecord {
  id: string;
  no: number;
  nip: string;
  bankAccountNumber: string; // NO. REKENING (e.g. 7000742125)
  bankName?: string; // e.g. BSI
  name: string;
  
  // UKK, TRANPORT, U.MAKAN (Grand total transport & UKK awal)
  ukkTransportMakan: number;

  // TUNJANGAN TAMBAHAN (PENAMBAH)
  tunjanganWaliKelas: number; // TUNJANGAN WALI KELAS (misal Rp 175.000)
  tunjanganStaffPimpinan: number; // TUNJANGAN STAFF PIMP (misal Rp 150.000)
  tunjanganLain: number; // Tunjangan Lainnya

  // JUMLAH (Subtotal Pendapatan UKK = ukkTransportMakan + tunjanganWaliKelas + tunjanganStaffPimpinan + tunjanganLain)
  totalPenambahan: number;

  // POTONGAN TAMBAHAN (PEMOTONG)
  potonganKesra: number; // KESRA (7114044584)
  potonganKoperasiYpi: number; // KOPERASI YPI (7210808088)
  potonganKoperasiYwam: number; // KOPERASI YWAM (7210808088)
  potonganYwAmjp: number; // YW AMJP (8980008003)
  potonganLain: number; // Potongan Lainnya

  // TOTAL POTONGAN TAMBAHAN
  totalPotongan: number;

  // JUMLAH DITERIMA (UKK Akhir Bersih = totalPenambahan - totalPotongan)
  jumlahDiterima: number;

  period: string; // e.g. "2026-08"
  periodLabel?: string;
  notes?: string;
  lastUpdated?: string;
}



