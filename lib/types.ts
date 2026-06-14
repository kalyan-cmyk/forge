export type UserRole = 'user' | 'curator'

export type MatchStatus =
  | 'pending'
  | 'matched'
  | 'adventure_designed'
  | 'adventure_active'
  | 'adventure_completed'
  | 'report_ready'

export type ChallengeType = 'physical' | 'social' | 'problem_solving' | 'emotional'

export interface Profile {
  id: string
  user_id: string
  full_name: string
  role: UserRole
  city: string | null
  values_assessment: ValuesAssessment | null
  assessment_completed_at: string | null
  created_at: string
}

export interface ValuesAssessment {
  core_values: string[]
  stress_response: string
  strength: string
  partnership_fear: string
  intention: string
  adventure_comfort: {
    physical: number
    social: number
    problem_solving: number
    emotional: number
  }
  life_philosophy: string
}

export interface Match {
  id: string
  user1_id: string
  user2_id: string
  status: MatchStatus
  curator_id: string | null
  curator_notes: string | null
  created_at: string
  user1?: Profile
  user2?: Profile
}

export interface Adventure {
  id: string
  match_id: string
  title: string
  description: string
  challenge_types: ChallengeType[]
  briefing: string
  logistics: string
  pre_adventure_prompt: string
  created_by: string | null
  created_at: string
}

export interface DebriefResponse {
  overall_experience: string
  hardest_moment: string
  partner_observation: string
  self_observation: string
  connection_moment: string
  continue_together: string
  free_reflection: string
}

export interface Debrief {
  id: string
  adventure_id: string
  user_id: string
  responses: DebriefResponse
  submitted_at: string
}

export interface Report {
  id: string
  adventure_id: string
  match_id: string
  content: string
  created_by: string | null
  created_at: string
}
