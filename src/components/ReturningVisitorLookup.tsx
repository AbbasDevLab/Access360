import React, { useState } from 'react'
import { MagnifyingGlassIcon, UserIcon } from '@heroicons/react/24/outline'
import { getAllGuests, getGuestByCNIC, getGuestByCode } from '../services/guestsApi'
import { getGuestVisitsByGuestId } from '../services/guestVisitApi'
import type { Guest } from '../services/guestsApi'

interface Visitor {
  id: string
  fullName: string
  cnic: string
  phone?: string
  lastVisit?: string
  photoUri?: string
}

interface ReturningVisitorLookupProps {
  onVisitorFound: (visitor: any) => void
  onNewVisitor: () => void
}

export default function ReturningVisitorLookup({ onVisitorFound, onNewVisitor }: ReturningVisitorLookupProps): JSX.Element {
  const [searchTerm, setSearchTerm] = useState('')
  const [isSearching, setIsSearching] = useState(false)
  const [results, setResults] = useState<Guest[]>([])
  const [showResults, setShowResults] = useState(false)
  const [error, setError] = useState('')

  const handleSearch = async () => {
    if (!searchTerm.trim()) return
    
    setIsSearching(true)
    setError('')
    setResults([])
    setShowResults(false)
    
    try {
      const search = searchTerm.trim()
      
      // Try to search by CNIC first (most specific)
      if (/^\d{5}-?\d{7}-?\d{1}$/.test(search.replace(/\s/g, ''))) {
        // Looks like a CNIC
        const cnic = search.replace(/\s/g, '').replace(/(\d{5})(\d{7})(\d{1})/, '$1-$2-$3')
        try {
          const guest = await getGuestByCNIC(cnic)
          setResults([guest])
          setShowResults(true)
        } catch (err) {
          setError('No visitor found with this CNIC')
        }
      } else if (/^GUEST-/.test(search.toUpperCase())) {
        // Looks like a guest code
        try {
          const guest = await getGuestByCode(search.toUpperCase())
          setResults([guest])
          setShowResults(true)
        } catch (err) {
          setError('No visitor found with this code')
        }
      } else {
        // Search by name or phone - get all guests and filter
        const allGuests = await getAllGuests()
        const filtered = allGuests.filter(g => 
          g.fullName?.toLowerCase().includes(search.toLowerCase()) ||
          g.phoneNumber?.includes(search) ||
          g.cnicNumber?.includes(search)
        )
        
        if (filtered.length === 0) {
          setError('No visitors found matching your search')
        } else {
          setResults(filtered.slice(0, 10)) // Limit to 10 results
          setShowResults(true)
        }
      }
    } catch (err) {
      console.error('Search error:', err)
      setError('Error searching for visitors. Please try again.')
    } finally {
      setIsSearching(false)
    }
  }

  const handleVisitorSelect = async (guest: Guest) => {
    try {
      // Get last visit for this guest
      const visits = await getGuestVisitsByGuestId(guest.idpk)
      const lastVisit = visits.length > 0 && visits[0].timeIn 
        ? new Date(visits[0].timeIn).toLocaleDateString()
        : undefined
      
      // Convert Guest to Visitor format for compatibility
      const visitor = {
        ...guest,
        id: guest.idpk.toString(),
        cnic: guest.cnicNumber,
        phone: guest.phoneNumber,
        lastVisit,
      }
      
      onVisitorFound(visitor)
      setShowResults(false)
      setSearchTerm('')
      setResults([])
    } catch (err) {
      console.error('Error loading visitor details:', err)
      // Still proceed with the guest data we have
      onVisitorFound(guest)
      setShowResults(false)
      setSearchTerm('')
      setResults([])
    }
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
        
        {error && (
          <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg">
            {error}
          </div>
        )}
        
        {showResults && (
          <div className="space-y-2">
            {results.length === 0 ? (
              <div className="p-3 text-sm text-neutral-500 text-center">
                No visitors found. <button onClick={onNewVisitor} className="text-blue-600 hover:underline">Register new visitor</button>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="text-xs text-neutral-600">Found {results.length} visitor(s):</div>
                {results.map((guest) => (
                  <button
                    key={guest.idpk}
                    onClick={() => handleVisitorSelect(guest)}
                    className="w-full p-3 text-left border rounded-lg hover:bg-neutral-50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-neutral-200 rounded-full flex items-center justify-center">
                        <UserIcon className="w-4 h-4 text-neutral-600" />
                      </div>
                      <div className="flex-1">
                        <div className="font-medium text-sm">{guest.fullName}</div>
                        <div className="text-xs text-neutral-500">
                          {guest.cnicNumber} • {guest.phoneNumber}
                        </div>
                        {guest.guestCode && (
                          <div className="text-xs text-neutral-400">
                            Code: {guest.guestCode}
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



