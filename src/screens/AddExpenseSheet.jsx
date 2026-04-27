import React, { useState, useMemo } from 'react'
import { I } from '../components/icons'
import { Button, Input, Field, Segmented, Stepper, TopBar, SelectSheet, SelectField } from '../components/ui'
import { SEED, CATEGORIES, PAY_MODES, formatINRFull } from '../data/seed'
import { entrySubtitle } from './HomeScreen'

const CATEGORY_LIST = [
  { id: 'nmr',            label: 'NMR Labor',      icon: 'User',      desc: 'Daily-wage workers' },
  { id: 'jcb',            label: 'JCB',            icon: 'Truck',     desc: 'Excavator hours' },
  { id: 'contractor_fee', label: 'Contractor Fee', icon: 'Briefcase', desc: 'Daily crew payment' },
  { id: 'labor_contract', label: 'Labor Contract', icon: 'HardHat',   desc: 'Plastering, tiling, etc.' },
  { id: 'general',        label: 'General',        icon: 'Package',   desc: 'Materials, fuel, misc.' },
]

function CategoryPicker({ onClose, onPick, todayEntries }) {
  const counts = {}
  todayEntries.forEach(e => { counts[e.category] = (counts[e.category] || 0) + 1 })
  const sorted = [...CATEGORY_LIST].sort((a, b) => (counts[b.id] || 0) - (counts[a.id] || 0))
  const last = todayEntries[0]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <TopBar title="Add expense" right={
        <button className="btn btn-ghost btn-icon" onClick={onClose} aria-label="Close" style={{ height: 36, width: 36 }}>
          <I.X size={18}/>
        </button>
      }/>

      {last && (
        <div style={{ padding: '14px 16px 4px' }}>
          <div style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'hsl(var(--muted-foreground))', marginBottom: 8 }}>
            Repeat last
          </div>
          <button
            onClick={() => onPick(last.category, last)}
            className="card"
            style={{
              width: '100%', padding: 14, textAlign: 'left', cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: 12,
              background: 'hsl(var(--accent))',
              borderColor: 'hsl(var(--border))',
            }}
          >
            <div style={{
              width: 38, height: 38, borderRadius: 10,
              background: `hsl(${CATEGORIES[last.category].color} / 0.18)`,
              color: `hsl(${CATEGORIES[last.category].color})`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <I.History size={16}/>
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 14, fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {entrySubtitle(last)}
              </div>
              <div style={{ fontSize: 12, color: 'hsl(var(--muted-foreground))', marginTop: 1 }}>
                {CATEGORIES[last.category].label} &middot; pre-fills the form
              </div>
            </div>
            <I.ChevronRight size={16} style={{ color: 'hsl(var(--muted-foreground))' }}/>
          </button>
        </div>
      )}

      <div style={{ padding: '14px 16px 4px' }}>
        <div style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'hsl(var(--muted-foreground))' }}>
          {last ? 'Or pick a category' : 'What kind of expense?'}
        </div>
      </div>
      <div style={{ padding: '8px 16px 24px', display: 'flex', flexDirection: 'column', gap: 8 }}>
        {sorted.map(c => {
          const IconComp = I[c.icon]
          const color = CATEGORIES[c.id].color
          const count = counts[c.id] || 0
          return (
            <button
              key={c.id}
              onClick={() => onPick(c.id)}
              className="card"
              style={{
                padding: 14, textAlign: 'left', cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: 14,
              }}
            >
              <div style={{
                width: 40, height: 40, borderRadius: 10,
                background: `hsl(${color} / 0.12)`,
                color: `hsl(${color})`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
              }}>
                <IconComp size={18}/>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 15, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8 }}>
                  {c.label}
                  {count > 0 && (
                    <span style={{
                      fontSize: 11, fontWeight: 500,
                      padding: '1px 7px', borderRadius: 999,
                      background: `hsl(${color} / 0.14)`,
                      color: `hsl(${color})`,
                    }}>
                      {count} today
                    </span>
                  )}
                </div>
                <div style={{ fontSize: 12, color: 'hsl(var(--muted-foreground))', marginTop: 1 }}>{c.desc}</div>
              </div>
              <I.ChevronRight size={16} style={{ color: 'hsl(var(--muted-foreground))' }}/>
            </button>
          )
        })}
      </div>
    </div>
  )
}

function CategoryForm({ project, category, prefill, onBack, onClose, onSubmit }) {
  const plots = SEED.plotsByProject[project.id]
  const pre = prefill && prefill.category === category ? prefill : null
  const [plotId, setPlotId] = useState(pre ? pre.plot_id : (category === 'general' ? plots.find(p => p.name === 'Site-wide')?.id : ''))
  const [paymentMode, setPaymentMode] = useState(pre ? pre.payment_mode : 'cash')
  const [photo, setPhoto] = useState(false)
  const [notes, setNotes] = useState('')

  const preD = pre ? pre.details : {}
  const [workerTypeId, setWorkerTypeId] = useState(preD.worker_type_id || '')
  const [workerCount, setWorkerCount] = useState(preD.worker_count || 1)
  const [wage, setWage] = useState(preD.wage_per_worker ? String(preD.wage_per_worker) : '')
  const [wageOverridden, setWageOverridden] = useState(!!preD.wage_overridden)

  const [operatorId, setOperatorId] = useState(preD.operator_id || '')
  const [hours, setHours] = useState(preD.hours ? String(preD.hours) : '')
  const [hourlyRate, setHourlyRate] = useState(preD.hourly_rate ? String(preD.hourly_rate) : '')

  const [contractorId, setContractorId] = useState(preD.contractor_id || '')
  const [fee, setFee] = useState(preD.fee ? String(preD.fee) : '')
  const [tip, setTip] = useState(preD.tip ? String(preD.tip) : '')

  const [workType, setWorkType] = useState(preD.work_type || '')
  const [paymentStage, setPaymentStage] = useState(preD.payment_stage || 'running')
  const [amount, setAmount] = useState(preD.amount ? String(preD.amount) : '')

  const [description, setDescription] = useState(preD.description || '')

  const [openSelect, setOpenSelect] = useState(null)
  const [errors, setErrors] = useState({})

  const cat = CATEGORIES[category]
  const plotName = plots.find(p => p.id === plotId)?.name

  const total = useMemo(() => {
    if (category === 'nmr') return workerCount * (parseFloat(wage) || 0)
    if (category === 'jcb') return (parseFloat(hours) || 0) * (parseFloat(hourlyRate) || 0)
    if (category === 'contractor_fee') return (parseFloat(fee) || 0) + (parseFloat(tip) || 0)
    if (category === 'labor_contract') return parseFloat(amount) || 0
    if (category === 'general') return parseFloat(amount) || 0
    return 0
  }, [category, workerCount, wage, hours, hourlyRate, fee, tip, amount])

  const onPickWorkerType = (id) => {
    setWorkerTypeId(id)
    const wt = SEED.workerTypes.find(w => w.id === id)
    if (wt) { setWage(String(wt.default_wage)); setWageOverridden(false) }
  }
  const onPickOperator = (id) => {
    setOperatorId(id)
    const op = SEED.jcbOperators.find(o => o.id === id)
    if (op && op.default_hourly_rate) setHourlyRate(String(op.default_hourly_rate))
  }

  const validate = () => {
    const errs = {}
    if (!plotId) errs.plot = 'Required'
    if (category === 'nmr') {
      if (!workerTypeId) errs.workerType = 'Required'
      if (!wage || parseFloat(wage) <= 0) errs.wage = 'Required'
    }
    if (category === 'jcb') {
      if (!operatorId) errs.operator = 'Required'
      if (!hours || parseFloat(hours) < 0.5) errs.hours = 'Min 0.5'
      if (!hourlyRate || parseFloat(hourlyRate) <= 0) errs.rate = 'Required'
    }
    if (category === 'contractor_fee') {
      if (!contractorId) errs.contractor = 'Required'
      if (!fee || parseFloat(fee) <= 0) errs.fee = 'Required'
    }
    if (category === 'labor_contract') {
      if (!contractorId) errs.contractor = 'Required'
      if (!workType) errs.workType = 'Required'
      if (!amount || parseFloat(amount) <= 0) errs.amount = 'Required'
    }
    if (category === 'general') {
      if (!description.trim()) errs.description = 'Required'
      if (!amount || parseFloat(amount) <= 0) errs.amount = 'Required'
    }
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const submit = () => {
    if (!validate()) return
    let details = {}
    if (category === 'nmr') details = { worker_type_id: workerTypeId, worker_count: workerCount, wage_per_worker: parseFloat(wage), wage_overridden: wageOverridden }
    else if (category === 'jcb') details = { operator_id: operatorId, hours: parseFloat(hours), hourly_rate: parseFloat(hourlyRate) }
    else if (category === 'contractor_fee') details = { contractor_id: contractorId, fee: parseFloat(fee), tip: parseFloat(tip) || 0 }
    else if (category === 'labor_contract') details = { contractor_id: contractorId, work_type: workType, amount: parseFloat(amount), payment_stage: paymentStage }
    else if (category === 'general') details = { description: description.trim(), amount: parseFloat(amount) }

    onSubmit({
      category, plot_id: plotId, total_amount: total, payment_mode: paymentMode,
      photo_url: photo ? '/mock-receipt.jpg' : null, notes: notes.trim() || null, details,
    })
  }

  const contractorOptions = (() => {
    if (category === 'contractor_fee') return SEED.contractors.filter(c => c.type === 'daily_fee' || c.type === 'both')
    if (category === 'labor_contract') return SEED.contractors.filter(c => c.type === 'labor_contract' || c.type === 'both')
    return []
  })()

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <TopBar
        title={cat.label}
        onBack={onBack}
        right={
          <button className="btn btn-ghost btn-icon" onClick={onClose} aria-label="Close" style={{ height: 36, width: 36 }}>
            <I.X size={18}/>
          </button>
        }
      />
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px 18px 24px', display: 'flex', flexDirection: 'column', gap: 14 }}>

        <SelectField
          label="Plot"
          value={plotName}
          placeholder="Select plot"
          onClick={() => setOpenSelect('plot')}
          error={errors.plot}
        />

        {category === 'nmr' && (
          <>
            <SelectField
              label="Worker type"
              value={SEED.workerTypes.find(w => w.id === workerTypeId)?.name}
              placeholder="Select type"
              onClick={() => setOpenSelect('workerType')}
              error={errors.workerType}
            />
            <Field label="Number of workers">
              <Stepper value={workerCount} onChange={setWorkerCount} min={1} max={200}/>
            </Field>
            <Field label="Wage per worker" hint={wageOverridden ? '(overridden)' : '(from master)'}>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'hsl(var(--muted-foreground))', pointerEvents: 'none' }}>\u20b9</span>
                <Input
                  type="number"
                  inputMode="decimal"
                  value={wage}
                  onChange={e => { setWage(e.target.value); setWageOverridden(true) }}
                  style={{ paddingLeft: 24 }}
                  error={errors.wage}
                />
              </div>
            </Field>
          </>
        )}

        {category === 'jcb' && (
          <>
            <SelectField
              label="Operator"
              value={SEED.jcbOperators.find(o => o.id === operatorId)?.name}
              placeholder="Select operator"
              onClick={() => setOpenSelect('operator')}
              error={errors.operator}
            />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <Field label="Hours" error={errors.hours}>
                <Input type="number" inputMode="decimal" step="0.5" placeholder="0.0" value={hours} onChange={e => setHours(e.target.value)} error={errors.hours}/>
              </Field>
              <Field label="Hourly rate" error={errors.rate}>
                <div style={{ position: 'relative' }}>
                  <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'hsl(var(--muted-foreground))', pointerEvents: 'none' }}>\u20b9</span>
                  <Input type="number" inputMode="decimal" value={hourlyRate} onChange={e => setHourlyRate(e.target.value)} style={{ paddingLeft: 24 }} error={errors.rate}/>
                </div>
              </Field>
            </div>
          </>
        )}

        {category === 'contractor_fee' && (
          <>
            <SelectField
              label="Contractor"
              value={contractorOptions.find(c => c.id === contractorId)?.name}
              placeholder="Select contractor"
              onClick={() => setOpenSelect('contractor')}
              error={errors.contractor}
            />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <Field label="Fee" error={errors.fee}>
                <div style={{ position: 'relative' }}>
                  <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'hsl(var(--muted-foreground))', pointerEvents: 'none' }}>\u20b9</span>
                  <Input type="number" inputMode="decimal" value={fee} onChange={e => setFee(e.target.value)} style={{ paddingLeft: 24 }} error={errors.fee}/>
                </div>
              </Field>
              <Field label="Tip" hint="optional">
                <div style={{ position: 'relative' }}>
                  <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'hsl(var(--muted-foreground))', pointerEvents: 'none' }}>\u20b9</span>
                  <Input type="number" inputMode="decimal" placeholder="0" value={tip} onChange={e => setTip(e.target.value)} style={{ paddingLeft: 24 }}/>
                </div>
              </Field>
            </div>
          </>
        )}

        {category === 'labor_contract' && (
          <>
            <SelectField
              label="Contractor"
              value={contractorOptions.find(c => c.id === contractorId)?.name}
              placeholder="Select contractor"
              onClick={() => setOpenSelect('contractor')}
              error={errors.contractor}
            />
            <SelectField
              label="Work type"
              value={workType}
              placeholder="Select work"
              onClick={() => setOpenSelect('workType')}
              error={errors.workType}
            />
            <Field label="Payment stage">
              <Segmented
                options={[
                  { value: 'advance', label: 'Advance' },
                  { value: 'running', label: 'Running' },
                  { value: 'final', label: 'Final' },
                  { value: 'other', label: 'Other' },
                ]}
                value={paymentStage} onChange={setPaymentStage}
              />
            </Field>
            <Field label="Amount" error={errors.amount}>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'hsl(var(--muted-foreground))', pointerEvents: 'none' }}>\u20b9</span>
                <Input type="number" inputMode="decimal" value={amount} onChange={e => setAmount(e.target.value)} style={{ paddingLeft: 24 }} error={errors.amount}/>
              </div>
            </Field>
          </>
        )}

        {category === 'general' && (
          <>
            <Field label="Description" error={errors.description}>
              <Input placeholder="e.g., Cement bags - 10 nos" value={description} onChange={e => setDescription(e.target.value)} error={errors.description}/>
            </Field>
            <Field label="Amount" error={errors.amount}>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'hsl(var(--muted-foreground))', pointerEvents: 'none' }}>\u20b9</span>
                <Input type="number" inputMode="decimal" value={amount} onChange={e => setAmount(e.target.value)} style={{ paddingLeft: 24 }} error={errors.amount}/>
              </div>
            </Field>
          </>
        )}

        {(category === 'nmr' || category === 'jcb' || category === 'contractor_fee') && (
          <div style={{
            padding: '12px 14px',
            background: 'hsl(var(--muted))',
            borderRadius: 10,
            display: 'flex', alignItems: 'baseline', justifyContent: 'space-between',
          }}>
            <span style={{ fontSize: 13, color: 'hsl(var(--muted-foreground))' }}>Total</span>
            <span className="tabular" style={{ fontSize: 20, fontWeight: 600, letterSpacing: '-0.01em' }}>
              {formatINRFull(total)}
            </span>
          </div>
        )}

        <Field label="Payment mode">
          <Segmented options={PAY_MODES} value={paymentMode} onChange={setPaymentMode}/>
        </Field>

        <button
          type="button"
          onClick={() => setPhoto(p => !p)}
          className="card"
          style={{
            padding: 12, textAlign: 'left', cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: 12,
            background: photo ? 'hsl(var(--accent))' : 'hsl(var(--card))',
          }}
        >
          <div style={{
            width: 36, height: 36, borderRadius: 8,
            background: photo ? 'hsl(var(--success) / 0.15)' : 'hsl(var(--muted))',
            color: photo ? 'hsl(var(--success))' : 'hsl(var(--muted-foreground))',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            {photo ? <I.Check size={16}/> : <I.Camera size={16}/>}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 14, fontWeight: 500 }}>{photo ? 'Receipt attached' : 'Add receipt photo'}</div>
            <div style={{ fontSize: 12, color: 'hsl(var(--muted-foreground))' }}>{photo ? 'Tap to remove' : 'Optional \u00b7 uploads in background'}</div>
          </div>
        </button>

        <Field label="Notes" hint="optional">
          <textarea
            className="textarea"
            placeholder="Any context for the owner\u2026"
            value={notes}
            onChange={e => setNotes(e.target.value)}
            rows={2}
          />
        </Field>
      </div>

      <div style={{
        padding: '12px 16px',
        borderTop: '1px solid hsl(var(--border))',
        background: 'hsl(var(--background))',
        display: 'flex', alignItems: 'center', gap: 12,
        flexShrink: 0,
      }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 11, color: 'hsl(var(--muted-foreground))', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Total</div>
          <div className="tabular" style={{ fontSize: 18, fontWeight: 600, letterSpacing: '-0.01em' }}>{formatINRFull(total)}</div>
        </div>
        <Button variant="primary" size="lg" onClick={submit} style={{ minWidth: 140 }}>
          <I.Check size={16}/>
          Save expense
        </Button>
      </div>

      <SelectSheet
        open={openSelect === 'plot'} title="Select plot"
        options={plots.map(p => ({ value: p.id, label: p.name }))}
        value={plotId} onChange={setPlotId} onClose={() => setOpenSelect(null)}
      />
      <SelectSheet
        open={openSelect === 'workerType'} title="Worker type"
        options={SEED.workerTypes.map(w => ({ value: w.id, label: w.name, hint: '\u20b9' + w.default_wage }))}
        value={workerTypeId}
        onChange={onPickWorkerType}
        onClose={() => setOpenSelect(null)}
        renderOption={(o) => (
          <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', gap: 12 }}>
            <span>{o.label}</span>
            <span className="tabular" style={{ color: 'hsl(var(--muted-foreground))', fontSize: 13 }}>{o.hint}/day</span>
          </span>
        )}
      />
      <SelectSheet
        open={openSelect === 'operator'} title="Operator"
        options={SEED.jcbOperators.map(o => ({ value: o.id, label: o.name, hint: '\u20b9' + o.default_hourly_rate }))}
        value={operatorId}
        onChange={onPickOperator}
        onClose={() => setOpenSelect(null)}
        renderOption={(o) => (
          <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', gap: 12 }}>
            <span>{o.label}</span>
            <span className="tabular" style={{ color: 'hsl(var(--muted-foreground))', fontSize: 13 }}>{o.hint}/hr</span>
          </span>
        )}
      />
      <SelectSheet
        open={openSelect === 'contractor'} title="Contractor"
        options={contractorOptions.map(c => ({ value: c.id, label: c.name }))}
        value={contractorId} onChange={setContractorId} onClose={() => setOpenSelect(null)}
      />
      <SelectSheet
        open={openSelect === 'workType'} title="Work type"
        options={SEED.workTypes.map(w => ({ value: w, label: w }))}
        value={workType} onChange={setWorkType} onClose={() => setOpenSelect(null)}
      />
    </div>
  )
}

export default function AddExpenseSheet({ project, onClose, onSubmit, todayEntries = [] }) {
  const [step, setStep] = useState('pick')
  const [category, setCategory] = useState(null)
  const [prefill, setPrefill] = useState(null)

  const pickCategory = (c, pre = null) => {
    setCategory(c)
    setPrefill(pre)
    setStep('form')
  }

  return (
    <div className="sheet">
      {step === 'pick' ? (
        <CategoryPicker onClose={onClose} onPick={pickCategory} todayEntries={todayEntries}/>
      ) : (
        <CategoryForm
          project={project}
          category={category}
          prefill={prefill}
          onBack={() => { setStep('pick'); setCategory(null); setPrefill(null) }}
          onClose={onClose}
          onSubmit={onSubmit}
        />
      )}
    </div>
  )
}
