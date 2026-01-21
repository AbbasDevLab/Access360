import { createApiUrl, ADMIN_ENDPOINTS } from '../data/global'

export interface Faculty {
  idpk: number
  facultyId: string
  facultyFullName: string
  facultyCode?: string
  username: string
  facultyEmail: string
  facultyPassword?: string
  facultyPhone?: string
  facultyStatus: boolean
  facultyIsDisabled: boolean
  facultyCreatedBy: string
  facultyCreatedAt?: string
  facultyUpdatedBy?: string
  facultyUpdatedAt?: string
}

export interface CreateFacultyDto {
  FacultyId: string
  FacultyFullName: string
  FacultyCode?: string
  Username: string
  FacultyEmail: string
  FacultyPassword: string
  FacultyPhone?: string
  FacultyStatus?: boolean
  FacultyIsDisabled?: boolean
  FacultyCreatedBy: string
}

export interface ApiError {
  message: string
  errors?: Record<string, string[]>
}

/**
 * Faculty login
 */
export const facultyLogin = async (username: string, password: string): Promise<Faculty> => {
  try {
    // This endpoint should be created on backend: /Faculty/Login
    const response = await fetch(createApiUrl('/Faculty/Login'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ Username: username, Password: password }),
    })

    if (!response.ok) {
      const errorData: ApiError = await response.json().catch(() => ({
        message: `HTTP error! status: ${response.status}`,
      }))
      throw errorData
    }

    return await response.json()
  } catch (error) {
    console.error('Error logging in faculty:', error)
    throw error
  }
}

/**
 * Get all faculties
 */
export const getAllFaculties = async (): Promise<Faculty[]> => {
  try {
    const response = await fetch(createApiUrl(ADMIN_ENDPOINTS.GET_FACULTIES), {
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
    console.error('Error fetching faculties:', error)
    throw error
  }
}

/**
 * Create a faculty user
 */
export const createFaculty = async (payload: Partial<Faculty>): Promise<Faculty> => {
  try {
    const response = await fetch(createApiUrl(ADMIN_ENDPOINTS.CREATE_FACULTY), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    })

    if (!response.ok) {
      const errorData: ApiError = await response.json().catch(() => ({
        message: `HTTP error! status: ${response.status}`,
      }))
      throw errorData
    }

    return await response.json()
  } catch (error) {
    console.error('Error creating faculty:', error)
    throw error
  }
}

/**
 * Delete a faculty user
 */
export const deleteFaculty = async (id: number): Promise<void> => {
  try {
    const url = createApiUrl(ADMIN_ENDPOINTS.DELETE_FACULTY.replace('{id}', id.toString()))
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
    console.error('Error deleting faculty:', error)
    throw error
  }
}

