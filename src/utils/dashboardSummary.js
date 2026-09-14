/**
 * 统计面板 AI 招商总结（参考《东湖高新区上半年招商引资通报》格式）
 * - 一、全区/园区招商总体情况（截至查询结束月）
 * - 二、各园区招商情况：对比年度考核目标识别"超时序"园区
 * 超时序口径：完成值 > 年度目标 × 已过月份/12（如年度12亿，截至6月应达6亿）。
 * 说明：年度目标为演示常量（取自通报附件1，可按实际考核表替换）。
 */
import { fmtMoney } from './projectStats'
import { monthLabel } from './progressSummary'

const fmtUsdHelper = (v) => Number(v).toLocaleString('zh-CN')

// 演示年度考核目标（2026，单位：签约金额亿元 / 到位资金亿元 / 开工开业 个 / FDI 万美元）
// 来自《20260601 东湖高新区上半年招商引资通报》附件1
export const YEAR_TARGETS = {
  生物城: { signAmount: 200, arrival: 80, openCount: 30, fdiUsd: 7500 },
  未来城: { signAmount: 260, arrival: 200, openCount: 18, fdiUsd: 5000 },
  综保区: { signAmount: 180, arrival: 70, openCount: 18, fdiUsd: 3000 },
  光电园: { signAmount: 180, arrival: 90, openCount: 33, fdiUsd: 8500 },
  服务业园: { signAmount: 140, arrival: 45, openCount: 22, fdiUsd: 3500 },
  智造园: { signAmount: 230, arrival: 180, openCount: 10, fdiUsd: 3000 },
  中华园: { signAmount: 20, arrival: 5, openCount: 3, fdiUsd: null }, // 无 FDI 目标
  中心城: { signAmount: 120, arrival: 45, openCount: 20, fdiUsd: 4500 },
}
export const ALL_YEAR_TARGET = { signAmount: 1200, arrival: 700, openCount: 150, fdiUsd: 35000 }

/** 正常时序应达进度（月度均匀）：年度目标 * 月份/12 */
function expected(target, monthIndex) {
  return target * (monthIndex / 12)
}

/** 判断是否超时序 */
function isAhead(actual, target, monthIndex) {
  if (!target) return false
  return actual > expected(target, monthIndex)
}

/**
 * 生成统计面板招商总结
 * @param {Object} params
 * @param {string} params.endYm        查询区间结束月 yyyy-MM
 * @param {string} params.scopeLabel   主体文案（"全区"或园区名）
 * @param {boolean} params.isAllScope  是否全区视角
 * @param {Object} params.overall     全区或当前园区的年度累计：{ signedCount, signedAmount, arrival, openCount, fdiUsd, fdiCount }
 * @param {Array}  params.parkRates   各园区年度累计：[{ name, signedAmount, arrival, openCount, fdiUsd }]
 * @returns {string}
 */
export function buildDashboardSummary({ endYm, scopeLabel, isAllScope, overall, parkRates = [] }) {
  const monthIdx = Number(endYm.slice(5, 7))
  const ymText = monthLabel(endYm).replace('年', '年') // YYYY年M月
  const lines = []

  // 一、总体情况（参照通报第一段）
  const fdiusdStr = overall.fdiUsd > 0 ? `${fmtUsdHelper(overall.fdiUsd)}万美元` : '—'
  lines.push(`一、${scopeLabel}招商总体情况（截至${ymText}）`)
  lines.push(
    `${scopeLabel}签约项目${overall.signedCount}个、签约金额${fmtMoney(overall.signedAmount)}亿元。` +
    `当年到位资金${fmtMoney(overall.arrival)}亿元。当年开工（开业）项目${overall.openCount}个。` +
    `外商直接投资（FDI）项目${overall.fdiCount || 0}个，金额${fdiusdStr}。`
  )

  // 二、超时序（对比年度考核目标）
  const monthProgress = `${Math.round((monthIdx / 12) * 100)}%（${monthIdx}月/12月）`
  lines.push(`二、超时序进度园区（年度目标×${monthProgress}基准）`)

  if (isAllScope) {
    const aheadBy = (key, fmt) => {
      const list = parkRates
        .filter((r) => {
          const t = YEAR_TARGETS[r.name]
          return t && t[key] != null && isAhead(r[key] ?? 0, t[key], monthIdx)
        })
        .map((r) => `${r.name}（${fmt ? fmt(r[key]) : r[key]}）`)
      return list.length ? list.join('、') : '无'
    }
    const signList = aheadBy('signedAmount', (v) => `${fmtMoney(v)}亿元`)
    const arrivalList = aheadBy('arrival', (v) => `${fmtMoney(v)}亿元`)
    const openList = aheadBy('openCount')
    const fdiList = aheadBy('fdiUsd', (v) => `${fmtUsdHelper(v)}万美元`)

    lines.push(
      `签约金额完成情况超时序的园区：${signList}。` +
      `当年到位资金完成情况超时序的园区：${arrivalList}。` +
      `当年开工（开业）项目完成进度超时序的园区：${openList}。` +
      `外商直接投资（FDI）完成情况超时序的园区：${fdiList}。`
    )
  } else {
    // 园区视角：仅评估本园区自身各项指标是否超时序
    const t = YEAR_TARGETS[scopeLabel]
    const row = parkRates.find((r) => r.name === scopeLabel) || {}
    const parts = []
    const push = (label, key, target, fmt) => {
      const ok = t && t[key] != null && isAhead(row[key] ?? 0, t[key], monthIdx)
      parts.push(`${label}${ok ? '已超时序' : '未超时序'}（${fmt ? fmt(row[key] || 0) : (row[key] || 0)}）`)
    }
    push('签约金额', 'signedAmount', t, (v) => `${fmtMoney(v)}亿元`)
    push('到位资金', 'arrival', t, (v) => `${fmtMoney(v)}亿元`)
    push('开工开业项目', 'openCount', t, (v) => `${v}个`)
    if (t && t.fdiUsd != null) push('FDI', 'fdiUsd', t, (v) => `${fmtUsdHelper(v)}万美元`)
    lines.push(`本园区各项指标时序完成情况：${parts.join('；')}。`)
  }

  lines.push('')
  lines.push('（注：年度目标取自演示配置，可按当年考核目标替换；超时序=完成值 > 年度目标×已过月份/12）')
  return lines.join('\n')
}
