import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Nav from '@/components/Nav'
import { Report, Match, Adventure } from '@/lib/types'

export default async function ReportPage({ params }: { params: { id: string } }) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: report } = await supabase
    .from('reports')
    .select('*')
    .eq('id', params.id)
    .single() as { data: Report | null }

  if (!report) redirect('/dashboard')

  const { data: match } = await supabase
    .from('matches')
    .select('*, user1:profiles!matches_user1_id_fkey(*), user2:profiles!matches_user2_id_fkey(*)')
    .eq('id', report.match_id)
    .single() as { data: Match | null }

  if (!match) redirect('/dashboard')
  if (match.user1_id !== user.id && match.user2_id !== user.id) redirect('/dashboard')

  const { data: adventure } = await supabase
    .from('adventures')
    .select('*')
    .eq('id', report.adventure_id)
    .single() as { data: Adventure | null }

  const isUser1 = match.user1_id === user.id
  const partner = isUser1 ? match.user2 : match.user1

  return (
    <div className="min-h-screen bg-gray-50">
      <Nav role="user" />

      <main className="max-w-2xl mx-auto px-4 py-10">
        {/* Header */}
        <div className="forge-gradient rounded-2xl p-8 mb-6 text-white">
          <p className="text-white/60 text-xs uppercase tracking-widest mb-3">Compatibility report</p>
          <h1 className="text-2xl font-bold mb-2">
            {adventure?.title || 'Your adventure'}
          </h1>
          <p className="text-white/70 text-sm">
            You and {partner?.full_name}
          </p>
        </div>

        {/* Report content */}
        <div className="forge-card mb-6">
          <div className="prose prose-sm max-w-none text-gray-700 leading-relaxed whitespace-pre-line">
            {report.content}
          </div>
        </div>

        {/* Footer note */}
        <div className="bg-forge-lavender rounded-2xl p-6 text-center">
          <p className="text-forge-purple text-sm leading-relaxed">
            This report was written by your Forge curator based on both of your debrief responses.
            It belongs to both of you. What you do with it is entirely up to you.
          </p>
        </div>
      </main>
    </div>
  )
}
