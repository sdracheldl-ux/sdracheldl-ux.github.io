// 全局统计区间共享 store（项目统计分析页 与 进展AI摘要弹窗 共用）
// 让"项目进展自动总结"的时间口径跟随统计看板所选区间。
import { useEffect, useState } from 'react'

let current = { start: null, end: null } // yyyy-MM
const listeners = new Set()

export const statsRangeStore = {
  setRange({ start, end }) {
    current = { start, end }
    listeners.forEach((fn) => fn(current))
  },
  getRange() {
    return current
  },
  subscribe(fn) {
    listeners.add(fn)
    return () => listeners.delete(fn)
  },
}

// React hook：读取/订阅全局统计区间
export function useStatsRange() {
  const [range, setRange] = useState(statsRangeStore.getRange())
  useEffect(() => {
    const handler = (r) => setRange({ ...r })
    listeners.add(handler)
    return () => listeners.delete(handler)
  }, [])
  return { range, setRange: statsRangeStore.setRange }
}
