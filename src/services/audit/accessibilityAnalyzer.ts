import { AuditItem } from '@/types'
import { ParsedMetadata } from './htmlParser'

export function analyzeAccessibility(meta: ParsedMetadata): AuditItem[] {
  const items: AuditItem[] = []

  // 1. Mobile Responsive Viewport
  items.push({
    metric: 'Mobile Viewport',
    status: meta.viewport ? 'pass' : 'fail',
    value: meta.viewport ? 'Configured' : 'Missing',
    description: meta.viewport 
      ? `Viewport meta tag is set correctly: "${meta.viewport}"` 
      : 'Viewport meta tag is missing. This is a critical barrier for mobile accessibility.',
    weight: 0.05,
  })

  // 2. HTML Language Attribute
  items.push({
    metric: 'HTML Lang Tag',
    status: meta.lang ? 'pass' : 'warning',
    value: meta.lang || 'Missing',
    description: meta.lang 
      ? `Language attribute set to "${meta.lang}". Helps screen readers vocalize content properly.` 
      : 'Language attribute is missing from the <html> tag.',
    weight: 0.03,
  })

  // 3. Image Alt Attributes
  const totalImgs = meta.images.total
  const missingAlt = meta.images.missingAlt

  if (totalImgs === 0) {
    items.push({
      metric: 'Image Alt Tags',
      status: 'pass',
      value: 'No images',
      description: 'No images found on the page, so no alt attributes are missing.',
      weight: 0.05,
    })
  } else if (missingAlt === totalImgs) {
    items.push({
      metric: 'Image Alt Tags',
      status: 'fail',
      value: `${missingAlt}/${totalImgs} missing`,
      description: 'All images on the page lack alt text. Screen readers and search bots cannot read these images.',
      weight: 0.05,
    })
  } else if (missingAlt > 0) {
    items.push({
      metric: 'Image Alt Tags',
      status: 'warning',
      value: `${missingAlt}/${totalImgs} missing`,
      description: `${missingAlt} of ${totalImgs} images are missing alternative text attributes.`,
      weight: 0.05,
    })
  } else {
    items.push({
      metric: 'Image Alt Tags',
      status: 'pass',
      value: '0 missing',
      description: 'All images on the page have descriptive alt text tags configured.',
      weight: 0.05,
    })
  }

  // 4. Accessible Links (No empty hash links)
  const emptyLinks = meta.links.emptyHref
  if (emptyLinks > 0) {
    items.push({
      metric: 'Accessible Links',
      status: 'warning',
      value: `${emptyLinks} empty links`,
      description: `Detected ${emptyLinks} links with empty href tags (href="#"). Screen readers read these as empty clicks.`,
      weight: 0.03,
    })
  } else {
    items.push({
      metric: 'Accessible Links',
      status: 'pass',
      value: '0 empty links',
      description: 'All link tags point to descriptive destinations or contain actual URLs.',
      weight: 0.03,
    })
  }

  return items
}
