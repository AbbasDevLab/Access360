import { createApiUrl, LOCATION_ENDPOINTS } from '../data/global'

// ==================== Location Types ====================

export interface Location {
  idpk: number
  locPrefix: string
  locName: string
  locStatus: boolean
  locLogo?: string | null
  locPhone?: string | null
  locEmail?: string | null
  locRepresentative?: string | null
  locRepresentativeNumber?: string | null
  locRepresentativeEmail?: string | null
  locCode?: string | null
  locCreatedBy?: string | null
  locCreatedAt?: string | null
  locUpdatedBy?: string | null
  locUpdatedAt?: string | null
}

export interface CreateLocationDto {
  Idpk: number
  LocPrefix: string
  LocName: string
  LocStatus: boolean
  LocLogo?: string | null
  LocPhone?: string | null
  LocEmail?: string | null
  LocRepresentative?: string | null
  LocRepresentativeNumber?: string | null
  LocRepresentativeEmail?: string | null
  LocCode?: string | null
  LocCreatedBy?: string | null
}

export interface UpdateLocationDto {
  LocPrefix: string
  LocName: string
  LocStatus: boolean
  LocLogo?: string | null
  LocPhone?: string | null
  LocEmail?: string | null
  LocRepresentative?: string | null
  LocRepresentativeNumber?: string | null
  LocRepresentativeEmail?: string | null
  LocCode?: string | null
  LocUpdatedBy?: string | null
}

export interface ApiError {
  message: string
  status?: number
  errors?: Record<string, string[]>
}

// ==================== Location API ====================

export const getAllLocations = async (): Promise<Location[]> => {
  try {
    const response = await fetch(createApiUrl(LOCATION_ENDPOINTS.GET_ALL), {
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
    throw { message: 'Network error: Failed to fetch locations', status: 0 } as ApiError
  }
}

export const getLocationById = async (id: number): Promise<Location> => {
  try {
    const url = createApiUrl(LOCATION_ENDPOINTS.GET_BY_ID.replace('{id}', id.toString()))
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
    throw { message: 'Network error: Failed to fetch location', status: 0 } as ApiError
  }
}

export const createLocation = async (location: Partial<Location>): Promise<any> => {
  try {
    const dto: CreateLocationDto = {
      Idpk: 0, // Auto-increment - always set to 0
      LocPrefix: location.locPrefix || '',
      LocName: location.locName || '',
      LocStatus: location.locStatus ?? true,
      LocLogo: location.locLogo || null,
      LocPhone: location.locPhone || null,
      LocEmail: location.locEmail || null,
      LocRepresentative: location.locRepresentative || null,
      LocRepresentativeNumber: location.locRepresentativeNumber || null,
      LocRepresentativeEmail: location.locRepresentativeEmail || null,
      LocCode: location.locCode || null,
      LocCreatedBy: location.locCreatedBy || 'System',
    }

    const response = await fetch(createApiUrl(LOCATION_ENDPOINTS.CREATE), {
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
    throw { message: 'Network error: Failed to create location', status: 0 } as ApiError
  }
}

export const updateLocation = async (id: number, location: UpdateLocationDto): Promise<any> => {
  try {
    const url = createApiUrl(LOCATION_ENDPOINTS.UPDATE.replace('{id}', id.toString()))
    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        'accept': '*/*',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(location),
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
    throw { message: 'Network error: Failed to update location', status: 0 } as ApiError
  }
}

export const deleteLocation = async (id: number): Promise<any> => {
  try {
    const url = createApiUrl(LOCATION_ENDPOINTS.DELETE.replace('{id}', id.toString()))
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
    throw { message: 'Network error: Failed to delete location', status: 0 } as ApiError
  }
}

