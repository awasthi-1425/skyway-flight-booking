'use client'



import { useState, useEffect } from 'react'

import { useRouter } from 'next/navigation'

import { useFlightStore } from '../../../store/useFlightStore'



export default function PassengersPage() {

  const router = useRouter()



  const selectedFlight = useFlightStore((state) => state.selectedFlight)

  const setPassengerDetails = useFlightStore((state) => state.setPassengerDetails)

 

  // FIXED: Changed setBookingStep to setCurrentStep to match the store

  const setCurrentStep = useFlightStore((state) => state.setCurrentStep)



  // FIXED: Split fullName into firstName and lastName to match the store strictly

  const [firstName, setFirstName] = useState('')

  const [lastName, setLastName] = useState('')

  const [email, setEmail] = useState('')

  const [passportNumber, setPassportNumber] = useState('')

  const [nationality, setNationality] = useState('')

  const [dob, setDob] = useState('')



  useEffect(() => {

    if (!selectedFlight) {

      router.push('/')

    } else {

      setCurrentStep(2)

    }

  }, [selectedFlight, router, setCurrentStep])



  const handleSubmit = (e: React.FormEvent) => {

    e.preventDefault()



    // Save perfectly formatted data to Zustand

    setPassengerDetails({

      firstName,

      lastName,

      email,

      passportNumber: passportNumber || undefined,

      nationality: nationality || undefined,

      dob: dob || undefined,

    })



    router.push('/booking/seats')

  }



  if (!selectedFlight) return null



  return (

    <main className="min-h-screen bg-gray-50 py-12 px-4 flex items-center justify-center">

      <div className="max-w-2xl w-full bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">

        <div className="bg-blue-600 p-8 text-white">

          <h1 className="text-3xl font-bold mb-2">Passenger Details</h1>

          <p className="text-blue-100">Please enter your details exactly as they appear on your ID.</p>

        </div>



        <form onSubmit={handleSubmit} className="p-8 space-y-6">

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            <div className="space-y-1">

              <label className="text-sm font-semibold text-gray-700">First Name</label>

              <input

                type="text"

                required

                value={firstName}

                onChange={(e) => setFirstName(e.target.value)}

                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-gray-900"

                placeholder="First Name"

              />

            </div>

            <div className="space-y-1">

              <label className="text-sm font-semibold text-gray-700">Last Name</label>

              <input

                type="text"

                required

                value={lastName}

                onChange={(e) => setLastName(e.target.value)}

                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-gray-900"

                placeholder="Last Name"

              />

            </div>

          </div>



          <div className="space-y-1">

            <label className="text-sm font-semibold text-gray-700">Email Address</label>

            <input

              type="email"

              required

              value={email}

              onChange={(e) => setEmail(e.target.value)}

              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-gray-900"

              placeholder="you@example.com"

            />

          </div>



          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 border-t border-gray-100">

            <div className="space-y-1">

              <label className="text-sm font-semibold text-gray-700">Passport Number</label>

              <input

                type="text"

                value={passportNumber}

                onChange={(e) => setPassportNumber(e.target.value)}

                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-gray-900"

                placeholder="Optional"

              />

            </div>

            <div className="space-y-1">

              <label className="text-sm font-semibold text-gray-700">Nationality</label>

              <input

                type="text"

                value={nationality}

                onChange={(e) => setNationality(e.target.value)}

                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-gray-900"

                placeholder="e.g. Indian"

              />

            </div>

            <div className="space-y-1">

              <label className="text-sm font-semibold text-gray-700">Date of Birth</label>

              <input

                type="date"

                value={dob}

                onChange={(e) => setDob(e.target.value)}

                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-gray-900"

              />

            </div>

          </div>



          <div className="pt-6 flex justify-between items-center">

            <button

              type="button"

              onClick={() => router.back()}

              className="text-gray-600 font-bold hover:underline"

            >

              &larr; Back

            </button>

            <button

              type="submit"

              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg transition-colors shadow-md"

            >

              Continue to Seats

            </button>

          </div>

        </form>

      </div>

    </main>

  )

}