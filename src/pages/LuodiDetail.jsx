import { useState, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  Tabs, Descriptions, Button, Space, Tag, Empty, Timeline, message
} from 'antd'
import {
  ArrowLeftOutlined, EditOutlined, CheckCircleOutlined, RobotOutlined,
} from '@ant-design/icons'
import mockData from '../mock/data.json'
import LuodiEditModal from '../components/LuodiEditModal'
import ProgressTimeline from '../components/ProgressTimeline'
import ProgressSummaryModal from '../components/ProgressSummaryModal'
import { useViewRole } from '../store/viewStore'
import { findUnitByKey } from '../constants/assignConfig'
import { RESPONSIBLE_UNIT_OPTIONS, normalizeResponsibleUnits, CITY_CODE_SEEDS } from '../constants/projectEnums'
import {
  COLORS,
  sectionTitleStyle,
  descriptionsProps as baseDescriptionsProps,
  detailHeaderStyle,
  detailHeaderLeftStyle,
  pageCardStyle,
  boolTag,
  emptyTag,
  PROGRESS_TYPE,
} from '../constants/uiStyles'

function formatDate(d) {
  if (!d || d === '-') return '-'
  if (typeof d === 'number') {
    const date = new Date((d - 25569) * 86400 * 1000)
    const pad = (n) => String(n).padStart(2, '0')
    return `${date.getUTCFullYear()}-${pad(date.getUTCMonth() + 1)}-${pad(date.getUTCDate())}`
  }
  if (d && typeof d.toDate === 'function') d = d.toDate()
  const date = d instanceof Date ? d : new Date(d)
  if (isNaN(date.getTime())) return typeof d === 'string' ? d : '-'
  const pad = (n) => String(n).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}

// 责任单位 Tag 渲染（最多3个，超出+N；空值回退 '-'）
const renderUnits = (v) => {
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

export default function LuodiDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { role, isSponsor, myDeptKey } = useViewRole()

  // 构造mock项目数据（从luodi mock数据读取；详情=签约阶段全部字段+落地2字段，新口径）
  const [project, setProject] = useState(() => {
    const rawIndex = mockData.luodi.findIndex(i => String(i.id) === String(id))
    const item = rawIndex >= 0 ? mockData.luodi[rawIndex] : mockData.luodi[0]
    const rowIdx = rawIndex >= 0 ? rawIndex : 0
    const registerCapitalYi = Number(item['注册资本(亿元)'] || 0)
    const units = normalizeResponsibleUnits(item['责任单位'] || item.responsibleUnits)
    const responsibleUnits = units.length ? units : [RESPONSIBLE_UNIT_OPTIONS[rowIdx % RESPONSIBLE_UNIT_OPTIONS.length]]
    return {
      key: String(item.id || id),
      _raw: item,
      responsibleUnits,
      projectCode: item['编号'] || '-',
      cityProjectCode: item['市级项目编码'] || CITY_CODE_SEEDS[rowIdx % CITY_CODE_SEEDS.length],
      projectName: item['项目名称'] || '-',
      reporter: item['申报人'] || '-',
      reportTime: item['申报时间'] || '2026-06-25',
      // 项目基础信息
      capitalNature: item['内外资'] || '内资',
      sourceArea: item['来源地'] || '-',
      industryCategory: item['产业类别'] || '-',
      industryType: item['行业类别'] || item['行业类别（门类）'] || '-',
      secondaryIndustryCategory: item['次要行业类别'] || '-',
      projectDesc: item['项目简介'] || '-',
      // 在谈阶段信息
      projectCategory: item['项目分类'] && item['项目分类'] !== '-' ? item['项目分类'] : ['投资类', '政策类', '供地类', '其他'][rowIdx % 4],
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
      // 签约阶段信息
      constructionNature: item['建设性质'] || item['建设类型'] || '-',
      constructionNatureLevel2: item['建设分类'] || '-',
      merchantType: item['招商类型'] || '-',
      merchantTypeDesc: item['招商类型说明'] || '-',
      isZheshang: item['是否浙商'] || '否',
      landSituation: item['用地情况'] || '-',
      isHqEconomy: item['是否总部经济'] || '否',
      hqEconomyLevel1: item['总部经济类型一级'] || '-',
      hqEconomyLevel2: item['总部经济类型二级'] || '-',
      recordAmount: item['备案证金额(亿元)'] || [0.6, 1.2, 0.35, 2.1][rowIdx % 4],
      fixedInvestAmount: item['固投金额(亿元)'] || 0,
      signDate: item['协议签订时间'] || ['2026-03-15', '2026-04-02', '2026-05-20', '2026-06-11'][rowIdx % 4],
      agreementType: item['协议类型'] || ['投资协议', '框架协议', '投资协议', '补充协议'][rowIdx % 4],
      isRegister: item['是否注册'] || item['是否已注册'] || '否',
      registerDate: item['注册时间'] ? formatDate(item['注册时间']) : '-',
      registerCapitalAmount: item['注册资本'] || (registerCapitalYi > 0 ? String(registerCapitalYi) : '-'),
      registerCapitalUnit: item['注册资本单位'] || (registerCapitalYi > 0 ? '亿元' : '万元'),
      registerCompanyName: item['注册公司名称'] || item['注册公司'] || '-',
      signSubject: item['签约主体(洽谈主体)'] || item['投资主体'] || '-',
      // 落地阶段信息（转落地填写）
      startWorkType: item['开工开业类型'] || '-',
      startWorkDate: formatDate(item['开工/业时间']),
      projectStatus: item['项目状态'] || '已开工开业',
    }
  })

  const [activeTab, setActiveTab] = useState('basic')
  const [editModalVisible, setEditModalVisible] = useState(false)
  const [formValues, setFormValues] = useState(undefined)
  const [aiVisible, setAiVisible] = useState(false)

  // 进展列表（只读历史进展：落地为最终阶段，不再新增进展，仅保留各阶段历史记录与系统事件）
  const [progressList] = useState([
    {
      id: 'sys-create',
      content: '新增项目',
      reporter: project.reporter || '投促局 易成豪',
      updateTime: '2026-01-10 09:00',
      type: PROGRESS_TYPE.SYSTEM,
    },
    {
      id: 'sys-1',
      content: '项目推进至「在谈」阶段',
      reporter: project.reporter || '投促局 易成豪',
      updateTime: '2026-01-20 14:30',
      type: PROGRESS_TYPE.SYSTEM,
    },
    {
      id: 'prog-mouhua',
      content: '完成项目初步谋划，形成投资意向方案，明确项目选址及投资规模。',
      reporter: '智造园-石丰浩',
      updateTime: '2026-01-18 10:00',
      type: PROGRESS_TYPE.NORMAL,
      stage: '谋划阶段',
    },
    {
      id: 'prog-zaitan-1',
      content: '已与投资方完成首轮对接，投资方对项目落地条件表示认可，待进一步细化投资协议条款。',
      reporter: '智造园-石丰浩',
      updateTime: '2026-02-01 16:20',
      type: PROGRESS_TYPE.NORMAL,
      stage: '在谈阶段',
    },
    {
      id: 'prog-zaitan-2',
      content: '完成投资协议谈判，双方就投资金额、用地规模、扶持政策等核心条款达成一致。',
      reporter: '智造园-石丰浩',
      updateTime: '2026-02-08 11:00',
      type: PROGRESS_TYPE.NORMAL,
      stage: '在谈阶段',
    },
    {
      id: 'sys-3',
      content: '项目推进至「签约」阶段',
      reporter: project.reporter || '投促局 易成豪',
      updateTime: '2026-02-10 09:00',
      type: PROGRESS_TYPE.SYSTEM,
    },
    {
      id: 'prog-qianyue-1',
      content: '项目已正式签约，进入履约推进阶段。',
      reporter: '投促局管理员',
      updateTime: '2026-02-15 10:00',
      type: PROGRESS_TYPE.NORMAL,
      stage: '签约阶段',
    },
    {
      id: 'sys-4',
      content: '项目推进至「落地」阶段',
      reporter: project.reporter || '投促局 易成豪',
      updateTime: '2026-06-30 09:00',
      type: PROGRESS_TYPE.SYSTEM,
    },
  ])

  // 分派记录（落地项目不再涉及分派，历史记录只读展示）
  const [assignList] = useState([
    {
      id: 'a-fgj', toDeptKey: 'fgj', fromDeptName: '市投促局', toDeptName: '发改局',
      assignTime: '2026-07-02 10:00',
      content: '请协助办理项目立项备案及入库手续。',
      attachments: [],
      status: 'done',
      acceptTime: '2026-07-02 11:20',
      finishTime: '2026-07-15 16:30',
      feedbacks: [
        {
          id: 'fb-1', user: '发改局-李科长', time: '2026-07-15 16:30',
          content: '项目已完成立项备案，纳入区级重点项目库。',
          attachments: [],
        },
      ],
    },
    {
      id: 'a-zjj', toDeptKey: 'zjj', fromDeptName: '市投促局', toDeptName: '住建局',
      assignTime: '2026-07-02 10:00',
      content: '请对接项目规划建设审批流程，跟进施工许可办理。',
      attachments: [],
      status: 'done',
      acceptTime: '2026-07-03 09:10',
      finishTime: '2026-08-20 15:00',
      feedbacks: [
        {
          id: 'fb-2', user: '住建局-王科长', time: '2026-08-20 15:00',
          content: '项目施工许可已办结，同步完成工程质量监督登记。',
          attachments: [],
        },
      ],
    },
  ])

  const visibleAssignList = useMemo(() => {
    if (isSponsor) return assignList
    return assignList.filter(a => a.toDeptKey === myDeptKey)
  }, [assignList, isSponsor, myDeptKey])

  const hasAccess = isSponsor || assignList.some(a => a.toDeptKey === myDeptKey)

  const handleBack = () => navigate('/project/luodi')

  const handleEditOk = (values) => {
    const fmt = (v) => (v && typeof v === 'object' && v.format ? v.format('YYYY-MM-DD') : v)
    // 持久化本次编辑值（日期格式化存储，避免 dayjs 对象）
    setFormValues({ startWorkType: values.startWorkType, startDate: fmt(values.startDate) })
    setProject(prev => ({
      ...prev,
      startWorkType: values.startWorkType || prev.startWorkType,
      startWorkDate: values.startDate ? fmt(values.startDate) : prev.startWorkDate,
    }))
    message.success('落地信息已更新')
    setEditModalVisible(false)
  }

  if (!hasAccess) {
    return (
      <div>
        <div style={{ marginBottom: 16 }}>
          <Button icon={<ArrowLeftOutlined />} onClick={handleBack}>返回列表</Button>
        </div>
        <Empty description="您无权查看此项目" style={{ padding: '100px 0' }}>
          <Button type="primary" onClick={handleBack}>返回列表</Button>
        </Empty>
      </div>
    )
  }

  return (
    <div className="page-container">
      <div className="table-card" style={pageCardStyle}>
        {/* 顶部标题 + 操作按钮（落地为最终阶段：仅保留编辑） */}
        <div style={detailHeaderStyle}>
          <div style={detailHeaderLeftStyle}>
            <Button type="text" icon={<ArrowLeftOutlined />} onClick={handleBack} style={{ marginLeft: -8 }}>
              返回
            </Button>
            <span style={{ fontSize: 18, fontWeight: 600 }}>{project.projectName}</span>
            <Tag color="success" style={{ margin: 0 }}>已落地</Tag>
            {!isSponsor && (
              <Tag color="orange" style={{ fontSize: 12, padding: '4px 10px' }}>
                当前为接收方视角，仅可查看项目信息
              </Tag>
            )}
          </div>
          <Space size={8}>
            <Button className="ai-grad-btn" icon={<RobotOutlined />} onClick={() => setAiVisible(true)}>AI 摘要</Button>
            {isSponsor && (
              <Button type="primary" icon={<EditOutlined />} onClick={() => setEditModalVisible(true)}>编辑</Button>
            )}
          </Space>
        </div>

      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        items={[
          {
            key: 'basic',
            label: '基础信息',
            children: (
              <div>
                {/* 项目基础信息 */}
                <div style={sectionTitleStyle}>项目基础信息</div>
                <Descriptions {...baseDescriptionsProps} style={{ marginBottom: 24 }}>
                  <Descriptions.Item label="项目名称" span={2}>{emptyTag(project.projectName)}</Descriptions.Item>
                  <Descriptions.Item label="责任单位" span={2}>{renderUnits(project.responsibleUnits)}</Descriptions.Item>
                  <Descriptions.Item label="区级项目编码">{emptyTag(project.projectCode)}</Descriptions.Item>
                  <Descriptions.Item label="市级项目编码">{emptyTag(project.cityProjectCode)}</Descriptions.Item>
                  <Descriptions.Item label="内外资">{emptyTag(project.capitalNature)}</Descriptions.Item>
                  <Descriptions.Item label="来源地">{emptyTag(project.sourceArea)}</Descriptions.Item>
                  <Descriptions.Item label="产业类别">{emptyTag(project.industryCategory)}</Descriptions.Item>
                  <Descriptions.Item label="行业类别">{emptyTag(project.industryType)}</Descriptions.Item>
                  <Descriptions.Item label="次要行业类别">{emptyTag(project.secondaryIndustryCategory)}</Descriptions.Item>
                  <Descriptions.Item label="申报人">{emptyTag(project.reporter)}</Descriptions.Item>
                  <Descriptions.Item label="申报时间">{emptyTag(project.reportTime)}</Descriptions.Item>
                  <Descriptions.Item label="项目简介" span={4}>
                    <div style={{ whiteSpace: 'pre-wrap', lineHeight: 1.8 }}>{emptyTag(project.projectDesc)}</div>
                  </Descriptions.Item>
                </Descriptions>

                {/* 在谈阶段信息 */}
                <div style={sectionTitleStyle}>在谈阶段信息</div>
                <Descriptions {...baseDescriptionsProps} style={{ marginBottom: 24 }}>
                  <Descriptions.Item label="项目分类">{emptyTag(project.projectCategory)}</Descriptions.Item>
                  <Descriptions.Item label="需投资金额(亿元)">{emptyTag(project.needInvestAmount)}</Descriptions.Item>
                  <Descriptions.Item label="计划投资总额(亿元)">{emptyTag(project.investAmount)}</Descriptions.Item>
                  <Descriptions.Item label="投资主体">{emptyTag(project.investorEntity)}</Descriptions.Item>
                  <Descriptions.Item label="对接时间">{emptyTag(project.dockingDate)}</Descriptions.Item>
                  <Descriptions.Item label="企业类别">{emptyTag(project.enterpriseCategory)}</Descriptions.Item>
                  <Descriptions.Item label="是否为存量企业">{boolTag(project.isStock)}</Descriptions.Item>
                  <Descriptions.Item label="注册资本(亿元)">{emptyTag(project.registeredCapitalAmount)}</Descriptions.Item>
                  <Descriptions.Item label="是否飞地园区">{boolTag(project.isEnclave)}</Descriptions.Item>
                  <Descriptions.Item label="是否产业外溢">{boolTag(project.isOverflow)}</Descriptions.Item>
                  <Descriptions.Item label="楚商类型">{emptyTag(project.chuShangType)}</Descriptions.Item>
                </Descriptions>

                {/* 签约阶段信息 */}
                <div style={sectionTitleStyle}>签约阶段信息</div>
                <Descriptions {...baseDescriptionsProps} style={{ marginBottom: 24 }}>
                  <Descriptions.Item label="建设性质" span={2}>
                    <Space size={8}>
                      <span>{emptyTag(project.constructionNature)}</span>
                      {project.constructionNatureLevel2 && project.constructionNatureLevel2 !== '-' ? (
                        <><span style={{ color: '#8c8c8c' }}>/</span><span>{project.constructionNatureLevel2}</span></>
                      ) : null}
                    </Space>
                  </Descriptions.Item>
                  <Descriptions.Item label="招商类型">{emptyTag(project.merchantType)}</Descriptions.Item>
                  <Descriptions.Item label="招商类型说明">{emptyTag(project.merchantTypeDesc)}</Descriptions.Item>
                  <Descriptions.Item label="是否浙商">{boolTag(project.isZheshang)}</Descriptions.Item>
                  <Descriptions.Item label="用地情况">{emptyTag(project.landSituation)}</Descriptions.Item>
                  <Descriptions.Item label="是否总部经济">{boolTag(project.isHqEconomy)}</Descriptions.Item>
                  <Descriptions.Item label="总部经济类型">
                    {project.isHqEconomy === '是'
                      ? emptyTag([project.hqEconomyLevel1, project.hqEconomyLevel2].filter(v => v && v !== '-').join(' / '))
                      : <span style={{ color: COLORS.textMuted }}>-</span>}
                  </Descriptions.Item>
                  <Descriptions.Item label="备案证金额(亿元)">{emptyTag(project.recordAmount)}</Descriptions.Item>
                  <Descriptions.Item label="固投金额(亿元)">{emptyTag(project.fixedInvestAmount)}</Descriptions.Item>
                  <Descriptions.Item label="协议签订时间">{emptyTag(project.signDate)}</Descriptions.Item>
                  <Descriptions.Item label="协议类型">{emptyTag(project.agreementType)}</Descriptions.Item>
                  <Descriptions.Item label="是否注册">{boolTag(project.isRegister)}</Descriptions.Item>
                  <Descriptions.Item label="注册时间">
                    {project.isRegister === '是' ? emptyTag(project.registerDate) : <span style={{ color: COLORS.textMuted }}>-</span>}
                  </Descriptions.Item>
                  <Descriptions.Item label="注册资本">
                    {project.isRegister === '是' ? (
                      <Space size={4}>
                        <span>{emptyTag(project.registerCapitalAmount)}</span>
                        {project.registerCapitalUnit && project.registerCapitalUnit !== '-' ? <span>{project.registerCapitalUnit}</span> : null}
                      </Space>
                    ) : <span style={{ color: COLORS.textMuted }}>-</span>}
                  </Descriptions.Item>
                  <Descriptions.Item label="注册公司名称">
                    {project.isRegister === '是' ? emptyTag(project.registerCompanyName) : <span style={{ color: COLORS.textMuted }}>-</span>}
                  </Descriptions.Item>
                  <Descriptions.Item label="签约主体">{emptyTag(project.signSubject)}</Descriptions.Item>
                </Descriptions>

                {/* 落地阶段信息（转落地填写） */}
                <div style={sectionTitleStyle}>落地阶段信息</div>
                <Descriptions {...baseDescriptionsProps} style={{ marginBottom: 24 }}>
                  <Descriptions.Item label="开工开业类型">
                    {project.startWorkType && project.startWorkType !== '-' ? (
                      <Tag color="cyan" style={{ margin: 0 }}>{project.startWorkType}</Tag>
                    ) : emptyTag(project.startWorkType)}
                  </Descriptions.Item>
                  <Descriptions.Item label="开工/开业时间">{emptyTag(project.startWorkDate)}</Descriptions.Item>
                </Descriptions>
              </div>
            ),
          },
          {
            key: 'progress',
            label: `进展信息${progressList.length ? ` (${progressList.length})` : ''}`,
            children: (
              <div>
                <ProgressTimeline
                  list={progressList}
                  summaryExtra={
                    <span style={{ marginLeft: 16 }}>
                      落地为最终阶段，不再新增进展，以下为各阶段历史记录
                    </span>
                  }
                />
              </div>
            ),
          },
          {
            key: 'assign',
            label: `分派情况${visibleAssignList.length ? ` (${visibleAssignList.length})` : ''}`,
            children: (
              <div>
                <div style={{ marginBottom: 20 }}>
                  <span style={{ fontSize: 13, color: '#8c8c8c' }}>
                    共 {visibleAssignList.length} 条分派记录
                    （处理中 <span style={{ color: '#1677ff' }}>{visibleAssignList.filter(a => a.status === 'processing').length}</span> / 已完成 <span style={{ color: '#52c41a' }}>{visibleAssignList.filter(a => a.status === 'done').length}</span>）
                    <span style={{ marginLeft: 16 }}>落地项目不再涉及分派，以下为历史记录</span>
                  </span>
                </div>
                {visibleAssignList.length === 0 ? (
                  <Empty description="暂无分派记录" style={{ padding: '40px 0' }} />
                ) : (
                  <Timeline
                    items={visibleAssignList.map(item => {
                      const unit = findUnitByKey(item.toDeptKey)
                      const deptName = unit?.name || item.toDeptName
                      const isDone = item.status === 'done'
                      const statusColor = isDone ? 'green' : 'blue'
                      const statusLabel = isDone ? '已完成' : '处理中'
                      return {
                        color: statusColor,
                        children: (
                          <div style={{ paddingBottom: 20 }}>
                            <div style={{
                              background: '#fff',
                              borderLeft: '3px solid #1677ff',
                              padding: '12px 16px',
                              borderRadius: '0 4px 4px 0',
                              boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                            }}>
                              <div style={{ fontSize: 14, color: '#262626', marginBottom: 6 }}>
                                <div>
                                  <span style={{ color: '#595959' }}>{item.fromDeptName || project.reporter}</span>
                                  <span style={{ color: '#1677ff', margin: '0 8px' }}>分派至</span>
                                  <span style={{ fontWeight: 500 }}>{deptName}</span>
                                  <Tag color={statusColor} style={{ marginLeft: 12 }}>{statusLabel}</Tag>
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
                                  {[...item.feedbacks].sort((a, b) => b.time.localeCompare(a.time)).map((fb, fIdx, arr) => (
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
                              {item.finishTime && (
                                <div style={{ marginTop: 8, fontSize: 12, color: '#52c41a' }}>
                                  <CheckCircleOutlined /> 已于 {item.finishTime} 完成
                                </div>
                              )}
                            </div>
                          </div>
                        ),
                      }
                    })}
                  />
                )}
              </div>
            ),
          },
        ]}
      />
      </div>

      {/* 编辑落地信息弹窗（前期阶段字段只读，仅落地阶段字段可编辑） */}
      <LuodiEditModal
        open={editModalVisible}
        projectData={{ ...project._raw, responsibleUnits: project.responsibleUnits, _formValues: formValues }}
        onCancel={() => setEditModalVisible(false)}
        onOk={handleEditOk}
      />

      {/* AI 月度进展摘要弹窗（落地为只读展示，可生成/复制，不支持另存） */}
      <ProgressSummaryModal
        open={aiVisible}
        onCancel={() => setAiVisible(false)}
        projectName={project.projectName}
        stageLabel="落地阶段"
        items={progressList}
      />
    </div>
  )
}
