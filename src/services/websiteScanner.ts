// Real website scanning - basic checks
export async function scanWebsite(url: string) {
  const result = {
    hasHttps: false,
    responds: false,
    hasMetaTitle: false,
    hasMetaDescription: false,
    hasH1: false,
    isMobile: false,
    hasImages: 0,
    imagesWithAlt: 0,
    hasRobots: false,
    hasSitemap: false,
    error: null as string | null,
    html: '' as string,
  }

  try {
    // Ensure URL has protocol
    let fullUrl = url
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      fullUrl = 'https://' + url
    }

    // Check HTTPS
    result.hasHttps = fullUrl.startsWith('https://')

    console.log(`🔍 Scanning ${fullUrl}`)

    // Fetch website
    const response = await fetch(fullUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
      },
    })

    if (response.ok) {
      result.responds = true
      const html = await response.text()
      result.html = html

      // Parse HTML for basic tags
      const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i)
      result.hasMetaTitle = !!titleMatch

      const metaDescMatch = html.match(
        /<meta\s+name=["']?description["']?[^>]*content=["']([^"']*)["']/i
      )
      result.hasMetaDescription = !!metaDescMatch

      const h1Match = html.match(/<h1[^>]*>([^<]+)<\/h1>/i)
      result.hasH1 = !!h1Match

      // Check for viewport (mobile friendly indicator)
      result.isMobile = /viewport/i.test(html)

      // Count images and alt tags
      const imgMatches = html.match(/<img[^>]*>/gi) || []
      result.hasImages = imgMatches.length
      result.imagesWithAlt = imgMatches.filter((img: any) => /alt=/i.test(img)).length

      // Check for robots.txt
      try {
        const robotsUrl = new URL(fullUrl)
        robotsUrl.pathname = '/robots.txt'
        const robotsResp = await fetch(robotsUrl.toString())
        result.hasRobots = robotsResp.ok
      } catch {
        result.hasRobots = false
      }

      // Check for sitemap
      let hasSitemapFile = false
      try {
        const sitemapUrl = new URL(fullUrl)
        sitemapUrl.pathname = '/sitemap.xml'
        const sitemapResp = await fetch(sitemapUrl.toString(), { method: 'HEAD' }).catch(() => null)
        if (sitemapResp && sitemapResp.ok) {
          hasSitemapFile = true
        } else {
          // Check common WordPress sitemap index
          sitemapUrl.pathname = '/sitemap_index.xml'
          const wpSitemapResp = await fetch(sitemapUrl.toString(), { method: 'HEAD' }).catch(() => null)
          hasSitemapFile = wpSitemapResp ? wpSitemapResp.ok : false
        }
      } catch {
        hasSitemapFile = false
      }

      result.hasSitemap =
        hasSitemapFile ||
        /sitemap/i.test(html) ||
        html.includes('sitemap.xml') ||
        html.includes('sitemap.xml.gz')

      console.log('✅ Scan successful:', result)
    } else {
      result.error = `Website returned ${response.status}`
      console.log('❌ Site returned status:', response.status)
    }
  } catch (error) {
    result.error = error instanceof Error ? error.message : 'Failed to scan'
    console.error('❌ Scan error:', result.error)
  }

  return result
}
