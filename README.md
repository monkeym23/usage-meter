# usage-meter: Claude usage limits in your status line

**Know how much of your Claude limit is left without leaving the chat.** usage-meter is a Claude Code plugin that shows your Claude Pro, Max or Team subscription's **5-hour session limit** and **weekly limit** usage right under the prompt, such as `5h ◔ 24% · wk ◕ 82%`, and warns you at 80% and 95%. It works in Claude Code (terminal and desktop app) and Cowork.

- Live usage of the 5-hour and weekly rate limits, refreshed after every turn
- One-character pie gauge (○◔◑◕●), short enough to stay out of the way
- Toast alerts when a limit passes 80% and 95%
- English or Chinese labels, automatic by default
- No setup, no API key, no cookies: it reads the usage Claude Code already reports

Accounts without a subscription (API-only) report no limits, so nothing is shown.

## Install

At the prompt of a Claude Code session:

```
/plugin install usage-meter --marketplace monkeym23/usage-meter
```

Answer `y` to add the marketplace, then pick a scope. From a shell:

```bash
claude plugin install usage-meter --marketplace monkeym23/usage-meter
```

## Language

The labels follow your language. The `language` option (`/config` → usage-meter) takes:

- `auto` (default): Claude Code's `language` setting first, then the system language; English when neither is Chinese.
- `zh`: Chinese, such as `5h ◔ 24% · 周 ◕ 82%`.
- `en`: English, such as `5h ◔ 24% · wk ◕ 82%`.

## 中文说明

**不离开对话，就知道 Claude 额度还剩多少。** 这是一个 Claude Code 插件，适用于 Claude Pro、Max、Team 订阅，在 Claude Code（终端和桌面 App）和 Cowork 里都能用。

在输入框下方的状态行显示 Claude 订阅的用量：5 小时额度和每周额度的已用百分比，带一个单字符的圆形进度（○◔◑◕●），例如 `5h ◔ 24% · 周 ◕ 82%`。每轮对话后自动更新，用到 80% 和 95% 时弹出提醒。不打开侧边面板，不需要配置。非订阅账号（例如纯 API）没有额度数据，不会显示。

安装：在 Claude Code 输入框里输入 `/plugin install usage-meter --marketplace monkeym23/usage-meter`，按 `y` 添加插件市场，再选安装范围。

显示语言由 `language` 选项决定（`/config` → usage-meter）：`auto`（默认，先看 Claude Code 的 `language` 设置，再看系统语言）、`zh`（中文）、`en`（英文）。

## License

MIT
