'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useFlightStore, Seat } from '../../../store/useFlightStore'
import { useUserStore } from '../../../store/useUserStore'
import { createClient } from '../../../utils/supabase/client'

export default function SeatSelectionPage() {
  const router = useRouter()
  const supabase = createClient()
  
  const selectedFlight = useFlightStore((state) => state.selectedFlight)
  const passengerDetails = useFlightStore((state) => state.passengerDetails)
  const selectedSeat = useFlightStore((state) => state.selectedSeat)
  const setSelectedSeat = useFlightStore((state) => state.setSelectedSeat)
  const session = useUserStore((state) => state.session)

  const [seats, setSeats] = useState<Seat[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!selectedFlight || !passengerDetails) {
      router.push('/')
      return
    }

    const fetchSeats = async () => {
      const { data, error } = await supabase
        .from('seats')
        .select('*')
        .eq('flight_id', selectedFlight.id)

      if (data) {
        const sortedSeats = data.sort((a, b) => 
          a.seat_number.localeCompare(b.seat_number, undefined, { numeric: true })
        )
        setSeats(sortedSeats)
      }
      setLoading(false)
    }

    fetchSeats()
  }, [selectedFlight, passengerDetails, supabase, router])

  const getSeatColor = (seat: Seat) => {
    if (selectedSeat?.id === seat.id) return 'bg-blue-500 text-white shadow-[0_0_15px_rgba(59,130,246,0.6)]'
    if (!seat.is_available) return 'bg-slate-800 text-slate-600 cursor-not-allowed opacity-50'
    
    // Transparent glass seats
    return 'bg-white/5 border border-white/10 text-white hover:bg-white/10 cursor-pointer'
  }

  const rows = seats.reduce((acc, seat) => {
    const rowNum = seat.seat_number.match(/\d+/)?.[0] || '0'
    if (!acc[rowNum]) acc[rowNum] = []
    acc[rowNum].push(seat)
    return acc
  }, {} as Record<string, Seat[]>)

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div></div>
  }

  return (
    <main className="min-h-screen p-4 md:p-12 text-white">
      <div className="max-w-5xl mx-auto flex flex-col lg:flex-row gap-8">
        
        {/* Seat Map */}
        <div className="flex-1 glass-panel p-8 rounded-3xl overflow-x-auto">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold">Select Your Seat</h2>
            <p className="text-blue-400">Flight {selectedFlight?.flight_no}</p>
          </div>

          <div className="flex flex-col items-center space-y-4 bg-white/5 p-8 rounded-[3rem] border border-white/5 relative">
            <div className="w-32 h-16 bg-blue-900/50 rounded-t-full mb-4 border-b-2 border-blue-500/30"></div>

            {Object.keys(rows).map((rowNum) => (
              <div key={rowNum} className="w-full flex items-center justify-center gap-6">
                <div className="flex gap-2">
                  {rows[rowNum].slice(0, 3).map((seat) => (
                    <button key={seat.id} disabled={!seat.is_available} onClick={() => setSelectedSeat(seat)}
                      className={`w-12 h-12 rounded-xl font-bold transition-all flex items-center justify-center ${getSeatColor(seat)}`}>
                      {seat.seat_number}
                    </button>
                  ))}
                </div>
                <div className="w-8 text-center text-blue-500 font-bold">{rowNum}</div>
                <div className="flex gap-2">
                  {rows[rowNum].slice(3, 6).map((seat) => (
                    <button key={seat.id} disabled={!seat.is_available} onClick={() => setSelectedSeat(seat)}
                      className={`w-12 h-12 rounded-xl font-bold transition-all flex items-center justify-center ${getSeatColor(seat)}`}>
                      {seat.seat_number}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Sidebar */}
        <div className="w-full lg:w-80 space-y-6">
          <div className="glass-panel p-6 rounded-3xl">
            <h3 className="font-bold mb-4">Cabin Classes</h3>
            <div className="space-y-3 text-sm text-slate-300">
              <div className="flex items-center gap-3"><div className="w-4 h-4 bg-blue-500 rounded"></div> Selected</div>
              <div className="flex items-center gap-3"><div className="w-4 h-4 bg-white/10 rounded"></div> Available</div>
              <div className="flex items-center gap-3"><div className="w-4 h-4 bg-slate-800 rounded"></div> Occupied</div>
            </div>
          </div>

          {selectedSeat && (
            <div className="glass-panel p-6 rounded-3xl border-blue-500/50">
              <h3 className="font-bold text-lg mb-4">Summary</h3>
              <div className="flex justify-between text-sm mb-2 text-slate-300">
                <span>Base Fare</span>
                <span>₹{selectedFlight?.base_price.toLocaleString('en-IN')}</span>
              </div>
              <div className="text-2xl font-bold mb-6">
                ₹{((selectedFlight?.base_price || 0) + selectedSeat.extra_fee).toLocaleString('en-IN')}
              </div>
              <button onClick={() => router.push(session ? '/booking/confirm' : '/auth')}
                className="w-full bg-blue-600 hover:bg-blue-500 py-3 rounded-xl font-bold transition-all">
                Continue to Payment
              </button>
            </div>
          )}
        </div>
      </div>
    </main>
  )
}