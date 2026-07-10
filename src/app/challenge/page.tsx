'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { zodResolver } from '@hookform/resolvers/zod'
import { leadFormSchema, LeadFormData } from '@/lib/validators/formSchema'

export default function Challenge() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [guessValue, setGuessValue] = useState(70)

  const { register, handleSubmit, formState: { errors } } = useForm<LeadFormData>({
    resolver: zodResolver(leadFormSchema),
    mode: 'onBlur',
    reValidateMode: 'onChange',
    defaultValues: {
      guessed_score: 70,
      terms_accepted: false,
      google_business_url: '',
      instagram_url: '',
      facebook_url: '',
      linkedin_url: '',
    }
  })

  const onSubmit = async (data: LeadFormData) => {
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
        }),
      })

      if (!response.ok) {
        const errJson = await response.json().catch(() => null)
        throw new Error(errJson?.error || 'Failed to submit lead data')
      }

      const { lead_id } = await response.json()
      router.push(`/challenge/result/${lead_id}`)
    } catch (error: any) {
      alert(error.message || 'Error submitting challenge form. Please try again.')
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

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
            {/* Name & Company */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="full_name" className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-2">Full Name *</label>
                <input
                  id="full_name"
                  {...register('full_name')}
                  type="text"
                  aria-required="true"
                  aria-invalid={errors.full_name ? "true" : "false"}
                  aria-describedby={errors.full_name ? "full_name-error" : undefined}
                  className={`w-full bg-white/[0.03] border rounded-xl px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none transition-all duration-200 text-sm ${
                    errors.full_name ? 'border-red-500 focus:border-red-500 focus:ring-1 focus:ring-red-500/25' : 'border-white/10 hover:border-white/20 focus:border-[#FF6B35] focus:ring-1 focus:ring-[#FF6B35]/20'
                  }`}
                  placeholder="Your full name"
                />
                {errors.full_name && (
                  <p id="full_name-error" role="alert" className="text-red-400 text-xs mt-1.5 flex items-center gap-1">
                    <span>⚠️</span> {errors.full_name.message}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="company_name" className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-2">Company *</label>
                <input
                  id="company_name"
                  {...register('company_name')}
                  type="text"
                  aria-required="true"
                  aria-invalid={errors.company_name ? "true" : "false"}
                  aria-describedby={errors.company_name ? "company_name-error" : undefined}
                  className={`w-full bg-white/[0.03] border rounded-xl px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none transition-all duration-200 text-sm ${
                    errors.company_name ? 'border-red-500 focus:border-red-500 focus:ring-1 focus:ring-red-500/25' : 'border-white/10 hover:border-white/20 focus:border-[#FF6B35] focus:ring-1 focus:ring-[#FF6B35]/20'
                  }`}
                  placeholder="Your company name"
                />
                {errors.company_name && (
                  <p id="company_name-error" role="alert" className="text-red-400 text-xs mt-1.5 flex items-center gap-1">
                    <span>⚠️</span> {errors.company_name.message}
                  </p>
                )}
              </div>
            </div>

            {/* Contact */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="mobile_number" className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-2">Mobile Number *</label>
                <input
                  id="mobile_number"
                  {...register('mobile_number')}
                  type="tel"
                  aria-required="true"
                  aria-invalid={errors.mobile_number ? "true" : "false"}
                  aria-describedby={errors.mobile_number ? "mobile_number-error" : undefined}
                  className={`w-full bg-white/[0.03] border rounded-xl px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none transition-all duration-200 text-sm ${
                    errors.mobile_number ? 'border-red-500 focus:border-red-500 focus:ring-1 focus:ring-red-500/25' : 'border-white/10 hover:border-white/20 focus:border-[#FF6B35] focus:ring-1 focus:ring-[#FF6B35]/20'
                  }`}
                  placeholder="+91 98765 43210"
                />
                {errors.mobile_number && (
                  <p id="mobile_number-error" role="alert" className="text-red-400 text-xs mt-1.5 flex items-center gap-1">
                    <span>⚠️</span> {errors.mobile_number.message}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="email" className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-2">Corporate Email *</label>
                <input
                  id="email"
                  {...register('email')}
                  type="email"
                  aria-required="true"
                  aria-invalid={errors.email ? "true" : "false"}
                  aria-describedby={errors.email ? "email-error" : undefined}
                  className={`w-full bg-white/[0.03] border rounded-xl px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none transition-all duration-200 text-sm ${
                    errors.email ? 'border-red-500 focus:border-red-500 focus:ring-1 focus:ring-red-500/25' : 'border-white/10 hover:border-white/20 focus:border-[#FF6B35] focus:ring-1 focus:ring-[#FF6B35]/20'
                  }`}
                  placeholder="you@company.com"
                />
                {errors.email && (
                  <p id="email-error" role="alert" className="text-red-400 text-xs mt-1.5 flex items-center gap-1">
                    <span>⚠️</span> {errors.email.message}
                  </p>
                )}
              </div>
            </div>

            {/* Website & Google Business */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="website_url" className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-2">Website URL *</label>
                <input
                  id="website_url"
                  {...register('website_url')}
                  type="text"
                  aria-required="true"
                  aria-invalid={errors.website_url ? "true" : "false"}
                  aria-describedby={errors.website_url ? "website_url-error" : undefined}
                  className={`w-full bg-white/[0.03] border rounded-xl px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none transition-all duration-200 text-sm ${
                    errors.website_url ? 'border-red-500 focus:border-red-500 focus:ring-1 focus:ring-red-500/25' : 'border-white/10 hover:border-white/20 focus:border-[#FF6B35] focus:ring-1 focus:ring-[#FF6B35]/20'
                  }`}
                  placeholder="company.com"
                />
                {errors.website_url && (
                  <p id="website_url-error" role="alert" className="text-red-400 text-xs mt-1.5 flex items-center gap-1">
                    <span>⚠️</span> {errors.website_url.message}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="google_business_url" className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-2">Google Business URL (Optional)</label>
                <input
                  id="google_business_url"
                  {...register('google_business_url')}
                  type="url"
                  aria-invalid={errors.google_business_url ? "true" : "false"}
                  aria-describedby={errors.google_business_url ? "google_business_url-error" : undefined}
                  className={`w-full bg-white/[0.03] border rounded-xl px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none transition-all duration-200 text-sm ${
                    errors.google_business_url ? 'border-red-500 focus:border-red-500 focus:ring-1 focus:ring-red-500/25' : 'border-white/10 hover:border-white/20 focus:border-[#FF6B35] focus:ring-1 focus:ring-[#FF6B35]/20'
                  }`}
                  placeholder="https://g.page/r/company"
                />
                {errors.google_business_url && (
                  <p id="google_business_url-error" role="alert" className="text-red-400 text-xs mt-1.5 flex items-center gap-1">
                    <span>⚠️</span> {errors.google_business_url.message}
                  </p>
                )}
              </div>
            </div>

            {/* Social Media */}
            <div>
              <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-3">Social Media URLs (Optional)</label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <input
                    aria-label="Instagram Profile Link"
                    {...register('instagram_url')}
                    type="url"
                    placeholder="Instagram URL"
                    aria-invalid={errors.instagram_url ? "true" : "false"}
                    className={`w-full bg-white/[0.03] border rounded-xl px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none transition-all duration-200 text-sm ${
                      errors.instagram_url ? 'border-red-500' : 'border-white/10 hover:border-white/20 focus:border-[#FF6B35]'
                    }`}
                  />
                  {errors.instagram_url && <span className="text-red-400 text-[10px] mt-1 block">⚠️ Invalid URL</span>}
                </div>
                
                <div>
                  <input
                    aria-label="Facebook Page Link"
                    {...register('facebook_url')}
                    type="url"
                    placeholder="Facebook URL"
                    aria-invalid={errors.facebook_url ? "true" : "false"}
                    className={`w-full bg-white/[0.03] border rounded-xl px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none transition-all duration-200 text-sm ${
                      errors.facebook_url ? 'border-red-500' : 'border-white/10 hover:border-white/20 focus:border-[#FF6B35]'
                    }`}
                  />
                  {errors.facebook_url && <span className="text-red-400 text-[10px] mt-1 block">⚠️ Invalid URL</span>}
                </div>

                <div>
                  <input
                    aria-label="LinkedIn Profile Link"
                    {...register('linkedin_url')}
                    type="url"
                    placeholder="LinkedIn URL"
                    aria-invalid={errors.linkedin_url ? "true" : "false"}
                    className={`w-full bg-white/[0.03] border rounded-xl px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none transition-all duration-200 text-sm ${
                      errors.linkedin_url ? 'border-red-500' : 'border-white/10 hover:border-white/20 focus:border-[#FF6B35]'
                    }`}
                  />
                  {errors.linkedin_url && <span className="text-red-400 text-[10px] mt-1 block">⚠️ Invalid URL</span>}
                </div>
              </div>
            </div>

            {/* Score Guess (0-100) */}
            <div>
              <label htmlFor="guessed_score" className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-3">
                Guess Your Digital Health Score: <span className="text-[#FF6B35] text-base font-extrabold">{guessValue}/100</span>
              </label>
              <input
                id="guessed_score"
                type="range"
                min="0"
                max="100"
                value={guessValue}
                onChange={(e) => setGuessValue(parseInt(e.target.value))}
                className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-[#FF6B35]"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-2">
                <span>0</span>
                <span>50</span>
                <span>100</span>
              </div>
            </div>

            {/* Terms */}
            <div className="flex items-start gap-3">
              <input
                {...register('terms_accepted')}
                type="checkbox"
                id="terms"
                aria-required="true"
                aria-invalid={errors.terms_accepted ? "true" : "false"}
                aria-describedby={errors.terms_accepted ? "terms-error" : undefined}
                className="mt-1 w-4 h-4 accent-[#FF6B35] cursor-pointer"
              />
              <label htmlFor="terms" className="text-sm text-gray-400 cursor-pointer">
                I agree to the terms and privacy policy
              </label>
            </div>
            {errors.terms_accepted && (
              <p id="terms-error" role="alert" className="text-red-400 text-xs mt-1.5 flex items-center gap-1">
                <span>⚠️</span> {errors.terms_accepted.message}
              </p>
            )}

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
                  <span>Initiating Scan...</span>
                </>
              ) : (
                'Start Free Audit Challenge'
              )}
            </motion.button>
          </form>
        </motion.div>
      </div>
    </main>
  )
}
