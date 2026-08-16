# Ciclera Web

Aplicação web da Ciclera construída com Next.js. Este projeto contém a presença pública da marca, a área administrativa utilizada pelo escritório e a interface responsiva utilizada pelos técnicos em campo.

> **Do chamado ao caixa.**

Antes de implementar ou alterar esta aplicação, leia também o [`README.md` da raiz](../README.md). Ele é a fonte principal para visão do produto, escopo do MVP, perfis, ciclo da ordem de serviço, segurança e regras compartilhadas com a API.

## Status

Aplicação em construção para validação do MVP com as primeiras empresas piloto.

O objetivo é entregar uma experiência pequena, confiável e utilizável. Não construir antecipadamente um ERP completo, um aplicativo mobile ou funcionalidades listadas como fora de escopo no README raiz.

## Responsabilidades desta aplicação

O `ciclera-web` é responsável por:

- Landing page pública da Ciclera.
- Captação de empresas interessadas no programa piloto.
- Páginas públicas institucionais e jurídicas.
- Login e recuperação de acesso.
- Painel operacional para `OWNER` e `ADMIN`.
- Experiência web de execução para `TECHNICIAN`.
- Formulários e feedback imediato de validação.
- Consumo tipado da `ciclera-api`.
- Estados de loading, vazio, erro e sucesso.
- Acessibilidade, responsividade, performance e SEO das páginas públicas.

Esta aplicação não é responsável por:

- Aplicar autorização definitiva.
- Validar isoladamente regras críticas de negócio.
- Persistir dados diretamente no PostgreSQL.
- Alterar livremente o status de uma ordem.
- Calcular valores financeiros como fonte de verdade.
- Emitir notas fiscais.
- Fornecer funcionamento offline.

A API é sempre a autoridade final sobre identidade, organização, permissões, transições de status, valores e persistência.

## Escopo web do MVP

### Área pública

- Landing page completa.
- Apresentação do problema, proposta e fluxo do produto.
- Demonstração visual claramente identificada como demonstrativa.
- Formulário de interesse no programa piloto.
- Contato por WhatsApp e e-mail quando configurados.
- Política de Privacidade.
- Termos de Uso.
- Metadata, Open Graph, sitemap e robots.

### Área administrativa

- Dashboard operacional.
- Gerenciamento de clientes.
- Gerenciamento de locais de atendimento.
- Gerenciamento de equipamentos.
- Gerenciamento básico da equipe.
- Criação, edição, atribuição e consulta de ordens de serviço.
- Agenda operacional simples.
- Revisão de execuções e evidências.
- Registro de pendências.
- Fila de serviços prontos para faturar.
- Marcação manual de ordens como faturadas.
- Configurações básicas da organização e conta.

### Área do técnico

- Lista das próprias ordens atribuídas.
- Detalhes necessários para o atendimento.
- Início da execução.
- Checklist.
- Observações.
- Fotos e evidências.
- Materiais, horas ou serviços adicionais.
- Assinatura quando exigida.
- Conclusão e envio para revisão.
- Visualização e correção de pendências.

Não existe aplicativo mobile nativo no MVP. A área do técnico deve ser uma experiência web responsiva, acessível pelo navegador e sem promessas de offline, sincronização ou push notifications.

## Stack

### Base obrigatória

- Next.js com App Router.
- React.
- TypeScript com `strict: true`.
- Tailwind CSS.
- `next/font` para carregamento das fontes.
- Lucide Icons para ícones de interface.
- React Hook Form para formulários interativos.
- Zod para validação e parsing de dados.
- TanStack Query para server state interativo quando necessário.

### Testes

- Vitest para testes unitários.
- React Testing Library para comportamento de componentes.
- Playwright para os fluxos end-to-end críticos.

### Princípios de dependências

- Utilizar as versões já definidas no `package.json` e no lockfile.
- Não atualizar dependências em uma tarefa que não exija atualização.
- Não adicionar bibliotecas para resolver algo simples que já pode ser feito com React, Next.js ou utilitários existentes.
- Não instalar biblioteca de estado global no MVP sem uma necessidade concreta.
- Não instalar biblioteca de gráficos enquanto não houver visualização que realmente precise dela.
- Não usar duas bibliotecas para a mesma responsabilidade.
- Toda nova dependência deve possuir uma justificativa clara e ser compatível com Server Components quando aplicável.

## Requisitos locais

- Node.js `22.21.1`, fixado em `.nvmrc` e aceito na faixa `22.x` por `engines`.
- npm `10.9.4`, definido em `packageManager` e aceito na faixa `10.x` por `engines`.
- `ciclera-api` configurada e em execução.

Se o repositório ainda não possuir versões fixadas, adicioná-las por meio dos mecanismos adotados pelo projeto, como `packageManager`, `.nvmrc` ou equivalente, e atualizar esta seção.

## Instalação

Na pasta `ciclera-web`:

```bash
npm ci
cp .env.example .env.local
npm run dev
```

A URL local padrão deve ser documentada pelo projeto. Quando mantido o padrão do Next.js:

```text
http://localhost:3000
```

O acesso autenticado depende da API e das variáveis de ambiente estarem corretamente configuradas.

## Scripts esperados

O `package.json` deve manter scripts equivalentes aos seguintes:

| Comando                | Responsabilidade                                          |
| ---------------------- | --------------------------------------------------------- |
| `npm run dev`          | Iniciar o servidor de desenvolvimento                     |
| `npm run build`        | Gerar o build de produção                                 |
| `npm run start`        | Executar o build de produção                              |
| `npm run lint`         | Executar as regras de lint                                |
| `npm run typecheck`    | Gerar os tipos do Next.js e validar tipos sem gerar build |
| `npm test`             | Executar testes unitários e de componentes                |
| `npm run test:watch`   | Executar testes em modo interativo                        |
| `npm run format`       | Formatar os arquivos suportados                           |
| `npm run format:check` | Verificar a formatação sem alterar arquivos               |

Este README deve refletir os scripts reais. Se um script ainda não existir, ele deve ser implementado antes de ser utilizado no fluxo de CI.

## Variáveis de ambiente

Manter um `.env.example` versionado e sincronizado com a validação de ambiente da aplicação.

| Variável                      | Escopo   |       Obrigatória | Finalidade                              |
| ----------------------------- | -------- | ----------------: | --------------------------------------- |
| `NEXT_PUBLIC_APP_URL`         | Público  |               Sim | URL canônica da aplicação web           |
| `NEXT_PUBLIC_API_URL`         | Público  |               Sim | URL pública da `ciclera-api`            |
| `NEXT_PUBLIC_WHATSAPP_NUMBER` | Público  |               Não | WhatsApp usado nos CTAs públicos        |
| `NEXT_PUBLIC_CONTACT_EMAIL`   | Público  |               Não | E-mail público de contato da Ciclera    |
| `LEAD_WEBHOOK_URL`            | Servidor | Conforme captação | Destino server-side dos leads do piloto |

Exemplo seguro:

```env
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NEXT_PUBLIC_API_URL="http://localhost:3333"
NEXT_PUBLIC_WHATSAPP_NUMBER=""
NEXT_PUBLIC_CONTACT_EMAIL="contatociclera@gmail.com"
LEAD_WEBHOOK_URL=""
```

Regras:

- Nunca colocar secret em variável iniciada por `NEXT_PUBLIC_`.
- Nunca versionar `.env.local`.
- Validar variáveis obrigatórias na inicialização.
- Não espalhar chamadas diretas a `process.env` por componentes.
- Centralizar schema e parsing em `config/env-schema.ts`, valores públicos em
  `config/public-env.ts` e valores privados em `config/server-env.ts`.
- O módulo privado utiliza `server-only` e não pode ser importado por Client
  Components.
- O formulário público não pode exibir sucesso se o lead não tiver sido persistido ou entregue ao destino configurado.
- Se o lead for futuramente recebido pela API, remover a responsabilidade de webhook do frontend e atualizar esta documentação.

## Arquitetura de rotas

As rotas devem usar Route Groups para separar contextos sem adicionar segmentos desnecessários à URL.

### Rotas públicas

| Rota                       | Finalidade                                           |
| -------------------------- | ---------------------------------------------------- |
| `/`                        | Landing page da Ciclera                              |
| `/politica-de-privacidade` | Política de Privacidade                              |
| `/termos-de-uso`           | Termos de Uso                                        |
| `/login`                   | Autenticação                                         |
| `/recuperar-senha`         | Solicitação de recuperação de senha                  |
| `/redefinir-senha`         | Definição de uma nova senha a partir de token válido |

### Área administrativa

| Rota                              | Finalidade                              | Perfis                         |
| --------------------------------- | --------------------------------------- | ------------------------------ |
| `/app`                            | Dashboard operacional                   | `OWNER`, `ADMIN`               |
| `/app/clientes`                   | Lista de clientes                       | `OWNER`, `ADMIN`               |
| `/app/clientes/novo`              | Cadastro de cliente                     | `OWNER`, `ADMIN`               |
| `/app/clientes/[customerId]`      | Detalhes do cliente, locais e histórico | `OWNER`, `ADMIN`               |
| `/app/equipamentos`               | Busca e lista de equipamentos           | `OWNER`, `ADMIN`               |
| `/app/equipamentos/novo`          | Cadastro de equipamento vinculado       | `OWNER`, `ADMIN`               |
| `/app/equipamentos/[equipmentId]` | Detalhes e histórico do equipamento     | `OWNER`, `ADMIN`               |
| `/app/equipe`                     | Gerenciamento básico de usuários        | `OWNER`, `ADMIN`               |
| `/app/agenda`                     | Agenda operacional                      | `OWNER`, `ADMIN`               |
| `/app/ordens`                     | Lista de ordens de serviço              | `OWNER`, `ADMIN`               |
| `/app/ordens/nova`                | Criação de ordem                        | `OWNER`, `ADMIN`               |
| `/app/ordens/[workOrderId]`       | Detalhes e histórico da ordem           | `OWNER`, `ADMIN`               |
| `/app/revisao`                    | Fila aguardando revisão ou correção     | `OWNER`, `ADMIN`               |
| `/app/revisao/[workOrderId]`      | Conferência da execução e evidências    | `OWNER`, `ADMIN`               |
| `/app/faturamento`                | Fila pronta para faturar                | `OWNER`, `ADMIN`               |
| `/app/configuracoes`              | Configurações básicas                   | `OWNER`, `ADMIN` conforme ação |

### Área do técnico

| Rota                                   | Finalidade                                                       | Perfil                 |
| -------------------------------------- | ---------------------------------------------------------------- | ---------------------- |
| `/field`                               | Resumo das ordens atribuídas                                     | `TECHNICIAN`           |
| `/field/ordens`                        | Lista das próprias ordens                                        | `TECHNICIAN`           |
| `/field/ordens/[workOrderId]`          | Detalhes do atendimento                                          | `TECHNICIAN` atribuído |
| `/field/ordens/[workOrderId]/executar` | Execução, checklist, evidências, adicionais e envio para revisão | `TECHNICIAN` atribuído |

Os nomes internos de pastas, componentes e tipos devem permanecer em inglês. Segmentos públicos da URL e conteúdo visível podem permanecer em português por serem parte da experiência do usuário brasileiro.

Não criar uma segunda aplicação para a experiência de campo. `/field` utiliza o mesmo Next.js, autenticação, design system e contratos da API, com layout e navegação próprios.

## Estrutura de diretórios sugerida

O scaffold atual mantém `app`, `components`, `config`, `lib` e `tests` na raiz
do repositório. A árvore abaixo descreve a direção de crescimento e não exige
uma migração mecânica para `src`.

```text
src/
├── app/
│   ├── (marketing)/
│   │   ├── page.tsx
│   │   ├── privacidade/
│   │   └── termos/
│   ├── (auth)/
│   │   ├── login/
│   │   ├── recuperar-senha/
│   │   └── redefinir-senha/
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   ├── clientes/
│   │   ├── equipamentos/
│   │   ├── equipe/
│   │   ├── agenda/
│   │   ├── ordens/
│   │   ├── revisao/
│   │   ├── faturamento/
│   │   └── configuracoes/
│   ├── field/
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   └── ordens/
│   ├── api/
│   │   └── leads/
│   ├── error.tsx
│   ├── global-error.tsx
│   ├── not-found.tsx
│   ├── layout.tsx
│   └── globals.css
├── components/
│   ├── ui/
│   ├── layout/
│   ├── feedback/
│   └── landing/
├── features/
│   ├── auth/
│   ├── customers/
│   ├── equipment/
│   ├── users/
│   ├── scheduling/
│   ├── work-orders/
│   ├── execution/
│   ├── review/
│   └── billing/
├── lib/
│   ├── api/
│   ├── auth/
│   ├── errors/
│   ├── formatting/
│   └── validation/
├── config/
├── hooks/
├── providers/
├── styles/
├── test/
└── types/
```

Esta é uma direção, não uma obrigação de criar pastas vazias. Uma pasta deve surgir quando houver código real que justifique sua existência.

### Responsabilidade das camadas

- `app`: composição de rotas, layouts, metadata e boundaries do Next.js.
- `components/ui`: componentes visuais genéricos e sem regra de domínio.
- `components/layout`: navegação, cabeçalho, sidebar e shells.
- `components/feedback`: estados vazios, erros, loading e confirmações reutilizáveis.
- `components/landing`: componentes exclusivos da área pública.
- `features`: componentes, schemas, hooks e transformações específicos do domínio.
- `lib/api`: clientes HTTP, tratamento de respostas e contratos de infraestrutura.
- `lib/auth`: leitura de sessão e helpers de proteção de rota.
- `lib/formatting`: formatação de moeda, datas, documentos e telefone.
- `config`: ambiente, navegação, metadata e constantes globais.
- `providers`: providers client-side estritamente necessários.

Evitar pastas genéricas como `utils` ou `helpers` que se transformem em depósitos sem responsabilidade clara.

## Convenções de código

- Código, arquivos, componentes, funções, variáveis, tipos e enums em inglês.
- Conteúdo exibido ao usuário em português do Brasil.
- Componentes React em `PascalCase`.
- Funções, hooks e variáveis em `camelCase`.
- Hooks iniciados por `use`.
- Constantes realmente globais em `UPPER_SNAKE_CASE`.
- Rotas e nomes de arquivos conforme as convenções do App Router.
- Preferir named exports, exceto onde o Next.js exige default export.
- Não utilizar `any`; preferir `unknown` com narrowing seguro.
- Não usar type assertion para esconder incompatibilidades sem justificativa.
- Não duplicar enums e contratos manualmente em várias features.
- Funções devem receber somente as dependências necessárias.
- Componentes de página devem orquestrar; regras complexas devem ficar em módulos de domínio ou na API.
- Comentários devem explicar decisões e restrições, não repetir o código.

## Server Components e Client Components

Server Components são o padrão.

Utilizar Server Components para:

- Layouts e composição estática.
- Metadata.
- Conteúdo público sem interação.
- Carregamento inicial de dados quando compatível com autenticação e cache.
- Componentes que apenas recebem e renderizam dados.

Adicionar `'use client'` somente quando o componente precisar de:

- Estado ou efeito do React.
- Event handlers.
- APIs do navegador.
- React Hook Form.
- TanStack Query no cliente.
- Componentes interativos incompatíveis com Server Components.

Manter o boundary client-side o mais baixo possível. Não transformar layouts ou páginas inteiras em Client Components apenas porque um botão ou modal precisa de interação.

## Consumo da API

Todas as operações de negócio devem utilizar a `ciclera-api`. O frontend não acessa o banco diretamente.

Centralizar a comunicação HTTP em `lib/api`. A fundação atual contém apenas
configuração da URL base, tipos de erro e parsing seguro; chamadas de negócio
serão adicionadas no checkpoint de cada fluxo.

```text
lib/api/
├── config.ts
├── errors.ts
├── response.ts
└── types.ts
```

Responsabilidades atuais:

- `config.ts`: URL pública versionada da API e composição segura de caminhos.
- `response.ts`: parsing de JSON e validação explícita da resposta.
- `errors.ts`: normalização dos erros da API.
- `types.ts`: tipos de infraestrutura, sem duplicar todo o domínio.

Regras:

- Não chamar `fetch` diretamente em dezenas de componentes.
- Não concatenar query strings manualmente quando houver filtros complexos.
- Tratar respostas não `2xx` antes de interpretar sucesso.
- Definir timeout e cancelamento quando aplicável.
- Propagar ou exibir um request ID quando fornecido pela API.
- Não esconder erros do servidor como arrays vazios.
- Não fazer retry automático de mutations críticas.
- Não utilizar optimistic update para aprovação, faturamento ou transições críticas sem estratégia explícita de rollback.
- Invalidar somente as queries afetadas após mutations.
- Não buscar todos os registros para filtrar ou paginar no navegador.

### Tipos e contratos

- Os contratos HTTP devem acompanhar a especificação OpenAPI da API.
- Se houver geração automática de client ou tipos, o artefato gerado não deve ser editado manualmente.
- Tipos de formulário não precisam ser idênticos aos DTOs de resposta.
- Dados externos devem ser validados ou tratados como não confiáveis nas fronteiras apropriadas.
- Datas chegam como strings serializadas e devem ser convertidas ou formatadas conscientemente.
- Valores monetários trafegam como inteiros na menor unidade monetária ou no contrato definido pela API; nunca assumir `float`.

## Estratégia de estado

Utilizar a ferramenta mais simples para cada categoria:

| Estado                                         | Estratégia                                                |
| ---------------------------------------------- | --------------------------------------------------------- |
| Dados remotos e cache interativo               | TanStack Query                                            |
| Filtros, paginação e ordenação compartilháveis | URL search params                                         |
| Formulários                                    | React Hook Form + Zod                                     |
| Estado visual local                            | `useState` ou `useReducer`                                |
| Sessão autenticada                             | Fonte definida pela autenticação e API                    |
| Preferências persistidas simples               | Cookie ou storage apenas quando não sensível e necessário |

Não introduzir Redux, Zustand ou Context global para dados que pertencem à URL, a uma query remota ou a um formulário.

## Autenticação e sessão

A autenticação deve seguir o contrato da `ciclera-api`.

O CP-10 centraliza chamadas browser em `lib/api/client.ts` e chamadas de Server
Components em `lib/api/server.ts`. O cliente browser usa a URL pública da API,
`credentials: include`, respostas sem cache e uma única tentativa de refresh
após `401`; uma falha de refresh encerra o fluxo sem loop. O cliente server-side
encaminha somente os cookies de autenticação conhecidos e nunca os expõe ao
JavaScript do navegador.

As rotas `/login`, `/recuperar-senha` e `/redefinir-senha` consomem os contratos
reais da API. O token de redefinição é lido exclusivamente do fragmento
`#token=`, mantido apenas em memória durante o formulário e removido da barra de
endereço após a leitura. Nenhum access token ou refresh token é persistido pela
web. Retornos após login aceitam somente caminhos internos compatíveis com o
perfil autenticado.

Regras obrigatórias:

- Não armazenar access token ou refresh token em `localStorage` ou `sessionStorage`.
- Preferir sessão baseada em cookies `HttpOnly` e `Secure` em produção.
- Requests autenticados devem enviar credenciais conforme o contrato da API.
- Server Components devem encaminhar a sessão de forma segura quando consumirem a API.
- O logout deve invalidar a sessão no servidor e limpar o estado local relacionado.
- Falhas de renovação devem encerrar a sessão de modo previsível.
- Redirecionamentos não devem expor tokens na URL.
- Parâmetros de retorno após login devem aceitar somente destinos internos seguros.
- Mensagens de login não devem revelar desnecessariamente se um e-mail existe.

O `middleware` do Next.js pode melhorar a navegação e impedir acesso visual a áreas inadequadas, mas não substitui a autorização da API.

### Direcionamento por perfil

- `OWNER` e `ADMIN` entram em `/app`.
- `TECHNICIAN` entra em `/field`.
- Uma resposta `401` deve levar à reautenticação.
- Uma resposta `403` deve mostrar acesso negado, sem simular que o recurso não existe quando isso prejudicar a compreensão.
- Menus e ações devem refletir o perfil, mas a API continua validando cada operação.

Os layouts protegidos carregam a conta por `/auth/me`, exibem estados explícitos
de sessão em carregamento, expirada ou indisponível e separam o shell de
escritório (`/app`) do shell mobile de campo (`/field`). A API permanece como
autoridade de acesso; a proteção visual apenas evita navegação inadequada.

### Gestão de equipe

`/app/equipe` consome a paginação real de `/users`, mantém busca e filtros na URL
e cobre loading, vazio, erro e sucesso. Criação, edição, ativação e desativação
seguem a política da API: `OWNER` gerencia todos os perfis; `ADMIN` visualiza a
equipe, mas recebe ações apenas sobre `TECHNICIAN`. A senha inicial existe somente
no formulário e na requisição de criação, sem Web Storage ou logs, e deve ser
compartilhada por canal seguro. Conflitos de e-mail e proteção do último `OWNER`
são apresentados com mensagens específicas.

## Multi-tenancy no frontend

O frontend deve tratar a organização autenticada como contexto fornecido pela sessão, não como um filtro arbitrário escolhido pelo cliente.

- Não enviar `organizationId` editável em formulários comuns.
- Não confiar em `organizationId` vindo de search params ou local storage.
- Não construir URLs que permitam alternar organização sem uma funcionalidade oficial e validada.
- Limpar caches e estado sensível no logout.
- Se futuramente existir troca de organização, invalidar integralmente os dados da organização anterior.
- Nunca misturar dados demonstrativos da landing page com cache da área autenticada.
- Tratar `404` e `403` retornados pela API sem revelar dados de outra organização.

O isolamento real é responsabilidade da API, mas a arquitetura do frontend não deve criar caminhos que facilitem vazamentos ou confusão de contexto.

## Perfis e navegação

### `OWNER`

- Acessa todas as páginas administrativas.
- Gerencia dados da organização e usuários.
- Executa ações operacionais críticas.

### `ADMIN`

- Gerencia clientes, equipamentos, equipe operacional, agenda e ordens.
- Revisa execuções.
- Libera e marca ordens como faturadas.
- Configurações sensíveis podem permanecer exclusivas do `OWNER`.

### `TECHNICIAN`

- Utiliza o layout `/field`.
- Acessa somente as ordens permitidas pela API.
- Executa atendimento e corrige pendências.
- Não acessa dashboard financeiro, gerenciamento de equipe ou revisão administrativa.

Itens de menu devem ser definidos em configuração tipada e filtrados por perfil. Não duplicar listas de navegação em componentes desktop e mobile.

## Status da ordem na interface

Manter uma única configuração tipada para label, descrição curta e apresentação visual dos estados:

| Status interno       | Label em pt-BR      |
| -------------------- | ------------------- |
| `DRAFT`              | Rascunho            |
| `SCHEDULED`          | Agendada            |
| `IN_PROGRESS`        | Em execução         |
| `AWAITING_REVIEW`    | Aguardando revisão  |
| `PENDING_CORRECTION` | Com pendência       |
| `READY_TO_BILL`      | Pronta para faturar |
| `BILLED`             | Faturada            |
| `CANCELED`           | Cancelada           |

Regras:

- Nunca comparar status por label traduzida.
- Não comunicar status apenas por cor.
- Exibir texto e, quando útil, ícone coerente.
- A API informa quais ações são válidas ou valida cada tentativa.
- Não permitir alteração genérica por `select` quando o domínio exige uma ação específica.
- Usar ações explícitas como “Iniciar atendimento”, “Enviar para revisão”, “Solicitar correção”, “Aprovar e liberar” e “Marcar como faturada”.

## Formulários

Utilizar React Hook Form e Zod nos formulários interativos.

Padrão mínimo:

- Schema próximo à feature responsável.
- Labels reais e associados aos inputs.
- Mensagens de erro em português e vinculadas ao campo.
- Validação no cliente para experiência; validação da API como fonte de verdade.
- Erros da API mapeados para campo quando possível.
- Erro geral preservado quando não pertence a um campo específico.
- Botão desabilitado durante submissão para impedir duplicidade.
- Feedback visível de sucesso ou falha.
- Preservação do conteúdo quando a submissão falhar.
- Confirmação antes de descartar alterações relevantes.
- Máscaras não devem modificar incorretamente o valor enviado.

Não criar um gerador universal de formulários no MVP. Reutilizar campos e layouts sem esconder as particularidades de cada domínio.

## Listagens, filtros e paginação

Listas que podem crescer devem utilizar paginação da API.

- Estado de filtros representado em search params quando fizer sentido compartilhar ou retornar à URL.
- Debounce em buscas textuais.
- Cancelamento de requests obsoletos.
- Ordenação executada no servidor.
- Filtros aplicados no servidor.
- Paginação com limites definidos pela API.
- Estado vazio diferente de estado sem resultados para os filtros atuais.
- Tabelas administrativas devem adaptar-se para cards ou visualização compacta em telas pequenas.
- Ações por linha devem ser acessíveis por teclado.
- Não carregar todos os registros para executar busca local.

## Upload de evidências

Fotos e assinaturas são dados privados da organização.

Fluxo preferencial quando suportado pela API:

1. Solicitar autorização de upload para a ordem correta.
2. Enviar o arquivo ao object storage usando a URL temporária recebida.
3. Confirmar o upload na API.
4. Atualizar a lista de evidências somente após confirmação.

Regras da interface:

- Validar tamanho e tipos permitidos antes do envio, repetindo a validação na API.
- Mostrar progresso quando tecnicamente disponível.
- Permitir retry explícito após falha.
- Não transformar fotos grandes em base64 para enviá-las dentro de JSON.
- Não guardar evidências sensíveis em storage persistente do navegador.
- Revogar previews locais com `URL.revokeObjectURL` quando não forem mais usados.
- Comprimir imagens apenas se houver uma política clara que preserve legibilidade das evidências.
- Não exibir uma evidência privada sem URL autorizada e temporária.
- Informar claramente quando um arquivo ainda não foi confirmado.

## Landing page

A landing page tem como objetivo explicar o problema, demonstrar a proposta e captar empresas qualificadas para o piloto.

Mensagem central:

> **Nenhum serviço executado deve ficar sem faturar.**

CTA principal:

> **Quero participar do piloto**

Ela deve conter, de forma equilibrada:

- Hero com proposta clara.
- Problemas que fazem receita se perder.
- Fluxo do chamado ao faturamento.
- Demonstração visual do produto.
- Funcionalidades planejadas para o MVP.
- Experiência do escritório e do técnico pelo navegador.
- Segmentos e critérios de qualificação.
- Benefícios sem números inventados.
- Programa piloto.
- Formulário de captação.
- FAQ.
- Contato e páginas jurídicas.

Regras:

- Dados de mockup devem ser identificados como demonstração.
- Não apresentar clientes, depoimentos ou resultados inexistentes.
- Não prometer aplicativo, offline, emissão fiscal, IA ou integrações.
- Não exibir botão de login antes de existir uma área autenticada utilizável, salvo decisão explícita.
- O formulário deve possuir honeypot e proteção server-side contra abuso.
- A URL do webhook nunca pode chegar ao client bundle.
- CTA de WhatsApp deve ser omitido quando o número não estiver configurado.

## Design system e identidade visual

### Cores

| Token        | Valor     | Uso principal                                 |
| ------------ | --------- | --------------------------------------------- |
| Deep Petrol  | `#092E2E` | Marca, textos fortes e superfícies escuras    |
| Ciclera Teal | `#087F6B` | Ações primárias e identidade                  |
| Active Green | `#15B88A` | Estados ativos e feedback positivo controlado |
| Cycle Lime   | `#C8F169` | Acentos pequenos e valores importantes        |
| Soft White   | `#F6F9F7` | Background geral                              |
| Surface      | `#FFFFFF` | Cards, modais e painéis                       |
| Graphite     | `#182321` | Texto principal                               |
| Slate        | `#64716D` | Texto secundário                              |
| Mist         | `#DDE7E3` | Bordas e divisores                            |

Cores semânticas devem possuir tokens próprios para sucesso, aviso, erro e informação. Não usar o nome de uma cor diretamente como significado de negócio.

O lime deve ocupar uma pequena parcela da interface. Não utilizá-lo como fundo dominante ou texto longo.

### Tipografia

- Sora para marca e headings.
- Inter para interface, textos, tabelas e formulários.
- Fontes carregadas com `next/font`.
- Pesos limitados ao que realmente for utilizado.

### Componentes fundamentais

Construir ou adotar primitives acessíveis para:

- Button.
- Input, Textarea, Select e Checkbox.
- FormField e FieldError.
- Badge de status.
- Card.
- Table e paginação.
- Dialog e confirmação.
- Drawer ou Sheet para mobile.
- Dropdown Menu.
- Tabs.
- Toast ou feedback equivalente.
- Skeleton.
- Empty State.
- Alert.
- Breadcrumb.

Na fundação atual estão disponíveis `Button`, `Input`, `Textarea`, `Label`,
`Alert`, `Badge`, `Card`, `Skeleton` e `EmptyState`. Os demais componentes
serão criados somente quando um fluxo real justificar sua existência.

Componentes de `components/ui` não devem conhecer conceitos como `WorkOrder`, `Customer` ou `Billing`.

### Direção visual

- Moderna, confiável, operacional e B2B.
- Hierarquia clara, bom espaçamento e poucas distrações.
- Bordas finas e sombras discretas.
- Radius consistente, preferencialmente entre 12px e 18px em superfícies maiores.
- Animações breves e funcionais.
- Sem glassmorphism, 3D, neon excessivo ou dashboards decorativos.
- Sem aparência de aplicativo genérico criado a partir de um único template.

## Responsividade

Validar pelo menos as seguintes larguras:

- 360px.
- 390px.
- 768px.
- 1024px.
- 1280px.
- 1440px.

Requisitos:

- Nenhum overflow horizontal acidental.
- Áreas de toque apropriadas.
- Formulários em uma coluna no mobile quando necessário.
- Navegação administrativa adaptada para telas pequenas.
- `/field` priorizando uso com uma mão e ações principais facilmente alcançáveis.
- Tabelas convertidas em apresentação adequada quando não couberem.
- Modais críticos utilizáveis sem esconder ações abaixo da viewport.
- Upload, câmera do navegador e assinatura testados em dispositivos reais quando disponíveis.

Mobile-first é especialmente importante na área `/field`; isso não transforma o produto em aplicativo nativo.

## Acessibilidade

Requisitos mínimos:

- HTML semântico.
- Skip link para o conteúdo principal.
- Navegação por teclado.
- Focus state visível.
- Contraste WCAG AA.
- Labels associados aos campos.
- Erros identificados e associados aos inputs.
- Botões somente com ícone contendo nome acessível.
- Dialogs com foco controlado corretamente.
- Accordions e menus com atributos ARIA adequados.
- Status representados por texto, não somente cor.
- Respeito a `prefers-reduced-motion`.
- Atualizações assíncronas importantes anunciadas quando necessário.
- Headings em hierarquia lógica.

Acessibilidade deve fazer parte do componente desde o início, não ser adicionada apenas ao final.

## Performance

- Utilizar `next/image` para imagens adequadas ao componente.
- Definir dimensões de mídia para evitar layout shift.
- Evitar bibliotecas pesadas na landing page e no bundle inicial.
- Importar ícones individualmente.
- Manter Client Components pequenos.
- Carregar funcionalidades abaixo da dobra ou pesadas sob demanda quando houver ganho real.
- Não fazer polling agressivo.
- Evitar waterfalls de requests previsíveis.
- Paginar listas grandes.
- Não enviar dados operacionais desnecessários ao navegador.
- Verificar Core Web Vitals nas páginas públicas.
- Evitar animações contínuas ou que bloqueiem a thread principal.

Performance da área de campo é requisito de produto, pois pode ser utilizada em aparelhos modestos e redes móveis instáveis, mesmo sem suporte offline.

## SEO e metadata

SEO aplica-se principalmente às páginas públicas.

- Metadata por rota pública.
- Title e description coerentes.
- Canonical configurada a partir de `NEXT_PUBLIC_APP_URL`.
- Open Graph com `locale: pt_BR`.
- Favicon baseado na marca.
- `robots.txt`.
- `sitemap.xml`.
- JSON-LD sem avaliações, preços ou informações falsas.
- Páginas autenticadas com indexação bloqueada.
- URLs privadas nunca devem aparecer no sitemap.

Metadata principal sugerida:

```text
Title: Ciclera | Gestão de serviços externos do chamado ao caixa
Description: Organize ordens de serviço, execução em campo, evidências, revisão e serviços prontos para faturar em uma plataforma web.
```

## Tratamento de erros

- Utilizar `error.tsx`, `global-error.tsx` e `not-found.tsx` quando aplicável.
- Distinguir erro de validação, autenticação, autorização, conflito, indisponibilidade e falha inesperada.
- Não mostrar stack trace, payload interno ou mensagem técnica bruta ao usuário.
- Preservar um identificador de erro ou request ID para suporte quando fornecido.
- Oferecer retry somente quando a operação puder ser repetida com segurança.
- Não redirecionar silenciosamente todo erro para login.
- Não tratar `403` como sessão expirada.
- Falhas de mutations devem preservar o contexto necessário para tentar novamente.

## Datas, moeda e localização

- Interface e mensagens em `pt-BR`.
- Valores apresentados em BRL no MVP.
- Utilizar `Intl.NumberFormat` para moeda.
- Utilizar uma estratégia única para formatação de datas.
- Datas absolutas devem considerar o timezone configurado para a organização.
- Evitar parsing implícito de datas sem timezone.
- O frontend não deve recalcular valores oficiais usando ponto flutuante.
- Inputs monetários podem trabalhar com apresentação formatada, mas devem converter para o contrato inteiro definido pela API.

## Testes

### Testes unitários e de componentes

Priorizar:

- Schemas e transformações de formulário.
- Mapeamento de erros da API.
- Configuração de status e permissões visuais.
- Formatação de moeda e datas.
- Componentes com comportamento crítico.
- Estados de loading, vazio, erro e sucesso.

Evitar testes que apenas confirmem implementação interna ou snapshots extensos sem valor.

### Testes end-to-end

Fluxos mínimos:

1. Login e redirecionamento conforme o perfil.
2. Bloqueio de rota administrativa para técnico.
3. Cadastro de cliente, local e equipamento.
4. Criação e atribuição de ordem.
5. Início e conclusão de execução pelo técnico.
6. Upload de evidência.
7. Solicitação e correção de pendência.
8. Aprovação e entrada na fila pronta para faturar.
9. Marcação como faturada.
10. Logout e limpeza de sessão.

Testar desktop e pelo menos um viewport mobile para o fluxo do técnico.

### Estratégia de dados de teste

- Utilizar dados determinísticos.
- Nunca depender de dados reais de produção.
- Isolar organizações nos cenários de teste.
- Não tornar os testes dependentes da ordem de execução.
- Centralizar factories e fixtures sem criar uma abstração genérica excessiva.

## Segurança no frontend

- Não armazenar tokens em Web Storage.
- Não inserir HTML não confiável com `dangerouslySetInnerHTML`.
- Não confiar em autorização visual.
- Não registrar payloads sensíveis no console.
- Não expor secrets em variáveis públicas.
- Validar URLs de redirecionamento.
- Evitar colocar dados pessoais ou tokens em query strings.
- Considerar proteção CSRF quando a autenticação utilizar cookies.
- Renderizar conteúdo fornecido pelo usuário como texto por padrão.
- Restringir previews e downloads de evidências ao contrato autorizado da API.
- Não usar service worker ou cache persistente para dados operacionais no MVP.

## Observabilidade

Quando o ambiente de produção estiver definido:

- Capturar erros inesperados de rendering e interação.
- Associar erros a release e ambiente.
- Preservar request ID recebido da API.
- Evitar enviar dados pessoais, tokens ou evidências para ferramentas de monitoramento.
- Monitorar Web Vitals das páginas públicas.
- Registrar falhas de submissão do formulário de piloto sem registrar seu conteúdo sensível completo.

A escolha do provedor deve ser documentada após decisão real; não acoplar o código preventivamente.

### Vercel Analytics

O Vercel Analytics é habilitado automaticamente apenas nos deployments da Vercel, quando a variável de sistema `VERCEL` possui o valor `1`. Ele permanece desabilitado nas execuções locais com `npm run dev` e `npm start`.

`VERCEL` é fornecida pela própria plataforma e não deve ser adicionada ao `.env.local`.

## Padrão de implementação por feature

Cada feature deve entregar um fluxo vertical e verificável:

1. Definir contratos e estados necessários.
2. Implementar o acesso tipado à API.
3. Implementar listagem ou visualização principal.
4. Implementar formulário ou ação.
5. Tratar loading, vazio, erro e sucesso.
6. Aplicar regras visuais de permissão.
7. Validar responsividade e acessibilidade.
8. Adicionar testes proporcionais ao risco.
9. Executar lint, typecheck, testes e build.

Não criar todas as páginas com dados mockados antes de conectar os fluxos essenciais à API. Mockups pertencem à landing page ou a ambientes de demonstração explicitamente identificados.

## Ordem recomendada de implementação

1. Configuração base, tokens visuais, fontes, providers e tratamento de erros.
2. Cliente HTTP, autenticação e sessão.
3. Layouts de `/app` e `/field` com navegação por perfil.
4. Clientes, locais e equipamentos.
5. Equipe e atribuição de técnicos.
6. Lista, detalhes e criação de ordens.
7. Agenda simples.
8. Fluxo de execução em `/field`.
9. Upload e visualização de evidências.
10. Revisão e correção.
11. Fila pronta para faturar.
12. Dashboard operacional.
13. Landing page e captação do piloto, se ainda não estiverem concluídas.
14. Testes end-to-end, performance, acessibilidade e hardening.

## Definition of Done de uma página

Uma página não está concluída apenas porque renderiza o cenário de sucesso. Ela deve:

- Consumir o contrato real ou claramente acordado da API.
- Respeitar o perfil autorizado.
- Tratar loading inicial e revalidação.
- Tratar ausência de dados.
- Tratar erro de API.
- Tratar sessão expirada.
- Funcionar nos viewports previstos.
- Ser utilizável por teclado quando aplicável.
- Apresentar labels, foco e contraste adequados.
- Evitar dados fictícios em produção.
- Possuir testes proporcionais ao risco.
- Passar por lint, typecheck e build.

## Definition of Done do frontend MVP

O `ciclera-web` está pronto para piloto quando:

- Landing page e captação funcionam sem sucesso falso.
- Login, recuperação e logout funcionam de forma segura.
- Perfis são direcionados à experiência correta.
- `OWNER` e `ADMIN` concluem o fluxo administrativo principal.
- `TECHNICIAN` conclui uma ordem em um navegador mobile.
- Evidências podem ser enviadas, visualizadas e corrigidas.
- Revisão permite aprovar ou registrar pendência.
- Ordens aprovadas chegam à fila pronta para faturar.
- Ordens podem ser marcadas como faturadas.
- Dashboard utiliza dados reais da organização autenticada.
- Todas as páginas críticas tratam loading, vazio, erro e sucesso.
- Não há acesso visual indevido após logout ou troca de sessão.
- Fluxos críticos passam em testes end-to-end.
- A aplicação passa em lint, typecheck, testes e build.
- Não há overflow horizontal nos viewports definidos.
- Páginas públicas possuem metadata adequada.
- Nenhuma tela promete app nativo, offline, emissão fiscal ou funcionalidade fora do MVP.

## Checklist antes de pull request

```bash
npm run lint
npm run typecheck
npm test
npm run build
```

Confirmar também:

- Não foram incluídas credenciais ou dados pessoais.
- `.env.example` foi atualizado quando necessário.
- O contrato da API continua compatível.
- A mudança funciona em desktop e mobile quando aplicável.
- Estados de erro e vazio foram verificados.
- Documentação relevante foi atualizada.

## Instruções para assistentes de IA

Ao trabalhar neste projeto:

1. Leia primeiro o README raiz e depois este arquivo.
2. Inspecione `package.json`, lockfile, configuração e estrutura existente antes de propor mudanças.
3. Utilize as versões e convenções já presentes no repositório.
4. Não recrie a aplicação ou substitua sua arquitetura sem solicitação explícita.
5. Não adicione dependências sem necessidade concreta.
6. Não crie pastas vazias apenas para reproduzir a estrutura sugerida.
7. Mantenha Server Components como padrão e reduza o escopo de `'use client'`.
8. Não mova regras críticas de autorização ou negócio para o frontend.
9. Não armazene tokens em `localStorage` ou `sessionStorage`.
10. Não utilize mocks em produção para esconder endpoints ausentes.
11. Não implemente funcionalidades fora do escopo do MVP.
12. Mantenha a área do técnico dentro do mesmo projeto, em `/field`.
13. Preserve textos visíveis em português e identificadores de código em inglês.
14. Reutilize o design system antes de criar variações locais.
15. Adicione estados de loading, vazio, erro e sucesso desde a primeira implementação.
16. Valide cada fluxo com a API real ou com contrato explicitamente definido.
17. Adicione testes para comportamento, permissões e regressões afetadas.
18. Execute lint, typecheck, testes e build antes de concluir.
19. Informe arquivos alterados, decisões, comandos executados e pendências reais.
20. Se uma decisão conflitar com o README raiz, pare e sinalize o conflito em vez de alterar o comportamento silenciosamente.

## Documentação relacionada

- [README raiz](../README.md): produto, escopo, regras globais e Definition of Done do MVP.
- [README da API](../ciclera-api/README.md): autenticação, contratos, banco, domínio e segurança server-side.
- OpenAPI/Swagger da API: referência dos endpoints implementados.
- `.env.example`: variáveis necessárias para execução.

Quando um link apontar para um documento ainda não criado, mantê-lo como referência da estrutura planejada e criá-lo na etapa correspondente.

---

**Ciclera Web — uma experiência simples para quem executa e completa para quem administra.**
