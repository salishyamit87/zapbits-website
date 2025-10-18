'use client'

import { useState, useEffect } from 'react'

interface PreAuthKey {
  id: string;
  key: string;
  user: string;
  reusable: boolean;
  ephemeral: boolean;
  used: boolean;
  expiration: string;
  createdAt: string;
  aclTags: string[];
}

interface AccessKeysProps {
  userName: string;
}

export default function AccessKeys({ userName }: AccessKeysProps) {
  const [keys, setKeys] = useState<PreAuthKey[]>([])
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [newKey, setNewKey] = useState({
    reusable: false,
    ephemeral: false,
    expiration: '',
    aclTags: [] as string[]
  })

  useEffect(() => {
    fetchKeys()
  }, [userName])

  const fetchKeys = async () => {
    try {
      const response = await fetch(`/api/preauthkeys?user=${userName}`)
      const data = await response.json()
      
      if (data.success) {
        setKeys(data.keys || [])
      }
    } catch (error) {
      setMessage('Error loading access keys')
    } finally {
      setLoading(false)
    }
  }

  const generateKey = async () => {
    try {
      const response = await fetch('/api/preauthkeys', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user: userName,
          reusable: newKey.reusable,
          ephemeral: newKey.ephemeral,
          expiration: newKey.expiration || undefined,
          aclTags: newKey.aclTags
        }),
      })

      const data = await response.json()

      if (data.success) {
        setMessage('✅ Access key generated successfully!')
        setShowCreateForm(false)
        setNewKey({ reusable: false, ephemeral: false, expiration: '', aclTags: [] })
        fetchKeys()
        
        // Show the generated key
        alert(`Your new access key:\n\n${data.key.key}\n\nCopy this key to use with Tailscale client.`)
      } else {
        setMessage(`❌ Error: ${data.error}`)
      }
    } catch (error) {
      setMessage('❌ Network error')
    }
  }

  const expireKey = async (keyId: string) => {
    try {
      const response = await fetch('/api/preauthkeys', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ keyId, user: userName }),
      })

      const data = await response.json()

      if (data.success) {
        setMessage('✅ Key expired successfully')
        fetchKeys()
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
            <h2 className="text-lg font-medium text-gray-900">Access Keys</h2>
            <div className="space-x-3">
              <button 
                onClick={fetchKeys}
                className="bg-gray-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-700"
              >
                Refresh
              </button>
              <button 
                onClick={() => setShowCreateForm(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700"
              >
                Generate Key
              </button>
            </div>
          </div>
        </div>

        {/* Create Key Form */}
        {showCreateForm && (
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
            <h3 className="text-md font-medium text-gray-900 mb-3">Generate New Access Key</h3>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={newKey.reusable}
                    onChange={(e) => setNewKey({...newKey, reusable: e.target.checked})}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">Reusable key</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={newKey.ephemeral}
                    onChange={(e) => setNewKey({...newKey, ephemeral: e.target.checked})}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">Ephemeral node</span>
                </label>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Expiration (optional)
                </label>
                <input
                  type="datetime-local"
                  value={newKey.expiration}
                  onChange={(e) => setNewKey({...newKey, expiration: e.target.value})}
                  className="border border-gray-300 rounded-md px-3 py-2 text-sm"
                />
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={generateKey}
                  className="bg-green-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-green-700"
                >
                  Generate Key
                </button>
                <button
                  onClick={() => setShowCreateForm(false)}
                  className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-400"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {keys.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-gray-500">No access keys found. Generate your first key to connect devices.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Key
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Expires
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
                {keys.map((key) => (
                  <tr key={key.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <code className="text-sm bg-gray-100 px-2 py-1 rounded font-mono">
                        {key.key.substring(0, 25)}...
                      </code>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {key.reusable ? 'Reusable' : 'One-time'} 
                      {key.ephemeral && ' (Ephemeral)'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        key.used ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                      }`}>
                        {key.used ? 'Used' : 'Active'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(key.expiration)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(key.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => {
                          if (confirm('Are you sure you want to expire this key?')) {
                            expireKey(key.id);
                          }
                        }}
                        className="text-red-600 hover:text-red-900"
                      >
                        Expire
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}