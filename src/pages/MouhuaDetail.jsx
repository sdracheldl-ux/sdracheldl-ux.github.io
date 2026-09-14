import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  Tabs, Descriptions, Button, Space, Tag, Modal, Form, Input, InputNumber, Select, Cascader, Row, Col,
  message
} from 'antd'
import {
  ArrowLeftOutlined, EditOutlined, PlusOutlined,
  ExportOutlined, PauseCircleOutlined, ExclamationCircleOutlined, RobotOutlined
} from '@ant-design/icons'
import mockData from '../mock/data.json'
import TransferToZaitanModal from '../components/TransferToZaitanModal'
import ProgressTimeline from '../components/ProgressTimeline'
import ProgressSummaryModal from '../components/ProgressSummaryModal'
import {
  RESPONSIBLE_UNIT_SELECT_GROUPS, RESPONSIBLE_UNIT_OPTIONS, normalizeResponsibleUnits,
  DOMESTIC_REGION_OPTIONS, FOREIGN_COUNTRY_OPTIONS, INDUSTRY_CASCADER_OPTIONS,
  DISTRICT_CODE_SEEDS,
} from '../constants/projectEnums'
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
  PROGRESS_TYPE,
} from '../constants/uiStyles'

const { TextArea } = Input
const { Option } = Select

const PROJECT_CATEGORY_OPTIONS = ['政策类', '投资类', '供地类', '其他']
const CAPITAL_NATURE_OPTIONS = ['内资', '外资']
const INDUSTRY_TYPE_OPTIONS = ['农业', '工业', '服务业']

const CURRENT_USER = '投促局管理员'

const unitTagStyle = { background: '#e6f4ff', color: '#1677ff', border: '1px solid #91caff', borderRadius: 4, marginInlineEnd: 6 }

// 责任单位渲染：空显示 '-'；每项浅蓝 Tag，最多 3 个，超出用 +N 收起
function renderUnits(v) {
  const list = normalizeResponsibleUnits(v)
  if (list.length === 0) return '-'
  const shown = list.slice(0, 3)
  return (
    <span>
      {shown.map(u => <Tag key={u} style={unitTagStyle}>{u}</Tag>)}
      {list.length > 3 && <Tag style={unitTagStyle}>+{list.length - 3}</Tag>}
    </span>
  )
}

// 计划投资总额(亿元)：空值显示 '-'
function formatInvestAmount(v) {
  if (v === undefined || v === null || v === '') return '-'
  return Number(v).toFixed(2)
}

export default function MouhuaDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [basicForm] = Form.useForm()
  const [progressForm] = Form.useForm()
  const editCapitalNature = Form.useWatch('capitalNature', basicForm)

  const [project, setProject] = useState(() => {
    const mockFormValues = [
      { capitalNature: '内资', sourceRegion: ['上海', '上海市'], industryType: '工业', industryCategory: ['大健康和生物技术', '生物医药'], chainType965: ['生命健康', '生物医药'], investorContactPerson: '陶维红', investorContactPhone: '18612345625', investAmount: 1.2, projectDescription: '' },
      { capitalNature: '内资', sourceRegion: ['安徽', '合肥市'], industryType: '工业', industryCategory: ['超级计算和人工智能', '智能机器人'], chainType965: ['人工智能', '智能机器人'], investorContactPerson: '施海仁', investorContactPhone: '13800000002', investAmount: 1.5, projectDescription: '' },
      { capitalNature: '内资', sourceRegion: ['江苏', '苏州市'], industryType: '工业', industryCategory: ['"光芯屏端网"新一代信息技术', '先进半导体'], chainType965: ['光电子信息', '集成电路'], investorContactPerson: '许昂', investorContactPhone: '13900000003', investAmount: 1.1, projectDescription: '' },
      { capitalNature: '内资', sourceRegion: ['江苏', '南京市'], industryType: '工业', industryCategory: ['大健康和生物技术', '高端医疗器械'], chainType965: ['生命健康', '高端医疗器械'], investorContactPerson: '费良江', investorContactPhone: '13700000004', investAmount: 2, projectDescription: '' },
    ]
    const base = mockData.zaitan.slice(0, 4).map((item, idx) => ({
      key: `mouhua-${idx + 1}`,
      index: idx + 1,
      districtProjectCode: item['区级项目编码'] || DISTRICT_CODE_SEEDS[idx % DISTRICT_CODE_SEEDS.length],
      reporter: item['申报人'] || '-',
      projectStatus: '谋划中',
      projectName: item['项目名称'] || '-',
      sourceArea: item['来源地'] || '-',
      industryCategory: item['产业类别'] || '-',
      industryType: item['行业类别'] || '-',
      projectDesc: item['项目简介'] || '-',
      investorEntity: item['投资主体'] || '-',
      investorContactPerson: mockFormValues[idx].investorContactPerson,
      investorContactPhone: mockFormValues[idx].investorContactPhone,
      investAmount: item['投资金额（亿元）'] || mockFormValues[idx].investAmount,
      sourceRegion: mockFormValues[idx].sourceRegion,
      responsibleUnits: [RESPONSIBLE_UNIT_OPTIONS[idx % RESPONSIBLE_UNIT_OPTIONS.length]],
      reportTime: item['申报时间'] || '-',
      projectCategory: PROJECT_CATEGORY_OPTIONS[idx % PROJECT_CATEGORY_OPTIONS.length],
      capitalNature: mockFormValues[idx].capitalNature,
      chainType965: item['对应"965"产业链类别'] || '-',
      _formValues: mockFormValues[idx],
    }))
    return base.find(p => p.key === id) || base[0]
  })

  const [progressList, setProgressList] = useState([
    // 系统事件：项目录入
    {
      id: 'sys-create',
      type: PROGRESS_TYPE.SYSTEM,
      content: '新增项目',
      reporter: project.reporter || '投促局 易成豪',
      updateTime: project.reportTime || '2025-12-20 09:00',
    },
    {
      id: 'prog-1',
      type: PROGRESS_TYPE.NORMAL,
      stage: '谋划阶段',
      content: '已完成项目初步方案，提交内部评审。',
      reporter: CURRENT_USER,
      updateTime: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 'prog-2',
      type: PROGRESS_TYPE.NORMAL,
      stage: '谋划阶段',
      content: '对接企业方确认投资意向，企业表示将在下周实地考察。',
      reporter: '驻沪办 蔡威',
      updateTime: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    },
  ])

  const [activeTab, setActiveTab] = useState('basic')
  const [editModalVisible, setEditModalVisible] = useState(false)
  const [progressModalVisible, setProgressModalVisible] = useState(false)
  const [transferModalVisible, setTransferModalVisible] = useState(false)
  const [aiVisible, setAiVisible] = useState(false)
  const [tuikuVisible, setTuikuVisible] = useState(false)
  const [tuikuReason, setTuikuReason] = useState('')
  const [editingProgress, setEditingProgress] = useState(null)
  const [editLoading, setEditLoading] = useState(false)
  const [progressLoading, setProgressLoading] = useState(false)

  const handleBack = () => navigate('/project/mouhua')

  const handleEditBasic = () => {
    const fv = project._formValues || {}
    basicForm.setFieldsValue({
      projectName: project.projectName,
      capitalNature: project.capitalNature || fv.capitalNature,
      sourceRegion: project.sourceRegion || fv.sourceRegion,
      industryType: project.industryCategory,
      industryCategory: fv.industryCategory,
      investAmount: project.investAmount != null && project.investAmount !== '' ? project.investAmount : fv.investAmount,
      responsibleUnits: normalizeResponsibleUnits(project.responsibleUnits),
      projectDescription: project.projectDesc && project.projectDesc !== '-' ? project.projectDesc : undefined,
    })
    setEditModalVisible(true)
  }

  const handleEditOk = async () => {
    try {
      const values = await basicForm.validateFields()
      setEditLoading(true)
      setProject(prev => {
        const mergedFormValues = { ...(prev._formValues || {}), ...values }
        return {
          ...prev,
          projectName: values.projectName,
          capitalNature: values.capitalNature,
          sourceRegion: values.sourceRegion,
          sourceArea: values.sourceRegion ? values.sourceRegion.join(' / ') : prev.sourceArea,
          industryCategory: values.industryType,
          industryType: values.industryCategory ? values.industryCategory.join(' / ') : prev.industryType,
          investAmount: values.investAmount,
          responsibleUnits: normalizeResponsibleUnits(values.responsibleUnits),
          projectDesc: values.projectDescription,
          _formValues: mergedFormValues,
        }
      })
      message.success('基础信息已更新')
      setEditModalVisible(false)
    } catch (e) {
      // validation error
    } finally {
      setEditLoading(false)
    }
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
            stage: '谋划阶段',
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

  const handleToZaitan = () => {
    Modal.confirm({
      title: '转在谈',
      content: `确定将谋划项目「${project.projectName}」转入在谈阶段吗？需要补充在谈阶段必填字段。`,
      okText: '去补充信息', cancelText: '取消',
      onOk: () => setTransferModalVisible(true),
    })
  }
  const handleTransferOk = () => {
    // 写入系统事件：项目推进至在谈
    setProgressList(prev => [
      {
        id: `sys-transfer-${Date.now()}`,
        type: PROGRESS_TYPE.SYSTEM,
        content: '项目推进至「在谈」阶段',
        reporter: CURRENT_USER,
        updateTime: new Date().toISOString(),
      },
      ...prev,
    ])
    setTransferModalVisible(false)
    message.success('该项目已从谋划列表移至在谈列表，正在跳转...')
    setTimeout(() => navigate('/project/zaitan'), 1000)
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
    message.success('已标记为退库（demo示意）')
    setTuikuVisible(false)
    setTuikuReason('')
    setTimeout(() => navigate('/project/mouhua'), 800)
  }

  const formItemLayout = { labelCol: { span: 8 }, wrapperCol: { span: 16 } }

  const editSourceRegionOptions = editCapitalNature === '外资'
    ? FOREIGN_COUNTRY_OPTIONS.map(c => ({ label: c, value: c }))
    : editCapitalNature === '内资' ? DOMESTIC_REGION_OPTIONS : []

  return (
    <div className="page-container">
      <div className="table-card" style={pageCardStyle}>
        <div style={detailHeaderStyle}>
          <div style={detailHeaderLeftStyle}>
            <Button type="text" icon={<ArrowLeftOutlined />} onClick={handleBack} style={{ marginLeft: -8 }}>
              返回
            </Button>
            <span style={{ fontSize: 18, fontWeight: 600 }}>{project.projectName}</span>
            <Tag color="blue" style={{ background: COLORS.primaryLight, color: COLORS.primary, border: `1px solid ${COLORS.primaryBorder}`, margin: 0 }}>{project.projectStatus}</Tag>
          </div>
          <Space size={8}>
            <Button type="primary" icon={<PlusOutlined />} onClick={handleAddProgress}>
              进展汇报
            </Button>
            <Button className="ai-grad-btn" icon={<RobotOutlined />} onClick={() => setAiVisible(true)}>
              AI 摘要
            </Button>
            <Button icon={<EditOutlined />} onClick={handleEditBasic}>
              编辑
            </Button>
            <Button icon={<ExportOutlined />} onClick={handleToZaitan}>
              转在谈
            </Button>
            <Button danger icon={<PauseCircleOutlined />} onClick={() => { setTuikuReason(''); setTuikuVisible(true) }}>
              标记退库
            </Button>
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
                  <Descriptions
                    bordered
                    column={2}
                    labelStyle={{ width: 140, background: '#fafafa', fontWeight: 500 }}
                    contentStyle={{ minWidth: 200 }}
                  >
                    <Descriptions.Item label="区级项目编码">{project.districtProjectCode || '-'}</Descriptions.Item>
                    <Descriptions.Item label="项目名称">{project.projectName}</Descriptions.Item>
                    <Descriptions.Item label="计划投资总额(亿元)">{formatInvestAmount(project.investAmount)}</Descriptions.Item>
                    <Descriptions.Item label="内外资">{project.capitalNature || '-'}</Descriptions.Item>
                    <Descriptions.Item label="来源地">{project.sourceArea}</Descriptions.Item>
                    <Descriptions.Item label="产业类别">{project.industryCategory}</Descriptions.Item>
                    <Descriptions.Item label="行业类别">{project.industryType}</Descriptions.Item>
                    <Descriptions.Item label="申报人">{project.reporter}</Descriptions.Item>
                    <Descriptions.Item label="申报时间">{project.reportTime}</Descriptions.Item>
                    <Descriptions.Item label="责任单位" span={2}>{renderUnits(project.responsibleUnits)}</Descriptions.Item>
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
                />
              ),
            },
          ]}
        />
      </div>

      <Modal
        title="编辑基础信息"
        open={editModalVisible}
        onOk={handleEditOk}
        onCancel={() => setEditModalVisible(false)}
        confirmLoading={editLoading}
        okText="保存" cancelText="取消"
        width={960}
        destroyOnClose
        bodyStyle={{ padding: '24px', maxHeight: '70vh', overflowY: 'auto' }}
      >
        <Form form={basicForm} {...formItemLayout} layout="horizontal" requiredMark={true} colon={false}>
          <Row gutter={24}>
            <Col span={12}>
              <Form.Item label="项目名称" name="projectName" rules={[{ required: true, message: '请输入项目名称' }, { max: 40, message: '项目名称不超过40个字符' }]}>
                <Input placeholder="请输入项目名称" maxLength={40} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="内外资" name="capitalNature" rules={[{ required: true, message: '请选择内外资' }]}>
                <Select placeholder="请选择内外资" onChange={() => basicForm.setFieldValue('sourceRegion', undefined)}>
                  {CAPITAL_NATURE_OPTIONS.map(o => <Option key={o} value={o}>{o}</Option>)}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="来源地" name="sourceRegion" rules={[{ required: true, message: '请选择来源地' }]}>
                <Cascader
                  options={editSourceRegionOptions}
                  placeholder={editCapitalNature === '外资' ? '请选择国家' : editCapitalNature === '内资' ? '请选择省份/城市' : '请先选择内外资'}
                  expandTrigger="hover"
                  showSearch
                  disabled={!editCapitalNature}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="产业类别" name="industryType" rules={[{ required: true, message: '请选择产业类别' }]}>
                <Select placeholder="请选择产业类别">
                  {INDUSTRY_TYPE_OPTIONS.map(o => <Option key={o} value={o}>{o}</Option>)}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="行业类别" name="industryCategory" rules={[{ required: true, message: '请选择行业类别' }]}>
                <Cascader
                  options={INDUSTRY_CASCADER_OPTIONS}
                  placeholder="请选择行业类别（门类/大类）"
                  expandTrigger="hover"
                  showSearch
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="计划投资总额(亿元)" name="investAmount" rules={[{ required: true, message: '请输入计划投资总额' }, { type: 'number', min: 0.01, message: '计划投资总额需大于0' }]}>
                <InputNumber style={{ width: '100%' }} placeholder="请输入" min={0} precision={2} addonAfter="亿元" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="责任单位" name="responsibleUnits" rules={[{ required: true, message: '请选择责任单位（至少1个）' }]}>
                <Select mode="multiple" options={RESPONSIBLE_UNIT_SELECT_GROUPS} placeholder="请选择责任单位" showSearch allowClear maxTagCount="responsive" />
              </Form.Item>
            </Col>
            <Col span={24}>
              <Form.Item label="项目简介" name="projectDescription" labelCol={{ span: 4 }} wrapperCol={{ span: 20 }} rules={[{ required: true, message: '请输入项目简介' }, { max: 999, message: '项目简介不超过999个字符' }]}>
                <TextArea rows={4} placeholder="请输入项目简介，最多999字" maxLength={999} showCount />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>

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
      <TransferToZaitanModal
        open={transferModalVisible}
        onCancel={() => setTransferModalVisible(false)}
        onOk={handleTransferOk}
        projectData={project}
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
        stageLabel="谋划阶段"
        items={progressList}
        onSave={(content) => {
          const now = new Date()
          const pad2 = (n) => String(n).padStart(2, '0')
          const ts = `${now.getFullYear()}-${pad2(now.getMonth() + 1)}-${pad2(now.getDate())} ${pad2(now.getHours())}:${pad2(now.getMinutes())}`
          setProgressList((prev) => [{
            id: `ai-${Date.now()}`,
            content,
            reporter: CURRENT_USER,
            updateTime: ts,
            stage: '谋划阶段',
          }, ...prev])
        }}
      />
    </div>
  )
}
