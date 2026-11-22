'use client'

import { useCallback, useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Loader2, Search, Send, X } from 'lucide-react'
import { AUTHOR_LABELS, MESSAGE_MAX_LENGTH, formatMessageDate } from '@/lib/clientMessages'
import { formatListedAt, formatPrice } from '@/components/zone/useZoneData'

// Internal page for Lucie and Luca: write into a client's zone thread.
const AUTHORS = ['lucie', 'luca', 'team']

function useDebounced(value, ms = 300) {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), ms)
    return () => clearTimeout(timer)
  }, [value, ms])
  return debounced
}

function HousePreview({ house, onRemove }) {
  return (
    <div className="flex gap-3 rounded-lg border bg-white p-2" data-testid="admin-message-house">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      {house.image ? <img src={house.image} alt="" className="h-16 w-24 flex-shrink-0 rounded object-cover" /> : null}
      <div className="min-w-0 flex-1 text-sm">
        <p className="font-medium text-gray-900">{house.title}</p>
        <p className="text-gray-500">
          {[house.region, formatPrice(house.price, house.currency)].filter(Boolean).join(' · ')}
        </p>
        {house.listedAt ? <p className="text-xs text-gray-400">{formatListedAt(house.listedAt)}</p> : null}
      </div>
      {onRemove ? (
        <button type="button" onClick={onRemove} className="self-start text-gray-400 hover:text-gray-700" aria-label="Odebrat dům">
          <X className="h-4 w-4" />
        </button>
      ) : null}
    </div>
  )
}

export default function AdminMessagesPage() {
  const [clientQuery, setClientQuery] = useState('')
  const [clients, setClients] = useState([])
  const [clientsLoading, setClientsLoading] = useState(false)
  const [client, setClient] = useState(null)

  const [authorKind, setAuthorKind] = useState('lucie')
  const [body, setBody] = useState('')
  const [houseQuery, setHouseQuery] = useState('')
  const [houseResults, setHouseResults] = useState([])
  const [house, setHouse] = useState(null)

  const [history, setHistory] = useState([])
  const [historyLoading, setHistoryLoading] = useState(false)
  const [sending, setSending] = useState(false)
  const [notice, setNotice] = useState(null)
  const [error, setError] = useState('')

  const debouncedClientQuery = useDebounced(clientQuery)
  const debouncedHouseQuery = useDebounced(houseQuery)

  useEffect(() => {
    let cancelled = false
    setClientsLoading(true)
    fetch(`/api/admin/messages/clients?q=${encodeURIComponent(debouncedClientQuery.trim())}`, { cache: 'no-store' })
      .then((response) => response.json())
      .then((payload) => {
        if (!cancelled) setClients(Array.isArray(payload?.clients) ? payload.clients : [])
      })
      .catch(() => {
        if (!cancelled) setClients([])
      })
      .finally(() => {
        if (!cancelled) setClientsLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [debouncedClientQuery])

  useEffect(() => {
    const q = debouncedHouseQuery.trim()
    if (q.length < 2) {
      setHouseResults([])
      return
    }
    let cancelled = false
    fetch(`/api/admin/messages/properties?q=${encodeURIComponent(q)}`, { cache: 'no-store' })
      .then((response) => response.json())
      .then((payload) => {
        if (!cancelled) setHouseResults(Array.isArray(payload?.houses) ? payload.houses : [])
      })
      .catch(() => {
        if (!cancelled) setHouseResults([])
      })
    return () => {
      cancelled = true
    }
  }, [debouncedHouseQuery])

  const loadHistory = useCallback(async (clientId) => {
    setHistoryLoading(true)
    setError('')
    try {
      const response = await fetch(`/api/admin/messages?clientId=${encodeURIComponent(clientId)}`, { cache: 'no-store' })
      const payload = await response.json()
      if (!response.ok) throw new Error(payload?.error || 'Historii se nepodařilo načíst.')
      setHistory(Array.isArray(payload.messages) ? payload.messages : [])
    } catch (loadError) {
      setHistory([])
      setError(loadError.message)
    } finally {
      setHistoryLoading(false)
    }
  }, [])

  useEffect(() => {
    if (client) loadHistory(client.id)
    else setHistory([])
  }, [client, loadHistory])

  const send = async (event) => {
    event.preventDefault()
    if (!client || !body.trim() || sending) return
    setSending(true)
    setError('')
    setNotice(null)
    try {
      const response = await fetch('/api/admin/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clientId: client.id, authorKind, body, propertyId: house?.id || null })
      })
      const payload = await response.json()
      if (!response.ok) throw new Error(payload?.error || 'Zprávu se nepodařilo odeslat.')
      setHistory((previous) => [payload.message, ...previous])
      setBody('')
      setHouse(null)
      setHouseQuery('')
      setNotice(payload.notification === 'sent' ? 'Odesláno, klientovi přišel e-mail.' : 'Odesláno.')
    } catch (sendError) {
      setError(sendError.message)
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="space-y-6" data-testid="admin-messages">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Zprávy klientům</h1>
        <p className="text-gray-600">Zpráva se klientovi zobrazí v klientské zóně.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Nová zpráva</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700" htmlFor="client-search">Klient</label>
              {client ? (
                <div className="flex items-center justify-between rounded-lg border bg-gray-50 px-3 py-2" data-testid="admin-message-client">
                  <div className="min-w-0 text-sm">
                    <p className="font-medium text-gray-900">{client.name || client.email}</p>
                    {client.name ? <p className="truncate text-gray-500">{client.email}</p> : null}
                  </div>
                  <Button type="button" variant="outline" size="sm" onClick={() => setClient(null)}>Změnit</Button>
                </div>
              ) : (
                <>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                    <Input
                      id="client-search"
                      value={clientQuery}
                      onChange={(event) => setClientQuery(event.target.value)}
                      placeholder="Jméno nebo e-mail"
                      className="pl-9"
                    />
                  </div>
                  <div className="max-h-64 divide-y overflow-y-auto rounded-lg border">
                    {clientsLoading ? (
                      <p className="flex items-center gap-2 px-3 py-2 text-sm text-gray-500"><Loader2 className="h-4 w-4 animate-spin" /> Hledám…</p>
                    ) : clients.length === 0 ? (
                      <p className="px-3 py-2 text-sm text-gray-500">Nikdo nenalezen.</p>
                    ) : (
                      clients.map((item) => (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => setClient(item)}
                          className="block w-full px-3 py-2 text-left text-sm hover:bg-gray-50"
                        >
                          <span className="font-medium text-gray-900">{item.name || item.email}</span>
                          {item.name ? <span className="ml-2 text-gray-500">{item.email}</span> : null}
                          {item.role === 'admin' ? <Badge variant="secondary" className="ml-2 text-xs">admin</Badge> : null}
                        </button>
                      ))
                    )}
                  </div>
                </>
              )}
            </div>

            <form onSubmit={send} className="space-y-5">
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-700">Píše</p>
                <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Píše">
                  {AUTHORS.map((kind) => (
                    <button
                      key={kind}
                      type="button"
                      role="radio"
                      aria-checked={authorKind === kind}
                      onClick={() => setAuthorKind(kind)}
                      className={`rounded-full border px-4 py-1.5 text-sm transition ${
                        authorKind === kind ? 'border-blue-600 bg-blue-600 text-white' : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      {AUTHOR_LABELS[kind]}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700" htmlFor="message-body">Zpráva</label>
                <textarea
                  id="message-body"
                  value={body}
                  onChange={(event) => setBody(event.target.value)}
                  maxLength={MESSAGE_MAX_LENGTH}
                  rows={6}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700" htmlFor="house-search">Připojit dům (nepovinné)</label>
                {house ? (
                  <HousePreview house={house} onRemove={() => setHouse(null)} />
                ) : (
                  <>
                    <Input
                      id="house-search"
                      value={houseQuery}
                      onChange={(event) => setHouseQuery(event.target.value)}
                      placeholder="Název nebo region"
                    />
                    {houseResults.length > 0 ? (
                      <div className="max-h-72 space-y-2 overflow-y-auto">
                        {houseResults.map((item) => (
                          <button key={item.id} type="button" onClick={() => setHouse(item)} className="block w-full text-left">
                            <HousePreview house={item} />
                          </button>
                        ))}
                      </div>
                    ) : null}
                  </>
                )}
              </div>

              {error ? <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">{error}</p> : null}
              {notice ? <p className="rounded-md bg-green-50 px-3 py-2 text-sm text-green-800">{notice}</p> : null}

              <Button type="submit" disabled={!client || !body.trim() || sending}>
                {sending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
                Odeslat
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Historie</CardTitle>
          </CardHeader>
          <CardContent>
            {!client ? (
              <p className="text-sm text-gray-500">Vyberte klienta.</p>
            ) : historyLoading ? (
              <p className="flex items-center gap-2 text-sm text-gray-500"><Loader2 className="h-4 w-4 animate-spin" /> Načítám…</p>
            ) : history.length === 0 ? (
              <p className="text-sm text-gray-500">Zatím žádné zprávy.</p>
            ) : (
              <ul className="space-y-4" data-testid="admin-message-history">
                {history.map((message) => {
                  const fromClient = message.authorKind === 'client'
                  return (
                    <li key={message.id} className={`rounded-lg border p-3 ${fromClient ? 'bg-amber-50' : 'bg-white'}`}>
                      <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-gray-500">
                        <span className="font-medium text-gray-800">{fromClient ? 'Klient' : AUTHOR_LABELS[message.authorKind]}</span>
                        <span>
                          {formatMessageDate(message.createdAt)}
                          {fromClient ? null : message.readAt ? ' · přečteno' : ' · nepřečteno'}
                        </span>
                      </div>
                      <p className="mt-2 whitespace-pre-line break-words text-sm text-gray-800">{message.body}</p>
                      {message.house ? (
                        <div className="mt-2"><HousePreview house={message.house} /></div>
                      ) : message.propertyId ? (
                        <p className="mt-2 text-xs text-gray-400">Dům už není v nabídce ({message.propertyId})</p>
                      ) : null}
                    </li>
                  )
                })}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
