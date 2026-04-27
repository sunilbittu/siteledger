import React, { useState } from 'react'
import { I } from './components/icons'
import { Toast } from './components/ui'
import { SEED, SEED_ENTRIES, HISTORY_PAST } from './data/seed'
import LoginScreen from './screens/LoginScreen'
import ChangePasswordScreen from './screens/ChangePasswordScreen'
import ProjectPickerScreen from './screens/ProjectPickerScreen'
import HomeScreen from './screens/HomeScreen'
import AddExpenseSheet from './screens/AddExpenseSheet'
import EntryDetailScreen from './screens/EntryDetailScreen'
import HistoryScreen from './screens/HistoryScreen'

export default function App() {
  const [route, setRoute] = useState('login')
  const [projectId, setProjectId] = useState(null)
  const [entries, setEntries] = useState(SEED_ENTRIES)
  const [historyEntries] = useState(HISTORY_PAST)
  const [selectedEntry, setSelectedEntry] = useState(null)
  const [syncingIds, setSyncingIds] = useState(new Set())
  const [toast, setToast] = useState(null)
  const [forceChange, setForceChange] = useState(false)

  const project = SEED.projects.find(p => p.id === projectId)
  const todayEntries = entries.filter(e => e.entry_date === '2026-04-26')
  const allEntries = [...todayEntries, ...historyEntries]

  const showToast = (msg, icon) => {
    setToast({ msg, icon })
    setTimeout(() => setToast(null), 1800)
  }

  const handleLogin = () => {
    if (forceChange) {
      setRoute('change-pwd')
    } else {
      setRoute('picker')
    }
  }

  const handleChangePwd = () => {
    setForceChange(false)
    setRoute('picker')
  }

  const handleLogout = () => {
    setProjectId(null)
    setRoute('login')
  }

  const handlePickProject = (id) => {
    setProjectId(id)
    setRoute('home')
  }

  const handleAddEntry = (data) => {
    const id = 'e-' + Date.now()
    const now = new Date(2026, 3, 26, 12, 14, 0)
    const newEntry = {
      id,
      project_id: projectId,
      ...data,
      entry_date: '2026-04-26',
      created_by: SEED.user.id,
      created_by_name: SEED.user.name,
      created_at: now,
      locked_at: new Date(now.getTime() + 24 * 3600 * 1000),
    }
    setEntries(prev => [newEntry, ...prev])
    setSyncingIds(prev => new Set(prev).add(id))
    setRoute('home')
    showToast('Expense logged', <I.Check size={16}/>)
    setTimeout(() => {
      setSyncingIds(prev => {
        const next = new Set(prev)
        next.delete(id)
        return next
      })
    }, 1500)
  }

  const handleOpenEntry = (entry) => {
    setSelectedEntry(entry)
    setRoute('detail')
  }

  const handleDeleteEntry = () => {
    setEntries(prev => prev.filter(e => e.id !== selectedEntry.id))
    setRoute('home')
    showToast('Entry deleted', <I.Trash size={16}/>)
  }

  const renderContent = () => {
    if (route === 'login') return <LoginScreen onLogin={handleLogin}/>
    if (route === 'change-pwd') return <ChangePasswordScreen onDone={handleChangePwd}/>
    if (route === 'picker') return <ProjectPickerScreen onPick={handlePickProject} onLogout={handleLogout}/>
    if (!project) return null

    return (
      <>
        <HomeScreen
          project={project}
          entries={todayEntries}
          onAddExpense={() => setRoute('add')}
          onOpenEntry={handleOpenEntry}
          onSwitchProject={() => setRoute('picker')}
          onGoHistory={() => setRoute('history')}
          syncingIds={syncingIds}
        />
        {route === 'add' && (
          <>
            <div className="sheet-overlay" onClick={() => setRoute('home')}/>
            <AddExpenseSheet
              project={project}
              onClose={() => setRoute('home')}
              onSubmit={handleAddEntry}
              todayEntries={todayEntries}
            />
          </>
        )}
        {route === 'detail' && selectedEntry && (
          <>
            <div className="sheet-overlay" onClick={() => setRoute('home')}/>
            <EntryDetailScreen
              entry={selectedEntry}
              plots={SEED.plotsByProject[project.id]}
              onClose={() => setRoute('home')}
              onEdit={() => showToast('Edit flow (demo)')}
              onDelete={handleDeleteEntry}
            />
          </>
        )}
        {route === 'history' && (
          <>
            <div className="sheet-overlay" onClick={() => setRoute('home')}/>
            <HistoryScreen
              project={project}
              allEntries={allEntries}
              onBack={() => setRoute('home')}
              onOpenEntry={handleOpenEntry}
            />
          </>
        )}
      </>
    )
  }

  return (
    <div className="app-shell">
      <div className="app-content">
        {renderContent()}
        {toast && <Toast message={toast.msg} icon={toast.icon}/>}
      </div>
    </div>
  )
}
