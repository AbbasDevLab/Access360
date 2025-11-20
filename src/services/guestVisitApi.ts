import { createApiUrl, GUEST_VISIT_ENDPOINTS } from '../data/global'

// ==================== Guest Visit Types ====================

export interface GuestVisit {
  idpk: number
  guestID: number
  guestCode: string
  visitorTypeId?: number | null
  departmentCategoryIdpk?: number | null
  departmentIdpk?: number | null
  timeIn?: string | null
  timeOut?: string | null
  maxTimeMinutes?: number | null
  timeStayedIn?: number | null
  notes?: string | null
  visitPurpose?: string | null
  isAppointment?: boolean | null
  isEscortRequired?: boolean | null
  rfidCardNumber?: string | null
  imagePath?: string | null
  isRFIDCardReturned?: boolean | null
  guest?: any
  visitorType?: any
  departmentCategory?: any
  department?: any
}

export interface CreateGuestVisitDto {
  Idpk: number
  GuestID: number
  GuestCode: string
  VisitorTypeId?: number | null
  DepartmentCategoryIdpk?: number | null
  DepartmentIdpk?: number | null
  TimeIn?: string | null
  MaxTimeMinutes?: number | null
  Notes?: string | null
  VisitPurpose?: string | null
  IsAppointment?: boolean | null
  IsEscortRequired?: boolean | null
  RFIDCardNumber?: string | null
  ImagePath?: string | null
}

export interface UpdateGuestVisitDto {
  VisitorTypeId?: number | null
  DepartmentCategoryIdpk?: number | null
  DepartmentIdpk?: number | null
  TimeIn?: string | null
  TimeOut?: string | null
  MaxTimeMinutes?: number | null
  TimeStayedIn?: number | null
  Notes?: string | null
  VisitPurpose?: string | null
  IsAppointment?: boolean | null
  IsEscortRequired?: boolean | null
  RFIDCardNumber?: string | null
  ImagePath?: string | null
  IsRFIDCardReturned?: boolean | null
}

export interface ApiError {
  message: string
  status?: number
  errors?: Record<string, string[]>
}

// ==================== Guest Visit API ====================

export const getAllGuestVisits = async (): Promise<GuestVisit[]> => {
  try {
    const response = await fetch(createApiUrl(GUEST_VISIT_ENDPOINTS.GET_ALL), {
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
    throw { message: 'Network error: Failed to fetch guest visits', status: 0 } as ApiError
  }
}

export const getGuestVisitById = async (id: number): Promise<GuestVisit> => {
  try {
    const url = createApiUrl(GUEST_VISIT_ENDPOINTS.GET_BY_ID.replace('{id}', id.toString()))
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
    throw { message: 'Network error: Failed to fetch guest visit', status: 0 } as ApiError
  }
}

export const getGuestVisitsByGuestId = async (guestId: number): Promise<GuestVisit[]> => {
  try {
    const url = createApiUrl(GUEST_VISIT_ENDPOINTS.GET_BY_GUEST.replace('{guestId}', guestId.toString()))
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
    throw { message: 'Network error: Failed to fetch guest visits', status: 0 } as ApiError
  }
}

export const getActiveGuestVisits = async (): Promise<GuestVisit[]> => {
  try {
    const response = await fetch(createApiUrl(GUEST_VISIT_ENDPOINTS.GET_ACTIVE), {
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
    throw { message: 'Network error: Failed to fetch active guest visits', status: 0 } as ApiError
  }
}

export const createGuestVisit = async (visit: Partial<GuestVisit>): Promise<any> => {
  try {
    const dto: CreateGuestVisitDto = {
      Idpk: 0, // Auto increment - always set to 0
      GuestID: visit.guestID || 0,
      GuestCode: visit.guestCode || '',
      VisitorTypeId: visit.visitorTypeId || null,
      DepartmentCategoryIdpk: visit.departmentCategoryIdpk || null,
      DepartmentIdpk: visit.departmentIdpk || null,
      TimeIn: visit.timeIn || new Date().toISOString(),
      MaxTimeMinutes: visit.maxTimeMinutes || null,
      Notes: visit.notes || null,
      VisitPurpose: visit.visitPurpose || null,
      IsAppointment: visit.isAppointment ?? false,
      IsEscortRequired: visit.isEscortRequired ?? false,
      RFIDCardNumber: visit.rfidCardNumber || null,
      ImagePath: visit.imagePath || null,
    }

    const response = await fetch(createApiUrl(GUEST_VISIT_ENDPOINTS.CREATE), {
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
    throw { message: 'Network error: Failed to create guest visit', status: 0 } as ApiError
  }
}

export const updateGuestVisit = async (id: number, visit: UpdateGuestVisitDto): Promise<any> => {
  try {
    const url = createApiUrl(GUEST_VISIT_ENDPOINTS.UPDATE.replace('{id}', id.toString()))
    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        'accept': '*/*',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(visit),
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
    throw { message: 'Network error: Failed to update guest visit', status: 0 } as ApiError
  }
}

export const deleteGuestVisit = async (id: number): Promise<any> => {
  try {
    const url = createApiUrl(GUEST_VISIT_ENDPOINTS.DELETE.replace('{id}', id.toString()))
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
    throw { message: 'Network error: Failed to delete guest visit', status: 0 } as ApiError
  }
}

