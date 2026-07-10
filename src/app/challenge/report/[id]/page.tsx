'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { supabase } from '@/lib/supabase'
import { Lead, AuditResult } from '@/types'

export default function ReportPage() {
  const params = useParams()
  const router = useRouter()
  const leadId = params.id as string

  const [lead, setLead] = useState<Lead | null>(null)
  const [audit, setAudit] = useState<AuditResult | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: leadData } = await supabase
          .from('leads')
          .select('*')
          .eq('id', leadId)
          .single()

        const { data: auditData } = await supabase
          .from('audit_results')
          .select('*')
          .eq('lead_id', leadId)
          .single()

        setLead(leadData)
        setAudit(auditData)
      } catch (error) {
        console.error('Error fetching:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [leadId])

  if (loading) return <div className="min-h-screen flex items-center justify-center"><p>Loading...</p></div>
  if (!lead || !audit) return <div className="min-h-screen flex items-center justify-center"><p>Report not found</p></div>

  const categories = [
    { name: 'Website', items: audit.audit_data.website, color: 'from-blue-500' },
    { name: 'SEO', items: audit.audit_data.seo, color: 'from-purple-500' },
    { name: 'Google', items: audit.audit_data.google, color: 'from-red-500' },
    { name: 'Social', items: audit.audit_data.social, color: 'from-green-500' },
  ]

  return (
    <main className="min-h-screen py-20 px-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <button
            onClick={() => router.back()}
            className="text-gray-400 hover:text-white transition text-sm mb-6"
          >
            ← Back
          </button>

          <div className="glass-card mb-8">
            <h1 className="text-4xl font-bold mb-2">{lead.company_name}</h1>
            <p className="text-gray-400 mb-4">{lead.website_url}</p>
            <p className="text-sm text-gray-500">Report ID: {lead.reference_id}</p>
          </div>
        </motion.div>

        {/* Overall Score */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="glass-card mb-12 text-center"
        >
          <h2 className="text-gray-400 text-sm mb-4">Overall Digital Health Score</h2>
          <div className="text-7xl font-bold bg-gradient-to-r from-[#FF6B35] to-[#FF8C42] bg-clip-text text-transparent">
            {audit.overall_score}
          </div>
          <div className="text-gray-400 mt-2">out of 10</div>
        </motion.div>

        {/* Score Breakdown */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12"
        >
          {categories.map((cat, i) => (
            <div key={i} className="glass-card text-center">
              <div className="text-3xl font-bold bg-gradient-to-r from-white to-gray-300 mb-1">
                {cat.name === 'Website' && audit.website_score}
                {cat.name === 'SEO' && audit.seo_score}
                {cat.name === 'Google' && audit.google_score}
                {cat.name === 'Social' && audit.social_score}
              </div>
              <div className="text-xs text-gray-400">{cat.name}</div>
            </div>
          ))}
        </motion.div>

        {/* Detailed Audit Results */}
        <div className="space-y-8 mb-12">
          {categories.map((category, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + idx * 0.1 }}
              className="glass-card"
            >
              <h3 className={`text-xl font-bold bg-gradient-to-r ${category.color} to-white bg-clip-text text-transparent mb-6`}>
                {category.name} Audit
              </h3>

              <div className="space-y-3">
                {category.items.map((item, i) => (
                  <div key={i} className="flex items-start gap-3 pb-3 border-b border-white/10 last:border-0">
                    <div className="mt-1">
                      {item.status === 'pass' && <span className="text-xl">✅</span>}
                      {item.status === 'warning' && <span className="text-xl">⚠️</span>}
                      {item.status === 'fail' && <span className="text-xl">❌</span>}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-white">{item.metric}</h4>
                      <p className="text-sm text-gray-400">{item.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Recommendations */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="glass-card border-orange-500/20 mb-12"
        >
          <h3 className="text-xl font-bold text-orange-400 mb-6">Top Recommendations</h3>
          <ul className="space-y-3">
            {audit.audit_data.improvements.map((item, i) => (
              <li key={i} className="flex items-start gap-3">
                <span className="text-orange-400 mt-1">→</span>
                <span className="text-gray-300">{item}</span>
              </li>
            ))}
          </ul>
        </motion.div>

        {/* Call to Action */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="text-center"
        >
          <p className="text-gray-300 mb-6">Ready to improve your Digital Health Score?</p>
          <button className="gradient-btn px-8 py-3 rounded-lg">
            Book Free Consultation
          </button>
        </motion.div>
      </div>
    </main>
  )
}
