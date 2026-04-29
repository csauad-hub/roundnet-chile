'use client'
import { useRouter } from 'next/navigation'

const SEASONS = [2026, 2025, 2024, 2023]

export default function SeasonSelector({ season }: { season: number }) {
  const router = useRouter()
  return (
    <select
      value={season}
      onChange={e => router.push(`/ranking?season=${e.target.value}`)}
      className="bg-slate-100 text-slate-700 text-sm font-semibold rounded-xl px-3 py-2 border-none outline-none cursor-pointer"
    >
      {SEASONS.map(s => (
        <option key={s} value={s}>{s}</option>
      ))}
    </select>
  )
}
