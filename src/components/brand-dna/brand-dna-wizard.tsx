'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { CheckCircle2, Circle, ArrowRight, ArrowLeft, Sparkles } from 'lucide-react'
import { BrandDNA, Workspace } from '@/types'
import { cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'

const STEPS = [
  { num: 1, title: 'Identidade', description: 'Nome, missão, visão e valores' },
  { num: 2, title: 'Público-Alvo', description: 'Quem você quer atingir' },
  { num: 3, title: 'Tom de Voz', description: 'Como sua marca fala' },
  { num: 4, title: 'Estética Visual', description: 'Cores, tipografia e referências' },
  { num: 5, title: 'Posicionamento', description: 'Diferencial e pilares de conteúdo' },
]

const TONE_OPTIONS = ['formal', 'informal', 'técnico', 'inspirador', 'divertido', 'educativo', 'provocador', 'empático']

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

    step2_target_audience: initialDna?.step2_target_audience || '',
    step2_age_range: initialDna?.step2_age_range || '',
    step2_interests: initialDna?.step2_interests?.join(', ') || '',
    step2_pain_points: initialDna?.step2_pain_points?.join(', ') || '',
    step2_persona_name: initialDna?.step2_persona_name || '',

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

    const payload: Partial<BrandDNA> & { current_step: number; completed?: boolean; completed_at?: string } = {
      workspace_id: workspace.id,
      current_step: nextStep,
      step1_brand_name: data.step1_brand_name || null,
      step1_tagline: data.step1_tagline || null,
      step1_mission: data.step1_mission || null,
      step1_vision: data.step1_vision || null,
      step1_values: parseArray(data.step1_values),
      step2_target_audience: data.step2_target_audience || null,
      step2_age_range: data.step2_age_range || null,
      step2_interests: parseArray(data.step2_interests),
      step2_pain_points: parseArray(data.step2_pain_points),
      step2_persona_name: data.step2_persona_name || null,
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

    if (initialDna) {
      await supabase.from('brand_dna').update(payload).eq('workspace_id', workspace.id)
    } else {
      await supabase.from('brand_dna').upsert(payload, { onConflict: 'workspace_id' })
    }

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
            O DNA da sua marca foi configurado. Agora a IA usará essas informações para gerar conteúdo personalizado.
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
          Configure a identidade da sua marca para geração de conteúdo personalizada com IA.
        </p>
      </div>

      {/* Progress */}
      <div className="flex items-center gap-2 mb-8">
        {STEPS.map((step, i) => (
          <div key={step.num} className="flex items-center gap-2 flex-1">
            <button
              onClick={() => currentStep > step.num && setCurrentStep(step.num)}
              className={cn(
                'flex items-center gap-2 text-left',
                currentStep > step.num ? 'cursor-pointer' : 'cursor-default'
              )}
            >
              <div className={cn(
                'h-7 w-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 transition-colors',
                currentStep === step.num
                  ? 'bg-primary text-primary-foreground'
                  : currentStep > step.num
                  ? 'bg-green-500 text-white'
                  : 'bg-muted text-muted-foreground'
              )}>
                {currentStep > step.num ? '✓' : step.num}
              </div>
              <span className={cn(
                'text-xs font-medium hidden sm:block',
                currentStep === step.num ? 'text-primary' : 'text-muted-foreground'
              )}>
                {step.title}
              </span>
            </button>
            {i < STEPS.length - 1 && (
              <div className={cn(
                'flex-1 h-px',
                currentStep > step.num ? 'bg-green-400' : 'bg-border'
              )} />
            )}
          </div>
        ))}
      </div>

      {/* Step content */}
      <div className="bg-card border border-border rounded-2xl p-6">
        <div className="mb-5">
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Etapa {currentStep} de 5
          </span>
          <h2 className="text-lg font-semibold mt-0.5">{STEPS[currentStep - 1].title}</h2>
          <p className="text-sm text-muted-foreground">{STEPS[currentStep - 1].description}</p>
        </div>

        <div className="space-y-4">
          {currentStep === 1 && <Step1 data={data} setData={setData} />}
          {currentStep === 2 && <Step2 data={data} setData={setData} />}
          {currentStep === 3 && <Step3 data={data} setData={setData} toggleTone={toggleTone} />}
          {currentStep === 4 && <Step4 data={data} setData={setData} />}
          {currentStep === 5 && <Step5 data={data} setData={setData} />}
        </div>

        <div className="flex items-center justify-between mt-6 pt-5 border-t border-border">
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
            {saving ? 'Salvando...' : currentStep === 5 ? 'Concluir' : 'Próxima etapa'}
            {!saving && <ArrowRight className="h-3.5 w-3.5" />}
          </button>
        </div>
      </div>
    </div>
  )
}

function Field({ label, children, hint }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="text-sm font-medium">{label}</label>
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
      className="w-full px-3 py-2 border border-input rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring"
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
      className="w-full px-3 py-2 border border-input rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none"
    />
  )
}

function Step1({ data, setData }: any) {
  const set = (key: string) => (v: string) => setData((p: any) => ({ ...p, [key]: v }))
  return (
    <>
      <Field label="Nome da marca *">
        <Input value={data.step1_brand_name} onChange={set('step1_brand_name')} placeholder="Ex: Nexum360" />
      </Field>
      <Field label="Tagline / Slogan">
        <Input value={data.step1_tagline} onChange={set('step1_tagline')} placeholder="Ex: Estratégia que transforma" />
      </Field>
      <Field label="Missão" hint="Por que sua marca existe?">
        <Textarea value={data.step1_mission} onChange={set('step1_mission')} placeholder="Ajudar empresas a crescerem com estratégia digital..." />
      </Field>
      <Field label="Visão" hint="Onde sua marca quer chegar?">
        <Textarea value={data.step1_vision} onChange={set('step1_vision')} placeholder="Ser referência em marketing digital no Brasil..." />
      </Field>
      <Field label="Valores" hint="Separe por vírgula">
        <Input value={data.step1_values} onChange={set('step1_values')} placeholder="Inovação, Transparência, Resultado, Parceria" />
      </Field>
    </>
  )
}

function Step2({ data, setData }: any) {
  const set = (key: string) => (v: string) => setData((p: any) => ({ ...p, [key]: v }))
  return (
    <>
      <Field label="Nome da persona">
        <Input value={data.step2_persona_name} onChange={set('step2_persona_name')} placeholder="Ex: Bruno, o gestor de marketing" />
      </Field>
      <Field label="Descrição do público-alvo">
        <Textarea value={data.step2_target_audience} onChange={set('step2_target_audience')} placeholder="Gestores de marketing de empresas médias, B2B..." />
      </Field>
      <Field label="Faixa etária">
        <Input value={data.step2_age_range} onChange={set('step2_age_range')} placeholder="25-45 anos" />
      </Field>
      <Field label="Interesses" hint="Separe por vírgula">
        <Input value={data.step2_interests} onChange={set('step2_interests')} placeholder="Marketing digital, IA, resultados, liderança" />
      </Field>
      <Field label="Principais dores / problemas" hint="Separe por vírgula">
        <Textarea value={data.step2_pain_points} onChange={set('step2_pain_points')} placeholder="Falta de tempo, dificuldade em medir ROI, equipe pequena" />
      </Field>
    </>
  )
}

function Step3({ data, setData, toggleTone }: any) {
  const set = (key: string) => (v: string) => setData((p: any) => ({ ...p, [key]: v }))
  return (
    <>
      <Field label="Tom de voz" hint="Selecione até 3 tons que representam sua marca">
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
      <Field label="Traços de personalidade" hint="Separe por vírgula">
        <Input value={data.step3_personality_traits} onChange={set('step3_personality_traits')} placeholder="Confiante, direto, acolhedor, inteligente" />
      </Field>
      <Field label="Palavras a EVITAR" hint="Separe por vírgula">
        <Input value={data.step3_avoid_words} onChange={set('step3_avoid_words')} placeholder="obviamente, simplesmente, revolucionário" />
      </Field>
      <Field label="Palavras preferidas" hint="Separe por vírgula">
        <Input value={data.step3_preferred_words} onChange={set('step3_preferred_words')} placeholder="estratégia, resultado, crescimento, impacto" />
      </Field>
    </>
  )
}

function Step4({ data, setData }: any) {
  const set = (key: string) => (v: string) => setData((p: any) => ({ ...p, [key]: v }))
  return (
    <>
      <Field label="Cores principais" hint="Separe por vírgula (hex, nome ou descrição)">
        <Input value={data.step4_primary_colors} onChange={set('step4_primary_colors')} placeholder="#6366f1, azul profundo, branco" />
      </Field>
      <Field label="Estilo tipográfico">
        <select
          value={data.step4_typography_style}
          onChange={e => setData((p: any) => ({ ...p, step4_typography_style: e.target.value }))}
          className="w-full px-3 py-2 border border-input rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        >
          <option value="">Selecionar...</option>
          <option value="moderno-minimalista">Moderno e minimalista</option>
          <option value="classico-elegante">Clássico e elegante</option>
          <option value="bold-impactante">Bold e impactante</option>
          <option value="playful-descontraido">Playful e descontraído</option>
          <option value="tecnico-corporativo">Técnico e corporativo</option>
        </select>
      </Field>
      <Field label="Referências visuais / marcas admiradas" hint="Separe por vírgula">
        <Input value={data.step4_visual_references} onChange={set('step4_visual_references')} placeholder="Apple, Nike, HubSpot" />
      </Field>
      <Field label="Palavras que descrevem a estética" hint="Separe por vírgula">
        <Input value={data.step4_aesthetic_keywords} onChange={set('step4_aesthetic_keywords')} placeholder="limpo, premium, ousado, acolhedor" />
      </Field>
    </>
  )
}

function Step5({ data, setData }: any) {
  const set = (key: string) => (v: string) => setData((p: any) => ({ ...p, [key]: v }))
  return (
    <>
      <Field label="Diferencial competitivo" hint="O que faz sua marca única?">
        <Textarea value={data.step5_differentiators} onChange={set('step5_differentiators')} placeholder="Combinamos estratégia de dados com criatividade humana para..." />
      </Field>
      <Field label="Principais concorrentes" hint="Separe por vírgula">
        <Input value={data.step5_competitors} onChange={set('step5_competitors')} placeholder="Agência X, Empresa Y, Ferramenta Z" />
      </Field>
      <Field label="Posicionamento no mercado">
        <select
          value={data.step5_market_position}
          onChange={e => setData((p: any) => ({ ...p, step5_market_position: e.target.value }))}
          className="w-full px-3 py-2 border border-input rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        >
          <option value="">Selecionar...</option>
          <option value="premium">Premium / Alto valor</option>
          <option value="custo-beneficio">Melhor custo-benefício</option>
          <option value="inovador">Inovador / Disruptivo</option>
          <option value="especialista">Especialista de nicho</option>
          <option value="democratizador">Democratizador</option>
        </select>
      </Field>
      <Field label="Pilares de conteúdo" hint="Principais temas que sua marca aborda (separe por vírgula)">
        <Input value={data.step5_content_pillars} onChange={set('step5_content_pillars')} placeholder="Estratégia, Cases, Educação, Bastidores, Tendências" />
      </Field>
    </>
  )
}
