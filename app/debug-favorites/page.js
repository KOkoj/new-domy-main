'use client'

import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function DebugFavoritesPage() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(false)
  const [logs, setLogs] = useState([])
  const [favorites, setFavorites] = useState([])

  const addLog = (message, type = 'info') => {
    setLogs(prev => [...prev, { message, type, timestamp: new Date().toLocaleTimeString() }])
  }

  useEffect(() => {
    checkUser()
  }, [])

  const checkUser = async () => {
    const { data: { user }, error } = await supabase.auth.getUser()
    if (error) addLog(`Auth Error: ${error.message}`, 'error')
    if (user) {
      setUser(user)
      addLog(`User authenticated: ${user.id}`, 'success')
      loadFavoritesDirectly(user.id)
    } else {
      addLog('No user authenticated', 'warning')
    }
  }

  const loadFavoritesDirectly = async (userId) => {
    addLog('Attempting to fetch favorites via Supabase Client (Direct DB)...')
    // Try both snake_case and camelCase to see what exists
    
    // Try 1: snake_case (listing_id) - The fixed schema
    const { data: data1, error: error1 } = await supabase
      .from('favorites')
      .select('*')
      .eq('user_id', userId)
    
    if (error1) {
      addLog(`Direct DB Fetch (user_id/listing_id) Failed: ${error1.message}`, 'error')
      addLog(`Error Code: ${error1.code}, Details: ${error1.details}`, 'error')
    } else {
      addLog(`Direct DB Fetch (user_id/listing_id) Success: Found ${data1.length} items`, 'success')
      if (data1.length > 0) setFavorites(data1)
    }

    // Try 2: camelCase (userId/listingId) - The old schema
    if (error1) {
       addLog('Attempting fallback fetch with old schema (userId/listingId)...')
       const { data: data2, error: error2 } = await supabase
        .from('favorites')
        .select('*')
        .eq('userId', userId)
       
       if (error2) {
         addLog(`Direct DB Fetch (userId/listingId) Failed: ${error2.message}`, 'error')
       } else {
         addLog(`Direct DB Fetch (userId/listingId) Success: Found ${data2.length} items`, 'success')
         if (data2.length > 0) setFavorites(data2)
       }
    }
  }

  const testApiToggle = async () => {
    if (!user) return addLog('Login required', 'error')
    
    setLoading(true)
    const testId = `debug-prop-${Math.floor(Math.random() * 1000)}`
    addLog(`Testing API Toggle with property ID: ${testId}`)

    try {
      const response = await fetch('/api/favorites/toggle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ listingId: testId }),
      })

      const result = await response.json()
      
      if (!response.ok) {
        addLog(`API Error (${response.status}): ${result.error}`, 'error')
      } else {
        addLog(`API Success: Favorited=${result.favorited}`, 'success')
        // Reload direct to verify
        loadFavoritesDirectly(user.id)
      }
    } catch (err) {
      addLog(`Fetch Error: ${err.message}`, 'error')
    } finally {
      setLoading(false)
    }
  }

  const testDirectInsert = async () => {
    if (!user) return addLog('Login required', 'error')
    
    setLoading(true)
    const testId = `direct-prop-${Math.floor(Math.random() * 1000)}`
    addLog(`Testing Direct DB Insert with property ID: ${testId}`)

    // Try snake_case first
    const { error: error1 } = await supabase
      .from('favorites')
      .insert([{ user_id: user.id, listing_id: testId }])

    if (error1) {
      addLog(`Direct Insert (user_id/listing_id) Failed: ${error1.message}`, 'error')
      
      // Try camelCase fallback
      const { error: error2 } = await supabase
        .from('favorites')
        .insert([{ userId: user.id, listingId: testId }])
        
      if (error2) {
        addLog(`Direct Insert (userId/listingId) Failed: ${error2.message}`, 'error')
      } else {
        addLog('Direct Insert (userId/listingId) Succeeded', 'success')
        loadFavoritesDirectly(user.id)
      }
    } else {
      addLog('Direct Insert (user_id/listing_id) Succeeded', 'success')
      loadFavoritesDirectly(user.id)
    }
    setLoading(false)
  }

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">Favorites Debugger</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Actions</CardTitle>
        </CardHeader>
        <CardContent className="space-x-4">
          <Button onClick={checkUser} variant="outline">Refresh Session</Button>
          <Button onClick={testApiToggle} disabled={loading || !user}>Test API Toggle</Button>
          <Button onClick={testDirectInsert} disabled={loading || !user} variant="secondary">Test Direct DB Insert</Button>
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle>Logs</CardTitle></CardHeader>
          <CardContent className="h-96 overflow-y-auto bg-slate-950 text-slate-50 font-mono text-xs p-4 rounded">
            {logs.length === 0 && <span className="text-slate-500">No logs yet...</span>}
            {logs.map((log, i) => (
              <div key={i} className={`mb-1 ${
                log.type === 'error' ? 'text-red-400' : 
                log.type === 'success' ? 'text-green-400' : 
                log.type === 'warning' ? 'text-yellow-400' : 'text-slate-300'
              }`}>
                <span className="text-slate-500">[{log.timestamp}]</span> {log.message}
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Current Favorites in DB</CardTitle></CardHeader>
          <CardContent>
            <pre className="bg-slate-100 p-4 rounded text-xs overflow-auto h-96">
              {JSON.stringify(favorites, null, 2)}
            </pre>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
