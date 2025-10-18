'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

// Function to clean username - only allow lowercase letters, numbers, hyphens
const cleanUsername = (email: string) => {
  // Extract username from email and clean it
  const username = email.split('@')[0].toLowerCase();
  // Remove all special characters except letters, numbers, and hyphens
  return username.replace(/[^a-z0-9-]/g, '');
}

export default function Signup() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    try {
      const userName = cleanUsername(email);
      
      // Check if username is valid
      if (userName.length === 0) {
        setMessage('❌ Please enter a valid email address');
        return;
      }

      const response = await fetch('/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, userName }),
      })

      const data = await response.json()

      if (data.success) {
        setMessage(`✅ Account created successfully! Username: ${userName}`)
        setEmail('')
        setPassword('')
        setTimeout(() => {
          router.push('/login')
        }, 2000)
      } else {
        setMessage(`❌ Error: ${data.error}`)
      }
    } catch (error: any) {
      setMessage(`❌ Network error: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Create your account
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Your account will be created directly in Headscale
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {message && (
            <div className={`p-3 rounded-md mb-4 ${
              message.includes('✅') ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
            }`}>
              {message}
            </div>
          )}

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email address
              </label>
              <div className="mt-1">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="your@email.com"
                />
              </div>
              <p className="mt-1 text-xs text-gray-500">
                Username will be automatically generated from your email
              </p>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <div className="mt-1">
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                {loading ? 'Creating Account in Headscale...' : 'Create Headscale Account'}
              </button>
            </div>
          </form>

          <div className="mt-6 text-center">
            <a href="/login" className="text-blue-600 hover:text-blue-500">
              Already have an account? Sign in
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}