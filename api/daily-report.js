import { createClient } from '@supabase/supabase-js'
import { Resend } from 'resend'

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)
const resend = new Resend(process.env.VITE_RESEND_API_KEY)

const CATEGORIES = {
  nmr: 'NMR Labor',
  jcb: 'JCB',
  contractor_fee: 'Contractor Fee',
  labor_contract: 'Labor Contract',
  general: 'General',
}

function formatINR(n) {
  if (n == null || isNaN(n)) return '0'
  const s = Math.round(n).toString()
  const last3 = s.slice(-3)
  const rest = s.slice(0, -3)
  if (!rest) return last3
  return rest.replace(/\B(?=(\d{2})+(?!\d))/g, ',') + ',' + last3
}

// Get today's date in IST (UTC+5:30)
function getTodayIST() {
  const now = new Date()
  const ist = new Date(now.getTime() + 5.5 * 60 * 60 * 1000)
  return ist.toISOString().split('T')[0]
}

// Get first day of current month in IST
function getMonthStartIST() {
  const today = getTodayIST()
  return today.slice(0, 7) + '-01'
}

export default async function handler(req, res) {
  // Verify cron secret (Vercel sends this header for cron jobs)
  if (req.headers['authorization'] !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  try {
    const today = getTodayIST()
    const monthStart = getMonthStartIST()

    // Fetch today's entries
    const { data: todayEntries, error: err1 } = await supabase
      .from('entries')
      .select('*')
      .eq('entry_date', today)
      .order('project_id')

    if (err1) throw err1

    // Fetch MTD entries for total
    const { data: mtdEntries, error: err2 } = await supabase
      .from('entries')
      .select('total_amount')
      .gte('entry_date', monthStart)
      .lte('entry_date', today)

    if (err2) throw err2

    // Fetch projects for name mapping
    const { data: projects } = await supabase.from('projects').select('id, name')
    const projectMap = {}
    ;(projects || []).forEach(p => { projectMap[p.id] = p.name })

    const todayTotal = (todayEntries || []).reduce((s, e) => s + e.total_amount, 0)
    const mtdTotal = (mtdEntries || []).reduce((s, e) => s + e.total_amount, 0)

    // Group today's entries by project
    const byProject = {}
    ;(todayEntries || []).forEach(e => {
      const projName = projectMap[e.project_id] || e.project_id
      if (!byProject[projName]) byProject[projName] = []
      byProject[projName].push(e)
    })

    // Build HTML email
    const html = buildEmailHTML({
      today,
      todayEntries: todayEntries || [],
      todayTotal,
      mtdTotal,
      byProject,
    })

    const { error: sendError } = await resend.emails.send({
      from: 'SiteLedger <onboarding@resend.dev>',
      to: 'wilson4smiles@gmail.com',
      subject: `SiteLedger Daily Report — ${today} | ₹${formatINR(todayTotal)}`,
      html,
    })

    if (sendError) throw sendError

    return res.status(200).json({ ok: true, date: today, todayTotal, mtdTotal })
  } catch (error) {
    console.error('Daily report error:', error)
    return res.status(500).json({ error: error.message })
  }
}

function buildEmailHTML({ today, todayEntries, todayTotal, mtdTotal, byProject }) {
  const projectSections = Object.entries(byProject).map(([projName, entries]) => {
    const projTotal = entries.reduce((s, e) => s + e.total_amount, 0)

    // Category breakdown within project
    const byCat = {}
    entries.forEach(e => {
      const cat = e.category
      if (!byCat[cat]) byCat[cat] = { amount: 0, count: 0 }
      byCat[cat].amount += e.total_amount
      byCat[cat].count += 1
    })

    const catRows = Object.entries(byCat).map(([cat, { amount, count }]) =>
      `<tr>
        <td style="padding:6px 12px;border-bottom:1px solid #eee;">${CATEGORIES[cat] || cat}</td>
        <td style="padding:6px 12px;border-bottom:1px solid #eee;text-align:center;">${count}</td>
        <td style="padding:6px 12px;border-bottom:1px solid #eee;text-align:right;font-variant-numeric:tabular-nums;">₹${formatINR(amount)}</td>
      </tr>`
    ).join('')

    return `
      <div style="margin-bottom:20px;">
        <h3 style="margin:0 0 8px;font-size:15px;color:#333;">${projName}
          <span style="font-weight:400;color:#888;font-size:13px;"> — ₹${formatINR(projTotal)}</span>
        </h3>
        <table style="width:100%;border-collapse:collapse;font-size:13px;">
          <thead>
            <tr style="background:#f8f8f8;">
              <th style="padding:6px 12px;text-align:left;font-weight:500;">Category</th>
              <th style="padding:6px 12px;text-align:center;font-weight:500;">Entries</th>
              <th style="padding:6px 12px;text-align:right;font-weight:500;">Amount</th>
            </tr>
          </thead>
          <tbody>${catRows}</tbody>
        </table>
      </div>`
  }).join('')

  const noEntries = todayEntries.length === 0
    ? '<p style="color:#888;font-size:14px;">No entries recorded today.</p>'
    : ''

  return `
    <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;max-width:560px;margin:0 auto;color:#222;">
      <div style="background:#1a1a2e;color:#fff;padding:20px 24px;border-radius:8px 8px 0 0;">
        <h1 style="margin:0;font-size:18px;font-weight:600;">SiteLedger Daily Report</h1>
        <p style="margin:6px 0 0;font-size:13px;opacity:0.8;">${today}</p>
      </div>

      <div style="padding:24px;border:1px solid #e5e5e5;border-top:none;border-radius:0 0 8px 8px;">
        <!-- Summary boxes -->
        <div style="display:flex;gap:12px;margin-bottom:24px;">
          <div style="flex:1;background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;padding:16px;text-align:center;">
            <div style="font-size:11px;text-transform:uppercase;letter-spacing:0.05em;color:#15803d;font-weight:500;">Today's Total</div>
            <div style="font-size:22px;font-weight:700;color:#166534;margin-top:4px;font-variant-numeric:tabular-nums;">₹${formatINR(todayTotal)}</div>
            <div style="font-size:12px;color:#888;margin-top:2px;">${todayEntries.length} ${todayEntries.length === 1 ? 'entry' : 'entries'}</div>
          </div>
          <div style="flex:1;background:#eff6ff;border:1px solid #bfdbfe;border-radius:8px;padding:16px;text-align:center;">
            <div style="font-size:11px;text-transform:uppercase;letter-spacing:0.05em;color:#1d4ed8;font-weight:500;">Month to Date</div>
            <div style="font-size:22px;font-weight:700;color:#1e40af;margin-top:4px;font-variant-numeric:tabular-nums;">₹${formatINR(mtdTotal)}</div>
          </div>
        </div>

        ${noEntries}
        ${projectSections}

        <hr style="border:none;border-top:1px solid #eee;margin:20px 0;">
        <p style="font-size:11px;color:#aaa;text-align:center;margin:0;">
          Automated report from SiteLedger
        </p>
      </div>
    </div>`
}
