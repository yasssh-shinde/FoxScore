import { AuditItem } from '@/types'
import { ParsedMetadata } from './htmlParser'

export function analyzePerformance(meta: ParsedMetadata, responseTimeMs: number): AuditItem[] {
  const items: AuditItem[] = []

  // 1. Server Response Time
  if (responseTimeMs > 2000) {
    items.push({
      metric: 'Response Time',
      status: 'fail',
      value: `${(responseTimeMs / 1000).toFixed(2)}s`,
      description: `Server response time is extremely slow (${responseTimeMs}ms). Aim for less than 800ms.`,
      weight: 0.05,
    })
  } else if (responseTimeMs > 800) {
    items.push({
      metric: 'Response Time',
      status: 'warning',
      value: `${(responseTimeMs / 1000).toFixed(2)}s`,
      description: `Server response time is moderate (${responseTimeMs}ms). Optimize database queries or caching.`,
      weight: 0.05,
    })
  } else {
    items.push({
      metric: 'Response Time',
      status: 'pass',
      value: `${responseTimeMs}ms`,
      description: `Server responded quickly in ${responseTimeMs}ms. Excellent hosting performance.`,
      weight: 0.05,
    })
  }

  // 2. Resource Bloat (Scripts & CSS)
  const totalAssets = meta.scripts.total + meta.stylesheets.total
  if (totalAssets > 40) {
    items.push({
      metric: 'Asset Bloat',
      status: 'fail',
      value: `${totalAssets} resources`,
      description: `High number of blocking resources (${meta.scripts.total} JS files, ${meta.stylesheets.total} CSS files). Merge and minify assets.`,
      weight: 0.03,
    })
  } else if (totalAssets > 20) {
    items.push({
      metric: 'Asset Bloat',
      status: 'warning',
      value: `${totalAssets} resources`,
      description: `Moderate assets detected (${totalAssets} resources). Defer non-critical scripts.`,
      weight: 0.03,
    })
  } else {
    items.push({
      metric: 'Asset Bloat',
      status: 'pass',
      value: `${totalAssets} resources`,
      description: `Optimal number of external assets loaded (${totalAssets} scripts/stylesheets).`,
      weight: 0.03,
    })
  }

  // 3. Image Lazy Loading
  const totalImgs = meta.images.total
  const lazyImgs = meta.images.lazyLoaded

  if (totalImgs > 3 && lazyImgs === 0) {
    items.push({
      metric: 'Image Optimization',
      status: 'warning',
      value: 'No lazy loading',
      description: `${totalImgs} images found without loading="lazy" attributes. Lazy load below-the-fold images to improve load times.`,
      weight: 0.03,
    })
  } else {
    items.push({
      metric: 'Image Optimization',
      status: 'pass',
      value: `${lazyImgs}/${totalImgs} lazy`,
      description: 'Images are optimized, or lazy loading is configured for performance.',
      weight: 0.03,
    })
  }

  // 4. Resource Hints (preconnect, dns-prefetch, preload)
  const totalHints = meta.resourceHints.preconnect + meta.resourceHints.dnsPrefetch + meta.resourceHints.preload
  if (totalHints === 0) {
    items.push({
      metric: 'Resource Hints',
      status: 'warning',
      value: 'None',
      description: 'No resource prefetching tags (preconnect, dns-prefetch, preload) found. Use hints to speed up asset delivery.',
      weight: 0.02,
    })
  } else {
    items.push({
      metric: 'Resource Hints',
      status: 'pass',
      value: `${totalHints} tags`,
      description: `Configured ${totalHints} resource hints to speed up asset and script load times.`,
      weight: 0.02,
    })
  }

  // 5. Code-to-Text Ratio
  if (meta.textRatio < 2.0) {
    items.push({
      metric: 'Text-to-HTML Ratio',
      status: 'fail',
      value: `${meta.textRatio}%`,
      description: `Extremely low visible text ratio (${meta.textRatio}%). The page is heavily bloated with inline code.`,
      weight: 0.02,
    })
  } else if (meta.textRatio < 10.0) {
    items.push({
      metric: 'Text-to-HTML Ratio',
      status: 'warning',
      value: `${meta.textRatio}%`,
      description: `Low visible text ratio (${meta.textRatio}%). Move inline CSS and Javascript to external files.`,
      weight: 0.02,
    })
  } else {
    items.push({
      metric: 'Text-to-HTML Ratio',
      status: 'pass',
      value: `${meta.textRatio}%`,
      description: `Healthy text-to-code ratio (${meta.textRatio}%). Efficient DOM content distribution.`,
      weight: 0.02,
    })
  }

  return items
}
