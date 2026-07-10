'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Lead, AuditResult } from '@/types'

export default function ResultPage() {
  const params = useParams()
  const router = useRouter()
  const leadId = params.id as string

  const [lead, setLead] = useState<Lead | null>(null)
  const [audit, setAudit] = useState<AuditResult | null>(null)
  const [loading, setLoading] = useState(true)
  const [auditFinished, setAuditFinished] = useState(false)
  const [animatedScore, setAnimatedScore] = useState(0)
  const [progressPercent, setProgressPercent] = useState(0)
  const [statusMessage, setStatusMessage] = useState('Connecting to website...')
  const [showFirecrackers, setShowFirecrackers] = useState(false)

  useEffect(() => {
    let pollInterval: NodeJS.Timeout
    let progressInterval: NodeJS.Timeout

    // Simulate progress bar increments while waiting
    progressInterval = setInterval(() => {
      setProgressPercent((prev) => {
        if (prev < 30) {
          setStatusMessage('Initiating crawler connection...')
          return prev + 5
        }
        if (prev < 60) {
          setStatusMessage('Parsing HTML structure & tags...')
          return prev + 3
        }
        if (prev < 90) {
          setStatusMessage('Analyzing SEO & accessibility guidelines...')
          return prev + 1
        }
        return prev
      })
    }, 400)

    const checkAuditStatus = async () => {
      try {
        const res = await fetch(`/api/leads/${leadId}/status`)
        if (!res.ok) throw new Error('Status check failed')
        const data = await res.json()

        if (data.finished && data.audit) {
          clearInterval(pollInterval)
          clearInterval(progressInterval)
          setProgressPercent(100)
          setStatusMessage('Audit completed successfully!')
          setLead(data.lead)
          setAudit(data.audit)
          setAuditFinished(true)
          setLoading(false)

          // Check if guess matches actual score (perfect match!)
          const actualScoreOn10 = Math.round(Number(data.audit.overall_score) / 10)
          if (data.lead.guessed_score === actualScoreOn10) {
            setShowFirecrackers(true)
          }
        } else if (data.finished && !data.audit) {
          // Audit is done but data still loading, retry in 500ms
          setTimeout(() => checkAuditStatus(), 500)
        }
      } catch (error) {
        console.error('Error checking audit status:', error)
      }
    }

    // Initial check
    checkAuditStatus()

    // Poll status every 2 seconds
    pollInterval = setInterval(checkAuditStatus, 2000)

    return () => {
      clearInterval(pollInterval)
      clearInterval(progressInterval)
    }
  }, [leadId])

  // Animate Overall Score
  useEffect(() => {
    if (auditFinished && audit?.overall_score) {
      const targetScore = Math.round(Number(audit.overall_score))
      if (animatedScore < targetScore) {
        const timer = setTimeout(() => {
          setAnimatedScore(prev => Math.min(prev + 1, targetScore))
        }, 20)
        return () => clearTimeout(timer)
      }
    }
  }, [auditFinished, animatedScore, audit?.overall_score])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0B0F19] text-white">
        <div className="text-center max-w-md w-full px-6">
          <div className="inline-block animate-spin w-12 h-12 border-4 border-white/10 border-t-[#FF6B35] rounded-full mb-6"></div>
          <h2 className="text-xl font-bold mb-2">Analyzing your digital presence...</h2>
          <p className="text-gray-400 text-sm mb-6">{statusMessage}</p>
          
          {/* Progress Bar */}
          <div className="w-full bg-white/5 rounded-full h-2 mb-4 overflow-hidden border border-white/5">
            <motion.div 
              className="bg-gradient-to-r from-[#FF6B35] to-[#FF8C42] h-full"
              initial={{ width: '0%' }}
              animate={{ width: `${progressPercent}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
          <span className="text-xs text-gray-500 font-semibold uppercase tracking-wider">{progressPercent}% Completed</span>
        </div>
      </div>
    )
  }

  if (!lead || !audit) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0B0F19] text-white">
        <div className="text-center">
          <p className="text-red-400 mb-4 font-semibold">Failed to load audit results</p>
          <button
            onClick={() => router.push('/')}
            className="gradient-btn px-6 py-2 rounded-lg font-bold"
          >
            Go Home
          </button>
        </div>
      </div>
    )
  }

  const won = lead.won_prize
  const scoreDiff = Math.abs(lead.guessed_score - Math.round(audit.overall_score / 10))

  const finalImprovements = audit.audit_data?.improvements?.slice(0, 4) || []
  const finalStrengths = audit.audit_data?.strengths?.slice(0, 4) || []

  return (
    <main className="min-h-screen py-12 md:py-20 px-4 md:px-6 bg-[#0B0F19] text-white relative overflow-hidden">
      {/* Firecracker celebration effect */}
      {showFirecrackers && (
        <>
          <style>{`
            @keyframes firecracker-burst {
              0% { transform: translate(0, 0); opacity: 1; }
              100% { transform: translate(var(--tx), var(--ty)); opacity: 0; }
            }
            .firecracker { animation: firecracker-burst 1s ease-out forwards; }
          `}</style>
          {[...Array(30)].map((_, i) => {
            const angle = (i / 30) * Math.PI * 2
            const distance = 150
            const tx = Math.cos(angle) * distance
            const ty = Math.sin(angle) * distance
            return (
              <div
                key={i}
                className="firecracker fixed w-2 h-2 rounded-full pointer-events-none"
                style={{
                  left: '50%',
                  top: '50%',
                  '--tx': `${tx}px`,
                  '--ty': `${ty}px`,
                  backgroundColor: ['#FF6B35', '#FF8C42', '#FFD700', '#00FF00', '#FF1493'][i % 5],
                } as React.CSSProperties}
              />
            )
          })}
        </>
      )}

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
                animate={{ strokeDashoffset: 276.46 - (animatedScore / 100) * 276.46 }}
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
                <div className="text-6xl font-black bg-gradient-to-r from-[#FF6B35] to-[#FF8C42] bg-clip-text text-transparent tracking-tight">
                  {Math.round(animatedScore / 10)}
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
                  Perfect Match! (Within ±2 Tolerance)
                </h2>
                <p className="text-base text-gray-300">
                  Congratulations! You guessed the exact score! You qualify to win cash! 🏆
                  <span className="block mt-2 font-semibold text-yellow-500/90 text-sm">Reward Status: Pending Admin Verification</span>
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
                    <p className="text-xl font-bold text-[#FF8C42] mt-1">{Math.round(audit.overall_score / 10)}</p>
                  </div>
                </div>
                <p className="text-sm text-gray-400">
                  {scoreDiff <= 1 
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
              score: Math.round(Number(audit.website_score)),
              color: 'from-blue-500/20 to-blue-600/5 border-blue-500/20',
              icon: (
                <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              )
            },
            {
              label: 'On-Page SEO',
              score: Math.round(Number(audit.seo_score)),
              color: 'from-purple-500/20 to-purple-600/5 border-purple-500/20',
              icon: (
                <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              )
            },
            {
              label: 'Google Presence',
              score: Math.round(Number(audit.google_score)),
              color: 'from-red-500/20 to-red-600/5 border-red-500/20',
              icon: (
                <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              )
            },
            {
              label: 'Social & Security',
              score: Math.round(Number(audit.social_score)),
              color: 'from-green-500/20 to-green-600/5 border-green-500/20',
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
                <span className="text-3xl font-extrabold text-white block tracking-tight mb-1">{item.score}/100</span>
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
              {finalImprovements.length > 0 ? finalImprovements.map((item, i) => {
                const cleanedText = item.replace(/^[❌⚠️]\s*/, '')
                return (
                  <li key={i} className="text-sm text-gray-300 flex items-start gap-2.5">
                    <svg className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    <span>{cleanedText}</span>
                  </li>
                )
              }) : (
                <li className="text-sm text-gray-400 italic">No critical improvements needed! Keep up the good work.</li>
              )}
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
              {finalStrengths.length > 0 ? finalStrengths.map((item, i) => {
                const cleanedText = item.replace(/^[✅✨]\s*/, '')
                return (
                  <li key={i} className="text-sm text-gray-300 flex items-start gap-2.5">
                    <svg className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                    <span>{cleanedText}</span>
                  </li>
                )
              }) : (
                <li className="text-sm text-gray-400 italic">Evaluating page structure strengths...</li>
              )}
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
