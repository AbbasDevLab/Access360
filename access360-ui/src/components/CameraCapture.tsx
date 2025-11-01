import React, { useRef, useState } from 'react'
import { CameraIcon, PhotoIcon } from '@heroicons/react/24/outline'

interface CameraCaptureProps {
  onCapture: (imageData: string) => void
  capturedImage?: string
}

export default function CameraCapture({ onCapture, capturedImage }: CameraCaptureProps): JSX.Element {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isStreaming, setIsStreaming] = useState(false)
  const [error, setError] = useState<string>('')

  const startCamera = async () => {
    try {
      setError('')
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { width: 640, height: 480, facingMode: 'user' } 
      })
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        setIsStreaming(true)
      }
    } catch (err) {
      setError('Camera access denied or not available')
    }
  }

  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream
      stream.getTracks().forEach(track => track.stop())
      videoRef.current.srcObject = null
      setIsStreaming(false)
    }
  }

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const canvas = canvasRef.current
      const video = videoRef.current
      const ctx = canvas.getContext('2d')
      
      if (ctx) {
        canvas.width = video.videoWidth
        canvas.height = video.videoHeight
        ctx.drawImage(video, 0, 0)
        const imageData = canvas.toDataURL('image/jpeg', 0.8)
        onCapture(imageData)
        stopCamera()
      }
    }
  }

  return (
    <div className="space-y-3">
      <div className="aspect-video bg-neutral-100 rounded-lg overflow-hidden relative">
        {capturedImage ? (
          <img src={capturedImage} alt="Captured" className="w-full h-full object-cover" />
        ) : isStreaming ? (
          <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-neutral-500">
            <CameraIcon className="w-12 h-12" />
          </div>
        )}
      </div>
      
      {error && <div className="text-sm text-red-600">{error}</div>}
      
      <div className="flex gap-2">
        {!capturedImage && (
          <button
            onClick={isStreaming ? stopCamera : startCamera}
            className="flex items-center gap-2 px-3 py-2 rounded-md border hover:bg-neutral-50 text-sm"
          >
            <CameraIcon className="w-4 h-4" />
            {isStreaming ? 'Stop Camera' : 'Start Camera'}
          </button>
        )}
        
        {isStreaming && (
          <button
            onClick={capturePhoto}
            className="flex items-center gap-2 px-3 py-2 rounded-md bg-blue-600 hover:bg-blue-700 text-white text-sm"
          >
            <PhotoIcon className="w-4 h-4" />
            Capture Photo
          </button>
        )}
        
        {capturedImage && (
          <button
            onClick={() => onCapture('')}
            className="px-3 py-2 rounded-md border hover:bg-neutral-50 text-sm"
          >
            Retake
          </button>
        )}
      </div>
      
      <canvas ref={canvasRef} className="hidden" />
    </div>
  )
}



