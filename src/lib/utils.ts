import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(new Date(date))
}

export function formatDateTime(date: string | Date): string {
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date))
}

export function truncate(str: string, length: number): string {
  return str.length > length ? str.slice(0, length) + '...' : str
}

export const STATUS_LABELS: Record<string, string> = {
  ideia: 'Ideia',
  em_desenvolvimento: 'Em desenvolvimento',
  aprovado: 'Aprovado',
  publicado: 'Publicado',
  arquivado: 'Arquivado',
}

export const STATUS_COLORS: Record<string, string> = {
  ideia: 'bg-gray-100 text-gray-700',
  em_desenvolvimento: 'bg-blue-100 text-blue-700',
  aprovado: 'bg-green-100 text-green-700',
  publicado: 'bg-purple-100 text-purple-700',
  arquivado: 'bg-yellow-100 text-yellow-700',
}

export const PRIORITY_LABELS: Record<string, string> = {
  baixa: 'Baixa',
  media: 'Média',
  alta: 'Alta',
  urgente: 'Urgente',
}

export const PRIORITY_COLORS: Record<string, string> = {
  baixa: 'bg-gray-100 text-gray-600',
  media: 'bg-blue-100 text-blue-600',
  alta: 'bg-orange-100 text-orange-600',
  urgente: 'bg-red-100 text-red-600',
}

export const PLATFORM_LABELS: Record<string, string> = {
  instagram: 'Instagram',
  linkedin: 'LinkedIn',
  twitter: 'Twitter/X',
  facebook: 'Facebook',
  tiktok: 'TikTok',
  youtube: 'YouTube',
  newsletter: 'Newsletter',
}

export const FORMAT_LABELS: Record<string, string> = {
  post: 'Post',
  carrossel: 'Carrossel',
  stories: 'Stories',
  reels: 'Reels',
  artigo: 'Artigo',
  thread: 'Thread',
  newsletter: 'Newsletter',
}
