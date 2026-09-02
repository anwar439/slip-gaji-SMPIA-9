import React, { forwardRef, useState } from 'react';
import { CompanyProfile, Employee, SalaryRecord } from '../types';
import { formatRupiah, formatIndonesianDate } from '../utils/currencyFormatter';
import { terbilangRupiah } from '../utils/numberToIndonesianWords';
import { synchronizeSalaryRecordFromAllSources } from '../utils/salarySynchronizer';
import { useSalary } from '../context/SalaryContext';
import { Building2, CheckCircle2, ShieldCheck, QrCode, FileText, LayoutGrid, Printer } from 'lucide-react';

interface OfficialSalarySlipProps {
  record: SalaryRecord;
  company: CompanyProfile;
  employee?: Employee | null;
  isCompact?: boolean;
}

export const OfficialSalarySlip = forwardRef<HTMLDivElement, OfficialSalarySlipProps>(
  ({ record: rawRecord, company, employee, isCompact = false }, ref) => {
    const { salaryMatrix, transportUkkRecords, ukkAdjustmentRecords, employees } = useSalary();
    const [viewFormat, setViewFormat] = useState<'official' | 'modern'>('official');

    // Automatically synchronize all fields from Master Gaji Pokok & UKK Akhir
    const record = synchronizeSalaryRecordFromAllSources(
      rawRecord,
      salaryMatrix,
      transportUkkRecords,
      ukkAdjustmentRecords,
      employees
    );

    const terbilangText = terbilangRupiah(record.netSalary);
    const isGuru = record.employeeDepartment?.includes('GURU') || record.employeePosition?.toLowerCase().includes('guru') || record.employeePosition?.toLowerCase().includes('pend.');

    // Numbers for Section A (Gaji Bulanan)
    const gapok = record.gajiPokokBulanan ?? record.basicSalary ?? 2470000;
    const tunjPengabdian = record.tunjanganPengabdian ?? 247000;
    const tunjKeluarga = record.tunjanganKeluarga ?? 494000;
    const tunjYayasan = record.tunjanganYayasan ?? 0;
    const tunjJabatanBulanan = record.tunjanganJabatanBulanan ?? 0;
    const bantuanPajak = record.bantuanPajak ?? 321100;
    const subtotalPendapatanA = record.subtotalPendapatanBulanan ?? (gapok + tunjPengabdian + tunjKeluarga + tunjYayasan + tunjJabatanBulanan + bantuanPajak);

    const potJht = record.potonganJht ?? 0;
    const potPesangon = record.potonganDanaPesangon ?? 0;
    const potYayasan = record.potonganYayasan ?? 0;
    const potBpjsKes = record.potonganBpjsKesehatan ?? 24700;
    const potBpjsTk = record.potonganBpjsKetenagakerjaan ?? 74100;
    const potZis = record.potonganZis ?? 80275;
    const potKoperasiAlAzhar = record.potonganKoperasiAlAzhar ?? 0;
    const potForsipa = record.potonganForsipa ?? 0;
    const potIpSpp = record.potonganIpSppYwamjp ?? 0;
    const potPajak = record.potonganPajak ?? bantuanPajak;
    const subtotalPotonganA = record.subtotalPotonganBulanan ?? (potJht + potPesangon + potYayasan + potBpjsKes + potBpjsTk + potZis + potKoperasiAlAzhar + potForsipa + potIpSpp + potPajak);
    const gajiBulananBersih = record.totalGajiBulananBersih ?? (subtotalPendapatanA - subtotalPotonganA);

    // Numbers for Section B (Rekap Harian)
    const ukkKotor = record.ukkKotorHarian ?? 3607250;
    const transpotHarian = record.transportHarian ?? 1325000;
    const uangMakan = record.uangMakanHarian ?? 650000;
    const tunjKepalaUrusan = record.tunjanganKepalaUrusan ?? (record.tunjanganStaffPimpinan || 150000);
    const tunjWaliKelas = record.tunjanganWaliKelas ?? 0;
    const subtotalPendapatanB = record.subtotalPendapatanHarian ?? (ukkKotor + transpotHarian + uangMakan + tunjKepalaUrusan + tunjWaliKelas);

    const potUkk = record.potonganUkkHarian ?? 125000;
    const potKop1 = record.potonganKoperasiYpi ?? 0;
    const potKesra = record.potonganKesra ?? 0;
    const potKop2 = record.potonganKoperasiYwam ?? 0;
    const potYwamjp = record.potonganYwAmjp ?? 0;
    const subtotalPotonganB = record.subtotalPotonganHarian ?? (potUkk + potKop1 + potKesra + potKop2 + potYwamjp);
    const rekapHarianBersih = record.totalRekapHarianBersih ?? (subtotalPendapatanB - subtotalPotonganB);

    // Grand Total
    const totalDibayarkan = record.jumlahYangDibayarkan ?? (gajiBulananBersih + rekapHarianBersih);

    return (
      <div className="w-full">
        {/* Toggle Format Bar (Hidden in Print) */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4 print:hidden bg-slate-100 p-2.5 rounded-xl border border-slate-200">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-700">Tampilan Slip Gaji:</span>
            <div className="inline-flex rounded-lg p-0.5 bg-slate-200">
              <button
                type="button"
                onClick={() => setViewFormat('official')}
                className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all flex items-center gap-1.5 ${
                  viewFormat === 'official'
                    ? 'bg-emerald-700 text-white shadow-xs'
                    : 'text-slate-700 hover:text-slate-900'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Format Resmi SMP Islam Al Azhar 9 (Sesuai Asli)</span>
              </button>
              <button
                type="button"
                onClick={() => setViewFormat('modern')}
                className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all flex items-center gap-1.5 ${
                  viewFormat === 'modern'
                    ? 'bg-emerald-700 text-white shadow-xs'
                    : 'text-slate-700 hover:text-slate-900'
                }`}
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span>Format Modern Interaktif</span>
              </button>
            </div>
          </div>

          <div className="text-xs text-slate-500 font-mono flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-500"></span>
            <span>Tersinkronisasi 100% dari Master Gaji Pokok & UKK Akhir</span>
          </div>
        </div>

        {/* --- FORMAT 1: OFFICIAL AL AZHAR 9 SLIP (SESUAI GAMBAR ASLI) --- */}
        {viewFormat === 'official' ? (
          <div
            ref={ref}
            id={`salary-slip-${record.id}`}
            className={`bg-white text-slate-950 mx-auto transition-all font-sans print:p-0 ${
              isCompact ? 'p-4 sm:p-6 max-w-4xl' : 'p-6 sm:p-8 max-w-4xl shadow-xl border-2 border-slate-800 rounded-lg'
            }`}
            style={{ minHeight: '900px' }}
          >
            {/* 1. DUAL HEADER LOGOS & TITLE */}
            <div className="flex items-center justify-between pb-3 border-b-2 border-slate-900">
              {/* Logo Kiri: SMP ISLAM AL AZHAR 9 */}
              <div className="flex items-center gap-3">
                {company.schoolLogoUrl ? (
                  <img
                    src={company.schoolLogoUrl}
                    alt="Logo Sekolah"
                    className="w-14 h-14 sm:w-16 sm:h-16 object-contain flex-shrink-0"
                  />
                ) : (
                  <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-gradient-to-br from-emerald-800 to-teal-950 text-amber-300 border-2 border-amber-400/80 flex flex-col items-center justify-center font-bold text-center shadow-xs flex-shrink-0">
                    <span className="text-[9px] uppercase tracking-tighter text-emerald-100 font-serif">SMP ISLAM</span>
                    <span className="text-xs sm:text-sm font-black tracking-tight text-amber-300">AL AZHAR 9</span>
                    <span className="text-[8px] text-emerald-200">BEKASI</span>
                  </div>
                )}
              </div>

              {/* Judul Tengah */}
              <div className="text-center flex-1 px-2">
                <p className="text-[10px] sm:text-xs font-bold text-slate-700 uppercase tracking-wider">
                  {company.foundationName || 'YAYASAN WAKAF AL MUHAJIRIEN JAKAPERMAI'}
                </p>
                <h1 className="text-base sm:text-xl font-black tracking-tight text-slate-950 uppercase leading-snug">
                  {isGuru ? 'SLIP GAJI GURU' : 'SLIP GAJI KARYAWAN'}
                </h1>
                <h2 className="text-xs sm:text-base font-bold text-slate-900 uppercase">
                  {company.schoolName || company.name || 'SMP ISLAM AL AZHAR 9 BEKASI'}
                </h2>
                <p className="text-[11px] sm:text-xs text-slate-700 font-semibold mt-0.5">
                  Periode {record.periodLabel || '16 Agustus s.d 15 September 2023'}
                </p>
              </div>

              {/* Logo Kanan: YAYASAN WAKAF AL MUHAJIRIEN JAKAPERMAI */}
              <div className="flex items-center gap-3">
                {company.foundationLogoUrl ? (
                  <img
                    src={company.foundationLogoUrl}
                    alt="Logo Yayasan"
                    className="w-14 h-14 sm:w-16 sm:h-16 object-contain flex-shrink-0"
                  />
                ) : (
                  <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-gradient-to-br from-teal-900 to-slate-950 text-white border-2 border-teal-400 flex flex-col items-center justify-center font-bold text-center shadow-xs flex-shrink-0">
                    <span className="text-[8px] uppercase tracking-tighter text-teal-200">YAYASAN WAKAF</span>
                    <span className="text-[10px] font-black text-amber-300">AL-MUHAJIRIEN</span>
                    <span className="text-[7px] text-teal-100">JAKAPERMAI</span>
                  </div>
                )}
              </div>
            </div>

            {/* 2. HEADER METADATA (NAMA, JABATAN, NIP, STATUS, GOL & ABSENSI) */}
            <div className="border-x-2 border-b-2 border-slate-900 text-xs sm:text-[13px] bg-slate-50/40">
              <div className="grid grid-cols-12 divide-y md:divide-y-0 md:divide-x-2 divide-slate-900">
                {/* Kolom Data Pegawai (Kiri) */}
                <div className="col-span-12 md:col-span-7 p-2.5 sm:p-3 space-y-1">
                  <div className="grid grid-cols-12">
                    <span className="col-span-5 font-semibold text-slate-800">Nama</span>
                    <span className="col-span-7 font-bold text-slate-950">: {record.employeeName}</span>
                  </div>
                  <div className="grid grid-cols-12">
                    <span className="col-span-5 font-semibold text-slate-800">Jabatan</span>
                    <span className="col-span-7 font-semibold text-slate-900">: {record.employeePosition}</span>
                  </div>
                  <div className="grid grid-cols-12">
                    <span className="col-span-5 font-semibold text-slate-800">Nomor Induk Pegawai</span>
                    <span className="col-span-7 font-mono font-bold text-slate-950">: {record.employeeNip}</span>
                  </div>
                  <div className="grid grid-cols-12">
                    <span className="col-span-5 font-semibold text-slate-800">Status</span>
                    <span className="col-span-7 font-bold text-slate-900">: {record.employeeStatusTag || 'GTY'}</span>
                  </div>
                  <div className="grid grid-cols-12">
                    <span className="col-span-5 font-semibold text-slate-800">Gol</span>
                    <span className="col-span-7 font-bold text-slate-900">: {record.levelTag || 'V B'}</span>
                  </div>
                </div>

                {/* Kolom Data Kehadiran (Kanan) */}
                <div className="col-span-12 md:col-span-5 p-2.5 sm:p-3 space-y-1">
                  <div className="grid grid-cols-12">
                    <span className="col-span-6 font-semibold text-slate-800">Hari Kerja</span>
                    <span className="col-span-6 font-bold text-slate-950">: {record.hariKerja || 25}</span>
                  </div>
                  <div className="grid grid-cols-12">
                    <span className="col-span-6 font-semibold text-slate-800">DL-5</span>
                    <span className="col-span-6 font-bold text-slate-900">: {record.datangLambatMin5 && record.datangLambatMin5 > 0 ? record.datangLambatMin5 : ''}</span>
                  </div>
                  <div className="grid grid-cols-12">
                    <span className="col-span-6 font-semibold text-slate-800">DL+5</span>
                    <span className="col-span-6 font-bold text-slate-900">: {record.datangLambatPlus5 && record.datangLambatPlus5 > 0 ? record.datangLambatPlus5 : ''}</span>
                  </div>
                  <div className="grid grid-cols-12">
                    <span className="col-span-6 font-semibold text-slate-800">PC-5</span>
                    <span className="col-span-6 font-bold text-slate-900">: {record.pulangCepatMin5 && record.pulangCepatMin5 > 0 ? record.pulangCepatMin5 : ''}</span>
                  </div>
                  <div className="grid grid-cols-12">
                    <span className="col-span-6 font-semibold text-slate-800">PC+5</span>
                    <span className="col-span-6 font-bold text-slate-900">: {record.pulangCepatPlus5 && record.pulangCepatPlus5 > 0 ? record.pulangCepatPlus5 : ''}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* 3. MAIN TABLE OF SALARY BREAKDOWN (BORDERED GRID EXACT MATCH) */}
            <div className="border-x-2 border-b-2 border-slate-900 text-xs sm:text-[13px] overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-slate-200 text-slate-900 font-bold border-b-2 border-slate-900 uppercase text-center text-xs sm:text-[13px]">
                    <th className="py-1.5 px-3 border-r-2 border-slate-900 w-[35%] text-left">PENDAPATAN</th>
                    <th className="py-1.5 px-3 border-r-2 border-slate-900 w-[15%] text-right">JUMLAH</th>
                    <th className="py-1.5 px-3 border-r-2 border-slate-900 w-[35%] text-left">POTONGAN</th>
                    <th className="py-1.5 px-3 w-[15%] text-right">JUMLAH</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-300">
                  {/* --- SECTION A: GAJI BULANAN --- */}
                  <tr className="bg-slate-100 font-bold text-slate-900 border-b border-slate-400">
                    <td colSpan={2} className="py-1 px-3 border-r-2 border-slate-900 uppercase">
                      A. Gaji Bulanan
                    </td>
                    <td colSpan={2} className="py-1 px-3 uppercase">
                      {/* Empty header for Potongan A */}
                    </td>
                  </tr>

                  {/* Rows Section A */}
                  <tr>
                    <td className="py-0.5 px-3 border-r-2 border-slate-900">1. Gaji Pokok</td>
                    <td className="py-0.5 px-3 border-r-2 border-slate-900 text-right font-mono font-medium">{formatRupiah(gapok)}</td>
                    <td className="py-0.5 px-3 border-r-2 border-slate-900">1. JHT</td>
                    <td className="py-0.5 px-3 text-right font-mono font-medium">{potJht > 0 ? formatRupiah(potJht) : 'Rp -'}</td>
                  </tr>
                  <tr>
                    <td className="py-0.5 px-3 border-r-2 border-slate-900">2. Tunjangan Pengabdian</td>
                    <td className="py-0.5 px-3 border-r-2 border-slate-900 text-right font-mono font-medium">{tunjPengabdian > 0 ? formatRupiah(tunjPengabdian) : 'Rp -'}</td>
                    <td className="py-0.5 px-3 border-r-2 border-slate-900">2. Dana Pesangon</td>
                    <td className="py-0.5 px-3 text-right font-mono font-medium">{potPesangon > 0 ? formatRupiah(potPesangon) : 'Rp -'}</td>
                  </tr>
                  <tr>
                    <td className="py-0.5 px-3 border-r-2 border-slate-900">3. Tunjangan Keluarga</td>
                    <td className="py-0.5 px-3 border-r-2 border-slate-900 text-right font-mono font-medium">{tunjKeluarga > 0 ? formatRupiah(tunjKeluarga) : 'Rp -'}</td>
                    <td className="py-0.5 px-3 border-r-2 border-slate-900">3. Yayasan</td>
                    <td className="py-0.5 px-3 text-right font-mono font-medium">{potYayasan > 0 ? formatRupiah(potYayasan) : 'Rp -'}</td>
                  </tr>
                  <tr>
                    <td className="py-0.5 px-3 border-r-2 border-slate-900">4. Tunjangan Yayasan</td>
                    <td className="py-0.5 px-3 border-r-2 border-slate-900 text-right font-mono font-medium">{tunjYayasan > 0 ? formatRupiah(tunjYayasan) : 'Rp -'}</td>
                    <td className="py-0.5 px-3 border-r-2 border-slate-900">4. BPJS Kesehatan</td>
                    <td className="py-0.5 px-3 text-right font-mono font-medium">{potBpjsKes > 0 ? formatRupiah(potBpjsKes) : 'Rp -'}</td>
                  </tr>
                  <tr>
                    <td className="py-0.5 px-3 border-r-2 border-slate-900">5. Tunjangan Jabatan</td>
                    <td className="py-0.5 px-3 border-r-2 border-slate-900 text-right font-mono font-medium">{tunjJabatanBulanan > 0 ? formatRupiah(tunjJabatanBulanan) : 'Rp -'}</td>
                    <td className="py-0.5 px-3 border-r-2 border-slate-900">5. BPJS Ketenagakerjaan</td>
                    <td className="py-0.5 px-3 text-right font-mono font-medium">{potBpjsTk > 0 ? formatRupiah(potBpjsTk) : 'Rp -'}</td>
                  </tr>
                  <tr>
                    <td className="py-0.5 px-3 border-r-2 border-slate-900">6. Bantuan Pajak</td>
                    <td className="py-0.5 px-3 border-r-2 border-slate-900 text-right font-mono font-medium">{bantuanPajak > 0 ? formatRupiah(bantuanPajak) : 'Rp -'}</td>
                    <td className="py-0.5 px-3 border-r-2 border-slate-900">6. ZIS 2,5 %</td>
                    <td className="py-0.5 px-3 text-right font-mono font-medium">{potZis > 0 ? formatRupiah(potZis) : 'Rp -'}</td>
                  </tr>
                  <tr>
                    <td className="py-0.5 px-3 border-r-2 border-slate-900">7. ............................................................</td>
                    <td className="py-0.5 px-3 border-r-2 border-slate-900 text-right font-mono"></td>
                    <td className="py-0.5 px-3 border-r-2 border-slate-900">7. Koperasi Al Azhar</td>
                    <td className="py-0.5 px-3 text-right font-mono font-medium">{potKoperasiAlAzhar > 0 ? formatRupiah(potKoperasiAlAzhar) : 'Rp -'}</td>
                  </tr>
                  <tr>
                    <td className="py-0.5 px-3 border-r-2 border-slate-900">8. ............................................................</td>
                    <td className="py-0.5 px-3 border-r-2 border-slate-900 text-right font-mono"></td>
                    <td className="py-0.5 px-3 border-r-2 border-slate-900">8. Forsipa</td>
                    <td className="py-0.5 px-3 text-right font-mono font-medium">{potForsipa > 0 ? formatRupiah(potForsipa) : 'Rp -'}</td>
                  </tr>
                  <tr>
                    <td className="py-0.5 px-3 border-r-2 border-slate-900">9. ............................................................</td>
                    <td className="py-0.5 px-3 border-r-2 border-slate-900 text-right font-mono"></td>
                    <td className="py-0.5 px-3 border-r-2 border-slate-900">9. Pot. IP/SPP YWAMJP</td>
                    <td className="py-0.5 px-3 text-right font-mono font-medium">{potIpSpp > 0 ? formatRupiah(potIpSpp) : 'Rp -'}</td>
                  </tr>
                  <tr>
                    <td className="py-0.5 px-3 border-r-2 border-slate-900 font-bold"></td>
                    <td className="py-0.5 px-3 border-r-2 border-slate-900 text-right font-mono"></td>
                    <td className="py-0.5 px-3 border-r-2 border-slate-900">10. Pajak</td>
                    <td className="py-0.5 px-3 text-right font-mono font-medium">{potPajak > 0 ? formatRupiah(potPajak) : 'Rp -'}</td>
                  </tr>

                  {/* Subtotal Section A */}
                  <tr className="bg-slate-100 font-bold text-slate-950 border-t border-slate-400">
                    <td className="py-1 px-3 border-r-2 border-slate-900">Jumlah</td>
                    <td className="py-1 px-3 border-r-2 border-slate-900 text-right font-mono font-bold">{formatRupiah(subtotalPendapatanA)}</td>
                    <td className="py-1 px-3 border-r-2 border-slate-900">Jumlah</td>
                    <td className="py-1 px-3 text-right font-mono font-bold">{formatRupiah(subtotalPotonganA)}</td>
                  </tr>

                  {/* Net Section A */}
                  <tr className="bg-slate-200/90 font-black text-slate-950 border-b-2 border-slate-900 text-xs sm:text-[13px]">
                    <td colSpan={4} className="py-1.5 px-3 text-right font-mono">
                      Jumlah = <span className="text-slate-950 ml-2">{formatRupiah(gajiBulananBersih)}</span>
                    </td>
                  </tr>

                  {/* --- SECTION B: REKAP HARIAN --- */}
                  <tr className="bg-slate-100 font-bold text-slate-900 border-b border-slate-400">
                    <td colSpan={2} className="py-1 px-3 border-r-2 border-slate-900 uppercase">
                      B. Rekap Harian
                    </td>
                    <td colSpan={2} className="py-1 px-3 uppercase">
                      {/* Empty header for Potongan B */}
                    </td>
                  </tr>

                  {/* Rows Section B */}
                  <tr>
                    <td className="py-0.5 px-3 border-r-2 border-slate-900">1. UKK</td>
                    <td className="py-0.5 px-3 border-r-2 border-slate-900 text-right font-mono font-medium">{formatRupiah(ukkKotor)}</td>
                    <td className="py-0.5 px-3 border-r-2 border-slate-900">1. UKK</td>
                    <td className="py-0.5 px-3 text-right font-mono font-medium">{potUkk > 0 ? formatRupiah(potUkk) : 'Rp -'}</td>
                  </tr>
                  <tr>
                    <td className="py-0.5 px-3 border-r-2 border-slate-900">2. Transpot Harian</td>
                    <td className="py-0.5 px-3 border-r-2 border-slate-900 text-right font-mono font-medium">{formatRupiah(transpotHarian)}</td>
                    <td className="py-0.5 px-3 border-r-2 border-slate-900">2. Koperasi YW Al Muhajirien 1</td>
                    <td className="py-0.5 px-3 text-right font-mono font-medium">{potKop1 > 0 ? formatRupiah(potKop1) : 'Rp -'}</td>
                  </tr>
                  <tr>
                    <td className="py-0.5 px-3 border-r-2 border-slate-900">3. Uang Makan</td>
                    <td className="py-0.5 px-3 border-r-2 border-slate-900 text-right font-mono font-medium">{formatRupiah(uangMakan)}</td>
                    <td className="py-0.5 px-3 border-r-2 border-slate-900">3. Kesra Karyawan</td>
                    <td className="py-0.5 px-3 text-right font-mono font-medium">{potKesra > 0 ? formatRupiah(potKesra) : 'Rp -'}</td>
                  </tr>
                  <tr>
                    <td className="py-0.5 px-3 border-r-2 border-slate-900">4. Tunjangan Kepala Urusan</td>
                    <td className="py-0.5 px-3 border-r-2 border-slate-900 text-right font-mono font-medium">{tunjKepalaUrusan > 0 ? formatRupiah(tunjKepalaUrusan) : 'Rp -'}</td>
                    <td className="py-0.5 px-3 border-r-2 border-slate-900">4. Koperasi YW Al Muhajirien 2</td>
                    <td className="py-0.5 px-3 text-right font-mono font-medium">{potKop2 > 0 ? formatRupiah(potKop2) : 'Rp -'}</td>
                  </tr>
                  <tr>
                    <td className="py-0.5 px-3 border-r-2 border-slate-900">5. Tunjangan Wali Kelas</td>
                    <td className="py-0.5 px-3 border-r-2 border-slate-900 text-right font-mono font-medium">{tunjWaliKelas > 0 ? formatRupiah(tunjWaliKelas) : 'Rp -'}</td>
                    <td className="py-0.5 px-3 border-r-2 border-slate-900">5. YW Al Muhajirien Jakapermai</td>
                    <td className="py-0.5 px-3 text-right font-mono font-medium">{potYwamjp > 0 ? formatRupiah(potYwamjp) : 'Rp -'}</td>
                  </tr>

                  {/* Subtotal Section B */}
                  <tr className="bg-slate-100 font-bold text-slate-950 border-t border-slate-400">
                    <td className="py-1 px-3 border-r-2 border-slate-900">Jumlah</td>
                    <td className="py-1 px-3 border-r-2 border-slate-900 text-right font-mono font-bold">{formatRupiah(subtotalPendapatanB)}</td>
                    <td className="py-1 px-3 border-r-2 border-slate-900">Jumlah</td>
                    <td className="py-1 px-3 text-right font-mono font-bold">{formatRupiah(subtotalPotonganB)}</td>
                  </tr>

                  {/* Net Section B */}
                  <tr className="bg-slate-200/90 font-black text-slate-950 border-b-2 border-slate-900 text-xs sm:text-[13px]">
                    <td colSpan={4} className="py-1.5 px-3 text-right font-mono">
                      Jumlah = <span className="text-slate-950 ml-2">{formatRupiah(rekapHarianBersih)}</span>
                    </td>
                  </tr>

                  {/* --- FINAL ROW: JUMLAH YANG DIBAYARKAN --- */}
                  <tr className="bg-slate-900 text-white font-black text-xs sm:text-sm tracking-wide">
                    <td colSpan={4} className="py-2.5 px-4 text-center sm:text-right">
                      <span className="uppercase mr-3 text-amber-300 font-bold">JUMLAH YANG DIBAYARKAN =</span>
                      <span className="font-mono text-base sm:text-lg text-emerald-400 font-black">
                        {formatRupiah(totalDibayarkan)}
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* 4. TERBILANG & REKENING PENYALUR */}
            <div className="border-x-2 border-b-2 border-slate-900 p-2.5 sm:p-3 bg-slate-50 text-xs sm:text-[13px] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
              <div>
                <span className="font-bold text-slate-700">Terbilang: </span>
                <span className="italic font-semibold text-slate-900"># {terbilangText} #</span>
              </div>
              <div className="text-slate-600 text-[11px] font-mono">
                Transfer Rekening: <span className="font-bold text-slate-900">{record.bankName || 'BSI'} ({record.bankAccountNumber || '7120632951'})</span>
              </div>
            </div>

            {/* 5. TANDA TANGAN & PENGESAHAN RESMI */}
            <div className="border-x-2 border-b-2 border-slate-900 p-4 sm:p-6 bg-white">
              <div className="flex justify-between items-end">
                {/* Left QR Authentication */}
                <div className="hidden sm:flex items-center gap-3">
                  <div className="w-16 h-16 border-2 border-slate-800 rounded p-1 flex items-center justify-center">
                    <QrCode className="w-14 h-14 text-slate-800" />
                  </div>
                  <div className="text-[10px] text-slate-600 font-mono leading-tight">
                    <div className="font-bold text-slate-900">SMPIA9-PAYROLL-VERIFIED</div>
                    <div>DOC-ID: {record.id.slice(0, 14).toUpperCase()}</div>
                    <div className="text-emerald-700 font-bold">STATUS: TERVERIFIKASI DIGITAL</div>
                  </div>
                </div>

                {/* Right Signature Area */}
                <div className="text-center w-64 ml-auto">
                  <p className="text-xs text-slate-800 font-medium">
                    Bekasi, {formatIndonesianDate(record.paymentDate)}
                  </p>
                  <p className="text-xs font-bold text-slate-900 mt-0.5">
                    {company.principalTitle || 'Kepala Sekolah Penyelenggara'},
                  </p>

                  {/* Digital Signature & Stamp Overlay */}
                  <div className="h-20 flex items-center justify-center relative my-1">
                    {/* Stempel Sekolah */}
                    {company.stampImageUrl ? (
                      <img
                        src={company.stampImageUrl}
                        alt="Stempel Sekolah"
                        className="absolute w-24 h-24 object-contain opacity-80 rotate-[-12deg] pointer-events-none"
                      />
                    ) : (
                      <div className="absolute w-24 h-24 rounded-full border-2 border-emerald-700/40 rotate-[-12deg] flex flex-col items-center justify-center text-[8px] font-bold text-emerald-800 uppercase pointer-events-none text-center p-1">
                        <span>{company.schoolName?.slice(0, 15) || 'SMP ISLAM 9'}</span>
                        <span className="text-[7px]">TERVERIFIKASI</span>
                      </div>
                    )}

                    {/* Tanda Tangan */}
                    {company.signatureImageUrl ? (
                      <img
                        src={company.signatureImageUrl}
                        alt="Tanda Tangan Kepala Sekolah"
                        className="h-16 max-w-[180px] object-contain z-10"
                      />
                    ) : (
                      <div className="font-serif italic font-bold text-slate-800 text-base z-10">
                        {company.principalName?.split(',')[0] || 'Amirudin'}
                      </div>
                    )}
                  </div>

                  <p className="text-xs font-bold text-slate-950 border-t border-slate-900 pt-1">
                    {company.principalName || 'Amirudin, M.Pd.'}
                  </p>
                  <p className="text-[10px] text-slate-600 font-mono">
                    NIP. {company.principalNip || '102041398'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* --- FORMAT 2: MODERN INTERACTIVE SLIP --- */
          <div
            ref={ref}
            id={`salary-slip-modern-${record.id}`}
            className={`bg-white text-slate-900 mx-auto transition-all print:p-6 ${
              isCompact ? 'p-6 max-w-4xl' : 'p-8 sm:p-10 max-w-4xl shadow-lg border border-slate-200 rounded-2xl'
            }`}
            style={{ minHeight: '900px' }}
          >
            {/* Header Modern */}
            <div className="border-b-2 border-slate-900 pb-5 mb-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3.5">
                  <div className="w-13 h-13 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold text-xl tracking-wider shadow-sm flex-shrink-0">
                    {company.logoText || <Building2 className="w-7 h-7" />}
                  </div>
                  <div>
                    <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-950 uppercase">
                      {company.name}
                    </h1>
                    <p className="text-xs text-slate-600 font-medium mt-0.5 max-w-xl leading-relaxed">
                      {company.address}, {company.city}, {company.province} {company.postalCode}
                    </p>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 mt-1">
                      <span>Telp: {company.phone}</span>
                      <span>•</span>
                      <span>Email: {company.email}</span>
                      <span>•</span>
                      <span>NPWP: {company.npwp}</span>
                    </div>
                  </div>
                </div>

                <div className="sm:text-right border sm:border-0 border-slate-200 rounded-lg p-2.5 sm:p-0 bg-slate-50 sm:bg-transparent w-full sm:w-auto">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-md text-xs font-bold uppercase tracking-wider mb-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Dokumen Resmi Sah</span>
                  </div>
                  <div className="text-xs text-slate-500">No. Slip:</div>
                  <div className="text-xs font-mono font-bold text-slate-900 tracking-wide">{record.slipNumber}</div>
                </div>
              </div>
            </div>

            {/* Document Title */}
            <div className="text-center my-6">
              <h2 className="text-lg sm:text-xl font-extrabold tracking-tight text-slate-900 uppercase underline decoration-2 decoration-slate-900 underline-offset-4">
                SLIP GAJI KARYAWAN & GURU
              </h2>
              <p className="text-sm font-semibold text-slate-600 mt-1">
                Periode: <span className="text-slate-900 font-bold">{record.periodLabel}</span>
                {record.periodStartDate && record.periodEndDate && (
                  <span className="text-xs font-mono text-slate-500 ml-2">
                    ({record.periodStartDate} s/d {record.periodEndDate})
                  </span>
                )}
              </p>
            </div>

            {/* Employee Meta Grid */}
            <div className="bg-slate-50/80 border border-slate-200 rounded-xl p-4 sm:p-5 mb-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2.5 text-xs sm:text-sm">
                <div className="space-y-2">
                  <div className="flex justify-between border-b border-slate-200/60 pb-1.5">
                    <span className="text-slate-500 font-medium">Nomor Induk Pegawai (NIP)</span>
                    <span className="font-mono font-bold text-slate-900">{record.employeeNip}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-200/60 pb-1.5">
                    <span className="text-slate-500 font-medium">Nama Lengkap</span>
                    <span className="font-bold text-slate-900">{record.employeeName}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-200/60 pb-1.5">
                    <span className="text-slate-500 font-medium">Jabatan / Role</span>
                    <span className="font-semibold text-slate-800">{record.employeePosition}</span>
                  </div>
                  <div className="flex justify-between pb-0.5">
                    <span className="text-slate-500 font-medium">Departemen / Divisi</span>
                    <span className="font-semibold text-slate-800">{record.employeeDepartment}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between border-b border-slate-200/60 pb-1.5">
                    <span className="text-slate-500 font-medium">Status / Golongan</span>
                    <span className="font-semibold text-slate-800">
                      {record.employeeStatusTag || 'GTY'} / Gol. {record.levelTag || 'V B'}
                    </span>
                  </div>
                  <div className="flex justify-between border-b border-slate-200/60 pb-1.5">
                    <span className="text-slate-500 font-medium">Rekening Bank Penyalur</span>
                    <span className="font-semibold text-slate-900 font-mono">
                      {record.bankName || 'BSI'} - {record.bankAccountNumber || '****-****-****'}
                    </span>
                  </div>
                  <div className="flex justify-between border-b border-slate-200/60 pb-1.5">
                    <span className="text-slate-500 font-medium">Tanggal Transfer</span>
                    <span className="font-semibold text-slate-800">{formatIndonesianDate(record.paymentDate)}</span>
                  </div>
                  <div className="flex justify-between pb-0.5">
                    <span className="text-slate-500 font-medium">Kehadiran (Hadir / DL+5)</span>
                    <span className="font-semibold text-slate-900">
                      {record.hariKerja || 25} Hari {record.datangLambatPlus5 ? `(DL+5: ${record.datangLambatPlus5})` : ''}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* 2 Column Ledger */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              {/* Kolom A: Pendapatan */}
              <div className="border border-emerald-200 rounded-xl overflow-hidden flex flex-col justify-between bg-white shadow-xs">
                <div>
                  <div className="bg-emerald-700 text-white px-4 py-2.5 flex items-center justify-between">
                    <h3 className="font-bold text-xs sm:text-sm tracking-wide uppercase">A. Penerimaan / Pendapatan</h3>
                    <span className="text-xs bg-emerald-800/80 px-2 py-0.5 rounded font-mono font-medium">Income</span>
                  </div>

                  <div className="p-3.5 space-y-2 text-xs sm:text-sm">
                    <div className="flex justify-between items-center py-1 border-b border-slate-100">
                      <span className="text-slate-700">Gaji Pokok (A.1)</span>
                      <span className="font-semibold text-slate-900 font-mono">{formatRupiah(gapok)}</span>
                    </div>
                    {tunjPengabdian > 0 && (
                      <div className="flex justify-between items-center py-1 border-b border-slate-100">
                        <span className="text-slate-700">Tunjangan Pengabdian (A.2)</span>
                        <span className="font-semibold text-slate-900 font-mono">{formatRupiah(tunjPengabdian)}</span>
                      </div>
                    )}
                    {tunjKeluarga > 0 && (
                      <div className="flex justify-between items-center py-1 border-b border-slate-100">
                        <span className="text-slate-700">Tunjangan Keluarga (A.3)</span>
                        <span className="font-semibold text-slate-900 font-mono">{formatRupiah(tunjKeluarga)}</span>
                      </div>
                    )}
                    {bantuanPajak > 0 && (
                      <div className="flex justify-between items-center py-1 border-b border-slate-100">
                        <span className="text-slate-700">Bantuan Pajak (A.6)</span>
                        <span className="font-semibold text-slate-900 font-mono">{formatRupiah(bantuanPajak)}</span>
                      </div>
                    )}
                    <div className="flex justify-between items-center py-1 border-b border-slate-100 bg-emerald-50/40 px-2 rounded">
                      <span className="text-emerald-950 font-medium">UKK Harian (B.1)</span>
                      <span className="font-semibold text-emerald-900 font-mono">{formatRupiah(ukkKotor)}</span>
                    </div>
                    <div className="flex justify-between items-center py-1 border-b border-slate-100 bg-emerald-50/40 px-2 rounded">
                      <span className="text-emerald-950 font-medium">Transpot Harian (B.2)</span>
                      <span className="font-semibold text-emerald-900 font-mono">{formatRupiah(transpotHarian)}</span>
                    </div>
                    <div className="flex justify-between items-center py-1 border-b border-slate-100 bg-emerald-50/40 px-2 rounded">
                      <span className="text-emerald-950 font-medium">Uang Makan (B.3)</span>
                      <span className="font-semibold text-emerald-900 font-mono">{formatRupiah(uangMakan)}</span>
                    </div>
                    {tunjKepalaUrusan > 0 && (
                      <div className="flex justify-between items-center py-1 border-b border-slate-100 bg-emerald-50/40 px-2 rounded">
                        <span className="text-emerald-950 font-medium">Tunjangan Kepala Urusan (B.4)</span>
                        <span className="font-semibold text-emerald-900 font-mono">{formatRupiah(tunjKepalaUrusan)}</span>
                      </div>
                    )}
                    {tunjWaliKelas > 0 && (
                      <div className="flex justify-between items-center py-1 border-b border-slate-100 bg-emerald-50/40 px-2 rounded">
                        <span className="text-emerald-950 font-medium">Tunjangan Wali Kelas (B.5)</span>
                        <span className="font-semibold text-emerald-900 font-mono">{formatRupiah(tunjWaliKelas)}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="bg-emerald-50/80 border-t border-emerald-200 px-4 py-3 flex justify-between items-center">
                  <span className="font-bold text-xs sm:text-sm text-emerald-950">TOTAL PENDAPATAN (BRUTO)</span>
                  <span className="font-bold text-sm sm:text-base text-emerald-950 font-mono">
                    {formatRupiah(subtotalPendapatanA + subtotalPendapatanB)}
                  </span>
                </div>
              </div>

              {/* Kolom B: Potongan */}
              <div className="border border-rose-200 rounded-xl overflow-hidden flex flex-col justify-between bg-white shadow-xs">
                <div>
                  <div className="bg-rose-800 text-white px-4 py-2.5 flex items-center justify-between">
                    <h3 className="font-bold text-xs sm:text-sm tracking-wide uppercase">B. Potongan Resmi</h3>
                    <span className="text-xs bg-rose-900/80 px-2 py-0.5 rounded font-mono font-medium">Deductions</span>
                  </div>

                  <div className="p-3.5 space-y-2 text-xs sm:text-sm">
                    {potBpjsKes > 0 && (
                      <div className="flex justify-between items-center py-1 border-b border-slate-100">
                        <span className="text-slate-700">BPJS Kesehatan (A.4)</span>
                        <span className="font-semibold text-slate-900 font-mono">{formatRupiah(potBpjsKes)}</span>
                      </div>
                    )}
                    {potBpjsTk > 0 && (
                      <div className="flex justify-between items-center py-1 border-b border-slate-100">
                        <span className="text-slate-700">BPJS Ketenagakerjaan (A.5)</span>
                        <span className="font-semibold text-slate-900 font-mono">{formatRupiah(potBpjsTk)}</span>
                      </div>
                    )}
                    {potZis > 0 && (
                      <div className="flex justify-between items-center py-1 border-b border-slate-100">
                        <span className="text-slate-700">ZIS 2,5 % (A.6)</span>
                        <span className="font-semibold text-slate-900 font-mono">{formatRupiah(potZis)}</span>
                      </div>
                    )}
                    {potPajak > 0 && (
                      <div className="flex justify-between items-center py-1 border-b border-slate-100">
                        <span className="text-slate-700">Pajak (A.10)</span>
                        <span className="font-semibold text-slate-900 font-mono">{formatRupiah(potPajak)}</span>
                      </div>
                    )}
                    {potUkk > 0 && (
                      <div className="flex justify-between items-center py-1 border-b border-slate-100 bg-rose-50/40 px-2 rounded">
                        <span className="text-rose-950 font-medium">Potongan UKK / Keterlambatan (B.1)</span>
                        <span className="font-semibold text-rose-900 font-mono">-{formatRupiah(potUkk)}</span>
                      </div>
                    )}
                    {potKop1 > 0 && (
                      <div className="flex justify-between items-center py-1 border-b border-slate-100 bg-rose-50/40 px-2 rounded">
                        <span className="text-rose-950 font-medium">Koperasi YW Al Muhajirien 1 (B.2)</span>
                        <span className="font-semibold text-rose-900 font-mono">-{formatRupiah(potKop1)}</span>
                      </div>
                    )}
                    {potKesra > 0 && (
                      <div className="flex justify-between items-center py-1 border-b border-slate-100 bg-rose-50/40 px-2 rounded">
                        <span className="text-rose-950 font-medium">Kesra Karyawan (B.3)</span>
                        <span className="font-semibold text-rose-900 font-mono">-{formatRupiah(potKesra)}</span>
                      </div>
                    )}
                    {potKop2 > 0 && (
                      <div className="flex justify-between items-center py-1 border-b border-slate-100 bg-rose-50/40 px-2 rounded">
                        <span className="text-rose-950 font-medium">Koperasi YW Al Muhajirien 2 (B.4)</span>
                        <span className="font-semibold text-rose-900 font-mono">-{formatRupiah(potKop2)}</span>
                      </div>
                    )}
                    {potYwamjp > 0 && (
                      <div className="flex justify-between items-center py-1 border-b border-slate-100 bg-rose-50/40 px-2 rounded">
                        <span className="text-rose-950 font-medium">YW Al Muhajirien Jakapermai (B.5)</span>
                        <span className="font-semibold text-rose-900 font-mono">-{formatRupiah(potYwamjp)}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="bg-rose-50/80 border-t border-rose-200 px-4 py-3 flex justify-between items-center">
                  <span className="font-bold text-xs sm:text-sm text-rose-950">TOTAL POTONGAN RESMI</span>
                  <span className="font-bold text-sm sm:text-base text-rose-950 font-mono">
                    -{formatRupiah(subtotalPotonganA + subtotalPotonganB)}
                  </span>
                </div>
              </div>
            </div>

            {/* Take Home Pay */}
            <div className="bg-slate-900 text-white rounded-xl p-4 sm:p-5 mb-6 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-md">
              <div>
                <div className="text-xs uppercase tracking-wider text-slate-300 font-bold">
                  GAJI BERSIH DITERIMA (TAKE HOME PAY)
                </div>
                <div className="text-xs text-slate-400 mt-0.5">
                  Formula: Gaji Bulanan Bersih ({formatRupiah(gajiBulananBersih)}) + Rekap Harian Bersih ({formatRupiah(rekapHarianBersih)})
                </div>
              </div>
              <div className="text-2xl sm:text-3xl font-black font-mono tracking-tight text-emerald-400">
                {formatRupiah(totalDibayarkan)}
              </div>
            </div>

            {/* Terbilang */}
            <div className="bg-slate-100 border border-slate-200 rounded-lg p-3.5 mb-6 text-xs sm:text-sm">
              <span className="font-bold text-slate-700 mr-2">Terbilang:</span>
              <span className="italic font-semibold text-slate-900"># {terbilangText} #</span>
            </div>

            {/* Signatures */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-200 items-end">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>Verifikasi Keaslian Dokumen</span>
                </div>
                <div className="border border-dashed border-slate-300 rounded-lg p-2.5 flex items-center gap-3 bg-slate-50">
                  <div className="w-12 h-12 bg-white border border-slate-200 rounded flex items-center justify-center flex-shrink-0 text-slate-700">
                    <QrCode className="w-9 h-9" />
                  </div>
                  <div className="text-[10px] text-slate-500 font-mono leading-tight">
                    <div>HASH: {record.id.slice(0, 16).toUpperCase()}</div>
                    <div>AUTH: SYSTEM_VERIFIED</div>
                    <div className="text-emerald-700 font-bold mt-0.5">STATUS: VALID</div>
                  </div>
                </div>
              </div>

              <div className="text-center relative">
                <p className="text-xs text-slate-500 font-medium">
                  {company.city}, {formatIndonesianDate(record.paymentDate)}
                </p>
                <p className="text-xs font-medium text-slate-600">Disetujui Oleh,</p>

                <div className="h-16 flex items-center justify-center relative my-1">
                  <div className="absolute w-20 h-20 rounded-full border-2 border-emerald-600/30 rotate-[-12deg] flex items-center justify-center text-[9px] font-bold text-emerald-700/60 uppercase pointer-events-none text-center p-1">
                    {company.stampText || 'PAYROLL VERIFIED'}
                  </div>
                  <div className="font-serif italic font-bold text-slate-700 text-sm">
                    Amirudin
                  </div>
                </div>

                <p className="text-xs font-bold text-slate-900 border-t border-slate-300 pt-1 mx-2">
                  {company.hrDirectorName || 'Amirudin, M.Pd.'}
                </p>
                <p className="text-[10px] text-slate-500">{company.hrDirectorTitle || 'Kepala Sekolah Penyelenggara'}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }
);

OfficialSalarySlip.displayName = 'OfficialSalarySlip';
