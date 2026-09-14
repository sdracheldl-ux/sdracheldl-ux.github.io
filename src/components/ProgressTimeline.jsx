/**
 * 进展时间线组件 - 统一三阶段（谋划/在谈/签约/落地）详情页的进展展示
 *
 * 统一展示：
 * - 手动进展汇报（normal）：白底蓝边 + 阶段Tag
 * - 系统事件（system，如创建、阶段变更、导入、退库）：浅绿底绿边 + "系统"Tag
 * - 决策节点更新（decision）：浅绿底绿边 + "系统"Tag + "● 决策节点更新"小标题
 *
 * Props:
 *   list: Array<ProgressItem>
 *     ProgressItem = {
 *       id: string | number,
 *       content: string,                    // 进展内容
 *       reporter: string,                   // 汇报人/触发方（系统事件为"系统"）
 *       updateTime: string | Date,          // 时间
 *       type?: 'normal' | 'system' | 'decision', // 默认 'normal'
 *       stage?: '谋划阶段' | '在谈阶段' | '签约阶段' | '落地阶段', // 手动进展归属阶段
 *     }
 *   formatTime?: (date) => string           // 自定义时间格式化，默认 yyyy-MM-dd HH:mm
 *   canEdit?: (item) => boolean             // 是否显示编辑/删除按钮（默认当前用户reporter===CURRENT_USER）
 *   currentUser?: string                    // 当前用户，用于canEdit判断
 *   onEdit?: (item) => void                 // 编辑按钮点击
 *   onDelete?: (item) => void               // 删除按钮点击
 *   emptyText?: string                      // 空状态文案
 *   summaryExtra?: ReactNode                // 统计栏额外内容（追加在"共X条..."之后）
 */
import { useMemo } from 'react'
import { Timeline, Tag, Empty, Button, Space, Popconfirm, Typography } from 'antd'
import {
  PROGRESS_TYPE,
  stageTagColorMap,
  progressDotColor,
  progressCardStyle,
  progressContentStyle,
  progressMetaStyle,
  decisionSubtitleStyle,
  progressSummaryStyle,
  COLORS,
} from '../constants/uiStyles'

const { Text } = Typography

function defaultFormatTime(date) {
  if (!date) return ''
  const d = date instanceof Date ? date : new Date(date)
  if (isNaN(d.getTime())) return String(date)
  const pad = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`
}

export default function ProgressTimeline({
  list = [],
  formatTime = defaultFormatTime,
  canEdit,
  currentUser,
  onEdit,
  onDelete,
  emptyText = '暂无进展记录',
  summaryExtra,
}) {
  const sortedList = useMemo(() => {
    return [...list].sort((a, b) => new Date(b.updateTime) - new Date(a.updateTime))
  }, [list])

  const defaultCanEdit = (item) => {
    if (item.type === PROGRESS_TYPE.SYSTEM || item.type === PROGRESS_TYPE.DECISION) return false
    if (canEdit) return canEdit(item)
    if (currentUser) return item.reporter === currentUser
    return false
  }

  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <Text type="secondary" style={progressSummaryStyle}>
          共 {sortedList.length} 条进展记录（按时间倒序）
          {summaryExtra}
        </Text>
      </div>
      {sortedList.length === 0 ? (
        <Empty description={emptyText} style={{ padding: '60px 0' }} />
      ) : (
        <Timeline
          items={sortedList.map(item => {
            const type = item.type || PROGRESS_TYPE.NORMAL
            const isSystemLike = type === PROGRESS_TYPE.SYSTEM || type === PROGRESS_TYPE.DECISION
            const isEditable = defaultCanEdit(item)
            return {
              color: progressDotColor(type),
              children: (
                <div style={{ paddingBottom: 24 }}>
                  <div style={progressCardStyle(type)}>
                    {/* 顶部标签区：阶段Tag + 系统Tag */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6, flexWrap: 'wrap' }}>
                      {item.stage && !isSystemLike && (
                        <Tag color={stageTagColorMap[item.stage] || 'default'} style={{ margin: 0, fontSize: 11 }}>
                          {item.stage}
                        </Tag>
                      )}
                      {isSystemLike && (
                        <Tag color="success" style={{ margin: 0, fontSize: 11 }}>系统</Tag>
                      )}
                    </div>

                    {/* 决策节点小标题 */}
                    {type === PROGRESS_TYPE.DECISION && (
                      <div style={decisionSubtitleStyle}>● 决策节点更新</div>
                    )}

                    {/* 内容 */}
                    <div style={progressContentStyle}>
                      {item.content}
                    </div>

                    {/* 元信息 + 操作 */}
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      ...progressMetaStyle,
                      marginTop: 8,
                    }}>
                      <span>{item.reporter} · {formatTime(item.updateTime)}</span>
                      {isEditable && (
                        <Space size={0}>
                          <Button
                            type="text"
                            size="small"
                            style={{ fontSize: 12, color: COLORS.textMuted, padding: '0 4px', height: 'auto' }}
                            onClick={() => onEdit && onEdit(item)}
                            onMouseEnter={e => e.currentTarget.style.color = COLORS.primary}
                            onMouseLeave={e => e.currentTarget.style.color = COLORS.textMuted}
                          >
                            编辑
                          </Button>
                          <Popconfirm
                            title="确定删除这条进展记录吗？"
                            okText="删除" cancelText="取消"
                            okButtonProps={{ danger: true, size: 'small' }}
                            onConfirm={() => onDelete && onDelete(item)}
                          >
                            <Button
                              type="text"
                              size="small"
                              style={{ fontSize: 12, color: COLORS.textMuted, padding: '0 4px', height: 'auto' }}
                              onMouseEnter={e => e.currentTarget.style.color = COLORS.danger}
                              onMouseLeave={e => e.currentTarget.style.color = COLORS.textMuted}
                            >
                              删除
                            </Button>
                          </Popconfirm>
                        </Space>
                      )}
                    </div>
                  </div>
                </div>
              ),
            }
          })}
        />
      )}
    </div>
  )
}
