import React from 'react'
import { CreditCardIcon, CheckCircleIcon } from '@heroicons/react/24/outline'

interface Card {
  id: string
  number: string
  status: 'available' | 'assigned' | 'lost'
}

interface CardAssignmentProps {
  cards: Card[]
  selectedCardId?: string
  onCardSelect: (cardId: string) => void
  assignedCard?: Card
}

export default function CardAssignment({ cards, selectedCardId, onCardSelect, assignedCard }: CardAssignmentProps): JSX.Element {
  const availableCards = cards.filter(card => card.status === 'available')

  if (assignedCard) {
    return (
      <div className="space-y-3">
        <div className="text-sm font-medium">Assigned Card</div>
        <div className="flex items-center gap-3 p-3 bg-green-50 border border-green-200 rounded-lg">
          <CheckCircleIcon className="w-6 h-6 text-green-600" />
          <div>
            <div className="font-medium text-green-800">Card #{assignedCard.number}</div>
            <div className="text-sm text-green-600">Successfully assigned</div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <div className="text-sm font-medium">Card Assignment</div>
      <div className="text-xs text-neutral-500 mb-2">
        Available cards: {availableCards.length} of {cards.length}
      </div>
      
      {availableCards.length === 0 ? (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
          <div className="text-sm text-amber-800">No available cards. Please return a card or contact admin.</div>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-2">
          {availableCards.slice(0, 8).map((card) => (
            <button
              key={card.id}
              onClick={() => onCardSelect(card.id)}
              className={`p-3 rounded-lg border text-left transition-colors ${
                selectedCardId === card.id
                  ? 'border-blue-500 bg-blue-50 text-blue-800'
                  : 'border-neutral-200 hover:border-neutral-300 hover:bg-neutral-50'
              }`}
            >
              <div className="flex items-center gap-2">
                <CreditCardIcon className="w-4 h-4" />
                <span className="text-sm font-medium">#{card.number}</span>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}



