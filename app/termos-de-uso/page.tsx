import type { Metadata } from 'next'
import Link from 'next/link'
import { BadgeCheck, Building2, CreditCard, Users } from 'lucide-react'

import { publicEnvironment } from '@/config/public-env'

export const metadata: Metadata = {
  title: 'Termos de Uso',
  description:
    'Conheça as regras para cadastro, contratação e uso seguro da plataforma Ciclera.',
  alternates: { canonical: '/termos-de-uso' },
}

const navigation = [
  ['1. Aceitação e finalidade', 'aceitacao'],
  ['2. Cadastro, contas e perfis', 'contas'],
  ['3. Uso permitido', 'uso'],
  ['4. Dados e evidências', 'dados'],
  ['5. Planos e cobrança', 'planos'],
  ['6. Atraso e cancelamento', 'cancelamento'],
  ['7. Disponibilidade e suporte', 'disponibilidade'],
  ['8. Propriedade intelectual', 'propriedade'],
  ['9. Responsabilidades', 'responsabilidades'],
  ['10. Disposições gerais', 'disposicoes'],
] as const

export default function Page() {
  const email = publicEnvironment.NEXT_PUBLIC_CONTACT_EMAIL

  return (
    <main className="min-h-screen bg-background py-10 sm:py-16">
      <article className="container-page max-w-5xl">
        <Link
          href="/"
          className="inline-flex min-h-11 items-center text-sm font-semibold text-primary hover:underline"
        >
          ← Voltar para a Ciclera
        </Link>

        <header className="mt-6 overflow-hidden rounded-3xl bg-institutional px-6 py-8 text-primary-foreground sm:px-10 sm:py-12">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-accent">
            Regras claras para uma operação segura
          </p>
          <h1 className="mt-4 max-w-3xl text-balance font-heading text-4xl font-bold sm:text-5xl">
            Termos de Uso
          </h1>
          <p className="mt-5 max-w-3xl text-pretty leading-relaxed text-primary-foreground/75">
            Estes termos regulam o cadastro, a contratação e o uso da Ciclera,
            plataforma empresarial para gestão de equipes externas e ordens de
            serviço. Leia o documento antes de criar uma conta ou utilizar o
            produto.
          </p>
          <p className="mt-6 text-sm text-primary-foreground/65">
            Versão 2.0 · Última atualização: 23 de agosto de 2026.
          </p>
        </header>

        <section
          aria-label="Resumo dos termos"
          className="mt-6 grid gap-4 sm:grid-cols-3"
        >
          {[
            [
              Building2,
              'Uso empresarial',
              'A Ciclera foi criada para organizações e suas equipes autorizadas.',
            ],
            [
              Users,
              'Contas individuais',
              'Cada pessoa deve utilizar sua própria credencial e o perfil adequado.',
            ],
            [
              CreditCard,
              'Assinatura mensal',
              'Não há período gratuito; o acesso operacional depende do pagamento.',
            ],
          ].map(([Icon, title, description]) => (
            <div
              key={title as string}
              className="rounded-2xl border border-border bg-card p-5"
            >
              <Icon className="size-5 text-primary" />
              <h2 className="mt-4 font-heading text-base font-semibold">
                {title as string}
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {description as string}
              </p>
            </div>
          ))}
        </section>

        <nav
          aria-label="Nestes termos"
          className="mt-8 rounded-2xl border border-border bg-card p-5 sm:p-6"
        >
          <p className="font-heading font-semibold">Nestes termos</p>
          <ol className="mt-4 grid gap-2 text-sm sm:grid-cols-2">
            {navigation.map(([label, id]) => (
              <li key={id}>
                <a
                  href={`#${id}`}
                  className="inline-flex min-h-9 items-center text-primary hover:underline"
                >
                  {label}
                </a>
              </li>
            ))}
          </ol>
        </nav>

        <div className="legal-copy">
          <section id="aceitacao" className="scroll-mt-24">
            <h2>1. Aceitação, elegibilidade e finalidade</h2>
            <p>
              Ao criar uma organização, aceitar estes termos ou utilizar a
              Ciclera, você declara que leu e concorda com este documento e com
              a nossa{' '}
              <Link href="/politica-de-privacidade">
                Política de Privacidade
              </Link>
              . Se estiver agindo em nome de uma empresa, declara possuir
              poderes para vinculá-la a estes termos.
            </p>
            <p>
              O serviço é destinado a pessoas maiores de 18 anos que atuem em
              contexto empresarial. A Ciclera organiza clientes, locais,
              equipamentos, equipes, agenda, execução em campo, evidências,
              revisão e acompanhamento do faturamento de ordens de serviço.
            </p>
            <p>
              A Ciclera não substitui sistemas contábeis, fiscais, bancários, de
              folha de pagamento, de segurança do trabalho ou de emissão de nota
              fiscal. Cabe à organização avaliar quais obrigações e ferramentas
              complementares são necessárias à sua atividade.
            </p>
          </section>

          <section id="contas" className="scroll-mt-24">
            <h2>2. Cadastro, contas e perfis de acesso</h2>
            <p>
              O cadastro público cria uma organização e seu primeiro usuário
              proprietário. As informações fornecidas devem ser verdadeiras,
              atuais e suficientes para identificar o responsável pela conta.
            </p>
            <p>A plataforma utiliza os seguintes perfis:</p>
            <ul>
              <li>
                <strong>Proprietário:</strong> responsável principal pela
                organização, assinatura e administração dos acessos.
              </li>
              <li>
                <strong>Administrador:</strong> auxilia na gestão operacional e
                da equipe dentro das permissões disponíveis.
              </li>
              <li>
                <strong>Técnico:</strong> acessa a área de campo e as ordens que
                lhe forem atribuídas.
              </li>
            </ul>
            <p>
              Cada conta é individual. É proibido compartilhar credenciais,
              utilizar a conta de outra pessoa ou tentar ampliar permissões sem
              autorização. O proprietário e os administradores devem atribuir o
              menor privilégio necessário, remover acessos que não sejam mais
              necessários e manter a equipe atualizada.
            </p>
            <p>
              O usuário é responsável por manter sua senha em sigilo e por
              comunicar imediatamente qualquer suspeita de comprometimento. A
              Ciclera poderá encerrar sessões, solicitar redefinição de senha ou
              restringir acessos para proteger a conta e a plataforma.
            </p>
          </section>

          <section id="uso" className="scroll-mt-24">
            <h2>3. Uso permitido e condutas proibidas</h2>
            <p>
              A plataforma deve ser usada somente para finalidades lícitas,
              relacionadas à operação da organização e de acordo com estes
              termos. Não é permitido:
            </p>
            <ul>
              <li>
                acessar dados de outra organização, contornar permissões ou
                testar vulnerabilidades sem autorização expressa;
              </li>
              <li>
                transmitir malware, automatizar acessos abusivos, prejudicar a
                disponibilidade ou exceder limites de forma deliberada;
              </li>
              <li>
                usar a Ciclera para fraude, violação de direitos, atividade
                ilegal ou armazenamento de conteúdo ilícito;
              </li>
              <li>
                fazer engenharia reversa, copiar, revender, sublicenciar ou
                explorar o serviço fora das permissões legais e contratuais;
              </li>
              <li>
                inserir dados pessoais, documentos ou imagens sem necessidade,
                autorização ou base legal adequada;
              </li>
              <li>fornecer informações falsas de cadastro ou pagamento.</li>
            </ul>
            <p>
              A Ciclera pode adotar medidas proporcionais para investigar abuso,
              preservar evidências, limitar requisições e suspender acessos que
              ofereçam risco à segurança, aos usuários ou a terceiros.
            </p>
          </section>

          <section id="dados" className="scroll-mt-24">
            <h2>4. Dados operacionais, fotos e históricos</h2>
            <p>
              A organização é responsável pela origem, exatidão, licitude e
              atualização dos dados inseridos por sua equipe, inclusive dados de
              clientes, contatos, endereços, equipamentos, ordens, observações e
              evidências fotográficas.
            </p>
            <p>
              Fotos devem ser pertinentes ao atendimento. Não devem expor
              pessoas, documentos, credenciais, áreas restritas ou informações
              confidenciais sem necessidade e autorização. A organização deve
              orientar seus técnicos e atender aos direitos dos titulares.
            </p>
            <p>
              Históricos, auditorias e snapshots podem ser preservados para
              garantir rastreabilidade e impedir alterações silenciosas. Por
              isso, arquivar ou desativar um cadastro não apaga automaticamente
              os registros de ordens já realizadas.
            </p>
            <p>
              A organização concede à Ciclera autorização limitada para
              hospedar, processar, reproduzir tecnicamente e transmitir esses
              dados apenas na medida necessária para prestar, proteger e manter
              o serviço.
            </p>
          </section>

          <section id="planos" className="scroll-mt-24">
            <h2>5. Planos, limites e cobrança</h2>
            <p>
              A Ciclera é oferecida por assinatura mensal e não possui período
              gratuito de teste. Os preços, recursos e limites vigentes são
              apresentados na página de assinatura antes da contratação. Cada
              plano pode estabelecer limites de usuários, clientes, ordens,
              evidências ou outros recursos.
            </p>
            <p>
              A cobrança é processada pelo Asaas. Conforme a opção disponível, o
              cartão pode gerar renovação recorrente; boleto e Pix podem exigir
              pagamento manual a cada período. O simples acesso ao checkout ou a
              geração de uma cobrança não confirma o pagamento. A ativação
              depende da confirmação enviada pelo provedor e processada pela
              Ciclera.
            </p>
            <p>
              Os valores são apresentados em reais e podem ser acrescidos de
              tributos quando exigido. A organização é responsável por manter os
              dados de cobrança atualizados e verificar o vencimento e a
              situação dos pagamentos.
            </p>
            <p>
              Mudanças de plano podem produzir efeitos imediatos ou ficar
              programadas para o próximo ciclo, conforme informado na interface.
              Limites menores não autorizam perda ou ocultação indevida de
              registros históricos, mas podem impedir novos cadastros até a
              regularização.
            </p>
          </section>

          <section id="cancelamento" className="scroll-mt-24">
            <h2>6. Atraso, bloqueio e cancelamento</h2>
            <p>
              Após o vencimento, a organização possui três dias completos de
              carência, durante os quais o acesso operacional continua com aviso
              de pagamento. Sem confirmação até o fim desse prazo, a operação
              poderá ser bloqueada até a regularização.
            </p>
            <p>
              O bloqueio por inadimplência não elimina os dados. A página de
              assinatura e os meios necessários à regularização permanecem
              disponíveis aos perfis autorizados. A liberação pode depender do
              processamento do pagamento e do evento de confirmação do Asaas.
            </p>
            <p>
              O proprietário pode solicitar o cancelamento da renovação. Nesse
              caso, a assinatura permanece disponível até o fim do período já
              pago e não será renovada no ciclo seguinte. O cancelamento não
              gera restituição automática de valores já pagos, sem prejuízo dos
              direitos previstos em lei.
            </p>
            <p>
              Também podemos suspender ou encerrar o acesso por violação grave
              destes termos, fraude, risco de segurança ou determinação legal,
              adotando medidas proporcionais e preservando os direitos das
              partes.
            </p>
          </section>

          <section id="disponibilidade" className="scroll-mt-24">
            <h2>7. Disponibilidade, manutenção e suporte</h2>
            <p>
              Empregamos esforços razoáveis para manter a plataforma segura e
              disponível, mas não garantimos funcionamento ininterrupto. O
              serviço pode sofrer manutenções, atualizações, falhas de internet
              e indisponibilidades de fornecedores externos.
            </p>
            <p>
              Funcionalidades podem ser corrigidas ou atualizadas para aumentar
              segurança, compatibilidade e qualidade. Mudanças materiais que
              reduzam de forma relevante uma funcionalidade contratada serão
              comunicadas quando aplicável.
            </p>
            <p>
              Ao solicitar suporte, descreva o problema sem enviar senha, token,
              dados completos de cartão ou informações desnecessárias. Quando
              existir, informe o request ID exibido no erro para facilitar o
              diagnóstico.
            </p>
          </section>

          <section id="propriedade" className="scroll-mt-24">
            <h2>8. Propriedade intelectual</h2>
            <p>
              A marca Ciclera, o software, as interfaces, os textos, os fluxos,
              a identidade visual e os demais componentes do produto pertencem
              aos seus respectivos titulares e são protegidos pela legislação.
            </p>
            <p>
              A assinatura concede apenas uma licença limitada, revogável, não
              exclusiva e intransferível para utilizar o serviço durante a
              vigência da contratação. Nenhum direito sobre o software é
              transferido à organização.
            </p>
            <p>
              Os dados operacionais continuam pertencendo à organização ou aos
              respectivos titulares. Sugestões voluntárias podem ser utilizadas
              para melhorar o produto, sem divulgação de dados confidenciais ou
              identificação indevida da organização.
            </p>
          </section>

          <section id="responsabilidades" className="scroll-mt-24">
            <h2>9. Responsabilidades e limitações</h2>
            <p>
              A Ciclera fornece ferramentas de organização e rastreabilidade,
              mas não executa os serviços de campo, não fiscaliza a qualificação
              técnica da equipe e não valida automaticamente a veracidade de
              cada informação inserida.
            </p>
            <p>A organização permanece responsável por:</p>
            <ul>
              <li>
                seus clientes, contratos, preços, tributos, notas fiscais,
                obrigações trabalhistas e regulatórias;
              </li>
              <li>
                segurança do trabalho, capacitação dos técnicos e autorizações
                para acesso aos locais;
              </li>
              <li>
                revisão dos valores, registros e evidências antes de aprovar ou
                faturar uma ordem;
              </li>
              <li>
                equipamentos, conexão, navegador e dispositivos necessários ao
                uso do serviço;
              </li>
              <li>
                gestão dos usuários, permissões e operações realizadas por suas
                contas autorizadas.
              </li>
            </ul>
            <p>
              Indicadores e totais dependem dos dados registrados na plataforma
              e não constituem garantia de recebimento, lucro ou resultado
              comercial. Cada parte responderá pelos danos que causar na medida
              de sua responsabilidade e conforme a legislação aplicável, sem
              exclusão de direitos que não possam ser legalmente limitados.
            </p>
          </section>

          <section id="disposicoes" className="scroll-mt-24">
            <h2>10. Disposições gerais, alterações e contato</h2>
            <p>
              Dados e cenários identificados como demonstrativos existem apenas
              para apresentar o produto e não representam clientes, ordens ou
              receitas reais.
            </p>
            <p>
              Estes termos podem ser atualizados para refletir mudanças no
              produto, na contratação ou na legislação. Alterações relevantes
              serão comunicadas por meio adequado. O uso continuado após a
              vigência da nova versão representa concordância, quando permitido
              pela legislação.
            </p>
            <p>
              Se uma disposição for considerada inválida, as demais continuarão
              em vigor. A eventual tolerância a um descumprimento não representa
              renúncia de direito. Estes termos são regidos pelas leis da
              República Federativa do Brasil. As partes buscarão uma solução
              amigável antes de recorrer ao foro competente definido pela
              legislação aplicável.
            </p>
            <div className="rounded-2xl border border-primary/20 bg-primary/5 p-5">
              <h3>Dúvidas sobre estes termos</h3>
              <p>
                Entre em contato pelo e-mail{' '}
                <a href={`mailto:${email}`}>{email}</a>. Não envie senhas,
                tokens, dados completos de cartão ou outros segredos.
              </p>
              <p className="mt-3 inline-flex items-center gap-2 text-sm">
                <BadgeCheck
                  className="size-4 text-primary"
                  aria-hidden="true"
                />
                Consulte sempre a versão vigente publicada nesta página.
              </p>
            </div>
          </section>
        </div>
      </article>
    </main>
  )
}
