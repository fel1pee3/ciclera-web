'use client'

import { UserPlus } from 'lucide-react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { useEffect, useMemo, useState } from 'react'

import { Alert } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button, buttonVariants } from '@/components/ui/button'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { EmptyState } from '@/components/ui/empty-state'
import { FilterPanel } from '@/components/ui/filter-panel'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Modal } from '@/components/ui/modal'
import { Skeleton } from '@/components/ui/skeleton'
import { useSession } from '@/features/auth/session-provider'
import { listUsers, setUserStatus, type ListUsersQuery } from './api'
import type { ManagedUser, PaginatedUsers } from './contracts'
import { getTeamErrorMessage } from './errors'
import { canManageUser } from './permissions'
import { CreateUserForm, EditUserForm } from './user-form'

const pageSize = 12

export function TeamManagement() {
  const searchParams = useSearchParams()
  const { account } = useSession()
  const [result, setResult] = useState<PaginatedUsers | null>(null)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)
  const [pendingUserId, setPendingUserId] = useState<string | null>(null)
  const [statusTarget, setStatusTarget] = useState<ManagedUser | null>(null)
  const [creating, setCreating] = useState(false)
  const [editing, setEditing] = useState<ManagedUser | null>(null)
  const [revision, setRevision] = useState(0)
  const query = useMemo(() => readQuery(searchParams), [searchParams])

  useEffect(() => {
    let active = true
    void listUsers(query)
      .then((page) => {
        if (!active) return
        setResult(page)
        setLoadError(null)
      })
      .catch((error: unknown) => {
        if (!active) return
        setLoadError(getTeamErrorMessage(error))
      })
    return () => {
      active = false
    }
  }, [query, revision])

  if (!account) return null

  const saved = (message: string) => {
    setNotice(message)
    setActionError(null)
    setCreating(false)
    setEditing(null)
    setStatusTarget(null)
    setRevision((value) => value + 1)
  }

  const changeStatus = async (user: ManagedUser) => {
    const nextStatus = user.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE'

    setPendingUserId(user.id)
    setActionError(null)
    try {
      const updated = await setUserStatus(user.id, nextStatus)
      saved(
        `${updated.name} foi ${nextStatus === 'ACTIVE' ? 'ativado' : 'desativado'}.`,
      )
    } catch (error) {
      setActionError(getTeamErrorMessage(error))
      setStatusTarget(null)
    } finally {
      setPendingUserId(null)
    }
  }

  return (
    <section className="mx-auto max-w-6xl space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="eyebrow">Configuração da organização</p>
          <h1 className="mt-3 font-heading text-3xl font-bold">Equipe</h1>
          <p className="mt-2 text-muted-foreground">
            Gerencie quem acessa a Ciclera e o perfil de cada integrante.
          </p>
        </div>
        <Button className="sm:shrink-0" onClick={() => setCreating(true)}>
          <UserPlus aria-hidden="true" />
          Adicionar pessoa
        </Button>
      </div>

      {notice ? (
        <Alert variant="success" role="status">
          {notice}
        </Alert>
      ) : null}
      {actionError ? (
        <Alert variant="destructive" role="alert">
          {actionError}
        </Alert>
      ) : null}

      <Modal
        open={creating || Boolean(editing)}
        onClose={() => {
          setCreating(false)
          setEditing(null)
        }}
        title={editing ? 'Editar integrante' : 'Adicionar pessoa'}
        description={
          editing
            ? 'Atualize o nome, o e-mail ou a senha desta pessoa.'
            : 'Crie o acesso e defina o perfil do novo integrante.'
        }
      >
        {editing ? (
          <EditUserForm
            key={editing.id}
            user={editing}
            onCancel={() => setEditing(null)}
            onSaved={saved}
          />
        ) : creating ? (
          <CreateUserForm
            actorRole={account.user.role}
            onCancel={() => setCreating(false)}
            onSaved={saved}
          />
        ) : null}
      </Modal>

      <ConfirmDialog
        open={Boolean(statusTarget)}
        title={
          statusTarget?.status === 'ACTIVE'
            ? 'Desativar integrante?'
            : 'Ativar integrante?'
        }
        description={
          statusTarget?.status === 'ACTIVE'
            ? `${statusTarget.name} perderá o acesso e terá as sessões atuais encerradas.`
            : `${statusTarget?.name ?? 'Esta pessoa'} poderá acessar novamente a Ciclera.`
        }
        confirmLabel={
          statusTarget?.status === 'ACTIVE' ? 'Desativar' : 'Ativar'
        }
        pendingLabel={
          statusTarget?.status === 'ACTIVE' ? 'Desativando…' : 'Ativando…'
        }
        variant={statusTarget?.status === 'ACTIVE' ? 'destructive' : 'default'}
        pending={pendingUserId === statusTarget?.id}
        onCancel={() => setStatusTarget(null)}
        onConfirm={() => {
          if (statusTarget) void changeStatus(statusTarget)
        }}
      />

      <FilterPanel
        activeFilterCount={
          Number(Boolean(query.search)) +
          Number(Boolean(query.role)) +
          Number(Boolean(query.status))
        }
        description="Encontre integrantes por nome, perfil ou situação de acesso."
      >
        <form
          key={searchParams.toString()}
          action="/app/equipe"
          className="space-y-5"
        >
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-[minmax(0,1fr)_12rem_12rem]">
            <Label className="grid gap-2">
              <span>Buscar integrante</span>
              <Input
                name="search"
                defaultValue={query.search}
                placeholder="Nome ou e-mail"
              />
            </Label>
            <Label className="grid gap-2">
              <span>Perfil</span>
              <select
                className="input"
                name="role"
                defaultValue={query.role ?? ''}
              >
                <option value="">Todos os perfis</option>
                <option value="OWNER">Proprietário</option>
                <option value="ADMIN">Administrador</option>
                <option value="TECHNICIAN">Técnico</option>
              </select>
            </Label>
            <Label className="grid gap-2">
              <span>Status</span>
              <select
                className="input"
                name="status"
                defaultValue={query.status ?? ''}
              >
                <option value="">Todos os status</option>
                <option value="ACTIVE">Ativo</option>
                <option value="INACTIVE">Inativo</option>
              </select>
            </Label>
          </div>
          <div className="flex flex-col-reverse gap-2 border-t pt-5 sm:flex-row sm:justify-end">
            {query.search || query.role || query.status ? (
              <Link
                href="/app/equipe"
                className={buttonVariants({ variant: 'ghost' })}
              >
                Limpar filtros
              </Link>
            ) : null}
            <Button type="submit">Aplicar filtros</Button>
          </div>
        </form>
      </FilterPanel>

      {loadError ? (
        <Alert variant="destructive" role="alert">
          {loadError}
        </Alert>
      ) : null}

      {!result && !loadError ? (
        <div
          aria-label="Carregando equipe"
          className="grid gap-3 sm:grid-cols-2"
        >
          <Skeleton className="h-36 rounded-2xl" />
          <Skeleton className="h-36 rounded-2xl" />
        </div>
      ) : null}

      {result?.items.length === 0 ? (
        <EmptyState
          title="Nenhum integrante encontrado"
          description="Ajuste os filtros ou adicione a primeira pessoa à equipe."
        />
      ) : null}

      {result && result.items.length > 0 ? (
        <div className="grid gap-3 sm:grid-cols-2">
          {result.items.map((user) => {
            const isProtectedOwner =
              account.user.id === user.id && user.role === 'OWNER'
            const manageable = canManageUser(
              account.user.role,
              user,
              account.user.id,
            )
            return (
              <article
                key={user.id}
                className="min-w-0 rounded-2xl border bg-card p-5 shadow-sm"
              >
                <div className="flex min-w-0 items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h2 className="truncate font-semibold">{user.name}</h2>
                    <p className="truncate text-sm text-muted-foreground">
                      {user.email}
                    </p>
                  </div>
                  <Badge
                    variant={user.status === 'ACTIVE' ? 'secondary' : 'outline'}
                  >
                    {user.status === 'ACTIVE' ? 'Ativo' : 'Inativo'}
                  </Badge>
                </div>
                <p className="mt-4 text-sm font-medium">
                  {roleLabel(user.role)}
                </p>
                {manageable ? (
                  <div className="mt-4 flex flex-wrap gap-2">
                    <Button variant="outline" onClick={() => setEditing(user)}>
                      Editar
                    </Button>
                    <Button
                      variant="ghost"
                      disabled={pendingUserId === user.id}
                      onClick={() => setStatusTarget(user)}
                    >
                      {pendingUserId === user.id
                        ? 'Processando…'
                        : user.status === 'ACTIVE'
                          ? 'Desativar'
                          : 'Ativar'}
                    </Button>
                  </div>
                ) : (
                  <p className="mt-4 text-xs text-muted-foreground">
                    {isProtectedOwner
                      ? 'Sua conta de proprietário é protegida e não pode ser alterada por aqui.'
                      : 'Somente um proprietário pode gerenciar este perfil.'}
                  </p>
                )}
              </article>
            )
          })}
        </div>
      ) : null}

      {result && result.total > result.pageSize ? (
        <nav
          aria-label="Paginação da equipe"
          className="flex items-center justify-between gap-4"
        >
          <PaginationLink
            disabled={result.page <= 1}
            href={teamUrl(query, result.page - 1)}
          >
            Anterior
          </PaginationLink>
          <span className="text-sm text-muted-foreground">
            Página {result.page} de {Math.ceil(result.total / result.pageSize)}
          </span>
          <PaginationLink
            disabled={result.page * result.pageSize >= result.total}
            href={teamUrl(query, result.page + 1)}
          >
            Próxima
          </PaginationLink>
        </nav>
      ) : null}
    </section>
  )
}

function readQuery(params: URLSearchParams): ListUsersQuery {
  const page = Number(params.get('page'))
  const role = params.get('role')
  const status = params.get('status')
  return {
    page: Number.isInteger(page) && page > 0 ? page : 1,
    pageSize,
    ...(params.get('search')?.trim()
      ? { search: params.get('search')?.trim() }
      : {}),
    ...(role === 'OWNER' || role === 'ADMIN' || role === 'TECHNICIAN'
      ? { role }
      : {}),
    ...(status === 'ACTIVE' || status === 'INACTIVE' ? { status } : {}),
  }
}

function teamUrl(query: ListUsersQuery, page: number): string {
  const params = new URLSearchParams({ page: String(page) })
  if (query.search) params.set('search', query.search)
  if (query.role) params.set('role', query.role)
  if (query.status) params.set('status', query.status)
  return `/app/equipe?${params.toString()}`
}

function PaginationLink({
  children,
  disabled,
  href,
}: {
  children: React.ReactNode
  disabled: boolean
  href: string
}) {
  return disabled ? (
    <span className="text-sm text-muted-foreground" aria-disabled="true">
      {children}
    </span>
  ) : (
    <Link className="text-sm font-semibold text-primary" href={href}>
      {children}
    </Link>
  )
}

function roleLabel(role: ManagedUser['role']): string {
  return {
    OWNER: 'Proprietário',
    ADMIN: 'Administrador',
    TECHNICIAN: 'Técnico',
  }[role]
}
