import React, { useState } from 'react'
import { ArrowRightIcon, CheckCircleIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline'

interface ExitFlowProps {
  onExit: (cardId: string, cardReturned: boolean, notes?: string) => void
}

export default function ExitFlow({ onExit }: ExitFlowProps): JSX.Element {
  const [cardId, setCardId] = useState('')
  const [cardReturned, setCardReturned] = useState(true)
  const [notes, setNotes] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)

  const handleExit = async () => {
    if (!cardId.trim()) return
    
    setIsProcessing(true)
    // Simulate processing
    setTimeout(() => {
      onExit(cardId, cardReturned, notes)
      setIsProcessing(false)
    }, 1000)
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-lg font-semibold text-neutral-800">Visitor Exit</h2>
        <p className="text-sm text-neutral-600">Process visitor checkout and card return</p>
      </div>

      <div className="space-y-4">
        <div className="grid gap-1">
          <label className="text-sm font-medium text-neutral-700">Card Number</label>
          <input
            type="text"
            value={cardId}
            onChange={(e) => setCardId(e.target.value)}
            placeholder="Enter card number (e.g., 001, 002, 003...)"
            className="rounded-md border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
          />
        </div>

        <div className="space-y-3">
          <div className="text-sm font-medium text-neutral-700">Card Return Status</div>
          <div className="space-y-2">
            <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-neutral-50">
              <input
                type="radio"
                name="cardReturned"
                checked={cardReturned}
                onChange={() => setCardReturned(true)}
                className="w-4 h-4 text-green-600"
              />
              <CheckCircleIcon className="w-5 h-5 text-green-600" />
              <div>
                <div className="font-medium text-green-800">Card Returned</div>
                <div className="text-sm text-green-600">Visitor has returned the card</div>
              </div>
            </label>
            
            <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-neutral-50">
              <input
                type="radio"
                name="cardReturned"
                checked={!cardReturned}
                onChange={() => setCardReturned(false)}
                className="w-4 h-4 text-amber-600"
              />
              <ExclamationTriangleIcon className="w-5 h-5 text-amber-600" />
              <div>
                <div className="font-medium text-amber-800">Card Not Returned</div>
                <div className="text-sm text-amber-600">Mark as lost card - will trigger alert</div>
              </div>
            </label>
          </div>
        </div>

        {!cardReturned && (
          <div className="grid gap-1">
            <label className="text-sm font-medium text-neutral-700">Lost Card Notes</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Additional details about the lost card..."
              rows={3}
              className="rounded-md border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500/30"
            />
          </div>
        )}

        <div className="grid gap-1">
          <label className="text-sm font-medium text-neutral-700">Exit Notes (Optional)</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Any additional notes about the visit..."
            rows={2}
            className="rounded-md border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
          />
        </div>
      </div>

      <div className="flex gap-3">
        <button
          onClick={handleExit}
          disabled={!cardId.trim() || isProcessing}
          className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-md text-white font-medium ${
            cardReturned 
              ? 'bg-green-600 hover:bg-green-700' 
              : 'bg-amber-600 hover:bg-amber-700'
          } disabled:bg-neutral-300`}
        >
          {isProcessing ? (
            <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
          ) : (
            <ArrowRightIcon className="w-4 h-4" />
          )}
          {cardReturned ? 'Process Exit' : 'Mark Card Lost'}
        </button>
      </div>
    </div>
  )
}



