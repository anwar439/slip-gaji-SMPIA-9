import {
  SalaryRecord,
  SalaryCalculationSource,
  TransportUkkRecord,
  UkkAdjustmentRecord,
  Employee,
} from '../types';

/**
 * Normalizes string for reliable matching
 */
export function cleanStr(str?: string): string {
  if (!str) return '';
  return str.toLowerCase().replace(/[^a-z0-9]/g, '').trim();
}

/**
 * Strips academic, religious, and formal titles for fuzzy name matching
 * (e.g. "Amirudin, M.Pd." -> "amirudin", "Dra. Hj. Sri Wahyuni" -> "sriwahyuni")
 */
export function stripTitles(name?: string): string {
  if (!name) return '';
  return name
    .replace(/\b(drs|dra|dr|prof|hj|h|ir|m\.?pd|s\.?pd|s\.?pd\.?i|s\.?ag|s\.?si|s\.?kom|s\.?e|se|m\.?si|m\.?m|m\.?kom|s\.?sos|s\.?t|s\.?psi|lc|s\.?hum|m\.?hum|s\.?s|ss|s\.?p|sp|s\.?pt|s\.?ip|s\.?sn|b\.?a|ba|apt|gr|mpd|spd|sag|ssi|skom|ssos|sh|mkn|mh|haji|hajjah|ustadz|ustadzah)\b\.?/gi, '')
    .replace(/[^a-z0-9]/gi, '')
    .toLowerCase()
    .trim();
}

/**
 * Checks if two records belong to the same employee via NIP or Name
 */
export function isEmployeeMatch(
  targetNip: string | undefined,
  targetName: string | undefined,
  candidateNip: string | undefined,
  candidateName: string | undefined
): boolean {
  const cTargetNip = cleanStr(targetNip);
  const cCandidateNip = cleanStr(candidateNip);

  // 1. Strict NIP match (ignore dummy dashes and leading zeroes)
  if (
    cTargetNip &&
    cCandidateNip &&
    cTargetNip !== '-' &&
    cCandidateNip !== '-' &&
    cTargetNip.length >= 4
  ) {
    if (cTargetNip === cCandidateNip) return true;
    if (cTargetNip.replace(/^0+/, '') === cCandidateNip.replace(/^0+/, '')) return true;
  }

  // 2. Exact cleaned name match
  const cTargetName = cleanStr(targetName);
  const cCandidateName = cleanStr(candidateName);
  if (cTargetName && cCandidateName && cTargetName === cCandidateName) {
    return true;
  }

  // 3. Title-stripped fuzzy match
  const sTarget = stripTitles(targetName);
  const sCandidate = stripTitles(candidateName);
  if (sTarget && sCandidate) {
    if (sTarget === sCandidate) return true;
    if (
      sTarget.length >= 4 &&
      sCandidate.length >= 4 &&
      (sTarget.includes(sCandidate) || sCandidate.includes(sTarget))
    ) {
      return true;
    }
  }

  // 4. Token-based word matching (e.g., "Amirudin" in "Dr. Amirudin M.Pd")
  if (targetName && candidateName) {
    const tokenize = (str: string) =>
      str
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, ' ')
        .split(/\s+/)
        .filter((w) => w.length >= 4 && !/^(drs|dra|prof|haji|hajjah|ustadz|ustadzah|guru|staff|smpia|alazhar)$/.test(w));
    
    const targetWords = tokenize(targetName);
    const candidateWords = tokenize(candidateName);
    const common = targetWords.filter((w) => candidateWords.includes(w));
    if (common.length >= 2 || (common.length >= 1 && common.some((w) => w.length >= 6))) {
      return true;
    }
  }

  return false;
}

/**
 * Synchronizes and calculates all standard sections (A. Gaji Bulanan, B. Rekap Harian, and Attendance Header)
 * directly from Master Gaji Pokok (Salary Matrix), Transport & UKK, and UKK Adjustments.
 * 
 * Rules:
 * - Data MUST come from Master Gaji Pokok & UKK sources dynamically.
 * - Manual editing in slip table is locked/read-only; edits must be performed in Master Gaji & UKK.
 */
export function synchronizeSalaryRecordFromAllSources(
  slip: SalaryRecord,
  matrixList: SalaryCalculationSource[],
  transportList: TransportUkkRecord[],
  ukkAdjList: UkkAdjustmentRecord[],
  employeeList: Employee[]
): SalaryRecord {
  // 1. Find matching employee from Kelola Pegawai
  const empMatch = employeeList.find((e) =>
    isEmployeeMatch(slip.employeeNip, slip.employeeName, e.nip, e.name)
  );

  // 2. Find matching Salary Matrix (Master Gaji Pokok)
  const matrixMatch = matrixList.find((m) =>
    isEmployeeMatch(slip.employeeNip, slip.employeeName, m.nip, m.name)
  );

  // 3. Find matching Transport & UKK (prioritizing matching period)
  const transportMatch =
    transportList.find(
      (t) =>
        t.period === slip.period &&
        isEmployeeMatch(slip.employeeNip, slip.employeeName, t.nip, t.name)
    ) ||
    transportList.find((t) =>
      isEmployeeMatch(slip.employeeNip, slip.employeeName, t.nip, t.name)
    );

  // 4. Find matching UKK Adjustment (Penyesuaian UKK / UKK Akhir, prioritizing matching period)
  const adjMatch =
    ukkAdjList.find(
      (a) =>
        a.period === slip.period &&
        isEmployeeMatch(slip.employeeNip, slip.employeeName, a.nip, a.name)
    ) ||
    ukkAdjList.find((a) =>
      isEmployeeMatch(slip.employeeNip, slip.employeeName, a.nip, a.name)
    );

  // Tags & Profile
  const employeeStatusTag =
    matrixMatch?.employeeStatus ||
    empMatch?.employeeStatus ||
    slip.employeeStatusTag ||
    'GTY';

  const levelTag =
    matrixMatch?.level ||
    empMatch?.level ||
    slip.levelTag ||
    'V B';

  const hariKerja =
    transportMatch?.hariKerja ||
    slip.attendance?.workDays ||
    slip.hariKerja ||
    22;

  const datangLambatMin5 = transportMatch?.datangLambatMin5 ?? slip.datangLambatMin5 ?? 0;
  const datangLambatPlus5 = transportMatch?.datangLambatPlus5 ?? slip.datangLambatPlus5 ?? 0;
  const pulangCepatMin5 = transportMatch?.pulangCepatMin5 ?? slip.pulangCepatMin5 ?? 0;
  const pulangCepatPlus5 = transportMatch?.pulangCepatPlus5 ?? slip.pulangCepatPlus5 ?? 0;

  const bankAccountNumber =
    adjMatch?.bankAccountNumber ||
    empMatch?.accountNumber ||
    slip.bankAccountNumber ||
    '7000742125';

  const bankName =
    adjMatch?.bankName ||
    empMatch?.bankName ||
    slip.bankName ||
    'BSI';

  // --- A. GAJI BULANAN (DARI MASTER GAJI POKOK) ---
  let gajiPokokBulanan = 0;
  let tunjanganPengabdian = 0;
  let tunjanganKeluarga = 0;
  let tunjanganYayasan = 0;
  let tunjanganJabatanBulanan = 0;
  let bantuanPajak = 0;
  let subtotalPendapatanBulanan = 0;

  let potonganJht = 0;
  const potonganDanaPesangon = 0;
  const potonganYayasan = 0;
  let potonganBpjsKesehatan = 0;
  let potonganBpjsKetenagakerjaan = 0;
  let potonganZis = 0;
  let potonganKoperasiAlAzhar = 0;
  const potonganForsipa = 0;
  const potonganIpSppYwamjp = 0;
  let potonganPajak = 0;
  let subtotalPotonganBulanan = 0;
  let totalGajiBulananBersih = 0;

  if (matrixMatch) {
    // Prioritize calculated values from Master Gaji Pokok (Salary Matrix)
    gajiPokokBulanan = matrixMatch.performanceBasicSalary || matrixMatch.baseSalaryComponent || 0;
    tunjanganPengabdian = matrixMatch.dedicationAllowanceAmount || 0;
    tunjanganKeluarga = matrixMatch.familyAllowanceAmount || 0;
    tunjanganYayasan = matrixMatch.foundationAllowanceAmount || 0;
    tunjanganJabatanBulanan = matrixMatch.positionAllowance || 0;
    bantuanPajak = matrixMatch.regionalAllowanceAmount || 0;
    subtotalPendapatanBulanan =
      matrixMatch.grossSalary ||
      gajiPokokBulanan +
        tunjanganPengabdian +
        tunjanganKeluarga +
        tunjanganYayasan +
        tunjanganJabatanBulanan +
        bantuanPajak;

    potonganJht = matrixMatch.jhtDeduction || 0;
    potonganBpjsKesehatan = matrixMatch.bpjsKesDeduction || 0;
    potonganBpjsKetenagakerjaan = matrixMatch.bpjsKtDeduction || 0;
    potonganZis = matrixMatch.infaqMasjid || 0;
    potonganKoperasiAlAzhar = matrixMatch.coopLoanDeduction || 0;
    potonganPajak = matrixMatch.regionalDeduction || bantuanPajak || 0;

    subtotalPotonganBulanan =
      matrixMatch.totalDeduction ||
      potonganJht +
        potonganBpjsKesehatan +
        potonganBpjsKetenagakerjaan +
        potonganZis +
        potonganKoperasiAlAzhar +
        potonganPajak;

    totalGajiBulananBersih =
      matrixMatch.netSalaryPaid ||
      Math.max(0, subtotalPendapatanBulanan - subtotalPotonganBulanan);
  } else {
    // Fallback if not yet in matrix
    gajiPokokBulanan = empMatch?.baseSalary || slip.basicSalary || 2750000;
    tunjanganPengabdian = Math.round(gajiPokokBulanan * 0.1);
    tunjanganKeluarga = Math.round(gajiPokokBulanan * 0.15);
    tunjanganYayasan = 0;
    tunjanganJabatanBulanan = slip.positionAllowance || 0;
    bantuanPajak = Math.round(gajiPokokBulanan * 0.05);
    subtotalPendapatanBulanan =
      gajiPokokBulanan +
      tunjanganPengabdian +
      tunjanganKeluarga +
      tunjanganYayasan +
      tunjanganJabatanBulanan +
      bantuanPajak;

    potonganBpjsKesehatan = Math.round(gajiPokokBulanan * 0.01);
    potonganBpjsKetenagakerjaan = Math.round(gajiPokokBulanan * 0.03);
    potonganZis = Math.round((gajiPokokBulanan + tunjanganPengabdian + tunjanganKeluarga) * 0.025);
    potonganKoperasiAlAzhar = 0;
    potonganPajak = bantuanPajak;
    subtotalPotonganBulanan =
      potonganBpjsKesehatan +
      potonganBpjsKetenagakerjaan +
      potonganZis +
      potonganKoperasiAlAzhar +
      potonganPajak;
    totalGajiBulananBersih = Math.max(0, subtotalPendapatanBulanan - subtotalPotonganBulanan);
  }

  // --- B. REKAP HARIAN (DARI TRANSPORT & UKK + PENYESUAIAN UKK AKHIR) ---
  let ukkKotorHarian = 0;
  let transportHarian = 0;
  let uangMakanHarian = 0;
  let potonganUkkHarian = 0;

  if (transportMatch) {
    ukkKotorHarian = transportMatch.ukkBruto || transportMatch.ukkKotor || transportMatch.ukkDiterima || 0;
    transportHarian = transportMatch.transporDiterima || transportMatch.transporBruto || 0;
    uangMakanHarian = transportMatch.uangMakanDiterima || 0;
    potonganUkkHarian = transportMatch.ukkPotongan || 0;
  } else {
    // Default estimate if not in transport list
    const isGuru = (empMatch?.category || slip.employeeDepartment || '').toUpperCase().includes('GURU');
    ukkKotorHarian = isGuru ? 3484270 : 2500000;
    transportHarian = 1250000;
    uangMakanHarian = 600000;
    potonganUkkHarian = 0;
  }

  const tunjanganKepalaUrusan = adjMatch?.tunjanganStaffPimpinan || slip.tunjanganKepalaUrusan || 0;
  const tunjanganStaffPimpinan = tunjanganKepalaUrusan;
  const tunjanganWaliKelas = adjMatch?.tunjanganWaliKelas || slip.tunjanganWaliKelas || 0;
  const tunjanganLainUkk = adjMatch?.tunjanganLain || slip.tunjanganLainUkk || 0;

  const subtotalPendapatanHarian =
    ukkKotorHarian +
    transportHarian +
    uangMakanHarian +
    tunjanganKepalaUrusan +
    tunjanganWaliKelas +
    tunjanganLainUkk;

  const potonganKoperasiYpi = adjMatch?.potonganKoperasiYpi || slip.potonganKoperasiYpi || 0;
  const potonganKesra = adjMatch?.potonganKesra || slip.potonganKesra || 0;
  const potonganKoperasiYwam = adjMatch?.potonganKoperasiYwam || slip.potonganKoperasiYwam || 0;
  const potonganYwAmjp = adjMatch?.potonganYwAmjp || slip.potonganYwAmjp || 0;
  const potonganLainUkk = adjMatch?.potonganLain || slip.potonganLainUkk || 0;

  const subtotalPotonganHarian =
    potonganUkkHarian +
    potonganKoperasiYpi +
    potonganKesra +
    potonganKoperasiYwam +
    potonganYwAmjp +
    potonganLainUkk;

  // UKK Akhir Bersih yang dibayarkan
  let totalRekapHarianBersih = 0;
  if (adjMatch) {
    totalRekapHarianBersih = adjMatch.jumlahDiterima;
  } else {
    totalRekapHarianBersih = Math.max(0, subtotalPendapatanHarian - subtotalPotonganHarian);
  }

  // --- C. TOTAL AKHIR YANG DIBAYARKAN ---
  const sumberGajiPokokAkhir = totalGajiBulananBersih;
  const ukkGrandTotalAwal =
    adjMatch?.ukkTransportMakan ||
    transportMatch?.totalJumlahUang ||
    (ukkKotorHarian + transportHarian + uangMakanHarian);
  const ukkNetAkhirDiterima = totalRekapHarianBersih;
  const jumlahYangDibayarkan = sumberGajiPokokAkhir + ukkNetAkhirDiterima;
  const netSalary = jumlahYangDibayarkan;

  const totalEarnings = subtotalPendapatanBulanan + subtotalPendapatanHarian;
  const totalDeductions = subtotalPotonganBulanan + subtotalPotonganHarian;

  return {
    ...slip,
    employeeStatusTag,
    levelTag,
    hariKerja,
    datangLambatMin5,
    datangLambatPlus5,
    pulangCepatMin5,
    pulangCepatPlus5,
    bankAccountNumber,
    bankName,

    // A. Gaji Bulanan (Master Gaji Pokok)
    gajiPokokBulanan,
    tunjanganPengabdian,
    tunjanganKeluarga,
    tunjanganYayasan,
    tunjanganJabatanBulanan,
    bantuanPajak,
    subtotalPendapatanBulanan,

    potonganJht,
    potonganDanaPesangon,
    potonganYayasan,
    potonganBpjsKesehatan,
    potonganBpjsKetenagakerjaan,
    potonganZis,
    potonganKoperasiAlAzhar,
    potonganForsipa,
    potonganIpSppYwamjp,
    potonganPajak,
    subtotalPotonganBulanan,
    totalGajiBulananBersih,

    // B. Rekap Harian (Transport, UKK, & Penyesuaian UKK Akhir)
    ukkKotorHarian,
    transportHarian,
    uangMakanHarian,
    tunjanganKepalaUrusan,
    tunjanganWaliKelas,
    tunjanganStaffPimpinan,
    tunjanganLainUkk,
    subtotalPendapatanHarian,

    potonganUkkHarian,
    potonganKoperasiYpi,
    potonganKesra,
    potonganKoperasiYwam,
    potonganYwAmjp,
    potonganLainUkk,
    subtotalPotonganHarian,
    totalRekapHarianBersih,

    // C. Hasil Sinkronisasi Lengkap
    jumlahYangDibayarkan,
    netSalary,
    basicSalary: gajiPokokBulanan,
    transportAllowance: transportHarian,
    mealAllowance: uangMakanHarian,
    totalEarnings,
    totalDeductions,
    ukkGrandTotalAwal,
    ukkNetAkhirDiterima,
    sumberGajiPokokAkhir,
  };
}
