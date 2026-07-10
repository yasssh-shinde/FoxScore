'use client'

import { useState, useEffect } from 'react'
import { Lead, TeamMember } from '@/types'
import clsx from 'clsx'

export default function LeadsDashboard() {
  const [leads, setLeads] = useState<any[]>([])
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [selectedLead, setSelectedLead] = useState<any>(null)
  const [showAssignModal, setShowAssignModal] = useState(false)
  const [showReminderModal, setShowReminderModal] = useState(false)
  const [selectedTeamMember, setSelectedTeamMember] = useState('')
  const [reminderDate, setReminderDate] = useState('')
  const [reminderTitle, setReminderTitle] = useState('')

  const limit = 20

  useEffect(() => {
    fetchLeads()
    fetchTeamMembers()
  }, [search, page])

  const fetchLeads = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        sortBy: 'created_at',
        sortOrder: 'desc',
      })
      if (search) params.append('search', search)

      const res = await fetch(`/api/leads?${params}`)
      const { data, pagination } = await res.json()
      setLeads(data)
      setTotal(pagination.total)
    } catch (error) {
      console.error('Failed to fetch leads:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchTeamMembers = async () => {
    try {
      const res = await fetch('/api/team-members')
      const data = await res.json()
      setTeamMembers(data)
    } catch (error) {
      console.error('Failed to fetch team members:', error)
    }
  }

  const handleAssignLead = async () => {
    if (!selectedLead || !selectedTeamMember) return

    try {
      const res = await fetch('/api/lead-assignments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lead_id: selectedLead.id,
          assigned_to: selectedTeamMember,
        }),
      })

      if (res.ok) {
        setShowAssignModal(false)
        setSelectedTeamMember('')
        fetchLeads()
      }
    } catch (error) {
      console.error('Failed to assign lead:', error)
    }
  }

  const handleCreateReminder = async () => {
    if (!selectedLead || !selectedTeamMember || !reminderDate) return

    try {
      const res = await fetch('/api/follow-up-reminders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lead_id: selectedLead.id,
          assigned_to: selectedTeamMember,
          reminder_date: reminderDate,
          title: reminderTitle || 'Follow-up reminder',
          reminder_type: 'email',
        }),
      })

      if (res.ok) {
        setShowReminderModal(false)
        setReminderDate('')
        setReminderTitle('')
        setSelectedTeamMember('')
        fetchLeads()
      }
    } catch (error) {
      console.error('Failed to create reminder:', error)
    }
  }

  const handleExport = async () => {
    try {
      const res = await fetch('/api/leads/export')
      const blob = await res.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `leads-${new Date().toISOString().split('T')[0]}.csv`
      document.body.appendChild(a)
      a.click()
      a.remove()
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Failed to export leads:', error)
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold">Lead Dashboard</h1>
          <button
            onClick={handleExport}
            className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg transition"
          >
            📥 Export CSV
          </button>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <input
            type="text"
            placeholder="Search by name, company, or email..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value)
              setPage(1)
            }}
            className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
          />
        </div>

        {/* Leads Table */}
        <div className="overflow-x-auto bg-slate-800 rounded-lg">
          <table className="w-full text-sm">
            <thead className="bg-slate-700 border-b border-slate-600">
              <tr>
                <th className="px-6 py-3 text-left">Company</th>
                <th className="px-6 py-3 text-left">Contact</th>
                <th className="px-6 py-3 text-center">Score</th>
                <th className="px-6 py-3 text-left">Assigned To</th>
                <th className="px-6 py-3 text-left">Status</th>
                <th className="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {leads.map((lead) => {
                const assignment = lead.lead_assignments?.[0]
                const score = lead.audit_results?.[0]?.overall_score || lead.actual_score

                return (
                  <tr key={lead.id} className="border-b border-slate-700 hover:bg-slate-700/50">
                    <td className="px-6 py-4">{lead.company_name}</td>
                    <td className="px-6 py-4">
                      <div className="text-sm">
                        <p className="font-medium">{lead.full_name}</p>
                        <p className="text-gray-400">{lead.email}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center font-semibold text-blue-400">
                      {score ? Math.round(score) : 'N/A'}
                    </td>
                    <td className="px-6 py-4">
                      {assignment?.team_members?.name || (
                        <span className="text-gray-500">Unassigned</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={clsx(
                          'px-3 py-1 rounded-full text-xs font-medium',
                          assignment?.status === 'contacted'
                            ? 'bg-green-900/30 text-green-300'
                            : assignment?.status
                            ? 'bg-blue-900/30 text-blue-300'
                            : 'bg-gray-900/30 text-gray-300'
                        )}
                      >
                        {assignment?.status || 'Not assigned'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => {
                          setSelectedLead(lead)
                          setShowAssignModal(true)
                        }}
                        className="text-blue-400 hover:text-blue-300 text-sm mr-3"
                      >
                        Assign
                      </button>
                      <button
                        onClick={() => {
                          setSelectedLead(lead)
                          setShowReminderModal(true)
                        }}
                        className="text-purple-400 hover:text-purple-300 text-sm"
                      >
                        Remind
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="mt-6 flex justify-center gap-4">
          <button
            onClick={() => setPage(Math.max(1, page - 1))}
            disabled={page === 1}
            className="px-4 py-2 bg-slate-700 hover:bg-slate-600 disabled:opacity-50 rounded-lg transition"
          >
            ← Previous
          </button>
          <span className="px-4 py-2">
            Page {page} of {Math.ceil(total / limit)}
          </span>
          <button
            onClick={() => setPage(page + 1)}
            disabled={page >= Math.ceil(total / limit)}
            className="px-4 py-2 bg-slate-700 hover:bg-slate-600 disabled:opacity-50 rounded-lg transition"
          >
            Next →
          </button>
        </div>

        {/* Assign Modal */}
        {showAssignModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-slate-800 rounded-lg p-6 max-w-md w-full">
              <h2 className="text-xl font-bold mb-4">Assign Lead</h2>
              <p className="text-gray-300 mb-4">
                Assign <strong>{selectedLead?.full_name}</strong> to a team member
              </p>
              <select
                value={selectedTeamMember}
                onChange={(e) => setSelectedTeamMember(e.target.value)}
                className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white mb-4 focus:outline-none focus:border-blue-500"
              >
                <option value="">Select team member...</option>
                {teamMembers.map((member) => (
                  <option key={member.id} value={member.id}>
                    {member.name} ({member.email})
                  </option>
                ))}
              </select>
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowAssignModal(false)
                    setSelectedTeamMember('')
                  }}
                  className="flex-1 px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAssignLead}
                  disabled={!selectedTeamMember}
                  className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-lg transition"
                >
                  Assign
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Reminder Modal */}
        {showReminderModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-slate-800 rounded-lg p-6 max-w-md w-full">
              <h2 className="text-xl font-bold mb-4">Create Follow-up Reminder</h2>
              <p className="text-gray-300 mb-4">
                Reminder for <strong>{selectedLead?.full_name}</strong>
              </p>
              <select
                value={selectedTeamMember}
                onChange={(e) => setSelectedTeamMember(e.target.value)}
                className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white mb-4 focus:outline-none focus:border-blue-500"
              >
                <option value="">Assign to team member...</option>
                {teamMembers.map((member) => (
                  <option key={member.id} value={member.id}>
                    {member.name}
                  </option>
                ))}
              </select>
              <input
                type="datetime-local"
                value={reminderDate}
                onChange={(e) => setReminderDate(e.target.value)}
                className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white mb-4 focus:outline-none focus:border-blue-500"
              />
              <input
                type="text"
                placeholder="Reminder title (optional)"
                value={reminderTitle}
                onChange={(e) => setReminderTitle(e.target.value)}
                className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white mb-4 focus:outline-none focus:border-blue-500"
              />
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowReminderModal(false)
                    setReminderDate('')
                    setReminderTitle('')
                    setSelectedTeamMember('')
                  }}
                  className="flex-1 px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateReminder}
                  disabled={!selectedTeamMember || !reminderDate}
                  className="flex-1 px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 rounded-lg transition"
                >
                  Create
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
