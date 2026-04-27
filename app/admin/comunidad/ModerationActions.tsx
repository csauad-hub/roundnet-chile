'use client'

import { useState } from 'react'
import { Check, X, Trash2 } from 'lucide-react'
import { approvePost, rejectPost, deletePost } from './actions'

type PostStatus = 'pending' | 'approved' | 'rejected'

interface Props {
  postId: string
  status: PostStatus
}

export function ModerationActions({ postId, status }: Props) {
  const [loading, setLoading] = useState<string | null>(null)
  const [done, setDone] = useState(false)

  const run = async (action: () => Promise<void>, key: string) => {
    setLoading(key)
    await action()
    setDone(true)
    setLoading(null)
  }

  if (done) {
    return <span className="text-xs text-white/30 italic">Actualizado</span>
  }

  return (
    <div className="flex gap-2 flex-shrink-0 flex-wrap justify-end">
      {status !== 'approved' && (
        <button
          onClick={() => run(() => approvePost(postId), 'approve')}
          disabled={!!loading}
          className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full bg-green-500/15 text-green-400 hover:bg-green-500/25 disabled:opacity-40 transition-colors"
        >
          <Check size={13} />
          {loading === 'approve' ? '...' : 'Aprobar'}
        </button>
      )}

      {status !== 'rejected' && (
        <button
          onClick={() => run(() => rejectPost(postId), 'reject')}
          disabled={!!loading}
          className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full bg-amber-500/15 text-amber-400 hover:bg-amber-500/25 disabled:opacity-40 transition-colors"
        >
          <X size={13} />
          {loading === 'reject' ? '...' : 'Rechazar'}
        </button>
      )}

      <button
        onClick={() => {
          if (confirm('¿Eliminar esta publicación permanentemente?')) {
            run(() => deletePost(postId), 'delete')
          }
        }}
        disabled={!!loading}
        className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full bg-red-500/15 text-red-400 hover:bg-red-500/25 disabled:opacity-40 transition-colors"
      >
        <Trash2 size={13} />
        {loading === 'delete' ? '...' : 'Eliminar'}
      </button>
    </div>
  )
}
