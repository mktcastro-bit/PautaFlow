// Catálogo curado de ícones disponíveis para uso como elementos visuais
// dentro do card. As chaves são serializadas no `EditorState.elements`
// (CardElement.type='icon'), então NUNCA renomeie uma chave sem migração.
// Sempre adicione novos ícones com chave nova e mantenha as antigas.

import {
  ArrowRight, ArrowUpRight, ArrowDownRight,
  Sparkles, Star, Heart, Flame, Zap,
  MessageCircle, Megaphone, Mail, Quote,
  TrendingUp, BarChart3, PieChart, LineChart,
  Lightbulb, Target, Rocket, Award, Crown, Trophy,
  Check, CheckCircle, AlertTriangle, Info,
  User, Users, Bookmark, Tag,
  type LucideIcon,
} from 'lucide-react'

export const ELEMENT_ICONS: Record<string, { Icon: LucideIcon; label: string }> = {
  'arrow-right':       { Icon: ArrowRight,       label: 'Seta direita' },
  'arrow-up-right':    { Icon: ArrowUpRight,     label: 'Seta diagonal' },
  'arrow-down-right':  { Icon: ArrowDownRight,   label: 'Seta declínio' },
  'sparkles':          { Icon: Sparkles,         label: 'Faíscas' },
  'star':              { Icon: Star,             label: 'Estrela' },
  'heart':             { Icon: Heart,            label: 'Coração' },
  'flame':             { Icon: Flame,            label: 'Chama' },
  'zap':               { Icon: Zap,              label: 'Raio' },
  'message':           { Icon: MessageCircle,    label: 'Mensagem' },
  'megaphone':         { Icon: Megaphone,        label: 'Megafone' },
  'mail':              { Icon: Mail,             label: 'E-mail' },
  'quote':             { Icon: Quote,            label: 'Aspas' },
  'trending-up':       { Icon: TrendingUp,       label: 'Crescimento' },
  'bar-chart':         { Icon: BarChart3,        label: 'Gráfico barras' },
  'pie-chart':         { Icon: PieChart,         label: 'Gráfico pizza' },
  'line-chart':        { Icon: LineChart,        label: 'Gráfico linha' },
  'lightbulb':         { Icon: Lightbulb,        label: 'Lâmpada' },
  'target':            { Icon: Target,           label: 'Alvo' },
  'rocket':            { Icon: Rocket,           label: 'Foguete' },
  'award':             { Icon: Award,            label: 'Medalha' },
  'crown':             { Icon: Crown,            label: 'Coroa' },
  'trophy':            { Icon: Trophy,           label: 'Troféu' },
  'check':             { Icon: Check,            label: 'Check' },
  'check-circle':      { Icon: CheckCircle,      label: 'Check círculo' },
  'alert':             { Icon: AlertTriangle,    label: 'Alerta' },
  'info':              { Icon: Info,             label: 'Info' },
  'user':              { Icon: User,             label: 'Pessoa' },
  'users':             { Icon: Users,            label: 'Grupo' },
  'bookmark':          { Icon: Bookmark,         label: 'Marcador' },
  'tag':               { Icon: Tag,              label: 'Etiqueta' },
}

export type ElementIconKey = keyof typeof ELEMENT_ICONS
