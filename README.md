# Ciclera

Landing page da Ciclera, construída com Next.js, TypeScript e Tailwind CSS.

## Configuração

Copie as variáveis de `.env.example` para o ambiente do projeto. `LEAD_WEBHOOK_URL` é obrigatória para receber leads e deve apontar para um endpoint que aceite JSON via POST. As variáveis públicas de WhatsApp, e-mail e URL canônica são opcionais.

## Desenvolvimento

Use `pnpm dev` para desenvolvimento, `pnpm lint` para lint e `pnpm build` para validar a versão de produção.

## Formulário

O formulário é validado no cliente e no servidor com Zod. O endpoint inclui honeypot e limite básico em memória; em produção com múltiplas instâncias, substitua a abstração de rate limit por um serviço distribuído.
