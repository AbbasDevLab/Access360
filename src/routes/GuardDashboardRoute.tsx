import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { matchPath, useLocation, useNavigate } from 'react-router-dom'
import { ArrowRightIcon, ArrowLeftIcon, UserIcon, ArrowRightOnRectangleIcon, CalendarIcon } from '@heroicons/react/24/outline'
import GuardCheckIn from '../components/GuardCheckIn'
import GuardCheckOut from '../components/GuardCheckOut'
import { getActiveGuestVisits } from '../services/guestVisitApi'
import { getPktTodayYmd, toPktYmd } from '../utils/pktTime'
import { getApprovedGuestFacultyVisits, type GuestFacultyVisit } from '../api/guestFacultyVisit'

const GUARD_DASHBOARD = '/guard/dashboard'
const GUARD_CHECK_IN = `${GUARD_DASHBOARD}/check-in`
const GUARD_CHECK_OUT = `${GUARD_DASHBOARD}/check-out`

function guardViewFromPath(pathname: string): 'dashboard' | 'checkin' | 'checkout' {
  if (matchPath({ path: GUARD_CHECK_IN, end: true }, pathname)) return 'checkin'
  if (matchPath({ path: GUARD_CHECK_OUT, end: true }, pathname)) return 'checkout'
  return 'dashboard'
}

export default function GuardDashboardRoute(): React.JSX.Element {
  const location = useLocation()
  const mode = useMemo(() => guardViewFromPath(location.pathname), [location.pathname])
  const [activeVisits, setActiveVisits] = useState(0)
  const [scheduledGuests, setScheduledGuests] = useState<GuestFacultyVisit[]>([])
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
      const all = await getApprovedGuestFacultyVisits()
      const today = getPktTodayYmd()
      const todaysApproved = all.filter((v) => toPktYmd(v.visitDate) === today)
      setScheduledGuests(todaysApproved)
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
        guest.guestPhoneNumber,
        guest.departmentName,
        guest.facultyFullName,
      ]
        .filter(Boolean)
        .map(value => String(value).toLowerCase())

      return values.some(value => value.includes(query))
    })
  }, [scheduledGuests, scheduledSearch])

  const goToGuardDashboard = useCallback(() => {
    navigate(GUARD_DASHBOARD, { replace: true })
  }, [navigate])

  if (mode === 'checkin') {
    return (
      <GuardCheckIn
        onBack={goToGuardDashboard}
        onSuccess={() => {
          goToGuardDashboard()
          refreshVisits()
        }}
      />
    )
  }

  if (mode === 'checkout') {
    return (
      <GuardCheckOut
        onBack={goToGuardDashboard}
        onSuccess={() => {
          goToGuardDashboard()
          refreshVisits()
        }}
      />
    )
  }

  return (
    <div className="min-h-screen bg-[#e8eaed] p-4 md:p-6">
      <div className="mx-auto max-w-5xl">
        {/* Header — white card, bold title */}
        <div className="mb-5 rounded-[20px] bg-white p-6 shadow-md shadow-black/8 ring-1 ring-black/5">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-neutral-900 md:text-4xl">Guard Counter</h1>
              <p className="mt-1 text-base text-neutral-500">Visitor Management System</p>
            </div>
            <button
              type="button"
              onClick={handleLogout}
              className="flex shrink-0 items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-neutral-700 transition-colors hover:bg-neutral-100 hover:text-neutral-900"
            >
              <ArrowRightOnRectangleIcon className="h-5 w-5" aria-hidden />
              Logout
            </button>
          </div>
        </div>

        {/* Stats — blue circle + person icon (reference UI) */}
        <div className="mb-6 rounded-[20px] bg-white p-6 shadow-md shadow-black/8 ring-1 ring-black/5">
          <div className="flex items-center gap-5">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-[#2563eb] shadow-inner">
              <UserIcon className="h-8 w-8 text-white" aria-hidden />
            </div>
            <div>
              <div className="text-4xl font-bold tabular-nums text-neutral-900">{activeVisits}</div>
              <div className="text-sm font-medium text-neutral-500">Active Visits</div>
            </div>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.85fr_1.15fr] lg:items-start">
          {/* Primary actions — saturated green / red like reference */}
          <div className="flex justify-center">
            <div className="grid w-full max-w-3xl gap-6 md:grid-cols-2">
              <button
                type="button"
                onClick={() => navigate(GUARD_CHECK_IN)}
                className="flex flex-col items-center justify-center gap-5 rounded-[20px] bg-[#00A651] p-10 text-white shadow-lg shadow-[#00A651]/35 transition-transform hover:scale-[1.02] hover:bg-[#009148] focus:outline-none focus-visible:ring-4 focus-visible:ring-white/50 md:p-12"
              >
                <div className="flex h-24 w-24 items-center justify-center rounded-full bg-white shadow-md">
                  <ArrowRightIcon className="h-12 w-12 text-[#00A651]" strokeWidth={2.25} aria-hidden />
                </div>
                <div className="text-center">
                  <div className="text-2xl font-extrabold tracking-wide md:text-3xl">CHECK IN</div>
                  <div className="mt-1 text-2xl font-bold md:text-3xl">اندراج</div>
                  <div className="mt-3 text-base font-medium text-white/95 md:text-lg">
                    New Visitor Entry
                    <span className="mx-1 text-white/80">·</span>
                    <span className="font-urdu text-[1.05em]">نئی وزیٹر انٹری</span>
                  </div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => navigate(GUARD_CHECK_OUT)}
                className="flex flex-col items-center justify-center gap-5 rounded-[20px] bg-[#ED1C24] p-10 text-white shadow-lg shadow-[#ED1C24]/35 transition-transform hover:scale-[1.02] hover:bg-[#d91820] focus:outline-none focus-visible:ring-4 focus-visible:ring-white/50 md:p-12"
              >
                <div className="flex h-24 w-24 items-center justify-center rounded-full bg-white shadow-md">
                  <ArrowLeftIcon className="h-12 w-12 text-[#ED1C24]" strokeWidth={2.25} aria-hidden />
                </div>
                <div className="text-center">
                  <div className="text-2xl font-extrabold tracking-wide md:text-3xl">CHECK OUT</div>
                  <div className="mt-1 text-2xl font-bold md:text-3xl">چیک آؤٹ</div>
                  <div className="mt-3 text-base font-medium text-white/95 md:text-lg">
                    Visitor Exit
                    <span className="mx-1 text-white/80">·</span>
                    <span className="font-urdu text-[1.05em]">وزیٹر کا اخراج</span>
                  </div>
                </div>
              </button>
            </div>
          </div>

          {/* Scheduled panel */}
          <div className="rounded-[20px] bg-white p-6 shadow-md shadow-black/8 ring-1 ring-black/5 lg:sticky lg:top-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="flex items-center gap-2 text-lg font-bold text-neutral-900 md:text-xl">
                <CalendarIcon className="h-6 w-6 text-[#2563eb]" aria-hidden />
                Approved Scheduled Faculty Guests ({filteredScheduledGuests.length})
              </h2>
            </div>
            <div className="mb-4">
              <input
                type="text"
                value={scheduledSearch}
                onChange={(e) => setScheduledSearch(e.target.value)}
                placeholder="Search by name, CNIC, phone, faculty..."
                className="w-full rounded-xl border border-neutral-200 bg-neutral-50/80 px-4 py-2.5 text-sm text-neutral-900 shadow-inner placeholder:text-neutral-400 focus:border-[#2563eb] focus:outline-none focus:ring-2 focus:ring-[#2563eb]/25"
              />
            </div>
            {filteredScheduledGuests.length === 0 ? (
              <div className="text-sm text-neutral-500">No approved scheduled guests.</div>
            ) : (
              <div className="space-y-2 max-h-[420px] overflow-y-auto">
                {filteredScheduledGuests.map((guest) => (
                  <div
                    key={guest.id}
                    className="rounded-xl border border-neutral-200 bg-neutral-50/50 p-3"
                  >
                    <div className="flex items-center justify-between">
                      <div className="font-semibold text-neutral-900">
                        {guest.guestFullName}
                      </div>
                      <div className="text-xs text-neutral-600 font-semibold">
                        {guest.approvalStatus}
                      </div>
                    </div>
                    <div className="text-xs text-neutral-700 mt-1 space-y-1">
                      <div>
                        CNIC: {guest.guestCNIC}
                        {guest.guestPhoneNumber && <span className="ml-3">Phone: {guest.guestPhoneNumber}</span>}
                      </div>
                      <div>
                        Date: {guest.visitDate.substring(0, 10)}
                        <span className="ml-3">Time: {guest.visitTime}</span>
                      </div>
                      <div>
                        Department: {guest.departmentName}
                      </div>
                      <div>
                        Faculty: <span>{guest.facultyFullName ?? 'Unknown faculty'}</span>
                      </div>
                      {guest.visitPurpose && (
                        <div>Purpose: {guest.visitPurpose}</div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Instructions */}
        <div className="mt-6 rounded-[20px] bg-white p-6 shadow-md shadow-black/8 ring-1 ring-black/5">
          <h2 className="mb-3 text-lg font-bold text-neutral-900">Quick Instructions</h2>
          <ul className="space-y-3 text-sm text-neutral-600">
            <li className="flex items-start gap-3">
              <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#00A651] text-xs font-bold text-white">✓</span>
              <span>
                <strong className="text-neutral-900">Check In:</strong> Scan ID card, enter phone number, select visitor type and destination, assign card number
              </span>
            </li>
            <li className="flex items-start gap-3">
              <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#ED1C24] text-xs font-bold text-white">✓</span>
              <span>
                <strong className="text-neutral-900">Check Out:</strong> Search by name, CNIC, or card number, then process exit
              </span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  )
}

