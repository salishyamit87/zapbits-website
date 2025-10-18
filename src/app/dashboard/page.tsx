'use client'

import { useState, useEffect } from 'react'
import Machines from '@/components/Machines'
import AccessKeys from '@/components/AccessKeys'
import ACLs from '@/components/ACLs'
import DNS from '@/components/DNS'
import Routes from '@/components/Routes'
import Settings from '@/components/Settings'

interface UserStats {
  totalMachines: number;
  onlineMachines: number;
  totalKeys: number;
  activeRoutes: number;
}

export default function Dashboard() {
  const [userName, setUserName] = useState('')
  const [activeTab, setActiveTab] = useState('machines')
  const [stats, setStats] = useState<UserStats>({
    totalMachines: 0,
    onlineMachines: 0,
    totalKeys: 0,
    activeRoutes: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const user = localStorage.getItem('currentUser') || 'user';
    setUserName(user);
    loadStats(user);
  }, [])

  const loadStats = async (user: string) => {
    try {
      // Load machines count
      const machinesRes = await fetch(`/api/nodes?user=${user}`)
      const machinesData = await machinesRes.json()
      
      // Load keys count
      const keysRes = await fetch(`/api/preauthkeys?user=${user}`)
      const keysData = await keysRes.json()

      // Load routes count
      const routesRes = await fetch('/api/routes')
      const routesData = await routesRes.json()

      setStats({
        totalMachines: machinesData.success ? machinesData.nodes.length : 0,
        onlineMachines: machinesData.success ? machinesData.nodes.filter((node: any) => node.online).length : 0,
        totalKeys: keysData.success ? keysData.keys.length : 0,
        activeRoutes: routesData.success ? routesData.routes.filter((route: any) => route.enabled).length : 0
      })
    } catch (error) {
      console.error('Error loading stats:', error)
    } finally {
      setLoading(false)
    }
  }

  const tabs = [
    { id: 'machines', name: 'Machines', count: stats.totalMachines },
    { id: 'access-keys', name: 'Access Keys', count: stats.totalKeys },
    { id: 'acls', name: 'Access Controls', count: 0 },
    { id: 'routes', name: 'Routes', count: stats.activeRoutes },
    { id: 'dns', name: 'DNS', count: 0 },
    { id: 'settings', name: 'Settings', count: 0 },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">ZapBits</h1>
              <div className="ml-6 flex space-x-8">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                      activeTab === tab.id
                        ? 'border-blue-500 text-gray-900'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    {tab.name}
                    {tab.count > 0 && (
                      <span className="ml-2 py-0.5 px-2 text-xs bg-gray-200 rounded-full">
                        {tab.count}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-700">Welcome, {userName}</span>
              <button className="text-sm text-blue-600 hover:text-blue-500">
                Sign out
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'machines' && <Machines userName={userName} />}
        {activeTab === 'access-keys' && <AccessKeys userName={userName} />}
        {activeTab === 'acls' && <ACLs />}
        {activeTab === 'routes' && <Routes />}
        {activeTab === 'dns' && <DNS />}
        {activeTab === 'settings' && <Settings />}
      </div>
    </div>
  )
}