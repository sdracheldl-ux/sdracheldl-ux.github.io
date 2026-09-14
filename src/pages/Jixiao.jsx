import { Card } from 'antd'
import { BarChartOutlined } from '@ant-design/icons'

export default function Jixiao() {
  return (
    <div className="page-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 'calc(100vh - 100px)' }}>
      <Card
        styles={{ body: { padding: '56px 40px' } }}
        style={{
          width: 480,
          borderRadius: 8,
          textAlign: 'center',
          boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
        }}
      >
        <div style={{
          width: 72, height: 72, borderRadius: '50%',
          background: 'linear-gradient(135deg, #e6f4ff 0%, #bae0ff 100%)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 24px',
        }}>
          <BarChartOutlined style={{ fontSize: 36, color: '#1677ff' }} />
        </div>
        <div style={{ fontSize: 20, fontWeight: 600, color: '#262626', marginBottom: 12 }}>
          绩效考核
        </div>
        <div style={{ fontSize: 14, color: '#8c8c8c', lineHeight: 1.8 }}>
          绩效考核功能建设中，待业务方补充指标后细化
        </div>
      </Card>
    </div>
  )
}
