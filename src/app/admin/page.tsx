'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalLeads: 0,
    averageScore: 0,
    highestScore: 0,
    lowestScore: 0,
    prizeWinners: 0,
  })
  const [leads, setLeads] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  // Tab State: 'leads' | 'queue' | 'prizes'
  const [activeTab, setActiveTab] = useState<'leads' | 'queue' | 'prizes'>('leads')

  // Queue State
  const [jobs, setJobs] = useState<any[]>([])
  const [loadingJobs, setLoadingJobs] = useState(false)

  // Prizes State
  const [claims, setClaims] = useState<any[]>([])
  const [loadingClaims, setLoadingClaims] = useState(false)
  const [adminNotes, setAdminNotes] = useState<Record<string, string>>({})

  useEffect(() => {
    fetchDashboardData()
  }, [])

  useEffect(() => {
    if (activeTab === 'queue') {
      fetchJobs()
    } else if (activeTab === 'prizes') {
      fetchClaims()
    }
  }, [activeTab])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      const [leadsRes, statsRes] = await Promise.all([
        fetch('/api/leads?limit=100').catch(() => null),
        fetch('/api/admin/stats').catch(() => null)
      ])

      if (leadsRes && leadsRes.ok) {
        const leadsData = await leadsRes.json()
        setLeads(leadsData.data || [])
      } else {
        console.warn('⚠️ Leads fetch failed or returned non-200 response.')
      }

      if (statsRes && statsRes.ok) {
        const statsData = await statsRes.json()
        setStats(statsData.stats)
      } else {
        console.warn('⚠️ Stats fetch failed or returned non-200 response.')
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchJobs = async () => {
    try {
      setLoadingJobs(true)
      const res = await fetch('/api/admin/jobs')
      if (res.ok) {
        const data = await res.json()
        setJobs(data.jobs || [])
      }
    } catch (error) {
      console.error('Error fetching background jobs:', error)
    } finally {
      setLoadingJobs(false)
    }
  }

  const fetchClaims = async () => {
    try {
      setLoadingClaims(true)
      const res = await fetch('/api/admin/prize-claims')
      if (res.ok) {
        const data = await res.json()
        setClaims(data.claims || [])
      }
    } catch (error) {
      console.error('Error fetching prize claims:', error)
    } finally {
      setLoadingClaims(false)
    }
  }

  const handleRetryJob = async (jobId: string) => {
    try {
      const res = await fetch('/api/admin/jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ job_id: jobId }),
      })
      if (res.ok) {
        alert('Job reset to pending. Refreshing list...')
        fetchJobs()
      } else {
        const err = await res.json()
        alert(`Failed to retry: ${err.error}`)
      }
    } catch (e: any) {
      alert(`Error: ${e.message}`)
    }
  }

  const handleUpdateClaim = async (claimId: string, status: 'approved' | 'rejected') => {
    try {
      const notes = adminNotes[claimId] || ''
      const res = await fetch('/api/admin/prize-claims', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          claim_id: claimId,
          status,
          admin_notes: notes,
        }),
      })

      if (res.ok) {
        alert(`Claim marked as ${status} successfully.`)
        fetchClaims()
        fetchDashboardData() // Refresh stats
      } else {
        const err = await res.json()
        alert(`Failed: ${err.error}`)
      }
    } catch (e: any) {
      alert(`Error: ${e.message}`)
    }
  }

  const handleExport = () => {
    const csv = [
      ['Name', 'Company', 'Email', 'Website', 'Guessed Score', 'Actual Score', 'Won Prize', 'Date'].join(','),
      ...leads.map(l => [
        l.full_name,
        l.company_name,
        l.email,
        l.website_url,
        l.guessed_score,
        l.actual_score !== null ? l.actual_score : 'Pending',
        l.won_prize ? 'Yes' : 'No',
        new Date(l.created_at).toLocaleDateString(),
      ].join(',')),
    ].join('\n')

    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `leads-export-${Date.now()}.csv`
    a.click()
  }

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white"><p>Loading dashboard stats...</p></div>
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white py-8 px-4 sm:py-12 sm:px-6 md:py-16 md:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-r from-orange-500 to-orange-400 bg-clip-text text-transparent">FoxScore Admin Console</h1>
            <button
              onClick={handleExport}
              className="bg-green-600 hover:bg-green-700 px-6 py-2.5 rounded-lg text-white font-semibold transition text-sm sm:text-base w-full sm:w-auto text-center"
            >
              📥 Export Leads CSV
            </button>
          </div>

          {/* Navigation */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
            <Link href="/admin/setup" className="p-4 glass-card hover:bg-white/10 transition rounded-lg text-center border-2 border-orange-500/25">
              <div className="text-3xl mb-2">🚀</div>
              <div className="font-semibold text-sm">Setup</div>
              <div className="text-xs text-gray-400">Manage internal team</div>
            </Link>
            <Link href="/admin/leads" className="p-4 glass-card hover:bg-white/10 transition rounded-lg text-center">
              <div className="text-3xl mb-2">📋</div>
              <div className="font-semibold text-sm">Lead Dashboard</div>
              <div className="text-xs text-gray-400">Detailed workflow assignments</div>
            </Link>
            <Link href="/admin/team" className="p-4 glass-card hover:bg-white/10 transition rounded-lg text-center">
              <div className="text-3xl mb-2">👥</div>
              <div className="font-semibold text-sm">Team Members</div>
              <div className="text-xs text-gray-400">View Active Agents</div>
            </Link>
            <Link href="/admin/reminders" className="p-4 glass-card hover:bg-white/10 transition rounded-lg text-center">
              <div className="text-3xl mb-2">⏰</div>
              <div className="font-semibold text-sm">Follow-ups</div>
              <div className="text-xs text-gray-400">Scheduler reminders</div>
            </Link>
            <a href="/api/leads/export" className="p-4 glass-card hover:bg-white/10 transition rounded-lg text-center cursor-pointer">
              <div className="text-3xl mb-2">💾</div>
              <div className="font-semibold text-sm">Full DB Export</div>
              <div className="text-xs text-gray-400">Download direct CSV</div>
            </a>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-10">
          {[
            { label: 'Total Leads', value: stats.totalLeads, icon: '👥' },
            { label: 'Avg Score', value: `${stats.averageScore}/100`, icon: '📊' },
            { label: 'Highest', value: `${stats.highestScore}/100`, icon: '🏆' },
            { label: 'Lowest', value: `${stats.lowestScore}/100`, icon: '📉' },
            { label: 'Approved Winners', value: stats.prizeWinners, icon: '🎉' },
          ].map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="glass-card text-center bg-white/[0.02] border border-white/10 p-6 rounded-xl"
            >
              <div className="text-3xl mb-2">{stat.icon}</div>
              <div className="text-2xl font-bold text-orange-500">{stat.value}</div>
              <div className="text-xs text-gray-400 font-medium uppercase tracking-wider mt-1">{stat.label}</div>
            </motion.div>
          ))}
        </div>

        {/* Tab Toggle Control */}
        <div className="flex overflow-x-auto whitespace-nowrap border-b border-white/10 mb-6 font-semibold scrollbar-none">
          <button
            onClick={() => setActiveTab('leads')}
            className={`flex-shrink-0 px-4 sm:px-6 py-3 border-b-2 text-sm transition-all duration-200 ${activeTab === 'leads' ? 'border-orange-500 text-orange-500' : 'border-transparent text-gray-400 hover:text-white'
              }`}
          >
            📋 Lead Records
          </button>
          <button
            onClick={() => setActiveTab('queue')}
            className={`flex-shrink-0 px-4 sm:px-6 py-3 border-b-2 text-sm transition-all duration-200 ${activeTab === 'queue' ? 'border-orange-500 text-orange-500' : 'border-transparent text-gray-400 hover:text-white'
              }`}
          >
            ⚙️ Background Job Queue
          </button>
          <button
            onClick={() => setActiveTab('prizes')}
            className={`flex-shrink-0 px-4 sm:px-6 py-3 border-b-2 text-sm transition-all duration-200 ${activeTab === 'prizes' ? 'border-orange-500 text-orange-500' : 'border-transparent text-gray-400 hover:text-white'
              }`}
          >
            🏆 Prize Claim Verification
          </button>
        </div>

        {/* Tab Contents */}

        {/* T1: Leads Table */}
        {activeTab === 'leads' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="glass-card overflow-x-auto bg-white/[0.01] border border-white/5 p-4 sm:p-6 rounded-xl"
          >
            <h2 className="text-lg font-bold mb-4">Recent Challenge Submissions</h2>
            <table className="w-full min-w-[800px] text-sm">
              <thead>
                <tr className="border-b border-white/10 text-gray-400 text-left">
                  <th className="py-3 px-4">Name</th>
                  <th className="py-3 px-4">Company</th>
                  <th className="py-3 px-4">Email</th>
                  <th className="py-3 px-4">Guessed</th>
                  <th className="py-3 px-4">Actual</th>
                  <th className="py-3 px-4">Result</th>
                  <th className="py-3 px-4">Date</th>
                </tr>
              </thead>
              <tbody>
                {leads.map((lead) => (
                  <tr key={lead.id} className="border-b border-white/5 hover:bg-white/5 transition">
                    <td className="py-3.5 px-4 font-medium">{lead.full_name}</td>
                    <td className="py-3.5 px-4">{lead.company_name}</td>
                    <td className="py-3.5 px-4 text-xs text-gray-400 font-mono">{lead.email}</td>
                    <td className="py-3.5 px-4 text-orange-400 font-bold">{lead.guessed_score}/100</td>
                    <td className="py-3.5 px-4">
                      {lead.actual_score !== null ? (
                        <span className="text-green-400 font-bold">{lead.actual_score}/100</span>
                      ) : (
                        <span className="text-yellow-500 text-xs italic animate-pulse">Running...</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      {lead.won_prize ? (
                        <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-green-900/30 text-green-400 border border-green-500/20">✅ Verified Winner</span>
                      ) : lead.actual_score !== null ? (
                        <span className="text-xs px-2.5 py-0.5 rounded-full bg-white/5 text-gray-500 border border-white/5">No Match</span>
                      ) : (
                        <span className="text-xs text-gray-600">—</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-xs text-gray-500">
                      {new Date(lead.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </motion.div>
        )}

        {/* T2: Background Jobs Queue Monitor */}
        {activeTab === 'queue' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="glass-card overflow-x-auto bg-white/[0.01] border border-white/5 p-4 sm:p-6 rounded-xl"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
              <h2 className="text-lg font-bold">Asynchronous Task Queue (Last 50 Jobs)</h2>
              <button
                onClick={fetchJobs}
                className="px-4 py-1.5 bg-white/5 border border-white/10 hover:bg-white/10 text-xs rounded-lg transition w-full sm:w-auto text-center"
              >
                🔄 Refresh Queue
              </button>
            </div>

            {loadingJobs ? (
              <div className="py-12 text-center text-gray-500">Loading active task queue logs...</div>
            ) : jobs.length === 0 ? (
              <div className="py-12 text-center text-gray-500">No background jobs registered in queue logs.</div>
            ) : (
              <table className="w-full min-w-[900px] text-sm">
                <thead>
                  <tr className="border-b border-white/10 text-gray-400 text-left">
                    <th className="py-3 px-4">Task Name</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Attempts</th>
                    <th className="py-3 px-4">Execute At</th>
                    <th className="py-3 px-4">Job Errors</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {jobs.map((job) => (
                    <tr key={job.id} className="border-b border-white/5 hover:bg-white/5 transition">
                      <td className="py-3.5 px-4 font-mono text-xs font-semibold text-orange-400">{job.job_type}</td>
                      <td className="py-3.5 px-4">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${job.status === 'completed' ? 'bg-green-500/10 text-green-400 border-green-500/20' :
                            job.status === 'running' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20 animate-pulse' :
                              job.status === 'pending' ? 'bg-white/5 text-gray-400 border-white/5' :
                                job.status === 'failed_permanently' ? 'bg-red-500/10 text-red-400 border-red-500/30 font-black' :
                                  'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
                          }`}>
                          {job.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-gray-300 font-medium">{job.attempts}/{job.max_attempts}</td>
                      <td className="py-3.5 px-4 text-xs text-gray-500">{new Date(job.run_at).toLocaleString()}</td>
                      <td className="py-3.5 px-4 max-w-xs truncate text-xs text-red-400 font-mono" title={job.error_log}>
                        {job.error_log || <span className="text-gray-600">—</span>}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        {(job.status === 'failed' || job.status === 'failed_permanently') && (
                          <button
                            onClick={() => handleRetryJob(job.id)}
                            className="bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs px-3 py-1.5 rounded transition"
                          >
                            🔄 Retry
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </motion.div>
        )}

        {/* T3: Prize Claims Verification */}
        {activeTab === 'prizes' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="glass-card overflow-x-auto bg-white/[0.01] border border-white/5 p-4 sm:p-6 rounded-xl"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
              <h2 className="text-lg font-bold">Score Guesses & Prize Claims Queue</h2>
              <button
                onClick={fetchClaims}
                className="px-4 py-1.5 bg-white/5 border border-white/10 hover:bg-white/10 text-xs rounded-lg transition w-full sm:w-auto text-center"
              >
                🔄 Refresh Claims
              </button>
            </div>

            {loadingClaims ? (
              <div className="py-12 text-center text-gray-500">Loading claims list...</div>
            ) : claims.length === 0 ? (
              <div className="py-12 text-center text-gray-500">No prize claims logged yet.</div>
            ) : (
              <table className="w-full min-w-[1000px] text-sm text-left">
                <thead>
                  <tr className="border-b border-white/10 text-gray-400">
                    <th className="py-3 px-4">Ref ID</th>
                    <th className="py-3 px-4">Lead Details</th>
                    <th className="py-3 px-4">Guess vs Actual</th>
                    <th className="py-3 px-4">Difference</th>
                    <th className="py-3 px-4">Verification</th>
                    <th className="py-3 px-4">Admin Audit Notes</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {claims.map((claim) => (
                    <tr key={claim.id} className="border-b border-white/5 hover:bg-white/5 transition">
                      <td className="py-4 px-4 font-mono text-xs text-gray-500">{claim.leads?.reference_id}</td>
                      <td className="py-4 px-4">
                        <div className="text-xs">
                          <p className="font-semibold text-white">{claim.leads?.full_name}</p>
                          <p className="text-gray-400">{claim.leads?.company_name}</p>
                          <p className="text-gray-500 text-[10px]">{claim.leads?.mobile_number} | {claim.leads?.email}</p>
                        </div>
                      </td>
                      <td className="py-4 px-4 font-bold text-sm">
                        <span className="text-orange-400">{claim.guessed_score}</span>
                        <span className="text-gray-600 font-medium"> vs </span>
                        <span className="text-green-400">{claim.actual_score}</span>
                      </td>
                      <td className="py-4 px-4">
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded ${claim.difference <= 2 ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-white/5 text-gray-500'
                          }`}>
                          ±{claim.difference} pts
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold border uppercase ${claim.status === 'approved' ? 'bg-green-500/10 text-green-400 border-green-500/20' :
                            claim.status === 'rejected' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                              'bg-yellow-500/10 text-yellow-400 border-yellow-500/20 animate-pulse'
                          }`}>
                          {claim.status}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <input
                          type="text"
                          placeholder="Add verification notes..."
                          value={adminNotes[claim.id] ?? claim.admin_notes ?? ''}
                          onChange={(e) => setAdminNotes({ ...adminNotes, [claim.id]: e.target.value })}
                          className="px-2.5 py-1 bg-slate-900 border border-slate-700 rounded text-xs text-white w-full placeholder-gray-600 focus:outline-none focus:border-orange-500"
                        />
                      </td>
                      <td className="py-4 px-4 text-right">
                        {claim.status === 'pending' && (
                          <div className="flex gap-2 justify-end">
                            <button
                              onClick={() => handleUpdateClaim(claim.id, 'approved')}
                              className="bg-green-600 hover:bg-green-700 text-white font-bold text-xs px-2.5 py-1.5 rounded transition"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => handleUpdateClaim(claim.id, 'rejected')}
                              className="bg-red-600 hover:bg-red-700 text-white font-bold text-xs px-2.5 py-1.5 rounded transition"
                            >
                              Reject
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </motion.div>
        )}
      </div>
    </main>
  )
}
