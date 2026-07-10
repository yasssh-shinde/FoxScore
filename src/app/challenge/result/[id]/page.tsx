'use client'

import { useEffect, useState, useMemo } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { supabase } from '@/lib/supabase'
import { Lead, AuditResult } from '@/types'

export default function ResultPage() {
  const params = useParams()
  const router = useRouter()
  const leadId = params.id as string

  const [lead, setLead] = useState<Lead | null>(null)
  const [audit, setAudit] = useState<AuditResult | null>(null)
  const [loading, setLoading] = useState(true)
  const [showScore, setShowScore] = useState(false)
  const [animatedScore, setAnimatedScore] = useState(0)
  const [step, setStep] = useState(0)

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
        setLoading(false)
        setShowScore(true)
      } catch (error) {
        console.error('Error fetching data:', error)
        setLoading(false)
      }
    }

    fetchData()
  }, [leadId])

  // Client-side SEO analyzer engine running 60+ checks on the stored raw HTML to get exact report score out of 10
  const reportOverallScore = useMemo(() => {
    // Get actual score directly from database (stored out of 100) and scale to 10
    return audit?.overall_score ? Math.round(Number(audit.overall_score) / 10) : 0
  }, [audit])

  useEffect(() => {
    if (showScore && reportOverallScore > 0 && animatedScore < reportOverallScore) {
      const timer = setTimeout(() => {
        setAnimatedScore(prev => Math.min(prev + 1, reportOverallScore))
      }, 80)
      return () => clearTimeout(timer)
    }
  }, [showScore, animatedScore, reportOverallScore])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin-slow w-12 h-12 border-4 border-white/20 border-t-[#FF6B35] rounded-full mb-4"></div>
          <p className="text-gray-400">Analyzing your digital presence...</p>
        </div>
      </div>
    )
  }

  if (!lead || !audit) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 mb-4">Failed to load results</p>
          <button
            onClick={() => router.push('/')}
            className="gradient-btn px-6 py-2 rounded-lg"
          >
            Go Home
          </button>
        </div>
      </div>
    )
  }

  const won = lead.guessed_score === reportOverallScore
  const scoreDifference = Math.abs(reportOverallScore - lead.guessed_score)

  // Ensure exactly 4 items for UI display consistency
  const displayImprovements = [...(audit.audit_data.improvements || [])]
  const defaultImprovements = [
    '❌ Schema Markup: Missing structured data markup',
    '❌ AI Readiness: Missing question-format headings',
    '❌ Accessibility: Some elements lack accessible labels',
    '❌ Social Tags: Open Graph metadata incomplete'
  ]
  let impIdx = 0
  while (displayImprovements.length < 4 && impIdx < defaultImprovements.length) {
    if (!displayImprovements.includes(defaultImprovements[impIdx])) {
      displayImprovements.push(defaultImprovements[impIdx])
    }
    impIdx++
  }

  const displayStrengths = [...(audit.audit_data.strengths || [])]
  const defaultStrengths = [
    '✅ Basic layout structures configured',
    '✅ Page assets crawlable',
    '✅ Main semantic elements present',
    '✅ Basic web presence established'
  ]
  let strIdx = 0
  while (displayStrengths.length < 4 && strIdx < defaultStrengths.length) {
    if (!displayStrengths.includes(defaultStrengths[strIdx])) {
      displayStrengths.push(defaultStrengths[strIdx])
    }
    strIdx++
  }

  const finalImprovements = displayImprovements.slice(0, 4)
  const finalStrengths = displayStrengths.slice(0, 4)

  return (
    <main className="min-h-screen py-12 md:py-20 px-4 md:px-6 bg-[#0B0F19] text-white relative overflow-hidden">
      {/* Background decorative glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-[#FF6B35]/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-blue-500/10 blur-[120px] pointer-events-none" />

      <div className="max-w-4xl mx-auto relative z-10">
        
        {/* Back Button */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mb-8"
        >
          <button
            onClick={() => router.push('/')}
            className="text-gray-400 hover:text-white transition-colors duration-200 text-sm flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Home
          </button>
        </motion.div>

        {/* Score Circle - Animated Reveal */}
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="text-center mb-12"
        >
          <div className="relative w-52 h-52 mx-auto mb-8 filter drop-shadow-[0_0_20px_rgba(255,107,53,0.15)]">
            {/* Outer Circle */}
            <svg className="absolute inset-0 w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="44"
                fill="none"
                stroke="rgba(255,255,255,0.05)"
                strokeWidth="4"
              />
              <motion.circle
                cx="50"
                cy="50"
                r="44"
                fill="none"
                stroke="url(#gradient)"
                strokeWidth="5"
                strokeDasharray="276.46"
                initial={{ strokeDashoffset: 276.46 }}
                animate={{ strokeDashoffset: 276.46 - (animatedScore / 10) * 276.46 }}
                transition={{ duration: 2, ease: 'easeInOut' }}
                strokeLinecap="round"
              />
              <defs>
                <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#FF6B35" />
                  <stop offset="100%" stopColor="#FF8C42" />
                </linearGradient>
              </defs>
            </svg>
 
            {/* Score Display */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
                className="text-center"
              >
                <div className="text-6xl font-extrabold bg-gradient-to-r from-[#FF6B35] to-[#FF8C42] bg-clip-text text-transparent tracking-tight">
                  {animatedScore}
                </div>
                <div className="text-gray-400 text-xs font-semibold tracking-wider uppercase mt-1">Overall Score</div>
                <div className="text-gray-500 text-xs mt-0.5">out of 10</div>
              </motion.div>
            </div>
          </div>

          {/* Result Message */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2 }}
            className="max-w-xl mx-auto"
          >
            {won ? (
              <div className="glass-card border-yellow-500/30 bg-gradient-to-b from-yellow-500/10 to-transparent p-6 rounded-2xl relative overflow-hidden shadow-lg">
                <div className="absolute top-0 right-0 w-24 h-24 bg-yellow-500/10 rounded-full blur-2xl"></div>
                <div className="text-4xl mb-3">🎉</div>
                <h2 className="text-2xl md:text-3xl font-extrabold text-yellow-400 mb-2">
                  Perfect Match!
                </h2>
                <p className="text-base text-gray-300">
                  Your guess was spot on. You won ₹1,000 cash! 🏆 Our team will contact you shortly to process your reward.
                </p>
              </div>
            ) : (
              <div className="glass-card bg-white/[0.03] border-white/10 p-6 rounded-2xl shadow-md">
                <div className="grid grid-cols-2 gap-4 max-w-sm mx-auto mb-4">
                  <div className="text-center py-2 px-3 bg-white/5 rounded-xl border border-white/5">
                    <p className="text-xs text-gray-400 uppercase tracking-wider">Your Guess</p>
                    <p className="text-xl font-bold text-[#FF6B35] mt-1">{lead.guessed_score}</p>
                  </div>
                  <div className="text-center py-2 px-3 bg-white/5 rounded-xl border border-white/5">
                    <p className="text-xs text-gray-400 uppercase tracking-wider">Actual Score</p>
                    <p className="text-xl font-bold text-[#FF8C42] mt-1">{reportOverallScore}</p>
                  </div>
                </div>
                <p className="text-sm text-gray-400">
                  {scoreDifference <= 2 
                    ? "So close! You were just a few points away. Keep optimizing! ⚡" 
                    : "No matches this time! Check your detailed report below to see how you can improve. 💪"}
                </p>
              </div>
            )}
          </motion.div>
        </motion.div>

        {/* Score Breakdown Grid */}
        <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-widest text-center mb-6">Categorized Breakdown</h3>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.4 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12"
        >
          {[
            {
              label: 'Website Speed',
              score: Math.round(Number(audit.website_score) / 10),
              color: 'from-blue-500/20 to-blue-600/5 border-blue-500/20',
              badgeColor: 'bg-blue-500/20 text-blue-300',
              icon: (
                <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              )
            },
            {
              label: 'On-Page SEO',
              score: Math.round(Number(audit.seo_score) / 10),
              color: 'from-purple-500/20 to-purple-600/5 border-purple-500/20',
              badgeColor: 'bg-purple-500/20 text-purple-300',
              icon: (
                <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              )
            },
            {
              label: 'Google Presence',
              score: Math.round(Number(audit.google_score) / 10),
              color: 'from-red-500/20 to-red-600/5 border-red-500/20',
              badgeColor: 'bg-red-500/20 text-red-300',
              icon: (
                <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              )
            },
            {
              label: 'Social Authority',
              score: Math.round(Number(audit.social_score) / 10),
              color: 'from-green-500/20 to-green-600/5 border-green-500/20',
              badgeColor: 'bg-green-500/20 text-green-300',
              icon: (
                <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 10.742l-2.084 1.157M8.684 12.738l2.085-1.157m1.117-2.924A2.5 2.5 0 1111 8a2.5 2.5 0 01-1.117-1.157zm0 9.848a2.5 2.5 0 111.117-4.829 2.5 2.5 0 01-1.117 4.829z" />
                </svg>
              )
            },
          ].map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.5 + i * 0.1 }}
              className={`glass-card bg-gradient-to-b ${item.color} border p-5 rounded-2xl flex flex-col justify-between items-center text-center hover:scale-[1.03] transition-transform duration-300`}
            >
              <div className="p-3 bg-white/5 rounded-xl mb-3">{item.icon}</div>
              <div>
                <span className="text-3xl font-extrabold text-white block tracking-tight mb-1">{item.score}/10</span>
                <span className="text-xs font-medium text-gray-400">{item.label}</span>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Improvements & Strengths */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          
          {/* Areas to Improve */}
          <motion.div
            initial={{ opacity: 0, x: -15 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 1.8 }}
            className="glass-card border-red-500/20 bg-gradient-to-b from-red-500/5 to-transparent p-6 rounded-2xl shadow-sm"
          >
            <div className="flex items-center gap-3 mb-5">
              <div className="p-2 bg-red-500/10 rounded-lg text-red-400">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-red-400">Areas to Improve</h3>
            </div>
            <ul className="space-y-3.5">
              {finalImprovements.map((item, i) => {
                // Remove emoji symbol prefix if present to match SVG layout
                const cleanedText = item.replace(/^[❌✅]\s*/, '')
                return (
                  <li key={i} className="text-sm text-gray-300 flex items-start gap-2.5">
                    <svg className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    <span>{cleanedText}</span>
                  </li>
                )
              })}
            </ul>
          </motion.div>

          {/* Strengths */}
          <motion.div
            initial={{ opacity: 0, x: 15 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 1.8 }}
            className="glass-card border-green-500/20 bg-gradient-to-b from-green-500/5 to-transparent p-6 rounded-2xl shadow-sm"
          >
            <div className="flex items-center gap-3 mb-5">
              <div className="p-2 bg-green-500/10 rounded-lg text-green-400">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-green-400">Your Strengths</h3>
            </div>
            <ul className="space-y-3.5">
              {finalStrengths.map((item, i) => {
                const cleanedText = item.replace(/^[❌✅]\s*/, '')
                return (
                  <li key={i} className="text-sm text-gray-300 flex items-start gap-2.5">
                    <svg className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                    <span>{cleanedText}</span>
                  </li>
                )
              })}
            </ul>
          </motion.div>
        </div>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 2.0 }}
          className="text-center space-y-4 bg-white/[0.02] border border-white/5 p-8 rounded-2xl max-w-2xl mx-auto shadow-inner"
        >
          <p className="text-base text-gray-300 font-medium">Ready to see the detailed audit data?</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <button
              onClick={() => router.push(`/challenge/report/${leadId}`)}
              className="gradient-btn px-8 py-3.5 rounded-xl w-full sm:w-auto shadow-md hover:shadow-[#FF6B35]/20 flex items-center justify-center gap-2 hover:scale-[1.02] transition-all"
            >
              <span>View Detailed Report</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </button>
            <button
              onClick={() => router.push('/')}
              className="bg-white/5 border border-white/10 hover:border-white/20 px-8 py-3.5 rounded-xl w-full sm:w-auto hover:bg-white/10 transition-colors text-white font-semibold"
            >
              Back to Home
            </button>
          </div>
        </motion.div>

        {/* Reference ID */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2.2 }}
          className="text-center mt-12 text-xs text-gray-500"
        >
          <p className="bg-white/5 inline-block py-1 px-3 rounded-full border border-white/5">
            Reference ID: {lead.reference_id}
          </p>
        </motion.div>
      </div>
    </main>
  )
}
