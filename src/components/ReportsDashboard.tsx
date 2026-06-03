import React, { useState, useEffect, useMemo } from 'react'
import {
  ChartBarIcon,
  DocumentArrowDownIcon,
  CalendarIcon,
  ClockIcon,
  UserGroupIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  IdentificationIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline'
import { getAllGuestVisits, getActiveGuestVisits, type GuestVisit } from '../services/guestVisitApi'
import { PageLayout } from './layout/PageLayout'
import {
  loadAllCnicImages,
  migrateLegacyLocalStorage,
  requestPersistentStorage,
  type CnicImagePair,
} from '../utils/cnicImageStore'
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
  phone: string
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
  cnicFrontImage?: string
  cnicBackImage?: string
}

/** Visit.imagePath holds a JSON string `{front, back}` written by the check-in flow. */
function parseCnicImagePath(raw: string | null | undefined): { front?: string; back?: string } {
  if (!raw) return {}
  const trimmed = String(raw).trim()
  if (!trimmed) return {}
  if (trimmed.startsWith('{')) {
    try {
      const parsed = JSON.parse(trimmed) as { front?: unknown; back?: unknown }
      return {
        front: typeof parsed.front === 'string' ? parsed.front : undefined,
        back: typeof parsed.back === 'string' ? parsed.back : undefined,
      }
    } catch {
      return {}
    }
  }
  // Legacy / non-JSON values are treated as a single front image
  return { front: trimmed }
}

function guestPhoneFromVisit(visit: GuestVisit): string {
  const g = visit.guest as Record<string, unknown> | undefined | null
  if (!g || typeof g !== 'object') return 'N/A'
  const raw =
    g.phoneNumber ??
    g.PhoneNumber ??
    g.phone ??
    g.Phone ??
    ''
  const s = String(raw).trim()
  return s.length > 0 ? s : 'N/A'
}

function reportVisitRowStatus(visit: GuestVisit): ReportData['status'] {
  if (!visit.timeOut) return 'active'
  return visit.isRFIDCardReturned === false ? 'lost_card' : 'completed'
}

function convertVisitToReportData(
  visit: GuestVisit,
  localCnic: Map<string, CnicImagePair>,
): ReportData {
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
  let cnicImages = parseCnicImagePath(visit.imagePath)
  // Fallback: this device may have a local copy of the CNIC photos from when
  // the visit was created (used when the backend's ImagePath column was too
  // small to hold the embedded base64). Loaded from IndexedDB into the
  // `localCnic` map by the parent component before this function runs.
  if (!cnicImages.front && !cnicImages.back) {
    const local = localCnic.get(String(visit.idpk))
    if (local) {
      cnicImages = {
        front: typeof local.front === 'string' ? local.front : undefined,
        back: typeof local.back === 'string' ? local.back : undefined,
      }
    }
  }

  return {
    id: visit.idpk.toString(),
    visitorName: visit.guest?.fullName || 'Unknown',
    cnic: visit.guest?.cnicNumber || 'N/A',
    phone: guestPhoneFromVisit(visit),
    visitorType: visit.visitorType?.vTypeName || 'N/A',
    site: visit.departmentCategory?.categoryName || visit.department?.departmentName || 'N/A',
    purpose: visit.visitPurpose || 'N/A',
    cardNumber: visit.rfidCardNumber || 'N/A',
    entryTime,
    exitTime,
    status,
    duration,
    entryHour24: visit.timeIn ? getPktHour24(visit.timeIn) : undefined,
    cnicFrontImage: cnicImages.front,
    cnicBackImage: cnicImages.back,
  }
}

export default function ReportsDashboard(): React.JSX.Element {
  const [activeTab, setActiveTab] = useState<'live' | 'daily' | 'monthly' | 'analytics'>('live')
  const [dateRange, setDateRange] = useState({
    start: getPktTodayYmd(),
    end: getPktTodayYmd(),
  })
  const [cnicViewerRecord, setCnicViewerRecord] = useState<ReportData | null>(null)
  const [allVisits, setAllVisits] = useState<GuestVisit[]>([])
  const [localCnic, setLocalCnic] = useState<Map<string, CnicImagePair>>(() => new Map())
  /** Same payload as live rows; merged into `allVisits` for stats when the list endpoint omits open visits. */
  const [activeGuestVisits, setActiveGuestVisits] = useState<GuestVisit[]>([])
  const [loadError, setLoadError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  // Live rows are derived from the active visits + the local CNIC cache.
  // Using useMemo so changes to either input (e.g. the IDB cache finishing
  // its initial load after the API call already returned) re-derive the
  // rows and the "View CNIC" affordance lights up on visits whose photos
  // we have locally.
  const liveRecords = useMemo<ReportData[]>(
    () => activeGuestVisits.map((v) => convertVisitToReportData(v, localCnic)),
    [activeGuestVisits, localCnic],
  )

  // Hydrate the local CNIC image cache from IndexedDB (and any legacy
  // localStorage entries) once on mount. This is the source the rows fall
  // back to when the backend's ImagePath column didn't store the photos.
  useEffect(() => {
    let cancelled = false
    void requestPersistentStorage()
    void migrateLegacyLocalStorage().then(() => {
      if (cancelled) return
      void loadAllCnicImages().then((map) => {
        if (cancelled) return
        setLocalCnic(map)
      })
    })
    return () => {
      cancelled = true
    }
  }, [])

  const refreshFromApi = async () => {
    setLoadError(null)
    try {
      const [all, active] = await Promise.all([
        getAllGuestVisits(),
        getActiveGuestVisits(),
      ])
      setAllVisits(all)
      setActiveGuestVisits(active)
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
    return filtered.map((v) => convertVisitToReportData(v, localCnic))
  }, [mergedVisits, dateRange.start, dateRange.end, localCnic])

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
      .map((v) => convertVisitToReportData(v, localCnic))
  }, [mergedVisits, localCnic])

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
      ['Name', 'CNIC', 'Phone', 'Type', 'Site', 'Purpose', 'Card', 'Entry Time', 'Exit Time', 'Duration (min)', 'Status'],
      ...data.map(record => [
        record.visitorName,
        record.cnic,
        record.phone,
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
        return 'bg-emerald-50 text-emerald-800 border border-emerald-200'
      case 'completed':
        return 'bg-blue-50 text-blue-800 border border-blue-200'
      case 'lost_card':
        return 'bg-red-50 text-red-800 border border-red-200'
      default:
        return 'bg-neutral-100 text-neutral-700 border border-neutral-200'
    }
  }

  const renderCnicCell = (record: ReportData) => {
    const hasImages = Boolean(record.cnicFrontImage || record.cnicBackImage)
    return (
      <div className="flex flex-wrap items-center gap-x-1.5 gap-y-1 min-w-0">
        <span className="whitespace-nowrap text-neutral-900">{record.cnic}</span>
        {hasImages && (
          <button
            type="button"
            onClick={() => setCnicViewerRecord(record)}
            title="View CNIC photos"
            aria-label={`View CNIC photos for ${record.visitorName}`}
            className="inline-flex shrink-0 items-center gap-1 rounded-md border border-[#2563eb]/30 bg-blue-50 px-1.5 py-0.5 text-[10px] font-semibold text-[#2563eb] hover:bg-blue-100"
          >
            <IdentificationIcon className="h-3.5 w-3.5" aria-hidden />
            View
          </button>
        )}
      </div>
    )
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
            className="rounded-lg border border-neutral-600 bg-white text-neutral-900 px-3 py-2 text-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#00A651]"
          />
          <label className="sr-only" htmlFor="report-range-end">
            End date
          </label>
          <input
            id="report-range-end"
            type="date"
            value={dateRange.end}
            onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
            className="rounded-lg border border-neutral-600 bg-white text-neutral-900 px-3 py-2 text-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#00A651]"
          />
          <button
            type="button"
            onClick={exportToExcel}
            className="inline-flex items-center gap-2 rounded-lg bg-[#00A651] px-3 py-2 text-sm font-medium text-white hover:bg-[#009148] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-300"
          >
            <DocumentArrowDownIcon className="h-4 w-4 shrink-0" aria-hidden />
            Export CSV
          </button>
        </>
      }
    >
      <div className="space-y-4">
      {/* Tab Navigation */}
      <div className="flex flex-wrap gap-1 border-b border-neutral-200" role="tablist" aria-label="Report views">
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
                ? 'border-blue-400 text-blue-300 bg-white'
                : 'border-transparent text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700'
            }`}
          >
            <tab.icon className="h-4 w-4 shrink-0" aria-hidden />
            {tab.label}
          </button>
        ))}
      </div>

      {loadError && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          Could not load report data: {loadError}
        </div>
      )}

      {loading && (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-2 border-neutral-600 border-t-[#00A651]"></div>
          <p className="mt-2 text-sm text-neutral-400">Loading data...</p>
        </div>
      )}

      {/* Live Records */}
      {!loading && activeTab === 'live' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="rounded-lg border border-neutral-200 bg-white p-4">
              <div className="flex items-center gap-2">
                <ClockIcon className="w-5 h-5 text-emerald-400" />
                <span className="text-sm font-medium text-neutral-700">Active (on site)</span>
              </div>
              <div className="text-2xl font-bold text-neutral-900 mt-1">{liveRecords.length}</div>
              <p className="text-xs text-neutral-500 mt-1">Open visits from the server (no checkout yet).</p>
            </div>
            <div className="rounded-lg border border-neutral-200 bg-white p-4">
              <div className="flex items-center gap-2">
                <UserGroupIcon className="w-5 h-5 text-blue-400" />
                <span className="text-sm font-medium text-neutral-700">Check-ins today</span>
              </div>
              <div className="text-2xl font-bold text-neutral-900 mt-1">{todayVisitsCount}</div>
              <p className="text-xs text-neutral-500 mt-1">Visits whose entry date is today in PKT (can differ from “active” if they checked in before midnight PKT).</p>
            </div>
            <div className="rounded-lg border border-violet-200 bg-violet-50 p-4">
              <div className="flex items-center gap-2">
                <ClockIcon className="w-5 h-5 text-violet-400" />
                <span className="text-sm font-medium text-violet-800">Longest current stay</span>
              </div>
              <div className="text-2xl font-bold text-violet-900 mt-1">
                {longestOpenStayMinutes != null ? formatDurationMinutes(longestOpenStayMinutes) : '—'}
              </div>
              <p className="text-xs text-violet-800/70 mt-1">Among visitors still checked in (open visits).</p>
            </div>
          </div>

          <div className="rounded-xl border border-neutral-200 bg-white overflow-x-auto">
            <div className="px-4 py-3 bg-neutral-50 border-b border-neutral-200 min-w-[720px]">
              <div className="grid grid-cols-9 gap-2 text-xs font-semibold text-neutral-700 uppercase tracking-wide">
                <div className="min-w-0">Name</div>
                <div className="min-w-0">CNIC</div>
                <div className="min-w-0">Phone</div>
                <div className="min-w-0">Type</div>
                <div className="min-w-0">Site</div>
                <div className="min-w-0">Card</div>
                <div className="min-w-0">Entry (PKT)</div>
                <div className="min-w-0">Stay</div>
                <div className="min-w-0">Status</div>
              </div>
            </div>
            <div className="divide-y divide-neutral-200 min-w-[720px]">
              {liveRecords.length === 0 ? (
                <div className="px-4 py-8 text-center text-neutral-500">No active visitors</div>
              ) : (
                liveRecords.map((record) => (
                  <div key={record.id} className="px-4 py-3 grid grid-cols-9 gap-2 text-sm hover:bg-white items-start">
                    <div className="font-medium text-neutral-900 min-w-0 break-words">{record.visitorName}</div>
                    {renderCnicCell(record)}
                    <div className="text-neutral-900 min-w-0 break-all">{record.phone}</div>
                    <div className="text-neutral-900 min-w-0 break-words">{record.visitorType}</div>
                    <div className="text-neutral-900 min-w-0 break-words leading-snug" title={record.site}>{record.site}</div>
                    <div className="font-mono text-neutral-900 min-w-0 break-all">{record.cardNumber}</div>
                    <div className="text-neutral-900 min-w-0 whitespace-nowrap">{record.entryTime}</div>
                    <div className="text-neutral-900 min-w-0">{formatDurationMinutes(record.duration)}</div>
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
          <div className="rounded-xl border border-neutral-200 bg-white overflow-x-auto">
            <div className="px-4 py-3 bg-neutral-50 border-b border-neutral-200 min-w-[900px]">
              <div className="grid grid-cols-10 gap-2 text-xs font-semibold text-neutral-700 uppercase tracking-wide">
                <div className="min-w-0">Name</div>
                <div className="min-w-0">CNIC</div>
                <div className="min-w-0">Phone</div>
                <div className="min-w-0">Type</div>
                <div className="min-w-0">Site</div>
                <div className="min-w-0">Purpose</div>
                <div className="min-w-0">Card</div>
                <div className="min-w-0">Entry (PKT)</div>
                <div className="min-w-0">Exit (PKT)</div>
                <div className="min-w-0">Stay</div>
              </div>
            </div>
            <div className="divide-y divide-neutral-200 min-w-[900px]">
              {dailyRecords.length === 0 ? (
                <div className="px-4 py-8 text-center text-neutral-500">No records found for selected date range</div>
              ) : (
                dailyRecords.map((record) => (
                  <div key={record.id} className="px-4 py-3 grid grid-cols-10 gap-2 text-sm hover:bg-white items-start">
                    <div className="font-medium text-neutral-900 min-w-0 break-words">{record.visitorName}</div>
                    {renderCnicCell(record)}
                    <div className="text-neutral-900 min-w-0 break-all">{record.phone}</div>
                    <div className="text-neutral-900 min-w-0 break-words">{record.visitorType}</div>
                    <div className="text-neutral-900 min-w-0 break-words leading-snug" title={record.site}>{record.site}</div>
                    <div className="text-neutral-900 min-w-0 break-words">{record.purpose}</div>
                    <div className="font-mono text-neutral-900 min-w-0 break-all">{record.cardNumber}</div>
                    <div className="text-neutral-900 min-w-0 whitespace-nowrap">{record.entryTime}</div>
                    <div className="text-neutral-900 min-w-0 whitespace-nowrap">{record.exitTime || '—'}</div>
                    <div className="text-neutral-900 min-w-0">{formatDurationMinutes(record.duration)}</div>
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
          <div className="rounded-lg border border-neutral-200 bg-white p-6">
            <div className="flex items-center gap-3">
              <UserGroupIcon className="w-8 h-8 text-blue-400" />
              <div>
                <div className="text-sm font-medium text-neutral-400">Total visitors (month)</div>
                <div className="text-3xl font-bold text-neutral-900">{monthlyStats.totalVisitors}</div>
              </div>
            </div>
          </div>
          
          <div className="rounded-lg border border-neutral-200 bg-white p-6">
            <div className="flex items-center gap-3">
              <CalendarIcon className="w-8 h-8 text-emerald-400" />
              <div>
                <div className="text-sm font-medium text-neutral-400">Avg daily</div>
                <div className="text-3xl font-bold text-neutral-900">{monthlyStats.avgDailyVisitors}</div>
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-neutral-200 bg-white p-6">
            <div className="flex items-center gap-3">
              <ClockIcon className="w-8 h-8 text-violet-400" />
              <div>
                <div className="text-sm font-medium text-neutral-400">Peak hour (PKT)</div>
                <div className="text-2xl font-bold text-neutral-900">{monthlyStats.peakHour}</div>
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-neutral-200 bg-white p-6">
            <div className="flex items-center gap-3">
              <ChartBarIcon className="w-8 h-8 text-amber-400" />
              <div className="min-w-0">
                <div className="text-sm font-medium text-neutral-400">Most visited</div>
                <div className="text-lg font-bold text-neutral-900 break-words">{monthlyStats.mostVisitedSite}</div>
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-red-500/25 bg-red-50 p-6">
            <div className="flex items-center gap-3">
              <ExclamationTriangleIcon className="w-8 h-8 text-red-400" />
              <div>
                <div className="text-sm font-medium text-red-800/80">Cards not returned</div>
                <div className="text-3xl font-bold text-red-900">{monthlyStats.lostCards}</div>
                <p className="mt-1 text-xs text-red-800/60">Completed check-outs this month (PKT) where the guard marked the RFID as not returned.</p>
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-neutral-200 bg-white p-6">
            <div className="flex items-center gap-3">
              <ClockIcon className="w-8 h-8 text-indigo-400" />
              <div>
                <div className="text-sm font-medium text-neutral-400">Avg visit length</div>
                <div className="text-2xl font-bold text-neutral-900">{formatDurationMinutes(monthlyStats.avgVisitDuration)}</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Analytics */}
      {!loading && activeTab === 'analytics' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="border border-neutral-200 bg-white rounded-xl p-6">
              <h3 className="text-lg font-semibold mb-4 text-neutral-900">Visitor types (this month)</h3>
              <div className="space-y-3">
                {visitorTypeDistribution.map((item, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-blue-400 shrink-0"></div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between text-sm text-neutral-700 gap-2">
                        <span className="truncate">{item.type}</span>
                        <span className="shrink-0">{item.count} ({item.percentage}%)</span>
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
                {visitorTypeDistribution.length === 0 && (
                  <div className="text-center text-neutral-500 py-4">No data available</div>
                )}
              </div>
            </div>

            <div className="border border-neutral-200 bg-white rounded-xl p-6">
              <h3 className="text-lg font-semibold mb-4 text-neutral-900">Peak hours (PKT)</h3>
              <div className="space-y-3">
                {peakHoursChart.map((item, index) => {
                  const maxCount = peakHoursChart[0]?.count || 1
                  return (
                    <div key={index} className="flex items-center gap-3">
                      <div className="w-28 shrink-0 text-sm text-neutral-400">{item.hour}</div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between text-sm text-neutral-700">
                          <span>{item.count} visitors</span>
                        </div>
                        <div className="w-full bg-neutral-200 rounded-full h-2 mt-1">
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

      {cnicViewerRecord && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="CNIC photos"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
          onClick={() => setCnicViewerRecord(null)}
        >
          <div
            className="relative w-full max-w-3xl rounded-2xl bg-white p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex items-start justify-between gap-4">
              <div>
                <h3 className="text-lg font-semibold text-neutral-900">CNIC photos</h3>
                <p className="mt-0.5 text-sm text-neutral-600">
                  {cnicViewerRecord.visitorName} — {cnicViewerRecord.cnic}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setCnicViewerRecord(null)}
                aria-label="Close CNIC photos"
                className="rounded-full p-1.5 text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900"
              >
                <XMarkIcon className="h-5 w-5" aria-hidden />
              </button>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-neutral-600">Front</p>
                {cnicViewerRecord.cnicFrontImage ? (
                  <a
                    href={cnicViewerRecord.cnicFrontImage}
                    target="_blank"
                    rel="noreferrer"
                    className="block overflow-hidden rounded-lg bg-neutral-100 ring-1 ring-black/5"
                  >
                    <img
                      src={cnicViewerRecord.cnicFrontImage}
                      alt="CNIC front"
                      className="h-auto w-full object-contain"
                    />
                  </a>
                ) : (
                  <div className="flex aspect-video items-center justify-center rounded-lg border border-dashed border-neutral-300 bg-neutral-50 text-sm text-neutral-500">
                    No front image
                  </div>
                )}
              </div>
              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-neutral-600">Back</p>
                {cnicViewerRecord.cnicBackImage ? (
                  <a
                    href={cnicViewerRecord.cnicBackImage}
                    target="_blank"
                    rel="noreferrer"
                    className="block overflow-hidden rounded-lg bg-neutral-100 ring-1 ring-black/5"
                  >
                    <img
                      src={cnicViewerRecord.cnicBackImage}
                      alt="CNIC back"
                      className="h-auto w-full object-contain"
                    />
                  </a>
                ) : (
                  <div className="flex aspect-video items-center justify-center rounded-lg border border-dashed border-neutral-300 bg-neutral-50 text-sm text-neutral-500">
                    No back image
                  </div>
                )}
              </div>
            </div>

            <p className="mt-3 text-xs text-neutral-500">
              Tip: click an image to open the full-size version in a new tab.
            </p>
          </div>
        </div>
      )}
      </div>
    </PageLayout>
  )
}


