// Global API configuration
export const API_CONFIG = {
  BASE_URL: 'https://localhost:7215/api',
} as const

// API helper function to create full URLs
export const createApiUrl = (endpoint: string): string => {
  const baseUrl = API_CONFIG.BASE_URL.replace(/\/$/, '') // Remove trailing slash
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`
  return `${baseUrl}${cleanEndpoint}`
}

// Department API endpoints
export const DEPARTMENT_ENDPOINTS = {
  CREATE_CATEGORY: '/Departments/CreateDeptCategory/Category',
  GET_CATEGORIES: '/Departments/GetDeptCategories/Categories',
  GET_CATEGORY_BY_ID: '/Departments/GetDeptCategoryById/Category/{id}',
  UPDATE_CATEGORY: '/Departments/UpdateDeptCategory/Category/{id}',
  DELETE_CATEGORY: '/Departments/DeleteDeptCategory/Category/{id}',
  GET_DEPARTMENTS: '/Departments/GetDepartments',
  GET_DEPARTMENT_BY_ID: '/Departments/GetDepartmentById/{id}',
  GET_DEPARTMENTS_BY_CATEGORY: '/Departments/GetDepartmentsByCategory/ByCategory/{categoryId}',
  CREATE_DEPARTMENT: '/Departments/CreateDepartment',
  UPDATE_DEPARTMENT: '/Departments/UpdateDepartment/{id}',
  DELETE_DEPARTMENT: '/Departments/DeleteDepartment/{id}',
} as const
