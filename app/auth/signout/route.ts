import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const supabase = createClient()
  await supabase.auth.signOut()
  const response = NextResponse.redirect(new URL('/auth', request.url))
  // Clear guest bypass cookie on sign out
  response.cookies.delete('guest_bypass')
  return response
}
