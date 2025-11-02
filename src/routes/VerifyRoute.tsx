import React, { useState } from 'react'
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

export default function VerifyRoute(): JSX.Element {
  const [result, setResult] = useState<string>('')
  const [scanResult, setScanResult] = useState<any>(null)
  const [isProcessing, setIsProcessing] = useState(false)

  const handleScan = (codes: any[]) => {
    const first = codes?.[0]
    if (first?.rawValue) {
      setResult(first.rawValue)
      setIsProcessing(true)
      
      // Simulate processing
      setTimeout(() => {
        setScanResult({
          visitorName: 'Ali Raza',
          cnic: '35202-1234567-1',
          visitorType: 'Parents / Guardians',
          site: 'CS Block',
          purpose: 'Meeting with professor',
          cardNumber: '001',
          entryTime: '14:30',
          expiryTime: '18:00',
          status: 'valid'
        })
        setIsProcessing(false)
      }, 1500)
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
              <div className="text-2xl font-bold text-green-900 mt-1">42</div>
            </div>
            <div className="bg-red-50 border border-red-200 rounded-xl p-4">
              <div className="flex items-center gap-2">
                <XCircleIcon className="w-5 h-5 text-red-600" />
                <span className="text-sm font-medium text-red-800">Denied</span>
              </div>
              <div className="text-2xl font-bold text-red-900 mt-1">3</div>
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
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                  <CheckCircleIcon className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-neutral-900">Access Granted</h3>
                  <p className="text-sm text-green-600">Visitor credentials verified</p>
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
              {[
                { name: 'Sara Ahmed', time: '2 min ago', status: 'allowed' },
                { name: 'Muhammad Khan', time: '5 min ago', status: 'allowed' },
                { name: 'Fatima Ali', time: '8 min ago', status: 'denied' }
              ].map((scan, index) => (
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
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}


