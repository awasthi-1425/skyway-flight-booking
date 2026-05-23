'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useUserStore } from '../../store/useUserStore'
import { useFlightStore } from '../../store/useFlightStore'
import { createClient } from '../../utils/supabase/client'
import { formatDistanceToNow } from 'date-fns'

export default function ProfilePage() {
  const router = useRouter()
  const supabase = createClient()
  const session = useUserStore((state) => state.session)

  const [bookings, setBookings] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  
  // Cancel Modal State
  const [bookingToCancel, setBookingToCancel] = useState<string | null>(null)
  const [isCancelling, setIsCancelling] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  // Reschedule Modal State
  const [rescheduleBooking, setRescheduleBooking] = useState<any | null>(null)
  const [altFlights, setAltFlights] = useState<any[]>([])
  const [loadingAlt, setLoadingAlt] = useState(false)
  const [isRescheduling, setIsRescheduling] = useState(false)

  useEffect(() => {
    if (!session) {
      router.push('/auth')
      return
    }
    fetchMyBookings()
  }, [session, supabase, router])

  const fetchMyBookings = async () => {
    const { data, error } = await supabase
      .from('bookings')
      .select(`
        id, pnr_code, status, total_price, created_at,
        flights ( id, flight_no, origin, destination, departs_at, base_price ),
        seats ( seat_number, class )
      `)
      .eq('user_id', session?.user.id)
      .order('created_at', { ascending: false })

    if (!error && data) setBookings(data)
    setLoading(false)
  }

  // --- CANCELLATION LOGIC ---
  const handleCancelBooking = async () => {
    if (!bookingToCancel) return
    setIsCancelling(true)
    setErrorMsg('')
    try {
      const { error } = await supabase.rpc('cancel_booking', { p_booking_id: bookingToCancel })
      if (error) throw new Error(error.message)
      
      // Refresh the bookings from the database to update the UI instantly
      await fetchMyBookings()
      setBookingToCancel(null)
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to cancel booking.')
    } finally {
      setIsCancelling(false)
    }
  }

  // --- RESCHEDULE LOGIC ---
  const handleOpenReschedule = async (booking: any) => {
    setRescheduleBooking(booking)
    setLoadingAlt(true)
    setErrorMsg('')

    const { data, error } = await supabase
      .from('flights')
      .select('*')
      .eq('origin', booking.flights.origin)
      .eq('destination', booking.flights.destination)
      .neq('id', booking.flights.id)
      .gt('departs_at', new Date().toISOString())
      .order('departs_at', { ascending: true })

    if (data) setAltFlights(data)
    setLoadingAlt(false)
  }

  const handleConfirmReschedule = async (newFlight: any) => {
    setIsRescheduling(true)
    setErrorMsg('')
    try {
      const priceDiff = newFlight.base_price - rescheduleBooking.flights.base_price
      const fee = priceDiff > 0 ? priceDiff : 0

      const { error } = await supabase.rpc('reschedule_flight', {
        p_booking_id: rescheduleBooking.id,
        p_new_flight_id: newFlight.id,
        p_fee: fee
      })

      if (error) throw new Error(error.message)

      await fetchMyBookings()
      setRescheduleBooking(null)
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to reschedule. No seats available in your class.')
    } finally {
      setIsRescheduling(false)
    }
  }

  const isWithinTwoHours = (departureTime: string) => {
    const flightTime = new Date(departureTime).getTime()
    const now = new Date().getTime()
    const hoursDifference = (flightTime - now) / (1000 * 60 * 60)
    return hoursDifference <= 2 && hoursDifference > 0
  }

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div></div>
  }

  return (
    <main className="min-h-screen p-4 md:p-12 text-white relative">
      <div className="max-w-4xl mx-auto">
        
        {/* Header */}
        <div className="flex justify-between items-end mb-8 border-b border-white/10 pb-4">
          <div>
            <h1 className="text-3xl font-extrabold">My Bookings</h1>
            <p className="text-blue-400 mt-1">Manage your upcoming and past flights.</p>
          </div>
          <div className="flex items-center gap-4">
            <button onClick={() => router.push('/')} className="text-blue-400 font-bold hover:underline">
              + Book New
            </button>
            <button 
              onClick={async () => {
                await supabase.auth.signOut()
                useUserStore.getState().resetUserStore()
                useFlightStore.getState().resetFlightCart()
                router.push('/')
              }} 
              className="bg-white/10 hover:bg-white/20 text-white text-sm font-bold py-2 px-4 rounded-lg transition-colors border border-white/10"
            >
              Log Out
            </button>
          </div>
        </div>

        {bookings.length === 0 ? (
          <div className="glass-panel p-12 rounded-3xl text-center border border-white/10">
            <h2 className="text-xl font-bold text-white mb-2">No bookings yet</h2>
          </div>
        ) : (
          <div className="space-y-6">
            {bookings.map((booking) => {
              const flight = booking.flights
              const seat = booking.seats
              const flightDate = new Date(flight.departs_at).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })
              const isLocked = isWithinTwoHours(flight.departs_at)
              
              // ADDED: Exact time the booking was created
              const bookingDate = new Date(booking.created_at).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })

              return (
                <div key={booking.id} className="glass-panel p-6 rounded-3xl border border-white/10 flex flex-col md:flex-row justify-between gap-6">
                  <div className="flex-1 space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-black text-blue-400 tracking-widest uppercase">PNR: {booking.pnr_code}</span>
                      <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${
                        booking.status === 'cancelled' ? 'bg-red-500/20 text-red-400' :
                        booking.status === 'rescheduled' ? 'bg-orange-500/20 text-orange-400' : 'bg-green-500/20 text-green-400'
                      }`}>
                        {booking.status}
                      </span>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="text-center"><p className="text-2xl font-bold">{flight.origin}</p></div>
                      <div className="flex-1 border-t-2 border-dashed border-white/20 relative"><span className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-transparent px-2 text-xl">✈️</span></div>
                      <div className="text-center"><p className="text-2xl font-bold">{flight.destination}</p></div>
                    </div>

                    <div className="text-sm text-gray-400 flex flex-col md:flex-row gap-2 md:gap-6">
                      <p><strong className="text-gray-300">Flight:</strong> {flight.flight_no}</p>
                      {/* UPDATED: Clearer label for the flight departure */}
                      <p><strong className="text-gray-300">Departure:</strong> {flightDate}</p>
                      <p><strong className="text-gray-300">Seat:</strong> {seat.seat_number} ({seat.class})</p>
                    </div>
                    
                    {/* UPDATED: Displays both exact booking date and relative time */}
                    <div className="text-xs text-blue-500/70 font-medium">
                      Booked on {bookingDate} ({formatDistanceToNow(new Date(booking.created_at), { addSuffix: true })})
                    </div>
                  </div>

                  <div className="flex flex-col gap-3 justify-center min-w-[140px] border-t md:border-t-0 md:border-l border-white/10 pt-4 md:pt-0 md:pl-6">
                    <button 
                      disabled={booking.status === 'cancelled' || isLocked}
                      onClick={() => handleOpenReschedule(booking)}
                      className="w-full bg-white/10 text-white hover:bg-white/20 disabled:opacity-30 disabled:cursor-not-allowed font-bold py-2 px-4 rounded-xl transition-colors"
                    >
                      Reschedule
                    </button>
                    <button 
                      disabled={booking.status === 'cancelled' || isLocked}
                      onClick={() => setBookingToCancel(booking.id)}
                      className="w-full bg-red-500/10 text-red-400 hover:bg-red-500/20 disabled:opacity-30 disabled:cursor-not-allowed font-bold py-2 px-4 rounded-xl transition-colors"
                    >
                      Cancel Flight
                    </button>
                    {isLocked && booking.status !== 'cancelled' && <p className="text-xs text-red-400 text-center mt-1">Locked (under 2hrs)</p>}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* CANCEL MODAL */}
      {bookingToCancel && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center p-4 z-[60]">
          <div className="glass-panel p-8 rounded-3xl max-w-md w-full relative border border-white/10">
            <h3 className="text-2xl font-bold text-center mb-2">Cancel Ticket?</h3>
            {errorMsg && <p className="text-red-400 text-sm font-bold text-center mb-4">{errorMsg}</p>}
            <div className="flex gap-4 mt-6">
              <button onClick={() => setBookingToCancel(null)} className="flex-1 bg-white/10 hover:bg-white/20 font-bold py-3 rounded-xl transition-all">Go Back</button>
              <button onClick={handleCancelBooking} disabled={isCancelling} className="flex-1 bg-red-600 hover:bg-red-500 text-white font-bold py-3 rounded-xl transition-all">{isCancelling ? '...' : 'Cancel'}</button>
            </div>
          </div>
        </div>
      )}

      {/* RESCHEDULE MODAL */}
      {rescheduleBooking && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center p-4 z-[60]">
          <div className="glass-panel p-8 rounded-3xl max-w-lg w-full relative max-h-[80vh] overflow-y-auto border border-white/10">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold">Select Alternative Flight</h3>
              <button onClick={() => setRescheduleBooking(null)} className="text-gray-400 hover:text-white font-bold text-xl">✕</button>
            </div>
            
            {errorMsg && <p className="bg-red-500/20 text-red-400 p-3 rounded-xl text-sm font-bold mb-4">{errorMsg}</p>}

            {loadingAlt ? (
              <p className="text-center text-gray-400 py-8">Searching for alternative flights...</p>
            ) : altFlights.length === 0 ? (
              <div className="bg-orange-500/20 text-orange-400 p-4 rounded-xl text-center font-medium">
                No alternative future flights found on this route.
              </div>
            ) : (
              <div className="space-y-4">
                {altFlights.map((flight) => {
                  const flightDate = new Date(flight.departs_at).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })
                  const priceDiff = flight.base_price - rescheduleBooking.flights.base_price
                  const fee = priceDiff > 0 ? priceDiff : 0

                  return (
                    <div key={flight.id} className="border border-white/10 bg-white/5 rounded-2xl p-4 flex justify-between items-center hover:border-blue-400 transition-all">
                      <div>
                        <p className="font-bold text-white">{flight.flight_no}</p>
                        <p className="text-sm text-gray-400">{flightDate}</p>
                        {fee > 0 ? (
                          <span className="text-xs font-bold text-orange-400 bg-orange-500/20 px-2 py-1 rounded-full mt-2 inline-block">Fee: +₹{fee}</span>
                        ) : (
                          <span className="text-xs font-bold text-green-400 bg-green-500/20 px-2 py-1 rounded-full mt-2 inline-block">No fee</span>
                        )}
                      </div>
                      <button 
                        onClick={() => handleConfirmReschedule(flight)}
                        disabled={isRescheduling}
                        className="bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold py-2 px-6 rounded-xl disabled:opacity-50 transition-all"
                      >
                        {isRescheduling ? 'Moving...' : 'Select'}
                      </button>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </main>
  )
}