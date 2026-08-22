'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useForm, useWatch } from 'react-hook-form'

import { Alert } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { PasswordInput } from '@/components/ui/password-input'
import type { UserRole } from '@/features/auth/contracts'
import { getApiFieldErrors } from '@/features/auth/errors'
import { PasswordRequirements } from '@/features/auth/password-requirements'
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
  onCancel,
  onSaved,
}: {
  actorRole: UserRole
  onCancel?: () => void
  onSaved: (message: string) => void
}) {
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const {
    register,
    handleSubmit,
    reset,
    setError,
    control,
    formState: { errors, isSubmitting, isValid },
  } = useForm<CreateUserInput>({
    resolver: zodResolver(createUserSchema),
    mode: 'onChange',
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      role: 'TECHNICIAN',
    },
  })
  const password = useWatch({ control, name: 'password', defaultValue: '' })

  const submit = async (input: CreateUserInput) => {
    setErrorMessage(null)
    try {
      const created = await createUser(input)
      reset({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        role: 'TECHNICIAN',
      })
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
      className="grid gap-4 sm:grid-cols-2"
      noValidate
      onSubmit={handleSubmit(submit)}
    >
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
        <PasswordInput
          id="team-password"
          autoComplete="new-password"
          aria-invalid={Boolean(errors.password)}
          aria-describedby="password-requirements"
          {...register('password')}
        />
      </FormField>
      <FormField
        label="Confirmar senha"
        error={errors.confirmPassword?.message}
      >
        <PasswordInput
          id="team-confirm-password"
          autoComplete="new-password"
          aria-invalid={Boolean(errors.confirmPassword)}
          {...register('confirmPassword')}
        />
      </FormField>
      <div className="sm:col-span-2">
        <PasswordRequirements value={password} />
      </div>
      <FormField label="Perfil" error={errors.role?.message}>
        <select className="input" {...register('role')}>
          {creatableRoles(actorRole).map((role) => (
            <option key={role} value={role}>
              {roleLabels[role]}
            </option>
          ))}
        </select>
      </FormField>
      <div className="flex flex-wrap justify-end gap-3 border-t pt-5 sm:col-span-2">
        {onCancel ? (
          <Button type="button" variant="ghost" onClick={onCancel}>
            Cancelar
          </Button>
        ) : null}
        <Button type="submit" disabled={isSubmitting || !isValid}>
          {isSubmitting ? 'Adicionando…' : 'Adicionar à equipe'}
        </Button>
      </div>
    </form>
  )
}

export function EditUserForm({
  user,
  onCancel,
  onSaved,
}: {
  user: ManagedUser
  onCancel: () => void
  onSaved: (message: string) => void
}) {
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const {
    register,
    handleSubmit,
    setError,
    control,
    formState: { errors, isSubmitting, isValid },
  } = useForm<UpdateUserInput>({
    resolver: zodResolver(updateUserSchema),
    mode: 'onChange',
    defaultValues: {
      name: user.name,
      email: user.email,
      password: '',
      confirmPassword: '',
    },
  })
  const password = useWatch({ control, name: 'password', defaultValue: '' })

  const submit = async (input: UpdateUserInput) => {
    setErrorMessage(null)
    try {
      const updated = await updateUser(user.id, input)
      onSaved(`${updated.name} foi atualizado.`)
    } catch (error) {
      const fieldErrors = getApiFieldErrors(error)
      for (const field of ['name', 'email', 'password'] as const) {
        const message = fieldErrors?.[field]?.[0]
        if (message) setError(field, { message })
      }
      setErrorMessage(getTeamErrorMessage(error))
    }
  }

  return (
    <form
      className="grid gap-4 sm:grid-cols-2"
      noValidate
      onSubmit={handleSubmit(submit)}
    >
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
      <FormField label="Nova senha (opcional)" error={errors.password?.message}>
        <PasswordInput
          id={`edit-password-${user.id}`}
          autoComplete="new-password"
          aria-invalid={Boolean(errors.password)}
          aria-describedby={password ? 'password-requirements' : undefined}
          {...register('password')}
        />
      </FormField>
      <FormField
        label="Confirmar nova senha"
        error={errors.confirmPassword?.message}
      >
        <PasswordInput
          id={`edit-confirm-password-${user.id}`}
          autoComplete="new-password"
          aria-invalid={Boolean(errors.confirmPassword)}
          {...register('confirmPassword')}
        />
      </FormField>
      {password ? (
        <div className="sm:col-span-2">
          <PasswordRequirements value={password} />
        </div>
      ) : (
        <p className="text-sm text-muted-foreground sm:col-span-2">
          Deixe os campos de senha vazios para manter a senha atual.
        </p>
      )}
      <FormField label="Perfil">
        <select
          aria-label="Perfil"
          aria-describedby={`edit-role-help-${user.id}`}
          className="input cursor-not-allowed bg-muted/40 text-muted-foreground"
          disabled
          value={user.role}
        >
          <option value={user.role}>{roleLabels[user.role]}</option>
        </select>
        <span
          className="text-xs text-muted-foreground"
          id={`edit-role-help-${user.id}`}
        >
          O perfil é definido na criação da conta e não pode ser alterado nesta
          edição.
        </span>
      </FormField>
      <div className="flex flex-wrap justify-end gap-3 border-t pt-5 sm:col-span-2">
        <Button type="button" variant="ghost" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" disabled={isSubmitting || !isValid}>
          {isSubmitting ? 'Salvando…' : 'Salvar alterações'}
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
