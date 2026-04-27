// Seed data — Bengaluru/Whitefield site

export const SEED = {
  user: {
    id: 'u-rajesh',
    name: 'Rajesh Kumar',
    email: 'rajesh@gmail.com',
    role: 'supervisor',
    must_change_password: false,
  },
  projects: [
    { id: 'p-whitefield', name: 'Whitefield Site', location: 'Whitefield, Bengaluru', mtd: 412800 },
    { id: 'p-sarjapur', name: 'Sarjapur Villas', location: 'Sarjapur Rd, Bengaluru', mtd: 286400 },
  ],
  plotsByProject: {
    'p-whitefield': [
      { id: 'plot-22', name: 'Plot 22' },
      { id: 'plot-23', name: 'Plot 23' },
      { id: 'plot-24', name: 'Plot 24' },
      { id: 'plot-site', name: 'Site-wide' },
    ],
    'p-sarjapur': [
      { id: 'plot-a1', name: 'Villa A1' },
      { id: 'plot-a2', name: 'Villa A2' },
      { id: 'plot-site2', name: 'Site-wide' },
    ],
  },
  workerTypes: [
    { id: 'wt-mason', name: 'Mason', default_wage: 950 },
    { id: 'wt-helper', name: 'Helper', default_wage: 600 },
    { id: 'wt-carpenter', name: 'Carpenter', default_wage: 1100 },
    { id: 'wt-electrician', name: 'Electrician', default_wage: 1200 },
    { id: 'wt-bar-bender', name: 'Bar Bender', default_wage: 1000 },
  ],
  contractors: [
    { id: 'c-ramesh', name: 'Ramesh Plastering Co.', type: 'both' },
    { id: 'c-suresh', name: 'Suresh Tiles', type: 'labor_contract' },
    { id: 'c-mahesh', name: 'Mahesh Painting', type: 'labor_contract' },
    { id: 'c-iqbal', name: 'Iqbal Daily Crew', type: 'daily_fee' },
    { id: 'c-stargold', name: 'StarGold Electricals', type: 'both' },
  ],
  jcbOperators: [
    { id: 'op-prakash', name: 'Prakash B.', default_hourly_rate: 1200 },
    { id: 'op-anand', name: 'Anand R.', default_hourly_rate: 1150 },
    { id: 'op-naveen', name: 'Naveen S.', default_hourly_rate: 1300 },
  ],
  workTypes: ['Plastering', 'Brickwork', 'Tiling', 'Painting', 'Electrical', 'Plumbing', 'Other'],
};

export const TODAY = new Date(2026, 3, 26);

function makeEntry({ id, category, plot_id, total_amount, payment_mode, details, hoursAgo, photo, notes }) {
  const now = new Date(2026, 3, 26, 12, 14, 0);
  const ts = new Date(now.getTime() - hoursAgo * 3600 * 1000);
  return {
    id,
    project_id: 'p-whitefield',
    plot_id,
    category,
    total_amount,
    payment_mode,
    details,
    photo_url: photo || null,
    notes: notes || null,
    entry_date: '2026-04-26',
    created_by: 'u-rajesh',
    created_by_name: 'Rajesh Kumar',
    created_at: ts,
    locked_at: new Date(ts.getTime() + 24 * 3600 * 1000),
  };
}

export const SEED_ENTRIES = [
  makeEntry({
    id: 'e-1', category: 'nmr', plot_id: 'plot-22', total_amount: 7600, payment_mode: 'cash',
    details: { worker_type_id: 'wt-mason', worker_count: 8, wage_per_worker: 950, wage_overridden: false },
    hoursAgo: 3.5, photo: true, notes: 'Foundation work, second floor slab prep',
  }),
  makeEntry({
    id: 'e-2', category: 'jcb', plot_id: 'plot-22', total_amount: 5400, payment_mode: 'upi',
    details: { operator_id: 'op-prakash', hours: 4.5, hourly_rate: 1200 },
    hoursAgo: 2,
  }),
  makeEntry({
    id: 'e-3', category: 'general', plot_id: 'plot-site', total_amount: 3500, payment_mode: 'cash',
    details: { description: 'Cement bags - 10 nos', amount: 3500 },
    hoursAgo: 1.25, photo: true,
  }),
  makeEntry({
    id: 'e-4', category: 'contractor_fee', plot_id: 'plot-23', total_amount: 2200, payment_mode: 'upi',
    details: { contractor_id: 'c-iqbal', fee: 2000, tip: 200 },
    hoursAgo: 0.75,
  }),
  makeEntry({
    id: 'e-5', category: 'labor_contract', plot_id: 'plot-23', total_amount: 15000, payment_mode: 'bank_transfer',
    details: { contractor_id: 'c-ramesh', work_type: 'Plastering', amount: 15000, payment_stage: 'running' },
    hoursAgo: 0.25,
  }),
];

function makePastEntry(daysAgo, hour, props) {
  const date = new Date(2026, 3, 26 - daysAgo, hour, 30, 0);
  return {
    project_id: 'p-whitefield',
    created_by: 'u-rajesh',
    created_by_name: 'Rajesh Kumar',
    entry_date: `2026-04-${String(26 - daysAgo).padStart(2, '0')}`,
    created_at: date,
    locked_at: new Date(date.getTime() + 24 * 3600 * 1000),
    ...props,
  };
}

export const HISTORY_PAST = [
  makePastEntry(1, 9, { id: 'h1', category: 'nmr', plot_id: 'plot-22', total_amount: 7200, payment_mode: 'cash',
    details: { worker_type_id: 'wt-mason', worker_count: 8, wage_per_worker: 900, wage_overridden: true } }),
  makePastEntry(1, 11, { id: 'h2', category: 'general', plot_id: 'plot-site', total_amount: 1800, payment_mode: 'upi',
    details: { description: 'Diesel for generator', amount: 1800 } }),
  makePastEntry(1, 14, { id: 'h3', category: 'labor_contract', plot_id: 'plot-24', total_amount: 22000, payment_mode: 'bank_transfer',
    details: { contractor_id: 'c-suresh', work_type: 'Tiling', amount: 22000, payment_stage: 'final' } }),
  makePastEntry(2, 10, { id: 'h4', category: 'nmr', plot_id: 'plot-23', total_amount: 6600, payment_mode: 'cash',
    details: { worker_type_id: 'wt-helper', worker_count: 11, wage_per_worker: 600, wage_overridden: false } }),
  makePastEntry(2, 13, { id: 'h5', category: 'jcb', plot_id: 'plot-22', total_amount: 8400, payment_mode: 'upi',
    details: { operator_id: 'op-anand', hours: 7, hourly_rate: 1200 } }),
  makePastEntry(2, 16, { id: 'h6', category: 'contractor_fee', plot_id: 'plot-22', total_amount: 1500, payment_mode: 'cash',
    details: { contractor_id: 'c-iqbal', fee: 1500, tip: 0 } }),
  makePastEntry(3, 9, { id: 'h7', category: 'general', plot_id: 'plot-site', total_amount: 4200, payment_mode: 'upi',
    details: { description: 'Steel rods - 12mm', amount: 4200 } }),
  makePastEntry(3, 12, { id: 'h8', category: 'nmr', plot_id: 'plot-22', total_amount: 9900, payment_mode: 'cash',
    details: { worker_type_id: 'wt-mason', worker_count: 9, wage_per_worker: 1100, wage_overridden: false } }),
  makePastEntry(4, 10, { id: 'h9', category: 'labor_contract', plot_id: 'plot-23', total_amount: 8000, payment_mode: 'bank_transfer',
    details: { contractor_id: 'c-mahesh', work_type: 'Painting', amount: 8000, payment_stage: 'advance' } }),
  makePastEntry(4, 15, { id: 'h10', category: 'jcb', plot_id: 'plot-22', total_amount: 3600, payment_mode: 'cash',
    details: { operator_id: 'op-prakash', hours: 3, hourly_rate: 1200 } }),
];

export const CATEGORIES = {
  nmr:            { label: 'NMR Labor',      short: 'NMR',        color: 'var(--cat-nmr)' },
  jcb:            { label: 'JCB',            short: 'JCB',        color: 'var(--cat-jcb)' },
  contractor_fee: { label: 'Contractor Fee', short: 'Contractor', color: 'var(--cat-contractor)' },
  labor_contract: { label: 'Labor Contract', short: 'Contract',   color: 'var(--cat-labor)' },
  general:        { label: 'General',        short: 'General',    color: 'var(--cat-general)' },
};

export const PAY_MODES = [
  { value: 'cash', label: 'Cash' },
  { value: 'upi', label: 'UPI' },
  { value: 'bank_transfer', label: 'Bank' },
];

export function formatINR(n) {
  if (n == null || isNaN(n)) return '0';
  const s = Math.round(n).toString();
  const last3 = s.slice(-3);
  const rest = s.slice(0, -3);
  if (!rest) return last3;
  return rest.replace(/\B(?=(\d{2})+(?!\d))/g, ',') + ',' + last3;
}

export function formatINRFull(n) {
  return '₹' + formatINR(n);
}

export function timeAgo(date, now = new Date(2026, 3, 26, 12, 14, 0)) {
  const diff = (now - date) / 1000;
  if (diff < 60) return 'just now';
  if (diff < 3600) return Math.floor(diff / 60) + ' min ago';
  if (diff < 86400) return Math.floor(diff / 3600) + ' hr ago';
  return Math.floor(diff / 86400) + 'd ago';
}

export function formatTime(date) {
  let h = date.getHours();
  const m = date.getMinutes();
  const ap = h >= 12 ? 'PM' : 'AM';
  h = h % 12 || 12;
  return `${h}:${String(m).padStart(2, '0')} ${ap}`;
}

export function formatDateLong(date) {
  return date.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
}

export function formatDateShort(date) {
  return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
}
