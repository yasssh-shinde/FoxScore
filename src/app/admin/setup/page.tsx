'use client'

import { useState } from 'react'

export default function SetupPage() {
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [members, setMembers] = useState<any[]>([])

  const handleSeedTeamMembers = async () => {
    try {
      setLoading(true)
      setMessage('Adding team members...')

      const res = await fetch('/api/admin/seed-team', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-secret-key': 'seofox_team_2026_secret',
        },
      })

      const data = await res.json()

      if (res.ok) {
        setMembers(data.members)
        setMessage(`✅ Successfully added ${data.count} team members!`)
      } else {
        setMessage(`❌ Error: ${data.error}`)
      }
    } catch (error) {
      setMessage(`❌ Failed to add team members: ${error}`)
    } finally {
      setLoading(false)
    }
  }

  const handleCheckMembers = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/admin/seed-team')
      const data = await res.json()
      setMembers(data.members)
      setMessage(`ℹ️ Found ${data.count} team members in database`)
    } catch (error) {
      setMessage(`❌ Failed to check team members`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white p-6">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">🚀 Setup Team Members</h1>

        <div className="bg-slate-800 rounded-lg p-8 border border-slate-700 mb-8">
          <h2 className="text-2xl font-bold mb-4">Marketing Team</h2>
          <p className="text-gray-300 mb-6">
            Click below to add all 5 marketing team members to the system.
          </p>

          <div className="space-y-3 mb-8 bg-slate-900 p-4 rounded-lg">
            <div className="flex items-center gap-3">
              <span className="text-2xl">👤</span>
              <div>
                <p className="font-semibold">Yash</p>
                <p className="text-sm text-gray-400">Admin</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-2xl">👤</span>
              <div>
                <p className="font-semibold">Dnya</p>
                <p className="text-sm text-gray-400">Manager</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-2xl">👤</span>
              <div>
                <p className="font-semibold">Achyut</p>
                <p className="text-sm text-gray-400">Manager</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-2xl">👤</span>
              <div>
                <p className="font-semibold">Vaibhav</p>
                <p className="text-sm text-gray-400">Manager</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-2xl">👤</span>
              <div>
                <p className="font-semibold">Gargi</p>
                <p className="text-sm text-gray-400">Manager</p>
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleSeedTeamMembers}
              disabled={loading}
              className="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-lg font-semibold transition"
            >
              {loading ? '⏳ Adding...' : '✅ Add All Team Members'}
            </button>
            <button
              onClick={handleCheckMembers}
              disabled={loading}
              className="flex-1 px-6 py-3 bg-slate-700 hover:bg-slate-600 disabled:opacity-50 rounded-lg font-semibold transition"
            >
              {loading ? '⏳ Checking...' : '🔍 Check Status'}
            </button>
          </div>
        </div>

        {message && (
          <div
            className={`p-4 rounded-lg mb-8 ${
              message.includes('✅') || message.includes('ℹ️')
                ? 'bg-green-900/30 border border-green-700 text-green-300'
                : 'bg-red-900/30 border border-red-700 text-red-300'
            }`}
          >
            {message}
          </div>
        )}

        {members.length > 0 && (
          <div className="bg-slate-800 rounded-lg p-8 border border-slate-700">
            <h3 className="text-xl font-bold mb-4">✅ Team Members in Database</h3>
            <div className="space-y-2">
              {members.map((member) => (
                <div key={member.id} className="flex justify-between items-center p-3 bg-slate-900 rounded-lg">
                  <div>
                    <p className="font-semibold">{member.name}</p>
                    <p className="text-sm text-gray-400">{member.email}</p>
                  </div>
                  <span className="px-3 py-1 bg-blue-900/30 text-blue-300 rounded-full text-xs font-medium capitalize">
                    {member.role}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="mt-8 p-4 bg-blue-900/20 border border-blue-700 rounded-lg text-blue-300">
          <p className="text-sm">
            💡 <strong>Tip:</strong> After adding team members, go to <code className="bg-slate-900 px-2 py-1 rounded">/admin/leads</code> to start assigning leads!
          </p>
        </div>
      </div>
    </div>
  )
}
