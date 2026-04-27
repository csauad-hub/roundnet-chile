'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'

export async function approvePost(postId: string) {
  const supabase = createAdminClient()
  await supabase.from('posts').update({ status: 'approved' }).eq('id', postId)
  revalidatePath('/admin/comunidad')
  revalidatePath('/comunidad')
}

export async function rejectPost(postId: string) {
  const supabase = createAdminClient()
  await supabase.from('posts').update({ status: 'rejected' }).eq('id', postId)
  revalidatePath('/admin/comunidad')
  revalidatePath('/comunidad')
}

export async function deletePost(postId: string) {
  const supabase = createAdminClient()
  await supabase.from('posts').delete().eq('id', postId)
  revalidatePath('/admin/comunidad')
  revalidatePath('/comunidad')
}
