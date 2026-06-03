import React, { useState } from 'react'
import { PlusIcon, ListBulletIcon, XMarkIcon } from '@heroicons/react/24/outline'
import VisitorTypeForm from '../components/VisitorTypeForm'
import VisitorTypeList from '../components/VisitorTypeList'
import { ContentCard, PageLayout } from '../components/layout/PageLayout'
import { ViewToggle } from '../components/layout/ViewToggle'
import { updateVisitorType, type VisitorType } from '../services/visitorTypesApi'

export default function VisitorTypesRoute(): React.JSX.Element {
  const [activeView, setActiveView] = useState<'list' | 'create'>('create')
  const [refreshKey, setRefreshKey] = useState(0)
  const [editing, setEditing] = useState<VisitorType | null>(null)
  const [editName, setEditName] = useState('')
  const [editStatus, setEditStatus] = useState(true)
  const [editSaving, setEditSaving] = useState(false)
  const [editError, setEditError] = useState<string | null>(null)

  const handleVisitorTypeCreated = (_visitorType: VisitorType) => {
    if (activeView === 'list') {
      setRefreshKey((prev) => prev + 1)
    } else {
      setTimeout(() => {
        setActiveView('list')
        setRefreshKey((prev) => prev + 1)
      }, 2000)
    }
  }

  const handleRefreshNeeded = () => {
    setRefreshKey((prev) => prev + 1)
  }

  const openEdit = (vt: VisitorType) => {
    setEditing(vt)
    setEditName(vt.vTypeName)
    setEditStatus(Boolean(vt.vTypeStatus))
    setEditError(null)
  }

  const closeEdit = () => {
    if (editSaving) return
    setEditing(null)
    setEditError(null)
  }

  const saveEdit = async () => {
    if (!editing) return
    const trimmed = editName.trim()
    if (!trimmed) {
      setEditError('Name is required')
      return
    }
    setEditSaving(true)
    setEditError(null)
    try {
      await updateVisitorType(editing.idpk, {
        VTypeName: trimmed,
        VTypeStatus: editStatus,
        VTypeUpdatedBy: 'System',
      })
      setEditing(null)
      setRefreshKey((prev) => prev + 1)
    } catch (err: any) {
      setEditError(err?.message || 'Failed to update visitor type')
    } finally {
      setEditSaving(false)
    }
  }

  return (
    <PageLayout
      title="Visitor types"
      description="Labels used on visits, reports, and enrollment — synced from your visitor-types API."
      actions={
        <ViewToggle
          aria-label="Visitor types view"
          value={activeView}
          onChange={setActiveView}
          options={[
            { id: 'create', label: 'Add type', icon: PlusIcon },
            { id: 'list', label: 'All types', icon: ListBulletIcon },
          ]}
        />
      }
    >
      <ContentCard
        title={activeView === 'create' ? 'New visitor type' : 'Visitor types'}
        subtitle={
          activeView === 'create'
            ? 'Add a type visitors can select when checking in.'
            : 'Manage types returned from the database.'
        }
      >
        {activeView === 'create' && (
          <VisitorTypeForm
            onSuccess={handleVisitorTypeCreated}
            onError={(error) => console.error('Error creating visitor type:', error)}
          />
        )}
        {activeView === 'list' && (
          <VisitorTypeList
            key={refreshKey}
            onRefresh={handleRefreshNeeded}
            onEdit={openEdit}
          />
        )}
      </ContentCard>

      {editing && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Edit visitor type"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
          onClick={closeEdit}
        >
          <div
            className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex items-start justify-between gap-4">
              <div>
                <h3 className="text-lg font-semibold text-neutral-900">Edit visitor type</h3>
                <p className="mt-0.5 text-sm text-neutral-500">ID #{editing.idpk}</p>
              </div>
              <button
                type="button"
                onClick={closeEdit}
                disabled={editSaving}
                aria-label="Close"
                className="rounded-full p-1.5 text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900 disabled:opacity-40"
              >
                <XMarkIcon className="h-5 w-5" aria-hidden />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label htmlFor="edit-vtype-name" className="mb-1 block text-sm font-medium text-neutral-800">
                  Visitor type name
                </label>
                <input
                  id="edit-vtype-name"
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  disabled={editSaving}
                  className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-neutral-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                />
              </div>

              <div>
                <span className="mb-1 block text-sm font-medium text-neutral-800">Status</span>
                <div className="flex items-center gap-4">
                  <label className="inline-flex items-center gap-2">
                    <input
                      type="radio"
                      name="edit-vtype-status"
                      checked={editStatus}
                      onChange={() => setEditStatus(true)}
                      disabled={editSaving}
                    />
                    <span className="text-sm text-neutral-700">Active</span>
                  </label>
                  <label className="inline-flex items-center gap-2">
                    <input
                      type="radio"
                      name="edit-vtype-status"
                      checked={!editStatus}
                      onChange={() => setEditStatus(false)}
                      disabled={editSaving}
                    />
                    <span className="text-sm text-neutral-700">Inactive</span>
                  </label>
                </div>
              </div>

              {editError && (
                <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
                  {editError}
                </div>
              )}
            </div>

            <div className="mt-6 flex justify-end gap-2">
              <button
                type="button"
                onClick={closeEdit}
                disabled={editSaving}
                className="rounded-lg border border-neutral-300 bg-white px-4 py-2 text-sm font-semibold text-neutral-800 hover:bg-neutral-50 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => void saveEdit()}
                disabled={editSaving}
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:bg-neutral-300"
              >
                {editSaving ? 'Saving…' : 'Save changes'}
              </button>
            </div>
          </div>
        </div>
      )}
    </PageLayout>
  )
}
