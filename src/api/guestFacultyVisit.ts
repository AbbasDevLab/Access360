import axios from 'axios'

const API_BASE = 'https://server.access360.site:88'

export interface GuestFacultyVisit {
  id: number
  guestFullName: string
  guestPhoneNumber: string
  guestCNIC: string
  guestEmail: string | null
  guestAddress: string | null
  departmentName: string
  visitPurpose: string | null
  visitDate: string   // "2026-03-10T00:00:00"
  visitTime: string   // "10:00:00"
  approvalStatus: string
  isActive: boolean
  createdAt: string
  updatedAt: string | null
  facultyUserID: number | null
  facultyFullName?: string | null
}

export async function getPendingGuestFacultyVisits(): Promise<GuestFacultyVisit[]> {
  const res = await axios.get<GuestFacultyVisit[]>(
    `${API_BASE}/api/GuestFacultyVisit/GetPendingGuestFacultyVisits`,
  )
  return res.data
}

export async function approveGuestFacultyVisit(id: number, adminUserId: number, remarks?: string) {
  await axios.post(`${API_BASE}/api/GuestFacultyVisit/ApproveGuestFacultyVisit`, {
    id,
    adminUserId,
    remarks: remarks ?? null,
  })
}

export async function rejectGuestFacultyVisit(id: number, adminUserId: number, remarks?: string) {
  await axios.post(`${API_BASE}/api/GuestFacultyVisit/RejectGuestFacultyVisit`, {
    id,
    adminUserId,
    remarks: remarks ?? null,
  })
}

export async function getApprovedGuestFacultyVisits(): Promise<GuestFacultyVisit[]> {
  const res = await axios.get<GuestFacultyVisit[]>(
    `${API_BASE}/api/GuestFacultyVisit/GetApprovedGuestFacultyVisits`,
  )
  return res.data
}

