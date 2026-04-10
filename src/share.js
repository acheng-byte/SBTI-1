/**
 * 生成分享图片 — 纯 Canvas 绘制，无外部依赖
 * 支持多主题配色
 */

const LEVEL_NUM = { L: 1, M: 2, H: 3 }
const LEVEL_LABEL = { L: '低', M: '中', H: '高' }

const THEME_COLORS = {
  original: { bg: '#f0f4f1', card: '#ffffff', accent: '#4c6752', accentLight: '#e8f0ea', text: '#2c3e2d', textSec: '#6b7b6e' },
  love:     { bg: '#fff0f3', card: '#ffffff', accent: '#c0304a', accentLight: '#fde8ed', text: '#3d1a22', textSec: '#8a5060' },
  work:     { bg: '#f0f4ff', card: '#ffffff', accent: '#2d5be3', accentLight: '#e8edff', text: '#1a2340', textSec: '#5060a0' },
}

/**
 * 新接口：generateShareImage(canvas, lastResult)
 * 旧接口兼容：generateShareImage(primary, userLevels, dimOrder, dimDefs, mode)
 */
export async function generateShareImage(canvasOrPrimary, resultOrUserLevels, dimOrderOrUndef, dimDefsOrUndef, modeOrUndef) {
  // 判断新旧接口
  if (canvasOrPrimary && canvasOrPrimary.tagName === 'CANVAS') {
    // 新接口
    const canvas = canvasOrPrimary
    const { result, levels: userLevels, themeKey } = resultOrUserLevels
    const primary = result?.primary || {}
    const mode = result?.mode || 'normal'
    const themeIcon = resultOrUserLevels.themeIcon || ''
    const themeName = resultOrUserLevels.themeName || 'SBTI'
    _drawToCanvas(canvas, primary, userLevels, [], {}, mode, themeKey || 'original', themeName, themeIcon)
    return
  }
  // 旧接口回退
  const primary = canvasOrPrimary
  const userLevels = resultOrUserLevels
  const dimOrder = dimOrderOrUndef || []
  const dimDefs = dimDefsOrUndef || {}
  const mode = modeOrUndef || 'normal'
  const dpr = 2
  const W = 720
  const H = 1280
  const canvas = document.createElement('canvas')
  canvas.width = W * dpr
  canvas.height = H * dpr
  const ctx = canvas.getContext('2d')
  ctx.scale(dpr, dpr)
  _drawContent(ctx, W, H, primary, userLevels, dimOrder, dimDefs, mode, THEME_COLORS.original, '', 'SBTI')
  const link = document.createElement('a')
  link.download = `SBTI-${primary.code}.png`
  link.href = canvas.toDataURL('image/png')
  link.click()
  return
}

function _drawToCanvas(canvas, primary, userLevels, dimOrder, dimDefs, mode, themeKey, themeName, themeIcon) {
  const dpr = 2
  const W = 720
  const H = 1100
  canvas.width = W * dpr
  canvas.height = H * dpr
  canvas.style.width = Math.min(W, window.innerWidth - 40) + 'px'
  canvas.style.height = 'auto'
  const ctx = canvas.getContext('2d')
  ctx.scale(dpr, dpr)
  const colors = THEME_COLORS[themeKey] || THEME_COLORS.original
  _drawContent(ctx, W, H, primary, userLevels, dimOrder, dimDefs, mode, colors, themeIcon, themeName)
}

function _drawContent(ctx, W, H, primary, userLevels, dimOrder, dimDefs, mode, colors, themeIcon, themeName) {

  // 背景
  ctx.fillStyle = colors.bg
  ctx.fillRect(0, 0, W, H)

  // 顶部色条
  ctx.fillStyle = colors.accent
  ctx.fillRect(0, 0, W, 8)

  // 卡片白底
  const cardX = 32, cardY = 32, cardW = W - 64, cardH = H - 64
  roundRect(ctx, cardX, cardY, cardW, cardH, 20)
  ctx.fillStyle = colors.card
  ctx.shadowColor = 'rgba(0,0,0,0.07)'
  ctx.shadowBlur = 24
  ctx.fill()
  ctx.shadowBlur = 0

  let y = cardY + 52

  // 主题标签
  ctx.textAlign = 'center'
  ctx.font = '600 16px system-ui, "PingFang SC", "Microsoft YaHei", sans-serif'
  ctx.fillStyle = colors.accent + '99'
  ctx.fillText(`${themeIcon} ${themeName}`, W / 2, y)
  y += 36

  // Kicker
  ctx.font = '400 20px system-ui, "PingFang SC", "Microsoft YaHei", sans-serif'
  ctx.fillStyle = colors.textSec
  const kickerText = mode === 'drunk' ? '隐藏人格已激活' : mode === 'fallback' ? '系统强制兜底' : '你的主类型'
  ctx.fillText(kickerText, W / 2, y)
  y += 56

  // 类型代码
  ctx.font = '900 72px system-ui, "PingFang SC", "Microsoft YaHei", sans-serif'
  ctx.fillStyle = colors.accent
  ctx.fillText(primary.code || '???', W / 2, y)
  y += 44

  // 中文名
  ctx.font = '600 30px system-ui, "PingFang SC", "Microsoft YaHei", sans-serif'
  ctx.fillStyle = colors.text
  ctx.fillText(primary.cn || '', W / 2, y)
  y += 36

  // 匹配度徽章
  const badgeText = `匹配度 ${primary.similarity || 0}%` + (primary.exact != null ? ` · 精准命中 ${primary.exact}/15 维` : '')
  ctx.font = '500 18px system-ui, "PingFang SC", "Microsoft YaHei", sans-serif'
  const badgeW = ctx.measureText(badgeText).width + 40
  roundRect(ctx, (W - badgeW) / 2, y - 16, badgeW, 34, 17)
  ctx.fillStyle = colors.accentLight
  ctx.fill()
  ctx.fillStyle = colors.accent
  ctx.fillText(badgeText, W / 2, y + 4)
  y += 44

  // 分割线
  ctx.strokeStyle = colors.accent + '20'
  ctx.lineWidth = 1
  ctx.beginPath(); ctx.moveTo(cardX + 48, y); ctx.lineTo(cardX + cardW - 48, y); ctx.stroke()
  y += 28

  // Intro
  ctx.font = 'italic 600 20px system-ui, "PingFang SC", "Microsoft YaHei", sans-serif'
  ctx.fillStyle = colors.text
  const introLines = wrapText(ctx, `"${primary.intro || ''}"`, cardW - 80)
  for (const line of introLines) {
    ctx.fillText(line, W / 2, y)
    y += 28
  }
  y += 20

  // 底部水印
  ctx.textAlign = 'center'
  ctx.font = '400 16px system-ui, "PingFang SC", "Microsoft YaHei", sans-serif'
  ctx.fillStyle = colors.accent + '50'
  ctx.fillText('SBTI 人格测试 · MBTI已经过时，SBTI来了 · 仅供娱乐', W / 2, H - cardY - 24)
}

/**
 * 在分享图上绘制雷达图
 */
function drawShareRadar(ctx, cx, cy, maxR, userLevels, dimOrder, dimDefs) {
  const n = dimOrder.length
  const step = (Math.PI * 2) / n
  const start = -Math.PI / 2

  // 背景圆环
  for (let lv = 3; lv >= 1; lv--) {
    const r = (lv / 3) * maxR
    ctx.beginPath()
    ctx.arc(cx, cy, r, 0, Math.PI * 2)
    ctx.fillStyle = lv === 3 ? 'rgba(76,103,82,0.06)' : lv === 2 ? 'rgba(76,103,82,0.04)' : 'rgba(76,103,82,0.02)'
    ctx.fill()
    ctx.strokeStyle = 'rgba(76,103,82,0.12)'
    ctx.lineWidth = 0.5
    ctx.stroke()
  }

  // 轴线 + 标签
  ctx.font = '400 12px system-ui, "PingFang SC", "Microsoft YaHei", sans-serif'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'

  for (let i = 0; i < n; i++) {
    const angle = start + i * step
    const x = cx + Math.cos(angle) * maxR
    const y = cy + Math.sin(angle) * maxR
    ctx.beginPath()
    ctx.moveTo(cx, cy)
    ctx.lineTo(x, y)
    ctx.strokeStyle = 'rgba(76,103,82,0.1)'
    ctx.lineWidth = 0.5
    ctx.stroke()

    const lr = maxR + 24
    const lx = cx + Math.cos(angle) * lr
    const ly = cy + Math.sin(angle) * lr
    const label = (dimDefs[dimOrder[i]]?.name || dimOrder[i]).replace(/^[A-Za-z0-9]+\s*/, '')
    ctx.fillStyle = '#6b7b6e'
    ctx.fillText(label, lx, ly)
  }

  // 数据多边形
  const values = dimOrder.map((d) => LEVEL_NUM[userLevels[d]] || 2)
  ctx.beginPath()
  for (let i = 0; i < n; i++) {
    const angle = start + i * step
    const r = (values[i] / 3) * maxR
    const x = cx + Math.cos(angle) * r
    const y = cy + Math.sin(angle) * r
    if (i === 0) ctx.moveTo(x, y)
    else ctx.lineTo(x, y)
  }
  ctx.closePath()
  ctx.fillStyle = 'rgba(76,103,82,0.2)'
  ctx.fill()
  ctx.strokeStyle = 'rgba(76,103,82,0.6)'
  ctx.lineWidth = 2
  ctx.stroke()

  // 数据点
  for (let i = 0; i < n; i++) {
    const angle = start + i * step
    const r = (values[i] / 3) * maxR
    const x = cx + Math.cos(angle) * r
    const y = cy + Math.sin(angle) * r
    ctx.beginPath()
    ctx.arc(x, y, 3, 0, Math.PI * 2)
    ctx.fillStyle = '#4c6752'
    ctx.fill()
  }
}

/**
 * 圆角矩形
 */
function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.lineTo(x + w - r, y)
  ctx.quadraticCurveTo(x + w, y, x + w, y + r)
  ctx.lineTo(x + w, y + h - r)
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h)
  ctx.lineTo(x + r, y + h)
  ctx.quadraticCurveTo(x, y + h, x, y + h - r)
  ctx.lineTo(x, y + r)
  ctx.quadraticCurveTo(x, y, x + r, y)
  ctx.closePath()
}

/**
 * 文字自动换行
 */
function wrapText(ctx, text, maxWidth) {
  if (!text) return []
  const lines = []
  let line = ''
  for (const char of text) {
    const test = line + char
    if (ctx.measureText(test).width > maxWidth && line) {
      lines.push(line)
      line = char
    } else {
      line = test
    }
  }
  if (line) lines.push(line)
  return lines
}
