import React, { useState } from 'react'
import { apiUrl } from '../utils/api'

const Signup = ({ setActiveView, setIsAuthenticated }) => {
  const [formError, setFormError] = useState('')
  const [formSuccess, setFormSuccess] = useState('')

  const handleSubmit = async (event) => {
    event.preventDefault()

    const form = event.currentTarget
    const formData = new FormData(form)
    const username = formData.get('name')
    const email = formData.get('email')
    const password = formData.get('password')
    const confirmPassword = formData.get('confirmPassword')

    if (password !== confirmPassword) {
      setFormSuccess('')
      setFormError('Passwords do not match.')
      return
    }

    try {
      const res = await fetch(apiUrl('/api/auth/register'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ username, email, password })
      })
      const body = await res.json()
      if (!res.ok) throw new Error(body.message || 'Registration failed')
      setFormError('')
      setFormSuccess('Account created — redirecting...')
      setIsAuthenticated(true)
      setTimeout(() => setActiveView('mood'), 800)
    } catch (err) {
      setFormSuccess('')
      setFormError(err.message || 'Registration failed')
    }
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_#1f2937_0%,_#0f172a_38%,_#020617_100%)] px-4 py-10 text-slate-100">
      <div className="mx-auto flex min-h-[calc(100vh-5rem)] w-full max-w-6xl overflow-hidden rounded-[2rem] border border-white/10 bg-white/5 shadow-2xl shadow-cyan-950/30 backdrop-blur-xl">
        <div className="hidden w-full max-w-md flex-col justify-between bg-gradient-to-br from-emerald-400 via-cyan-500 to-blue-600 p-10 text-slate-950 lg:flex">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.35em] text-slate-900/70">
              Mood
            </p>
            <h1 className="mt-6 max-w-xs text-5xl font-black leading-tight text-white">
              Create your account and start your mood journey.
            </h1>
          </div>

          <div className="rounded-3xl border border-white/20 bg-white/10 p-6 text-white shadow-lg shadow-cyan-900/20">
            <p className="text-sm uppercase tracking-[0.3em] text-white/70">
              Built for continuity
            </p>
            <p className="mt-3 text-lg leading-7 text-white/90">
              Save your preferences, sync your playlists, and keep your experience personal from the first sign-up.
            </p>
          </div>
        </div>

        <div className="flex flex-1 items-center justify-center p-6 sm:p-10">
          <div className="w-full max-w-md rounded-[1.75rem] border border-white/10 bg-slate-950/70 p-8 shadow-xl shadow-black/30 sm:p-10">
            <div className="mb-8">
              <p className="text-sm font-semibold uppercase tracking-[0.35em] text-cyan-300">
                Get started
              </p>
              <h2 className="mt-3 text-3xl font-bold text-white">Sign up</h2>
              <p className="mt-2 text-sm leading-6 text-slate-400">
                Create your account in a few quick steps.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5" noValidate>
              <div>
                <label htmlFor="name" className="mb-2 block text-sm font-medium text-slate-200">
                  Full name
                </label>
                <input
                  id="name"
                  type="text"
                  name="name"
                  placeholder="Enter your full name"
                  className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3.5 text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-400 focus:bg-white/10 focus:ring-4 focus:ring-cyan-400/20"
                />
              </div>

              <div>
                <label htmlFor="email" className="mb-2 block text-sm font-medium text-slate-200">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  name="email"
                  placeholder="Enter your email"
                  className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3.5 text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-400 focus:bg-white/10 focus:ring-4 focus:ring-cyan-400/20"
                />
              </div>

              <div>
                <label htmlFor="password" className="mb-2 block text-sm font-medium text-slate-200">
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  name="password"
                  placeholder="Create a password"
                  className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3.5 text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-400 focus:bg-white/10 focus:ring-4 focus:ring-cyan-400/20"
                />
              </div>

              <div>
                <label htmlFor="confirmPassword" className="mb-2 block text-sm font-medium text-slate-200">
                  Confirm password
                </label>
                <input
                  id="confirmPassword"
                  type="password"
                  name="confirmPassword"
                  placeholder="Repeat your password"
                  className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3.5 text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-400 focus:bg-white/10 focus:ring-4 focus:ring-cyan-400/20"
                />
              </div>

              <label className="flex items-start gap-3 text-sm text-slate-400">
                <input
                  type="checkbox"
                  className="mt-1 h-4 w-4 rounded border-white/20 bg-white/5 text-cyan-400 focus:ring-cyan-400"
                />
                <span>
                  I agree to the terms and understand my account details will be used to personalize my mood experience.
                </span>
              </label>

              <button
                type="submit"
                className="inline-flex w-full items-center justify-center rounded-2xl bg-gradient-to-r from-emerald-400 to-cyan-500 px-4 py-3.5 text-sm font-semibold text-slate-950 transition hover:scale-[1.01] hover:from-emerald-300 hover:to-cyan-400 focus:outline-none focus:ring-4 focus:ring-cyan-400/30"
              >
                Create account
              </button>

              {formError ? (
                <p className="text-sm font-medium text-rose-300" aria-live="polite">
                  {formError}
                </p>
              ) : null}

              {formSuccess ? (
                <p className="text-sm font-medium text-emerald-300" aria-live="polite">
                  {formSuccess}
                </p>
              ) : null}
            </form>

            <p className="mt-8 text-center text-sm text-slate-400">
              Already have an account?{' '}
              <button onClick={() => setActiveView('login')} className="font-semibold text-cyan-300 transition hover:text-cyan-200">
                Log in
              </button>
            </p>
          </div>
        </div>
      </div>
      </div>
      
  )
}

export default Signup