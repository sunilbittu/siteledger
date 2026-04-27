import React, { createContext, useContext, useState, useEffect } from 'react'
import { supabase } from './supabase'

const DataContext = createContext(null)

export function useData() {
  const ctx = useContext(DataContext)
  if (!ctx) throw new Error('useData must be used within DataProvider')
  return ctx
}

export function DataProvider({ children }) {
  const [session, setSession] = useState(undefined) // undefined = loading
  const [user, setUser] = useState(null)
  const [projects, setProjects] = useState([])
  const [plotsByProject, setPlotsByProject] = useState({})
  const [workerTypes, setWorkerTypes] = useState([])
  const [contractors, setContractors] = useState([])
  const [jcbOperators, setJcbOperators] = useState([])
  const [workTypes, setWorkTypes] = useState([])
  const [loading, setLoading] = useState(true)

  // Listen for auth changes
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })
    return () => subscription.unsubscribe()
  }, [])

  // When session changes, fetch profile + reference data
  useEffect(() => {
    if (session === undefined) return
    if (!session) {
      setUser(null)
      setProjects([])
      setPlotsByProject({})
      setWorkerTypes([])
      setContractors([])
      setJcbOperators([])
      setWorkTypes([])
      setLoading(false)
      return
    }

    let cancelled = false
    async function fetchAll() {
      setLoading(true)
      const [
        { data: profile },
        { data: projectRows },
        { data: plotRows },
        { data: wtRows },
        { data: cRows },
        { data: opRows },
        { data: wkRows },
      ] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', session.user.id).single(),
        supabase.from('projects').select('*'),
        supabase.from('plots').select('*'),
        supabase.from('worker_types').select('*'),
        supabase.from('contractors').select('*'),
        supabase.from('jcb_operators').select('*'),
        supabase.from('work_types').select('name').order('id'),
      ])

      if (cancelled) return

      setUser(profile)
      setProjects(projectRows || [])

      // Group plots by project
      const grouped = {}
      ;(plotRows || []).forEach(p => {
        if (!grouped[p.project_id]) grouped[p.project_id] = []
        grouped[p.project_id].push(p)
      })
      setPlotsByProject(grouped)

      setWorkerTypes(wtRows || [])
      setContractors(cRows || [])
      setJcbOperators(opRows || [])
      setWorkTypes((wkRows || []).map(w => w.name))
      setLoading(false)
    }

    fetchAll()
    return () => { cancelled = true }
  }, [session])

  const signOut = async () => {
    await supabase.auth.signOut()
  }

  const value = {
    session,
    user,
    projects,
    plotsByProject,
    workerTypes,
    contractors,
    jcbOperators,
    workTypes,
    loading,
    signOut,
  }

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>
}
