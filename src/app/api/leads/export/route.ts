import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

function escapeCSV(value: any): string {
  if (value === null || value === undefined) return ''
  const stringValue = String(value)
  if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
    return `"${stringValue.replace(/"/g, '""')}"`
  }
  return stringValue
}

export async function GET(req: NextRequest) {
  try {
    // Fetch all leads with related data
    const { data: leads, error } = await supabase
      .from('leads')
      .select(`
        *,
        lead_assignments(
          id,
          assigned_to,
          status,
          contacted_at,
          team_members(name)
        ),
        audit_results(overall_score)
      `)
      .order('created_at', { ascending: false })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    // Create CSV headers
    const headers = [
      'Reference ID',
      'Name',
      'Company',
      'Email',
      'Mobile',
      'Website',
      'Guessed Score',
      'Actual Score',
      'Won Prize',
      'Assigned To',
      'Status',
      'Contacted At',
      'Created At',
    ]

    // Create CSV rows
    const rows = leads.map((lead: any) => {
      const assignment = lead.lead_assignments?.[0]
      const auditResult = lead.audit_results?.[0]

      return [
        lead.reference_id,
        lead.full_name,
        lead.company_name,
        lead.email,
        lead.mobile_number,
        lead.website_url,
        lead.guessed_score,
        auditResult?.overall_score || lead.actual_score || '',
        lead.won_prize ? 'Yes' : 'No',
        assignment?.team_members?.name || 'Unassigned',
        assignment?.status || 'Not assigned',
        assignment?.contacted_at ? new Date(assignment.contacted_at).toLocaleString() : '',
        new Date(lead.created_at).toLocaleString(),
      ].map(escapeCSV)
    })

    // Combine headers and rows
    const csv = [
      headers.join(','),
      ...rows.map((row: any) => row.join(',')),
    ].join('\n')

    // Return CSV file
    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="leads-${new Date().toISOString().split('T')[0]}.csv"`,
      },
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to export leads' },
      { status: 500 }
    )
  }
}
