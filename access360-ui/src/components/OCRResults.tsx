import React from 'react'
import { CheckCircleIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline'

interface OCRField {
  label: string
  value: string
  confidence: number
  isValid: boolean
}

interface OCRResultsProps {
  fields: OCRField[]
  onFieldChange: (index: number, value: string) => void
  isProcessing?: boolean
}

export default function OCRResults({ fields, onFieldChange, isProcessing }: OCRResultsProps): JSX.Element {
  if (isProcessing) {
    return (
      <div className="space-y-3">
        <div className="text-sm font-medium">OCR Results</div>
        <div className="flex items-center gap-2 text-sm text-neutral-600">
          <div className="animate-spin w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full" />
          Processing document...
        </div>
      </div>
    )
  }

  if (fields.length === 0) {
    return (
      <div className="space-y-3">
        <div className="text-sm font-medium">OCR Results</div>
        <div className="text-sm text-neutral-500">No results yet. Upload an ID document to begin.</div>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <div className="text-sm font-medium">OCR Results</div>
      <div className="space-y-2">
        {fields.map((field, index) => (
          <div key={index} className="grid gap-1">
            <div className="flex items-center gap-2">
              <label className="text-xs text-neutral-600">{field.label}</label>
              <div className="flex items-center gap-1">
                {field.isValid ? (
                  <CheckCircleIcon className="w-4 h-4 text-green-600" />
                ) : (
                  <ExclamationTriangleIcon className="w-4 h-4 text-amber-600" />
                )}
                <span className="text-xs text-neutral-500">
                  {Math.round(field.confidence * 100)}%
                </span>
              </div>
            </div>
            <input
              value={field.value}
              onChange={(e) => onFieldChange(index, e.target.value)}
              className={`rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 ${
                field.isValid 
                  ? 'border-green-300 focus:ring-green-500/30' 
                  : 'border-amber-300 focus:ring-amber-500/30'
              }`}
            />
          </div>
        ))}
      </div>
    </div>
  )
}



