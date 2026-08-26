import type { Metadata } from 'next'
import { Database, LockKeyhole, Scale, ShieldCheck } from 'lucide-react'

import { LegalPageShell } from '@/components/legal/legal-page-shell'
import { publicEnvironment } from '@/config/public-env'

export const metadata: Metadata = {
  title: 'Política de Privacidade',
  description:
    'Entenda quais dados a Ciclera trata, para quais finalidades, com quem compartilha e como exercer seus direitos.',
  alternates: { canonical: '/politica-de-privacidade' },
}

const navigation = [
  ['1. Aplicação e responsabilidades', 'aplicacao'],
  ['2. Dados tratados', 'dados'],
  ['3. Finalidades e bases legais', 'finalidades'],
  ['4. Compartilhamento', 'compartilhamento'],
  ['5. Cookies e analytics', 'cookies'],
  ['6. Retenção e exclusão', 'retencao'],
  ['7. Segurança', 'seguranca'],
  ['8. Direitos do titular', 'direitos'],
  ['9. Contato e atualizações', 'contato'],
] as const

export default function Page() {
  const email = publicEnvironment.NEXT_PUBLIC_CONTACT_EMAIL

  return (
    <LegalPageShell
      eyebrow="Privacidade e proteção de dados"
      title="Política de Privacidade"
      description="Esta política explica como a Ciclera trata dados pessoais no site e na plataforma de gestão de ordens de serviço, em conformidade com a legislação aplicável, especialmente a Lei Geral de Proteção de Dados Pessoais (LGPD)."
      version="Versão 2.0"
      updatedAt="23 de agosto de 2026"
      navigationLabel="Nesta política"
      navigation={navigation}
      email={email}
      summary={[
        {
          icon: ShieldCheck,
          title: 'Sem comercialização',
          description: 'A Ciclera não vende dados pessoais.',
        },
        {
          icon: LockKeyhole,
          title: 'Acesso protegido',
          description:
            'Sessões seguras, controle por perfil e isolamento entre organizações.',
        },
        {
          icon: Database,
          title: 'Dados operacionais',
          description:
            'A organização mantém o controle sobre os dados inseridos por sua equipe.',
        },
      ]}
      counterpart={{
        label: 'Documento relacionado',
        title: 'Termos de Uso',
        description:
          'Consulte as regras para cadastro, contratação e utilização segura da plataforma.',
        href: '/termos-de-uso',
      }}
    >
      <section id="aplicacao" className="scroll-mt-24">
        <h2>1. Aplicação e responsabilidades</h2>
        <p>
          Esta política se aplica ao acesso ao domínio ciclera.online, ao
          cadastro de contas e ao uso das áreas administrativa e de campo da
          Ciclera.
        </p>
        <p>
          Para dados necessários ao cadastro, autenticação, cobrança, segurança
          e relacionamento com o assinante, a Ciclera toma as decisões
          essenciais sobre o tratamento e atua como controladora.
        </p>
        <p>
          Para dados de funcionários, clientes, contatos locais e demais
          informações operacionais inseridas por uma organização assinante, essa
          organização normalmente define a finalidade do tratamento e atua como
          controladora. Nesses casos, a Ciclera trata os dados para prestar o
          serviço, na condição de operadora, conforme as instruções e
          configurações da organização.
        </p>
      </section>

      <section id="dados" className="scroll-mt-24">
        <h2>2. Dados pessoais e informações tratadas</h2>
        <p>De acordo com a forma de utilização, podemos tratar:</p>
        <ul>
          <li>
            <strong>Cadastro e equipe:</strong> nome da organização, nome,
            e-mail, perfil de acesso, situação da conta e aceite dos documentos
            legais.
          </li>
          <li>
            <strong>Autenticação:</strong> hashes de senha e de tokens, sessões,
            datas de acesso e informações necessárias para recuperação da conta.
            Senhas e tokens não são armazenados em texto puro.
          </li>
          <li>
            <strong>Clientes e locais:</strong> nome ou razão social, documento,
            e-mail, telefone, endereço, contato local e instruções de acesso
            fornecidas pela organização.
          </li>
          <li>
            <strong>Operação:</strong> equipamentos, ordens de serviço, agenda,
            responsáveis, observações, histórico, materiais, serviços, horas e
            valores relacionados ao atendimento.
          </li>
          <li>
            <strong>Evidências:</strong> fotografias enviadas durante a
            execução. A organização deve evitar incluir pessoas, documentos ou
            dados sensíveis que não sejam necessários ao serviço.
          </li>
          <li>
            <strong>Cobrança:</strong> plano, forma e situação do pagamento,
            vencimentos, referências técnicas e links de cobrança ou comprovante
            disponibilizados pelo Asaas. A Ciclera não recebe nem armazena os
            dados completos do cartão.
          </li>
          <li>
            <strong>Dados técnicos:</strong> endereço IP, origem da requisição,
            navegador, dispositivo, timestamps, request ID, registros de
            segurança, auditoria e diagnóstico de falhas.
          </li>
        </ul>
        <p>
          Os dados são fornecidos pelo próprio titular, pelo proprietário ou
          administrador da organização, pela equipe autorizada, por integrações
          contratadas ou gerados durante o uso da plataforma.
        </p>
      </section>

      <section id="finalidades" className="scroll-mt-24">
        <h2>3. Finalidades e bases legais</h2>
        <p>O tratamento pode ser realizado para:</p>
        <ul>
          <li>
            criar a organização, autenticar usuários e disponibilizar as
            funcionalidades contratadas;
          </li>
          <li>
            executar o contrato, controlar planos, cobranças, limites e acesso à
            operação;
          </li>
          <li>
            registrar ordens, evidências, histórico e auditoria necessários à
            prestação do serviço;
          </li>
          <li>
            prevenir fraude, abuso, acesso indevido e incidentes de segurança;
          </li>
          <li>
            prestar suporte, diagnosticar erros e melhorar estabilidade,
            acessibilidade e desempenho;
          </li>
          <li>
            cumprir obrigações legais ou regulatórias e exercer direitos em
            processos administrativos, judiciais ou arbitrais.
          </li>
        </ul>
        <p>
          Conforme o contexto, utilizamos bases legais como execução de contrato
          e procedimentos preliminares, cumprimento de obrigação legal ou
          regulatória, exercício regular de direitos, legítimo interesse com
          avaliação dos direitos do titular e consentimento quando ele for
          efetivamente necessário.
        </p>
      </section>

      <section id="compartilhamento" className="scroll-mt-24">
        <h2>4. Compartilhamento e fornecedores</h2>
        <p>
          A Ciclera não comercializa dados pessoais. O compartilhamento é
          limitado ao necessário para operar a plataforma, cumprir a lei,
          proteger direitos ou atender uma solicitação legítima do titular ou da
          organização responsável.
        </p>
        <p>Atualmente, podemos utilizar fornecedores para:</p>
        <ul>
          <li>
            hospedagem da aplicação web, API, banco de dados e armazenamento
            privado de evidências;
          </li>
          <li>envio de e-mails transacionais e recuperação de senha;</li>
          <li>controle de abuso e limitação de requisições;</li>
          <li>
            processamento de cobranças pelo Asaas, sujeito também aos termos e
            políticas do próprio provedor;
          </li>
          <li>métricas agregadas de acesso e desempenho por meio da Vercel.</li>
        </ul>
        <p>
          Alguns fornecedores podem processar dados fora do Brasil. Quando
          houver transferência internacional, adotaremos os mecanismos e
          salvaguardas exigidos pela legislação aplicável.
        </p>
      </section>

      <section id="cookies" className="scroll-mt-24">
        <h2>5. Cookies, sessão e métricas de acesso</h2>
        <p>
          As áreas autenticadas utilizam cookies estritamente necessários para
          manter a sessão e renovar o acesso com segurança. Em produção, esses
          cookies são protegidos por configurações como HttpOnly, Secure e
          SameSite, conforme a topologia dos domínios. Bloqueá-los pode impedir
          o login e o funcionamento da plataforma.
        </p>
        <p>
          A landing page utiliza o Vercel Web Analytics para estatísticas
          agregadas, como páginas acessadas, origem aproximada, país, tipo de
          dispositivo e navegador. Segundo a documentação do serviço, essa
          ferramenta não utiliza cookies para identificar visitantes e não
          permite acompanhá-los entre diferentes dias ou sites.
        </p>
      </section>

      <section id="retencao" className="scroll-mt-24">
        <h2>6. Retenção, arquivamento e exclusão</h2>
        <p>
          Conservamos os dados enquanto a conta estiver ativa e pelo tempo
          necessário para prestar o serviço, cumprir obrigações, preservar
          segurança, prevenir fraude e exercer direitos. O prazo pode variar
          conforme a categoria do dado e a finalidade do tratamento.
        </p>
        <p>
          A desativação ou exclusão de um usuário não apaga automaticamente
          ordens, históricos e auditorias já vinculados a ele. Esses registros
          podem ser preservados para manter a integridade da operação. O
          arquivamento de clientes e equipamentos também não equivale à
          eliminação imediata de seus históricos.
        </p>
        <p>
          Solicitações de eliminação serão avaliadas considerando a relação
          entre a Ciclera, a organização controladora e o titular, bem como as
          hipóteses legais de conservação. Cópias residuais podem permanecer
          temporariamente em backups protegidos até sua rotação.
        </p>
      </section>

      <section id="seguranca" className="scroll-mt-24">
        <h2>7. Segurança e resposta a incidentes</h2>
        <p>
          Adotamos medidas técnicas e administrativas compatíveis com o serviço,
          incluindo isolamento entre organizações, controle de acesso por
          perfil, hashes para credenciais, sessões revogáveis, evidências
          privadas, URLs temporárias, auditoria, limitação de requisições e
          registros estruturados sem segredos.
        </p>
        <p>
          Nenhum ambiente é completamente imune a riscos. Em caso de incidente
          relevante, adotaremos medidas de contenção e investigação e
          realizaremos as comunicações exigidas pela LGPD e pela regulamentação
          aplicável.
        </p>
        <p>
          Usuários também devem proteger suas credenciais, utilizar senhas
          exclusivas, encerrar sessões em dispositivos compartilhados e
          comunicar imediatamente qualquer suspeita de acesso indevido.
        </p>
      </section>

      <section id="direitos" className="scroll-mt-24">
        <h2>8. Direitos do titular</h2>
        <p>
          Nos termos da LGPD e conforme aplicável ao caso concreto, o titular
          pode solicitar:
        </p>
        <ul>
          <li>confirmação da existência de tratamento e acesso;</li>
          <li>correção de dados incompletos, inexatos ou desatualizados;</li>
          <li>
            anonimização, bloqueio ou eliminação de dados desnecessários,
            excessivos ou tratados em desconformidade;
          </li>
          <li>portabilidade, quando regulamentada e aplicável;</li>
          <li>informações sobre compartilhamento;</li>
          <li>
            revogação do consentimento e eliminação dos dados tratados com essa
            base, ressalvadas as hipóteses legais de conservação;
          </li>
          <li>oposição a tratamento realizado em desconformidade.</li>
        </ul>
        <p>
          Para proteger o próprio titular, podemos solicitar informações
          razoáveis para confirmar sua identidade. Quando o dado tiver sido
          inserido e controlado pela organização assinante, a solicitação poderá
          ser direcionada a ela ou tratada em conjunto.
        </p>
        <a
          href="https://www.gov.br/anpd/pt-br/assuntos/titular-de-dados-1/direito-dos-titulares"
          target="_blank"
          rel="noreferrer"
          className="legal-reference"
        >
          Consultar os direitos explicados pela ANPD
          <Scale className="size-4" aria-hidden="true" />
        </a>
      </section>

      <section id="contato" className="scroll-mt-24">
        <h2>9. Público, contato e atualizações</h2>
        <p>
          A Ciclera é uma plataforma empresarial e não é destinada ao uso por
          crianças ou adolescentes. Contas não devem ser criadas em nome de
          menores de idade.
        </p>
        <p>
          Esta política poderá ser atualizada para refletir mudanças no produto,
          nos fornecedores ou na legislação. Alterações relevantes serão
          comunicadas pelos meios adequados, e a versão vigente ficará
          disponível nesta página.
        </p>
        <div className="rounded-2xl border border-primary/20 bg-primary/5 p-5">
          <h3>Canal de privacidade</h3>
          <p>
            Para dúvidas ou exercício de direitos, escreva para{' '}
            <a href={`mailto:${email}`}>{email}</a>. Informe apenas os dados
            necessários para identificarmos a conta e atendermos a solicitação
            com segurança.
          </p>
        </div>
      </section>
    </LegalPageShell>
  )
}
