import { createApiUrl, ADMIN_ENDPOINTS } from '../data/global'

export interface ScheduledGuest {
  idpk: number
  guestFullName: string
  guestCNIC: string
  guestPhone: string
  guestEmail?: string
  carNumber?: string
  scheduledDate: string
  scheduledTime: string
  purpose: string
  facultyIdpk: number
  facultyName?: string
  status: 'Pending' | 'Approved' | 'Rejected'
  visitStatus?: 'Arrived' | 'NoShow'
  arrivedAt?: string
  noShowAt?: string
  approvedBy?: string
  approvedAt?: string
  rejectionReason?: string
  createdAt: string
  createdBy: string
}

export interface CreateScheduledGuestDto {
  GuestFullName: string
  GuestCNIC: string
  GuestPhone: string
  GuestEmail?: string
  CarNumber?: string
  ScheduledDate: string
  ScheduledTime: string
  Purpose: string
  FacultyIdpk: number
}

export interface ApiError {
  message: string
  errors?: Record<string, string[]>
}

/**
 * Get all scheduled guests
 */
export const getAllScheduledGuests = async (): Promise<ScheduledGuest[]> => {
  try {
    const response = await fetch(createApiUrl(ADMIN_ENDPOINTS.GET_SCHEDULED_GUESTS), {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
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
    console.error('Error fetching scheduled guests:', error)
    throw error
  }
}

/**
 * Get approved scheduled guests (for guard dashboard)
 */
export const getApprovedScheduledGuests = async (): Promise<ScheduledGuest[]> => {
  try {
    const response = await fetch(createApiUrl(ADMIN_ENDPOINTS.GET_APPROVED_SCHEDULED_GUESTS), {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
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
    console.error('Error fetching approved scheduled guests:', error)
    throw error
  }
}

/**
 * Get scheduled guests by faculty ID
 */
export const getScheduledGuestsByFaculty = async (facultyId: number): Promise<ScheduledGuest[]> => {
  try {
    const url = createApiUrl(ADMIN_ENDPOINTS.GET_SCHEDULED_GUESTS_BY_FACULTY.replace('{facultyId}', facultyId.toString()))
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
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
    console.error('Error fetching scheduled guests by faculty:', error)
    throw error
  }
}

/**
 * Create a scheduled guest request
 */
export const createScheduledGuest = async (dto: CreateScheduledGuestDto): Promise<ScheduledGuest> => {
  try {
    const response = await fetch(createApiUrl(ADMIN_ENDPOINTS.CREATE_SCHEDULED_GUEST), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(dto),
    })

    if (!response.ok) {
      const errorData: ApiError = await response.json().catch(() => ({
        message: `HTTP error! status: ${response.status}`,
      }))
      throw errorData
    }

    return await response.json()
  } catch (error) {
    console.error('Error creating scheduled guest:', error)
    throw error
  }
}

/**
 * Approve a scheduled guest
 */
export const approveScheduledGuest = async (id: number): Promise<ScheduledGuest> => {
  try {
    const url = createApiUrl(ADMIN_ENDPOINTS.APPROVE_SCHEDULED_GUEST.replace('{id}', id.toString()))
    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      const errorData: ApiError = await response.json().catch(() => ({
        message: `HTTP error! status: ${response.status}`,
      }))
      throw errorData
    }

    return await response.json()
  } catch (error) {
    console.error('Error approving scheduled guest:', error)
    throw error
  }
}

/**
 * Reject a scheduled guest
 */
export const rejectScheduledGuest = async (id: number, reason?: string): Promise<ScheduledGuest> => {
  try {
    const url = createApiUrl(ADMIN_ENDPOINTS.REJECT_SCHEDULED_GUEST.replace('{id}', id.toString()))
    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ RejectionReason: reason || '' }),
    })

    if (!response.ok) {
      const errorData: ApiError = await response.json().catch(() => ({
        message: `HTTP error! status: ${response.status}`,
      }))
      throw errorData
    }

    return await response.json()
  } catch (error) {
    console.error('Error rejecting scheduled guest:', error)
    throw error
  }
}

/**
 * Mark a scheduled guest as arrived (guard check-in)
 */
export const markScheduledGuestArrived = async (id: number): Promise<ScheduledGuest> => {
  try {
    const url = createApiUrl(ADMIN_ENDPOINTS.MARK_SCHEDULED_GUEST_ARRIVED.replace('{id}', id.toString()))
    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      const errorData: ApiError = await response.json().catch(() => ({
        message: `HTTP error! status: ${response.status}`,
      }))
      throw errorData
    }

    return await response.json()
  } catch (error) {
    console.error('Error marking scheduled guest arrived:', error)
    throw error
  }
}

/**
 * Mark a scheduled guest as no-show (auto or manual)
 */
export const markScheduledGuestNoShow = async (id: number): Promise<ScheduledGuest> => {
  try {
    const url = createApiUrl(ADMIN_ENDPOINTS.MARK_SCHEDULED_GUEST_NO_SHOW.replace('{id}', id.toString()))
    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      const errorData: ApiError = await response.json().catch(() => ({
        message: `HTTP error! status: ${response.status}`,
      }))
      throw errorData
    }

    return await response.json()
  } catch (error) {
    console.error('Error marking scheduled guest no-show:', error)
    throw error
  }
}

/**
 * Delete a scheduled guest
 */
export const deleteScheduledGuest = async (id: number): Promise<void> => {
  try {
    const url = createApiUrl(ADMIN_ENDPOINTS.DELETE_SCHEDULED_GUEST.replace('{id}', id.toString()))
    const response = await fetch(url, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      const errorData: ApiError = await response.json().catch(() => ({
        message: `HTTP error! status: ${response.status}`,
      }))
      throw errorData
    }
  } catch (error) {
    console.error('Error deleting scheduled guest:', error)
    throw error
  }
}

