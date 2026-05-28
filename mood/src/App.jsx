import { useEffect, useState } from 'react'
import Login from './components/Login.jsx'
import Signup from './components/Signup.jsx'
import Upload from './components/Upload.jsx'
import WebcamFeed from './components/WebcanFeeed.jsx'
import { apiUrl } from './utils/api'

function App() {
  const [activeView, setActiveView] = useState('login')
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    let ignore = false

    async function checkSession() {
      try {
        const response = await fetch(apiUrl('/api/auth/me'), {
          credentials: 'include',
        })

        if (response.ok && !ignore) {
          setIsAuthenticated(true)
          setActiveView('mood')
        }
      } catch {
        if (!ignore) {
          setIsAuthenticated(false)
        }
      }
    }

    checkSession()

    return () => {
      ignore = true
    }
  }, [])

  const handleProtectedView = (view) => {
    if (!isAuthenticated) {
      setActiveView('login')
      return
    }

    setActiveView(view)
  }

  const handleLogout = () => {
    fetch(apiUrl('/api/auth/logout'), {
      method: 'POST',
      credentials: 'include',
    }).catch(() => {})
    setIsAuthenticated(false)
    setActiveView('login')
  }

  const visibleView = isAuthenticated
    ? activeView
    : activeView === 'signup'
      ? 'signup'
      : 'login'

  return (
    <div className="min-h-screen bg-slate-950">
      <div className="fixed left-1/2 top-6 z-10 flex -translate-x-1/2 items-center gap-2 rounded-full border border-white/10 bg-slate-950/80 p-1 shadow-lg shadow-black/30 backdrop-blur">
        {isAuthenticated ? (
          <>
            <button
              type="button"
              onClick={() => handleProtectedView('upload')}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                activeView === 'upload'
                  ? 'bg-cyan-400 text-slate-950'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              Upload
            </button>
            <button
              type="button"
              onClick={() => handleProtectedView('mood')}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                activeView === 'mood'
                  ? 'bg-cyan-400 text-slate-950'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              Mood
            </button>
            <button
              type="button"
              onClick={handleLogout}
              className="rounded-full px-4 py-2 text-sm font-semibold text-rose-300 transition hover:bg-rose-500/10 hover:text-rose-200"
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <button
              type="button"
              onClick={() => setActiveView('login')}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                activeView === 'login'
                  ? 'bg-cyan-400 text-slate-950'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              Login
            </button>
            <button
              type="button"
              onClick={() => setActiveView('signup')}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                activeView === 'signup'
                  ? 'bg-cyan-400 text-slate-950'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              Sign up
            </button>
          </>
        )}
      </div>
      {isAuthenticated ? (
        visibleView === 'upload' ? (
          <Upload />
        ) : visibleView === 'mood' ? (
          <WebcamFeed />
        ) : (
          <WebcamFeed />
        )
      ) : visibleView === 'login' ? (
        <Login setActiveView={setActiveView} setIsAuthenticated={setIsAuthenticated} />
      ) : (
        <Signup setActiveView={setActiveView} setIsAuthenticated={setIsAuthenticated} />
      )}
    </div>
  );
}

export default App;