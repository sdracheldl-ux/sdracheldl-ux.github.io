import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Space, Tag, Tooltip, message } from 'antd'
import { EyeOutlined, AuditOutlined } from '@ant-design/icons'
import GenericProjectList from '../components/GenericProjectList'
import TuikuAuditModal from '../components/TuikuAuditModal'
import mockData from '../mock/data.json'
import { RESPONSIBLE_UNIT_OPTIONS, normalizeResponsibleUnits } from '../constants/projectEnums'
import { useViewRole, msgStore, tuikuAuditStore, useTuikuAuditStore } from '../store/viewStore'

const actionLinkStyle = { color: '#1677ff', display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 14, cursor: 'pointer' }

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

// 模拟退库时用户填写的说明（自由文本，非固定选项）
const MOCK_TUIKU_REASONS = [
  '投资方战略调整，暂缓推进',
  '选址不符合园区规划要求',
  '政策条件未达成一致意见',
  '企业资金链紧张，暂停投资计划',
  '重复申报无效，与库中项目合并处理',
  '项目方主动撤回申请',
  '产业方向调整，不再符合当前招商重点',
]

// 谋划阶段退库记录（谋划项目信息不全，部分字段为空）
const MOCK_MOUHUA_TUIKU = [
  {
    '项目名称': '低空经济飞行服务保障中心项目',
    '申报人': '发改局-刘敏',
    '投资主体': '武汉星航低空科技有限公司',
    '投资金额（亿元）': '',
    '产业类别': '低空经济',
    '行业类别': '',
    '来源地': '武汉本地',
    '企业性质': '',
    '申报时间': '2026-07-12',
  },
  {
    '项目名称': '钙钛矿光伏中试线项目',
    '申报人': '智造园-石丰浩',
    '投资主体': '',
    '投资金额（亿元）': '',
    '产业类别': '新能源',
    '行业类别': '节能环保与新能源',
    '来源地': '',
    '企业性质': '民企',
    '申报时间': '2026-08-02',
  },
  {
    '项目名称': '生物制造中试平台项目',
    '申报人': '生物城-王科长',
    '投资主体': '',
    '投资金额（亿元）': '',
    '产业类别': '',
    '行业类别': '',
    '来源地': '',
    '企业性质': '',
    '申报时间': '',
  },
]

function buildTuikuItem(raw, idx, sourceStage, reason, tuikuTime, tuikuOperator) {
  const units = normalizeResponsibleUnits(raw['责任单位'] || raw.responsibleUnits)
  return {
    key: `tuiku-${idx + 1}`,
    index: idx + 1,
    reporter: raw['申报人'] || '-',
    projectStatus: '已退库',
    projectName: raw['项目名称'] || '-',
    sourceStage,
    sourceArea: raw['来源地'] || '-',
    industryCategory: raw['产业类别'] || '-',
    industryType: raw['行业类别（门类）'] || raw['行业类别'] || '-',
    investorEntity: raw['投资主体'] || '-',
    investAmount: raw['投资金额(亿元)'] || raw['投资金额（亿元）'] || 0,
    responsibleUnits: units.length ? units : [RESPONSIBLE_UNIT_OPTIONS[idx % RESPONSIBLE_UNIT_OPTIONS.length]],
    enterpriseNature: raw['企业性质'] || '-',
    domesticForeign: raw['内外资'] || '-',
    projectDesc: raw['项目简介'] || '',
    tuikuReason: reason,
    tuikuTime,
    tuikuOperator,
    reportTime: raw['申报时间'] || '-',
    auditStatus: '已退库',
  }
}

// 构建退库列表数据（导出供详情页复用，保证直接访问/刷新详情页时仍可读取）
export function buildTuikuList() {
  const items = []

  // 签约阶段退库审核记录（动态：待审核/已退库/已驳回，含驳回保留展示）
  tuikuAuditStore.getAuditList().forEach((a) => {
    items.push({
      key: `tuiku-audit-${a.id}`,
      index: items.length + 1,
      reporter: a.applicantDeptName || '-',
      projectStatus: a.status === 'approved' ? '已退库' : '签约阶段',
      projectName: a.projectName || '-',
      sourceStage: '签约',
      sourceArea: '-',
      industryCategory: '-',
      industryType: '-',
      investorEntity: '-',
      investAmount: 0,
      responsibleUnits: [],
      enterpriseNature: '-',
      domesticForeign: '-',
      projectDesc: '',
      tuikuReason: a.reason || '',
      tuikuTime: a.auditTime || '-',
      tuikuOperator: a.auditor || a.applicantDeptName || '-',
      reportTime: a.applyTime || '-',
      auditStatus: a.status === 'pending' ? '待审核' : a.status === 'approved' ? '已退库' : '已驳回',
      auditId: a.id,
      auditOpinion: a.auditOpinion,
      applicant: a.applicantDeptName,
      applyTime: a.applyTime,
      _audit: a,
    })
  })

  // 从在谈项目取2条退库记录
  const zaitanTail = mockData.zaitan.slice(-2)
  zaitanTail.forEach((item, i) => {
    items.push(buildTuikuItem(item, items.length, '在谈', MOCK_TUIKU_REASONS[i], `2026-08-${20 + i} 14:30`, '投促局 易成豪'))
  })

  // 谋划阶段退库记录
  MOCK_MOUHUA_TUIKU.forEach((item, i) => {
    items.push(buildTuikuItem(item, items.length, '谋划', MOCK_TUIKU_REASONS[4 + i], `2026-08-${25 + i} 10:00`, item['申报人'] || '投促局 易成豪'))
  })

  return items
}

export default function Tuiku() {
  const navigate = useNavigate()
  const { role, isSponsor } = useViewRole()
  const audits = useTuikuAuditStore()
  const [auditVisible, setAuditVisible] = useState(false)
  const [auditRecord, setAuditRecord] = useState(null)

  const dataList = useMemo(() => buildTuikuList(), [audits])

  const handleDetail = (record) => {
    navigate(`/project/tuiku/detail/${record.key}`, { state: { record } })
  }

  // 审核提交：更新审核状态 + 消息通知申请人单位
  const handleAuditOk = ({ result, opinion }) => {
    const rec = auditRecord
    tuikuAuditStore.audit(rec.auditId, {
      result,
      opinion,
      auditor: `${role.deptName} ${role.userName}`,
    })
    msgStore.addMessage({
      toDeptKey: rec._audit.applicantDeptKey,
      category: 'coop',
      title: result === 'approved' ? '【退库审核通过】' : '【退库审核驳回】',
      content: `"${rec.projectName}"退库申请${result === 'approved' ? '已通过，项目已正式退库' : `被驳回：${opinion}`}。`,
      projectId: rec._audit.projectId,
      stage: 'qianyue',
      projectName: rec.projectName,
      type: result === 'approved' ? 'success' : 'warning',
    })
    message.success(result === 'approved' ? '审核通过，项目已退库' : '已驳回该退库申请')
    setAuditVisible(false)
  }

  const columns = useMemo(() => [
    { key: 'index', title: '序号', dataIndex: 'index', width: 55, align: 'center', fixed: 'left', required: true },
    { key: 'sourceStage', title: '原阶段', dataIndex: 'sourceStage', width: 80, align: 'center', fixed: 'left',
      render: (v) => {
        const colorMap = { '谋划': 'blue', '在谈': 'gold', '签约': 'volcano' }
        return <Tag color={colorMap[v] || 'default'} style={{ margin: 0 }}>{v}</Tag>
      }
    },
    { key: 'projectName', title: '项目名称', dataIndex: 'projectName', width: 240, ellipsis: true, fixed: 'left', required: true,
      render: (v, record) => (
        <Tooltip title={v}>
          <span style={{ color: '#1677ff', cursor: 'pointer' }} onClick={() => handleDetail(record)}>{v}</span>
        </Tooltip>
      )
    },
    { key: 'tuikuReason', title: '退库原因', dataIndex: 'tuikuReason', width: 220, ellipsis: true,
      render: (v) => (
        <Tooltip title={v}>
          <span style={{ color: '#d4380d' }}>{v}</span>
        </Tooltip>
      )
    },
    { key: 'tuikuTime', title: '退库时间', dataIndex: 'tuikuTime', width: 130, align: 'center' },
    { key: 'auditStatus', title: '审核状态', dataIndex: 'auditStatus', width: 90, align: 'center',
      render: (v) => {
        const colorMap = { '待审核': 'orange', '已退库': 'default', '已驳回': 'red' }
        return <Tag color={colorMap[v] || 'default'} style={{ margin: 0 }}>{v}</Tag>
      }
    },
    { key: 'investorEntity', title: '投资主体', dataIndex: 'investorEntity', width: 180, ellipsis: true,
      render: (v) => v === '-' ? <span style={{ color: '#bfbfbf' }}>{v}</span> : v
    },
    { key: 'investAmount', title: '投资金额(亿元)', dataIndex: 'investAmount', width: 120, align: 'right',
      render: (v) => Number(v) > 0 ? <span style={{ fontWeight: 600 }}>{Number(v).toFixed(2)}</span> : <span style={{ color: '#bfbfbf' }}>-</span>
    },
    { key: 'responsibleUnits', title: '责任单位', dataIndex: 'responsibleUnits', width: 200,
      render: (v) => renderUnits(v)
    },
    { key: 'industryCategory', title: '产业类别', dataIndex: 'industryCategory', width: 90, align: 'center',
      render: (v) => v === '-' ? <span style={{ color: '#bfbfbf' }}>{v}</span> : v
    },
    { key: 'industryType', title: '行业类别', dataIndex: 'industryType', width: 140, ellipsis: true,
      render: (v) => v === '-' ? <span style={{ color: '#bfbfbf' }}>{v}</span> : v
    },
    { key: 'sourceArea', title: '来源地', dataIndex: 'sourceArea', width: 100, ellipsis: true,
      render: (v) => v === '-' ? <span style={{ color: '#bfbfbf' }}>{v}</span> : v
    },
    { key: 'enterpriseNature', title: '企业性质', dataIndex: 'enterpriseNature', width: 90, align: 'center',
      render: (v) => v === '-' ? <span style={{ color: '#bfbfbf' }}>{v}</span> : v
    },
    { key: 'reporter', title: '申报人', dataIndex: 'reporter', width: 110, ellipsis: true },
    { key: 'reportTime', title: '申报时间', dataIndex: 'reportTime', width: 110, align: 'center' },
    { key: 'action', title: '操作', dataIndex: 'action', width: 140, fixed: 'right', align: 'center', required: true,
      render: (_, record) => (
        <Space size={4} split={<span style={{ color: '#e8e8e8' }}>|</span>}>
          <span style={actionLinkStyle} onClick={() => handleDetail(record)}>
            <EyeOutlined /> 详情
          </span>
          {isSponsor && record.auditStatus === '待审核' && (
            <span style={{ ...actionLinkStyle, color: '#d4380d' }}
              onClick={() => { setAuditRecord(record); setAuditVisible(true) }}>
              <AuditOutlined /> 审核
            </span>
          )}
        </Space>
      )
    },
  ], [isSponsor])

  const extraFilters = [
    { key: 'sourceStage', label: '原阶段', type: 'select',
      options: [{ label: '谋划', value: '谋划' }, { label: '在谈', value: '在谈' }, { label: '签约', value: '签约' }]
    },
  ]

  return (
    <>
      <GenericProjectList
        stage="tuiku"
        title="项目退库"
        canAdd={false}
        canImport={false}
        dataList={dataList}
        columns={columns}
        filters={extraFilters}
        hiddenFilters={['acceptStatus', 'auditStatus', 'warnStatus', 'enterpriseNature']}
        scrollX={2100}
      />
      {/* 退库审核弹窗（投促局） */}
      <TuikuAuditModal
        open={auditVisible}
        record={auditRecord}
        onCancel={() => setAuditVisible(false)}
        onOk={handleAuditOk}
      />
    </>
  )
}
