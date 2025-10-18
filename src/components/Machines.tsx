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
  machineKey: string;
  nodeKey: string;
  discoKey: string;
  endpoints: string[];
  allowedIPs: string[];
  routes: any[];
  createdAt: string;
  registerMethod: string;
}

interface MachinesProps {
  userName: string;
}

export default function Machines({ userName }: MachinesProps) {
  const [machines, setMachines] = useState<Node[]>([])
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')
  const [selectedMachine, setSelectedMachine] = useState<Node | null>(null)
  const [showDetails, setShowDetails] = useState(false)

  useEffect(() => {
    fetchMachines()
  }, [userName])

  const fetchMachines = async () => {
    try {
      const response = await fetch(`/api/nodes?user=${userName}`)
      const data = await response.json()
      
      if (data.success) {
        setMachines(data.nodes || [])
      }
    } catch (error) {
      setMessage('Error loading machines')
    } finally {
      setLoading(false)
    }
  }

  const handleMachineAction = async (machineId: string, action: string, data?: any) => {
    try {
      const response = await fetch('/api/nodes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ nodeId: machineId, action, ...data }),
      })

      const result = await response.json()

      if (result.success) {
        setMessage(`✅ Machine ${action} successful`)
        fetchMachines()
      } else {
        setMessage(`❌ Error: ${result.error}`)
      }
    } catch (error) {
      setMessage('❌ Network error')
    }
  }

  const getStatusColor = (online: boolean) => {
    return online ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
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
            <h2 className="text-lg font-medium text-gray-900">Machines</h2>
            <button 
              onClick={fetchMachines}
              className="bg-gray-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-700"
            >
              Refresh
            </button>
          </div>
        </div>

        {machines.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-gray-500">No machines found. Generate an access key to connect your first device.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
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
                {machines.map((machine) => (
                  <tr key={machine.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="text-sm font-medium text-gray-900">{machine.name}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{machine.ipAddresses?.[0] || 'No IP'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(machine.online)}`}>
                        {machine.online ? 'Online' : 'Offline'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(machine.lastSeen)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      <button
                        onClick={() => {
                          setSelectedMachine(machine)
                          setShowDetails(true)
                        }}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        Details
                      </button>
                      <button
                        onClick={() => {
                          const newName = prompt('Enter new name:', machine.name);
                          if (newName && newName !== machine.name) {
                            handleMachineAction(machine.id, 'rename', { newName });
                          }
                        }}
                        className="text-green-600 hover:text-green-900"
                      >
                        Rename
                      </button>
                      <button
                        onClick={() => handleMachineAction(machine.id, 'expire')}
                        className="text-yellow-600 hover:text-yellow-900"
                      >
                        Expire
                      </button>
                      <button
                        onClick={() => {
                          if (confirm('Are you sure you want to delete this machine?')) {
                            handleMachineAction(machine.id, 'delete');
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

      {/* Machine Details Modal */}
      {showDetails && selectedMachine && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex justify-between items-center pb-3 border-b">
                <h3 className="text-lg font-medium text-gray-900">Machine Details</h3>
                <button
                  onClick={() => setShowDetails(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ×
                </button>
              </div>
              
              <div className="mt-4 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Name</label>
                    <p className="text-sm text-gray-900">{selectedMachine.name}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Status</label>
                    <p className="text-sm">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(selectedMachine.online)}`}>
                        {selectedMachine.online ? 'Online' : 'Offline'}
                      </span>
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">IP Address</label>
                    <p className="text-sm text-gray-900">{selectedMachine.ipAddresses?.[0] || 'No IP'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Last Seen</label>
                    <p className="text-sm text-gray-900">{formatDate(selectedMachine.lastSeen)}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Created</label>
                    <p className="text-sm text-gray-900">{formatDate(selectedMachine.createdAt)}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Register Method</label>
                    <p className="text-sm text-gray-900">{selectedMachine.registerMethod}</p>
                  </div>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-700">Endpoints</label>
                  <div className="text-sm text-gray-900 space-y-1">
                    {selectedMachine.endpoints?.map((endpoint, index) => (
                      <div key={index} className="font-mono text-xs">{endpoint}</div>
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  onClick={() => setShowDetails(false)}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}