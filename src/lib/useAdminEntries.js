import { useState, useEffect } from 'react'
import { supabase } from './supabase'

export function useAdminEntries(startDate, endDate) {
  const [entries, setEntries] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!startDate || !endDate) {
      setEntries([])
      return
    }

    let cancelled = false

    async function fetch() {
      setLoading(true)
      const { data, error } = await supabase
        .from('entries')
        .select('*')
        .gte('entry_date', startDate)
        .lte('entry_date', endDate)
        .order('entry_date', { ascending: false })
        .order('created_at', { ascending: false })

      if (!cancelled) {
        setEntries(data || [])
        setLoading(false)
      }
    }

    fetch()
    return () => { cancelled = true }
  }, [startDate, endDate])

  return { entries, loading }
}
