/**
 * 项目统计分析 - 统计口径工具函数
 * 口径说明（与 docs/项目统计分析板块-需求设计.md §3 一致）：
 *  - 签约时间：qianyue 记录的「签约审核通过时间」
 *  - 落地时间：luodi 记录的「落地审核通过时间」（转落地通过时间）
 *  - 金额字段：签约金额=「投资金额(亿元)」；到位资金=「当年到位资金情况(亿元)」优先，缺省回退「到资金额(亿元)」
 *  - 园区维度：按「负责单位」分组
 */

const pad = (n) => String(n).padStart(2, '0')

/** 统一转成 "yyyy-MM"（按月口径） */
export function toYm(date) {
  if (!date) return null
  return `${date.getUTCFullYear()}-${pad(date.getUTCMonth() + 1)}`
}

/**
 * 日期值解析（支持三种形态）：
 *  - number：Excel 序列数（可含小数时分秒）或毫秒时间戳
 *  - string："yyyy-MM-dd" / "yyyy-MM-dd hh:mm:ss"
 * 统一返回 UTC 语义的 Date（年月切分不受时区影响）。
 */
export function toDate(v) {
  if (v == null || v === '' || v === '-') return null
  if (typeof v === 'number') {
    if (v > 20000 && v < 60000) {
      // Excel 序列数：起点 1899-12-30，单位天
      return new Date(Math.round((v - 25569) * 86400 * 1000))
    }
    return isNaN(v) ? null : new Date(v)
  }
  const s = String(v).trim().replace(/\.0+$/, '')
  const m = /^(\d{4})[-/](\d{1,2})(?:[-/](\d{1,2}))?/.exec(s)
  if (m) {
    const day = m[3] ? Number(m[3]) : 1
    return new Date(Date.UTC(Number(m[1]), Number(m[2]) - 1, day))
  }
  const d = new Date(s)
  return isNaN(d.getTime()) ? null : d
}

/** 取记录指定字段的 "yyyy-MM"，失败返回 null */
export function fieldYm(item, key) {
  const d = toDate(item[key])
  return d ? toYm(d) : null
}

/** 按字段优先顺序取第一个可解析的年月 */
export function firstYm(item, keys) {
  for (const k of keys) {
    const ym = fieldYm(item, k)
    if (ym) return ym
  }
  return null
}

/** 格式化日期值 -> "yyyy-MM-dd"（时间戳/序列数/字符串均可），不可解析返回 '-' */
export function fmtDate(v) {
  const d = toDate(v)
  if (!d) return '-'
  return `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}`
}

/** 安全取数值（亿元等），不可用返回 0 */
export function num(v) {
  const n = Number(v)
  return Number.isFinite(n) ? n : 0
}

/** 金额展示：保留 1 位小数（千分位不需要） */
export function fmtMoney(v) {
  const n = num(v)
  return n.toLocaleString('zh-CN', { minimumFractionDigits: 0, maximumFractionDigits: 1 })
}

/** 取负责单位（园区）；空值归为「其他」 */
export function parkOf(item) {
  return item['负责单位'] || item['报送区'] || '其他'
}

/** 区间内连续月份数组 ['yyyy-MM', ...]，start <= end */
export function monthRange(startYm, endYm) {
  const out = []
  let [sy, sm] = startYm.split('-').map(Number)
  const ey = Number(endYm.split('-')[0])
  const em = Number(endYm.split('-')[1])
  let guard = 0
  while ((sy < ey || (sy === ey && sm <= em)) && guard < 60) {
    out.push(`${sy}-${pad(sm)}`)
    sm += 1
    if (sm > 12) { sm = 1; sy += 1 }
    guard += 1
  }
  return out
}

/** 过滤：记录指定时间字段落在 [startYm, endYm] 闭区间 */
export function filterByRange(items, timeKey, startYm, endYm) {
  return items.filter((it) => {
    const ym = fieldYm(it, timeKey)
    if (!ym) return false
    return ym >= startYm && ym <= endYm
  })
}

/** 过滤：按字段优先级取年月，落在区间内 */
export function filterByFirstRange(items, keys, startYm, endYm) {
  return items.filter((it) => {
    const ym = firstYm(it, keys)
    if (!ym) return false
    return ym >= startYm && ym <= endYm
  })
}

/**
 * 求和金额字段；缺省回退字段 fallbackKeys 依次尝试取第一个有值的字段
 */
export function sumOf(items, key, fallbackKeys = []) {
  return items.reduce((s, it) => {
    let v = it[key]
    if ((v == null || v === '') && fallbackKeys.length) {
      for (const fk of fallbackKeys) {
        if (it[fk] != null && it[fk] !== '') { v = it[fk]; break }
      }
    }
    return s + num(v)
  }, 0)
}
