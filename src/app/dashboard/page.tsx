'use client'

import { useState, useEffect } from 'react'

interface Node {
  id: string;
  name: string;
  ipAddresses: string[];
  lastSeen: string;
  online: boolean;
  user: {
    name: string;
  };
}

interface PreAuthKey {
  id: string;
  key: string;
  reusable: boolean;
  ephemeral: boolean;
  used: boolean;
  expiration: string;
  createdAt: string;
}

export default function Dashboard() {
  const [userName, setUserName] = useState('')
  const [nodes, setNodes] = useState<Node[]>([])
  const [preAuthKeys, setPreAuthKeys] = useState<PreAuthKey[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('nodes')
  const [newKeyReusable, setNewKeyReusable] = useState(false)
  const [newKeyEphemeral, setNewKeyEphemeral] = useState(false)
  const [generatedKey, setGeneratedKey] = useState('')
  const [message, setMessage] = useState('')

  useEffect(() => {
    // Get user from email in localStorage or URL
    const urlParams = new URLSearchParams(window.location.search);
    const user = urlParams.get('user') || localStorage.getItem('currentUser') || 'user';
    setUserName(user);
    localStorage.setItem('currentUser', user);
    
    fetchUserData(user);
  }, [])

  const fetchUserData = async (user: string) => {
    try {
      setLoading(true);
      
      // Fetch user's nodes
      const nodesResponse = await fetch(`/api/nodes?user=${user}`)
      const nodesData = await nodesResponse.json()
      
      if (nodesData.success) {
        setNodes(nodesData.nodes || [])
      }

      // Fetch user's pre-auth keys
      const keysResponse = await fetch(`/api/preauthkeys?user=${user}`)
      const keysData = await keysResponse.json()
      
      if (keysData.success) {
        setPreAuthKeys(keysData.keys || [])
      }
    } catch (error) {
      console.error('Error fetching user data:', error)
      setMessage('Error loading data')
    } finally {
      setLoading(false)
    }
  }

  const refreshData = () => {
    fetchUserData(userName);
  }

  const handleNodeAction = async (nodeId: string, action: string, newName?: string) => {
    try {
      const response = await fetch('/api/nodes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ nodeId, action, newName }),
      })

      const data = await response.json()

      if (data.success) {
        setMessage(`✅ Node ${action} successful`)
        refreshData()
      } else {
        setMessage(`❌ Error: ${data.error}`)
      }
    } catch (error) {
      setMessage('❌ Network error')
    }
  }

  const generatePreAuthKey = async () => {
    try {
      const response = await fetch('/api/preauthkeys', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user: userName,
          reusable: newKeyReusable,
          ephemeral: newKeyEphemeral,
        }),
      })

      const data = await response.json()

      if (data.success) {
        setGeneratedKey(data.key.key)
        setMessage('✅ Pre-auth key generated successfully!')
        refreshData()
      } else {
        setMessage(`❌ Error: ${data.error}`)
      }
    } catch (error) {
      setMessage('❌ Network error')
    }
  }

  const getStatusColor = (online: boolean) => {
    return online ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
  }

  const getStatusText = (online: boolean) => {
    return online ? "Online" : "Offline"
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString() + ' ' + new Date(dateString).toLocaleTimeString()
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Welcome Section */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back, <span className="text-blue-600">{userName}</span>! 👋
          </h1>
          <p className="text-gray-600">Manage your nodes and network settings</p>
        </div>

        {message && (
          <div className={`p-3 rounded-md mb-4 ${
            message.includes('✅') ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
          }`}>
            {message}
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Total Nodes</h3>
            <p className="text-3xl font-bold text-blue-600">{nodes.length}</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Online</h3>
            <p className="text-3xl font-bold text-green-600">
              {nodes.filter(node => node.online).length}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Offline</h3>
            <p className="text-3xl font-bold text-red-600">
              {nodes.filter(node => !node.online).length}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Pre-auth Keys</h3>
            <p className="text-3xl font-bold text-purple-600">{preAuthKeys.length}</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-md mb-8">
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px">
              <button
                onClick={() => setActiveTab('nodes')}
                className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
                  activeTab === 'nodes'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Your Nodes ({nodes.length})
              </button>
              <button
                onClick={() => setActiveTab('keys')}
                className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
                  activeTab === 'keys'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Pre-auth Keys ({preAuthKeys.length})
              </button>
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'nodes' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-semibold text-gray-900">Your Nodes</h2>
                  <div className="space-x-2">
                    <button 
                      onClick={refreshData}
                      className="bg-gray-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-700"
                    >
                      Refresh
                    </button>
                  </div>
                </div>
                
                {loading ? (
                  <div className="p-8 text-center">
                    <p className="text-gray-600">Loading your nodes...</p>
                  </div>
                ) : nodes.length === 0 ? (
                  <div className="p-8 text-center">
                    <p className="text-gray-600">No nodes found. Generate a pre-auth key to connect your first device.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Node Name
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            IP Address
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Status
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Last Seen
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {nodes.map((node) => (
                          <tr key={node.id}>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900">{node.name}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-500">
                                {node.ipAddresses?.[0] || 'No IP'}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(node.online)}`}>
                                {getStatusText(node.online)}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {formatDate(node.lastSeen)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                              <button 
                                onClick={() => handleNodeAction(node.id, 'expire')}
                                className="text-yellow-600 hover:text-yellow-900"
                              >
                                Expire
                              </button>
                              <button 
                                onClick={() => {
                                  const newName = prompt('Enter new name for node:');
                                  if (newName) handleNodeAction(node.id, 'rename', newName);
                                }}
                                className="text-blue-600 hover:text-blue-900"
                              >
                                Rename
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'keys' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-semibold text-gray-900">Pre-auth Keys</h2>
                  <button 
                    onClick={refreshData}
                    className="bg-gray-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-700"
                  >
                    Refresh
                  </button>
                </div>

                {/* Generate New Key */}
                <div className="bg-gray-50 p-4 rounded-lg mb-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-3">Generate New Key</h3>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-4">
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={newKeyReusable}
                          onChange={(e) => setNewKeyReusable(e.target.checked)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="ml-2 text-sm text-gray-700">Reusable</span>
                      </label>
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={newKeyEphemeral}
                          onChange={(e) => setNewKeyEphemeral(e.target.checked)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="ml-2 text-sm text-gray-700">Ephemeral</span>
                      </label>
                    </div>
                    <button
                      onClick={generatePreAuthKey}
                      className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700"
                    >
                      Generate Key
                    </button>
                  </div>

                  {generatedKey && (
                    <div className="mt-4 p-3 bg-green-50 rounded-md">
                      <p className="text-sm text-green-800 font-medium">Your new pre-auth key:</p>
                      <code className="text-sm bg-white p-2 rounded border block mt-2 font-mono break-all">
                        {generatedKey}
                      </code>
                      <p className="text-xs text-green-600 mt-2">
                        Use this key with Tailscale client to connect devices.
                      </p>
                    </div>
                  )}
                </div>

                {/* Existing Keys */}
                {loading ? (
                  <div className="p-8 text-center">
                    <p className="text-gray-600">Loading your keys...</p>
                  </div>
                ) : preAuthKeys.length === 0 ? (
                  <div className="p-8 text-center">
                    <p className="text-gray-600">No pre-auth keys found. Generate your first key above.</p>
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
                            Used
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Expires
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Created
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {preAuthKeys.map((key) => (
                          <tr key={key.id}>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <code className="text-sm bg-gray-100 px-2 py-1 rounded font-mono">
                                {key.key.substring(0, 20)}...
                              </code>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {key.reusable ? 'Reusable' : 'One-time'} {key.ephemeral ? '(Ephemeral)' : ''}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                key.used ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                              }`}>
                                {key.used ? 'Used' : 'Unused'}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {formatDate(key.expiration)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {formatDate(key.createdAt)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}