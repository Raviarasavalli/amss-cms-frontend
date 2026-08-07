import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { LOGO_BASE64 } from './logoBase64';
import { ARIAL_BASE64 } from './fontBase64';

const MONTH_KEYS = [
  'january', 'february', 'march', 'april', 'may', 'june',
  'july', 'august', 'september', 'october', 'november', 'december'
];

const MONTH_HEADERS = [
  'JAN', 'FEB', 'MAR', 'APRIL', 'MAY', 'JUNE',
  'JULY', 'AUG', 'SEPT', 'OCT', 'NOV', 'DEC'
];

const RUPEE = '₹';

/**
 * Embeds the official A.M.S. Society logo image in the center of the PDF header
 */
const drawSocietyLogo = (doc, x, y, width = 18, height = 18) => {
  try {
    doc.addImage(LOGO_BASE64, 'JPEG', x, y, width, height);
  } catch (e) {
    doc.setFillColor(21, 128, 61);
    doc.circle(x + width / 2, y + height / 2, width / 2, 'F');
  }
};

/**
 * Builds the PDF document matching professional accounting ledger standards for any selected year
 */
export const createAmmsContributionPdf = ({
  members = [],
  contributions = [],
  year = new Date().getFullYear(),
}) => {
  // A4 Portrait format (210mm x 297mm)
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  // Register Arial TTF font for native UTF-8 Rupee symbol rendering
  try {
    doc.addFileToVFS('Arial.ttf', ARIAL_BASE64);
    doc.addFont('Arial.ttf', 'Arial', 'normal');
    doc.addFont('Arial.ttf', 'Arial', 'bold');
    doc.setFont('Arial');
  } catch (e) {
    console.warn('Custom font load fallback:', e);
  }

  const pageWidth = doc.internal.pageSize.getWidth(); // 210mm
  const marginX = 6; // 6mm margin for 198mm printable width
  let startY = 8;

  // Centered Official A.M.S. Society Logo Image
  const logoWidth = 18;
  const logoHeight = 18;
  const logoX = (pageWidth - logoWidth) / 2;

  drawSocietyLogo(doc, logoX, startY, logoWidth, logoHeight);

  startY += logoHeight + 4;

  // Centered Header Title
  doc.setFont('Arial', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(15, 23, 42); // #0f172a
  doc.text('AMMS - MONTHLY CONTRIBUTIONS', pageWidth / 2, startY, { align: 'center' });

  startY += 5;

  // Centered Subtitle with selected year
  doc.setFont('Arial', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(100, 116, 139); // #64748b
  doc.text(`Annual Contributions (January - December) — Year ${year}`, pageWidth / 2, startY, { align: 'center' });

  startY += 6;

  // Map contributions by member ID
  const contribMap = {};
  contributions.forEach((c) => {
    const key = c.memberId?._id?.toString() || c.memberId?.toString();
    if (key) contribMap[key] = c;
  });

  const monthSums = MONTH_KEYS.map(() => 0);
  let grandTotal = 0;

  // Build Data Rows with explicit ₹ Rupee symbol
  const tableRows = members.map((m, idx) => {
    const c = contribMap[m._id.toString()] || {};
    const row = [
      String(idx + 1),
      m.name || '—'
    ];

    MONTH_KEYS.forEach((mKey, mIdx) => {
      const val = c[mKey] !== undefined && c[mKey] !== null ? Number(c[mKey]) : null;
      if (val !== null && val > 0) {
        monthSums[mIdx] += val;
        grandTotal += val;
        row.push(`${RUPEE}${val.toLocaleString('en-IN')}`);
      } else if (val === 0) {
        row.push(`${RUPEE}0`);
      } else {
        row.push(''); // Blank when no contribution
      }
    });

    return row;
  });

  // Total Summary Row
  const summaryRow = [
    '',
    'Total Summary',
    ...monthSums.map((sum) => sum > 0 ? `Sum:\n${RUPEE}${sum.toLocaleString('en-IN')}` : `Sum:\n${RUPEE}0`)
  ];

  const monthColWidth = 13.66;

  autoTable(doc, {
    startY,
    head: [[
      'SN\nO',
      'NAME',
      ...MONTH_HEADERS
    ]],
    body: [...tableRows, summaryRow],
    theme: 'grid',
    margin: { left: marginX, right: marginX, bottom: 16 },
    styles: {
      font: 'Arial',
      fontSize: 6.6,
      cellPadding: { top: 2.2, bottom: 2.2, left: 2, right: 2 },
      lineColor: [200, 200, 200],
      lineWidth: 0.18,
      textColor: [0, 0, 0],
      valign: 'middle',
      overflow: 'ellipsize',
    },
    headStyles: {
      fillColor: [30, 41, 59], // Dark Navy #1e293b
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 6.8,
      halign: 'center',
      valign: 'middle',
      lineWidth: 0.2,
      lineColor: [30, 41, 59],
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252], // Light gray alternate rows
    },
    columnStyles: {
      0: { halign: 'center', cellWidth: 8 },
      1: { halign: 'left', cellWidth: 26 },
      2: { halign: 'center', cellWidth: monthColWidth },
      3: { halign: 'center', cellWidth: monthColWidth },
      4: { halign: 'center', cellWidth: monthColWidth },
      5: { halign: 'center', cellWidth: monthColWidth },
      6: { halign: 'center', cellWidth: monthColWidth },
      7: { halign: 'center', cellWidth: monthColWidth },
      8: { halign: 'center', cellWidth: monthColWidth },
      9: { halign: 'center', cellWidth: monthColWidth },
      10: { halign: 'center', cellWidth: monthColWidth },
      11: { halign: 'center', cellWidth: monthColWidth },
      12: { halign: 'center', cellWidth: monthColWidth },
      13: { halign: 'center', cellWidth: monthColWidth },
    },
    didParseCell: (data) => {
      // Summary Row Styling
      if (data.row.index === tableRows.length) {
        data.cell.styles.fontStyle = 'bold';
        data.cell.styles.fontSize = 6.2;
        data.cell.styles.fillColor = [241, 245, 249];
        if (data.column.index === 1) {
          data.cell.styles.halign = 'right';
        } else if (data.column.index > 1) {
          data.cell.styles.halign = 'center';
        }
      }
    },
  });

  // Footer Section
  const finalY = doc.lastAutoTable.finalY + 5;
  const pageHeight = doc.internal.pageSize.getHeight();
  const footerY = Math.min(finalY, pageHeight - 12);

  const now = new Date();
  const dateStr = now.toLocaleDateString('en-US', { month: 'numeric', day: 'numeric', year: 'numeric' });
  const timeStr = now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', second: '2-digit', hour12: true });

  // Timestamp
  doc.setFont('Arial', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text(`Generated: ${dateStr}, ${timeStr}`, pageWidth / 2, footerY, { align: 'center' });

  // Grand Total Banner
  doc.setFont('Arial', 'bold');
  doc.setFontSize(10.5);
  doc.setTextColor(29, 78, 216); // Royal Blue #1d4ed8
  doc.text(`Grand Total: ${RUPEE}${grandTotal.toLocaleString('en-IN')}`, pageWidth / 2, footerY + 5, { align: 'center' });

  return doc;
};

/**
 * Downloads the PDF document for the selected year
 */
export const generateAndDownloadPdf = (dataOptions) => {
  const doc = createAmmsContributionPdf(dataOptions);
  doc.save(`AMMS-Monthly-Contributions-${dataOptions.year || new Date().getFullYear()}.pdf`);
};

/**
 * Generates the PDF stream and opens native PDF print window for the selected year
 */
export const generateAndPrintPdf = (dataOptions) => {
  const doc = createAmmsContributionPdf(dataOptions);
  const blobUrl = doc.output('bloburl');

  const iframe = document.createElement('iframe');
  iframe.style.position = 'fixed';
  iframe.style.right = '0';
  iframe.style.bottom = '0';
  iframe.style.width = '0';
  iframe.style.height = '0';
  iframe.style.border = '0';
  iframe.src = blobUrl;

  document.body.appendChild(iframe);

  iframe.onload = () => {
    try {
      iframe.contentWindow.focus();
      iframe.contentWindow.print();
    } catch (e) {
      window.open(blobUrl, '_blank');
    }
  };
};
