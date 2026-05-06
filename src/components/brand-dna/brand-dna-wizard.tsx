'use client'

import { useState, useRef, KeyboardEvent } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowRight, ArrowLeft, Sparkles, X, Info } from 'lucide-react'
import { BrandDNA, Workspace } from '@/types'
import { cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'

const STEPS = [
  { num: 1, title: 'Marca', description: 'Nome, missão, visão e valores' },
  { num: 2, title: 'Público', description: 'Para quem a marca fala' },
  { num: 3, title: 'Voz', description: 'Como sua marca se comunica' },
  { num: 4, title: 'Identidade', description: 'Cores, tipografia e estética' },
  { num: 5, title: 'Assets', description: 'Diferencial e pilares de conteúdo' },
]

const TONE_OPTIONS = ['formal', 'informal', 'técnico', 'inspirador', 'divertido', 'educativo', 'provocador', 'empático']

const PROFILE_ROLES: Record<string, string[]> = {
  B2B: ['Gestores', 'Diretores', 'Empresários', 'Empreendedores', 'Founders', 'Coordenadores', 'Analistas', 'Consultores'],
  B2C: ['Jovens adultos', 'Pais', 'Profissionais liberais', 'Estudantes', 'Entusiastas', 'Consumidores frequentes'],
  Ambos: ['Gestores', 'Empresários', 'Profissionais liberais', 'Empreendedores', 'Founders', 'Analistas'],
}

interface Props {
  workspace: Workspace
  initialDna?: BrandDNA | null
}

export function BrandDnaWizard({ workspace, initialDna }: Props) {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(initialDna?.current_step || 1)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const [data, setData] = useState({
    step1_brand_name: initialDna?.step1_brand_name || '',
    step1_tagline: initialDna?.step1_tagline || '',
    step1_mission: initialDna?.step1_mission || '',
    step1_vision: initialDna?.step1_vision || '',
    step1_values: initialDna?.step1_values?.join(', ') || '',

    step2_profile: initialDna?.step2_profile || initialDna?.step2_persona_name || '',
    step2_maturity: initialDna?.step2_maturity || initialDna?.step2_age_range || '',
    step2_roles: initialDna?.step2_roles || initialDna?.step2_interests || [] as string[],
    step2_pain_points: initialDna?.step2_pain_points?.join('\n') || '',
    step2_consumption_context: initialDna?.step2_consumption_context || initialDna?.step2_target_audience || '',
    step2_attention_triggers: initialDna?.step2_attention_triggers || '',

    step3_tone: initialDna?.step3_tone || [] as string[],
    step3_personality_traits: initialDna?.step3_personality_traits?.join(', ') || '',
    step3_avoid_words: initialDna?.step3_avoid_words?.join(', ') || '',
    step3_preferred_words: initialDna?.step3_preferred_words?.join(', ') || '',

    step4_primary_colors: initialDna?.step4_primary_colors?.join(', ') || '',
    step4_typography_style: initialDna?.step4_typography_style || '',
    step4_visual_references: initialDna?.step4_visual_references?.join(', ') || '',
    step4_aesthetic_keywords: initialDna?.step4_aesthetic_keywords?.join(', ') || '',

    step5_differentiators: initialDna?.step5_differentiators || '',
    step5_competitors: initialDna?.step5_competitors?.join(', ') || '',
    step5_market_position: initialDna?.step5_market_position || '',
    step5_content_pillars: initialDna?.step5_content_pillars?.join(', ') || '',
  })

  function parseArray(str: string): string[] {
    return str.split(',').map(s => s.trim()).filter(Boolean)
  }

  async function saveStep(nextStep: number) {
    setSaving(true)
    const supabase = createClient()

    const payload: any = {
      workspace_id: workspace.id,
      current_step: nextStep,
      step1_brand_name: data.step1_brand_name || null,
      step1_tagline: data.step1_tagline || null,
      step1_mission: data.step1_mission || null,
      step1_vision: data.step1_vision || null,
      step1_values: parseArray(data.step1_values),
      step2_profile: data.step2_profile || null,
      step2_maturity: data.step2_maturity || null,
      step2_roles: data.step2_roles,
      step2_pain_points: data.step2_pain_points.split('\n').map(s => s.trim()).filter(Boolean),
      step2_consumption_context: data.step2_consumption_context || null,
      step2_attention_triggers: data.step2_attention_triggers || null,
      step3_tone: data.step3_tone,
      step3_personality_traits: parseArray(data.step3_personality_traits),
      step3_avoid_words: parseArray(data.step3_avoid_words),
      step3_preferred_words: parseArray(data.step3_preferred_words),
      step4_primary_colors: parseArray(data.step4_primary_colors),
      step4_typography_style: data.step4_typography_style || null,
      step4_visual_references: parseArray(data.step4_visual_references),
      step4_aesthetic_keywords: parseArray(data.step4_aesthetic_keywords),
      step5_differentiators: data.step5_differentiators || null,
      step5_competitors: parseArray(data.step5_competitors),
      step5_market_position: data.step5_market_position || null,
      step5_content_pillars: parseArray(data.step5_content_pillars),
    }

    if (nextStep > 5) {
      payload.completed = true
      payload.completed_at = new Date().toISOString()
    }

    await supabase.from('brand_dna').upsert(payload, { onConflict: 'workspace_id' })

    setSaving(false)

    if (nextStep > 5) {
      setSaved(true)
      router.refresh()
    } else {
      setCurrentStep(nextStep)
    }
  }

  function toggleTone(tone: string) {
    setData(prev => ({
      ...prev,
      step3_tone: prev.step3_tone.includes(tone)
        ? prev.step3_tone.filter(t => t !== tone)
        : [...prev.step3_tone, tone]
    }))
  }

  if (saved) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4 max-w-md">
          <div className="h-16 w-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto">
            <Sparkles className="h-8 w-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold">DNA da Marca completo!</h2>
          <p className="text-muted-foreground">
            A IA agora usa essas informações para gerar conteúdo personalizado para sua marca.
          </p>
          <button
            onClick={() => router.push(`/workspaces/${workspace.slug}/generate`)}
            className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-5 py-2.5 rounded-lg font-medium hover:bg-primary/90 transition-colors"
          >
            <Sparkles className="h-4 w-4" />
            Gerar primeiro conteúdo
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-1">DNA da Marca</h1>
        <p className="text-muted-foreground text-sm">
          Configure uma vez — toda geração herda a identidade da sua marca.
        </p>
      </div>

      {/* Progress */}
      <div className="flex items-center gap-2 mb-8">
        {STEPS.map((step, i) => (
          <div key={step.num} className="flex items-center gap-2 flex-1">
            <button
              onClick={() => currentStep > step.num && setCurrentStep(step.num)}
              className={cn('flex items-center gap-2 text-left', currentStep > step.num ? 'cursor-pointer' : 'cursor-default')}
            >
              <div className={cn(
                'h-7 w-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 transition-colors',
                currentStep === step.num ? 'bg-primary text-primary-foreground'
                  : currentStep > step.num ? 'bg-green-500 text-white'
                  : 'bg-muted text-muted-foreground'
              )}>
                {currentStep > step.num ? '✓' : step.num}
              </div>
              <span className={cn('text-xs font-medium hidden sm:block', currentStep === step.num ? 'text-primary' : 'text-muted-foreground')}>
                {step.title}
              </span>
            </button>
            {i < STEPS.length - 1 && (
              <div className={cn('flex-1 h-px', currentStep > step.num ? 'bg-green-400' : 'bg-border')} />
            )}
          </div>
        ))}
      </div>

      {/* Step content */}
      <div className="bg-card border border-border rounded-2xl p-6">
        <div className="mb-5">
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Passo {currentStep} de 5
          </span>
          <h2 className="text-lg font-semibold mt-0.5">{STEPS[currentStep - 1].title}</h2>
          <p className="text-sm text-muted-foreground">{STEPS[currentStep - 1].description}</p>
        </div>

        <div className="space-y-5">
          {currentStep === 1 && <Step1 data={data} setData={setData} />}
          {currentStep === 2 && <Step2 data={data} setData={setData} />}
          {currentStep === 3 && <Step3 data={data} setData={setData} toggleTone={toggleTone} />}
          {currentStep === 4 && <Step4 data={data} setData={setData} />}
          {currentStep === 5 && <Step5 data={data} setData={setData} />}
        </div>

        <p className="text-xs text-muted-foreground mt-5 text-center">
          Não sabe agora? Deixe em branco e edite depois — nada é permanente.
        </p>

        <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
          <button
            onClick={() => setCurrentStep(s => s - 1)}
            disabled={currentStep === 1}
            className="flex items-center gap-1.5 px-4 py-2 border border-input rounded-lg text-sm hover:bg-accent disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Anterior
          </button>
          <button
            onClick={() => saveStep(currentStep < 5 ? currentStep + 1 : 6)}
            disabled={saving}
            className="flex items-center gap-1.5 bg-primary text-primary-foreground px-5 py-2 rounded-lg text-sm font-medium hover:bg-primary/90 disabled:opacity-50 transition-colors"
          >
            {saving ? 'Salvando...' : currentStep === 5 ? 'Concluir' : 'Próximo →'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Shared primitives ────────────────────────────────────────────────────────

function Field({ label, hint, tooltip, children }: { label: string; hint?: string; tooltip?: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="space-y-1.5">
      <div className="flex items-center gap-1.5">
        <label className="text-sm font-medium">{label}</label>
        {tooltip && (
          <div className="relative">
            <button type="button" onClick={() => setOpen(o => !o)} className="text-muted-foreground hover:text-foreground transition-colors">
              <Info className="h-3.5 w-3.5" />
            </button>
            {open && (
              <div className="absolute left-0 top-5 z-10 w-64 bg-popover border border-border rounded-lg p-3 shadow-lg text-xs text-muted-foreground leading-relaxed">
                {tooltip}
                <button onClick={() => setOpen(false)} className="absolute top-2 right-2 text-muted-foreground hover:text-foreground">
                  <X className="h-3 w-3" />
                </button>
              </div>
            )}
          </div>
        )}
      </div>
      {children}
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
    </div>
  )
}

function Input({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <input
      type="text"
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full px-3 py-2 border border-input rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring bg-background"
    />
  )
}

function Textarea({ value, onChange, placeholder, rows = 3 }: { value: string; onChange: (v: string) => void; placeholder?: string; rows?: number }) {
  return (
    <textarea
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      rows={rows}
      className="w-full px-3 py-2 border border-input rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none bg-background"
    />
  )
}

function Select({ value, onChange, options, placeholder }: { value: string; onChange: (v: string) => void; options: { value: string; label: string }[]; placeholder?: string }) {
  return (
    <select
      value={value}
      onChange={e => onChange(e.target.value)}
      className="w-full px-3 py-2 border border-input rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring bg-background"
    >
      <option value="">{placeholder || 'Selecionar...'}</option>
      {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  )
}

function TagInput({ tags, onChange, placeholder, suggestions }: {
  tags: string[]
  onChange: (tags: string[]) => void
  placeholder?: string
  suggestions?: string[]
}) {
  const [input, setInput] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  function addTag(val: string) {
    const tag = val.trim()
    if (tag && !tags.includes(tag)) onChange([...tags, tag])
    setInput('')
  }

  function onKey(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      addTag(input)
    } else if (e.key === 'Backspace' && !input && tags.length) {
      onChange(tags.slice(0, -1))
    }
  }

  const filtered = suggestions?.filter(s => !tags.includes(s) && s.toLowerCase().includes(input.toLowerCase())) || []

  return (
    <div className="space-y-2">
      <div
        className="min-h-10 w-full px-3 py-2 border border-input rounded-lg text-sm flex flex-wrap gap-1.5 cursor-text bg-background focus-within:ring-2 focus-within:ring-ring"
        onClick={() => inputRef.current?.focus()}
      >
        {tags.map(tag => (
          <span key={tag} className="inline-flex items-center gap-1 bg-primary/10 text-primary px-2 py-0.5 rounded text-xs font-medium uppercase tracking-wide">
            {tag}
            <button type="button" onClick={() => onChange(tags.filter(t => t !== tag))} className="hover:text-primary/70">
              <X className="h-3 w-3" />
            </button>
          </span>
        ))}
        <input
          ref={inputRef}
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={onKey}
          placeholder={tags.length === 0 ? placeholder : ''}
          className="flex-1 min-w-24 outline-none bg-transparent text-sm placeholder:text-muted-foreground"
        />
      </div>
      {filtered.length > 0 && input.length === 0 && (
        <div className="flex flex-wrap gap-1.5">
          {filtered.slice(0, 6).map(s => (
            <button
              key={s}
              type="button"
              onClick={() => addTag(s)}
              className="px-2.5 py-1 bg-muted hover:bg-muted/80 rounded text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              + {s}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Steps ────────────────────────────────────────────────────────────────────

function Step1({ data, setData }: any) {
  const set = (key: string) => (v: string) => setData((p: any) => ({ ...p, [key]: v }))
  return (
    <>
      <Field label="Nome da marca *" hint="Como sua marca é conhecida no mercado.">
        <Input value={data.step1_brand_name} onChange={set('step1_brand_name')} placeholder="Ex: Nexum360" />
      </Field>
      <Field label="Tagline / Slogan" hint="A frase que sintetiza sua proposta em poucas palavras.">
        <Input value={data.step1_tagline} onChange={set('step1_tagline')} placeholder="Ex: Estratégia que transforma" />
      </Field>
      <Field
        label="Missão"
        hint="Por que sua marca existe?"
        tooltip="Descreva o propósito da sua marca além do lucro. Ex: 'Ajudar pequenas empresas a crescerem com estratégia digital acessível.'"
      >
        <Textarea value={data.step1_mission} onChange={set('step1_mission')} placeholder="Ajudar empresas a crescerem com estratégia digital..." />
      </Field>
      <Field
        label="Visão"
        hint="Onde sua marca quer chegar em 3 a 5 anos?"
        tooltip="Pense no estado futuro que você quer construir. Ex: 'Ser a principal referência em marketing baseado em dados no Brasil.'"
      >
        <Textarea value={data.step1_vision} onChange={set('step1_vision')} placeholder="Ser referência em marketing digital no Brasil..." />
      </Field>
      <Field label="Valores" hint="Separe por vírgula. Ex: Inovação, Transparência, Resultado">
        <Input value={data.step1_values} onChange={set('step1_values')} placeholder="Inovação, Transparência, Resultado, Parceria" />
      </Field>
    </>
  )
}

function Step2({ data, setData }: any) {
  const set = (key: string) => (v: string) => setData((p: any) => ({ ...p, [key]: v }))
  const roleSuggestions = PROFILE_ROLES[data.step2_profile] || PROFILE_ROLES['B2B']

  return (
    <>
      <p className="text-xs text-muted-foreground -mt-1 mb-1">
        Para quem a marca fala. Quanto mais específico, menos genérico o conteúdo fica.
      </p>

      <div className="grid grid-cols-2 gap-4">
        <Field
          label="Perfil"
          tooltip="B2B: sua marca vende ou fala com outras empresas. B2C: fala diretamente com o consumidor final. Ambos: os dois."
        >
          <Select
            value={data.step2_profile}
            onChange={v => setData((p: any) => ({ ...p, step2_profile: v, step2_roles: [] }))}
            options={[
              { value: 'B2B', label: 'B2B — Empresas' },
              { value: 'B2C', label: 'B2C — Consumidor' },
              { value: 'Ambos', label: 'Ambos' },
            ]}
            placeholder="Selecionar..."
          />
        </Field>

        <Field
          label="Maturidade do público"
          tooltip="Nível de conhecimento do seu público sobre o tema que você aborda. Isso define a profundidade e linguagem do conteúdo."
        >
          <Select
            value={data.step2_maturity}
            onChange={set('step2_maturity')}
            options={[
              { value: 'iniciante', label: 'Iniciante — está começando' },
              { value: 'intermediario', label: 'Intermediário — já sabe o básico' },
              { value: 'avancado', label: 'Avançado — domina o assunto' },
              { value: 'especialista', label: 'Especialista — é do setor' },
            ]}
            placeholder="Selecionar..."
          />
        </Field>
      </div>

      <Field
        label="Cargo / Papel"
        hint="Pressione Enter para adicionar. Sugestões aparecem abaixo."
        tooltip="Quem está na sala quando seu conteúdo é consumido? Pense em cargos, papéis ou posições — não precisa ser perfeito."
      >
        <TagInput
          tags={data.step2_roles}
          onChange={tags => setData((p: any) => ({ ...p, step2_roles: tags }))}
          placeholder="Gestores, empresários, decisores..."
          suggestions={roleSuggestions}
        />
      </Field>

      <Field
        label="Dor principal"
        hint="O problema real que faz esse público buscar o que você oferece."
        tooltip="Pense na situação concreta: o que esse público está vivendo agora que o leva até você? Ex: 'Sabe que precisa de uma presença digital mais forte, mas não tem tempo nem equipe para executar.'"
      >
        <Textarea
          value={data.step2_pain_points}
          onChange={set('step2_pain_points')}
          placeholder="Ex: Empresas que precisam estruturar marca e comunicação, mas não sabem por onde começar sem depender de agências caras."
          rows={3}
        />
      </Field>

      <Field
        label="Contexto de consumo"
        hint="Em que situação esse público encontra seu conteúdo?"
        tooltip="Pense no cenário físico e mental: onde está a pessoa, o que está fazendo, que estado de atenção tem. Ex: 'Profissional no celular durante o intervalo, buscando uma referência rápida para embasar uma decisão.'"
      >
        <Textarea
          value={data.step2_consumption_context}
          onChange={set('step2_consumption_context')}
          placeholder="Ex: Gestor no escritório pesquisando soluções entre reuniões, ou empreendedor no celular à noite buscando referência."
          rows={2}
        />
      </Field>

      <Field
        label="O que desperta interesse nesse público?"
        hint="Que tipo de abordagem, formato ou tema gera atenção real."
        tooltip="Ex: dados e pesquisas, cases com resultado concreto, provocações sobre o mercado, erros comuns do setor, comparativos antes/depois. Isso alimenta diretamente o tom das pautas geradas."
      >
        <Textarea
          value={data.step2_attention_triggers}
          onChange={set('step2_attention_triggers')}
          placeholder="Ex: Dados de mercado, cases com resultados reais, provocações sobre o que o mercado erra, comparativos práticos."
          rows={2}
        />
      </Field>
    </>
  )
}

function Step3({ data, setData, toggleTone }: any) {
  const set = (key: string) => (v: string) => setData((p: any) => ({ ...p, [key]: v }))
  return (
    <>
      <Field
        label="Tom de voz"
        hint="Selecione até 3 tons que representam sua marca."
        tooltip="Tom de voz é como sua marca soa — não o que ela diz, mas como ela diz. Seja honesto: qual é o tom real, não o ideal?"
      >
        <div className="flex flex-wrap gap-2 mt-1">
          {TONE_OPTIONS.map(tone => (
            <button
              key={tone}
              type="button"
              onClick={() => toggleTone(tone)}
              className={cn(
                'px-3 py-1.5 rounded-lg text-sm font-medium border capitalize transition-colors',
                data.step3_tone.includes(tone)
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'border-input text-muted-foreground hover:bg-accent'
              )}
            >
              {tone}
            </button>
          ))}
        </div>
      </Field>
      <Field label="Traços de personalidade" hint="Separe por vírgula. Ex: Confiante, direto, acolhedor">
        <Input value={data.step3_personality_traits} onChange={set('step3_personality_traits')} placeholder="Confiante, direto, acolhedor, inteligente" />
      </Field>
      <Field
        label="Palavras a EVITAR"
        hint="Separe por vírgula."
        tooltip="Palavras que soam vazias ou que contradizem seu posicionamento. Ex: 'revolucionário', 'disruptivo', 'simplesmente', 'obviamente'."
      >
        <Input value={data.step3_avoid_words} onChange={set('step3_avoid_words')} placeholder="obviamente, simplesmente, revolucionário, inovador" />
      </Field>
      <Field label="Palavras preferidas" hint="Separe por vírgula. Termos que sua marca usa com frequência.">
        <Input value={data.step3_preferred_words} onChange={set('step3_preferred_words')} placeholder="estratégia, resultado, crescimento, impacto" />
      </Field>
    </>
  )
}

function Step4({ data, setData }: any) {
  const set = (key: string) => (v: string) => setData((p: any) => ({ ...p, [key]: v }))
  return (
    <>
      <Field label="Cores principais" hint="Hex, nome ou descrição. Separe por vírgula.">
        <Input value={data.step4_primary_colors} onChange={set('step4_primary_colors')} placeholder="#6366f1, azul profundo, branco" />
      </Field>
      <Field label="Estilo tipográfico">
        <Select
          value={data.step4_typography_style}
          onChange={set('step4_typography_style')}
          options={[
            { value: 'moderno-minimalista', label: 'Moderno e minimalista' },
            { value: 'classico-elegante', label: 'Clássico e elegante' },
            { value: 'bold-impactante', label: 'Bold e impactante' },
            { value: 'playful-descontraido', label: 'Playful e descontraído' },
            { value: 'tecnico-corporativo', label: 'Técnico e corporativo' },
          ]}
        />
      </Field>
      <Field label="Referências visuais / marcas admiradas" hint="Separe por vírgula.">
        <Input value={data.step4_visual_references} onChange={set('step4_visual_references')} placeholder="Apple, Nike, HubSpot" />
      </Field>
      <Field label="Palavras que descrevem a estética" hint="Separe por vírgula.">
        <Input value={data.step4_aesthetic_keywords} onChange={set('step4_aesthetic_keywords')} placeholder="limpo, premium, ousado, acolhedor" />
      </Field>
    </>
  )
}

function Step5({ data, setData }: any) {
  const set = (key: string) => (v: string) => setData((p: any) => ({ ...p, [key]: v }))
  return (
    <>
      <Field
        label="Diferencial competitivo"
        hint="O que faz sua marca única — não o que você gostaria que fosse, mas o que de fato é diferente."
        tooltip="Ex: 'Somos a única consultoria que entrega estratégia + execução no mesmo pacote, sem terceirizar a criação.' Evite genéricos como 'qualidade' ou 'atendimento personalizado'."
      >
        <Textarea value={data.step5_differentiators} onChange={set('step5_differentiators')} placeholder="Combinamos estratégia de dados com criatividade humana para..." rows={3} />
      </Field>
      <Field label="Principais concorrentes" hint="Separe por vírgula.">
        <Input value={data.step5_competitors} onChange={set('step5_competitors')} placeholder="Agência X, Empresa Y, Ferramenta Z" />
      </Field>
      <Field label="Posicionamento no mercado">
        <Select
          value={data.step5_market_position}
          onChange={set('step5_market_position')}
          options={[
            { value: 'premium', label: 'Premium / Alto valor' },
            { value: 'custo-beneficio', label: 'Melhor custo-benefício' },
            { value: 'inovador', label: 'Inovador / Disruptivo' },
            { value: 'especialista', label: 'Especialista de nicho' },
            { value: 'democratizador', label: 'Democratizador' },
          ]}
        />
      </Field>
      <Field
        label="Pilares de conteúdo"
        hint="Principais temas que sua marca aborda. Separe por vírgula."
        tooltip="Os pilares são os grandes temas recorrentes da sua comunicação. Ex: 'Estratégia, Cases, Educação, Bastidores, Tendências'. A IA usará esses pilares para diversificar as pautas."
      >
        <Input value={data.step5_content_pillars} onChange={set('step5_content_pillars')} placeholder="Estratégia, Cases, Educação, Bastidores, Tendências" />
      </Field>
    </>
  )
}
