import React, { useState, useEffect, useMemo } from 'react'
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
import { PageLayout } from './layout/PageLayout'
import {
  formatPktTime,
  getPktHour24,
  getPktTodayYmd,
  isPktCalendarDay,
  isSamePktMonth,
  parseAccess360ApiInstant,
  toPktYmd,
} from '../utils/pktTime'

/** `minutes` is total minutes (not hours). */
function formatDurationMinutes(minutes: number | undefined): string {
  if (minutes === undefined || !Number.isFinite(minutes) || minutes < 0) return '—'
  const m = Math.round(minutes)
  if (m < 60) return `${m}m`
  if (m < 1440) {
    const h = Math.floor(m / 60)
    const mm = m % 60
    return mm > 0 ? `${h}h ${mm}m` : `${h}h`
  }
  const d = Math.floor(m / 1440)
  const rem = m % 1440
  const h = Math.floor(rem / 60)
  const mm = rem % 60
  if (h > 0 && mm > 0) return `${d}d ${h}h ${mm}m`
  if (h > 0) return `${d}d ${h}h`
  return `${d}d`
}

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
  /** 0–23 from visit timeIn in PKT (peak-hour charts) */
  entryHour24?: number
}

function reportVisitRowStatus(visit: GuestVisit): ReportData['status'] {
  if (!visit.timeOut) return 'active'
  return visit.isRFIDCardReturned === false ? 'lost_card' : 'completed'
}

function convertVisitToReportData(visit: GuestVisit): ReportData {
  const entryTime = visit.timeIn ? formatPktTime(visit.timeIn) : 'N/A'
  const exitTime = visit.timeOut ? formatPktTime(visit.timeOut) : undefined

  let duration: number | undefined
  if (visit.timeIn && visit.timeOut) {
    const start = parseAccess360ApiInstant(visit.timeIn)?.getTime()
    const end = parseAccess360ApiInstant(visit.timeOut)?.getTime()
    if (start != null && end != null) duration = Math.round((end - start) / 60000)
  } else if (visit.timeIn) {
    const start = parseAccess360ApiInstant(visit.timeIn)?.getTime()
    if (start != null) duration = Math.round((Date.now() - start) / 60000)
  }

  const status = reportVisitRowStatus(visit)

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
    duration,
    entryHour24: visit.timeIn ? getPktHour24(visit.timeIn) : undefined,
  }
}

export default function ReportsDashboard(): React.JSX.Element {
  const [activeTab, setActiveTab] = useState<'live' | 'daily' | 'monthly' | 'analytics'>('live')
  const [dateRange, setDateRange] = useState({
    start: getPktTodayYmd(),
    end: getPktTodayYmd(),
  })
  const [allVisits, setAllVisits] = useState<GuestVisit[]>([])
  /** Same payload as live rows; merged into `allVisits` for stats when the list endpoint omits open visits. */
  const [activeGuestVisits, setActiveGuestVisits] = useState<GuestVisit[]>([])
  const [liveRecords, setLiveRecords] = useState<ReportData[]>([])
  const [loadError, setLoadError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  const refreshFromApi = async () => {
    setLoadError(null)
    try {
      const [all, active] = await Promise.all([
        getAllGuestVisits(),
        getActiveGuestVisits(),
      ])
      setAllVisits(all)
      setActiveGuestVisits(active)
      setLiveRecords(active.map(convertVisitToReportData))
    } catch (error) {
      console.error('Error loading reports data:', error)
      const msg =
        error && typeof error === 'object' && 'message' in error
          ? String((error as { message: string }).message)
          : 'Failed to load data from server'
      setLoadError(msg)
    }
  }

  useEffect(() => {
    let cancelled = false
    const run = async () => {
      setLoading(true)
      setLoadError(null)
      try {
        const [all, active] = await Promise.all([
          getAllGuestVisits(),
          getActiveGuestVisits(),
        ])
        if (cancelled) return
        setAllVisits(all)
        setActiveGuestVisits(active)
        setLiveRecords(active.map(convertVisitToReportData))
      } catch (error) {
        console.error('Error loading reports data:', error)
        if (!cancelled) {
          const msg =
            error && typeof error === 'object' && 'message' in error
              ? String((error as { message: string }).message)
              : 'Failed to load data from server'
          setLoadError(msg)
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    void run()
    const interval = setInterval(() => {
      void refreshFromApi()
    }, 30000)
    return () => {
      cancelled = true
      clearInterval(interval)
    }
  }, [])

  const mergedVisits = useMemo(() => {
    const byId = new Map<number, GuestVisit>()
    for (const v of allVisits) {
      if (v?.idpk != null && Number.isFinite(v.idpk)) byId.set(v.idpk, v)
    }
    for (const v of activeGuestVisits) {
      if (v?.idpk != null && Number.isFinite(v.idpk)) byId.set(v.idpk, v)
    }
    return Array.from(byId.values())
  }, [allVisits, activeGuestVisits])

  const dailyRecords = useMemo(() => {
    const filtered = mergedVisits.filter((visit) => {
      if (!visit.timeIn) return false
      const ymd = toPktYmd(visit.timeIn)
      return ymd >= dateRange.start && ymd <= dateRange.end
    })
    return filtered.map(convertVisitToReportData)
  }, [mergedVisits, dateRange.start, dateRange.end])

  const todayVisitsCount = useMemo(() => {
    const now = new Date()
    return mergedVisits.filter((v) => v.timeIn && isPktCalendarDay(v.timeIn, now)).length
  }, [mergedVisits])

  const monthlyStats = useMemo(() => {
    const now = new Date()
    const monthlyVisits = mergedVisits.filter((v) => v.timeIn && isSamePktMonth(v.timeIn, now))
    const completedVisits = monthlyVisits.filter((v) => v.timeOut)
    const totalVisitors = monthlyVisits.length
    const pktToday = getPktTodayYmd()
    const dayOfMonthPkt = parseInt(pktToday.split('-')[2] || '1', 10)
    const avgDailyVisitors =
      dayOfMonthPkt > 0 ? Math.round(totalVisitors / dayOfMonthPkt) : 0

    const hourCounts: Record<number, number> = {}
    monthlyVisits.forEach((v) => {
      if (v.timeIn) {
        const hour = getPktHour24(v.timeIn)
        if (hour !== undefined) hourCounts[hour] = (hourCounts[hour] || 0) + 1
      }
    })
    const peakHourNum = Object.entries(hourCounts).sort((a, b) => b[1] - a[1])[0]?.[0]
    const peakHour =
      peakHourNum !== undefined
        ? `${peakHourNum.toString().padStart(2, '0')}:00-${(parseInt(peakHourNum, 10) + 1).toString().padStart(2, '0')}:00`
        : 'N/A'

    const siteCounts: Record<string, number> = {}
    monthlyVisits.forEach((v) => {
      const site = v.departmentCategory?.categoryName || v.department?.departmentName || 'N/A'
      siteCounts[site] = (siteCounts[site] || 0) + 1
    })
    const mostVisitedSite = Object.entries(siteCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A'
    const lostCards = monthlyVisits.filter((v) => v.timeOut && v.isRFIDCardReturned === false).length

    const durations = completedVisits
      .map((v) => {
        if (v.timeIn && v.timeOut) {
          const a = parseAccess360ApiInstant(v.timeIn)?.getTime()
          const b = parseAccess360ApiInstant(v.timeOut)?.getTime()
          if (a != null && b != null) return (b - a) / 60000
        }
        return null
      })
      .filter((d): d is number => d !== null)
    const avgVisitDuration =
      durations.length > 0 ? Math.round(durations.reduce((a, b) => a + b, 0) / durations.length) : 0

    return {
      totalVisitors,
      avgDailyVisitors,
      peakHour,
      mostVisitedSite,
      lostCards,
      avgVisitDuration,
    }
  }, [mergedVisits])

  const analyticsRecords = useMemo(() => {
    const now = new Date()
    return mergedVisits
      .filter((v) => v.timeIn && isSamePktMonth(v.timeIn, now))
      .map(convertVisitToReportData)
  }, [mergedVisits])

  const longestOpenStayMinutes = useMemo(() => {
    if (liveRecords.length === 0) return null
    const m = Math.max(...liveRecords.map((r) => r.duration ?? 0))
    return Number.isFinite(m) ? m : null
  }, [liveRecords])

  const chartRecords = useMemo(() => {
    if (activeTab === 'analytics') return analyticsRecords
    if (activeTab === 'live') return liveRecords
    return dailyRecords
  }, [activeTab, analyticsRecords, liveRecords, dailyRecords])

  const visitorTypeDistribution = useMemo(() => {
    const typeCounts: Record<string, number> = {}
    chartRecords.forEach((r) => {
      typeCounts[r.visitorType] = (typeCounts[r.visitorType] || 0) + 1
    })
    const total = chartRecords.length
    return Object.entries(typeCounts)
      .map(([type, count]) => ({
        type,
        count,
        percentage: total > 0 ? Math.round((count / total) * 100) : 0,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)
  }, [chartRecords])

  const peakHoursChart = useMemo(() => {
    const hourCounts: Record<number, number> = {}
    chartRecords.forEach((r) => {
      if (r.entryHour24 === undefined) return
      hourCounts[r.entryHour24] = (hourCounts[r.entryHour24] || 0) + 1
    })
    return Object.entries(hourCounts)
      .map(([hour, count]) => ({
        hour: `${hour.padStart(2, '0')}:00-${String((parseInt(hour, 10) + 1) % 24).padStart(2, '0')}:00`,
        count,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)
  }, [chartRecords])

  const exportToExcel = () => {
    const data =
      activeTab === 'live' ? liveRecords : activeTab === 'analytics' ? chartRecords : dailyRecords
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
      case 'active':
        return 'bg-emerald-500/15 text-emerald-200 border border-emerald-500/25'
      case 'completed':
        return 'bg-blue-500/15 text-blue-200 border border-blue-500/25'
      case 'lost_card':
        return 'bg-red-500/15 text-red-200 border border-red-500/25'
      default:
        return 'bg-neutral-700 text-neutral-200 border border-neutral-600'
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
    <PageLayout
      title="Reports & analytics"
      description="Live and historical visit metrics from your database. All visit times use Pakistan Standard Time (PKT, Asia/Karachi). Active visits refresh every 30 seconds; daily range matches calendar days in PKT."
      actions={
        <>
          <label className="sr-only" htmlFor="report-range-start">
            Start date
          </label>
          <input
            id="report-range-start"
            type="date"
            value={dateRange.start}
            onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
            className="rounded-lg border border-neutral-600 bg-neutral-800/80 text-neutral-100 px-3 py-2 text-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-400"
          />
          <label className="sr-only" htmlFor="report-range-end">
            End date
          </label>
          <input
            id="report-range-end"
            type="date"
            value={dateRange.end}
            onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
            className="rounded-lg border border-neutral-600 bg-neutral-800/80 text-neutral-100 px-3 py-2 text-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-400"
          />
          <button
            type="button"
            onClick={exportToExcel}
            className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-3 py-2 text-sm font-medium text-white hover:bg-emerald-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-300"
          >
            <DocumentArrowDownIcon className="h-4 w-4 shrink-0" aria-hidden />
            Export CSV
          </button>
        </>
      }
    >
      <div className="space-y-4">
      {/* Tab Navigation */}
      <div className="flex flex-wrap gap-1 border-b border-neutral-700" role="tablist" aria-label="Report views">
        {[
          { id: 'live', label: 'Live', icon: ClockIcon },
          { id: 'daily', label: 'Daily', icon: CalendarIcon },
          { id: 'monthly', label: 'Monthly', icon: ChartBarIcon },
          { id: 'analytics', label: 'Analytics', icon: UserGroupIcon },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={activeTab === tab.id}
            onClick={() => setActiveTab(tab.id as 'live' | 'daily' | 'monthly' | 'analytics')}
            className={`flex items-center gap-2 rounded-t-md px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
              activeTab === tab.id
                ? 'border-blue-400 text-blue-300 bg-neutral-800/50'
                : 'border-transparent text-neutral-400 hover:bg-neutral-800/30 hover:text-neutral-200'
            }`}
          >
            <tab.icon className="h-4 w-4 shrink-0" aria-hidden />
            {tab.label}
          </button>
        ))}
      </div>

      {loadError && (
        <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
          Could not load report data: {loadError}
        </div>
      )}

      {loading && (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-2 border-neutral-600 border-t-blue-400"></div>
          <p className="mt-2 text-sm text-neutral-400">Loading data...</p>
        </div>
      )}

      {/* Live Records */}
      {!loading && activeTab === 'live' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="rounded-lg border border-neutral-700 bg-neutral-800/80 p-4">
              <div className="flex items-center gap-2">
                <ClockIcon className="w-5 h-5 text-emerald-400" />
                <span className="text-sm font-medium text-neutral-200">Active (on site)</span>
              </div>
              <div className="text-2xl font-bold text-white mt-1">{liveRecords.length}</div>
              <p className="text-xs text-neutral-500 mt-1">Open visits from the server (no checkout yet).</p>
            </div>
            <div className="rounded-lg border border-neutral-700 bg-neutral-800/80 p-4">
              <div className="flex items-center gap-2">
                <UserGroupIcon className="w-5 h-5 text-blue-400" />
                <span className="text-sm font-medium text-neutral-200">Check-ins today</span>
              </div>
              <div className="text-2xl font-bold text-white mt-1">{todayVisitsCount}</div>
              <p className="text-xs text-neutral-500 mt-1">Visits whose entry date is today in PKT (can differ from “active” if they checked in before midnight PKT).</p>
            </div>
            <div className="rounded-lg border border-violet-500/25 bg-violet-950/30 p-4">
              <div className="flex items-center gap-2">
                <ClockIcon className="w-5 h-5 text-violet-400" />
                <span className="text-sm font-medium text-violet-200">Longest current stay</span>
              </div>
              <div className="text-2xl font-bold text-violet-100 mt-1">
                {longestOpenStayMinutes != null ? formatDurationMinutes(longestOpenStayMinutes) : '—'}
              </div>
              <p className="text-xs text-violet-200/70 mt-1">Among visitors still checked in (open visits).</p>
            </div>
          </div>

          <div className="rounded-xl border border-neutral-700 bg-neutral-800/50 overflow-hidden">
            <div className="px-4 py-3 bg-neutral-800 border-b border-neutral-700">
              <div className="grid grid-cols-8 gap-2 text-xs font-medium text-neutral-400 uppercase tracking-wide">
                <div className="min-w-0">Name</div>
                <div className="min-w-0">CNIC</div>
                <div className="min-w-0">Type</div>
                <div className="min-w-0">Site</div>
                <div className="min-w-0">Card</div>
                <div className="min-w-0">Entry (PKT)</div>
                <div className="min-w-0">Stay</div>
                <div className="min-w-0">Status</div>
              </div>
            </div>
            <div className="divide-y divide-neutral-700">
              {liveRecords.length === 0 ? (
                <div className="px-4 py-8 text-center text-neutral-500">No active visitors</div>
              ) : (
                liveRecords.map((record) => (
                  <div key={record.id} className="px-4 py-3 grid grid-cols-8 gap-2 text-sm hover:bg-neutral-800/80 items-start">
                    <div className="font-medium text-neutral-100 min-w-0 break-words">{record.visitorName}</div>
                    <div className="text-neutral-400 min-w-0 break-words">{record.cnic}</div>
                    <div className="text-neutral-400 min-w-0 break-words">{record.visitorType}</div>
                    <div className="text-neutral-400 min-w-0 break-words leading-snug" title={record.site}>{record.site}</div>
                    <div className="font-mono text-neutral-300 min-w-0 break-all">{record.cardNumber}</div>
                    <div className="text-neutral-400 min-w-0 whitespace-nowrap">{record.entryTime}</div>
                    <div className="text-neutral-400 min-w-0">{formatDurationMinutes(record.duration)}</div>
                    <div className="min-w-0">
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
          <div className="rounded-xl border border-neutral-700 bg-neutral-800/50 overflow-hidden">
            <div className="px-4 py-3 bg-neutral-800 border-b border-neutral-700">
              <div className="grid grid-cols-9 gap-2 text-xs font-medium text-neutral-400 uppercase tracking-wide">
                <div className="min-w-0">Name</div>
                <div className="min-w-0">CNIC</div>
                <div className="min-w-0">Type</div>
                <div className="min-w-0">Site</div>
                <div className="min-w-0">Purpose</div>
                <div className="min-w-0">Card</div>
                <div className="min-w-0">Entry (PKT)</div>
                <div className="min-w-0">Exit (PKT)</div>
                <div className="min-w-0">Stay</div>
              </div>
            </div>
            <div className="divide-y divide-neutral-700">
              {dailyRecords.length === 0 ? (
                <div className="px-4 py-8 text-center text-neutral-500">No records found for selected date range</div>
              ) : (
                dailyRecords.map((record) => (
                  <div key={record.id} className="px-4 py-3 grid grid-cols-9 gap-2 text-sm hover:bg-neutral-800/80 items-start">
                    <div className="font-medium text-neutral-100 min-w-0 break-words">{record.visitorName}</div>
                    <div className="text-neutral-400 min-w-0 break-words">{record.cnic}</div>
                    <div className="text-neutral-400 min-w-0 break-words">{record.visitorType}</div>
                    <div className="text-neutral-400 min-w-0 break-words leading-snug" title={record.site}>{record.site}</div>
                    <div className="text-neutral-400 min-w-0 break-words">{record.purpose}</div>
                    <div className="font-mono text-neutral-300 min-w-0 break-all">{record.cardNumber}</div>
                    <div className="text-neutral-400 min-w-0 whitespace-nowrap">{record.entryTime}</div>
                    <div className="text-neutral-400 min-w-0 whitespace-nowrap">{record.exitTime || '—'}</div>
                    <div className="text-neutral-400 min-w-0">{formatDurationMinutes(record.duration)}</div>
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
          <div className="rounded-lg border border-neutral-700 bg-neutral-800/80 p-6">
            <div className="flex items-center gap-3">
              <UserGroupIcon className="w-8 h-8 text-blue-400" />
              <div>
                <div className="text-sm font-medium text-neutral-400">Total visitors (month)</div>
                <div className="text-3xl font-bold text-white">{monthlyStats.totalVisitors}</div>
              </div>
            </div>
          </div>
          
          <div className="rounded-lg border border-neutral-700 bg-neutral-800/80 p-6">
            <div className="flex items-center gap-3">
              <CalendarIcon className="w-8 h-8 text-emerald-400" />
              <div>
                <div className="text-sm font-medium text-neutral-400">Avg daily</div>
                <div className="text-3xl font-bold text-white">{monthlyStats.avgDailyVisitors}</div>
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-neutral-700 bg-neutral-800/80 p-6">
            <div className="flex items-center gap-3">
              <ClockIcon className="w-8 h-8 text-violet-400" />
              <div>
                <div className="text-sm font-medium text-neutral-400">Peak hour (PKT)</div>
                <div className="text-2xl font-bold text-white">{monthlyStats.peakHour}</div>
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-neutral-700 bg-neutral-800/80 p-6">
            <div className="flex items-center gap-3">
              <ChartBarIcon className="w-8 h-8 text-amber-400" />
              <div className="min-w-0">
                <div className="text-sm font-medium text-neutral-400">Most visited</div>
                <div className="text-lg font-bold text-white break-words">{monthlyStats.mostVisitedSite}</div>
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-red-500/25 bg-red-500/10 p-6">
            <div className="flex items-center gap-3">
              <ExclamationTriangleIcon className="w-8 h-8 text-red-400" />
              <div>
                <div className="text-sm font-medium text-red-200/80">Cards not returned</div>
                <div className="text-3xl font-bold text-red-100">{monthlyStats.lostCards}</div>
                <p className="mt-1 text-xs text-red-200/60">Completed check-outs this month (PKT) where the guard marked the RFID as not returned.</p>
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-neutral-700 bg-neutral-800/80 p-6">
            <div className="flex items-center gap-3">
              <ClockIcon className="w-8 h-8 text-indigo-400" />
              <div>
                <div className="text-sm font-medium text-neutral-400">Avg visit length</div>
                <div className="text-2xl font-bold text-white">{formatDurationMinutes(monthlyStats.avgVisitDuration)}</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Analytics */}
      {!loading && activeTab === 'analytics' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="border border-neutral-700 bg-neutral-800/50 rounded-xl p-6">
              <h3 className="text-lg font-semibold mb-4 text-neutral-100">Visitor types (this month)</h3>
              <div className="space-y-3">
                {visitorTypeDistribution.map((item, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-blue-400 shrink-0"></div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between text-sm text-neutral-200 gap-2">
                        <span className="truncate">{item.type}</span>
                        <span className="shrink-0">{item.count} ({item.percentage}%)</span>
                      </div>
                      <div className="w-full bg-neutral-700 rounded-full h-2 mt-1">
                        <div 
                          className="bg-blue-500 h-2 rounded-full" 
                          style={{ width: `${item.percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                ))}
                {visitorTypeDistribution.length === 0 && (
                  <div className="text-center text-neutral-500 py-4">No data available</div>
                )}
              </div>
            </div>

            <div className="border border-neutral-700 bg-neutral-800/50 rounded-xl p-6">
              <h3 className="text-lg font-semibold mb-4 text-neutral-100">Peak hours (PKT)</h3>
              <div className="space-y-3">
                {peakHoursChart.map((item, index) => {
                  const maxCount = peakHoursChart[0]?.count || 1
                  return (
                    <div key={index} className="flex items-center gap-3">
                      <div className="w-28 shrink-0 text-sm text-neutral-400">{item.hour}</div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between text-sm text-neutral-200">
                          <span>{item.count} visitors</span>
                        </div>
                        <div className="w-full bg-neutral-700 rounded-full h-2 mt-1">
                          <div 
                            className="bg-emerald-500 h-2 rounded-full" 
                            style={{ width: `${(item.count / maxCount) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  )
                })}
                {peakHoursChart.length === 0 && (
                  <div className="text-center text-neutral-500 py-4">No data available</div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
      </div>
    </PageLayout>
  )
}

