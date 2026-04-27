import React from 'react'
import { I } from '../components/icons'
import { Button, Chip, TopBar } from '../components/ui'
import { useData } from '../lib/DataContext'
import { CATEGORIES, formatINRFull, formatTime } from '../data/constants'
import { entrySubtitle } from './HomeScreen'

function DetailRow({ label, value, multiline }) {
  return (
    <div style={{
      padding: '12px 14px',
      borderBottom: '1px solid hsl(var(--border))',
      display: multiline ? 'block' : 'flex',
      alignItems: 'baseline',
      justifyContent: 'space-between',
      gap: 12,
    }}>
      <div style={{ fontSize: 13, color: 'hsl(var(--muted-foreground))', marginBottom: multiline ? 4 : 0 }}>{label}</div>
      <div style={{ fontSize: 14, color: 'hsl(var(--foreground))', textAlign: multiline ? 'left' : 'right' }}>{value}</div>
    </div>
  )
}

export default function EntryDetailScreen({ entry, plots, onClose, onEdit, onDelete }) {
  const { user, workerTypes, contractors, jcbOperators } = useData()
  const cat = CATEGORIES[entry.category]
  const plotName = plots.find(p => p.id === entry.plot_id)?.name
  const isOwner = entry.created_by === user?.id
  const now = new Date()
  const lockedAt = new Date(entry.locked_at)
  const locked = now > lockedAt
  const canEdit = isOwner && !locked

  const lockedIn = lockedAt - now
  const hoursLeft = Math.max(0, Math.floor(lockedIn / 3600 / 1000))
  const minsLeft = Math.max(0, Math.floor((lockedIn / 1000 / 60) % 60))

  return (
    <div className="sheet">
      <TopBar title="Entry details" onBack={onClose}/>
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px 18px 32px' }}>

        <div style={{
          padding: '20px',
          borderRadius: 12,
          background: 'hsl(var(--card))',
          border: '1px solid hsl(var(--border))',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
            <div style={{
              width: 32, height: 32, borderRadius: 8,
              background: `hsl(${cat.color} / 0.12)`,
              color: `hsl(${cat.color})`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              {entry.category === 'nmr' && <I.User size={15}/>}
              {entry.category === 'jcb' && <I.Truck size={15}/>}
              {entry.category === 'contractor_fee' && <I.Briefcase size={15}/>}
              {entry.category === 'labor_contract' && <I.HardHat size={15}/>}
              {entry.category === 'general' && <I.Package size={15}/>}
            </div>
            <span style={{ fontSize: 13, fontWeight: 500, color: 'hsl(var(--muted-foreground))' }}>
              {cat.label}
            </span>
            {locked && <Chip tone="locked"><I.Lock size={10}/> Locked</Chip>}
            {!locked && isOwner && (
              <Chip tone="warn"><I.Clock size={10}/> Edit window: {hoursLeft}h {minsLeft}m</Chip>
            )}
          </div>
          <div className="tabular" style={{ fontSize: 34, fontWeight: 600, letterSpacing: '-0.02em' }}>
            {formatINRFull(entry.total_amount)}
          </div>
          <div style={{ fontSize: 13, color: 'hsl(var(--muted-foreground))', marginTop: 2 }}>
            {entrySubtitle(entry, { workerTypes, contractors, jcbOperators })}
          </div>
        </div>

        <div className="card" style={{ marginTop: 16, overflow: 'hidden' }}>
          <DetailRow label="Plot" value={plotName}/>
          <DetailRow label="Payment" value={entry.payment_mode === 'cash' ? 'Cash' : entry.payment_mode === 'upi' ? 'UPI' : 'Bank transfer'}/>
          {entry.category === 'nmr' && (
            <>
              <DetailRow label="Workers" value={entry.details.worker_count}/>
              <DetailRow label="Wage / worker" value={formatINRFull(entry.details.wage_per_worker) + (entry.details.wage_overridden ? ' (override)' : '')}/>
            </>
          )}
          {entry.category === 'jcb' && (
            <>
              <DetailRow label="Hours" value={entry.details.hours + 'h'}/>
              <DetailRow label="Rate" value={formatINRFull(entry.details.hourly_rate) + '/hr'}/>
            </>
          )}
          {entry.category === 'contractor_fee' && (
            <>
              <DetailRow label="Fee" value={formatINRFull(entry.details.fee)}/>
              {entry.details.tip > 0 && <DetailRow label="Tip" value={formatINRFull(entry.details.tip)}/>}
            </>
          )}
          {entry.category === 'labor_contract' && (
            <>
              <DetailRow label="Work type" value={entry.details.work_type}/>
              <DetailRow label="Stage" value={entry.details.payment_stage[0].toUpperCase() + entry.details.payment_stage.slice(1)}/>
            </>
          )}
          {entry.notes && <DetailRow label="Notes" value={entry.notes} multiline/>}
        </div>

        {entry.photo_url && (
          <div style={{ marginTop: 16 }}>
            <div style={{ fontSize: 12, color: 'hsl(var(--muted-foreground))', marginBottom: 8, fontWeight: 500 }}>RECEIPT</div>
            <div style={{
              borderRadius: 12, overflow: 'hidden',
              border: '1px solid hsl(var(--border))',
              aspectRatio: '4 / 3',
              background: 'repeating-linear-gradient(45deg, hsl(var(--muted)), hsl(var(--muted)) 10px, hsl(var(--accent)) 10px, hsl(var(--accent)) 20px)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'hsl(var(--muted-foreground))',
              fontSize: 12,
              fontFamily: 'monospace',
            }}>
              receipt.jpg &middot; 2.1 MB
            </div>
          </div>
        )}

        <div style={{ marginTop: 18, fontSize: 12, color: 'hsl(var(--muted-foreground))', lineHeight: 1.6 }}>
          <div>Created by <strong style={{ color: 'hsl(var(--foreground))', fontWeight: 500 }}>{entry.created_by_name}</strong></div>
          <div>at {formatTime(entry.created_at)} &middot; {new Date(entry.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</div>
        </div>
      </div>

      {canEdit && (
        <div style={{
          display: 'flex', gap: 10,
          padding: '12px 16px',
          borderTop: '1px solid hsl(var(--border))',
          background: 'hsl(var(--background))',
        }}>
          <Button variant="outline" size="lg" onClick={onDelete} style={{ flex: 1, color: 'hsl(var(--destructive))', borderColor: 'hsl(var(--border))' }}>
            <I.Trash size={16}/>
            Delete
          </Button>
          <Button variant="primary" size="lg" onClick={onEdit} style={{ flex: 1.5 }}>
            <I.Edit size={16}/>
            Edit entry
          </Button>
        </div>
      )}
      {!canEdit && (
        <div style={{
          padding: '14px 16px',
          borderTop: '1px solid hsl(var(--border))',
          background: 'hsl(var(--muted))',
          color: 'hsl(var(--muted-foreground))',
          fontSize: 12,
          textAlign: 'center',
        }}>
          <I.Lock size={11} style={{ verticalAlign: '-1px', marginRight: 4 }}/>
          {locked ? '24-hour edit window has passed.' : 'Only the creator can edit this entry.'}
          {' '}Ask your admin if a correction is needed.
        </div>
      )}
    </div>
  )
}
