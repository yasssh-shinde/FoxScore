import { AuditItem } from '@/types'

export type Recommendations = {
  improvements: string[]
  strengths: string[]
  priorityActions: {
    title: string
    detail: string
    fix: string
    severity: 'fail' | 'warning'
  }[]
}

export function generateRecommendations(
  allAuditItems: AuditItem[],
  isSPA: boolean,
  spaFramework: string | null
): Recommendations {
  const improvements: string[] = []
  const strengths: string[] = []
  const priorityActions: Recommendations['priorityActions'] = []

  // If SPA, we insert a helpful alert to explain why some structural audits might appear low
  if (isSPA) {
    strengths.push(`✨ Detected SPA Framework: ${spaFramework || 'React/Vue/Next.js'}. Website uses modern client-side rendering.`)
  }

  // Separate improvements and strengths
  allAuditItems.forEach((item) => {
    if (item.status === 'fail' || item.status === 'warning') {
      const emoji = item.status === 'fail' ? '❌' : '⚠️'
      improvements.push(`${emoji} ${item.metric}: ${item.description}`)

      // Build actionable priority lists
      let fix = `Configure and optimize ${item.metric.toLowerCase()} settings.`
      if (item.metric === 'Title Tag') fix = 'Add a title tag containing 50-60 characters and place key keywords near the beginning.'
      if (item.metric === 'Meta Description') fix = 'Add a meta description (120-160 chars) explaining the page topic and adding a CTA.'
      if (item.metric === 'H1 Heading') fix = 'Add exactly one <h1> tag on the page with your target keywords.'
      if (item.metric === 'Mobile Viewport') fix = 'Add <meta name="viewport" content="width=device-width, initial-scale=1.0"> inside your html <head>.'
      if (item.metric === 'Image Alt Tags') fix = 'Add descriptive alt="Description of image" attributes to all image tags.'
      if (item.metric === 'SSL / HTTPS') fix = 'Install an SSL certificate and redirect all HTTP traffic to HTTPS.'
      if (item.metric === 'Response Time') fix = 'Optimize server databases, setup caching layers, or migrate to a faster CDN.'
      if (item.metric === 'Security Headers') fix = 'Configure HSTS, CSP, X-Frame-Options, and X-Content-Type-Options headers on your server.'

      priorityActions.push({
        title: item.metric,
        detail: item.description,
        fix,
        severity: item.status,
      })
    } else {
      strengths.push(`✅ ${item.metric}: ${item.description}`)
    }
  })

  // Sort priority actions so 'fail' items appear before 'warning' items
  priorityActions.sort((a, b) => {
    if (a.severity === 'fail' && b.severity !== 'fail') return -1
    if (a.severity !== 'fail' && b.severity === 'fail') return 1
    return 0
  })

  return {
    improvements,
    strengths,
    priorityActions: priorityActions.slice(0, 5), // Keep top 5 priorities
  }
}
