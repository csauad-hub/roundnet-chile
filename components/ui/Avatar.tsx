import Image from 'next/image'
import { cn, getInitials, avatarColor } from '@/lib/utils'
interface AvatarProps { name:string; src?:string|null; size?:'sm'|'md'|'lg'|'xl'; className?:string }
const SIZE_MAP = { sm:'w-7 h-7 text-[10px]', md:'w-9 h-9 text-xs', lg:'w-12 h-12 text-sm', xl:'w-14 h-14 text-base' }
const PX_MAP = { sm:28, md:36, lg:48, xl:56 }
export default function Avatar({ name, src, size='md', className }: AvatarProps) {
  const cls = cn('avatar flex-shrink-0', SIZE_MAP[size], !src && avatarColor(name), className)
  if (src) return <Image src={src} alt={name} width={PX_MAP[size]} height={PX_MAP[size]} className={cn(cls,'object-cover')} />
  return <div className={cls}>{getInitials(name)}</div>
}