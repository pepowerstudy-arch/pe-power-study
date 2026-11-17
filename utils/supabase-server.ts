// Server-side Supabase helper for route handlers.
// The browser sends its access token in an "Authorization: Bearer <token>" header;
// we verify it with Supabase and return a client that acts as that user,
// so Row Level Security still applies.
import { createClient, type SupabaseClient, type User } from '@supabase/supabase-js'

export async function getUserFromRequest(
  req: Request
): Promise<{ supabase: SupabaseClient; user: User } | null> {
  const header = req.headers.get('authorization') ?? ''
  const token = header.startsWith('Bearer ') ? header.slice(7) : null
  if (!token) return null

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      global: { headers: { Authorization: `Bearer ${token}` } },
      auth: { persistSession: false, autoRefreshToken: false },
    }
  )

  const { data, error } = await supabase.auth.getUser(token)
  if (error || !data.user) return null
  return { supabase, user: data.user }
}
