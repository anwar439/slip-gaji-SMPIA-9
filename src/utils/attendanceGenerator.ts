import { jsPDF } from 'jspdf';
import { AttendanceRecord, Employee, CompanyProfile } from '../types';

/**
 * Convert a File object (PDF/JPG/PNG) into a base64 Data URL string
 */
export function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result);
      } else {
        reject(new Error('Gagal membaca berkas.'));
      }
    };
    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(file);
  });
}

/**
 * Format bytes to readable size (e.g. 245 KB, 1.2 MB)
 */
export function formatFileSize(bytes: number): string {
  if (!bytes || bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

/**
 * Generate a real, official PDF attendance document using jsPDF
 */
export function generateAttendancePdfDataUrl(
  employee: { name: string; nip?: string; position?: string; department?: string },
  periodLabel: string,
  summary: {
    workDays: number;
    presentDays: number;
    leaveDays: number;
    sickDays: number;
    alphaDays: number;
    lateMinutes: number;
  },
  companyName: string = 'SMP ISLAM AL AZHAR 9 KEMANG PRATAMA',
  notes?: string
): string {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const primaryColor = [30, 58, 138]; // Blue 900
  const secondaryColor = [71, 85, 105]; // Slate 600
  const darkColor = [15, 23, 42]; // Slate 900
  const greenColor = [16, 185, 129]; // Emerald 500

  // 1. Header / Kop Yayasan
  doc.setFillColor(248, 250, 252);
  doc.rect(0, 0, 210, 36, 'F');

  doc.setDrawColor(203, 213, 225);
  doc.setLineWidth(0.5);
  doc.line(15, 36, 195, 36);

  // Logo text / Header
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.text(companyName.toUpperCase(), 105, 14, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
  doc.text('YAYASAN ASRAM - BADAN KERJASAMA PEMBINAAN PENDIDIKAN ISLAM', 105, 19, { align: 'center' });
  doc.text('Jl. Kemang Pratama Raya No. 9, Rawalumbu, Bekasi | Telp: (021) 8241 1234', 105, 24, { align: 'center' });
  doc.text('Website: www.smpia9.sch.id | Email: info@smpia9.sch.id', 105, 29, { align: 'center' });

  // 2. Title & Badge
  doc.setFillColor(30, 58, 138);
  doc.roundedRect(15, 42, 180, 10, 2, 2, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10.5);
  doc.setTextColor(255, 255, 255);
  doc.text('REKAPITULASI ABSENSI & PRESENSI KEHADIRAN BULANAN', 105, 48.5, { align: 'center' });

  // 3. Employee Info Card
  doc.setFillColor(241, 245, 249);
  doc.roundedRect(15, 56, 180, 28, 2, 2, 'F');
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(15, 56, 180, 28, 2, 2, 'D');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.text('DATA PEGAWAI / GURU', 20, 62);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(darkColor[0], darkColor[1], darkColor[2]);

  // Left Column
  doc.text('Nama Lengkap', 20, 68);
  doc.text(':', 52, 68);
  doc.setFont('helvetica', 'bold');
  doc.text(employee.name || '-', 56, 68);

  doc.setFont('helvetica', 'normal');
  doc.text('NIP / ID Pegawai', 20, 74);
  doc.text(':', 52, 74);
  doc.text(employee.nip || '-', 56, 74);

  doc.text('Jabatan / Unit', 20, 80);
  doc.text(':', 52, 80);
  doc.text(`${employee.position || 'Staff'} (${employee.department || 'Akademik'})`, 56, 80);

  // Right Column
  doc.text('Periode Bulan', 120, 68);
  doc.text(':', 148, 68);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.text(periodLabel || 'Januari 2025', 152, 68);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(darkColor[0], darkColor[1], darkColor[2]);
  doc.text('Status Berkas', 120, 74);
  doc.text(':', 148, 74);
  doc.setTextColor(greenColor[0], greenColor[1], greenColor[2]);
  doc.setFont('helvetica', 'bold');
  doc.text('TERVERIFIKASI HRD', 152, 74);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(darkColor[0], darkColor[1], darkColor[2]);
  doc.text('Metode Presensi', 120, 80);
  doc.text(':', 148, 80);
  doc.text('Fingerprint & Mobile GPS', 152, 80);

  // 4. Statistics Matrix (4 Cards)
  const attendanceRate = summary.workDays > 0 ? Math.round((summary.presentDays / summary.workDays) * 100) : 100;

  // Box 1: Hari Kerja & Hadir
  doc.setFillColor(238, 242, 255); // Indigo light
  doc.roundedRect(15, 90, 42, 22, 2, 2, 'F');
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(79, 70, 229);
  doc.text('KEHADIRAN (HADIR)', 36, 96, { align: 'center' });
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text(`${summary.presentDays} / ${summary.workDays}`, 36, 104, { align: 'center' });
  doc.setFontSize(7);
  doc.text(`Tingkat: ${attendanceRate}%`, 36, 109, { align: 'center' });

  // Box 2: Izin / Cuti
  doc.setFillColor(254, 243, 199); // Amber light
  doc.roundedRect(61, 90, 42, 22, 2, 2, 'F');
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(180, 83, 9);
  doc.text('IZIN / CUTI RESMI', 82, 96, { align: 'center' });
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text(`${summary.leaveDays} Hari`, 82, 104, { align: 'center' });
  doc.setFontSize(7);
  doc.text('Ada Surat Izin', 82, 109, { align: 'center' });

  // Box 3: Sakit & Alpa
  doc.setFillColor(254, 226, 226); // Rose light
  doc.roundedRect(107, 90, 42, 22, 2, 2, 'F');
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(185, 28, 28);
  doc.text('SAKIT & ALPA', 128, 96, { align: 'center' });
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text(`${summary.sickDays} Skt / ${summary.alphaDays} Alpa`, 128, 104, { align: 'center' });
  doc.setFontSize(7);
  doc.text(summary.alphaDays === 0 ? 'Disiplin Terjaga' : 'Perlu Evaluasi', 128, 109, { align: 'center' });

  // Box 4: Keterlambatan
  doc.setFillColor(243, 244, 246); // Slate light
  doc.roundedRect(153, 90, 42, 22, 2, 2, 'F');
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(75, 85, 99);
  doc.text('KETERLAMBATAN', 174, 96, { align: 'center' });
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text(`${summary.lateMinutes} Menit`, 174, 104, { align: 'center' });
  doc.setFontSize(7);
  doc.text(summary.lateMinutes === 0 ? 'Tepat Waktu' : 'Akumulasi Sebulan', 174, 109, { align: 'center' });

  // 5. Table of Attendance Breakdown Sample Records
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.text('RINCIAN MINGGUAN & EVALUASI KEHADIRAN', 15, 120);

  // Table Headers
  doc.setFillColor(30, 41, 59);
  doc.rect(15, 124, 180, 7, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(255, 255, 255);
  doc.text('MINGGU / PERIODE', 20, 128.5);
  doc.text('HARI KERJA', 70, 128.5);
  doc.text('PRESENSI HADIR', 105, 128.5);
  doc.text('IZIN / SAKIT', 140, 128.5);
  doc.text('STATUS DISIPLIN', 170, 128.5);

  const sampleWeeks = [
    { week: 'Minggu I (01 - 07)', work: '5 Hari', present: '5 Hari', off: '0 Hari', status: 'Sempurna 100%' },
    { week: 'Minggu II (08 - 14)', work: '5 Hari', present: `${Math.max(4, 5 - (summary.leaveDays > 0 ? 1 : 0))} Hari`, off: `${summary.leaveDays > 0 ? '1 Izin' : '0 Hari'}`, status: 'Baik' },
    { week: 'Minggu III (15 - 21)', work: '5 Hari', present: `${Math.max(4, 5 - (summary.sickDays > 0 ? 1 : 0))} Hari`, off: `${summary.sickDays > 0 ? '1 Sakit' : '0 Hari'}`, status: 'Baik' },
    { week: 'Minggu IV (22 - 31)', work: '7 Hari', present: `${summary.presentDays - 14 > 0 ? summary.presentDays - 14 : 7} Hari`, off: '0 Hari', status: 'Lengkap' },
  ];

  let currentY = 131;
  sampleWeeks.forEach((w, index) => {
    doc.setFillColor(index % 2 === 0 ? 255 : 248, index % 2 === 0 ? 255 : 250, index % 2 === 0 ? 255 : 252);
    doc.rect(15, currentY, 180, 7, 'F');
    doc.setDrawColor(241, 245, 249);
    doc.rect(15, currentY, 180, 7, 'D');

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(darkColor[0], darkColor[1], darkColor[2]);
    doc.text(w.week, 20, currentY + 4.8);
    doc.text(w.work, 70, currentY + 4.8);
    doc.text(w.present, 105, currentY + 4.8);
    doc.text(w.off, 140, currentY + 4.8);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(greenColor[0], greenColor[1], greenColor[2]);
    doc.text(w.status, 170, currentY + 4.8);

    currentY += 7;
  });

  // Notes Box
  currentY += 4;
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(15, currentY, 180, 18, 2, 2, 'F');
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(15, currentY, 180, 18, 2, 2, 'D');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.text('CATATAN & EVALUASI BAGIAN KEPEGAWAIAN (HRD):', 20, currentY + 5.5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(darkColor[0], darkColor[1], darkColor[2]);
  const noteText = notes || `Tingkat kehadiran tercatat ${attendanceRate}%. Pegawai yang bersangkutan telah memenuhi standar kedisiplinan dan jam kerja operasional sekolah. Berkas rekapitulasi ini sah untuk lampiran penggajian.`;
  doc.text(doc.splitTextToSize(noteText, 170), 20, currentY + 11);

  // 6. Signatures & Official Validation
  const signY = 188;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(darkColor[0], darkColor[1], darkColor[2]);

  doc.text('Bekasi, Akhir Bulan ' + (periodLabel || 'Januari 2025'), 145, signY);
  doc.text('Kepala Bagian Tata Usaha & Kepegawaian,', 145, signY + 5);

  // Digital Stamp Indicator
  doc.setDrawColor(37, 99, 235);
  doc.setLineWidth(0.5);
  doc.roundedRect(145, signY + 8, 48, 16, 2, 2, 'D');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.setTextColor(37, 99, 235);
  doc.text('SMP ISLAM AL AZHAR 9', 169, signY + 13, { align: 'center' });
  doc.setFontSize(6);
  doc.text('VERIFIKASI ELEKTRONIK SAH', 169, signY + 17, { align: 'center' });
  doc.text(`DIVERIFIKASI: ${new Date().toLocaleDateString('id-ID')}`, 169, signY + 21, { align: 'center' });

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(darkColor[0], darkColor[1], darkColor[2]);
  doc.text('Drs. H. Anwar Fauzi, M.Pd.', 145, signY + 29);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.text('NIP: 19780415 200501 1 002', 145, signY + 33);

  // Employee Acknowledgement Left Side
  doc.text('Mengetahui / Menerima,', 20, signY + 5);
  doc.text('Pegawai yang bersangkutan,', 20, signY + 9);
  doc.setFont('helvetica', 'bold');
  doc.text(employee.name, 20, signY + 29);
  doc.setFont('helvetica', 'normal');
  doc.text(`NIP: ${employee.nip || '-'}`, 20, signY + 33);

  // Footer Disclaimer
  doc.setDrawColor(226, 232, 240);
  doc.line(15, 235, 195, 235);
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(6.5);
  doc.setTextColor(148, 163, 184);
  doc.text('Dokumen ini merupakan Rekapitulasi Presensi Resmi yang diterbitkan oleh Bagian Kepegawaian & HRD melalui Portal Digital SlipGaji.ID.', 105, 240, { align: 'center' });
  doc.text('Setiap pegawai hanya berhak mengakses dan melihat data absensi miliknya sendiri.', 105, 244, { align: 'center' });

  return doc.output('datauristring');
}

/**
 * Generate initial sample attendance records for all employees
 */
export function generateInitialAttendanceRecords(employees: Employee[]): AttendanceRecord[] {
  return [];
  const periods = [
    { period: '2025-01', label: 'Januari 2025' },
    { period: '2024-12', label: 'Desember 2024' },
  ];

  const records: AttendanceRecord[] = [];

  periods.forEach((p) => {
    employees.forEach((emp, index) => {
      // Deterministic pseudo-random variation based on employee index
      const workDays = 22;
      const leaveDays = (index % 5 === 0) ? 1 : 0;
      const sickDays = (index % 7 === 0) ? 1 : 0;
      const alphaDays = 0;
      const presentDays = workDays - leaveDays - sickDays;
      const lateMinutes = (index % 3 === 0) ? 15 : (index % 4 === 0) ? 25 : 0;

      const summary = {
        workDays,
        presentDays,
        leaveDays,
        sickDays,
        alphaDays,
        lateMinutes,
      };

      const pdfData = generateAttendancePdfDataUrl(
        {
          name: emp.name,
          nip: emp.nip,
          position: emp.position,
          department: emp.department,
        },
        p.label,
        summary
      );

      records.push({
        id: `att-${p.period}-${emp.id}`,
        employeeId: emp.id,
        employeeName: emp.name,
        employeeNip: emp.nip,
        employeePosition: emp.position,
        period: p.period,
        periodLabel: p.label,
        fileName: `Rekap_Absensi_${emp.nip || emp.id}_${p.period}.pdf`,
        fileType: 'pdf',
        fileMimeType: 'application/pdf',
        fileData: pdfData,
        fileSize: 48500, // ~48.5 KB
        uploadDate: new Date('2025-01-25T08:00:00Z').toISOString(),
        uploadedBy: 'Admin HRD (Drs. Anwar Fauzi)',
        summary,
        notes: `Kehadiran ${presentDays}/${workDays} hari kerja efektif. Kedisiplinan sangat baik.`,
        isVerified: true,
      });
    });
  });

  return records;
}
