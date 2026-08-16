import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function AppHomePage() {
  return (
    <section className="max-w-3xl">
      <p className="eyebrow">Área de escritório</p>
      <h1 className="mt-3 font-heading text-3xl font-bold tracking-tight">
        Bem-vindo à Ciclera
      </h1>
      <p className="mt-3 text-muted-foreground">
        A navegação segura da sua organização está pronta. Os módulos
        operacionais serão adicionados nos próximos checkpoints.
      </p>
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Ambiente protegido</CardTitle>
        </CardHeader>
        <CardContent className="text-sm leading-relaxed text-muted-foreground">
          Esta área é exclusiva para proprietários e administradores. Nenhum
          indicador fictício é exibido enquanto os dados de negócio ainda não
          existem.
        </CardContent>
      </Card>
    </section>
  )
}
