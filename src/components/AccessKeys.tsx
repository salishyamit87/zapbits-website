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
  const [generatedKey, setGeneratedKey] = useState('')

  useEffect(() => {
    fetchKeys()
  }, [userName])

  const fetchKeys = async () => {
    try {
      setLoading(true)
      const cleanUser = userName.replace(/[^a-z0-9-]/g, '');
      const response = await fetch(`/api/preauthkeys?user=${encodeURIComponent(cleanUser)}`)
      const data = await response.json()
      
      if (data.success) {
        setKeys(data.keys || [])
      } else {
        setMessage(`❌ Error loading keys: ${data.error}`)
      }
    } catch (error) {
      setMessage('❌ Error loading access keys')
    } finally {
      setLoading(false)
    }
  }

  const generateKey = async () => {
    try {
      // Clean username to remove any special characters
      const cleanUser = userName.replace(/[^a-z0-9-]/g, '');
      
      if (!cleanUser) {
        setMessage('❌ Invalid username')
        return
      }

      const response = await fetch('/api/preauthkeys', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user: cleanUser,
          reusable: newKey.reusable,
          ephemeral: newKey.ephemeral,
          expiration: newKey.expiration || undefined,
          aclTags: newKey.aclTags
        }),
      })

      const data = await response.json()

      if (data.success) {
        setGeneratedKey(data.key.key)
        setMessage('✅ Access key generated successfully!')
        setShowCreateForm(false)
        setNewKey({ reusable: false, ephemeral: false, expiration: '', aclTags: [] })
        fetchKeys()
      } else {
        setMessage(`❌ Error: ${data.error}`)
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      setMessage(`❌ Network error: ${errorMessage}`)
    }
  }

  const expireKey = async (keyId: string) => {
    try {
      const cleanUser = userName.replace(/[^a-z0-9-]/g, '');
      
      const response = await fetch('/api/preauthkeys', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          keyId, 
          user: cleanUser 
        }),
      })

      const data = await response.json()

      if (data.success) {
        setMessage('✅ Key expired successfully')
        fetchKeys()
      } else {
        setMessage(`❌ Error: ${data.error}`)
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      setMessage(`❌ Network error: ${errorMessage}`)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setMessage('✅ Key copied to clipboard!')
    }).catch(() => {
      setMessage('❌ Failed to copy key')
    })
  }

  const formatDate = (dateString: string) => {
    try {
      if (!dateString) return 'Never';
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Invalid date';
      return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return 'Invalid date';
    }
  }

  const getKeyType = (key: PreAuthKey) => {
    if (key.reusable && key.ephemeral) return 'Reusable Ephemeral';
    if (key.reusable) return 'Reusable';
    if (key.ephemeral) return 'One-time Ephemeral';
    return 'One-time';
  }

  const getStatusColor = (used: boolean) => {
    return used ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800';
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

      {/* Generated Key Display */}
      {generatedKey && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-sm font-medium text-green-800 mb-2">✅ New Access Key Generated!</h3>
              <p className="text-sm text-green-700 mb-3">
                Copy this key and use it with Tailscale client to connect devices.
              </p>
              <code className="text-sm bg-white p-3 rounded border block font-mono break-all">
                {generatedKey}
              </code>
            </div>
            <button
              onClick={() => setGeneratedKey('')}
              className="text-green-600 hover:text-green-800"
            >
              ×
            </button>
          </div>
          <div className="mt-3 flex space-x-2">
            <button
              onClick={() => copyToClipboard(generatedKey)}
              className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700"
            >
              Copy Key
            </button>
            <button
              onClick={() => {
                setGeneratedKey('')
                setShowCreateForm(false)
              }}
              className="bg-gray-300 text-gray-700 px-3 py-1 rounded text-sm hover:bg-gray-400"
            >
              Close
            </button>
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-lg font-medium text-gray-900">Access Keys</h2>
              <p className="text-sm text-gray-500 mt-1">
                Generate keys to authenticate devices to your network
              </p>
            </div>
            <div className="space-x-3">
              <button 
                onClick={fetchKeys}
                className="bg-gray-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-700"
              >
                Refresh
              </button>
              <button 
                onClick={() => setShowCreateForm(!showCreateForm)}
                className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700"
              >
                {showCreateForm ? 'Cancel' : 'Generate Key'}
              </button>
            </div>
          </div>
        </div>

        {/* Create Key Form */}
        {showCreateForm && (
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
            <h3 className="text-md font-medium text-gray-900 mb-3">Generate New Access Key</h3>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={newKey.reusable}
                      onChange={(e) => setNewKey({...newKey, reusable: e.target.checked})}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">Reusable key</span>
                  </label>
                  <p className="text-xs text-gray-500 ml-6">
                    Can be used to connect multiple devices
                  </p>
                </div>

                <div className="space-y-3">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={newKey.ephemeral}
                      onChange={(e) => setNewKey({...newKey, ephemeral: e.target.checked})}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">Ephemeral node</span>
                  </label>
                  <p className="text-xs text-gray-500 ml-6">
                    Node will be automatically removed when disconnected
                  </p>
                </div>
              </div>
              
              <div className="max-w-md">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Expiration (optional)
                </label>
                <input
                  type="datetime-local"
                  value={newKey.expiration}
                  onChange={(e) => setNewKey({...newKey, expiration: e.target.value})}
                  className="border border-gray-300 rounded-md px-3 py-2 text-sm w-full"
                />
                <p className="mt-1 text-xs text-gray-500">
                  Leave empty for no expiration
                </p>
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={generateKey}
                  className="bg-green-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-green-700"
                >
                  Generate Key
                </button>
                <button
                  onClick={() => {
                    setShowCreateForm(false)
                    setNewKey({ reusable: false, ephemeral: false, expiration: '', aclTags: [] })
                  }}
                  className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-400"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Keys List */}
        <div className="p-6">
          {keys.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-gray-400 mb-3">
                <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                </svg>
              </div>
              <p className="text-gray-500 mb-4">No access keys found</p>
              <button 
                onClick={() => setShowCreateForm(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700"
              >
                Generate Your First Key
              </button>
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
                        <div className="flex items-center">
                          <code className="text-sm bg-gray-100 px-2 py-1 rounded font-mono max-w-xs truncate">
                            {key.key.substring(0, 20)}...
                          </code>
                          <button
                            onClick={() => copyToClipboard(key.key)}
                            className="ml-2 text-gray-400 hover:text-gray-600"
                            title="Copy full key"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                            </svg>
                          </button>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{getKeyType(key)}</div>
                        {key.aclTags && key.aclTags.length > 0 && (
                          <div className="text-xs text-gray-500">
                            Tags: {key.aclTags.join(', ')}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(key.used)}`}>
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
                        {!key.used && (
                          <button
                            onClick={() => {
                              if (confirm('Are you sure you want to expire this key? This cannot be undone.')) {
                                expireKey(key.id);
                              }
                            }}
                            className="text-red-600 hover:text-red-900"
                          >
                            Expire
                          </button>
                        )}
                        {key.used && (
                          <span className="text-gray-400">Used</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Help Section */}
      <div className="bg-blue-50 p-4 rounded-md">
        <h3 className="text-sm font-medium text-blue-900 mb-2">About Access Keys</h3>
        <div className="text-sm text-blue-800 space-y-2">
          <p><strong>One-time keys:</strong> Can only be used to connect one device</p>
          <p><strong>Reusable keys:</strong> Can connect multiple devices</p>
          <p><strong>Ephemeral nodes:</strong> Automatically removed when disconnected</p>
          <p className="mt-2">
            Use these keys with the Tailscale client: <code className="bg-blue-100 px-1 rounded">tailscale up --auth-key YOUR_KEY</code>
          </p>
        </div>
      </div>
    </div>
  )
}