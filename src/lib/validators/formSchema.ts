import { z } from 'zod'

// Phone number regex (matches standard 10-15 digit formats and international numbers)
const phoneRegex = /^\+?[1-9]\d{9,14}$/

// Clean URL/domain parser
const urlRegex = /^(https?:\/\/)?(www\.)?[a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/

// Name validation: letters, spaces, dashes, periods only (min 2, max 100)
const nameRegex = /^[a-zA-Z\s\-\.]+$/

// XSS Sanitizer helper
export function sanitizeString(val: string): string {
  return val
    .replace(/<script[^>]*>([\s\S]*?)<\/script>/gi, '') // Remove scripts
    .replace(/<[^>]*>/g, '') // Remove HTML tags
    .trim()
}

export const leadFormSchema = z.object({
  full_name: z
    .string()
    .transform(sanitizeString)
    .refine((val) => val.length >= 2, { message: 'Full name must be at least 2 characters.' })
    .refine((val) => val.length <= 100, { message: 'Full name cannot exceed 100 characters.' })
    .refine((val) => nameRegex.test(val), { message: 'Full name can only contain letters, spaces, hyphens, and periods.' }),

  company_name: z
    .string()
    .transform(sanitizeString)
    .refine((val) => val.length >= 2, { message: 'Company name must be at least 2 characters.' })
    .refine((val) => val.length <= 120, { message: 'Company name cannot exceed 120 characters.' }),

  mobile_number: z
    .string()
    .trim()
    .refine((val) => phoneRegex.test(val.replace(/[\s\-\(\)]/g, '')), {
      message: 'Enter a valid 10 to 15 digit mobile number (e.g. +91 9876543210).',
    })
    .transform((val) => val.replace(/[\s\-\(\)]/g, '')), // Normalize spaces/symbols

  email: z
    .string()
    .trim()
    .toLowerCase()
    .email({ message: 'Enter a valid corporate email address.' })
    .refine((val) => !val.endsWith('.temp') && !val.endsWith('.test') && !val.endsWith('example.com') && !val.endsWith('test.com'), {
      message: 'Temporary, test, or example domains are not allowed.',
    }),

  website_url: z
    .string()
    .trim()
    .refine((val) => urlRegex.test(val), { message: 'Enter a valid domain name or website URL (e.g. company.com).' }),

  google_business_url: z
    .string()
    .trim()
    .optional()
    .or(z.literal(''))
    .refine((val) => !val || urlRegex.test(val), { message: 'Enter a valid Google Business URL.' }),

  instagram_url: z
    .string()
    .trim()
    .optional()
    .or(z.literal(''))
    .refine((val) => !val || urlRegex.test(val), { message: 'Enter a valid Instagram URL.' }),

  facebook_url: z
    .string()
    .trim()
    .optional()
    .or(z.literal(''))
    .refine((val) => !val || urlRegex.test(val), { message: 'Enter a valid Facebook URL.' }),

  linkedin_url: z
    .string()
    .trim()
    .optional()
    .or(z.literal(''))
    .refine((val) => !val || urlRegex.test(val), { message: 'Enter a valid LinkedIn URL.' }),

  guessed_score: z
    .coerce
    .number()
    .min(0, { message: 'Guessed score must be at least 0.' })
    .max(100, { message: 'Guessed score cannot exceed 100.' }),

  terms_accepted: z
    .boolean()
    .refine((val) => val === true, { message: 'You must accept the terms & privacy policy.' }),
})

export type LeadFormData = z.infer<typeof leadFormSchema>
