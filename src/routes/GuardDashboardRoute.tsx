import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowRightIcon, ArrowLeftIcon, UserIcon, ArrowRightOnRectangleIcon, CalendarIcon } from '@heroicons/react/24/outline'
import GuardCheckIn from '../components/GuardCheckIn'
import GuardCheckOut from '../components/GuardCheckOut'
import { getActiveGuestVisits } from '../services/guestVisitApi'
import { getApprovedScheduledGuests, markScheduledGuestArrived, markScheduledGuestNoShow, type ScheduledGuest } from '../services/scheduledGuestsApi'

export default function GuardDashboardRoute(): React.JSX.Element {
  const [mode, setMode] = useState<'dashboard' | 'checkin' | 'checkout'>('dashboard')
  const [activeVisits, setActiveVisits] = useState(0)
  const [scheduledGuests, setScheduledGuests] = useState<ScheduledGuest[]>([])
  const [scheduledSearch, setScheduledSearch] = useState('')
  const navigate = useNavigate()

  const loadActiveVisits = useCallback(async () => {
    try {
      const visits = await getActiveGuestVisits()
      setActiveVisits(visits.length)
    } catch (error) {
      console.error('Error loading active visits:', error)
      setActiveVisits(0)
    }
  }, [])

  const loadScheduledGuests = useCallback(async () => {
    try {
      const guests = await getApprovedScheduledGuests()
      const today = new Date()
      today.setHours(0, 0, 0, 0)

      const upcomingGuests = guests.filter(g => {
        if (!g.scheduledDate) return false
        const scheduled = new Date(g.scheduledDate)
        scheduled.setHours(0, 0, 0, 0)
        return scheduled >= today
      })

      setScheduledGuests(upcomingGuests)

      // Auto-mark no-show for past approved guests without arrival
      const pastGuests = guests.filter(g => {
        if (!g.scheduledDate) return false
        const scheduled = new Date(g.scheduledDate)
        scheduled.setHours(0, 0, 0, 0)
        return scheduled < today && !g.arrivedAt && g.status === 'Approved' && g.visitStatus !== 'NoShow'
      })

      if (pastGuests.length > 0) {
        await Promise.allSettled(pastGuests.map(g => markScheduledGuestNoShow(g.idpk)))
      }
    } catch (error) {
      console.error('Error loading scheduled guests:', error)
      setScheduledGuests([])
    }
  }, [])

  useEffect(() => {
    const guardUser = localStorage.getItem('guardUser')
    if (!guardUser) {
      navigate('/guard/login')
      return
    }

    loadActiveVisits()
    loadScheduledGuests()

    const interval = setInterval(() => {
      loadActiveVisits()
      loadScheduledGuests()
    }, 30000)
    return () => clearInterval(interval)
  }, [navigate, loadActiveVisits, loadScheduledGuests])

  const handleLogout = () => {
    localStorage.removeItem('guardUser')
    navigate('/guard/login')
  }

  const refreshVisits = async () => {
    try {
      const visits = await getActiveGuestVisits()
      setActiveVisits(visits.length)
    } catch (error) {
      console.error('Error refreshing visits:', error)
    }
  }

  const filteredScheduledGuests = useMemo(() => {
    const query = scheduledSearch.trim().toLowerCase()
    if (!query) return scheduledGuests
    return scheduledGuests.filter(guest => {
      const values = [
        guest.guestFullName,
        guest.guestCNIC,
        guest.guestPhone,
        guest.facultyName,
        guest.facultyIdpk?.toString(),
      ]
        .filter(Boolean)
        .map(value => String(value).toLowerCase())

      return values.some(value => value.includes(query))
    })
  }, [scheduledGuests, scheduledSearch])

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
    <div className="min-h-screen bg-gradient-to-br from-neutral-800 to-neutral-900 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-neutral-700 rounded-xl shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-neutral-100">Guard Counter</h1>
              <p className="text-neutral-300 mt-1">Visitor Management System</p>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 text-sm text-neutral-300 hover:text-neutral-100 hover:bg-neutral-600 rounded-lg transition-colors"
            >
              <ArrowRightOnRectangleIcon className="w-5 h-5" />
              Logout
            </button>
          </div>
        </div>

        {/* Stats Card */}
        <div className="bg-neutral-700 rounded-xl shadow-lg p-6 mb-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
              <UserIcon className="w-8 h-8 text-blue-600" />
            </div>
            <div>
              <div className="text-3xl font-bold text-neutral-100">{activeVisits}</div>
              <div className="text-sm text-neutral-300">Active Visits</div>
            </div>
          </div>
        </div>


        <div className="grid lg:grid-cols-[1.9fr,1.1fr] gap-6 lg:items-start">
          {/* Main Action Buttons (Centered) */}
          <div className="flex items-center justify-center">
            <div className="grid md:grid-cols-2 gap-6 w-full max-w-3xl">
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
          </div>

          {/* Scheduled Guests (Right Side Panel) */}
          <div className="bg-neutral-700 rounded-xl shadow-lg p-6 lg:sticky lg:top-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-neutral-100 flex items-center gap-2">
                <CalendarIcon className="w-6 h-6 text-blue-400" />
                Approved Scheduled Guests ({filteredScheduledGuests.length})
              </h2>
            </div>
            <div className="mb-4">
              <input
                type="text"
                value={scheduledSearch}
                onChange={(e) => setScheduledSearch(e.target.value)}
                placeholder="Search by name, CNIC, phone, faculty..."
                className="w-full rounded-lg border border-neutral-600 bg-neutral-800 px-3 py-2 text-sm text-neutral-100 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500"
              />
            </div>
            {filteredScheduledGuests.length === 0 ? (
              <div className="text-neutral-400 text-sm">No approved scheduled guests.</div>
            ) : (
              <div className="space-y-2 max-h-[420px] overflow-y-auto">
                {filteredScheduledGuests.map((guest) => (
                  <div
                    key={guest.idpk}
                    className="p-3 bg-blue-500/20 border border-blue-400/30 rounded-lg"
                  >
                    <div className="flex items-center justify-between">
                      <div className="font-medium text-neutral-100">
                        {guest.guestFullName}
                      </div>
                      <div className="text-xs text-blue-300 font-medium">
                        {guest.visitStatus === 'Arrived' ? 'Arrived' : guest.visitStatus === 'NoShow' ? 'No Show' : 'Approved'}
                      </div>
                    </div>
                    <div className="text-xs text-neutral-300 mt-1 space-y-1">
                      <div>
                        CNIC: {guest.guestCNIC}
                        {guest.carNumber && <span className="ml-3">Car: {guest.carNumber}</span>}
                      </div>
                      <div>
                        Date: {new Date(guest.scheduledDate).toLocaleDateString()}
                        <span className="ml-3">Time: {guest.scheduledTime}</span>
                      </div>
                      <div>
                        Faculty: {guest.facultyName || 'Unknown'} (ID: {guest.facultyIdpk})
                      </div>
                      {guest.purpose && (
                        <div>Purpose: {guest.purpose}</div>
                      )}
                      {guest.arrivedAt && (
                        <div>Arrived At: {new Date(guest.arrivedAt).toLocaleString()}</div>
                      )}
                    </div>
                    {guest.visitStatus !== 'Arrived' && (
                      <div className="mt-3">
                        <button
                          onClick={async () => {
                            try {
                              await markScheduledGuestArrived(guest.idpk)
                              await loadScheduledGuests()
                            } catch (error: any) {
                              alert(error.message || 'Failed to mark as arrived')
                            }
                          }}
                          className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-xs font-medium"
                        >
                          Mark Arrived
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
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

