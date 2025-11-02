import React from 'react'
import { 
  UserPlusIcon, 
  QrCodeIcon, 
  ChartBarIcon,
  ShieldCheckIcon,
  ClockIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline'

export default function HomeRoute(): JSX.Element {
  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="text-center space-y-4">
        <div className="inline-flex items-center gap-3 bg-blue-50 text-blue-700 px-4 py-2 rounded-full text-sm font-medium">
          <ShieldCheckIcon className="w-5 h-5" />
          AI-Powered Visitor Management
        </div>
        <h1 className="text-4xl font-bold tracking-tight text-neutral-900">
          Welcome to <span className="text-blue-600">Access360</span>
        </h1>
        <p className="text-xl text-neutral-600 max-w-2xl mx-auto">
          Secure, efficient, and auditable visitor management system for Forman Christian College University
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-xl p-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center">
              <UserPlusIcon className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-900">42</div>
              <div className="text-sm text-blue-700">Active Visitors</div>
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-xl p-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center">
              <ClockIcon className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="text-2xl font-bold text-green-900">2.1m</div>
              <div className="text-sm text-green-700">Avg. Processing</div>
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200 rounded-xl p-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-purple-500 rounded-lg flex items-center justify-center">
              <QrCodeIcon className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="text-2xl font-bold text-purple-900">1,247</div>
              <div className="text-sm text-purple-700">Total Visits</div>
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-amber-50 to-amber-100 border border-amber-200 rounded-xl p-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-amber-500 rounded-lg flex items-center justify-center">
              <ShieldCheckIcon className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="text-2xl font-bold text-amber-900">99.2%</div>
              <div className="text-sm text-amber-700">Security Score</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Actions */}
      <div className="grid md:grid-cols-3 gap-6">
        <a href="/enroll" className="group relative overflow-hidden rounded-2xl border border-neutral-200 bg-white p-8 hover:shadow-xl transition-all duration-300 hover:border-blue-300">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <div className="relative">
            <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-blue-200 transition-colors">
              <UserPlusIcon className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold text-neutral-900 mb-3">Counter Enrollment</h3>
            <p className="text-neutral-600 mb-4">OCR-based ID processing, live photo capture, and visitor card assignment for efficient intake.</p>
            <div className="flex items-center text-blue-600 font-medium group-hover:text-blue-700">
              <span>Start Enrollment</span>
              <svg className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </div>
        </a>

        <a href="/verify" className="group relative overflow-hidden rounded-2xl border border-neutral-200 bg-white p-8 hover:shadow-xl transition-all duration-300 hover:border-green-300">
          <div className="absolute inset-0 bg-gradient-to-br from-green-50/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <div className="relative">
            <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-green-200 transition-colors">
              <QrCodeIcon className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-xl font-semibold text-neutral-900 mb-3">Guard Verification</h3>
            <p className="text-neutral-600 mb-4">Offline QR code scanning and validation for secure building access control.</p>
            <div className="flex items-center text-green-600 font-medium group-hover:text-green-700">
              <span>Open Scanner</span>
              <svg className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </div>
        </a>

        <a href="/passes" className="group relative overflow-hidden rounded-2xl border border-neutral-200 bg-white p-8 hover:shadow-xl transition-all duration-300 hover:border-purple-300">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-50/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <div className="relative">
            <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-purple-200 transition-colors">
              <ChartBarIcon className="w-8 h-8 text-purple-600" />
            </div>
            <h3 className="text-xl font-semibold text-neutral-900 mb-3">Reports & Analytics</h3>
            <p className="text-neutral-600 mb-4">Live records, comprehensive reports, and data analytics with Excel export capabilities.</p>
            <div className="flex items-center text-purple-600 font-medium group-hover:text-purple-700">
              <span>View Reports</span>
              <svg className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </div>
        </a>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-2xl border border-neutral-200 p-8">
        <div className="flex items-center gap-3 mb-6">
          <DocumentTextIcon className="w-6 h-6 text-neutral-600" />
          <h3 className="text-xl font-semibold text-neutral-900">Recent Activity</h3>
        </div>
        <div className="space-y-4">
          {[
            { action: 'Visitor checked in', visitor: 'Ali Raza', time: '2 minutes ago', status: 'success' },
            { action: 'Card returned', visitor: 'Sara Ahmed', time: '5 minutes ago', status: 'success' },
            { action: 'New visitor registered', visitor: 'Muhammad Khan', time: '12 minutes ago', status: 'info' },
            { action: 'Lost card reported', visitor: 'Fatima Ali', time: '1 hour ago', status: 'warning' }
          ].map((activity, index) => (
            <div key={index} className="flex items-center gap-4 p-4 rounded-xl bg-neutral-50 hover:bg-neutral-100 transition-colors">
              <div className={`w-3 h-3 rounded-full ${
                activity.status === 'success' ? 'bg-green-500' :
                activity.status === 'warning' ? 'bg-amber-500' : 'bg-blue-500'
              }`}></div>
              <div className="flex-1">
                <div className="font-medium text-neutral-900">{activity.action}</div>
                <div className="text-sm text-neutral-600">{activity.visitor}</div>
              </div>
              <div className="text-sm text-neutral-500">{activity.time}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}


