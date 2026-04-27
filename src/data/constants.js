export const CATEGORIES = {
  nmr:            { label: 'NMR Labor',      short: 'NMR',        color: 'var(--cat-nmr)' },
  jcb:            { label: 'JCB',            short: 'JCB',        color: 'var(--cat-jcb)' },
  contractor_fee: { label: 'Contractor Fee', short: 'Contractor', color: 'var(--cat-contractor)' },
  labor_contract: { label: 'Labor Contract', short: 'Contract',   color: 'var(--cat-labor)' },
  general:        { label: 'General',        short: 'General',    color: 'var(--cat-general)' },
}

export const PAY_MODES = [
  { value: 'cash', label: 'Cash' },
  { value: 'upi', label: 'UPI' },
  { value: 'bank_transfer', label: 'Bank' },
]

export function formatINR(n) {
  if (n == null || isNaN(n)) return '0'
  const s = Math.round(n).toString()
  const last3 = s.slice(-3)
  const rest = s.slice(0, -3)
  if (!rest) return last3
  return rest.replace(/\B(?=(\d{2})+(?!\d))/g, ',') + ',' + last3
}

export function formatINRFull(n) {
  return '₹' + formatINR(n)
}

export function timeAgo(date, now = new Date()) {
  const diff = (now - new Date(date)) / 1000
  if (diff < 60) return 'just now'
  if (diff < 3600) return Math.floor(diff / 60) + ' min ago'
  if (diff < 86400) return Math.floor(diff / 3600) + ' hr ago'
  return Math.floor(diff / 86400) + 'd ago'
}

export function formatTime(date) {
  const d = new Date(date)
  let h = d.getHours()
  const m = d.getMinutes()
  const ap = h >= 12 ? 'PM' : 'AM'
  h = h % 12 || 12
  return `${h}:${String(m).padStart(2, '0')} ${ap}`
}

export function formatDateLong(date) {
  return new Date(date).toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
}

export function formatDateShort(date) {
  return new Date(date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
}
