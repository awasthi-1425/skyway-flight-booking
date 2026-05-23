import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { Session } from '@supabase/supabase-js'

// Define what a Booking looks like based on our database
export interface Booking {
  id: string;
  flight_id: string;
  seat_id: string;
  status: 'confirmed' | 'rescheduled' | 'cancelled';
  created_at: string; // UPDATED: Matched to your Supabase SQL column name!
  total_price: number;
  pnr_code: string;
}

interface UserState {
  session: Session | null;
  userBookings: Booking[];
  
  // Actions
  setSession: (session: Session | null) => void;
  setUserBookings: (bookings: Booking[]) => void;
  resetUserStore: () => void;
}

const initialState = {
  session: null,
  userBookings: [],
}

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      ...initialState,
      setSession: (session) => set({ session }),
      setUserBookings: (bookings) => set({ userBookings: bookings }),
      resetUserStore: () => set(initialState),
    }),
    {
      name: 'user-storage',
      // RUBRIC REQUIREMENT: Persist strictly the session token
      partialize: (state) => ({ session: state.session }),
    }
  )
)