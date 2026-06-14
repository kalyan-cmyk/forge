'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Nav from '@/components/Nav'
import Button from '@/components/ui/Button'
import { Textarea } from '@/components/ui/Input'
import { DebriefResponse } from '@/lib/types'

const CONTINUE_OPTIONS = [
  { value: 'yes', label: 'Yes — I want to do another adventure', emoji: '✅' },
  { value: 'maybe', label: 'Maybe — beed time to reflect', emoji: '🤔' },
  { value: 'no', label: 'No — the adventure served its purpose', emoji: '🙏' },
]

export default function DebriefPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const supabase = createClient()
  const [saving, setSaving] = useState(false)
  const [done, setDone] = useState(false)
  const [alreadySubmitted, setAlreadySubmitted] = useState(false)

  const [form, setForm] = useState<DebriefResponse>({
    overall_experience: '',
    hardest_moment: '',
    partner_observation: '',
    self_observation: '',
    connection_moment: '',
    continue_together: 'maybe',
    free_reflection: '',
  })

  useEffect(() => {
    async function checkExisting() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data } = await supabase
        .from('debriefs')
        .select('id')
        .eq('adventure_id', params.id)
        .eq('user_id', user.id)
        .single()
      if (data) setAlreadySubmitted(true)
    }
    checkExisting()
  }, [params.id, supabase])

  function update(field: keyof DebriefResponse, value: string) {
    setForm(f => ({ ...f, [field]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    await supabase.from('debriefs').insert({
      adventure_id: params.id,
      user_id: user.id,
      responses: form,
    })

    // Check if partner has also submitted — if so, mark match as completed
    const { data: adventure } = await supabase
      .from('adventures')
      .select('match_id')
      .eq('id', params.id)
      .single()

    if (adventure) {
      const { data: allDebriefs } = await supabase
        .from('debriefs')
        .select('id')
        .eq('adventure_id', params.id)
      if (allDebriefs && allDebriefs.length >= 2) {
        await supabase
          .from('matches')
          .update({ status: 'adventure_completed' })
          .eq('id', adventure.match_id)
      }
    }

    setSaving(false)
    setDone(true)
  }

  if (alreadySubmitted) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Nav role="user" />
        <main className="max-w-xl mx-auto px-4 py-10">
          <div className="forge-card text-center">
            <div className="text-4xl mb-4">✓</div>
            <h2 className="font-bold text-gray-900 mb-2">Debrief already submitted</h2>
            <p className="text-gray-500 text-sm mb-6">
              You've already completed your debrief for this adventure. Your report will be ready soon.
            </p>
            <Button onClick={() => router.push('/dashboard')}>Back to dashboard</Button>
          </div>
        </main>
      </div>
    )
  }

  if (done) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Nav role="user" />
        <main className="max-w-xl mx-auto px-4 py-10">
          <div className="forge-card text-center">
            <div className="text-5xl mb-4">🔥</div>
            <h2 className="font-bold text-gray-900 mb-2">Debrief submitted</h2>
            <p className="text-gray-500 text-sm mb-6 leading-relaxed">
              Your reflections are with your curator. Once your partner also submits theirs,
              your compatibility report will be prepared. Expect it within 48 hours.
            </p>
            <Button onClick={() => router.push('/dashboard')} className="w-full">
              Back to dashboard →
            </Button>
          </div>
        </main>
      </div>
    )
  }

  const isReady =
    form.overall_experience.trim() &&
    form.hardest_moment.trim() &&
    form.partner_observation.trim() &&
    form.self_observation.trim() &&
    form.connection_moment.trim() &&
    form.free_reflection.trim()

  return (
    <div className="min-h-screen bg-gray-50">
      <Nav role="user" />
      <main className="max-w-xl mx-auto px-4 py-10">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Post-adventure debrief</h1>
          <p className="text-sm text-gray-500">
            Complete this separately from your partner. Be honest — this is for your report, not for them to read.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <div className="forge-card flex flex-col gap-5">
            <Textarea
              label="How did the adventure feel overall?"
              value={form.overall_experience}
              onChange={e => update('overall_experience', e.target.value)}
              rows={3}
              placeholder="Don't summarise the events — describe the feeling of it."
            />
            <Textarea
              label="What was the hardest moment for you personally?"
              value={form.hardest_moment}
              onChange={e => update('hardest_moment', e.target.value)}
              rows={3}
              placeholder="Be specific. What happened, and what made it hard?"
            />
          </div>

          <div className="forge-card flex flex-col gap-5">
            <Textarea
              label="What did you notice about your partner?"
              value={form.partner_observation}
              onChange={e => update('partner_observation', e.target.value)}
              rows={4}
              placeholder="Not judgement — observation. What did you see in how they showed up?"
            />
            <Textarea
              label="What did you notice about yourself?"
              value={form.self_observation}
              onChange={e => update('self_observation', e.target.value)}
              rows={4}
              placeholder="What did the adventure reveal about you that you may not have known before?"
            />
          </div>

          <div className="forge-card flex flex-col gap-5">
            <Textarea
              label="Describe a moment of genuine connection during the adventure."
              value={form.connection_moment}
              onChange={e => update('connection_moment', e.target.value)}
              rows={3}
              placeholder="It might have been small. A look, a laugh, a shared silence."
            />
          </div>

          <div className="forge-card">
            <p className="text-sm font-medium text-gray-700 mb-4">
              Would you go on another adventure with this person?
            </p>
            <div className="flex flex-col gap-3">
              {CONTINUE_OPTIONS.map(opt => (
                <label
                  key={opt.value}
                  className={`flex items-center gap-3 p-4 rounded-xl border cursor-pointer transition-all ${
                    form.continue_together === opt.value
                      ? 'border-forge-purple bg-forge-lavender'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="continue"
                    value={opt.value}
                    checked={form.continue_together === opt.value}
                    onChange={() => update('continue_together', opt.value)}
                    className="accent-forge-purple"
                  />
                  <span className="text-sm">{opt.emoji} {opt.label}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="forge-card">
            <Textarea
              label="Final reflection — anything else the experience brought up for you?"
              value={form.free_reflection}
              onChange={e => update('free_reflection', e.target.value)}
              rows={5}
              placeholder="Open space. Write whatever feels important."
            />
          </div>

          <Button
            type="submit"
            loading={saving}
            disabled={!isReady}
            size="lg"
            className="w-full"
          >
            Submit debrief →
          </Button>
        </form>
      </main>
    </div>
  )
}
