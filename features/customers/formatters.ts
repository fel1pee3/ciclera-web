export type DocumentType = 'CPF' | 'CNPJ'

export function onlyDigits(value: string): string {
  return value.replace(/\D/g, '')
}

export function inferDocumentType(
  value: string | null | undefined,
): DocumentType {
  return onlyDigits(value ?? '').length === 11 ? 'CPF' : 'CNPJ'
}

export function formatDocument(value: string, type: DocumentType): string {
  const maximum = type === 'CPF' ? 11 : 14
  const digits = onlyDigits(value).slice(0, maximum)
  if (type === 'CPF') {
    return digits
      .replace(/^(\d{3})(\d)/, '$1.$2')
      .replace(/^(\d{3})\.(\d{3})(\d)/, '$1.$2.$3')
      .replace(/\.(\d{3})(\d)/, '.$1-$2')
  }
  return digits
    .replace(/^(\d{2})(\d)/, '$1.$2')
    .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
    .replace(/\.(\d{3})(\d)/, '.$1/$2')
    .replace(/(\/\d{4})(\d)/, '$1-$2')
}

export function normalizeBrazilPhone(value: string): string {
  const digits = onlyDigits(value)
  if (!digits) return ''
  return (digits.startsWith('55') ? digits : `55${digits}`).slice(0, 13)
}

export function formatBrazilPhone(value: string): string {
  const digits = normalizeBrazilPhone(value)
  if (!digits) return ''

  const areaCode = digits.slice(2, 4)
  const local = digits.slice(4)
  let formatted = '+55'
  if (areaCode) formatted += ` (${areaCode}`
  if (areaCode.length === 2) formatted += ')'
  if (local) {
    const prefixSize = local.length > 8 ? 5 : Math.min(4, local.length)
    formatted += ` ${local.slice(0, prefixSize)}`
    if (local.length > prefixSize) formatted += `-${local.slice(prefixSize)}`
  }
  return formatted
}

export function displayDocument(
  value: string | null | undefined,
): string | null {
  if (!value) return null
  return formatDocument(value, inferDocumentType(value))
}

export function displayPhone(value: string | null | undefined): string | null {
  if (!value) return null
  return formatBrazilPhone(value)
}
