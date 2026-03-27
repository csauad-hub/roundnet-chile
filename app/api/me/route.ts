import { createServerClient } from '@supabase/ssr'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
      const cookieStore = await cookies()
          const supabase = createServerClient(
                process.env.NEXT_PUBLIC_SUPABASE_URL!,
                      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
                            {
                                    cookies: {
                                              getAll() { return cookieStore.getAll() },
                                                        setAll(cookiesToSet) {
                                                                    try {
                                                                                  cookiesToSet.forEach(({ name, value, options }) =>
                                                                                                  cookieStore.set(name, value, options)
                                                                                                                )
                                                                                                                            } catch {}
                                                                                                                                      },
                                                                                                                                              },
                                                                                                                                                    }
                                                                                                                                                        )

                                                                                                                                                            const { data: { user } } = await supabase.auth.getUser()
                                                                                                                                                                if (!user) {
                                                                                                                                                                      return NextResponse.json({ role: 'guest' })
                                                                                                                                                                          }

                                                                                                                                                                              const admin = createAdminClient(
                                                                                                                                                                                    process.env.NEXT_PUBLIC_SUPABASE_URL!,
                                                                                                                                                                                          process.env.SUPABASE_SERVICE_ROLE_KEY!
                                                                                                                                                                                              )

                                                                                                                                                                                                  const { data: profile } = await admin
                                                                                                                                                                                                        .from('profiles')
                                                                                                                                                                                                              .select('role')
                                                                                                                                                                                                                    .eq('id', user.id)
                                                                                                                                                                                                                          .single()

                                                                                                                                                                                                                              return NextResponse.json({ role: profile?.role ?? 'user' })
                                                                                                                                                                                                                                } catch {
                                                                                                                                                                                                                                    return NextResponse.json({ role: 'user' })
                                                                                                                                                                                                                                      }
                                                                                                                                                                                                                                      }