import { useState, useMemo } from 'react'
import {
  Table,
  Button,
  Input,
  Select,
  Tag,
  Modal,
  Form,
  message,
  Alert,
} from 'antd'
import {
  SearchOutlined,
  ReloadOutlined,
  TeamOutlined,
  InfoCircleOutlined,
} from '@ant-design/icons'

const ROLE_OPTIONS = [
  { label: '系统管理员', value: 'admin' },
  { label: '区级领导', value: 'district_leader' },
  { label: '区投促局', value: 'district_bureau' },
  { label: '园区管理员', value: 'park_admin' },
  { label: '项目专员', value: 'specialist' },
]

const ROLE_FILTER_OPTIONS = [{ label: '全部角色', value: '' }, ...ROLE_OPTIONS]

// 账号由OA系统统一提供，本系统仅支持绑定角色
const MOCK_DATA = [
  { key: 1, username: 'admin', name: '系统管理员', department: '区投促局', role: 'admin', status: 'enabled', createdAt: '2025-01-10 09:00:00' },
  { key: 2, username: 'zhangwei', name: '张伟', department: '区投促局', role: 'district_bureau', status: 'enabled', createdAt: '2025-02-15 14:30:00' },
  { key: 3, username: 'liming', name: '李明', department: '区级领导', role: 'district_leader', status: 'enabled', createdAt: '2025-03-01 10:20:00' },
  { key: 4, username: 'wangfang', name: '王芳', department: '光谷园区', role: 'park_admin', status: 'enabled', createdAt: '2025-03-12 16:45:00' },
  { key: 5, username: 'chenqiang', name: '陈强', department: '区投促局', role: 'specialist', status: 'disabled', createdAt: '2025-04-05 11:00:00' },
  { key: 6, username: 'liuyang', name: '刘洋', department: '东湖园区', role: 'park_admin', status: 'enabled', createdAt: '2025-04-20 09:30:00' },
  { key: 7, username: 'zhaomin', name: '赵敏', department: '区投促局', role: 'specialist', status: 'enabled', createdAt: '2025-05-08 13:15:00' },
  { key: 8, username: 'sunlei', name: '孙磊', department: '区级领导', role: 'district_leader', status: 'enabled', createdAt: '2025-05-22 15:00:00' },
  { key: 9, username: 'zhoujing', name: '周静', department: '经开园区', role: 'park_admin', status: 'disabled', createdAt: '2025-06-01 08:45:00' },
  { key: 10, username: 'wuhua', name: '吴华', department: '区投促局', role: 'district_bureau', status: 'enabled', createdAt: '2025-06-15 10:30:00' },
  { key: 11, username: 'zhenglin', name: '郑琳', department: '光谷园区', role: 'specialist', status: 'enabled', createdAt: '2025-07-01 14:00:00' },
  { key: 12, username: 'huangtao', name: '黄涛', department: '区投促局', role: 'specialist', status: 'enabled', createdAt: '2025-07-20 16:20:00' },
]

export default function Account() {
  const [searchText, setSearchText] = useState('')
  const [roleFilter, setRoleFilter] = useState('')
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10 })
  const [bindOpen, setBindOpen] = useState(false)
  const [bindRecord, setBindRecord] = useState(null)
  const [form] = Form.useForm()
  const [data, setData] = useState(MOCK_DATA)

  const roleLabel = (roleKey) => {
    const r = ROLE_OPTIONS.find(o => o.value === roleKey)
    return r ? r.label : roleKey
  }

  const filteredData = useMemo(() => {
    return data.filter(r => {
      if (searchText && !r.username.includes(searchText) && !r.name.includes(searchText)) return false
      if (roleFilter && r.role !== roleFilter) return false
      return true
    })
  }, [data, searchText, roleFilter])

  const pageData = useMemo(() => {
    const start = (pagination.current - 1) * pagination.pageSize
    return filteredData.slice(start, start + pagination.pageSize)
  }, [filteredData, pagination])

  const handleReset = () => {
    setSearchText('')
    setRoleFilter('')
    setPagination({ current: 1, pageSize: 10 })
  }

  const handleBind = (record) => {
    setBindRecord(record)
    form.setFieldsValue({ role: record.role })
    setBindOpen(true)
  }

  const handleBindOk = () => {
    form.validateFields().then(values => {
      setData(prev => prev.map(item =>
        item.key === bindRecord.key ? { ...item, role: values.role } : item
      ))
      message.success(`已为「${bindRecord.name}」绑定角色：${roleLabel(values.role)}`)
      setBindOpen(false)
      setBindRecord(null)
    })
  }

  const columns = [
    { title: '用户名', dataIndex: 'username', key: 'username', width: 130 },
    { title: '姓名', dataIndex: 'name', key: 'name', width: 110 },
    { title: '部门', dataIndex: 'department', key: 'department', width: 130 },
    {
      title: '角色', dataIndex: 'role', key: 'role', width: 130, align: 'center',
      render: (v) => <Tag color="blue">{roleLabel(v)}</Tag>,
    },
    {
      title: '状态', dataIndex: 'status', key: 'status', width: 100, align: 'center',
      render: (v) => v === 'enabled'
        ? <Tag color="success" style={{ margin: 0 }}>启用</Tag>
        : <Tag style={{ margin: 0 }}>停用</Tag>,
    },
    { title: '创建时间', dataIndex: 'createdAt', key: 'createdAt', width: 180, align: 'center' },
    {
      title: '操作', key: 'action', width: 140, align: 'center', fixed: 'right',
      render: (_, record) => (
        <span className="action-link" onClick={() => handleBind(record)}>
          <TeamOutlined /> 绑定角色
        </span>
      ),
    },
  ]

  return (
    <div className="page-container">
      <div className="filter-bar">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          <Input
            style={{ width: 240 }}
            placeholder="搜索用户名/姓名"
            prefix={<SearchOutlined style={{ color: '#bfbfbf' }} />}
            value={searchText}
            onChange={(e) => { setSearchText(e.target.value); setPagination(p => ({ ...p, current: 1 })) }}
            allowClear
          />
          <Select
            style={{ width: 160 }}
            placeholder="筛选角色"
            value={roleFilter}
            onChange={(v) => { setRoleFilter(v); setPagination(p => ({ ...p, current: 1 })) }}
            options={ROLE_FILTER_OPTIONS}
          />
          <Button icon={<ReloadOutlined />} onClick={handleReset}>
            重置
          </Button>
        </div>
      </div>

      <div className="table-card">
        <div className="table-toolbar">
          <div className="table-toolbar-left" style={{ fontSize: 14, color: '#666' }}>
            共 <span style={{ color: '#1677ff', fontWeight: 600 }}>{filteredData.length}</span> 个账号
          </div>
        </div>
        <Alert
          message="账号由OA系统统一提供并同步，本系统不支持新增、编辑、删除及启用/停用操作，仅支持为账号绑定平台角色。"
          type="info"
          showIcon
          icon={<InfoCircleOutlined />}
          style={{ margin: '0 16px 16px' }}
        />
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
        title="绑定角色"
        open={bindOpen}
        onOk={handleBindOk}
        onCancel={() => { setBindOpen(false); setBindRecord(null) }}
        okText="确定"
        cancelText="取消"
        destroyOnClose
        width={480}
      >
        <div style={{ padding: '8px 0 16px', fontSize: 13, color: '#595959' }}>
          账号：<span style={{ fontWeight: 600, color: '#262626' }}>{bindRecord?.name}（{bindRecord?.username}）</span>
          <span style={{ color: '#bfbfbf', marginLeft: 12 }}>{bindRecord?.department}</span>
        </div>
        <Form form={form} layout="vertical">
          <Form.Item name="role" label="平台角色" rules={[{ required: true, message: '请选择角色' }]}>
            <Select placeholder="请选择角色" options={ROLE_OPTIONS} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}
