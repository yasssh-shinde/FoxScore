'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

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

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: leadsData } = await supabase
          .from('leads')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(100)

        if (leadsData) {
          setLeads(leadsData)

          const scores = leadsData
            .map(l => l.actual_score)
            .filter(s => s !== null) as number[]

          setStats({
            totalLeads: leadsData.length,
            averageScore: scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0,
            highestScore: scores.length > 0 ? Math.max(...scores) : 0,
            lowestScore: scores.length > 0 ? Math.min(...scores) : 0,
            prizeWinners: leadsData.filter(l => l.won_prize).length,
          })
        }
      } catch (error) {
        console.error('Error fetching data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const handleExport = () => {
    const csv = [
      ['Name', 'Company', 'Email', 'Website', 'Guessed Score', 'Actual Score', 'Won Prize', 'Date'].join(','),
      ...leads.map(l => [
        l.full_name,
        l.company_name,
        l.email,
        l.website_url,
        l.guessed_score,
        l.actual_score,
        l.won_prize ? 'Yes' : 'No',
        new Date(l.created_at).toLocaleDateString(),
      ].join(',')),
    ].join('\n')

    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `leads-${Date.now()}.csv`
    a.click()
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center"><p>Loading...</p></div>

  return (
    <main className="min-h-screen py-20 px-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-4xl font-bold">Admin Dashboard</h1>
            <button
              onClick={handleExport}
              className="bg-green-600 hover:bg-green-700 px-6 py-2 rounded-lg text-white transition"
            >
              📥 Export CSV
            </button>
          </div>

          {/* Navigation */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
            <Link href="/admin/setup" className="p-4 glass-card hover:bg-white/10 transition rounded-lg text-center border-2 border-green-500/50">
              <div className="text-3xl mb-2">🚀</div>
              <div className="font-semibold">Setup</div>
              <div className="text-xs text-gray-400">Add team members</div>
            </Link>
            <Link href="/admin/leads" className="p-4 glass-card hover:bg-white/10 transition rounded-lg text-center">
              <div className="text-3xl mb-2">📋</div>
              <div className="font-semibold">Lead Dashboard</div>
              <div className="text-xs text-gray-400">Manage & assign leads</div>
            </Link>
            <Link href="/admin/team" className="p-4 glass-card hover:bg-white/10 transition rounded-lg text-center">
              <div className="text-3xl mb-2">👥</div>
              <div className="font-semibold">Team Management</div>
              <div className="text-xs text-gray-400">View team members</div>
            </Link>
            <Link href="/admin/reminders" className="p-4 glass-card hover:bg-white/10 transition rounded-lg text-center">
              <div className="text-3xl mb-2">⏰</div>
              <div className="font-semibold">Follow-up Reminders</div>
              <div className="text-xs text-gray-400">Manage reminders</div>
            </Link>
            <a href="/api/leads/export" className="p-4 glass-card hover:bg-white/10 transition rounded-lg text-center cursor-pointer">
              <div className="text-3xl mb-2">💾</div>
              <div className="font-semibold">Export Leads</div>
              <div className="text-xs text-gray-400">Download CSV</div>
            </a>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-12">
          {[
            { label: 'Total Leads', value: stats.totalLeads, icon: '👥' },
            { label: 'Avg Score', value: stats.averageScore, icon: '📊' },
            { label: 'Highest', value: stats.highestScore, icon: '🏆' },
            { label: 'Lowest', value: stats.lowestScore, icon: '📉' },
            { label: 'Prize Winners', value: stats.prizeWinners, icon: '🎉' },
          ].map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="glass-card text-center"
            >
              <div className="text-3xl mb-2">{stat.icon}</div>
              <div className="text-2xl font-bold text-[#FF6B35]">{stat.value}</div>
              <div className="text-xs text-gray-400">{stat.label}</div>
            </motion.div>
          ))}
        </div>

        {/* Leads Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card overflow-x-auto"
        >
          <h2 className="text-xl font-bold mb-6">Recent Leads</h2>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left py-3 px-4">Name</th>
                <th className="text-left py-3 px-4">Company</th>
                <th className="text-left py-3 px-4">Email</th>
                <th className="text-left py-3 px-4">Score</th>
                <th className="text-left py-3 px-4">Prize</th>
                <th className="text-left py-3 px-4">Date</th>
              </tr>
            </thead>
            <tbody>
              {leads.map((lead) => (
                <tr key={lead.id} className="border-b border-white/5 hover:bg-white/5 transition">
                  <td className="py-3 px-4">{lead.full_name}</td>
                  <td className="py-3 px-4">{lead.company_name}</td>
                  <td className="py-3 px-4 text-xs text-gray-400">{lead.email}</td>
                  <td className="py-3 px-4">
                    <span className="text-[#FF6B35] font-bold">{lead.actual_score}</span>
                  </td>
                  <td className="py-3 px-4">
                    {lead.won_prize ? <span className="text-green-400">✅ Won</span> : <span className="text-gray-500">—</span>}
                  </td>
                  <td className="py-3 px-4 text-xs text-gray-500">
                    {new Date(lead.created_at).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </motion.div>
      </div>
    </main>
  )
}
