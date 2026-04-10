/**
 * 双人人格对比分析
 */

const COMPAT = {
  // 恋爱版兼容性矩阵（简化版）
  love: {
    'SAFE-R':      { 'RED-FLAG': 40, 'SAFE-R': 95, 'GHOST-ER': 30, 'LOVE-BOMB': 55, 'TWIN-FLAME': 85, 'SOLO-STAR': 70, 'HEALER': 90, 'CHASE-R': 45, 'MIRROR': 75, 'WALLS-UP': 60, 'DRAMA-Q': 50, 'ZEN-LOVER': 80, 'FIXER': 75, 'COOL-X': 65, 'BESTIE-LOVER': 85, 'POET-HEART': 80 },
    'RED-FLAG':    { 'RED-FLAG': 35, 'SAFE-R': 40, 'GHOST-ER': 55, 'LOVE-BOMB': 60, 'TWIN-FLAME': 70, 'SOLO-STAR': 65, 'HEALER': 50, 'CHASE-R': 75, 'MIRROR': 60, 'WALLS-UP': 45, 'DRAMA-Q': 65, 'ZEN-LOVER': 55, 'FIXER': 40, 'COOL-X': 70, 'BESTIE-LOVER': 60, 'POET-HEART': 55 },
    'TWIN-FLAME':  { 'TWIN-FLAME': 65, 'SAFE-R': 85, 'RED-FLAG': 70, 'GHOST-ER': 35, 'LOVE-BOMB': 60, 'SOLO-STAR': 55, 'HEALER': 80, 'CHASE-R': 50, 'MIRROR': 70, 'WALLS-UP': 55, 'DRAMA-Q': 75, 'ZEN-LOVER': 60, 'FIXER': 70, 'COOL-X': 55, 'BESTIE-LOVER': 75, 'POET-HEART': 85 },
    'HEALER':      { 'HEALER': 75, 'SAFE-R': 90, 'RED-FLAG': 50, 'GHOST-ER': 40, 'TWIN-FLAME': 80, 'SOLO-STAR': 70, 'WALLS-UP': 70, 'ZEN-LOVER': 75, 'FIXER': 65, 'BESTIE-LOVER': 80, 'POET-HEART': 75, 'DRAMA-Q': 55, 'COOL-X': 60, 'MIRROR': 65, 'CHASE-R': 45, 'LOVE-BOMB': 55 },
  },
  // 职场版兼容性
  work: {
    'CTRL-ALT':    { 'CTRL-ALT': 70, 'HUSTLER': 85, 'STRATEGIST': 90, 'DETAIL-GOD': 80, 'LONE-WOLF': 65, 'SMOOTH-OP': 85, 'MENTOR-MOD': 80, 'SLOW-BURN': 70, 'LADDER': 75, 'YES-MAN': 80, 'GHOST-WRK': 50, 'SYSTEM-ERR': 45, 'GLITCH': 70, 'VIBE-MGR': 80, 'BURNOUT': 40 },
    'STRATEGIST':  { 'STRATEGIST': 65, 'CTRL-ALT': 90, 'HUSTLER': 80, 'DETAIL-GOD': 75, 'SMOOTH-OP': 85, 'LADDER': 85, 'MENTOR-MOD': 75, 'LONE-WOLF': 70, 'GLITCH': 75, 'SLOW-BURN': 70, 'VIBE-MGR': 75, 'YES-MAN': 65, 'GHOST-WRK': 55, 'SYSTEM-ERR': 40, 'BURNOUT': 35 },
    'HUSTLER':     { 'HUSTLER': 60, 'CTRL-ALT': 85, 'STRATEGIST': 80, 'DETAIL-GOD': 70, 'SMOOTH-OP': 75, 'LADDER': 80, 'LONE-WOLF': 65, 'GLITCH': 70, 'MENTOR-MOD': 70, 'SLOW-BURN': 60, 'VIBE-MGR': 75, 'YES-MAN': 70, 'GHOST-WRK': 45, 'SYSTEM-ERR': 40, 'BURNOUT': 30 },
  },
}

const COMPAT_COMMENT = {
  '90-100': ['天作之合，配合得像一个人在运行', '这是命运给你们的礼物，别浪费', '一万人里才能遇到这种搭配'],
  '75-89':  ['很好的搭配，互补大于摩擦', '在一起会让彼此都变得更好', '有点默契，有点互补，有点好玩'],
  '60-74':  ['不错，需要一点磨合，但磨完会很顺', '双方都懂得让步的话，很稳', '有共鸣的地方，也有需要理解的地方'],
  '40-59':  ['差异明显，但差异不是问题，不理解才是', '需要一定的耐心，但可以做到', '挑战存在，但挑战也是成长机会'],
  '0-39':   ['容易产生根本性的误解，需要付出更多', '不是不行，是要做好心理准备', '两个极端的相遇，刺激但也消耗'],
}

function getCompatScore(myCode, partnerCode, themeKey) {
  const matrix = COMPAT[themeKey]
  if (!matrix) return defaultCompat(myCode, partnerCode)
  const myRow = matrix[myCode]
  if (myRow && myRow[partnerCode] != null) return myRow[partnerCode]
  const partnerRow = matrix[partnerCode]
  if (partnerRow && partnerRow[myCode] != null) return partnerRow[myCode]
  return defaultCompat(myCode, partnerCode)
}

function defaultCompat(codeA, codeB) {
  // 用字符哈希生成一个伪随机但固定的兼容性分数
  let hash = 0
  const str = [codeA, codeB].sort().join('-')
  for (let i = 0; i < str.length; i++) hash = (hash * 31 + str.charCodeAt(i)) & 0xffffffff
  return 40 + Math.abs(hash % 50)
}

function getComment(score) {
  if (score >= 90) return rand(COMPAT_COMMENT['90-100'])
  if (score >= 75) return rand(COMPAT_COMMENT['75-89'])
  if (score >= 60) return rand(COMPAT_COMMENT['60-74'])
  if (score >= 40) return rand(COMPAT_COMMENT['40-59'])
  return rand(COMPAT_COMMENT['0-39'])
}

function rand(arr) {
  return arr[Math.floor(Math.random() * arr.length)]
}

export function analyzeCompat(myCode, partnerCode, themeKey) {
  if (!partnerCode) return '<p class="compare-hint">请输入对方的人格代码</p>'

  const score = getCompatScore(myCode.toUpperCase(), partnerCode.toUpperCase(), themeKey)
  const comment = getComment(score)
  const color = score >= 75 ? '#2d7a4a' : score >= 55 ? '#b8860b' : '#c0304a'
  const emoji = score >= 75 ? '✨' : score >= 55 ? '🤔' : '⚡'

  return `
    <div class="compare-result-card">
      <div class="compare-codes">
        <span class="compare-code-tag">${myCode}</span>
        <span class="compare-vs">vs</span>
        <span class="compare-code-tag">${partnerCode}</span>
      </div>
      <div class="compare-score-ring" style="--score-color:${color}">
        <span class="compare-score-num">${score}</span>
        <span class="compare-score-label">兼容度</span>
      </div>
      <p class="compare-comment">${emoji} ${comment}</p>
      <p class="compare-note">兼容度分析基于人格特征推算，仅供参考娱乐</p>
    </div>
  `
}
