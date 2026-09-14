import { Card, Empty, Button } from 'antd'
import { InboxOutlined } from '@ant-design/icons'

export default function Placeholder({ title, description = '该模块正在建设中，功能即将上线' }) {
  return (
    <div className="page-container">
      <Card style={{ borderRadius: 6, minHeight: 'calc(100vh - 100px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Empty
          image={<InboxOutlined style={{ fontSize: 72, color: '#1677ff' }} />}
          description={
            <div>
              <div style={{ fontSize: 18, fontWeight: 600, color: '#333', marginBottom: 8 }}>{title}</div>
              <div style={{ fontSize: 13, color: '#999' }}>{description}</div>
            </div>
          }
        >
          <Button type="primary" onClick={() => window.history.back()}>返回</Button>
        </Empty>
      </Card>
    </div>
  )
}
