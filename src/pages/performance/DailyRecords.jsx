import { useState, useMemo } from 'react'
import { Table, Tag, Button, Segmented, DatePicker, Modal, Form, Input, Select, InputNumber, Switch, Row, Col, Space, Tooltip, message, Card } from 'antd'
import { PlusOutlined, DownloadOutlined, SearchOutlined } from '@ant-design/icons'
import { PARKS, MEET_RECORDS, EVENT_RECORDS } from '../../constants/performanceData'
import { perfPageBg, perfCardStyle } from '../../constants/performanceStyles'
import { COLORS } from '../../constants/uiStyles'

/* ==================== 统计卡片 ==================== */

function StatBox({ icon, title, value, color }) {
  return (
    <Card styles={{ body: { padding: '14px 20px' } }} style={{ ...perfCardStyle, borderLeft: `3px solid ${color}`, background: '#fff' }}>
      <Row align="middle" gutter={8}>
        <Col flex="auto">
          <div style={{ fontSize: 12, color: '#8c8c8c', marginBottom: 4 }}>{title}</div>
          <div style={{ fontSize: 26, fontWeight: 700, color: '#262626' }}>{value}</div>
        </Col>
        <Col><span style={{ fontSize: 20 }}>{icon}</span></Col>
      </Row>
    </Card>
  )
}

/* ==================== 见商/出差表格 ==================== */

function MeetTable() {
  const LEVEL_COLOR_MAP = { '一把手': 'red', '分管委领导': 'blue', '班子成员': 'green' }
  const TYPE_COLOR_MAP = { '见商': 'blue', '出差': 'orange' }
  const RESULT_COLOR_MAP = { '获取线索': 'green', '推进签约': 'blue', '解决困难': 'orange' }

  return (
    <>
      {/* Stats */}
      <Row gutter={[12, 12]} style={{ marginBottom: 16 }}>
        <Col span={6}><StatBox icon="👥" title="总记录数" value={MEET_RECORDS.length} color={COLORS.primary} /></Col>
        <Col span={6}><StatBox icon="📅" title="本月新增" value={MEET_RECORDS.filter(r => r.date?.startsWith('2026-08')).length} color="#52c41a" /></Col>
        <Col span={6}><StatBox icon="🏆" title="一把手见商" value={MEET_RECORDS.filter(r => r.level === '一把手').length} color="#ff4d4f" /></Col>
        <Col span={6}><StatBox icon="✈️" title="出差次数" value={MEET_RECORDS.filter(r => r.type === '出差').length} color="#faad14" /></Col>
      </Row>

      {/* Filter */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 12 }}>
        <Input placeholder="搜索企业/城市/部门/内容..." prefix={<SearchOutlined style={{ color: '#bfbfbf' }} />} style={{ width: 280 }} allowClear />
        <Select placeholder="会见层级" allowClear style={{ width: 130 }} options={['一把手', '分管委领导', '班子成员'].map(o => ({ value: o, label: o }))} />
        <Select placeholder="类型" allowClear style={{ width: 110 }} options={['见商', '出差'].map(o => ({ value: o, label: o }))} />
      </div>

      {/* Table */}
      <Table columns={[
        { title: '序号', width: 50, align: 'center', fixed: 'left', render: (_, __, idx) => idx + 1 },
        { title: '日期', dataIndex: 'date', width: 110, align: 'center' },
        { title: '层级', dataIndex: 'level', width: 110, align: 'center', render: v => v ? <Tag color={LEVEL_COLOR_MAP[v] || 'default'}>{v}</Tag> : '-' },
        { title: '城市', dataIndex: 'city', width: 90, align: 'center' },
        { title: '企业名称', dataIndex: 'enterprise', ellipsis: true, render: v => <Tooltip title={v}>{v}</Tooltip> },
        { title: '类型', dataIndex: 'type', width: 90, align: 'center', render: v => v ? <Tag color={TYPE_COLOR_MAP[v] || 'default'}>{v}</Tag> : '-' },
        { title: '责任部门', dataIndex: 'dept', width: 100, align: 'center' },
        { title: '洽谈内容', dataIndex: 'content', ellipsis: true, render: v => <Tooltip title={v}>{v}</Tooltip> },
        { title: '成果', dataIndex: 'result', width: 110, align: 'center', render: v => v ? <Tag color={RESULT_COLOR_MAP[v] || 'default'}>{v}</Tag> : '-' },
        { title: '状态', key: 'status', width: 90, align: 'center', render: () => <Tag color="success" style={{ margin: 0 }}>已审核</Tag> },
        { title: '操作', key: 'action', width: 100, align: 'center', fixed: 'right', render: () => <Space><a style={{ color: COLORS.primary }}>编辑</a><a style={{ color: '#8c8c8c' }}>删除</a></Space> },
      ]} dataSource={MEET_RECORDS} rowKey="id" size="small" scroll={{ x: 1000 }} pagination={{ pageSize: 10, showTotal: t => `共 ${t} 条` }} />
    </>
  )
}

/* ==================== 招商活动表格 ==================== */

function EventTable() {
  return (
    <>
      <Row gutter={[12, 12]} style={{ marginBottom: 16 }}>
        <Col span={6}><StatBox icon="🎯" title="活动总数" value={EVENT_RECORDS.length} color={COLORS.primary} /></Col>
        <Col span={6}><StatBox icon="⭐" title="重点活动" value={EVENT_RECORDS.filter(r => r.isKey).length} color="#ff4d4f" /></Col>
        <Col span={6}><StatBox icon="🏢" title="参与企业" value={EVENT_RECORDS.reduce((s, r) => s + r.enterpriseCount, 0)} color="#52c41a" /></Col>
        <Col span={6}><StatBox icon="💡" title="获取线索" value={EVENT_RECORDS.reduce((s, r) => s + r.clueCount, 0)} color="#fa8c16" /></Col>
      </Row>

      <Table columns={[
        { title: '序号', width: 50, align: 'center', render: (_, __, idx) => idx + 1 },
        { title: '活动名称', dataIndex: 'name', ellipsis: true, render: v => <Tooltip title={v}>{v}</Tooltip> },
        { title: '日期', dataIndex: 'date', width: 110, align: 'center' },
        { title: '地点', dataIndex: 'location', width: 80, align: 'center' },
        { title: '参与企业', dataIndex: 'enterpriseCount', width: 100, align: 'center', render: v => <strong>{v}家</strong> },
        { title: '获取线索', dataIndex: 'clueCount', width: 100, align: 'center', render: v => <strong style={{ color: COLORS.primary }}>{v}条</strong> },
        { title: '是否重点', dataIndex: 'isKey', width: 90, align: 'center', render: v => v ? <Tag color="red">是</Tag> : <Tag>否</Tag> },
        { title: '详情', dataIndex: 'detail', ellipsis: true, render: v => <Tooltip title={v}>{v?.slice(0, 20)}…</Tooltip> },
        { title: '状态', key: 'status', width: 90, align: 'center', render: () => <Tag color="success" style={{ margin: 0 }}>已计入</Tag> },
        { title: '操作', key: 'action', width: 100, align: 'center', fixed: 'right', render: () => <Space><a style={{ color: COLORS.primary }}>编辑</a><a style={{ color: '#8c8c8c' }}>删除</a></Space> },
      ]} dataSource={EVENT_RECORDS} rowKey="id" size="small" scroll={{ x: 1100 }} pagination={{ pageSize: 10, showTotal: t => `共 ${t} 条` }} />
    </>
  )
}

/* ==================== 新增弹窗 ==================== */

function AddModal({ visible, type, onCancel, onOk }) {
  const [form] = Form.useForm()

  if (!visible) return null

  return (
    <Modal title={`${type === 'meet' ? '新增见商记录' : '新增招商活动'}`} open={visible} onOk={() => form.validateFields().then(onOk).catch(() => {})} onCancel={onCancel} okText="提交审核" cancelText="取消" destroyOnClose width={960}>
      <div style={{ marginBottom: 12, fontSize: 13, color: '#8c8c8c' }}>请如实填写，提交后等待审核确认。</div>
      <Form form={form} layout="vertical" initialValues={{ isKey: false }}>
        {type === 'meet' ? (
          <>
            <Row gutter={24}>
              <Col span={12}><Form.Item name="date" label="日期" rules={[{ required: true, message: '请选择日期' }]}>
                <DatePicker style={{ width: '100%' }} />
              </Form.Item></Col>
              <Col span={12}><Form.Item name="level" label="会见层级" rules={[{ required: true, message: '请选择层级' }]}>
                <Select options={['一把手', '分管委领导', '班子成员'].map(o => ({ value: o, label: o }))} />
              </Form.Item></Col>
              <Col span={12}><Form.Item name="city" label="会见城市" rules={[{ required: true, message: '请输入城市' }]}>
                <Input maxLength={30} />
              </Form.Item></Col>
              <Col span={12}><Form.Item name="enterprise" label="企业名称" rules={[{ required: true, message: '请输入企业名称' }]}>
                <Input maxLength={60} />
              </Form.Item></Col>
              <Col span={12}><Form.Item name="type" label="类型" rules={[{ required: true, message: '请选择类型' }]}>
                <Select options={['见商', '出差'].map(o => ({ value: o, label: o }))} />
              </Form.Item></Col>
              <Col span={12}><Form.Item name="dept" label="责任部门" rules={[{ required: true, message: '请选择部门' }]}>
                <Select options={PARKS.map(p => ({ value: p.name, label: p.name }))} />
              </Form.Item></Col>
              <Col span={24}><Form.Item name="content" label="洽谈内容" rules={[{ required: true, message: '请输入内容' }]}>
                <TextArea rows={3} maxLength={500} showCount placeholder="最多 500 字" />
              </Form.Item></Col>
              <Col span={12}><Form.Item name="result" label="成果" rules={[{ required: true, message: '请选择成果' }]}>
                <Select options={['获取线索', '推进签约', '解决困难'].map(o => ({ value: o, label: o }))} />
              </Form.Item></Col>
            </Row>
          </>
        ) : (
          <>
            <Row gutter={24}>
              <Col span={12}><Form.Item name="name" label="活动名称" rules={[{ required: true, message: '请输入名称' }]}>
                <Input maxLength={80} />
              </Form.Item></Col>
              <Col span={12}><Form.Item name="date" label="活动日期" rules={[{ required: true, message: '请选择日期' }]}>
                <DatePicker style={{ width: '100%' }} />
              </Form.Item></Col>
              <Col span={12}><Form.Item name="location" label="活动地点" rules={[{ required: true, message: '请输入地点' }]}>
                <Input maxLength={30} />
              </Form.Item></Col>
              <Col span={12}><Form.Item name="enterpriseCount" label="参与企业数" rules={[{ required: true, message: '请输入数量' }]}>
                <InputNumber min={0} style={{ width: '100%' }} />
              </Form.Item></Col>
              <Col span={12}><Form.Item name="clueCount" label="获取线索数" rules={[{ required: true, message: '请输入数量' }]}>
                <InputNumber min={0} style={{ width: '100%' }} />
              </Form.Item></Col>
              <Col span={12}><Form.Item name="isKey" label="是否重点" valuePropName="checked" initialValue={false} extra="重点活动将额外标注并纳入通报" >
                <Switch checkedChildren="是" unCheckedChildren="否" />
              </Form.Item></Col>
              <Col span={24}><Form.Item name="detail" label="活动详情" rules={[{ required: true, message: '请输入详情' }]}>
                <TextArea rows={3} maxLength={500} showCount placeholder="最多 500 字" />
              </Form.Item></Col>
            </Row>
          </>
        )}
      </Form>
    </Modal>
  )
}

const TextArea = Input.TextArea

/* ==================== 主页面 ==================== */

export default function DailyRecords() {
  const [activeTab, setActiveTab] = useState('meet')
  const [modalVisible, setModalVisible] = useState(false)
  const [searchText, setSearchText] = useState('')

  const filteredRecords = useMemo(() => {
    if (!searchText.trim()) return activeTab === 'meet' ? MEET_RECORDS : EVENT_RECORDS
    const kw = searchText.toLowerCase()
    return activeTab === 'meet' ? MEET_RECORDS.filter(r => r.enterprise?.toLowerCase().includes(kw) || r.city?.toLowerCase().includes(kw)) : EVENT_RECORDS
  }, [searchText, activeTab])

  return (
    <div style={perfPageBg}>
      {/* ====== 标题栏 ====== */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h2 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: '#262626' }}>日常动作填报</h2>
        <Space>
          <DatePicker.RangePicker size="small" />
          <Button size="small" onClick={() => message.success('导出功能开发中')}><DownloadOutlined /></Button>
          <Button type="primary" size="small" icon={<PlusOutlined />} onClick={() => setModalVisible(true)}>新增记录</Button>
        </Space>
      </div>

      {/* ====== Tab 切换 ====== */}
      <Segmented options={[
        { label: '见商/出差记录', value: 'meet' },
        { label: '招商活动记录', value: 'event' },
      ]} value={activeTab} onChange={(v) => { setActiveTab(v); setSearchText('') }} size="large" style={{ marginBottom: 20 }} />

      {/* ====== 内容 ====== */}
      <Card style={perfCardStyle} bodyStyle={{ padding: '0 20px 20px' }}>
        {activeTab === 'meet' && <MeetTable />}
        {activeTab === 'event' && <EventTable />}
      </Card>

      {/* ====== 新增弹窗 ====== */}
      <AddModal visible={modalVisible} type={activeTab} onCancel={() => setModalVisible(false)} onOk={() => { message.success('提交成功，待审核'); setModalVisible(false) }} />
    </div>
  )
}
