import { AuditData, AuditItem, ScoreResult } from '@/types'
import { scanWebsite } from './scanner'
import { parseHtml } from './htmlParser'
import { analyzeSeo } from './seoAnalyzer'
import { analyzeAccessibility } from './accessibilityAnalyzer'
import { analyzePerformance } from './performanceAnalyzer'
import { analyzeSecurity } from './securityAnalyzer'
import { calculateCategoryScore, calculateOverallScore } from './scoreEngine'
import { generateRecommendations } from './recommendationEngine'

export type FullAuditReport = {
  success: boolean
  error: string | null
  url: string
  finalUrl: string
  isSPA: boolean
  spaFramework: string | null
  responseTimeMs: number
  scores: ScoreResult
  auditData: AuditData & {
    priorityActions: any[]
  }
}

export async function runFullAudit(websiteUrl: string): Promise<FullAuditReport> {
  try {
    // 1. Crawl URL
    const scan = await scanWebsite(websiteUrl)

    if (scan.error && scan.status === 0) {
      return {
        success: false,
        error: `Could not crawl website: ${scan.error}`,
        url: websiteUrl,
        finalUrl: websiteUrl,
        isSPA: false,
        spaFramework: null,
        responseTimeMs: scan.responseTimeMs,
        scores: { overall: 0, website: 0, seo: 0, google: 0, social: 0, won: false },
        auditData: { website: [], seo: [], google: [], social: [], improvements: [], strengths: [], priorityActions: [] },
      }
    }

    // 2. Parse HTML
    const meta = parseHtml(scan.html, scan.finalUrl)

    // 3. Run Analyzers
    let seoItems = analyzeSeo(meta, scan.hasRobots, scan.hasSitemap)
    let accessibilityItems = analyzeAccessibility(meta)
    let performanceItems = analyzePerformance(meta, scan.responseTimeMs)
    let securityItems = analyzeSecurity(meta, scan.sslValid, scan.headers)

    // 4. SPA Mitigation Strategy
    // Adjust audits if the site is a client-side rendered SPA to avoid false failures
    if (scan.isSPA) {
      const spaNote = ` (SPA Fallback: content is dynamically rendered using ${scan.spaFramework || 'JavaScript'})`
      
      seoItems = seoItems.map((item) => {
        if (item.metric === 'Content Depth' && (item.status === 'fail' || item.status === 'warning')) {
          return {
            ...item,
            status: 'warning',
            value: 'SPA Dynamic',
            description: `SPA dynamic content loaded via JS. Verify that your framework is configured for SSR (Server-Side Rendering) or SSG (Static Generation) for indexability.${spaNote}`,
          }
        }
        if (item.metric === 'H1 Heading' && item.status === 'fail') {
          return {
            ...item,
            status: 'warning',
            value: 'SPA Dynamic',
            description: `H1 tag may be dynamically generated in client-side runtime.${spaNote}`,
          }
        }
        return item
      })

      accessibilityItems = accessibilityItems.map((item) => {
        if (item.metric === 'Image Alt Tags' && item.status === 'fail') {
          return {
            ...item,
            status: 'warning',
            value: 'SPA Dynamic',
            description: `Images may be populated dynamically via javascript. Ensure you supply alt attributes statically or in code components.${spaNote}`,
          }
        }
        return item
      })
    }

    // 5. Calculate Scores (Single Source of Truth)
    // Map categories:
    // website_score = performance items
    // seo_score = seo items
    // google_score = accessibility items
    // social_score = security items
    const websiteScore = calculateCategoryScore(performanceItems)
    const seoScore = calculateCategoryScore(seoItems)
    const googleScore = calculateCategoryScore(accessibilityItems)
    const socialScore = calculateCategoryScore(securityItems)
    const overallScore = calculateOverallScore(websiteScore, seoScore, googleScore, socialScore)

    // 6. Generate Actionable Recommendations
    const allItems = [...seoItems, ...accessibilityItems, ...performanceItems, ...securityItems]
    const recs = generateRecommendations(allItems, scan.isSPA, scan.spaFramework)

    return {
      success: true,
      error: null,
      url: websiteUrl,
      finalUrl: scan.finalUrl,
      isSPA: scan.isSPA,
      spaFramework: scan.spaFramework,
      responseTimeMs: scan.responseTimeMs,
      scores: {
        overall: overallScore,
        website: websiteScore,
        seo: seoScore,
        google: googleScore,
        social: socialScore,
        won: false,
      },
      auditData: {
        website: performanceItems,
        seo: seoItems,
        google: accessibilityItems,
        social: securityItems,
        improvements: recs.improvements,
        strengths: recs.strengths,
        priorityActions: recs.priorityActions,
      },
    }
  } catch (err: any) {
    console.error('🔴 Error building audit report:', err)
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Failed to generate audit report',
      url: websiteUrl,
      finalUrl: websiteUrl,
      isSPA: false,
      spaFramework: null,
      responseTimeMs: 0,
      scores: { overall: 0, website: 0, seo: 0, google: 0, social: 0, won: false },
      auditData: { website: [], seo: [], google: [], social: [], improvements: [], strengths: [], priorityActions: [] },
    }
  }
}
