import { atom, read, update } from 'claude-code'
import type { EngineInterface, Register } from 'claude-code'

import type { Limit } from '../types'

const limits = atom({ plugin: 'usage-meter', key: 'limits' } as const, [] as Limit[], { shape: 'limits-1' })
const warned = atom({ plugin: 'usage-meter', key: 'warned' } as const, [] as string[], { shape: 'warned-1' })

type Lang = 'zh' | 'en'

const TEXT: Record<Lang, {
  short: Record<string, string>
  name: Record<string, string>
  toast: (name: string, pct: number) => string
}> = {
  zh: {
    short: { five_hour: '5h', seven_day: '周', spend_limit: '消费' },
    name: { five_hour: '5 小时额度', seven_day: '每周额度', spend_limit: '消费上限' },
    toast: (name, pct) => `${name}已用 ${pct}%`,
  },
  en: {
    short: { five_hour: '5h', seven_day: 'wk', spend_limit: 'spend' },
    name: { five_hour: '5-hour limit', seven_day: 'Weekly limit', spend_limit: 'Spend limit' },
    toast: (name, pct) => `${name}: ${pct}% used`,
  },
}

const PIE = ['○', '◔', '◑', '◕', '●']

function pie(pct: number): string {
  return PIE[Math.round((Math.max(0, Math.min(100, pct)) / 100) * 4)] ?? '●'
}

function fromTag(tag: unknown): Lang | undefined {
  if (typeof tag !== 'string' || !tag.trim()) return undefined
  return /^(zh|chinese|中文|简体|繁體|繁体)/i.test(tag.trim()) ? 'zh' : 'en'
}

// 选择顺序：插件设置里手动指定 → Claude Code 的 language 设置 → 系统语言 → 英文。
async function resolveLang($: EngineInterface, choice: unknown): Promise<Lang> {
  if (choice === 'zh' || choice === 'en') return choice
  try {
    const fromSettings = fromTag(await $.settings.read({ key: 'language' }))
    if (fromSettings) return fromSettings
  } catch {}
  try {
    const fromSystem = fromTag(Intl.DateTimeFormat().resolvedOptions().locale)
    if (fromSystem) return fromSystem
  } catch {}
  return 'en'
}

async function refresh($: EngineInterface, list: Limit[], lang: Lang) {
  const t = TEXT[lang]
  await update($, limits, () => list)
  const line = list.map(l => `${t.short[l.kind] ?? l.kind} ${pie(l.percentUsed)} ${Math.round(l.percentUsed)}%`).join(' · ')
  $.ui.status(line || undefined)
  for (const l of list) {
    for (const step of [80, 95]) {
      const key = `${l.kind}:${step}:${l.resetsAt ?? ''}`
      if (l.percentUsed >= step && !(await read($, warned)).includes(key)) {
        await update($, warned, w => [...w, key].slice(-50))
        $.ui.toast(t.toast(t.name[l.kind] ?? l.kind, Math.round(l.percentUsed)))
      }
    }
  }
}

let lang: Lang | undefined

export const register: Register = (on, options) => {
  lang = undefined

  on('session.start', async ($, e, next) => {
    lang = await resolveLang($, options.language)
    const u = await $.session.usage()
    if (u.rateLimits.length) await refresh($, u.rateLimits, lang)
    return next(e)
  })

  on('session.measure', async ($, e, next) => {
    if (e.changed.includes('rateLimits')) {
      lang ??= await resolveLang($, options.language)
      await refresh($, e.rateLimits, lang)
    }
    return next(e)
  })
}
