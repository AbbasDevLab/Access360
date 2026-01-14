import React, { useState, useEffect } from 'react'
import { Scanner } from '@yudiel/react-qr-scanner'
import { 
  QrCodeIcon, 
  CheckCircleIcon, 
  XCircleIcon, 
  ClockIcon,
  UserIcon,
  BuildingOfficeIcon,
  CalendarIcon
} from '@heroicons/react/24/outline'
import { getActiveGuestVisits, getGuestVisitById } from '../services/guestVisitApi'
import type { GuestVisit } from '../services/guestVisitApi'

interface VerificationResult {
  visitorName: string
  cnic: string
  visitorType: string
  site: string
  purpose: string
  cardNumber: string
  entryTime: string
  expiryTime?: string
  status: 'valid' | 'invalid' | 'expired' | 'not_found'
  visit?: GuestVisit
}

export default function VerifyRoute(): JSX.Element {
  const [result, setResult] = useState<string>('')
  const [scanResult, setScanResult] = useState<VerificationResult | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [stats, setStats] = useState({ validToday: 0, denied: 0 })
  const [recentScans, setRecentScans] = useState<Array<{ name: string; time: string; status: 'allowed' | 'denied' }>>([])

  // Load stats on mount
  useEffect(() => {
    const loadStats = async () => {
      try {
        const activeVisits = await getActiveGuestVisits()
        setStats({ validToday: activeVisits.length, denied: 0 })
      } catch (error) {
        console.error('Error loading stats:', error)
      }
    }
    loadStats()
  }, [])

  const handleScan = async (codes: any[]) => {
    const first = codes?.[0]
    if (first?.rawValue && !isProcessing) {
      const qrData = first.rawValue.trim()
      setResult(qrData)
      setIsProcessing(true)
      
      try {
        // Try to parse QR code - could be:
        // 1. Visit ID (number)
        // 2. Guest Code (GUEST-xxx)
        // 3. JSON string with visit data
        // 4. JWT token (future implementation)
        
        let visit: GuestVisit | null = null
        
        // Try parsing as visit ID
        if (/^\d+$/.test(qrData)) {
          try {
            visit = await getGuestVisitById(parseInt(qrData))
          } catch (err) {
            // Not a valid visit ID
          }
        }
        
        // If not found, try searching active visits by card number or guest code
        if (!visit) {
          const activeVisits = await getActiveGuestVisits()
          
          // Try matching by RFID card number
          visit = activeVisits.find(v => v.rfidCardNumber === qrData) || null
          
          // Try matching by guest code
          if (!visit) {
            visit = activeVisits.find(v => v.guestCode === qrData) || null
          }
        }
        
        if (visit && visit.timeIn && !visit.timeOut) {
          // Valid active visit
          const entryTime = new Date(visit.timeIn)
          const entryTimeStr = entryTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
          
          // Calculate expiry (if maxTimeMinutes is set, otherwise assume 4 hours)
          const maxMinutes = visit.maxTimeMinutes || 240
          const expiryTime = new Date(entryTime.getTime() + maxMinutes * 60000)
          const now = new Date()
          
          const isExpired = now > expiryTime
          
          const verificationResult: VerificationResult = {
            visitorName: visit.guest?.fullName || 'Unknown',
            cnic: visit.guest?.cnicNumber || 'N/A',
            visitorType: visit.visitorType?.vTypeName || 'N/A',
            site: visit.departmentCategory?.categoryName || visit.department?.departmentName || 'N/A',
            purpose: visit.visitPurpose || 'N/A',
            cardNumber: visit.rfidCardNumber || 'N/A',
            entryTime: entryTimeStr,
            expiryTime: expiryTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
            status: isExpired ? 'expired' : 'valid',
            visit
          }
          
          setScanResult(verificationResult)
          
          // Update stats
          if (isExpired) {
            setStats(prev => ({ ...prev, denied: prev.denied + 1 }))
            setRecentScans(prev => [{
              name: verificationResult.visitorName,
              time: 'Just now',
              status: 'denied'
            }, ...prev.slice(0, 4)])
          } else {
            setRecentScans(prev => [{
              name: verificationResult.visitorName,
              time: 'Just now',
              status: 'allowed'
            }, ...prev.slice(0, 4)])
          }
        } else {
          // Visit not found or already checked out
          setScanResult({
            visitorName: 'Unknown',
            cnic: 'N/A',
            visitorType: 'N/A',
            site: 'N/A',
            purpose: 'N/A',
            cardNumber: qrData,
            entryTime: 'N/A',
            status: visit && visit.timeOut ? 'invalid' : 'not_found'
          })
          setStats(prev => ({ ...prev, denied: prev.denied + 1 }))
          setRecentScans(prev => [{
            name: 'Unknown',
            time: 'Just now',
            status: 'denied'
          }, ...prev.slice(0, 4)])
        }
      } catch (error) {
        console.error('Verification error:', error)
        setScanResult({
          visitorName: 'Error',
          cnic: 'N/A',
          visitorType: 'N/A',
          site: 'N/A',
          purpose: 'N/A',
          cardNumber: qrData,
          entryTime: 'N/A',
          status: 'invalid'
        })
        setStats(prev => ({ ...prev, denied: prev.denied + 1 }))
      } finally {
        setIsProcessing(false)
      }
    }
  }

  const handleAllow = () => {
    console.log('Access granted')
    setResult('')
    setScanResult(null)
  }

  const handleDeny = () => {
    console.log('Access denied')
    setResult('')
    setScanResult(null)
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="inline-flex items-center gap-3 bg-green-50 text-green-700 px-4 py-2 rounded-full text-sm font-medium">
          <QrCodeIcon className="w-5 h-5" />
          Guard Verification System
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-neutral-900">QR Code Scanner</h1>
        <p className="text-neutral-600 max-w-2xl mx-auto">
          Scan visitor QR codes for instant verification and access control
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Scanner Section */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-neutral-200 p-6">
            <div className="flex items-center gap-3 mb-4">
              <QrCodeIcon className="w-6 h-6 text-neutral-600" />
              <h3 className="text-lg font-semibold text-neutral-900">QR Scanner</h3>
            </div>
            <div className="aspect-video rounded-xl overflow-hidden bg-gradient-to-br from-neutral-100 to-neutral-200 border-2 border-dashed border-neutral-300">
              <Scanner
                onScan={handleScan}
                onError={() => {}}
              />
            </div>
            <div className="mt-4 text-center">
              <p className="text-sm text-neutral-600">Position QR code within the camera view</p>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-green-50 border border-green-200 rounded-xl p-4">
              <div className="flex items-center gap-2">
                <CheckCircleIcon className="w-5 h-5 text-green-600" />
                <span className="text-sm font-medium text-green-800">Valid Today</span>
              </div>
              <div className="text-2xl font-bold text-green-900 mt-1">{stats.validToday}</div>
            </div>
            <div className="bg-red-50 border border-red-200 rounded-xl p-4">
              <div className="flex items-center gap-2">
                <XCircleIcon className="w-5 h-5 text-red-600" />
                <span className="text-sm font-medium text-red-800">Denied</span>
              </div>
              <div className="text-2xl font-bold text-red-900 mt-1">{stats.denied}</div>
            </div>
          </div>
        </div>

        {/* Results Section */}
        <div className="space-y-6">
          {isProcessing ? (
            <div className="bg-white rounded-2xl border border-neutral-200 p-8">
              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto">
                  <div className="animate-spin w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full"></div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-neutral-900">Processing...</h3>
                  <p className="text-neutral-600">Verifying visitor credentials</p>
                </div>
              </div>
            </div>
          ) : scanResult ? (
            <div className="bg-white rounded-2xl border border-neutral-200 p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                  scanResult.status === 'valid' ? 'bg-green-100' :
                  scanResult.status === 'expired' ? 'bg-yellow-100' :
                  'bg-red-100'
                }`}>
                  {scanResult.status === 'valid' ? (
                    <CheckCircleIcon className="w-6 h-6 text-green-600" />
                  ) : scanResult.status === 'expired' ? (
                    <ClockIcon className="w-6 h-6 text-yellow-600" />
                  ) : (
                    <XCircleIcon className="w-6 h-6 text-red-600" />
                  )}
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-neutral-900">
                    {scanResult.status === 'valid' ? 'Access Granted' :
                     scanResult.status === 'expired' ? 'Pass Expired' :
                     scanResult.status === 'not_found' ? 'Visit Not Found' :
                     'Access Denied'}
                  </h3>
                  <p className={`text-sm ${
                    scanResult.status === 'valid' ? 'text-green-600' :
                    scanResult.status === 'expired' ? 'text-yellow-600' :
                    'text-red-600'
                  }`}>
                    {scanResult.status === 'valid' ? 'Visitor credentials verified' :
                     scanResult.status === 'expired' ? 'Visitor pass has expired' :
                     scanResult.status === 'not_found' ? 'No active visit found for this QR code' :
                     'Invalid or already checked out'}
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-3 p-3 bg-neutral-50 rounded-lg">
                    <UserIcon className="w-5 h-5 text-neutral-600" />
                    <div>
                      <div className="text-sm text-neutral-600">Visitor</div>
                      <div className="font-medium">{scanResult.visitorName}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-neutral-50 rounded-lg">
                    <BuildingOfficeIcon className="w-5 h-5 text-neutral-600" />
                    <div>
                      <div className="text-sm text-neutral-600">Site</div>
                      <div className="font-medium">{scanResult.site}</div>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-center py-2 border-b border-neutral-200">
                    <span className="text-sm text-neutral-600">CNIC</span>
                    <span className="font-mono text-sm">{scanResult.cnic}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-neutral-200">
                    <span className="text-sm text-neutral-600">Card Number</span>
                    <span className="font-mono text-sm">{scanResult.cardNumber}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-neutral-200">
                    <span className="text-sm text-neutral-600">Entry Time</span>
                    <span className="text-sm">{scanResult.entryTime}</span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-sm text-neutral-600">Expires</span>
                    <span className="text-sm">{scanResult.expiryTime}</span>
                  </div>
                </div>

                {scanResult.status === 'valid' && (
                  <div className="flex gap-3 pt-4">
                    <button
                      onClick={handleAllow}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl font-medium transition-colors"
                    >
                      <CheckCircleIcon className="w-5 h-5" />
                      Allow Access
                    </button>
                    <button
                      onClick={handleDeny}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-medium transition-colors"
                    >
                      <XCircleIcon className="w-5 h-5" />
                      Deny Access
                    </button>
                  </div>
                )}
                {(scanResult.status === 'expired' || scanResult.status === 'invalid' || scanResult.status === 'not_found') && (
                  <div className="pt-4">
                    <button
                      onClick={() => {
                        setResult('')
                        setScanResult(null)
                      }}
                      className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-neutral-600 hover:bg-neutral-700 text-white rounded-xl font-medium transition-colors"
                    >
                      Scan Another
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-neutral-200 p-8">
              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-neutral-100 rounded-2xl flex items-center justify-center mx-auto">
                  <QrCodeIcon className="w-8 h-8 text-neutral-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-neutral-900">Ready to Scan</h3>
                  <p className="text-neutral-600">Point camera at visitor QR code</p>
                </div>
              </div>
            </div>
          )}

          {/* Recent Scans */}
          <div className="bg-white rounded-2xl border border-neutral-200 p-6">
            <h4 className="text-lg font-semibold text-neutral-900 mb-4">Recent Scans</h4>
            <div className="space-y-3">
              {recentScans.length === 0 ? (
                <div className="text-center text-neutral-500 py-4 text-sm">No recent scans</div>
              ) : (
                recentScans.map((scan, index) => (
                <div key={index} className="flex items-center gap-3 p-3 rounded-lg bg-neutral-50">
                  <div className={`w-2 h-2 rounded-full ${
                    scan.status === 'allowed' ? 'bg-green-500' : 'bg-red-500'
                  }`}></div>
                  <div className="flex-1">
                    <div className="font-medium text-sm">{scan.name}</div>
                    <div className="text-xs text-neutral-500">{scan.time}</div>
                  </div>
                  <div className={`text-xs px-2 py-1 rounded-full ${
                    scan.status === 'allowed' 
                      ? 'bg-green-100 text-green-700' 
                      : 'bg-red-100 text-red-700'
                  }`}>
                    {scan.status}
                  </div>
                </div>
              ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}


