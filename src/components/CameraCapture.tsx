import React, { useRef, useState, useEffect } from 'react'
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
      
      // Stop any existing stream first
      if (videoRef.current?.srcObject) {
        const existingStream = videoRef.current.srcObject as MediaStream
        existingStream.getTracks().forEach(track => track.stop())
      }
      
      // Try to use rear camera first (better for documents), fallback to any camera
      const constraints: MediaStreamConstraints = {
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: { ideal: 'environment' }, // Rear camera (on phones/tablets)
        }
      }
      
      let stream: MediaStream | null = null
      try {
        stream = await navigator.mediaDevices.getUserMedia(constraints)
      } catch (rearCameraError) {
        console.log('Rear camera not available, trying default camera')
        // Fallback to any available camera (default/front camera)
        try {
          stream = await navigator.mediaDevices.getUserMedia({
            video: { 
              width: { ideal: 1280 }, 
              height: { ideal: 720 },
              facingMode: 'user' // Front camera (laptop/desktop)
            }
          })
        } catch (frontCameraError) {
          // Last resort - try with minimal constraints
          stream = await navigator.mediaDevices.getUserMedia({
            video: true
          })
        }
      }
      
      if (!videoRef.current) {
        // Wait a bit for React to finish rendering
        await new Promise(resolve => setTimeout(resolve, 100))
        if (!videoRef.current) {
          throw new Error('Video element not available. Please try again.')
        }
      }
      
      if (stream) {
        const video = videoRef.current!
        
        // Set stream first
        video.srcObject = stream
        
        // Check if stream has active video tracks
        const videoTracks = stream.getVideoTracks()
        if (videoTracks.length === 0) {
          throw new Error('No video tracks in stream')
        }
        
        console.log('Video stream obtained, active tracks:', videoTracks.length)
        console.log('Video track settings:', videoTracks[0].getSettings())
        
        setIsStreaming(true)
        
        // Wait for video metadata to load, then play
        video.onloadedmetadata = () => {
          console.log('Video metadata loaded, dimensions:', video.videoWidth, 'x', video.videoHeight)
          if (video.videoWidth > 0 && video.videoHeight > 0) {
            video.play()
              .then(() => {
                console.log('Video playback started successfully')
                setError('') // Clear any previous errors
              })
              .catch(err => {
                console.error('Video play error after metadata loaded:', err)
                setError('Failed to start video playback. Please try again.')
              })
          } else {
            console.error('Video dimensions are 0, stream might not be active')
            setError('Video stream is not active. Please check your camera.')
          }
        }
        
        // Also try to play immediately (might work in some browsers)
        video.play()
          .then(() => {
            console.log('Video playback started immediately')
            setError('') // Clear any previous errors
          })
          .catch(err => {
            console.log('Immediate play failed (this is normal), waiting for metadata:', err.message)
            // Will play once metadata loads via onloadedmetadata
          })
        
        // Handle video loading errors
        video.onerror = (e) => {
          console.error('Video element error:', e)
          setError('Video playback error. Please check your camera.')
        }
        
        // Check if stream ends unexpectedly
        videoTracks[0].onended = () => {
          console.log('Video track ended')
          setIsStreaming(false)
          setError('Camera stream ended unexpectedly')
        }
      } else {
        throw new Error('Failed to get camera stream')
      }
    } catch (err) {
      console.error('Camera error:', err)
      setIsStreaming(false)
      if (err instanceof Error) {
        if (err.name === 'NotAllowedError') {
          setError('Camera access denied. Please allow camera access in your browser settings.')
        } else if (err.name === 'NotFoundError') {
          setError('No camera found. Please connect a camera and try again.')
        } else {
          setError(`Camera error: ${err.message}`)
        }
      } else {
        setError('Camera access denied or not available. Please check permissions.')
      }
    }
  }

  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream
      stream.getTracks().forEach(track => {
        track.stop()
        stream.removeTrack(track)
      })
      videoRef.current.srcObject = null
      videoRef.current.pause()
      setIsStreaming(false)
    }
  }

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopCamera()
    }
  }, [])

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
          <img src={capturedImage} alt="Captured" className="w-full h-full object-contain" />
        ) : (
          <>
            {/* Always render video element (hidden when not streaming) for ref availability */}
            <video 
              ref={videoRef} 
              autoPlay 
              playsInline 
              muted
              className={`w-full h-full object-cover bg-black ${isStreaming ? '' : 'hidden'}`}
              style={{ minHeight: '240px' }}
            />
            {!isStreaming && (
              <div className="w-full h-full flex items-center justify-center text-neutral-500 bg-neutral-50 min-h-[240px] absolute inset-0">
                <div className="text-center">
                  <CameraIcon className="w-12 h-12 mx-auto mb-2" />
                  <p className="text-xs">Camera preview will appear here</p>
                </div>
              </div>
            )}
          </>
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



