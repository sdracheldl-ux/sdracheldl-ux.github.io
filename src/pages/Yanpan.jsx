import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Table, Tag, Space, Select, Tooltip, Button, Input } from 'antd'
import {
  EyeOutlined,
  SearchOutlined,
  ReloadOutlined,
} from '@ant-design/icons'
import { useImported } from '../store/viewStore'

// 冲突等级配置（市级项目编码为最高优先级判重依据：同一市级编码视为同一项目）
const CONFLICT_LEVEL_CONFIG = {
  L1: { label: 'L1-强匹配', color: 'red', desc: '市级项目编码相同（直接判定为同一项目），或名称完全相同+投资主体相同' },
  L2: { label: 'L2-高相似', color: 'orange', desc: '名称相似度≥85%+投资主体相同，建设地址相同可提升置信度' },
  L3: { label: 'L3-中风险', color: 'gold', desc: '名称相似度60%~85%，或投资主体+建设地址+金额偏差等弱信号组合，导入主体相同作参考加分' },
  L4: { label: 'L4-弱提示', color: 'blue', desc: '弱信号组合参考（投资主体相同+同一导入主体+地址相近），联系人/电话不参与判重' },
}

// 处理状态配置
const STATUS_CONFIG = {
  pending: { label: '待处理', color: 'processing' },
  merged: { label: '已合并', color: 'success' },
  ignored: { label: '已忽略', color: 'default' },
  new_project: { label: '视为新项目', color: 'blue' },
}

const actionLinkStyle = { color: '#1677ff', display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 14, cursor: 'pointer' }

export default function Yanpan() {
  const navigate = useNavigate()
  const imported = useImported()
  const [filters, setFilters] = useState({
    status: undefined,
    level: undefined,
    stage: undefined,
  })
  const [searchKeyword, setSearchKeyword] = useState('')

  // 构造研判池Mock数据（模拟Excel导入触发的冲突）
  const dataList = useMemo(() => {
    const yanpanRecords = [
      {
        id: 'yp-001',
        newProjectId: 'new-001',
        existingProjectId: 1,
        newProjectName: '人工智能药物研发平台',
        existingProjectName: '人工智能药物研发及产业化平台建设项目',
        conflictLevel: 'L1',
        conflictReason: '市级项目编码相同（SJ-2026-0012），且项目名称高度相似（相似度92%）、投资主体相同',
        aiSuggestion: '合并覆盖（推荐）：市级编码一致，确认为同一项目，用最新数据更新原项目',
        confidence: 0.98,
        status: 'pending',
        newStage: '在谈',
        existingStage: '在谈',
        importUser: '智造园-石丰浩',
        importTime: '2026-09-02 10:30',
        investorEntity: '上海溪长生物技术有限公司',
        investAmount: 1.2,
        existingInvestAmount: 1.2,
      },
      {
        id: 'yp-006',
        newProjectId: 'new-006',
        existingProjectId: 3,
        newProjectName: '化合物半导体材料研发生产基地',
        existingProjectName: '第三代半导体产业园项目',
        conflictLevel: 'L1',
        conflictReason: '市级项目编码相同（SJ-2026-0035），同一市级编码视为同一项目',
        aiSuggestion: '合并覆盖（强烈推荐）：市级项目编码一致，系统判定为同一项目的不同名称版本，建议以最新导入数据合并',
        confidence: 0.96,
        status: 'pending',
        newStage: '在谈',
        existingStage: '在谈',
        importUser: '光电园-李工',
        importTime: '2026-09-02 11:20',
        investorEntity: '武汉光谷半导体技术有限公司',
        investAmount: 6.8,
        existingInvestAmount: 6.3,
      },
      {
        id: 'yp-002',
        newProjectId: 'new-002',
        existingProjectId: 5,
        newProjectName: '新能源汽车动力电池项目',
        existingProjectName: '新能源动力电池生产基地项目',
        conflictLevel: 'L2',
        conflictReason: '项目名称相似度87%，投资主体相同，产业类别一致',
        aiSuggestion: '合并覆盖：双方投资金额偏差8%，建议合并后保留最新进展信息',
        confidence: 0.82,
        status: 'pending',
        newStage: '在谈',
        existingStage: '在谈',
        importUser: '未来科技城-陈主任',
        importTime: '2026-09-01 15:20',
        investorEntity: '武汉亿纬锂能有限公司',
        investAmount: 5.6,
        existingInvestAmount: 5.15,
      },
      {
        id: 'yp-003',
        newProjectId: 'new-003',
        existingProjectId: 12,
        newProjectName: '光电子信息产业园二期',
        existingProjectName: '光电子信息产业园一期',
        conflictLevel: 'L3',
        conflictReason: '项目名称相似度72%（低于85%）、投资主体相同、建设地址相同、投资金额偏差18%',
        aiSuggestion: '人工确认：名称相似度中等，可能为同一项目的分期建设，请核对项目简介后决定',
        confidence: 0.68,
        status: 'pending',
        newStage: '签约',
        existingStage: '签约',
        importUser: '光电园-李工',
        importTime: '2026-08-30 09:45',
        investorEntity: '华星光电技术有限公司',
        investAmount: 8.5,
        existingInvestAmount: 10.2,
      },
      {
        id: 'yp-004',
        newProjectId: 'new-004',
        existingProjectId: 8,
        newProjectName: '生物医药研发中心',
        existingProjectName: '生物医药研发中心',
        conflictLevel: 'L1',
        conflictReason: '项目名称完全相同，投资主体完全一致',
        aiSuggestion: '合并覆盖（强烈推荐）：确认为同一项目的重复导入',
        confidence: 0.99,
        status: 'merged',
        newStage: '在谈',
        existingStage: '在谈',
        importUser: '生物城-王科长',
        importTime: '2026-08-28 14:10',
        investorEntity: '人福医药集团股份公司',
        investAmount: 3.2,
        existingInvestAmount: 3.2,
        decisionBy: '投促局管理员',
        decisionTime: '2026-08-28 16:30',
      },
      {
        id: 'yp-005',
        newProjectId: 'new-005',
        existingProjectId: 15,
        newProjectName: '智能物流仓储系统',
        existingProjectName: '智慧供应链管理平台',
        conflictLevel: 'L4',
        conflictReason: '投资主体相同、同一导入主体（物流园）、建设地址相近，项目名称相似度仅42%',
        aiSuggestion: '弱提示：名称相似度低，但投资主体与导入主体一致，可能为关联项目或分期项目，请人工确认',
        confidence: 0.45,
        status: 'ignored',
        newStage: '在谈',
        existingStage: '在谈',
        importUser: '物流园-赵经理',
        importTime: '2026-08-25 11:00',
        investorEntity: '京东物流科技有限公司',
        investAmount: 2.8,
        existingInvestAmount: 4.5,
        decisionBy: '投促局管理员',
        decisionTime: '2026-08-26 09:20',
      },
    ]

    // Excel导入产生的冲突记录置顶展示
    return [...(imported?.conflicts || []), ...yanpanRecords]
  }, [imported])

  // 筛选后的数据
  const filteredData = useMemo(() => {
    return dataList.filter(item => {
      if (filters.status && item.status !== filters.status) return false
      if (filters.level && item.conflictLevel !== filters.level) return false
      if (filters.stage && item.newStage !== filters.stage) return false
      if (searchKeyword && searchKeyword.trim()) {
        const kw = searchKeyword.trim().toLowerCase()
        const matchFields = [
          item.newProjectName,
          item.existingProjectName,
          item.investorEntity,
        ].map(v => (v || '').toLowerCase())
        if (!matchFields.some(f => f.includes(kw))) return false
      }
      return true
    })
  }, [dataList, filters, searchKeyword])

  // 统计数据
  const stats = useMemo(() => ({
    total: dataList.length,
    pending: dataList.filter(d => d.status === 'pending').length,
    merged: dataList.filter(d => d.status === 'merged').length,
    ignored: dataList.filter(d => d.status === 'ignored').length,
    new_project: dataList.filter(d => d.status === 'new_project').length,
  }), [dataList])

  const columns = [
    {
      key: 'index',
      title: '序号',
      dataIndex: 'index',
      width: 55,
      align: 'center',
      render: (_, __, idx) => idx + 1,
    },
    {
      key: 'newProjectName',
      title: '新导入项目',
      dataIndex: 'newProjectName',
      width: 220,
      ellipsis: true,
      render: (v, record) => (
        <Space direction="vertical" size={0}>
          <Tooltip title={v}>
            <span style={{ color: '#1677ff', cursor: 'pointer', fontWeight: 500 }}>{v}</span>
          </Tooltip>
          <Space size={4}>
            {record.cityProjectCode && (
              <span style={{ fontSize: 11, color: '#8c8c8c' }}>编码 {record.cityProjectCode}</span>
            )}
          </Space>
        </Space>
      ),
    },
    {
      key: 'newStage',
      title: '导入阶段',
      dataIndex: 'newStage',
      width: 90,
      align: 'center',
      render: (v) => {
        const label = v === '谋划' || v === 'mouhua' ? '谋划' : v === '在谈' || v === 'zaitan' ? '在谈' : v === '签约' || v === 'qianyue' ? '签约' : v
        const color = label === '在谈' ? 'processing' : label === '签约' ? 'success' : 'default'
        return <Tag color={color} style={{ margin: 0 }}>{label}</Tag>
      },
    },
    {
      key: 'conflictLevel',
      title: '命中规则',
      dataIndex: 'conflictLevel',
      width: 140,
      align: 'center',
      render: (v) => {
        const config = CONFLICT_LEVEL_CONFIG[v]
        return (
          <Tooltip title={config.desc}>
            <Tag color={config.color} style={{ margin: 0 }}>{config.label}</Tag>
          </Tooltip>
        )
      },
    },
    {
      key: 'existingProjectName',
      title: '冲突对象',
      dataIndex: 'existingProjectName',
      width: 260,
      ellipsis: true,
      render: (v) => (
        <Tooltip title={v}>
          <span style={{ cursor: 'pointer' }}>{v}</span>
        </Tooltip>
      ),
    },
    {
      key: 'aiSuggestion',
      title: 'AI建议',
      dataIndex: 'aiSuggestion',
      width: 280,
      ellipsis: true,
      render: (v) => (
        <Tooltip title={v}>
          <span style={{ fontSize: 13 }}>{v}</span>
        </Tooltip>
      ),
    },
    {
      key: 'confidence',
      title: '置信度',
      dataIndex: 'confidence',
      width: 80,
      align: 'center',
      render: (v) => {
        const color = v >= 0.9 ? '#52c41a' : v >= 0.7 ? '#faad14' : '#ff4d4f'
        return <span style={{ fontWeight: 600, color }}>{(v * 100).toFixed(0)}%</span>
      },
    },
    {
      key: 'importUser',
      title: '来源',
      dataIndex: 'importUser',
      width: 120,
      ellipsis: true,
      render: (v, record) => (
        <Tooltip title={`${v} · ${record.importTime}`}>
          <span>{v}</span>
        </Tooltip>
      ),
    },
    {
      key: 'status',
      title: '状态',
      dataIndex: 'status',
      width: 110,
      align: 'center',
      render: (v) => {
        const config = STATUS_CONFIG[v]
        return <Tag color={config.color} style={{ margin: 0 }}>{config.label}</Tag>
      },
    },
    {
      key: 'action',
      title: '操作',
      dataIndex: 'action',
      width: 80,
      fixed: 'right',
      align: 'center',
      render: (_, record) => (
        <span
          style={actionLinkStyle}
          onClick={() => navigate(`/project/yanpan/detail/${record.id}`)}
        >
          <EyeOutlined /> 详情
        </span>
      ),
    },
  ]

  return (
    <div style={{ padding: '24px', background: '#fff', minHeight: '100%' }}>
      {/* 页面标题与统计 */}
      <div style={{ marginBottom: 20 }}>
        <h2 style={{ margin: 0, fontSize: 20, fontWeight: 600 }}>项目重复研判</h2>
        <p style={{ margin: '4px 0 0', color: '#8c8c8c', fontSize: 13 }}>
          集中处理数据冲突与重复项目 · 待处理 <span style={{ color: '#1677ff', fontWeight: 600 }}>{stats.pending}</span> 条
        </p>
      </div>

      {/* 统计卡片 */}
      <div style={{ display: 'flex', gap: 16, marginBottom: 20 }}>
        {[
          { label: '总记录', value: stats.total, color: '#1890ff' },
          { label: '待处理', value: stats.pending, color: '#faad14' },
          { label: '已合并', value: stats.merged, color: '#52c41a' },
          { label: '已忽略', value: stats.ignored, color: '#8c8c8c' },
          { label: '新项目', value: stats.new_project, color: '#1677ff' },
        ].map(stat => (
          <div key={stat.label} style={{
            flex: 1,
            padding: '16px 20px',
            background: '#fafafa',
            borderRadius: 8,
            borderLeft: `4px solid ${stat.color}`,
          }}>
            <div style={{ fontSize: 12, color: '#8c8c8c', marginBottom: 4 }}>{stat.label}</div>
            <div style={{ fontSize: 24, fontWeight: 600, color: stat.color }}>{stat.value}</div>
          </div>
        ))}
      </div>

      {/* 筛选栏 */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 16, alignItems: 'center' }}>
        <span style={{ fontSize: 14, color: '#595959' }}>筛选：</span>
        <Select
          placeholder="处理状态"
          allowClear
          style={{ width: 130 }}
          value={filters.status}
          onChange={(v) => setFilters(prev => ({ ...prev, status: v }))}
          options={[
            { label: '待处理', value: 'pending' },
            { label: '已合并', value: 'merged' },
            { label: '已忽略', value: 'ignored' },
            { label: '视为新项目', value: 'new_project' },
          ]}
        />
        <Select
          placeholder="冲突等级"
          allowClear
          style={{ width: 140 }}
          value={filters.level}
          onChange={(v) => setFilters(prev => ({ ...prev, level: v }))}
          options={Object.entries(CONFLICT_LEVEL_CONFIG).map(([k, v]) => ({ label: v.label, value: k }))}
        />
        <Select
          placeholder="导入阶段"
          allowClear
          style={{ width: 120 }}
          value={filters.stage}
          onChange={(v) => setFilters(prev => ({ ...prev, stage: v }))}
          options={[
            { label: '在谈', value: '在谈' },
            { label: '签约', value: '签约' },
          ]}
        />
        <Input
          placeholder="搜索项目名称/编码"
          allowClear
          style={{ width: 200 }}
          prefix={<SearchOutlined style={{ color: '#bfbfbf' }} />}
          value={searchKeyword}
          onChange={(e) => setSearchKeyword(e.target.value)}
        />
        <Button type="primary" icon={<SearchOutlined />}>搜索</Button>
        <Button icon={<ReloadOutlined />} onClick={() => {
          setFilters({ status: undefined, level: undefined, stage: undefined })
          setSearchKeyword('')
        }}>
          重置
        </Button>
      </div>

      {/* 数据表格 */}
      <Table
        columns={columns}
        dataSource={filteredData}
        rowKey="id"
        pagination={{
          pageSize: 10,
          showTotal: (total) => `共 ${total} 条记录`,
          showSizeChanger: false,
        }}
        scroll={{ x: 1435 }}
        tableLayout="fixed"
        size="middle"
      />
    </div>
  )
}
