import { AuditItem, ScoreResult } from '@/types'

export function calculateCategoryScore(items: AuditItem[]): number {
  if (items.length === 0) return 100

  let totalPointsEarned = 0
  let totalMaxPoints = 0

  items.forEach((item) => {
    // Treat 'pass' as 100% of weight, 'warning' as 50% of weight, 'fail' as 0%
    const scoreMultiplier = item.status === 'pass' ? 1.0 : item.status === 'warning' ? 0.5 : 0.0
    totalPointsEarned += (item.weight * 100) * scoreMultiplier
    totalMaxPoints += (item.weight * 100)
  })

  if (totalMaxPoints === 0) return 100
  return Math.round((totalPointsEarned / totalMaxPoints) * 100)
}

export function calculateOverallScore(
  performanceScore: number,
  seoScore: number,
  accessibilityScore: number,
  securityScore: number
): number {
  // Production-grade weighted average (Sum = 1.00)
  // performance (Website Speed) = 35%
  // seo (On-Page SEO) = 30%
  // accessibility (Google Presence) = 20%
  // security (Social/Security) = 15%
  const overall = (
    performanceScore * 0.35 +
    seoScore * 0.30 +
    accessibilityScore * 0.20 +
    securityScore * 0.15
  )

  return Math.round(overall)
}
