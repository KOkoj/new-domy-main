'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Mail, Lock, User, Eye, EyeOff } from 'lucide-react'

export default function AuthModal({ isOpen, onClose, onAuthSuccess }) {
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [activeTab, setActiveTab] = useState('login')

  const [loginForm, setLoginForm] = useState({
    email: '',
    password: ''
  })

  const [signupForm, setSignupForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  })

  const loginViaServer = async (email, password) => {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    })

    const payload = await response.json().catch(() => ({}))
    if (!response.ok) {
      return {
        ok: false,
        error: payload?.error || 'Server login failed'
      }
    }

    return {
      ok: true,
      user: payload?.user || null
    }
  }

  const signupViaServer = async (name, email, password) => {
    const response = await fetch('/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password })
    })

    const payload = await response.json().catch(() => ({}))
    if (!response.ok) {
      return {
        ok: false,
        error: payload?.error || 'Server signup failed'
      }
    }

    return {
      ok: true,
      hasSession: Boolean(payload?.hasSession),
      user: payload?.user || null
    }
  }

  const handleLogin = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    if (!loginForm.email || !loginForm.password) {
      setError('Please fill in all fields')
      setIsLoading(false)
      return
    }

    try {
      const result = await loginViaServer(loginForm.email, loginForm.password)
      if (!result.ok) {
        setError(result.error)
        return
      }

      setSuccess('Login successful!')
      
      // Ensure profile exists (fallback)
      try {
        await fetch('/api/profile', { method: 'POST' })
      } catch (profileError) {
        console.warn('Profile check/creation failed:', profileError)
      }
      
      setTimeout(() => {
        onAuthSuccess?.(result.user)
        onClose()
      }, 1000)
    } catch (err) {
      setError('Unable to connect to authentication service. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSignup = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    if (!signupForm.name || !signupForm.email || !signupForm.password) {
      setError('Please fill in all fields')
      setIsLoading(false)
      return
    }

    if (signupForm.password !== signupForm.confirmPassword) {
      setError('Passwords do not match')
      setIsLoading(false)
      return
    }

    if (signupForm.password.length < 6) {
      setError('Password must be at least 6 characters')
      setIsLoading(false)
      return
    }

    try {
      const result = await signupViaServer(
        signupForm.name,
        signupForm.email,
        signupForm.password
      )

      if (!result.ok) {
        setError(result.error)
        return
      }

      const hasSession = Boolean(result.hasSession)
      setSuccess(
        hasSession
          ? 'Account created successfully! Redirecting...'
          : 'Account created successfully! Please check your email to confirm your account.'
      )

      // Try to create profile manually as fallback
      try {
        await fetch('/api/profile', { method: 'POST' })
      } catch (profileError) {
        console.warn('Manual profile creation failed:', profileError)
      }

      if (hasSession) {
        setTimeout(() => {
          onAuthSuccess?.(result.user)
          onClose()
        }, 1000)
      } else {
        setTimeout(() => {
          setActiveTab('login')
          setSuccess('')
        }, 3000)
      }
    } catch (err) {
      setError('Unable to connect to authentication service. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleMagicLink = async () => {
    setIsLoading(true)
    setError('')

    if (!loginForm.email) {
      setError('Please enter your email address')
      setIsLoading(false)
      return
    }

    setError('Magic Link is temporarily unavailable. Please use email and password login.')
    setIsLoading(false)
  }

  const resetForm = () => {
    setLoginForm({ email: '', password: '' })
    setSignupForm({ name: '', email: '', password: '', confirmPassword: '' })
    setError('')
    setSuccess('')
    setShowPassword(false)
  }

  const handleClose = () => {
    resetForm()
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose} data-testid="auth-modal">
      <DialogContent className="sm:max-w-md" data-testid="auth-modal-content">
        <DialogHeader data-testid="auth-modal-header">
          <div className="text-center space-y-4" data-testid="auth-modal-title">
            <img 
              src="/logo domy.svg" 
              alt="Domy v Itálii"
              className="h-16 w-auto mx-auto" 
              data-testid="auth-modal-logo"
            />
            <DialogTitle className="text-xl font-bold">
              Welcome
            </DialogTitle>
          </div>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full" data-testid="auth-tabs">
          <TabsList className="grid w-full grid-cols-2" data-testid="auth-tabs-list">
            <TabsTrigger value="login" data-testid="login-tab">Login</TabsTrigger>
            <TabsTrigger value="signup" data-testid="signup-tab">Sign Up</TabsTrigger>
          </TabsList>

          <TabsContent value="login" className="space-y-4" data-testid="login-tab-content">
            <form onSubmit={handleLogin} className="space-y-4" data-testid="login-form">
              <div className="space-y-2" data-testid="login-email-field">
                <Label htmlFor="login-email" data-testid="login-email-label">Email</Label>
                <div className="relative" data-testid="login-email-input-container">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="login-email"
                    type="email"
                    placeholder="your.email@example.com"
                    className="pl-10"
                    value={loginForm.email}
                    onChange={(e) => setLoginForm(prev => ({ ...prev, email: e.target.value }))}
                    disabled={isLoading}
                    data-testid="login-email-input"
                  />
                </div>
              </div>

              <div className="space-y-2" data-testid="login-password-field">
                <Label htmlFor="login-password" data-testid="login-password-label">Password</Label>
                <div className="relative" data-testid="login-password-input-container">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="login-password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    className="pl-10 pr-10"
                    value={loginForm.password}
                    onChange={(e) => setLoginForm(prev => ({ ...prev, password: e.target.value }))}
                    disabled={isLoading}
                    data-testid="login-password-input"
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                    onClick={() => setShowPassword(!showPassword)}
                    data-testid="login-password-toggle"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {success && (
                <Alert>
                  <AlertDescription className="text-slate-800">{success}</AlertDescription>
                </Alert>
              )}

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? 'Signing in...' : 'Sign In'}
              </Button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">Or</span>
                </div>
              </div>

              <Button 
                type="button" 
                variant="outline" 
                className="w-full" 
                onClick={handleMagicLink}
                disabled={isLoading}
              >
                <Mail className="w-4 h-4 mr-2" />
                Send Magic Link
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="signup" className="space-y-4">
            <form onSubmit={handleSignup} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="signup-name">Full Name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="signup-name"
                    type="text"
                    placeholder="Your full name"
                    className="pl-10"
                    value={signupForm.name}
                    onChange={(e) => setSignupForm(prev => ({ ...prev, name: e.target.value }))}
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="signup-email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="signup-email"
                    type="email"
                    placeholder="your.email@example.com"
                    className="pl-10"
                    value={signupForm.email}
                    onChange={(e) => setSignupForm(prev => ({ ...prev, email: e.target.value }))}
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="signup-password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="signup-password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Create a password (min 6 characters)"
                    className="pl-10 pr-10"
                    value={signupForm.password}
                    onChange={(e) => setSignupForm(prev => ({ ...prev, password: e.target.value }))}
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="signup-confirm">Confirm Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="signup-confirm"
                    type="password"
                    placeholder="Confirm your password"
                    className="pl-10"
                    value={signupForm.confirmPassword}
                    onChange={(e) => setSignupForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                    disabled={isLoading}
                  />
                </div>
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {success && (
                <Alert>
                  <AlertDescription className="text-slate-800">{success}</AlertDescription>
                </Alert>
              )}

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? 'Creating account...' : 'Create Account'}
              </Button>
            </form>
          </TabsContent>
        </Tabs>

        <div className="text-center text-sm text-gray-600 mt-4">
          <p>By signing up, you agree to our Terms of Service and Privacy Policy.</p>
        </div>
      </DialogContent>
    </Dialog>
  )
}
