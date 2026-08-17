import Link from 'next/link'
export const metadata = { title: 'Termos de Uso | Ciclera' }
export default function Page() {
  return (
    <main className="min-h-screen bg-background py-16">
      <article className="container-page max-w-3xl">
        <Link href="/" className="text-sm font-semibold text-primary">
          ← Voltar para a Ciclera
        </Link>
        <h1 className="mt-10 font-heading text-4xl font-bold">Termos de Uso</h1>
        <p className="mt-4 text-muted-foreground">
          Última atualização: 17 de agosto de 2026.
        </p>
        <div className="legal-copy">
          <h2>Sobre este site</h2>
          <p>
            Este site apresenta a Ciclera, permite criar uma organização e
            acessar a plataforma, além de oferecer um canal de contato com a
            equipe.
          </p>
          <h2>Conta e organização</h2>
          <p>
            Ao criar uma conta, você declara que possui autorização para
            representar a organização informada e se torna seu primeiro
            proprietário na plataforma.
          </p>
          <h2>Conteúdo demonstrativo</h2>
          <p>
            Valores, ordens de serviço, clientes e telas apresentados nas
            demonstrações são fictícios e não representam resultados comerciais
            comprovados.
          </p>
          <h2>Uso adequado</h2>
          <p>
            Você concorda em fornecer informações verdadeiras e em não utilizar
            formulários ou recursos do site para atividades ilícitas,
            automatizadas ou abusivas.
          </p>
          <h2>Alterações</h2>
          <p>
            Estes termos podem ser atualizados conforme o produto evoluir. A
            versão vigente estará sempre disponível nesta página.
          </p>
        </div>
      </article>
    </main>
  )
}
