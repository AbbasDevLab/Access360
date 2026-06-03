import React, { useState } from 'react'
import { ShieldCheckIcon, LockClosedIcon } from '@heroicons/react/24/outline'
import { useNavigate } from 'react-router-dom'
import { loginAdminUser } from '../services/adminApi'
import type { ApiError } from '../services/adminApi'

export default function GuardLoginRoute(): React.JSX.Element {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      const result = await loginAdminUser({
        username: username.trim(),
        password: password.trim(),
      })

      if (!result.success || !result.user) {
        setError(result.message || 'Invalid username or password')
        return
      }

      // The same Admin/Login endpoint serves all roles; only Guards may enter
      // the guard portal. Anything else is rejected as unauthorized.
      if ((result.user.role ?? '').trim().toLowerCase() !== 'guard') {
        setError('Unauthorized: this account is not a guard.')
        return
      }

      localStorage.setItem(
        'guardUser',
        JSON.stringify({
          id: result.user.id,
          username: result.user.username,
          guardFullName: result.user.fullName,
          guardEmail: result.user.email,
          role: result.user.role,
          companyId: result.user.companyId,
          locationId: result.user.locationId,
          loggedIn: true,
          loginTime: new Date().toISOString(),
        }),
      )
      navigate('/guard/dashboard', { replace: true })
    } catch (err) {
      console.error('Login error:', err)
      const apiErr = err as ApiError
      setError(apiErr?.message || 'Login failed. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#e8eaed] px-4 py-10">
      <div className="w-full max-w-md rounded-[20px] bg-white p-8 shadow-md shadow-black/8 ring-1 ring-black/5">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-[#2563eb] shadow-inner">
            <ShieldCheckIcon className="h-8 w-8 text-white" aria-hidden />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-neutral-900">Guard Counter Login</h1>
          <p className="mt-2 text-sm text-neutral-500">Access360 Visitor Management</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="username" className="mb-2 block text-sm font-semibold text-neutral-900">
              Username
            </label>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <svg className="h-5 w-5 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="block w-full rounded-xl border border-neutral-200 bg-neutral-50/80 py-3 pl-10 pr-3 text-neutral-900 shadow-inner placeholder:text-neutral-400 focus:border-[#2563eb] focus:outline-none focus:ring-2 focus:ring-[#2563eb]/25"
                placeholder="Enter your username"
              />
            </div>
          </div>

          <div>
            <label htmlFor="password" className="mb-2 block text-sm font-semibold text-neutral-900">
              Password
            </label>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <LockClosedIcon className="h-5 w-5 text-neutral-400" aria-hidden />
              </div>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="block w-full rounded-xl border border-neutral-200 bg-neutral-50/80 py-3 pl-10 pr-3 text-neutral-900 shadow-inner placeholder:text-neutral-400 focus:border-[#2563eb] focus:outline-none focus:ring-2 focus:ring-[#2563eb]/25"
                placeholder="Enter your password"
              />
            </div>
          </div>

          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#00A651] py-3.5 px-4 text-sm font-semibold text-white shadow-lg shadow-[#00A651]/30 transition-colors hover:bg-[#009148] disabled:cursor-not-allowed disabled:bg-neutral-300 disabled:text-neutral-600 disabled:shadow-none"
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

        <div className="mt-6 text-center text-sm text-neutral-500">
          <p>For counter staff use only</p>
        </div>
      </div>
    </div>
  )
}


