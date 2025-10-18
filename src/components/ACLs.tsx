'use client'

import { useState, useEffect } from 'react'

interface ACLRule {
  action: string;
  src: string[];
  dst: string[];
}

interface ACL {
  hosts: Record<string, string>;
  tagOwners: Record<string, string[]>;
  acls: ACLRule[];
  groups: Record<string, string[]>;
  tests: string[];
}

export default function ACLs() {
  const [acl, setAcl] = useState<ACL | null>(null)
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')
  const [editMode, setEditMode] = useState(false)
  const [aclText, setAclText] = useState('')

  useEffect(() => {
    fetchACL()
  }, [])

  const fetchACL = async () => {
    try {
      const response = await fetch('/api/acl')
      const data = await response.json()
      
      if (data.success) {
        setAcl(data.acl)
        setAclText(JSON.stringify(data.acl, null, 2))
      }
    } catch (error) {
      setMessage('Error loading ACL configuration')
    } finally {
      setLoading(false)
    }
  }

  const saveACL = async () => {
    try {
      const parsedACL = JSON.parse(aclText)
      
      const response = await fetch('/api/acl', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(parsedACL),
      })

      const data = await response.json()

      if (data.success) {
        setMessage('✅ ACL configuration saved successfully')
        setAcl(parsedACL)
        setEditMode(false)
        fetchACL()
      } else {
        setMessage(`❌ Error: ${data.error}`)
      }
    } catch (error) {
      setMessage('❌ Invalid JSON format')
    }
  }

  const exampleACL = {
    hosts: {
      "example-host": "100.64.0.1",
    },
    tagOwners: {
      "tag:server": ["user1"],
    },
    acls: [
      {
        action: "accept",
        src: ["*"],
        dst: ["*:*"],
      },
    ],
    groups: {
      "group:engineering": ["user1", "user2"],
    },
    tests: [],
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
            <h2 className="text-lg font-medium text-gray-900">Access Controls</h2>
            <div className="space-x-3">
              {!editMode ? (
                <>
                  <button 
                    onClick={fetchACL}
                    className="bg-gray-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-700"
                  >
                    Refresh
                  </button>
                  <button 
                    onClick={() => setEditMode(true)}
                    className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700"
                  >
                    Edit ACL
                  </button>
                </>
              ) : (
                <>
                  <button 
                    onClick={saveACL}
                    className="bg-green-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-green-700"
                  >
                    Save
                  </button>
                  <button 
                    onClick={() => {
                      setEditMode(false)
                      setAclText(JSON.stringify(acl, null, 2))
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
              <div>
                <h3 className="text-md font-medium text-gray-900 mb-3">Current ACL Configuration</h3>
                <pre className="bg-gray-50 p-4 rounded-md text-sm overflow-x-auto">
                  {JSON.stringify(acl, null, 2)}
                </pre>
              </div>
              
              <div className="bg-blue-50 p-4 rounded-md">
                <h4 className="text-sm font-medium text-blue-900 mb-2">ACL Configuration Help</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Use <code className="bg-blue-100 px-1 rounded">"accept"</code> or <code className="bg-blue-100 px-1 rounded">"deny"</code> actions</li>
                  <li>• Define source and destination using IPs, tags, or groups</li>
                  <li>• Use <code className="bg-blue-100 px-1 rounded">"*"</code> for any source/destination</li>
                  <li>• Specify ports with <code className="bg-blue-100 px-1 rounded">"*:80"</code> or <code className="bg-blue-100 px-1 rounded">"100.64.0.1:443"</code></li>
                </ul>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ACL Configuration (JSON)
                </label>
                <textarea
                  value={aclText}
                  onChange={(e) => setAclText(e.target.value)}
                  rows={20}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm font-mono focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder='Paste your ACL configuration here...'
                />
              </div>
              
              <div className="bg-yellow-50 p-4 rounded-md">
                <h4 className="text-sm font-medium text-yellow-900 mb-2">Example ACL Configuration</h4>
                <pre className="text-xs text-yellow-800 overflow-x-auto">
                  {JSON.stringify(exampleACL, null, 2)}
                </pre>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}