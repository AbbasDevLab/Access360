import { createApiUrl, VISITOR_TYPE_ENDPOINTS } from '../data/global'

// ==================== Visitor Type Types ====================

export interface VisitorType {
  idpk: number
  vTypeName: string
  vTypeStatus?: boolean | null
  vTypeCreatedBy?: string | null
  vTypeCreatedAt?: string | null
  vTypeUpdatedBy?: string | null
  vTypeUpdatedAt?: string | null
}

export interface CreateVisitorTypeDto {
  Idpk: number
  VTypeName: string
  VTypeStatus?: boolean | null
  VTypeCreatedBy?: string | null
}

export interface UpdateVisitorTypeDto {
  VTypeName: string
  VTypeStatus?: boolean | null
  VTypeUpdatedBy?: string | null
}

export interface ApiError {
  message: string
  status?: number
  errors?: Record<string, string[]>
}

// ==================== Visitor Type API ====================

export const getAllVisitorTypes = async (): Promise<VisitorType[]> => {
  try {
    const response = await fetch(createApiUrl(VISITOR_TYPE_ENDPOINTS.GET_ALL), {
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
    throw { message: 'Network error: Failed to fetch visitor types', status: 0 } as ApiError
  }
}

export const getVisitorTypeById = async (id: number): Promise<VisitorType> => {
  try {
    const url = createApiUrl(VISITOR_TYPE_ENDPOINTS.GET_BY_ID.replace('{id}', id.toString()))
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
    throw { message: 'Network error: Failed to fetch visitor type', status: 0 } as ApiError
  }
}

export const createVisitorType = async (visitorType: Partial<VisitorType>): Promise<any> => {
  try {
    const dto: CreateVisitorTypeDto = {
      Idpk: visitorType.idpk || 1,
      VTypeName: visitorType.vTypeName || '',
      VTypeStatus: visitorType.vTypeStatus ?? true,
      VTypeCreatedBy: visitorType.vTypeCreatedBy || 'System',
    }

    const response = await fetch(createApiUrl(VISITOR_TYPE_ENDPOINTS.CREATE), {
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
    throw { message: 'Network error: Failed to create visitor type', status: 0 } as ApiError
  }
}

export const updateVisitorType = async (id: number, visitorType: UpdateVisitorTypeDto): Promise<any> => {
  try {
    const url = createApiUrl(VISITOR_TYPE_ENDPOINTS.UPDATE.replace('{id}', id.toString()))
    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        'accept': '*/*',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(visitorType),
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
    throw { message: 'Network error: Failed to update visitor type', status: 0 } as ApiError
  }
}

export const deleteVisitorType = async (id: number): Promise<any> => {
  try {
    const url = createApiUrl(VISITOR_TYPE_ENDPOINTS.DELETE.replace('{id}', id.toString()))
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
    throw { message: 'Network error: Failed to delete visitor type', status: 0 } as ApiError
  }
}

