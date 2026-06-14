import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Nav from '@/components/Nav'
import Link from 'next/link'
import { Adventure, Match } from '@/lib/types'

export default async function AdventurePage({ params }: { params: { id: string } }) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: adventure } = await supabase
    .from('adventures')
    .select('*')
    .eq('id', params.id)
    .single() as { data: Adventure | null }

  if (!adventure) redirect('/dashboard')

  const { data: match } = await supabase
    .from('matches')
    .select('*, user1:profiles!matches_user1_id_fkey(*), user2:profiles!matches_user2_id_fkey(*)')
    .eq('id', adventure.match_id)
    .single() as { data: Match | null }

  if (!match) redirect('/dashboard')

  const isUser1 = match.user1_id === user.id
  if (!isUser1 && match.user2_id !== user.id) redirect('/dashboard')

  const partner = isUser1 ? match.user2 : match.user1

  const challengeLabels: Record<string, string> = {
    physical: '🏃 Physical',
    social: '🤝 Social',
    problem_solving: '🧩 Problem-solving',
    emotional: '💬 Emotional',
  }

  // Mark adventure as active when viewed
  if (match.status === 'adventure_designed') {
    await supabase
      .from('matches')
      .update({ status: 'adventure_active' })
      .eq('id', match.id)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Nav role="user" />

      <main className="max-w-2xl mx-auto px-4 py-10">
        {/* Header */}
        <div className="forge-gradient rounded-2xl p-8 mb-6 text-white">
          <p className="text-white/60 text-xs uppercase tracking-widest mb-3">Your adventure</p>
          <h1 className="text-3xl font-bold mb-4">{adventure.title}</h1>
          <div className="flex flex-wrap gap-2">
            {adventure.challenge_types.map(type => (
              <span key={type} className="bg-white/20 text-white text-xs font-medium px-3 py-1 rounded-full">
                {challengeLabels[type] || type}
              </span>
            ))}
          </div>
        </div>

        {/* Partner */}
        <div className="forge-card mb-4 flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-forge-lavender flex items-center justify-center text-forge-purple font-bold text-sm">
            {partner?.full_name?.[0] || '?'}
          </div>
          <div>
            <p className="text-xs text-gray-400 mb-0.5">Your partner</p>
            <p className="font-semibold text-gray-900">{partner?.full_name}</p>
          </div>
        </div>

        {/* Adventure description */}
        <div className="forge-card mb-4">
          <h2 className="font-semibold text-gray-900 mb-3">The challenge</h2>
          <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-line">
            {adventure.description}
          </p>
        </div>

        {/* Briefing */}
        <div className="forge-card mb-4">
          <h2 className="font-semibold text-gray-900 mb-3">Your briefing</h2>
          <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-line">
            {adventure.briefing}
          </p>
        </div>

        {/* Logistics */}
        <div className="forge-card mb-4">
          <h2 className="font-semibold text-gray-900 mb-3">Logistics</h2>
          <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-line">
            {adventure.logistics}
          </p>
        </div>

        {/* Pre-adventure prompt */}
        <div className="bg-forge-lavender rounded-2xl p-6 mb-8">
          <h2 className="font-semibold text-forge-purple mb-3">Before you begin</h2>
          <p className="text-forge-purple/80 text-sm leading-relaxed italic">
            "{adventure.pre_adventure_prompt}"
          </p>
        </div>

        {/* CTA */}
        <div className="forge-card text-center">
          <p className="text-sm text-gray-500 mb-4">
            When the adventure is over, come back here to submit your debrief.
          </p>
          <Link href={`/debrief/${adventure.id}`} className="forge-btn-primary inline-block">
            Submit debrief →
          </Link>
        </div>
      </main>
    </div>
  )
}
