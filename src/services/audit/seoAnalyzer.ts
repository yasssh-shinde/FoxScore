import { AuditItem } from '@/types'
import { ParsedMetadata } from './htmlParser'

export function analyzeSeo(meta: ParsedMetadata, hasRobots: boolean, hasSitemap: boolean): AuditItem[] {
  const items: AuditItem[] = []

  // 1. Title Tag
  if (!meta.title) {
    items.push({
      metric: 'Title Tag',
      status: 'fail',
      value: 'Missing',
      description: 'No <title> tag found on the page. Title tags are critical for search engine rankings.',
      weight: 0.05,
    })
  } else if (meta.title.length < 30) {
    items.push({
      metric: 'Title Tag',
      status: 'warning',
      value: `${meta.title.length} chars`,
      description: `Title tag "${meta.title}" is too short. Title tags should be between 30 and 60 characters.`,
      weight: 0.05,
    })
  } else if (meta.title.length > 65) {
    items.push({
      metric: 'Title Tag',
      status: 'warning',
      value: `${meta.title.length} chars`,
      description: `Title tag "${meta.title.substring(0, 50)}..." is too long. Search engines will truncate it.`,
      weight: 0.05,
    })
  } else {
    items.push({
      metric: 'Title Tag',
      status: 'pass',
      value: `${meta.title.length} chars`,
      description: `Title tag length is ideal (${meta.title.length} characters) and contains descriptive branding.`,
      weight: 0.05,
    })
  }

  // 2. Meta Description
  if (!meta.description) {
    items.push({
      metric: 'Meta Description',
      status: 'fail',
      value: 'Missing',
      description: 'Meta description tag is missing. Write an attractive description to boost organic click-through rates.',
      weight: 0.05,
    })
  } else if (meta.description.length < 70) {
    items.push({
      metric: 'Meta Description',
      status: 'warning',
      value: `${meta.description.length} chars`,
      description: 'Meta description is too short. Try to write a description of 120-160 characters.',
      weight: 0.05,
    })
  } else if (meta.description.length > 165) {
    items.push({
      metric: 'Meta Description',
      status: 'warning',
      value: `${meta.description.length} chars`,
      description: 'Meta description is too long. Google will truncate it in Search Results.',
      weight: 0.05,
    })
  } else {
    items.push({
      metric: 'Meta Description',
      status: 'pass',
      value: `${meta.description.length} chars`,
      description: 'Meta description length is in the optimal range.',
      weight: 0.05,
    })
  }

  // 3. H1 Headings
  const h1Count = meta.headings.h1s.length
  if (h1Count === 0) {
    items.push({
      metric: 'H1 Heading',
      status: 'fail',
      value: 'None',
      description: 'No H1 heading tag found. H1 headings represent the primary topic of your page.',
      weight: 0.05,
    })
  } else if (h1Count > 1) {
    items.push({
      metric: 'H1 Heading',
      status: 'warning',
      value: `${h1Count} tags`,
      description: `Multiple (${h1Count}) H1 tags found. Best SEO practice is to have exactly one H1 per page.`,
      weight: 0.05,
    })
  } else {
    items.push({
      metric: 'H1 Heading',
      status: 'pass',
      value: '1 tag',
      description: `Exactly one H1 heading found: "${meta.headings.h1s[0]}"`,
      weight: 0.05,
    })
  }

  // 4. H2/H3 Headings Structure
  const h2Count = meta.headings.h2s.length
  if (h2Count === 0) {
    items.push({
      metric: 'Heading Structure',
      status: 'warning',
      value: 'No H2s',
      description: 'No H2 headings found. Break down your content into clear subheadings for readability.',
      weight: 0.03,
    })
  } else {
    items.push({
      metric: 'Heading Structure',
      status: 'pass',
      value: `${h2Count} H2s`,
      description: `Good heading structure with ${h2Count} H2 headings.`,
      weight: 0.03,
    })
  }

  // 5. Word Count (Content Depth)
  if (meta.wordCount < 300) {
    items.push({
      metric: 'Content Depth',
      status: 'fail',
      value: `${meta.wordCount} words`,
      description: `Thin content detected (${meta.wordCount} words). Search engines prioritize deep, valuable content.`,
      weight: 0.05,
    })
  } else if (meta.wordCount < 600) {
    items.push({
      metric: 'Content Depth',
      status: 'warning',
      value: `${meta.wordCount} words`,
      description: `Moderate content depth (${meta.wordCount} words). Expand content with case studies, statistics, or FAQs.`,
      weight: 0.05,
    })
  } else {
    items.push({
      metric: 'Content Depth',
      status: 'pass',
      value: `${meta.wordCount} words`,
      description: `Great content depth of ${meta.wordCount} words.`,
      weight: 0.05,
    })
  }

  // 6. Robots.txt
  items.push({
    metric: 'Robots.txt',
    status: hasRobots ? 'pass' : 'warning',
    value: hasRobots ? 'Configured' : 'Missing',
    description: hasRobots 
      ? 'Robots.txt file found. This file guides crawl bots on how to index your site.' 
      : 'Robots.txt file was not found. Configure one to guide search engine crawlers.',
    weight: 0.05,
  })

  // 7. Sitemap.xml
  items.push({
    metric: 'Sitemap.xml',
    status: hasSitemap ? 'pass' : 'warning',
    value: hasSitemap ? 'Configured' : 'Missing',
    description: hasSitemap 
      ? 'Sitemap.xml file found. Helps crawlers discover your key pages.' 
      : 'Sitemap.xml file was not found or not declared in robots.txt.',
    weight: 0.05,
  })

  // 8. Schema Markup / Structured Data
  const jsonLdCount = meta.structuredData.jsonLdCount
  if (jsonLdCount === 0) {
    items.push({
      metric: 'Schema Markup',
      status: 'warning',
      value: 'None',
      description: 'Structured data (JSON-LD) not found. Add schemas (like LocalBusiness, Organization) to qualify for rich snippets.',
      weight: 0.02,
    })
  } else {
    items.push({
      metric: 'Schema Markup',
      status: 'pass',
      value: `${jsonLdCount} blocks`,
      description: `Structured data found (${jsonLdCount} block(s)). Detected schemas: ${meta.structuredData.types.join(', ') || 'General'}.`,
      weight: 0.02,
    })
  }

  return items
}
