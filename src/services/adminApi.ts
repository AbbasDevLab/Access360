import { createApiUrl, ADMIN_ENDPOINTS } from '../data/global'

// ==================== Admin User Types ====================

export interface AdminUser {
  id: string
  userFullName: string
  userCode?: string | null
  username: string
  userEmail: string
  userPassword?: string
  userDateOfBirth?: string | null
  userStatus: boolean
  userLocationIdpk?: number | null
  userCompanyIdpk?: number | null
  userIsDisabled: boolean
  userCreatedBy?: string | null
  userCreatedAt?: string | null
  userUpdatedBy?: string | null
  userUpdatedAt?: string | null
  company?: any
  location?: any
}

export interface CreateAdminUserDto {
  Id: string
  UserFullName: string
  UserCode?: string | null
  Username: string
  UserEmail: string
  UserPassword: string
  UserDateOfBirth?: string | null
  UserStatus: boolean
  UserLocationIdpk?: number | null
  UserCompanyIdpk?: number | null
  UserIsDisabled: boolean
  UserCreatedBy?: string | null
}

export interface UpdateAdminUserDto {
  UserFullName: string
  UserCode?: string | null
  Username: string
  UserEmail: string
  UserDateOfBirth?: string | null
  UserStatus: boolean
  UserLocationIdpk?: number | null
  UserCompanyIdpk?: number | null
  UserIsDisabled: boolean
  UserUpdatedBy?: string | null
}

// ==================== Company Types ====================

export interface Company {
  idpk: number
  cmpPrefix: string
  cmpName: string
  cmpStatus: boolean
  cmpLogo?: string | null
  cmpPhone?: string | null
  cmpEmail?: string | null
  cmpRepresentative?: string | null
  cmpRepresentativeNumber?: string | null
  cmpRepresentativeEmail?: string | null
  cmpCode?: string | null
  cmpCreatedBy?: string | null
  cmpCreatedAt?: string | null
  cmpUpdatedBy?: string | null
  cmpUpdatedAt?: string | null
}

export interface CreateCompanyDto {
  CmpPrefix: string
  CmpName: string
  CmpStatus: boolean
  CmpLogo?: string | null
  CmpPhone?: string | null
  CmpEmail?: string | null
  CmpRepresentative?: string | null
  CmpRepresentativeNumber?: string | null
  CmpRepresentativeEmail?: string | null
  CmpCode?: string | null
  CmpCreatedBy?: string | null
}

export interface UpdateCompanyDto {
  CmpPrefix: string
  CmpName: string
  CmpStatus: boolean
  CmpLogo?: string | null
  CmpPhone?: string | null
  CmpEmail?: string | null
  CmpRepresentative?: string | null
  CmpRepresentativeNumber?: string | null
  CmpRepresentativeEmail?: string | null
  CmpCode?: string | null
  CmpUpdatedBy?: string | null
}

export interface ApiError {
  message: string
  status?: number
  errors?: Record<string, string[]>
}

// ==================== Admin User API ====================

export const getAllAdminUsers = async (): Promise<AdminUser[]> => {
  try {
    const response = await fetch(createApiUrl(ADMIN_ENDPOINTS.GET_ADMIN_USERS), {
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
    throw { message: 'Network error: Failed to fetch admin users', status: 0 } as ApiError
  }
}

export const getAdminUserById = async (id: string): Promise<AdminUser> => {
  try {
    const url = createApiUrl(ADMIN_ENDPOINTS.GET_ADMIN_USER_BY_ID.replace('{id}', encodeURIComponent(id)))
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
    throw { message: 'Network error: Failed to fetch admin user', status: 0 } as ApiError
  }
}

export const createAdminUser = async (user: Partial<AdminUser>): Promise<any> => {
  try {
    const dto: CreateAdminUserDto = {
      Id: user.id || '',
      UserFullName: user.userFullName || '',
      UserCode: user.userCode || null,
      Username: user.username || '',
      UserEmail: user.userEmail || '',
      UserPassword: user.userPassword || '',
      UserDateOfBirth: user.userDateOfBirth || null,
      UserStatus: user.userStatus ?? true,
      UserLocationIdpk: user.userLocationIdpk || null,
      UserCompanyIdpk: user.userCompanyIdpk || null,
      UserIsDisabled: user.userIsDisabled ?? false,
      UserCreatedBy: user.userCreatedBy || 'System',
    }

    const response = await fetch(createApiUrl(ADMIN_ENDPOINTS.CREATE_ADMIN_USER), {
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
    throw { message: 'Network error: Failed to create admin user', status: 0 } as ApiError
  }
}

export const updateAdminUser = async (id: string, user: UpdateAdminUserDto): Promise<any> => {
  try {
    const url = createApiUrl(ADMIN_ENDPOINTS.UPDATE_ADMIN_USER.replace('{id}', encodeURIComponent(id)))
    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        'accept': '*/*',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(user),
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
    throw { message: 'Network error: Failed to update admin user', status: 0 } as ApiError
  }
}

export const deleteAdminUser = async (id: string): Promise<any> => {
  try {
    const url = createApiUrl(ADMIN_ENDPOINTS.DELETE_ADMIN_USER.replace('{id}', encodeURIComponent(id)))
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
    throw { message: 'Network error: Failed to delete admin user', status: 0 } as ApiError
  }
}

// ==================== Company API ====================

export const getAllCompanies = async (): Promise<Company[]> => {
  try {
    const response = await fetch(createApiUrl(ADMIN_ENDPOINTS.GET_COMPANIES), {
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
    throw { message: 'Network error: Failed to fetch companies', status: 0 } as ApiError
  }
}

export const getCompanyById = async (id: number): Promise<Company> => {
  try {
    const url = createApiUrl(ADMIN_ENDPOINTS.GET_COMPANY_BY_ID.replace('{id}', id.toString()))
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
    throw { message: 'Network error: Failed to fetch company', status: 0 } as ApiError
  }
}

export const createCompany = async (company: Partial<Company>): Promise<any> => {
  try {
    const dto: CreateCompanyDto = {
      CmpPrefix: company.cmpPrefix || '',
      CmpName: company.cmpName || '',
      CmpStatus: company.cmpStatus ?? true,
      CmpLogo: company.cmpLogo || null,
      CmpPhone: company.cmpPhone || null,
      CmpEmail: company.cmpEmail || null,
      CmpRepresentative: company.cmpRepresentative || null,
      CmpRepresentativeNumber: company.cmpRepresentativeNumber || null,
      CmpRepresentativeEmail: company.cmpRepresentativeEmail || null,
      CmpCode: company.cmpCode || null,
      CmpCreatedBy: company.cmpCreatedBy || 'System',
    }

    const response = await fetch(createApiUrl(ADMIN_ENDPOINTS.CREATE_COMPANY), {
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
    throw { message: 'Network error: Failed to create company', status: 0 } as ApiError
  }
}

export const updateCompany = async (id: number, company: UpdateCompanyDto): Promise<any> => {
  try {
    const url = createApiUrl(ADMIN_ENDPOINTS.UPDATE_COMPANY.replace('{id}', id.toString()))
    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        'accept': '*/*',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(company),
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
    throw { message: 'Network error: Failed to update company', status: 0 } as ApiError
  }
}

export const deleteCompany = async (id: number): Promise<any> => {
  try {
    const url = createApiUrl(ADMIN_ENDPOINTS.DELETE_COMPANY.replace('{id}', id.toString()))
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
    throw { message: 'Network error: Failed to delete company', status: 0 } as ApiError
  }
}

