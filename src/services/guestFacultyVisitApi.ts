const API_BASE = 'https://server.access360.site:88'

export interface GuestFacultyVisit {
  id: number
  guestFullName: string
  guestCNIC?: string
  guestPhone?: string
  facultyName?: string
  facultyIdpk?: number
  scheduledDate?: string
  scheduledTime?: string
  purpose?: string
  status?: string
}

export interface GuestFacultyVisitActionPayload {
  id: number
  adminUserId: number
  remarks?: string | null
}

export interface ApiError {
  message: string
  errors?: Record<string, string[]>
}

/**
 * Get all pending guest faculty visits
 */
export const getPendingGuestFacultyVisits = async (): Promise<GuestFacultyVisit[]> => {
  try {
    const response = await fetch(`${API_BASE}/api/GuestFacultyVisit/GetPendingGuestFacultyVisits`, {
      method: 'GET',
      headers: {
        'accept': '*/*',
      },
    })

    if (!response.ok) {
      const errorData: ApiError = await response.json().catch(() => ({
        message: `HTTP error! status: ${response.status}`,
      }))
      throw errorData
    }

    const data = await response.json()
    return Array.isArray(data) ? data : []
  } catch (error) {
    console.error('Error fetching pending guest faculty visits:', error)
    throw error
  }
}

/**
 * Approve a guest faculty visit
 */
export const approveGuestFacultyVisit = async (payload: GuestFacultyVisitActionPayload): Promise<void> => {
  try {
    const response = await fetch(`${API_BASE}/api/GuestFacultyVisit/ApproveGuestFacultyVisit`, {
      method: 'POST',
      headers: {
        'accept': '*/*',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        id: payload.id,
        adminUserId: payload.adminUserId,
        remarks: payload.remarks ?? null,
      }),
    })

    if (!response.ok) {
      const errorData: ApiError = await response.json().catch(() => ({
        message: `HTTP error! status: ${response.status}`,
      }))
      throw errorData
    }
  } catch (error) {
    console.error('Error approving guest faculty visit:', error)
    throw error
  }
}

/**
 * Reject a guest faculty visit
 */
export const rejectGuestFacultyVisit = async (payload: GuestFacultyVisitActionPayload): Promise<void> => {
  try {
    const response = await fetch(`${API_BASE}/api/GuestFacultyVisit/RejectGuestFacultyVisit`, {
      method: 'POST',
      headers: {
        'accept': '*/*',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        id: payload.id,
        adminUserId: payload.adminUserId,
        remarks: payload.remarks ?? null,
      }),
    })

    if (!response.ok) {
      const errorData: ApiError = await response.json().catch(() => ({
        message: `HTTP error! status: ${response.status}`,
      }))
      throw errorData
    }
  } catch (error) {
    console.error('Error rejecting guest faculty visit:', error)
    throw error
  }
}

