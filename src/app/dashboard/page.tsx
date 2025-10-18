'use client'

import { useState, useEffect } from 'react'

interface Node {
  id: string;
  name: string;
  ipAddresses: string[];
  lastSeen: string;
  online: boolean;
}

export default function Dashboard() {
  const [nodes, setNodes] = useState<Node[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchNodes()
  }, [])

  const fetchNodes = async () => {
    try {
      const response = await fetch('/api/nodes')
      const data = await response.json()
      
      if (data.success) {
        setNodes(data.nodes || [])
      }
    } catch (error) {
      console.error('Error fetching nodes:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (online: boolean) => {
    return online ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
  }

  const getStatusText = (online: boolean) => {
    return online ? "Online" : "Offline"
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Welcome Section */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome to your Dashboard! 👋
          </h1>
          <p className="text-gray-600">Manage your Headscale nodes and network settings</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Total Nodes</h3>
            <p className="text-3xl font-bold text-blue-600">{nodes.length}</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Online Nodes</h3>
            <p className="text-3xl font-bold text-green-600">
              {nodes.filter(node => node.online).length}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Your Network</h3>
            <p className="text-xl font-bold text-purple-600">Headscale</p>
          </div>
        </div>

        {/* Nodes Table */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-900">Your Nodes</h2>
              <button 
                onClick={fetchNodes}
                className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700"
              >
                Refresh Nodes
              </button>
            </div>
          </div>
          
          {loading ? (
            <div className="p-8 text-center">
              <p className="text-gray-600">Loading nodes from Headscale...</p>
            </div>
          ) : nodes.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-gray-600">No nodes found. Connect your first device to see it here.</p>
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
                        {new Date(node.lastSeen).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <button className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700">
                Generate Pre-auth Key
              </button>
              <button className="w-full border border-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-50">
                View API Keys
              </button>
              <button className="w-full border border-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-50">
                Network Settings
              </button>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Getting Started</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>• Install Tailscale on your devices</li>
              <li>• Use pre-auth keys to connect devices</li>
              <li>• Manage access controls from this dashboard</li>
              <li>• Monitor node status and connectivity</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}