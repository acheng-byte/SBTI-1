/**
 * SBTI 证书编号生成器
 *
 * 格式：{PREFIX}-{YYYYMMDD}-{6位随机大写字母数字}
 *   恋爱版前缀：L
 *   职场版前缀：W
 *   原版前缀：  O
 *
 * 编号一经生成即唯一确定，存入历史记录后不可更改。
 * 恋爱和职场编号相互独立，不共享序列。
 */

const THEME_PREFIX = {
  love:     'L',
  work:     'W',
  original: 'O',
}

const CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'  // 去掉易混淆的 0/O/1/I

/**
 * 生成一个唯一证书编号
 * @param {string} themeKey - 'love' | 'work' | 'original'
 * @returns {string} 如 "L-20260410-A7F3K2"
 */
export function generateCertId(themeKey) {
  const prefix = THEME_PREFIX[themeKey] || 'X'

  // 当前日期 YYYYMMDD
  const now = new Date()
  const y = now.getFullYear()
  const m = String(now.getMonth() + 1).padStart(2, '0')
  const d = String(now.getDate()).padStart(2, '0')
  const dateStr = `${y}${m}${d}`

  // 6位随机字符（crypto.getRandomValues 保证随机性）
  const bytes = new Uint8Array(6)
  crypto.getRandomValues(bytes)
  const rand = Array.from(bytes).map((b) => CHARS[b % CHARS.length]).join('')

  return `${prefix}-${dateStr}-${rand}`
}
