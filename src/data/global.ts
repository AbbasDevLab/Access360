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

// Guest API endpoints
export const GUEST_ENDPOINTS = {
  GET_ALL: '/Guests/GetGuests',
  GET_BY_ID: '/Guests/GetGuestById/{id}',
  GET_BY_CODE: '/Guests/GetGuestByCode/ByCode/{code}',
  GET_BY_CNIC: '/Guests/GetGuestByCNIC/ByCNIC/{cnic}',
  CREATE: '/Guests/CreateGuest',
  UPDATE: '/Guests/UpdateGuest/{id}',
  DELETE: '/Guests/DeleteGuest/{id}',
} as const

// Guest Visit API endpoints
export const GUEST_VISIT_ENDPOINTS = {
  GET_ALL: '/GuestVisit/GetGuestVisits',
  GET_BY_ID: '/GuestVisit/GetGuestVisitById/{id}',
  GET_BY_GUEST: '/GuestVisit/GetGuestVisitsByGuestId/ByGuest/{guestId}',
  GET_ACTIVE: '/GuestVisit/GetActiveGuestVisits/Active',
  CREATE: '/GuestVisit/CreateGuestVisit',
  UPDATE: '/GuestVisit/UpdateGuestVisit/{id}',
  DELETE: '/GuestVisit/DeleteGuestVisit/{id}',
} as const

// Location API endpoints
export const LOCATION_ENDPOINTS = {
  GET_ALL: '/Locations/GetLocations',
  GET_BY_ID: '/Locations/GetLocationById/{id}',
  CREATE: '/Locations/CreateLocation',
  UPDATE: '/Locations/UpdateLocation/{id}',
  DELETE: '/Locations/DeleteLocation/{id}',
} as const

// Visitor Type API endpoints
export const VISITOR_TYPE_ENDPOINTS = {
  GET_ALL: '/VisitorTypes/GetVisitorTypes',
  GET_BY_ID: '/VisitorTypes/GetVisitorTypeById/{id}',
  CREATE: '/VisitorTypes/CreateVisitorType',
  UPDATE: '/VisitorTypes/UpdateVisitorType/{id}',
  DELETE: '/VisitorTypes/DeleteVisitorType/{id}',
} as const

// Admin API endpoints
export const ADMIN_ENDPOINTS = {
  GET_ADMIN_USERS: '/Admin/GetAdminUsers',
  GET_ADMIN_USER_BY_ID: '/Admin/GetAdminUserById/User/{id}',
  CREATE_ADMIN_USER: '/Admin/CreateAdminUser/User',
  UPDATE_ADMIN_USER: '/Admin/UpdateAdminUser/User/{id}',
  DELETE_ADMIN_USER: '/Admin/DeleteAdminUser/User/{id}',
  GET_COMPANIES: '/Admin/GetCompanies',
  GET_COMPANY_BY_ID: '/Admin/GetCompanyById/Company/{id}',
  CREATE_COMPANY: '/Admin/CreateCompany/Company',
  UPDATE_COMPANY: '/Admin/UpdateCompany/Company/{id}',
  DELETE_COMPANY: '/Admin/DeleteCompany/Company/{id}',
} as const
