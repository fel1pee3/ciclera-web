export function formatEvidenceStorage(bytes: number) {
  return `${new Intl.NumberFormat('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(bytes / 1024 / 1024 / 1024)} GB`
}
