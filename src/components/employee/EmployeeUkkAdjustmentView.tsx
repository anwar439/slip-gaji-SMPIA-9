import React, { useMemo } from 'react';
import { useSalary } from '../../context/SalaryContext';
import { Employee, UkkAdjustmentRecord } from '../../types';
import {
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
  Building2,
  CreditCard,
  CheckCircle2,
  Calendar,
  Info,
  Layers,
  Banknote,
} from 'lucide-react';

interface EmployeeUkkAdjustmentViewProps {
  employee: Employee;
}

export const EmployeeUkkAdjustmentView: React.FC<EmployeeUkkAdjustmentViewProps> = ({ employee }) => {
  const {
    ukkAdjustmentRecords,
    selectedPeriod,
    availablePeriods,
    setSelectedPeriod,
    getEmployeeTransportUkk,
  } = useSalary();

  const record: UkkAdjustmentRecord | undefined = useMemo(() => {
    return (
      ukkAdjustmentRecords.find(
        (r) =>
          (r.period === selectedPeriod || !r.period) &&
          ((r.nip && r.nip === employee.nip) ||
            (r.name && r.name.toLowerCase().trim() === employee.name.toLowerCase().trim()))
      ) ||
      ukkAdjustmentRecords.find(
        (r) =>
          (r.nip && r.nip === employee.nip) ||
          (r.name && r.name.toLowerCase().trim() === employee.name.toLowerCase().trim())
      )
    );
  }, [ukkAdjustmentRecords, employee, selectedPeriod]);

  const transportUkkDetail = useMemo(() => {
    return getEmployeeTransportUkk(employee.nip, selectedPeriod);
  }, [getEmployeeTransportUkk, employee, selectedPeriod]);

  const formatRp = (num: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(num || 0);
  };

  const periodObj = availablePeriods.find((p) => p.value === selectedPeriod);

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 text-xs font-semibold bg-emerald-100 text-emerald-800 rounded-full">
              Rincian Penyesuaian UKK
            </span>
            <span className="text-xs text-slate-500 font-medium">
              SMP Islam Al Azhar 9
            </span>
          </div>
          <h2 className="text-xl font-bold text-slate-900">
            Penyesuaian Tunjangan & Potongan UKK
          </h2>
          <p className="text-xs text-slate-600 mt-0.5">
            Rincian penambahan tunjangan tugas tambahan dan pemotongan koperasi/kesra yang mempengaruhi nominal UKK akhir Anda.
          </p>
        </div>

        {/* Period Selector */}
        <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200 shrink-0">
          <Calendar className="w-4 h-4 text-slate-500" />
          <span className="text-xs font-medium text-slate-600">Periode:</span>
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="bg-transparent text-xs font-bold text-slate-800 focus:outline-none cursor-pointer"
          >
            {availablePeriods.map((p) => (
              <option key={p.value} value={p.value}>
                {p.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {!record ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-500">
          <Info className="w-8 h-8 text-slate-400 mx-auto mb-2" />
          <p className="font-semibold text-slate-700">Data Penyesuaian UKK Belum Tersedia</p>
          <p className="text-xs text-slate-500 mt-1">
            Data penyesuaian tunjangan dan potongan UKK untuk periode {periodObj?.label || selectedPeriod} belum dimasukkan oleh bagian Tata Usaha / Kepegawaian.
          </p>
        </div>
      ) : (
        <>
          {/* Top 4 Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
              <div className="flex items-center justify-between text-slate-500 mb-2">
                <span className="text-xs font-bold uppercase tracking-wider">
                  UKK, Transpor & Makan
                </span>
                <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
                  <Wallet className="w-4 h-4" />
                </div>
              </div>
              <div className="text-lg font-bold text-slate-900">
                {formatRp(record.ukkTransportMakan)}
              </div>
              <div className="text-[11px] text-slate-500 mt-1">
                Grand total awal dari kehadiran
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
              <div className="flex items-center justify-between text-slate-500 mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-800">
                  (+) Tunjangan Tugas
                </span>
                <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
                  <ArrowUpRight className="w-4 h-4" />
                </div>
              </div>
              <div className="text-lg font-bold text-emerald-700">
                +{formatRp(record.tunjanganWaliKelas + record.tunjanganStaffPimpinan + (record.tunjanganLain || 0))}
              </div>
              <div className="text-[11px] text-slate-500 mt-1">
                Wali Kelas & Staff Pimpinan
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
              <div className="flex items-center justify-between text-slate-500 mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-rose-700">
                  (-) Potongan Tambahan
                </span>
                <div className="p-2 bg-rose-50 text-rose-600 rounded-xl">
                  <ArrowDownRight className="w-4 h-4" />
                </div>
              </div>
              <div className="text-lg font-bold text-rose-600">
                -{formatRp(record.totalPotongan)}
              </div>
              <div className="text-[11px] text-slate-500 mt-1">
                Koperasi YPI, YWAM, dll
              </div>
            </div>

            <div className="bg-emerald-900 text-white p-5 rounded-2xl shadow-xs">
              <div className="flex items-center justify-between text-emerald-200 mb-2">
                <span className="text-xs font-bold uppercase tracking-wider">
                  (=) UKK DITERIMA
                </span>
                <div className="p-2 bg-emerald-800 text-emerald-300 rounded-xl">
                  <CreditCard className="w-4 h-4" />
                </div>
              </div>
              <div className="text-xl font-black text-white">
                {formatRp(record.jumlahDiterima)}
              </div>
              <div className="text-[11px] text-emerald-300 mt-1">
                Ditransfer ke Rekening Pegawai
              </div>
            </div>
          </div>

          {/* Detailed Itemized Card */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-5 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-emerald-100 text-emerald-700 rounded-xl">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Rincian Penyesuaian Rekapitulasi UKK
                  </h3>
                  <p className="text-xs text-slate-500">
                    No. Rekening: <span className="font-mono font-bold text-slate-800">{record.bankAccountNumber || employee.accountNumber || '-'}</span> ({record.bankName || employee.bankName || 'BSI'})
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-lg border border-emerald-200">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Terverifikasi
              </div>
            </div>

            <div className="p-6 divide-y divide-slate-100 text-xs">
              {/* Section 1: UKK / Transport Dasar */}
              <div className="pb-4 space-y-2">
                <h4 className="font-bold text-slate-800 uppercase tracking-wider text-[11px] flex items-center gap-1.5 text-blue-900">
                  <Layers className="w-3.5 h-3.5" />
                  1. Dasar Perhitungan UKK, Transpor & Uang Makan
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 bg-slate-50 p-3.5 rounded-xl">
                  <div>
                    <span className="text-slate-500 block text-[11px]">UKK Diterima:</span>
                    <span className="font-semibold text-slate-800">
                      {transportUkkDetail ? formatRp(transportUkkDetail.ukkDiterima) : '-'}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[11px]">Transpor Diterima:</span>
                    <span className="font-semibold text-slate-800">
                      {transportUkkDetail ? formatRp(transportUkkDetail.transporDiterima) : '-'}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[11px]">Uang Makan Diterima:</span>
                    <span className="font-semibold text-slate-800">
                      {transportUkkDetail ? formatRp(transportUkkDetail.uangMakanDiterima) : '-'}
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-between font-bold text-slate-900 pt-1">
                  <span>Grand Total UKK Awal:</span>
                  <span className="font-mono text-blue-900 font-bold">{formatRp(record.ukkTransportMakan)}</span>
                </div>
              </div>

              {/* Section 2: Penambahan Tunjangan */}
              <div className="py-4 space-y-2">
                <h4 className="font-bold text-emerald-900 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                  <ArrowUpRight className="w-3.5 h-3.5 text-emerald-600" />
                  2. (+) Penambahan Tunjangan Khusus
                </h4>
                <div className="space-y-1.5 text-slate-700">
                  <div className="flex items-center justify-between">
                    <span>Tunjangan Wali Kelas:</span>
                    <span className="font-mono font-semibold text-emerald-700">
                      +{formatRp(record.tunjanganWaliKelas)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Tunjangan Staff Pimpinan:</span>
                    <span className="font-mono font-semibold text-emerald-700">
                      +{formatRp(record.tunjanganStaffPimpinan)}
                    </span>
                  </div>
                  {record.tunjanganLain > 0 && (
                    <div className="flex items-center justify-between">
                      <span>Tunjangan Tambahan Lainnya:</span>
                      <span className="font-mono font-semibold text-emerald-700">
                        +{formatRp(record.tunjanganLain)}
                      </span>
                    </div>
                  )}
                  <div className="flex items-center justify-between pt-2 border-t border-slate-100 font-bold text-indigo-900">
                    <span>JUMLAH (Total Penambahan Pendapatan UKK):</span>
                    <span className="font-mono text-sm">{formatRp(record.totalPenambahan)}</span>
                  </div>
                </div>
              </div>

              {/* Section 3: Pemotongan Tambahan */}
              <div className="py-4 space-y-2">
                <h4 className="font-bold text-rose-900 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                  <ArrowDownRight className="w-3.5 h-3.5 text-rose-600" />
                  3. (-) Pemotongan Tambahan
                </h4>
                <div className="space-y-1.5 text-slate-700">
                  <div className="flex items-center justify-between">
                    <span>Potongan KESRA (7114044584):</span>
                    <span className="font-mono text-slate-600">{formatRp(record.potonganKesra)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Potongan KOPERASI YPI (7210808088):</span>
                    <span className="font-mono font-semibold text-rose-700">
                      -{formatRp(record.potonganKoperasiYpi)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Potongan KOPERASI YWAM (7210808088):</span>
                    <span className="font-mono font-semibold text-rose-700">
                      -{formatRp(record.potonganKoperasiYwam)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Potongan YW AMJP (8980008003):</span>
                    <span className="font-mono text-slate-600">{formatRp(record.potonganYwAmjp)}</span>
                  </div>
                  {record.potonganLain > 0 && (
                    <div className="flex items-center justify-between">
                      <span>Potongan Lainnya:</span>
                      <span className="font-mono font-semibold text-rose-700">
                        -{formatRp(record.potonganLain)}
                      </span>
                    </div>
                  )}
                  <div className="flex items-center justify-between pt-2 border-t border-slate-100 font-bold text-rose-800">
                    <span>TOTAL POTONGAN TAMBAHAN:</span>
                    <span className="font-mono text-sm">-{formatRp(record.totalPotongan)}</span>
                  </div>
                </div>
              </div>

              {/* Section 4: UKK Akhir Diterima */}
              <div className="pt-4 flex items-center justify-between bg-emerald-50 p-4 rounded-xl text-emerald-950 font-bold">
                <div>
                  <span className="text-xs uppercase tracking-wider block">
                    JUMLAH DITERIMA (UKK AKHIR)
                  </span>
                  <span className="text-[11px] font-normal text-emerald-800">
                    Transfer Bank: {record.bankAccountNumber || employee.accountNumber || '-'} ({record.bankName || 'BSI'})
                  </span>
                </div>
                <span className="text-lg font-black font-mono text-emerald-950">
                  {formatRp(record.jumlahDiterima)}
                </span>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
