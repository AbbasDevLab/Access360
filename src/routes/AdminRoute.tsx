import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { PlusIcon, ListBulletIcon, UserIcon, LockClosedIcon, CalendarIcon } from '@heroicons/react/24/outline'
import AdminUserForm from '../components/AdminUserForm'
import AdminUserList from '../components/AdminUserList'
import GuardForm from '../components/GuardForm'
import GuardList from '../components/GuardList'
import ScheduledGuestsApproval from '../components/ScheduledGuestsApproval'
import { ContentCard, PageLayout } from '../components/layout/PageLayout'
import { ViewToggle } from '../components/layout/ViewToggle'
import type { AdminUser } from '../services/adminApi'
import type { Guard } from '../services/guardsApi'

const TAB_ACTIVE = 'bg-[#00A651] text-white shadow-md shadow-[#00A651]/25'
const TAB_IDLE =
  'bg-white text-neutral-700 ring-1 ring-neutral-200 hover:bg-neutral-50 hover:ring-[#00A651]/30'

export default function AdminRoute() {
  const location = useLocation()
  const [activeTab, setActiveTab] = useState<'users' | 'guards' | 'scheduled'>('users')
  const [activeView, setActiveView] = useState<'list' | 'create'>('create')
  const [refreshKey, setRefreshKey] = useState(0)

  useEffect(() => {
    const params = new URLSearchParams(location.search)
    const tab = params.get('tab')
    if (tab === 'scheduled' || tab === 'users' || tab === 'guards') {
      setActiveTab(tab)
      if (tab === 'scheduled') return
      const view = params.get('view')
      if (view === 'list' || view === 'create') setActiveView(view)
    }
  }, [location.search])

  const handleUserCreated = (user: AdminUser) => {
    console.log('Admin user created:', user)
    if (activeView === 'list') setRefreshKey((prev) => prev + 1)
    else setTimeout(() => { setActiveView('list'); setRefreshKey((prev) => prev + 1) }, 2000)
  }

  const handleGuardCreated = (guard: Guard) => {
    console.log('Guard created:', guard)
    if (activeView === 'list') setRefreshKey((prev) => prev + 1)
    else setTimeout(() => { setActiveView('list'); setRefreshKey((prev) => prev + 1) }, 2000)
  }

  const handleRefreshNeeded = () => setRefreshKey((prev) => prev + 1)

  const entityLabel = activeTab === 'users' ? 'User' : 'Guard'

  return (
    <PageLayout
      title="Admin management"
      description="Users, guards, and scheduled guest approvals."
      actions={
        activeTab !== 'scheduled' ? (
          <ViewToggle
            aria-label="Admin view"
            value={activeView}
            onChange={setActiveView}
            options={[
              { id: 'create', label: `Add ${entityLabel}`, icon: PlusIcon },
              { id: 'list', label: `View ${entityLabel}s`, icon: ListBulletIcon },
            ]}
          />
        ) : undefined
      }
    >
      <div className="mb-6 grid grid-cols-1 gap-2 sm:grid-cols-3">
        <button type="button" onClick={() => setActiveTab('users')} className={`flex min-h-[3.25rem] items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-sm font-semibold transition-all ${activeTab === 'users' ? TAB_ACTIVE : TAB_IDLE}`}>
          <UserIcon className="h-5 w-5 shrink-0" aria-hidden />
          Users
        </button>
        <button type="button" onClick={() => setActiveTab('guards')} className={`flex min-h-[3.25rem] items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-sm font-semibold transition-all ${activeTab === 'guards' ? TAB_ACTIVE : TAB_IDLE}`}>
          <LockClosedIcon className="h-5 w-5 shrink-0" aria-hidden />
          Guards
        </button>
        <button type="button" onClick={() => setActiveTab('scheduled')} className={`flex min-h-[3.25rem] items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-sm font-semibold transition-all ${activeTab === 'scheduled' ? TAB_ACTIVE : TAB_IDLE}`}>
          <CalendarIcon className="h-5 w-5 shrink-0" aria-hidden />
          Scheduled guests
        </button>
      </div>

      <ContentCard
        title={
          activeTab === 'scheduled'
            ? 'Scheduled guests approval'
            : activeView === 'create'
              ? `New ${entityLabel.toLowerCase()}`
              : `${entityLabel} list`
        }
      >
        {activeTab === 'users' && (
          <>
            {activeView === 'create' && (
              <AdminUserForm onSuccess={handleUserCreated} onError={(e) => console.error(e)} />
            )}
            {activeView === 'list' && <AdminUserList key={refreshKey} onRefresh={handleRefreshNeeded} />}
          </>
        )}
        {activeTab === 'guards' && (
          <>
            {activeView === 'create' && (
              <GuardForm onSuccess={handleGuardCreated} onError={(e) => console.error(e)} />
            )}
            {activeView === 'list' && <GuardList key={refreshKey} onRefresh={handleRefreshNeeded} />}
          </>
        )}
        {activeTab === 'scheduled' && <ScheduledGuestsApproval />}
      </ContentCard>
    </PageLayout>
  )
}

