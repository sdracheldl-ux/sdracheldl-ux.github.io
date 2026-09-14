import { useState, useMemo, useEffect } from 'react'
import dayjs from 'dayjs'
import {
  Row, Col, Card, Tag, Button, Segmented, Select, Tooltip,
  Table, DatePicker, Modal, Form, Input, InputNumber, Upload,
  Space, message, Radio, Descriptions, Divider,
} from 'antd'
import {
  PlusOutlined, EyeOutlined, DownloadOutlined, SearchOutlined,
  UploadOutlined, FileTextOutlined, ClockCircleOutlined,
  CloseOutlined, InboxOutlined,
} from '@ant-design/icons'
import {
  PARKS, SOES, DEPTS,
  PARK_TARGETS, SOE_TARGETS, DEPT_TARGETS,
} from '../../constants/performanceData'
import { perfPageBg, perfCardStyle } from '../../constants/performanceStyles'
import { COLORS } from '../../constants/uiStyles'
import { useViewRole } from '../../store/viewStore'

const { Dragger } = Upload

/* ==================== 工具函数 ==================== */

function statusTag(status) {
  const map = {
    '待审核': 'processing',
    '已通过': 'success',
    '已驳回': 'error',
  }
  return <Tag color={map[status] || 'default'}>{status}</Tag>
}

// 生成考核任务名称
function buildTaskName(period, unitName) {
  return `${period}${unitName}考核`
}

/* ==================== Mock 填报数据（含驳回原因 + 新字段） ==================== */

function buildMockRecords() {
  const enterprises = ['XX科技有限公司', 'YY新能源集团', 'ZZ智能制造', 'AA生物医药', 'BB半导体', 'CC新材料']
  const cities = ['深圳', '上海', '北京', '杭州', '苏州']

  const result = { park: [], soe: [], dept: [] }

  // 园区招商活动
  PARKS.forEach((park, pi) => {
    result.park.push({
      id: `pe-${pi}-1`,
      parkKey: park.key,
      parkName: park.name,
      taskName: buildTaskName('2026年度', park.name),
      taskKey: 'eventCount',
      type: '招商活动',
      name: park.name + '招商推介会',
      date: `2026-06-${15 + pi}`,
      submitDate: `2026-06-${15 + pi}`,
      intro: '本次推介会面向' + cities[pi % 5] + '企业，重点推介东湖高新区投资环境与产业政策。',
      isHost: pi % 2 === 0,
      enterpriseCount: 15 + pi * 3,
      clueCount: 5 + pi * 2,
      submitter: park.name + '活动部',
      submitTime: `2026-06-${15 + pi} 17:00`,
      status: pi < 2 ? '已通过' : (pi < 5 ? '待审核' : '已驳回'),
      rejectReason: pi >= 5 ? '活动材料不完整，请补充签到表和活动照片' : '',
      attachments: ['活动方案.docx', '签到表.xlsx'],
    })
  })

  // 国企进展（5种类型，每种类型字段不同）
  SOES.forEach((soe, si) => {
    const types = [
      { type: '尽调项目', taskKey: 'dueDiligence' },
      { type: '产业链引进', taskKey: 'industryProject' },
      { type: '品牌活动', taskKey: 'brandEvent' },
      { type: '认缴出资', taskKey: 'subscriptionAmount' },
      { type: '实缴出资', taskKey: 'investAmount' },
    ]
    types.forEach((t, ti) => {
      const idx = si * 5 + ti
      const base = {
        id: `s-${idx}`,
        soeKey: soe.key,
        soeName: soe.name,
        taskName: buildTaskName('2026年度', soe.name),
        taskKey: t.taskKey,
        type: t.type,
        projectName: t.type + ' - ' + enterprises[ti % 6] + '项目',
        submitDate: `2026-06-${10 + (idx % 15)}`,
        submitter: soe.name + '项目部',
        submitTime: `2026-06-${10 + (idx % 15)} 11:00`,
        status: idx % 5 === 0 ? '待审核' : (idx % 5 === 4 ? '已驳回' : '已通过'),
        rejectReason: idx % 5 === 4 ? '证明材料不清晰，请重新上传扫描件' : '',
        attachments: ['证明材料.pdf'],
      }
      // 尽调项目字段
      if (t.type === '尽调项目') {
        base.investAmount = (2 + si * 0.5).toFixed(2)
        base.projectIntro = soe.name + '对' + enterprises[ti % 6] + '开展全面尽职调查工作。'
        base.materialType = ['调研报告', '立项报告', '第三方尽调报告'][ti % 3]
      }
      // 产业链引进字段
      else if (t.type === '产业链引进') {
        base.investAmount = (5 + si * 1).toFixed(2)
        base.projectIntro = '引进' + enterprises[ti % 6] + '产业链配套项目，完善产业生态。'
        base.sceneContent = '智能制造产业链核心环节补链'
        base.leadingUnit = soe.name + '产业发展部'
      }
      // 品牌活动字段
      else if (t.type === '品牌活动') {
        base.activityName = soe.name + '产业创新论坛'
        base.activityDate = `2026-06-${10 + ti}`
        base.activityIntro = '聚焦产业创新发展，邀请行业专家、企业代表共话未来。'
        base.isHost = ti % 2 === 0
        base.enterpriseCount = 20 + si * 3
        base.clueCount = 8 + si * 2
      }
      // 认缴出资字段
      else if (t.type === '认缴出资') {
        base.subscribeAmount = (30 + si * 10).toFixed(2)
        base.signDate = '2026-05-15'
        base.subscribeCompany = 'XX产业投资基金合伙企业'
        base.subscribeTerm = '5年'
      }
      // 实缴出资字段
      else if (t.type === '实缴出资') {
        base.investAmount = (20 + si * 8).toFixed(2)
        base.projectIntro = '对XX基金进行实缴出资，支持产业发展。'
        base.signDate = '2026-03-10'
        base.payDate = '2026-06-01'
        base.payCompany = 'XX产业投资基金合伙企业'
        base.payType = '货币出资'
        base.isMarketDecision = ti % 2 === 0
      }
      result.soe.push(base)
    })
  })

  // 部门进展
  DEPTS.forEach((dept, di) => {
    if (di > 5) return
    const targets = DEPT_TARGETS.find(d => d.key === dept.key)?.targets || []
    const task = targets[0] || { text: '重点招商任务' }
    result.dept.push({
      id: `d-${di}`,
      deptKey: dept.key,
      deptName: dept.name,
      taskName: buildTaskName('2026年度', dept.name),
      taskKey: 'task-' + di,
      taskText: task.text,
      progressDesc: dept.name + '本月推进招商工作，已对接企业 ' + (di + 5) + ' 家。',
      submitter: dept.name + '联络员',
      submitTime: `2026-06-${12 + di} 16:20`,
      status: di % 3 === 0 ? '待审核' : (di % 3 === 2 ? '已驳回' : '已通过'),
      rejectReason: di % 3 === 2 ? '进展描述不够详细，请补充具体项目信息' : '',
      attachments: ['进展说明.docx'],
    })
  })

  return result
}

const MOCK_RECORDS = buildMockRecords()

/* ============================================================
   进展填报主页面
   ============================================================ */

export default function ProgressTracking() {
  const { role } = useViewRole()
  const [category, setCategory] = useState('park')
  const [modalVisible, setModalVisible] = useState(false)
  const [searchText, setSearchText] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [detailOpen, setDetailOpen] = useState(false)
  const [detailRecord, setDetailRecord] = useState(null)
  const [redoRecord, setRedoRecord] = useState(null)

  // 当前登录账号对应的考核对象（自动关联）
  const currentUnit = useMemo(() => {
    if (role.isSponsor) return null
    const park = PARKS.find(p => p.key === role.deptKey)
    if (park) return { type: 'park', key: park.key, name: park.name }
    const soe = SOES.find(s => s.key === role.deptKey)
    if (soe) return { type: 'soe', key: soe.key, name: soe.name }
    const dept = DEPTS.find(d => d.key === role.deptKey)
    if (dept) return { type: 'dept', key: dept.key, name: dept.name }
    return null
  }, [role])

  // 自动切换到对应分类
  useEffect(() => {
    if (currentUnit && currentUnit.type !== category) {
      setCategory(currentUnit.type)
    }
  }, [currentUnit])

  const allRecords = useMemo(() => {
    if (category === 'park') return MOCK_RECORDS.park
    if (category === 'soe') return MOCK_RECORDS.soe
    return MOCK_RECORDS.dept
  }, [category])

  // 只展示当前账号关联的记录（非投促局视角）
  const visibleRecords = useMemo(() => {
    if (role.isSponsor) return allRecords
    if (!currentUnit) return allRecords
    if (category === 'park' && currentUnit.type === 'park') {
      return allRecords.filter(r => r.parkKey === currentUnit.key)
    }
    if (category === 'soe' && currentUnit.type === 'soe') {
      return allRecords.filter(r => r.soeKey === currentUnit.key)
    }
    if (category === 'dept' && currentUnit.type === 'dept') {
      return allRecords.filter(r => r.deptKey === currentUnit.key)
    }
    return []
  }, [allRecords, role, currentUnit, category])

  const filtered = useMemo(() => {
    let list = visibleRecords
    if (statusFilter !== 'all') {
      list = list.filter(r => r.status === statusFilter)
    }
    if (searchText.trim()) {
      const kw = searchText.toLowerCase()
      list = list.filter(r => {
        if (category === 'park') return (r.name || '').toLowerCase().includes(kw) || (r.parkName || '').toLowerCase().includes(kw)
        if (category === 'soe') return (r.soeName || '').toLowerCase().includes(kw) || (r.projectName || '').toLowerCase().includes(kw)
        return (r.deptName || '').toLowerCase().includes(kw) || (r.taskName || '').toLowerCase().includes(kw)
      })
    }
    return list
  }, [visibleRecords, searchText, statusFilter, category])

  const stats = [
    { title: '总记录数', value: visibleRecords.length, color: COLORS.primary },
    { title: '待审核', value: visibleRecords.filter(r => r.status === '待审核').length, color: '#faad14' },
    { title: '已通过', value: visibleRecords.filter(r => r.status === '已通过').length, color: '#52c41a' },
    { title: '已驳回', value: visibleRecords.filter(r => r.status === '已驳回').length, color: '#ff4d4f' },
  ]

  const handleView = (record) => {
    setDetailRecord(record)
    setDetailOpen(true)
  }

  // 重新填写：打开新增弹窗，将驳回记录的数据预填充
  const handleRedo = (record) => {
    setModalVisible(true)
    // 预填入选中的单位
    if (record.parkKey) setSelectedPark(record.parkKey)
    if (record.soeKey) setSelectedSoe(record.soeKey)
    if (record.type) setSoeType(record.type)
    // 设置表单初始值（稍后通过 form.setFieldsValue 填充，这里用 modal 的 record prop 传递）
    setRedoRecord(record)
  }

  // ========== 列配置 ==========
  const parkColumns = [
    { title: '序号', width: 50, align: 'center', render: (_, __, idx) => idx + 1 },
    { title: '活动名称', dataIndex: 'name', ellipsis: true, render: v => <Tooltip title={v}>{v}</Tooltip> },
    { title: '园区', dataIndex: 'parkName', width: 100, render: v => <strong>{v}</strong> },
    { title: '考核任务', dataIndex: 'taskName', width: 200, ellipsis: true, render: v => <Tag color="blue">{v}</Tag> },
    { title: '日期', dataIndex: 'date', width: 110, align: 'center' },
    { title: '对接企业数', dataIndex: 'enterpriseCount', width: 90, align: 'center', render: v => v + '家' },
    { title: '有效线索', dataIndex: 'clueCount', width: 80, align: 'center', render: v => <Tag color="green">{v} 条</Tag> },
    { title: '状态', dataIndex: 'status', width: 90, align: 'center', render: v => statusTag(v) },
    { title: '操作', key: 'action', width: 180, align: 'center', fixed: 'right',
      render: (_, record) => (
        <Space>
          <Button type="link" size="small" icon={<EyeOutlined />} onClick={() => handleView(record)}>查看</Button>
          {record.status === '已驳回' && (
            <Button type="link" size="small" onClick={() => handleRedo(record)}>重新填写</Button>
          )}
          {record.status === '待审核' && <Button type="link" size="small" danger>撤回</Button>}
        </Space>
      ),
    },
  ]

  const soeColumns = [
    { title: '序号', width: 50, align: 'center', render: (_, __, idx) => idx + 1 },
    { title: '国企', dataIndex: 'soeName', width: 130, render: v => <strong>{v}</strong> },
    { title: '考核任务', dataIndex: 'taskName', width: 200, ellipsis: true, render: v => <Tag color="purple">{v}</Tag> },
    { title: '类型', dataIndex: 'type', width: 100, render: v => <Tag>{v}</Tag> },
    { title: '项目/活动名称', dataIndex: 'projectName', ellipsis: true,
      render: (_, r) => r.projectName || r.activityName || '-' },
    { title: '报送时间', dataIndex: 'submitDate', width: 120, align: 'center' },
    { title: '状态', dataIndex: 'status', width: 90, align: 'center', render: v => statusTag(v) },
    { title: '操作', key: 'action', width: 180, align: 'center', fixed: 'right',
      render: (_, record) => (
        <Space>
          <Button type="link" size="small" icon={<EyeOutlined />} onClick={() => handleView(record)}>查看</Button>
          {record.status === '已驳回' && (
            <Button type="link" size="small" onClick={() => handleRedo(record)}>重新填写</Button>
          )}
          {record.status === '待审核' && <Button type="link" size="small" danger>撤回</Button>}
        </Space>
      ),
    },
  ]

  const deptColumns = [
    { title: '序号', width: 50, align: 'center', render: (_, __, idx) => idx + 1 },
    { title: '部门', dataIndex: 'deptName', width: 110, render: v => <strong>{v}</strong> },
    { title: '考核任务', dataIndex: 'taskName', width: 200, ellipsis: true, render: v => <Tag>{v}</Tag> },
    { title: '进展描述', dataIndex: 'progressDesc', ellipsis: true },
    { title: '提交时间', dataIndex: 'submitTime', width: 150, align: 'center' },
    { title: '状态', dataIndex: 'status', width: 90, align: 'center', render: v => statusTag(v) },
    { title: '操作', key: 'action', width: 180, align: 'center', fixed: 'right',
      render: (_, record) => (
        <Space>
          <Button type="link" size="small" icon={<EyeOutlined />} onClick={() => handleView(record)}>查看</Button>
          {record.status === '已驳回' && (
            <Button type="link" size="small" onClick={() => handleRedo(record)}>重新填写</Button>
          )}
          {record.status === '待审核' && <Button type="link" size="small" danger>撤回</Button>}
        </Space>
      ),
    },
  ]

  const getColumns = () => {
    if (category === 'park') return parkColumns
    if (category === 'soe') return soeColumns
    return deptColumns
  }

  // 新增按钮文案
  const addBtnText = category === 'park'
    ? '新增招商活动'
    : category === 'soe' ? '新增国企进展' : '新增部门进展'

  return (
    <div style={perfPageBg}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div>
          <h2 style={{ margin: '0 0 4px', fontSize: 22, fontWeight: 700, color: '#262626' }}>进展填报</h2>
          <div style={{ fontSize: 13, color: '#8c8c8c' }}>招商活动、国企进展、部门进展的填报与审核</div>
        </div>
        {currentUnit && (
          <div style={{ fontSize: 13, color: '#52c41a' }}>
            已关联账号：<strong>{currentUnit.name}</strong>
          </div>
        )}
      </div>

      <Card style={perfCardStyle} bodyStyle={{ padding: '16px 20px 20px' }}>
        {/* 顶部：分类切换 + 操作按钮 */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <Segmented options={[
            { label: '园区填报', value: 'park' },
            { label: '国企填报', value: 'soe' },
            { label: '部门填报', value: 'dept' },
          ]} value={category} onChange={setCategory} size="large" />
          <Space>
            <DatePicker.RangePicker size="small" />
            <Button size="small" icon={<DownloadOutlined />}>导出</Button>
            <Button type="primary" size="small" icon={<PlusOutlined />} onClick={() => setModalVisible(true)}>
              {addBtnText}
            </Button>
          </Space>
        </div>

        {/* 统计卡片 */}
        <Row gutter={[12, 12]} style={{ marginBottom: 16 }}>
          {stats.map((s, i) => (
            <Col span={6} key={i}>
              <Card styles={{ body: { padding: '14px 20px' } }} style={{ ...perfCardStyle, borderLeft: '3px solid ' + s.color, background: '#fff' }}>
                <div style={{ fontSize: 12, color: '#8c8c8c', marginBottom: 4 }}>{s.title}</div>
                <div style={{ fontSize: 24, fontWeight: 700, color: '#262626' }}>{s.value}</div>
              </Card>
            </Col>
          ))}
        </Row>

        {/* 搜索栏 + 状态筛选（右侧） */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <Input
            placeholder="搜索..."
            prefix={<SearchOutlined style={{ color: '#bfbfbf' }} />}
            style={{ width: 280 }}
            value={searchText}
            onChange={e => setSearchText(e.target.value)}
            allowClear
          />
          <Radio.Group value={statusFilter} onChange={e => setStatusFilter(e.target.value)} size="small" buttonStyle="solid">
            <Radio.Button value="all">全部</Radio.Button>
            <Radio.Button value="待审核">待审核</Radio.Button>
            <Radio.Button value="已通过">已通过</Radio.Button>
            <Radio.Button value="已驳回">已驳回</Radio.Button>
          </Radio.Group>
        </div>

        {/* 表格 */}
        <Table
          columns={getColumns()}
          dataSource={filtered}
          rowKey="id"
          size="small"
          scroll={{ x: 1200 }}
          pagination={{ pageSize: 10, showTotal: t => '共 ' + t + ' 条' }}
        />
      </Card>

      {/* 新增弹窗 */}
      <AddRecordModal
        visible={modalVisible}
        category={category}
        currentUnit={currentUnit}
        record={redoRecord}
        onCancel={() => { setModalVisible(false); setRedoRecord(null) }}
        onOk={() => { message.success('提交成功，等待审核'); setModalVisible(false); setRedoRecord(null) }}
      />

      {/* 详情弹窗 */}
      <RecordDetailModal
        open={detailOpen}
        record={detailRecord}
        category={category}
        onClose={() => setDetailOpen(false)}
      />
    </div>
  )
}

/* ======================== 新增记录弹窗 ======================== */

function AddRecordModal({ visible, category, currentUnit, onCancel, onOk, record }) {
  const [form] = Form.useForm()
  const [soeType, setSoeType] = useState('尽调项目')
  const [fileList, setFileList] = useState([])
  const [selectedPark, setSelectedPark] = useState(currentUnit?.key || '')
  const [selectedSoe, setSelectedSoe] = useState(currentUnit?.key || '')
  const [selectedDept, setSelectedDept] = useState(currentUnit?.key || '')

  // 基础选项
  const parkOptions = PARKS.map(p => ({ value: p.key, label: p.name }))
  const soeOptions = SOES.map(s => ({ value: s.key, label: s.name }))
  const deptOptions = DEPTS.map(d => ({ value: d.key, label: d.name }))

  // 根据选中单位获取对应的考核任务下拉选项（从目标设定已下发的任务中取）
  const taskOptionsForSelected = useMemo(() => {
    let targets = []
    if (category === 'park') {
      targets = PARK_TARGETS.filter(p => selectedPark ? p.key === selectedPark : true)
    } else if (category === 'soe') {
      targets = SOE_TARGETS.filter(s => selectedSoe ? s.key === selectedSoe : true)
    } else {
      targets = DEPT_TARGETS.filter(d => selectedDept ? d.key === selectedDept : true)
    }
    // 每个目标生成一个考核任务选项（格式：周期+单位名+考核）
    const options = []
    targets.forEach(t => {
      if (t.period) {
        options.push({
          value: t.key + '_' + t.period,
          label: buildTaskName(t.period, t.name),
          period: t.period,
          unitKey: t.key,
          unitName: t.name,
        })
      }
      // 部门有多条目标
      if (t.targets) {
        t.targets.forEach((tg, i) => {
          if (tg.period) {
            options.push({
              value: t.key + '_' + i + '_' + tg.period,
              label: buildTaskName(tg.period, t.name) + ' - ' + tg.text.substring(0, 20),
              period: tg.period,
              unitKey: t.key,
              unitName: t.name,
              taskText: tg.text,
            })
          }
        })
      }
    })
    return options
  }, [category, selectedPark, selectedSoe, selectedDept])

  // 打开弹窗时初始化表单
  useEffect(() => {
    if (!visible) return

    // 重新填写：预填充原记录所有内容
    if (record) {
      if (record.parkKey) setSelectedPark(record.parkKey)
      if (record.soeKey) setSelectedSoe(record.soeKey)
      if (record.deptKey) setSelectedDept(record.deptKey)
      if (record.type) setSoeType(record.type)

      setTimeout(() => {
        const vals = {}
        if (category === 'park') {
          vals.parkKey = record.parkKey
          vals.taskKey = record.taskKey || (record.parkKey + '_' + '2026年度')
          vals.date = record.date ? dayjs(record.date) : undefined
          vals.name = record.name
          vals.intro = record.intro
          vals.isHost = record.isHost
          vals.enterpriseCount = record.enterpriseCount
          vals.clueCount = record.clueCount
        } else if (category === 'soe') {
          vals.soeKey = record.soeKey
          vals.taskKey = record.taskKey || (record.soeKey + '_' + '2026年度')
          vals.soeType = record.type
          vals.submitDate = record.submitDate ? dayjs(record.submitDate) : undefined
          vals.projectName = record.projectName
          vals.projectIntro = record.projectIntro
          vals.investAmount = record.investAmount
          vals.materialType = record.materialType
          vals.sceneContent = record.sceneContent
          vals.leadingUnit = record.leadingUnit
          vals.activityName = record.activityName
          vals.activityDate = record.activityDate ? dayjs(record.activityDate) : undefined
          vals.activityIntro = record.activityIntro
          vals.subscribeAmount = record.subscribeAmount
          vals.signDate = record.signDate ? dayjs(record.signDate) : undefined
          vals.subscribeCompany = record.subscribeCompany
          vals.subscribeTerm = record.subscribeTerm
          vals.payDate = record.payDate ? dayjs(record.payDate) : undefined
          vals.payCompany = record.payCompany
          vals.payType = record.payType
          vals.isMarketDecision = record.isMarketDecision
        } else {
          vals.deptKey = record.deptKey
          vals.taskKey = record.taskKey || (record.deptKey + '_' + '2026年度')
          vals.progress = record.progressDesc
        }
        form.setFieldsValue(vals)
      }, 0)
    } else {
      // 新增时：默认选中当前登录账号关联的单位和第一个考核任务
      setTimeout(() => {
        const vals = {}
        if (category === 'park' && currentUnit?.type === 'park') {
          vals.parkKey = currentUnit.key
          if (taskOptionsForSelected[0]) vals.taskKey = taskOptionsForSelected[0].value
        } else if (category === 'soe' && currentUnit?.type === 'soe') {
          vals.soeKey = currentUnit.key
          if (taskOptionsForSelected[0]) vals.taskKey = taskOptionsForSelected[0].value
        } else if (category === 'dept' && currentUnit?.type === 'dept') {
          vals.deptKey = currentUnit.key
          if (taskOptionsForSelected[0]) vals.taskKey = taskOptionsForSelected[0].value
        }
        form.setFieldsValue(vals)
      }, 0)
    }
  }, [visible, record, category, form, currentUnit, taskOptionsForSelected])

  if (!visible) return null

  const isEdit = !!record

  const titleText = isEdit
    ? '重新填写'
    : (category === 'park'
      ? '新增招商活动'
      : category === 'soe' ? '新增国企进展' : '新增部门进展')

  const handleBeforeUpload = (file) => {
    const name = file.name || ''
    const zipExts = ['.zip', '.rar', '.7z', '.tar', '.gz', '.bz2']
    const isZip = zipExts.some(ext => name.toLowerCase().endsWith(ext))
    if (isZip) {
      message.error('不支持上传压缩包文件，请上传文档类材料')
      return Upload.LIST_IGNORE
    }
    setFileList([...fileList, file])
    return false // 手动上传
  }

  const handleRemove = (file) => {
    setFileList(fileList.filter(f => f.uid !== file.uid))
  }

  const normFile = (e) => {
    if (Array.isArray(e)) return e
    return e?.fileList
  }

  const handleParkChange = (val) => {
    setSelectedPark(val)
    // 切换园区后重置考核任务
    form.setFieldsValue({ taskKey: undefined })
  }

  const handleSoeChange = (val) => {
    setSelectedSoe(val)
    form.setFieldsValue({ taskKey: undefined })
  }

  const handleDeptChange = (val) => {
    setSelectedDept(val)
    form.setFieldsValue({ taskKey: undefined })
  }

  return (
    <Modal
      title={titleText}
      open={visible}
      onOk={() => form.validateFields().then(onOk).catch(() => {})}
      onCancel={onCancel}
      okText="提交审核"
      cancelText="取消"
      destroyOnHidden
      width={820}
    >
      <div style={{ marginBottom: 12, fontSize: 13, color: '#8c8c8c' }}>
        请如实填写，提交后进入审核流程，审核通过后将计入考核数据。
      </div>
      <Form form={form} layout="vertical">

        {/* ===== 园区填报：招商活动 ===== */}
        {category === 'park' && (
          <>
            <Row gutter={24}>
              <Col span={12}>
                <Form.Item name="parkKey" label="园区" rules={[{ required: true, message: '请选择园区' }]}>
                  <Select
                    options={parkOptions}
                    placeholder="请选择园区"
                    onChange={handleParkChange}
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="taskKey" label="关联考核任务" rules={[{ required: true, message: '请选择考核任务' }]}>
                  <Select
                    options={taskOptionsForSelected}
                    placeholder="选择园区后选择考核任务"
                    disabled={!selectedPark}
                    showSearch
                    optionFilterProp="label"
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="date" label="活动时间" rules={[{ required: true, message: '请选择活动时间' }]}>
                  <DatePicker style={{ width: '100%' }} />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="isHost" label="是否为主办单位" rules={[{ required: true, message: '请选择' }]}>
                  <Radio.Group>
                    <Radio value={true}>是</Radio>
                    <Radio value={false}>否</Radio>
                  </Radio.Group>
                </Form.Item>
              </Col>
              <Col span={24}>
                <Form.Item name="name" label="活动名称" rules={[{ required: true, message: '请输入活动名称' }]}>
                  <Input maxLength={80} placeholder="请输入活动名称" />
                </Form.Item>
              </Col>
              <Col span={24}>
                <Form.Item name="intro" label="活动简介" rules={[{ required: true, message: '请填写活动简介' }]}>
                  <Input.TextArea rows={3} maxLength={300} showCount placeholder="简要介绍活动内容、形式、目标等" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="enterpriseCount" label="对接企业数（家）" rules={[{ required: true, message: '请输入对接企业数' }]}>
                  <InputNumber min={0} style={{ width: '100%' }} />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="clueCount" label="获取有效项目线索（条）" rules={[{ required: true, message: '请输入有效线索数量' }]}>
                  <InputNumber min={0} style={{ width: '100%' }} />
                </Form.Item>
              </Col>
            </Row>
          </>
        )}

        {/* ===== 国企填报：5种类型动态表单 ===== */}
        {category === 'soe' && (
          <>
            <Row gutter={24}>
              <Col span={12}>
                <Form.Item name="soeKey" label="国有企业" rules={[{ required: true, message: '请选择国企' }]}>
                  <Select
                    options={soeOptions}
                    placeholder="请选择国企"
                    onChange={handleSoeChange}
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="taskKey" label="关联考核任务" rules={[{ required: true, message: '请选择考核任务' }]}>
                  <Select
                    options={taskOptionsForSelected}
                    placeholder="选择国企后选择考核任务"
                    disabled={!selectedSoe}
                    showSearch
                    optionFilterProp="label"
                  />
                </Form.Item>
              </Col>
              <Col span={24}>
                <Form.Item name="soeType" label="进展类型" rules={[{ required: true, message: '请选择进展类型' }]}>
                  <Select placeholder="请选择进展类型" onChange={val => setSoeType(val)}>
                    <Select.Option value="尽调项目">尽调项目</Select.Option>
                    <Select.Option value="产业链引进">产业链引进</Select.Option>
                    <Select.Option value="品牌活动">品牌活动</Select.Option>
                    <Select.Option value="认缴出资">认缴出资</Select.Option>
                    <Select.Option value="实缴出资">实缴出资</Select.Option>
                  </Select>
                </Form.Item>
              </Col>
            </Row>

            {/* 尽调项目字段 */}
            {soeType === '尽调项目' && (
              <>
                <Divider orientation="left" style={{ marginTop: 0 }}>尽调项目信息</Divider>
                <Row gutter={24}>
                  <Col span={12}>
                    <Form.Item name="submitDate" label="报送时间" rules={[{ required: true }]}>
                      <DatePicker style={{ width: '100%' }} />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item name="investAmount" label="投资额（亿元）" rules={[{ required: true }]}>
                      <InputNumber min={0} precision={2} style={{ width: '100%' }} />
                    </Form.Item>
                  </Col>
                  <Col span={24}>
                    <Form.Item name="projectName" label="项目名称" rules={[{ required: true }]}>
                      <Input placeholder="请输入项目名称" />
                    </Form.Item>
                  </Col>
                  <Col span={24}>
                    <Form.Item name="projectIntro" label="项目简介" rules={[{ required: true }]}>
                      <Input.TextArea rows={3} maxLength={500} showCount />
                    </Form.Item>
                  </Col>
                  <Col span={24}>
                    <Form.Item name="materialType" label="提供资料类型" rules={[{ required: true }]}>
                      <Select placeholder="请选择资料类型">
                        <Select.Option value="调研报告">调研报告</Select.Option>
                        <Select.Option value="立项报告">立项报告</Select.Option>
                        <Select.Option value="第三方尽调报告">第三方尽调报告</Select.Option>
                        <Select.Option value="本国企尽调">本国企尽调</Select.Option>
                        <Select.Option value="其他">其他</Select.Option>
                      </Select>
                    </Form.Item>
                  </Col>
                </Row>
              </>
            )}

            {/* 产业链引进字段 */}
            {soeType === '产业链引进' && (
              <>
                <Divider orientation="left" style={{ marginTop: 0 }}>产业链引进信息</Divider>
                <Row gutter={24}>
                  <Col span={12}>
                    <Form.Item name="submitDate" label="报送时间" rules={[{ required: true }]}>
                      <DatePicker style={{ width: '100%' }} />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item name="investAmount" label="投资额（亿元）" rules={[{ required: true }]}>
                      <InputNumber min={0} precision={2} style={{ width: '100%' }} />
                    </Form.Item>
                  </Col>
                  <Col span={24}>
                    <Form.Item name="projectName" label="项目名称" rules={[{ required: true }]}>
                      <Input placeholder="请输入项目名称" />
                    </Form.Item>
                  </Col>
                  <Col span={24}>
                    <Form.Item name="projectIntro" label="项目简介" rules={[{ required: true }]}>
                      <Input.TextArea rows={3} maxLength={500} showCount />
                    </Form.Item>
                  </Col>
                  <Col span={24}>
                    <Form.Item name="sceneContent" label="提供场景内容" rules={[{ required: true }]}>
                      <Input.TextArea rows={2} placeholder="说明提供的应用场景/合作场景内容" />
                    </Form.Item>
                  </Col>
                  <Col span={24}>
                    <Form.Item name="leadingUnit" label="项目主导单位" rules={[{ required: true }]}>
                      <Input placeholder="请输入项目主导单位" />
                    </Form.Item>
                  </Col>
                </Row>
              </>
            )}

            {/* 品牌活动字段 */}
            {soeType === '品牌活动' && (
              <>
                <Divider orientation="left" style={{ marginTop: 0 }}>品牌活动信息</Divider>
                <Row gutter={24}>
                  <Col span={12}>
                    <Form.Item name="activityDate" label="活动时间" rules={[{ required: true }]}>
                      <DatePicker style={{ width: '100%' }} />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item name="isHost" label="是否为主办单位" rules={[{ required: true }]}>
                      <Radio.Group>
                        <Radio value={true}>是</Radio>
                        <Radio value={false}>否</Radio>
                      </Radio.Group>
                    </Form.Item>
                  </Col>
                  <Col span={24}>
                    <Form.Item name="activityName" label="活动名称" rules={[{ required: true }]}>
                      <Input placeholder="请输入活动名称" />
                    </Form.Item>
                  </Col>
                  <Col span={24}>
                    <Form.Item name="activityIntro" label="活动简介" rules={[{ required: true }]}>
                      <Input.TextArea rows={3} maxLength={300} showCount />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item name="enterpriseCount" label="对接企业数（家）" rules={[{ required: true }]}>
                      <InputNumber min={0} style={{ width: '100%' }} />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item name="clueCount" label="获取有效项目线索（条）" rules={[{ required: true }]}>
                      <InputNumber min={0} style={{ width: '100%' }} />
                    </Form.Item>
                  </Col>
                </Row>
              </>
            )}

            {/* 认缴出资字段 */}
            {soeType === '认缴出资' && (
              <>
                <Divider orientation="left" style={{ marginTop: 0 }}>认缴出资信息</Divider>
                <Row gutter={24}>
                  <Col span={12}>
                    <Form.Item name="submitDate" label="报送时间" rules={[{ required: true }]}>
                      <DatePicker style={{ width: '100%' }} />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item name="subscribeAmount" label="认缴金额（亿元）" rules={[{ required: true }]}>
                      <InputNumber min={0} precision={2} style={{ width: '100%' }} />
                    </Form.Item>
                  </Col>
                  <Col span={24}>
                    <Form.Item name="projectName" label="项目名称" rules={[{ required: true }]}>
                      <Input placeholder="请输入项目/基金名称" />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item name="signDate" label="投资协议签订时间" rules={[{ required: true }]}>
                      <DatePicker style={{ width: '100%' }} />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item name="subscribeTerm" label="认缴期限" rules={[{ required: true }]}>
                      <Input placeholder="如：5年" />
                    </Form.Item>
                  </Col>
                  <Col span={24}>
                    <Form.Item name="subscribeCompany" label="认缴公司名称" rules={[{ required: true }]}>
                      <Input placeholder="请输入认缴公司名称" />
                    </Form.Item>
                  </Col>
                </Row>
              </>
            )}

            {/* 实缴出资字段 */}
            {soeType === '实缴出资' && (
              <>
                <Divider orientation="left" style={{ marginTop: 0 }}>实缴出资信息</Divider>
                <Row gutter={24}>
                  <Col span={12}>
                    <Form.Item name="submitDate" label="报送时间" rules={[{ required: true }]}>
                      <DatePicker style={{ width: '100%' }} />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item name="investAmount" label="出资金额（亿元）" rules={[{ required: true }]}>
                      <InputNumber min={0} precision={2} style={{ width: '100%' }} />
                    </Form.Item>
                  </Col>
                  <Col span={24}>
                    <Form.Item name="projectName" label="项目名称" rules={[{ required: true }]}>
                      <Input placeholder="请输入项目/基金名称" />
                    </Form.Item>
                  </Col>
                  <Col span={24}>
                    <Form.Item name="projectIntro" label="项目简介" rules={[{ required: true }]}>
                      <Input.TextArea rows={2} maxLength={300} showCount />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item name="signDate" label="项目签约时间" rules={[{ required: true }]}>
                      <DatePicker style={{ width: '100%' }} />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item name="payDate" label="出资时间" rules={[{ required: true }]}>
                      <DatePicker style={{ width: '100%' }} />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item name="payCompany" label="出资公司名称" rules={[{ required: true }]}>
                      <Input placeholder="请输入出资公司名称" />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item name="payType" label="出资类型" rules={[{ required: true }]}>
                      <Select placeholder="请选择出资类型">
                        <Select.Option value="货币出资">货币出资</Select.Option>
                        <Select.Option value="实物出资">实物出资</Select.Option>
                        <Select.Option value="知识产权出资">知识产权出资</Select.Option>
                        <Select.Option value="股权出资">股权出资</Select.Option>
                        <Select.Option value="其他">其他</Select.Option>
                      </Select>
                    </Form.Item>
                  </Col>
                  <Col span={24}>
                    <Form.Item name="isMarketDecision" label="是否是市场自主化投资决策项目" rules={[{ required: true }]} valuePropName="checked">
                      <Radio.Group>
                        <Radio value={true}>是</Radio>
                        <Radio value={false}>否</Radio>
                      </Radio.Group>
                    </Form.Item>
                  </Col>
                </Row>
              </>
            )}
          </>
        )}

        {/* ===== 部门填报 ===== */}
        {category === 'dept' && (
          <Row gutter={24}>
            <Col span={12}>
              <Form.Item name="deptKey" label="部门" rules={[{ required: true, message: '请选择部门' }]}>
                <Select
                  options={deptOptions}
                  placeholder="请选择部门"
                  onChange={handleDeptChange}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="taskKey" label="关联考核任务" rules={[{ required: true, message: '请选择考核任务' }]}>
                <Select
                  options={taskOptionsForSelected}
                  placeholder="选择部门后选择考核任务"
                  disabled={!selectedDept}
                  showSearch
                  optionFilterProp="label"
                />
              </Form.Item>
            </Col>
            <Col span={24}>
              <Form.Item name="progress" label="进展描述" rules={[{ required: true }]}>
                <Input.TextArea rows={4} maxLength={500} showCount placeholder="描述本次进展情况" />
              </Form.Item>
            </Col>
          </Row>
        )}

        {/* 佐证材料（必填） */}
        <Divider orientation="left">佐证材料 <span style={{ color: '#ff4d4f' }}>*</span></Divider>
        <Form.Item
          name="attachment"
          rules={[{ required: true, message: '请上传佐证材料' }]}
          valuePropName="fileList"
          getValueFromEvent={normFile}
        >
          <Dragger
            beforeUpload={handleBeforeUpload}
            onRemove={handleRemove}
            fileList={fileList}
            multiple
            accept=".pdf,.doc,.docx,.xls,.xlsx,.txt"
            style={{ background: '#fafafa' }}
          >
            <p className="ant-upload-drag-icon">
              <InboxOutlined style={{ fontSize: 32, color: COLORS.primary }} />
            </p>
            <p className="ant-upload-text" style={{ fontSize: 13, color: '#262626' }}>点击或拖拽文件到此处上传</p>
            <p className="ant-upload-hint" style={{ fontSize: 12, color: '#8c8c8c' }}>
              支持 PDF / 图片 / Word / Excel 等格式，支持多文件上传
            </p>
          </Dragger>
        </Form.Item>
      </Form>
    </Modal>
  )
}

/* ======================== 记录详情弹窗 ======================== */

function RecordDetailModal({ open, record, category, onClose }) {
  if (!open || !record) return null

  return (
    <Modal
      title="记录详情"
      open={open}
      onCancel={onClose}
      width={820}
      destroyOnHidden
      footer={[<Button key="close" onClick={onClose}>关闭</Button>]}
    >
      <div style={{ marginBottom: 12 }}>
        {statusTag(record.status)}
      </div>

      {/* 驳回原因 */}
      {record.status === '已驳回' && record.rejectReason && (
        <div style={{ marginBottom: 16, padding: '12px 16px', background: '#fff2f0', border: '1px solid #ffccc7', borderRadius: 6 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
            <CloseOutlined style={{ color: '#ff4d4f' }} />
            <strong style={{ color: '#cf1322' }}>驳回原因</strong>
          </div>
          <div style={{ color: '#cf1322', fontSize: 13 }}>{record.rejectReason}</div>
        </div>
      )}

      {/* 园区详情 */}
      {category === 'park' && (
        <Descriptions bordered size="small" column={2}>
          <Descriptions.Item label="活动名称" span={2}>{record.name}</Descriptions.Item>
          <Descriptions.Item label="园区">{record.parkName}</Descriptions.Item>
          <Descriptions.Item label="考核任务">{record.taskName}</Descriptions.Item>
          <Descriptions.Item label="活动时间">{record.date}</Descriptions.Item>
          <Descriptions.Item label="是否主办">{record.isHost ? '是' : '否'}</Descriptions.Item>
          <Descriptions.Item label="对接企业数">{record.enterpriseCount} 家</Descriptions.Item>
          <Descriptions.Item label="获取有效线索">{record.clueCount} 条</Descriptions.Item>
          <Descriptions.Item label="活动简介" span={2}>{record.intro}</Descriptions.Item>
        </Descriptions>
      )}

      {/* 国企详情（根据类型不同展示不同字段） */}
      {category === 'soe' && (
        <>
          <Descriptions bordered size="small" column={2}>
            <Descriptions.Item label="国企" span={2}>{record.soeName}</Descriptions.Item>
            <Descriptions.Item label="考核任务">{record.taskName}</Descriptions.Item>
            <Descriptions.Item label="类型">{record.type}</Descriptions.Item>
          </Descriptions>

          {record.type === '尽调项目' && (
            <Descriptions bordered size="small" column={2} style={{ marginTop: -1 }}>
              <Descriptions.Item label="项目名称" span={2}>{record.projectName}</Descriptions.Item>
              <Descriptions.Item label="报送时间">{record.submitDate}</Descriptions.Item>
              <Descriptions.Item label="投资额（亿元）">{record.investAmount}</Descriptions.Item>
              <Descriptions.Item label="资料类型">{record.materialType}</Descriptions.Item>
              <Descriptions.Item label="项目简介" span={2}>{record.projectIntro}</Descriptions.Item>
            </Descriptions>
          )}

          {record.type === '产业链引进' && (
            <Descriptions bordered size="small" column={2} style={{ marginTop: -1 }}>
              <Descriptions.Item label="项目名称" span={2}>{record.projectName}</Descriptions.Item>
              <Descriptions.Item label="报送时间">{record.submitDate}</Descriptions.Item>
              <Descriptions.Item label="投资额（亿元）">{record.investAmount}</Descriptions.Item>
              <Descriptions.Item label="项目主导单位" span={2}>{record.leadingUnit}</Descriptions.Item>
              <Descriptions.Item label="提供场景内容" span={2}>{record.sceneContent}</Descriptions.Item>
              <Descriptions.Item label="项目简介" span={2}>{record.projectIntro}</Descriptions.Item>
            </Descriptions>
          )}

          {record.type === '品牌活动' && (
            <Descriptions bordered size="small" column={2} style={{ marginTop: -1 }}>
              <Descriptions.Item label="活动名称" span={2}>{record.activityName}</Descriptions.Item>
              <Descriptions.Item label="活动时间">{record.activityDate}</Descriptions.Item>
              <Descriptions.Item label="是否主办">{record.isHost ? '是' : '否'}</Descriptions.Item>
              <Descriptions.Item label="对接企业数">{record.enterpriseCount} 家</Descriptions.Item>
              <Descriptions.Item label="获取有效线索">{record.clueCount} 条</Descriptions.Item>
              <Descriptions.Item label="活动简介" span={2}>{record.activityIntro}</Descriptions.Item>
            </Descriptions>
          )}

          {record.type === '认缴出资' && (
            <Descriptions bordered size="small" column={2} style={{ marginTop: -1 }}>
              <Descriptions.Item label="项目名称" span={2}>{record.projectName}</Descriptions.Item>
              <Descriptions.Item label="报送时间">{record.submitDate}</Descriptions.Item>
              <Descriptions.Item label="认缴金额（亿元）">{record.subscribeAmount}</Descriptions.Item>
              <Descriptions.Item label="协议签订时间">{record.signDate}</Descriptions.Item>
              <Descriptions.Item label="认缴期限">{record.subscribeTerm}</Descriptions.Item>
              <Descriptions.Item label="认缴公司名称" span={2}>{record.subscribeCompany}</Descriptions.Item>
            </Descriptions>
          )}

          {record.type === '实缴出资' && (
            <>
              <Descriptions bordered size="small" column={2} style={{ marginTop: -1 }}>
                <Descriptions.Item label="项目名称" span={2}>{record.projectName}</Descriptions.Item>
                <Descriptions.Item label="报送时间">{record.submitDate}</Descriptions.Item>
                <Descriptions.Item label="出资金额（亿元）">{record.investAmount}</Descriptions.Item>
                <Descriptions.Item label="项目签约时间">{record.signDate}</Descriptions.Item>
                <Descriptions.Item label="出资时间">{record.payDate}</Descriptions.Item>
                <Descriptions.Item label="出资公司名称" span={2}>{record.payCompany}</Descriptions.Item>
                <Descriptions.Item label="出资类型">{record.payType}</Descriptions.Item>
                <Descriptions.Item label="市场化投资决策">{record.isMarketDecision ? '是' : '否'}</Descriptions.Item>
                <Descriptions.Item label="项目简介" span={2}>{record.projectIntro}</Descriptions.Item>
              </Descriptions>
            </>
          )}
        </>
      )}

      {/* 部门详情 */}
      {category === 'dept' && (
        <Descriptions bordered size="small" column={2}>
          <Descriptions.Item label="部门" span={2}>{record.deptName}</Descriptions.Item>
          <Descriptions.Item label="考核任务" span={2}>{record.taskName}</Descriptions.Item>
          <Descriptions.Item label="进展描述" span={2}>{record.progressDesc}</Descriptions.Item>
        </Descriptions>
      )}

      {/* 附件 */}
      <Divider orientation="left">
        <Space><FileTextOutlined style={{ color: COLORS.primary }} /><strong>佐证材料</strong></Space>
      </Divider>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
        {record.attachments?.length ? record.attachments.map((f, i) => (
          <Tag key={i} icon={<FileTextOutlined />} style={{ padding: '4px 12px', fontSize: 12 }}>{f}</Tag>
        )) : <span style={{ color: '#bfbfbf' }}>无</span>}
      </div>

      <Divider orientation="left">
        <Space><ClockCircleOutlined style={{ color: '#8c8c8c' }} /><strong>流程信息</strong></Space>
      </Divider>
      <Descriptions size="small" column={2}>
        <Descriptions.Item label="提交人">{record.submitter}</Descriptions.Item>
        <Descriptions.Item label="提交时间">{record.submitTime}</Descriptions.Item>
      </Descriptions>
    </Modal>
  )
}
