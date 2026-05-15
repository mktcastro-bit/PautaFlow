import { LegalLayout } from '@/components/legal/legal-layout'

export const metadata = {
  title: 'Termos de Uso · Pauta',
  description: 'Termos de uso da plataforma Pauta.',
}

export default function TermosPage() {
  return (
    <LegalLayout
      title="Termos de Uso"
      subtitle="As regras do jogo entre você e o Pauta. Leia com atenção antes de usar nossos serviços."
      updatedAt="08 de maio de 2026"
    >
      <h2>1. Aceitação dos termos</h2>
      <p>
        Ao criar uma conta ou usar o Pauta (a "plataforma"), você concorda com estes Termos de Uso.
        Se você não concorda, não use a plataforma. Os termos podem ser atualizados a qualquer momento,
        e o uso continuado após mudanças significa aceitação das novas condições.
      </p>

      <h2>2. O que é o Pauta</h2>
      <p>
        O Pauta é uma ferramenta de gestão de pautas e geração de conteúdo assistida por
        inteligência artificial. Ele organiza ideias, configura a identidade da sua marca e gera
        rascunhos de texto e arte para publicações em redes sociais.
      </p>
      <p>
        <strong>Importante:</strong> a IA produz <em>sugestões</em>. Você é responsável por revisar,
        adaptar e aprovar todo conteúdo antes de publicar.
      </p>

      <h2>3. Sua conta</h2>
      <ul>
        <li>Você precisa ter ao menos 18 anos para criar uma conta.</li>
        <li>Você é responsável pela segurança da sua senha e por toda atividade realizada com sua conta.</li>
        <li>Você se compromete a fornecer dados verdadeiros no cadastro e mantê-los atualizados.</li>
        <li>Reservamo-nos o direito de suspender contas que violem estes termos.</li>
      </ul>

      <h2>4. Uso aceitável</h2>
      <p>Você concorda em <strong>não</strong> usar o Pauta para:</p>
      <ul>
        <li>Gerar conteúdo ilegal, difamatório, discriminatório, violento ou que viole direitos autorais.</li>
        <li>Disseminar desinformação, golpes ou conteúdo enganoso.</li>
        <li>Tentar fazer engenharia reversa, copiar ou redistribuir partes da plataforma.</li>
        <li>Sobrecarregar nossa infraestrutura com requisições automatizadas excessivas.</li>
        <li>Compartilhar credenciais de acesso com terceiros sem autorização.</li>
      </ul>

      <h2>5. Conteúdo gerado</h2>
      <p>
        Todo conteúdo que você cria, edita ou gera no Pauta pertence a você. Concedemos uso da
        plataforma apenas como ferramenta — não reivindicamos direitos sobre suas pautas, textos
        ou artes.
      </p>
      <p>
        Em contrapartida, você nos autoriza a processar esse conteúdo internamente para entregar
        as funcionalidades (gerar texto, exportar arquivos, salvar no banco de dados, etc.).
      </p>

      <h2>6. Inteligência artificial</h2>
      <p>
        Usamos modelos da Anthropic (Claude) para geração de conteúdo. As saídas da IA são
        probabilísticas — podem conter erros, vieses ou imprecisões. Você reconhece que:
      </p>
      <ul>
        <li>O Pauta não garante exatidão, originalidade ou adequação do conteúdo gerado.</li>
        <li>Você deve revisar todo material antes de publicar.</li>
        <li>Não somos responsáveis por consequências de conteúdo publicado sem revisão.</li>
      </ul>

      <h2>7. Planos, pagamentos e cancelamento</h2>
      <p>
        O Pauta oferece um plano gratuito de teste com limites de uso. Planos pagos podem ser
        oferecidos com cobrança mensal ou anual.
      </p>
      <ul>
        <li>Cancele a qualquer momento via Configurações da conta. O acesso permanece até o fim do ciclo pago.</li>
        <li>Não há reembolso proporcional após o início de um ciclo de cobrança.</li>
        <li>Mudanças de plano entram em vigor imediatamente, com cobrança proporcional quando aplicável.</li>
      </ul>

      <h2>8. Limitação de responsabilidade</h2>
      <p>
        O Pauta é fornecido "como está", sem garantias explícitas ou implícitas. Não nos
        responsabilizamos por lucros cessantes, perda de dados, indisponibilidade temporária ou
        danos indiretos decorrentes do uso (ou impossibilidade de uso) da plataforma.
      </p>

      <h2>9. Encerramento</h2>
      <p>
        Você pode encerrar sua conta a qualquer momento. Podemos encerrar contas em caso de
        violação destes termos, fraude ou inadimplência prolongada, com notificação prévia
        sempre que possível.
      </p>

      <h2>10. Foro e legislação</h2>
      <p>
        Estes termos são regidos pelas leis brasileiras. Eventuais disputas serão resolvidas no
        foro da cidade da sede do Pauta.
      </p>

      <h2>11. Contato</h2>
      <p>
        Dúvidas sobre estes termos? Entre em contato pelo email registrado em nossa{' '}
        <a href="/privacidade">Política de Privacidade</a>.
      </p>
    </LegalLayout>
  )
}
