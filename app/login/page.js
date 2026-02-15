'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Mail, Lock, User, Eye, EyeOff, CheckCircle, AlertCircle } from 'lucide-react'

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [activeTab, setActiveTab] = useState('login')
  const router = useRouter()
  const searchParams = useSearchParams()
  const tabParam = searchParams.get('tab')
  const redirectParam = searchParams.get('redirect')
  const redirectPath = redirectParam && redirectParam.startsWith('/') ? redirectParam : '/dashboard'

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

    return { ok: true }
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
      hasSession: Boolean(payload?.hasSession)
    }
  }

  useEffect(() => {
    if (tabParam === 'signup' || tabParam === 'login') {
      setActiveTab(tabParam)
    }
  }, [tabParam])

  // Check if user is already logged in
  useEffect(() => {
    const checkUser = async () => {
      try {
        const response = await fetch('/api/auth/session', { cache: 'no-store' })
        if (!response.ok) return
        const payload = await response.json()
        if (payload?.authenticated) {
          router.push(redirectPath)
        }
      } catch (error) {
        // Ignore network checks on first load
      }
    }
    checkUser()
  }, [router, redirectPath])

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

      setSuccess('Login successful! Redirecting...')
      try {
        await fetch('/api/profile', { method: 'POST' })
      } catch (profileError) {
        console.warn('Profile check/creation failed:', profileError)
      }
      setTimeout(() => {
        window.location.assign(redirectPath)
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

      const hasSession = Boolean(result?.hasSession)
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
          window.location.assign(redirectPath)
        }, 1500)
      } else {
        setTimeout(() => {
          setActiveTab('login')
          setSuccess('You can now log in with your credentials.')
        }, 3000)
      }
    } catch (err) {
      setError('Unable to connect to authentication service. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4 home-page-custom-border">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <img 
            src="/logo domy.svg" 
            alt="Domy v Itálii"
            className="h-16 w-auto mx-auto mb-4" 
          />
          <h1 className="text-2xl font-bold text-white">Welcome to Premium Club</h1>
          <p className="text-gray-400 mt-2">Sign in to access exclusive features</p>
        </div>

        <Card className="bg-slate-800 border-amber-400/20">
          <CardContent className="p-6">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2 bg-slate-700">
                <TabsTrigger value="login" className="data-[state=active]:bg-amber-600">
                  Login
                </TabsTrigger>
                <TabsTrigger value="signup" className="data-[state=active]:bg-amber-600">
                  Sign Up
                </TabsTrigger>
              </TabsList>

              <TabsContent value="login" className="space-y-4 mt-6">
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="login-email" className="text-gray-300">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="login-email"
                        type="email"
                        placeholder="your.email@example.com"
                        className="pl-10 bg-slate-900 border-amber-400/20 text-white"
                        value={loginForm.email}
                        onChange={(e) => setLoginForm(prev => ({ ...prev, email: e.target.value }))}
                        disabled={isLoading}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="login-password" className="text-gray-300">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="login-password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter your password"
                        className="pl-10 pr-10 bg-slate-900 border-amber-400/20 text-white"
                        value={loginForm.password}
                        onChange={(e) => setLoginForm(prev => ({ ...prev, password: e.target.value }))}
                        disabled={isLoading}
                      />
                      <button
                        type="button"
                        className="absolute right-3 top-3 text-gray-400 hover:text-white"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  {error && (
                    <Alert variant="destructive" className="bg-red-900/20 border-red-600 text-red-400">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}

                  {success && (
                    <Alert className="bg-green-900/20 border-green-600 text-green-400">
                      <CheckCircle className="h-4 w-4" />
                      <AlertDescription>{success}</AlertDescription>
                    </Alert>
                  )}

                  <Button 
                    type="submit" 
                    className="w-full bg-amber-600 hover:bg-amber-700 text-white" 
                    disabled={isLoading}
                  >
                    {isLoading ? 'Signing in...' : 'Sign In'}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="signup" className="space-y-4 mt-6">
                <form onSubmit={handleSignup} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signup-name" className="text-gray-300">Full Name</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="signup-name"
                        type="text"
                        placeholder="Your full name"
                        className="pl-10 bg-slate-900 border-amber-400/20 text-white"
                        value={signupForm.name}
                        onChange={(e) => setSignupForm(prev => ({ ...prev, name: e.target.value }))}
                        disabled={isLoading}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-email" className="text-gray-300">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="signup-email"
                        type="email"
                        placeholder="your.email@example.com"
                        className="pl-10 bg-slate-900 border-amber-400/20 text-white"
                        value={signupForm.email}
                        onChange={(e) => setSignupForm(prev => ({ ...prev, email: e.target.value }))}
                        disabled={isLoading}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-password" className="text-gray-300">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="signup-password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Create a password (min 6 characters)"
                        className="pl-10 pr-10 bg-slate-900 border-amber-400/20 text-white"
                        value={signupForm.password}
                        onChange={(e) => setSignupForm(prev => ({ ...prev, password: e.target.value }))}
                        disabled={isLoading}
                      />
                      <button
                        type="button"
                        className="absolute right-3 top-3 text-gray-400 hover:text-white"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-confirm" className="text-gray-300">Confirm Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="signup-confirm"
                        type="password"
                        placeholder="Confirm your password"
                        className="pl-10 bg-slate-900 border-amber-400/20 text-white"
                        value={signupForm.confirmPassword}
                        onChange={(e) => setSignupForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                        disabled={isLoading}
                      />
                    </div>
                  </div>

                  {error && (
                    <Alert variant="destructive" className="bg-red-900/20 border-red-600 text-red-400">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}

                  {success && (
                    <Alert className="bg-green-900/20 border-green-600 text-green-400">
                      <CheckCircle className="h-4 w-4" />
                      <AlertDescription>{success}</AlertDescription>
                    </Alert>
                  )}

                  <Button 
                    type="submit" 
                    className="w-full bg-amber-600 hover:bg-amber-700 text-white" 
                    disabled={isLoading}
                  >
                    {isLoading ? 'Creating account...' : 'Create Account'}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>

            <div className="text-center text-sm text-gray-400 mt-6">
              <p>By signing up, you agree to our Terms of Service and Privacy Policy.</p>
            </div>
          </CardContent>
        </Card>

        <div className="text-center mt-6">
          <Button 
            variant="outline" 
            onClick={() => router.push('/')}
            className="border-amber-400/20 text-amber-400 hover:bg-amber-400/10"
          >
            ← Back to Homepage
          </Button>
        </div>
      </div>
    </div>
  )
}
