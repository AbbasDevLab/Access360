import React, { useState } from 'react'
import { visitorCategories, campusSites } from '../data/constants'
import CameraCapture from '../components/CameraCapture'
import OCRResults from '../components/OCRResults'
import CardAssignment from '../components/CardAssignment'
import ReturningVisitorLookup from '../components/ReturningVisitorLookup'
import ExitFlow from '../components/ExitFlow'

export async function loader() {
  return null
}

export default function EnrollRoute(): JSX.Element {
  const [mode, setMode] = useState<'lookup' | 'new' | 'exit'>('lookup')
  const [capturedImage, setCapturedImage] = useState('')
  const [ocrFields, setOcrFields] = useState<Array<{label: string, value: string, confidence: number, isValid: boolean}>>([])
  const [isProcessingOCR, setIsProcessingOCR] = useState(false)
  const [selectedCardId, setSelectedCardId] = useState('')
  const [assignedCard, setAssignedCard] = useState<any>(null)
  const [returningVisitor, setReturningVisitor] = useState<any>(null)

  // Mock card data
  const cards = [
    { id: '1', number: '001', status: 'available' as const },
    { id: '2', number: '002', status: 'available' as const },
    { id: '3', number: '003', status: 'assigned' as const },
    { id: '4', number: '004', status: 'available' as const },
    { id: '5', number: '005', status: 'lost' as const },
  ]

  const handleFileUpload = async (file: File) => {
    setIsProcessingOCR(true)
    // Simulate OCR processing
    setTimeout(() => {
      setOcrFields([
        { label: 'Full Name', value: 'Ali Raza', confidence: 0.95, isValid: true },
        { label: 'CNIC', value: '35202-1234567-1', confidence: 0.98, isValid: true },
        { label: 'Father Name', value: 'Muhammad Raza', confidence: 0.87, isValid: true },
        { label: 'Date of Birth', value: '1990-01-15', confidence: 0.92, isValid: true },
      ])
      setIsProcessingOCR(false)
    }, 2000)
  }

  const handleOCRFieldChange = (index: number, value: string) => {
    const newFields = [...ocrFields]
    newFields[index].value = value
    setOcrFields(newFields)
  }

  const handleCardSelect = (cardId: string) => {
    setSelectedCardId(cardId)
  }

  const handleIssuePass = () => {
    if (selectedCardId) {
      const card = cards.find(c => c.id === selectedCardId)
      setAssignedCard(card)
    }
  }

  const handleVisitorFound = (visitor: any) => {
    setReturningVisitor(visitor)
    setMode('new')
  }

  const handleExit = (cardId: string, cardReturned: boolean, notes?: string) => {
    console.log('Exit processed:', { cardId, cardReturned, notes })
    // Reset form
    setMode('lookup')
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-neutral-900">Counter Enrollment</h1>
          <p className="text-neutral-600 mt-2">Manage visitor intake, card assignment, and exit processing</p>
        </div>
        <div className="flex gap-2 bg-neutral-100 p-1 rounded-xl">
          <button
            onClick={() => setMode('lookup')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              mode === 'lookup' 
                ? 'bg-white text-blue-700 shadow-sm' 
                : 'text-neutral-600 hover:text-neutral-800'
            }`}
          >
            Lookup
          </button>
          <button
            onClick={() => setMode('new')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              mode === 'new' 
                ? 'bg-white text-blue-700 shadow-sm' 
                : 'text-neutral-600 hover:text-neutral-800'
            }`}
          >
            New Visitor
          </button>
          <button
            onClick={() => setMode('exit')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              mode === 'exit' 
                ? 'bg-white text-blue-700 shadow-sm' 
                : 'text-neutral-600 hover:text-neutral-800'
            }`}
          >
            Exit
          </button>
        </div>
      </div>

      {mode === 'lookup' && (
        <ReturningVisitorLookup
          onVisitorFound={handleVisitorFound}
          onNewVisitor={() => setMode('new')}
        />
      )}

      {mode === 'new' && (
        <>
          <div className="grid md:grid-cols-2 gap-6">
            <section className="rounded-xl border bg-white p-5">
              <div className="font-medium mb-3">ID Document</div>
              <div className="grid gap-3">
                <input 
                  type="file" 
                  accept="image/*,application/pdf" 
                  onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
                  className="block w-full text-sm file:mr-3 file:rounded-md file:border file:bg-neutral-50 file:px-3 file:py-2" 
                />
                <OCRResults
                  fields={ocrFields}
                  onFieldChange={handleOCRFieldChange}
                  isProcessing={isProcessingOCR}
                />
              </div>
            </section>
            
            <section className="rounded-xl border bg-white p-5">
              <div className="font-medium mb-3">Live Photo</div>
              <CameraCapture
                onCapture={setCapturedImage}
                capturedImage={capturedImage}
              />
            </section>
          </div>

          <section className="rounded-xl border bg-white p-5">
            <div className="font-medium mb-3">Details</div>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="grid gap-1">
                <label className="text-sm text-neutral-600">Full Name</label>
                <input 
                  className="rounded-md border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500/30" 
                  placeholder="e.g., Ali Raza" 
                  defaultValue={returningVisitor?.fullName || ''}
                />
              </div>
              <div className="grid gap-1">
                <label className="text-sm text-neutral-600">CNIC / ID Number</label>
                <input 
                  className="rounded-md border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500/30" 
                  placeholder="35202-1234567-1" 
                  defaultValue={returningVisitor?.cnic || ''}
                />
              </div>
              <div className="grid gap-1">
                <label className="text-sm text-neutral-600">Visitor Type</label>
                <select className="rounded-md border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500/30">
                  {visitorCategories.map((c) => (
                    <option key={c}>{c}</option>
                  ))}
                </select>
              </div>
              <div className="grid gap-1">
                <label className="text-sm text-neutral-600">Site / Destination</label>
                <select className="rounded-md border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500/30">
                  {campusSites.map((g) => (
                    <optgroup key={g.group} label={g.group}>
                      {g.sites.map((s) => (
                        <option key={s}>{s}</option>
                      ))}
                    </optgroup>
                  ))}
                </select>
              </div>
              <div className="grid gap-1">
                <label className="text-sm text-neutral-600">Purpose</label>
                <input className="rounded-md border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500/30" placeholder="Meeting / Delivery" />
              </div>
              <div className="grid gap-1">
                <label className="text-sm text-neutral-600">Appointment</label>
                <div className="flex items-center gap-3 text-sm">
                  <label className="inline-flex items-center gap-2"><input type="checkbox" className="size-4" /> Has Appointment</label>
                  <label className="inline-flex items-center gap-2"><input type="checkbox" className="size-4" /> Escort Required</label>
                </div>
              </div>
              <div className="md:col-span-2 grid gap-1">
                <label className="text-sm text-neutral-600">Notes</label>
                <textarea rows={3} className="rounded-md border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500/30" placeholder="Any special instructions or remarks" />
              </div>
            </div>
          </section>

          <section className="rounded-xl border bg-white p-5">
            <CardAssignment
              cards={cards}
              selectedCardId={selectedCardId}
              onCardSelect={handleCardSelect}
              assignedCard={assignedCard}
            />
          </section>

          <div className="flex items-center gap-3">
            <button 
              onClick={handleIssuePass}
              disabled={!selectedCardId || assignedCard}
              className="rounded-md bg-blue-600 hover:bg-blue-700 disabled:bg-neutral-300 text-white px-4 py-2 text-sm"
            >
              {assignedCard ? 'Pass Issued' : 'Issue Pass'}
            </button>
            <span className="text-sm text-neutral-500">
              {assignedCard ? 'Card assigned and pass issued' : 'Select a card to issue pass'}
            </span>
          </div>
        </>
      )}

      {mode === 'exit' && (
        <ExitFlow onExit={handleExit} />
      )}
    </div>
  )
}


