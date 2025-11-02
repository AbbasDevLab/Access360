import { createApiUrl, DEPARTMENT_ENDPOINTS } from '../data/global'

export interface DepartmentCategory {
  id?: number
  idpk?: number
  categoryName: string
  categoryStatus: boolean
  categoryCreatedBy?: string
}

export interface CreateCategoryResponse {
  id: number
  categoryName: string
  categoryStatus: boolean
  message: string
}

export interface ApiError {
  message: string
  status?: number
}

// Create a new department category
export const createDepartmentCategory = async (
  category: DepartmentCategory
): Promise<CreateCategoryResponse> => {
  try {
    const response = await fetch(createApiUrl(DEPARTMENT_ENDPOINTS.CREATE_CATEGORY), {
      method: 'POST',
      headers: {
        'accept': '*/*',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        idpk: category.idpk || 1,
        categoryName: category.categoryName,
        categoryStatus: category.categoryStatus,
        categoryCreatedBy: category.categoryCreatedBy || '1',
      }),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw {
        message: errorData.message || `HTTP error! status: ${response.status}`,
        status: response.status,
      } as ApiError
    }

    const data = await response.json()
    return data
  } catch (error) {
    if (error && typeof error === 'object' && 'message' in error) {
      throw error as ApiError
    }
    throw {
      message: 'Network error: Failed to create category',
      status: 0,
    } as ApiError
  }
}

// Get all department categories (placeholder for future implementation)
export const getAllCategories = async (): Promise<DepartmentCategory[]> => {
  try {
    const response = await fetch(createApiUrl(DEPARTMENT_ENDPOINTS.GET_CATEGORIES), {
      method: 'GET',
      headers: {
        'accept': '*/*',
      },
    })

    if (!response.ok) {
      throw {
        message: `HTTP error! status: ${response.status}`,
        status: response.status,
      } as ApiError
    }

    const data = await response.json()
    return data
  } catch (error) {
    if (error && typeof error === 'object' && 'message' in error) {
      throw error as ApiError
    }
    throw {
      message: 'Network error: Failed to fetch categories',
      status: 0,
    } as ApiError
  }
}
