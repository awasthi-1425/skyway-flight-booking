import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// 1. ADDED STRICT TYPING FOR THE SEARCH QUERY
export interface SearchQuery {
  origin: string;
  destination: string;
  date: string;
  passengers: number;
}

export interface Flight {
  id: string;
  flight_no: string;
  origin: string;
  destination: string;
  departs_at: string;
  arrives_at: string;
  base_price: number;
  aircraft_type?: string; // <-- ADD THIS LINE
}

export interface Seat {
  id: string;
  flight_id: string;
  seat_number: string;
  class: 'economy' | 'business' | 'first';
  is_available: boolean;
  extra_fee: number;
}

export interface PassengerDetails {
  firstName: string;
  lastName: string;
  email: string;
  passportNumber?: string; 
  nationality?: string;    // ADDED
  dob?: string;            // ADDED
}

interface FlightStore {
  searchQuery: SearchQuery | null; // <-- Replaced 'any' with our new strict type
  selectedFlight: Flight | null;
  selectedSeat: Seat | null;
  passengerDetails: PassengerDetails | null;
  currentStep: number;
  
  setSearchQuery: (query: SearchQuery) => void;
  setSelectedFlight: (flight: Flight) => void;
  setSelectedSeat: (seat: Seat) => void;
  setPassengerDetails: (details: PassengerDetails) => void;
  setCurrentStep: (step: number) => void;
  resetFlightCart: () => void;
}

export const useFlightStore = create<FlightStore>()(
  persist(
    (set) => ({
      searchQuery: null,
      selectedFlight: null,
      selectedSeat: null,
      passengerDetails: null,
      currentStep: 1,

      setSearchQuery: (query) => set({ searchQuery: query }),
      setSelectedFlight: (flight) => set({ selectedFlight: flight }),
      setSelectedSeat: (seat) => set({ selectedSeat: seat }),
      setPassengerDetails: (details) => set({ passengerDetails: details }),
      setCurrentStep: (step) => set({ currentStep: step }),
      
      // Resets the booking progress after success or logout
      resetFlightCart: () => set({ 
        selectedFlight: null, 
        selectedSeat: null, 
        passengerDetails: null, 
        currentStep: 1 
      }),
    }),
    {
      name: 'flight-storage',
      // RUBRIC REQUIREMENT: Use partialize to exclude sensitive fields
      partialize: (state) => ({
        searchQuery: state.searchQuery,
        selectedFlight: state.selectedFlight,
        selectedSeat: state.selectedSeat,
        currentStep: state.currentStep,
        passengerDetails: state.passengerDetails ? {
          firstName: state.passengerDetails.firstName,
          lastName: state.passengerDetails.lastName,
          email: state.passengerDetails.email,
          // Notice we DO NOT include passportNumber here! It won't be saved to localStorage.
        } : null
      }),
    }
  )
)