'use client'

import { useEffect, useState, useMemo } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { supabase } from '@/lib/supabase'
import { Lead, AuditResult } from '@/types'

type CheckItem = {
  group: string
  status: 'pass' | 'fail' | 'warn' | 'info'
  icon: string
  title: string
  detail: string
  fix: string | null
  value: string | null
}

export default function ReportPage() {
  const params = useParams()
  const router = useRouter()
  const leadId = params.id as string

  const [lead, setLead] = useState<Lead | null>(null)
  const [audit, setAudit] = useState<AuditResult | null>(null)
  const [loading, setLoading] = useState(true)

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
      } catch (error) {
        console.error('Error fetching:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [leadId])

  // Client-side SEO analyzer engine running 60+ checks on the stored raw HTML
  const auditReport = useMemo(() => {
    const htmlContent = audit?.audit_data?.html
    if (!htmlContent) return null

    const parser = new DOMParser()
    const doc = parser.parseFromString(htmlContent, 'text/html')
    const checks: CheckItem[] = []

    const push = (
      group: string,
      status: 'pass' | 'fail' | 'warn' | 'info',
      icon: string,
      title: string,
      detail: string,
      fix?: string,
      value?: string
    ) => {
      checks.push({
        group,
        status,
        icon,
        title,
        detail,
        fix: fix || null,
        value: value || null,
      })
    }

    const kw = lead?.company_name?.toLowerCase() || ''
    const pageUrl = lead?.website_url || ''

    // 1. TITLE & META
    const title = doc.querySelector('title')
    const titleText = title ? title.textContent?.trim() || '' : ''

    if (!titleText) {
      push('Title & Meta', 'fail', '❌', 'Title tag missing', 'No <title> found — critical ranking signal.', 'Add a <title> with 50–60 characters including your primary keyword.')
    } else if (titleText.length < 30) {
      push('Title & Meta', 'warn', '⚠️', 'Title too short', `"${titleText}" is only ${titleText.length} chars. Aim for 50–60.`, 'Expand title to be more descriptive and keyword-rich.', titleText)
    } else if (titleText.length > 65) {
      push('Title & Meta', 'warn', '⚠️', 'Title too long', `${titleText.length} chars — Google truncates after ~60.`, 'Shorten to under 60 characters to avoid truncation in SERPs.', titleText.substring(0, 55) + '…')
    } else {
      push('Title & Meta', 'pass', '✅', 'Title tag length', `${titleText.length} chars — ideal range.`, undefined, titleText.substring(0, 50))
    }

    if (kw && titleText) {
      if (!titleText.toLowerCase().includes(kw))
        push('Title & Meta', 'warn', '⚠️', 'Keyword missing from title', `"${kw}" not found in title.`, 'Place target keyword near the beginning of the title tag.')
      else
        push('Title & Meta', 'pass', '✅', 'Keyword in title', `"${kw}" found in title tag.`)
    }

    const metaDesc = doc.querySelector('meta[name="description"]')
    const descText = metaDesc ? metaDesc.getAttribute('content') || '' : ''
    if (!descText) {
      push('Title & Meta', 'fail', '❌', 'Meta description missing', 'Google may auto-generate poor snippets without it.', 'Write a 150–160 char meta description with your keyword and a CTA.')
    } else if (descText.length < 70) {
      push('Title & Meta', 'warn', '⚠️', 'Meta description too short', `${descText.length} chars — aim for 150–160.`, 'Expand with more detail, benefits, and a call-to-action.', descText)
    } else if (descText.length > 165) {
      push('Title & Meta', 'warn', '⚠️', 'Meta description too long', `${descText.length} chars — Google cuts at ~160.`, 'Shorten to under 160 characters.', descText.substring(0, 60) + '…')
    } else {
      push('Title & Meta', 'pass', '✅', 'Meta description length', `${descText.length} chars — ideal range.`, undefined, descText.substring(0, 55) + '…')
    }

    const metaKeywords = doc.querySelector('meta[name="keywords"]')
    if (metaKeywords && metaKeywords.getAttribute('content')) {
      push('Title & Meta', 'warn', '⚠️', 'Meta keywords tag present', 'Meta keywords are ignored by Google and can look spammy.', 'Remove the <meta name="keywords"> tag — it provides no SEO benefit.')
    }

    const metaAuthor = doc.querySelector('meta[name="author"]')
    if (!metaAuthor) {
      push('Title & Meta', 'warn', '⚠️', 'Author meta tag missing', 'Helps with E-E-A-T signals, especially for blog/article pages.', 'Add <meta name="author" content="Your Name"> for content pages.')
    } else {
      push('Title & Meta', 'pass', '✅', 'Author meta tag', `Author: ${metaAuthor.getAttribute('content')}`, undefined, metaAuthor.getAttribute('content') || '')
    }

    // 2. HEADINGS & STRUCTURE
    const h1s = doc.querySelectorAll('h1')
    const h2s = doc.querySelectorAll('h2')
    const h3s = doc.querySelectorAll('h3')
    const h4s = doc.querySelectorAll('h4')

    if (h1s.length === 0) {
      push('Headings', 'fail', '❌', 'H1 tag missing', 'No H1 found — the most important on-page ranking signal.', 'Add exactly one H1 containing your primary keyword.')
    } else if (h1s.length > 1) {
      push('Headings', 'warn', '⚠️', 'Multiple H1 tags', `Found ${h1s.length} H1 tags. Best practice: exactly one per page.`, 'Keep one H1 only. Convert extras to H2 or H3.', `${h1s.length} H1s found`)
    } else {
      push('Headings', 'pass', '✅', 'Single H1 tag', 'Exactly one H1 — correct.', undefined, h1s[0].textContent?.trim().substring(0, 50))
    }

    if (h2s.length === 0) {
      push('Headings', 'warn', '⚠️', 'No H2 tags', 'No H2 headings — content may appear flat to Google.', 'Add H2 headings to structure content and include secondary keywords.')
    } else {
      push('Headings', 'pass', '✅', 'H2 headings present', `${h2s.length} H2 tag${h2s.length > 1 ? 's' : ''} found — good structure.`)
    }

    push('Headings', 'pass', 'info', 'Heading inventory', `H1: ${h1s.length} | H2: ${h2s.length} | H3: ${h3s.length} | H4: ${h4s.length}`, undefined, `H1:${h1s.length} H2:${h2s.length} H3:${h3s.length}`)

    if (h3s.length > 0 && h2s.length === 0) {
      push('Headings', 'warn', '⚠️', 'Heading hierarchy skip', 'H3 tags used without H2 — skipped heading levels hurt accessibility and SEO.', 'Always use headings in order: H1 → H2 → H3. Don\'t skip levels.')
    }

    // 3. CONTENT QUALITY
    const bodyText = doc.body ? doc.body.innerText || doc.body.textContent || '' : ''
    const words = bodyText.trim().split(/\s+/).filter(w => w.length > 1)
    const wordCount = words.length

    if (wordCount < 300) {
      push('Content Quality', 'fail', '❌', 'Thin content', `Only ${wordCount} words. Google prefers 600+ for ranking.`, 'Expand to at least 600 words. Aim for 1,200+ for competitive keywords.')
    } else if (wordCount < 600) {
      push('Content Quality', 'warn', '⚠️', 'Content could be longer', `${wordCount} words — consider expanding.`, 'Add FAQs, examples, statistics, or deeper explanations.')
    } else {
      push('Content Quality', 'pass', '✅', 'Word count', `${wordCount} words — strong content depth.`)
    }

    const paragraphs = doc.querySelectorAll('p')
    if (paragraphs.length < 3) {
      push('Content Quality', 'warn', '⚠️', 'Few paragraph tags', `Only ${paragraphs.length} <p> tags. Use proper paragraph structure.`, 'Break content into short paragraphs (3–5 sentences each) for readability.')
    }

    const lists = doc.querySelectorAll('ul, ol')
    if (lists.length === 0) {
      push('Content Quality', 'warn', '⚠️', 'No lists found', 'No <ul>/<ol> elements. Lists help structure content and improve AIO citations.', 'Add bullet or numbered lists for key points, steps, or features.')
    } else {
      push('Content Quality', 'pass', '✅', 'Lists present', `${lists.length} list(s) found — good structure.`)
    }

    // 4. IMAGES
    const imgs = doc.querySelectorAll('img')
    const noAlt = Array.from(imgs).filter(i => !i.getAttribute('alt')?.trim())
    const lazyImgs = Array.from(imgs).filter(i => i.getAttribute('loading') === 'lazy')

    if (imgs.length === 0) {
      push('Images', 'warn', '⚠️', 'No images found', 'Pages with images tend to rank better and reduce bounce rate.', 'Add at least one relevant image with descriptive alt text.')
    } else {
      push('Images', 'pass', '✅', 'Images present', `${imgs.length} image(s) found on page.`)
    }

    if (noAlt.length > 0) {
      push('Images', noAlt.length === imgs.length ? 'fail' : 'warn',
        noAlt.length === imgs.length ? '❌' : '⚠️',
        'Images missing alt text',
        `${noAlt.length} of ${imgs.length} images have no alt attribute.`,
        'Add descriptive alt text to every image. Include keyword in at least one where relevant.')
    }

    if (imgs.length > 2 && lazyImgs.length === 0) {
      push('Images', 'warn', '⚠️', 'No lazy loading on images', `${imgs.length} images without loading="lazy".`, 'Add loading="lazy" to images below the fold to improve page speed.')
    }

    // 5. LINKS
    const allLinks = Array.from(doc.querySelectorAll('a[href]'))
    const internalLinks = allLinks.filter(a => {
      const h = a.getAttribute('href') || ''
      return h.startsWith('/') || h.startsWith('./') || h.includes(pageUrl)
    })
    const externalLinks = allLinks.filter(a => {
      const h = a.getAttribute('href') || ''
      return h.startsWith('http') && !internalLinks.includes(a)
    })
    const emptyLinks = allLinks.filter(a => (a.getAttribute('href') || '').trim() === '#')

    if (internalLinks.length < 2) {
      push('Links', 'warn', '⚠️', 'Few internal links', `Only ${internalLinks.length} internal link(s). Internal linking distributes PageRank.`, 'Add 3–5 contextual internal links to related pages.')
    } else {
      push('Links', 'pass', '✅', 'Internal links', `${internalLinks.length} internal link(s) — good crawlability.`)
    }

    if (externalLinks.length === 0) {
      push('Links', 'warn', '⚠️', 'No external links', 'No outbound links found.', 'Link to 1–2 authoritative sources to add context and trust.')
    } else {
      push('Links', 'pass', '✅', 'External links', `${externalLinks.length} outbound link(s) found.`)
    }

    if (emptyLinks.length > 0) {
      push('Links', 'warn', '⚠️', 'Empty href links (href="#")', `${emptyLinks.length} link(s) with href="#" and no aria-label.`, 'Replace with real URLs or add aria-label for accessibility.')
    }

    // 6. TECHNICAL SEO
    const charset = doc.querySelector('meta[charset]')
    if (!charset)
      push('Technical SEO', 'warn', '⚠️', 'Charset not declared', 'No <meta charset> found.', 'Add <meta charset="UTF-8"> as the first tag in <head>.')
    else
      push('Technical SEO', 'pass', '✅', 'Charset declared', `charset="${charset.getAttribute('charset')}"`)

    const viewport = doc.querySelector('meta[name="viewport"]')
    if (!viewport)
      push('Technical SEO', 'fail', '❌', 'Viewport meta missing', 'Page will not be mobile-friendly without viewport meta.', 'Add: <meta name="viewport" content="width=device-width, initial-scale=1.0">')
    else
      push('Technical SEO', 'pass', '✅', 'Mobile viewport set', viewport.getAttribute('content') || '')

    const langAttr = doc.documentElement.getAttribute('lang')
    if (!langAttr)
      push('Technical SEO', 'warn', '⚠️', 'HTML lang attribute missing', 'Helps Google understand page language.', 'Add lang="en" to <html>.')

    const canonical = doc.querySelector('link[rel="canonical"]')
    if (!canonical)
      push('Technical SEO', 'warn', '⚠️', 'Canonical tag missing', 'Without canonical, Google may pick any URL variant as the "master".', 'Add <link rel="canonical" href="https://yourdomain.com/page"> in <head>.')
    else
      push('Technical SEO', 'pass', '✅', 'Canonical tag', 'Self-referential canonical found.', undefined, canonical.getAttribute('href')?.substring(0, 50) || '')

    // 7. SOCIAL & OG
    const ogTitle = doc.querySelector('meta[property="og:title"]')
    const ogDesc = doc.querySelector('meta[property="og:description"]')
    const ogImage = doc.querySelector('meta[property="og:image"]')
    const twCard = doc.querySelector('meta[name="twitter:card"]')

    if (!ogTitle) push('Social & OG', 'fail', '❌', 'og:title missing', 'Missing — social shares will have no title.', 'Add <meta property="og:title" content="Your Page Title">.')
    if (!ogDesc) push('Social & OG', 'fail', '❌', 'og:description missing', 'Social shares will have no description.', 'Add og:description (150–160 chars) for better social previews.')
    if (!ogImage) push('Social & OG', 'fail', '❌', 'og:image missing', 'No share image — posts look bland on social media.', 'Add og:image with a 1200×630px image.')
    if (!twCard) push('Social & OG', 'warn', '⚠️', 'Twitter card missing', 'No Twitter card — shares won\'t show image previews.', 'Add <meta name="twitter:card" content="summary_large_image">.')

    // 8. SCHEMA MARKUP
    const schemas = Array.from(doc.querySelectorAll('script[type="application/ld+json"]'))
    if (schemas.length === 0) {
      push('Schema Markup', 'warn', '⚠️', 'No structured data found', 'No JSON-LD schema detected — missing rich result eligibility.', 'Add Organization, LocalBusiness, Article, or FAQPage schema markup.')
    } else {
      push('Schema Markup', 'pass', '✅', 'Structured data present', `${schemas.length} JSON-LD block(s) found.`)
    }

    // 9. ACCESSIBILITY
    const inputs = doc.querySelectorAll('input:not([type="hidden"]), textarea, select')
    const unlabeledInputs = Array.from(inputs).filter(inp => {
      const id = inp.getAttribute('id')
      const ariaLabel = inp.getAttribute('aria-label')
      const ariaLabelledBy = inp.getAttribute('aria-labelledby')
      const hasLabel = id && doc.querySelector(`label[for="${id}"]`)
      return !hasLabel && !ariaLabel && !ariaLabelledBy
    })
    if (unlabeledInputs.length > 0)
      push('Accessibility', 'warn', '⚠️', 'Form inputs without labels', `${unlabeledInputs.length} input(s) have no associated label.`, 'Add <label for="inputId"> or aria-label to all form inputs.')

    const buttons = Array.from(doc.querySelectorAll('button'))
    const emptyButtons = buttons.filter(b => !b.textContent?.trim() && !b.getAttribute('aria-label'))
    if (emptyButtons.length > 0)
      push('Accessibility', 'warn', '⚠️', 'Buttons without accessible text', `${emptyButtons.length} button(s) have no text or aria-label.`, 'Add descriptive aria-label to icon-only buttons.')

    // 10. AI READINESS
    const allText = bodyText.toLowerCase()
    const h3Texts = Array.from(h3s).map(h => h.textContent?.trim() || '')
    const questionH3s = h3Texts.filter(t => t.endsWith('?') || /^(what|how|why|when|where|who|is|are|does|can|should|will)/i.test(t))
    if (questionH3s.length >= 2)
      push('AI Readiness', 'pass', '✅', 'Question-format headings', `${questionH3s.length} question-phrased H3s — great for AIO citation.`)
    else
      push('AI Readiness', 'warn', '⚠️', 'No question-format headings', 'H3s phrased as questions help Google\'s AI Overviews extract direct answers.', 'Rewrite at least 2–3 H3 headings as questions.')

    const hasStats = /\d+(%|₹|\$|cr|lakh|million|billion|x\s|times|\+\s)/.test(allText)
    if (hasStats)
      push('AI Readiness', 'pass', '✅', 'Data & statistics present', 'Numeric data and statistics found — AIO and Google strongly prefer citing factual content.')
    else
      push('AI Readiness', 'warn', '⚠️', 'No statistics or data found', 'Content lacks numbers, percentages, or data points.', 'Add specific stats, research data, or case study numbers.')

    // Calculate final scores
    const pass = checks.filter(c => c.status === 'pass').length
    const warn = checks.filter(c => c.status === 'warn').length
    const fail = checks.filter(c => c.status === 'fail').length
    const info = checks.filter(c => c.status === 'info').length
    const total = checks.length
    const overallScore = Math.round(((pass + warn * 0.5) / (total - info)) * 100)

    // Grouping
    const groups: { [key: string]: CheckItem[] } = {}
    checks.forEach(c => {
      if (!groups[c.group]) groups[c.group] = []
      groups[c.group].push(c)
    })

    // Category scores
    const categoryScores = Object.entries(groups).map(([name, items]) => {
      const gPass = items.filter(i => i.status === 'pass').length
      const gInfo = items.filter(i => i.status === 'info').length
      const gTotal = items.length - gInfo
      const gWarn = items.filter(i => i.status === 'warn').length
      const gScore = gTotal > 0 ? Math.round(((gPass + gWarn * 0.5) / gTotal) * 100) : 100
      return { name, score: gScore }
    })

    const critical = checks.filter(c => c.status === 'fail' && c.fix)
    const warnings = checks.filter(c => c.status === 'warn' && c.fix)
    const priorityActions = [...critical, ...warnings].slice(0, 5)

    return {
      checks,
      pass,
      warn,
      fail,
      overallScore,
      priorityActions,
      groups,
      categoryScores,
    }
  }, [audit, lead])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="text-center">
          <div className="inline-block animate-spin-slow w-12 h-12 border-4 border-white/20 border-t-[#FF6B35] rounded-full mb-4"></div>
          <p className="text-gray-400">Loading audit report...</p>
        </div>
      </div>
    )
  }

  if (!lead || !audit || !auditReport) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="text-center">
          <p className="text-red-400 mb-4 font-bold text-lg">Report not found</p>
          <button
            onClick={() => router.push('/')}
            className="px-6 py-2 rounded-lg bg-gradient-to-r from-[#FF6B35] to-[#FF8C42] text-white font-bold"
          >
            Go Home
          </button>
        </div>
      </div>
    )
  }

  const { overallScore, pass, warn, fail, priorityActions, groups, categoryScores } = auditReport

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-500'
    if (score >= 55) return 'text-yellow-500'
    return 'text-red-500'
  }

  const getScoreStroke = (score: number) => {
    if (score >= 80) return '#22c55e'
    if (score >= 55) return '#eab308'
    return '#ef4444'
  }

  const getCategoryIcon = (name: string) => {
    switch (name) {
      case 'Title & Meta':
        return (
          <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
          </svg>
        )
      case 'Headings':
        return (
          <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h7" />
          </svg>
        )
      case 'Content Quality':
        return (
          <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        )
      case 'Images':
        return (
          <svg className="w-5 h-5 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        )
      case 'Links':
        return (
          <svg className="w-5 h-5 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
          </svg>
        )
      case 'Technical SEO':
        return (
          <svg className="w-5 h-5 text-pink-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        )
      case 'Social & OG':
        return (
          <svg className="w-5 h-5 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 10.742l-2.084 1.157M8.684 12.738l2.085-1.157m1.117-2.924A2.5 2.5 0 1111 8a2.5 2.5 0 01-1.117-1.157zm0 9.848a2.5 2.5 0 111.117-4.829 2.5 2.5 0 01-1.117 4.829z" />
          </svg>
        )
      case 'Schema Markup':
        return (
          <svg className="w-5 h-5 text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 10l-2 1m0 0l-2-1m2 1v2.5M20 7l-2 1m0 0l-2-1m2 1v2.5M14 4l-2 1m0 0l-2-1m2 1v2.5M4 7l2-1M6 6l2 1M6 6v2.5M10 18l-2 1m0 0l-2-1m2 1v2.5M20 18l-2 1m0 0l-2-1m2 1v2.5" />
          </svg>
        )
      case 'Accessibility':
        return (
          <svg className="w-5 h-5 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
        )
      case 'AI Readiness':
        return (
          <svg className="w-5 h-5 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
        )
      default:
        return (
          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
        )
    }
  }

  const getStatusBadge = (status: 'pass' | 'fail' | 'warn' | 'info') => {
    switch (status) {
      case 'pass':
        return <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-green-500/10 text-green-400 border border-green-500/20">Passed</span>
      case 'fail':
        return <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-red-500/10 text-red-400 border border-red-500/20">Failed</span>
      case 'warn':
        return <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-yellow-500/10 text-yellow-400 border border-yellow-500/20">Warning</span>
      case 'info':
        return <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20">Info</span>
    }
  }

  return (
    <main className="min-h-screen py-12 md:py-20 px-4 md:px-6 bg-[#0B0F19] text-gray-100 relative overflow-hidden selection:bg-[#FF6B35] selection:text-white">
      {/* Background decorative glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-[#FF6B35]/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-blue-500/5 blur-[120px] pointer-events-none" />

      <div className="max-w-4xl mx-auto relative z-10">
        
        {/* Navigation & Header Info */}
        <div className="mb-8 flex justify-between items-center print:hidden">
          <button
            onClick={() => router.back()}
            className="text-gray-400 hover:text-white transition-colors duration-200 text-sm font-semibold flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back
          </button>
          <div>
            <button
              onClick={() => window.print()}
              className="px-4 py-2 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20 text-sm transition-all duration-200 flex items-center gap-2 font-semibold text-white shadow-sm"
            >
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
              </svg>
              <span>Print Report</span>
            </button>
          </div>
        </div>

        {/* Lead Company Details Card */}
        <div className="glass-card mb-8 border border-white/10 rounded-2xl p-6 md:p-8 bg-white/[0.03] backdrop-blur-md relative overflow-hidden shadow-md">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-[#FF6B35]/10 to-transparent rounded-bl-full pointer-events-none" />
          <h1 className="text-3xl md:text-4xl font-extrabold text-white mb-2 tracking-tight">{lead.company_name}</h1>
          <a 
            href={lead.website_url.startsWith('http') ? lead.website_url : `https://${lead.website_url}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#FF6B35] hover:text-[#FF8C42] font-semibold text-base md:text-lg mb-4 inline-flex items-center gap-1.5 transition-colors"
          >
            <span>{lead.website_url}</span>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>
          <div className="flex flex-wrap gap-x-6 gap-y-2 mt-2 text-xs md:text-sm text-gray-400">
            <span><strong className="text-gray-300">Audited For:</strong> {lead.full_name}</span>
            <span><strong className="text-gray-300">Reference ID:</strong> {lead.reference_id}</span>
          </div>
        </div>

        {/* Circular Overall Score Section */}
        <div className="glass-card mb-8 text-center py-10 border border-white/10 rounded-2xl bg-white/[0.03] backdrop-blur-md shadow-md">
          <h2 className="text-gray-400 text-xs uppercase tracking-widest font-semibold mb-6">Overall Digital Health Score</h2>
          <div className="relative w-44 h-44 mx-auto mb-6 filter drop-shadow-[0_0_15px_rgba(255,107,53,0.05)]">
            <svg className="absolute inset-0 w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="44"
                fill="none"
                stroke="rgba(255,255,255,0.04)"
                strokeWidth="5"
              />
              <motion.circle
                cx="50"
                cy="50"
                r="44"
                fill="none"
                stroke={getScoreStroke(overallScore)}
                strokeWidth="6"
                strokeDasharray="276.46"
                initial={{ strokeDashoffset: 276.46 }}
                animate={{ strokeDashoffset: 276.46 - (overallScore / 100) * 276.46 }}
                transition={{ duration: 1.5, ease: 'easeOut' }}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-5xl font-black tracking-tight text-white">{overallScore}</span>
              <span className="text-xs text-gray-400 font-semibold tracking-wider uppercase mt-1">Score</span>
              <span className="text-[10px] text-gray-500 mt-0.5">out of 100</span>
            </div>
          </div>

          <div className="text-xl font-bold mb-4 text-white px-4">
            {overallScore >= 85 ? '🏆 Excellent Digital Presence' : overallScore >= 70 ? '👍 Good — Room to Improve' : overallScore >= 50 ? '⚠️ Needs Work' : '🚨 Critical Action Required'}
          </div>

          {/* Quick Stats Pills */}
          <div className="flex justify-center gap-3 flex-wrap px-4">
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-500/10 text-green-400 border border-green-500/20">
              ✅ {pass} Passed
            </span>
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-yellow-500/10 text-yellow-400 border border-yellow-500/20">
              ⚠️ {warn} Warnings
            </span>
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-red-500/10 text-red-400 border border-red-500/20">
              ❌ {fail} Failed
            </span>
          </div>
        </div>

        {/* Priority Actions */}
        {priorityActions.length > 0 && (
          <div className="glass-card mb-8 border border-red-500/20 rounded-2xl p-6 bg-gradient-to-b from-red-500/5 to-transparent shadow-sm">
            <h3 className="text-red-400 font-extrabold text-sm uppercase tracking-wider mb-4 flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <span>Top Priority Actions ({priorityActions.length})</span>
            </h3>
            <div className="space-y-3.5">
              {priorityActions.map((action, idx) => (
                <div key={idx} className="flex gap-3 items-start text-sm bg-white/[0.02] border border-white/5 p-3 rounded-xl">
                  <div className="w-5 h-5 rounded-lg bg-red-500/15 text-red-400 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5 border border-red-500/10">
                    {idx + 1}
                  </div>
                  <div className="text-gray-300">
                    <strong className="text-white block mb-0.5">{action.title}</strong>
                    <span className="text-xs text-gray-400 block mb-1">{action.detail}</span>
                    <span className="text-xs text-[#FF8C42] font-medium flex items-center gap-1">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 5l7 7m0 0l-7 7m7-7H3" />
                      </svg>
                      <span>Fix: {action.fix}</span>
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Category Scores */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
          {categoryScores.map((cat, idx) => (
            <div 
              key={idx} 
              className="glass-card flex items-center gap-4 p-4 border border-white/10 rounded-2xl bg-white/[0.02] hover:scale-[1.02] transition-transform duration-300 shadow-sm"
            >
              <div className="p-3 bg-white/5 rounded-xl">
                {getCategoryIcon(cat.name)}
              </div>
              <div>
                <div className={`text-2xl font-black ${getScoreColor(cat.score)} tracking-tight`}>
                  {cat.score}%
                </div>
                <div className="text-[10px] text-gray-400 uppercase tracking-widest font-semibold">{cat.name}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Detailed Audit breakdown grouped */}
        <div className="space-y-6 mb-12">
          {Object.entries(groups).map(([groupName, items], idx) => (
            <div key={idx} className="glass-card border border-white/10 rounded-2xl p-6 bg-white/[0.03] shadow-md">
              <div className="flex justify-between items-center mb-6 pb-4 border-b border-white/10">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white/5 rounded-lg">
                    {getCategoryIcon(groupName)}
                  </div>
                  <h3 className="text-base font-bold text-white uppercase tracking-wider">{groupName}</h3>
                </div>
                <span className="text-xs text-gray-500 font-semibold px-2 py-1 bg-white/5 rounded-lg border border-white/5">{items.length} Checks</span>
              </div>

              <div className="space-y-4">
                {items.map((item, itemIdx) => (
                  <div key={itemIdx} className="flex items-start gap-4 pb-4 border-b border-white/5 last:border-0 last:pb-0">
                    <span className="text-lg shrink-0 mt-1">{item.icon}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="font-bold text-white text-sm">{item.title}</h4>
                        {item.value && (
                          <span className="px-2 py-0.5 rounded bg-white/5 border border-white/10 text-[10px] text-gray-400 font-mono truncate max-w-[200px]" title={item.value}>
                            {item.value}
                          </span>
                        )}
                        {getStatusBadge(item.status)}
                      </div>
                      <p className="text-xs text-gray-400 mt-1.5 leading-relaxed">{item.detail}</p>
                      {item.fix && (
                        <p className="text-xs text-[#FF8C42] mt-2 font-medium flex items-start gap-1 bg-[#FF6B35]/5 border border-[#FF6B35]/10 p-2 rounded-lg">
                          <span className="font-bold text-[#FF6B35] uppercase tracking-wider text-[9px] mt-0.5 bg-[#FF6B35]/10 px-1 py-0.5 rounded">Action</span>
                          <span>{item.fix}</span>
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Final CTA */}
        <div className="glass-card text-center py-10 px-6 border border-[#FF6B35]/20 rounded-2xl bg-gradient-to-b from-[#FF6B35]/5 to-transparent print:hidden shadow-inner">
          <h3 className="text-2xl font-black text-white mb-2 tracking-tight">Ready to fix these issues?</h3>
          <p className="text-sm text-gray-400 max-w-md mx-auto mb-6">
            Get a professional audit and expert consultation to rank your business higher and drive more revenue.
          </p>
          <button
            onClick={() => router.push('/contact')}
            className="px-8 py-3.5 rounded-xl bg-gradient-to-r from-[#FF6B35] to-[#FF8C42] hover:from-[#FF8C42] hover:to-[#FFA550] text-white font-extrabold shadow-lg hover:shadow-[#FF6B35]/20 transition-all duration-300 hover:scale-[1.02]"
          >
            Book a Free Consultation
          </button>
        </div>

      </div>
    </main>
  )
}
