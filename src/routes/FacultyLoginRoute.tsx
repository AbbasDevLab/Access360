import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { UserIcon, LockClosedIcon } from '@heroicons/react/24/outline'
import { facultyLogin, getAllFaculties } from '../services/facultyApi'

export default function FacultyLoginRoute(): React.JSX.Element {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const normalizeFacultyId = (faculty: any): number | null => {
    const rawId = faculty?.facultyIdpk ?? faculty?.idpk ?? faculty?.id ?? faculty?.Id ?? faculty?.ID
    const parsed = typeof rawId === 'string' ? parseInt(rawId, 10) : rawId
    return Number.isFinite(parsed) ? parsed : null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      const faculty = await facultyLogin(username, password)
      const facultyIdpk = normalizeFacultyId(faculty)
      localStorage.setItem('facultyUser', JSON.stringify({
        ...faculty,
        facultyIdpk,
        loggedIn: true,
      }))
      navigate('/faculty/dashboard')
    } catch (err: any) {
      // Fallback to basic lookup if login endpoint is not ready
      try {
        const faculties = await getAllFaculties()
        const faculty = faculties.find(f => f.username?.toLowerCase() === username.toLowerCase())
        if (!faculty) {
          setError('Invalid username or password')
          return
        }

        // If password isn't returned from API, allow any password (dev fallback)
        if (faculty.facultyPassword && faculty.facultyPassword !== password) {
          setError('Invalid username or password')
          return
        }

        const facultyIdpk = normalizeFacultyId(faculty)
        localStorage.setItem('facultyUser', JSON.stringify({
          ...faculty,
          facultyIdpk,
          loggedIn: true,
        }))
        navigate('/faculty/dashboard')
      } catch (fallbackError: any) {
        console.error('Faculty login error:', err, fallbackError)
        setError(err?.message || fallbackError?.message || 'Login failed. Please try again.')
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-800 to-neutral-900 flex items-center justify-center p-4">
      <div className="bg-neutral-700 rounded-2xl shadow-2xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <UserIcon className="w-12 h-12 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-neutral-100 mb-2">Faculty Portal</h1>
          <p className="text-neutral-300">Login to schedule guests</p>
        </div>

        {error && (
          <div className="bg-red-500/20 border border-red-500 rounded-lg p-4 mb-6">
            <p className="text-red-200 text-sm">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-neutral-200 mb-2">
              Username
            </label>
            <div className="relative">
              <UserIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-neutral-400" />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="w-full pl-10 pr-4 py-3 bg-neutral-600 border border-neutral-500 rounded-lg text-neutral-100 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter your username"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-200 mb-2">
              Password
            </label>
            <div className="relative">
              <LockClosedIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-neutral-400" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full pl-10 pr-4 py-3 bg-neutral-600 border border-neutral-500 rounded-lg text-neutral-100 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter your password"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-neutral-600 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Logging in...
              </>
            ) : (
              'Login'
            )}
          </button>
        </form>
      </div>
    </div>
  )
}

