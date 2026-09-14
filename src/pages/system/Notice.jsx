import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  List,
  Button,
  Tag,
  Space,
  Badge,
  Empty,
  message,
  Divider,
} from 'antd'
import {
  BellOutlined,
  CheckCircleOutlined,
  EyeOutlined,
  CheckOutlined,
  FileTextOutlined,
  WarningOutlined,
  InfoCircleOutlined,
  ScheduleOutlined,
  TeamOutlined,
  SendOutlined,
  ImportOutlined,
} from '@ant-design/icons'
import { useViewRole, msgStore, useMessages } from '../../store/viewStore'

// 消息类型标签（仅保留业务类型标签，不再展示来源分类标签）
const typeTag = (type) => {
  switch (type) {
    case 'assign': return <Tag color="blue" style={{ marginLeft: 6 }}>任务分派</Tag>
    case 'import': return <Tag color="orange" style={{ marginLeft: 6 }}>导入判重</Tag>
    case 'feedback': return <Tag color="purple" style={{ marginLeft: 6 }}>协作反馈</Tag>
    case 'done': return <Tag color="green" style={{ marginLeft: 6 }}>任务完成</Tag>
    default: return null
  }
}

const typeIcon = (type) => {
  switch (type) {
    case 'warning': return <WarningOutlined style={{ color: '#faad14', fontSize: 18 }} />
    case 'success': return <CheckCircleOutlined style={{ color: '#52c41a', fontSize: 18 }} />
    case 'audit': return <FileTextOutlined style={{ color: '#1677ff', fontSize: 18 }} />
    case 'report': return <ScheduleOutlined style={{ color: '#722ed1', fontSize: 18 }} />
    case 'task': return <InfoCircleOutlined style={{ color: '#13c2c2', fontSize: 18 }} />
    case 'assign': return <SendOutlined style={{ color: '#1677ff', fontSize: 18 }} />
    case 'import': return <ImportOutlined style={{ color: '#fa8c16', fontSize: 18 }} />
    case 'feedback': return <TeamOutlined style={{ color: '#722ed1', fontSize: 18 }} />
    case 'done': return <CheckCircleOutlined style={{ color: '#52c41a', fontSize: 18 }} />
    default: return <BellOutlined style={{ color: '#1677ff', fontSize: 18 }} />
  }
}

// 时间解析（兼容 "2026-9-2 15:30" 与 "2026-08-26 09:00" 两种格式）
const parseTime = (t) => new Date(String(t || '').replace(/-/g, '/')).getTime() || 0

export default function Notice() {
  const navigate = useNavigate()
  const { role } = useViewRole()
  const { list, unread, markAllRead } = useMessages()

  // 所有消息合并展示，按时间倒序
  const allMessages = useMemo(() => {
    return [...list].sort((a, b) => parseTime(b.time) - parseTime(a.time))
  }, [list])

  // 根据消息关联的项目ID和阶段，构建详情页路由
  const buildDetailPath = (item) => {
    if (!item.projectId) return null
    if (item.stage === 'mouhua' || item.projectId.startsWith('mouhua-')) return `/project/mouhua/detail/${item.projectId}`
    if (item.stage === 'zaitan' || item.projectId.startsWith('zaitan-')) return `/project/zaitan/detail/${item.projectId}`
    if (item.stage === 'qianyue' || item.projectId.startsWith('qianyue-')) return `/project/qianyue/detail/${item.projectId}`
    if (item.stage === 'luodi' || item.projectId.startsWith('luodi-')) return `/project/luodi/detail/${item.projectId}`
    if (item.stage === 'tuiku' || item.projectId.startsWith('tuiku-')) return `/project/tuiku/detail/${item.projectId}`
    // 默认按在谈处理（兼容旧数据）
    return `/project/zaitan/detail/${item.projectId}${item.action ? `?action=${item.action}` : ''}`
  }

  const handleClick = (item) => {
    msgStore.markRead(item.id)
    // 优先使用 link 字段
    if (item.link) {
      navigate(item.link)
      return
    }
    // 有 projectId 则跳转对应详情页
    const detailPath = buildDetailPath(item)
    if (detailPath) {
      navigate(detailPath)
    }
  }

  const handleReadAll = () => {
    markAllRead()
    message.success('已全部标记为已读')
  }

  return (
    <div className="page-container">
      <div style={{ background: '#fff', borderRadius: 4, padding: '16px 24px 24px' }}>
        <div style={{ marginBottom: 16 }}>
          <h3 style={{ fontSize: 16, fontWeight: 600, color: '#262626', margin: 0 }}>
            <BellOutlined style={{ color: '#1677ff', marginRight: 8 }} />
            消息通知
          </h3>
          <p style={{ fontSize: 13, color: '#999', marginTop: 4, marginBottom: 0 }}>
            当前视角：{role.label} · 所有消息统一展示，点击查看自动标记为已读并跳转详情页
          </p>
        </div>
        <Divider style={{ margin: '0 0 16px' }} />

        {/* 统计与一键已读 */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <span style={{ fontSize: 13, color: '#666' }}>
            共 <span style={{ color: '#1677ff', fontWeight: 600 }}>{allMessages.length}</span> 条消息
            {unread > 0 && (
              <span style={{ marginLeft: 8 }}>
                未读 <Badge count={unread} style={{ backgroundColor: '#ff4d4f' }} />
              </span>
            )}
          </span>
          {unread > 0 && (
            <Button type="link" icon={<CheckOutlined />} onClick={handleReadAll} style={{ padding: 0 }}>
              一键已读
            </Button>
          )}
        </div>

        {allMessages.length === 0 ? (
          <Empty description="暂无消息" style={{ padding: '40px 0' }} />
        ) : (
          <List
            dataSource={allMessages}
            renderItem={(item) => (
              <List.Item
                key={item.id}
                style={{
                  padding: '12px 16px',
                  background: item.read ? '#fff' : '#f0f7ff',
                  borderRadius: 4,
                  marginBottom: 8,
                  border: '1px solid #f0f0f0',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
                onClick={() => handleClick(item)}
                actions={[
                  <span key="view" className="action-link" onClick={(e) => { e.stopPropagation(); handleClick(item) }}>
                    <EyeOutlined /> 查看
                  </span>,
                ]}
              >
                <List.Item.Meta
                  avatar={
                    <div style={{
                      width: 36, height: 36, borderRadius: '50%',
                      background: item.read ? '#f5f5f5' : '#e6f4ff',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      {typeIcon(item.type)}
                    </div>
                  }
                  title={
                    <Space size={0} wrap>
                      {!item.read && <Badge color="#ff4d4f" style={{ marginRight: 6 }} />}
                      <span style={{ fontSize: 14, color: item.read ? '#666' : '#262626', fontWeight: item.read ? 400 : 600 }}>
                        {item.title}
                      </span>
                      {typeTag(item.type)}
                    </Space>
                  }
                  description={
                    <div>
                      {item.category === 'coop' && item.content && (
                        <div style={{ fontSize: 13, color: '#595959', lineHeight: 1.6, marginTop: 4, whiteSpace: 'pre-wrap' }}>
                          {item.content}
                        </div>
                      )}
                      {item.category === 'coop' && item.projectName && (
                        <div style={{ fontSize: 12, color: '#1677ff', marginTop: 6 }}>
                          📎 关联项目：{item.projectName}
                        </div>
                      )}
                      <div style={{ fontSize: 12, color: '#bfbfbf', marginTop: 4 }}>
                        {item.time}
                      </div>
                    </div>
                  }
                />
              </List.Item>
            )}
          />
        )}
      </div>
    </div>
  )
}
