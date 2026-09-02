import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

/**
 * Downloads a DOM element as a crisp, formatted PDF document
 */
export async function downloadSlipPdfFromElement(
  element: HTMLElement,
  fileName: string = 'Slip_Gaji.pdf'
): Promise<boolean> {
  try {
    // Generate high quality canvas
    const canvas = await html2canvas(element, {
      scale: 2.5, // High resolution for crisp text
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
      windowWidth: 1024,
    });

    const imgData = canvas.toDataURL('image/png', 1.0);
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    const pdfWidth = pdf.internal.pageSize.getWidth(); // 210mm
    const pdfHeight = pdf.internal.pageSize.getHeight(); // 297mm

    const imgWidth = pdfWidth - 20; // 10mm margins on each side
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    let position = 10;

    // Check if height exceeds single page
    if (imgHeight <= pdfHeight - 20) {
      pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
    } else {
      // Fit to single page if slight overflow or multi-page
      const scaledWidth = ((pdfHeight - 20) * canvas.width) / canvas.height;
      if (scaledWidth <= pdfWidth - 20) {
        const xOffset = (pdfWidth - scaledWidth) / 2;
        pdf.addImage(imgData, 'PNG', xOffset, 10, scaledWidth, pdfHeight - 20);
      } else {
        pdf.addImage(imgData, 'PNG', 10, 10, imgWidth, imgHeight);
      }
    }

    pdf.save(fileName);
    return true;
  } catch (error) {
    console.error('Error generating PDF:', error);
    return false;
  }
}

/**
 * Triggers native browser print dialog for the current slip
 */
export function printCurrentSlip() {
  window.print();
}
