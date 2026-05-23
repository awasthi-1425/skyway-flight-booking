'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useFlightStore } from '../store/useFlightStore'
import { useUserStore } from '../store/useUserStore'

export default function Home() {
  const router = useRouter()
  const setSearchQuery = useFlightStore((state) => state.setSearchQuery)
  const session = useUserStore((state) => state.session)

  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)

  useEffect(() => {
    window.addEventListener('beforeinstallprompt', (e: any) => {
      e.preventDefault()
      setDeferredPrompt(e)
    })
  }, [])

  const handleInstallClick = () => {
    if (deferredPrompt) deferredPrompt.prompt()
  }

  const [origin, setOrigin] = useState('DEL')
  const [destination, setDestination] = useState('BOM')
  const [date, setDate] = useState('')
  const [passengers, setPassengers] = useState(1)

  const airports = [
    { code: 'DEL', name: 'New Delhi' },
    { code: 'BOM', name: 'Mumbai' },
    { code: 'BLR', name: 'Bengaluru' },
  ]

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setSearchQuery({ origin, destination, date, passengers })
    router.push('/results')
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-6 text-white relative">
      
      {/* Navbar */}
      <div className="absolute top-0 w-full flex justify-between items-center p-8 z-50">
        <div className="text-2xl font-black tracking-tighter">Skyway</div>
        <div className="flex gap-4">
          {deferredPrompt && (
            <button onClick={handleInstallClick} className="text-sm font-bold opacity-80 hover:opacity-100">
              Install
            </button>
          )}
          <button 
            onClick={() => router.push(session ? '/profile' : '/auth')}
            className="bg-white/10 hover:bg-white/20 backdrop-blur-md px-6 py-2 rounded-full font-bold transition-all border border-white/10"
          >
            {session ? 'My Bookings' : 'Sign In'}
          </button>
        </div>
      </div>

      {/* Hero Section */}
      <div className="text-center mb-12">
        <h1 className="text-6xl md:text-7xl font-extrabold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-white to-blue-200">
          Fly anywhere.
        </h1>
        <h2 className="text-5xl md:text-6xl font-extrabold text-blue-500">Booked in seconds.</h2>
        <p className="mt-6 text-gray-400 max-w-lg mx-auto">
          Search global routes, pick your seat, and manage every trip from one minimal dashboard.
        </p>
      </div>

      {/* Search Panel (Glassmorphism) */}
      <div className="w-full max-w-5xl bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-3xl shadow-2xl">
        <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
          
          <div className="md:col-span-1">
            <label className="text-xs text-blue-300 uppercase tracking-widest font-bold mb-2 block">From</label>
            <select value={origin} onChange={(e) => setOrigin(e.target.value)} className="w-full bg-transparent border-b border-white/20 py-2 outline-none focus:border-blue-400">
              {airports.map(apt => <option key={apt.code} value={apt.code} className="text-black">{apt.name}</option>)}
            </select>
          </div>

          <div className="md:col-span-1">
            <label className="text-xs text-blue-300 uppercase tracking-widest font-bold mb-2 block">To</label>
            <select value={destination} onChange={(e) => setDestination(e.target.value)} className="w-full bg-transparent border-b border-white/20 py-2 outline-none focus:border-blue-400">
              {airports.map(apt => <option key={apt.code} value={apt.code} className="text-black">{apt.name}</option>)}
            </select>
          </div>

          <div className="md:col-span-1">
            <label className="text-xs text-blue-300 uppercase tracking-widest font-bold mb-2 block">Depart</label>
            <input type="date" required value={date} onChange={(e) => setDate(e.target.value)} className="w-full bg-transparent border-b border-white/20 py-2 outline-none text-white focus:border-blue-400" />
          </div>

          <div className="md:col-span-1">
            <label className="text-xs text-blue-300 uppercase tracking-widest font-bold mb-2 block">Passengers</label>
            <select value={passengers} onChange={(e) => setPassengers(Number(e.target.value))} className="w-full bg-transparent border-b border-white/20 py-2 outline-none focus:border-blue-400">
              {[1, 2, 3, 4].map(num => <option key={num} value={num} className="text-black">{num} passenger</option>)}
            </select>
          </div>

          <button type="submit" className="bg-blue-600 hover:bg-blue-500 transition-all py-3 rounded-xl font-bold shadow-lg shadow-blue-900/50">
            Search
          </button>
        </form>
      </div>

      {/* Feature Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12 max-w-5xl w-full">
        {[
          { title: "Instant confirmation", desc: "PNR generated the moment you book." },
          { title: "Free cancellation", desc: "Cancel up to 2 hours before departure." },
          { title: "Global routes", desc: "13 airports, 4 carriers, hundreds of daily flights." }
        ].map((feat, i) => (
          <div key={i} className="bg-white/5 backdrop-blur-md p-6 rounded-2xl border border-white/5">
            <p className="font-bold mb-2">{feat.title}</p>
            <p className="text-sm text-gray-400">{feat.desc}</p>
          </div>
        ))}
      </div>
    </main>
  )
}