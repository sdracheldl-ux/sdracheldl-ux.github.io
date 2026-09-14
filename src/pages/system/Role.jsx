import { useState, useMemo } from 'react'
import {
  Table,
  Button,
  Space,
  Tag,
  Modal,
  Form,
  Input,
  Tree,
  message,
  Popconfirm,
} from 'antd'
import {
  PlusOutlined,
  SafetyOutlined,
  EditOutlined,
  DeleteOutlined,
  ReloadOutlined,
} from '@ant-design/icons'

const PERMISSION_TREE = [
  {
    title: '项目全周期管理',
    key: 'project',
    children: [
      { title: '在谈项目', key: 'project_zaitan' },
      { title: '研判项目', key: 'project_yanpan' },
      { title: '签约项目', key: 'project_qianyue' },
      { title: '落地项目', key: 'project_luodi' },
      { title: '退库项目', key: 'project_tuiku' },
      { title: '项目谋划', key: 'project_mouhua' },
    ],
  },
  {
    title: '绩效考核',
    key: 'performance',
    children: [
      { title: '考核指标配置', key: 'perf_config' },
      { title: '考核数据录入', key: 'perf_input' },
      { title: '考核结果查看', key: 'perf_view' },
    ],
  },
  {
    title: '统计看板',
    key: 'dashboard',
    children: [
      { title: '项目看板', key: 'dash_project' },
      { title: '绩效看板', key: 'dash_perf' },
    ],
  },
  {
    title: '系统管理',
    key: 'system',
    children: [
      { title: '账号管理', key: 'sys_account' },
      { title: '角色管理', key: 'sys_role' },
      { title: '日志管理', key: 'sys_log' },
      { title: '字段管理', key: 'sys_field' },
      { title: '超期设置', key: 'sys_overdue' },
      { title: '消息通知', key: 'sys_notice' },
    ],
  },
]

const findAllKeys = (nodes) => {
  let keys = []
  nodes.forEach(n => {
    keys.push(n.key)
    if (n.children) keys = keys.concat(findAllKeys(n.children))
  })
  return keys
}

const ALL_PERMISSION_KEYS = findAllKeys(PERMISSION_TREE)

const MOCK_DATA = [
  { key: 1, name: '系统管理员', desc: '拥有系统所有功能权限，可管理所有模块', userCount: 2, createdAt: '2025-01-10 09:00:00', permissions: ALL_PERMISSION_KEYS },
  { key: 2, name: '区级领导', desc: '可查看所有项目数据及统计看板，研判裁决权限', userCount: 5, createdAt: '2025-01-10 09:00:00', permissions: ['project_zaitan', 'project_yanpan', 'project_qianyue', 'project_luodi', 'project_tuiku', 'project_mouhua', 'dash_project', 'dash_perf'] },
  { key: 3, name: '区投促局', desc: '负责项目全流程管理、数据维护及部门协调', userCount: 8, createdAt: '2025-01-15 10:00:00', permissions: ['project_zaitan', 'project_yanpan', 'project_qianyue', 'project_luodi', 'project_tuiku', 'project_mouhua', 'dash_project', 'perf_input', 'perf_view', 'sys_field', 'sys_overdue', 'sys_notice'] },
  { key: 4, name: '园区管理员', desc: '管理本园区项目数据，查看统计信息', userCount: 6, createdAt: '2025-02-01 14:00:00', permissions: ['project_zaitan', 'project_qianyue', 'project_luodi', 'dash_project', 'perf_view'] },
  { key: 5, name: '项目专员', desc: '负责具体项目信息录入、进展汇报', userCount: 12, createdAt: '2025-02-15 09:30:00', permissions: ['project_zaitan', 'project_qianyue', 'project_luodi', 'project_mouhua', 'perf_input'] },
]

export default function Role() {
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10 })
  const [addModalOpen, setAddModalOpen] = useState(false)
  const [permModalOpen, setPermModalOpen] = useState(false)
  const [editingRecord, setEditingRecord] = useState(null)
  const [permRecord, setPermRecord] = useState(null)
  const [checkedKeys, setCheckedKeys] = useState([])
  const [form] = Form.useForm()
  const [data, setData] = useState(MOCK_DATA)

  const pageData = useMemo(() => {
    const start = (pagination.current - 1) * pagination.pageSize
    return data.slice(start, start + pagination.pageSize)
  }, [data, pagination])

  const handleAdd = () => {
    setEditingRecord(null)
    form.resetFields()
    setAddModalOpen(true)
  }

  const handleEdit = (record) => {
    setEditingRecord(record)
    form.setFieldsValue(record)
    setAddModalOpen(true)
  }

  const handleDelete = (record) => {
    setData(prev => prev.filter(item => item.key !== record.key))
    message.success('删除成功')
  }

  const handleAddModalOk = () => {
    form.validateFields().then(values => {
      if (editingRecord) {
        setData(prev => prev.map(item =>
          item.key === editingRecord.key ? { ...item, ...values } : item
        ))
        message.success('编辑成功')
      } else {
        const newKey = Math.max(...data.map(d => d.key)) + 1
        setData(prev => [...prev, {
          key: newKey,
          ...values,
          userCount: 0,
          createdAt: new Date().toLocaleString('zh-CN', { hour12: false }).replace(/\//g, '-'),
          permissions: [],
        }])
        message.success('新增成功')
      }
      setAddModalOpen(false)
    })
  }

  const handleConfigPerm = (record) => {
    setPermRecord(record)
    setCheckedKeys(record.permissions || [])
    setPermModalOpen(true)
  }

  const handlePermModalOk = () => {
    setData(prev => prev.map(item =>
      item.key === permRecord.key ? { ...item, permissions: checkedKeys } : item
    ))
    message.success('权限配置已保存')
    setPermModalOpen(false)
  }

  const columns = [
    { title: '角色名称', dataIndex: 'name', key: 'name', width: 140 },
    { title: '描述', dataIndex: 'desc', key: 'desc', ellipsis: true },
    {
      title: '关联用户数', dataIndex: 'userCount', key: 'userCount', width: 120, align: 'center',
      render: (v) => <Tag color="blue" style={{ margin: 0 }}>{v} 人</Tag>,
    },
    { title: '创建时间', dataIndex: 'createdAt', key: 'createdAt', width: 180, align: 'center' },
    {
      title: '操作', key: 'action', width: 240, align: 'center', fixed: 'right',
      render: (_, record) => (
        <Space size={0} split={<span style={{ color: '#d9d9d9', margin: '0 6px' }}>|</span>}>
          <span className="action-link" onClick={() => handleConfigPerm(record)}>
            <SafetyOutlined /> 权限配置
          </span>
          <span className="action-link" onClick={() => handleEdit(record)}>
            <EditOutlined /> 编辑
          </span>
          <Popconfirm
            title={`确定要删除角色「${record.name}」吗？删除后关联用户将失去该角色权限。`}
            onConfirm={() => handleDelete(record)}
            okText="确定"
            cancelText="取消"
            disabled={record.name === '系统管理员'}
          >
            <span className={`action-link danger${record.name === '系统管理员' ? '' : ''}`}>
              <DeleteOutlined /> 删除
            </span>
          </Popconfirm>
        </Space>
      ),
    },
  ]

  return (
    <div className="page-container">
      <div className="filter-bar">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
            新增角色
          </Button>
          <Button icon={<ReloadOutlined />} onClick={() => message.info('刷新成功')}>
            刷新
          </Button>
          <div style={{ marginLeft: 'auto', fontSize: 13, color: '#999' }}>
            提示：点击「权限配置」可为角色分配各模块访问权限
          </div>
        </div>
      </div>

      <div className="table-card">
        <div className="table-toolbar">
          <div className="table-toolbar-left" style={{ fontSize: 14, color: '#666' }}>
            共 <span style={{ color: '#1677ff', fontWeight: 600 }}>{data.length}</span> 个角色
          </div>
        </div>
        <Table
          columns={columns}
          dataSource={pageData}
          rowKey="key"
          size="middle"
          pagination={{
            ...pagination,
            total: data.length,
            showSizeChanger: true,
            showQuickJumper: true,
            pageSizeOptions: ['10', '20', '50'],
            showTotal: (total) => `共 ${total} 条`,
            onChange: (page, pageSize) => setPagination({ current: page, pageSize }),
          }}
        />
      </div>

      <Modal
        title={editingRecord ? '编辑角色' : '新增角色'}
        open={addModalOpen}
        onOk={handleAddModalOk}
        onCancel={() => setAddModalOpen(false)}
        okText="确定"
        cancelText="取消"
        destroyOnClose
        width={500}
      >
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item name="name" label="角色名称" rules={[{ required: true, message: '请输入角色名称' }]}>
            <Input placeholder="请输入角色名称，如：项目专员" />
          </Form.Item>
          <Form.Item name="desc" label="角色描述" rules={[{ required: true, message: '请输入角色描述' }]}>
            <Input.TextArea rows={3} placeholder="请描述该角色的职责范围" />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title={`权限配置 - ${permRecord?.name || ''}`}
        open={permModalOpen}
        onOk={handlePermModalOk}
        onCancel={() => setPermModalOpen(false)}
        okText="保存权限"
        cancelText="取消"
        destroyOnClose
        width={520}
      >
        <div style={{ marginBottom: 12, fontSize: 13, color: '#666' }}>
          请勾选该角色可访问的功能模块：
        </div>
        <div style={{
          border: '1px solid #f0f0f0',
          borderRadius: 4,
          padding: '12px 16px',
          maxHeight: 360,
          overflowY: 'auto',
          background: '#fafafa',
        }}>
          <Tree
            checkable
            defaultExpandAll
            checkedKeys={checkedKeys}
            onCheck={(keys) => setCheckedKeys(keys)}
            treeData={PERMISSION_TREE}
          />
        </div>
      </Modal>
    </div>
  )
}
