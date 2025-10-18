'use client'

import { useState, useEffect } from 'react'

interface DNSConfig {
  nameservers: string[];
  domains: string[];
  magic_dns: boolean;
  base_domain: string;
  extra_records: any[];
}

export default function DNS() {
  const [dnsConfig, setDnsConfig] = useState<DNSConfig | null>(null)
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')
  const [editMode, setEditMode] = useState(false)
  const [formData, setFormData] = useState({
    nameservers: '',
    domains: '',
    magic_dns: true,
    base_domain: ''
  })

  useEffect(() => {
    fetchDNS()
  }, [])

  const fetchDNS = async () => {
    try {
      const response = await fetch('/api/dns')
      const data = await response.json()
      
      if (data.success) {
        setDnsConfig(data.dns)
        setFormData({
          nameservers: data.dns.nameservers?.join(', ') || '',
          domains: data.dns.domains?.join(', ') || '',
          magic_dns: data.dns.magic_dns || true,
          base_domain: data.dns.base_domain || ''
        })
      }
    } catch (error) {
      setMessage('Error loading DNS configuration')
    } finally {
      setLoading(false)
    }
  }

  const saveDNS = async () => {
    try {
      const config = {
        nameservers: formData.nameservers.split(',').map(s => s.trim()).filter(s => s),
        domains: formData.domains.split(',').map(s => s.trim()).filter(s => s),
        magic_dns: formData.magic_dns,
        base_domain: formData.base_domain,
        extra_records: []
      }

      const response = await fetch('/api/dns', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(config),
      })

      const data = await response.json()

      if (data.success) {
        setMessage('✅ DNS configuration saved successfully')
        setDnsConfig(config)
        setEditMode(false)
        fetchDNS()
      } else {
        setMessage(`❌ Error: ${data.error}`)
      }
    } catch (error) {
      setMessage('❌ Error saving DNS configuration')
    }
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
            <h2 className="text-lg font-medium text-gray-900">DNS Settings</h2>
            <div className="space-x-3">
              {!editMode ? (
                <>
                  <button 
                    onClick={fetchDNS}
                    className="bg-gray-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-700"
                  >
                    Refresh
                  </button>
                  <button 
                    onClick={() => setEditMode(true)}
                    className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700"
                  >
                    Edit DNS
                  </button>
                </>
              ) : (
                <>
                  <button 
                    onClick={saveDNS}
                    className="bg-green-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-green-700"
                  >
                    Save
                  </button>
                  <button 
                    onClick={() => {
                      setEditMode(false)
                      fetchDNS()
                    }}
                    className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-400"
                  >
                    Cancel
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="p-6">
          {!editMode ? (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h3 className="text-sm font-medium text-gray-700">Nameservers</h3>
                  <p className="mt-1 text-sm text-gray-900">
                    {dnsConfig?.nameservers?.join(', ') || 'Not configured'}
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-700">Domains</h3>
                  <p className="mt-1 text-sm text-gray-900">
                    {dnsConfig?.domains?.join(', ') || 'Not configured'}
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-700">Magic DNS</h3>
                  <p className="mt-1 text-sm text-gray-900">
                    {dnsConfig?.magic_dns ? 'Enabled' : 'Disabled'}
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-700">Base Domain</h3>
                  <p className="mt-1 text-sm text-gray-900">
                    {dnsConfig?.base_domain || 'Not configured'}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nameservers
                </label>
                <input
                  type="text"
                  value={formData.nameservers}
                  onChange={(e) => setFormData({...formData, nameservers: e.target.value})}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                  placeholder="1.1.1.1, 8.8.8.8"
                />
                <p className="mt-1 text-xs text-gray-500">Separate multiple nameservers with commas</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Search Domains
                </label>
                <input
                  type="text"
                  value={formData.domains}
                  onChange={(e) => setFormData({...formData, domains: e.target.value})}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                  placeholder="example.com, internal.company.com"
                />
                <p className="mt-1 text-xs text-gray-500">Separate multiple domains with commas</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Base Domain
                </label>
                <input
                  type="text"
                  value={formData.base_domain}
                  onChange={(e) => setFormData({...formData, base_domain: e.target.value})}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                  placeholder="example.com"
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.magic_dns}
                  onChange={(e) => setFormData({...formData, magic_dns: e.target.checked})}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <label className="ml-2 text-sm text-gray-700">
                  Enable Magic DNS
                </label>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}