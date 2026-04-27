import { useState, useEffect, useCallback } from 'react'
import { supabase } from './supabase'

export function useEntries(projectId) {
  const [entries, setEntries] = useState([])
  const [loading, setLoading] = useState(true)

  // Fetch all entries for the project
  useEffect(() => {
    if (!projectId) {
      setEntries([])
      setLoading(false)
      return
    }

    let cancelled = false

    async function fetch() {
      setLoading(true)
      const { data, error } = await supabase
        .from('entries')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: false })

      if (!cancelled) {
        setEntries(data || [])
        setLoading(false)
      }
    }

    fetch()

    // Realtime subscription
    const channel = supabase
      .channel(`entries:${projectId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'entries',
          filter: `project_id=eq.${projectId}`,
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setEntries(prev => {
              if (prev.some(e => e.id === payload.new.id)) return prev
              return [payload.new, ...prev]
            })
          } else if (payload.eventType === 'DELETE') {
            setEntries(prev => prev.filter(e => e.id !== payload.old.id))
          } else if (payload.eventType === 'UPDATE') {
            setEntries(prev => prev.map(e => e.id === payload.new.id ? payload.new : e))
          }
        }
      )
      .subscribe()

    return () => {
      cancelled = true
      supabase.removeChannel(channel)
    }
  }, [projectId])

  const addEntry = useCallback(async (entryData) => {
    const { data, error } = await supabase
      .from('entries')
      .insert(entryData)
      .select()
      .single()

    if (error) throw error
    return data
  }, [])

  const deleteEntry = useCallback(async (id) => {
    const { error } = await supabase
      .from('entries')
      .delete()
      .eq('id', id)

    if (error) throw error
  }, [])

  return { entries, loading: loading, addEntry, deleteEntry }
}
