import { useState, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  Button, Space, Tag, Descriptions, Modal, message, Card, Tooltip, Divider,
} from 'antd'
import {
  ArrowLeftOutlined,
  MergeOutlined,
  CloseCircleOutlined,
  PlusOutlined,
  RobotOutlined,
  EyeOutlined,
} from '@ant-design/icons'
import {
  detailHeaderStyle,
  detailHeaderLeftStyle,
  pageCardStyle,
  actionLinkStyle,
} from '../constants/uiStyles'
import { useImported } from '../store/viewStore'

// 库中已有项目的详情页路径映射（按阶段）
const STAGE_DETAIL_PATH = {
  '谋划': '/project/mouhua/detail/',
  '在谈': '/project/zaitan/detail/',
  '签约': '/project/qianyue/detail/',
  '落地': '/project/luodi/detail/',
}

// 冲突等级配置
const CONFLICT_LEVEL_CONFIG = {
  L1: { label: 'L1-强匹配', color: '#ff4d4f', bgColor: '#fff2f0', desc: '市级项目编码相同，或项目名称完全相同' },
  L2: { label: 'L2-高相似', color: '#fa8c16', bgColor: '#fff7e6', desc: '名称相似+主体相同' },
  L3: { label: 'L3-中风险', color: '#faad14', bgColor: '#fffbe6', desc: '多字段组合匹配' },
  L4: { label: 'L4-弱提示', color: '#1677ff', bgColor: '#e6f7ff', desc: '单一弱特征匹配' },
}

// Mock研判详情数据
const MOCK_YANPAN_DETAIL = {
  'yp-001': {
    id: 'yp-001',
    newProjectName: '人工智能药物研发平台',
    existingProjectName: '人工智能药物研发及产业化平台建设项目',
    conflictLevel: 'L1',
    conflictReason: '市级项目编码相同（SJ-2026-0012），且项目名称高度相似（相似度92%）、投资主体相同',
    aiSuggestion: '【合并覆盖】市级编码一致，确认为同一项目，用最新数据更新原项目，阶段升阶至在谈',
    confidence: 0.98,
    status: 'pending',
    newStage: '在谈',
    existingStage: '在谈',
    importUser: '智造园-石丰浩',
    importTime: '2026-09-02 10:30',
    // 新导入数据字段
    newData: {
      cityProjectCode: 'SJ-2026-0012',
      projectName: '人工智能药物研发平台',
      investorEntity: '上海溪长生物技术有限公司',
      investAmount: 1.2,
      industryCategory: '生物医药',
      industryType: '大健康和生物技术',
      importSource: '智造园',
      reporter: '智造园-石丰浩',
      reportTime: '2026-09-02',
      projectDesc: '拟投资1.2亿元用于AI药物发现平台建设，已取得阶段性成果。',
      contactPerson: '陶维红',
      contactPhone: '186****1234',
      address: '东湖高新区生物城',
    },
    // 库中已有数据字段
    existingData: {
      cityProjectCode: 'SJ-2026-0012',
      projectName: '人工智能药物研发及产业化平台建设项目',
      investorEntity: '上海溪长生物技术有限公司',
      investAmount: 1.2,
      industryCategory: '生物医药',
      industryType: '大健康和生物技术',
      importSource: '驻沪办',
      reporter: '驻沪办 蔡威',
      reportTime: '2026-05-08',
      projectDesc: '专注千亿级Fab合成噬菌体文库与AI抗体发现平台，拟投资1.2亿元...',
      contactPerson: '陶维红',
      contactPhone: '186****5678',
      address: '东湖高新区',
    },
  },
  'yp-006': {
    id: 'yp-006',
    newProjectName: '化合物半导体材料研发生产基地',
    existingProjectName: '第三代半导体产业园项目',
    conflictLevel: 'L1',
    conflictReason: '市级项目编码相同（SJ-2026-0035），同一市级编码视为同一项目',
    aiSuggestion: '【合并覆盖】市级项目编码一致，系统判定为同一项目的不同名称版本，建议以最新导入数据合并',
    confidence: 0.96,
    status: 'pending',
    newStage: '在谈',
    existingStage: '在谈',
    importUser: '光电园-李工',
    importTime: '2026-09-02 11:20',
    // 新导入数据字段
    newData: {
      cityProjectCode: 'SJ-2026-0035',
      projectName: '化合物半导体材料研发生产基地',
      investorEntity: '武汉光谷半导体技术有限公司',
      investAmount: 6.8,
      industryCategory: '集成电路',
      industryType: '光电子信息',
      importSource: '光电园',
      reporter: '光电园-李工',
      reportTime: '2026-09-02',
      projectDesc: '拟投资6.8亿元建设化合物半导体材料研发生产基地，涵盖碳化硅衬底、外延片研发及量产线。',
      contactPerson: '刘工',
      contactPhone: '135****2233',
      address: '东湖高新区未来科技城',
    },
    // 库中已有数据字段
    existingData: {
      cityProjectCode: 'SJ-2026-0035',
      projectName: '第三代半导体产业园项目',
      investorEntity: '武汉光谷半导体技术有限公司',
      investAmount: 6.0,
      industryCategory: '集成电路',
      industryType: '光电子信息',
      importSource: '投促局',
      reporter: '投促局 易成豪',
      reportTime: '2026-05-20',
      projectDesc: '投资6亿元建设第三代半导体产业园，聚焦碳化硅、氮化镓材料产业化。',
      contactPerson: '刘工',
      contactPhone: '135****2233',
      address: '东湖高新区未来科技城',
    },
  },
  'yp-002': {
    id: 'yp-002',
    newProjectName: '新能源汽车动力电池项目',
    existingProjectName: '新能源动力电池生产基地项目',
    conflictLevel: 'L2',
    conflictReason: '项目名称相似度87%，投资主体相同，产业类别一致',
    aiSuggestion: '【合并覆盖】双方投资金额偏差8%，建议合并后保留最新进展信息',
    confidence: 0.82,
    status: 'pending',
    newStage: '在谈',
    existingStage: '在谈',
    importUser: '未来科技城-陈主任',
    importTime: '2026-09-01 15:20',
    newData: {
      projectName: '新能源汽车动力电池项目',
      investorEntity: '武汉亿纬锂能有限公司',
      investAmount: 5.6,
      industryCategory: '新能源汽车',
      industryType: '新能源与智能网联汽车',
      importSource: '未来科技城',
      reporter: '未来科技城-陈主任',
      reportTime: '2026-09-01',
      projectDesc: '拟投资5.6亿元建设动力电池生产线二期项目。',
      contactPerson: '李经理',
      contactPhone: '139****8888',
      address: '未来科技城',
    },
    existingData: {
      projectName: '新能源动力电池生产基地项目',
      investorEntity: '武汉亿纬锂能有限公司',
      investAmount: 5.15,
      industryCategory: '新能源汽车',
      industryType: '新能源与智能网联汽车',
      importSource: '光电园',
      reporter: '光电园-李工',
      reportTime: '2026-07-20',
      projectDesc: '投资5.15亿元建设动力电池生产基地，一期已投产。',
      contactPerson: '王总',
      contactPhone: '139****9999',
      address: '东湖高新区',
    },
  },
  'yp-003': {
    id: 'yp-003',
    newProjectName: '光电子信息产业园二期',
    existingProjectName: '光电子信息产业园一期',
    conflictLevel: 'L3',
    conflictReason: '项目名称相似度72%（低于85%）、投资主体相同、建设地址相同、投资金额偏差18%',
    aiSuggestion: '【人工确认】名称相似度中等，可能为同一项目的分期建设，请核对项目简介后决定',
    confidence: 0.68,
    status: 'pending',
    newStage: '签约',
    existingStage: '签约',
    importUser: '光电园-李工',
    importTime: '2026-08-30 09:45',
    newData: {
      projectName: '光电子信息产业园二期',
      investorEntity: '华星光电技术有限公司',
      investAmount: 8.5,
      industryCategory: '光电子信息',
      industryType: '光电子信息',
      importSource: '光电园',
      reporter: '光电园-李工',
      reportTime: '2026-08-30',
      projectDesc: '拟投资8.5亿元建设光电子信息产业园二期，扩产面板生产线。',
      contactPerson: '赵工',
      contactPhone: '137****6666',
      address: '东湖高新区左岭',
    },
    existingData: {
      projectName: '光电子信息产业园一期',
      investorEntity: '华星光电技术有限公司',
      investAmount: 10.0,
      industryCategory: '光电子信息',
      industryType: '光电子信息',
      importSource: '投促局',
      reporter: '投促局 易成豪',
      reportTime: '2026-06-15',
      projectDesc: '投资10亿元建设光电子信息产业园一期，已签约落地。',
      contactPerson: '钱总',
      contactPhone: '137****7777',
      address: '东湖高新区左岭',
    },
  },
  'yp-005': {
    id: 'yp-005',
    newProjectName: '智能物流仓储系统',
    existingProjectName: '智慧供应链管理平台',
    conflictLevel: 'L4',
    conflictReason: '投资主体相同、同一导入主体（物流园）、建设地址相近，项目名称相似度仅42%',
    aiSuggestion: '【人工确认】名称相似度低，但投资主体与导入主体一致，可能为关联项目或分期项目，建议核对项目简介后判定',
    confidence: 0.45,
    status: 'ignored',
    newStage: '在谈',
    existingStage: '在谈',
    importUser: '物流园-赵经理',
    importTime: '2026-08-25 11:00',
    newData: {
      projectName: '智能物流仓储系统',
      investorEntity: '京东物流科技有限公司',
      investAmount: 2.8,
      industryCategory: '现代物流',
      industryType: '现代服务业',
      importSource: '物流园',
      reporter: '物流园-赵经理',
      reportTime: '2026-08-25',
      projectDesc: '拟投资2.8亿元建设智能化物流仓储系统，含自动化分拣线及WMS升级。',
      contactPerson: '赵经理',
      contactPhone: '138****5678',
      address: '东湖高新区物流园',
    },
    existingData: {
      projectName: '智慧供应链管理平台',
      investorEntity: '京东物流科技有限公司',
      investAmount: 3.0,
      industryCategory: '现代物流',
      industryType: '现代服务业',
      importSource: '物流园',
      reporter: '物流园-周主管',
      reportTime: '2026-07-10',
      projectDesc: '投资3亿元建设智慧供应链管理平台，覆盖仓储、运输、订单全链路数字化。',
      contactPerson: '周主管',
      contactPhone: '138****5678',
      address: '东湖高新区物流园',
    },
  },
}

// 字段比对配置：定义需要比对的字段及显示标签（市级项目编码为最强判重依据，置顶展示；联系人/电话仅作信息展示，不参与判重）
const COMPARISON_FIELDS = [
  { key: 'cityProjectCode', label: '市级项目编码', important: true },
  { key: 'projectName', label: '项目名称', important: true },
  { key: 'investorEntity', label: '投资主体', important: true },
  { key: 'investAmount', label: '投资金额(亿元)', important: true, isNumber: true, unit: '亿元' },
  { key: 'address', label: '建设地址', important: false },
  { key: 'importSource', label: '导入主体', important: false },
  { key: 'industryCategory', label: '产业类别', important: false },
  { key: 'industryType', label: '行业类别', important: false },
  { key: 'reporter', label: '申报人', important: false },
  { key: 'reportTime', label: '申报时间', important: false },
  { key: 'contactPerson', label: '联系人', important: false },
  { key: 'contactPhone', label: '联系电话', important: false },
]

// 计算两个字段的相似度和状态
function compareField(newValue, oldValue) {
  if (newValue === oldValue) return { status: 'same', similarity: 100 }
  if (!newValue || !oldValue) return { status: 'different', similarity: 0 }

  // 数字字段比较偏差
  if (typeof newValue === 'number' && typeof oldValue === 'number') {
    const diff = Math.abs(newValue - oldValue)
    const maxVal = Math.max(newValue, oldValue)
    const deviation = maxVal > 0 ? (diff / maxVal * 100) : 0
    if (deviation <= 10) return { status: 'similar', similarity: 95, deviation }
    return { status: 'different', similarity: 60, deviation }
  }

  // 文本字段简单相似度计算（基于公共字符比例）
  const newStr = String(newValue).replace(/\s/g, '')
  const oldStr = String(oldValue).replace(/\s/g, '')
  const commonChars = [...newStr].filter(char => oldStr.includes(char)).length
  const maxLen = Math.max(newStr.length, oldStr.length)
  const similarity = maxLen > 0 ? (commonChars / maxLen * 100) : 0

  if (similarity >= 85) return { status: 'similar', similarity }
  return { status: 'different', similarity }
}

// 获取状态样式
function getStatusStyle(status) {
  switch (status) {
    case 'same': return { color: '#52c41a', bgColor: '#f6ffed', tag: '✓ 一致' }
    case 'similar': return { color: '#faad14', bgColor: '#fffbe6', tag: '≈ 相似' }
    case 'different': return { color: '#ff4d4f', bgColor: '#fff2f0', tag: '✗ 差异' }
    default: return { color: '#8c8c8c', bgColor: '#fafafa', tag: '-'}
  }
}

export default function YanpanDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const imported = useImported()

  // 获取当前研判记录详情（Excel导入产生的记录优先，其次读取内置mock）
  const detail = useMemo(() => {
    const fromImport = imported?.conflicts?.find(c => c.id === id)
    return fromImport || MOCK_YANPAN_DETAIL[id] || MOCK_YANPAN_DETAIL['yp-001']
  }, [id, imported])

  // 计算各字段的比对结果
  const fieldComparisons = useMemo(() => {
    return COMPARISON_FIELDS.map(field => ({
      ...field,
      newValue: detail.newData[field.key],
      oldValue: detail.existingData[field.key],
      ...compareField(detail.newData[field.key], detail.existingData[field.key]),
    }))
  }, [detail])

  // 统计比对结果
  const comparisonStats = useMemo(() => {
    const same = fieldComparisons.filter(f => f.status === 'same').length
    const similar = fieldComparisons.filter(f => f.status === 'similar').length
    const different = fieldComparisons.filter(f => f.status === 'different').length
    return { same, similar, different, total: fieldComparisons.length }
  }, [fieldComparisons])

  const levelConfig = CONFLICT_LEVEL_CONFIG[detail.conflictLevel]

  // 操作处理函数
  const handleMerge = () => {
    Modal.confirm({
      title: '确认合并覆盖',
      content: (
        <div>
          <p>确定执行<strong style={{ color: '#1677ff' }}>「合并覆盖」</strong>操作吗？</p>
          <div style={{ background: '#f6ffed', padding: '12px', borderRadius: 4, marginTop: 8, fontSize: 13 }}>
            <p style={{ margin: 0 }}>操作说明：</p>
            <ul style={{ margin: '4px 0 0', paddingLeft: 20 }}>
              <li>取最新阶段：<strong>{detail.newStage === 'zaitan' ? '在谈' : detail.newStage === 'qianyue' ? '签约' : detail.newStage}</strong></li>
              <li>字段取并集：两份数据的所有字段将合并</li>
              <li>同字段值：优先采用新导入数据的值</li>
              <li>保留原项目的进展记录和历史轨迹</li>
            </ul>
          </div>
        </div>
      ),
      okText: '确认合并',
      cancelText: '取消',
      okButtonProps: { type: 'primary' },
      onOk: () => {
        setLoading(true)
        setTimeout(() => {
          message.success('已成功合并覆盖，原项目已更新为新数据')
          setLoading(false)
          navigate('/project/yanpan')
        }, 800)
      },
    })
  }

  const handleIgnore = () => {
    Modal.confirm({
      title: '确认忽略',
      content: `确定忽略本次导入的项目「${detail.newProjectName}」吗？库中原有记录将保持不变。`,
      okText: '确认忽略',
      okButtonProps: { danger: true },
      onOk: () => {
        message.success('已忽略该条导入记录')
        navigate('/project/yanpan')
      },
    })
  }

  const handleNewProject = () => {
    Modal.confirm({
      title: '标记为新项目',
      content: (
        <div>
          <p>确定将该条记录<strong style={{ color: '#1677ff' }}>「视为新项目」</strong>吗？</p>
          <p style={{ color: '#8c8c8c', fontSize: 13, margin: '8px 0 0' }}>
            系统将其标记为独立项目，不再与现有项目关联。
          </p>
        </div>
      ),
      okText: '确认标记',
      cancelText: '取消',
      onOk: () => {
        message.success('已标记为新项目')
        navigate('/project/yanpan')
      },
    })
  }

  return (
    <div className="page-container">
      <div className="table-card" style={pageCardStyle}>
        {/* 顶部标题栏（沿用详情页规范样式） */}
        <div style={detailHeaderStyle}>
          <div style={detailHeaderLeftStyle}>
            <Button type="text" icon={<ArrowLeftOutlined />} onClick={() => navigate('/project/yanpan')} style={{ marginLeft: -8 }}>
              返回
            </Button>
            <span style={{ fontSize: 18, fontWeight: 600 }}>
              {detail.newProjectName} vs {detail.existingProjectName}
            </span>
          </div>

          {/* 操作按钮组 */}
          <Space size={8}>
            <Button
              icon={<MergeOutlined />}
              type="primary"
              onClick={handleMerge}
              loading={loading}
            >
              合并覆盖
            </Button>
            <Button
              icon={<CloseCircleOutlined />}
              onClick={handleIgnore}
            >
              忽略
            </Button>
            <Button
              icon={<PlusOutlined />}
              onClick={handleNewProject}
              style={{ borderColor: '#1677ff', color: '#1677ff' }}
            >
              视为新项目
            </Button>
          </Space>
        </div>
        <div style={{ marginTop: -12, marginBottom: 24, fontSize: 13, color: '#8c8c8c' }}>
          导入时间：{detail.importTime} · 来源：{detail.importUser}
        </div>

      {/* AI研判结论卡片 */}
      <Card
        style={{
          marginBottom: 24,
          borderLeft: `4px solid ${levelConfig.color}`,
          background: levelConfig.bgColor,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 20 }}>
          <RobotOutlined style={{ fontSize: 32, color: levelConfig.color, marginTop: 4 }} />
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
              <Tag color={levelConfig.color} style={{ fontSize: 14, padding: '4px 12px' }}>
                {levelConfig.label}
              </Tag>
              <span style={{ fontSize: 16, fontWeight: 600 }}>
                冲突等级 · 置信度 {(detail.confidence * 100).toFixed(0)}%
              </span>
              <div style={{ marginLeft: 'auto', fontSize: 13 }}>
                <span style={{ color: '#8c8c8c' }}>阶段关系：</span>
                <Tag color="blue">{detail.newStage === 'mouhua' ? '谋划' : detail.newStage}</Tag>
                <span style={{ margin: '0 4px' }}>→</span>
                <Tag color="green">{detail.existingStage === 'zaitan' ? '在谈' : detail.existingStage}</Tag>
              </div>
            </div>

            <div style={{ marginBottom: 12 }}>
              <strong>判定理由：</strong>
              <ul style={{ margin: '4px 0 0', paddingLeft: 20, color: '#595959' }}>
                <li>{detail.conflictReason}</li>
                <li>字段一致性：{comparisonStats.same}项完全一致 / {comparisonStats.similar}项相似 / {comparisonStats.different}项存在差异</li>
              </ul>
            </div>

            <div style={{
              padding: '12px 16px',
              background: '#fff',
              borderRadius: 6,
              border: '1px solid #d9d9d9',
            }}>
              <strong style={{ color: '#1677ff' }}>💡 AI建议：</strong>
              <span style={{ marginLeft: 8 }}>{detail.aiSuggestion}</span>
            </div>
          </div>
        </div>
      </Card>

      {/* 左右分栏对比区域 */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
        {/* 左侧：新导入数据 */}
        <Card
          title={
            <Space>
              <span>📥 新导入数据</span>
              <Tag color="blue">{detail.newStage === 'mouhua' ? '谋划' : detail.newStage}</Tag>
            </Space>
          }
          size="small"
        >
          <Descriptions column={1} size="small" labelStyle={{ width: 120, color: '#595959' }}>
            {fieldComparisons.map(field => {
              const style = getStatusStyle(field.status)
              return (
                <Descriptions.Item key={field.key} label={field.label}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{
                      fontWeight: field.important ? 600 : 400,
                      color: field.status === 'same' ? '#389e0d'
                        : field.status === 'different' ? style.color : undefined,
                    }}>
                      {field.isNumber ? `${field.newValue ?? '-'} ${field.unit || ''}` : (field.newValue ?? '-')}
                    </span>
                    <Tag
                      color={field.status === 'same' ? 'success' : style.status === 'similar' ? 'gold' : 'error'}
                      style={{ margin: 0, fontSize: 11 }}
                    >
                      {style.tag}
                    </Tag>
                  </div>
                </Descriptions.Item>
              )
            })}
          </Descriptions>
        </Card>

        {/* 右侧：库中已有数据 */}
        <Card
          title={
            <Space>
              <span>📂 库中已有数据</span>
              <Tag color="green">{detail.existingStage === 'zaitan' ? '在谈' : detail.existingStage}</Tag>
              <span style={{ fontSize: 12, color: '#8c8c8c' }}>#{detail.existingProjectId}</span>
            </Space>
          }
          extra={
            <span
              style={actionLinkStyle}
              onClick={() => window.open(`${STAGE_DETAIL_PATH[detail.existingStage] || '/project/zaitan/detail/'}${detail.existingProjectId}`, '_blank')}
            >
              <EyeOutlined /> 查看详情
            </span>
          }
          size="small"
        >
          <Descriptions column={1} size="small" labelStyle={{ width: 120, color: '#595959' }}>
            {fieldComparisons.map(field => {
              const style = getStatusStyle(field.status)
              return (
                <Descriptions.Item key={field.key} label={field.label}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{
                      fontWeight: field.important ? 600 : 400,
                      color: field.status === 'same' ? '#389e0d'
                        : field.status === 'different' ? style.color : undefined,
                    }}>
                      {field.isNumber ? `${field.oldValue ?? '-'} ${field.unit || ''}` : (field.oldValue ?? '-')}
                    </span>
                    <Tag
                      color={field.status === 'same' ? 'success' : style.status === 'similar' ? 'gold' : 'error'}
                      style={{ margin: 0, fontSize: 11 }}
                    >
                      {style.tag}
                    </Tag>
                    {field.deviation && (
                      <span style={{ fontSize: 12, color: '#ff4d4f' }}>
                        ({field.deviation > 0 ? '+' : ''}{field.deviation.toFixed(1)}%)
                      </span>
                    )}
                  </div>
                </Descriptions.Item>
              )
            })}
          </Descriptions>
        </Card>
      </div>

      {/* 底部统计信息 */}
      <Divider />
      <div style={{ display: 'flex', justifyContent: 'space-between', color: '#8c8c8c', fontSize: 13 }}>
        <span>
          共比对 <strong>{comparisonStats.total}</strong> 个关键字段
        </span>
        <Space size={24}>
          <span><span style={{ color: '#52c41a' }}>●</span> 完全一致：{comparisonStats.same} 项</span>
          <span><span style={{ color: '#faad14' }}>●</span> 高度相似：{comparisonStats.similar} 项</span>
          <span><span style={{ color: '#ff4d4f' }}>●</span> 存在差异：{comparisonStats.different} 项</span>
        </Space>
      </div>
      </div>
    </div>
  )
}
