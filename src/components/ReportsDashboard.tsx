import React, { useState, useEffect } from 'react'
import { 
  ChartBarIcon, 
  DocumentArrowDownIcon, 
  CalendarIcon,
  ClockIcon,
  UserGroupIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline'
import { getAllGuestVisits, getActiveGuestVisits, type GuestVisit } from '../services/guestVisitApi'

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
  const [liveRecords, setLiveRecords] = useState<ReportData[]>([])
  const [dailyRecords, setDailyRecords] = useState<ReportData[]>([])
  const [monthlyStats, setMonthlyStats] = useState({
    totalVisitors: 0,
    avgDailyVisitors: 0,
    peakHour: 'N/A',
    mostVisitedSite: 'N/A',
    lostCards: 0,
    avgVisitDuration: 0
  })
  const [loading, setLoading] = useState(true)

  const convertVisitToReportData = (visit: GuestVisit): ReportData => {
    const entryTime = visit.timeIn ? new Date(visit.timeIn).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : 'N/A'
    const exitTime = visit.timeOut ? new Date(visit.timeOut).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : undefined
    
    let duration: number | undefined
    if (visit.timeIn && visit.timeOut) {
      const start = new Date(visit.timeIn).getTime()
      const end = new Date(visit.timeOut).getTime()
      duration = Math.round((end - start) / 60000) // minutes
    } else if (visit.timeIn) {
      const start = new Date(visit.timeIn).getTime()
      const now = new Date().getTime()
      duration = Math.round((now - start) / 60000) // minutes
    }

    const status: 'active' | 'completed' | 'lost_card' = 
      visit.timeOut ? 'completed' : 
      visit.isRFIDCardReturned === false ? 'lost_card' : 
      'active'

    return {
      id: visit.idpk.toString(),
      visitorName: visit.guest?.fullName || 'Unknown',
      cnic: visit.guest?.cnicNumber || 'N/A',
      visitorType: visit.visitorType?.vTypeName || 'N/A',
      site: visit.departmentCategory?.categoryName || visit.department?.departmentName || 'N/A',
      purpose: visit.visitPurpose || 'N/A',
      cardNumber: visit.rfidCardNumber || 'N/A',
      entryTime,
      exitTime,
      status,
      duration
    }
  }

  const loadLiveRecords = async () => {
    try {
      const activeVisits = await getActiveGuestVisits()
      const records = activeVisits.map(convertVisitToReportData)
      setLiveRecords(records)
    } catch (error) {
      console.error('Error loading live records:', error)
    }
  }

  const loadDailyRecords = async () => {
    try {
      const startDate = new Date(dateRange.start)
      const endDate = new Date(dateRange.end)
      endDate.setHours(23, 59, 59, 999) // End of day

      const allVisits = await getAllGuestVisits()
      const filtered = allVisits.filter(visit => {
        if (!visit.timeIn) return false
        const visitDate = new Date(visit.timeIn)
        return visitDate >= startDate && visitDate <= endDate
      })

      const records = filtered.map(convertVisitToReportData)
      setDailyRecords(records)
    } catch (error) {
      console.error('Error loading daily records:', error)
    }
  }

  const calculateMonthlyStats = async () => {
    try {
      const allVisits = await getAllGuestVisits()
      const now = new Date()
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
      
      const monthlyVisits = allVisits.filter(v => {
        if (!v.timeIn) return false
        return new Date(v.timeIn) >= startOfMonth
      })

      const completedVisits = monthlyVisits.filter(v => v.timeOut)
      const totalVisitors = monthlyVisits.length
      const daysInMonth = now.getDate()
      const avgDailyVisitors = daysInMonth > 0 ? Math.round(totalVisitors / daysInMonth) : 0

      // Calculate peak hour
      const hourCounts: Record<number, number> = {}
      monthlyVisits.forEach(v => {
        if (v.timeIn) {
          const hour = new Date(v.timeIn).getHours()
          hourCounts[hour] = (hourCounts[hour] || 0) + 1
        }
      })
      const peakHourNum = Object.entries(hourCounts).sort((a, b) => b[1] - a[1])[0]?.[0]
      const peakHour = peakHourNum !== undefined ? `${peakHourNum.toString().padStart(2, '0')}:00-${(peakHourNum + 1).toString().padStart(2, '0')}:00` : 'N/A'

      // Most visited site
      const siteCounts: Record<string, number> = {}
      monthlyVisits.forEach(v => {
        const site = v.departmentCategory?.categoryName || v.department?.departmentName || 'N/A'
        siteCounts[site] = (siteCounts[site] || 0) + 1
      })
      const mostVisitedSite = Object.entries(siteCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A'

      // Lost cards
      const lostCards = monthlyVisits.filter(v => v.isRFIDCardReturned === false).length

      // Average duration
      const durations = completedVisits
        .map(v => {
          if (v.timeIn && v.timeOut) {
            return (new Date(v.timeOut).getTime() - new Date(v.timeIn).getTime()) / 60000
          }
          return null
        })
        .filter((d): d is number => d !== null)
      const avgVisitDuration = durations.length > 0 
        ? Math.round(durations.reduce((a, b) => a + b, 0) / durations.length)
        : 0

      setMonthlyStats({
        totalVisitors,
        avgDailyVisitors,
        peakHour,
        mostVisitedSite,
        lostCards,
        avgVisitDuration
      })
    } catch (error) {
      console.error('Error calculating monthly stats:', error)
    }
  }

  const loadData = async () => {
    setLoading(true)
    await Promise.all([
      loadLiveRecords(),
      loadDailyRecords(),
      calculateMonthlyStats()
    ])
    setLoading(false)
  }

  useEffect(() => {
    loadData()
    // Auto-refresh every 30 seconds for live updates
    const interval = setInterval(() => {
      loadLiveRecords()
      if (activeTab === 'daily') loadDailyRecords()
      if (activeTab === 'monthly') calculateMonthlyStats()
    }, 30000)
    return () => clearInterval(interval)
  }, [dateRange.start, dateRange.end, activeTab])

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
        record.duration?.toString() || '',
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

  // Calculate visitor type distribution
  const getVisitorTypeDistribution = () => {
    const allRecords = activeTab === 'live' ? liveRecords : dailyRecords
    const typeCounts: Record<string, number> = {}
    allRecords.forEach(r => {
      typeCounts[r.visitorType] = (typeCounts[r.visitorType] || 0) + 1
    })
    const total = allRecords.length
    return Object.entries(typeCounts)
      .map(([type, count]) => ({
        type,
        count,
        percentage: total > 0 ? Math.round((count / total) * 100) : 0
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)
  }

  // Calculate peak hours
  const getPeakHours = () => {
    const allRecords = activeTab === 'live' ? liveRecords : dailyRecords
    const hourCounts: Record<string, number> = {}
    allRecords.forEach(r => {
      const hour = r.entryTime.split(':')[0]
      if (hour) {
        const hourKey = `${hour}:00-${(parseInt(hour) + 1).toString().padStart(2, '0')}:00`
        hourCounts[hourKey] = (hourCounts[hourKey] || 0) + 1
      }
    })
    return Object.entries(hourCounts)
      .map(([hour, count]) => ({ hour, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)
  }

  return (
    <div className="max-w-7xl mx-auto space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-neutral-900">Reports & Analytics</h1>
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

      {loading && (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-2 text-sm text-neutral-600">Loading data...</p>
        </div>
      )}

      {/* Live Records */}
      {!loading && activeTab === 'live' && (
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
              <div className="text-2xl font-bold text-amber-900 mt-1">{liveRecords.filter(r => r.status === 'lost_card').length}</div>
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
              {liveRecords.length === 0 ? (
                <div className="px-4 py-8 text-center text-neutral-500">No active visitors</div>
              ) : (
                liveRecords.map((record) => (
                  <div key={record.id} className="px-4 py-3 grid grid-cols-8 text-sm hover:bg-neutral-50">
                    <div className="font-medium">{record.visitorName}</div>
                    <div className="text-neutral-600">{record.cnic}</div>
                    <div className="text-neutral-600">{record.visitorType}</div>
                    <div className="text-neutral-600">{record.site}</div>
                    <div className="font-mono">{record.cardNumber}</div>
                    <div className="text-neutral-600">{record.entryTime}</div>
                    <div className="text-neutral-600">{record.duration ? `${Math.floor(record.duration / 60)}h ${record.duration % 60}m` : '-'}</div>
                    <div>
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(record.status)}`}>
                        {getStatusIcon(record.status)}
                        {record.status}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Daily Report */}
      {!loading && activeTab === 'daily' && (
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
              {dailyRecords.length === 0 ? (
                <div className="px-4 py-8 text-center text-neutral-500">No records found for selected date range</div>
              ) : (
                dailyRecords.map((record) => (
                  <div key={record.id} className="px-4 py-3 grid grid-cols-9 text-sm hover:bg-neutral-50">
                    <div className="font-medium">{record.visitorName}</div>
                    <div className="text-neutral-600">{record.cnic}</div>
                    <div className="text-neutral-600">{record.visitorType}</div>
                    <div className="text-neutral-600">{record.site}</div>
                    <div className="text-neutral-600">{record.purpose}</div>
                    <div className="font-mono">{record.cardNumber}</div>
                    <div className="text-neutral-600">{record.entryTime}</div>
                    <div className="text-neutral-600">{record.exitTime || '-'}</div>
                    <div className="text-neutral-600">{record.duration ? `${Math.floor(record.duration / 60)}h ${record.duration % 60}m` : '-'}</div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Monthly Analytics */}
      {!loading && activeTab === 'monthly' && (
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
      {!loading && activeTab === 'analytics' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white border rounded-xl p-6">
              <h3 className="text-lg font-semibold mb-4">Visitor Types Distribution</h3>
              <div className="space-y-3">
                {getVisitorTypeDistribution().map((item, index) => (
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
                {getVisitorTypeDistribution().length === 0 && (
                  <div className="text-center text-neutral-500 py-4">No data available</div>
                )}
              </div>
            </div>

            <div className="bg-white border rounded-xl p-6">
              <h3 className="text-lg font-semibold mb-4">Peak Hours</h3>
              <div className="space-y-3">
                {getPeakHours().map((item, index) => {
                  const maxCount = getPeakHours()[0]?.count || 1
                  return (
                    <div key={index} className="flex items-center gap-3">
                      <div className="w-16 text-sm text-neutral-600">{item.hour}</div>
                      <div className="flex-1">
                        <div className="flex justify-between text-sm">
                          <span>{item.count} visitors</span>
                        </div>
                        <div className="w-full bg-neutral-200 rounded-full h-2 mt-1">
                          <div 
                            className="bg-green-500 h-2 rounded-full" 
                            style={{ width: `${(item.count / maxCount) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  )
                })}
                {getPeakHours().length === 0 && (
                  <div className="text-center text-neutral-500 py-4">No data available</div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
