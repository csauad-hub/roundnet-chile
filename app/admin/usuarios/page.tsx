import { createAdminClient } from '@/lib/supabase/admin'
import { Shield, User } from 'lucide-react'

interface Profile {
  id: string
  full_name: string | null
  avatar_url: string | null
  role: string | null
  email?: string
}

export default async function UsuariosPage() {
  const supabase = createAdminClient()

  const { data: profiles, error } = await supabase
    .from('profiles')
    .select('*')
    .order('full_name', { ascending: true })

  // Get user emails from auth (admin API not available client-side, show IDs)
  const users: Profile[] = profiles ?? []

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Usuarios</h1>
          <p className="text-gray-400 mt-1">{users.length} usuarios registrados</p>
        </div>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-lg text-sm mb-4">
          Error al cargar usuarios: {error.message}
        </div>
      )}

      {users.length === 0 ? (
        <div className="text-center py-16 text-gray-500">
          <User className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p>No hay usuarios registrados aún.</p>
        </div>
      ) : (
        <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left text-xs font-medium text-gray-400 uppercase tracking-wider px-6 py-3">
                  Usuario
                </th>
                <th className="text-left text-xs font-medium text-gray-400 uppercase tracking-wider px-6 py-3">
                  ID
                </th>
                <th className="text-left text-xs font-medium text-gray-400 uppercase tracking-wider px-6 py-3">
                  Rol
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-white/5 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      {user.avatar_url ? (
                        <img
                          src={user.avatar_url}
                          alt={user.full_name ?? 'Avatar'}
                          className="w-8 h-8 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-[#00E5FF]/20 flex items-center justify-center text-[#00E5FF] text-sm font-semibold">
                          {(user.full_name ?? '?')[0].toUpperCase()}
                        </div>
                      )}
                      <span className="text-white text-sm font-medium">
                        {user.full_name ?? 'Sin nombre'}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-gray-400 text-xs font-mono truncate max-w-[200px] block">
                      {user.id}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {user.role === 'admin' ? (
                      <span className="inline-flex items-center gap-1.5 bg-[#00E5FF]/10 text-[#00E5FF] text-xs font-medium px-2.5 py-1 rounded-full border border-[#00E5FF]/20">
                        <Shield className="w-3 h-3" />
                        Admin
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 bg-white/5 text-gray-400 text-xs font-medium px-2.5 py-1 rounded-full border border-white/10">
                        <User className="w-3 h-3" />
                        Usuario
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="mt-6 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg text-sm text-yellow-400">
        <strong>Nota:</strong> Para cambiar el rol de un usuario a admin, ve al panel de Supabase → Table Editor → profiles → edita el campo <code className="bg-yellow-500/10 px-1 rounded">role</code>.
      </div>
    </div>
  )
}
