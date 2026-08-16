import type { AuthenticatedAccount } from '@/features/auth/contracts'
import { roleLabel } from '@/config/navigation'

export function AccountSummary({ account }: { account: AuthenticatedAccount }) {
  return (
    <div className="min-w-0">
      <p className="truncate text-sm font-semibold">{account.user.name}</p>
      <p className="truncate text-xs text-muted-foreground">
        {roleLabel(account.user.role)} · {account.organization.name}
      </p>
    </div>
  )
}
