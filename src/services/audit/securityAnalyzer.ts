import { AuditItem } from '@/types'
import { ParsedMetadata } from './htmlParser'

export function analyzeSecurity(
  meta: ParsedMetadata,
  sslValid: boolean,
  headers: Record<string, string>
): AuditItem[] {
  const items: AuditItem[] = []

  // 1. SSL/HTTPS Check
  items.push({
    metric: 'SSL / HTTPS',
    status: sslValid ? 'pass' : 'fail',
    value: sslValid ? 'Secure' : 'Unsecure',
    description: sslValid 
      ? 'SSL certificate is configured correctly. Communication with the website is encrypted.' 
      : 'SSL certificate is missing or website uses unsecure HTTP. This is a critical security vulnerability.',
    weight: 0.05,
  })

  // 2. Canonical URL Tag
  items.push({
    metric: 'Canonical Tag',
    status: meta.canonical ? 'pass' : 'warning',
    value: meta.canonical ? 'Configured' : 'Missing',
    description: meta.canonical 
      ? `Canonical tag points to: "${meta.canonical}"` 
      : 'Canonical tag is missing. Search engines might index duplicate pages.',
    weight: 0.03,
  })

  // 3. Security Headers
  const hsts = headers['strict-transport-security']
  const xfo = headers['x-frame-options']
  const xcto = headers['x-content-type-options']
  const csp = headers['content-security-policy']

  let securityHeadersCount = 0
  const missingHeaders: string[] = []

  if (hsts) securityHeadersCount++
  else missingHeaders.push('HSTS')

  if (xfo) securityHeadersCount++
  else missingHeaders.push('X-Frame-Options')

  if (xcto) securityHeadersCount++
  else missingHeaders.push('X-Content-Type-Options')

  if (csp) securityHeadersCount++
  else missingHeaders.push('CSP')

  if (securityHeadersCount === 4) {
    items.push({
      metric: 'Security Headers',
      status: 'pass',
      value: '4/4 configured',
      description: 'All key security headers configured: HSTS, CSP, X-Frame-Options, X-Content-Type-Options.',
      weight: 0.02,
    })
  } else if (securityHeadersCount >= 2) {
    items.push({
      metric: 'Security Headers',
      status: 'warning',
      value: `${securityHeadersCount}/4 configured`,
      description: `Missing important security headers: ${missingHeaders.join(', ')}. Configure these to prevent clickjacking and XSS.`,
      weight: 0.02,
    })
  } else {
    items.push({
      metric: 'Security Headers',
      status: 'fail',
      value: `${securityHeadersCount}/4 configured`,
      description: `Critical missing security headers: ${missingHeaders.join(', ')}. Your server is vulnerable to protocol downgrade and script injection.`,
      weight: 0.02,
    })
  }

  return items
}
