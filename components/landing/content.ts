import {
  Camera,
  History,
  LayoutDashboard,
  ReceiptText,
  UsersRound,
  Wrench,
} from 'lucide-react'

export const productNavigation = [
  {
    title: 'Gestão operacional',
    description: 'Clientes, equipamentos, ordens e agenda em um fluxo único.',
    href: '/produto/gestao-operacional',
    icon: LayoutDashboard,
  },
  {
    title: 'Execução em campo',
    description: 'Uma interface direta para o técnico registrar o serviço.',
    href: '/produto/execucao-em-campo',
    icon: Wrench,
  },
  {
    title: 'Revisão e faturamento',
    description: 'Evidências conferidas antes de liberar a receita.',
    href: '/produto/revisao-e-faturamento',
    icon: ReceiptText,
  },
] as const

export const navLinks = [
  ['Como funciona', '/como-funciona'],
  ['Para quem', '/para-quem'],
  ['Planos', '/planos'],
  ['Dúvidas', '/duvidas'],
] as const

export const pipeline = [
  ['Chamado', 'Demanda registrada'],
  ['Agenda', 'Data e responsável'],
  ['Campo', 'Execução documentada'],
  ['Revisão', 'Conferência administrativa'],
  ['Faturamento', 'Receita liberada'],
] as const

export const problems: {
  category: string
  title: string
  text: string
  impact: string
}[] = [
  {
    category: 'Fechamento da OS',
    title: 'A OS termina, mas não chega pronta ao financeiro',
    text: 'O serviço foi realizado, porém observações, valores e comprovações continuam espalhados entre mensagens, papel e planilhas.',
    impact: 'Financeiro sem insumos para cobrar',
  },
  {
    category: 'Comprovação do serviço',
    title: 'A evidência fica para depois',
    text: 'Quando a foto ou o diagnóstico não acompanha a ordem, o administrativo precisa interromper o fluxo para reconstruir o atendimento.',
    impact: 'Conferência e cobrança atrasadas',
  },
  {
    category: 'Valor executado',
    title: 'O adicional executado desaparece da cobrança',
    text: 'Peças, horas e atividades descobertas em campo deixam de compor o valor final quando não são registradas no momento certo.',
    impact: 'Receita realizada, mas não capturada',
  },
  {
    category: 'Memória do atendimento',
    title: 'O histórico depende da memória da equipe',
    text: 'Sem uma linha do tempo por cliente e equipamento, cada retorno consome mais tempo e aumenta o risco de retrabalho.',
    impact: 'Retorno mais lento e sujeito a retrabalho',
  },
]

export const steps = [
  {
    title: 'Planeje com contexto',
    text: 'Cliente, local, equipamento, prioridade, valor previsto e responsável seguem juntos desde a abertura.',
  },
  {
    title: 'Execute sem ruído',
    text: 'O técnico vê somente o que precisa e registra diagnóstico, fotos, materiais, serviços e horas no navegador.',
  },
  {
    title: 'Revise antes de cobrar',
    text: 'O escritório confere a entrega, solicita correção quando necessário e congela o valor aprovado.',
  },
  {
    title: 'Fature com clareza',
    text: 'As ordens aprovadas entram em uma fila objetiva, com valor final, histórico e relatório prontos para o administrativo.',
  },
] as const

export const capabilityGroups = [
  {
    label: 'Antes do atendimento',
    title: 'Toda a operação começa organizada.',
    description:
      'Estruture a base que sua equipe consulta todos os dias e transforme a demanda em uma ordem pronta para ser executada.',
    items: [
      'Clientes, unidades e contatos operacionais',
      'Equipamentos e histórico técnico',
      'Equipe, perfis de acesso e agenda',
      'Ordens com prioridade, prazo e valor previsto',
    ],
  },
  {
    label: 'Durante o atendimento',
    title: 'O campo registra o que realmente aconteceu.',
    description:
      'A experiência do técnico é direta, responsiva e concentrada na execução da ordem atribuída.',
    items: [
      'Observações e diagnóstico do serviço',
      'Fotos privadas do atendimento',
      'Materiais, serviços e horas adicionais',
      'Proteção contra conflitos e envios repetidos',
    ],
  },
  {
    label: 'Depois da execução',
    title: 'O administrativo decide com evidência.',
    description:
      'A conclusão não some em uma conversa: ela segue para revisão, relatório e acompanhamento do faturamento.',
    items: [
      'Revisão, aprovação e solicitação de correção',
      'Valores oficiais calculados em centavos',
      'Relatório PDF e exportação financeira',
      'Histórico e auditoria das alterações',
    ],
  },
] as const

export const segments = [
  {
    title: 'Climatização e refrigeração',
    description: 'Instalação, manutenção preventiva e corretiva.',
  },
  {
    title: 'Energia, solar e geradores',
    description: 'Inspeção, manutenção e assistência por unidade.',
  },
  {
    title: 'Segurança eletrônica e CFTV',
    description: 'Instalação, vistoria e suporte com evidências.',
  },
  {
    title: 'Equipamentos técnicos e médicos',
    description: 'Histórico e rastreabilidade de cada ativo.',
  },
  {
    title: 'Manutenção predial',
    description: 'Rotinas recorrentes por cliente e local.',
  },
  {
    title: 'Sistemas industriais e contra incêndio',
    description: 'Execuções críticas documentadas do início ao fim.',
  },
]

export const plans = [
  {
    code: 'ESSENTIAL',
    name: 'Essencial',
    description: 'Para estruturar uma equipe técnica enxuta.',
    price: '199',
    technicians: 'Até 5 técnicos',
    administrators: 'Até 3 acessos administrativos',
    storage: '5 GB para evidências',
    recommended: false,
  },
  {
    code: 'PROFESSIONAL',
    name: 'Profissional',
    description:
      'Para operações em crescimento que precisam de mais capacidade.',
    price: '399',
    technicians: 'Até 15 técnicos',
    administrators: 'Até 7 acessos administrativos',
    storage: '20 GB para evidências',
    recommended: true,
  },
  {
    code: 'OPERATION',
    name: 'Operação',
    description: 'Para equipes maiores e maior volume de registros em campo.',
    price: '699',
    technicians: 'Até 30 técnicos',
    administrators: 'Até 15 acessos administrativos',
    storage: '50 GB para evidências',
    recommended: false,
  },
] as const

export const commonPlanFeatures = [
  'Ordens de serviço sem limite por plano',
  'Agenda, execução em campo e revisão',
  'Fotos privadas e relatórios em PDF',
  'Histórico de clientes e equipamentos',
] as const

export const faqs = [
  [
    'A Ciclera já está disponível?',
    'Sim. Você pode criar sua organização, escolher um plano e configurar equipe, clientes, locais e equipamentos diretamente pelo navegador.',
  ],
  [
    'Preciso instalar um aplicativo?',
    'Não. A Ciclera funciona no navegador e possui interfaces responsivas para computadores, tablets e celulares compatíveis.',
  ],
  [
    'O que muda entre os planos?',
    'Os planos possuem o mesmo fluxo operacional. O que muda é a capacidade de técnicos, acessos administrativos e armazenamento de evidências.',
  ],
  [
    'Existe período de teste?',
    'Não. A operação é liberada após a confirmação do pagamento do plano escolhido.',
  ],
  [
    'A Ciclera emite nota fiscal do serviço executado?',
    'A Ciclera organiza, revisa e libera os serviços prontos para faturamento. A emissão fiscal continua no processo financeiro da empresa prestadora.',
  ],
  [
    'A Ciclera substitui meu ERP?',
    'Não é esse o objetivo. A Ciclera concentra o fluxo operacional entre chamado, execução, evidências, revisão e liberação para faturamento.',
  ],
  [
    'Quem pode administrar a equipe?',
    'Proprietários e administradores possuem responsabilidades distintas. Ações sensíveis preservam a autoridade do proprietário da organização.',
  ],
] as const

export const trustSignals = [
  { label: 'Acesso por perfil', icon: UsersRound },
  { label: 'Evidências privadas', icon: Camera },
  { label: 'Histórico preservado', icon: History },
] as const
