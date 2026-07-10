import { AuditItem } from '@/types'

export type ScanResult = {
  url: string
  finalUrl: string
  html: string
  status: number
  headers: Record<string, string>
  isSPA: boolean
  spaFramework: string | null
  error: string | null
  sslValid: boolean
  responseTimeMs: number
  hasRobots: boolean
  hasSitemap: boolean
}

const FRAMEWORK_SIGNATURES = [
  { name: 'Next.js', regex: /id="__next"|_next\/static|__NEXT_DATA__/i },
  { name: 'React', regex: /id="root"|react\.development\.js|react\.production|react-dom/i },
  { name: 'Vue', regex: /id="app"|vue\.js|vue\.runtime|nuxt/i },
  { name: 'Angular', regex: /ng-version|ng-app|ng-controller/i },
  { name: 'Svelte', regex: /__svelte|svelte-/i },
]

export async function scanWebsite(url: string, maxAttempts = 3): Promise<ScanResult> {
  const result: ScanResult = {
    url,
    finalUrl: url,
    html: '',
    status: 0,
    headers: {},
    isSPA: false,
    spaFramework: null,
    error: null,
    sslValid: false,
    responseTimeMs: 0,
    hasRobots: false,
    hasSitemap: false,
  }

  // Normalize URL protocol
  let targetUrl = url.trim()
  if (!targetUrl.startsWith('http://') && !targetUrl.startsWith('https://')) {
    targetUrl = 'https://' + targetUrl
  }

  result.finalUrl = targetUrl
  result.sslValid = targetUrl.startsWith('https://')

  let attempt = 0
  let delay = 1000 // Start with 1s retry delay
  const startTime = Date.now()

  while (attempt < maxAttempts) {
    attempt++
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 8000) // 8 second timeout per attempt

    try {
      console.log(`🌐 Crawling attempt ${attempt}/${maxAttempts} for: ${targetUrl}`)
      const response = await fetch(targetUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 FoxScoreAuditEngine/2.0',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.5',
          'Accept-Encoding': 'gzip, deflate, br',
        },
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      result.status = response.status
      result.responseTimeMs = Date.now() - startTime
      result.finalUrl = response.url

      // Read response headers
      response.headers.forEach((value, key) => {
        result.headers[key.toLowerCase()] = value
      })

      if (!response.ok) {
        throw new Error(`HTTP Error ${response.status}: ${response.statusText}`)
      }

      // Check Content-Length to protect against large payloads
      const contentLengthHeader = response.headers.get('content-length')
      if (contentLengthHeader) {
        const size = parseInt(contentLengthHeader, 10)
        if (size > 5 * 1024 * 1024) {
          throw new Error('Response payload exceeds maximum size threshold (5MB)')
        }
      }

      // Read text and double check actual size limit
      const htmlText = await response.text()
      if (htmlText.length > 5 * 1024 * 1024) {
        throw new Error('Response text content exceeds maximum size threshold (5MB)')
      }

      result.html = htmlText

      // Detect if it is a Single Page Application (SPA)
      // Check if body is very light but framework signatures exist
      const bodyMatch = htmlText.match(/<body[^>]*>([\s\S]*?)<\/body>/i)
      const bodyContent = bodyMatch ? bodyMatch[1] : htmlText
      const wordCount = bodyContent.replace(/<[^>]*>/g, '').trim().split(/\s+/).filter(Boolean).length

      // Framework matching
      for (const fw of FRAMEWORK_SIGNATURES) {
        if (fw.regex.test(htmlText)) {
          result.isSPA = true
          result.spaFramework = fw.name
          break
        }
      }

      // If word count is extremely low but we found a framework or typical root divs
      if (wordCount < 100 && (result.isSPA || /id=["'](root|app|__next)["']/i.test(htmlText))) {
        result.isSPA = true
        if (!result.spaFramework) {
          result.spaFramework = 'Client-Side Framework (SPA)'
        }
      }

      // -------------------------------------------------------------
      // Robots.txt & Sitemap.xml crawl validations
      // -------------------------------------------------------------
      
      // Check robots.txt (non-blocking)
      try {
        const robotsUrl = new URL(result.finalUrl)
        robotsUrl.pathname = '/robots.txt'
        const robotsResp = await fetch(robotsUrl.toString(), { 
          method: 'GET',
          headers: { 'User-Agent': 'FoxScoreAuditEngine/2.0' }
        }).catch(() => null)
        result.hasRobots = !!(robotsResp && robotsResp.ok)
      } catch {
        result.hasRobots = false
      }

      // Check sitemap.xml files (non-blocking)
      let hasSitemapFile = false
      try {
        const sitemapUrl = new URL(result.finalUrl)
        sitemapUrl.pathname = '/sitemap.xml'
        const sitemapResp = await fetch(sitemapUrl.toString(), { 
          method: 'HEAD',
          headers: { 'User-Agent': 'FoxScoreAuditEngine/2.0' }
        }).catch(() => null)
        
        if (sitemapResp && sitemapResp.ok) {
          hasSitemapFile = true
        } else {
          // Check common WordPress sitemap index
          sitemapUrl.pathname = '/sitemap_index.xml'
          const wpSitemapResp = await fetch(sitemapUrl.toString(), { 
            method: 'HEAD',
            headers: { 'User-Agent': 'FoxScoreAuditEngine/2.0' }
          }).catch(() => null)
          hasSitemapFile = !!(wpSitemapResp && wpSitemapResp.ok)
        }
      } catch {
        hasSitemapFile = false
      }

      // Fallback: check if sitemap is referenced inside HTML
      result.hasSitemap =
        hasSitemapFile ||
        /sitemap/i.test(htmlText) ||
        htmlText.includes('sitemap.xml') ||
        htmlText.includes('sitemap.xml.gz')

      result.error = null
      break // Success!
    } catch (err: any) {
      clearTimeout(timeoutId)
      result.error = err instanceof Error ? err.message : 'Unknown network failure'
      result.responseTimeMs = Date.now() - startTime

      if (err.name === 'AbortError') {
        result.error = 'Connection request timed out (8000ms)'
      }

      // If we ran out of attempts, stop retrying
      if (attempt >= maxAttempts) {
        break
      }

      // Exponential backoff delay
      console.warn(`⚠️ Attempt ${attempt} failed: ${result.error}. Retrying in ${delay}ms...`)
      await new Promise((resolve) => setTimeout(resolve, delay))
      delay *= 2
    }
  }

  return result
}
