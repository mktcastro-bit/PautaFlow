/**
 * Fórmulas virais — 5 estruturas de gancho comprovadas
 * Base: análise de 1000 conteúdos virais
 * Cada fórmula tem um nome técnico (interno) e um label amigável (UI)
 */

export type ViralFormula = 'marco' | 'case' | 'atalho' | 'guia' | 'conselho'

export interface FormulaSpec {
  key: ViralFormula
  label: string          // Badge mostrado ao usuário
  shortName: string      // Versão técnica curta
  description: string    // Instrução pra IA
  example: string        // Exemplo concreto
}

export const FORMULAS: Record<ViralFormula, FormulaSpec> = {
  marco: {
    key: 'marco',
    label: 'Marco',
    shortName: 'Idade + Dor + Prazo',
    description: 'Estrutura: "Se você está nos seus [X anos / momento da vida], estas são [N] coisas que precisa [fazer/evitar] para [resultado/evitar dor] até [Y]." Cria identificação imediata por faixa etária ou momento de vida + senso de urgência implícita.',
    example: 'Aos 30 e quer estabilidade aos 40? 7 decisões que você precisa tomar agora.',
  },
  case: {
    key: 'case',
    label: 'Case',
    shortName: 'Resultado sem a Dor',
    description: 'Estrutura: "Meu cliente / Conheço alguém que conseguiu [resultado desejado] sem [sacrifício comum], e aqui está como." Combina prova social com promessa implícita de atalho.',
    example: 'Esse cliente faturou 200k sem postar todo dia. O que ele fez diferente.',
  },
  atalho: {
    key: 'atalho',
    label: 'Atalho',
    shortName: 'Tríade (Dor + Obstáculo + Desejo)',
    description: 'Estrutura: "Se você tem [dor específica], tem pouco tempo para [obstáculo prático] e quer [resultado desejado], salve estas [N] [dicas/passos]." Ativa o comportamento "salvar" — métrica importante das redes.',
    example: 'Sem tempo, mas quer crescer no LinkedIn? Salve estas 5 práticas.',
  },
  guia: {
    key: 'guia',
    label: 'Guia',
    shortName: 'Jornada + Passos',
    description: 'Estrutura: "Se você está em uma jornada de [resultado], isto é exatamente o que fazer em [N] passos." Valida que o leitor já está no caminho certo + reduz fricção apresentando passos simples.',
    example: 'Construindo sua marca pessoal? Os 5 passos que realmente importam.',
  },
  conselho: {
    key: 'conselho',
    label: 'Conselho',
    shortName: 'Se Eu Fosse Você',
    description: 'Estrutura: "Se eu acordasse amanhã com [dor / situação inicial] e quisesse [resultado] até [prazo], é exatamente isto que faria." Constrói autoridade sem arrogância usando empatia direta.',
    example: 'Se eu começasse uma agência hoje com 0 clientes, faria essas 7 coisas.',
  },
}

export const FORMULA_ORDER: ViralFormula[] = ['atalho', 'guia', 'conselho', 'case', 'marco']

export function getFormula(key: string | null | undefined): FormulaSpec | null {
  if (!key) return null
  return FORMULAS[key as ViralFormula] || null
}
