'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Nav from '@/components/Nav'
import Button from '@/components/ui/Button'
import { Input, Textarea } from '@/components/ui/Input'
import { Match, Adventure, Debrief, ChallengeType } from '@/lib/types'

const CHALLENGE_TYPES: { value: ChallengeType; label: string; emoji: string }[] = [
  { value: 'physical', label: 'Physical / outdoor', emoji: '🏃' },
  { value: 'social', label: 'Social / interpersonal', emoji: '🤝' },
  { value: 'problem_solving', label: 'Problem-solving', emoji: '🧩' },
  { value: 'emotional', label: 'Emotional vulnerability', emoji: '💬' },
]

export default function CuratorDesignPage({ params }: { params: { matchId: string } }) {
  const router = useRouter()
  const supabase = createClient()

  const [match, setMatch] = useState<Match | null>(null)
  const [adventure, setAdventure] = useState<Adventure | null>(null)
  const [debriefs, setDebriefs] = useState<Debrief[]>([])
  const [tab, setTab] = useState<'profiles' | 'adventure' | 'report'>('profiles')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  // Adventure form
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [challengeTypes, setChallengeTypes] = useState<ChallengeType[]>([])
  const [briefing, setBriefing] = useState('')
  const [logistics, setLogistics] = useState('')
  const [prePrompt, setPrePrompt] = useState('')

  // Report form
  const [reportContent, setReportContent] = useState('')

  const load = useCallback(async () => {
    const { data: m } = await supabase
      .from('matches')
      .select('*, user1:profiles!matches_user1_id_fkey(*), user2:profiles!matches_user2_id_fkey(*)')
      .eq('id', params.matchId)
      .single()
    setMatch(m)

    if (m) {
      const { data: adv } = await supabase
        .from('adventures')
        .select('*')
        .eq('match_id', params.matchId)
        .single()
      if (adv) {
        setAdventure(adv)
        setTitle(adv.title)
        setDescription(adv.description)
        setChallengeTypes(adv.challenge_types)
        setBriefing(adv.briefing)
        setLogistics(adv.logistics)
        setPrePrompt(adv.pre_adventure_prompt)
        if (m.status === 'adventure_completed' || m.status === 'report_ready') {
          setTab('report')
        } else {
          setTab('adventure')
        }
      }

      if (m.status === 'adventure_completed' || m.status === 'report_ready') {
        const { data: d } = await supabase
          .from('debriefs')
          .select('*')
          .eq('adventure_id', adv?.id)
        setDebriefs(d || [])

        const { data: rep } = await supabase
          .from('reports')
          .select('*')
          .eq('adventure_id', adv?.id)
          .single()
        if (rep) setReportContent(rep.content)
      }
    }
  }, [params.matchId, supabase])

  useEffect(() => { load() }, [load])

  function toggleChallengeType(t: ChallengeType) {
    if (challengeTypes.includes(t)) {
      setChallengeTypes(challengeTypes.filter(x => x !== t))
    } else {
      setChallengeTypes([...challengeTypes, t])
    }
  }

  async function saveAdventure() {
    if (!match) return
    setSaving(true)
    const { data: { user } } = await supabase.auth.getUser()

    const payload = {
      match_id: params.matchId,
      title,
      description,
      challenge_types: challengeTypes,
      briefing,
      logistics,
      pre_adventure_prompt: prePrompt,
      created_by: user?.id,
    }

    if (adventure) {
      await supabase.from('adventures').update(payload).eq('id', adventure.id)
    } else {
      const { data } = await supabase.from('adventures').insert(payload).select().single()
      setAdventure(data)
    }

    await supabase.from('matches').update({ status: 'adventure_designed', curator_id: user?.id }).eq('id', params.matchId)

    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
    load()
  }

  async function saveReport() {
    if (!adventure || !match) return
    setSaving(true)
    const { data: { user } } = await supabase.auth.getUser()

    const { data: existing } = await supabase
      .from('reports')
      .select('id')
      .eq('adventure_id', adventure.id)
      .single()

    if (existing) {
      await supabase.from('reports').update({ content: reportContent }).eq('id', existing.id)
    } else {
      await supabase.from('reports').insert({
        adventure_id: adventure.id,
        match_id: match.id,
        content: reportContent,
        created_by: user?.id,
      })
    }

    await supabase.from('matches').update({ status: 'report_ready' }).eq('id', params.matchId)
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
    load()
  }

  if (!match) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Nav role="curator" />
        <div className="flex items-center justify-center h-64">
          <p className="text-gray-400">Loading…</p>
        </div>
      </div>
    )
  }

  const u1 = match.user1
  const u2 = match.user2
  const a1 = u1?.values_assessment
  const a2 = u2?.values_assessment

  return (
    <div className="min-h-screen bg-gray-50">
      <Nav role="curator" />

      <main className="max-w-4xl mx-auto px-4 py-10">
        <div className="mb-6 flex items-center gap-3">
          <button onClick={() => router.push('/curator')} className="text-sm text-gray-400 hover:text-gray-600">
            ← Back
          </button>
          <h1 className="text-xl font-bold text-gray-900">
            {u1?.full_name} & {u2?.full_name}
          </h1>
          <span className="text-xs bg-forge-lavender text-forge-purple px-3 py-1 rounded-full font-medium">
            {match.status.replace(/_/g, ' ')}
          </span>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-gray-100 p-1 rounded-xl mb-6 w-fit">
          {[
            { key: 'profiles', label: 'Profiles' },
            { key: 'adventure', label: 'Adventure design' },
            { key: 'report', label: 'Compatibility report' },
          ].map(t => (
            <button
              key={t.key}
              onClick={() => setTab(t.key as typeof tab)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                tab === t.key ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* PROFILES TAB */}
        {tab === 'profiles' && (
          <div className="grid md:grid-cols-2 gap-6">
            {[{ profile: u1, assessment: a1 }, { profile: u2, assessment: a2 }].map(({ profile, assessment }) => (
              <div key={profile?.id} className="forge-card flex flex-col gap-4">
                <div>
                  <h3 className="font-bold text-gray-900">{profile?.full_name}</h3>
                  <p className="text-xs text-gray-400">{profile?.city}</p>
                </div>
                {assessment ? (
                  <>
                    <div>
                      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Core values</p>
                      <div className="flex flex-wrap gap-1">
                        {assessment.core_values.map(v => (
                          <span key={v} className="text-xs bg-forge-lavender text-forge-purple px-2 py-1 rounded-full">{v}</span>
                        ))}
                      </div>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Under stress</p>
                      <p className="text-sm text-gray-600">{assessment.stress_response}</p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Strength</p>
                      <p className="text-sm text-gray-600">{assessment.strength}</p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Partnership fear</p>
                      <p className="text-sm text-gray-600">{assessment.partnership_fear}</p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Intention</p>
                      <p className="text-sm text-gray-600">{assessment.intention}</p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Life philosophy</p>
                      <p className="text-sm text-gray-600 italic">"{assessment.life_philosophy}"</p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Adventure comfort</p>
                      {Object.entries(assessment.adventure_comfort).map(([k, v]) => (
                        <div key={k} className="flex items-center gap-2 mb-1">
                          <span className="text-xs text-gray-500 w-28 capitalize">{k.replace(/_/g, ' ')}</span>
                          <div className="flex gap-1">
                            {[1,2,3,4,5].map(n => (
                              <div key={n} className={`w-4 h-4 rounded-sm ${n <= v ? 'bg-forge-purple' : 'bg-gray-100'}`} />
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <p className="text-sm text-gray-400">Values assessment not completed yet.</p>
                )}
              </div>
            ))}
          </div>
        )}

        {/* ADVENTURE DESIGN TAB */}
        {tab === 'adventure' && (
          <div className="flex flex-col gap-5">
            <div className="forge-card">
              <h3 className="font-semibold text-gray-900 mb-4">Adventure details</h3>
              <div className="flex flex-col gap-4">
                <Input
                  label="Adventure title"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="e.g. The Strangers' Crossing"
                />
                <Textarea
                  label="The challenge (shown to participants)"
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  rows={4}
                  placeholder="Describe the challenge in a way that's intriguing but doesn't reveal everything. This is what they see first."
                />
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-3">Challenge types</p>
                  <div className="flex flex-wrap gap-2">
                    {CHALLENGE_TYPES.map(t => (
                      <button
                        key={t.value}
                        onClick={() => toggleChallengeType(t.value)}
                        className={`px-4 py-2 rounded-full text-sm font-medium border transition-all ${
                          challengeTypes.includes(t.value)
                            ? 'bg-forge-purple text-white border-forge-purple'
                            : 'bg-white text-gray-600 border-gray-200 hover:border-forge-purple'
                        }`}
                      >
                        {t.emoji} {t.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="forge-card">
              <h3 className="font-semibold text-gray-900 mb-4">Briefing (sent to both participants)</h3>
              <div className="flex flex-col gap-4">
                <Textarea
                  label="Full briefing"
                  value={briefing}
                  onChange={e => setBriefing(e.target.value)}
                  rows={8}
                  placeholder="The full briefing document. Include all instructions, rules, and framing they need for the adventure."
                />
                <Textarea
                  label="Logistics"
                  value={logistics}
                  onChange={e => setLogistics(e.target.value)}
                  rows={4}
                  placeholder="Where, when, what to bring, time limits, any practical information."
                />
                <Textarea
                  label="Pre-adventure reflection prompt"
                  value={prePrompt}
                  onChange={e => setPrePrompt(e.target.value)}
                  rows={3}
                  placeholder="A question for both participants to sit with before the adventure begins. e.g. 'What are you most afraid of finding out?'"
                />
              </div>
            </div>

            <div className="flex items-center gap-4">
              <Button onClick={saveAdventure} loading={saving} size="lg">
                {adventure ? 'Update & send adventure' : 'Send adventure to pair →'}
              </Button>
              {saved && <span className="text-sm text-green-600 font-medium">✓ Saved</span>}
            </div>
          </div>
        )}

        {/* REPORT TAB */}
        {tab === 'report' && (
          <div className="flex flex-col gap-5">
            {debriefs.length > 0 && (
              <div className="grid md:grid-cols-2 gap-4">
                {debriefs.map((d, i) => {
                  const profile = d.user_id === match.user1_id ? u1 : u2
                  return (
                    <div key={d.id} className="forge-card">
                      <h3 className="font-semibold text-gray-900 mb-4">{profile?.full_name}'s debrief</h3>
                      <div className="flex flex-col gap-3 text-sm">
                        {[
                          ['Overall experience', d.responses.overall_experience],
                          ['Hardest moment', d.responses.hardest_moment],
                          ['Noticed about partner', d.responses.partner_observation],
                          ['Noticed about self', d.responses.self_observation],
                          ['Moment of connection', d.responses.connection_moment],
                          ['Continue together', d.responses.continue_together],
                          ['Free reflection', d.responses.free_reflection],
                        ].map(([label, value]) => (
                          <div key={label as string}>
                            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">{label}</p>
                            <p className="text-gray-600">{value}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}

            {debriefs.length < 2 && (
              <div className="forge-card border-l-4 border-l-amber-400">
                <p className="text-sm text-amber-700">
                  ⚠️ Only {debriefs.length} of 2 debriefs submitted so far.
                  {debriefs.length === 0 ? ' Wait for both participants to submit before writing the report.' : ' You can start drafting while waiting for the second.'}
                </p>
              </div>
            )}

            <div className="forge-card">
              <h3 className="font-semibold text-gray-900 mb-2">Compatibility report</h3>
              <p className="text-xs text-gray-400 mb-4">
                Write a narrative report — not a score. Draw from both debriefs. This is what both participants will read.
              </p>
              <Textarea
                value={reportContent}
                onChange={e => setReportContent(e.target.value)}
                rows={16}
                placeholder={`The adventure between ${u1?.full_name} and ${u2?.full_name} revealed...\n\nWhat the challenge surfaced:\n\nHow they showed up for each other:\n\nWhat they each discovered about themselves:\n\nWhere they aligned:\n\nWhere they diverged:\n\nA question worth sitting with:\n\nCurator's observation:`}
              />
            </div>

            <div className="flex items-center gap-4">
              <Button onClick={saveReport} loading={saving} size="lg" disabled={!reportContent.trim()}>
                {match.status === 'report_ready' ? 'Update report' : 'Publish report →'}
              </Button>
              {saved && <span className="text-sm text-green-600 font-medium">✓ Saved & delivered to pair</span>}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
