import { createApiUrl, GUEST_ENDPOINTS } from '../data/global'

// ==================== Guest Types ====================

export interface Guest {
  idpk: number
  fullName: string
  fatherName: string
  gender?: string | null
  country?: string | null
  dob?: string | null
  cnicNumber: string
  phoneNumber: string
  address: string
  guestCode: string
  guestStatus?: boolean | null
  guestCreatedBy?: string | null
  guestCreatedAt?: string | null
  guestUpdatedBy?: string | null
  guestUpdatedAt?: string | null
}

export interface CreateGuestDto {
  Idpk: number
  FullName: string
  FatherName: string
  Gender?: string | null
  Country?: string | null
  DOB?: string | null
  CNICNumber: string
  PhoneNumber: string
  Address: string
  GuestCode: string
  GuestStatus?: boolean | null
  GuestCreatedBy?: string | null
}

export interface UpdateGuestDto {
  FullName: string
  FatherName: string
  Gender?: string | null
  Country?: string | null
  DOB?: string | null
  CNICNumber: string
  PhoneNumber: string
  Address: string
  GuestCode: string
  GuestStatus?: boolean | null
  GuestUpdatedBy?: string | null
}

export interface ApiError {
  message: string
  status?: number
  errors?: Record<string, string[]>
}

// ==================== Guest API ====================

export const getAllGuests = async (): Promise<Guest[]> => {
  try {
    const response = await fetch(createApiUrl(GUEST_ENDPOINTS.GET_ALL), {
      method: 'GET',
      headers: { 'accept': '*/*' },
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw {
        message: errorData.message || `HTTP error! status: ${response.status}`,
        status: response.status,
        errors: errorData.errors,
      } as ApiError
    }

    return await response.json()
  } catch (error) {
    if (error && typeof error === 'object' && 'message' in error) {
      throw error as ApiError
    }
    throw { message: 'Network error: Failed to fetch guests', status: 0 } as ApiError
  }
}

export const getGuestById = async (id: number): Promise<Guest> => {
  try {
    const url = createApiUrl(GUEST_ENDPOINTS.GET_BY_ID.replace('{id}', id.toString()))
    const response = await fetch(url, {
      method: 'GET',
      headers: { 'accept': '*/*' },
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw {
        message: errorData.message || `HTTP error! status: ${response.status}`,
        status: response.status,
        errors: errorData.errors,
      } as ApiError
    }

    return await response.json()
  } catch (error) {
    if (error && typeof error === 'object' && 'message' in error) {
      throw error as ApiError
    }
    throw { message: 'Network error: Failed to fetch guest', status: 0 } as ApiError
  }
}

export const getGuestByCode = async (code: string): Promise<Guest> => {
  try {
    const url = createApiUrl(GUEST_ENDPOINTS.GET_BY_CODE.replace('{code}', encodeURIComponent(code)))
    const response = await fetch(url, {
      method: 'GET',
      headers: { 'accept': '*/*' },
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw {
        message: errorData.message || `HTTP error! status: ${response.status}`,
        status: response.status,
        errors: errorData.errors,
      } as ApiError
    }

    return await response.json()
  } catch (error) {
    if (error && typeof error === 'object' && 'message' in error) {
      throw error as ApiError
    }
    throw { message: 'Network error: Failed to fetch guest', status: 0 } as ApiError
  }
}

export const getGuestByCNIC = async (cnic: string): Promise<Guest> => {
  try {
    const url = createApiUrl(GUEST_ENDPOINTS.GET_BY_CNIC.replace('{cnic}', encodeURIComponent(cnic)))
    const response = await fetch(url, {
      method: 'GET',
      headers: { 'accept': '*/*' },
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw {
        message: errorData.message || `HTTP error! status: ${response.status}`,
        status: response.status,
        errors: errorData.errors,
      } as ApiError
    }

    return await response.json()
  } catch (error) {
    if (error && typeof error === 'object' && 'message' in error) {
      throw error as ApiError
    }
    throw { message: 'Network error: Failed to fetch guest', status: 0 } as ApiError
  }
}

export const createGuest = async (guest: Partial<Guest>): Promise<any> => {
  try {
    const dto: CreateGuestDto = {
      Idpk: guest.idpk || 1,
      FullName: guest.fullName || '',
      FatherName: guest.fatherName || '',
      Gender: guest.gender || null,
      Country: guest.country || null,
      DOB: guest.dob || null,
      CNICNumber: guest.cnicNumber || '',
      PhoneNumber: guest.phoneNumber || '',
      Address: guest.address || '',
      GuestCode: guest.guestCode || '',
      GuestStatus: guest.guestStatus ?? true,
      GuestCreatedBy: guest.guestCreatedBy || 'System',
    }

    const response = await fetch(createApiUrl(GUEST_ENDPOINTS.CREATE), {
      method: 'POST',
      headers: {
        'accept': '*/*',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(dto),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      if (response.status === 400 && errorData.errors) {
        const validationErrors = Object.entries(errorData.errors)
          .map(([key, value]: [string, any]) => `${key}: ${Array.isArray(value) ? value.join(', ') : value}`)
          .join('; ')
        throw {
          message: validationErrors || errorData.message || 'Validation error',
          status: response.status,
          errors: errorData.errors,
        } as ApiError
      }
      throw {
        message: errorData.message || `HTTP error! status: ${response.status}`,
        status: response.status,
        errors: errorData.errors,
      } as ApiError
    }

    return await response.json()
  } catch (error) {
    if (error && typeof error === 'object' && 'message' in error) {
      throw error as ApiError
    }
    throw { message: 'Network error: Failed to create guest', status: 0 } as ApiError
  }
}

export const updateGuest = async (id: number, guest: UpdateGuestDto): Promise<any> => {
  try {
    const url = createApiUrl(GUEST_ENDPOINTS.UPDATE.replace('{id}', id.toString()))
    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        'accept': '*/*',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(guest),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      if (response.status === 400 && errorData.errors) {
        const validationErrors = Object.entries(errorData.errors)
          .map(([key, value]: [string, any]) => `${key}: ${Array.isArray(value) ? value.join(', ') : value}`)
          .join('; ')
        throw {
          message: validationErrors || errorData.message || 'Validation error',
          status: response.status,
          errors: errorData.errors,
        } as ApiError
      }
      throw {
        message: errorData.message || `HTTP error! status: ${response.status}`,
        status: response.status,
        errors: errorData.errors,
      } as ApiError
    }

    return await response.json()
  } catch (error) {
    if (error && typeof error === 'object' && 'message' in error) {
      throw error as ApiError
    }
    throw { message: 'Network error: Failed to update guest', status: 0 } as ApiError
  }
}

export const deleteGuest = async (id: number): Promise<any> => {
  try {
    const url = createApiUrl(GUEST_ENDPOINTS.DELETE.replace('{id}', id.toString()))
    const response = await fetch(url, {
      method: 'DELETE',
      headers: { 'accept': '*/*' },
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw {
        message: errorData.message || `HTTP error! status: ${response.status}`,
        status: response.status,
        errors: errorData.errors,
      } as ApiError
    }

    return await response.json()
  } catch (error) {
    if (error && typeof error === 'object' && 'message' in error) {
      throw error as ApiError
    }
    throw { message: 'Network error: Failed to delete guest', status: 0 } as ApiError
  }
}

