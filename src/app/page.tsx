'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'

export default function Home() {
  return (
    <main className="min-h-screen">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 backdrop-blur-sm border-b border-white/10">
        <div className="text-2xl font-bold bg-gradient-to-r from-[#FF6B35] to-[#FF8C42] bg-clip-text text-transparent">
          seofox.io
        </div>
        <nav className="flex gap-6 text-sm">
          <a href="#" className="hover:text-[#FF6B35] transition">Features</a>
          <a href="#" className="hover:text-[#FF6B35] transition">About</a>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="min-h-[calc(100vh-80px)] flex items-center justify-center px-6 py-20">
        <div className="max-w-3xl text-center">
          {/* Animated Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="inline-block mb-6 px-4 py-2 rounded-full bg-gradient-to-r from-[#FF6B35]/20 to-[#004E89]/20 border border-[#FF6B35]/30"
          >
            <span className="text-sm font-semibold text-[#FF6B35]">🚀 FREE Digital Audit</span>
          </motion.div>

          {/* Main Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-5xl md:text-7xl font-bold mb-6 leading-tight"
          >
            How Strong Is Your Business{' '}
            <span className="bg-gradient-to-r from-[#FF6B35] to-[#FF8C42] bg-clip-text text-transparent">
              Online?
            </span>
          </motion.h1>

          {/* Subheading */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-xl md:text-2xl text-gray-300 mb-8"
          >
            Get your FREE Digital Health Score in under 60 seconds.
          </motion.p>

          {/* Features Grid */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12"
          >
            {[
              { icon: '✔', text: 'SEO Audit' },
              { icon: '✔', text: 'Website Analysis' },
              { icon: '✔', text: 'Social Score' },
              { icon: '✔', text: 'Google Check' },
            ].map((item, i) => (
              <div key={i} className="glass-card text-sm">
                <div className="text-2xl mb-2">{item.icon}</div>
                <div className="text-gray-200">{item.text}</div>
              </div>
            ))}
          </motion.div>

          {/* Prize Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5 }}
            className="glass-card mb-12 border-[#FF6B35]/30"
          >
            <div className="mb-3">
              <div className="text-4xl font-bold bg-gradient-to-r from-yellow-400 to-yellow-500 bg-clip-text text-transparent">
                ₹1,000
              </div>
              <p className="text-gray-300">Guess your score correctly and WIN CASH!</p>
            </div>
          </motion.div>

          {/* CTA Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <Link
              href="/challenge"
              className="inline-block gradient-btn text-lg px-12 py-4 rounded-xl hover:shadow-2xl hover:shadow-[#FF6B35]/50 transition-all duration-300"
            >
              Start Challenge
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 py-6 text-center text-sm text-gray-400">
        <p>© 2026 SEOFox. All rights reserved.</p>
      </footer>
    </main>
  )
}
