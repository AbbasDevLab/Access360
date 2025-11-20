import { createApiUrl, DEPARTMENT_ENDPOINTS } from '../data/global'

// ==================== Department Category Types ====================

export interface DepartmentCategory {
  idpk: number
  categoryName: string
  categoryStatus: boolean | null
  categoryCreatedBy?: string | null
  categoryCreatedAt?: string | null
  categoryUpdatedBy?: string | null
  categoryUpdatedAt?: string | null
}

export interface CreateDeptCategoryDto {
  Idpk: number // Backend expects uppercase I
  CategoryName: string
  CategoryStatus?: boolean | null
  CategoryCreatedBy?: string | null
}

export interface UpdateDeptCategoryDto {
  CategoryName: string
  CategoryStatus?: boolean | null
  CategoryUpdatedBy?: string | null
}

export interface CreateCategoryResponse {
  id: number
  categoryName: string
  categoryStatus: boolean
  message: string
}

export interface UpdateCategoryResponse {
  id: number
  categoryName: string
  categoryStatus: boolean
  message: string
}

export interface DeleteCategoryResponse {
  message: string
}

export interface ApiError {
  message: string
  status?: number
  errors?: Record<string, string[]>
}

// ==================== Department Category API ====================

// Get all department categories
export const getAllCategories = async (): Promise<DepartmentCategory[]> => {
  try {
    const response = await fetch(createApiUrl(DEPARTMENT_ENDPOINTS.GET_CATEGORIES), {
      method: 'GET',
      headers: {
        'accept': '*/*',
      },
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw {
        message: errorData.message || `HTTP error! status: ${response.status}`,
        status: response.status,
        errors: errorData.errors,
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

// Get department category by ID
export const getCategoryById = async (id: number): Promise<DepartmentCategory> => {
  try {
    const url = createApiUrl(DEPARTMENT_ENDPOINTS.GET_CATEGORY_BY_ID.replace('{id}', id.toString()))
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'accept': '*/*',
      },
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw {
        message: errorData.message || `HTTP error! status: ${response.status}`,
        status: response.status,
        errors: errorData.errors,
      } as ApiError
    }

    const data = await response.json()
    return data
  } catch (error) {
    if (error && typeof error === 'object' && 'message' in error) {
      throw error as ApiError
    }
    throw {
      message: 'Network error: Failed to fetch category',
      status: 0,
    } as ApiError
  }
}

// Create a new department category
export const createDepartmentCategory = async (
  category: Partial<DepartmentCategory>
): Promise<CreateCategoryResponse> => {
  try {
    // Convert to backend DTO format (uppercase property names)
    const dto: CreateDeptCategoryDto = {
      Idpk: 0, // Auto-increment - always set to 0
      CategoryName: category.categoryName || '',
      CategoryStatus: category.categoryStatus ?? true,
      CategoryCreatedBy: category.categoryCreatedBy || 'System',
    }

    const response = await fetch(createApiUrl(DEPARTMENT_ENDPOINTS.CREATE_CATEGORY), {
      method: 'POST',
      headers: {
        'accept': '*/*',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(dto),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      
      // Handle validation errors from ModelState
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

// Update department category
export const updateDepartmentCategory = async (
  id: number,
  category: UpdateDeptCategoryDto
): Promise<UpdateCategoryResponse> => {
  try {
    const url = createApiUrl(DEPARTMENT_ENDPOINTS.UPDATE_CATEGORY.replace('{id}', id.toString()))
    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        'accept': '*/*',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(category),
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

    const data = await response.json()
    return data
  } catch (error) {
    if (error && typeof error === 'object' && 'message' in error) {
      throw error as ApiError
    }
    throw {
      message: 'Network error: Failed to update category',
      status: 0,
    } as ApiError
  }
}

// Delete department category
export const deleteDepartmentCategory = async (id: number): Promise<DeleteCategoryResponse> => {
  try {
    const url = createApiUrl(DEPARTMENT_ENDPOINTS.DELETE_CATEGORY.replace('{id}', id.toString()))
    const response = await fetch(url, {
      method: 'DELETE',
      headers: {
        'accept': '*/*',
      },
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw {
        message: errorData.message || `HTTP error! status: ${response.status}`,
        status: response.status,
        errors: errorData.errors,
      } as ApiError
    }

    const data = await response.json()
    return data
  } catch (error) {
    if (error && typeof error === 'object' && 'message' in error) {
      throw error as ApiError
    }
    throw {
      message: 'Network error: Failed to delete category',
      status: 0,
    } as ApiError
  }
}
