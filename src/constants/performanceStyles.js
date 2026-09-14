/**
 * 绩效考核模块 - 统一UI常量与工具函数
 * 本文件是四个绩效页面的"唯一真理来源"，所有颜色、间距、表格配置从这里导入。
 */
import { Tag } from 'antd'
import { COLORS, sectionTitleStyle as baseSectionTitleStyle } from './uiStyles'

/* ========== 绩效专属配色 ========== */
export const PERF_COLORS = {
  primary: '#1677ff',
  primaryLight: '#e6f4ff',
  success: '#52c41a',
  danger: '#ff4d4f',
  warning: '#faad14',
  gold: '#fadb14',
  silver: '#d9d9d9',
  bronze: '#cd7f32',
}

/* ========== 通用卡片样式 ========== */
export const perfCardStyle = {
  borderRadius: 8,
  boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
  background: '#fff',
}

/* ========== 页面包容器 ========== */
export const perfPageBg = {
  padding: 20,
  background: COLORS.bgPage,
  minHeight: '100vh',
}

/* ========== 分类标题（复用 uiStyles） ========== */
export const perfSectionTitle = (extraMargin = '16px 0 12px') => ({
  ...baseSectionTitleStyle,
  marginBottom: extraMargin,
})

/* ========== 汇总指标卡片样式 ========== */
export function metricCardStyle(color) {
  return {
    ...perfCardStyle,
    borderLeft: `4px solid ${color}`,
    flex: 1,
  }
}

/* ========== 数字大样式 ========== */
export const bigNumberStyle = {
  fontSize: 28,
  fontWeight: 700,
  color: COLORS.textBase,
  lineHeight: 1.2,
}

export const smallLabelStyle = {
  fontSize: 13,
  color: COLORS.textSecondary,
  marginTop: 4,
}

/* ========== 统计卡片网格布局 ========== */
export const statCardGrid = () => ({
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
  gap: 12,
  marginBottom: 20,
})

/* ========== 表头Tag颜色映射 ========== */
export const TABLE_TAG_COLORS = {
  target: 'blue',     // 目标值
  done: 'green',      // 完成值
  progress: 'default',// 进度条
  completion: 'cyan', // 完成率
  rank1: 'gold',      // 排名1
  rank2: 'default',   // 排名2
  rank3: 'orange',    // 排名3
}

/* ========== Progress 进度条配色逻辑 ========== */
export function getProgressColor(rate) {
  if (rate >= 80) return PERF_COLORS.success
  if (rate >= 60) return PERF_COLORS.primary
  if (rate >= 40) return PERF_COLORS.warning
  return PERF_COLORS.danger
}

export function formatRate(rate) {
  return `${Math.round(rate)}%`
}

export function rateStatus(rate) {
  const map = [
    { min: 100, label: '已超额', color: PERF_COLORS.success },
    { min: 80, label: '进展良好', color: PERF_COLORS.primary },
    { min: 60, label: '正常推进', color: PERF_COLORS.warning },
    { min: 0, label: '需关注', color: PERF_COLORS.danger },
  ]
  return map.find(s => rate >= s.min) || map[map.length - 1]
}

/* ========== 表格统一配置 ========== */
export const TABLE_PROPS = {
  size: 'small',
  pagination: false,
  scroll: { x: undefined, y: undefined },
}

/* ========== 筛选栏样式 ========== */
export const filterBarStyle = {
  ...perfCardStyle,
  padding: '12px 20px',
  marginBottom: 20,
  display: 'flex',
  alignItems: 'center',
  gap: 16,
  flexWrap: 'wrap',
}
