import React, { useState } from 'react'
import { I } from './components/icons'
import { Toast } from './components/ui'
import { useData } from './lib/DataContext'
import { useEntries } from './lib/useEntries'
import LoginScreen from './screens/LoginScreen'
import ChangePasswordScreen from './screens/ChangePasswordScreen'
import ProjectPickerScreen from './screens/ProjectPickerScreen'
import HomeScreen from './screens/HomeScreen'
import AddExpenseSheet from './screens/AddExpenseSheet'
import EntryDetailScreen from './screens/EntryDetailScreen'
import HistoryScreen from './screens/HistoryScreen'
import AdminDashboard from './screens/AdminDashboard'

export default function App() {
  const { session, user, projects, plotsByProject, loading, signOut } = useData()

  const [route, setRoute] = useState('login')
  const [projectId, setProjectId] = useState(null)
  const [selectedEntry, setSelectedEntry] = useState(null)
  const [toast, setToast] = useState(null)

  const { entries, addEntry, deleteEntry } = useEntries(projectId)

  const project = projects.find(p => p.id === projectId)
  const today = new Date().toISOString().split('T')[0]
  const todayEntries = entries.filter(e => e.entry_date === today)
  const allEntries = entries

  const showToast = (msg, icon) => {
    setToast({ msg, icon })
    setTimeout(() => setToast(null), 1800)
  }

  // Auth routing
  if (loading || session === undefined) {
    return (
      <div className="app-shell">
        <div className="app-content" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <span className="spinner"/>
        </div>
      </div>
    )
  }

  if (!session) {
    return (
      <div className="app-shell">
        <div className="app-content">
          <LoginScreen onLogin={() => {/* session will update via listener */}}/>
          {toast && <Toast message={toast.msg} icon={toast.icon}/>}
        </div>
      </div>
    )
  }

  const handleLogout = async () => {
    setProjectId(null)
    setRoute('picker')
    await signOut()
  }

  // Global logout header for all authenticated screens
  const LogoutHeader = () => (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '8px 16px', borderBottom: '1px solid hsl(var(--border))',
      background: 'hsl(var(--background))', flexShrink: 0,
    }}>
      <div style={{ fontSize: 13, color: 'hsl(var(--muted-foreground))' }}>
        {user?.name}
      </div>
      <button className="btn btn-ghost btn-sm" onClick={handleLogout} style={{ gap: 4, height: 32 }}>
        <I.LogOut size={14}/> Logout
      </button>
    </div>
  )

  if (user?.must_change_password) {
    return (
      <div className="app-shell">
        <LogoutHeader/>
        <div className="app-content">
          <ChangePasswordScreen onDone={() => {
            window.location.reload()
          }}/>
        </div>
      </div>
    )
  }

  // Admin dashboard
  if (user?.role === 'admin') {
    return (
      <div className="app-shell">
        <div className="app-content">
          <AdminDashboard onLogout={handleLogout}/>
          {toast && <Toast message={toast.msg} icon={toast.icon}/>}
        </div>
      </div>
    )
  }

  const handlePickProject = (id) => {
    setProjectId(id)
    setRoute('home')
  }

  const handleAddEntry = async (data) => {
    try {
      await addEntry({
        project_id: projectId,
        ...data,
        entry_date: today,
        created_by: user.id,
        created_by_name: user.name,
      })
      setRoute('home')
      showToast('Expense logged', <I.Check size={16}/>)
    } catch (err) {
      showToast('Error: ' + err.message, <I.AlertCircle size={16}/>)
    }
  }

  const handleOpenEntry = (entry) => {
    setSelectedEntry(entry)
    setRoute('detail')
  }

  const handleDeleteEntry = async () => {
    try {
      await deleteEntry(selectedEntry.id)
      setRoute('home')
      showToast('Entry deleted', <I.Trash size={16}/>)
    } catch (err) {
      showToast('Error: ' + err.message, <I.AlertCircle size={16}/>)
    }
  }

  if (route === 'picker' || !project) {
    return (
      <div className="app-shell">
        <LogoutHeader/>
        <div className="app-content">
          <ProjectPickerScreen onPick={handlePickProject}/>
          {toast && <Toast message={toast.msg} icon={toast.icon}/>}
        </div>
      </div>
    )
  }

  return (
    <div className="app-shell">
      <div className="app-content">
        <HomeScreen
          project={project}
          entries={todayEntries}
          onAddExpense={() => setRoute('add')}
          onOpenEntry={handleOpenEntry}
          onSwitchProject={() => setRoute('picker')}
          onGoHistory={() => setRoute('history')}
          onLogout={handleLogout}
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
              plots={plotsByProject[project.id] || []}
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
        {toast && <Toast message={toast.msg} icon={toast.icon}/>}
      </div>
    </div>
  )
}
