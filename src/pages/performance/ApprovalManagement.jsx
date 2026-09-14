import { useState, useMemo } from 'react'
import {
  Card, Table, Tag, Button, Space, Segmented, Select, DatePicker,
  Modal, Descriptions, Row, Col, Badge, Popconfirm, message, Tooltip, Tabs,
  Divider, Upload, Input, Spin,
} from 'antd'
import {
  EyeOutlined, CheckOutlined, CloseOutlined, SearchOutlined,
  DownloadOutlined, FileTextOutlined, ClockCircleOutlined,
  ThunderboltOutlined, ReloadOutlined,
} from '@ant-design/icons'
import { PARKS, SOES, DEPTS, MEET_RECORDS, EVENT_RECORDS } from '../../constants/performanceData'
import { perfPageBg, perfCardStyle } from '../../constants/performanceStyles'
import { COLORS } from '../../constants/uiStyles'

/* ==================== Mock 审核数据（含详情） ==================== */

// 生成 mock 有效线索
function mockClues(seed, count) {
  const names = ['XX科技有限公司', 'YY新能源集团', 'ZZ智能制造', 'AA生物医药', 'BB半导体', 'CC新材料', 'DD数字经济', 'EE环保科技']
  return Array.from({ length: count }).map((_, i) => ({
    id: `${seed}-c${i}`,
    enterprise: names[(i + seed.length) % names.length],
    contact: `张${['伟','芳','强','丽','军'][i % 5]}总`,
    phone: `138${String(10000000 + seed.length * 1000 + i * 37).slice(-8)}`,
    industry: ['智能制造', '新能源', '生物医药', '数字经济', '新材料'][i % 5],
    level: ['A类', 'B类', 'C类'][i % 3],
    remark: i % 2 === 0 ? '意向较强，已安排下次对接' : '初步接触，待跟进',
  }))
}

function buildApprovals() {
  const result = { meet: [], event: [], soe: [], dept: [] }

  // 见商/出差审核
  MEET_RECORDS.forEach((r, i) => {
    const status = i < 2 ? '待审核' : (i < 5 ? '已审核' : '已驳回')
    result.meet.push({
      ...r,
      id: `meet-${i}`,
      type: r.type || '见商',
      category: 'park',
      submitter: ['张三', '李四', '王五', '赵六', '钱七', '孙八'][i % 6],
      submitTime: `2026-06-${20 - i} ${14 + i}:${30 + i * 5}`,
      approver: status === '待审核' ? null : '分管领导',
      approveTime: status === '待审核' ? null : `2026-06-${20 - i} ${16 + i}:00`,
      rejectReason: status === '已驳回' ? '佐证材料不完整，请补充企业名片或会议纪要' : null,
      clues: mockClues(`meet-${i}`, i % 2 === 0 ? 3 : 2),
      attachments: status !== '已驳回' ? ['会议纪要.pdf', '企业名片.jpg'] : [],
    })
  })

  // 招商活动审核
  EVENT_RECORDS.forEach((r, i) => {
    const status = i === 0 ? '待审核' : '已审核'
    result.event.push({
      ...r,
      id: `event-${i}`,
      category: 'park',
      submitter: ['张三', '李四', '王五'][i % 3],
      submitTime: `2026-06-${18 - i} 10:00`,
      approver: status === '待审核' ? null : '分管领导',
      approveTime: status === '待审核' ? null : `2026-06-${18 - i} 15:30`,
      rejectReason: null,
      clues: mockClues(`event-${i}`, i === 0 ? 5 : 4),
      attachments: ['活动方案.docx', '签到表.xlsx', '现场照片.zip'],
    })
  })

  // 国企进展审核（5种类型，含详细字段和AI总结）
  SOES.forEach((s, si) => {
    const types = ['尽调项目', '产业链引进', '品牌活动', '认缴出资', '实缴出资']
    types.forEach((type, ti) => {
      const idx = si * 5 + ti
      const status = idx < 2 ? '待审核' : (idx < 18 ? '已审核' : '已驳回')
      const projectName = `${['半导体','新能源','生物医药','智能制造','数字经济','新材料','空天科技','低碳环保'][si]}重点项目${ti + 1}`
      const detail = {
        projectName,
        projectIntro: `${s.name}围绕光电子信息主导产业布局，${projectName}聚焦核心技术研发，拟投资额约${5 + ti}亿元，项目建成后预计年产值超${3 + ti}亿元，带动就业${200 + ti * 50}人。`,
        investAmount: (5 + ti).toFixed(1),
        submitDate: `2026-06-${15 - ti}`,
      }

      // 各类型专属字段
      let extraFields = {}
      let aiSummary = ''

      if (type === '尽调项目') {
        extraFields = {
          investCompany: s.name,
          investRelation: '国企本部',
          entrustOrg: `${s.name}战略投资部`,
          materialType: '第三方尽调报告',
        }
        aiSummary = `2026年，${s.name}（国企本部）委托${s.name}战略投资部对${projectName}开展尽调。尽调范围涵盖市场规模、技术壁垒、财务状况及团队背景，累计梳理核心风险点${3 + ti}项，提出风险缓释建议${2 + ti}条，为投资决策提供依据。`
      } else if (type === '产业链引进') {
        extraFields = {
          investCompany: s.name,
          investRelation: '国企本部',
          sceneContent: `提供${['产业配套资源','应用测试场景','市场渠道对接','政策申报支持','供应链协同'][ti % 5]}等场景要素`,
          leadingUnit: `${s.name}产业发展部`,
        }
        aiSummary = `2026年，${s.name}（国企本部）引进${projectName}，为该项目提供${['产业配套资源','应用测试场景','市场渠道对接','政策申报支持','供应链协同'][ti % 5]}等要素支撑。项目主导单位为${s.name}产业发展部，预计落地后补链强链效应显著，推动产业链上下游协同发展。`
      } else if (type === '品牌活动') {
        extraFields = {
          investCompany: s.name,
          investRelation: '国企本部',
          activityName: `2026光谷${s.name.replace('集团','').replace('有限','')}产业创新大会`,
          activityDate: `2026-06-${10 + ti}`,
          activityIntro: `聚焦${['光电子信息','新能源与智能网联汽车','生命健康','数字经济','先进制造'][si % 5]}产业方向，邀请行业专家、龙头企业、投资机构共话产业发展。`,
          isHost: ti % 3 === 0 ? '主办' : '协办',
          enterpriseCount: 30 + ti * 10,
          clueCount: 8 + ti * 2,
          mediaCoverage: `新华社、湖北日报、长江日报等${5 + ti}家媒体报道`,
        }
        aiSummary = `2026年，${s.name}（国企本部）${extraFields.isHost}${extraFields.activityName}。活动聚焦${['光电子信息','新能源与智能网联汽车','生命健康','数字经济','先进制造'][si % 5]}内容，参与企业${extraFields.enterpriseCount}家，提供项目线索${extraFields.clueCount}条，新闻在新华社、湖北日报等${5 + ti}家媒体上发布，品牌影响力有效提升。`
      } else if (type === '认缴出资') {
        extraFields = {
          investCompany: `${s.name}投资有限公司`,
          investRelation: '全资子公司',
          subscribeAmount: (3 + ti).toFixed(2),
          signDate: `2026-06-${8 + ti}`,
          subscribeCompany: `${['XX产业基金','YY股权投资','ZZ创投合伙企业'][ti % 3]}`,
          subscribeTerm: `${5 + ti}年`,
        }
        aiSummary = `2026年，${s.name}投资有限公司（${s.name}全资子公司）对${projectName}认缴${extraFields.subscribeAmount}亿元。投资协议于${extraFields.signDate}签订，认缴主体为${extraFields.subscribeCompany}，认缴期限${extraFields.subscribeTerm}。`
      } else if (type === '实缴出资') {
        extraFields = {
          investCompany: `${s.name}投资有限公司`,
          investRelation: '全资子公司',
          payAmount: (2 + ti * 0.5).toFixed(2),
          signDate: `2026-05-${20 + ti}`,
          payDate: `2026-06-${5 + ti}`,
          payCompany: `${['XX产业基金','YY股权投资','ZZ创投合伙企业'][ti % 3]}`,
          payType: '现金出资',
          isMarketDecision: ti % 2 === 0 ? '是' : '否',
        }
        aiSummary = `2026年，${s.name}投资有限公司（${s.name}全资子公司）对${projectName}实缴出资${extraFields.payAmount}亿元。项目签约时间为${extraFields.signDate}，出资时间为${extraFields.payDate}，出资公司为${extraFields.payCompany}，出资类型为现金出资，${extraFields.isMarketDecision === '是' ? '属于' : '不属于'}市场自主化投资决策项目。`
      }

      result.soe.push({
        id: `soe-${idx}`,
        soeName: s.name,
        soeKey: s.key,
        type,
        title: `${type} - ${projectName}`,
        ...detail,
        ...extraFields,
        aiSummary,
        submitter: `${s.name}项目部`,
        submitTime: `2026-06-${15 - ti} 11:00`,
        approver: status === '待审核' ? null : '国资委领导',
        approveTime: status === '待审核' ? null : `2026-06-${15 - ti} 17:00`,
        status,
        rejectReason: status === '已驳回' ? '出资凭证不清晰，请补充银行回单扫描件' : null,
        attachments: [`${type}证明材料.pdf`, '佐证文件.zip'],
      })
    })
  })

  // 部门进展审核
  DEPTS.forEach((d, di) => {
    if (di > 4) return
    const status = di % 3 === 0 ? '待审核' : '已审核'
    result.dept.push({
      id: `dept-${di}`,
      deptName: d.name,
      taskName: d.targets?.[0]?.text || '重点招商任务',
      progressDesc: `${d.name}在目标任务推进中取得新进展：已对接企业 ${di + 5} 家，达成初步合作意向 ${di + 2} 家。`,
      submitter: `${d.name}联络员`,
      submitTime: `2026-06-${14 - di} 16:20`,
      approver: status === '待审核' ? null : '考核办',
      approveTime: status === '待审核' ? null : `2026-06-${14 - di} 18:00`,
      status,
      rejectReason: null,
      attachments: status !== '待审核' ? ['进展说明.docx'] : [],
    })
  })

  return result
}

const APPROVAL_DATA = buildApprovals()

/* ==================== AI 辅助总结区块（仅国企进展） ==================== */

function AISummaryBlock({ record }) {
  const summary = record?.aiSummary || ''

  // 根据类型设置不同的标签颜色
  const typeLabelMap = {
    '尽调项目': { label: '尽调总结', color: 'blue' },
    '产业链引进': { label: '产业链项目总结', color: 'geekblue' },
    '品牌活动': { label: '品牌活动总结', color: 'purple' },
    '认缴出资': { label: '认缴总结', color: 'gold' },
    '实缴出资': { label: '实缴总结', color: 'orange' },
  }

  const typeInfo = typeLabelMap[record?.type] || { label: 'AI 总结', color: 'default' }

  return (
    <>
      <Divider orientation="left" style={{ margin: '16px 0 12px' }}>
        <Space>
          <ThunderboltOutlined style={{ color: '#faad14' }} />
          <strong>AI 辅助总结</strong>
          <Tag color={typeInfo.color}>{typeInfo.label}</Tag>
        </Space>
      </Divider>
      <div style={{
        background: 'linear-gradient(135deg, #fffbe6 0%, #fff7e6 100%)',
        border: '1px solid #ffe58f',
        borderRadius: 8,
        padding: '14px 18px',
        position: 'relative',
      }}>
        <div style={{ color: '#595959', fontSize: 14, lineHeight: 1.8, textIndent: '2em' }}>
          {summary}
        </div>
        {/* 装饰角标 */}
        <div style={{
          position: 'absolute',
          top: 0,
          right: 0,
          width: 0,
          height: 0,
          borderTop: '24px solid #faad14',
          borderLeft: '24px solid transparent',
          opacity: 0.3,
        }} />
      </div>
    </>
  )
}

/* ==================== 详情弹窗 ==================== */

function ApprovalDetailModal({ open, record, type, onClose, onApprove, onReject }) {
  if (!open || !record) return null

  const isPending = record.status === '待审核'

  return (
    <Modal
      title="审核详情"
      open={open}
      onCancel={onClose}
      width={880}
      destroyOnHidden
      footer={isPending ? [
        <Button key="back" onClick={onClose}>关闭</Button>,
        <Button key="reject" danger icon={<CloseOutlined />} onClick={() => onReject?.(record)}>驳回</Button>,
        <Button key="approve" type="primary" icon={<CheckOutlined />} onClick={() => onApprove?.(record)}>
          审核通过
        </Button>,
      ] : [
        <Button key="back" onClick={onClose}>关闭</Button>,
      ]}
    >
      {/* 基本信息 */}
      <div style={{ marginBottom: 16 }}>
        <Space style={{ marginBottom: 8 }}>
          <Tag color={record.status === '已审核' ? 'success' : record.status === '待审核' ? 'processing' : 'error'} style={{ fontSize: 14, padding: '2px 10px' }}>
            {record.status}
          </Tag>
          {type === 'meet' && <Tag color="blue">{record.type || '见商'}</Tag>}
          {type === 'event' && <Tag color="purple">招商活动</Tag>}
          {type === 'soe' && <Tag color="purple">{record.type}</Tag>}
          {type === 'dept' && <Tag color="cyan">部门进展</Tag>}
        </Space>
      </div>

      {type === 'meet' && (
        <Descriptions bordered size="small" column={2} style={{ marginBottom: 16 }}>
          <Descriptions.Item label="日期" span={1}>{record.date}</Descriptions.Item>
          <Descriptions.Item label="层级" span={1}>{record.level}</Descriptions.Item>
          <Descriptions.Item label="城市" span={1}>{record.city}</Descriptions.Item>
          <Descriptions.Item label="企业名称" span={1}>{record.enterprise}</Descriptions.Item>
          <Descriptions.Item label="类型" span={1}>{record.type}</Descriptions.Item>
          <Descriptions.Item label="责任部门" span={1}>{record.dept}</Descriptions.Item>
          <Descriptions.Item label="洽谈内容" span={2}>{record.content}</Descriptions.Item>
          <Descriptions.Item label="成果" span={2}>{record.result}</Descriptions.Item>
        </Descriptions>
      )}

      {type === 'event' && (
        <Descriptions bordered size="small" column={2} style={{ marginBottom: 16 }}>
          <Descriptions.Item label="活动名称" span={2}>{record.name}</Descriptions.Item>
          <Descriptions.Item label="日期" span={1}>{record.date}</Descriptions.Item>
          <Descriptions.Item label="地点" span={1}>{record.location}</Descriptions.Item>
          <Descriptions.Item label="参与企业" span={1}>{record.enterpriseCount} 家</Descriptions.Item>
          <Descriptions.Item label="获取线索" span={1}>{record.clueCount} 条</Descriptions.Item>
          <Descriptions.Item label="是否重点" span={2}>{record.isKey ? '是（重点活动）' : '否'}</Descriptions.Item>
        </Descriptions>
      )}

      {type === 'soe' && (
        <>
          <Descriptions bordered size="small" column={2} style={{ marginBottom: 16 }}>
            <Descriptions.Item label="国有企业" span={1}>{record.soeName}</Descriptions.Item>
            <Descriptions.Item label="类型" span={1}><Tag color="purple">{record.type}</Tag></Descriptions.Item>
            <Descriptions.Item label="项目名称" span={2}>{record.projectName}</Descriptions.Item>
            <Descriptions.Item label="报送时间" span={1}>{record.submitDate}</Descriptions.Item>
            <Descriptions.Item label="投资额（亿元）" span={1}>{record.investAmount}</Descriptions.Item>
            <Descriptions.Item label="项目简介" span={2}>{record.projectIntro}</Descriptions.Item>

            {/* 尽调项目专属字段 */}
            {record.type === '尽调项目' && (
              <>
                <Descriptions.Item label="出资公司" span={1}>
                  {record.investCompany}
                  {record.investRelation !== '国企本部' && <span style={{ color: '#8c8c8c', fontSize: 12, marginLeft: 4 }}>（{record.investRelation}）</span>}
                </Descriptions.Item>
                <Descriptions.Item label="委托机构" span={1}>{record.entrustOrg}</Descriptions.Item>
                <Descriptions.Item label="资料类型" span={2}>{record.materialType}</Descriptions.Item>
              </>
            )}

            {/* 产业链引进专属字段 */}
            {record.type === '产业链引进' && (
              <>
                <Descriptions.Item label="出资公司" span={1}>
                  {record.investCompany}
                  {record.investRelation !== '国企本部' && <span style={{ color: '#8c8c8c', fontSize: 12, marginLeft: 4 }}>（{record.investRelation}）</span>}
                </Descriptions.Item>
                <Descriptions.Item label="项目主导单位" span={1}>{record.leadingUnit}</Descriptions.Item>
                <Descriptions.Item label="提供场景内容" span={2}>{record.sceneContent}</Descriptions.Item>
              </>
            )}

            {/* 品牌活动专属字段 */}
            {record.type === '品牌活动' && (
              <>
                <Descriptions.Item label="出资公司" span={1}>
                  {record.investCompany}
                  {record.investRelation !== '国企本部' && <span style={{ color: '#8c8c8c', fontSize: 12, marginLeft: 4 }}>（{record.investRelation}）</span>}
                </Descriptions.Item>
                <Descriptions.Item label="主办/协办" span={1}>{record.isHost}</Descriptions.Item>
                <Descriptions.Item label="活动名称" span={2}>{record.activityName}</Descriptions.Item>
                <Descriptions.Item label="活动时间" span={1}>{record.activityDate}</Descriptions.Item>
                <Descriptions.Item label="对接企业数（家）" span={1}>{record.enterpriseCount}</Descriptions.Item>
                <Descriptions.Item label="获取有效线索（条）" span={1}>{record.clueCount}</Descriptions.Item>
                <Descriptions.Item label="媒体报道" span={1}>{record.mediaCoverage}</Descriptions.Item>
                <Descriptions.Item label="活动简介" span={2}>{record.activityIntro}</Descriptions.Item>
              </>
            )}

            {/* 认缴出资专属字段 */}
            {record.type === '认缴出资' && (
              <>
                <Descriptions.Item label="出资公司" span={1}>
                  {record.investCompany}
                  {record.investRelation !== '国企本部' && <span style={{ color: '#8c8c8c', fontSize: 12, marginLeft: 4 }}>（{record.investRelation}）</span>}
                </Descriptions.Item>
                <Descriptions.Item label="认缴公司" span={1}>{record.subscribeCompany}</Descriptions.Item>
                <Descriptions.Item label="认缴金额（亿元）" span={1}>{record.subscribeAmount}</Descriptions.Item>
                <Descriptions.Item label="认缴期限" span={1}>{record.subscribeTerm}</Descriptions.Item>
                <Descriptions.Item label="投资协议签订时间" span={2}>{record.signDate}</Descriptions.Item>
              </>
            )}

            {/* 实缴出资专属字段 */}
            {record.type === '实缴出资' && (
              <>
                <Descriptions.Item label="出资公司" span={1}>
                  {record.investCompany}
                  {record.investRelation !== '国企本部' && <span style={{ color: '#8c8c8c', fontSize: 12, marginLeft: 4 }}>（{record.investRelation}）</span>}
                </Descriptions.Item>
                <Descriptions.Item label="实缴公司" span={1}>{record.payCompany}</Descriptions.Item>
                <Descriptions.Item label="出资金额（亿元）" span={1}>{record.payAmount}</Descriptions.Item>
                <Descriptions.Item label="出资类型" span={1}>{record.payType}</Descriptions.Item>
                <Descriptions.Item label="项目签约时间" span={1}>{record.signDate}</Descriptions.Item>
                <Descriptions.Item label="出资时间" span={1}>{record.payDate}</Descriptions.Item>
                <Descriptions.Item label="市场自主化投资决策" span={2}>{record.isMarketDecision}</Descriptions.Item>
              </>
            )}
          </Descriptions>
        </>
      )}

      {type === 'dept' && (
        <Descriptions bordered size="small" column={2} style={{ marginBottom: 16 }}>
          <Descriptions.Item label="部门" span={2}>{record.deptName}</Descriptions.Item>
          <Descriptions.Item label="对应任务" span={2}>{record.taskName}</Descriptions.Item>
          <Descriptions.Item label="进展描述" span={2}>{record.progressDesc}</Descriptions.Item>
        </Descriptions>
      )}

      {/* 有效线索 */}
      {(type === 'meet' || type === 'event') && record.clues?.length > 0 && (
        <>
          <Divider orientation="left" style={{ margin: '8px 0 12px' }}>
            <Space>
              <FileTextOutlined style={{ color: COLORS.primary }} />
              <strong>有效线索</strong>
              <Tag color="blue">{record.clues.length} 条</Tag>
            </Space>
          </Divider>
          <Table
            size="small"
            pagination={false}
            dataSource={record.clues}
            rowKey="id"
            columns={[
              { title: '序号', width: 50, align: 'center', render: (_, __, i) => i + 1 },
              { title: '企业名称', dataIndex: 'enterprise' },
              { title: '联系人', dataIndex: 'contact', width: 100 },
              { title: '电话', dataIndex: 'phone', width: 120 },
              { title: '行业', dataIndex: 'industry', width: 100 },
              { title: '级别', dataIndex: 'level', width: 70, align: 'center',
                render: v => <Tag color={v === 'A类' ? 'red' : v === 'B类' ? 'orange' : 'default'}>{v}</Tag> },
              { title: '备注', dataIndex: 'remark', ellipsis: true },
            ]}
          />
        </>
      )}

      {/* 附件 */}
      {record.attachments?.length > 0 && (
        <>
          <Divider orientation="left" style={{ margin: '16px 0 12px' }}>
            <Space>
              <FileTextOutlined style={{ color: '#52c41a' }} />
              <strong>佐证材料</strong>
              <Tag>{record.attachments.length} 个</Tag>
            </Space>
          </Divider>
          <Space wrap>
            {record.attachments.map((f, i) => (
              <Button key={i} type="link" icon={<FileTextOutlined />} style={{ padding: 0 }}>{f}</Button>
            ))}
          </Space>
        </>
      )}

      {/* AI 辅助总结（仅国企进展有） */}
      {type === 'soe' && (
        <AISummaryBlock record={record} />
      )}

      {/* 驳回原因 */}
      {record.status === '已驳回' && record.rejectReason && (
        <div style={{ marginTop: 16, padding: '10px 14px', background: '#fff2f0', border: '1px solid #ffccc7', borderRadius: 4 }}>
          <div style={{ color: '#ff4d4f', fontWeight: 600, marginBottom: 4 }}>驳回原因</div>
          <div style={{ color: '#8b0000', fontSize: 13 }}>{record.rejectReason}</div>
        </div>
      )}

      {/* 审核信息 */}
      <Divider orientation="left" style={{ margin: '16px 0 12px' }}>
        <Space><ClockCircleOutlined style={{ color: '#8c8c8c' }} /><strong>流程信息</strong></Space>
      </Divider>
      <Descriptions size="small" column={2}>
        <Descriptions.Item label="提交人" span={1}>{record.submitter}</Descriptions.Item>
        <Descriptions.Item label="提交时间" span={1}>{record.submitTime}</Descriptions.Item>
        {record.approver && <Descriptions.Item label="审核人" span={1}>{record.approver}</Descriptions.Item>}
        {record.approveTime && <Descriptions.Item label="审核时间" span={1}>{record.approveTime}</Descriptions.Item>}
      </Descriptions>
    </Modal>
  )
}

/* ==================== 列表配置 ==================== */

function useList(type, statusFilter) {
  const allData = APPROVAL_DATA[type] || []
  const list = statusFilter === 'all' ? allData : allData.filter(i => i.status === statusFilter)
  const pendingCount = allData.filter(i => i.status === '待审核').length
  return { list, pendingCount, total: allData.length }
}

/* ==================== 主页面 ==================== */

export default function ApprovalManagement() {
  const [type, setType] = useState('event')   // event | soe | dept
  const [status, setStatus] = useState('pending')
  const [detailOpen, setDetailOpen] = useState(false)
  const [detailRecord, setDetailRecord] = useState(null)
  const [rejectOpen, setRejectOpen] = useState(false)
  const [rejectRecord, setRejectRecord] = useState(null)
  const [rejectReason, setRejectReason] = useState('')

  const openReject = (record) => {
    setRejectRecord(record)
    setRejectReason('')
    setRejectOpen(true)
  }

  const handleRejectSubmit = () => {
    if (!rejectReason.trim()) {
      message.warning('请填写驳回原因')
      return
    }
    message.success('已驳回，已通知提交人')
    setRejectOpen(false)
  }

  const { list, pendingCount, total } = useList(type, status === 'pending' ? '待审核' : status === 'approved' ? '已审核' : status === 'rejected' ? '已驳回' : 'all')

  const handleView = (record) => {
    setDetailRecord(record)
    setDetailOpen(true)
  }

  const handleApprove = () => {
    message.success('审核通过，数据已计入考核')
    setDetailOpen(false)
  }

  const handleReject = () => {
    message.success('已驳回，已通知提交人')
    setDetailOpen(false)
  }

  /* ----- 列配置 ----- */

  const meetColumns = [
    { title: '序号', width: 50, align: 'center', render: (_, __, idx) => idx + 1 },
    { title: '日期', dataIndex: 'date', width: 110, align: 'center' },
    { title: '层级', dataIndex: 'level', width: 100, align: 'center', render: v => <Tag>{v}</Tag> },
    { title: '企业/城市', dataIndex: 'enterprise', ellipsis: true,
      render: (v, r) => <Tooltip title={v}><div>{v}<div style={{ fontSize: 11, color: '#8c8c8c' }}>{r.city}</div></div></Tooltip> },
    { title: '类型', dataIndex: 'type', width: 80, align: 'center', render: v => <Tag color="blue">{v}</Tag> },
    { title: '有效线索', dataIndex: 'clues', width: 90, align: 'center',
      render: v => <Tag color="green">{v?.length || 0} 条</Tag> },
    { title: '提交人', dataIndex: 'submitter', width: 90, align: 'center' },
    { title: '提交时间', dataIndex: 'submitTime', width: 150, align: 'center' },
    { title: '状态', dataIndex: 'status', width: 90, align: 'center',
      render: v => {
        const map = { 已审核: 'success', 待审核: 'processing', 已驳回: 'error' }
        return <Tag color={map[v] || 'default'}>{v}</Tag>
      },
    },
    { title: '操作', key: 'action', width: 120, align: 'center', fixed: 'right',
      render: (_, record) => (
        <Space>
          <Button type="link" size="small" icon={<EyeOutlined />} onClick={() => handleView(record)}>查看</Button>
          {record.status === '待审核' && (
            <>
              <Popconfirm title="确认通过？" onConfirm={() => message.success('审核通过')}>
                <Button type="link" size="small" style={{ color: '#52c41a' }}>通过</Button>
              </Popconfirm>
              <Button type="link" size="small" danger onClick={() => openReject(record)}>驳回</Button>
            </>
          )}
        </Space>
      ),
    },
  ]

  const eventColumns = [
    { title: '序号', width: 50, align: 'center', render: (_, __, idx) => idx + 1 },
    { title: '活动名称', dataIndex: 'name', ellipsis: true, render: v => <Tooltip title={v}>{v}</Tooltip> },
    { title: '日期', dataIndex: 'date', width: 110, align: 'center' },
    { title: '地点', dataIndex: 'location', width: 80, align: 'center' },
    { title: '参与企业', dataIndex: 'enterpriseCount', width: 90, align: 'center', render: v => `${v}家` },
    { title: '有效线索', dataIndex: 'clues', width: 90, align: 'center',
      render: v => <Tag color="green">{v?.length || 0} 条</Tag> },
    { title: '提交人', dataIndex: 'submitter', width: 90, align: 'center' },
    { title: '状态', dataIndex: 'status', width: 90, align: 'center',
      render: v => <Tag color={v === '已审核' ? 'success' : v === '待审核' ? 'processing' : 'error'}>{v}</Tag> },
    { title: '操作', key: 'action', width: 120, align: 'center', fixed: 'right',
      render: (_, record) => (
        <Space>
          <Button type="link" size="small" icon={<EyeOutlined />} onClick={() => handleView(record)}>查看</Button>
          {record.status === '待审核' && (
            <>
              <Popconfirm title="确认通过？" onConfirm={() => message.success('审核通过')}>
                <Button type="link" size="small" style={{ color: '#52c41a' }}>通过</Button>
              </Popconfirm>
              <Button type="link" size="small" danger onClick={() => openReject(record)}>驳回</Button>
            </>
          )}
        </Space>
      ),
    },
  ]

  const soeColumns = [
    { title: '序号', width: 50, align: 'center', render: (_, __, idx) => idx + 1 },
    { title: '国企', dataIndex: 'soeName', width: 130, render: v => <strong>{v}</strong> },
    { title: '类型', dataIndex: 'type', width: 130, render: v => <Tag color="purple">{v}</Tag> },
    { title: '标题', dataIndex: 'title', ellipsis: true },
    { title: '提交人', dataIndex: 'submitter', width: 120 },
    { title: '提交时间', dataIndex: 'submitTime', width: 150, align: 'center' },
    { title: '状态', dataIndex: 'status', width: 90, align: 'center',
      render: v => <Tag color={v === '已审核' ? 'success' : v === '待审核' ? 'processing' : 'error'}>{v}</Tag> },
    { title: '操作', key: 'action', width: 120, align: 'center', fixed: 'right',
      render: (_, record) => (
        <Space>
          <Button type="link" size="small" icon={<EyeOutlined />} onClick={() => handleView(record)}>查看</Button>
          {record.status === '待审核' && (
            <>
              <Popconfirm title="确认通过？" onConfirm={() => message.success('审核通过')}>
                <Button type="link" size="small" style={{ color: '#52c41a' }}>通过</Button>
              </Popconfirm>
              <Button type="link" size="small" danger onClick={() => openReject(record)}>驳回</Button>
            </>
          )}
        </Space>
      ),
    },
  ]

  const deptColumns = [
    { title: '序号', width: 50, align: 'center', render: (_, __, idx) => idx + 1 },
    { title: '部门', dataIndex: 'deptName', width: 110, render: v => <strong>{v}</strong> },
    { title: '对应任务', dataIndex: 'taskName', ellipsis: true },
    { title: '进展描述', dataIndex: 'progressDesc', ellipsis: true },
    { title: '提交人', dataIndex: 'submitter', width: 120 },
    { title: '提交时间', dataIndex: 'submitTime', width: 150, align: 'center' },
    { title: '状态', dataIndex: 'status', width: 90, align: 'center',
      render: v => <Tag color={v === '已审核' ? 'success' : v === '待审核' ? 'processing' : 'error'}>{v}</Tag> },
    { title: '操作', key: 'action', width: 120, align: 'center', fixed: 'right',
      render: (_, record) => (
        <Space>
          <Button type="link" size="small" icon={<EyeOutlined />} onClick={() => handleView(record)}>查看</Button>
          {record.status === '待审核' && (
            <>
              <Popconfirm title="确认通过？" onConfirm={() => message.success('审核通过')}>
                <Button type="link" size="small" style={{ color: '#52c41a' }}>通过</Button>
              </Popconfirm>
              <Button type="link" size="small" danger onClick={() => openReject(record)}>驳回</Button>
            </>
          )}
        </Space>
      ),
    },
  ]

  const columnMap = { event: eventColumns, soe: soeColumns, dept: deptColumns }

  const tabItems = [
    { key: 'event', label: '招商活动审核' },
    { key: 'soe', label: '国企进展审核' },
    { key: 'dept', label: '部门进展审核' },
  ]

  return (
    <div style={perfPageBg}>
      {/* 标题栏 */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div>
          <h2 style={{ margin: '0 0 4px', fontSize: 22, fontWeight: 700, color: '#262626' }}>审核管理</h2>
          <div style={{ fontSize: 13, color: '#8c8c8c' }}>所有填报记录需经审核通过后方计入考核数据</div>
        </div>
        <Space>
          <DatePicker.RangePicker size="small" />
          <Button size="small" icon={<DownloadOutlined />}>导出</Button>
        </Space>
      </div>

      <Card style={perfCardStyle} bodyStyle={{ padding: '12px 20px 20px' }}>
        {/* Tabs */}
        <Tabs
          activeKey={type}
          onChange={setType}
          items={tabItems.map(t => ({
            key: t.key,
            label: t.label,
          }))}
          size="large"
          style={{ marginBottom: 8 }}
        />

        {/* 状态栏 */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <Segmented value={status} onChange={setStatus} size="small">
            <Segmented.Option value="pending">待审核 ({pendingCount})</Segmented.Option>
            <Segmented.Option value="approved">已通过</Segmented.Option>
            <Segmented.Option value="rejected">已驳回</Segmented.Option>
            <Segmented.Option value="all">全部 ({total})</Segmented.Option>
          </Segmented>
          <Space>
            <Select placeholder="按提交人筛选" allowClear style={{ width: 130 }} options={['张三', '李四', '王五'].map(o => ({ value: o, label: o }))} />
          </Space>
        </div>

        {/* 表格 */}
        <Table
          columns={columnMap[type]}
          dataSource={list}
          rowKey="id"
          size="small"
          scroll={{ x: 1000 }}
          pagination={{ pageSize: 10, showTotal: t => `共 ${t} 条` }}
        />
      </Card>

      {/* 详情弹窗 */}
      <ApprovalDetailModal
        open={detailOpen}
        record={detailRecord}
        type={type}
        onClose={() => setDetailOpen(false)}
        onApprove={handleApprove}
        onReject={() => { setDetailOpen(false); openReject(detailRecord) }}
      />

      {/* 驳回原因弹窗 */}
      <Modal
        title="驳回审核"
        open={rejectOpen}
        onCancel={() => setRejectOpen(false)}
        onOk={handleRejectSubmit}
        okText="确认驳回"
        okButtonProps={{ danger: true }}
        cancelText="取消"
        destroyOnHidden
        width={480}
      >
        <div style={{ marginBottom: 12, color: '#595959', fontSize: 13 }}>
          请填写驳回原因，提交后将通知提交人进行修改。
        </div>
        <Input.TextArea
          value={rejectReason}
          onChange={e => setRejectReason(e.target.value)}
          placeholder="请输入驳回原因..."
          rows={5}
          maxLength={200}
          showCount
        />
      </Modal>
    </div>
  )
}
