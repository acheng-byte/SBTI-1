import { calcDimensionScores, scoresToLevels, determineResult } from './engine.js'
import { createQuiz } from './quiz.js'
import { renderResult } from './result.js'
import { saveHistory, loadHistory, clearHistory } from './history.js'
import './style.css'

const THEMES = {
  original: {
    icon: '🧠',
    name: '原版测试',
    desc: '27种经典人格，看看你是哪一个',
    color: 'original',
    path: 'original',
  },
  love: {
    icon: '🌹',
    name: '恋爱版',
    desc: '15维恋爱人格测试，30道题，测测你在感情里是什么样的人',
    color: 'love',
    path: 'love',
  },
  work: {
    icon: '💼',
    name: '职场版',
    desc: '15维职场人格测试，30道题，测测你在职场里是哪种人',
    color: 'work',
    path: 'work',
  },
}

let currentTheme = null
let currentQuiz = null
let lastResult = null

async function loadThemeData(themeKey) {
  const theme = THEMES[themeKey]
  const base = `/themes/${theme.path}/`
  const [questions, dimensions, types, config] = await Promise.all([
    fetch(base + 'questions.json').then((r) => r.json()),
    fetch(base + 'dimensions.json').then((r) => r.json()),
    fetch(base + 'types.json').then((r) => r.json()),
    fetch(base + 'config.json').then((r) => r.json()),
  ])
  return { questions, dimensions, types, config }
}

const pages = {}
function registerPages() {
  ;['home', 'history', 'intro', 'quiz', 'result'].forEach((id) => {
    pages[id] = document.getElementById('page-' + id)
  })
}

function showPage(name) {
  Object.values(pages).forEach((p) => p.classList.remove('active'))
  pages[name].classList.add('active')
  window.scrollTo(0, 0)
  // Apply theme color class to body
  document.body.className = currentTheme ? 'theme-' + currentTheme : ''
}

function applyThemeStyles(themeKey) {
  document.body.className = 'theme-' + themeKey
}

async function startTheme(themeKey) {
  currentTheme = themeKey
  applyThemeStyles(themeKey)

  const theme = THEMES[themeKey]
  document.getElementById('intro-icon').textContent = theme.icon
  document.getElementById('intro-title').textContent = theme.name
  document.getElementById('intro-desc').textContent = theme.desc
  showPage('intro')

  const data = await loadThemeData(themeKey)

  function onQuizComplete(answers, isDrunk, specialTrigger) {
    const scores = calcDimensionScores(answers, data.questions.main)
    const levels = scoresToLevels(scores, data.config.scoring.levelThresholds)
    const result = determineResult(
      levels,
      data.dimensions.order,
      data.types.standard,
      data.types.special || [],
      { isDrunk, specialTrigger }
    )
    lastResult = { result, levels, themeKey, themeName: theme.name, themeIcon: theme.icon, timestamp: Date.now() }
    saveHistory(lastResult)
    renderResult(result, levels, data.dimensions.order, data.dimensions.definitions, data.config, theme)
    showPage('result')
  }

  currentQuiz = createQuiz(data.questions, data.config, onQuizComplete)

  document.getElementById('quiz-theme-label').textContent = theme.icon + ' ' + theme.name

  document.getElementById('btn-start').onclick = () => {
    currentQuiz.start()
    showPage('quiz')
  }
  document.getElementById('btn-restart').onclick = () => {
    currentQuiz.start()
    showPage('quiz')
  }
}

function renderHistoryPage() {
  const list = loadHistory()
  const el = document.getElementById('history-list')
  const empty = document.getElementById('history-empty')

  if (!list.length) {
    el.innerHTML = ''
    empty.style.display = 'block'
    return
  }
  empty.style.display = 'none'
  el.innerHTML = list
    .slice()
    .reverse()
    .map(
      (item, i) => `
    <div class="history-item" data-index="${list.length - 1 - i}">
      <div class="history-meta">
        <span class="history-theme">${item.themeIcon || ''} ${item.themeName || '未知主题'}</span>
        <span class="history-time">${formatTime(item.timestamp)}</span>
      </div>
      <div class="history-result">
        <span class="history-code">${item.result?.primary?.code || '?'}</span>
        <span class="history-name">${item.result?.primary?.cn || ''}</span>
        <span class="history-sim">${item.result?.primary?.similarity || 0}%</span>
      </div>
    </div>
  `
    )
    .join('')
}

function formatTime(ts) {
  const d = new Date(ts)
  return `${d.getMonth() + 1}/${d.getDate()} ${d.getHours()}:${String(d.getMinutes()).padStart(2, '0')}`
}

function init() {
  registerPages()

  // 主题选择
  document.querySelectorAll('.theme-card').forEach((card) => {
    card.addEventListener('click', () => {
      startTheme(card.dataset.theme)
    })
  })

  // 历史记录
  document.getElementById('btn-history').addEventListener('click', () => {
    renderHistoryPage()
    showPage('history')
  })
  document.getElementById('btn-history-back').addEventListener('click', () => showPage('home'))
  document.getElementById('btn-clear-history').addEventListener('click', () => {
    if (confirm('确定清空所有历史记录？')) {
      clearHistory()
      renderHistoryPage()
    }
  })

  // 返回首页
  document.getElementById('btn-intro-back').addEventListener('click', () => {
    currentTheme = null
    document.body.className = ''
    showPage('home')
  })
  document.getElementById('btn-home').addEventListener('click', () => {
    currentTheme = null
    document.body.className = ''
    showPage('home')
  })

  // 分享图
  document.getElementById('btn-share').addEventListener('click', async () => {
    if (!lastResult) return
    const { generateShareImage } = await import('./share.js')
    const preview = document.getElementById('share-preview')
    const canvas = document.getElementById('share-canvas')
    generateShareImage(canvas, lastResult)
    preview.style.display = 'block'
    preview.scrollIntoView({ behavior: 'smooth' })
  })

  document.getElementById('btn-download').addEventListener('click', () => {
    const canvas = document.getElementById('share-canvas')
    const a = document.createElement('a')
    a.download = `SBTI-${lastResult?.result?.primary?.code || 'result'}.png`
    a.href = canvas.toDataURL('image/png')
    a.click()
  })

  // 双人对比
  document.getElementById('btn-compare').addEventListener('click', () => {
    const sec = document.getElementById('compare-section')
    sec.style.display = sec.style.display === 'none' ? 'block' : 'none'
    if (sec.style.display === 'block') sec.scrollIntoView({ behavior: 'smooth' })
  })

  document.getElementById('btn-compare-go').addEventListener('click', async () => {
    const input = document.getElementById('compare-code-input').value.trim().toUpperCase()
    if (!input) return
    const { analyzeCompat } = await import('./compare.js')
    const myCode = lastResult?.result?.primary?.code || ''
    const resultEl = document.getElementById('compare-result')
    resultEl.style.display = 'block'
    resultEl.innerHTML = analyzeCompat(myCode, input, lastResult?.themeKey || 'original')
    resultEl.scrollIntoView({ behavior: 'smooth' })
  })
}

init()
