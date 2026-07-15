'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Mail,
  Search,
  Clock,
  CheckCircle,
  XCircle,
  Send,
  UserX,
  Loader2,
  Users
} from 'lucide-react'
import { t } from '@/lib/translations'

const PAGE_SIZE = 25

const SOURCE_LABELS = {
  pdf_inspections: 'PDF: Prohlídky',
  pdf_mistakes: 'PDF: Chyby při koupi'
}

const STATUS_STYLES = {
  pending: 'bg-yellow-100 text-yellow-800',
  confirmed: 'bg-green-100 text-green-800',
  unsubscribed: 'bg-gray-100 text-gray-600'
}

export default function LeadManagement() {
  const [language, setLanguage] = useState('cs')
  const [leads, setLeads] = useState([])
  const [total, setTotal] = useState(0)
  const [statusCounts, setStatusCounts] = useState({ pending: 0, confirmed: 0, unsubscribed: 0 })
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [searchInput, setSearchInput] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [sourceFilter, setSourceFilter] = useState('all')
  const [page, setPage] = useState(1)

  useEffect(() => {
    const savedLanguage = localStorage.getItem('language') || 'cs'
    setLanguage(savedLanguage)

    const handleLanguageChange = (e) => {
      if (e.detail) setLanguage(e.detail)
      else if (e.newValue) setLanguage(e.newValue)
    }

    window.addEventListener('languageChange', handleLanguageChange)
    window.addEventListener('storage', handleLanguageChange)

    return () => {
      window.removeEventListener('languageChange', handleLanguageChange)
      window.removeEventListener('storage', handleLanguageChange)
    }
  }, [])

  // Debounce the search box so we don't hit the API on every keystroke.
  useEffect(() => {
    const timeout = setTimeout(() => {
      setSearchTerm(searchInput.trim())
      setPage(1)
    }, 400)
    return () => clearTimeout(timeout)
  }, [searchInput])

  const loadLeads = useCallback(async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({ page: String(page), pageSize: String(PAGE_SIZE) })
      if (statusFilter !== 'all') params.set('status', statusFilter)
      if (sourceFilter !== 'all') params.set('source', sourceFilter)
      if (searchTerm) params.set('search', searchTerm)

      const response = await fetch(`/api/admin/leads?${params.toString()}`)
      const payload = await response.json()

      if (!response.ok) {
        throw new Error(payload?.error || 'Failed to load leads')
      }

      setLeads(payload.leads || [])
      setTotal(payload.total || 0)
      setStatusCounts(payload.statusCounts || { pending: 0, confirmed: 0, unsubscribed: 0 })
    } catch (error) {
      console.error('Error loading leads:', error)
    } finally {
      setLoading(false)
    }
  }, [page, statusFilter, sourceFilter, searchTerm])

  useEffect(() => {
    loadLeads()
  }, [loadLeads])

  const runAction = async (leadId, action) => {
    if (action === 'unsubscribe' && !confirm(t('admin.leads.unsubscribeConfirm', language))) {
      return
    }

    setActionLoading(`${leadId}:${action}`)
    try {
      const response = await fetch('/api/admin/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ leadId, action })
      })
      const payload = await response.json()

      if (!response.ok) {
        throw new Error(payload?.error || 'Action failed')
      }

      if (action === 'resend') {
        alert(t('admin.leads.resendSuccess', language))
      } else {
        await loadLeads()
      }
    } catch (error) {
      console.error(`Error running lead action ${action}:`, error)
      const messageKey = action === 'resend' ? 'admin.leads.resendFailed' : 'admin.leads.unsubscribeFailed'
      alert(`${t(messageKey, language)}: ${error.message || 'Unknown error'}`)
    } finally {
      setActionLoading(null)
    }
  }

  const totalLeads = statusCounts.pending + statusCounts.confirmed + statusCounts.unsubscribed
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))

  const statusLabel = (status) => {
    switch (status) {
      case 'pending': return t('admin.leads.statusPending', language)
      case 'confirmed': return t('admin.leads.statusConfirmed', language)
      case 'unsubscribed': return t('admin.leads.statusUnsubscribed', language)
      default: return status
    }
  }

  const statCards = [
    { label: t('admin.leads.totalLeads', language), value: totalLeads, icon: Users, color: 'text-blue-600' },
    { label: t('admin.leads.statusPending', language), value: statusCounts.pending, icon: Clock, color: 'text-yellow-600' },
    { label: t('admin.leads.statusConfirmed', language), value: statusCounts.confirmed, icon: CheckCircle, color: 'text-green-600' },
    { label: t('admin.leads.statusUnsubscribed', language), value: statusCounts.unsubscribed, icon: XCircle, color: 'text-gray-500' }
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{t('admin.leads.title', language)}</h1>
          <p className="text-gray-600 mt-1">{t('admin.leads.subtitle', language)}</p>
        </div>
        <Button onClick={loadLeads}>
          <Mail className="h-4 w-4 mr-2" />
          {t('admin.leads.refresh', language)}
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {statCards.map((stat) => {
          const Icon = stat.icon
          return (
            <Card key={stat.label}>
              <CardContent className="p-4 text-center">
                <Icon className={`h-8 w-8 ${stat.color} mx-auto mb-2`} />
                <div className="text-2xl font-bold">{stat.value}</div>
                <div className="text-sm text-gray-600">{stat.label}</div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder={t('admin.leads.searchPlaceholder', language)}
                  className="pl-10"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                />
              </div>
            </div>
            <div className="w-full md:w-48">
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={statusFilter}
                onChange={(e) => { setStatusFilter(e.target.value); setPage(1) }}
              >
                <option value="all">{t('admin.leads.allStatuses', language)}</option>
                <option value="pending">{t('admin.leads.statusPending', language)}</option>
                <option value="confirmed">{t('admin.leads.statusConfirmed', language)}</option>
                <option value="unsubscribed">{t('admin.leads.statusUnsubscribed', language)}</option>
              </select>
            </div>
            <div className="w-full md:w-56">
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={sourceFilter}
                onChange={(e) => { setSourceFilter(e.target.value); setPage(1) }}
              >
                <option value="all">{t('admin.leads.allSources', language)}</option>
                {Object.entries(SOURCE_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Leads Table */}
      <Card>
        <CardHeader>
          <CardTitle>{t('admin.leads.title', language)} ({total})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="animate-pulse space-y-3">
              {[1, 2, 3, 4, 5].map(i => (
                <div key={i} className="h-16 bg-gray-200 rounded"></div>
              ))}
            </div>
          ) : leads.length > 0 ? (
            <div className="space-y-3">
              {leads.map((lead) => (
                <div key={lead.id} className="flex flex-col md:flex-row md:items-center md:justify-between p-4 border rounded-lg hover:bg-gray-50 gap-3">
                  <div className="flex items-center space-x-4 min-w-0">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center shrink-0">
                      <Mail className="h-5 w-5 text-blue-600" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center space-x-2 flex-wrap">
                        <h3 className="font-medium text-gray-900 truncate">{lead.email}</h3>
                        <Badge className={STATUS_STYLES[lead.status] || ''}>
                          {statusLabel(lead.status)}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {SOURCE_LABELS[lead.source] || lead.source}
                        </Badge>
                      </div>
                      <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1 flex-wrap">
                        <span>
                          {t('admin.leads.created', language)}: {lead.created_at ? new Date(lead.created_at).toLocaleDateString() : '—'}
                        </span>
                        {lead.confirmed_at && (
                          <span>
                            {t('admin.leads.confirmed', language)}: {new Date(lead.confirmed_at).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 shrink-0">
                    {lead.status === 'pending' && (
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={actionLoading === `${lead.id}:resend`}
                        onClick={() => runAction(lead.id, 'resend')}
                      >
                        {actionLoading === `${lead.id}:resend` ? (
                          <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                        ) : (
                          <Send className="h-4 w-4 mr-1" />
                        )}
                        {t('admin.leads.resendConfirmation', language)}
                      </Button>
                    )}
                    {lead.status !== 'unsubscribed' && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-red-600 hover:text-red-700"
                        disabled={actionLoading === `${lead.id}:unsubscribe`}
                        onClick={() => runAction(lead.id, 'unsubscribe')}
                      >
                        {actionLoading === `${lead.id}:unsubscribe` ? (
                          <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                        ) : (
                          <UserX className="h-4 w-4 mr-1" />
                        )}
                        {t('admin.leads.unsubscribe', language)}
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Mail className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">{t('admin.leads.noLeadsFound', language)}</h3>
              <p className="text-gray-600">{t('admin.leads.adjustFilters', language)}</p>
            </div>
          )}

          {/* Pagination */}
          {!loading && total > PAGE_SIZE && (
            <div className="flex items-center justify-between mt-6">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1}
                onClick={() => setPage(p => Math.max(1, p - 1))}
              >
                {t('admin.leads.previous', language)}
              </Button>
              <span className="text-sm text-gray-600">
                {t('admin.leads.pageOf', language)
                  .replace('{page}', String(page))
                  .replace('{totalPages}', String(totalPages))}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= totalPages}
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              >
                {t('admin.leads.next', language)}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
