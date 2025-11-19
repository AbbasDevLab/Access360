import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowRightIcon, ArrowLeftIcon, UserIcon, ArrowRightOnRectangleIcon } from '@heroicons/react/24/outline'
import GuardCheckIn from '../components/GuardCheckIn'
import GuardCheckOut from '../components/GuardCheckOut'
import { getActiveGuestVisits } from '../services/guestVisitApi'

export default function GuardDashboardRoute(): JSX.Element {
  const [mode, setMode] = useState<'dashboard' | 'checkin' | 'checkout'>('dashboard')
  const [activeVisits, setActiveVisits] = useState(0)
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
      }
    }
    loadActiveVisits()

    // Refresh active visits every 30 seconds
    const interval = setInterval(loadActiveVisits, 30000)
    return () => clearInterval(interval)
  }, [navigate])

  const handleLogout = () => {
    localStorage.removeItem('guardUser')
    navigate('/guard/login')
  }

  if (mode === 'checkin') {
    return (
      <GuardCheckIn
        onBack={() => setMode('dashboard')}
        onSuccess={() => {
          setMode('dashboard')
          // Refresh active visits count
          getActiveGuestVisits().then(visits => setActiveVisits(visits.length))
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
          // Refresh active visits count
          getActiveGuestVisits().then(visits => setActiveVisits(visits.length))
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
              <div className="text-green-100 text-lg">New Visitor Entry</div>
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
              <div className="text-3xl font-bold mb-2">CHECK OUT</div>
              <div className="text-red-100 text-lg">Visitor Exit</div>
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

