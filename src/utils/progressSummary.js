/**
 * 项目进展自动总结 - 演示模板引擎（无真实 LLM）
 * 输入：统计区间内的进展记录（normal 手动汇报 / system 系统事件 / decision 决策节点）
 * 输出：四段式结构化汇报文本。
 * 说明：真实大模型接入时，仅需替换本模块的 generateSummary 实现，保持入参/出参即可。
 */
import { toDate } from './projectStats'

const RISK_WORDS = ['待', '尚未', '滞后', '卡点', '协调', '困难', '受阻', '未落实', '待解决', '存在问题']

const pad = (n) => String(n).padStart(2, '0')

export function monthLabel(ym) {
  if (!ym) return ''
  const [y, m] = ym.split('-')
  return `${y}年${Number(m)}月`
}

/** 任意日期值 -> yyyy-MM */
export function monthOf(v) {
  const d = toDate(v)
  if (!d) return null
  return `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}`
}

/** 取进展列表数据覆盖的月份范围 { min, max } | null */
export function rangeOfItems(items) {
  const yms = items.map((it) => monthOf(it.updateTime)).filter(Boolean).sort()
  if (!yms.length) return null
  return { min: yms[0], max: yms[yms.length - 1] }
}

/** 记录是否落在 [startYm, endYm] 闭区间 */
export function inRange(item, startYm, endYm) {
  const ym = monthOf(item.updateTime)
  if (!ym) return false
  return ym >= startYm && ym <= endYm
}

export function formatRangeLabel(startYm, endYm) {
  if (startYm === endYm) return monthLabel(startYm)
  return `${monthLabel(startYm)} ~ ${monthLabel(endYm)}`
}

function shortDate(v) {
  const d = toDate(v)
  if (!d) return ''
  return `${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}`
}

/** 去除空白后简单相似去重（保留首次出现） */
function dedupe(items) {
  const seen = new Set()
  const out = []
  items.forEach((it) => {
    const key = String(it.content || '').replace(/\s+/g, '')
    if (!key || seen.has(key)) return
    seen.add(key)
    out.push(it)
  })
  return out
}

const NEXT_TIPS = {
  谋划: '建议尽快明确项目选址与投资规模，推动转入在谈阶段。',
  在谈: '建议加快投资协议条款磋商，尽快推动转入签约阶段。',
  签约: '建议持续推进注册手续与履约要素落实，尽快推动转入落地阶段。',
  落地: '建议持续跟进开工/开业进度与到位资金，做好投产前的要素保障。',
}

/** 下一步建议 */
function nextStepText(stage, lastNormal) {
  const key = Object.keys(NEXT_TIPS).find((k) => (stage || '').includes(k)) || (lastNormal ? Object.keys(NEXT_TIPS).find((k) => (lastNormal.stage || '').includes(k)) : '')
  if (key) return NEXT_TIPS[key]
  return '请人工补充下一步工作计划。'
}

/**
 * 生成四段式摘要
 * @param {Object} opt
 * @param {string} opt.projectName 项目名称
 * @param {string} opt.stageLabel 当前阶段文案（如"签约阶段"）
 * @param {Array}  opt.items 已按统计区间过滤的进展记录（时间任意）
 * @returns {string|null} 四段式文本；区间内无记录返回 null
 */
export function generateSummary({ projectName = '', stageLabel = '', items = [] }) {
  if (!items.length) return null
  const sorted = [...items].sort((a, b) => new Date(a.updateTime) - new Date(b.updateTime))
  const normals = dedupe(sorted.filter((it) => !it.type || it.type === 'normal'))
  const nodes = sorted.filter((it) => it.type === 'system' || it.type === 'decision')
  const lastNormal = normals[normals.length - 1] || null
  const curStage = stageLabel || (lastNormal && lastNormal.stage) || '当前阶段'

  const lines = []

  // 1) 总体进展
  const main = normals.slice(0, 3)
  const extra = normals.length - main.length
  let overview = `【总体进展】项目「${projectName}」当前处于${curStage}。统计区间内共 ${sorted.length} 条进展记录（人工汇报 ${normals.length} 条、系统节点 ${nodes.length} 条）。`
  const body = []
  main.forEach((it, i) => {
    const tag = (it.stage && it.stage !== curStage) ? `[${it.stage}]` : ''
    body.push(`${i + 1}) ${tag}${it.content}（${shortDate(it.updateTime)}，${it.reporter || '相关单位'}）`)
  })
  if (extra > 0) body.push(`…另有 ${extra} 条日常更新未逐一列示。`)
  if (!body.length && nodes.length) {
    overview += ' 该区间内以节点/系统动态为主，暂无人工汇报正文。'
  }
  lines.push(overview)
  if (body.length) lines.push(body.join('\n'))

  // 2) 重要节点与阶段变化
  if (nodes.length) {
    const nodeLines = nodes.map((it) => {
      const isDecision = it.type === 'decision'
      const prefix = isDecision ? '决策节点更新' : '系统节点'
      return `- ${shortDate(it.updateTime)}（${prefix}）：${it.content}`
    })
    lines.push(`【重要节点与阶段变化】\n${nodeLines.join('\n')}`)
  } else {
    lines.push('【重要节点与阶段变化】\n该区间内无系统流转或决策节点更新。')
  }

  // 3) 风险与待协调
  const risks = normals.filter((it) => RISK_WORDS.some((w) => String(it.content || '').includes(w)))
  if (risks.length) {
    lines.push(`【风险与待协调】\n${risks.map((it) => `- ⚠ ${it.content}（${shortDate(it.updateTime)}）`).join('\n')}`)
  } else {
    lines.push('【风险与待协调】\n暂无重大风险。')
  }

  // 4) 下一步
  lines.push(`【下一步建议】\n${nextStepText(curStage, lastNormal)}`)

  return lines.join('\n\n')
}
