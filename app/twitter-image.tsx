import { createSocialImage, socialImageSize } from '@/lib/social-image'

export const alt =
  'Ciclera — gestão de ordens de serviço e equipes externas, do chamado ao faturamento'
export const size = socialImageSize
export const contentType = 'image/png'

export default function TwitterImage() {
  return createSocialImage()
}
