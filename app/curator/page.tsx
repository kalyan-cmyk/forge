import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Nav from '@/components/Nav'
import Link from 'next/link'
import { Match, Profile } from '@/lib/types'

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  pending: { label: 'Awaiting match', color: 'bg-gray-100 text-gray-600' },
  matched: { label: 'Matched — design needed', color: 'bg-amber-100 text-amber-700' },
  adventure_designed: { label: 'Adventure sent', color: 'bg-blue-100 text-blue-700' },
  adventure_active: { label: 'Adventure active', color: 'bg-indigo-100 text-indigo-700' },
  adventure_completed: { label: 'Debrief in — write report', color: 'bg-orange-100 text-orange-700' },
  report_ready: { label: 'Report delivered', color: 'bg-green-100 text-green-700' },
}

export default async function CuratorDashboard() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', user.id)
    .single() as { data: Profile | null }

  if (!profile || profile.role !== 'curator') redirect('/dashboard')

  // Fetch all matches with profiles
  const { data: matches } = await supabase
    .from('matches')
    .select('*, user1:profiles!matches_user1_id_fkey(*), user2:profiles!matches_user2_id_fkey(*)')
    .order('created_at', { ascending: false }) as { data: Match[] | null }

  // Fetch all unmatched users (pending profiles with no match)
  const { data: unmatchedProfiles } = await supabase
    .from('profiles')
    .select('*')
    .eq('role', 'user')
    .not('values_assessment', 'is', null) as { data: Profile[] | null }

  const matchedUserIds = new Set(
    (matches || []).flatMap(m => [m.user1_id, m.user2_id])
  )
  const unmatched = (unmatchedProfiles || []).filter(p => !matchedUserIds.has(p.user_id))

  const needsAttention = (matches || []).filter(
    m => m.status === 'matched' || m.status === 'adventure_completed'
  )

  return (
    <div className="min-h-screen bg-gray-50">
      <Nav role="curator" />

      <main className="max-w-4xl mx-auto px-4 py-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Curator dashboard</h1>
            <p className="text-gray-500 text-sm mt-1">Hello, {profile.full_name}</p>
          </div>
        </div>

        {/* Needs attention */}
        {needsAttention.length > 0 && (
          <section className="mb-8">
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-widest mb-3">
              Needs your attention
            </h2>
            <div className="flex flex-col gap-3">
              {needsAttention.map(match => (
                <div key={match.id} className="forge-card border-l-4 border-l-forge-orange flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-semibold text-gray-900 text-sm">
                        {match.user1?.full_name} & {match.user2?.full_name}
                      </p>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_LABELS[match.status]?.color}`}>
                        {STATUS_LABELS[match.status]?.label}
                      </span>
                    </div>
                    <p className="text-xs text-gray-400">{match.user1?.city}</p>
                  </div>
                  <Link
                    href={`/curator/design/${match.id}`}
                    className="forge-btn-primary text-xs px-4 py-2"
                  >
                    {match.status === 'matched' ? 'Design adventure →' : 'Write report →'}
                  </Link>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Unmatched users */}
        {unmatched.length > 0 && (
          <section className="mb-8">
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-widest mb-3">
              Unmatched users ({unmatched.length})
            </h2>
            <div className="forge-card">
              <div className="flex flex-col gap-4">
                {unmatched.map(p => (
                  <div key={p.id} className="flex items-center justify-between border-b border-gray-50 pb-4 last:border-0 last:pb-0">
                    <div>
                      <p className="font-medium text-gray-900 text-sm">{p.full_name}</p>
                      <p className="text-xs text-gray-400">{p.city} · Joined {new Date(p.created_at).toLocaleDateString()}</p>
                    </div>
                    <Link
                      href={`/curator/profile/${p.user_id}`}
                      className="text-xs text-forge-purple font-medium hover:underline"
                    >
                      View profile →
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* All matches */}
        <section>
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-widest mb-3">
            All pairs ({(matches || []).length})
          </h2>
          <div className="flex flex-col gap-3">
            {(matches || []).map(match => (
              <div key={match.id} className="forge-card flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-medium text-gray-900 text-sm">
                      {match.user1?.full_name} & {match.user2?.full_name}
                    </p>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_LABELS[match.status]?.color}`}>
                      {STATUS_LABELS[match.status]?.label}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400">
                    {match.user1?.city} · {new Date(match.created_at).toLocaleDateString()}
                  </p>
                </div>
                <Link
                  href={`/curator/design/${match.id}`}
                  className="text-xs text-forge-purple font-medium hover:underline"
                >
                  Manage →
                </Link>
              </div>
            ))}
            {(!matches || matches.length === 0) && (
              <p className="text-sm text-gray-400 text-center py-8">No pairs yet.</p>
            )}
          </div>
        </section>
      </main>
    </div>
  )
}
