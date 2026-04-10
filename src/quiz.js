import { shuffle, insertAtRandom, insertAfter } from './utils.js'

/**
 * 答题控制器
 * 支持原版 drinkGate 和新版 specialGate 两种彩蛋机制
 */
export function createQuiz(questions, config, onComplete) {
  // --- 原版酒鬼彩蛋 ---
  const hasDrinkGate = !!(config.drinkGate?.questionId)
  const drinkGateQ1 = hasDrinkGate
    ? (questions.special || []).find((q) => q.id === config.drinkGate.questionId) || null
    : null
  const drinkGateQ2 = hasDrinkGate
    ? (questions.special || []).find((q) => q.id === 'drink_gate_q2') || null
    : null

  // --- 新版特殊门 (love/work) ---
  const hasSpecialGate = !!(config.specialGate?.questionId)
  const specialGateQ = hasSpecialGate
    ? (questions.special || []).find((q) => q.id === config.specialGate.questionId) || null
    : null

  function buildQueue() {
    const shuffled = shuffle(questions.main)
    if (hasDrinkGate && drinkGateQ1) return insertAtRandom(shuffled, drinkGateQ1)
    if (hasSpecialGate && specialGateQ) return insertAtRandom(shuffled, specialGateQ)
    return shuffled
  }

  let queue = buildQueue()
  let current = 0
  let answers = {}
  let isDrunk = false
  let specialTrigger = null

  const els = {
    fill: document.getElementById('progress-fill'),
    text: document.getElementById('progress-text'),
    qText: document.getElementById('question-text'),
    options: document.getElementById('options'),
  }

  function totalCount() { return queue.length }

  function updateProgress() {
    const pct = (current / totalCount()) * 100
    els.fill.style.width = pct + '%'
    els.text.textContent = `${current} / ${totalCount()}`
  }

  function renderQuestion() {
    const q = queue[current]
    els.qText.textContent = q.text
    els.options.innerHTML = ''
    q.options.forEach((opt) => {
      const btn = document.createElement('button')
      btn.className = 'btn btn-option'
      btn.textContent = opt.label
      btn.addEventListener('click', () => selectOption(q, opt))
      els.options.appendChild(btn)
    })
    updateProgress()
  }

  function selectOption(question, option) {
    answers[question.id] = option.value

    // 原版酒鬼门
    if (hasDrinkGate) {
      if (question.id === config.drinkGate.questionId && option.value === config.drinkGate.triggerValue) {
        if (drinkGateQ2) queue = insertAfter(queue, question.id, drinkGateQ2)
      }
      if (question.id === 'drink_gate_q2' && option.value === config.drinkGate.drunkTriggerValue) {
        isDrunk = true
      }
    }

    // 新版特殊门 (love/work)
    if (hasSpecialGate && question.id === config.specialGate.questionId) {
      const triggerValues = config.specialGate.triggerValues || []
      if (triggerValues.includes(String(option.value))) {
        specialTrigger = config.specialGate.triggerCode
      }
    }

    current++
    if (current >= totalCount()) {
      onComplete(answers, isDrunk, specialTrigger)
    } else {
      renderQuestion()
    }
  }

  function start() {
    current = 0
    answers = {}
    isDrunk = false
    specialTrigger = null
    queue = buildQueue()
    renderQuestion()
  }

  return { start, renderQuestion }
}
