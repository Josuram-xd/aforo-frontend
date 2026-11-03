import { useState, type CSSProperties } from 'react'
import './Avatar.css'

interface AvatarProps {
  name: string
  imageUrl?: string | null
  size?: 'sm' | 'md' | 'lg' | 'xl'
}

function initialsOf(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  const first = parts[0]?.[0] ?? ''
  const last = parts.length > 1 ? (parts[parts.length - 1]?.[0] ?? '') : ''
  return (first + last).toUpperCase() || '?'
}

function hueOf(name: string): number {
  let hash = 0
  for (const char of name) hash = (hash * 31 + char.charCodeAt(0)) % 360
  return hash
}

/** Only https (Google avatars, signed photo URLs) and local blob previews render; else initials. */
function isSafeImageUrl(url: string | null | undefined): url is string {
  if (!url) return false
  try {
    const protocol = new URL(url).protocol
    return protocol === 'https:' || protocol === 'blob:'
  } catch {
    return false
  }
}

export function Avatar({ name, imageUrl, size = 'md' }: AvatarProps) {
  const [failed, setFailed] = useState(false)
  const showImage = isSafeImageUrl(imageUrl) && !failed

  return (
    <span
      className={`avatar avatar--${size}`}
      style={{ '--avatar-hue': hueOf(name) } as CSSProperties}
      aria-hidden="true"
    >
      {showImage ? (
        <img src={imageUrl} alt="" referrerPolicy="no-referrer" onError={() => setFailed(true)} />
      ) : (
        initialsOf(name)
      )}
    </span>
  )
}
