'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Button from '@/components/ui/Button'
import { Textarea } from '@/components/ui/Input'
import { ValuesAssessment } from '@/lib/types'

const CORE_VALUES_OPTIONS = [
  'Honesty', 'Courage', 'Loyalty', 'Curiosity', 'Compassion',
  'Resilience', 'Freedom', 'Justice', 'Growth', 'Humility',
  'Adventure', 'Creativity', 'Discipline', 'Community', 'Authenticity',
]

const steps = [
  { id: 'intro', title: 'Your values profile' },
  { id: 'values', title: 'What you stand for' },
  { id: 'pressure', title: 'Under pressure' },
  { id: 'partnership', title: 'In partnership' },
  { id: 'adventure', title: 'Adventure comfort' },
  { id: 'philosophy', title: 'The big picture' },
  { id: 'done', title: 'All done' },
]

export default function OnboardingPage() {
  const router = useRouter()
  const supabase = createClient()
  const [step, setStep] = useState(0)
  const [saving, setSaving] = useState(false)

  const [values, setValues] = useState<string[]>([])
  const [stressResponse, setStressResponse] = useState('')
  const [partnershipFear, setPartnershipFear] = useState('')
  const [strength, setStrength] = useState('')
  const [intention, setIntention] = useState('')
  const [lifePhilosophy, setLifePhilosophy] = useState('')
  const [comfort, setComfort] = useState({ physical: 3, social: 3, problem_solving: 3, emotional: 3 })

  function toggleValue(v: string) {
    if (values.includes(v)) {
      setValues(values.filter(x => x !== v))
    } else if (values.length < 5) {
      setValues([...values, v])
    }
  }

  async function handleSubmit() {
    setSaving(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const assessment: ValuesAssessment = {
      core_values: values,
      stress_response: stressResponse,
      partnership_fear: partnershipFear,
      strength,
      intention,
      life_philosophy: lifePhilosophy,
      adventure_comfort: comfort,
    }

    await supabase
      .from('profiles')
      .update({
        values_assessment: assessment,
        assessment_completed_at: new Date().toISOString(),
      })
      .eq('user_id', user.id)

    setSaving(false)
    setStep(6)
  }

  const SliderRow = ({ label, key_ }: { label: string; key_: keyof typeof comfort }) => (
    <div className="flex flex-col gap-2">
      <div className="flex justify-between text-sm">
        <span className="text-gray-600">{label}</span>
        <span className="font-semibold text-forge-purple">{comfort[key_]}/5</span>
      </div>
      <input
        type="range" min={1} max={5} step={1}
        value={comfort[key_]}
        onChange={e => setComfort({ ...comfort, [key_]: Number(e.target.value) })}
        className="w-full accent-forge-purple"
      />
      <div className="flex justify-between text-xs text-gray-400">
        <span>Uncomfortable</span>
        <span>Very comfortable</span>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="forge-gradient px-6 py-8">
        <div className="max-w-xl mx-auto">
          <span className="text-2xl font-bold text-white tracking-tight">FORGE</span>
          <div className="mt-6 flex gap-2">
            {steps.slice(1, -1).map((s, i) => (
              <div
                key={s.id}
                className={`h-1 flex-1 rounded-full transition-all ${i < step ? 'bg-white' : 'bg-white/30'}`}
              />
            ))}
          </div>
          <p className="text-white/70 text-xs mt-2">
            {step > 0 && step < 6 ? `Step ${step} of ${steps.length - 2}` : ''}
          </p>
        </div>
      </div>

      <main className="max-w-xl mx-auto px-4 py-10">

        {/* Intro */}
        {step === 0 && (
          <div className="forge-card">
            <h1 className="text-2xl font-bold text-gray-900 mb-3">Your values profile</h1>
            <p className="text-gray-500 text-sm leading-relaxed mb-6">
              This is not a personality quiz. It's a map of what you stand for, how you handle pressure,
              and what you bring to a challenge. Your answers directly shape who you're matched with
              and the adventure designed for you. There are no right answers — only honest ones.
            </p>
            <p className="text-gray-500 text-sm mb-6">
              It takes about 10 minutes. Take your time.
            </p>
            <Button onClick={() => setStep(1)} className="w-full">
              Begin →
            </Button>
          </div>
        )}

        {/* Step 1: Values */}
        {step === 1 && (
          <div className="forge-card">
            <h2 className="text-xl font-bold text-gray-900 mb-2">What do you stand for?</h2>
            <p className="text-sm text-gray-500 mb-6">
              Choose up to 5 values that define how you move through the world.
              These aren't aspirations — pick what's genuinely true of you now.
            </p>
            <div className="flex flex-wrap gap-2 mb-8">
              {CORE_VALUES_OPTIONS.map(v => (
                <button
                  key={v}
                  onClick={() => toggleValue(v)}
                  className={`px-4 py-2 rounded-full text-sm font-medium border transition-all ${
                    values.includes(v)
                      ? 'bg-forge-purple text-white border-forge-purple'
                      : 'bg-white text-gray-600 border-gray-200 hover:border-forge-purple'
                  }`}
                >
                  {v}
                </button>
              ))}
            </div>
            <p className="text-xs text-gray-400 mb-6">
              {values.length}/5 selected
            </p>
            <Button
              onClick={() => setStep(2)}
              disabled={values.length < 2}
              className="w-full"
            >
              Continue →
            </Button>
          </div>
        )}

        {/* Step 2: Under pressure */}
        {step === 2 && (
          <div className="forge-card flex flex-col gap-6">
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">Under pressure</h2>
              <p className="text-sm text-gray-500">
                How you respond when things get hard tells us a lot. Be honest — not impressive.
              </p>
            </div>
            <Textarea
              label="When something goes wrong, what's your first instinct?"
              value={stressResponse}
              onChange={e => setStressResponse(e.target.value)}
              rows={4}
              placeholder="e.g. I go quiet and need time to think. Or I get louder and start problem-solving out loud..."
            />
            <Textarea
              label="What's one strength you know you bring to a difficult situation?"
              value={strength}
              onChange={e => setStrength(e.target.value)}
              rows={3}
              placeholder="e.g. I stay calm. I think laterally. I keep people grounded..."
            />
            <Button
              onClick={() => setStep(3)}
              disabled={!stressResponse.trim() || !strength.trim()}
              className="w-full"
            >
              Continue →
            </Button>
          </div>
        )}

        {/* Step 3: In partnership */}
        {step === 3 && (
          <div className="forge-card flex flex-col gap-6">
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">In partnership</h2>
              <p className="text-sm text-gray-500">
                What you're hoping for, and what you're afraid of.
              </p>
            </div>
            <Textarea
              label="What do you most fear in a partnership — the thing that makes it not work?"
              value={partnershipFear}
              onChange={e => setPartnershipFear(e.target.value)}
              rows={4}
              placeholder="e.g. I fear someone who shuts down under stress. Or someone who can't be honest when things are hard..."
            />
            <Textarea
              label="What are you hoping to discover or experience through Forge?"
              value={intention}
              onChange={e => setIntention(e.target.value)}
              rows={4}
              placeholder="e.g. I want to find out if I can actually trust someone under pressure. Or I want to see how my partner and I function as a team..."
            />
            <Button
              onClick={() => setStep(4)}
              disabled={!partnershipFear.trim() || !intention.trim()}
              className="w-full"
            >
              Continue →
            </Button>
          </div>
        )}

        {/* Step 4: Adventure comfort */}
        {step === 4 && (
          <div className="forge-card flex flex-col gap-6">
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">Adventure comfort</h2>
              <p className="text-sm text-gray-500">
                This helps us design the right balance for your adventure.
                Be honest — not brave. Your curator uses this to calibrate the challenge.
              </p>
            </div>
            <SliderRow label="Physical / outdoor challenges" key_="physical" />
            <SliderRow label="Social / interpersonal pressure" key_="social" />
            <SliderRow label="Problem-solving under constraints" key_="problem_solving" />
            <SliderRow label="Emotional vulnerability" key_="emotional" />
            <Button onClick={() => setStep(5)} className="w-full">
              Continue →
            </Button>
          </div>
        )}

        {/* Step 5: Philosophy */}
        {step === 5 && (
          <div className="forge-card flex flex-col gap-6">
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">The big picture</h2>
              <p className="text-sm text-gray-500">
                One last question. No wrong answer — othis is where your curator gets to know you as a person.
              </p>
            </div>
            <Textarea
              label="What do you believe about life that most people might disagree with?"
              value={lifePhilosophy}
              onChange={e => setLifePhilosophy(e.target.value)}
              rows={6}
              placeholder="Take your time with this one. It's the most important question in the assessment."
            />
            <Button
              onClick={handleSubmit}
              disabled={!lifePhilosophy.trim()}
              loading={saving}
              className="w-full"
            >
              Submit my profile →
            </Button>
          </div>
        )}

        {/* Done */}
        {step === 6 && (
          <div className="forge-card text-center">
            <div className="text-5xl mb-4">🔥</div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Profile complete</h2>
            <p className="text-gray-500 text-sm mb-6 leading-relaxed">
              Your values profile is with our curators. We'll reach out by email when
              your match is ready. In the meantime, your dashboard will update as things progress.
            </p>
            <Button onClick={() => router.push('/dashboard')} className="w-full">
              Go to my dashboard →
            </Button>
          </div>
        )}

      </main>
    </div>
  )
}
