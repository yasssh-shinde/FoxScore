'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'

export default function ContactPage() {
  const router = useRouter()
  const [formSubmitted, setFormSubmitted] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Mock submit
    setFormSubmitted(true)
  }

  return (
    <main className="min-h-screen py-20 px-6 bg-black text-gray-100 selection:bg-[#FF6B35] selection:text-white">
      <div className="max-w-5xl mx-auto">
        
        {/* Back Button */}
        <div className="mb-8 print:hidden">
          <button
            onClick={() => router.back()}
            className="text-gray-400 hover:text-white transition text-sm font-semibold flex items-center gap-1"
          >
            ← Back
          </button>
        </div>

        {/* Page Title */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-black bg-gradient-to-r from-[#FF6B35] to-[#FF8C42] bg-clip-text text-transparent mb-4">
            Get in Touch
          </h1>
          <p className="text-gray-400 max-w-lg mx-auto">
            Have questions about your Digital Health Score or want a professional optimization plan? Contact our team.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          
          {/* Contact Details & QR Code Section */}
          <div className="md:col-span-5 space-y-6">
            
            {/* QR Card */}
            <div className="glass-card border border-white/10 rounded-2xl p-6 bg-white/5 backdrop-blur-md text-center">
              <h3 className="text-lg font-bold text-white mb-2 uppercase tracking-wide">
                Scan to Connect
              </h3>
              <p className="text-xs text-gray-400 mb-6">
                Scan this QR code to quickly save our contact info or open direct chat.
              </p>

              {/* QR Image Container */}
              <div className="relative w-48 h-48 mx-auto p-4 rounded-xl border border-white/10 bg-white/5 flex items-center justify-center">
                {/* Fallback SVG / Styled Placeholder if QR not yet loaded */}
                <div className="absolute inset-0 flex flex-col items-center justify-center p-4">
                  {/* Styled Image tag for when user provides QR Code */}
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="/images/WhatsApp Image 2026-07-10 at 3.36.17 PM.jpeg"
                    alt="Contact QR Code"
                    className="w-full h-full object-contain rounded-lg"
                    onError={(e) => {
                      // Hide image if missing, showing default fallback SVG
                      e.currentTarget.style.display = 'none'
                      const fallback = document.getElementById('qr-fallback')
                      if (fallback) fallback.style.display = 'flex'
                    }}
                  />
                  
                  {/* Default Fallback SVG */}
                  <div
                    id="qr-fallback"
                    className="hidden w-full h-full flex-col items-center justify-center text-gray-500 gap-2"
                  >
                    <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <rect width="18" height="18" x="3" y="3" rx="2" />
                      <rect width="6" height="6" x="6" y="6" />
                      <rect width="6" height="6" x="12" y="12" />
                      <line x1="6" y1="12" x2="6.01" y2="12" strokeWidth="2.5" />
                      <line x1="12" y1="6" x2="12.01" y2="6" strokeWidth="2.5" />
                    </svg>
                    <span className="text-[10px] uppercase font-mono tracking-wider text-gray-400">
                      QR Code Placeholder
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Info Card */}
            <div className="glass-card border border-white/10 rounded-2xl p-6 bg-white/5 backdrop-blur-md space-y-6">
              <div>
                <h4 className="text-xs uppercase font-mono tracking-wider text-[#FF6B35] font-semibold mb-1">
                  Our Office
                </h4>
                <p className="text-sm text-gray-300">
                  Vartak Nagar, Thane West - 400606 India
                </p>
              </div>

              <div>
                <h4 className="text-xs uppercase font-mono tracking-wider text-[#FF6B35] font-semibold mb-1">
                  Call Us
                </h4>
                <p className="text-sm text-gray-300">
                  +91 8767532568
                </p>
              </div>

              <div>
                <h4 className="text-xs uppercase font-mono tracking-wider text-[#FF6B35] font-semibold mb-1">
                  Email Us
                </h4>
                <p className="text-sm text-gray-300">
                  contact@seofox.io
                </p>
              </div>

              <div>
                <h4 className="text-xs uppercase font-mono tracking-wider text-[#FF6B35] font-semibold mb-1">
                  Support Time
                </h4>
                <p className="text-sm text-gray-300">
                  09AM - 05PM Mon-Sat
                </p>
              </div>
            </div>

          </div>

          {/* Contact Form Card */}
          <div className="md:col-span-7">
            <div className="glass-card border border-white/10 rounded-2xl p-8 bg-white/5 backdrop-blur-md">
              {formSubmitted ? (
                <div className="text-center py-12">
                  <span className="text-4xl mb-4 block">🎉</span>
                  <h3 className="text-2xl font-bold text-white mb-2">Message Sent!</h3>
                  <p className="text-gray-400 text-sm max-w-sm mx-auto mb-6">
                    Thank you for reaching out. A growth engineer will review your request and contact you shortly.
                  </p>
                  <button
                    onClick={() => setFormSubmitted(false)}
                    className="px-6 py-2 rounded-lg border border-white/20 hover:border-[#FF6B35] text-sm transition"
                  >
                    Send Another Message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Full Name</label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-[#FF6B35]/50"
                      placeholder="e.g. Yash Shinde"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Email Address</label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-[#FF6B35]/50"
                      placeholder="you@company.com"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Subject</label>
                    <input
                      type="text"
                      required
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-[#FF6B35]/50"
                      placeholder="How can we help you?"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Message</label>
                    <textarea
                      required
                      rows={5}
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-[#FF6B35]/50 resize-none"
                      placeholder="Describe your project, website optimization queries, or consulting details..."
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-[#FF6B35] to-[#FF8C42] text-white font-extrabold shadow-lg hover:shadow-[#FF6B35]/20 transition"
                  >
                    Send Message
                  </button>
                </form>
              )}
            </div>
          </div>

        </div>

      </div>
    </main>
  )
}
