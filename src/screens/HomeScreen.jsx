import React, { useState } from 'react'
import { I } from '../components/icons'
import { useData } from '../lib/DataContext'
import { CATEGORIES, formatINRFull, formatDateShort, timeAgo } from '../data/constants'

export function entrySubtitle(e, refs = {}) {
  const { workerTypes = [], contractors = [], jcbOperators = [] } = refs
  if (e.category === 'nmr') {
    const wt = workerTypes.find(w => w.id === e.details.worker_type_id)
    const gender = e.details.worker_gender === 'female' ? ' (F)' : ''
    return `${e.details.worker_count} \u00d7 ${wt ? wt.name : 'Workers'}${gender}`
  }
  if (e.category === 'jcb') {
    const op = jcbOperators.find(o => o.id === e.details.operator_id)
    return `${e.details.hours}h JCB \u00b7 ${op ? op.name : ''}`
  }
  if (e.category === 'contractor_fee') {
    const c = contractors.find(x => x.id === e.details.contractor_id)
    return c ? c.name : 'Contractor fee'
  }
  if (e.category === 'labor_contract') {
    const c = contractors.find(x => x.id === e.details.contractor_id)
    return `${e.details.work_type} \u00b7 ${c ? c.name : ''}`
  }
  return e.details.description || 'General'
}

export function EntryRow({ entry, onClick, syncing, first, last, plotName }) {
  const { workerTypes, contractors, jcbOperators } = useData()
  const cat = CATEGORIES[entry.category]
  const subtitle = entrySubtitle(entry, { workerTypes, contractors, jcbOperators })

  return (
    <button
      onClick={onClick}
      className="card"
      style={{
        padding: '12px 14px', textAlign: 'left', cursor: 'pointer',
        display: 'flex', alignItems: 'center', gap: 12,
        marginTop: first ? 0 : -1,
        borderRadius: first && last ? 12 : first ? '12px 12px 0 0' : last ? '0 0 12px 12px' : 0,
      }}
    >
      <div style={{
        width: 36, height: 36, borderRadius: 8,
        background: `hsl(${cat.color} / 0.12)`,
        color: `hsl(${cat.color})`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0,
      }}>
        {entry.category === 'nmr' && <I.User size={16}/>}
        {entry.category === 'jcb' && <I.Truck size={16}/>}
        {entry.category === 'contractor_fee' && <I.Briefcase size={16}/>}
        {entry.category === 'labor_contract' && <I.HardHat size={16}/>}
        {entry.category === 'general' && <I.Package size={16}/>}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 14, fontWeight: 500, color: 'hsl(var(--foreground))', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {subtitle}
        </div>
        <div style={{ fontSize: 12, color: 'hsl(var(--muted-foreground))', marginTop: 2, display: 'flex', alignItems: 'center', gap: 6 }}>
          <span>{plotName}</span>
          <span>&middot;</span>
          <span>{cat.short}</span>
          <span>&middot;</span>
          <span>{timeAgo(entry.created_at)}</span>
          {entry.photo_url && <I.Paperclip size={11}/>}
        </div>
      </div>
      <div style={{ textAlign: 'right', flexShrink: 0 }}>
        <div className="tabular" style={{ fontSize: 14, fontWeight: 600 }}>{formatINRFull(entry.total_amount)}</div>
        <div style={{ fontSize: 11, color: 'hsl(var(--muted-foreground))', marginTop: 1, display: 'flex', alignItems: 'center', gap: 4, justifyContent: 'flex-end' }}>
          {syncing ? <><span className="spinner" style={{ width: 10, height: 10 }}/> Syncing</> : entry.payment_mode === 'cash' ? 'Cash' : entry.payment_mode === 'upi' ? 'UPI' : 'Bank'}
        </div>
      </div>
    </button>
  )
}

export default function HomeScreen({ project, entries, onAddExpense, onOpenEntry, onSwitchProject, onGoHistory, onLogout }) {
  const { user, plotsByProject } = useData()
  const [filter, setFilter] = useState(null)

  const todayTotal = entries.reduce((s, e) => s + e.total_amount, 0)
  const byCategory = entries.reduce((acc, e) => {
    if (!acc[e.category]) acc[e.category] = { amount: 0, count: 0 }
    acc[e.category].amount += e.total_amount
    acc[e.category].count += 1
    return acc
  }, {})

  const filtered = filter ? entries.filter(e => e.category === filter) : entries
  const recent = [...filtered].slice(0, 5)
  const allPlots = plotsByProject[project.id] || []
  const filteredTotal = filter ? filtered.reduce((s, e) => s + e.total_amount, 0) : todayTotal

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', position: 'relative', minHeight: 0 }}>
      {/* Header */}
      <div style={{ padding: '14px 18px 14px', display: 'flex', alignItems: 'center', gap: 12 }}>
        <button onClick={onSwitchProject} style={{
          flex: 1, display: 'flex', alignItems: 'center', gap: 8,
          background: 'transparent', border: 0, padding: 0, textAlign: 'left',
          cursor: 'pointer',
        }}>
          <div style={{
            width: 32, height: 32, borderRadius: 8,
            background: 'hsl(var(--accent))',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <I.HardHat size={16}/>
          </div>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 14, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
              {project.name}
              <I.ChevronDown size={13} style={{ color: 'hsl(var(--muted-foreground))' }}/>
            </div>
            <div style={{ fontSize: 11, color: 'hsl(var(--muted-foreground))' }}>
              {user?.name?.split(' ')[0]} &bull; {formatDateShort(new Date())}
            </div>
          </div>
        </button>
        <button className="btn btn-ghost btn-icon" aria-label="History" onClick={onGoHistory} style={{ height: 36, width: 36 }}>
          <I.History size={16}/>
        </button>
        <button className="btn btn-ghost btn-icon" aria-label="Logout" onClick={onLogout} style={{ height: 36, width: 36 }}>
          <I.LogOut size={16}/>
        </button>
      </div>

      <div style={{ padding: '0 18px', flex: 1, overflowY: 'auto', paddingBottom: 100 }}>
        {/* Today total card */}
        <div className="card" style={{ padding: 18, background: 'hsl(var(--card))' }}>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
            <div style={{ fontSize: 12, color: 'hsl(var(--muted-foreground))', textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: 500 }}>
              {filter ? `${CATEGORIES[filter].label} today` : "Today's spend"}
            </div>
            {filter && (
              <button onClick={() => setFilter(null)} style={{
                background: 'transparent', border: 0, padding: 0, cursor: 'pointer',
                fontSize: 11, color: 'hsl(var(--muted-foreground))',
                display: 'inline-flex', alignItems: 'center', gap: 3,
              }}>
                <I.X size={11}/> Clear
              </button>
            )}
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginTop: 4 }}>
            <span className="tabular" style={{ fontSize: 30, fontWeight: 600, letterSpacing: '-0.02em' }}>
              {formatINRFull(filteredTotal)}
            </span>
            <span style={{ fontSize: 13, color: 'hsl(var(--muted-foreground))' }}>
              &middot; {filtered.length} {filtered.length === 1 ? 'entry' : 'entries'}
            </span>
          </div>

          {/* Stacked bar */}
          <div style={{ marginTop: 14, display: 'flex', height: 6, borderRadius: 999, overflow: 'hidden', background: 'hsl(var(--muted))' }}>
            {Object.entries(byCategory).map(([cat, { amount }]) => (
              <div key={cat} style={{
                width: `${(amount / todayTotal) * 100}%`,
                background: `hsl(${CATEGORIES[cat].color})`,
                opacity: filter && filter !== cat ? 0.25 : 1,
                transition: 'opacity .15s',
              }}/>
            ))}
          </div>

          {/* Tappable filter chips */}
          <div style={{ marginTop: 12, display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {Object.entries(byCategory).map(([cat, { amount }]) => {
              const active = filter === cat
              return (
                <button
                  key={cat}
                  onClick={() => setFilter(active ? null : cat)}
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: 6,
                    padding: '5px 10px',
                    borderRadius: 999,
                    border: '1px solid ' + (active ? `hsl(${CATEGORIES[cat].color})` : 'hsl(var(--border))'),
                    background: active ? `hsl(${CATEGORIES[cat].color} / 0.1)` : 'transparent',
                    color: 'hsl(var(--foreground))',
                    fontSize: 12, fontWeight: 500,
                    cursor: 'pointer',
                    transition: 'all .12s',
                  }}
                >
                  <span style={{ width: 6, height: 6, borderRadius: 999, background: `hsl(${CATEGORIES[cat].color})` }}/>
                  <span>{CATEGORIES[cat].short}</span>
                  <span className="tabular" style={{ color: 'hsl(var(--muted-foreground))', fontWeight: 400 }}>{formatINRFull(amount)}</span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Recent */}
        <div style={{ marginTop: 22, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: 'hsl(var(--foreground))' }}>
            {filter ? `${CATEGORIES[filter].label} entries` : 'Recent entries'}
          </div>
          <button
            onClick={onGoHistory}
            style={{ background: 'transparent', border: 0, fontSize: 12, color: 'hsl(var(--muted-foreground))', cursor: 'pointer', padding: 0 }}
          >
            See all &rarr;
          </button>
        </div>

        <div style={{ marginTop: 8, display: 'flex', flexDirection: 'column' }}>
          {recent.length === 0 && (
            <div className="card" style={{ padding: 24, textAlign: 'center', color: 'hsl(var(--muted-foreground))', fontSize: 13 }}>
              {filter ? `No ${CATEGORIES[filter].label} entries today.` : <>No entries yet today. Tap <strong style={{ color: 'hsl(var(--foreground))' }}>+ Add expense</strong> to log one.</>}
            </div>
          )}
          {recent.map((e, i) => (
            <EntryRow
              key={e.id}
              entry={e}
              onClick={() => onOpenEntry(e)}
              syncing={false}
              first={i === 0}
              last={i === recent.length - 1}
              plotName={allPlots.find(p => p.id === e.plot_id)?.name}
            />
          ))}
        </div>
      </div>

      <button className="fab" onClick={onAddExpense}>
        <I.Plus size={20}/>
        Add expense
      </button>
    </div>
  )
}
