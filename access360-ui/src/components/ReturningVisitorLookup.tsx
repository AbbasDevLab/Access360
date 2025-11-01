import React, { useState } from 'react'
import { MagnifyingGlassIcon, UserIcon } from '@heroicons/react/24/outline'

interface Visitor {
  id: string
  fullName: string
  cnic: string
  phone?: string
  lastVisit?: string
  photoUri?: string
}

interface ReturningVisitorLookupProps {
  onVisitorFound: (visitor: Visitor) => void
  onNewVisitor: () => void
}

export default function ReturningVisitorLookup({ onVisitorFound, onNewVisitor }: ReturningVisitorLookupProps): JSX.Element {
  const [searchTerm, setSearchTerm] = useState('')
  const [isSearching, setIsSearching] = useState(false)
  const [results, setResults] = useState<Visitor[]>([])
  const [showResults, setShowResults] = useState(false)

  const handleSearch = async () => {
    if (!searchTerm.trim()) return
    
    setIsSearching(true)
    // Simulate API call
    setTimeout(() => {
      const mockResults: Visitor[] = [
        {
          id: '1',
          fullName: 'Ali Raza',
          cnic: '35202-1234567-1',
          phone: '+92-300-1234567',
          lastVisit: '2024-01-15',
          photoUri: ''
        },
        {
          id: '2', 
          fullName: 'Sara Ahmed',
          cnic: '35202-9876543-2',
          phone: '+92-300-9876543',
          lastVisit: '2024-01-10',
          photoUri: ''
        }
      ].filter(v => 
        v.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        v.cnic.includes(searchTerm) ||
        v.phone?.includes(searchTerm)
      )
      
      setResults(mockResults)
      setShowResults(true)
      setIsSearching(false)
    }, 1000)
  }

  const handleVisitorSelect = (visitor: Visitor) => {
    onVisitorFound(visitor)
    setShowResults(false)
    setSearchTerm('')
  }

  return (
    <div className="space-y-4">
      <div className="text-sm font-medium">Returning Visitor Lookup</div>
      
      <div className="space-y-2">
        <div className="flex gap-2">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by name, CNIC, or phone..."
            className="flex-1 rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30"
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          />
          <button
            onClick={handleSearch}
            disabled={isSearching || !searchTerm.trim()}
            className="px-3 py-2 rounded-md bg-blue-600 hover:bg-blue-700 disabled:bg-neutral-300 text-white text-sm flex items-center gap-2"
          >
            <MagnifyingGlassIcon className="w-4 h-4" />
            {isSearching ? 'Searching...' : 'Search'}
          </button>
        </div>
        
        {showResults && (
          <div className="space-y-2">
            {results.length === 0 ? (
              <div className="p-3 text-sm text-neutral-500 text-center">
                No visitors found. <button onClick={onNewVisitor} className="text-blue-600 hover:underline">Register new visitor</button>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="text-xs text-neutral-600">Found {results.length} visitor(s):</div>
                {results.map((visitor) => (
                  <button
                    key={visitor.id}
                    onClick={() => handleVisitorSelect(visitor)}
                    className="w-full p-3 text-left border rounded-lg hover:bg-neutral-50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-neutral-200 rounded-full flex items-center justify-center">
                        <UserIcon className="w-4 h-4 text-neutral-600" />
                      </div>
                      <div className="flex-1">
                        <div className="font-medium text-sm">{visitor.fullName}</div>
                        <div className="text-xs text-neutral-500">
                          {visitor.cnic} • {visitor.phone}
                        </div>
                        {visitor.lastVisit && (
                          <div className="text-xs text-neutral-400">
                            Last visit: {visitor.lastVisit}
                          </div>
                        )}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
      
      <div className="text-center">
        <button
          onClick={onNewVisitor}
          className="text-sm text-blue-600 hover:underline"
        >
          Register new visitor instead
        </button>
      </div>
    </div>
  )
}



