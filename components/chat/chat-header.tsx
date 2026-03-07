import Link from 'next/link'

type ChatPartner = {
  id: string
  username: string | null
  display_name: string | null
  avatar_url: string | null
}

export function ChatHeader({
  partner,
}: {
  partner: ChatPartner | null
}) {
  if (!partner) {
    return (
      <div
        className="mb-4 rounded-[22px] border px-4 py-3"
        style={{
          background: 'rgba(255,255,255,0.55)',
          borderColor: 'var(--border)',
        }}
      >
        <div className="text-lg font-semibold">Чат</div>
        <div style={{ color: 'var(--text-muted)' }}>
          Выбери диалог слева
        </div>
      </div>
    )
  }

  return (
    <div
      className="mb-4 rounded-[22px] border px-4 py-3"
      style={{
        background: 'rgba(255,255,255,0.55)',
        borderColor: 'var(--border)',
        backdropFilter: 'blur(10px)',
      }}
    >
      <div className="flex items-center gap-3">
        <div
          className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-full border"
          style={{ background: 'var(--panel)', borderColor: 'var(--border)' }}
        >
          {partner.avatar_url ? (
            <img
              src={partner.avatar_url}
              alt="avatar"
              className="h-full w-full object-cover"
            />
          ) : (
            <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
              avatar
            </span>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="truncate text-lg font-semibold">
            {partner.display_name || partner.username || 'Пользователь'}
          </div>

          <div className="truncate text-sm" style={{ color: 'var(--text-muted)' }}>
            {partner.username ? `@${partner.username}` : 'Без username'}
          </div>
        </div>

        {partner.username ? (
          <Link
            href={`/u/${partner.username}`}
            className="shrink-0 rounded-2xl px-4 py-2 text-sm font-medium transition-all duration-200 hover:-translate-y-[1px] active:scale-[0.98]"
            style={{
              background: 'var(--panel-2)',
              color: 'var(--text)',
            }}
          >
            Профиль
          </Link>
        ) : null}
      </div>
    </div>
  )
}