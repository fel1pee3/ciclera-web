'use client'

import { Trash2, UserPlus, X } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'

import { Alert } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { EmptyState } from '@/components/ui/empty-state'
import { FilterPanel } from '@/components/ui/filter-panel'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Modal } from '@/components/ui/modal'
import { Skeleton } from '@/components/ui/skeleton'
import type { UserRole } from '@/features/auth/contracts'
import { useSession } from '@/features/auth/session-provider'
import {
  deleteUser,
  listUsers,
  setUserStatus,
  type ListUsersQuery,
} from './api'
import type { ManagedUser, PaginatedUsers, UserStatus } from './contracts'
import { getTeamErrorMessage } from './errors'
import { canManageUser } from './permissions'
import { CreateUserForm, EditUserForm } from './user-form'

const pageSize = 12

export function TeamManagement() {
  const { account } = useSession()
  const [result, setResult] = useState<PaginatedUsers | null>(null)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)
  const [pendingUserId, setPendingUserId] = useState<string | null>(null)
  const [statusTarget, setStatusTarget] = useState<ManagedUser | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<ManagedUser | null>(null)
  const [creating, setCreating] = useState(false)
  const [editing, setEditing] = useState<ManagedUser | null>(null)
  const [revision, setRevision] = useState(0)
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState<UserRole | ''>('')
  const [statusFilter, setStatusFilter] = useState<UserStatus | ''>('')
  const [page, setPage] = useState(1)
  const query = useMemo<ListUsersQuery>(
    () => ({
      page,
      pageSize,
      ...(debouncedSearch ? { search: debouncedSearch } : {}),
      ...(roleFilter ? { role: roleFilter } : {}),
      ...(statusFilter ? { status: statusFilter } : {}),
    }),
    [debouncedSearch, page, roleFilter, statusFilter],
  )

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setDebouncedSearch(search.trim())
    }, 250)
    return () => window.clearTimeout(timeout)
  }, [search])

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
    setDeleteTarget(null)
    setRevision((value) => value + 1)
  }

  const removeUser = async (user: ManagedUser) => {
    setPendingUserId(user.id)
    setActionError(null)
    try {
      await deleteUser(user.id)
      saved(`${user.name} foi excluído da equipe.`)
    } catch (error) {
      setActionError(getTeamErrorMessage(error))
      setDeleteTarget(null)
    } finally {
      setPendingUserId(null)
    }
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
            actorRole={account.user.role}
            allowRoleChange={
              editing.role !== 'OWNER' && editing.id !== account.user.id
            }
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

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Excluir integrante?"
        description={`${deleteTarget?.name ?? 'Esta pessoa'} perderá o acesso e deixará de aparecer na equipe. Ordens, auditoria e históricos já registrados serão preservados.`}
        confirmLabel="Excluir integrante"
        pendingLabel="Excluindo…"
        variant="destructive"
        pending={pendingUserId === deleteTarget?.id}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={() => {
          if (deleteTarget) void removeUser(deleteTarget)
        }}
      />

      <FilterPanel
        activeFilterCount={
          Number(Boolean(search.trim())) +
          Number(Boolean(roleFilter)) +
          Number(Boolean(statusFilter))
        }
        description="Encontre integrantes por nome, perfil ou situação de acesso."
      >
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-[minmax(0,1fr)_12rem_12rem]">
          <Label className="grid gap-2">
            <span>Buscar integrante</span>
            <div className="relative">
              <Input
                className={search ? 'pr-11' : undefined}
                placeholder="Nome ou e-mail"
                value={search}
                onChange={(event) => {
                  setSearch(event.target.value)
                  setPage(1)
                }}
              />
              {search ? (
                <>
                  <span
                    aria-hidden="true"
                    className="absolute right-10 top-1/2 h-5 w-px -translate-y-1/2 bg-border"
                  />
                  <button
                    type="button"
                    aria-label="Limpar busca"
                    title="Limpar busca"
                    className="absolute right-1 top-1/2 grid size-9 -translate-y-1/2 place-items-center text-muted-foreground transition-colors duration-200 hover:text-primary focus-visible:rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    onClick={() => {
                      setSearch('')
                      setDebouncedSearch('')
                      setPage(1)
                    }}
                  >
                    <X aria-hidden="true" className="size-4 stroke-2" />
                  </button>
                </>
              ) : null}
            </div>
          </Label>
          <Label className="grid gap-2">
            <span>Perfil</span>
            <select
              className="input"
              value={roleFilter}
              onChange={(event) => {
                setRoleFilter(event.target.value as UserRole | '')
                setPage(1)
              }}
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
              value={statusFilter}
              onChange={(event) => {
                setStatusFilter(event.target.value as UserStatus | '')
                setPage(1)
              }}
            >
              <option value="">Todos os status</option>
              <option value="ACTIVE">Ativo</option>
              <option value="INACTIVE">Inativo</option>
            </select>
          </Label>
        </div>
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
          {ownerFirst(result.items).map((user) => {
            const isProtectedOwner = user.role === 'OWNER'
            const canEditOwnOwner =
              isProtectedOwner &&
              account.user.role === 'OWNER' &&
              account.user.id === user.id
            const canEditOwnAdmin =
              user.role === 'ADMIN' &&
              account.user.role === 'ADMIN' &&
              account.user.id === user.id
            const manageable =
              !isProtectedOwner && canManageUser(account.user, user)
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
                {canEditOwnOwner || canEditOwnAdmin ? (
                  <div className="mt-4">
                    <Button variant="outline" onClick={() => setEditing(user)}>
                      Editar
                    </Button>
                  </div>
                ) : manageable ? (
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
                    <Button
                      variant="destructive"
                      disabled={pendingUserId === user.id}
                      onClick={() => setDeleteTarget(user)}
                    >
                      <Trash2 aria-hidden="true" />
                      Excluir
                    </Button>
                  </div>
                ) : !isProtectedOwner ? (
                  <p className="mt-4 text-xs text-muted-foreground">
                    Somente um proprietário pode gerenciar este perfil.
                  </p>
                ) : null}
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
          <Button
            type="button"
            variant="ghost"
            disabled={result.page <= 1}
            onClick={() => setPage((current) => Math.max(1, current - 1))}
          >
            Anterior
          </Button>
          <span className="text-sm text-muted-foreground">
            Página {result.page} de {Math.ceil(result.total / result.pageSize)}
          </span>
          <Button
            type="button"
            variant="ghost"
            disabled={result.page * result.pageSize >= result.total}
            onClick={() => setPage((current) => current + 1)}
          >
            Próxima
          </Button>
        </nav>
      ) : null}
    </section>
  )
}

function roleLabel(role: ManagedUser['role']): string {
  return {
    OWNER: 'Proprietário',
    ADMIN: 'Administrador',
    TECHNICIAN: 'Técnico',
  }[role]
}

function ownerFirst(users: ManagedUser[]): ManagedUser[] {
  return [...users].sort(
    (left, right) =>
      Number(right.role === 'OWNER') - Number(left.role === 'OWNER'),
  )
}
