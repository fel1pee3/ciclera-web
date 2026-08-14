import {
  CalendarDays, CheckCircle2, ClipboardCheck, FileWarning, History,
  LayoutDashboard, PackagePlus, ReceiptText, Wrench, type LucideIcon,
  Building2, Camera, ShieldCheck, Sun, Snowflake, Factory,
} from 'lucide-react'

export const nav = [
  ['O problema', '#problema'], ['Como funciona', '#como-funciona'],
  ['Funcionalidades', '#funcionalidades'], ['Para quem é', '#para-quem'], ['Piloto', '#piloto'],
] as const

export const flow = ['Chamado', 'Planejamento', 'Execução', 'Evidências', 'Revisão', 'Faturamento']

export const problems: { title: string; text: string; icon: LucideIcon }[] = [
  { title: 'OS concluída, mas parada', text: 'O técnico finaliza o atendimento, mas a informação demora para chegar ao administrativo.', icon: FileWarning },
  { title: 'Evidência ausente', text: 'Fotos, checklists ou assinatura incompletos impedem a conferência e atrasam a cobrança.', icon: Camera },
  { title: 'Serviço adicional não registrado', text: 'Peças, horas ou atividades extras executadas em campo não entram no valor final.', icon: PackagePlus },
  { title: 'Retorno consumindo margem', text: 'Falta de histórico e informação gera deslocamentos adicionais e retrabalho.', icon: History },
]

export const steps = [
  ['Organize o chamado', 'Registre cliente, equipamento, prioridade, descrição e responsável.'],
  ['Planeje a execução', 'Distribua as ordens de serviço e acompanhe a agenda da equipe.'],
  ['Registre o trabalho em campo', 'O técnico acessa pelo navegador, preenche checklist, fotos, observações, materiais e assinatura.'],
  ['Revise as evidências', 'O escritório confere as informações, identifica pendências e devolve a OS quando necessário.'],
  ['Libere para faturamento', 'As ordens aprovadas entram em uma fila clara de serviços prontos para faturar.'],
] as const

export const features: { title: string; text: string; icon: LucideIcon }[] = [
  { title: 'Clientes e equipamentos', text: 'Dados, locais, contatos, equipamentos e histórico técnico centralizados.', icon: Building2 },
  { title: 'Equipe e agenda', text: 'Atendimentos programados e ordens distribuídas entre os técnicos.', icon: CalendarDays },
  { title: 'Ordens de serviço', text: 'Prioridade, responsável, status, prazo, valores e histórico.', icon: ClipboardCheck },
  { title: 'Execução web responsiva', text: 'Registro pelo navegador do computador, tablet ou celular.', icon: Wrench },
  { title: 'Checklists e evidências', text: 'Respostas, fotos, observações e assinatura do atendimento.', icon: CheckCircle2 },
  { title: 'Serviços adicionais', text: 'Atividades, horas e materiais identificados durante a execução.', icon: PackagePlus },
  { title: 'Revisão operacional', text: 'Conferência de evidências, pendências e aprovação da ordem.', icon: ShieldCheck },
  { title: 'Fila para faturar', text: 'Serviços revisados e liberados reunidos em um só lugar.', icon: ReceiptText },
  { title: 'Histórico e rastreabilidade', text: 'Alterações, responsáveis e histórico por cliente e equipamento.', icon: History },
  { title: 'Dashboard financeiro simples', text: 'Valores em execução, bloqueados, liberados e faturados.', icon: LayoutDashboard },
]

export const segments: { title: string; icon: LucideIcon }[] = [
  { title: 'Climatização e refrigeração', icon: Snowflake },
  { title: 'Energia, solar e geradores', icon: Sun },
  { title: 'Segurança eletrônica e CFTV', icon: ShieldCheck },
  { title: 'Equipamentos técnicos e médicos', icon: Wrench },
  { title: 'Manutenção predial', icon: Building2 },
  { title: 'Sistemas industriais e contra incêndio', icon: Factory },
]

export const benefits = [
  ['Menos serviços esquecidos', 'Centralize as ordens concluídas e acompanhe o que ainda depende de revisão.'],
  ['Faturamento mais organizado', 'Dê ao administrativo uma fila objetiva de serviços aprovados.'],
  ['Menos retrabalho', 'Identifique evidências ausentes antes que o atendimento seja encerrado.'],
  ['Histórico confiável', 'Preserve informações de clientes, equipamentos, atendimentos e responsáveis.'],
] as const

export const faqs = [
  ['A Ciclera já está disponível?', 'A Ciclera está em fase de validação e seleção das primeiras empresas participantes. O piloto será conduzido de forma acompanhada para garantir aderência ao fluxo real da operação.'],
  ['Preciso instalar um aplicativo?', 'Não. A primeira versão será acessada pelo navegador e funcionará em computadores, tablets e celulares compatíveis.'],
  ['A Ciclera emite nota fiscal?', 'Nesta primeira fase, a Ciclera organiza, revisa e libera os serviços prontos para faturamento. A emissão fiscal continuará no processo financeiro da empresa.'],
  ['A Ciclera substitui meu ERP?', 'Não é esse o objetivo inicial. A Ciclera concentra o fluxo operacional entre chamado, execução, evidências, revisão e liberação para faturamento.'],
  ['Para quais empresas a Ciclera foi criada?', 'Para empresas B2B com equipes técnicas externas que instalam, inspecionam, reparam ou fazem manutenção em equipamentos.'],
  ['Como funciona o programa piloto?', 'Primeiro entendemos a operação, seus volumes e gargalos. Depois avaliamos a aderência ao piloto e definimos conjuntamente o fluxo acompanhado.'],
  ['Já existem preços definidos?', 'Os valores e as condições do piloto serão apresentados após entendermos o tamanho e as necessidades da operação.'],
] as const
