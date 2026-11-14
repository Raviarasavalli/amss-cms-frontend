import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const MONTH_KEYS = [
  'january', 'february', 'march', 'april', 'may', 'june',
  'july', 'august', 'september', 'october', 'november', 'december'
];

const MONTH_HEADERS = [
  'JAN', 'FEB', 'MAR', 'APRIL', 'MAY', 'JUNE',
  'JULY', 'AUG', 'SEPT', 'OCT', 'NOV', 'DEC'
];

const RUPEE = '₹';

const getMonthIndex = (month) => {
  if (!month) return -1;
  return MONTH_KEYS.indexOf(month.toLowerCase());
};

const isMonthInactive = (c, m) => {
  if (!c) return false;
  if (c[`${m}_inactive`] !== undefined) return c[`${m}_inactive`];

  const targetIdx = getMonthIndex(m);
  if (targetIdx === -1) return false;

  if (c.status === 'inactive' || c.inactiveFromMonth) {
    const inactiveIdx = c.inactiveFromMonth ? getMonthIndex(c.inactiveFromMonth) : 0;
    const reactivatedIdx = c.reactivatedFromMonth ? getMonthIndex(c.reactivatedFromMonth) : -1;

    if (reactivatedIdx !== -1 && inactiveIdx !== -1 && reactivatedIdx > inactiveIdx) {
      return targetIdx >= inactiveIdx && targetIdx < reactivatedIdx;
    }

    if (inactiveIdx !== -1) {
      return targetIdx >= inactiveIdx;
    }

    return c.status === 'inactive';
  }

  return false;
};

/**
 * Draws the green circular A.M.S. Society logo emblem directly on PDF canvas
 */
const drawSocietyLogo = (doc, x, y, radius = 12) => {
  // Outer green circle
  doc.setFillColor(21, 128, 61); // #15803d
  doc.circle(x, y, radius, 'F');

  // Inner yellow border
  doc.setDrawColor(250, 204, 21); // #facc15
  doc.setLineWidth(0.8);
  doc.circle(x, y, radius - 1.5, 'S');

  // Inner dark circle background
  doc.setFillColor(20, 83, 45); // #14532d
  doc.circle(x, y, radius - 3, 'F');

  // Center text / emblem representation
  doc.setTextColor(250, 204, 21);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6);
  doc.text('A.M.S.', x, y - 1, { align: 'center' });
  doc.setFontSize(4.5);
  doc.text('SOCIETY', x, y + 3, { align: 'center' });
};

/**
 * Builds the jsPDF document matching the exact AMMS Contribution Report reference PDF
 */
export const buildAmmsPdfDoc = ({ members = [], contributions = [], year = new Date().getFullYear(), settings = {} }) => {
  // Create A4 Landscape PDF for exact 14-column ledger fit
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const marginX = 12;
  let startY = 12;

  // ── Header Title ─────────────────────────────────────────────────────────────
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(15, 23, 42); // #0f172a
  doc.text('AMMS - MONTHLY CONTRIBUTIONS', marginX, startY);

  startY += 6;

  // Subtitle
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11);
  doc.setTextColor(100, 116, 139); // #64748b
  doc.text(`Annual Contributions (January - December)`, marginX, startY);

  startY += 5;

  // Circular Society Emblem
  drawSocietyLogo(doc, marginX + 12, startY + 8, 11);

  startY += 24;

  // ── Map Members & Contributions Data ─────────────────────────────────────────
  const contribMap = {};
  contributions.forEach((c) => {
    const key = c.memberId?._id?.toString() || c.memberId?.toString();
    if (key) contribMap[key] = c;
  });

  // Calculate monthly column sums & grand total
  const monthSums = MONTH_KEYS.map(() => 0);
  let grandTotal = 0;

  const tableRows = members.map((m, idx) => {
    const c = contribMap[m._id.toString()] || {};
    const row = [
      String(idx + 1),
      m.name || '—'
    ];

    MONTH_KEYS.forEach((mKey, mIdx) => {
      const inactive = isMonthInactive(c, mKey) || isMonthInactive(m, mKey);
      const val = c[mKey] !== undefined && c[mKey] !== null ? Number(c[mKey]) : null;
      if (inactive) {
        row.push('Inactive');
      } else if (val !== null && val > 0) {
        monthSums[mIdx] += val;
        grandTotal += val;
        row.push(`${RUPEE}${val.toLocaleString('en-IN')}`);
      } else if (val === 0) {
        row.push(`${RUPEE}0`);
      } else {
        row.push(`${RUPEE} `);
      }
    });

    return row;
  });

  // Summary Row at bottom
  const summaryRow = [
    '',
    'Total Summary',
    ...monthSums.map((sum) => `Sum:\n${RUPEE}${sum.toLocaleString('en-IN')}`)
  ];

  // ── Render autoTable ─────────────────────────────────────────────────────────
  autoTable(doc, {
    startY,
    head: [[
      'SN\nO',
      'NAME',
      ...MONTH_HEADERS
    ]],
    body: [...tableRows, summaryRow],
    theme: 'grid',
    margin: { left: marginX, right: marginX, bottom: 25 },
    styles: {
      font: 'helvetica',
      fontSize: 8,
      cellPadding: { top: 3.5, bottom: 3.5, left: 2, right: 2 },
      lineColor: [203, 213, 225], // #cbd5e1
      lineWidth: 0.2,
      textColor: [30, 41, 59], // #1e293b
      valign: 'middle',
    },
    headStyles: {
      fillColor: [30, 41, 59], // Dark Navy #1e293b
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 8,
      halign: 'center',
      valign: 'middle',
      lineWidth: 0.3,
      lineColor: [15, 23, 42],
    },
    columnStyles: {
      0: { halign: 'center', cellWidth: 12 }, // SNO
      1: { halign: 'left', cellWidth: 50 },   // NAME
      2: { halign: 'left', cellWidth: 17 },   // JAN
      3: { halign: 'left', cellWidth: 17 },   // FEB
      4: { halign: 'left', cellWidth: 17 },   // MAR
      5: { halign: 'left', cellWidth: 18 },   // APRIL
      6: { halign: 'left', cellWidth: 17 },   // MAY
      7: { halign: 'left', cellWidth: 17 },   // JUNE
      8: { halign: 'left', cellWidth: 17 },   // JULY
      9: { halign: 'left', cellWidth: 17 },   // AUG
      10: { halign: 'left', cellWidth: 18 },  // SEPT
      11: { halign: 'left', cellWidth: 17 },  // OCT
      12: { halign: 'left', cellWidth: 17 },  // NOV
      13: { halign: 'left', cellWidth: 17 },  // DEC
    },
    didParseCell: (data) => {
      // Style Summary row
      if (data.row.index === tableRows.length) {
        data.cell.styles.fontStyle = 'bold';
        data.cell.styles.fontSize = 7.5;
        data.cell.styles.fillColor = [248, 250, 252]; // #f8fafc
        if (data.column.index === 1) {
          data.cell.styles.halign = 'right';
        }
      }
    },
    didDrawPage: (data) => {
      // Repeat header styling automatically on page break
    },
  });

  // ── Footer Section ───────────────────────────────────────────────────────────
  const finalY = doc.lastAutoTable.finalY + 8;
  const pageHeight = doc.internal.pageSize.getHeight();
  const footerY = Math.min(finalY, pageHeight - 16);

  // Generated timestamp
  const now = new Date();
  const dateStr = now.toLocaleDateString('en-US', { month: 'numeric', day: 'numeric', year: 'numeric' });
  const timeStr = now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', second: '2-digit', hour12: true });
  const timeStamp = `Generated: ${dateStr}, ${timeStr}`;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(100, 116, 139);
  doc.text(timeStamp, pageWidth / 2, footerY, { align: 'center' });

  // Grand Total Banner
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(29, 78, 216); // Royal Blue #1d4ed8
  doc.text(`Grand Total: ${RUPEE}${grandTotal.toLocaleString('en-IN')}`, pageWidth / 2, footerY + 6, { align: 'center' });

  return doc;
};

/**
 * Downloads the PDF document cleanly
 */
export const downloadAmmsPdf = (options) => {
  const doc = buildAmmsPdfDoc(options);
  doc.save(`AMMS-Monthly-Contributions-${options.year || new Date().getFullYear()}.pdf`);
};

/**
 * Generates the PDF blob URL and triggers printing directly on the PDF stream (NO window.print on web page!)
 */
export const printAmmsPdf = (options) => {
  const doc = buildAmmsPdfDoc(options);
  const blobUrl = doc.output('bloburl');

  // Create an invisible iframe for direct PDF printing
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
      // Fallback if iframe print is blocked by browser policy
      window.open(blobUrl, '_blank');
    }
  };
};
