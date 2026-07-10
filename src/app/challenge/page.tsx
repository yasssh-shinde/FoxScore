'use client'

import { useState, useEffect, useRef } from 'react'
import { useForm } from 'react-hook-form'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { RegistrationFormData, TeamMember } from '@/types'

export default function Challenge() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [guessValue, setGuessValue] = useState(5)
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([])
  const [selectedTeamMember, setSelectedTeamMember] = useState('')
  const [selectedTeamMemberName, setSelectedTeamMemberName] = useState('')
  const [loadingTeam, setLoadingTeam] = useState(true)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const fetchTeamMembers = async () => {
      try {
        const res = await fetch('/api/team-members')
        if (!res.ok) throw new Error('Failed to fetch team members')
        const data = await res.json()

        // Ensure data is an array
        if (Array.isArray(data) && data.length > 0) {
          setTeamMembers(data)
          setSelectedTeamMember(data[0].id)
          setSelectedTeamMemberName(data[0].name)
        } else {
          // Fallback team members for development
          const fallbackMembers = [
            { id: 'yash-1', name: 'Yash', email: 'yash@seofox.io', role: 'admin', status: 'active' },
            { id: 'dnya-1', name: 'Dnya', email: 'dnya@seofox.io', role: 'manager', status: 'active' },
            { id: 'achyut-1', name: 'Achyut', email: 'achyut@seofox.io', role: 'manager', status: 'active' },
            { id: 'vaibhav-1', name: 'Vaibhav', email: 'vaibhav@seofox.io', role: 'manager', status: 'active' },
            { id: 'gargi-1', name: 'Gargi', email: 'gargi@seofox.io', role: 'manager', status: 'active' },
          ]
          setTeamMembers(fallbackMembers)
          setSelectedTeamMember(fallbackMembers[0].id)
          setSelectedTeamMemberName(fallbackMembers[0].name)
          console.log('Using fallback team members. Run migrations to add to database.')
        }
      } catch (error) {
        console.error('Failed to fetch team members:', error)
        // Fallback team members for development
        const fallbackMembers = [
          { id: 'yash-1', name: 'Yash', email: 'yash@seofox.io', role: 'admin', status: 'active' },
          { id: 'dnya-1', name: 'Dnya', email: 'dnya@seofox.io', role: 'manager', status: 'active' },
          { id: 'achyut-1', name: 'Achyut', email: 'achyut@seofox.io', role: 'manager', status: 'active' },
          { id: 'vaibhav-1', name: 'Vaibhav', email: 'vaibhav@seofox.io', role: 'manager', status: 'active' },
          { id: 'gargi-1', name: 'Gargi', email: 'gargi@seofox.io', role: 'manager', status: 'active' },
        ]
        setTeamMembers(fallbackMembers)
        setSelectedTeamMember(fallbackMembers[0].id)
        setSelectedTeamMemberName(fallbackMembers[0].name)
      } finally {
        setLoadingTeam(false)
      }
    }

    fetchTeamMembers()
  }, [])

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const { register, handleSubmit, formState: { errors }, watch } = useForm<RegistrationFormData>({
    defaultValues: {
      guessed_score: 5,
      terms_accepted: false,
    }
  })

  const onSubmit = async (data: RegistrationFormData) => {
    setIsLoading(true)
    try {
      let websiteUrl = data.website_url.trim()
      if (!websiteUrl.startsWith('http://') && !websiteUrl.startsWith('https://')) {
        websiteUrl = 'https://' + websiteUrl
      }

      const response = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          website_url: websiteUrl,
          guessed_score: guessValue,
          checked_by: selectedTeamMember,
        }),
      })

      if (!response.ok) throw new Error('Failed to submit')

      const { lead_id } = await response.json()

      // Auto-assign to selected team member
      if (selectedTeamMember) {
        try {
          await fetch('/api/lead-assignments', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              lead_id: lead_id,
              assigned_to: selectedTeamMember,
            }),
          })
        } catch (err) {
          console.error('Failed to assign lead:', err)
        }
      }

      router.push(`/challenge/result/${lead_id}`)
    } catch (error) {
      alert('Error submitting form. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <main className="min-h-screen py-12 md:py-20 px-4 md:px-6 bg-[#0B0F19] text-white relative overflow-hidden">
      {/* Background decorative glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-[#FF6B35]/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-15%] right-[-10%] w-[55%] h-[55%] rounded-full bg-blue-500/5 blur-[120px] pointer-events-none" />

      <div className="max-w-2xl mx-auto relative z-10">
        {/* Back Button */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mb-8"
        >
          <button
            onClick={() => router.back()}
            className="text-gray-400 hover:text-white transition-colors duration-200 text-sm flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            <span>Back</span>
          </button>
        </motion.div>

        {/* Form Container */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card bg-white/[0.02] border-white/10 rounded-2xl p-6 md:p-8 shadow-xl"
        >
          <h1 className="text-3xl md:text-4xl font-extrabold mb-2 bg-gradient-to-r from-[#FF6B35] to-[#FF8C42] bg-clip-text text-transparent tracking-tight">
            Digital Health Challenge
          </h1>
          <p className="text-gray-400 text-sm md:text-base mb-8">Fill in your details and guess your Digital Health Score</p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Name & Company */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-2">Full Name *</label>
                <input
                  {...register('full_name', { required: 'Name is required' })}
                  type="text"
                  className="w-full bg-white/[0.03] border border-white/10 hover:border-white/20 focus:border-[#FF6B35] focus:ring-1 focus:ring-[#FF6B35]/20 rounded-xl px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none transition-all duration-200 text-sm"
                  placeholder="Your name"
                />
                {errors.full_name && <p className="text-red-400 text-xs mt-1">{errors.full_name.message}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-2">Company *</label>
                <input
                  {...register('company_name', { required: 'Company is required' })}
                  type="text"
                  className="w-full bg-white/[0.03] border border-white/10 hover:border-white/20 focus:border-[#FF6B35] focus:ring-1 focus:ring-[#FF6B35]/20 rounded-xl px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none transition-all duration-200 text-sm"
                  placeholder="Your company"
                />
                {errors.company_name && <p className="text-red-400 text-xs mt-1">{errors.company_name.message}</p>}
              </div>
            </div>

            {/* Team Member Selection - Custom Dropdown */}
            <div>
              <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-2">👤 Who will check your score? *</label>
              {loadingTeam ? (
                <div className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-2.5 text-gray-500">Loading team members...</div>
              ) : !Array.isArray(teamMembers) || teamMembers.length === 0 ? (
                <div className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-2.5 text-gray-500">No team members available</div>
              ) : (
                <div ref={dropdownRef} className="relative">
                  {/* Dropdown Button */}
                  <button
                    type="button"
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    className="w-full bg-white/[0.03] border border-white/10 hover:border-white/20 focus:border-[#FF6B35] focus:ring-1 focus:ring-[#FF6B35]/20 rounded-xl px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none transition-all duration-200 text-sm flex items-center justify-between"
                  >
                    <span>{selectedTeamMemberName || 'Select a team member...'}</span>
                    <svg className={`w-4 h-4 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                    </svg>
                  </button>

                  {/* Dropdown Menu */}
                  {dropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute z-50 w-full mt-2 bg-slate-800 border border-white/10 rounded-xl shadow-xl overflow-hidden"
                    >
                      {Array.isArray(teamMembers) && teamMembers.map((member) => {
                        const getColor = (name: string) => {
                          const colors: any = {
                            'Yash': '#FF6B35',
                            'Dnya': '#4F46E5',
                            'Achyut': '#10B981',
                            'Vaibhav': '#F59E0B',
                            'Gargi': '#EC4899',
                          }
                          return colors[name] || '#6B7280'
                        }

                        const isSelected = selectedTeamMember === member.id
                        const color = getColor(member.name)

                        return (
                          <button
                            key={member.id}
                            type="button"
                            onClick={() => {
                              setSelectedTeamMember(member.id)
                              setSelectedTeamMemberName(member.name)
                              setDropdownOpen(false)
                            }}
                            className={`w-full px-4 py-3 flex items-center gap-3 transition-colors ${
                              isSelected
                                ? 'bg-white/10 border-l-4'
                                : 'hover:bg-white/5'
                            }`}
                            style={isSelected ? { borderLeftColor: color } : {}}
                          >
                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: color }} />
                            <div className="flex-1 text-left">
                              <span className="font-semibold">{member.name}</span>
                              <span className="text-xs text-gray-400 ml-2">({member.role})</span>
                            </div>
                            {isSelected && (
                              <svg className="w-4 h-4 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                            )}
                          </button>
                        )
                      })}
                    </motion.div>
                  )}
                </div>
              )}
            </div>

            {/* Contact */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-2">Mobile *</label>
                <input
                  {...register('mobile_number', { required: 'Mobile is required' })}
                  type="tel"
                  className="w-full bg-white/[0.03] border border-white/10 hover:border-white/20 focus:border-[#FF6B35] focus:ring-1 focus:ring-[#FF6B35]/20 rounded-xl px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none transition-all duration-200 text-sm"
                  placeholder="10-digit number"
                />
                {errors.mobile_number && <p className="text-red-400 text-xs mt-1">{errors.mobile_number.message}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-2">Email *</label>
                <input
                  {...register('email', {
                    required: 'Email is required',
                    pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Invalid email' }
                  })}
                  type="email"
                  className="w-full bg-white/[0.03] border border-white/10 hover:border-white/20 focus:border-[#FF6B35] focus:ring-1 focus:ring-[#FF6B35]/20 rounded-xl px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none transition-all duration-200 text-sm"
                  placeholder="you@company.com"
                />
                {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email.message}</p>}
              </div>
            </div>

            {/* Website & Google Business */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-2">Website URL *</label>
                <input
                  {...register('website_url', { required: 'Website URL is required' })}
                  type="text"
                  className="w-full bg-white/[0.03] border border-white/10 hover:border-white/20 focus:border-[#FF6B35] focus:ring-1 focus:ring-[#FF6B35]/20 rounded-xl px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none transition-all duration-200 text-sm"
                  placeholder="example.com"
                />
                {errors.website_url && <p className="text-red-400 text-xs mt-1">{errors.website_url.message}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-2">Google Business (Optional)</label>
                <input
                  {...register('google_business_url')}
                  type="url"
                  className="w-full bg-white/[0.03] border border-white/10 hover:border-white/20 focus:border-[#FF6B35] focus:ring-1 focus:ring-[#FF6B35]/20 rounded-xl px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none transition-all duration-200 text-sm"
                  placeholder="Google Business URL"
                />
              </div>
            </div>

            {/* Social Media */}
            <div>
              <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-3">Social Media (Optional)</label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <input
                  {...register('instagram_url')}
                  type="url"
                  placeholder="Instagram"
                  className="w-full bg-white/[0.03] border border-white/10 hover:border-white/20 focus:border-[#FF6B35] focus:ring-1 focus:ring-[#FF6B35]/20 rounded-xl px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none transition-all duration-200 text-sm"
                />
                <input
                  {...register('facebook_url')}
                  type="url"
                  placeholder="Facebook"
                  className="w-full bg-white/[0.03] border border-white/10 hover:border-white/20 focus:border-[#FF6B35] focus:ring-1 focus:ring-[#FF6B35]/20 rounded-xl px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none transition-all duration-200 text-sm"
                />
                <input
                  {...register('linkedin_url')}
                  type="url"
                  placeholder="LinkedIn"
                  className="w-full bg-white/[0.03] border border-white/10 hover:border-white/20 focus:border-[#FF6B35] focus:ring-1 focus:ring-[#FF6B35]/20 rounded-xl px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none transition-all duration-200 text-sm"
                />
              </div>
            </div>

            {/* Score Guess */}
            <div>
              <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-3">
                Guess Your Digital Health Score: <span className="text-[#FF6B35] text-base font-extrabold">{guessValue}/10</span>
              </label>
              <input
                type="range"
                min="0"
                max="10"
                value={guessValue}
                onChange={(e) => setGuessValue(parseInt(e.target.value))}
                className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-[#FF6B35]"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-2">
                <span>0</span>
                <span>5</span>
                <span>10</span>
              </div>
            </div>

            {/* Terms */}
            <div className="flex items-start gap-3">
              <input
                {...register('terms_accepted', { required: 'You must accept terms' })}
                type="checkbox"
                id="terms"
                className="mt-1 w-4 h-4 accent-[#FF6B35] cursor-pointer"
              />
              <label htmlFor="terms" className="text-sm text-gray-400 cursor-pointer">
                I agree to the terms and privacy policy
              </label>
            </div>
            {errors.terms_accepted && <p className="text-red-400 text-xs">{errors.terms_accepted.message}</p>}

            {/* Submit Button */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={isLoading}
              className="w-full gradient-btn py-3.5 rounded-xl font-bold text-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Submitting...</span>
                </>
              ) : (
                'Get My Digital Health Score'
              )}
            </motion.button>
          </form>
        </motion.div>
      </div>
    </main>
  )
}
