import { jsPDF } from 'jspdf';
import { DutyLetter, Employee, CompanyProfile, AssignedStaff } from '../types';

export const INDONESIAN_MONTHS = [
  { value: 1, num: 1, label: 'Januari', name: 'Januari', code: '01' },
  { value: 2, num: 2, label: 'Februari', name: 'Februari', code: '02' },
  { value: 3, num: 3, label: 'Maret', name: 'Maret', code: '03' },
  { value: 4, num: 4, label: 'April', name: 'April', code: '04' },
  { value: 5, num: 5, label: 'Mei', name: 'Mei', code: '05' },
  { value: 6, num: 6, label: 'Juni', name: 'Juni', code: '06' },
  { value: 7, num: 7, label: 'Juli', name: 'Juli', code: '07' },
  { value: 8, num: 8, label: 'Agustus', name: 'Agustus', code: '08' },
  { value: 9, num: 9, label: 'September', name: 'September', code: '09' },
  { value: 10, num: 10, label: 'Oktober', name: 'Oktober', code: '10' },
  { value: 11, num: 11, label: 'November', name: 'November', code: '11' },
  { value: 12, num: 12, label: 'Desember', name: 'Desember', code: '12' },
];

/**
 * Format date range into Indonesian format
 * Example: "12 Januari 2025 s.d. 14 Januari 2025" or "12 - 14 Januari 2025"
 */
export function formatDateRangeIndonesian(startDateStr: string, endDateStr: string): string {
  if (!startDateStr && !endDateStr) return '-';
  if (startDateStr === endDateStr || !endDateStr) {
    return formatSingleDateIndonesian(startDateStr);
  }

  const s = new Date(startDateStr);
  const e = new Date(endDateStr);

  if (isNaN(s.getTime()) || isNaN(e.getTime())) {
    return `${startDateStr} s.d. ${endDateStr}`;
  }

  const sDay = s.getDate();
  const sMonth = s.getMonth();
  const sYear = s.getFullYear();

  const eDay = e.getDate();
  const eMonth = e.getMonth();
  const eYear = e.getFullYear();

  const monthNames = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];

  if (sYear === eYear && sMonth === eMonth) {
    return `${sDay} - ${eDay} ${monthNames[sMonth]} ${sYear}`;
  } else if (sYear === eYear) {
    return `${sDay} ${monthNames[sMonth]} - ${eDay} ${monthNames[eMonth]} ${sYear}`;
  } else {
    return `${sDay} ${monthNames[sMonth]} ${sYear} s.d. ${eDay} ${monthNames[eMonth]} ${eYear}`;
  }
}

export function formatSingleDateIndonesian(dateStr: string): string {
  if (!dateStr) return '-';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  const monthNames = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];
  return `${d.getDate()} ${monthNames[d.getMonth()]} ${d.getFullYear()}`;
}

/**
 * Convert a File object (PDF/JPG/PNG) to a Base64 data URL
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
    reader.onerror = (err) => reject(err);
    reader.readAsDataURL(file);
  });
}

/**
 * Format bytes to readable size
 */
export function formatFileSize(bytes: number): string {
  if (!bytes || bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

/**
 * Generate a formal PDF Duty Letter (Surat Tugas Resmi) using jsPDF
 */
export function generateDutyLetterPdfDataUrl(params: {
  letterNumber: string;
  title: string;
  description: string;
  assignedToType: 'all' | 'specific';
  assignedEmployees: AssignedStaff[];
  startDate: string;
  endDate: string;
  location: string;
  issuer?: string;
  notes?: string;
  companyName?: string;
  signCity?: string;
  signDate?: string;
}): string {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const primaryColor = [30, 58, 138]; // Blue 900
  const secondaryColor = [71, 85, 105]; // Slate 600
  const darkColor = [15, 23, 42]; // Slate 900
  const companyName = params.companyName || 'SMP ISLAM AL AZHAR 9 KEMANG PRATAMA';

  // 1. Kop Surat Resmi
  doc.setFillColor(248, 250, 252);
  doc.rect(0, 0, 210, 36, 'F');

  doc.setDrawColor(30, 58, 138);
  doc.setLineWidth(0.8);
  doc.line(15, 36, 195, 36);
  doc.setDrawColor(148, 163, 184);
  doc.setLineWidth(0.3);
  doc.line(15, 37.5, 195, 37.5);

  // Kop Text
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.text(companyName.toUpperCase(), 105, 14, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
  doc.text('YAYASAN ASRAM - BADAN KERJASAMA PEMBINAAN PENDIDIKAN ISLAM', 105, 19, { align: 'center' });
  doc.text('Jl. Kemang Pratama Raya No. 9, Rawalumbu, Bekasi 17116 | Telp: (021) 8241 1234', 105, 24, { align: 'center' });
  doc.text('Website: www.smpia9.sch.id | Email: sekretariat@smpia9.sch.id', 105, 29, { align: 'center' });

  // 2. Judul & Nomor Surat
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(darkColor[0], darkColor[1], darkColor[2]);
  doc.text('SURAT TUGAS', 105, 46, { align: 'center' });

  // Garis bawah judul
  doc.setLineWidth(0.4);
  doc.line(85, 47.5, 125, 47.5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text(`Nomor: ${params.letterNumber || '045/ST-SMP-IA9/I/2025'}`, 105, 52, { align: 'center' });

  // 3. Dasar Penugasan
  doc.setFontSize(9);
  doc.setTextColor(darkColor[0], darkColor[1], darkColor[2]);
  doc.text(
    'Yang bertanda tangan di bawah ini, Kepala SMP Islam Al Azhar 9 Kemang Pratama Bekasi, dengan ini menugaskan kepada:',
    20,
    61,
    { maxWidth: 170, lineHeightFactor: 1.4 }
  );

  // 4. Tabel / Daftar Personel yang Ditugaskan
  let currentY = 70;

  if (params.assignedToType === 'all' || params.assignedEmployees.length === 0) {
    // Semua Pegawai
    doc.setFillColor(241, 245, 249);
    doc.roundedRect(20, currentY, 170, 16, 2, 2, 'F');
    doc.setDrawColor(203, 213, 225);
    doc.roundedRect(20, currentY, 170, 16, 2, 2, 'D');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9.5);
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.text('SETERUSNYA DITUGASKAN KEPADA:', 25, currentY + 6);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(darkColor[0], darkColor[1], darkColor[2]);
    doc.text('Seluruh Guru, Staf Tata Usaha, dan Karyawan SMP Islam Al Azhar 9 Bekasi', 25, currentY + 12);
    currentY += 22;
  } else {
    // Daftar Pegawai Tertentu (Tabel)
    doc.setFillColor(30, 58, 138);
    doc.rect(20, currentY, 170, 7, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(255, 255, 255);
    doc.text('NO', 23, currentY + 4.8);
    doc.text('NAMA PEGAWAI / GURU', 35, currentY + 4.8);
    doc.text('NIP / ID', 105, currentY + 4.8);
    doc.text('JABATAN / PERAN TUGAS', 140, currentY + 4.8);

    currentY += 7;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(darkColor[0], darkColor[1], darkColor[2]);

    const maxShown = Math.min(params.assignedEmployees.length, 7);
    for (let i = 0; i < maxShown; i++) {
      const emp = params.assignedEmployees[i];
      const isEven = i % 2 === 1;
      if (isEven) {
        doc.setFillColor(248, 250, 252);
        doc.rect(20, currentY, 170, 6.5, 'F');
      }
      doc.setDrawColor(226, 232, 240);
      doc.line(20, currentY + 6.5, 190, currentY + 6.5);

      doc.text(`${i + 1}.`, 23, currentY + 4.5);
      doc.text(emp.employeeName, 35, currentY + 4.5, { maxWidth: 65 });
      doc.text(emp.employeeNip || '-', 105, currentY + 4.5);
      doc.text(emp.roleInDuty || 'Anggota Pelaksana', 140, currentY + 4.5, { maxWidth: 48 });

      currentY += 6.5;
    }

    if (params.assignedEmployees.length > 7) {
      doc.setFont('helvetica', 'italic');
      doc.setFontSize(7.5);
      doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
      doc.text(`* Dan ${params.assignedEmployees.length - 7} pegawai lainnya sesuai lampiran resmi.`, 25, currentY + 4);
      currentY += 6;
    }
    currentY += 3;
  }

  // 5. Rincian Kegiatan Penugasan
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(darkColor[0], darkColor[1], darkColor[2]);
  doc.text('Untuk melaksanakan tugas kedinasan sebagai berikut:', 20, currentY + 3);
  currentY += 6;

  // Box Rincian
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(20, currentY, 170, 48, 2, 2, 'F');
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(20, currentY, 170, 48, 2, 2, 'D');

  const leftLabelX = 25;
  const colonX = 62;
  const valueX = 66;

  // 1. Kegiatan / Tugas
  doc.setFont('helvetica', 'bold');
  doc.text('Nama Kegiatan', leftLabelX, currentY + 7);
  doc.text(':', colonX, currentY + 7);
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.text(params.title || 'Penugasan Kedinasan', valueX, currentY + 7, { maxWidth: 120 });

  // 2. Uraian
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(darkColor[0], darkColor[1], darkColor[2]);
  doc.text('Uraian / Deskripsi', leftLabelX, currentY + 14);
  doc.text(':', colonX, currentY + 14);
  doc.text(params.description || 'Melaksanakan tugas kedinasan sesuai petunjuk teknis.', valueX, currentY + 14, {
    maxWidth: 120,
    lineHeightFactor: 1.3,
  });

  // 3. Rentang Waktu (Dari kapan sampai kapan)
  doc.setFont('helvetica', 'bold');
  doc.text('Waktu Pelaksanaan', leftLabelX, currentY + 27);
  doc.text(':', colonX, currentY + 27);
  doc.setTextColor(180, 83, 9); // Amber 700
  const dateRangeFormatted = formatDateRangeIndonesian(params.startDate, params.endDate);
  doc.text(dateRangeFormatted, valueX, currentY + 27);

  // 4. Lokasi
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(darkColor[0], darkColor[1], darkColor[2]);
  doc.text('Tempat / Lokasi', leftLabelX, currentY + 34);
  doc.text(':', colonX, currentY + 34);
  doc.text(params.location || 'Kampus SMP Islam Al Azhar 9 Bekasi', valueX, currentY + 34, { maxWidth: 120 });

  // 5. Keterangan
  doc.text('Keterangan', leftLabelX, currentY + 41);
  doc.text(':', colonX, currentY + 41);
  doc.text(params.notes || 'Wajib hadir tepat waktu dan membuat laporan pertanggungjawaban kegiatan.', valueX, currentY + 41, { maxWidth: 120 });

  currentY += 52;

  // 6. Penutup
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(darkColor[0], darkColor[1], darkColor[2]);
  doc.text(
    'Demikian Surat Tugas ini dibuat untuk dilaksanakan dengan penuh rasa tanggung jawab dan keikhlasan, serta menyampaikan laporan hasil pelaksanaan tugas setelah kegiatan selesai.',
    20,
    currentY,
    { maxWidth: 170, lineHeightFactor: 1.4 }
  );

  // 7. Kolom Tanda Tangan & Pengesahan
  const signDateStr = params.signDate ? formatSingleDateIndonesian(params.signDate) : formatSingleDateIndonesian(params.startDate);
  const signCity = params.signCity || 'Bekasi';

  const ttdX = 130;
  let ttdY = currentY + 14;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.text(`${signCity}, ${signDateStr}`, ttdX, ttdY);
  ttdY += 5;
  doc.setFont('helvetica', 'bold');
  doc.text('Kepala Sekolah / Penanggung Jawab,', ttdX, ttdY);

  // Stempel Digital Box
  doc.setDrawColor(37, 99, 235);
  doc.setFillColor(239, 246, 255);
  doc.roundedRect(ttdX - 5, ttdY + 3, 50, 16, 2, 2, 'FD');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.setTextColor(30, 58, 138);
  doc.text('TERVALIDASI DIGITAL', ttdX + 20, ttdY + 9, { align: 'center' });
  doc.setFontSize(6);
  doc.setTextColor(71, 85, 105);
  doc.text('SMPIA 9 BEKASI - YAYASAN ASRAM', ttdX + 20, ttdY + 14, { align: 'center' });

  ttdY += 24;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(darkColor[0], darkColor[1], darkColor[2]);
  doc.text(params.issuer || 'Drs. H. M. Bahrudin, M.Pd.', ttdX, ttdY);
  doc.line(ttdX, ttdY + 1, ttdX + 55, ttdY + 1);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.text('NIP. 19780415 200501 1 002', ttdX, ttdY + 5);

  // 8. Footer QR & Security Info
  doc.setDrawColor(226, 232, 240);
  doc.line(20, 275, 190, 275);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(148, 163, 184);
  doc.text('Dokumen resmi penugasan ini diarsipkan pada Sistem Manajemen Administrasi Terpadu SMP Islam Al Azhar 9 Bekasi.', 20, 280);
  doc.text(`Kode Verifikasi: ST-${Date.now().toString(36).toUpperCase()}`, 190, 280, { align: 'right' });

  return doc.output('datauristring');
}

/**
 * Generate high-definition JPG data URL for realistic scanned Duty Letter
 */
export function generateDutyLetterJpgDataUrl(params: {
  letterNumber: string;
  title: string;
  description: string;
  assignedToType: 'all' | 'specific';
  assignedEmployees: AssignedStaff[];
  startDate: string;
  endDate: string;
  location: string;
  issuer?: string;
  notes?: string;
  companyName?: string;
}): string {
  const canvas = document.createElement('canvas');
  canvas.width = 1200;
  canvas.height = 1650;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  // Background kertas resmi (off-white)
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Watermark latar belakang halus
  ctx.save();
  ctx.font = 'bold 80px sans-serif';
  ctx.fillStyle = 'rgba(241, 245, 249, 0.7)';
  ctx.translate(600, 850);
  ctx.rotate(-Math.PI / 6);
  ctx.textAlign = 'center';
  ctx.fillText('SURAT TUGAS RESMI', 0, 0);
  ctx.restore();

  // 1. Kop Header
  ctx.fillStyle = '#1E3A8A';
  ctx.font = 'bold 28px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(params.companyName || 'SMP ISLAM AL AZHAR 9 KEMANG PRATAMA', 600, 90);

  ctx.fillStyle = '#475569';
  ctx.font = '18px sans-serif';
  ctx.fillText('YAYASAN ASRAM - BADAN KERJASAMA PEMBINAAN PENDIDIKAN ISLAM', 600, 125);
  ctx.font = '16px sans-serif';
  ctx.fillText('Jl. Kemang Pratama Raya No. 9, Rawalumbu, Bekasi | Telp: (021) 8241 1234', 600, 155);
  ctx.fillText('Website: www.smpia9.sch.id | Email: info@smpia9.sch.id', 600, 185);

  // Garis pemisah kop
  ctx.strokeStyle = '#1E3A8A';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(80, 215);
  ctx.lineTo(1120, 215);
  ctx.stroke();

  ctx.strokeStyle = '#94A3B8';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(80, 223);
  ctx.lineTo(1120, 223);
  ctx.stroke();

  // 2. Judul Surat
  ctx.fillStyle = '#0F172A';
  ctx.font = 'bold 30px sans-serif';
  ctx.fillText('SURAT TUGAS', 600, 280);

  ctx.strokeStyle = '#0F172A';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(480, 290);
  ctx.lineTo(720, 290);
  ctx.stroke();

  ctx.font = '18px sans-serif';
  ctx.fillStyle = '#334155';
  ctx.fillText(`Nomor: ${params.letterNumber || '045/ST-SMP-IA9/I/2025'}`, 600, 320);

  // 3. Teks Pembuka
  ctx.textAlign = 'left';
  ctx.font = '18px sans-serif';
  ctx.fillStyle = '#0F172A';
  ctx.fillText('Yang bertanda tangan di bawah ini Kepala SMP Islam Al Azhar 9 Kemang Pratama Bekasi,', 100, 380);
  ctx.fillText('dengan ini memberikan tugas kedinasan kepada:', 100, 410);

  // 4. Daftar Personel
  let currentY = 460;
  if (params.assignedToType === 'all' || params.assignedEmployees.length === 0) {
    ctx.fillStyle = '#F8FAFC';
    ctx.fillRect(100, currentY, 1000, 80);
    ctx.strokeStyle = '#CBD5E1';
    ctx.strokeRect(100, currentY, 1000, 80);

    ctx.fillStyle = '#1E3A8A';
    ctx.font = 'bold 20px sans-serif';
    ctx.fillText('DITUGASKAN KEPADA: SELURUH GURU & KARYAWAN', 130, currentY + 35);
    ctx.fillStyle = '#475569';
    ctx.font = '17px sans-serif';
    ctx.fillText('Seluruh Guru & Staf SMP Islam Al Azhar 9 Kemang Pratama Bekasi', 130, currentY + 65);
    currentY += 110;
  } else {
    // Header Tabel Personel
    ctx.fillStyle = '#1E3A8A';
    ctx.fillRect(100, currentY, 1000, 40);
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 16px sans-serif';
    ctx.fillText('NO', 120, currentY + 26);
    ctx.fillText('NAMA PEGAWAI / GURU', 190, currentY + 26);
    ctx.fillText('NIP / ID PEGAWAI', 620, currentY + 26);
    ctx.fillText('PERAN PENUGASAN', 860, currentY + 26);
    currentY += 40;

    const maxStaff = Math.min(params.assignedEmployees.length, 5);
    for (let i = 0; i < maxStaff; i++) {
      const staff = params.assignedEmployees[i];
      if (i % 2 === 1) {
        ctx.fillStyle = '#F8FAFC';
        ctx.fillRect(100, currentY, 1000, 36);
      }
      ctx.strokeStyle = '#E2E8F0';
      ctx.strokeRect(100, currentY, 1000, 36);

      ctx.fillStyle = '#0F172A';
      ctx.font = '16px sans-serif';
      ctx.fillText(`${i + 1}.`, 120, currentY + 24);
      ctx.font = 'bold 16px sans-serif';
      ctx.fillText(staff.employeeName, 190, currentY + 24);
      ctx.font = '16px sans-serif';
      ctx.fillText(staff.employeeNip || '-', 620, currentY + 24);
      ctx.fillText(staff.roleInDuty || 'Anggota Pelaksana', 860, currentY + 24);
      currentY += 36;
    }
    currentY += 30;
  }

  // 5. Box Kegiatan Penugasan
  ctx.fillStyle = '#F8FAFC';
  ctx.fillRect(100, currentY, 1000, 240);
  ctx.strokeStyle = '#CBD5E1';
  ctx.lineWidth = 1.5;
  ctx.strokeRect(100, currentY, 1000, 240);

  const labelX = 130;
  const colX = 340;
  const valX = 370;

  ctx.fillStyle = '#0F172A';
  ctx.font = 'bold 18px sans-serif';
  ctx.fillText('Nama Kegiatan', labelX, currentY + 45);
  ctx.fillText(':', colX, currentY + 45);
  ctx.fillStyle = '#1E3A8A';
  ctx.fillText(params.title, valX, currentY + 45);

  ctx.fillStyle = '#0F172A';
  ctx.font = '17px sans-serif';
  ctx.fillText('Uraian Tugas', labelX, currentY + 85);
  ctx.fillText(':', colX, currentY + 85);
  ctx.fillText(params.description || 'Melaksanakan penugasan dinas sesuai arahan pimpinan.', valX, currentY + 85);

  ctx.font = 'bold 17px sans-serif';
  ctx.fillText('Rentang Waktu', labelX, currentY + 125);
  ctx.fillText(':', colX, currentY + 125);
  ctx.fillStyle = '#B45309';
  ctx.fillText(formatDateRangeIndonesian(params.startDate, params.endDate), valX, currentY + 125);

  ctx.fillStyle = '#0F172A';
  ctx.font = '17px sans-serif';
  ctx.fillText('Tempat / Lokasi', labelX, currentY + 165);
  ctx.fillText(':', colX, currentY + 165);
  ctx.fillText(params.location || 'Kampus SMP Islam Al Azhar 9 Bekasi', valX, currentY + 165);

  ctx.fillText('Keterangan', labelX, currentY + 205);
  ctx.fillText(':', colX, currentY + 205);
  ctx.fillText(params.notes || 'Melaporkan hasil kegiatan kepada Kepala Sekolah setelah selesai tugas.', valX, currentY + 205);

  currentY += 280;

  // 6. Penutup
  ctx.fillStyle = '#0F172A';
  ctx.font = '17px sans-serif';
  ctx.fillText('Demikian Surat Tugas ini diberikan untuk dilaksanakan dengan sebaik-baiknya', 100, currentY);
  ctx.fillText('dan penuh rasa tanggung jawab.', 100, currentY + 30);

  // 7. Tanda Tangan & Cap Stempel
  const ttdX = 750;
  let ttdY = currentY + 70;
  ctx.font = '17px sans-serif';
  ctx.fillText(`Bekasi, ${formatSingleDateIndonesian(params.startDate)}`, ttdX, ttdY);
  ttdY += 30;
  ctx.font = 'bold 17px sans-serif';
  ctx.fillText('Kepala Sekolah,', ttdX, ttdY);

  // Cap Stempel Bulat Biru
  ctx.save();
  ctx.strokeStyle = 'rgba(30, 58, 138, 0.7)';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(ttdX + 40, ttdY + 60, 48, 0, Math.PI * 2);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(ttdX + 40, ttdY + 60, 40, 0, Math.PI * 2);
  ctx.stroke();
  ctx.font = 'bold 10px sans-serif';
  ctx.fillStyle = 'rgba(30, 58, 138, 0.7)';
  ctx.textAlign = 'center';
  ctx.fillText('YAYASAN ASRAM', ttdX + 40, ttdY + 45);
  ctx.fillText('★ SMPIA 9 ★', ttdX + 40, ttdY + 62);
  ctx.fillText('BEKASI', ttdX + 40, ttdY + 78);
  ctx.restore();

  ttdY += 120;
  ctx.textAlign = 'left';
  ctx.font = 'bold 18px sans-serif';
  ctx.fillStyle = '#0F172A';
  ctx.fillText(params.issuer || 'Drs. H. M. Bahrudin, M.Pd.', ttdX, ttdY);
  ctx.strokeStyle = '#0F172A';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(ttdX, ttdY + 5);
  ctx.lineTo(ttdX + 260, ttdY + 5);
  ctx.stroke();
  ctx.font = '16px sans-serif';
  ctx.fillText('NIP. 19780415 200501 1 002', ttdX, ttdY + 28);

  return canvas.toDataURL('image/jpeg', 0.92);
}

/**
 * Generate initial sample Duty Letters across 2025 and 2026
 */
export function generateInitialDutyLetters(employees: Employee[]): DutyLetter[] {
  const letters: DutyLetter[] = [];

  // 1. Surat Tugas ANBK & Asesmen Nasional (Januari 2025)
  const anbkStaff: AssignedStaff[] = employees.slice(0, 4).map((e, idx) => ({
    employeeId: e.id,
    employeeName: e.name,
    employeeNip: e.nip,
    roleInDuty: idx === 0 ? 'Ketua Panitia / Proktor Utama' : idx === 1 ? 'Teknisi Jaringan' : 'Pengawas Ruang Ujian',
  }));

  const doc1Pdf = generateDutyLetterPdfDataUrl({
    letterNumber: '045/ST-SMP-IA9/I/2025',
    title: 'Surat Tugas Panitia & Pengawas Simulasi ANBK 2025',
    description: 'Menyelenggarakan simulasi dan pengawasan asesmen berbasis komputer bagi siswa kelas VIII.',
    assignedToType: 'specific',
    assignedEmployees: anbkStaff,
    startDate: '2025-01-13',
    endDate: '2025-01-17',
    location: 'Laboratorium Komputer & Multimedia SMPIA 9 Bekasi',
    issuer: 'Drs. H. M. Bahrudin, M.Pd.',
    notes: 'Seluruh panitia wajib hadir 30 menit sebelum sesi dimulai dan mengisi berita acara pelaksanaan.',
  });

  letters.push({
    id: 'duty-letter-1',
    letterNumber: '045/ST-SMP-IA9/I/2025',
    title: 'Panitia & Pengawas Simulasi Asesmen Nasional (ANBK)',
    description: 'Menyelenggarakan simulasi asesmen berbasis komputer, koordinasi proktor, teknisi ruang laboratorium, dan pengawas ruang ujian.',
    assignedToType: 'specific',
    assignedEmployees: anbkStaff,
    startDate: '2025-01-13',
    endDate: '2025-01-17',
    periodMonth: 1,
    periodYear: 2025,
    period: '2025-01',
    location: 'Laboratorium Komputer & Multimedia SMPIA 9 Bekasi',
    issuer: 'Drs. H. M. Bahrudin, M.Pd. (Kepala Sekolah)',
    fileName: 'Surat_Tugas_Panitia_ANBK_Januari_2025.pdf',
    fileType: 'pdf',
    fileMimeType: 'application/pdf',
    fileData: doc1Pdf,
    fileSize: 48200,
    uploadDate: '2025-01-10T08:30:00.000Z',
    uploadedBy: 'Admin Tata Usaha',
    status: 'completed',
    notes: 'Tugas telah selesai dilaksanakan dengan baik.',
  });

  // 2. Surat Tugas Workshop Kurikulum Merdeka & Deep Learning (Februari 2025) - JPG scan format
  const workshopStaff: AssignedStaff[] = employees.slice(2, 6).map((e, idx) => ({
    employeeId: e.id,
    employeeName: e.name,
    employeeNip: e.nip,
    roleInDuty: idx === 0 ? 'Koordinator Guru Mapel' : 'Peserta Workshop Mandiri',
  }));

  const doc2Jpg = generateDutyLetterJpgDataUrl({
    letterNumber: '088/ST-SMP-IA9/II/2025',
    title: 'Workshop Penguatan Kurikulum Merdeka & Modul Ajar Digital',
    description: 'Mengikuti pelatihan penyusunan Modul Ajar berdiferensiasi dan instrumen asesmen pembelajaran modern.',
    assignedToType: 'specific',
    assignedEmployees: workshopStaff,
    startDate: '2025-02-18',
    endDate: '2025-02-20',
    location: 'Aula Direktorat Dikdasmen YPI Al Azhar Jakarta Selatan',
    issuer: 'Drs. H. M. Bahrudin, M.Pd.',
    notes: 'Peserta membawa laptop dan draft RPP/Modul Ajar semester genap.',
  });

  letters.push({
    id: 'duty-letter-2',
    letterNumber: '088/ST-SMP-IA9/II/2025',
    title: 'Workshop Penguatan Kurikulum Merdeka & Modul Ajar Digital',
    description: 'Mengikuti pelatihan penyusunan modul ajar berbasis proyek penguatan profil pelajar Pancasila (P5) dan deep learning.',
    assignedToType: 'specific',
    assignedEmployees: workshopStaff,
    startDate: '2025-02-18',
    endDate: '2025-02-20',
    periodMonth: 2,
    periodYear: 2025,
    period: '2025-02',
    location: 'Aula Direktorat Dikdasmen YPI Al Azhar Jakarta Selatan',
    issuer: 'Drs. H. M. Bahrudin, M.Pd. (Kepala Sekolah)',
    fileName: 'Scan_Surat_Tugas_Workshop_Kurikulum_Feb2025.jpg',
    fileType: 'image',
    fileMimeType: 'image/jpeg',
    fileData: doc2Jpg,
    fileSize: 128400,
    uploadDate: '2025-02-15T09:15:00.000Z',
    uploadedBy: 'Admin HRD & Kurikulum',
    status: 'completed',
    notes: 'Sertifikat pelatihan telah diserahkan ke bagian kepegawaian.',
  });

  // 3. Surat Tugas Pelaksanaan Pesantren Kilat & Amaliah Ramadhan (Maret 2025) - PDF untuk Seluruh Guru & Staf
  const doc3Pdf = generateDutyLetterPdfDataUrl({
    letterNumber: '112/ST-SMP-IA9/III/2025',
    title: 'Panitia Amaliah Ramadhan & Pesantren Kilat 1446 H',
    description: 'Menyelenggarakan kegiatan keagamaan, tadarus Al-Qur\'an, bakti sosial, dan shalat tarawih berjamaah.',
    assignedToType: 'all',
    assignedEmployees: [],
    startDate: '2025-03-10',
    endDate: '2025-03-22',
    location: 'Masjid Raya Al Azhar Kemang Pratama & Kampus Sekolah',
    issuer: 'Drs. H. M. Bahrudin, M.Pd.',
    notes: 'Seluruh dewan guru dan staf terlibat aktif sesuai jadwal piket yang telah ditentukan.',
  });

  letters.push({
    id: 'duty-letter-3',
    letterNumber: '112/ST-SMP-IA9/III/2025',
    title: 'Pelaksanaan Amaliah Ramadhan & Pesantren Kilat 1446 H (Seluruh Pegawai)',
    description: 'Menyelenggarakan kegiatan pembinaan ibadah praktis, tahsin Al-Qur\'an, santunan yatim dhuafa, dan iktikaf civitas sekolah.',
    assignedToType: 'all',
    assignedEmployees: [],
    startDate: '2025-03-10',
    endDate: '2025-03-22',
    periodMonth: 3,
    periodYear: 2025,
    period: '2025-03',
    location: 'Masjid Raya Al Azhar Kemang Pratama & Kampus Sekolah',
    issuer: 'Drs. H. M. Bahrudin, M.Pd. (Kepala Sekolah)',
    fileName: 'Surat_Tugas_Ramadhan_1446H_Semua_Pegawai.pdf',
    fileType: 'pdf',
    fileMimeType: 'application/pdf',
    fileData: doc3Pdf,
    fileSize: 52100,
    uploadDate: '2025-03-05T07:45:00.000Z',
    uploadedBy: 'Admin Keagamaan & HRD',
    status: 'completed',
    notes: 'Berlaku bagi seluruh guru dan staf sekolah.',
  });

  // 4. Surat Tugas Pendampingan Lomba Olimpiade Sains & FLS2N (Agustus 2026 / Berjalan) - PDF
  const contestStaff: AssignedStaff[] = employees.slice(1, 5).map((e, idx) => ({
    employeeId: e.id,
    employeeName: e.name,
    employeeNip: e.nip,
    roleInDuty: idx === 0 ? 'Official / Pembimbing Utama IPA' : idx === 1 ? 'Pembimbing Matematika' : 'Pendamping Siswa',
  }));

  const doc4Pdf = generateDutyLetterPdfDataUrl({
    letterNumber: '240/ST-SMP-IA9/VIII/2026',
    title: 'Pembimbing & Pendamping Kontingen Olimpiade Sains Nasional (OSN) 2026',
    description: 'Mendampingi kontingen siswa SMP Islam Al Azhar 9 dalam babak penyisihan dan final OSN tingkat Provinsi Jawa Barat.',
    assignedToType: 'specific',
    assignedEmployees: contestStaff,
    startDate: '2026-08-25',
    endDate: '2026-08-30',
    location: 'Gedung Balai Guru Penggerak Provinsi Jawa Barat & Hybrid Daring',
    issuer: 'Drs. H. M. Bahrudin, M.Pd.',
    notes: 'Fasilitas transportasi, akomodasi, dan konsumsi ditanggung sepenuhnya oleh yayasan.',
  });

  letters.push({
    id: 'duty-letter-4',
    letterNumber: '240/ST-SMP-IA9/VIII/2026',
    title: 'Pembimbing & Pendamping Kontingen Olimpiade Sains Nasional (OSN) 2026',
    description: 'Mendampingi kontingen siswa berprestasi dalam ajang kompetisi sains tingkat provinsi serta mengkoordinasikan administrasi delegasi.',
    assignedToType: 'specific',
    assignedEmployees: contestStaff,
    startDate: '2026-08-25',
    endDate: '2026-08-30',
    periodMonth: 8,
    periodYear: 2026,
    period: '2026-08',
    location: 'Gedung Balai Guru Penggerak Jawa Barat & Kampus SMPIA 9',
    issuer: 'Drs. H. M. Bahrudin, M.Pd. (Kepala Sekolah)',
    fileName: 'Surat_Tugas_Pendamping_OSN_Agustus_2026.pdf',
    fileType: 'pdf',
    fileMimeType: 'application/pdf',
    fileData: doc4Pdf,
    fileSize: 49800,
    uploadDate: '2026-08-24T10:00:00.000Z',
    uploadedBy: 'Admin Kesiswaan',
    status: 'active',
    notes: 'Sedang berjalan aktif pekan ini.',
  });

  return letters;
}
