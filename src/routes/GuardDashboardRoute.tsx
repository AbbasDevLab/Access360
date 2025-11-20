import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowRightIcon, ArrowLeftIcon, UserIcon, ArrowRightOnRectangleIcon, CheckCircleIcon } from '@heroicons/react/24/outline'
import GuardCheckIn from '../components/GuardCheckIn'
import GuardCheckOut from '../components/GuardCheckOut'
import { getActiveGuestVisits, getAllGuestVisits, type GuestVisit } from '../services/guestVisitApi'

export default function GuardDashboardRoute(): React.JSX.Element {
  const [mode, setMode] = useState<'dashboard' | 'checkin' | 'checkout'>('dashboard')
  const [activeVisits, setActiveVisits] = useState(0)
  const [recentVisits, setRecentVisits] = useState<GuestVisit[]>([])
  const navigate = useNavigate()

  useEffect(() => {
    // Check if guard is logged in
    const guardUser = localStorage.getItem('guardUser')
    if (!guardUser) {
      navigate('/guard/login')
      return
    }

    // Load active visits count
    const loadActiveVisits = async () => {
      try {
        const visits = await getActiveGuestVisits()
        setActiveVisits(visits.length)
      } catch (error) {
        console.error('Error loading active visits:', error)
        // Set to 0 on error to prevent UI blocking
        setActiveVisits(0)
      }
    }

    // Load recent visits (last 10 checked out)
    const loadRecentVisits = async () => {
      try {
        const allVisits = await getAllGuestVisits()
        // Get visits that have timeOut set, sorted by timeOut descending
        const checkedOut = allVisits
          .filter(v => v.timeOut)
          .sort((a, b) => {
            const timeA = new Date(a.timeOut || 0).getTime()
            const timeB = new Date(b.timeOut || 0).getTime()
            return timeB - timeA
          })
          .slice(0, 10)
        setRecentVisits(checkedOut)
      } catch (error) {
        console.error('Error loading recent visits:', error)
        // Set to empty array on error to prevent UI blocking
        setRecentVisits([])
      }
    }

    loadActiveVisits()
    loadRecentVisits()

    // Refresh every 30 seconds
    const interval = setInterval(() => {
      loadActiveVisits()
      loadRecentVisits()
    }, 30000)
    return () => clearInterval(interval)
  }, [navigate])

  const formatTime = (timeString?: string | null) => {
    if (!timeString) return 'N/A'
    const date = new Date(timeString)
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
  }

  const handleLogout = () => {
    localStorage.removeItem('guardUser')
    navigate('/guard/login')
  }

  const refreshVisits = async () => {
    try {
      const visits = await getActiveGuestVisits()
      setActiveVisits(visits.length)
      
      // Reload recent visits
      const allVisits = await getAllGuestVisits()
      const checkedOut = allVisits
        .filter(v => v.timeOut)
        .sort((a, b) => {
          const timeA = new Date(a.timeOut || 0).getTime()
          const timeB = new Date(b.timeOut || 0).getTime()
          return timeB - timeA
        })
        .slice(0, 10)
      setRecentVisits(checkedOut)
    } catch (error) {
      console.error('Error refreshing visits:', error)
    }
  }

  if (mode === 'checkin') {
    return (
      <GuardCheckIn
        onBack={() => setMode('dashboard')}
        onSuccess={() => {
          setMode('dashboard')
          refreshVisits()
        }}
      />
    )
  }

  if (mode === 'checkout') {
    return (
      <GuardCheckOut
        onBack={() => setMode('dashboard')}
        onSuccess={() => {
          setMode('dashboard')
          refreshVisits()
        }}
      />
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-neutral-900">Guard Counter</h1>
              <p className="text-neutral-600 mt-1">Visitor Management System</p>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 text-sm text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 rounded-lg transition-colors"
            >
              <ArrowRightOnRectangleIcon className="w-5 h-5" />
              Logout
            </button>
          </div>
        </div>

        {/* Stats Card */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
              <UserIcon className="w-8 h-8 text-blue-600" />
            </div>
            <div>
              <div className="text-3xl font-bold text-neutral-900">{activeVisits}</div>
              <div className="text-sm text-neutral-600">Active Visits</div>
            </div>
          </div>
        </div>


        {/* Recent Visitors */}
        {recentVisits.length > 0 && (
          <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-neutral-900 flex items-center gap-2">
                <CheckCircleIcon className="w-6 h-6 text-green-600" />
                Recent Checkouts ({recentVisits.length})
              </h2>
            </div>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {recentVisits.map((visit) => (
                <div
                  key={visit.idpk}
                  className="flex items-center justify-between p-3 bg-neutral-50 rounded-lg border border-neutral-200"
                >
                  <div className="flex-1">
                    <div className="font-medium text-neutral-900">
                      {visit.guest?.fullName || 'Unknown Visitor'}
                    </div>
                    <div className="text-xs text-neutral-600 mt-1">
                      <span>Out: {formatTime(visit.timeOut)}</span>
                      {visit.timeIn && (
                        <span className="ml-3">In: {formatTime(visit.timeIn)}</span>
                      )}
                    </div>
                  </div>
                  <div className="text-xs text-green-600 font-medium">
                    Checked Out
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Main Action Buttons */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Check In Button */}
          <button
            onClick={() => setMode('checkin')}
            className="bg-green-600 hover:bg-green-700 text-white rounded-2xl shadow-xl p-12 flex flex-col items-center justify-center gap-4 transition-all transform hover:scale-105"
          >
            <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center">
              <ArrowRightIcon className="w-12 h-12 text-white" />
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold mb-2">CHECK IN</div>
              <div className="text-3xl font-bold mb-2">اندراج</div>
              <div className="text-green-100 text-lg">New Visitor Entry نئی وزیٹر انٹری</div>
            </div>
          </button>

          {/* Check Out Button */}
          <button
            onClick={() => setMode('checkout')}
            className="bg-red-600 hover:bg-red-700 text-white rounded-2xl shadow-xl p-12 flex flex-col items-center justify-center gap-4 transition-all transform hover:scale-105"
          >
            <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center">
              <ArrowLeftIcon className="w-12 h-12 text-white" />
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold mb-2">CHECK OUT  چیک آؤٹ</div>
              <div className="text-red-100 text-lg">Visitor Exit وزیٹر کا اخراج</div>
            </div>
          </button>
        </div>

        {/* Instructions */}
        <div className="mt-6 bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-lg font-semibold text-neutral-900 mb-3">Quick Instructions</h2>
          <ul className="space-y-2 text-sm text-neutral-600">
            <li className="flex items-start gap-2">
              <span className="text-green-600 font-bold">✓</span>
              <span><strong>Check In:</strong> Scan ID card, enter phone number, select visitor type and destination, assign card number</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-red-600 font-bold">✓</span>
              <span><strong>Check Out:</strong> Search by name, CNIC, or card number, then process exit</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  )
}

