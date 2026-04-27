import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import { CATEGORIES, formatINR } from '../data/constants'

export function generateReport({ entries, projects, plots, startDate, endDate }) {
  const doc = new jsPDF('p', 'mm', 'a4')
  const pageWidth = doc.internal.pageSize.getWidth()

  // Build lookup maps
  const projectMap = {}
  projects.forEach(p => { projectMap[p.id] = p.name })
  const plotMap = {}
  plots.forEach(p => { plotMap[p.id] = p.name })

  // Header
  doc.setFontSize(18)
  doc.setFont(undefined, 'bold')
  doc.text('SiteLedger Expense Report', pageWidth / 2, 20, { align: 'center' })

  doc.setFontSize(11)
  doc.setFont(undefined, 'normal')
  doc.text(`${startDate} to ${endDate}`, pageWidth / 2, 28, { align: 'center' })

  doc.setFontSize(9)
  doc.setTextColor(120)
  doc.text(`Generated: ${new Date().toLocaleString('en-IN')}`, pageWidth / 2, 34, { align: 'center' })
  doc.setTextColor(0)

  // Line items table
  const rows = entries.map(e => [
    e.entry_date,
    projectMap[e.project_id] || e.project_id,
    plotMap[e.plot_id] || e.plot_id,
    CATEGORIES[e.category]?.short || e.category,
    (e.details?.description || e.notes || '').substring(0, 30),
    e.payment_mode === 'bank_transfer' ? 'Bank' : e.payment_mode === 'upi' ? 'UPI' : 'Cash',
    formatINR(e.total_amount),
  ])

  autoTable(doc, {
    startY: 40,
    head: [['Date', 'Project', 'Plot', 'Category', 'Description', 'Pay Mode', 'Amount']],
    body: rows,
    styles: { fontSize: 8, cellPadding: 2 },
    headStyles: { fillColor: [30, 30, 30], textColor: 255, fontStyle: 'bold' },
    columnStyles: {
      0: { cellWidth: 22 },
      6: { halign: 'right', fontStyle: 'bold' },
    },
    theme: 'grid',
  })

  let y = doc.lastAutoTable.finalY + 10

  // Category subtotals
  const byCat = {}
  entries.forEach(e => {
    const key = e.category
    if (!byCat[key]) byCat[key] = 0
    byCat[key] += e.total_amount
  })

  const catRows = Object.entries(byCat).map(([cat, amt]) => [
    CATEGORIES[cat]?.label || cat,
    formatINR(amt),
  ])

  if (catRows.length > 0) {
    autoTable(doc, {
      startY: y,
      head: [['Category', 'Subtotal']],
      body: catRows,
      styles: { fontSize: 9, cellPadding: 3 },
      headStyles: { fillColor: [60, 60, 60], textColor: 255 },
      columnStyles: { 1: { halign: 'right', fontStyle: 'bold' } },
      theme: 'grid',
      tableWidth: 90,
    })
    y = doc.lastAutoTable.finalY + 8
  }

  // Daily subtotals
  const byDate = {}
  entries.forEach(e => {
    if (!byDate[e.entry_date]) byDate[e.entry_date] = 0
    byDate[e.entry_date] += e.total_amount
  })

  const dateRows = Object.entries(byDate)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, amt]) => [date, formatINR(amt)])

  if (dateRows.length > 0) {
    autoTable(doc, {
      startY: y,
      head: [['Date', 'Daily Total']],
      body: dateRows,
      styles: { fontSize: 9, cellPadding: 3 },
      headStyles: { fillColor: [60, 60, 60], textColor: 255 },
      columnStyles: { 1: { halign: 'right', fontStyle: 'bold' } },
      theme: 'grid',
      tableWidth: 90,
    })
    y = doc.lastAutoTable.finalY + 10
  }

  // Grand total
  const grandTotal = entries.reduce((s, e) => s + e.total_amount, 0)
  doc.setFontSize(13)
  doc.setFont(undefined, 'bold')
  doc.text(`Grand Total: ₹${formatINR(grandTotal)}`, pageWidth / 2, y, { align: 'center' })

  // Save
  doc.save(`SiteLedger-Report-${startDate}-to-${endDate}.pdf`)
}
