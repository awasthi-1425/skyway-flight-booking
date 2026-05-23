'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useFlightStore, Flight } from '../../store/useFlightStore'
import { createClient } from '../../utils/supabase/client'

export default function ResultsPage() {
  const router = useRouter()
  const supabase = createClient()
  
  const searchQuery = useFlightStore((state) => state.searchQuery)
  const setSelectedFlight = useFlightStore((state) => state.setSelectedFlight)
  const setCurrentStep = useFlightStore((state) => state.setCurrentStep)

  const [flights, setFlights] = useState<Flight[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!searchQuery) {
      router.push('/')
      return
    }

    const fetchFlights = async () => {
      setLoading(true)
      const { data, error } = await supabase
        .from('flights')
        .select('*')
        .eq('origin', searchQuery.origin)
        .eq('destination', searchQuery.destination)
        .gte('departs_at', new Date().toISOString())
        .order('base_price', { ascending: true })

      if (!error) setFlights(data || [])
      setLoading(false)
    }

    fetchFlights()
  }, [searchQuery, router, supabase])

  const handleSelectFlight = (flight: Flight) => {
    setSelectedFlight(flight)
    setCurrentStep(2)
    router.push('/booking/passengers') 
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  return (
    <main className="min-h-screen p-4 md:p-8 text-white">
      <div className="max-w-4xl mx-auto">
        <button 
          onClick={() => router.push('/')}
          className="text-blue-400 font-semibold mb-6 hover:underline"
        >
          &larr; Back to Search
        </button>

        <h1 className="text-4xl font-extrabold mb-2">Available Flights</h1>
        <p className="text-gray-400 mb-8">
          Showing flights from <span className="text-white font-bold">{searchQuery?.origin}</span> to <span className="text-white font-bold">{searchQuery?.destination}</span>
        </p>

        {flights.length === 0 ? (
          <div className="glass-panel p-8 rounded-2xl text-center">
            <h2 className="text-xl font-semibold">No flights found</h2>
            <p className="text-gray-400 mt-2">Try adjusting your search criteria.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {flights.map((flight) => (
              <div key={flight.id} className="glass-panel p-6 rounded-2xl flex flex-col md:flex-row justify-between items-center border border-white/10 hover:border-blue-500/50 transition-colors">
                
                <div className="flex-1 w-full md:w-auto mb-4 md:mb-0">
                  <div className="flex items-center space-x-4 mb-2">
                    <span className="bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                      {flight.flight_no}
                    </span>
                    <span className="text-sm text-gray-400">{flight.aircraft_type}</span>
                  </div>
                  
                  <div className="flex items-center space-x-6">
                    <div>
                      <p className="text-2xl font-bold">
                        {new Date(flight.departs_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                      <p className="text-gray-400">{flight.origin}</p>
                    </div>
                    <div className="text-blue-500 font-bold">&rarr;</div>
                    <div>
                      <p className="text-2xl font-bold">
                        {new Date(flight.arrives_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                      <p className="text-gray-400">{flight.destination}</p>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col items-center md:items-end w-full md:w-auto md:border-l md:border-white/10 md:pl-6">
                  <p className="text-sm text-gray-400 mb-1">Starting from</p>
                  <p className="text-3xl font-bold text-blue-400 mb-4">
                    ₹{flight.base_price.toLocaleString('en-IN')}
                  </p>
                  <button 
                    onClick={() => handleSelectFlight(flight)}
                    className="w-full md:w-auto bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 px-8 rounded-xl transition-all"
                  >
                    Select Flight
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}