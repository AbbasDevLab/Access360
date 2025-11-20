import { createApiUrl, ADMIN_ENDPOINTS } from '../data/global'

// ==================== Guard Types ====================

export interface Guard {
  id: string
  guardFullName: string
  guardCode?: string | null
  username: string
  guardEmail: string
  guardPassword?: string
  guardPhone?: string | null
  guardStatus: boolean
  guardLocationIdpk?: number | null
  guardIsDisabled: boolean
  guardCreatedBy?: string | null
  guardCreatedAt?: string | null
  guardUpdatedBy?: string | null
  guardUpdatedAt?: string | null
  location?: any
}

export interface CreateGuardDto {
  Id: string
  GuardFullName: string
  GuardCode?: string | null
  Username: string
  GuardEmail: string
  GuardPassword: string
  GuardPhone?: string | null
  GuardStatus: boolean
  GuardLocationIdpk?: number | null
  GuardIsDisabled: boolean
  GuardCreatedBy?: string | null
}

export interface UpdateGuardDto {
  GuardFullName: string
  GuardCode?: string | null
  Username: string
  GuardEmail: string
  GuardPhone?: string | null
  GuardStatus: boolean
  GuardLocationIdpk?: number | null
  GuardIsDisabled: boolean
  GuardUpdatedBy?: string | null
}

export interface ApiError {
  message: string
  status?: number
  errors?: Record<string, string[]>
}

// ==================== Guard API ====================

export const getAllGuards = async (): Promise<Guard[]> => {
  try {
    const response = await fetch(createApiUrl(ADMIN_ENDPOINTS.GET_GUARDS), {
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
    throw { message: 'Network error: Failed to fetch guards', status: 0 } as ApiError
  }
}

export const getGuardById = async (id: string): Promise<Guard> => {
  try {
    const url = createApiUrl(ADMIN_ENDPOINTS.GET_GUARD_BY_ID.replace('{id}', encodeURIComponent(id)))
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
    throw { message: 'Network error: Failed to fetch guard', status: 0 } as ApiError
  }
}

export const createGuard = async (guard: Partial<Guard>): Promise<any> => {
  try {
    const dto: CreateGuardDto = {
      Id: guard.id || '',
      GuardFullName: guard.guardFullName || '',
      GuardCode: guard.guardCode || null,
      Username: guard.username || '',
      GuardEmail: guard.guardEmail || '',
      GuardPassword: guard.guardPassword || '',
      GuardPhone: guard.guardPhone || null,
      GuardStatus: guard.guardStatus ?? true,
      GuardLocationIdpk: guard.guardLocationIdpk || null,
      GuardIsDisabled: guard.guardIsDisabled ?? false,
      GuardCreatedBy: guard.guardCreatedBy || 'System',
    }

    const response = await fetch(createApiUrl(ADMIN_ENDPOINTS.CREATE_GUARD), {
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
    throw { message: 'Network error: Failed to create guard', status: 0 } as ApiError
  }
}

export const updateGuard = async (id: string, guard: UpdateGuardDto): Promise<any> => {
  try {
    const url = createApiUrl(ADMIN_ENDPOINTS.UPDATE_GUARD.replace('{id}', encodeURIComponent(id)))
    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        'accept': '*/*',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(guard),
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
    throw { message: 'Network error: Failed to update guard', status: 0 } as ApiError
  }
}

export const deleteGuard = async (id: string): Promise<void> => {
  try {
    const url = createApiUrl(ADMIN_ENDPOINTS.DELETE_GUARD.replace('{id}', encodeURIComponent(id)))
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
  } catch (error) {
    if (error && typeof error === 'object' && 'message' in error) {
      throw error as ApiError
    }
    throw { message: 'Network error: Failed to delete guard', status: 0 } as ApiError
  }
}

