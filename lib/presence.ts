export function getPresenceLabel(lastSeenAt?: string | null) {
  if (!lastSeenAt) return 'давно не заходил'

  const now = Date.now()
  const seen = new Date(lastSeenAt).getTime()
  const diffMs = now - seen

  const diffMin = Math.floor(diffMs / 60000)

  if (diffMin <= 1) return 'в сети'
  if (diffMin <= 5) return 'был недавно'
  if (diffMin < 60) return `был ${diffMin} мин назад`

  const diffHours = Math.floor(diffMin / 60)
  if (diffHours < 24) return `был ${diffHours} ч назад`

  const diffDays = Math.floor(diffHours / 24)
  return `был ${diffDays} дн назад`
}