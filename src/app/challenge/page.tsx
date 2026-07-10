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
  const [predictedScore, setPredictedScore] = useState<number | null>(null)

  const { register, handleSubmit, setValue, formState: { errors } } = useForm<LeadFormData>({
    resolver: zodResolver(leadFormSchema),
    mode: 'onBlur',
    reValidateMode: 'onChange',
    defaultValues: {
      guessed_score: 0,
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
          guessed_score: predictedScore as number,
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



            {/* Predicted Digital Health Score Selector */}
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1">
                  Guess Your Digital Health Score *
                </label>
                <p className="text-gray-400 text-xs">
                  Select the score you think your website will receive.
                </p>
              </div>

              <div 
                className="grid grid-cols-5 gap-3" 
                role="radiogroup" 
                aria-label="Guess your Digital Health Score from 1 to 10"
              >
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((score) => {
                  const isSelected = predictedScore === score
                  return (
                    <button
                      key={score}
                      type="button"
                      role="radio"
                      aria-checked={isSelected}
                      onClick={() => {
                        setPredictedScore(score)
                        setValue('guessed_score', score)
                      }}
                      className={`h-12 w-full rounded-xl font-bold transition-all duration-200 border text-base flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-[#FF6B35]/50 ${
                        isSelected
                          ? 'bg-[#FF6B35] border-[#FF6B35] text-white shadow-lg shadow-[#FF6B35]/25 scale-105 font-extrabold'
                          : 'bg-white/[0.03] border-white/10 text-gray-300 hover:bg-white/10 hover:border-white/20 hover:text-white'
                      }`}
                    >
                      {score}
                    </button>
                  )
                })}
              </div>

              {predictedScore === null && (
                <p className="text-[#FF8C42] text-xs mt-1.5 flex items-center gap-1 animate-pulse">
                  ⚠️ Please select a predicted Digital Health Score to proceed.
                </p>
              )}
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
              disabled={isLoading || predictedScore === null}
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
