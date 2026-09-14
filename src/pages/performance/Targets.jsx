import { useState, useMemo, useCallback } from 'react'
import { Table, Button, Space, Segmented, Select, Modal, Form, Input, InputNumber, Row, Col, Tag, message, Card, Upload, Radio } from 'antd'
import { EditOutlined, UploadOutlined, FileExcelOutlined, PlusOutlined } from '@ant-design/icons'
import { PARKS, SOES, DEPTS, PARK_TARGETS, SOE_TARGETS, DEPT_TARGETS, PARK_INDICATORS, SOE_INDICATORS } from '../../constants/performanceData'
import { perfPageBg, perfCardStyle } from '../../constants/performanceStyles'
import { COLORS } from '../../constants/uiStyles'

/* ==================== 园区表格 ==================== */

function ParkTable({ onEdit, period }) {
  const targetInds = PARK_INDICATORS.filter(i => i.type === 'target')
  const cumInds = PARK_INDICATORS.filter(i => i.type === 'cumulative')

  const columns = [
    { title: '园区', dataIndex: 'name', key: 'name', width: 110, align: 'center', fixed: 'left', render: t => <strong>{t}</strong> },
    { title: '任务名称', dataIndex: 'taskName', key: 'taskName', ellipsis: true, minWidth: 200,
      render: (_, row) => row.period ? `${row.period}${row.name}考核` : <span style={{ color: '#bfbfbf' }}>未设定</span> },
    ...targetInds.map(ind => ({
      title: `${ind.label}（${ind.unit}）`,
      dataIndex: [ind.key, 'target'],
      key: `${ind.key}-target`,
      width: 110,
      align: 'center',
      render: v => v != null ? <Tag color="blue" style={{ margin: 0, fontWeight: 600 }}>{v}</Tag> : <span style={{ color: '#bfbfbf' }}>未设定</span>,
    })),
    ...cumInds.map(ind => ({
      title: (
        <span>
          {ind.label}
          <Tag color="default" style={{ marginLeft: 4, fontSize: 10 }}>选填</Tag>
        </span>
      ),
      dataIndex: [ind.key, 'target'],
      key: `${ind.key}-target`,
      width: 110,
      align: 'center',
      render: v => v != null ? <Tag color="blue" style={{ margin: 0 }}>{v}</Tag> : <span style={{ color: '#d9d9d9' }}>—</span>,
    })),
    { title: '考核周期', dataIndex: 'period', key: 'period', width: 130, align: 'center',
      render: v => v ? <Tag color="blue" style={{ margin: 0 }}>{v}</Tag> : <span style={{ color: '#bfbfbf' }}>未设定</span> },
    { title: '状态', dataIndex: 'status', key: 'status', width: 90, align: 'center',
      render: (_, row) => {
        if (!row.period) return <Tag color="default">未设定</Tag>
        const isExpired = row.period.startsWith('2025') || row.period.includes('2024')
        return isExpired
          ? <Tag color="default" style={{ margin: 0 }}>已过期</Tag>
          : <Tag color="success" style={{ margin: 0 }}>已下发</Tag>
      }},
    { title: '操作', key: 'action', width: 120, align: 'center', fixed: 'right', render: (_, record) => {
      const isExpired = record.period && (record.period.startsWith('2025') || record.period.includes('2024'))
      return (
        <Button type="link" size="small" disabled={isExpired} onClick={() => onEdit(record, 'park')}><EditOutlined /> 编辑下发</Button>
      )
    }},
  ]

  return (
    <Table columns={columns} dataSource={PARK_TARGETS} rowKey="key" size="small" scroll={{ x: 800 }} pagination={false} />
  )
}

/* ==================== 国企表格 ==================== */

function SoeTable({ onEdit }) {
  const columns = [
    { title: '国企', dataIndex: 'name', key: 'name', width: 130, align: 'center', fixed: 'left', render: t => <strong>{t}</strong> },
    { title: '任务名称', dataIndex: 'taskName', key: 'taskName', ellipsis: true, minWidth: 200,
      render: (_, row) => row.period ? `${row.period}${row.name}考核` : <span style={{ color: '#bfbfbf' }}>未设定</span> },
    ...SOE_INDICATORS.map(ind => ({
      title: `${ind.label}（${ind.unit}）`,
      dataIndex: [ind.key, 'target'],
      key: `${ind.key}-target`,
      width: 110,
      align: 'center',
      render: v => v != null ? <Tag color="blue" style={{ margin: 0, fontWeight: 600 }}>{v}</Tag> : <span style={{ color: '#bfbfbf' }}>未设定</span>,
    })),
    { title: '考核周期', dataIndex: 'period', key: 'period', width: 130, align: 'center',
      render: v => v ? <Tag color="blue" style={{ margin: 0 }}>{v}</Tag> : <span style={{ color: '#bfbfbf' }}>未设定</span> },
    { title: '状态', key: 'status', width: 90, align: 'center',
      render: (_, row) => {
        if (!row.period) return <Tag color="default">未设定</Tag>
        const isExpired = row.period.startsWith('2025') || row.period.includes('2024')
        return isExpired
          ? <Tag color="default" style={{ margin: 0 }}>已过期</Tag>
          : <Tag color="success" style={{ margin: 0 }}>已下发</Tag>
      }},
    { title: '操作', key: 'action', width: 120, align: 'center', fixed: 'right', render: (_, record) => {
      const isExpired = record.period && (record.period.startsWith('2025') || record.period.includes('2024'))
      return (
        <Button type="link" size="small" disabled={isExpired} onClick={() => onEdit(record, 'soe')}><EditOutlined /> 编辑下发</Button>
      )
    }},
  ]

  return (
    <Table columns={columns} dataSource={SOE_TARGETS} rowKey="key" size="small" scroll={{ x: 850 }} pagination={false} />
  )
}

/* ==================== 部门表格 ==================== */

function DeptTable({ onEdit }) {
  const flatData = useMemo(() => {
    const rows = []
    DEPT_TARGETS.forEach((dept) => {
      dept.targets.forEach((t, idx) => {
        rows.push({
          key: `${dept.key}-${idx}`, deptKey: dept.key, name: dept.name, text: t.text,
          targetVal: t.targetVal, remark: t.remark, period: t.period,
          isFirst: idx === 0, rowSpan: idx === 0 ? dept.targets.length : 0,
        })
      })
    })
    return rows
  }, [])

  const columns = [
    { title: '部门', dataIndex: 'name', key: 'name', width: 110, align: 'center', fixed: 'left',
      render: (t, r) => r.isFirst ? <span style={{ fontWeight: 700, fontSize: 14 }}>{t}</span> : null,
      onCell: (record) => ({ rowSpan: record.rowSpan }),
    },
    { title: '任务名称', key: 'taskName', ellipsis: true, minWidth: 200,
      render: (_, row) => row.period ? `${row.period}${row.name}考核` : <span style={{ color: '#bfbfbf' }}>未设定</span> },
    { title: '目标任务', dataIndex: 'text', key: 'text', ellipsis: true, minWidth: 280 },
    { title: '目标值', dataIndex: 'targetVal', key: 'targetVal', width: 110, align: 'center',
      render: v => v ? <Tag color="blue" style={{ margin: 0, fontWeight: 600 }}>{v}</Tag> : <span style={{ color: '#bfbfbf' }}>文字目标</span> },
    { title: '考核周期', dataIndex: 'period', key: 'period', width: 130, align: 'center',
      render: v => v ? <Tag color="blue" style={{ margin: 0 }}>{v}</Tag> : <span style={{ color: '#bfbfbf' }}>未设定</span> },
    { title: '状态', key: 'status', width: 90, align: 'center',
      render: (_, row) => {
        if (!row.period) return <Tag color="default">未设定</Tag>
        const isExpired = row.period.startsWith('2025') || row.period.includes('2024')
        return isExpired
          ? <Tag color="default" style={{ margin: 0 }}>已过期</Tag>
          : <Tag color="success" style={{ margin: 0 }}>已下发</Tag>
      }},
    { title: '备注', key: 'remark', minWidth: 200, ellipsis: true,
      render: (_, row) => row.remark ? <span style={{ fontSize: 12, color: '#595959' }}>{row.remark}</span> : '-',
    },
    { title: '操作', key: 'action', width: 120, align: 'center', fixed: 'right', render: (_, record) => {
      const isExpired = record.period && (record.period.startsWith('2025') || record.period.includes('2024'))
      return (
        <Button type="link" size="small" disabled={isExpired} onClick={() => onEdit(record, 'dept')}><EditOutlined /> 编辑下发</Button>
      )
    }},
  ]

  return (
    <Table columns={columns} dataSource={flatData} rowKey="key" size="small" scroll={{ x: 800 }} pagination={false} bordered />
  )
}

/* ==================== 编辑/下发弹窗 ==================== */

function EditTargetModal({ open, record, type, onCancel, onOk }) {
  const [form] = Form.useForm()
  const parkIndicators = PARK_INDICATORS
  const soeIndicators = SOE_INDICATORS

  // 考核对象选项
  const unitOptions = useMemo(() => {
    if (type === 'park') return PARKS.map(p => ({ value: p.key, label: p.name }))
    if (type === 'soe') return SOES.map(s => ({ value: s.key, label: s.name }))
    if (type === 'dept') return DEPTS.map(d => ({ value: d.key, label: d.name }))
    return []
  }, [type])

  // 考核周期选项：园区=近10年年度 + 当年第一季度；国企/部门=近10年年度
  const periodOptions = useMemo(() => {
    const currentYear = new Date().getFullYear()
    const years = []
    for (let y = currentYear; y >= currentYear - 9; y--) {
      years.push({ value: y + '年度', label: y + '年度' })
    }
    if (type === 'park') {
      // 园区增加当年第一季度
      years.splice(1, 0, { value: currentYear + '年第一季度', label: currentYear + '年第一季度' })
    }
    return years
  }, [type])

  const initialValues = useMemo(() => {
    if (!record) return { period: '2026年度' }
    if (type === 'dept') return {
      unitKey: record.deptKey,
      text: record.text,
      targetVal: record.targetVal,
      remark: record.remark,
      period: record.period,
    }
    const indicators = type === 'park' ? parkIndicators : soeIndicators
    const vals = { unitKey: record.key }
    indicators.forEach((ind) => {
      vals[ind.key] = record[ind.key]?.target ?? undefined
    })
    vals.period = record.period
    return vals
  }, [record, type, parkIndicators, soeIndicators])

  const isEdit = !!record

  const renderField = (ind) => {
    const isOptional = ind.type === 'cumulative'
    return (
      <Col span={12} key={ind.key}>
        <Form.Item
          name={ind.key}
          label={
            <span>
              {ind.label}（{ind.unit}）
              {isOptional && <Tag color="default" style={{ marginLeft: 6, fontSize: 10 }}>选填</Tag>}
            </span>
          }
          rules={!isOptional ? [{ required: true, message: `请输入${ind.label}目标值` }] : []}
        >
          <InputNumber
            style={{ width: '100%' }}
            min={0}
            precision={['亿元', '万美元'].includes(ind.unit) ? 2 : 0}
            placeholder={isOptional ? '可不填' : '请输入目标值'}
          />
        </Form.Item>
      </Col>
    )
  }

  return (
    <Modal
      title={isEdit ? '编辑目标' : '下发目标'}
      open={open}
      onOk={() => form.validateFields().then(vals => onOk(vals)).catch(() => {})}
      onCancel={onCancel}
      okText="确定并下发"
      cancelText="取消"
      destroyOnHidden
      width={type === 'dept' ? 520 : 800}
    >
      <Form form={form} layout="vertical" initialValues={initialValues}>
        <Form.Item name="unitKey" label="考核对象" rules={[{ required: true, message: '请选择考核对象' }]}>
          <Select options={unitOptions} placeholder="请选择" disabled={isEdit} />
        </Form.Item>
        <Form.Item name="period" label="考核周期" rules={[{ required: true, message: '请选择考核周期' }]}>
          <Select options={periodOptions} placeholder="请选择考核周期" />
        </Form.Item>
        <Form.Item name="taskName" label="目标名称" rules={[{ required: true, message: '请输入目标名称' }]}>
          <Input maxLength={50} placeholder="如：2026年度生物城考核" />
        </Form.Item>
        {type === 'dept' ? (
          <>
            <Form.Item name="text" label="目标任务" rules={[{ required: true, message: '请输入目标任务' }]}>
              <Input.TextArea rows={2} maxLength={200} showCount placeholder="请输入目标任务描述" />
            </Form.Item>
            <Form.Item name="targetVal" label="目标值">
              <InputNumber style={{ width: '100%' }} min={0} placeholder="请输入目标值（文字目标可留空）" />
            </Form.Item>
            <Form.Item name="remark" label="备注说明">
              <Input placeholder="选填" />
            </Form.Item>
          </>
        ) : (
          <Row gutter={24}>
            {(type === 'park' ? parkIndicators : soeIndicators).map(ind => renderField(ind))}
          </Row>
        )}
      </Form>
    </Modal>
  )
}

/* ==================== 批量下发弹窗 ==================== */

function BatchUploadModal({ open, onCancel }) {
  const [uploadType, setUploadType] = useState('park')
  const [fileList, setFileList] = useState([])

  const typeOptions = [
    { label: '园区目标', value: 'park', count: PARKS.length },
    { label: '国企目标', value: 'soe', count: SOES.length },
    { label: '部门目标', value: 'dept', count: DEPTS.length },
  ]

  const handleUpload = () => {
    if (fileList.length === 0) {
      message.warning('请先上传目标表格')
      return
    }
    const typeName = typeOptions.find(o => o.value === uploadType)?.label || ''
    message.success(`${typeName}下发成功，共 ${typeOptions.find(o => o.value === uploadType)?.count} 条记录已更新`)
    onCancel()
  }

  return (
    <Modal title="批量下发目标" open={open} onCancel={onCancel} onOk={handleUpload} okText="确认下发" cancelText="取消" destroyOnHidden width={520}>
      <div style={{ marginBottom: 16 }}>
        <div style={{ marginBottom: 8, fontWeight: 600 }}>第一步：选择考核对象类别</div>
        <Radio.Group value={uploadType} onChange={e => setUploadType(e.target.value)} optionType="button" buttonStyle="solid">
          {typeOptions.map(opt => (
            <Radio.Button key={opt.value} value={opt.value}>{opt.label}（{opt.count}）</Radio.Button>
          ))}
        </Radio.Group>
      </div>

      <div style={{ marginBottom: 16 }}>
        <div style={{ marginBottom: 8, fontWeight: 600 }}>第二步：上传目标表格</div>
        <Upload
          fileList={fileList}
          onChange={({ fileList: list }) => setFileList(list)}
          beforeUpload={() => false}
          maxCount={1}
          accept=".xlsx,.xls"
        >
          <Button icon={<UploadOutlined />}>选择文件</Button>
        </Upload>
        <div style={{ marginTop: 8, fontSize: 12, color: '#8c8c8c' }}>
          <FileExcelOutlined style={{ marginRight: 4 }} />
          支持 .xlsx / .xls 格式，表格中需填写考核周期
          <a style={{ marginLeft: 8, color: COLORS.primary }}>下载模板</a>
        </div>
      </div>

      <div style={{ padding: '12px 16px', background: '#f6ffed', borderRadius: 6, fontSize: 12, color: '#389e0d' }}>
        注意：表格中的目标将覆盖对应周期的现有设定，请确认无误后再下发。
      </div>
    </Modal>
  )
}

/* ==================== 主页面 ==================== */

export default function Targets() {
  const [activeTab, setActiveTab] = useState('park')
  const [periodType, setPeriodType] = useState('year') // year | q1（仅园区使用）
  const [yearSelect, setYearSelect] = useState('2026') // 国企/部门使用的年度选择
  const [modalOpen, setModalOpen] = useState(false)
  const [editRecord, setEditRecord] = useState(null)
  const [editType, setEditType] = useState('park')
  const [batchOpen, setBatchOpen] = useState(false)

  const yearOptions = useMemo(() => {
    const currentYear = new Date().getFullYear()
    const years = []
    for (let y = currentYear; y >= currentYear - 9; y--) {
      years.push({ value: String(y), label: y + '年度' })
    }
    return years
  }, [])

  const period = useMemo(() => {
    if (activeTab === 'park') {
      if (periodType === 'q1') return { key: '2026-q1', label: '2026年第一季度' }
      return { key: '2026', label: '2026年度' }
    }
    return { key: yearSelect, label: yearSelect + '年度' }
  }, [periodType, activeTab, yearSelect])

  const handleEdit = useCallback((record, type) => {
    setEditRecord(record); setEditType(type); setModalOpen(true)
  }, [])

  return (
    <div style={perfPageBg}>
      {/* ====== 标题栏 ====== */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h2 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: '#262626' }}>考核目标设定</h2>
      </div>

      {/* ====== 顶栏：类型切换 + 周期筛选 + 操作按钮 ====== */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <Segmented options={[
          { label: '园区目标', value: 'park' },
          { label: '国企目标', value: 'soe' },
          { label: '部门目标', value: 'dept' },
        ]} value={activeTab} onChange={setActiveTab} size="large" />
        <Space>
          {activeTab === 'park' ? (
            <Segmented value={periodType} onChange={setPeriodType} size="small" options={[
              { label: '年度', value: 'year' },
              { label: '第一季度', value: 'q1' },
            ]} />
          ) : (
            <Select value={yearSelect} onChange={setYearSelect} size="small" style={{ width: 120 }} options={yearOptions} />
          )}
          <Button type="primary" onClick={() => { setEditType(activeTab); setEditRecord(null); setModalOpen(true) }} icon={<PlusOutlined />}>单独下发</Button>
          <Button onClick={() => setBatchOpen(true)} icon={<UploadOutlined />}>批量下发</Button>
        </Space>
      </div>

      {/* ====== 内容 ====== */}
      <Card style={perfCardStyle} bodyStyle={{ padding: '0 16px 16px' }}>
        {activeTab === 'park' && <ParkTable onEdit={handleEdit} period={period} />}
        {activeTab === 'soe' && <SoeTable onEdit={handleEdit} />}
        {activeTab === 'dept' && <DeptTable onEdit={handleEdit} />}
      </Card>

      {/* ====== 编辑/下发弹窗 ====== */}
      {modalOpen && (
        <EditTargetModal
          open={modalOpen}
          record={editRecord}
          type={editType}
          onCancel={() => setModalOpen(false)}
          onOk={() => { message.success('目标下发成功'); setModalOpen(false) }}
        />
      )}

      {/* ====== 批量下发弹窗 ====== */}
      <BatchUploadModal open={batchOpen} onCancel={() => { setBatchOpen(false); setFileList([]) }} />
    </div>
  )
}
