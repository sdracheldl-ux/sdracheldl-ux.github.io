/**
 * 退库项目详情页（只读）
 * 展示项目历史信息：基础信息、进展信息、分派情况。
 * 已退库项目不可恢复、不可编辑，仅供查看。
 */
import { useMemo, useState } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { Tabs, Descriptions, Button, Tag, Space, Timeline, Empty, Result, message } from 'antd'
import { ArrowLeftOutlined, StopOutlined, ClockCircleOutlined, AuditOutlined } from '@ant-design/icons'
import ProgressTimeline from '../components/ProgressTimeline'
import TuikuAuditModal from '../components/TuikuAuditModal'
import { buildTuikuList } from './Tuiku'
import mockData from '../mock/data.json'
import {
  normalizeResponsibleUnits,
  RESPONSIBLE_UNIT_OPTIONS,
  CITY_CODE_SEEDS,
} from '../constants/projectEnums'
import { useViewRole, msgStore, tuikuAuditStore, useTuikuAuditStore } from '../store/viewStore'
import {
  COLORS,
  sectionTitleStyle,
  descriptionsProps as baseDescriptionsProps,
  pageCardStyle,
  detailHeaderStyle,
  detailHeaderLeftStyle,
  emptyTag,
  PROGRESS_TYPE,
} from '../constants/uiStyles'

/* ========== mock 历史数据构建 ========== */

function pad(n) { return String(n).padStart(2, '0') }

// 签约退库审核项目：按签约详情同口径映射项目字段（字段及排版与 QianyueDetail 基础信息一致）
function buildQianyueInfo(projectId) {
  const item = mockData.qianyue.find(i => String(i.id) === String(projectId)) || mockData.qianyue[0]
  const rowIdx = mockData.qianyue.indexOf(item)
  const seed = (v, i) => (v && v !== '-' ? v : ['政策类', '投资类', '供地类', '其他'][i % 4])
  const idx = rowIdx >= 0 ? rowIdx : 0
  const units = normalizeResponsibleUnits(item['责任单位'] === '-' ? '' : item['责任单位'])
  return {
    responsibleUnits: units.length ? units : [RESPONSIBLE_UNIT_OPTIONS[idx % RESPONSIBLE_UNIT_OPTIONS.length]],
    projectCode: item['编号'] || `QY202609${String(idx + 1).padStart(3, '0')}`,
    cityProjectCode: item['市级项目编码'] || CITY_CODE_SEEDS[idx % CITY_CODE_SEEDS.length],
    projectName: item['项目名称'] || '-',
    reporter: item['申报人'] || '-',
    reportTime: item['申报时间'] || '2026-09-01',
    capitalNature: item['内外资'] || '内资',
    sourceArea: item['来源地'] || '-',
    industryCategory: item['产业类别'] || '-',
    industryType: item['行业类别'] || item['行业类别（门类）'] || '-',
    secondaryIndustryCategory: item['次要行业类别'] || '-',
    projectDesc: item['项目简介'] || '-',
    projectCategory: seed(item['项目分类'], rowIdx),
    investAmount: item['计划投资总额(亿元)'] || item['投资金额(亿元)'] || 0,
    needInvestAmount: item['需投资金额(亿元)'] || '-',
    investorEntity: item['投资主体'] || '-',
    dockingDate: item['对接时间'] || '-',
    enterpriseCategory: item['企业类别'] || '-',
    isStock: item['是否为存量企业'] || '否',
    registeredCapitalAmount: item['注册资本(亿元)'] || '-',
    isEnclave: item['是否飞地园区'] || '否',
    isOverflow: item['是否产业外溢'] || '否',
    chuShangType: item['楚商类型'] || '-',
    constructionNature: item['建设性质'] || '-',
    constructionNatureLevel2: item['建设分类'] || '-',
    merchantType: item['招商类型'] || '-',
    merchantTypeDesc: item['招商类型说明'] || '-',
    isZheshang: item['是否浙商'] || '否',
    landSituation: item['用地情况'] || '-',
    isHqEconomy: item['是否总部经济'] || '否',
    hqEconomyLevel1: item['总部经济类型一级'] || '-',
    hqEconomyLevel2: item['总部经济类型二级'] || '-',
    recordAmount: item['备案证金额(亿元)'] || 0,
    fixedInvestAmount: item['固投金额(亿元)'] || 0,
    signDate: item['协议签订时间'] || '2026-09-01',
    agreementType: item['协议类型'] || '投资协议',
    isRegister: item['是否注册'] || item['是否已注册'] || '否',
    registerDate: item['注册时间'] || '-',
    registerCapitalAmount: item['注册资本'] || '-',
    registerCapitalUnit: item['注册资本单位'] || '万元',
    registerCompanyName: item['注册公司名称'] || '-',
    signSubject: item['签约主体(洽谈主体)'] || item['签约主体'] || '-',
  }
}

// 基于基准日期偏移天数，返回 "yyyy-MM-dd HH:mm"
function addDays(dateStr, days, time = '10:00') {
  const base = dateStr && dateStr !== '-' ? dateStr : '2026-06-10'
  const d = new Date(base)
  if (isNaN(d.getTime())) return `${base} ${time}`
  d.setDate(d.getDate() + days)
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${time}`
}

// 历史进展（含退库系统事件）
function buildProgressList(r) {
  const list = []
  const reporter = r.reporter !== '-' ? r.reporter : '投促局 易成豪'

  list.push({
    id: 'sys-create',
    type: PROGRESS_TYPE.SYSTEM,
    content: '新增项目',
    reporter,
    updateTime: addDays(r.reportTime, 0, '09:00'),
  })

  if (r.sourceStage === '在谈') {
    list.push({
      id: 'prog-mouhua-1',
      type: PROGRESS_TYPE.NORMAL,
      stage: '谋划阶段',
      content: '完成项目初步摸排，形成投资意向方案，明确投资方向及初步选址需求。',
      reporter,
      updateTime: addDays(r.reportTime, 3, '15:00'),
    })
    list.push({
      id: 'sys-stage',
      type: PROGRESS_TYPE.SYSTEM,
      content: '项目由谋划阶段转入在谈',
      reporter,
      updateTime: addDays(r.reportTime, 6, '10:00'),
    })
    list.push({
      id: 'prog-zaitan-1',
      type: PROGRESS_TYPE.NORMAL,
      stage: '在谈阶段',
      content: '已与投资方完成首轮对接，投资方对项目落地条件表示认可，待进一步细化合作条款。',
      reporter,
      updateTime: addDays(r.reportTime, 14, '14:30'),
    })
    list.push({
      id: 'prog-zaitan-2',
      type: PROGRESS_TYPE.NORMAL,
      stage: '在谈阶段',
      content: '双方就投资规模、载体选址及扶持政策进行多轮磋商，部分核心条款尚未达成一致。',
      reporter,
      updateTime: addDays(r.reportTime, 22, '16:00'),
    })
  } else {
    list.push({
      id: 'prog-mouhua-1',
      type: PROGRESS_TYPE.NORMAL,
      stage: '谋划阶段',
      content: '完成项目信息初步采集，待进一步核实投资主体及投资意愿。',
      reporter,
      updateTime: addDays(r.reportTime, 4, '11:00'),
    })
  }

  // 退库系统事件（最后一条）
  list.push({
    id: 'sys-tuiku',
    type: PROGRESS_TYPE.SYSTEM,
    content: '项目已被标记为退库' + (r.tuikuReason ? `：${r.tuikuReason}` : ''),
    reporter: r.tuikuOperator,
    updateTime: r.tuikuTime,
  })

  return list
}

// 历史分派记录（谋划阶段退库项目无分派）
function buildAssignList(r) {
  if (r.sourceStage !== '在谈') return []
  return [
    {
      id: 'a-kcj', fromDeptName: '市投促局', toDeptName: '科创局',
      assignTime: addDays(r.reportTime, 8, '10:30'),
      content: '请协助核实企业资质及产业政策适配情况，评估项目落地可行性。',
      status: 'done',
      finishTime: addDays(r.reportTime, 12, '17:30'),
      feedbacks: [
        {
          id: 'fb-1', user: '科创局-王科长', time: addDays(r.reportTime, 12, '17:30'),
          content: '已完成核实，企业具备相关资质，但投资强度未达到我区重点项目准入标准。',
        },
      ],
    },
    {
      id: 'a-qfj', fromDeptName: '市投促局', toDeptName: '企服局',
      assignTime: addDays(r.reportTime, 10, '09:00'),
      content: '请对接企业服务政策，梳理可提供的扶持措施清单。',
      status: 'processing',
      finishTime: null,
      feedbacks: [],
    },
  ]
}

// 分派状态Tag：项目退库后未完成任务自动终止
function assignStatusTag(status) {
  if (status === 'done') return <Tag color="success" style={{ marginLeft: 12 }}>已完成</Tag>
  return <Tag color="default" style={{ marginLeft: 12 }}>已终止</Tag>
}

// 责任单位 Tag 渲染（只读，最多3个，超出+N；空值回退 '-'）
function renderUnits(v) {
  const list = normalizeResponsibleUnits(v)
  if (list.length === 0) return emptyTag('')
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

export default function TuikuDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const { role, isSponsor } = useViewRole()
  const [auditVisible, setAuditVisible] = useState(false)

  // 优先读取路由 state（列表跳转带入），否则按 key 重建（刷新/直接访问兼容）；
  // 签约审核记录用store最新状态覆盖快照，保证审核后页面状态/Tag/进展实时更新
  const audits = useTuikuAuditStore()
  const record = useMemo(() => {
    const base = location.state?.record || buildTuikuList().find(r => r.key === id)
    if (!base?._audit) return base
    const latest = tuikuAuditStore.getByProject(base._audit.projectId)
    if (!latest) return base
    return {
      ...base,
      auditStatus: latest.status === 'pending' ? '待审核' : latest.status === 'approved' ? '已退库' : '已驳回',
      tuikuTime: latest.auditTime || '-',
      tuikuOperator: latest.auditor || base.tuikuOperator,
      _audit: latest,
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, location.state, audits])

  // 签约阶段退库审核记录：基础信息套用签约详情同口径
  const isQianyueAudit = !!record?._audit
  const qianyueInfo = useMemo(
    () => (isQianyueAudit ? buildQianyueInfo(record._audit.projectId) : null),
    [isQianyueAudit, record]
  )

  const progressList = useMemo(() => {
    if (!record) return []
    // 签约审核记录：进展仅展示退库申请/审核系统事件
    if (record._audit) {
      const a = record._audit
      const list = [{
        id: 'sys-tuiku-apply',
        type: PROGRESS_TYPE.SYSTEM,
        content: '已提交退库申请' + (a.reason ? `：${a.reason}` : '') + '，等待投促局审核',
        reporter: a.applicantDeptName,
        updateTime: a.applyTime,
      }]
      if (a.status === 'approved') {
        list.push({
          id: 'sys-tuiku-pass', type: PROGRESS_TYPE.SYSTEM,
          content: '退库审核通过，项目已退库',
          reporter: a.auditor, updateTime: a.auditTime,
        })
      } else if (a.status === 'rejected') {
        list.push({
          id: 'sys-tuiku-reject', type: PROGRESS_TYPE.SYSTEM,
          content: `退库申请被驳回：${a.auditOpinion || '-'}`,
          reporter: a.auditor, updateTime: a.auditTime,
        })
      }
      return list
    }
    return buildProgressList(record)
  }, [record])
  const assignList = useMemo(() => (record ? buildAssignList(record) : []), [record])

  const handleBack = () => navigate('/project/tuiku')

  // 审核提交：更新审核状态 + 消息通知申请人单位（与退库列表审核逻辑一致）
  const handleAuditOk = ({ result, opinion }) => {
    tuikuAuditStore.audit(record.auditId, {
      result,
      opinion,
      auditor: `${role.deptName} ${role.userName}`,
    })
    msgStore.addMessage({
      toDeptKey: record._audit.applicantDeptKey,
      category: 'coop',
      title: result === 'approved' ? '【退库审核通过】' : '【退库审核驳回】',
      content: `"${record.projectName}"退库申请${result === 'approved' ? '已通过，项目已正式退库' : `被驳回：${opinion}`}。`,
      projectId: record._audit.projectId,
      stage: 'qianyue',
      projectName: record.projectName,
      type: result === 'approved' ? 'success' : 'warning',
    })
    message.success(result === 'approved' ? '审核通过，项目已退库' : '已驳回该退库申请')
    setAuditVisible(false)
  }

  if (!record) {
    return (
      <div className="page-container">
        <div className="table-card" style={pageCardStyle}>
          <Result
            status="warning"
            title="未找到该退库项目"
            subTitle="记录可能已被删除，请返回列表重新查看"
            extra={<Button type="primary" onClick={handleBack}>返回列表</Button>}
          />
        </div>
      </div>
    )
  }

  const stageColorMap = { '谋划': 'blue', '在谈': 'gold', '签约': 'volcano' }

  // 头部状态Tag按审核状态区分
  const auditStatusTag = record.auditStatus === '待审核'
    ? <Tag icon={<ClockCircleOutlined />} color="orange" style={{ margin: 0 }}>退库审核中</Tag>
    : record.auditStatus === '已驳回'
      ? <Tag icon={<StopOutlined />} color="red" style={{ margin: 0 }}>已驳回</Tag>
      : <Tag icon={<StopOutlined />} color="error" style={{ margin: 0 }}>已退库</Tag>

  return (
    <div className="page-container">
      <div className="table-card" style={pageCardStyle}>
        <div style={detailHeaderStyle}>
          <div style={detailHeaderLeftStyle}>
            <Button type="text" icon={<ArrowLeftOutlined />} onClick={handleBack} style={{ marginLeft: -8 }}>
              返回
            </Button>
            <span style={{ fontSize: 18, fontWeight: 600 }}>{record.projectName}</span>
            {auditStatusTag}
            <Tag color={stageColorMap[record.sourceStage] || 'default'} style={{ margin: 0 }}>原阶段：{record.sourceStage}</Tag>
          </div>
          {isSponsor && record.auditStatus === '待审核' && (
            <Button danger icon={<AuditOutlined />} onClick={() => setAuditVisible(true)}>
              审核
            </Button>
          )}
        </div>

        <Tabs
          defaultActiveKey="basic"
          items={[
            {
              key: 'basic',
              label: '基础信息',
              children: isQianyueAudit ? (
                /* 签约阶段退库审核项目：字段及排版沿用签约项目详情 */
                <div>
                  <div style={sectionTitleStyle}>退库审核信息</div>
                  <Descriptions {...baseDescriptionsProps} style={{ marginBottom: 24 }}>
                    <Descriptions.Item label="审核状态">
                      <Tag color={record.auditStatus === '待审核' ? 'orange' : record.auditStatus === '已驳回' ? 'red' : 'default'} style={{ margin: 0 }}>
                        {record.auditStatus}
                      </Tag>
                    </Descriptions.Item>
                    <Descriptions.Item label="申请人">{emptyTag(record._audit.applicantDeptName)}</Descriptions.Item>
                    <Descriptions.Item label="申请时间">{emptyTag(record._audit.applyTime)}</Descriptions.Item>
                    <Descriptions.Item label="退库说明">
                      <span style={{ color: '#d4380d' }}>{record._audit.reason || '-'}</span>
                    </Descriptions.Item>
                    {record._audit.status !== 'pending' && (
                      <>
                        <Descriptions.Item label="审核时间">{emptyTag(record._audit.auditTime)}</Descriptions.Item>
                        <Descriptions.Item label="审核人">{emptyTag(record._audit.auditor)}</Descriptions.Item>
                        <Descriptions.Item label="审核意见" span={2}>
                          <span style={record._audit.status === 'rejected' ? { color: '#d4380d' } : undefined}>
                            {record._audit.auditOpinion || '-'}
                          </span>
                        </Descriptions.Item>
                      </>
                    )}
                  </Descriptions>

                  {/* 项目基础信息 */}
                  <div style={sectionTitleStyle}>项目基础信息</div>
                  <Descriptions {...baseDescriptionsProps} style={{ marginBottom: 24 }}>
                    <Descriptions.Item label="项目名称" span={2}>{emptyTag(qianyueInfo.projectName)}</Descriptions.Item>
                    <Descriptions.Item label="责任单位" span={2}>{renderUnits(qianyueInfo.responsibleUnits)}</Descriptions.Item>
                    <Descriptions.Item label="区级项目编码">{emptyTag(qianyueInfo.projectCode)}</Descriptions.Item>
                    <Descriptions.Item label="市级项目编码">{emptyTag(qianyueInfo.cityProjectCode)}</Descriptions.Item>
                    <Descriptions.Item label="内外资">{emptyTag(qianyueInfo.capitalNature)}</Descriptions.Item>
                    <Descriptions.Item label="来源地">{emptyTag(qianyueInfo.sourceArea)}</Descriptions.Item>
                    <Descriptions.Item label="产业类别">{emptyTag(qianyueInfo.industryCategory)}</Descriptions.Item>
                    <Descriptions.Item label="行业类别">{emptyTag(qianyueInfo.industryType)}</Descriptions.Item>
                    <Descriptions.Item label="次要行业类别">{emptyTag(qianyueInfo.secondaryIndustryCategory)}</Descriptions.Item>
                    <Descriptions.Item label="申报人">{emptyTag(qianyueInfo.reporter)}</Descriptions.Item>
                    <Descriptions.Item label="申报时间">{emptyTag(qianyueInfo.reportTime)}</Descriptions.Item>
                    <Descriptions.Item label="项目简介" span={4}>
                      <div style={{ whiteSpace: 'pre-wrap', lineHeight: 1.8 }}>{emptyTag(qianyueInfo.projectDesc)}</div>
                    </Descriptions.Item>
                  </Descriptions>

                  {/* 在谈阶段信息 */}
                  <div style={sectionTitleStyle}>在谈阶段信息</div>
                  <Descriptions {...baseDescriptionsProps} style={{ marginBottom: 24 }}>
                    <Descriptions.Item label="项目分类">{emptyTag(qianyueInfo.projectCategory)}</Descriptions.Item>
                    <Descriptions.Item label="需投资金额(亿元)">{emptyTag(qianyueInfo.needInvestAmount)}</Descriptions.Item>
                    <Descriptions.Item label="计划投资总额(亿元)">{emptyTag(qianyueInfo.investAmount)}</Descriptions.Item>
                    <Descriptions.Item label="投资主体">{emptyTag(qianyueInfo.investorEntity)}</Descriptions.Item>
                    <Descriptions.Item label="对接时间">{emptyTag(qianyueInfo.dockingDate)}</Descriptions.Item>
                    <Descriptions.Item label="企业类别">{emptyTag(qianyueInfo.enterpriseCategory)}</Descriptions.Item>
                    <Descriptions.Item label="是否为存量企业">{qianyueInfo.isStock === '是' ? '是' : '否'}</Descriptions.Item>
                    <Descriptions.Item label="注册资本(亿元)">{emptyTag(qianyueInfo.registeredCapitalAmount)}</Descriptions.Item>
                    <Descriptions.Item label="是否飞地园区">{qianyueInfo.isEnclave === '是' ? '是' : '否'}</Descriptions.Item>
                    <Descriptions.Item label="是否产业外溢">{qianyueInfo.isOverflow === '是' ? '是' : '否'}</Descriptions.Item>
                    <Descriptions.Item label="楚商类型">{emptyTag(qianyueInfo.chuShangType)}</Descriptions.Item>
                  </Descriptions>

                  {/* 签约阶段信息 */}
                  <div style={sectionTitleStyle}>签约阶段信息</div>
                  <Descriptions {...baseDescriptionsProps} style={{ marginBottom: 24 }}>
                    <Descriptions.Item label="建设性质" span={2}>
                      <Space size={8}>
                        <span>{emptyTag(qianyueInfo.constructionNature)}</span>
                        {qianyueInfo.constructionNatureLevel2 && qianyueInfo.constructionNatureLevel2 !== '-' ? (
                          <><span style={{ color: '#8c8c8c' }}>/</span><span>{qianyueInfo.constructionNatureLevel2}</span></>
                        ) : null}
                      </Space>
                    </Descriptions.Item>
                    <Descriptions.Item label="招商类型">{emptyTag(qianyueInfo.merchantType)}</Descriptions.Item>
                    <Descriptions.Item label="招商类型说明">{emptyTag(qianyueInfo.merchantTypeDesc)}</Descriptions.Item>
                    <Descriptions.Item label="是否浙商">{qianyueInfo.isZheshang === '是' ? '是' : '否'}</Descriptions.Item>
                    <Descriptions.Item label="用地情况">{emptyTag(qianyueInfo.landSituation)}</Descriptions.Item>
                    <Descriptions.Item label="是否总部经济">{qianyueInfo.isHqEconomy === '是' ? '是' : '否'}</Descriptions.Item>
                    <Descriptions.Item label="总部经济类型">
                      {qianyueInfo.isHqEconomy === '是'
                        ? emptyTag([qianyueInfo.hqEconomyLevel1, qianyueInfo.hqEconomyLevel2].filter(v => v && v !== '-').join(' / '))
                        : <span style={{ color: COLORS.textMuted }}>-</span>}
                    </Descriptions.Item>
                    <Descriptions.Item label="备案证金额(亿元)">{emptyTag(qianyueInfo.recordAmount)}</Descriptions.Item>
                    <Descriptions.Item label="固投金额(亿元)">{emptyTag(qianyueInfo.fixedInvestAmount)}</Descriptions.Item>
                    <Descriptions.Item label="协议签订时间">{emptyTag(qianyueInfo.signDate)}</Descriptions.Item>
                    <Descriptions.Item label="协议类型">{emptyTag(qianyueInfo.agreementType)}</Descriptions.Item>
                    <Descriptions.Item label="是否注册">{qianyueInfo.isRegister === '是' ? '是' : '否'}</Descriptions.Item>
                    <Descriptions.Item label="注册时间">
                      {qianyueInfo.isRegister === '是' ? emptyTag(qianyueInfo.registerDate) : <span style={{ color: COLORS.textMuted }}>-</span>}
                    </Descriptions.Item>
                    <Descriptions.Item label="注册资本">
                      {qianyueInfo.isRegister === '是' ? (
                        <Space size={4}>
                          <span>{emptyTag(qianyueInfo.registerCapitalAmount)}</span>
                          {qianyueInfo.registerCapitalUnit && qianyueInfo.registerCapitalUnit !== '-' ? <span>{qianyueInfo.registerCapitalUnit}</span> : null}
                        </Space>
                      ) : <span style={{ color: COLORS.textMuted }}>-</span>}
                    </Descriptions.Item>
                    <Descriptions.Item label="注册公司名称">
                      {qianyueInfo.isRegister === '是' ? emptyTag(qianyueInfo.registerCompanyName) : <span style={{ color: COLORS.textMuted }}>-</span>}
                    </Descriptions.Item>
                    <Descriptions.Item label="签约主体">{emptyTag(qianyueInfo.signSubject)}</Descriptions.Item>
                  </Descriptions>
                </div>
              ) : (
                <div>
                  <div style={sectionTitleStyle}>退库信息</div>
                  <Descriptions {...baseDescriptionsProps}>
                    <Descriptions.Item label="原阶段">
                      <Tag color={stageColorMap[record.sourceStage] || 'default'} style={{ margin: 0 }}>{record.sourceStage}</Tag>
                    </Descriptions.Item>
                    <Descriptions.Item label="退库时间">{emptyTag(record.tuikuTime)}</Descriptions.Item>
                    <Descriptions.Item label="退库操作人">{emptyTag(record.tuikuOperator)}</Descriptions.Item>
                    <Descriptions.Item label="退库原因">
                      <span style={{ color: '#d4380d' }}>{record.tuikuReason || '-'}</span>
                    </Descriptions.Item>
                  </Descriptions>

                  <div style={{ ...sectionTitleStyle, marginTop: 24 }}>项目基本信息</div>
                  <Descriptions {...baseDescriptionsProps}>
                    <Descriptions.Item label="项目名称">{emptyTag(record.projectName)}</Descriptions.Item>
                    <Descriptions.Item label="投资主体">{emptyTag(record.investorEntity)}</Descriptions.Item>
                    <Descriptions.Item label="责任单位">{renderUnits(record.responsibleUnits)}</Descriptions.Item>
                    <Descriptions.Item label="投资金额(亿元)">
                      {Number(record.investAmount) > 0
                        ? <span style={{ fontWeight: 600 }}>{Number(record.investAmount).toFixed(2)}</span>
                        : emptyTag('')}
                    </Descriptions.Item>
                    <Descriptions.Item label="内外资">{emptyTag(record.domesticForeign)}</Descriptions.Item>
                    <Descriptions.Item label="产业类别">{emptyTag(record.industryCategory)}</Descriptions.Item>
                    <Descriptions.Item label="行业类别">{emptyTag(record.industryType)}</Descriptions.Item>
                    <Descriptions.Item label="来源地">{emptyTag(record.sourceArea)}</Descriptions.Item>
                    <Descriptions.Item label="企业性质">{emptyTag(record.enterpriseNature)}</Descriptions.Item>
                    <Descriptions.Item label="申报人">{emptyTag(record.reporter)}</Descriptions.Item>
                    <Descriptions.Item label="申报时间">{emptyTag(record.reportTime)}</Descriptions.Item>
                    <Descriptions.Item label="项目简介" span={4}>
                      {record.projectDesc
                        ? <div style={{ whiteSpace: 'pre-wrap', lineHeight: 1.8 }}>{record.projectDesc}</div>
                        : emptyTag('')}
                    </Descriptions.Item>
                  </Descriptions>
                </div>
              ),
            },
            {
              key: 'progress',
              label: '进展信息',
              children: (
                <ProgressTimeline
                  list={progressList}
                  emptyText="暂无进展记录"
                  summaryExtra={<span>（项目退库后不可再新增进展）</span>}
                />
              ),
            },
            {
              key: 'assign',
              label: '分派情况',
              children: (
                <div>
                  <div style={{ marginBottom: 20, fontSize: 13, color: '#8c8c8c' }}>
                    共 {assignList.length} 条分派记录
                    （已完成 <span style={{ color: COLORS.success }}>{assignList.filter(a => a.status === 'done').length}</span> / 已终止 <span style={{ color: COLORS.textSecondary }}>{assignList.filter(a => a.status !== 'done').length}</span>）
                    <span style={{ marginLeft: 12 }}>项目退库后，未完成的分派任务已自动终止</span>
                  </div>
                  {assignList.length === 0 ? (
                    <Empty description="暂无分派记录" style={{ padding: '60px 0' }} />
                  ) : (
                    <Timeline
                      items={assignList.map(item => ({
                        color: item.status === 'done' ? 'green' : 'gray',
                        children: (
                          <div style={{ paddingBottom: 20 }}>
                            <div style={{
                              background: '#fff',
                              borderLeft: `3px solid ${item.status === 'done' ? '#52c41a' : '#d9d9d9'}`,
                              padding: '12px 16px',
                              borderRadius: '0 4px 4px 0',
                              boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                            }}>
                              <div style={{ fontSize: 14, color: '#262626', marginBottom: 6, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div>
                                  <span style={{ color: '#595959' }}>{item.fromDeptName}</span>
                                  <span style={{ color: '#1677ff', margin: '0 8px' }}>分派至</span>
                                  <span style={{ fontWeight: 500 }}>{item.toDeptName}</span>
                                  {assignStatusTag(item.status)}
                                </div>
                              </div>
                              <div style={{ fontSize: 12, color: '#bfbfbf', marginBottom: 8 }}>
                                分派时间：{item.assignTime}
                                {item.finishTime && <span style={{ marginLeft: 16 }}>完成时间：{item.finishTime}</span>}
                              </div>

                              {item.content && (
                                <div style={{
                                  background: '#e6f4ff',
                                  borderRadius: 4, padding: '8px 12px',
                                  marginBottom: item.feedbacks && item.feedbacks.length > 0 ? 8 : 0,
                                  fontSize: 13, color: '#0958d9', lineHeight: 1.6,
                                }}>
                                  <span style={{ fontWeight: 500, marginRight: 6 }}>📋 协同事项：</span>{item.content}
                                </div>
                              )}

                              {item.feedbacks && item.feedbacks.length > 0 && (
                                <div style={{ marginTop: 8, paddingTop: 8, borderTop: '1px dashed #f0f0f0' }}>
                                  <div style={{ fontSize: 12, color: '#8c8c8c', marginBottom: 8 }}>
                                    📝 反馈记录（{item.feedbacks.length}）
                                  </div>
                                  {item.feedbacks.map((fb, fIdx, arr) => (
                                    <div key={fb.id} style={{
                                      background: '#fafafa', borderRadius: 4, padding: '8px 12px',
                                      marginBottom: fIdx < arr.length - 1 ? 8 : 0,
                                    }}>
                                      <div style={{ fontSize: 12, color: '#8c8c8c', marginBottom: 4 }}>
                                        {fb.user} · {fb.time}
                                      </div>
                                      <div style={{ fontSize: 13, color: '#262626', lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>
                                        {fb.content}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        ),
                      }))}
                    />
                  )}
                </div>
              ),
            },
          ]}
        />
        {/* 退库审核弹窗（投促局，仅待审核记录） */}
        <TuikuAuditModal
          open={auditVisible}
          record={record._audit ? { ...record._audit, projectName: record.projectName } : null}
          onCancel={() => setAuditVisible(false)}
          onOk={handleAuditOk}
        />
      </div>
    </div>
  )
}
