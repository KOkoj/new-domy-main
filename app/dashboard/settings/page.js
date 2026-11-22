'use client'

import { useEffect, useState } from 'react'
import { KeyRound, Eye, EyeOff, CheckCircle, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { notifySiteAuthChanged } from '@/lib/siteAuthUser'
import { splitFullName } from '@/lib/profileName'
import { t } from '@/lib/translations'
import { resolveAuthClientMessage } from '@/lib/authMessages'
import { isValidNewPassword } from '@/lib/authInput'
import { DEFAULT_LANGUAGE, readLanguageFromBrowser } from '@/lib/userPreferences'
import ZoneBackLink from '@/components/zone/ZoneBackLink'
import ZoneShell, { ZoneSkeleton } from '@/components/zone/ZoneShell'
import { useZoneData } from '@/components/zone/useZoneData'

function getProviders(user) {
  const list = user?.app_metadata?.providers
  if (Array.isArray(list) && list.length > 0) return list
  return user?.app_metadata?.provider ? [user.app_metadata.provider] : []
}

function PasswordInput({ id, value, onChange, placeholder, autoComplete, visible, onToggle, toggleLabel }) {
  return (
    <div className="relative">
      <Input
        id={id}
        type={visible ? 'text' : 'password'}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        autoComplete={autoComplete}
        className="h-11 pr-12"
        required
      />
      <button
        type="button"
        className="absolute right-0 top-0 flex h-full min-w-[44px] items-center justify-center px-3 text-gray-400 hover:text-gray-600"
        onClick={onToggle}
        aria-label={toggleLabel}
      >
        {visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
      </button>
    </div>
  )
}

// Figma D: Jméno (profiles.first_name/last_name via /api/profile, which also
// updates the auth name shown in the header and the zone greeting).
function NameForm({ initialName, label, saveLabel, savingLabel, savedLabel, errorLabel, onSaved }) {
  const [name, setName] = useState(initialName)
  const [status, setStatus] = useState(null)

  const handleSubmit = async (event) => {
    event.preventDefault()
    const fullName = name.trim()
    if (!fullName || status === 'saving') return
    setStatus('saving')
    try {
      const { firstName, lastName } = splitFullName(fullName)
      const response = await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify({ firstName, lastName })
      })
      if (!response.ok) throw new Error(`profile ${response.status}`)
      setStatus('saved')
      onSaved(fullName)
    } catch (error) {
      console.error('Name save failed:', error)
      setStatus('error')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-1.5 border-b border-gray-100 pb-6" data-testid="account-settings-name-form">
      <Label htmlFor="settings-name">{label}</Label>
      <Input
        id="settings-name"
        value={name}
        onChange={(event) => {
          setName(event.target.value)
          setStatus(null)
        }}
        autoComplete="name"
        maxLength={200}
        className="h-11"
      />
      <div className="flex flex-wrap items-center gap-3 pt-3">
        <Button
          type="submit"
          className="h-11 w-full bg-[#2d5a27] font-semibold text-white hover:bg-[#234a1f] sm:w-auto sm:px-8"
          disabled={status === 'saving' || !name.trim()}
        >
          {status === 'saving' ? savingLabel : saveLabel}
        </Button>
        {status === 'saved' ? (
          <span role="status" className="flex items-center gap-1.5 text-sm font-medium text-emerald-700" data-testid="account-settings-name-saved">
            <CheckCircle className="h-4 w-4" aria-hidden="true" />
            {savedLabel}
          </span>
        ) : null}
        {status === 'error' ? (
          <span role="alert" className="flex items-center gap-1.5 text-sm text-red-700">
            <AlertCircle className="h-4 w-4" aria-hidden="true" />
            {errorLabel}
          </span>
        ) : null}
      </div>
    </form>
  )
}

// Figma 6a / 6b: Nastavení účtu → Změnit heslo. The only place to change the
// password; the current one is verified on the server first.
export default function AccountSettingsPage() {
  const [language, setLanguage] = useState(DEFAULT_LANGUAGE)
  const data = useZoneData()
  const user = data.user
  const loading = data.loading
  const [form, setForm] = useState({ current: '', next: '', confirm: '' })
  const [visible, setVisible] = useState({ current: false, next: false, confirm: false })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [saved, setSaved] = useState(false)

  const tr = (key) => t(`accountSettings.${key}`, language)
  const trAuth = (key) => t(`auth.${key}`, language)

  useEffect(() => {
    setLanguage(readLanguageFromBrowser())
    const handleLanguageChange = (event) => setLanguage(event.detail)
    window.addEventListener('languageChange', handleLanguageChange)
    return () => window.removeEventListener('languageChange', handleLanguageChange)
  }, [])

  const providers = getProviders(user)
  const hasPasswordLogin = providers.length === 0 || providers.includes('email')

  const update = (key) => (value) => {
    setForm((previous) => ({ ...previous, [key]: value }))
    setError('')
    setSaved(false)
  }
  const toggle = (key) => () => setVisible((previous) => ({ ...previous, [key]: !previous[key] }))

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    setSaved(false)

    if (!form.current) {
      setError(trAuth('currentPasswordRequired'))
      return
    }
    if (!isValidNewPassword(form.next)) {
      setError(trAuth('passwordTooShort'))
      return
    }
    if (form.next !== form.confirm) {
      setError(trAuth('passwordsDoNotMatch'))
      return
    }

    setSaving(true)
    try {
      const response = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword: form.current, newPassword: form.next })
      })
      const payload = await response.json().catch(() => ({}))
      if (!response.ok) {
        setError(resolveAuthClientMessage(payload, trAuth, 'unexpectedError'))
        return
      }
      setSaved(true)
      setForm({ current: '', next: '', confirm: '' })
    } catch {
      setError(trAuth('connectionError'))
    } finally {
      setSaving(false)
    }
  }

  // Header (shared session cache) and zone greeting pick the new name at once.
  const handleNameSaved = (fullName) => {
    const { firstName } = splitFullName(fullName)
    if (user) {
      notifySiteAuthChanged({ ...user, user_metadata: { ...user.user_metadata, name: fullName, full_name: fullName } })
    }
    data.update({ firstName, fullName })
  }

  if (loading) {
    return (
      <ZoneShell data={data}>
        <ZoneSkeleton variant="form" />
      </ZoneShell>
    )
  }

  return (
    <ZoneShell data={data}>
      <div className="max-w-3xl space-y-6" data-testid="account-settings">
        <div>
          <ZoneBackLink language={language} className="-mt-2 mb-3" />
          <h1 className="text-[32px] font-bold leading-tight text-[#1b2333] sm:text-[38px]">{tr('title')}</h1>
        </div>

        <section className="rounded-2xl border border-[#ebe5da] bg-white p-6 sm:p-8">
          <NameForm
            key={user?.id || 'anon'}
            initialName={data.fullName}
            label={tr('nameLabel')}
            saveLabel={tr('nameSave')}
            savingLabel={tr('saving')}
            savedLabel={tr('nameSaved')}
            errorLabel={trAuth('unexpectedError')}
            onSaved={handleNameSaved}
          />
          <h2 className="mt-6 text-lg font-bold text-slate-800">{tr('credentialsTitle')}</h2>
          <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-b border-gray-100 pb-5">
            <span className="text-sm font-medium text-slate-700">{tr('emailLabel')}</span>
            <span className="break-all text-sm text-slate-900" data-testid="account-settings-email">{user?.email || ''}</span>
          </div>

          <div className="pt-6">
            <h3 className="flex items-center gap-2 text-base font-bold text-slate-800">
              <KeyRound className="h-5 w-5 text-[#c78b5a]" aria-hidden="true" />
              {tr('changePasswordTitle')}
            </h3>

            {!hasPasswordLogin ? (
              <p className="mt-2 text-sm text-gray-600" data-testid="account-settings-google-info">{tr('googleOnlyInfo')}</p>
            ) : (
              <>
                <p className="mt-1 text-sm text-gray-600">{tr('changePasswordIntro')}</p>

                {saved && (
                  <div role="status" className="mt-5 flex items-start gap-3 rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-emerald-900" data-testid="account-settings-saved">
                    <CheckCircle className="mt-0.5 h-5 w-5 flex-shrink-0" aria-hidden="true" />
                    <div>
                      <p className="font-semibold">{tr('savedTitle')}</p>
                      <p className="mt-0.5 text-sm">{tr('savedText')}</p>
                    </div>
                  </div>
                )}

                {error && (
                  <div role="alert" className="mt-5 flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800" data-testid="account-settings-error">
                    <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" aria-hidden="true" />
                    <span>{error}</span>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="mt-5 space-y-4" noValidate>
                  <div className="space-y-1.5">
                    <Label htmlFor="settings-current-password">{tr('currentPassword')}</Label>
                    <PasswordInput
                      id="settings-current-password"
                      value={form.current}
                      onChange={update('current')}
                      placeholder={tr('currentPasswordPlaceholder')}
                      autoComplete="current-password"
                      visible={visible.current}
                      onToggle={toggle('current')}
                      toggleLabel={visible.current ? trAuth('hidePassword') : trAuth('showPassword')}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="settings-new-password">{tr('newPassword')}</Label>
                    <PasswordInput
                      id="settings-new-password"
                      value={form.next}
                      onChange={update('next')}
                      placeholder={tr('newPasswordPlaceholder')}
                      autoComplete="new-password"
                      visible={visible.next}
                      onToggle={toggle('next')}
                      toggleLabel={visible.next ? trAuth('hidePassword') : trAuth('showPassword')}
                    />
                    <p className="text-xs text-gray-500">{tr('newPasswordHint')}</p>
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="settings-confirm-password">{tr('confirmPassword')}</Label>
                    <PasswordInput
                      id="settings-confirm-password"
                      value={form.confirm}
                      onChange={update('confirm')}
                      placeholder={tr('confirmPasswordPlaceholder')}
                      autoComplete="new-password"
                      visible={visible.confirm}
                      onToggle={toggle('confirm')}
                      toggleLabel={visible.confirm ? trAuth('hidePassword') : trAuth('showPassword')}
                    />
                  </div>
                  <Button type="submit" className="h-11 w-full bg-slate-800 font-semibold text-white hover:bg-slate-900 sm:w-auto sm:px-8" disabled={saving}>
                    {saving ? tr('saving') : tr('save')}
                  </Button>
                </form>
              </>
            )}
          </div>
        </section>
      </div>
    </ZoneShell>
  )
}
