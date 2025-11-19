import React, { useState, useEffect } from 'react'
import { PencilIcon, TrashIcon, ExclamationCircleIcon, CheckCircleIcon, InformationCircleIcon, XCircleIcon } from '@heroicons/react/24/outline'
import {
  getAllCompanies,
  deleteCompany,
  type Company,
  type ApiError,
} from '../services/adminApi'

interface CompanyListProps {
  onEdit?: (company: Company) => void
  onRefresh?: () => void
}

export default function CompanyList({
  onEdit,
  onRefresh,
}: CompanyListProps): JSX.Element {
  const [companies, setCompanies] = useState<Company[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<number | null>(null)
  const [deleteStatus, setDeleteStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [deleteMessage, setDeleteMessage] = useState<string | null>(null)

  const fetchCompanies = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const data = await getAllCompanies()
      setCompanies(data)
    } catch (err) {
      const apiError = err as ApiError
      setError(apiError.message || 'Failed to fetch companies')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchCompanies()
  }, [])

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this company?')) {
      return
    }

    setDeletingId(id)
    setDeleteStatus('idle')
    setDeleteMessage(null)

    try {
      const response = await deleteCompany(id)
      setDeleteStatus('success')
      setDeleteMessage(response.message || 'Company deleted successfully!')
      fetchCompanies()
      if (onRefresh) onRefresh()
    } catch (err) {
      setDeleteStatus('error')
      const apiError = err as ApiError
      setDeleteMessage(apiError.message || 'Failed to delete company')
    } finally {
      setDeletingId(null)
      setTimeout(() => {
        setDeleteStatus('idle')
        setDeleteMessage(null)
      }, 3000)
    }
  }

  if (isLoading) {
    return (
      <div className="text-center py-12 text-neutral-500">
        <svg className="animate-spin h-8 w-8 mx-auto mb-4 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <p>Loading companies...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12 text-red-500">
        <ExclamationCircleIcon className="w-12 h-12 mx-auto mb-4 text-red-400" />
        <p>Error: {error}</p>
        <button
          onClick={fetchCompanies}
          className="mt-4 rounded-md bg-red-600 hover:bg-red-700 text-white px-4 py-2 text-sm"
        >
          Retry
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {deleteStatus === 'success' && deleteMessage && (
        <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
          <CheckCircleIcon className="w-5 h-5 text-green-600" />
          <span className="text-sm text-green-700">{deleteMessage}</span>
        </div>
      )}
      {deleteStatus === 'error' && deleteMessage && (
        <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
          <XCircleIcon className="w-5 h-5 text-red-600" />
          <span className="text-sm text-red-700">{deleteMessage}</span>
        </div>
      )}

      {companies.length === 0 ? (
        <div className="text-center py-12 text-neutral-500">
          <InformationCircleIcon className="w-12 h-12 mx-auto mb-4 text-neutral-400" />
          <p>No companies found.</p>
          <p className="text-sm mt-2">Create a new company to get started.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-neutral-200 rounded-lg overflow-hidden">
            <thead className="bg-neutral-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  ID
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Prefix
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Name
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" className="relative px-6 py-3">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-neutral-200">
              {companies.map((company) => (
                <tr key={company.idpk}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-neutral-900">
                    {company.idpk}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-600">
                    {company.cmpPrefix}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-600">
                    {company.cmpName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      company.cmpStatus ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {company.cmpStatus ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => onEdit?.(company)}
                      className="text-blue-600 hover:text-blue-900 mr-3"
                      title="Edit"
                    >
                      <PencilIcon className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleDelete(company.idpk)}
                      disabled={deletingId === company.idpk}
                      className="text-red-600 hover:text-red-900 disabled:text-neutral-400 disabled:cursor-not-allowed"
                      title="Delete"
                    >
                      {deletingId === company.idpk ? (
                        <svg className="animate-spin h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                      ) : (
                        <TrashIcon className="w-5 h-5" />
                      )}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

