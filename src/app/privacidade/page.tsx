import { LegalLayout } from '@/components/legal/legal-layout'

export const metadata = {
  title: 'Política de Privacidade · PautaFlow',
  description: 'Como o PautaFlow coleta, usa e protege seus dados.',
}

export default function PrivacidadePage() {
  return (
    <LegalLayout
      title="Política de Privacidade"
      subtitle="Como tratamos seus dados, em linguagem direta. Sem juridiquês desnecessário."
      updatedAt="08 de maio de 2026"
    >
      <h2>1. Quem somos</h2>
      <p>
        O PautaFlow é operado em conformidade com a Lei Geral de Proteção de Dados (LGPD — Lei 13.709/2018).
        Esta política explica quais dados coletamos, por quê, e o que você pode fazer sobre eles.
      </p>

      <h2>2. Dados que coletamos</h2>

      <h3>2.1. Dados de cadastro</h3>
      <ul>
        <li>Email e senha (criptografada via Supabase Auth)</li>
        <li>Nome do workspace e organização</li>
      </ul>

      <h3>2.2. Dados de uso</h3>
      <ul>
        <li>DNA da marca: identidade, público, voz, estética e posicionamento que você cadastra</li>
        <li>Pautas: títulos, descrições, slides, legendas e configurações visuais</li>
        <li>Eventos de calendário e datas de publicação</li>
        <li>Histórico de geração com IA (entrada, modelo usado, resultado)</li>
      </ul>

      <h3>2.3. Dados técnicos</h3>
      <ul>
        <li>Endereço IP, navegador, sistema operacional (para segurança)</li>
        <li>Cookies essenciais de sessão e autenticação</li>
      </ul>

      <h2>3. Por que coletamos</h2>
      <ul>
        <li><strong>Fornecer o serviço:</strong> permitir login, salvar suas pautas, gerar conteúdo via IA.</li>
        <li><strong>Personalização:</strong> alimentar a IA com o DNA da sua marca para gerar conteúdo coerente.</li>
        <li><strong>Segurança:</strong> detectar fraudes, abusos e proteger sua conta.</li>
        <li><strong>Cobrança:</strong> processar pagamentos via processadores externos (ex: Stripe).</li>
        <li><strong>Comunicação:</strong> enviar notificações relevantes sobre sua conta e atualizações da plataforma.</li>
      </ul>

      <h2>4. Compartilhamento com terceiros</h2>
      <p>
        Compartilhamos dados <strong>apenas</strong> com prestadores essenciais para operação:
      </p>
      <ul>
        <li><strong>Supabase</strong> — banco de dados e autenticação</li>
        <li><strong>Anthropic</strong> — modelos de IA (Claude) para geração de conteúdo</li>
        <li><strong>Vercel</strong> — hospedagem da aplicação</li>
        <li><strong>Stripe</strong> — processamento de pagamentos (quando aplicável)</li>
      </ul>
      <p>
        Esses provedores acessam apenas o necessário para entregar suas funções e estão
        obrigados contratualmente a proteger seus dados.
      </p>
      <p>
        <strong>Nunca vendemos seus dados.</strong> Nunca compartilhamos com terceiros para fins
        publicitários sem seu consentimento explícito.
      </p>

      <h2>5. Onde seus dados ficam</h2>
      <p>
        Os dados são armazenados em servidores na nuvem, podendo trafegar internacionalmente
        (incluindo EUA e Brasil) conforme a infraestrutura dos provedores citados. Todas as
        transmissões são criptografadas via HTTPS/TLS.
      </p>

      <h2>6. Retenção</h2>
      <ul>
        <li>Dados de conta ativa: mantidos enquanto sua conta existir.</li>
        <li>Dados após cancelamento: mantidos por 30 dias para permitir reativação, depois excluídos.</li>
        <li>Dados de cobrança: mantidos pelo prazo legal exigido (5 anos para fins fiscais).</li>
        <li>Logs de segurança: mantidos por até 12 meses.</li>
      </ul>

      <h2>7. Seus direitos (LGPD)</h2>
      <p>Você tem direito a:</p>
      <ul>
        <li><strong>Acesso:</strong> saber quais dados temos sobre você.</li>
        <li><strong>Correção:</strong> atualizar dados incorretos ou incompletos.</li>
        <li><strong>Exclusão:</strong> solicitar remoção dos seus dados (exceto os exigidos por lei).</li>
        <li><strong>Portabilidade:</strong> receber seus dados em formato estruturado.</li>
        <li><strong>Revogação de consentimento:</strong> retirar autorização a qualquer momento.</li>
        <li><strong>Oposição:</strong> contestar tratamentos específicos.</li>
      </ul>
      <p>
        Para exercer qualquer direito, entre em contato pelo email ao fim desta página.
        Respondemos em até 15 dias úteis.
      </p>

      <h2>8. Cookies</h2>
      <p>
        Usamos cookies estritamente necessários para autenticação e sessão. Não usamos cookies
        de rastreamento publicitário nem compartilhamos com terceiros para esse fim.
      </p>

      <h2>9. Segurança</h2>
      <ul>
        <li>Senhas armazenadas com hash bcrypt (nunca em texto plano).</li>
        <li>Comunicação criptografada via HTTPS/TLS 1.3.</li>
        <li>Acesso a banco de dados restrito por políticas de Row-Level Security.</li>
        <li>Monitoramento contínuo de tentativas de acesso suspeitas.</li>
      </ul>
      <p>
        Em caso de incidente de segurança que envolva seus dados pessoais, você será notificado
        em até 72 horas e a Autoridade Nacional de Proteção de Dados (ANPD) será informada
        conforme exigido pela LGPD.
      </p>

      <h2>10. Conteúdo gerado pela IA</h2>
      <p>
        Quando você gera conteúdo, o texto enviado para a IA (ex: DNA da marca + briefing) é
        processado pelos servidores da Anthropic. Conforme acordo com a Anthropic, esses dados
        <strong> não são usados para treinar modelos</strong> e são descartados após o processamento.
      </p>

      <h2>11. Alterações nesta política</h2>
      <p>
        Atualizações relevantes serão comunicadas por email com 30 dias de antecedência. A data
        no topo desta página indica a última versão.
      </p>

      <h2>12. Contato e DPO</h2>
      <p>
        Para qualquer questão relacionada a privacidade, exercer direitos da LGPD ou reportar
        problemas, escreva para: <strong>contato@pautaflow.com.br</strong>
      </p>
      <p>
        Você também pode buscar a ANPD diretamente em{' '}
        <a href="https://www.gov.br/anpd" target="_blank" rel="noopener noreferrer">gov.br/anpd</a>.
      </p>
    </LegalLayout>
  )
}
