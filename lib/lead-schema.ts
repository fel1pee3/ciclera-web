import { z } from 'zod'

export const leadSchema = z.object({
  name: z.string().trim().min(3, 'Informe seu nome completo.').max(120),
  company: z.string().trim().min(2, 'Informe a empresa.').max(120),
  role: z.string().trim().min(2, 'Informe seu cargo ou função.').max(100),
  email: z.string().trim().email('Informe um e-mail válido.').max(160),
  whatsapp: z.string().trim().min(8, 'Informe um WhatsApp válido.').max(30),
  location: z.string().trim().min(3, 'Informe cidade e estado.').max(120),
  technicians: z.enum(['1–4', '5–10', '11–20', '21–30', 'Mais de 30'], {
    message: 'Selecione uma opção.',
  }),
  monthlyOrders: z.enum(
    ['Até 50', '51–100', '101–300', '301–500', 'Mais de 500'],
    { message: 'Selecione uma opção.' },
  ),
  currentControl: z.enum(
    [
      'WhatsApp',
      'Papel',
      'Planilhas',
      'ERP genérico',
      'Software de ordem de serviço',
      'Combinação de ferramentas',
    ],
    { message: 'Selecione uma opção.' },
  ),
  challenge: z
    .string()
    .trim()
    .min(10, 'Descreva brevemente a principal dificuldade.')
    .max(1200),
  consent: z
    .boolean()
    .refine((value) => value, 'É necessário autorizar o contato.'),
  website: z.string().max(0).optional(),
})
export type LeadInput = z.infer<typeof leadSchema>
