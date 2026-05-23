'use client'

import { useEffect, useState } from 'react'

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)
  const [showInstall, setShowInstall] = useState(false)

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e)
      setShowInstall(true)
    }
    
    window.addEventListener('beforeinstallprompt', handler)
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  const handleInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt()
      const { outcome } = await deferredPrompt.userChoice
      if (outcome === 'accepted') {
        setShowInstall(false)
      }
      setDeferredPrompt(null)
    }
  }

  if (!showInstall) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-blue-900 text-white p-4 flex justify-between items-center z-50 shadow-[0_-10px_40px_rgba(0,0,0,0.2)] pb-safe">
      <div>
        <p className="font-bold text-lg">Install FlightBooker</p>
        <p className="text-sm text-blue-200">Add to your home screen for offline access.</p>
      </div>
      <div className="flex gap-4 items-center">
        <button 
          onClick={() => setShowInstall(false)} 
          className="text-sm font-bold text-blue-300 hover:text-white"
        >
          Later
        </button>
        <button 
          onClick={handleInstall} 
          className="bg-white hover:bg-blue-50 text-blue-900 px-5 py-2 rounded-full text-sm font-bold shadow-md transition-colors"
        >
          Install App
        </button>
      </div>
    </div>
  )
}