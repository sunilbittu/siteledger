import React from 'react'
import { I } from '../components/icons'
import { TopBar } from '../components/ui'
import { SEED, formatINRFull } from '../data/seed'

export default function ProjectPickerScreen({ onPick, onLogout }) {
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      <TopBar title="Choose project" right={
        <button className="btn btn-ghost btn-icon" onClick={onLogout} aria-label="Sign out" style={{ height: 36, width: 36, color: 'hsl(var(--muted-foreground))' }}>
          <I.LogOut size={16}/>
        </button>
      }/>
      <div style={{ padding: '12px 16px 4px' }}>
        <p style={{ fontSize: 13, color: 'hsl(var(--muted-foreground))', margin: 0 }}>
          You're assigned to {SEED.projects.length} projects. Pick one to start logging.
        </p>
      </div>
      <div style={{ padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
        {SEED.projects.map(p => (
          <button
            key={p.id}
            onClick={() => onPick(p.id)}
            className="card"
            style={{
              padding: 16, textAlign: 'left', cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: 14,
            }}
          >
            <div style={{
              width: 44, height: 44, borderRadius: 10,
              background: 'hsl(var(--accent))',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'hsl(var(--foreground))',
              flexShrink: 0,
            }}>
              <I.HardHat size={20}/>
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 15, fontWeight: 600 }}>{p.name}</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: 'hsl(var(--muted-foreground))', marginTop: 2 }}>
                <I.MapPin size={12}/>
                {p.location}
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div className="tabular" style={{ fontSize: 13, fontWeight: 600 }}>{formatINRFull(p.mtd)}</div>
              <div style={{ fontSize: 11, color: 'hsl(var(--muted-foreground))', marginTop: 1 }}>this month</div>
            </div>
            <I.ChevronRight size={16} style={{ color: 'hsl(var(--muted-foreground))', flexShrink: 0 }}/>
          </button>
        ))}
      </div>
      <div style={{ marginTop: 'auto', padding: '16px 20px', textAlign: 'center', fontSize: 11, color: 'hsl(var(--muted-foreground))' }}>
        Signed in as {SEED.user.name}
      </div>
    </div>
  )
}
