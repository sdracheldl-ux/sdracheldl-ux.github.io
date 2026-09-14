import { useState, useMemo, useEffect } from 'react'
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'
import {
  Tabs, Descriptions, Button, Space, Modal, Form, Input,
  Timeline, message, Tag, Empty, Dropdown
} from 'antd'
import {
  ArrowLeftOutlined, EditOutlined, PlusOutlined, DeleteOutlined,
  ExportOutlined, PauseCircleOutlined, SendOutlined, SettingOutlined,
  CheckCircleOutlined, MessageOutlined, PaperClipOutlined, ExclamationCircleOutlined,
  RobotOutlined, MoreOutlined, SwapOutlined
} from '@ant-design/icons'
import mockData from '../mock/data.json'
import DecisionFlow, { getDecisionNodes } from '../components/DecisionFlow'
import UpdateDecisionModal from '../components/UpdateDecisionModal'
import ZaitanEditModal from '../components/ZaitanEditModal'
import AssignModal from '../components/AssignModal'
import FeedbackModal from '../components/FeedbackModal'
import ZhuanQianyueModal from '../components/ZhuanQianyueModal'
import TransferZaitanModal from '../components/TransferZaitanModal'
import ProgressTimeline from '../components/ProgressTimeline'
import ProgressSummaryModal from '../components/ProgressSummaryModal'
import { useViewRole, msgStore, transferStore, useTransferStore } from '../store/viewStore'
import { findUnitByKey } from '../constants/assignConfig'
import { RESPONSIBLE_UNIT_OPTIONS, normalizeResponsibleUnits, DISTRICT_CODE_SEEDS } from '../constants/projectEnums'
import {
  COLORS,
  sectionTitleStyle,
  descriptionsProps as baseDescriptionsProps,
  pageCardStyle,
  detailHeaderStyle,
  detailHeaderLeftStyle,
  progressModalProps,
  progressContentFieldProps,
  progressTextAreaProps,
  emptyTag,
  PROGRESS_TYPE,
} from '../constants/uiStyles'

const CURRENT_USER = '投促局管理员'

// 相对当前时间生成 'YYYY-MM-DD HH:mm'（n 支持小数天，用于 mock 种子时间）
function daysAgoStr(n) {
  const d = new Date(Date.now() - n * 86400000)
  const pad = x => String(x).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`
}

// 反馈达标状态：自分派时间（或最近一次反馈时间）起算，超过 feedbackEveryXDays 天未反馈即逾期
// 返回 { due: 剩余天数(含小数), status: 'overdue' | 'dueSoon'(剩余≤1天) | 'ok', lastFeedbackTime }
function getFeedbackDueInfo(record) {
  const x = record.feedbackEveryXDays || 15
  const baseStr = (record.feedbacks && record.feedbacks.length > 0)
    ? record.feedbacks[record.feedbacks.length - 1].time
    : record.assignTime
  const base = new Date(String(baseStr).replace(/-/g, '/')).getTime()
  const due = (base + x * 86400000 - Date.now()) / 86400000
  const status = due <= 0 ? 'overdue' : due <= 1 ? 'dueSoon' : 'ok'
  return { due, status, lastFeedbackTime: record.feedbacks?.length ? baseStr : null }
}

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

// 根据已通过节点构建展示节点列表
function buildDisplayNodes(baseNodes, passedNodes) {
  if (!baseNodes) return []
  let currentFound = false
  return baseNodes.map(n => {
    const passedDate = passedNodes[n.key]
    if (passedDate) return { ...n, status: 'passed', date: passedDate }
    if (!currentFound) { currentFound = true; return { ...n, status: 'current' } }
    return { ...n, status: 'pending' }
  })
}

export default function ZaitanDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [progressForm] = Form.useForm()
  const { role, isSponsor, myDeptKey } = useViewRole()
  // 订阅移交记录变化
  useTransferStore()

  // 构造mock项目数据（与在谈精简字段集对齐）
  const [project] = useState(() => {
    const categories = ['政策类', '投资类', '供地类', '其他']
    const item = mockData.zaitan.find(i => String(i.id) === String(id)) || mockData.zaitan[0]
    const idx = mockData.zaitan.findIndex(i => i.id === item.id)
    const cat = categories[idx % 4]
    return {
      key: String(item.id),
      districtProjectCode: item['区级项目编码'] || DISTRICT_CODE_SEEDS[idx % DISTRICT_CODE_SEEDS.length],
      projectName: item['项目名称'],
      projectStatus: '在谈',
      reporter: item['申报人'] || '-',
      sourceArea: item['来源地'] || '-',
      domesticForeign: item['内外资'] || '内资',
      industryType: item['行业类别'] || '-',
      industryCategory: item['产业类别'] || '工业',
      projectDesc: item['项目简介'] || '-',
      investorEntity: item['投资主体'] || '-',
      investAmount: item['投资金额（亿元）'] || 0,
      reportTime: item['申报时间'] || '-',
      projectCategory: cat,
      // ===== 在谈字段（存量行补种子）=====
      needInvestAmount: cat === '投资类' ? [1.2, 2.5, 0.8, 3.2][idx % 4] : undefined,
      secondaryIndustryCategory: ['生物医药', '智能机器人', '先进半导体', '高端医疗器械'][idx % 4],
      contactTime: item['对接时间'] || ['2026-05-08', '2026-05-12', '2026-04-20', '2026-05-06'][idx % 4],
      enterpriseCategory: item['企业类别'] || '国家级高新技术企业',
      isStock: '否',
      registeredCapitalAmount: item['注册资本'] || [0.1, 0.5, 0.08, 0.2][idx % 4],
      isEnclave: item['是否飞地园区'] || '否',
      isOverflow: item['是否产业外溢'] || (idx % 2 === 0 ? '是' : '否'),
      chushangType: item['楚商类型'] || ['湖北籍企业家', '武汉校友', '非楚商', '泛楚商'][idx % 4],
      // 存量行无责任单位时给默认种子，保证演示展示有值
      responsibleUnits: normalizeResponsibleUnits(item['责任单位']).length
        ? normalizeResponsibleUnits(item['责任单位'])
        : [RESPONSIBLE_UNIT_OPTIONS[idx % RESPONSIBLE_UNIT_OPTIONS.length]],
    }
  })

  // 初始决策节点已通过情况（mock：根据分类给一些已通过数据）
  const [decisionPassed, setDecisionPassed] = useState(() => {
    if (project.projectCategory === '政策类') return { touweihui: '2026-07-10' }
    if (project.projectCategory === '投资类' && project.investAmount > 0.5) return { guoqitoujuehui: '2026-07-05' }
    if (project.projectCategory === '供地类') return { touweihui: '2026-07-10', changwuhui: '2026-07-20' }
    return {}
  })

  const baseDecisionNodes = getDecisionNodes(project.projectCategory, project.investAmount)
  const displayDecisionNodes = buildDisplayNodes(baseDecisionNodes, decisionPassed)
  const canUpdateDecision = !!baseDecisionNodes

  // 进展列表，包含系统事件（创建/导入/决策节点初始通过/移交）、谋划阶段历史进展、在谈阶段进展
  const [progressList, setProgressList] = useState(() => {
    const initList = []
    // 系统事件：项目移交（从全局移交store回放，保证双方会话均可见）
    const transferRecord = transferStore.getTransferByProject(project.key)
    if (transferRecord) {
      initList.push({
        id: 'sys-transfer',
        type: PROGRESS_TYPE.SYSTEM,
        content: `项目已移交至「${transferRecord.toDeptName}」` + (transferRecord.reason ? `，移交说明：${transferRecord.reason}` : ''),
        reporter: transferRecord.by,
        updateTime: transferRecord.time,
      })
    }
    // 系统事件：由谋划阶段转入在谈（阶段推进动作，由项目经办人操作）
    initList.push({
      id: 'sys-import-zaitan',
      type: PROGRESS_TYPE.SYSTEM,
      content: '项目由谋划阶段转入在谈',
      reporter: project.reporter || '投促局 易成豪',
      updateTime: '2025-12-22 10:00',
    })
    // 系统事件：项目新增（最早事件）
    initList.push({
      id: 'sys-create',
      type: PROGRESS_TYPE.SYSTEM,
      content: '新增项目',
      reporter: project.reporter || '投促局 易成豪',
      updateTime: '2025-12-20 09:00',
    })
    // 谋划阶段历史进展（作为跨阶段记录展示）
    initList.push({
      id: 'mouhua-prog-1',
      type: PROGRESS_TYPE.NORMAL,
      stage: '谋划阶段',
      content: '完成项目初步摸排，企业符合我区重点产业方向，列入重点跟踪项目。',
      reporter: '驻沪办 蔡威',
      updateTime: '2025-12-21 15:00',
    })
    // 初始决策节点已通过记录
    Object.entries({
      touweihui: '投委会',
      guoqitoujuehui: '国企投决会',
      changwuhui: '常务会',
    }).forEach(([key, label]) => {
      const passedMap = project.projectCategory === '政策类' ? { touweihui: '2026-07-10' }
        : project.projectCategory === '投资类' && project.investAmount > 0.5 ? { guoqitoujuehui: '2026-07-05' }
        : project.projectCategory === '供地类' ? { touweihui: '2026-07-10', changwuhui: '2026-07-20' }
        : {}
      if (passedMap[key]) {
        initList.push({
          id: `init-decision-${key}`,
          type: PROGRESS_TYPE.DECISION,
          content: `决策节点更新：「${label}」已于 ${passedMap[key]} 通过`,
          reporter: CURRENT_USER,
          updateTime: `${passedMap[key]} 09:00`,
        })
      }
    })
    // 在谈阶段手动进展
    initList.push({
      id: 'prog-1',
      type: PROGRESS_TYPE.NORMAL,
      stage: '在谈阶段',
      content: '已完成项目初步对接，企业表示有较强投资意向，已安排下周实地考察。',
      reporter: '驻沪办 蔡威',
      updateTime: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    })
    initList.push({
      id: 'prog-2',
      type: PROGRESS_TYPE.NORMAL,
      stage: '在谈阶段',
      content: '企业完成考察，双方就选址、政策支持等初步达成共识。',
      reporter: '东湖高新区 易成豪',
      updateTime: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    })
    return initList
  })

  const [activeTab, setActiveTab] = useState('basic')
  const [zaitanEditVisible, setZaitanEditVisible] = useState(false)
  const [progressModalVisible, setProgressModalVisible] = useState(false)
  const [decisionModalVisible, setDecisionModalVisible] = useState(false)
  const [assignModalVisible, setAssignModalVisible] = useState(false)
  const [feedbackModalVisible, setFeedbackModalVisible] = useState(false)
  const [aiVisible, setAiVisible] = useState(false)
  const [zhuanQianyueVisible, setZhuanQianyueVisible] = useState(false)
  const [transferVisible, setTransferVisible] = useState(false)
  const [tuikuVisible, setTuikuVisible] = useState(false)
  const [tuikuReason, setTuikuReason] = useState('')
  const [feedbackTarget, setFeedbackTarget] = useState(null) // 当前要反馈的分派记录id
  const [editingProgress, setEditingProgress] = useState(null)
  const [progressLoading, setProgressLoading] = useState(false)

  // 分派记录（新结构：拆分到单位、支持多条反馈、附件、反馈频率要求）
  // 时间用相对当前天数生成，保证反馈达标/催办状态演示效果稳定
  const [assignList, setAssignList] = useState(() => [
    {
      id: 'a-kcj', toDeptKey: 'kcj', fromDeptName: '市投促局', toDeptName: '科创局',
      assignTime: daysAgoStr(1),
      content: '请协助对接高企认定政策，评估该企业入选光谷英才计划的可能性，并提供对接建议。',
      attachments: [],
      feedbackEveryXDays: 15,
      status: 'processing', // processing / done
      acceptTime: daysAgoStr(1),
      finishTime: null,
      reminderSent: true,
      feedbacks: [
        {
          id: 'fb-1', user: '科创局-王科长', time: daysAgoStr(0.4),
          content: '已与企业初步对接，该企业技术创新能力较强，符合高企认定基本条件，已安排专人下周对接光谷英才申报材料准备。',
          attachments: [],
        },
      ],
    },
    {
      id: 'a-qfj', toDeptKey: 'qfj', fromDeptName: '市投促局', toDeptName: '企服局',
      assignTime: daysAgoStr(14),
      content: '企业计划投资建设AI药物研发平台，请评估该项目纳入亿元以上技改项目或光电子信息重大专项的可能性。',
      attachments: [],
      feedbackEveryXDays: 15,
      status: 'processing',
      acceptTime: null, finishTime: null, feedbacks: [],
      reminderSent: false, // 距反馈截止剩1天 → 打开详情时触发催办提醒
    },
    {
      id: 'a-wljs', toDeptKey: 'wljs', fromDeptName: '市投促局', toDeptName: '未来科技城',
      assignTime: daysAgoStr(20),
      content: '企业有意向选址未来科技城，请对接合适的楼宇载体，并提供租金优惠方案。',
      attachments: [],
      feedbackEveryXDays: 15,
      status: 'done',
      acceptTime: daysAgoStr(20),
      finishTime: daysAgoStr(5),
      reminderSent: true,
      feedbacks: [
        {
          id: 'fb-2', user: '未来科技城-陈主任', time: daysAgoStr(18),
          content: '已初步对接2处载体，A6栋3000㎡、B2栋4500㎡，均符合生物医药研发用房需求，租金可按一类企业标准给予30%优惠。',
          attachments: [],
        },
        {
          id: 'fb-3', user: '未来科技城-陈主任', time: daysAgoStr(5),
          content: '企业已实地考察A6栋，双方初步达成入驻意向，后续对接已交招商部继续跟进，本任务完成。',
          attachments: [],
        },
      ],
    },
  ])

  // 接收方视角下可见的分派记录（仅分派给自己的）
  const visibleAssignList = useMemo(() => {
    if (isSponsor) return assignList
    return assignList.filter(a => a.toDeptKey === myDeptKey)
  }, [assignList, isSponsor, myDeptKey])

  // 接收方视角下，该项目是否分派给自己（决定详情页是否有权限查看）
  // 查看权限：发起方 ∪ 分派给我的 ∪ 移交给我的
  const transferRecordForAccess = transferStore.getTransferByProject(project.key)
  const hasAccess = isSponsor
    || assignList.some(a => a.toDeptKey === myDeptKey)
    || (transferRecordForAccess && transferRecordForAccess.toDeptKey === myDeptKey)
  // 项目已移交给当前园区 → 接收方获得操作权限（双方共同管理）
  const isTransferredToMe = !isSponsor && !!transferRecordForAccess && transferRecordForAccess.toDeptKey === myDeptKey

  // URL参数触发对应操作
  useEffect(() => {
    if (!hasAccess) return
    const action = searchParams.get('action')
    if (action === 'report') {
      setActiveTab('progress')
      setTimeout(() => handleAddProgress(), 300)
    } else if (action === 'decision') {
      setTimeout(() => setDecisionModalVisible(true), 300)
    } else if (action === 'assign') {
      setActiveTab('assign')
    }
  }, [searchParams, hasAccess])

  // 催办提醒（demo 惰性触发，无定时任务）：距反馈截止不足1天的进行中任务，进入详情时给接收方补发一条催办消息（每条任务只发一次）
  useEffect(() => {
    if (!isSponsor) return
    const toRemind = assignList.filter(a =>
      a.status === 'processing' && !a.reminderSent && getFeedbackDueInfo(a).status === 'dueSoon'
    )
    if (toRemind.length === 0) return
    toRemind.forEach(a => {
      msgStore.addMessage({
        toDeptKey: a.toDeptKey,
        title: '【反馈催办提醒】',
        content: `"${project.projectName}"的协作任务反馈即将到期（要求每${a.feedbackEveryXDays}天至少提交1次反馈），请尽快提交反馈。`,
        projectId: project.key,
        projectName: project.projectName,
        type: 'reminder',
      })
    })
    setAssignList(prev => prev.map(a =>
      toRemind.some(t => t.id === a.id) ? { ...a, reminderSent: true } : a
    ))
  }, [assignList, isSponsor])

  const handleBack = () => navigate('/project/zaitan')

  const handleEditBasic = () => {
    setZaitanEditVisible(true)
  }

  const handleAddProgress = () => {
    setEditingProgress(null)
    progressForm.resetFields()
    setProgressModalVisible(true)
  }

  const handleEditProgress = (record) => {
    setEditingProgress(record)
    progressForm.setFieldsValue({ content: record.content })
    setProgressModalVisible(true)
  }

  const handleProgressOk = async () => {
    try {
      const values = await progressForm.validateFields()
      setProgressLoading(true)
      const now = new Date().toISOString()
      if (editingProgress) {
        setProgressList(prev => prev.map(p =>
          p.id === editingProgress.id
            ? { ...p, content: values.content, updateTime: now }
            : p
        ))
        message.success('进展已更新')
      } else {
        setProgressList(prev => [
          {
            id: `prog-${Date.now()}`,
            type: PROGRESS_TYPE.NORMAL,
            stage: '在谈阶段',
            content: values.content,
            reporter: CURRENT_USER,
            updateTime: now,
          },
          ...prev,
        ])
        message.success('进展已添加')
      }
      setProgressModalVisible(false)
      progressForm.resetFields()
    } catch (e) {
      // validation
    } finally {
      setProgressLoading(false)
    }
  }

  const handleDeleteProgress = (record) => {
    setProgressList(prev => prev.filter(p => p.id !== record.id))
    message.success('进展已删除')
  }

  const handleDecisionOk = (passedMap, changes = []) => {
    setDecisionPassed(passedMap)
    setDecisionModalVisible(false)
    // 把所有变更（通过/撤销）都记录到进展时间线
    if (changes.length > 0) {
      const now = new Date().toISOString()
      const records = changes.map((c, idx) => ({
        id: `prog-decision-${Date.now()}-${idx}`,
        content: c.action === 'pass'
          ? `决策节点更新：「${c.label}」已于 ${c.date} 通过`
          : `决策节点更新：撤销「${c.label}」的通过状态（原通过日期 ${c.date}）`,
        reporter: CURRENT_USER,
        updateTime: now,
        type: PROGRESS_TYPE.DECISION,
      }))
      setProgressList(prev => [...records, ...prev])
    }
  }

  const handleToQianyue = () => {
    Modal.confirm({
      title: '转签约',
      content: `确定将项目「${project.projectName}」推进至签约阶段吗？需要补充签约阶段必填字段信息。`,
      okText: '去补充信息', cancelText: '取消',
      onOk: () => setZhuanQianyueVisible(true),
    })
  }

  const handleTuikuConfirm = () => {
    setProgressList(prev => [
      {
        id: `sys-tuiku-${Date.now()}`,
        type: PROGRESS_TYPE.SYSTEM,
        content: '项目已被标记为退库' + (tuikuReason ? `：${tuikuReason}` : ''),
        reporter: CURRENT_USER,
        updateTime: new Date().toISOString(),
      },
      ...prev,
    ])
    message.success('已标记为退库')
    setTuikuVisible(false)
    setTuikuReason('')
    setTimeout(() => navigate('/project/zaitan'), 800)
  }

  const handleAssign = () => {
    setAssignModalVisible(true)
  }

  // 提交分派
  const handleAssignOk = ({ groups, attachments }) => {
    const now = new Date()
    const pad = n => String(n).padStart(2, '0')
    const timeStr = `${now.getFullYear()}-${pad(now.getMonth()+1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}`
    const newRecords = []
    groups.forEach((g, gi) => {
      g.units.forEach((unitKey, ui) => {
        const u = findUnitByKey(unitKey)
        newRecords.push({
          id: `a-${Date.now()}-${gi}-${ui}`,
          toDeptKey: unitKey,
          fromDeptName: '市投促局',
          toDeptName: u ? u.name : unitKey,
          assignTime: timeStr,
          content: g.content,
          attachments,
          feedbackEveryXDays: g.feedbackEveryXDays || 15,
          status: 'processing',
          acceptTime: null,
          finishTime: null,
          feedbacks: [],
          reminderSent: false, // 催办提醒（提前1天）是否已发送
        })
      })
    })
    setAssignList(prev => [...newRecords, ...prev])
    // 给每个接收单位发一条站内信（含反馈频率要求）
    newRecords.forEach(r => {
      msgStore.addMessage({
        toDeptKey: r.toDeptKey,
        title: '【协作任务分派】',
        content: `您有一条来自"市投促局"的"${project.projectName}"协作配合任务，请每${r.feedbackEveryXDays}天至少提交1次反馈，请及时查看并跟进处理。`,
        projectId: project.key,
        projectName: project.projectName,
        type: 'assign',
      })
    })
    message.success(`已成功分派给 ${newRecords.length} 个单位`)
    setAssignModalVisible(false)
    setActiveTab('assign')
  }

  // 打开提交反馈弹窗
  const handleOpenFeedback = (recordId) => {
    setFeedbackTarget(recordId)
    setFeedbackModalVisible(true)
  }

  // 提交反馈
  const handleFeedbackOk = ({ content, attachments }) => {
    const now = new Date()
    const pad = n => String(n).padStart(2, '0')
    const timeStr = `${now.getFullYear()}-${pad(now.getMonth()+1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}`
    const myUnit = findUnitByKey(myDeptKey)
    const feedbackUser = myUnit ? `${myUnit.shortName}-${role.userName}` : role.userName
    setAssignList(prev => prev.map(a => {
      if (a.id !== feedbackTarget) return a
      return {
        ...a,
        acceptTime: a.acceptTime || timeStr,
        feedbacks: [
          ...a.feedbacks,
          { id: `fb-${Date.now()}`, user: feedbackUser, time: timeStr, content, attachments },
        ],
      }
    }))
    // 给发起人发反馈提醒
    msgStore.addMessage({
      toDeptKey: 'sponsor',
      title: '【协作反馈提醒】',
      content: `"${role.deptName}"已提交"${project.projectName}"的协作处理结果，请点击查看详情。`,
      projectId: project.key,
      projectName: project.projectName,
      type: 'feedback',
    })
    message.success('反馈已提交')
    setFeedbackModalVisible(false)
    setFeedbackTarget(null)
  }

  // 标记完成
  const handleMarkDone = (recordId) => {
    Modal.confirm({
      title: '标记为已完成',
      content: '确认将该协作任务标记为已完成吗？标记后不可撤销。',
      okText: '确认完成', cancelText: '取消',
      onOk: () => {
        const now = new Date()
        const pad = n => String(n).padStart(2, '0')
        const timeStr = `${now.getFullYear()}-${pad(now.getMonth()+1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}`
        setAssignList(prev => prev.map(a => a.id === recordId ? { ...a, status: 'done', finishTime: timeStr } : a))
        msgStore.addMessage({
          toDeptKey: 'sponsor',
          title: '【协作完成提醒】',
          content: `"${role.deptName}"已完成"${project.projectName}"的协作任务，请点击查看详情。`,
          projectId: project.key,
          projectName: project.projectName,
          type: 'done',
        })
        message.success('已标记为完成')
      },
    })
  }



  return (
    <div className="page-container">
      <div className="table-card" style={pageCardStyle}>
        {/* 顶部标题 + 操作按钮 */}
        <div style={detailHeaderStyle}>
          <div style={detailHeaderLeftStyle}>
            <Button type="text" icon={<ArrowLeftOutlined />} onClick={handleBack} style={{ marginLeft: -8 }}>
              返回
            </Button>
            <span style={{ fontSize: 18, fontWeight: 600 }}>{project.projectName}</span>
            <Tag color="blue" style={{ background: COLORS.primaryLight, color: COLORS.primary, border: `1px solid ${COLORS.primaryBorder}`, margin: 0 }}>{project.projectStatus}</Tag>
          </div>
          <Space size={8}>
            {/* 操作区：发起方，或项目已移交给当前园区的接收方（双方均可操作） */}
            {(isSponsor || isTransferredToMe) && (
              <>
                <Button type="primary" icon={<PlusOutlined />} onClick={handleAddProgress}>
                  进展汇报
                </Button>
                <Button className="ai-grad-btn" icon={<RobotOutlined />} onClick={() => setAiVisible(true)}>
                  AI 摘要
                </Button>
                {canUpdateDecision && (
                  <Button icon={<SettingOutlined />} onClick={() => setDecisionModalVisible(true)}>
                    更新决策节点
                  </Button>
                )}
                {isSponsor && (
                  <Button icon={<SendOutlined />} onClick={handleAssign}>
                    分派
                  </Button>
                )}
                <Button icon={<ExportOutlined />} onClick={handleToQianyue}>
                  转签约
                </Button>
                <Dropdown
                  trigger={['click']}
                  menu={{
                    items: [
                      { key: 'edit', icon: <EditOutlined />, label: '编辑' },
                      // 移交：仅发起方、且该项目未移交过（仅支持一次），位于编辑之后
                      ...(isSponsor && !transferStore.hasTransferred(project.key)
                        ? [{ key: 'transfer', icon: <SwapOutlined />, label: '移交' }]
                        : []),
                      { type: 'divider' },
                      { key: 'tuiku', icon: <PauseCircleOutlined style={{ color: '#ff4d4f' }} />, label: '标记退库' },
                    ],
                    onClick: ({ key }) => {
                      if (key === 'edit') handleEditBasic()
                      else if (key === 'transfer') setTransferVisible(true)
                      else if (key === 'tuiku') { setTuikuReason(''); setTuikuVisible(true) }
                    },
                  }}
                >
                  <Button icon={<MoreOutlined />} aria-label="更多" />
                </Dropdown>
              </>
            )}
            {/* 无操作权限的接收方（仅分派关系）保持只读提示 */}
            {!isSponsor && !isTransferredToMe && (
              <Tag color="orange" style={{ fontSize: 12, padding: '4px 10px' }}>
                当前为接收方视角：{role.deptName}-{role.userName}，仅可查看项目信息并反馈分派任务
              </Tag>
            )}
          </Space>
        </div>

        {/* 决策节点流程图 */}
        {displayDecisionNodes.length > 0 && <DecisionFlow nodes={displayDecisionNodes} />}

        {/* 接收方无权限提示 */}
        {!hasAccess && (
          <div style={{
            padding: '60px 20px', textAlign: 'center', background: '#fff', borderRadius: 6,
            border: '1px solid #f0f0f0',
          }}>
            <Empty
              description={
                <span style={{ color: '#8c8c8c' }}>
                  该项目未分派给您所在单位（{role.deptName}），您无权查看详情。
                  <br />
                  <span style={{ fontSize: 12 }}>如需查看，请联系项目发起人分派协作任务。</span>
                </span>
              }
            />
            <Button type="primary" style={{ marginTop: 16 }} onClick={handleBack}>返回列表</Button>
          </div>
        )}

        {hasAccess && (
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={[
            {
              key: 'basic',
              label: '基础信息',
              children: (
                <div>
                  <Descriptions
                    bordered
                    column={2}
                    labelStyle={{ width: 150, background: '#fafafa', fontWeight: 500 }}
                    contentStyle={{ minWidth: 200 }}
                  >
                    <Descriptions.Item label="区级项目编码">{project.districtProjectCode || '-'}</Descriptions.Item>
                    <Descriptions.Item label="项目名称">{project.projectName}</Descriptions.Item>
                    <Descriptions.Item label="项目分类">{project.projectCategory}</Descriptions.Item>
                    <Descriptions.Item label="需投资金额(亿元)">
                      {project.needInvestAmount != null && project.needInvestAmount !== ''
                        ? Number(project.needInvestAmount).toFixed(2)
                        : <span style={{ color: '#bfbfbf' }}>-</span>}
                    </Descriptions.Item>
                    <Descriptions.Item label="内外资">{project.domesticForeign}</Descriptions.Item>
                    <Descriptions.Item label="来源地">{project.sourceArea}</Descriptions.Item>
                    <Descriptions.Item label="产业类别">{project.industryCategory}</Descriptions.Item>
                    <Descriptions.Item label="行业类别">{project.industryType}</Descriptions.Item>
                    <Descriptions.Item label="次要行业类别">{project.secondaryIndustryCategory || '-'}</Descriptions.Item>
                    <Descriptions.Item label="投资主体">{project.investorEntity}</Descriptions.Item>
                    <Descriptions.Item label="对接时间">{project.contactTime}</Descriptions.Item>
                    <Descriptions.Item label="计划投资总额(亿元)">
                      {Number(project.investAmount).toFixed(2)}
                    </Descriptions.Item>
                    <Descriptions.Item label="责任单位">{renderUnits(project.responsibleUnits)}</Descriptions.Item>
                    <Descriptions.Item label="企业类别">{project.enterpriseCategory || '-'}</Descriptions.Item>
                    <Descriptions.Item label="是否为存量企业">{project.isStock}</Descriptions.Item>
                    <Descriptions.Item label="注册资本(亿元)">
                      {project.registeredCapitalAmount != null && project.registeredCapitalAmount !== ''
                        ? Number(project.registeredCapitalAmount).toFixed(2)
                        : <span style={{ color: '#bfbfbf' }}>-</span>}
                    </Descriptions.Item>
                    <Descriptions.Item label="是否飞地园区">{project.isEnclave}</Descriptions.Item>
                    <Descriptions.Item label="是否产业外溢">{project.isOverflow || '-'}</Descriptions.Item>
                    <Descriptions.Item label="楚商类型">{project.chushangType || '-'}</Descriptions.Item>
                    <Descriptions.Item label="申报人 / 申报时间">{project.reporter} / {project.reportTime}</Descriptions.Item>
                    {/* 项目简介：置于最底部，独立通栏一行 */}
                    <Descriptions.Item label="项目简介" span={2}>
                      <div style={{ whiteSpace: 'pre-wrap', lineHeight: 1.8 }}>{project.projectDesc}</div>
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
                  currentUser={CURRENT_USER}
                  onEdit={handleEditProgress}
                  onDelete={handleDeleteProgress}
                  summaryExtra={<span>（决策节点更新自动同步）</span>}
                />
              ),
            },
            {
              key: 'assign',
              label: '分派情况',
              children: (
                <div>
                  <div style={{ marginBottom: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: 13, color: '#8c8c8c' }}>
                      共 {visibleAssignList.length} 条分派记录
                      （处理中 <span style={{ color: '#1677ff' }}>{visibleAssignList.filter(a => a.status === 'processing').length}</span> / 已完成 <span style={{ color: '#52c41a' }}>{visibleAssignList.filter(a => a.status === 'done').length}</span>）
                    </span>
                    {isSponsor && (
                      <Button type="primary" icon={<PlusOutlined />} size="small" onClick={() => setAssignModalVisible(true)}>
                        新增分派
                      </Button>
                    )}
                  </div>
                  {visibleAssignList.length === 0 ? (
                    <Empty description="暂无分派记录" style={{ padding: '40px 0' }} />
                  ) : (
                  <Timeline
                    items={visibleAssignList.map(item => {
                      const isDone = item.status === 'done'
                      const canOperate = !isSponsor && item.toDeptKey === myDeptKey && !isDone
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
                              <div style={{ fontSize: 14, color: '#262626', marginBottom: 6, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div>
                                  <span style={{ color: '#595959' }}>{item.fromDeptName}</span>
                                  <span style={{ color: '#1677ff', margin: '0 8px' }}>分派至</span>
                                  <span style={{ fontWeight: 500 }}>{item.toDeptName}</span>
                                  <Tag color={statusColor} style={{ marginLeft: 12 }}>{statusLabel}</Tag>
                                </div>
                                {canOperate && (
                                  <Space size={4}>
                                    <Button type="link" size="small" icon={<MessageOutlined />} onClick={() => handleOpenFeedback(item.id)}>
                                      提交反馈
                                    </Button>
                                    <Button type="link" size="small" icon={<CheckCircleOutlined />} onClick={() => handleMarkDone(item.id)} style={{ color: '#52c41a' }}>
                                      标记完成
                                    </Button>
                                  </Space>
                                )}
                              </div>
                              <div style={{ fontSize: 12, color: '#bfbfbf', marginBottom: 8, display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
                                <span>分派时间：{item.assignTime}</span>
                                {item.finishTime && <span>完成时间：{item.finishTime}</span>}
                                {/* 反馈频率要求 */}
                                <Tag style={{ marginInlineEnd: 0, fontSize: 12, background: '#f9f0ff', color: '#722ed1', border: '1px solid #d3adf7' }}>
                                  ⏱ 每{item.feedbackEveryXDays || 15}天至少反馈1次
                                </Tag>
                                {/* 反馈达标状态（仅进行中任务） */}
                                {!isDone && (() => {
                                  const dueInfo = getFeedbackDueInfo(item)
                                  if (dueInfo.status === 'overdue') {
                                    return <Tag color="red" style={{ marginInlineEnd: 0 }}>已超期未反馈</Tag>
                                  }
                                  if (dueInfo.status === 'dueSoon') {
                                    return <Tag color="orange" style={{ marginInlineEnd: 0 }}>即将到期，请尽快反馈</Tag>
                                  }
                                  return (
                                    <Tag style={{ marginInlineEnd: 0, background: '#fafafa', color: '#8c8c8c', border: '1px solid #f0f0f0' }}>
                                      {dueInfo.lastFeedbackTime ? `反馈达标 · 最近反馈 ${dueInfo.lastFeedbackTime}` : `暂无反馈 · 剩余${Math.ceil(dueInfo.due)}天`}
                                    </Tag>
                                  )
                                })()}
                              </div>

                              {/* 协同事项说明 */}
                              {item.content && (
                                <div style={{
                                  background: '#e6f4ff',
                                  borderRadius: 4, padding: '8px 12px',
                                  marginBottom: item.attachments && item.attachments.length > 0 ? 6 : 0,
                                  fontSize: 13, color: '#0958d9', lineHeight: 1.6,
                                }}>
                                  <span style={{ fontWeight: 500, marginRight: 6 }}>📋 协同事项：</span>{item.content}
                                </div>
                              )}

                              {/* 分派附件 */}
                              {item.attachments && item.attachments.length > 0 && (
                                <div style={{ marginTop: 6, marginBottom: 4 }}>
                                  <div style={{ fontSize: 12, color: '#8c8c8c', marginBottom: 4 }}><PaperClipOutlined /> 附件：</div>
                                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                                    {item.attachments.map((att, idx) => (
                                      att.isImage ? (
                                        <img
                                          key={idx} src={att.url} alt={att.name}
                                          style={{ width: 80, height: 80, objectFit: 'cover', borderRadius: 4, border: '1px solid #f0f0f0', cursor: 'pointer' }}
                                          onClick={() => window.open(att.url, '_blank')}
                                        />
                                      ) : (
                                        <a key={idx} href={att.url} target="_blank" rel="noreferrer" style={{
                                          display: 'inline-flex', alignItems: 'center', gap: 4,
                                          padding: '4px 10px', background: '#f5f5f5', borderRadius: 4,
                                          fontSize: 12, color: '#595959',
                                        }}>
                                          📄 {att.name}
                                        </a>
                                      )
                                    ))}
                                  </div>
                                </div>
                              )}

                              {/* 反馈时间线 */}
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
                                      {fb.attachments && fb.attachments.length > 0 && (
                                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 8 }}>
                                          {fb.attachments.map((att, aidx) => (
                                            att.isImage ? (
                                              <img
                                                key={aidx} src={att.url} alt={att.name}
                                                style={{ width: 80, height: 80, objectFit: 'cover', borderRadius: 4, border: '1px solid #f0f0f0', cursor: 'pointer' }}
                                                onClick={() => window.open(att.url, '_blank')}
                                              />
                                            ) : (
                                              <a key={aidx} href={att.url} target="_blank" rel="noreferrer" style={{
                                                display: 'inline-flex', alignItems: 'center', gap: 4,
                                                padding: '4px 10px', background: '#fff', borderRadius: 4,
                                                fontSize: 12, color: '#1677ff', border: '1px solid #d9d9d9',
                                              }}>
                                                📄 {att.name}
                                              </a>
                                            )
                                          ))}
                                        </div>
                                      )}
                                    </div>
                                  ))}
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
        )}
      </div>

      {/* 进展汇报/编辑弹窗 */}
      <Modal
        {...progressModalProps({
          open: progressModalVisible,
          projectName: editingProgress ? `${project.projectName}（编辑）` : project.projectName,
          confirmLoading: progressLoading,
          onOk: handleProgressOk,
          onCancel: () => { setProgressModalVisible(false); progressForm.resetFields() },
        })}
      >
        <Form form={progressForm} layout="vertical" requiredMark style={{ marginTop: 16 }}>
          <Form.Item {...progressContentFieldProps}>
            <Input.TextArea {...progressTextAreaProps} />
          </Form.Item>
        </Form>
      </Modal>

      {/* 更新决策节点弹窗 */}
      <UpdateDecisionModal
        key={`decision-${decisionModalVisible}`}
        open={decisionModalVisible}
        onCancel={() => setDecisionModalVisible(false)}
        onOk={handleDecisionOk}
        projectCategory={project.projectCategory}
        investAmount={project.investAmount}
        initialPassedNodes={decisionPassed}
      />

      {/* 编辑在谈项目弹窗（与转在谈/列表编辑字段一致） */}
      <ZaitanEditModal
        key={`zaitan-edit-${zaitanEditVisible}`}
        open={zaitanEditVisible}
        onCancel={() => setZaitanEditVisible(false)}
        onOk={() => { setZaitanEditVisible(false); message.success('保存成功（demo示意）') }}
        projectData={project}
      />

      {/* 新增分派弹窗 */}
      <AssignModal
        key={`assign-${assignModalVisible}`}
        open={assignModalVisible}
        projectName={project.projectName}
        onCancel={() => setAssignModalVisible(false)}
        onOk={handleAssignOk}
      />

      {/* 提交反馈弹窗 */}
      <FeedbackModal
        key={`feedback-${feedbackModalVisible}-${feedbackTarget}`}
        open={feedbackModalVisible}
        unitName={feedbackTarget ? (assignList.find(a => a.id === feedbackTarget)?.toDeptName || '') : ''}
        onCancel={() => { setFeedbackModalVisible(false); setFeedbackTarget(null) }}
        onOk={handleFeedbackOk}
      />

      {/* 转签约弹窗 */}
      <ZhuanQianyueModal
        key={`zhuanqianyue-${zhuanQianyueVisible}`}
        open={zhuanQianyueVisible}
        projectData={project}
        onCancel={() => setZhuanQianyueVisible(false)}
        onOk={() => {
          // 写入系统事件：项目推进至签约
          setProgressList(prev => [
            {
              id: `sys-zhuanqianyue-${Date.now()}`,
              type: PROGRESS_TYPE.SYSTEM,
              content: '项目推进至「签约」阶段',
              reporter: CURRENT_USER,
              updateTime: new Date().toISOString(),
            },
            ...prev,
          ])
          message.success('转签约成功！项目已进入签约阶段')
          setZhuanQianyueVisible(false)
          setTimeout(() => navigate('/project/qianyue'), 800)
        }}
      />

      {/* 移交至园区弹窗：成功后写入进展系统事件（消息/移交记录由弹窗内完成） */}
      <TransferZaitanModal
        key={`transfer-${transferVisible}`}
        open={transferVisible}
        projectData={project}
        onCancel={() => setTransferVisible(false)}
        onOk={() => {
          const t = transferStore.getTransferByProject(project.key)
          if (t) {
            setProgressList(prev => [
              {
                id: `sys-transfer-${Date.now()}`,
                type: PROGRESS_TYPE.SYSTEM,
                content: `项目已移交至「${t.toDeptName}」` + (t.reason ? `，移交说明：${t.reason}` : ''),
                reporter: t.by,
                updateTime: t.time,
              },
              ...prev,
            ])
          }
          setTransferVisible(false)
        }}
      />

      {/* 退库确认弹窗 */}
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
        onOk={handleTuikuConfirm}
      >
        <div style={{ marginBottom: 16 }}>
          确定将项目「<strong>{project.projectName}</strong>」标记为退库吗？退库后不可恢复。
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

      {/* AI 月度进展摘要弹窗（严格按当前自然月） */}
      <ProgressSummaryModal
        open={aiVisible}
        onCancel={() => setAiVisible(false)}
        projectName={project.projectName}
        stageLabel="在谈阶段"
        items={progressList}
        onSave={(content) => {
          const now = new Date()
          const pad2 = (n) => String(n).padStart(2, '0')
          const ts = `${now.getFullYear()}-${pad2(now.getMonth() + 1)}-${pad2(now.getDate())} ${pad2(now.getHours())}:${pad2(now.getMinutes())}`
          setProgressList((prev) => [{
            id: `ai-${Date.now()}`,
            content,
            reporter: role.userName || CURRENT_USER,
            updateTime: ts,
            type: PROGRESS_TYPE.NORMAL,
            stage: '在谈阶段',
          }, ...prev])
        }}
      />
    </div>
  )
}
