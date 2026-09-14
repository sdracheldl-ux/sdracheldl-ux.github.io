import { useState, useMemo } from 'react'
import {
  Table,
  Button,
  Input,
  Select,
  Tag,
  DatePicker,
  Space,
  Tooltip,
} from 'antd'
import {
  SearchOutlined,
  ReloadOutlined,
  ExportOutlined,
} from '@ant-design/icons'

const { RangePicker } = DatePicker

const OPERATION_TYPES = [
  { label: '全部类型', value: '' },
  { label: '新增', value: 'create' },
  { label: '编辑', value: 'update' },
  { label: '删除', value: 'delete' },
  { label: '登录', value: 'login' },
]

const TYPE_CONFIG = {
  create: { label: '新增', color: 'green' },
  update: { label: '编辑', color: 'blue' },
  delete: { label: '删除', color: 'red' },
  login: { label: '登录', color: 'default' },
}

const MOCK_DATA = [
  { key: 1, operator: '系统管理员', opType: 'login', content: '用户登录系统', ip: '192.168.1.100', opTime: '2025-08-26 08:30:15' },
  { key: 2, operator: '张伟', opType: 'create', content: '新增项目「某新能源汽车零部件项目」', ip: '192.168.1.105', opTime: '2025-08-26 09:15:22' },
  { key: 3, operator: '李明', opType: 'update', content: '更新项目「某生物医药产业园项目」阶段为签约', ip: '192.168.1.102', opTime: '2025-08-26 10:05:43' },
  { key: 4, operator: '王芳', opType: 'create', content: '新增在谈项目「某智能制造装备项目」', ip: '192.168.1.110', opTime: '2025-08-26 10:42:18' },
  { key: 5, operator: '陈强', opType: 'login', content: '用户登录系统', ip: '192.168.1.108', opTime: '2025-08-26 11:00:00' },
  { key: 6, operator: '张伟', opType: 'update', content: '编辑项目「某新能源汽车零部件项目」投资金额', ip: '192.168.1.105', opTime: '2025-08-26 11:30:55' },
  { key: 7, operator: '系统管理员', opType: 'delete', content: '删除测试账号「test01」', ip: '192.168.1.100', opTime: '2025-08-26 13:20:10' },
  { key: 8, operator: '刘洋', opType: 'create', content: '新增落地项目「某集成电路封测项目」', ip: '192.168.1.115', opTime: '2025-08-26 14:05:33' },
  { key: 9, operator: '赵敏', opType: 'update', content: '提交项目「某新材料研发中心项目」进展汇报', ip: '192.168.1.120', opTime: '2025-08-26 14:45:27' },
  { key: 10, operator: '孙磊', opType: 'update', content: '研判通过项目「某人工智能产业园项目」', ip: '192.168.1.103', opTime: '2025-08-26 15:30:08' },
  { key: 11, operator: '周静', opType: 'login', content: '用户登录系统', ip: '192.168.1.112', opTime: '2025-08-26 16:00:45' },
  { key: 12, operator: '吴华', opType: 'delete', content: '删除退库项目「某淘汰产能项目」', ip: '192.168.1.106', opTime: '2025-08-26 16:35:19' },
  { key: 13, operator: '张伟', opType: 'create', content: '新增签约项目「某现代服务业综合体项目」', ip: '192.168.1.105', opTime: '2025-08-25 09:20:00' },
  { key: 14, operator: '郑琳', opType: 'update', content: '更新字段配置「项目来源」枚举值', ip: '192.168.1.118', opTime: '2025-08-25 10:10:30' },
  { key: 15, operator: '系统管理员', opType: 'update', content: '修改超期提醒设置参数', ip: '192.168.1.100', opTime: '2025-08-25 11:00:00' },
]

export default function Log() {
  const [operator, setOperator] = useState('')
  const [opType, setOpType] = useState('')
  const [dateRange, setDateRange] = useState(null)
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10 })

  const operatorOptions = useMemo(() => {
    const ops = [...new Set(MOCK_DATA.map(d => d.operator))]
    return [{ label: '全部操作人', value: '' }, ...ops.map(o => ({ label: o, value: o }))]
  }, [])

  const filteredData = useMemo(() => {
    return MOCK_DATA.filter(r => {
      if (operator && r.operator !== operator) return false
      if (opType && r.opType !== opType) return false
      return true
    })
  }, [operator, opType, dateRange])

  const pageData = useMemo(() => {
    const start = (pagination.current - 1) * pagination.pageSize
    return filteredData.slice(start, start + pagination.pageSize)
  }, [filteredData, pagination])

  const handleReset = () => {
    setOperator('')
    setOpType('')
    setDateRange(null)
    setPagination({ current: 1, pageSize: 10 })
  }

  const columns = [
    { title: '操作人', dataIndex: 'operator', key: 'operator', width: 120 },
    {
      title: '操作类型', dataIndex: 'opType', key: 'opType', width: 100, align: 'center',
      render: (v) => {
        const cfg = TYPE_CONFIG[v] || { label: v, color: 'default' }
        return <Tag color={cfg.color} style={{ margin: 0 }}>{cfg.label}</Tag>
      },
    },
    {
      title: '操作内容', dataIndex: 'content', key: 'content', ellipsis: true,
      render: (v) => (
        <Tooltip title={v} placement="topLeft">
          <span>{v}</span>
        </Tooltip>
      ),
    },
    { title: 'IP地址', dataIndex: 'ip', key: 'ip', width: 140, align: 'center' },
    { title: '操作时间', dataIndex: 'opTime', key: 'opTime', width: 180, align: 'center' },
  ]

  return (
    <div className="page-container">
      <div className="filter-bar">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          <Select
            style={{ width: 160 }}
            placeholder="操作人"
            value={operator}
            onChange={(v) => { setOperator(v); setPagination(p => ({ ...p, current: 1 })) }}
            options={operatorOptions}
          />
          <Select
            style={{ width: 140 }}
            placeholder="操作类型"
            value={opType}
            onChange={(v) => { setOpType(v); setPagination(p => ({ ...p, current: 1 })) }}
            options={OPERATION_TYPES}
          />
          <RangePicker
            style={{ width: 280 }}
            value={dateRange}
            onChange={(v) => { setDateRange(v); setPagination(p => ({ ...p, current: 1 })) }}
          />
          <Button type="primary" icon={<SearchOutlined />}>
            搜索
          </Button>
          <Button icon={<ReloadOutlined />} onClick={handleReset}>
            重置
          </Button>
          <Button icon={<ExportOutlined />}>
            导出
          </Button>
        </div>
      </div>

      <div className="table-card">
        <div className="table-toolbar">
          <div className="table-toolbar-left" style={{ fontSize: 14, color: '#666' }}>
            共 <span style={{ color: '#1677ff', fontWeight: 600 }}>{filteredData.length}</span> 条操作日志
            <span style={{ color: '#d9d9d9', margin: '0 12px' }}>|</span>
            <Space size={8}>
              <Tag color="green" style={{ margin: 0 }}>新增</Tag>
              <Tag color="blue" style={{ margin: 0 }}>编辑</Tag>
              <Tag color="red" style={{ margin: 0 }}>删除</Tag>
              <Tag color="default" style={{ margin: 0 }}>登录</Tag>
            </Space>
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
    </div>
  )
}
