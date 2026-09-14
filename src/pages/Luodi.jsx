import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Space, Tag, Tooltip, Divider } from 'antd'
import { EyeOutlined } from '@ant-design/icons'
import GenericProjectList from '../components/GenericProjectList'
import mockData from '../mock/data.json'
import { actionLinkStyle } from '../constants/uiStyles'
import { RESPONSIBLE_UNIT_SELECT_GROUPS, RESPONSIBLE_UNIT_OPTIONS, normalizeResponsibleUnits, CITY_CODE_SEEDS } from '../constants/projectEnums'

const emptyTag = (v) => (v && v !== '-' ? v : <span style={{ color: '#bfbfbf' }}>-</span>)
const tagStartType = (v) => {
  if (!v || v === '-') return <span style={{ color: '#bfbfbf' }}>-</span>
  const colorMap = { '已开工（设备购置类）': 'blue', '开业': 'purple', '已开工（建安类）': 'cyan' }
  return <Tag color={colorMap[v] || 'default'} style={{ margin: 0 }}>{v}</Tag>
}

const formatDate = (val) => {
  if (!val || val === '-') return '-'
  if (typeof val === 'number') {
    const date = new Date((val - 25569) * 86400 * 1000)
    return date.toISOString().split('T')[0]
  }
  return val
}

// 责任单位 Tag 渲染（最多3个，超出+N；空值回退 '-'）
const renderUnits = (v) => {
  const list = normalizeResponsibleUnits(v)
  if (list.length === 0) return <span style={{ color: '#bfbfbf' }}>-</span>
  const unitTagStyle = { background: '#e6f4ff', color: '#1677ff', border: '1px solid #91caff', margin: 0 }
  const shown = list.slice(0, 3)
  const rest = list.length - shown.length
  return (
    <Space size={4} wrap>
      {shown.map(u => <Tag key={u} style={unitTagStyle}>{u}</Tag>)}
      {rest > 0 && <Tag style={unitTagStyle}>+{rest}</Tag>}
    </Space>
  )
}

export default function Luodi() {
  const navigate = useNavigate()

  const dataList = useMemo(() => {
    return mockData.luodi.map((item, idx) => ({
      key: item.id,
      index: idx + 1,
      reporter: item['申报人'] || '-',
      projectName: item['项目名称'] || '-',
      // 编码：市级（种子）+ 区级（编号）
      cityProjectCode: item['市级项目编码'] || CITY_CODE_SEEDS[idx % CITY_CODE_SEEDS.length],
      districtProjectCode: item['编号'] || '-',
      // 签约口径字段
      capitalNature: item['内外资'] || '-',
      industryCategory: item['产业类别'] || '-',
      industryType: item['行业类别（门类）'] || '-',
      investAmount: item['计划投资总额(亿元)'] || item['投资金额(亿元)'] || 0,
      recordAmount: item['备案证金额(亿元)'] || [0.6, 1.2, 0.35, 2.1][idx % 4],
      fixedInvestAmount: item['固投金额(亿元)'] || 0,
      signDate: item['协议签订时间'] || ['2026-03-15', '2026-04-02', '2026-05-20', '2026-06-11'][idx % 4],
      agreementType: item['协议类型'] || ['投资协议', '框架协议', '投资协议', '补充协议'][idx % 4],
      // 落地字段
      startType: item['开工开业类型'] || '-',
      startDate: formatDate(item['开工/业时间']),
      responsibleUnits: [RESPONSIBLE_UNIT_OPTIONS[idx % RESPONSIBLE_UNIT_OPTIONS.length]],
      _raw: item,
    }))
  }, [])

  const handleDetail = (record) => navigate(`/project/luodi/detail/${record.key}`)

  const columns = useMemo(() => [
    { key: 'index', title: '序号', dataIndex: 'index', width: 55, align: 'center', fixed: 'left', required: true },
    { key: 'cityProjectCode', title: '市级项目编码', dataIndex: 'cityProjectCode', width: 145, align: 'center' },
    { key: 'districtProjectCode', title: '区级项目编码', dataIndex: 'districtProjectCode', width: 130, align: 'center' },
    { key: 'reporter', title: '申报人', dataIndex: 'reporter', width: 90, align: 'center',
      render: (v) => <div style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{v}</div>
    },
    { key: 'projectName', title: '项目名称', dataIndex: 'projectName', width: 220, ellipsis: true, required: true,
      render: (v, record) => (
        <Tooltip title={v}>
          <span style={{ color: '#1677ff', cursor: 'pointer' }} onClick={() => handleDetail(record)}>{v}</span>
        </Tooltip>
      )
    },
    { key: 'capitalNature', title: '内外资', dataIndex: 'capitalNature', width: 70, align: 'center' },
    { key: 'industryCategory', title: '产业类别', dataIndex: 'industryCategory', width: 90, align: 'center' },
    { key: 'industryType', title: '行业类别', dataIndex: 'industryType', width: 160, ellipsis: true },
    {
      key: 'investAmount', title: '计划投资总额(亿元)', dataIndex: 'investAmount', width: 145, align: 'right', sorter: true,
      render: (v) => <span style={{ fontWeight: 600 }}>{Number(v).toFixed(2)}</span>
    },
    {
      key: 'recordAmount', title: '备案证金额(亿元)', dataIndex: 'recordAmount', width: 140, align: 'right',
      render: (v) => Number(v).toFixed(2)
    },
    {
      key: 'fixedInvestAmount', title: '固投金额(亿元)', dataIndex: 'fixedInvestAmount', width: 120, align: 'right',
      render: (v) => Number(v).toFixed(2)
    },
    { key: 'signDate', title: '协议签订时间', dataIndex: 'signDate', width: 110, align: 'center' },
    { key: 'agreementType', title: '协议类型', dataIndex: 'agreementType', width: 100, align: 'center' },
    { key: 'startType', title: '开工开业类型', dataIndex: 'startType', width: 170, align: 'center',
      render: (v) => tagStartType(v)
    },
    { key: 'startDate', title: '开工/开业时间', dataIndex: 'startDate', width: 120, align: 'center' },
    { key: 'responsibleUnits', title: '责任单位', dataIndex: 'responsibleUnits', width: 220,
      render: (v) => renderUnits(v)
    },
    { key: 'reportTime', title: '申报时间', dataIndex: 'reportTime', width: 110, align: 'center',
      render: (_, r) => emptyTag(r._raw['申报时间'])
    },
    { key: 'action', title: '操作', dataIndex: 'action', width: 80, fixed: 'right', align: 'center', required: true,
      render: (_, record) => (
        <Space size={0} split={<Divider type="vertical" style={{ margin: '0 6px', borderColor: '#d9d9d9' }} />}>
          <span style={actionLinkStyle} onClick={() => handleDetail(record)}>
            <EyeOutlined /> 详情
          </span>
        </Space>
      )
    },
  ], [])

  const extraFilters = [
    { key: 'capitalNature', dataIndex: 'capitalNature', label: '内外资', type: 'select', options: [
      { label: '内资', value: '内资' },
      { label: '外资', value: '外资' },
    ]},
    { key: 'startType', dataIndex: 'startType', label: '开工开业类型', type: 'select', options: [
      { label: '已开工（设备购置类）', value: '已开工（设备购置类）' },
      { label: '开业', value: '开业' },
      { label: '已开工（建安类）', value: '已开工（建安类）' },
    ]},
    { key: 'responsibleUnits', dataIndex: 'responsibleUnits', label: '责任单位', type: 'select', multiple: true, options: RESPONSIBLE_UNIT_SELECT_GROUPS },
  ]

  return (
    <>
      <GenericProjectList
        stage="luodi"
        dataList={dataList}
        columns={columns}
        filters={extraFilters}
        hiddenFilters={['acceptStatus', 'auditStatus', 'warnStatus', 'enterpriseNature']}
        title="项目落地"
        canAdd={false}
        canImport={false}
        scrollX={2340}
      />
    </>
  )
}
