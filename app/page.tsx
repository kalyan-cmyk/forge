import Link from 'next/link'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-forge-dark text-white">

      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-5 max-w-5xl mx-auto">
        <span className="text-2xl font-bold tracking-tight">FORGE</span>
        <div className="flex items-center gap-4">
          <Link href="/login" className="text-sm text-white/70 hover:text-white transition-colors">
            Sign in
          </Link>
          <Link
            href="/signup"
            className="bg-forge-orange text-white text-sm font-semibold px-5 py-2.5 rounded-xl hover:bg-opacity-90 transition-all"
          >
            Get started
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-5xl mx-auto px-6 pt-20 pb-28 text-center">
        <div className="inline-block bg-white/10 text-white/80 text-xs font-medium px-4 py-1.5 rounded-full mb-8 tracking-wide uppercase">
          Compatibility forged through adversity
        </div>
        <h1 className="text-5xl md:text-7xl font-bold leading-tight mb-6">
          You don't know<br />
          <span className="text-forge-orange">until you've been</span><br />
          through it together.
        </h1>
        <p className="text-white/60 text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
          Forge designs custom adventures that put two people through real adversity —
          physical, social, emotional, and intellectual. What emerges is the truth
          about whether the partnership holds.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/signup"
            className="bg-forge-orange text-white font-semibold px-8 py-4 rounded-xl text-base hover:bg-opacity-90 transition-all"
          >
            Start your adventure
          </Link>
          <Link
            href="#how-it-works"
            className="bg-white/10 text-white font-semibold px-8 py-4 rounded-xl text-base hover:bg-white/20 transition-all"
          >
            How it works
          </Link>
        </div>
      </section>

      {/* Divider */}
      <div className="border-t border-white/10" />

      {/* How it works */}
      <section id="how-it-works" className="max-w-5xl mx-auto px-6 py-24">
        <h2 className="text-3xl font-bold text-center mb-4">How Forge works</h2>
        <p className="text-white/60 text-center mb-16 max-w-xl mx-auto">
          Inspired by the idea that real compatibility only reveals itself under pressure.
        </p>

        <div className="grid md:grid-cols-5 gap-0">
          {[
            {
              step: '01',
              title: 'Values profile',
              desc: 'Complete a deep values assessment. Not a personality quiz — a map of what you stand for, how you handle pressure, and what you bring to a challenge.',
            },
            {
              step: '02',
              title: 'Matching',
              desc: 'For strangers: our curators match you on values alignment. For couples: skip straight to your adventure design.',
            },
            {
              step: '03',
              title: 'Custom adventure',
              desc: 'A human curator designs an adventure built specifically for your pair — drawing on physical, social, problem-solving, and emotional challenges.',
            },
            {
              step: '04',
              title: 'The adventure',
              desc: 'You receive a briefing. Then the adventure happens in the real world — offline, analog, and unmediated by screens.',
            },
            {
              step: '05',
              title: 'The report',
              desc: 'Both partners complete a structured debrief. You receive a compatibility report: not a score, but a narrative of what the adventure revealed.',
            },
          ].map((item, i) => (
            <div key={i} className="relative flex flex-col items-center text-center px-4">
              {i < 4 && (
                <div className="hidden md:block absolute top-6 left-[60%] w-full h-px border-t border-dashed border-white/20" />
              )}
              <div className="w-12 h-12 rounded-full bg-forge-purple flex items-center justify-center text-sm font-bold mb-4 relative z-10">
                {item.step}
              </div>
              <h3 className="font-semibold text-sm mb-2">{item.title}</h3>
              <p className="text-white/50 text-xs leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Who it's for */}
      <section className="bg-white/5 border-Y border-white/10">
        <div className="max-w-5xl mx-auto px-6 py-20 grid md:grid-cols-2 gap-12">
          <div>
            <div className="text-forge-orange text-xs font-bold uppercase tracking-widest mb-3">For strangers</div>
            <h3 className="text-2xl font-bold mb-4">Tired of swiping?</h3>
            <p className="text-white/60 leading-relaxed">
              You'll be matched with someone based on values — not photos. The adventure
              itself is the first date, the compatibility test, and the story all in one.
            </p>
          </div>
          <div>
            <div className="text-forge-orange text-xs font-bold uppercase tracking-widest mb-3">For couples</div>
            <h3 className="text-2xl font-bold mb-4">Want to know if it holds?</h3>
            <p className="text-white/60 leading-relaxed">
              You've been together. But have you been tested? Forge designs challenges that
              reveal how you function as a team under real pressure — and gives you language
              to understand what you find.
            </p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-5xl mx-auto px-6 py-24 text-center">
        <h2 className="text-3xl font-bold mb-4">Ready to find out?</h2>
        <p className="text-white/60 mb-8">
          Pay only when you book an adventure. No subscriptions.
        </p>
        <Link
          href="/signup"
          className="bg-forge-orange text-white font-semibold px-8 py-4 rounded-xl text-base hover:bg-opacity-90 transition-all inline-block"
        >
          Create your profile
        </Link>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 px-6 py-8">
        <div className="max-w-5xl mx-auto flex items-center justify-between text-white/40 text-xs">
          <span>FORGE © 2026</span>
          <span>Compatibility forged through adversity</span>
        </div>
      </footer>
    </div>
  )
}
