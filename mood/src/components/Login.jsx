import React, { useState } from 'react'
import { apiUrl } from '../utils/api'

const Login = ({ setActiveView, setIsAuthenticated }) => {
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    const form = e.currentTarget
    const formData = new FormData(form)
    const username = formData.get('username')
    const password = formData.get('password')

    try {
      const res = await fetch(apiUrl('/api/auth/login'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email: username, password })
      })
      const body = await res.json()
      if (!res.ok) throw new Error(body.message || 'Login failed')
      setIsAuthenticated(true)
      setActiveView('mood')
    } catch (err) {
      setError(err.message || 'Login failed')
    }
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_#1f2937_0%,_#0f172a_38%,_#020617_100%)] px-4 py-10 text-slate-100">
      <div className="mx-auto flex min-h-[calc(100vh-5rem)] w-full max-w-6xl overflow-hidden rounded-[2rem] border border-white/10 bg-white/5 shadow-2xl shadow-cyan-950/30 backdrop-blur-xl">
        <div className="hidden w-full max-w-md flex-col justify-between bg-gradient-to-br from-cyan-400 via-sky-500 to-indigo-600 p-10 text-slate-950 lg:flex">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.35em] text-slate-900/70">
              Mood
            </p>
            <h1 className="mt-6 max-w-xs text-5xl font-black leading-tight text-white">
              Sign in to your personal vibe space.
            </h1>
          </div>

          <div className="rounded-3xl border border-white/20 bg-white/10 p-6 text-white shadow-lg shadow-cyan-900/20">
            <p className="text-sm uppercase tracking-[0.3em] text-white/70">
              Quick access
            </p>
            <p className="mt-3 text-lg leading-7 text-white/90">
              Pick up your playlists, track your mood, and keep your session in sync across devices.
            </p>
          </div>
        </div>

        <div className="flex flex-1 items-center justify-center p-6 sm:p-10">
          <div className="w-full max-w-md rounded-[1.75rem] border border-white/10 bg-slate-950/70 p-8 shadow-xl shadow-black/30 sm:p-10">
            <div className="mb-8">
              <p className="text-sm font-semibold uppercase tracking-[0.35em] text-cyan-300">
                Welcome back
              </p>
              <h2 className="mt-3 text-3xl font-bold text-white">Login</h2>
              <p className="mt-2 text-sm leading-6 text-slate-400">
                Enter your credentials to continue.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label htmlFor="username" className="mb-2 block text-sm font-medium text-slate-200">
                  Username
                </label>
                <input
                  id="username"
                  type="text"
                  name="username"
                  placeholder="Enter your username"
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
                  placeholder="Enter your password"
                  className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3.5 text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-400 focus:bg-white/10 focus:ring-4 focus:ring-cyan-400/20"
                />
              </div>

              <div className="flex items-center justify-between gap-4 text-sm text-slate-400">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    className="h-4 w-4 rounded border-white/20 bg-white/5 text-cyan-400 focus:ring-cyan-400"
                  />
                  Remember me
                </label>
                <a href="#" className="font-medium text-cyan-300 transition hover:text-cyan-200">
                  Forgot password?
                </a>
              </div>

              <button
                type="submit"
                className="group inline-flex w-full items-center justify-center rounded-2xl bg-gradient-to-r from-cyan-400 to-sky-500 px-4 py-3.5 text-sm font-semibold text-slate-950 transition hover:scale-[1.01] hover:from-cyan-300 hover:to-sky-400 focus:outline-none focus:ring-4 focus:ring-cyan-400/30"
              >
                Login
              </button>
            </form>

            {error && <p className="mt-4 text-center text-sm text-rose-300">{error}</p>}

            <p className="mt-8 text-center text-sm text-slate-400">
              New here?{' '}
              <button onClick={() => setActiveView('signup')} className="font-semibold text-cyan-300 transition hover:text-cyan-200">
                Create an account
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login