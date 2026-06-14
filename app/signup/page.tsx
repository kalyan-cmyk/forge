'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Button from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import Link from 'next/link'

export default function SignupPage() {
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [city, setCity] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)
  const supabase = createClient()

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName, city },
      },
    })

    if (signUpError) {
      setError(signUpError.message)
      setLoading(false)
      return
    }

    if (data.user) {
      // Create profile row
      await supabase.from('profiles').insert({
        user_id: data.user.id,
        full_name: fullName,
        city,
        role: 'user',
      })

      // Email confirmation is disabled — sign in immediately and go to onboarding
      const { error: signInError } = await supabase.auth.signInWithPassword({ email, password })
      if (!signInError) {
        window.location.href = '/onboarding'
        return
      }
    }

    // Fallback: if sign-in failed (e.g. confirmation still required), show the check-email screen
    setDone(true)
    setLoading(false)
  }

  if (done) {
    return (
      <div className="min-h-screen forge-gradient flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="forge-card text-center">
            <div className="text-5xl mb-4">🔥</div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Check your email</h2>
            <p className="text-gray-500 text-sm">
              We sent a confirmation link to <strong>{email}</strong>. Click it to activate your account, then come back and sign in.
            </p>
            <Link href="/login">
              <Button className="mt-6 w-full">Go to sign in</Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen forge-gradient flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white tracking-tight">FORGE</h1>
          <p className="text-white/70 mt-2 text-sm">Compatibility forged through adversity</p>
        </div>

        <div className="forge-card">
          <h2 className="text-xl font-bold text-gray-900 mb-2">Create your account</h2>
          <p className="text-sm text-gray-500 mb-6">
            Step one of two. After this, you&apos;ll complete your values profile.
          </p>

          <form onSubmit={handleSignup} className="flex flex-col gap-4">
            <Input
              label="Full name"
              type="text"
              value={fullName}
              onChange={e => setFullName(e.target.value)}
              placeholder="Your name"
              required
            />
            <Input
              label="Email"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
            />
            <Input
              label="Password"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="At least 8 characters"
              minLength={8}
              required
            />
            <Input
              label="City"
              type="text"
              value={city}
              onChange={e => setCity(e.target.value)}
              placeholder="e.g. Bangalore"
              required
            />

            {error && (
              <p className="text-sm text-red-500 bg-red-50 rounded-lg px-4 py-2">{error}</p>
            )}

            <Button type="submit" loading={loading} className="w-full mt-2">
              Create account
            </Button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            Already have an account?{' '}
            <Link href="/login" className="text-forge-purple font-medium hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
