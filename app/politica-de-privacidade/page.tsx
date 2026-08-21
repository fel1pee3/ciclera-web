import Link from 'next/link'
export const metadata = { title: 'Política de Privacidade | Ciclera' }
export default function Page() {
  return (
    <main className="min-h-screen bg-background py-16">
      <article className="container-page max-w-3xl">
        <Link href="/" className="text-sm font-semibold text-primary">
          ← Voltar para a Ciclera
        </Link>
        <h1 className="mt-10 font-heading text-4xl font-bold">
          Política de Privacidade
        </h1>
        <p className="mt-4 text-muted-foreground">
          Última atualização: 17 de agosto de 2026.
        </p>
        <div className="legal-copy">
          <h2>Dados coletados</h2>
          <p>
            Ao criar uma conta e utilizar a plataforma, podemos coletar nome,
            organização, função, e-mail e informações operacionais fornecidas
            voluntariamente.
          </p>
          <h2>Finalidade</h2>
          <p>
            Usamos esses dados para provisionar e proteger a conta, operar a
            plataforma, prestar suporte e manter a segurança da Ciclera.
          </p>
          <h2>Compartilhamento e segurança</h2>
          <p>
            Não comercializamos dados pessoais. Informações podem ser
            processadas por fornecedores essenciais à operação, sob medidas
            razoáveis de segurança e confidencialidade.
          </p>
          <h2>Seus direitos</h2>
          <p>
            Você pode solicitar acesso, correção ou exclusão dos seus dados pelo
            e-mail de contato indicado no site.
          </p>
        </div>
      </article>
    </main>
  )
}
