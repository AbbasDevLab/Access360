import React, { useState } from 'react'
import { 
  ChartBarIcon, 
  DocumentArrowDownIcon, 
  CalendarIcon,
  ClockIcon,
  UserGroupIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline'

interface ReportData {
  id: string
  visitorName: string
  cnic: string
  visitorType: string
  site: string
  purpose: string
  cardNumber: string
  entryTime: string
  exitTime?: string
  status: 'active' | 'completed' | 'lost_card'
  duration?: number
}

export default function ReportsDashboard(): JSX.Element {
  const [activeTab, setActiveTab] = useState<'live' | 'daily' | 'monthly' | 'analytics'>('live')
  const [dateRange, setDateRange] = useState({
    start: new Date().toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  })

  // Mock data
  const liveRecords: ReportData[] = [
    {
      id: '1',
      visitorName: 'Ali Raza',
      cnic: '35202-1234567-1',
      visitorType: 'Parents / Guardians',
      site: 'CS Block',
      purpose: 'Meeting with professor',
      cardNumber: '001',
      entryTime: '14:30',
      status: 'active'
    },
    {
      id: '2',
      visitorName: 'Sara Ahmed',
      cnic: '35202-9876543-2',
      visitorType: 'Vendors / Purchase Office',
      site: 'Main Building',
      purpose: 'Delivery',
      cardNumber: '003',
      entryTime: '13:45',
      status: 'active'
    }
  ]

  const dailyRecords: ReportData[] = [
    ...liveRecords,
    {
      id: '3',
      visitorName: 'Muhammad Khan',
      cnic: '35202-5555555-3',
      visitorType: 'Government Officials',
      site: 'N-Block (Ahmed Saeed)',
      purpose: 'Official meeting',
      cardNumber: '002',
      entryTime: '09:15',
      exitTime: '11:30',
      status: 'completed',
      duration: 135
    },
    {
      id: '4',
      visitorName: 'Fatima Ali',
      cnic: '35202-7777777-4',
      visitorType: 'Food Delivery',
      site: 'Hope Tower',
      purpose: 'Food delivery',
      cardNumber: '004',
      entryTime: '12:00',
      exitTime: '12:15',
      status: 'completed',
      duration: 15
    }
  ]

  const monthlyStats = {
    totalVisitors: 1247,
    avgDailyVisitors: 42,
    peakHour: '14:00-15:00',
    mostVisitedSite: 'CS Block',
    lostCards: 3,
    avgVisitDuration: 45
  }

  const exportToExcel = () => {
    const data = activeTab === 'live' ? liveRecords : dailyRecords
    const csvContent = [
      ['Name', 'CNIC', 'Type', 'Site', 'Purpose', 'Card', 'Entry Time', 'Exit Time', 'Duration (min)', 'Status'],
      ...data.map(record => [
        record.visitorName,
        record.cnic,
        record.visitorType,
        record.site,
        record.purpose,
        record.cardNumber,
        record.entryTime,
        record.exitTime || '',
        record.duration || '',
        record.status
      ])
    ].map(row => row.join(',')).join('\n')
    
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `access360-${activeTab}-${dateRange.start}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800'
      case 'completed': return 'bg-blue-100 text-blue-800'
      case 'lost_card': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <ClockIcon className="w-4 h-4" />
      case 'completed': return <CheckCircleIcon className="w-4 h-4" />
      case 'lost_card': return <ExclamationTriangleIcon className="w-4 h-4" />
      default: return null
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">Reports & Analytics</h1>
        <div className="flex gap-2">
          <input
            type="date"
            value={dateRange.start}
            onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
            className="rounded-md border px-3 py-2 text-sm"
          />
          <input
            type="date"
            value={dateRange.end}
            onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
            className="rounded-md border px-3 py-2 text-sm"
          />
          <button
            onClick={exportToExcel}
            className="flex items-center gap-2 px-3 py-2 rounded-md bg-green-600 hover:bg-green-700 text-white text-sm"
          >
            <DocumentArrowDownIcon className="w-4 h-4" />
            Export Excel
          </button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-1 border-b">
        {[
          { id: 'live', label: 'Live Records', icon: ClockIcon },
          { id: 'daily', label: 'Daily Report', icon: CalendarIcon },
          { id: 'monthly', label: 'Monthly Report', icon: ChartBarIcon },
          { id: 'analytics', label: 'Analytics', icon: UserGroupIcon }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === tab.id
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-neutral-600 hover:text-neutral-800'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Live Records */}
      {activeTab === 'live' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center gap-2">
                <ClockIcon className="w-5 h-5 text-green-600" />
                <span className="text-sm font-medium text-green-800">Active Visitors</span>
              </div>
              <div className="text-2xl font-bold text-green-900 mt-1">{liveRecords.length}</div>
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center gap-2">
                <UserGroupIcon className="w-5 h-5 text-blue-600" />
                <span className="text-sm font-medium text-blue-800">Today's Total</span>
              </div>
              <div className="text-2xl font-bold text-blue-900 mt-1">{dailyRecords.length}</div>
            </div>
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <div className="flex items-center gap-2">
                <ExclamationTriangleIcon className="w-5 h-5 text-amber-600" />
                <span className="text-sm font-medium text-amber-800">Lost Cards</span>
              </div>
              <div className="text-2xl font-bold text-amber-900 mt-1">0</div>
            </div>
          </div>

          <div className="rounded-xl border bg-white overflow-hidden">
            <div className="px-4 py-3 bg-neutral-50 border-b">
              <div className="grid grid-cols-8 text-xs font-medium text-neutral-600 uppercase tracking-wide">
                <div>Name</div>
                <div>CNIC</div>
                <div>Type</div>
                <div>Site</div>
                <div>Card</div>
                <div>Entry Time</div>
                <div>Duration</div>
                <div>Status</div>
              </div>
            </div>
            <div className="divide-y">
              {liveRecords.map((record) => (
                <div key={record.id} className="px-4 py-3 grid grid-cols-8 text-sm hover:bg-neutral-50">
                  <div className="font-medium">{record.visitorName}</div>
                  <div className="text-neutral-600">{record.cnic}</div>
                  <div className="text-neutral-600">{record.visitorType}</div>
                  <div className="text-neutral-600">{record.site}</div>
                  <div className="font-mono">{record.cardNumber}</div>
                  <div className="text-neutral-600">{record.entryTime}</div>
                  <div className="text-neutral-600">
                    {record.entryTime && new Date().getHours() - parseInt(record.entryTime.split(':')[0])}h
                  </div>
                  <div>
                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(record.status)}`}>
                      {getStatusIcon(record.status)}
                      {record.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Daily Report */}
      {activeTab === 'daily' && (
        <div className="space-y-4">
          <div className="rounded-xl border bg-white overflow-hidden">
            <div className="px-4 py-3 bg-neutral-50 border-b">
              <div className="grid grid-cols-9 text-xs font-medium text-neutral-600 uppercase tracking-wide">
                <div>Name</div>
                <div>CNIC</div>
                <div>Type</div>
                <div>Site</div>
                <div>Purpose</div>
                <div>Card</div>
                <div>Entry</div>
                <div>Exit</div>
                <div>Duration</div>
              </div>
            </div>
            <div className="divide-y">
              {dailyRecords.map((record) => (
                <div key={record.id} className="px-4 py-3 grid grid-cols-9 text-sm hover:bg-neutral-50">
                  <div className="font-medium">{record.visitorName}</div>
                  <div className="text-neutral-600">{record.cnic}</div>
                  <div className="text-neutral-600">{record.visitorType}</div>
                  <div className="text-neutral-600">{record.site}</div>
                  <div className="text-neutral-600">{record.purpose}</div>
                  <div className="font-mono">{record.cardNumber}</div>
                  <div className="text-neutral-600">{record.entryTime}</div>
                  <div className="text-neutral-600">{record.exitTime || '-'}</div>
                  <div className="text-neutral-600">{record.duration ? `${record.duration}m` : '-'}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Monthly Analytics */}
      {activeTab === 'monthly' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <div className="flex items-center gap-3">
              <UserGroupIcon className="w-8 h-8 text-blue-600" />
              <div>
                <div className="text-sm font-medium text-blue-800">Total Visitors</div>
                <div className="text-3xl font-bold text-blue-900">{monthlyStats.totalVisitors}</div>
              </div>
            </div>
          </div>
          
          <div className="bg-green-50 border border-green-200 rounded-lg p-6">
            <div className="flex items-center gap-3">
              <CalendarIcon className="w-8 h-8 text-green-600" />
              <div>
                <div className="text-sm font-medium text-green-800">Avg Daily</div>
                <div className="text-3xl font-bold text-green-900">{monthlyStats.avgDailyVisitors}</div>
              </div>
            </div>
          </div>

          <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
            <div className="flex items-center gap-3">
              <ClockIcon className="w-8 h-8 text-purple-600" />
              <div>
                <div className="text-sm font-medium text-purple-800">Peak Hour</div>
                <div className="text-3xl font-bold text-purple-900">{monthlyStats.peakHour}</div>
              </div>
            </div>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-lg p-6">
            <div className="flex items-center gap-3">
              <ChartBarIcon className="w-8 h-8 text-amber-600" />
              <div>
                <div className="text-sm font-medium text-amber-800">Most Visited</div>
                <div className="text-lg font-bold text-amber-900">{monthlyStats.mostVisitedSite}</div>
              </div>
            </div>
          </div>

          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <div className="flex items-center gap-3">
              <ExclamationTriangleIcon className="w-8 h-8 text-red-600" />
              <div>
                <div className="text-sm font-medium text-red-800">Lost Cards</div>
                <div className="text-3xl font-bold text-red-900">{monthlyStats.lostCards}</div>
              </div>
            </div>
          </div>

          <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-6">
            <div className="flex items-center gap-3">
              <ClockIcon className="w-8 h-8 text-indigo-600" />
              <div>
                <div className="text-sm font-medium text-indigo-800">Avg Duration</div>
                <div className="text-3xl font-bold text-indigo-900">{monthlyStats.avgVisitDuration}m</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Analytics */}
      {activeTab === 'analytics' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white border rounded-xl p-6">
              <h3 className="text-lg font-semibold mb-4">Visitor Types Distribution</h3>
              <div className="space-y-3">
                {[
                  { type: 'Parents / Guardians', count: 45, percentage: 35 },
                  { type: 'Food Delivery', count: 32, percentage: 25 },
                  { type: 'Vendors', count: 28, percentage: 22 },
                  { type: 'Government Officials', count: 15, percentage: 12 },
                  { type: 'Others', count: 8, percentage: 6 }
                ].map((item, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                    <div className="flex-1">
                      <div className="flex justify-between text-sm">
                        <span>{item.type}</span>
                        <span>{item.count} ({item.percentage}%)</span>
                      </div>
                      <div className="w-full bg-neutral-200 rounded-full h-2 mt-1">
                        <div 
                          className="bg-blue-500 h-2 rounded-full" 
                          style={{ width: `${item.percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white border rounded-xl p-6">
              <h3 className="text-lg font-semibold mb-4">Peak Hours</h3>
              <div className="space-y-3">
                {[
                  { hour: '14:00-15:00', count: 28 },
                  { hour: '10:00-11:00', count: 24 },
                  { hour: '16:00-17:00', count: 22 },
                  { hour: '09:00-10:00', count: 18 },
                  { hour: '12:00-13:00', count: 15 }
                ].map((item, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <div className="w-16 text-sm text-neutral-600">{item.hour}</div>
                    <div className="flex-1">
                      <div className="flex justify-between text-sm">
                        <span>{item.count} visitors</span>
                      </div>
                      <div className="w-full bg-neutral-200 rounded-full h-2 mt-1">
                        <div 
                          className="bg-green-500 h-2 rounded-full" 
                          style={{ width: `${(item.count / 28) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}



