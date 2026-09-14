import { useState, useMemo } from 'react'
import {
  Table,
  Button,
  Select,
  Tag,
  Modal,
  Form,
  Input,
  Switch,
  Space,
  message,
} from 'antd'
import {
  EditOutlined,
  ReloadOutlined,
  PlusOutlined,
} from '@ant-design/icons'

const STAGE_OPTIONS = [
  { label: '全部阶段', value: '' },
  { label: '在谈阶段', value: 'zaitan' },
  { label: '研判阶段', value: 'yanpan' },
  { label: '签约阶段', value: 'qianyue' },
  { label: '落地阶段', value: 'luodi' },
  { label: '谋划阶段', value: 'mouhua' },
]

const FIELD_TYPE_MAP = {
  text: { label: '文本', color: 'blue' },
  textarea: { label: '多行文本', color: 'cyan' },
  select: { label: '下拉选择', color: 'purple' },
  number: { label: '数字', color: 'orange' },
  date: { label: '日期', color: 'green' },
  money: { label: '金额', color: 'gold' },
  radio: { label: '单选', color: 'geekblue' },
}

const MOCK_DATA = [
  { key: 1, fieldName: '项目名称', fieldKey: 'projectName', stage: 'zaitan', fieldType: 'text', required: true, enabled: true },
  { key: 2, fieldName: '申报人', fieldKey: 'reporter', stage: 'zaitan', fieldType: 'text', required: true, enabled: true },
  { key: 3, fieldName: '投资金额', fieldKey: 'investAmount', stage: 'zaitan', fieldType: 'money', required: true, enabled: true },
  { key: 4, fieldName: '产业类别', fieldKey: 'industryCategory', stage: 'zaitan', fieldType: 'select', required: true, enabled: true },
  { key: 5, fieldName: '行业类别', fieldKey: 'industryType', stage: 'zaitan', fieldType: 'select', required: false, enabled: true },
  { key: 6, fieldName: '项目简介', fieldKey: 'projectDesc', stage: 'zaitan', fieldType: 'textarea', required: false, enabled: true },
  { key: 7, fieldName: '来源地', fieldKey: 'sourceArea', stage: 'zaitan', fieldType: 'text', required: false, enabled: true },
  { key: 8, fieldName: '签约时间', fieldKey: 'signDate', stage: 'qianyue', fieldType: 'date', required: true, enabled: true },
  { key: 9, fieldName: '合同金额', fieldKey: 'contractAmount', stage: 'qianyue', fieldType: 'money', required: true, enabled: true },
  { key: 10, fieldName: '签约方', fieldKey: 'signParty', stage: 'qianyue', fieldType: 'text', required: true, enabled: true },
  { key: 11, fieldName: '落地时间', fieldKey: 'landDate', stage: 'luodi', fieldType: 'date', required: true, enabled: true },
  { key: 12, fieldName: '营业执照号', fieldKey: 'licenseNo', stage: 'luodi', fieldType: 'text', required: false, enabled: true },
  { key: 13, fieldName: '投产时间', fieldKey: 'productionDate', stage: 'luodi', fieldType: 'date', required: false, enabled: false },
  { key: 14, fieldName: '研判结论', fieldKey: 'decisionResult', stage: 'yanpan', fieldType: 'radio', required: true, enabled: true },
  { key: 15, fieldName: '研判意见', fieldKey: 'decisionOpinion', stage: 'yanpan', fieldType: 'textarea', required: false, enabled: true },
  { key: 16, fieldName: '谋划方向', fieldKey: 'planDirection', stage: 'mouhua', fieldType: 'select', required: true, enabled: true },
  { key: 17, fieldName: '预计投资', fieldKey: 'expectedInvest', stage: 'mouhua', fieldType: 'money', required: false, enabled: false },
]

const stageLabel = (key) => {
  const s = STAGE_OPTIONS.find(o => o.value === key)
  return s ? s.label : key
}

export default function Field() {
  const [stageFilter, setStageFilter] = useState('')
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10 })
  const [modalOpen, setModalOpen] = useState(false)
  const [editingRecord, setEditingRecord] = useState(null)
  const [form] = Form.useForm()
  const [data, setData] = useState(MOCK_DATA)

  const filteredData = useMemo(() => {
    if (!stageFilter) return data
    return data.filter(r => r.stage === stageFilter)
  }, [data, stageFilter])

  const pageData = useMemo(() => {
    const start = (pagination.current - 1) * pagination.pageSize
    return filteredData.slice(start, start + pagination.pageSize)
  }, [filteredData, pagination])

  const handleToggleEnabled = (record, checked) => {
    setData(prev => prev.map(item =>
      item.key === record.key ? { ...item, enabled: checked } : item
    ))
    message.success(`已${checked ? '启用' : '禁用'}字段「${record.fieldName}」`)
  }

  const handleEdit = (record) => {
    setEditingRecord(record)
    form.setFieldsValue(record)
    setModalOpen(true)
  }

  const handleAdd = () => {
    setEditingRecord(null)
    form.resetFields()
    setModalOpen(true)
  }

  const handleModalOk = () => {
    form.validateFields().then(values => {
      if (editingRecord) {
        setData(prev => prev.map(item =>
          item.key === editingRecord.key ? { ...item, ...values } : item
        ))
        message.success('编辑成功')
      } else {
        const newKey = Math.max(...data.map(d => d.key)) + 1
        setData(prev => [...prev, { key: newKey, ...values, enabled: true }])
        message.success('新增成功')
      }
      setModalOpen(false)
    })
  }

  const columns = [
    { title: '字段名称', dataIndex: 'fieldName', key: 'fieldName', width: 140 },
    { title: '字段标识', dataIndex: 'fieldKey', key: 'fieldKey', width: 160 },
    {
      title: '所属阶段', dataIndex: 'stage', key: 'stage', width: 110, align: 'center',
      render: (v) => <Tag color="blue" style={{ margin: 0 }}>{stageLabel(v)}</Tag>,
    },
    {
      title: '字段类型', dataIndex: 'fieldType', key: 'fieldType', width: 110, align: 'center',
      render: (v) => {
        const cfg = FIELD_TYPE_MAP[v] || { label: v, color: 'default' }
        return <Tag color={cfg.color} style={{ margin: 0 }}>{cfg.label}</Tag>
      },
    },
    {
      title: '是否必填', dataIndex: 'required', key: 'required', width: 100, align: 'center',
      render: (v) => v
        ? <Tag color="red" style={{ margin: 0 }}>必填</Tag>
        : <Tag color="default" style={{ margin: 0 }}>选填</Tag>,
    },
    {
      title: '是否启用', dataIndex: 'enabled', key: 'enabled', width: 100, align: 'center',
      render: (_, record) => (
        <Switch
          checked={record.enabled}
          checkedChildren="启用"
          unCheckedChildren="禁用"
          size="small"
          onChange={(checked) => handleToggleEnabled(record, checked)}
        />
      ),
    },
    {
      title: '操作', key: 'action', width: 100, align: 'center', fixed: 'right',
      render: (_, record) => (
        <span className="action-link" onClick={() => handleEdit(record)}>
          <EditOutlined /> 编辑
        </span>
      ),
    },
  ]

  return (
    <div className="page-container">
      <div className="filter-bar">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
            新增字段
          </Button>
          <Select
            style={{ width: 160 }}
            placeholder="所属阶段"
            value={stageFilter}
            onChange={(v) => { setStageFilter(v); setPagination(p => ({ ...p, current: 1 })) }}
            options={STAGE_OPTIONS}
          />
          <Button icon={<ReloadOutlined />} onClick={() => { setStageFilter(''); setPagination({ current: 1, pageSize: 10 }) }}>
            重置
          </Button>
          <div style={{ marginLeft: 'auto', fontSize: 13, color: '#999' }}>
            提示：通过开关控制字段是否在各阶段表单中显示
          </div>
        </div>
      </div>

      <div className="table-card">
        <div className="table-toolbar">
          <div className="table-toolbar-left" style={{ fontSize: 14, color: '#666' }}>
            共 <span style={{ color: '#1677ff', fontWeight: 600 }}>{filteredData.length}</span> 个字段配置
          </div>
        </div>
        <Table
          columns={columns}
          dataSource={pageData}
          rowKey="key"
          size="middle"
          pagination={{
            ...pagination,
            total: filteredData.length,
            showSizeChanger: true,
            showQuickJumper: true,
            pageSizeOptions: ['10', '20', '50'],
            showTotal: (total) => `共 ${total} 条`,
            onChange: (page, pageSize) => setPagination({ current: page, pageSize }),
          }}
        />
      </div>

      <Modal
        title={editingRecord ? '编辑字段' : '新增字段'}
        open={modalOpen}
        onOk={handleModalOk}
        onCancel={() => setModalOpen(false)}
        okText="确定"
        cancelText="取消"
        destroyOnClose
        width={500}
      >
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item name="fieldName" label="字段名称" rules={[{ required: true, message: '请输入字段名称' }]}>
            <Input placeholder="如：项目名称" />
          </Form.Item>
          <Form.Item name="fieldKey" label="字段标识" rules={[{ required: true, message: '请输入字段标识' }]}>
            <Input placeholder="如：projectName" />
          </Form.Item>
          <Form.Item name="stage" label="所属阶段" rules={[{ required: true, message: '请选择所属阶段' }]}>
            <Select placeholder="请选择阶段" options={STAGE_OPTIONS.filter(o => o.value)} />
          </Form.Item>
          <Form.Item name="fieldType" label="字段类型" rules={[{ required: true, message: '请选择字段类型' }]}>
            <Select placeholder="请选择字段类型" options={Object.entries(FIELD_TYPE_MAP).map(([k, v]) => ({ label: v.label, value: k }))} />
          </Form.Item>
          <Form.Item name="required" label="是否必填" valuePropName="checked" initialValue={false}>
            <Switch checkedChildren="必填" unCheckedChildren="选填" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}
