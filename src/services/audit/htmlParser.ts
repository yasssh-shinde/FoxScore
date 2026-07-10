import * as cheerio from 'cheerio'

export type ParsedMetadata = {
  title: string | null
  description: string | null
  viewport: string | null
  charset: string | null
  lang: string | null
  favicon: string | null
  canonical: string | null
  openGraph: {
    title: string | null
    description: string | null
    image: string | null
  }
  twitterCard: {
    card: string | null
    title: string | null
    description: string | null
    image: string | null
  }
  headings: {
    h1s: string[]
    h2s: string[]
    h3s: string[]
    h4s: string[]
  }
  images: {
    total: number
    missingAlt: number
    withAlt: number
    lazyLoaded: number
  }
  links: {
    total: number
    internal: string[]
    external: string[]
    emptyHref: number
  }
  scripts: {
    total: number
    inline: number
  }
  stylesheets: {
    total: number
    inline: number
  }
  resourceHints: {
    preconnect: number
    dnsPrefetch: number
    preload: number
    prefetch: number
  }
  structuredData: {
    jsonLdCount: number
    types: string[]
  }
  wordCount: number
  textRatio: number // Ratio of text to HTML size
}

export function parseHtml(html: string, siteUrl: string): ParsedMetadata {
  const $ = cheerio.load(html)

  // 1. Core Meta
  const title = $('title').first().text().trim() || null
  const description = $('meta[name="description"]').attr('content')?.trim() || null
  const viewport = $('meta[name="viewport"]').attr('content')?.trim() || null
  const charset = $('meta[charset]').attr('charset')?.trim() || $('meta[http-equiv="Content-Type"]').attr('content')?.match(/charset=([\w\-]+)/i)?.[1] || null
  const lang = $('html').attr('lang')?.trim() || null
  
  // Favicon check
  let favicon = $('link[rel*="icon"]').attr('href')?.trim() || null
  if (favicon && !favicon.startsWith('http')) {
    try {
      const base = new URL(siteUrl)
      favicon = new URL(favicon, base).toString()
    } catch {}
  }

  // Canonical
  const canonical = $('link[rel="canonical"]').attr('href')?.trim() || null

  // 2. OpenGraph
  const openGraph = {
    title: $('meta[property="og:title"]').attr('content')?.trim() || null,
    description: $('meta[property="og:description"]').attr('content')?.trim() || null,
    image: $('meta[property="og:image"]').attr('content')?.trim() || null,
  }

  // 3. Twitter Card
  const twitterCard = {
    card: $('meta[name="twitter:card"]').attr('content')?.trim() || null,
    title: $('meta[name="twitter:title"]').attr('content')?.trim() || null,
    description: $('meta[name="twitter:description"]').attr('content')?.trim() || null,
    image: $('meta[name="twitter:image"]').attr('content')?.trim() || null,
  }

  // 4. Headings
  const h1s: string[] = []
  $('h1').each((_, el) => { h1s.push($(el).text().trim()) })
  const h2s: string[] = []
  $('h2').each((_, el) => { h2s.push($(el).text().trim()) })
  const h3s: string[] = []
  $('h3').each((_, el) => { h3s.push($(el).text().trim()) })
  const h4s: string[] = []
  $('h4').each((_, el) => { h4s.push($(el).text().trim()) })

  // 5. Images
  const allImgs = $('img')
  const totalImages = allImgs.length
  let missingAlt = 0
  let withAlt = 0
  let lazyLoaded = 0

  allImgs.each((_, el) => {
    const alt = $(el).attr('alt')
    const loading = $(el).attr('loading')
    if (!alt || alt.trim() === '') {
      missingAlt++
    } else {
      withAlt++
    }
    if (loading === 'lazy') {
      lazyLoaded++
    }
  })

  // 6. Links
  const allLinks = $('a')
  const totalLinks = allLinks.length
  const internal: string[] = []
  const external: string[] = []
  let emptyHref = 0

  allLinks.each((_, el) => {
    const href = $(el).attr('href')?.trim()
    if (!href) {
      emptyHref++
      return
    }
    if (href === '#' || href.startsWith('javascript:')) {
      emptyHref++
      return
    }

    if (href.startsWith('/') || href.startsWith('.') || href.includes(siteUrl.replace(/https?:\/\/(www\.)?/, ''))) {
      internal.push(href)
    } else if (href.startsWith('http')) {
      external.push(href)
    }
  })

  // 7. Scripts
  const allScripts = $('script')
  const totalScripts = allScripts.length
  let inlineScripts = 0
  allScripts.each((_, el) => {
    const src = $(el).attr('src')
    if (!src) {
      inlineScripts++
    }
  })

  // 8. Stylesheets
  const stylesheets = $('link[rel="stylesheet"]')
  const totalStylesheets = stylesheets.length
  let inlineStyles = $('style').length

  // 9. Resource Hints
  const preconnect = $('link[rel="preconnect"]').length
  const dnsPrefetch = $('link[rel="dns-prefetch"]').length
  const preload = $('link[rel="preload"]').length
  const prefetch = $('link[rel="prefetch"]').length

  // 10. Structured Data
  let jsonLdCount = 0
  const types: string[] = []
  $('script[type="application/ld+json"]').each((_, el) => {
    jsonLdCount++
    try {
      const data = JSON.parse($(el).html() || '{}')
      if (data['@type']) {
        if (Array.isArray(data['@type'])) {
          types.push(...data['@type'])
        } else {
          types.push(data['@type'])
        }
      }
    } catch {}
  })

  // 11. Word count & Text-to-HTML Ratio
  // Remove scripts, styles, hidden comments, and get visible text
  $('script, style, noscript, iframe, svg').remove()
  const text = $('body').text() || $.text()
  const cleanedText = text.replace(/\s+/g, ' ').trim()
  const wordCount = cleanedText.split(/\s+/).filter(w => w.length > 1).length
  const textRatio = html.length > 0 ? parseFloat(((cleanedText.length / html.length) * 100).toFixed(2)) : 0

  return {
    title,
    description,
    viewport,
    charset,
    lang,
    favicon,
    canonical,
    openGraph,
    twitterCard,
    headings: { h1s, h2s, h3s, h4s },
    images: {
      total: totalImages,
      missingAlt,
      withAlt,
      lazyLoaded,
    },
    links: {
      total: totalLinks,
      internal,
      external,
      emptyHref,
    },
    scripts: {
      total: totalScripts,
      inline: inlineScripts,
    },
    stylesheets: {
      total: totalStylesheets,
      inline: inlineStyles,
    },
    resourceHints: {
      preconnect,
      dnsPrefetch,
      preload,
      prefetch,
    },
    structuredData: {
      jsonLdCount,
      types: Array.from(new Set(types)),
    },
    wordCount,
    textRatio,
  }
}
