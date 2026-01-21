import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowRightOnRectangleIcon, PlusIcon, CheckCircleIcon, XCircleIcon, ClockIcon } from '@heroicons/react/24/outline'
import { getScheduledGuestsByFaculty, createScheduledGuest, type ScheduledGuest, type CreateScheduledGuestDto } from '../services/scheduledGuestsApi'

export default function FacultyDashboardRoute(): React.JSX.Element {
  const [faculty, setFaculty] = useState<any>(null)
  const [scheduledGuests, setScheduledGuests] = useState<ScheduledGuest[]>([])
  const [showForm, setShowForm] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState<CreateScheduledGuestDto>({
    GuestFullName: '',
    GuestCNIC: '',
    GuestPhone: '',
    GuestEmail: '',
    CarNumber: '',
    ScheduledDate: '',
    ScheduledTime: '',
    Purpose: '',
    FacultyIdpk: 0,
  })
  const navigate = useNavigate()

  useEffect(() => {
    const stored = localStorage.getItem('facultyUser')
    if (!stored) {
      navigate('/faculty/login')
      return
    }
    try {
      const user = JSON.parse(stored)
      if (user.loggedIn) {
        const facultyIdpk = user.facultyIdpk ?? user.idpk ?? user.id ?? user.Id ?? user.ID
        const normalizedId = typeof facultyIdpk === 'string' ? parseInt(facultyIdpk, 10) : facultyIdpk
        if (!Number.isFinite(normalizedId)) {
          navigate('/faculty/login')
          return
        }
        setFaculty(user)
        setFormData(prev => ({ ...prev, FacultyIdpk: normalizedId }))
        loadScheduledGuests(normalizedId)
      } else {
        navigate('/faculty/login')
      }
    } catch (e) {
      navigate('/faculty/login')
    }
  }, [navigate])

  const loadScheduledGuests = async (facultyId: number) => {
    try {
      const guests = await getScheduledGuestsByFaculty(facultyId)
      setScheduledGuests(guests)
    } catch (error) {
      console.error('Error loading scheduled guests:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    try {
      const facultyIdpk = faculty?.facultyIdpk ?? faculty?.idpk ?? faculty?.id ?? faculty?.Id ?? faculty?.ID
      const normalizedId = typeof facultyIdpk === 'string' ? parseInt(facultyIdpk, 10) : facultyIdpk
      if (!Number.isFinite(normalizedId)) {
        alert('Faculty ID missing. Please log in again.')
        return
      }
      await createScheduledGuest({ ...formData, FacultyIdpk: normalizedId })
      setFormData({
        GuestFullName: '',
        GuestCNIC: '',
        GuestPhone: '',
        GuestEmail: '',
        CarNumber: '',
        ScheduledDate: '',
        ScheduledTime: '',
        Purpose: '',
        FacultyIdpk: normalizedId,
      })
      setShowForm(false)
      await loadScheduledGuests(normalizedId)
    } catch (error: any) {
      alert(error.message || 'Failed to create scheduled guest request')
    } finally {
      setIsLoading(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('facultyUser')
    navigate('/faculty/login')
  }

  const getStatusBadge = (status: string, visitStatus?: string) => {
    if (visitStatus === 'Arrived') {
      return <span className="px-2 py-1 bg-green-500/20 text-green-300 rounded text-xs font-medium">Arrived</span>
    }
    if (visitStatus === 'NoShow') {
      return <span className="px-2 py-1 bg-red-500/20 text-red-300 rounded text-xs font-medium">No Show</span>
    }

    switch (status) {
      case 'Approved':
        return <span className="px-2 py-1 bg-green-500/20 text-green-300 rounded text-xs font-medium">Approved</span>
      case 'Rejected':
        return <span className="px-2 py-1 bg-red-500/20 text-red-300 rounded text-xs font-medium">Rejected</span>
      default:
        return <span className="px-2 py-1 bg-yellow-500/20 text-yellow-300 rounded text-xs font-medium">Pending</span>
    }
  }

  if (!faculty) return null

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-800 to-neutral-900 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-neutral-700 rounded-xl shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-neutral-100">Faculty Portal</h1>
              <p className="text-neutral-300 mt-1">Welcome, {faculty.facultyFullName}</p>
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

        {/* Action Button */}
        <div className="mb-6">
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
          >
            <PlusIcon className="w-5 h-5" />
            Schedule New Guest
          </button>
        </div>

        {/* Schedule Form */}
        {showForm && (
          <div className="bg-neutral-700 rounded-xl shadow-lg p-6 mb-6">
            <h2 className="text-xl font-bold text-neutral-100 mb-4">Schedule Guest</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-200 mb-2">Guest Full Name *</label>
                  <input
                    type="text"
                    value={formData.GuestFullName}
                    onChange={(e) => setFormData({ ...formData, GuestFullName: e.target.value })}
                    required
                    className="w-full px-4 py-2 bg-neutral-600 border border-neutral-500 rounded-lg text-neutral-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-200 mb-2">CNIC Number *</label>
                  <input
                    type="text"
                    value={formData.GuestCNIC}
                    onChange={(e) => setFormData({ ...formData, GuestCNIC: e.target.value })}
                    required
                    placeholder="35202-1234567-1"
                    className="w-full px-4 py-2 bg-neutral-600 border border-neutral-500 rounded-lg text-neutral-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-200 mb-2">Phone Number *</label>
                  <input
                    type="tel"
                    value={formData.GuestPhone}
                    onChange={(e) => setFormData({ ...formData, GuestPhone: e.target.value })}
                    required
                    className="w-full px-4 py-2 bg-neutral-600 border border-neutral-500 rounded-lg text-neutral-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-200 mb-2">Email</label>
                  <input
                    type="email"
                    value={formData.GuestEmail}
                    onChange={(e) => setFormData({ ...formData, GuestEmail: e.target.value })}
                    className="w-full px-4 py-2 bg-neutral-600 border border-neutral-500 rounded-lg text-neutral-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-200 mb-2">Car Number (if arriving by car)</label>
                  <input
                    type="text"
                    value={formData.CarNumber}
                    onChange={(e) => setFormData({ ...formData, CarNumber: e.target.value })}
                    placeholder="ABC-123"
                    className="w-full px-4 py-2 bg-neutral-600 border border-neutral-500 rounded-lg text-neutral-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-200 mb-2">Scheduled Date *</label>
                  <input
                    type="date"
                    value={formData.ScheduledDate}
                    onChange={(e) => setFormData({ ...formData, ScheduledDate: e.target.value })}
                    required
                    className="w-full px-4 py-2 bg-neutral-600 border border-neutral-500 rounded-lg text-neutral-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-200 mb-2">Scheduled Time *</label>
                  <input
                    type="time"
                    value={formData.ScheduledTime}
                    onChange={(e) => setFormData({ ...formData, ScheduledTime: e.target.value })}
                    required
                    className="w-full px-4 py-2 bg-neutral-600 border border-neutral-500 rounded-lg text-neutral-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-200 mb-2">Purpose *</label>
                  <input
                    type="text"
                    value={formData.Purpose}
                    onChange={(e) => setFormData({ ...formData, Purpose: e.target.value })}
                    required
                    className="w-full px-4 py-2 bg-neutral-600 border border-neutral-500 rounded-lg text-neutral-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div className="flex gap-4">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium disabled:opacity-50"
                >
                  {isLoading ? 'Submitting...' : 'Submit Request'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-6 py-2 bg-neutral-600 hover:bg-neutral-500 text-neutral-100 rounded-lg font-medium"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Scheduled Guests List */}
        <div className="bg-neutral-700 rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-bold text-neutral-100 mb-4">My Scheduled Guests</h2>
          {scheduledGuests.length === 0 ? (
            <p className="text-neutral-400 text-center py-8">No scheduled guests yet</p>
          ) : (
            <div className="space-y-3">
              {scheduledGuests.map((guest) => (
                <div
                  key={guest.idpk}
                  className="bg-neutral-600 rounded-lg p-4 border border-neutral-500"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-neutral-100">{guest.guestFullName}</h3>
                        {getStatusBadge(guest.status, guest.visitStatus)}
                      </div>
                      <div className="grid md:grid-cols-2 gap-2 text-sm text-neutral-300">
                        <div><strong>CNIC:</strong> {guest.guestCNIC}</div>
                        <div><strong>Phone:</strong> {guest.guestPhone}</div>
                        {guest.carNumber && <div><strong>Car:</strong> {guest.carNumber}</div>}
                        <div className="flex items-center gap-1">
                          <ClockIcon className="w-4 h-4" />
                          <strong>Date:</strong> {new Date(guest.scheduledDate).toLocaleDateString()} at {guest.scheduledTime}
                        </div>
                        <div><strong>Purpose:</strong> {guest.purpose}</div>
                        {guest.arrivedAt && (
                          <div><strong>Arrived At:</strong> {new Date(guest.arrivedAt).toLocaleString()}</div>
                        )}
                        {guest.visitStatus === 'NoShow' && (
                          <div><strong>Visit Status:</strong> No Show</div>
                        )}
                      </div>
                      {guest.rejectionReason && (
                        <div className="mt-2 text-sm text-red-300">
                          <strong>Rejection Reason:</strong> {guest.rejectionReason}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

