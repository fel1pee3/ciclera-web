import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function FieldHomePage() {
  return (
    <section>
      <p className="eyebrow">Área de campo</p>
      <h1 className="mt-3 font-heading text-2xl font-bold tracking-tight">
        Seus atendimentos
      </h1>
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Ambiente protegido</CardTitle>
        </CardHeader>
        <CardContent className="text-sm leading-relaxed text-muted-foreground">
          A lista operacional será disponibilizada em checkpoint próprio. Esta
          tela não exibe ordens fictícias.
        </CardContent>
      </Card>
    </section>
  )
}
