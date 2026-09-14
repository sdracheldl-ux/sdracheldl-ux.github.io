/**
 * 项目全周期管理系统 - UI通用样式与小组件
 * 所有页面应优先使用这里的常量/组件，避免重复造轮子、保证视觉一致。
 */
import { Tag } from 'antd'

/* ========== 颜色 ========== */
export const COLORS = {
  primary: '#1677ff',
  primaryLight: '#e6f4ff',
  primaryBorder: '#91caff',
  success: '#52c41a',
  danger: '#ff4d4f',
  warning: '#faad14',
  textBase: '#262626',
  textSecondary: '#595959',
  textMuted: '#bfbfbf',
  border: '#f0f0f0',
  bgHover: '#f0f7ff',
  bgPage: '#f0f2f5',
}

/* ========== 通用间距 ========== */
export const SPACING = {
  pagePadding: 16,
  cardPadding: '16px 24px 24px',
  sectionGap: 24,
  titleMarginBottom: 12,
}

/* ========== 分类标题（蓝色左侧竖线，无背景） ==========
 * 用于详情页各信息分组的标题，例如"签约状态"、"项目基本信息"。
 * 规范：左侧 4px 蓝色(#1677ff)竖线 + 10px 内边距；深黑色加粗文字；下方12px间距。
 */
export const sectionTitleStyle = {
  paddingLeft: 10,
  borderLeft: `4px solid ${COLORS.primary}`,
  fontWeight: 600,
  color: COLORS.textBase,
  fontSize: 15,
  margin: '0 0 12px 0',
}

/* ========== 详情页 Descriptions 统一配置 ========== */
export const descriptionsProps = {
  bordered: true,
  column: 4,
  size: 'small',
  labelStyle: { width: 140, background: '#fafafa', fontWeight: 500 },
  contentStyle: { minWidth: 120 },
}

/* ========== 列表操作列文字链接样式 ========== */
export const actionLinkStyle = {
  color: COLORS.primary,
  cursor: 'pointer',
  fontSize: 14,
  display: 'inline-flex',
  alignItems: 'center',
  gap: 4,
}
export const actionLinkPrimaryStyle = {
  ...actionLinkStyle,
  fontWeight: 500,
}
export const actionLinkDangerStyle = {
  ...actionLinkStyle,
  color: COLORS.danger,
}

/* ========== 通用 Tag 工具函数 ========== */

/** 是/否 标签：是=绿色Tag，否=灰色文字，空值=- */
export function boolTag(v) {
  if (v === '是' || v === true) return <Tag color="success" style={{ margin: 0 }}>是</Tag>
  if (v === '否' || v === false) return <span style={{ color: COLORS.textMuted }}>否</span>
  if (v === 0 || v === '0') return <span style={{ color: COLORS.textMuted }}>否</span>
  return v != null && v !== '' ? v : <span style={{ color: COLORS.textMuted }}>-</span>
}

/** 空值占位：null/undefined/'' 显示灰色 "-" */
export function emptyTag(v) {
  if (v == null || v === '' || v === '-') return <span style={{ color: COLORS.textMuted }}>-</span>
  return v
}

/* ========== 进展汇报弹窗统一配置 ==========
 * 用法：
 *   <Modal {...progressModalProps({
 *     open, title, confirmLoading, onOk, onCancel
 *   })}>
 *     <Form form={form} layout="vertical" requiredMark style={{marginTop:16}}>
 *       <Form.Item {...progressContentFieldProps}>
 *         <Input.TextArea {...progressTextAreaProps} />
 *       </Form.Item>
 *     </Form>
 *   </Modal>
 */
export const progressModalProps = ({ open, projectName, confirmLoading, onOk, onCancel }) => ({
  title: `进展汇报 - ${projectName || ''}`,
  open,
  onOk,
  onCancel,
  confirmLoading,
  okText: '提交',
  cancelText: '取消',
  width: 600,
  destroyOnClose: true,
})

export const progressContentFieldProps = {
  label: '进展内容',
  name: 'content',
  rules: [
    { required: true, message: '请输入进展内容' },
    { max: 500, message: '进展内容不超过500个字符' },
  ],
}

export const progressTextAreaProps = {
  rows: 6,
  placeholder: '请输入进展内容，最多500字',
  maxLength: 500,
  showCount: true,
}

/* ========== 页面卡片容器 ========== */
export const pageCardStyle = {
  padding: SPACING.cardPadding,
}

/* ========== 详情页顶部标题栏 ==========
 * flex 水平布局：左侧返回按钮 + 项目名 + 状态Tag + 角色提示；右侧操作按钮组。
 */
export const detailHeaderStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'flex-start',
  paddingBottom: 16,
  borderBottom: `1px solid ${COLORS.border}`,
  marginBottom: 24,
}

export const detailHeaderLeftStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: 12,
}

/* ========== 进展时间线（Timeline）相关 ==========
 * 进展类型 type 取值：
 *   'normal'   - 用户手动填写的进展汇报
 *   'system'   - 系统自动事件（创建、阶段变更、导入、退库）
 *   'decision' - 决策节点更新（通过/撤销）
 *
 * 阶段 stage 取值（用于手动进展的阶段Tag，系统事件不展示阶段Tag）：
 *   '谋划阶段' | '在谈阶段' | '签约阶段' | '落地阶段'
 */

export const PROGRESS_TYPE = {
  NORMAL: 'normal',
  SYSTEM: 'system',
  DECISION: 'decision',
}

/** 各阶段Tag颜色映射（当前阶段用主色，历史阶段用default灰色） */
export const stageTagColorMap = {
  '谋划阶段': 'default',
  '在谈阶段': 'cyan',
  '签约阶段': 'blue',
  '落地阶段': 'green',
}

/** 根据type返回Timeline圆点颜色 */
export const progressDotColor = (type) => {
  if (type === PROGRESS_TYPE.SYSTEM || type === PROGRESS_TYPE.DECISION) return COLORS.success
  return COLORS.primary
}

/** 进展卡片基础样式（box-shadow、圆角、padding） */
export const progressCardBaseStyle = {
  padding: '12px 16px 10px',
  borderRadius: '0 4px 4px 0',
  boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
}

/** 根据type返回卡片样式（背景色+左边框） */
export const progressCardStyle = (type) => ({
  ...progressCardBaseStyle,
  background: (type === PROGRESS_TYPE.SYSTEM || type === PROGRESS_TYPE.DECISION) ? '#f6ffed' : '#fff',
  borderLeft: `3px solid ${progressDotColor(type)}`,
})

/** 进展描述文字统一样式 */
export const progressContentStyle = {
  fontSize: 14,
  color: COLORS.textBase,
  lineHeight: 1.8,
  whiteSpace: 'pre-wrap',
}

/** 进展底部元信息（reporter · time）样式 */
export const progressMetaStyle = {
  marginTop: 8,
  fontSize: 12,
  color: '#8c8c8c',
}

/** 决策节点更新小标题样式（保留绿色"● 决策节点更新"） */
export const decisionSubtitleStyle = {
  fontSize: 12,
  color: COLORS.success,
  marginBottom: 6,
  fontWeight: 500,
}

/** 进展统计栏文字样式（"共 X 条进展记录..."） */
export const progressSummaryStyle = {
  fontSize: 13,
  color: '#8c8c8c',
}

