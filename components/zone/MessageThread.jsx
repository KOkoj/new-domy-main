'use client'

import { useEffect, useRef, useState } from 'react'
import { Heart } from 'lucide-react'
import { HouseRow } from './ZoneShell'
import { TeamAvatars } from './ZoneSidebar'
import { AUTHOR_LABELS, authorAvatar, formatMessageDate, isTeamAuthor } from '@/lib/clientMessages'

const MESSAGES_TIMEOUT_MS = 4000

// Last result, so moving around the zone renders the thread at once.
let lastMessages = null

async function fetchMessages(signal) {
  // Logged-out visitors are redirected to /login; don't fire a 401 meanwhile.
  if (typeof document !== 'undefined' && !/(?:^|;\s*)sb-[^=;]+-auth-token(?:\.\d+)?=/.test(document.cookie || '')) return []
  const response = await fetch('/api/zone/messages', { cache: 'no-store', credentials: 'same-origin', signal })
  if (!response.ok) return []
  const payload = await response.json()
  return Array.isArray(payload?.messages) ? payload.messages : []
}

// Loads independently of useZoneData (in parallel, own timeout), so a slow
// thread never holds the rest of the zone. Empty on any error / no table.
export function useZoneMessages() {
  const [state, setState] = useState(() => ({ loading: lastMessages === null, messages: lastMessages || [] }))

  useEffect(() => {
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), MESSAGES_TIMEOUT_MS)
    fetchMessages(controller.signal)
      .catch(() => lastMessages || [])
      .then((messages) => {
        lastMessages = messages
        setState({ loading: false, messages })
      })
      .finally(() => clearTimeout(timer))
    return () => {
      clearTimeout(timer)
      controller.abort()
    }
  }, [])

  return state
}

// Marks unread team messages as read once they were shown; the highlight
// stays for this visit so the client still sees what is new.
function useMarkRead(messages) {
  const sent = useRef(false)
  useEffect(() => {
    if (sent.current) return
    if (!messages.some((m) => isTeamAuthor(m.authorKind) && !m.readAt)) return
    sent.current = true
    fetch('/api/zone/messages/read', { method: 'POST', credentials: 'same-origin' })
      .then(() => {
        if (lastMessages) lastMessages = lastMessages.map((m) => (m.readAt ? m : { ...m, readAt: new Date().toISOString() }))
      })
      .catch(() => {})
  }, [messages])
}

function SaveHeart({ house, saved, onToggle }) {
  const [busy, setBusy] = useState(false)
  const toggle = async () => {
    if (busy) return
    setBusy(true)
    try {
      const response = await fetch('/api/favorites/toggle', {
        method: 'POST',
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ listingId: house.id })
      })
      if (response.ok) {
        const payload = await response.json()
        onToggle(house, Boolean(payload?.favorited))
      }
    } finally {
      setBusy(false)
    }
  }
  return (
    <button
      type="button"
      onClick={toggle}
      disabled={busy}
      aria-pressed={saved}
      aria-label={saved ? 'Odebrat z uložených' : 'Uložit dům'}
      className="absolute right-2.5 top-2.5 flex h-8 w-8 items-center justify-center rounded-full bg-white text-[#a8642f] transition hover:bg-[#fdf6ef] disabled:opacity-60"
      data-testid="zone-message-heart"
    >
      <Heart className="h-[18px] w-[18px]" fill={saved ? 'currentColor' : 'none'} strokeWidth={1.8} />
    </button>
  )
}

function TeamMessage({ message, savedIds, onToggleSaved, unread }) {
  return (
    <article
      className={`rounded-2xl border bg-white p-5 sm:p-6 ${unread ? 'border-[#e2c3a6]' : 'border-[#ebe5da]'}`}
      data-testid="zone-message"
      data-unread={unread ? 'true' : undefined}
    >
      <div className="flex items-center gap-3">
        <TeamAvatars who={authorAvatar(message.authorKind)} size={34} />
        <div className="min-w-0">
          <p className="flex items-center gap-2 text-[14px] text-[#1b2333]">
            {AUTHOR_LABELS[message.authorKind]}
            {unread ? <span className="h-2 w-2 rounded-full bg-[#c47a3d]" aria-label="Nepřečtené" title="Nepřečtené" /> : null}
          </p>
          <p className="text-[12px] text-gray-400">{formatMessageDate(message.createdAt)}</p>
        </div>
      </div>
      <p className="mt-4 whitespace-pre-line break-words text-[15px] leading-relaxed text-[#3a4252]">{message.body}</p>
      {message.house ? (
        <div className="relative mt-4">
          <HouseRow house={message.house} reserveRight />
          <SaveHeart house={message.house} saved={savedIds.has(message.house.id)} onToggle={onToggleSaved} />
        </div>
      ) : null}
    </article>
  )
}

function ClientMessage({ message }) {
  return (
    <article className="ml-auto max-w-[85%] rounded-2xl bg-[#efe8dc] px-5 py-4 sm:max-w-[75%]" data-testid="zone-message-client">
      <p className="text-[12px] text-gray-500">
        {AUTHOR_LABELS.client} · {formatMessageDate(message.createdAt)}
      </p>
      <p className="mt-1.5 whitespace-pre-line break-words text-[15px] leading-relaxed text-[#1b2333]">{message.body}</p>
    </article>
  )
}

export function MessageThreadSkeleton() {
  return (
    <div className="animate-pulse rounded-2xl border border-[#ebe5da] bg-white p-5 sm:p-6" data-testid="zone-messages-skeleton" aria-busy="true">
      <div className="flex items-center gap-3">
        <div className="h-[34px] w-[34px] rounded-full bg-[#f1ece3]" />
        <div className="h-4 w-28 rounded bg-[#f1ece3]" />
      </div>
      <div className="mt-4 h-4 w-3/4 rounded bg-[#f1ece3]" />
      <div className="mt-2 h-4 w-1/2 rounded bg-[#f1ece3]" />
    </div>
  )
}

// Newest first, like an archive (Figma "Zóna jako jedno vlákno").
export default function MessageThread({ messages, savedIds, onToggleSaved }) {
  const [unreadIds] = useState(() => new Set(messages.filter((m) => isTeamAuthor(m.authorKind) && !m.readAt).map((m) => m.id)))
  useMarkRead(messages)

  return (
    <div className="space-y-5" data-testid="zone-messages">
      {messages.map((message) =>
        isTeamAuthor(message.authorKind) ? (
          <TeamMessage
            key={message.id}
            message={message}
            savedIds={savedIds}
            onToggleSaved={onToggleSaved}
            unread={unreadIds.has(message.id)}
          />
        ) : (
          <ClientMessage key={message.id} message={message} />
        )
      )}
    </div>
  )
}
