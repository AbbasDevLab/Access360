import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  UserPlusIcon, 
  QrCodeIcon, 
  ChartBarIcon,
  ShieldCheckIcon,
  ClockIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline'
import { getAllScheduledGuests, type ScheduledGuest } from '../services/scheduledGuestsApi'

export default function HomeRoute(): JSX.Element {
  const navigate = useNavigate()
  const [adminUser, setAdminUser] = useState<any>(null)
  const [scheduledGuests, setScheduledGuests] = useState<ScheduledGuest[]>([])
  const [isLoadingRequests, setIsLoadingRequests] = useState(false)
  const [requestsError, setRequestsError] = useState<string | null>(null)

  useEffect(() => {
    const stored = localStorage.getItem('adminUser')
    if (stored) {
      try {
        const user = JSON.parse(stored)
        if (user.loggedIn) {
          setAdminUser(user)
        }
      } catch (e) {
        // Invalid data
      }
    }
  }, [])

  useEffect(() => {
    const loadRequests = async () => {
      if (!adminUser) return
      setIsLoadingRequests(true)
      setRequestsError(null)
      try {
        const guests = await getAllScheduledGuests()
        setScheduledGuests(guests)
      } catch (error: any) {
        setRequestsError(error?.message || 'Failed to load scheduled guest requests')
      } finally {
        setIsLoadingRequests(false)
      }
    }
    loadRequests()
  }, [adminUser])

  const pendingRequests = scheduledGuests.filter(g => g.status === 'Pending')

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {!adminUser && (
        <div className="bg-neutral-800 border border-neutral-700 rounded-xl p-4 flex items-center justify-between">
          <div>
            <p className="text-sm text-neutral-100 font-medium">Admin access required for most features</p>
            <p className="text-xs text-neutral-400 mt-1">Please login to access enrollment, reports, and management features</p>
          </div>
          <button
            onClick={() => navigate('/login')}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
          >
            Login
          </button>
        </div>
      )}
      {/* Hero Section */}
      <div className="text-center space-y-4">
        <div className="inline-flex items-center gap-3 bg-blue-500/20 text-blue-200 px-4 py-2 rounded-full text-sm font-medium">
          <ShieldCheckIcon className="w-5 h-5" />
          AI-Powered Visitor Management
        </div>
        <h1 className="text-4xl font-bold tracking-tight text-neutral-100">
          Welcome to <span className="text-blue-400">Access360</span>
        </h1>
        <p className="text-xl text-neutral-300 max-w-2xl mx-auto">
          Secure, efficient, and auditable visitor management system for Forman Christian College University
        </p>
      </div>

      {/* Faculty Guest Requests (Admin Home) */}
      {adminUser && (
        <div className="bg-neutral-800 rounded-2xl border border-neutral-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <DocumentTextIcon className="w-5 h-5 text-blue-400" />
              <h2 className="text-lg font-semibold text-neutral-100">Faculty Guest Requests</h2>
            </div>
            <button
              onClick={() => navigate('/admin')}
              className="text-sm text-blue-300 hover:text-blue-200 font-medium"
            >
              Open Admin Panel
            </button>
          </div>

          {isLoadingRequests ? (
            <div className="text-sm text-neutral-400">Loading requests...</div>
          ) : requestsError ? (
            <div className="text-sm text-red-300">Error: {requestsError}</div>
          ) : pendingRequests.length === 0 ? (
            <div className="text-sm text-neutral-400">No pending requests right now.</div>
          ) : (
            <div className="space-y-3">
              {pendingRequests.slice(0, 6).map((guest) => (
                <div key={guest.idpk} className="border border-blue-400/20 rounded-lg p-3 bg-blue-500/10">
                  <div className="flex items-center justify-between">
                    <div className="font-medium text-neutral-100">{guest.guestFullName}</div>
                    <span className="text-xs text-blue-200 bg-blue-500/20 px-2 py-1 rounded">Pending</span>
                  </div>
                  <div className="text-xs text-neutral-300 mt-1 space-y-1">
                    <div>CNIC: {guest.guestCNIC} • Phone: {guest.guestPhone}</div>
                    <div>
                      Date: {new Date(guest.scheduledDate).toLocaleDateString()} • Time: {guest.scheduledTime}
                    </div>
                    <div>Faculty: {guest.facultyName || 'Unknown'} (ID: {guest.facultyIdpk})</div>
                    <div>Purpose: {guest.purpose}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Main Actions */}
      <div className="grid md:grid-cols-3 gap-6">
        <a href="/enroll" className="group relative overflow-hidden rounded-2xl border border-neutral-200 bg-white p-8 hover:shadow-xl transition-all duration-300 hover:border-blue-300">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <div className="relative">
            <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-blue-200 transition-colors">
              <UserPlusIcon className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold text-neutral-900 mb-3">Counter Enrollment</h3>
            <p className="text-neutral-600 mb-4">OCR-based ID processing, live photo capture, and visitor card assignment for efficient intake.</p>
            <div className="flex items-center text-blue-600 font-medium group-hover:text-blue-700">
              <span>Start Enrollment</span>
              <svg className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </div>
        </a>

        <a href="/verify" className="group relative overflow-hidden rounded-2xl border border-neutral-200 bg-white p-8 hover:shadow-xl transition-all duration-300 hover:border-green-300">
          <div className="absolute inset-0 bg-gradient-to-br from-green-50/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <div className="relative">
            <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-green-200 transition-colors">
              <QrCodeIcon className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-xl font-semibold text-neutral-900 mb-3">Guard Verification</h3>
            <p className="text-neutral-600 mb-4">Offline QR code scanning and validation for secure building access control.</p>
            <div className="flex items-center text-green-600 font-medium group-hover:text-green-700">
              <span>Open Scanner</span>
              <svg className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </div>
        </a>

        <a href="/passes" className="group relative overflow-hidden rounded-2xl border border-neutral-200 bg-white p-8 hover:shadow-xl transition-all duration-300 hover:border-purple-300">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-50/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <div className="relative">
            <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-purple-200 transition-colors">
              <ChartBarIcon className="w-8 h-8 text-purple-600" />
            </div>
            <h3 className="text-xl font-semibold text-neutral-900 mb-3">Reports & Analytics</h3>
            <p className="text-neutral-600 mb-4">Live records, comprehensive reports, and data analytics with Excel export capabilities.</p>
            <div className="flex items-center text-purple-600 font-medium group-hover:text-purple-700">
              <span>View Reports</span>
              <svg className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </div>
        </a>
      </div>

      {/* Recent Activity */}
      <div className="bg-neutral-800 rounded-2xl border border-neutral-700 p-8">
        <div className="flex items-center gap-3 mb-6">
          <DocumentTextIcon className="w-6 h-6 text-neutral-300" />
          <h3 className="text-xl font-semibold text-neutral-100">Recent Activity</h3>
        </div>
        <div className="space-y-4">
          {[
            { action: 'Visitor checked in', visitor: 'Ali Raza', time: '2 minutes ago', status: 'success' },
            { action: 'Card returned', visitor: 'Sara Ahmed', time: '5 minutes ago', status: 'success' },
            { action: 'New visitor registered', visitor: 'Muhammad Khan', time: '12 minutes ago', status: 'info' },
            { action: 'Lost card reported', visitor: 'Fatima Ali', time: '1 hour ago', status: 'warning' }
          ].map((activity, index) => (
            <div key={index} className="flex items-center gap-4 p-4 rounded-xl bg-neutral-700/60 hover:bg-neutral-700 transition-colors">
              <div className={`w-3 h-3 rounded-full ${
                activity.status === 'success' ? 'bg-green-500' :
                activity.status === 'warning' ? 'bg-amber-500' : 'bg-blue-500'
              }`}></div>
              <div className="flex-1">
                <div className="font-medium text-neutral-100">{activity.action}</div>
                <div className="text-sm text-neutral-300">{activity.visitor}</div>
              </div>
              <div className="text-sm text-neutral-400">{activity.time}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}


