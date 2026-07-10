'use client'

import { useEffect, useState } from 'react'
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

  useEffect(() => {
    if (showScore && audit && animatedScore < audit.overall_score) {
      const timer = setTimeout(() => {
        setAnimatedScore(prev => Math.min(prev + 2, audit.overall_score))
      }, 20)
      return () => clearTimeout(timer)
    }
  }, [showScore, animatedScore, audit])

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

  const won = lead.won_prize
  const scoreDifference = Math.abs(lead.actual_score! - lead.guessed_score)

  return (
    <main className="min-h-screen py-20 px-6">
      <div className="max-w-3xl mx-auto">
        {/* Score Circle - Animated Reveal */}
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="text-center mb-16"
        >
          <div className="relative w-48 h-48 mx-auto mb-8">
            {/* Outer Circle */}
            <svg className="absolute inset-0 w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="45"
                fill="none"
                stroke="rgba(255,255,255,0.1)"
                strokeWidth="2"
              />
              <motion.circle
                cx="50"
                cy="50"
                r="45"
                fill="none"
                stroke="url(#gradient)"
                strokeWidth="3"
                strokeDasharray="282.7"
                initial={{ strokeDashoffset: 282.7 }}
                animate={{ strokeDashoffset: 282.7 - (animatedScore / 100) * 282.7 }}
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
                <div className="text-6xl font-bold bg-gradient-to-r from-[#FF6B35] to-[#FF8C42] bg-clip-text text-transparent">
                  {animatedScore}
                </div>
                <div className="text-gray-400 text-sm">/ 10</div>
              </motion.div>
            </div>
          </div>

          {/* Result Message */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2 }}
          >
            {won ? (
              <div className="glass-card border-[#FFD700]/30 mb-8">
                <div className="text-4xl mb-3">🎉</div>
                <h2 className="text-3xl font-bold bg-gradient-to-r from-yellow-400 to-yellow-500 bg-clip-text text-transparent mb-2">
                  Congratulations!
                </h2>
                <p className="text-lg text-gray-300">
                  You guessed the exact score! You won ₹1,000 cash! 🏆
                </p>
              </div>
            ) : (
              <div className="glass-card mb-8">
                <p className="text-lg text-gray-300 mb-4">
                  Your Guess: <span className="text-[#FF6B35] font-bold">{lead.guessed_score}</span>
                  <br />
                  Actual Score: <span className="text-[#FF8C42] font-bold">{lead.actual_score}</span>
                </p>
                <p className="text-gray-400">Better luck next time! 💪</p>
              </div>
            )}
          </motion.div>
        </motion.div>

        {/* Score Breakdown */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.4 }}
          className="grid grid-cols-4 gap-4 mb-12"
        >
          {[
            { label: 'Website', score: audit.website_score, color: 'from-blue-500' },
            { label: 'SEO', score: audit.seo_score, color: 'from-purple-500' },
            { label: 'Google', score: audit.google_score, color: 'from-red-500' },
            { label: 'Social', score: audit.social_score, color: 'from-green-500' },
          ].map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 1.5 + i * 0.1 }}
              className="glass-card text-center"
            >
              <div className={`text-3xl font-bold bg-gradient-to-r ${item.color} to-white bg-clip-text text-transparent mb-1`}>
                {item.score}
              </div>
              <div className="text-xs text-gray-400">{item.label}</div>
            </motion.div>
          ))}
        </motion.div>

        {/* Improvements & Strengths */}
        <div className="grid grid-cols-2 gap-6 mb-12">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 1.8 }}
            className="glass-card border-red-500/20"
          >
            <h3 className="text-lg font-bold text-red-400 mb-4">Areas to Improve</h3>
            <ul className="space-y-2">
              {audit.audit_data.improvements.map((item, i) => (
                <li key={i} className="text-sm text-gray-300">{item}</li>
              ))}
            </ul>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 1.8 }}
            className="glass-card border-green-500/20"
          >
            <h3 className="text-lg font-bold text-green-400 mb-4">Your Strengths</h3>
            <ul className="space-y-2">
              {audit.audit_data.strengths.map((item, i) => (
                <li key={i} className="text-sm text-gray-300">{item}</li>
              ))}
            </ul>
          </motion.div>
        </div>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 2.0 }}
          className="text-center space-y-4"
        >
          <p className="text-gray-300 mb-4">Get a detailed report and recommendations</p>
          <div className="flex gap-4 justify-center">
            <button
              onClick={() => router.push(`/challenge/report/${leadId}`)}
              className="gradient-btn px-8 py-3 rounded-lg"
            >
              View Detailed Report
            </button>
            <button
              onClick={() => router.push('/')}
              className="bg-white/10 border border-white/20 hover:border-[#FF6B35]/50 px-8 py-3 rounded-lg transition text-white"
            >
              Back Home
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
          <p>Reference ID: {lead.reference_id}</p>
        </motion.div>
      </div>
    </main>
  )
}
