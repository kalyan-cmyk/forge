'use client'

import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { UserRole } from '@/lib/types'

interface NavProps {
  role?: UserRole
}

export default function Nav({ role }: NavProps) {
  const router = useRouter()
  const supabase = createClient()

  async function handleSignOut() {
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  return (
    <nav className="border-b border-gray-100 bg-white px-6 py-4">
      <div className="max-w-4xl mx-auto flex items-center justify-between">
        <a href={role === 'curator' ? '/curator' : '/dashboard'} className="flex items-center gap-2">
          <span className="text-2xl font-bold text-forge-purple tracking-tight">FORGE</span>
        </a>
        <div className="flex items-center gap-4">
          {role === 'curator' && (
            <span className="text-xs font-semibold bg-forge-lavender text-forge-purple px-3 py-1 rounded-full">
              Curator
            </span>
          )}
          <button
            onClick={handleSignOut}
            className="text-sm text-gray-500 hover:text-gray-900 transition-colors"
          >
            Sign out
          </button>
        </div>
      </div>
    </nav>
  )
}
