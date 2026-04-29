import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { formatDistanceToNow, format } from 'date-fns'
import { es } from 'date-fns/locale'
export function cn(...inputs: ClassValue[]) { return twMerge(clsx(inputs)) }
export function timeAgo(date: string) { return formatDistanceToNow(new Date(date), { addSuffix: true, locale: es }) }
export function formatDate(date: string) {
  const d = /^\d{4}-\d{2}-\d{2}$/.test(date)
    ? (() => { const [y, m, day] = date.split('-').map(Number); return new Date(y, m - 1, day) })()
    : new Date(date)
  return format(d, "d 'de' MMMM yyyy", { locale: es })
}
export function formatCLP(amount: number) { return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 }).format(amount) }
export function getInitials(name: string) { return name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() }
export const AVATAR_COLORS = ['bg-blue-50 text-blue-600','bg-red-50 text-red-500','bg-emerald-50 text-emerald-600','bg-purple-50 text-purple-600','bg-orange-50 text-orange-600','bg-yellow-50 text-yellow-600']
export function avatarColor(name: string) { return AVATAR_COLORS[name.charCodeAt(0) % AVATAR_COLORS.length] }
export const CATEGORY_LABELS: Record<string,string> = { tecnica:'Técnica', general:'General', ayuda:'Ayuda', humor:'Humor' }
export const CATEGORY_STYLES: Record<string,string> = { tecnica:'bg-blue-50 text-blue-700', general:'bg-red-50 text-red-600', ayuda:'bg-yellow-50 text-yellow-700', humor:'bg-purple-50 text-purple-700' }
export const STATUS_LABELS: Record<string,string> = { open:'Inscripciones abiertas', soon:'Próximamente', finished:'Finalizado' }
export const STATUS_STYLES: Record<string,string> = { open:'bg-emerald-50 text-emerald-700', soon:'bg-yellow-50 text-yellow-700', finished:'bg-gray-100 text-gray-500' }
export const LEVEL_LABELS: Record<string,string> = { principiante:'Principiante', intermedio:'Intermedio', avanzado:'Avanzado' }