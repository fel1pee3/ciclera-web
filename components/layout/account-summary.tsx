import type { AuthenticatedAccount } from '@/features/auth/contracts'
import { roleLabel } from '@/config/navigation'

export function AccountSummary({
  account,
  showOrganization = true,
}: {
  account: AuthenticatedAccount
  showOrganization?: boolean
}) {
  return (
    <div className="min-w-0">
      <p className="truncate text-sm font-semibold">{account.user.name}</p>
      <p className="truncate text-xs text-muted-foreground">
        {roleLabel(account.user.role)}
        {showOrganization ? ` · ${account.organization.name}` : null}
      </p>
    </div>
  )
}
