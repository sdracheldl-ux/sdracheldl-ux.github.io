import mockData from '../mock/data.json'

/**
 * 项目重复研判 · 实时判重工具（PRD 2.1.8 场景一：手动新增 / 转阶段）
 *
 * 判重规则（四级冲突等级）：
 * - 重要字段 4 个：市级项目编码、项目名称、投资主体、投资金额
 * - 一般字段 5 个：导入主体、产业类别、行业类别、申报人、申报时间
 * - 按录入阶段实际具备的字段为准：谋划新增/转在谈无市级编码、谋划阶段无投资主体，自动降级比对
 *
 * L1 强匹配：① 市级项目编码相同（最高优先级）；② 或项目名称完全相同 + 投资主体相同
 * L2 高相似：项目名称相似度 ≥85% 且投资主体相同
 * L3 中风险：① 名称相似度 60%~85%；② 或投资主体 + 投资金额偏差 10% 以内等弱信号组合命中；导入主体相同作参考加分
 * L4 弱提示：单一弱信号组合（如投资主体相同 + 同一导入主体）
 *
 * 降级口径：谋划新增无投资主体/市级编码 → L1 不可触发（名称完全相同最高判 L2，置信度打折），
 *          L3-②降级为「金额偏差≤10% 且 产业/行业类别一致」。
 */

// ===== 名称归一化与相似度 =====

export function normalizeName(name) {
  return String(name || '')
    .replace(/[\s（）()【】\[\]《》""'']/g, '')
    .toLowerCase()
}

// 字符 bigram Dice 相似度，返回 0~100
export function nameSimilarity(a, b) {
  const na = normalizeName(a)
  const nb = normalizeName(b)
  if (!na || !nb) return 0
  if (na === nb) return 100
  if (na.length < 2 || nb.length < 2) return 0
  const grams = (s) => {
    const arr = []
    for (let i = 0; i < s.length - 1; i++) arr.push(s.slice(i, i + 2))
    return arr
  }
  const ga = grams(na)
  const gb = grams(nb)
  const map = new Map()
  ga.forEach(g => map.set(g, (map.get(g) || 0) + 1))
  let hit = 0
  gb.forEach(g => {
    const c = map.get(g) || 0
    if (c > 0) { hit++; map.set(g, c - 1) }
  })
  return Math.round((2 * hit) / (ga.length + gb.length) * 100)
}

// 金额偏差（以较大值为分母），返回 0~100 的百分数
export function amountDeviation(a, b) {
  const na = Number(a) || 0
  const nb = Number(b) || 0
  const max = Math.max(na, nb)
  if (max <= 0) return 0
  return Math.round(Math.abs(na - nb) / max * 100)
}

// ===== 库中记录适配（兼容 mock 中文键与页面英文键）=====

function adaptRow(item, stage) {
  return {
    key: item.id ?? item.key,
    stage,
    stageLabel: stage,
    cityCode: item['市级项目编码'] || item.cityProjectCode || '',
    projectName: item['项目名称'] || item.projectName || '',
    investorEntity: item['投资主体'] || item.investorEntity || '',
    investAmount: Number(item['投资金额（亿元）'] ?? item['投资金额(亿元)'] ?? item.investAmount ?? 0),
    industryCategory: item['产业类别'] || item.industryCategory || '',
    industryType: item['行业类别'] || (Array.isArray(item.industryType) ? item.industryType.join(' / ') : item.industryType) || '',
    reporter: item['申报人'] || item.reporter || '',
    reportTime: item['申报时间'] || item.reportTime || '',
    importSource: item['导入主体'] || item.importSource || '',
  }
}

// 在谈库（谋划·转在谈的比对范围）
export function buildZaitanLib() {
  return (mockData.zaitan || []).map(item => adaptRow(item, '在谈'))
}

// ===== 字段级对照 =====

// status: same=一致 / similar=相似 / diff=差异
function compareText(a, b) {
  const na = normalizeName(a)
  const nb = normalizeName(b)
  if (!na || !nb) return 'diff'
  if (na === nb) return 'same'
  const sim = nameSimilarity(a, b)
  if (sim >= 60) return 'similar'
  return 'diff'
}

function buildFieldComparisons(input, row, hasInvestor) {
  const fields = []

  // 重要字段（按录入侧实际具备的输出）
  if (input.cityCode) {
    fields.push({ key: 'cityCode', label: '市级项目编码', important: true, newValue: input.cityCode, oldValue: row.cityCode || '—', status: input.cityCode === row.cityCode ? 'same' : 'diff' })
  }
  const nameSim = nameSimilarity(input.projectName, row.projectName)
  fields.push({ key: 'projectName', label: '项目名称', important: true, newValue: input.projectName, oldValue: row.projectName, status: nameSim === 100 ? 'same' : nameSim >= 60 ? 'similar' : 'diff', similarity: nameSim })
  if (hasInvestor) {
    fields.push({ key: 'investorEntity', label: '投资主体', important: true, newValue: input.investorEntity, oldValue: row.investorEntity, status: compareText(input.investorEntity, row.investorEntity) })
  }
  const dev = amountDeviation(input.investAmount, row.investAmount)
  fields.push({
    key: 'investAmount', label: '投资金额(亿元)', important: true, isAmount: true,
    newValue: input.investAmount, oldValue: row.investAmount,
    status: dev === 0 ? 'same' : dev <= 10 ? 'similar' : 'diff', deviation: dev,
  })

  // 一般字段
  fields.push({ key: 'industryCategory', label: '产业类别', newValue: input.industryCategory || '—', oldValue: row.industryCategory || '—', status: compareText(input.industryCategory, row.industryCategory) })
  fields.push({ key: 'industryType', label: '行业类别', newValue: input.industryType || '—', oldValue: row.industryType || '—', status: compareText(input.industryType, row.industryType) })
  fields.push({ key: 'reporter', label: '申报人', newValue: input.reporter || '—', oldValue: row.reporter || '—', status: compareText(input.reporter, row.reporter) })
  fields.push({ key: 'reportTime', label: '申报时间', newValue: input.reportTime || '—', oldValue: row.reportTime || '—', status: compareText(input.reportTime, row.reportTime) })

  return fields
}

// ===== 判定入口 =====

const LEVEL_ORDER = { L1: 4, L2: 3, L3: 2, L4: 1 }

/**
 * @param {object} input 新录入数据 { projectName, investorEntity?, investAmount, industryCategory?, industryType?, cityCode?, reporter?, reportTime?, importSource? }
 * @param {Array} libs   比对库 [{ stage: '谋划'|'在谈', rows: [...] }]，rows 兼容中文键 mock / 页面英文键
 * @returns 命中列表（按 L1→L4 降序）[{ level, confidence, reason, target, fields, stats }]
 */
export function checkDuplicates(input, libs) {
  const hasInvestor = !!(input.investorEntity && String(input.investorEntity).trim() && input.investorEntity !== '-')
  const hasCityCode = !!(input.cityCode && String(input.cityCode).trim())
  const hits = []

  libs.forEach(lib => {
    (lib.rows || []).forEach(raw => {
      const row = adaptRow(raw, lib.stage)
      // 归一化后与自身完全相同则跳过（理论上新增场景不会出现）
      if (!row.projectName) return

      const exactName = normalizeName(input.projectName) === normalizeName(row.projectName) && !!normalizeName(input.projectName)
      const sameInvestor = hasInvestor && !!normalizeName(row.investorEntity) && normalizeName(input.investorEntity) === normalizeName(row.investorEntity)
      const sim = nameSimilarity(input.projectName, row.projectName)
      const dev = amountDeviation(input.investAmount, row.investAmount)
      const sameIndustry = !!input.industryCategory && normalizeName(input.industryCategory) === normalizeName(row.industryCategory)
      const sameIndustryType = !!input.industryType && normalizeName(input.industryType) === normalizeName(row.industryType)
      const sameImportSource = !!input.importSource && normalizeName(input.importSource) === normalizeName(row.importSource)
      const sameCityCode = hasCityCode && !!row.cityCode && input.cityCode === row.cityCode

      let level = null
      let reason = ''

      if (sameCityCode) {
        level = 'L1'
        reason = `市级项目编码相同（${input.cityCode}），直接判定为同一项目`
      } else if (exactName && sameInvestor) {
        level = 'L1'
        reason = '项目名称完全相同，且投资主体相同'
      } else if (sim >= 85 && sameInvestor) {
        level = 'L2'
        reason = `项目名称相似度 ${sim}%（≥85%），且投资主体相同`
      } else if (sim >= 60 && sim < 85) {
        level = 'L3'
        reason = `项目名称相似度 ${sim}%（60%~85%）`
      } else if (sameInvestor && dev <= 10) {
        level = 'L3'
        reason = `投资主体相同，且投资金额偏差 ${dev}%（10% 以内），弱信号组合命中`
      } else if (!hasInvestor && dev <= 10 && (sameIndustry || sameIndustryType)) {
        // 谋划降级：无投资主体，弱信号组合 = 金额偏差≤10% + 产业/行业类别一致
        level = 'L3'
        reason = `投资金额偏差 ${dev}%（10% 以内），且${sameIndustry ? '产业类别' : '行业类别'}一致（谋划阶段无投资主体，降级比对）`
      } else if (exactName && !hasInvestor) {
        // 谋划降级：名称完全相同但无投资主体可佐证，最高判 L2 且置信度打折
        level = 'L2'
        reason = '项目名称完全相同（谋划阶段无投资主体字段，降级比对，置信度有限）'
      } else if (sameInvestor && (sameImportSource || sameIndustry || sameIndustryType)) {
        level = 'L4'
        const extra = sameImportSource ? '同一导入主体' : sameIndustry ? '产业类别一致' : '行业类别一致'
        reason = `投资主体相同 + ${extra}（单一弱信号组合）`
      }

      // L4 补充：名称有一定相似（40~60）+ 行业类别一致（谋划降级场景的单一弱信号）
      if (!level && sameIndustryType && sim >= 40 && sim < 60) {
        level = 'L4'
        reason = `名称相似度 ${sim}% 且行业类别一致（单一弱信号组合）`
      }

      if (!level) return

      // 置信度（演示口径：基础分 + 一致性加分）
      let confidence = { L1: sameCityCode ? 0.98 : 0.95, L2: 0.85, L3: 0.62, L4: 0.45 }[level]
      if (level === 'L2' && !hasInvestor) confidence = 0.72 // 谋划降级置信度打折
      if (sameIndustry) confidence += 0.03
      if (sameIndustryType) confidence += 0.02
      if (sameImportSource) confidence += 0.02
      confidence = Math.min(confidence, 0.99)

      const fields = buildFieldComparisons({ ...input, hasCityCode }, row, hasInvestor)
      const stats = fields.reduce((acc, f) => {
        acc[f.status === 'same' ? 'same' : f.status === 'similar' ? 'similar' : 'diff']++
        return acc
      }, { same: 0, similar: 0, diff: 0 })

      hits.push({
        level,
        confidence: Number(confidence.toFixed(2)),
        reason,
        target: {
          key: row.key,
          stage: row.stage,
          stageLabel: row.stageLabel,
          projectName: row.projectName,
          investorEntity: row.investorEntity || '—',
          investAmount: row.investAmount,
          reporter: row.reporter || '—',
          importSource: row.importSource || '—',
        },
        fields,
        stats,
      })
    })
  })

  hits.sort((a, b) => LEVEL_ORDER[b.level] - LEVEL_ORDER[a.level] || b.confidence - a.confidence)
  return hits
}
