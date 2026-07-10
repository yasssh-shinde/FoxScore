'use client'

import { useEffect, useState, useMemo } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { supabase } from '@/lib/supabase'
import { Lead, AuditResult } from '@/types'

type GroupedCheckItem = {
  icon: string
  title: string
  value: string | null
  status: 'pass' | 'fail' | 'warning'
  detail: string
  fix: string
}

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
        console.error('Error fetching audit report:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [leadId])

  const reportData = useMemo(() => {
    if (!audit?.audit_data) return null

    const data = audit.audit_data
    const priorityActions = (data as any).priorityActions || []

    // Map 4 raw arrays to structured components
    const websiteItems = data.website || []
    const seoItems = data.seo || []
    const googleItems = data.google || []
    const socialItems = data.social || []

    const getStatusIcon = (status: string) => {
      if (status === 'pass') return '✅'
      if (status === 'warning') return '⚠️'
      return '❌'
    }

    const mapToGrouped = (items: any[]): GroupedCheckItem[] => {
      return items.map((item) => {
        // Find fix from priorityActions if exists
        const matchedAction = priorityActions.find((a: any) => a.title === item.metric)
        let fix = matchedAction?.fix || ''
        if (!fix) {
          if (item.metric === 'Title Tag') fix = 'Add a title tag with 50-60 characters and keywords.'
          if (item.metric === 'Meta Description') fix = 'Add a meta description (120-160 chars) explaining the page topic.'
          if (item.metric === 'H1 Heading') fix = 'Ensure there is exactly one H1 tag with your target keywords.'
          if (item.metric === 'SSL / HTTPS') fix = 'Install a valid SSL certificate and force HTTPS connections.'
          if (item.metric === 'Mobile Viewport') fix = 'Include viewport configuration metadata in the document head.'
          if (item.metric === 'Image Alt Tags') fix = 'Configure alt descriptions on all visual elements.'
        }

        return {
          icon: getStatusIcon(item.status),
          title: item.metric,
          value: item.value || null,
          status: item.status,
          detail: item.description,
          fix: item.status !== 'pass' ? fix : '',
        }
      })
    }

    const groups = {
      'Website Speed & Performance': mapToGrouped(websiteItems),
      'On-Page SEO': mapToGrouped(seoItems),
      'Google Presence & Accessibility': mapToGrouped(googleItems),
      'Security & Protocols': mapToGrouped(socialItems),
    }

    // Category scores
    const categoryScores = [
      { name: 'Website Speed', score: Math.round(Number(audit.website_score)), key: 'website' },
      { name: 'On-Page SEO', score: Math.round(Number(audit.seo_score)), key: 'seo' },
      { name: 'Google Presence', score: Math.round(Number(audit.google_score)), key: 'google' },
      { name: 'Social & Security', score: Math.round(Number(audit.social_score)), key: 'social' },
    ]

    // Count statistics
    const allItems = [...websiteItems, ...seoItems, ...googleItems, ...socialItems]
    const pass = allItems.filter(i => i.status === 'pass').length
    const warn = allItems.filter(i => i.status === 'warning').length
    const fail = allItems.filter(i => i.status === 'fail').length

    return {
      groups,
      categoryScores,
      priorityActions,
      pass,
      warn,
      fail,
      overallScore: Math.round(Number(audit.overall_score)),
    }
  }, [audit])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="text-center">
          <div className="inline-block animate-spin w-12 h-12 border-4 border-white/20 border-t-[#FF6B35] rounded-full mb-4"></div>
          <p className="text-gray-400">Loading audit report...</p>
        </div>
      </div>
    )
  }

  if (!lead || !audit || !reportData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="text-center">
          <p className="text-red-400 mb-4 font-bold text-lg">Report not found</p>
          <button
            onClick={() => router.push('/')}
            className="px-6 py-2 rounded-lg bg-gradient-to-r from-[#FF6B35] to-[#FF8C42] text-white font-bold"
          >
            Go Home
          </button>
        </div>
      </div>
    )
  }

  const { groups, categoryScores, priorityActions, pass, warn, fail, overallScore } = reportData

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-500'
    if (score >= 55) return 'text-yellow-500'
    return 'text-red-500'
  }

  const getScoreStroke = (score: number) => {
    if (score >= 80) return '#22c55e'
    if (score >= 55) return '#eab308'
    return '#ef4444'
  }

  const getCategoryIcon = (name: string) => {
    switch (name) {
      case 'Website Speed':
      case 'Website Speed & Performance':
        return (
          <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        )
      case 'On-Page SEO':
        return (
          <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        )
      case 'Google Presence':
      case 'Google Presence & Accessibility':
        return (
          <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
        )
      case 'Social & Security':
      case 'Security & Protocols':
        return (
          <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 10.742l-2.084 1.157M8.684 12.738l2.085-1.157m1.117-2.924A2.5 2.5 0 1111 8a2.5 2.5 0 01-1.117-1.157zm0 9.848a2.5 2.5 0 111.117-4.829 2.5 2.5 0 01-1.117 4.829z" />
          </svg>
        )
      default:
        return (
          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
        )
    }
  }

  const getStatusBadge = (status: 'pass' | 'fail' | 'warning') => {
    switch (status) {
      case 'pass':
        return <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-green-500/10 text-green-400 border border-green-500/20">Passed</span>
      case 'fail':
        return <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-red-500/10 text-red-400 border border-red-500/20">Failed</span>
      case 'warning':
        return <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-yellow-500/10 text-yellow-400 border border-yellow-500/20">Warning</span>
    }
  }

  return (
    <main className="min-h-screen py-12 md:py-20 px-4 md:px-6 bg-[#0B0F19] text-gray-100 relative overflow-hidden selection:bg-[#FF6B35] selection:text-white">
      {/* Background decorative glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-[#FF6B35]/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-blue-500/5 blur-[120px] pointer-events-none" />

      <div className="max-w-4xl mx-auto relative z-10">
        
        {/* Navigation & Header Info */}
        <div className="mb-8 flex justify-between items-center print:hidden">
          <button
            onClick={() => router.back()}
            className="text-gray-400 hover:text-white transition-colors duration-200 text-sm font-semibold flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back
          </button>
          <div>
            <button
              onClick={() => window.print()}
              className="px-4 py-2 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20 text-sm transition-all duration-200 flex items-center gap-2 font-semibold text-white shadow-sm"
            >
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
              </svg>
              <span>Print Report</span>
            </button>
          </div>
        </div>

        {/* Lead Company Details Card */}
        <div className="glass-card mb-8 border border-white/10 rounded-2xl p-6 md:p-8 bg-white/[0.03] backdrop-blur-md relative overflow-hidden shadow-md">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-[#FF6B35]/10 to-transparent rounded-bl-full pointer-events-none" />
          <h1 className="text-3xl md:text-4xl font-extrabold text-white mb-2 tracking-tight">{lead.company_name}</h1>
          <a 
            href={lead.website_url.startsWith('http') ? lead.website_url : `https://${lead.website_url}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#FF6B35] hover:text-[#FF8C42] font-semibold text-base md:text-lg mb-4 inline-flex items-center gap-1.5 transition-colors"
          >
            <span>{lead.website_url}</span>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>
          <div className="flex flex-wrap gap-x-6 gap-y-2 mt-2 text-xs md:text-sm text-gray-400">
            <span><strong className="text-gray-300">Audited For:</strong> {lead.full_name}</span>
            <span><strong className="text-gray-300">Reference ID:</strong> {lead.reference_id}</span>
          </div>
        </div>

        {/* Circular Overall Score Section */}
        <div className="glass-card mb-8 text-center py-10 border border-white/10 rounded-2xl bg-white/[0.03] backdrop-blur-md shadow-md">
          <h2 className="text-gray-400 text-xs uppercase tracking-widest font-semibold mb-6">Overall Digital Health Score</h2>
          <div className="relative w-44 h-44 mx-auto mb-6 filter drop-shadow-[0_0_15px_rgba(255,107,53,0.05)]">
            <svg className="absolute inset-0 w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="44"
                fill="none"
                stroke="rgba(255,255,255,0.04)"
                strokeWidth="5"
              />
              <motion.circle
                cx="50"
                cy="50"
                r="44"
                fill="none"
                stroke={getScoreStroke(overallScore)}
                strokeWidth="6"
                strokeDasharray="276.46"
                initial={{ strokeDashoffset: 276.46 }}
                animate={{ strokeDashoffset: 276.46 - (overallScore / 100) * 276.46 }}
                transition={{ duration: 1.5, ease: 'easeOut' }}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-5xl font-black tracking-tight text-white">{overallScore}</span>
              <span className="text-xs text-gray-400 font-semibold tracking-wider uppercase mt-1">Score</span>
              <span className="text-[10px] text-gray-500 mt-0.5">out of 100</span>
            </div>
          </div>

          <div className="text-xl font-bold mb-4 text-white px-4">
            {overallScore >= 85 ? '🏆 Excellent Digital Presence' : overallScore >= 70 ? '👍 Good — Room to Improve' : overallScore >= 50 ? '⚠️ Needs Work' : '🚨 Critical Action Required'}
          </div>

          {/* Quick Stats Pills */}
          <div className="flex justify-center gap-3 flex-wrap px-4">
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-500/10 text-green-400 border border-green-500/20">
              ✅ {pass} Passed
            </span>
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-yellow-500/10 text-yellow-400 border border-yellow-500/20">
              ⚠️ {warn} Warnings
            </span>
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-red-500/10 text-red-400 border border-red-500/20">
              ❌ {fail} Failed
            </span>
          </div>
        </div>

        {/* Priority Actions */}
        {priorityActions.length > 0 && (
          <div className="glass-card mb-8 border border-red-500/20 rounded-2xl p-6 bg-gradient-to-b from-red-500/5 to-transparent shadow-sm">
            <h3 className="text-red-400 font-extrabold text-sm uppercase tracking-wider mb-4 flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <span>Top Priority Actions ({priorityActions.length})</span>
            </h3>
            <div className="space-y-3.5">
              {priorityActions.map((action: any, idx: number) => (
                <div key={idx} className="flex gap-3 items-start text-sm bg-white/[0.02] border border-white/5 p-3 rounded-xl">
                  <div className="w-5 h-5 rounded-lg bg-red-500/15 text-red-400 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5 border border-red-500/10">
                    {idx + 1}
                  </div>
                  <div className="text-gray-300">
                    <strong className="text-white block mb-0.5">{action.title}</strong>
                    <span className="text-xs text-gray-400 block mb-1">{action.detail}</span>
                    <span className="text-xs text-[#FF8C42] font-medium flex items-center gap-1">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 5l7 7m0 0l-7 7m7-7H3" />
                      </svg>
                      <span>Fix: {action.fix}</span>
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Category Scores */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {categoryScores.map((cat, idx) => (
            <div 
              key={idx} 
              className="glass-card flex items-center gap-4 p-4 border border-white/10 rounded-2xl bg-white/[0.02] hover:scale-[1.02] transition-transform duration-300 shadow-sm"
            >
              <div className="p-3 bg-white/5 rounded-xl">
                {getCategoryIcon(cat.name)}
              </div>
              <div>
                <div className={`text-2xl font-black ${getScoreColor(cat.score)} tracking-tight`}>
                  {cat.score}%
                </div>
                <div className="text-[10px] text-gray-400 uppercase tracking-widest font-semibold">{cat.name}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Detailed Audit breakdown grouped */}
        <div className="space-y-6 mb-12">
          {Object.entries(groups).map(([groupName, items], idx) => (
            <div key={idx} className="glass-card border border-white/10 rounded-2xl p-6 bg-white/[0.03] shadow-md">
              <div className="flex justify-between items-center mb-6 pb-4 border-b border-white/10">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white/5 rounded-lg">
                    {getCategoryIcon(groupName)}
                  </div>
                  <h3 className="text-base font-bold text-white uppercase tracking-wider">{groupName}</h3>
                </div>
                <span className="text-xs text-gray-500 font-semibold px-2 py-1 bg-white/5 rounded-lg border border-white/5">{items.length} Checks</span>
              </div>

              <div className="space-y-4">
                {items.map((item, itemIdx) => (
                  <div key={itemIdx} className="flex items-start gap-4 pb-4 border-b border-white/5 last:border-0 last:pb-0">
                    <span className="text-lg shrink-0 mt-1">{item.icon}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="font-bold text-white text-sm">{item.title}</h4>
                        {item.value && (
                          <span className="px-2 py-0.5 rounded bg-white/5 border border-white/10 text-[10px] text-gray-400 font-mono truncate max-w-[200px]" title={item.value}>
                            {item.value}
                          </span>
                        )}
                        {getStatusBadge(item.status)}
                      </div>
                      <p className="text-xs text-gray-400 mt-1.5 leading-relaxed">{item.detail}</p>
                      {item.fix && (
                        <p className="text-xs text-[#FF8C42] mt-2 font-medium flex items-start gap-1 bg-[#FF6B35]/5 border border-[#FF6B35]/10 p-2 rounded-lg">
                          <span className="font-bold text-[#FF6B35] uppercase tracking-wider text-[9px] mt-0.5 bg-[#FF6B35]/10 px-1 py-0.5 rounded">Action</span>
                          <span>{item.fix}</span>
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Final CTA */}
        <div className="glass-card text-center py-10 px-6 border border-[#FF6B35]/20 rounded-2xl bg-gradient-to-b from-[#FF6B35]/5 to-transparent print:hidden shadow-inner">
          <h3 className="text-2xl font-black text-white mb-2 tracking-tight">Ready to fix these issues?</h3>
          <p className="text-sm text-gray-400 max-w-md mx-auto mb-6">
            Get a professional audit and expert consultation to rank your website higher and drive more organic business leads.
          </p>
          <button
            onClick={() => router.push('/contact')}
            className="px-8 py-3.5 rounded-xl bg-gradient-to-r from-[#FF6B35] to-[#FF8C42] hover:from-[#FF8C42] hover:to-[#FFA550] text-white font-extrabold shadow-lg hover:shadow-[#FF6B35]/20 transition-all duration-300 hover:scale-[1.02]"
          >
            Book a Free Consultation
          </button>
        </div>

      </div>
    </main>
  )
}
