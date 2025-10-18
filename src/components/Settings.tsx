'use client'

import { useState } from 'react'

interface SettingsData {
  server_url: string;
  magic_dns: boolean;
  randomize_client_port: boolean;
  oidc: {
    enabled: boolean;
    issuer: string;
    client_id: string;
    client_secret: string;
  };
}

export default function Settings() {
  const [settings, setSettings] = useState<SettingsData>({
    server_url: 'https://headscale.publicvm.com',
    magic_dns: true,
    randomize_client_port: false,
    oidc: {
      enabled: false,
      issuer: '',
      client_id: '',
      client_secret: ''
    }
  })
  const [message, setMessage] = useState('')
  const [activeSection, setActiveSection] = useState('general')

  const handleSave = async () => {
    try {
      // In a real implementation, this would save to your backend
      setMessage('✅ Settings saved successfully')
      setTimeout(() => setMessage(''), 3000)
    } catch (error) {
      setMessage('❌ Error saving settings')
    }
  }

  const sections = [
    { id: 'general', name: 'General' },
    { id: 'authentication', name: 'Authentication' },
    { id: 'network', name: 'Network' },
    { id: 'logging', name: 'Logging' }
  ]

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
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px">
            {sections.map((section) => (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
                  activeSection === section.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {section.name}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {activeSection === 'general' && (
            <div className="space-y-6">
              <h3 className="text-lg font-medium text-gray-900">General Settings</h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Server URL
                </label>
                <input
                  type="text"
                  value={settings.server_url}
                  onChange={(e) => setSettings({...settings, server_url: e.target.value})}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                  placeholder="https://headscale.example.com"
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={settings.magic_dns}
                  onChange={(e) => setSettings({...settings, magic_dns: e.target.checked})}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <label className="ml-2 text-sm text-gray-700">
                  Enable Magic DNS
                </label>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={settings.randomize_client_port}
                  onChange={(e) => setSettings({...settings, randomize_client_port: e.target.checked})}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <label className="ml-2 text-sm text-gray-700">
                  Randomize Client Port
                </label>
              </div>
            </div>
          )}

          {activeSection === 'authentication' && (
            <div className="space-y-6">
              <h3 className="text-lg font-medium text-gray-900">Authentication</h3>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={settings.oidc.enabled}
                  onChange={(e) => setSettings({
                    ...settings, 
                    oidc: {...settings.oidc, enabled: e.target.checked}
                  })}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <label className="ml-2 text-sm text-gray-700">
                  Enable OIDC Authentication
                </label>
              </div>

              {settings.oidc.enabled && (
                <div className="space-y-4 pl-6 border-l-2 border-gray-200">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      OIDC Issuer
                    </label>
                    <input
                      type="text"
                      value={settings.oidc.issuer}
                      onChange={(e) => setSettings({
                        ...settings, 
                        oidc: {...settings.oidc, issuer: e.target.value}
                      })}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                      placeholder="https://accounts.google.com"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Client ID
                    </label>
                    <input
                      type="text"
                      value={settings.oidc.client_id}
                      onChange={(e) => setSettings({
                        ...settings, 
                        oidc: {...settings.oidc, client_id: e.target.value}
                      })}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                      placeholder="your-client-id"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Client Secret
                    </label>
                    <input
                      type="password"
                      value={settings.oidc.client_secret}
                      onChange={(e) => setSettings({
                        ...settings, 
                        oidc: {...settings.oidc, client_secret: e.target.value}
                      })}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                      placeholder="your-client-secret"
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {activeSection === 'network' && (
            <div className="space-y-6">
              <h3 className="text-lg font-medium text-gray-900">Network Settings</h3>
              
              <div className="bg-blue-50 p-4 rounded-md">
                <h4 className="text-sm font-medium text-blue-900 mb-2">Network Configuration</h4>
                <p className="text-sm text-blue-800">
                  Network settings are configured server-side. Contact your administrator to modify IP ranges, DERP servers, or other network configurations.
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Default IP Range
                  </label>
                  <input
                    type="text"
                    value="100.64.0.0/10"
                    disabled
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm bg-gray-100"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    IPv6 Range
                  </label>
                  <input
                    type="text"
                    value="fd7a:115c:a1e0::/48"
                    disabled
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm bg-gray-100"
                  />
                </div>
              </div>
            </div>
          )}

          {activeSection === 'logging' && (
            <div className="space-y-6">
              <h3 className="text-lg font-medium text-gray-900">Logging & Monitoring</h3>
              
              <div className="bg-yellow-50 p-4 rounded-md">
                <h4 className="text-sm font-medium text-yellow-900 mb-2">Logging Configuration</h4>
                <p className="text-sm text-yellow-800">
                  Logging settings are configured server-side. Contact your administrator to modify log levels or enable monitoring.
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Current Log Level
                  </label>
                  <input
                    type="text"
                    value="info"
                    disabled
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm bg-gray-100"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Metrics Endpoint
                  </label>
                  <input
                    type="text"
                    value="http://localhost:9090/metrics"
                    disabled
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm bg-gray-100"
                  />
                </div>
              </div>
            </div>
          )}

          <div className="mt-6 pt-6 border-t border-gray-200">
            <button
              onClick={handleSave}
              className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700"
            >
              Save Settings
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}