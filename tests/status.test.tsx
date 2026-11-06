import { expect, test } from 'claude-code/testing'

const LIMITS = [
  { kind: 'five_hour', percentUsed: 23.5, resetsAt: '2026-11-06T03:00:00Z' },
  { kind: 'seven_day', percentUsed: 82 },
]

async function run($: any, on: any, language?: string) {
  const lines: string[] = []
  const toasts: string[] = []
  on('ui.status', (_: any, e: any) => { lines.push(JSON.stringify(e)); return { value: undefined } })
  on('ui.toast', (_: any, e: any) => { toasts.push(JSON.stringify(e)); return { value: undefined } })
  on('session.usage', () => ({ value: { startedAt: 0, context: {}, rateLimits: [] } }))
  on('settings.read', () => ({ value: language === undefined ? {} : { language } }))
  on('session.start', (_: any, e: any) => ({ cwd: e.cwd }))
  on('session.measure', (_: any, e: any) => ({ changed: e.changed }))

  await $.session.start({ cwd: '/', surface: 'desktop', isInteractive: true })
  await $.session.measure({ context: {} as any, rateLimits: LIMITS, changed: ['rateLimits'] })
  return { line: lines.at(-1) ?? '', toasts: toasts.join('\n') }
}

test('language zh: Chinese status line and alert', { options: { language: 'zh' } }, async ($, on) => {
  const { line, toasts } = await run($, on, 'english')
  expect(line).toContain('5h ◔ 24% · 周 ◕ 82%')
  expect(toasts).toContain('每周额度已用 82%')
})

test('language en: English status line and alert', { options: { language: 'en' } }, async ($, on) => {
  const { line, toasts } = await run($, on, 'chinese')
  expect(line).toContain('5h ◔ 24% · wk ◕ 82%')
  expect(toasts).toContain('Weekly limit: 82% used')
})

test('auto follows Claude Code language setting: chinese', async ($, on) => {
  const { line } = await run($, on, 'chinese')
  expect(line).toContain('· 周 ◕ 82%')
})

test('auto follows Claude Code language setting: english', async ($, on) => {
  const { line } = await run($, on, 'english')
  expect(line).toContain('· wk ◕ 82%')
})
