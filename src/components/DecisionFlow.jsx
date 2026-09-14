// 决策节点流程图组件
// 根据项目分类显示对应的横向流程节点，支持展示已通过/进行中/待通过状态

const NODE_SEQUENCE = {
  policy: [
    { key: 'touweihui', label: '投委会' },
    { key: 'changwuhui', label: '常务会' },
  ],
  investLarge: [
    { key: 'guoqitoujuehui', label: '国企投决会' },
    { key: 'touweihui', label: '投委会' },
    { key: 'changwuhui', label: '常务会' },
  ],
  land: [
    { key: 'touweihui', label: '投委会' },
    { key: 'changwuhui', label: '常务会' },
    { key: 'gongdihui', label: '供地会' },
  ],
}

// 根据项目分类和投资额获取需要展示的节点序列
export function getDecisionNodes(projectCategory, investAmount) {
  if (projectCategory === '政策类') return NODE_SEQUENCE.policy
  if (projectCategory === '供地类') return NODE_SEQUENCE.land
  if (projectCategory === '投资类') {
    return Number(investAmount) > 0.5 ? NODE_SEQUENCE.investLarge : null
  }
  return null
}

export default function DecisionFlow({ nodes = [] }) {
  // nodes格式: [{ key, label, status: 'passed'|'current'|'pending', date?: string }]
  if (!nodes || nodes.length === 0) return null

  return (
    <div style={{
      padding: '10px 20px',
      background: '#fafbfc',
      borderRadius: 6,
      marginBottom: 16,
      border: '1px solid #f0f0f0',
    }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'center', gap: 0 }}>
        {nodes.map((node, idx) => {
          const isLast = idx === nodes.length - 1
          const isPassed = node.status === 'passed'
          const isCurrent = node.status === 'current'
          const dotColor = isPassed ? '#1677ff' : isCurrent ? '#1677ff' : '#d9d9d9'
          const textColor = isPassed || isCurrent ? '#1677ff' : '#8c8c8c'
          const lineColor = isPassed ? '#1677ff' : '#d9d9d9'

          return (
            <div key={node.key} style={{ display: 'flex', alignItems: 'flex-start', flex: isLast ? '0 0 auto' : 1 }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 80 }}>
                <div style={{
                  width: 18,
                  height: 18,
                  borderRadius: '50%',
                  border: isCurrent ? '3px solid #1677ff' : `2px solid ${dotColor}`,
                  background: isPassed ? dotColor : '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  position: 'relative',
                  zIndex: 1,
                }}>
                  {isPassed && (
                    <span style={{ color: '#fff', fontSize: 10, fontWeight: 'bold' }}>✓</span>
                  )}
                </div>
                <div style={{
                  marginTop: 4,
                  fontSize: 12,
                  fontWeight: isPassed || isCurrent ? 600 : 400,
                  color: textColor,
                  textAlign: 'center',
                  lineHeight: 1.2,
                }}>
                  {node.label}
                </div>
                <div style={{
                  marginTop: 2,
                  fontSize: 11,
                  color: isPassed ? '#8c8c8c' : isCurrent ? '#1677ff' : '#bfbfbf',
                  textAlign: 'center',
                  lineHeight: 1.2,
                }}>
                  {isPassed ? node.date || '-' : isCurrent ? '进行中' : '待通过'}
                </div>
              </div>
              {!isLast && (
                <div style={{
                  flex: 1,
                  height: 2,
                  marginTop: 8,
                  background: lineColor,
                  minWidth: 30,
                }} />
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
