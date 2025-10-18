'use client'

import { useState, useEffect } from 'react'

interface Route {
  id: string;
  machine: any;
  prefix: string;
  advertised: boolean;
  enabled: boolean;
  is_primary: boolean;
  created_at: string;
  updated_at: string;
}

export default function Routes() {
  const [routes, setRoutes] = useState<Route[]>([])
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')

  useEffect(() => {
    fetchRoutes()
  }, [])

  const fetchRoutes = async () => {
    try {
      const response = await fetch('/api/routes')
      const data = await response.json()
      
      if (data.success) {
        setRoutes(data.routes || [])
      }
    } catch (error) {
      setMessage('Error loading routes')
    } finally {
      setLoading(false)
    }
  }

  const toggleRoute = async (routeId: string, enable: boolean) => {
    try {
      const response = await fetch('/api/routes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          routeId, 
          action: enable ? 'enable' : 'disable' 
        }),
      })

      const data = await response.json()

      if (data.success) {
        setMessage(`✅ Route ${enable ? 'enabled' : 'disabled'} successfully`)
        fetchRoutes()
      } else {
        setMessage(`❌ Error: ${data.error}`)
      }
    } catch (error) {
      setMessage('❌ Network error')
    }
  }

  const deleteRoute = async (routeId: string) => {
    try {
      const response = await fetch('/api/routes', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ routeId }),
      })

      const data = await response.json()

      if (data.success) {
        setMessage('✅ Route deleted successfully')
        fetchRoutes()
      } else {
        setMessage(`❌ Error: ${data.error}`)
      }
    } catch (error) {
      setMessage('❌ Network error')
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString() + ' ' + new Date(dateString).toLocaleTimeString()
  }

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {message && (
        <div className={`p-3 rounded-md ${
          message.includes('✅') ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
        }`}>
          {message}
        </div>
      )}

      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-medium text-gray-900">Subnet Routes</h2>
            <button 
              onClick={fetchRoutes}
              className="bg-gray-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-700"
            >
              Refresh
            </button>
          </div>
        </div>

        {routes.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-gray-500">No subnet routes found. Routes will appear here when machines advertise them.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Route
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Machine
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Primary
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {routes.map((route) => (
                  <tr key={route.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{route.prefix}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{route.machine?.name || 'Unknown'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        route.enabled ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {route.enabled ? 'Enabled' : 'Disabled'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        route.is_primary ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {route.is_primary ? 'Yes' : 'No'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(route.created_at)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      {!route.enabled ? (
                        <button
                          onClick={() => toggleRoute(route.id, true)}
                          className="text-green-600 hover:text-green-900"
                        >
                          Enable
                        </button>
                      ) : (
                        <button
                          onClick={() => toggleRoute(route.id, false)}
                          className="text-yellow-600 hover:text-yellow-900"
                        >
                          Disable
                        </button>
                      )}
                      <button
                        onClick={() => {
                          if (confirm('Are you sure you want to delete this route?')) {
                            deleteRoute(route.id);
                          }
                        }}
                        className="text-red-600 hover:text-red-900"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="bg-blue-50 p-4 rounded-md">
        <h3 className="text-sm font-medium text-blue-900 mb-2">About Subnet Routes</h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Subnet routes allow machines to act as gateways for other networks</li>
          <li>• Routes must be enabled to be active in the network</li>
          <li>• Primary routes are preferred when multiple routes exist for the same subnet</li>
          <li>• Disabled routes are not advertised to other machines</li>
        </ul>
      </div>
    </div>
  )
}