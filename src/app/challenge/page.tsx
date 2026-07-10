'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { RegistrationFormData } from '@/types'

export default function Challenge() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [guessValue, setGuessValue] = useState(5)

  const { register, handleSubmit, formState: { errors }, watch } = useForm<RegistrationFormData>({
    defaultValues: {
      guessed_score: 5,
      terms_accepted: false,
    }
  })

  const onSubmit = async (data: RegistrationFormData) => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          guessed_score: guessValue,
        }),
      })

      if (!response.ok) throw new Error('Failed to submit')

      const { lead_id } = await response.json()
      router.push(`/challenge/result/${lead_id}`)
    } catch (error) {
      alert('Error submitting form. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <main className="min-h-screen py-20 px-6">
      <div className="max-w-2xl mx-auto">
        {/* Back Button */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mb-8"
        >
          <button
            onClick={() => router.back()}
            className="text-gray-400 hover:text-white transition text-sm"
          >
            ← Back
          </button>
        </motion.div>

        {/* Form Container */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card"
        >
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-[#FF6B35] to-[#FF8C42] bg-clip-text text-transparent">
            Digital Health Challenge
          </h1>
          <p className="text-gray-400 mb-8">Fill in your details and guess your Digital Health Score</p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Name & Company */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Full Name *</label>
                <input
                  {...register('full_name', { required: 'Name is required' })}
                  type="text"
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-[#FF6B35]/50"
                  placeholder="Your name"
                />
                {errors.full_name && <p className="text-red-400 text-xs mt-1">{errors.full_name.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Company *</label>
                <input
                  {...register('company_name', { required: 'Company is required' })}
                  type="text"
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-[#FF6B35]/50"
                  placeholder="Your company"
                />
                {errors.company_name && <p className="text-red-400 text-xs mt-1">{errors.company_name.message}</p>}
              </div>
            </div>

            {/* Contact */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Mobile *</label>
                <input
                  {...register('mobile_number', { required: 'Mobile is required' })}
                  type="tel"
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-[#FF6B35]/50"
                  placeholder="10-digit number"
                />
                {errors.mobile_number && <p className="text-red-400 text-xs mt-1">{errors.mobile_number.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Email *</label>
                <input
                  {...register('email', {
                    required: 'Email is required',
                    pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Invalid email' }
                  })}
                  type="email"
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-[#FF6B35]/50"
                  placeholder="you@company.com"
                />
                {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email.message}</p>}
              </div>
            </div>

            {/* Website & Google Business */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Website URL *</label>
                <input
                  {...register('website_url', { required: 'Website URL is required' })}
                  type="url"
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-[#FF6B35]/50"
                  placeholder="https://example.com"
                />
                {errors.website_url && <p className="text-red-400 text-xs mt-1">{errors.website_url.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Google Business (Optional)</label>
                <input
                  {...register('google_business_url')}
                  type="url"
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-[#FF6B35]/50"
                  placeholder="Google Business URL"
                />
              </div>
            </div>

            {/* Social Media */}
            <div>
              <label className="block text-sm font-medium mb-3">Social Media (Optional)</label>
              <div className="grid grid-cols-3 gap-3">
                <input
                  {...register('instagram_url')}
                  type="url"
                  placeholder="Instagram"
                  className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-[#FF6B35]/50"
                />
                <input
                  {...register('facebook_url')}
                  type="url"
                  placeholder="Facebook"
                  className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-[#FF6B35]/50"
                />
                <input
                  {...register('linkedin_url')}
                  type="url"
                  placeholder="LinkedIn"
                  className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-[#FF6B35]/50"
                />
              </div>
            </div>

            {/* Score Guess */}
            <div>
              <label className="block text-sm font-medium mb-3">
                Guess Your Digital Health Score: <span className="text-[#FF6B35] text-lg font-bold">{guessValue}/10</span>
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
              className="w-full gradient-btn py-3 rounded-lg font-semibold text-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {isLoading ? 'Submitting...' : 'Get My Digital Health Score'}
            </motion.button>
          </form>
        </motion.div>
      </div>
    </main>
  )
}
