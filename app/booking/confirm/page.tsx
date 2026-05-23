'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useFlightStore } from '../../../store/useFlightStore'
import { useUserStore } from '../../../store/useUserStore'
import { createClient } from '../../../utils/supabase/client'

export default function ConfirmBookingPage() {
  const router = useRouter()
  const supabase = createClient()
  
  const { selectedFlight, selectedSeat, passengerDetails, resetFlightCart } = useFlightStore()
  const session = useUserStore((state) => state.session)

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [ticketDetails, setTicketDetails] = useState<any>(null)
  
  const hasAttemptedBooking = useRef(false) 

  useEffect(() => {
    if (!session || !selectedFlight || !selectedSeat || !passengerDetails) {
      router.push('/')
      return
    }

    if (hasAttemptedBooking.current) return
    hasAttemptedBooking.current = true

    const processBooking = async () => {
      try {
        const pnr = Math.random().toString(36).substring(2, 8).toUpperCase()
        const totalPrice = Number(selectedFlight.base_price) + Number(selectedSeat.extra_fee)

        // FIXED: Using firstName, lastName, and passportNumber to match your store
        const { data: bookingId, error: rpcError } = await supabase.rpc('book_seat', {
          p_user_id: session.user.id,
          p_flight_id: selectedFlight.id,
          p_seat_id: selectedSeat.id,
          p_total_price: totalPrice,
          p_pnr_code: pnr,
          p_full_name: `${passengerDetails.firstName} ${passengerDetails.lastName}`, 
          p_passport_no: passengerDetails.passportNumber || 'HIDDEN_FOR_SECURITY',
          p_nationality: passengerDetails.nationality || 'N/A',
          p_dob: passengerDetails.dob || null
        })

        if (rpcError) throw new Error(rpcError.message)

        setTicketDetails({
          pnr,
          flightNo: selectedFlight.flight_no,
          origin: selectedFlight.origin,
          destination: selectedFlight.destination,
          seat: selectedSeat.seat_number,
          class: selectedSeat.class,
          passengerName: `${passengerDetails.firstName} ${passengerDetails.lastName}` 
        })

      } catch (err: any) {
        setError(err.message || 'Failed to process booking.')
      } finally {
        setLoading(false)
      }
    }

    processBooking()
  }, [session, selectedFlight, selectedSeat, passengerDetails, router, supabase])

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-600 mb-4"></div>
        <p className="text-gray-600 font-medium">Locking your seat and generating ticket...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full text-center">
          <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Booking Failed</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button onClick={() => router.push('/')} className="bg-blue-600 text-white px-6 py-2 rounded-lg font-bold">Return to Home</button>
        </div>
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-gray-50 py-12 px-4 flex items-center justify-center">
      <div className="max-w-2xl w-full bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-100">
        
        <div className="bg-green-600 p-8 text-white text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-green-500 rounded-full opacity-50"></div>
          <div className="absolute bottom-0 left-0 -mb-4 -ml-4 w-16 h-16 bg-green-700 rounded-full opacity-50"></div>
          <h1 className="text-3xl font-bold mb-2 relative z-10">Booking Confirmed!</h1>
          <p className="text-green-100 relative z-10">Your seat has been securely locked and reserved.</p>
        </div>

        <div className="p-8">
          <div className="flex flex-col md:flex-row justify-between items-center border-b border-gray-200 pb-8 mb-8">
            <div className="text-center md:text-left mb-4 md:mb-0">
              <p className="text-sm text-gray-500 uppercase tracking-wider font-bold mb-1">PNR Number</p>
              <p className="text-4xl font-black text-blue-600 tracking-widest">{ticketDetails?.pnr}</p>
            </div>
            <div className="text-center md:text-right">
              <p className="text-sm text-gray-500 uppercase tracking-wider font-bold mb-1">Flight</p>
              <p className="text-2xl font-bold text-gray-900">{ticketDetails?.flightNo}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6 mb-8">
            <div>
              <p className="text-sm text-gray-500 mb-1">Passenger Name</p>
              <p className="font-bold text-gray-900">{ticketDetails?.passengerName}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">Route</p>
              <p className="font-bold text-gray-900">{ticketDetails?.origin} &rarr; {ticketDetails?.destination}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">Seat Number</p>
              <p className="font-bold text-gray-900 text-xl">{ticketDetails?.seat}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">Cabin Class</p>
              <p className="font-bold text-gray-900 capitalize">{ticketDetails?.class}</p>
            </div>
          </div>

          <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 text-center">
            <p className="text-sm text-gray-600">
              A copy of this e-ticket has been securely saved to your account. 
            </p>
          </div>

          <div className="mt-8 text-center">
            <button 
              onClick={() => {
                resetFlightCart()
                router.push('/')
              }}
              className="bg-gray-900 hover:bg-black text-white font-bold py-3 px-8 rounded-lg transition-colors shadow-md"
            >
              Book Another Flight
            </button>
          </div>
        </div>
      </div>
    </main>
  )
}