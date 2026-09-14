import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Table,
  Tag,
  Button,
  Input,
  InputNumber,
  Select,
  DatePicker,
  Space,
  Tooltip,
  Popover,
  Checkbox,
  Dropdown,
  Divider,
  Modal,
  Form,
  message,
} from 'antd'
import {
  SearchOutlined,
  ExportOutlined,
  ReloadOutlined,
  SettingOutlined,
  MoreOutlined,
  UpOutlined,
  DownOutlined,
  EyeOutlined,
  EditOutlined,
  FileTextOutlined,
  PauseCircleOutlined,
  SendOutlined,
  SwapOutlined,
  ExclamationCircleOutlined,
} from '@ant-design/icons'
import mockData from '../mock/data.json'
import UpdateDecisionModal from '../components/UpdateDecisionModal'
import ZaitanEditModal from '../components/ZaitanEditModal'
import AssignModal from '../components/AssignModal'
import ZhuanQianyueModal from '../components/ZhuanQianyueModal'
import TransferZaitanModal from '../components/TransferZaitanModal'
import { RESPONSIBLE_UNIT_SELECT_GROUPS, RESPONSIBLE_UNIT_OPTIONS, normalizeResponsibleUnits, DISTRICT_CODE_SEEDS } from '../constants/projectEnums'
import { useViewRole, msgStore, transferStore, useTransferStore } from '../store/viewStore'

const { RangePicker } = DatePicker

// 所有列定义（带key用于列管理）
const ALL_COLUMNS = [
  { key: 'index', title: '序号', dataIndex: 'index', width: 55, align: 'center', fixed: 'left', required: true },
  { key: 'districtProjectCode', title: '区级项目编码', dataIndex: 'districtProjectCode', width: 130, align: 'center' },
  { key: 'reporter', title: '申报人', dataIndex: 'reporter', width: 130, align: 'left', fixed: 'left', ellipsis: true },
  { key: 'projectName', title: '项目名称', dataIndex: 'projectName', width: 220, ellipsis: true, required: true },
  { key: 'projectCategory', title: '项目分类', dataIndex: 'projectCategory', width: 85, align: 'center' },
  { key: 'needInvestAmount', title: '需投资金额(亿元)', dataIndex: 'needInvestAmount', width: 130, align: 'right' },
  { key: 'sourceArea', title: '来源地', dataIndex: 'sourceArea', width: 100, ellipsis: true },
  { key: 'domesticForeign', title: '内外资', dataIndex: 'domesticForeign', width: 70, align: 'center' },
  { key: 'industryCategory', title: '产业类别', dataIndex: 'industryCategory', width: 80, align: 'center' },
  { key: 'industryType', title: '行业类别', dataIndex: 'industryType', width: 160, ellipsis: true },
  { key: 'secondaryIndustryCategory', title: '次要行业类别', dataIndex: 'secondaryIndustryCategory', width: 140, ellipsis: true },
  { key: 'investorEntity', title: '投资主体', dataIndex: 'investorEntity', width: 180, ellipsis: true },
  { key: 'dockingDate', title: '对接时间', dataIndex: 'dockingDate', width: 105, align: 'center' },
  { key: 'investAmount', title: '计划投资总额(亿元)', dataIndex: 'investAmount', width: 145, align: 'right', sorter: true },
  { key: 'responsibleUnits', title: '责任单位', dataIndex: 'responsibleUnits', width: 200, ellipsis: true },
  { key: 'enterpriseCategory', title: '企业类别', dataIndex: 'enterpriseCategory', width: 150, ellipsis: true },
  { key: 'isStock', title: '是否存量企业', dataIndex: 'isStock', width: 100, align: 'center' },
  { key: 'registeredCapitalAmount', title: '注册资本(亿元)', dataIndex: 'registeredCapitalAmount', width: 120, align: 'right' },
  { key: 'isEnclave', title: '是否飞地园区', dataIndex: 'isEnclave', width: 100, align: 'center' },
  { key: 'isOverflow', title: '是否产业外溢', dataIndex: 'isOverflow', width: 100, align: 'center' },
  { key: 'chushangType', title: '楚商类型', dataIndex: 'chushangType', width: 110, align: 'center' },
  { key: 'projectDesc', title: '项目简介', dataIndex: 'projectDesc', width: 260, ellipsis: true },
  { key: 'reportTime', title: '申报时间', dataIndex: 'reportTime', width: 110, align: 'center' },
  { key: 'action', title: '操作', dataIndex: 'action', width: 180, fixed: 'right', align: 'center', required: true },
]

// 默认显示的列
const DEFAULT_VISIBLE_KEYS = ALL_COLUMNS.map(c => c.key)

// 责任单位 Tag 展示：空显示 '-'，最多显示 3 个，超出 +N
const unitTagStyle = { color: '#1677ff', background: '#e6f4ff', borderColor: '#91caff' }
const renderUnits = (v) => {
  const units = normalizeResponsibleUnits(v)
  if (units.length === 0) return <span style={{ color: '#bfbfbf' }}>-</span>
  const shown = units.slice(0, 3)
  return (
    <>
      {shown.map(u => <Tag key={u} style={unitTagStyle}>{u}</Tag>)}
      {units.length > 3 && <Tag style={unitTagStyle}>+{units.length - shown.length}</Tag>}
    </>
  )
}

export default function Zaitan() {
  const navigate = useNavigate()
  const { role, isSponsor, myDeptKey } = useViewRole()
  // 订阅移交记录变化（移交后菜单/列表同步刷新）
  useTransferStore()

  // 接收方视角下可见项目：分派给我的 ∪ 移交给我的（sponsor 为 null 表示全量）
  const allowedProjectIds = (() => {
    if (isSponsor) return null
    const ids = new Set(['1'])
    transferStore.getTransfersByDept(myDeptKey).forEach(t => ids.add(String(t.projectId)))
    return ids
  })()
  const [filters, setFilters] = useState({
    projectName: '',
    industryType: undefined,
    category: undefined,
    chushangType: undefined,
    domesticForeign: undefined,
    projectCategory: undefined,
    minAmount: undefined,
    maxAmount: undefined,
    dateRange: null,
    responsibleUnits: undefined,
    isOverflow: undefined,
  })
  const [selectedRowKeys, setSelectedRowKeys] = useState([])
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10 })
  const [filterExpanded, setFilterExpanded] = useState(false)
  const [visibleColumnKeys, setVisibleColumnKeys] = useState(DEFAULT_VISIBLE_KEYS)
  const [columnPopoverOpen, setColumnPopoverOpen] = useState(false)

  // 列表弹窗状态
  const [progressForm] = Form.useForm()
  const [progressModalVisible, setProgressModalVisible] = useState(false)
  const [progressLoading, setProgressLoading] = useState(false)
  const [currentProject, setCurrentProject] = useState(null)
  const [decisionModalVisible, setDecisionModalVisible] = useState(false)
  const [editModalVisible, setEditModalVisible] = useState(false)
  const [assignModalVisible, setAssignModalVisible] = useState(false)
  const [zhuanQianyueVisible, setZhuanQianyueVisible] = useState(false)
  const [transferVisible, setTransferVisible] = useState(false)
  const [tuikuVisible, setTuikuVisible] = useState(false)
  const [tuikuReason, setTuikuReason] = useState('')

  const data = useMemo(() => {
    return mockData.zaitan.map((item, idx) => {
      const projectCategory = ['政策类', '投资类', '供地类', '其他'][idx % 4]
      return {
        key: item.id,
        index: idx + 1,
        districtProjectCode: item['区级项目编码'] || DISTRICT_CODE_SEEDS[idx % DISTRICT_CODE_SEEDS.length],
        reporter: item['申报人'] || '-',
        projectStatus: item['项目状态'] || '在谈',
        projectName: item['项目名称'] || '-',
        sourceArea: item['来源地'] || '-',
        domesticForeign: item['内外资'] || '-',
        industryCategory: item['产业类别'] || '-',
        industryType: item['行业类别'] || '-',
        projectDesc: item['项目简介'] || '-',
        investorEntity: item['投资主体'] || '-',
        investAmount: item['投资金额（亿元）'] || 0,
        reportTime: item['申报时间'] || '-',
        isEnclave: item['是否飞地园区'] || '否',
        isOverflow: item['是否产业外溢'] || (idx % 2 === 0 ? '是' : '否'),
        // ===== 在谈字段（存量行按行号轮转补种子，保证演示有值）=====
        projectCategory,
        // 需投资金额：仅投资类项目有值
        needInvestAmount: projectCategory === '投资类' ? [1.2, 2.5, 0.8, 3.2][idx % 4] : undefined,
        secondaryIndustryCategory: ['生物医药', '智能机器人', '先进半导体', '高端医疗器械'][idx % 4],
        dockingDate: item['对接时间'] || ['2026-05-08', '2026-05-12', '2026-04-20', '2026-05-06'][idx % 4],
        enterpriseCategory: item['企业类别'] || ['国家级高新技术企业', '国家级专精特新', '中国500强', '金种子'][idx % 4],
        isStock: '否',
        registeredCapitalAmount: item['注册资本'] || [0.1, 0.5, 0.08, 0.2][idx % 4],
        chushangType: item['楚商类型'] || ['湖北籍企业家', '武汉校友', '非楚商', '泛楚商'][idx % 4],
        // 存量行无责任单位时给默认种子，保证演示展示有值
        responsibleUnits: normalizeResponsibleUnits(item['责任单位']).length
          ? normalizeResponsibleUnits(item['责任单位'])
          : [RESPONSIBLE_UNIT_OPTIONS[idx % RESPONSIBLE_UNIT_OPTIONS.length]],
      }
    })
  }, [])

  const filteredData = useMemo(() => {
    return data.filter(r => {
      // 接收方视角：只展示分派给自己的项目
      if (allowedProjectIds && !allowedProjectIds.has(String(r.key))) return false
      if (filters.projectName && !r.projectName.includes(filters.projectName)) return false
      if (filters.industryType && r.industryType !== filters.industryType) return false
      if (filters.category && r.industryCategory !== filters.category) return false
      if (filters.domesticForeign && r.domesticForeign !== filters.domesticForeign) return false
      if (filters.projectCategory && r.projectCategory !== filters.projectCategory) return false
      if (filters.isOverflow && r.isOverflow !== filters.isOverflow) return false
      if (Array.isArray(filters.responsibleUnits) && filters.responsibleUnits.length > 0) {
        const units = r.responsibleUnits || []
        if (!filters.responsibleUnits.some(u => units.includes(u))) return false
      }
      const amt = Number(r.investAmount) || 0
      if (filters.minAmount !== undefined && filters.minAmount !== '' && amt < Number(filters.minAmount)) return false
      if (filters.maxAmount !== undefined && filters.maxAmount !== '' && amt > Number(filters.maxAmount)) return false
      return true
    })
  }, [data, filters, allowedProjectIds])

  // 分页数据
  const pageData = useMemo(() => {
    const start = (pagination.current - 1) * pagination.pageSize
    return filteredData.slice(start, start + pagination.pageSize)
  }, [filteredData, pagination])

  // 当页投资总额（按分页数据计算）
  const pageInvest = pageData.reduce((sum, r) => sum + (Number(r.investAmount) || 0), 0)
  const filteredInvest = filteredData.reduce((sum, r) => sum + (Number(r.investAmount) || 0), 0)

  const industryTypeOptions = [...new Set(data.map(r => r.industryType).filter(v => v && v !== '-'))].map(v => ({ label: v, value: v }))
  const industryCategoryOptions = [...new Set(data.map(r => r.industryCategory).filter(v => v && v !== '-'))].map(v => ({ label: v, value: v }))

  const handleSearch = () => {
    message.success('查询完成')
    setPagination(p => ({ ...p, current: 1 }))
  }

  const handleReset = () => {
    setFilters({
      projectName: '', industryType: undefined, category: undefined,
      chushangType: undefined, domesticForeign: undefined, projectCategory: undefined,
      minAmount: undefined, maxAmount: undefined, dateRange: null,
      responsibleUnits: undefined, isOverflow: undefined,
    })
  }

  // 是否显示更新决策节点入口
  const canUpdateDecision = (record) => {
    if (record.projectCategory === '政策类' || record.projectCategory === '供地类') return true
    if (record.projectCategory === '投资类' && Number(record.investAmount) > 0.5) return true
    return false
  }

  const getMoreMenuItems = (record) => {
    if (!isSponsor) {
      // 接收方视角：只能查看详情（从项目名称或详情入口进入），更多菜单不提供操作
      return [
        { key: 'view', icon: <EyeOutlined />, label: '查看详情' },
      ]
    }
    const items = [
      { key: 'report', icon: <FileTextOutlined />, label: '进展汇报' },
      { key: 'edit', icon: <EditOutlined />, label: '编辑' },
      { key: 'assign', icon: <SendOutlined />, label: '分派' },
    ]
    // 移交：仅发起方、且该项目未移交过（仅支持一次）
    if (!transferStore.hasTransferred(record.key)) {
      items.push({ key: 'transfer', icon: <SwapOutlined />, label: '移交' })
    }
    if (canUpdateDecision(record)) {
      items.push({ key: 'decision', icon: <SettingOutlined />, label: '更新决策节点' })
    }
    items.push({ key: 'stop', icon: <PauseCircleOutlined />, label: '标记退库', danger: true })
    return items
  }

  const handleMoreClick = (e, record) => {
    setCurrentProject(record)
    if (e.key === 'view') {
      navigate(`/project/zaitan/detail/${record.key}`)
    } else if (e.key === 'stop') {
      setTuikuReason('')
      setTuikuVisible(true)
    } else if (e.key === 'report') {
      progressForm.resetFields()
      setProgressModalVisible(true)
    } else if (e.key === 'decision') {
      setDecisionModalVisible(true)
    } else if (e.key === 'edit') {
      setEditModalVisible(true)
    } else if (e.key === 'assign') {
      setAssignModalVisible(true)
    } else if (e.key === 'transfer') {
      setTransferVisible(true)
    }
  }

  const handleAssignOk = ({ targets }) => {
    setAssignModalVisible(false)
    setCurrentProject(null)
    // 给每个接收单位发消息（列表页分派的简易处理，不分派记录持久化到详情）
    targets.forEach(t => {
      msgStore.addMessage({
        toDeptKey: t.unitKey,
        title: '【协作任务分派】',
        content: `您有一条来自"市投促局"的"${currentProject?.projectName || ''}"协作配合任务，请及时查看并跟进处理。`,
        projectId: String(currentProject?.key || ''),
        projectName: currentProject?.projectName || '',
        type: 'assign',
      })
    })
    message.success(`已成功分派给 ${targets.length} 个单位`)
  }

  const handleProgressOk = async () => {
    try {
      await progressForm.validateFields()
      setProgressLoading(true)
      message.success('进展汇报已提交（demo示意）')
      setProgressModalVisible(false)
      progressForm.resetFields()
    } catch (e) {
      // validation
    } finally {
      setProgressLoading(false)
    }
  }

  const handleDecisionOk = () => {
    setDecisionModalVisible(false)
    setCurrentProject(null)
    message.success('决策节点已更新（demo示意）')
  }

  const handleEditOk = () => {
    setEditModalVisible(false)
    setCurrentProject(null)
  }

  const selectCommon = { allowClear: true, style: { width: '100%' } }
  const fw = 140

  const actionLinkStyle = { color: '#1677ff', display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 14, cursor: 'pointer' }

  // 渲染单元格
  const renderCell = (col, record) => {
    const v = record[col.dataIndex]
    if (col.dataIndex === 'reporter') {
      return <div style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{v}</div>
    }
    if (col.dataIndex === 'projectName') {
      return (
        <Tooltip title={v}>
          <span style={{ color: '#1677ff', cursor: 'pointer' }} onClick={() => navigate(`/project/zaitan/detail/${record.key}`)}>{v}</span>
        </Tooltip>
      )
    }
    if (col.dataIndex === 'chushangType') {
      return v === '-' || v === '' || v === undefined ? <span style={{ color: '#bfbfbf' }}>-</span> : v
    }
    if (col.dataIndex === 'projectDesc') {
      return <Tooltip title={v} placement="topLeft" overlayStyle={{ maxWidth: 480 }}><span>{v}</span></Tooltip>
    }
    if (col.dataIndex === 'investAmount') {
      return <span style={{ fontWeight: 600 }}>{Number(v).toFixed(2)}</span>
    }
    if (col.dataIndex === 'needInvestAmount') {
      // 需投资金额：非投资类项目无值显示 '-'
      return v === undefined || v === null || v === ''
        ? <span style={{ color: '#bfbfbf' }}>-</span>
        : <span style={{ fontWeight: 600 }}>{Number(v).toFixed(2)}</span>
    }
    if (col.dataIndex === 'registeredCapitalAmount') {
      return v === undefined || v === null || v === ''
        ? <span style={{ color: '#bfbfbf' }}>-</span>
        : Number(v).toFixed(2)
    }
    if (col.dataIndex === 'responsibleUnits') {
      return renderUnits(v)
    }
    if (col.dataIndex === 'action') {
      return (
        <Space size={0} split={<Divider type="vertical" style={{ margin: '0 6px', borderColor: '#d9d9d9' }} />}>
          <span style={actionLinkStyle} onClick={() => navigate(`/project/zaitan/detail/${record.key}`)}>
            <EyeOutlined /> 详情
          </span>
          {isSponsor && (
            <>
              <span style={actionLinkStyle} onClick={() => {
                setCurrentProject(record)
                Modal.confirm({
                  title: '转签约',
                  content: `确定将项目「${record.projectName}」推进至签约阶段吗？需要补充签约阶段必填字段信息。`,
                  okText: '去补充信息', cancelText: '取消',
                  onOk: () => setZhuanQianyueVisible(true),
                })
              }}>
                <EditOutlined /> 签约
              </span>
              <Dropdown menu={{ items: getMoreMenuItems(record), onClick: (e) => handleMoreClick(e, record) }} trigger={['click']}>
                <span style={actionLinkStyle} onClick={(e) => e.preventDefault()}>
                  <MoreOutlined />
                </span>
              </Dropdown>
            </>
          )}
        </Space>
      )
    }
    return v
  }

  // 根据visibleColumnKeys构建显示列
  const columns = useMemo(() => {
    return ALL_COLUMNS
      .filter(c => visibleColumnKeys.includes(c.key))
      .map(c => {
        const col = { ...c }
        col.render = (_, record) => renderCell(c, record)
        return col
      })
  }, [visibleColumnKeys])

  // 表头管理Popover内容
  const columnPopoverContent = (
    <div style={{ width: 200, maxHeight: 360, overflowY: 'auto' }}>
      <div style={{ marginBottom: 8, fontWeight: 600, fontSize: 13, color: '#666' }}>列显示设置</div>
      <Checkbox.Group
        style={{ display: 'flex', flexDirection: 'column', gap: 6 }}
        value={visibleColumnKeys}
        onChange={(keys) => {
          // 确保必选列始终选中
          const requiredKeys = ALL_COLUMNS.filter(c => c.required).map(c => c.key)
          const merged = [...new Set([...keys, ...requiredKeys])]
          setVisibleColumnKeys(merged)
        }}
      >
        {ALL_COLUMNS.map(c => (
          <Checkbox key={c.key} value={c.key} disabled={c.required} style={{ fontSize: 13 }}>
            {c.title}
          </Checkbox>
        ))}
      </Checkbox.Group>
      <Divider style={{ margin: '8px 0' }} />
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <Button type="link" size="small" style={{ padding: 0 }} onClick={() => setVisibleColumnKeys(DEFAULT_VISIBLE_KEYS)}>
          重置默认
        </Button>
        <Button type="link" size="small" style={{ padding: 0 }} onClick={() => {
          const optional = ALL_COLUMNS.filter(c => !c.required).map(c => c.key)
          setVisibleColumnKeys([...visibleColumnKeys.filter(k => ALL_COLUMNS.find(c => c.key === k)?.required), ...optional])
        }}>
          全选
        </Button>
      </div>
    </div>
  )

  return (
    <div className="page-container">
      {/* 筛选区域 */}
      <div className="filter-bar">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          <Input
            style={{ width: fw }}
            placeholder="项目名称"
            prefix={<SearchOutlined style={{ color: '#bfbfbf' }} />}
            value={filters.projectName}
            onChange={(e) => setFilters({ ...filters, projectName: e.target.value })}
            allowClear
          />
          <Select placeholder="项目分类" {...selectCommon} style={{ width: fw }}
            value={filters.projectCategory} onChange={(v) => setFilters({ ...filters, projectCategory: v })}
            options={['政策类', '投资类', '供地类', '其他'].map(v => ({ label: v, value: v }))} />
          <Select placeholder="产业类别" {...selectCommon} style={{ width: fw }}
            value={filters.category} onChange={(v) => setFilters({ ...filters, category: v })}
            options={industryCategoryOptions} />
          <Select placeholder="行业类别" {...selectCommon} style={{ width: fw }}
            value={filters.industryType} onChange={(v) => setFilters({ ...filters, industryType: v })}
            options={industryTypeOptions} />
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <InputNumber placeholder="投资金额" style={{ width: 110 }}
              value={filters.minAmount} onChange={(v) => setFilters({ ...filters, minAmount: v })}
              min={0} precision={2} addonAfter="亿" />
            <span style={{ color: '#bfbfbf' }}>--</span>
            <InputNumber placeholder="投资金额" style={{ width: 110 }}
              value={filters.maxAmount} onChange={(v) => setFilters({ ...filters, maxAmount: v })}
              min={0} precision={2} addonAfter="亿" />
          </div>
          <RangePicker style={{ width: 260 }} value={filters.dateRange}
            onChange={(v) => setFilters({ ...filters, dateRange: v })} />
          <Select
            mode="multiple"
            placeholder="责任单位"
            style={{ width: 220 }}
            value={filters.responsibleUnits}
            onChange={(v) => setFilters({ ...filters, responsibleUnits: v })}
            options={RESPONSIBLE_UNIT_SELECT_GROUPS}
            allowClear
            showSearch
            maxTagCount="responsive"
          />
          <div style={{ flex: 1, textAlign: 'right' }}>
            <Button
              type="link"
              icon={filterExpanded ? <UpOutlined /> : <DownOutlined />}
              onClick={() => setFilterExpanded(!filterExpanded)}
              style={{ padding: '4px 0', fontSize: 13 }}
            >
              {filterExpanded ? '收起' : '展开'}
            </Button>
          </div>
        </div>

        {filterExpanded && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 12, flexWrap: 'wrap' }}>
            <Select placeholder="楚商类型" {...selectCommon} style={{ width: fw }}
              value={filters.chushangType} onChange={(v) => setFilters({ ...filters, chushangType: v })}
              options={['湖北籍企业家', '武汉校友', '非楚商', '泛楚商'].map(v => ({ label: v, value: v }))} />
            <Select placeholder="内外资" {...selectCommon} style={{ width: fw }}
              value={filters.domesticForeign} onChange={(v) => setFilters({ ...filters, domesticForeign: v })}
              options={[{ label: '内资', value: '内资' }, { label: '外资', value: '外资' }]} />
            <Select placeholder="是否产业外溢" {...selectCommon} style={{ width: fw }}
              value={filters.isOverflow} onChange={(v) => setFilters({ ...filters, isOverflow: v })}
              options={[{ label: '是', value: '是' }, { label: '否', value: '否' }]} />
          </div>
        )}

        <div style={{ marginTop: 12, display: 'flex', gap: 8 }}>
          <Button type="primary" icon={<SearchOutlined />} onClick={handleSearch}>
            搜索
          </Button>
          {isSponsor && (
            <Button icon={<ExportOutlined />} onClick={() => message.success('导出任务已提交，请在消息中心查看')}>
              导出
            </Button>
          )}
          <Button icon={<ReloadOutlined />} onClick={handleReset}>
            重置
          </Button>
        </div>
      </div>

      {/* 表格区域 */}
      <div className="table-card">
        {/* 工具栏：左侧统计数据，右侧操作按钮 */}
        <div className="table-toolbar">
          <div className="table-toolbar-left" style={{ fontSize: 14, color: '#666' }}>
            共 <span style={{ color: '#1677ff', fontWeight: 600, fontSize: 16, margin: '0 4px' }}>{filteredData.length}</span> 个项目
            <span style={{ color: '#d9d9d9', margin: '0 16px' }}>|</span>
            当页投资额：<span style={{ color: '#1677ff', fontWeight: 600, fontSize: 16, margin: '0 4px' }}>{pageInvest.toFixed(1)} 亿元</span>
            <span style={{ color: '#d9d9d9', margin: '0 16px' }}>|</span>
            筛选投资总额：<span style={{ color: '#1677ff', fontWeight: 600, fontSize: 16, margin: '0 4px' }}>{filteredInvest.toFixed(1)} 亿元</span>
            {selectedRowKeys.length > 0 && (
              <span style={{ color: '#1677ff', fontSize: 13, marginLeft: 16 }}>已选 {selectedRowKeys.length} 项</span>
            )}
          </div>
          <Space size={8}>
            <Tooltip title="搜索">
              <Button type="text" icon={<SearchOutlined />} />
            </Tooltip>
            <Tooltip title="刷新">
              <Button type="text" icon={<ReloadOutlined />} onClick={() => window.location.reload()} />
            </Tooltip>
            <Popover
              content={columnPopoverContent}
              title={null}
              trigger="click"
              placement="bottomRight"
              open={columnPopoverOpen}
              onOpenChange={setColumnPopoverOpen}
            >
              <Tooltip title="表头管理">
                <Button type="text" icon={<SettingOutlined />} />
              </Tooltip>
            </Popover>
          </Space>
        </div>

        <Table
          columns={columns}
          dataSource={pageData}
          rowKey="key"
          scroll={{ x: 3540 }}
          sticky={{ offsetHeader: 0 }}
          size="middle"
          rowSelection={{
            selectedRowKeys,
            onChange: setSelectedRowKeys,
            columnWidth: 40,
          }}
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

      {/* 列表页弹窗：进展汇报 */}
      <Modal
        title={`进展汇报 - ${currentProject?.projectName || ''}`}
        open={progressModalVisible}
        onOk={handleProgressOk}
        onCancel={() => { setProgressModalVisible(false); progressForm.resetFields() }}
        confirmLoading={progressLoading}
        okText="提交"
        cancelText="取消"
        width={600}
        destroyOnClose
      >
        <Form form={progressForm} layout="vertical" requiredMark={true} style={{ marginTop: 16 }}>
          <Form.Item
            label="进展内容"
            name="content"
            rules={[{ required: true, message: '请输入进展内容' }, { max: 500, message: '进展内容不超过500个字符' }]}
          >
            <Input.TextArea rows={6} placeholder="请输入进展内容，最多500字" maxLength={500} showCount />
          </Form.Item>
        </Form>
      </Modal>

      {/* 列表页弹窗：更新决策节点 */}
      <UpdateDecisionModal
        key={`list-decision-${decisionModalVisible}`}
        open={decisionModalVisible}
        onCancel={() => { setDecisionModalVisible(false); setCurrentProject(null) }}
        onOk={handleDecisionOk}
        projectCategory={currentProject?.projectCategory}
        investAmount={currentProject?.investAmount}
        initialPassedNodes={{}}
      />

      {/* 列表页弹窗：编辑在谈项目 */}
      <ZaitanEditModal
        key={`list-edit-${editModalVisible}`}
        open={editModalVisible}
        onCancel={() => { setEditModalVisible(false); setCurrentProject(null) }}
        onOk={handleEditOk}
        projectData={currentProject}
      />

      {/* 列表页弹窗：分派 */}
      <AssignModal
        key={`list-assign-${assignModalVisible}`}
        open={assignModalVisible}
        projectName={currentProject?.projectName}
        onCancel={() => { setAssignModalVisible(false); setCurrentProject(null) }}
        onOk={handleAssignOk}
      />

      {/* 列表页弹窗：移交至园区 */}
      <TransferZaitanModal
        key={`list-transfer-${transferVisible}`}
        open={transferVisible}
        projectData={currentProject}
        onCancel={() => { setTransferVisible(false); setCurrentProject(null) }}
        onOk={() => { setTransferVisible(false); setCurrentProject(null) }}
      />

      {/* 列表页弹窗：转签约 */}
      <ZhuanQianyueModal
        key={`list-zhuanqianyue-${zhuanQianyueVisible}`}
        open={zhuanQianyueVisible}
        projectData={currentProject}
        onCancel={() => { setZhuanQianyueVisible(false); setCurrentProject(null) }}
        onOk={() => {
          message.success('转签约成功！项目已进入签约阶段（演示）')
          setZhuanQianyueVisible(false)
          setCurrentProject(null)
        }}
      />

      {/* 列表页弹窗：退库确认 */}
      <Modal
        title={
          <span style={{ color: '#d4380d' }}>
            <ExclamationCircleOutlined style={{ marginRight: 8 }} />
            确认退库
          </span>
        }
        open={tuikuVisible}
        onCancel={() => { setTuikuVisible(false); setTuikuReason('') }}
        okText="确认退库"
        cancelText="取消"
        okButtonProps={{ danger: true }}
        onOk={() => {
          message.success('已标记为退库')
          setTuikuVisible(false)
          setTuikuReason('')
        }}
      >
        <div style={{ marginBottom: 16 }}>
          确定将项目「<strong>{currentProject?.projectName}</strong>」标记为退库吗？退库后不可恢复。
        </div>
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 13, color: '#595959', marginBottom: 6 }}>
            退库说明 <span style={{ color: '#bfbfbf' }}>（非必填，最多500字）</span>
          </div>
          <Input.TextArea
            value={tuikuReason}
            onChange={(e) => setTuikuReason(e.target.value)}
            placeholder="请输入退库原因（非必填）"
            maxLength={500}
            showCount
            rows={4}
          />
        </div>
      </Modal>
    </div>
  )
}
