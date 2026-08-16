'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useForm } from 'react-hook-form'

import { Alert } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { UserRole } from '@/features/auth/contracts'
import { getApiFieldErrors } from '@/features/auth/errors'
import { createUser, updateUser } from './api'
import type { ManagedUser } from './contracts'
import { getTeamErrorMessage } from './errors'
import { creatableRoles } from './permissions'
import {
  createUserSchema,
  updateUserSchema,
  type CreateUserInput,
  type UpdateUserInput,
} from './schemas'

const roleLabels: Record<UserRole, string> = {
  OWNER: 'Proprietário',
  ADMIN: 'Administrador',
  TECHNICIAN: 'Técnico',
}

export function CreateUserForm({
  actorRole,
  onSaved,
}: {
  actorRole: UserRole
  onSaved: (message: string) => void
}) {
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<CreateUserInput>({
    resolver: zodResolver(createUserSchema),
    defaultValues: { role: 'TECHNICIAN' },
  })

  const submit = async (input: CreateUserInput) => {
    setErrorMessage(null)
    try {
      const created = await createUser(input)
      reset({ name: '', email: '', password: '', role: 'TECHNICIAN' })
      onSaved(`${created.name} foi adicionado à equipe.`)
    } catch (error) {
      const fieldErrors = getApiFieldErrors(error)
      for (const field of ['name', 'email', 'password', 'role'] as const) {
        const message = fieldErrors?.[field]?.[0]
        if (message) setError(field, { message })
      }
      setErrorMessage(getTeamErrorMessage(error))
    }
  }

  return (
    <form
      className="grid gap-4 rounded-2xl border bg-card p-5 sm:grid-cols-2"
      noValidate
      onSubmit={handleSubmit(submit)}
    >
      <div className="sm:col-span-2">
        <h2 className="font-heading text-lg font-semibold">Adicionar pessoa</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Defina uma senha inicial e compartilhe-a por um canal seguro. A pessoa
          poderá redefini-la pelo fluxo de recuperação.
        </p>
      </div>
      {errorMessage ? (
        <Alert className="sm:col-span-2" variant="destructive" role="alert">
          {errorMessage}
        </Alert>
      ) : null}
      <FormField label="Nome" error={errors.name?.message}>
        <Input autoComplete="name" {...register('name')} />
      </FormField>
      <FormField label="E-mail" error={errors.email?.message}>
        <Input type="email" autoComplete="email" {...register('email')} />
      </FormField>
      <FormField label="Senha inicial" error={errors.password?.message}>
        <Input
          type="password"
          autoComplete="new-password"
          {...register('password')}
        />
      </FormField>
      <FormField label="Perfil" error={errors.role?.message}>
        <select className="input" {...register('role')}>
          {creatableRoles(actorRole).map((role) => (
            <option key={role} value={role}>
              {roleLabels[role]}
            </option>
          ))}
        </select>
      </FormField>
      <div className="sm:col-span-2">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Adicionando…' : 'Adicionar à equipe'}
        </Button>
      </div>
    </form>
  )
}

export function EditUserForm({
  actorRole,
  user,
  onCancel,
  onSaved,
}: {
  actorRole: UserRole
  user: ManagedUser
  onCancel: () => void
  onSaved: (message: string) => void
}) {
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<UpdateUserInput>({
    resolver: zodResolver(updateUserSchema),
    defaultValues: { name: user.name, role: user.role },
  })

  const submit = async (input: UpdateUserInput) => {
    setErrorMessage(null)
    try {
      const updated = await updateUser(user.id, input)
      onSaved(`${updated.name} foi atualizado.`)
    } catch (error) {
      const fieldErrors = getApiFieldErrors(error)
      for (const field of ['name', 'role'] as const) {
        const message = fieldErrors?.[field]?.[0]
        if (message) setError(field, { message })
      }
      setErrorMessage(getTeamErrorMessage(error))
    }
  }

  return (
    <form
      className="grid gap-4 rounded-2xl border border-primary/30 bg-card p-5 sm:grid-cols-2"
      noValidate
      onSubmit={handleSubmit(submit)}
    >
      <h2 className="font-heading text-lg font-semibold sm:col-span-2">
        Editar integrante
      </h2>
      {errorMessage ? (
        <Alert className="sm:col-span-2" variant="destructive" role="alert">
          {errorMessage}
        </Alert>
      ) : null}
      <FormField label="Nome" error={errors.name?.message}>
        <Input {...register('name')} />
      </FormField>
      <FormField label="Perfil" error={errors.role?.message}>
        <select className="input" {...register('role')}>
          {creatableRoles(actorRole).map((role) => (
            <option key={role} value={role}>
              {roleLabels[role]}
            </option>
          ))}
        </select>
      </FormField>
      <div className="flex flex-wrap gap-3 sm:col-span-2">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Salvando…' : 'Salvar alterações'}
        </Button>
        <Button type="button" variant="ghost" onClick={onCancel}>
          Cancelar
        </Button>
      </div>
    </form>
  )
}

function FormField({
  children,
  error,
  label,
}: {
  children: React.ReactNode
  error?: string
  label: string
}) {
  return (
    <Label className="grid gap-2">
      <span>{label}</span>
      {children}
      {error ? <span className="text-sm text-destructive">{error}</span> : null}
    </Label>
  )
}
