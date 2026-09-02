/**
 * Utility to convert numbers to Indonesian words (Terbilang)
 * Example: 7500000 -> "Tujuh Juta Lima Ratus Ribu Rupiah"
 */

const satuan = ['', 'Satu', 'Dua', 'Tiga', 'Empat', 'Lima', 'Enam', 'Tujuh', 'Delapan', 'Sembilan', 'Sepuluh', 'Sebelas'];

function konversiSatuan(nilai: number): string {
  const n = Math.floor(nilai);
  if (n < 12) {
    return satuan[n];
  } else if (n < 20) {
    return `${konversiSatuan(n - 10)} Belas`;
  } else if (n < 100) {
    const sisa = n % 10;
    return `${konversiSatuan(Math.floor(n / 10))} Puluh${sisa > 0 ? ` ${konversiSatuan(sisa)}` : ''}`;
  } else if (n < 200) {
    const sisa = n - 100;
    return `Seratus${sisa > 0 ? ` ${konversiSatuan(sisa)}` : ''}`;
  } else if (n < 1000) {
    const sisa = n % 100;
    return `${konversiSatuan(Math.floor(n / 100))} Ratus${sisa > 0 ? ` ${konversiSatuan(sisa)}` : ''}`;
  } else if (n < 2000) {
    const sisa = n - 1000;
    return `Seribu${sisa > 0 ? ` ${konversiSatuan(sisa)}` : ''}`;
  } else if (n < 1000000) {
    const ribuan = Math.floor(n / 1000);
    const sisa = n % 1000;
    return `${konversiSatuan(ribuan)} Ribu${sisa > 0 ? ` ${konversiSatuan(sisa)}` : ''}`;
  } else if (n < 1000000000) {
    const jutaan = Math.floor(n / 1000000);
    const sisa = n % 1000000;
    return `${konversiSatuan(jutaan)} Juta${sisa > 0 ? ` ${konversiSatuan(sisa)}` : ''}`;
  } else if (n < 1000000000000) {
    const miliaran = Math.floor(n / 1000000000);
    const sisa = n % 1000000000;
    return `${konversiSatuan(miliaran)} Miliar${sisa > 0 ? ` ${konversiSatuan(sisa)}` : ''}`;
  } else {
    const triliunan = Math.floor(n / 1000000000000);
    const sisa = n % 1000000000000;
    return `${konversiSatuan(triliunan)} Triliun${sisa > 0 ? ` ${konversiSatuan(sisa)}` : ''}`;
  }
}

export function terbilangRupiah(amount: number): string {
  if (amount === 0) return 'Nol Rupiah';
  if (amount < 0) return `Minus ${konversiSatuan(Math.abs(amount))} Rupiah`;
  
  const text = konversiSatuan(Math.round(amount)).trim();
  // Normalize double spaces
  return `${text.replace(/\s+/g, ' ')} Rupiah`;
}
