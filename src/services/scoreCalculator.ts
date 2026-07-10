import { AuditData, AuditItem, ScoreResult } from '@/types'
import { scanWebsite } from './websiteScanner'

const WEIGHTS = {
  website: 0.30,
  seo: 0.25,
  google: 0.20,
  social: 0.15,
  engagement: 0.10,
}

const AUDIT_WEIGHTS = {
  website: {
    hasWebsite: 0.05,
    https: 0.05,
    mobileFriendly: 0.05,
    pageSpeed: 0.05,
    metaTitle: 0.03,
    metaDescription: 0.02,
  },
  seo: {
    domainAge: 0.05,
    indexedPages: 0.05,
    brokenLinks: 0.05,
    imageAltTags: 0.05,
    seoHealth: 0.05,
  },
  google: {
    businessExists: 0.08,
    reviews: 0.07,
    ratings: 0.05,
  },
  social: {
    instagram: 0.05,
    facebook: 0.05,
    linkedin: 0.05,
  },
}

export function calculateScore(auditData: AuditData): ScoreResult {
  const websiteScore = calculateCategoryScore(auditData.website) // 0 to 100
  const seoScore = calculateCategoryScore(auditData.seo) // 0 to 100
  const googleScore = calculateCategoryScore(auditData.google) // 0 to 100
  const socialScore = calculateCategoryScore(auditData.social) // 0 to 100

  // Adjusted weights: website=35%, seo=30%, google=20%, social=15% (sum to 100%)
  const overall = Math.round(
    websiteScore * 0.35 +
    seoScore * 0.30 +
    googleScore * 0.20 +
    socialScore * 0.15
  )

  return {
    overall: Math.round(overall),
    website: Math.round(websiteScore),
    seo: Math.round(seoScore),
    google: Math.round(googleScore),
    social: Math.round(socialScore),
    won: false,
  }
}

function calculateCategoryScore(items: AuditItem[]): number {
  if (items.length === 0) return 0

  let totalScore = 0
  let totalWeight = 0
  items.forEach((item) => {
    const score = item.status === 'pass' ? item.weight * 100 : item.status === 'warning' ? item.weight * 50 : 0
    totalScore += score
    totalWeight += item.weight * 100
  })

  if (totalWeight === 0) return 0
  return Math.round((totalScore / totalWeight) * 100)
}

export async function generateAuditData(website: string): Promise<AuditData> {
  // Scan real website
  const scan = await scanWebsite(website)
  // Build audit items based on REAL scan results
  const improvements: string[] = []
  const strengths: string[] = []

  const websiteItems: AuditItem[] = [
    {
      metric: 'Has Website',
      status: scan.responds ? 'pass' : 'fail',
      description: scan.responds ? 'Website is accessible' : 'Website did not respond',
      weight: 0.05
    },
    {
      metric: 'HTTPS/SSL',
      status: scan.hasHttps ? 'pass' : 'fail',
      description: scan.hasHttps ? 'SSL certificate installed' : 'Not using HTTPS',
      weight: 0.05
    },
    {
      metric: 'Mobile Friendly',
      status: scan.isMobile ? 'pass' : 'warning',
      description: scan.isMobile ? 'Viewport meta tag present' : 'Mobile viewport not configured',
      weight: 0.05
    },
    {
      metric: 'Meta Title',
      status: scan.hasMetaTitle ? 'pass' : 'fail',
      description: scan.hasMetaTitle ? 'Meta title present' : 'Missing meta title',
      weight: 0.03
    },
    {
      metric: 'Meta Description',
      status: scan.hasMetaDescription ? 'pass' : 'fail',
      description: scan.hasMetaDescription ? 'Meta description found' : 'Missing meta description',
      weight: 0.02
    },
  ]

  const seoItems: AuditItem[] = [
    {
      metric: 'Robots.txt',
      status: scan.hasRobots ? 'pass' : 'warning',
      description: scan.hasRobots ? 'Robots.txt configured' : 'Robots.txt not found',
      weight: 0.05
    },
    {
      metric: 'Sitemap',
      status: scan.hasSitemap ? 'pass' : 'warning',
      description: scan.hasSitemap ? 'Sitemap present' : 'Sitemap not found',
      weight: 0.05
    },
    {
      metric: 'H1 Tags',
      status: scan.hasH1 ? 'pass' : 'warning',
      description: scan.hasH1 ? 'H1 tag present' : 'Missing H1 tag',
      weight: 0.05
    },
    {
      metric: 'Image Alt Tags',
      status: scan.hasImages === 0 ? 'warning' : scan.imagesWithAlt / scan.hasImages > 0.7 ? 'pass' : 'warning',
      description: `${scan.imagesWithAlt}/${scan.hasImages} images have alt tags`,
      weight: 0.05
    },
  ]

  const googleItems: AuditItem[] = [
    {
      metric: 'Scan Result',
      status: scan.responds ? 'pass' : 'fail',
      description: scan.responds ? 'Website accessible' : scan.error || 'Website not accessible',
      weight: 0.08
    },
  ]

  const socialItems: AuditItem[] = [
    {
      metric: 'Social Links',
      status: scan.responds ? 'warning' : 'fail',
      description: 'Social media links need verification',
      weight: 0.05
    },
  ]

  // Build improvements list from failures/warnings
  websiteItems.forEach((item: any) => {
    if (item.status === 'fail' || item.status === 'warning') improvements.push(`❌ ${item.metric}: ${item.description}`)
  })
  seoItems.forEach((item: any) => {
    if (item.status === 'fail' || item.status === 'warning') improvements.push(`❌ ${item.metric}: ${item.description}`)
  })

  // Add auto-detected strengths
  if (scan.hasHttps) strengths.push('✅ HTTPS/SSL Secured')
  if (scan.hasMetaTitle) strengths.push('✅ Meta Title Configured')
  if (scan.isMobile) strengths.push('✅ Mobile Friendly')
  if (scan.hasRobots) strengths.push('✅ Robots.txt Present')
  if (scan.responds) strengths.push('✅ Website Responsive')

  const selectedIssues = improvements
  const selectedStrengths = strengths

  return {
    website: websiteItems,
    seo: seoItems,
    google: googleItems,
    social: socialItems,
    improvements: selectedIssues,
    strengths: selectedStrengths,
    html: scan.html,
  }
}
