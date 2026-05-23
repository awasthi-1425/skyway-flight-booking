'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '../../utils/supabase/client'
import { useUserStore } from '../../store/useUserStore'
import { useFlightStore } from '../../store/useFlightStore'

export default function AuthPage() {
  const router = useRouter()
  const supabase = createClient()
  
  const setSession = useUserStore((state) => state.setSession)
  const selectedFlight = useFlightStore((state) => state.selectedFlight)

  const [isLogin, setIsLogin] = useState(true)
  
  // Form States
  const [identifier, setIdentifier] = useState('') // For Login (Email or Phone)
  const [email, setEmail] = useState('') // For Signup
  const [phone, setPhone] = useState('') // For Signup
  const [name, setName] = useState('') // For Signup
  const [password, setPassword] = useState('')
  
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setErrorMsg('')

    try {
      if (isLogin) {
        // Automatically detect if they typed an email or a phone number
        const isEmail = identifier.includes('@')
        const credentials = isEmail 
          ? { email: identifier, password } 
          : { phone: identifier, password }

        const { data, error } = await supabase.auth.signInWithPassword(credentials)
        if (error) throw error
        setSession(data.session)
      } else {
        // Handle Signup and attach extra profile data to Supabase metadata
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: name,
              mobile_number: phone,
            }
          }
        })
        if (error) throw error
        setSession(data.session)
      }

      // Smart Routing
      if (selectedFlight) {
        router.push('/booking/seats')
      } else {
        router.push('/profile')
      }
    } catch (error: any) {
      setErrorMsg(error.message || 'An error occurred during authentication.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center p-4 text-white relative">
      <div className="max-w-md w-full glass-panel rounded-3xl overflow-hidden border border-white/10 shadow-2xl">
        
        <div className="p-8 text-center border-b border-white/10 bg-white/5">
          <h1 className="text-3xl font-extrabold mb-2">
            {isLogin ? 'Welcome Back' : 'Create an Account'}
          </h1>
          <p className="text-blue-400 text-sm">
            {isLogin 
              ? 'Log in to securely complete your booking.' 
              : 'Sign up to securely manage your flights.'}
          </p>
        </div>

        <form onSubmit={handleAuth} className="p-8 space-y-6">
          {errorMsg && (
            <div className="bg-red-500/20 text-red-400 p-4 rounded-xl text-sm font-bold border border-red-500/30">
              {errorMsg}
            </div>
          )}

          {isLogin ? (
            // --- LOGIN FORM ---
            <div className="space-y-2">
              <label className="text-xs text-blue-300 uppercase tracking-widest font-bold">Email or Mobile Number</label>
              <input 
                type="text" 
                required
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                className="w-full bg-white/5 border-b border-white/20 p-3 outline-none focus:border-blue-500 transition-all placeholder-white/30 text-white rounded-t-lg"
                placeholder="you@example.com or 9876543210"
              />
            </div>
          ) : (
            // --- SIGNUP FORM ---
            <>
              <div className="space-y-2">
                <label className="text-xs text-blue-300 uppercase tracking-widest font-bold">Full Name</label>
                <input 
                  type="text" 
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-white/5 border-b border-white/20 p-3 outline-none focus:border-blue-500 transition-all placeholder-white/30 text-white rounded-t-lg"
                  placeholder="John Doe"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs text-blue-300 uppercase tracking-widest font-bold">Email Address</label>
                <input 
                  type="email" 
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-white/5 border-b border-white/20 p-3 outline-none focus:border-blue-500 transition-all placeholder-white/30 text-white rounded-t-lg"
                  placeholder="you@example.com"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs text-blue-300 uppercase tracking-widest font-bold">Mobile Number</label>
                <input 
                  type="tel" 
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-white/5 border-b border-white/20 p-3 outline-none focus:border-blue-500 transition-all placeholder-white/30 text-white rounded-t-lg"
                  placeholder="9876543210"
                />
              </div>
            </>
          )}

          <div className="space-y-2 pt-2">
            <label className="text-xs text-blue-300 uppercase tracking-widest font-bold">Password</label>
            <input 
              type="password" 
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-white/5 border-b border-white/20 p-3 outline-none focus:border-blue-500 transition-all placeholder-white/30 text-white rounded-t-lg"
              placeholder="••••••••"
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold py-4 rounded-xl transition-all shadow-lg flex justify-center items-center mt-4"
          >
            {loading ? (
              <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
            ) : (
              isLogin ? 'Log In' : 'Sign Up'
            )}
          </button>
        </form>

        <div className="p-6 text-center border-t border-white/10 bg-white/5">
          <p className="text-sm text-gray-400">
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <button 
              type="button"
              onClick={() => {
                setIsLogin(!isLogin)
                setErrorMsg('')
              }}
              className="text-blue-400 font-bold hover:text-white transition-colors"
            >
              {isLogin ? 'Sign Up' : 'Log In'}
            </button>
          </p>
        </div>

      </div>
    </main>
  )
}