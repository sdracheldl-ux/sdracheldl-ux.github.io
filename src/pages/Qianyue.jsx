import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Space, Tooltip, Divider, Dropdown, Modal, Form, Input, message, Tag } from 'antd'
import {
  EyeOutlined,
  FileTextOutlined,
  EditOutlined,
  ExportOutlined,
  MoreOutlined,
  PauseCircleOutlined,
  ExclamationCircleOutlined,
} from '@ant-design/icons'
import GenericProjectList from '../components/GenericProjectList'
import QianyueEditModal from '../components/QianyueEditModal'
import ZhuanLuodiModal from '../components/ZhuanLuodiModal'
import ImportModal from '../components/ImportModal'
import mockData from '../mock/data.json'
import {
  RESPONSIBLE_UNIT_SELECT_GROUPS,
  RESPONSIBLE_UNIT_OPTIONS,
  normalizeResponsibleUnits,
  CITY_CODE_SEEDS,
  DISTRICT_CODE_SEEDS,
} from '../constants/projectEnums'
import { useViewRole, useImported, msgStore, tuikuAuditStore, useTuikuAuditStore } from '../store/viewStore'
import {
  COLORS,
  actionLinkStyle,
  actionLinkPrimaryStyle,
  emptyTag,
  progressModalProps,
  progressContentFieldProps,
  progressTextAreaProps,
} from '../constants/uiStyles'

const unitTagStyle = { background: '#e6f4ff', color: '#1677ff', border: '1px solid #91caff', margin: 0 }

// 责任单位渲染：空显示 '-'，最多显示3个Tag，超出 +N
function renderUnits(v) {
  const list = normalizeResponsibleUnits(v)
  if (list.length === 0) return <span style={{ color: '#bfbfbf' }}>-</span>
  const shown = list.slice(0, 3)
  const rest = list.length - shown.length
  return (
    <Space size={4} wrap>
      {shown.map((u) => <Tag key={u} style={unitTagStyle}>{u}</Tag>)}
      {rest > 0 && <Tag style={unitTagStyle}>+{rest}</Tag>}
    </Space>
  )
}

// 行数据责任单位：有值用原值；无值给默认种子（避免改 data.json）
function seedResponsibleUnits(v, idx) {
  const arr = normalizeResponsibleUnits(v === '-' ? '' : v)
  return arr.length ? arr : [RESPONSIBLE_UNIT_OPTIONS[idx % RESPONSIBLE_UNIT_OPTIONS.length]]
}

export default function Qianyue() {
  const navigate = useNavigate()
  const { isSponsor } = useViewRole()
  const [editVisible, setEditVisible] = useState(false)
  const [currentProject, setCurrentProject] = useState(null)
  const [progressVisible, setProgressVisible] = useState(false)
  const [progressLoading, setProgressLoading] = useState(false)
  const [progressProject, setProgressProject] = useState(null)
  const [progressForm] = Form.useForm()
  const [luodiVisible, setLuodiVisible] = useState(false)
  const [luodiProject, setLuodiProject] = useState(null)
  const [importVisible, setImportVisible] = useState(false)
  const imported = useImported()
  // 退库申请（需投促局审核）
  const audits = useTuikuAuditStore()
  const { role } = useViewRole()
  const [tuikuVisible, setTuikuVisible] = useState(false)
  const [tuikuRecord, setTuikuRecord] = useState(null)
  const [tuikuReason, setTuikuReason] = useState('')

  const dataList = useMemo(() => {
    // Excel导入成功的项目置顶展示；审核通过（已退库）的项目从列表移除
    const raw = [
      ...(imported?.stage === 'qianyue' ? imported.successProjects : []),
      ...mockData.qianyue,
    ].filter(item => tuikuAuditStore.getByProject(item.id)?.status !== 'approved')
    return raw.map((item, idx) => ({
      key: item.id || idx,
      index: idx + 1,
      reporter: item['申报人'] || '-',
      projectName: item['项目名称'] || '-',
      // 编码：市级项目编码（签约阶段保留）+ 区级项目编码（沿用在谈/谋划编码）
      natongProjectCode: item['市级项目编码'] || CITY_CODE_SEEDS[idx % CITY_CODE_SEEDS.length],
      districtProjectCode: item['区级项目编码'] || item['编号'] || DISTRICT_CODE_SEEDS[idx % DISTRICT_CODE_SEEDS.length],
      investAmount: item['计划投资总额(亿元)'] || item['投资金额(亿元)'] || 0,
      // 存量行种子：备案证金额/协议签订时间/协议类型（mock 无值时按行号轮转补齐）
      recordAmount: item['备案证金额(亿元)'] || [0.6, 1.2, 0.35, 2.1][idx % 4],
      fixedInvestAmount: item['固投金额(亿元)'] || 0,
      signDate: item['协议签订时间'] || ['2026-03-15', '2026-04-02', '2026-05-20', '2026-06-11'][idx % 4],
      agreementType: item['协议类型'] || ['投资协议', '框架协议', '投资协议', '补充协议'][idx % 4],
      industryCategory: item['产业类别'] || '-',
      industryType: item['行业类别（门类）'] || '-',
      domesticForeign: item['内外资'] || '-',
      responsibleUnits: seedResponsibleUnits(item['责任单位'], idx),
      _raw: item,
    }))
  }, [imported, audits])

  const handleDetail = (record) => navigate(`/project/qianyue/detail/${record.key}`)
  const handleEdit = (record) => {
    setCurrentProject(record._raw)
    setEditVisible(true)
  }
  const handleReport = (record) => {
    setProgressProject(record)
    progressForm.resetFields()
    setProgressVisible(true)
  }
  const handleProgressOk = async () => {
    try {
      await progressForm.validateFields()
      setProgressLoading(true)
      setTimeout(() => {
        setProgressLoading(false)
        message.success('进展汇报已提交（演示）')
        setProgressVisible(false)
        progressForm.resetFields()
      }, 400)
    } catch {}
  }
  const handleToLuodi = (record) => {
    Modal.confirm({
      title: '推进落地',
      content: `确定将项目「${record.projectName}」推进至落地阶段吗？需要补充落地阶段必填字段。`,
      okText: '去补充信息', cancelText: '取消',
      onOk: () => {
        setLuodiProject(record._raw)
        setLuodiVisible(true)
      },
    })
  }
  const handleLuodiOk = () => {
    message.success('已推进至落地阶段')
    setLuodiVisible(false)
    setLuodiProject(null)
    navigate('/project/luodi')
  }

  // 退库申请提交：写入审核store（驳回记录复用切回待审核）+ 通知投促局
  const handleTuikuConfirm = () => {
    const rec = tuikuRecord
    if (!rec) return
    tuikuAuditStore.addApply({
      projectId: rec.key,
      projectName: rec.projectName,
      reason: tuikuReason.trim(),
      applicantDeptKey: role.deptKey,
      applicantDeptName: `${role.deptName}-${role.userName}`,
      applyTime: new Date().toLocaleString('zh-CN', { hour12: false }).replace(/\//g, '-'),
    })
    msgStore.addMessage({
      toDeptKey: 'sponsor',
      category: 'coop',
      title: '【退库申请审核】',
      content: `"${role.deptName}"提交了"${rec.projectName}"的退库申请，请及时审核。`,
      projectId: rec.key,
      stage: 'qianyue',
      projectName: rec.projectName,
      type: 'warning',
    })
    message.success('退库申请已提交，等待投促局审核')
    setTuikuVisible(false)
    setTuikuRecord(null)
    setTuikuReason('')
  }

  const columns = useMemo(() => [
    { key: 'index', title: '序号', dataIndex: 'index', width: 55, align: 'center', fixed: 'left', required: true },
    { key: 'natongProjectCode', title: '市级项目编码', dataIndex: 'natongProjectCode', width: 145, align: 'center' },
    { key: 'districtProjectCode', title: '区级项目编码', dataIndex: 'districtProjectCode', width: 130, align: 'center' },
    {
      key: 'projectName', title: '项目名称', dataIndex: 'projectName', width: 220, ellipsis: true,
      fixed: 'left', required: true,
      render: (v, record) => (
        <Tooltip title={v}>
          <span style={{ color: COLORS.primary, cursor: 'pointer' }} onClick={() => handleDetail(record)}>{v}</span>
        </Tooltip>
      )
    },
    { key: 'domesticForeign', title: '内外资', dataIndex: 'domesticForeign', width: 70, align: 'center' },
    { key: 'industryCategory', title: '产业类别', dataIndex: 'industryCategory', width: 90, align: 'center' },
    { key: 'industryType', title: '行业类别', dataIndex: 'industryType', width: 140, ellipsis: true },
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
    { key: 'responsibleUnits', title: '责任单位', dataIndex: 'responsibleUnits', width: 170,
      render: (v) => renderUnits(v)
    },
    { key: 'reporter', title: '申报人', dataIndex: 'reporter', width: 90, align: 'center' },
    { key: 'reportTime', title: '申报时间', dataIndex: 'reportTime', width: 110, align: 'center',
      render: (_, r) => emptyTag(r._raw['申报时间'])
    },
    {
      key: 'action', title: '操作', dataIndex: 'action', width: 200, fixed: 'right', align: 'center', required: true,
      render: (_, record) => {
        // 退库审核中：锁定编辑类操作（仅保留查看+进展汇报）
        const tuikuPending = tuikuAuditStore.hasPending(record.key)
        const moreMenuItems = [
          { key: 'report', icon: <FileTextOutlined />, label: '进展汇报' },
          ...(tuikuPending ? [] : [
            { key: 'edit', icon: <EditOutlined />, label: '编辑' },
            { key: 'tuiku', icon: <PauseCircleOutlined style={{ color: '#ff4d4f' }} />, label: '标记退库', danger: true },
          ]),
        ]
        const handleMoreClick = (e) => {
          if (e.key === 'edit') handleEdit(record)
          else if (e.key === 'report') handleReport(record)
          else if (e.key === 'tuiku') { setTuikuRecord(record); setTuikuReason(''); setTuikuVisible(true) }
        }
        return (
          <Space size={0} split={<Divider type="vertical" style={{ margin: '0 8px' }} />}>
            <span style={actionLinkStyle} onClick={() => handleDetail(record)}>
              <EyeOutlined /> 详情
            </span>
            {isSponsor && (
              <>
                {!tuikuPending && (
                  <span style={actionLinkPrimaryStyle} onClick={() => handleToLuodi(record)}>
                    <ExportOutlined /> 落地
                  </span>
                )}
                <Dropdown menu={{ items: moreMenuItems, onClick: handleMoreClick }} trigger={['click']}>
                  <span style={{ color: COLORS.primary, cursor: 'pointer', fontSize: 16, padding: '0 4px' }} onClick={(e) => e.preventDefault()}>
                    <MoreOutlined />
                  </span>
                </Dropdown>
              </>
            )}
          </Space>
        )
      }
    },
  ], [isSponsor])

  const extraFilters = [
    { key: 'domesticForeign', dataIndex: 'domesticForeign', label: '内外资', type: 'select', options: [
      { label: '内资', value: '内资' },
      { label: '外资', value: '外资' },
    ]},
    { key: 'responsibleUnits', dataIndex: 'responsibleUnits', label: '责任单位', type: 'select', multiple: true, options: RESPONSIBLE_UNIT_SELECT_GROUPS },
    { key: 'agreementType', label: '协议类型', type: 'select', options: [
      { label: '投资协议', value: '投资协议' },
      { label: '框架协议', value: '框架协议' },
      { label: '补充协议', value: '补充协议' },
    ]},
  ]

  return (
    <>
      <GenericProjectList
        stage="qianyue"
        dataList={dataList}
        columns={columns}
        filters={extraFilters}
        hiddenFilters={['acceptStatus', 'auditStatus', 'warnStatus', 'enterpriseNature', 'capitalNature']}
        title="签约项目"
        canAdd={false}
        canImport={true}
        onImport={() => setImportVisible(true)}
        scrollX={2015}
      />

      {/* 导入弹窗（含判重检测） */}
      <ImportModal
        open={importVisible}
        stage="qianyue"
        stageLabel="签约"
        onCancel={() => setImportVisible(false)}
      />

      <QianyueEditModal
        open={editVisible}
        projectData={currentProject}
        onCancel={() => setEditVisible(false)}
        onOk={() => {
          message.success('签约信息已更新（演示）')
          setEditVisible(false)
        }}
      />

      {/* 签约转落地弹窗 */}
      <ZhuanLuodiModal
        open={luodiVisible}
        projectData={luodiProject}
        onCancel={() => { setLuodiVisible(false); setLuodiProject(null) }}
        onOk={handleLuodiOk}
      />

      {/* 列表页弹窗：进展汇报 */}
      <Modal
        {...progressModalProps({
          open: progressVisible,
          projectName: progressProject?.projectName,
          confirmLoading: progressLoading,
          onOk: handleProgressOk,
          onCancel: () => { setProgressVisible(false); progressForm.resetFields() },
        })}
      >
        <Form form={progressForm} layout="vertical" requiredMark style={{ marginTop: 16 }}>
          <Form.Item {...progressContentFieldProps}>
            <Input.TextArea {...progressTextAreaProps} />
          </Form.Item>
        </Form>
      </Modal>

      {/* 退库申请弹窗（提交后需投促局审核） */}
      <Modal
        title={
          <span style={{ color: '#d4380d' }}>
            <ExclamationCircleOutlined style={{ marginRight: 8 }} />
            确认退库
          </span>
        }
        open={tuikuVisible}
        onCancel={() => { setTuikuVisible(false); setTuikuRecord(null); setTuikuReason('') }}
        okText="确认退库"
        cancelText="取消"
        okButtonProps={{ danger: true }}
        onOk={handleTuikuConfirm}
      >
        <div style={{ marginBottom: 16 }}>
          确定将项目「<strong>{tuikuRecord?.projectName}</strong>」标记为退库吗？
          <div style={{
            marginTop: 8, padding: '8px 12px', fontSize: 13, borderRadius: 4,
            background: '#fff7e6', border: '1px solid #ffd591', color: '#d46b08',
          }}>
            提交后需投促局审核，审核通过后退库生效。退库审核期间项目将锁定编辑操作。
          </div>
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
    </>
  )
}
