import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Nav from '@/components/Nav'
import Link from 'next/link'
import { Profile, Match, Adventure, Report } from '@/lib/types'

export default async function DashboardPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  // Fetch profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', user.id)
    .single() as { data: Profile | null }

  if (!profile) redirect('/onboarding')
  if (profile.role === 'curator') redirect('/curator')

  // If values assessment not done, redirect to onboarding
  if (!profile.values_assessment) redirect('/onboarding')

  // Fetch match
  const { data: match } = await supabase
    .from('matches')
    .select('*, user1:profiles!matches_user1_id_fkey(*), user2:profiles!matches_user2_id_fkey(*)')
    .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`)
    .order('created_at', { ascending: false })
    .limit(1)
    .single() as { data: Match | null }

  // Fetch adventure if match exists
  let adventure: Adventure | null = null
  let report: Report | null = null

  if (match) {
    const { data: adv } = await supabase
      .from('adventures')
      .select('*')
      .eq('match_id', match.id)
      .single()
    adventure = adv

    if (adventure && (match.status === 'report_ready')) {
      const { data: rep } = await supabase
        .from('reports')
        .select('*')
        .eq('adventure_id', adventure.id)
        .single()
      report = rep
    }
  }

  const partner = match
    ? (match.user1_id === user.id ? match.user2 : match.user1)
    : null

  return (
    <div className="min-h-screen bg-gray-50">
      <Nav role="user" />

      <main className="max-w-2xl mx-auto px-4 py-10">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">
          Hello, {profile.full_name.split(' ')[0]}
        </h1>
        <p className="text-gray-500 text-sm mb-8">Here&apos;s where your Forge journey stands.</p>

        {/* Status card */}
        {!match && (
          <div className="forge-card mb-6 border-l-4 border-l-forge-purple">
            <div className="flex items-start gap-4">
              <div className="text-3xl">⏳</div>
              <div>
                <h2 className="font-semibold text-gray-900 mb-1">Waiting for your match</h2>
                <p className="text-sm text-gray-500">
                  Your values profile is complete. Our curators are finding the right partner for you.
                  You&apos;ll receive an email when your match is ready.
                </p>
              </div>
            </div>
          </div>
        )}

        {match && match.status === 'matched' && (
          <div className="forge-card mb-6 border-l-4 border-l-forge-orange">
            <div className="flex items-start gap-4">
              <div className="text-3xl">🤝</div>
              <div>
                <h2 className="font-semibold text-gray-900 mb-1">You&apos;ve been matched!</h2>
                <p className="text-sm text-gray-500">
                  {partner?.full_name} is your partner. Your curator is now designing your adventure.
                  Sit tight — you&apos;ll hear from us soon.
                </p>
              </div>
            </div>
          </div>
        )}

        {match && adventure && match.status === 'adventure_designed' && (
          <div className="forge-card mb-6 border-l-4 border-l-forge-orange">
            <div className="flex items-start gap-4">
              <div className="text-3xl">🗺️</div>
              <div>
                <h2 className="font-semibold text-gray-900 mb-2">Your adventure is ready</h2>
                <p className="text-sm text-gray-500 mb-4">
                  Your curator has designed a custom challenge for you and {partner?.full_name}.
                </p>
                <Link
                  href={`/adventure/${adventure.id}`}
                  className="forge-btn-primary inline-block text-center"
                >
                  Read your briefing →
                </Link>
              </div>
            </div>
          </div>
        )}

        {match && adventure && match.status === 'adventure_active' && (
          <div className="forge-card mb-6 border-l-4 border-l-forge-purple">
            <div className="flex items-start gap-4">
              <div className="text-3xl">⚡</div>
              <div>
                <h2 className="font-semibold text-gray-900 mb-2">Adventure in progress</h2>
                <p className="text-sm text-gray-500 mb-4">
                  You&apos;re in it. When the adventure is complete, come back here to submit your debrief.
                </p>
                <div className="flex gap-3">
                  <Link href={`/adventure/${adventure.id}`} className="forge-btn-secondary inline-block">
                    View briefing
                  </Link>
                  <Link href={`/debrief/${adventure.id}`} className="forge-btn-primary inline-block">
                    Submit debrief →
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}

        {match && adventure && match.status === 'adventure_completed' && (
          <div className="forge-card mb-6 border-l-4 border-l-gray-300">
            <div className="flex items-start gap-4">
              <div className="text-3xl">📝</div>
              <div>
                <h2 className="font-semibold text-gray-900 mb-1">Debrief submitted</h2>
                <p className="text-sm text-gray-500">
                  Your debrief is in. Your curator is working on your compatibility report.
                  It&apos;ll be ready within 48 hours.
                </p>
              </div>
            </div>
          </div>
        )}

        {match && report && match.status === 'report_ready' && (
          <div className="forge-card mb-6 border-l-4 border-l-forge-orange">
            <div className="flex items-start gap-4">
              <div className="text-3xl">🔥</div>
              <div>
                <h2 className="font-semibold text-gray-900 mb-2">Your report is ready</h2>
                <p className="text-sm text-gray-500 mb-4">
                  Your adventure with {partner?.full_name} has been analysed. Read what the experience revealed.
                </p>
                <Link href={`/report/${report.id}`} className="forge-btn-orange inline-block">
                  Read your report →
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Profile summary */}
        <div className="forge-card">
          <h3 className="font-semibold text-gray-900 mb-4">Your profile</h3>
          <div className="flex flex-col gap-2 text-sm text-gray-600">
            <div className="flex justify-between">
              <span className="text-gray-400">Name</span>
              <span>{profile.full_name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">City</span>
              <span>{profile.city || '—'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Values profile</span>
              <span className="text-green-600 font-medium">✓ Complete</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
