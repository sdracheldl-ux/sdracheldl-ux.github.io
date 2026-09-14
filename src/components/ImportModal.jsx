import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Modal, Button, Upload, Steps, Tag, message } from 'antd'
import {
  InboxOutlined,
  DownloadOutlined,
  CheckCircleFilled,
  RightOutlined,
  ImportOutlined,
  FileExcelOutlined,
} from '@ant-design/icons'
import { buildImportResult, CONFLICT_LEVELS } from '../constants/importDemoData'
import { useViewRole, msgStore, importStore } from '../store/viewStore'

// 导入处理步骤（演示用自动推进）
const IMPORT_STEPS = [
  { title: '解析文件', description: '读取Excel工作表数据' },
  { title: '格式校验', description: '校验必填字段与数据格式' },
  { title: '判重检测', description: '执行L1-L4四级判重规则比对' },
  { title: '写入数据', description: '非重复项目入库，重复项转研判池' },
]
const STEP_MS = [600, 700, 1000, 700]

export default function ImportModal({ open, stage, stageLabel, onCancel }) {
  const navigate = useNavigate()
  const { role } = useViewRole()
  const [phase, setPhase] = useState('upload') // upload | processing | done
  const [currentStep, setCurrentStep] = useState(0)
  const [fileName, setFileName] = useState('')
  const [result, setResult] = useState(null)
  const timersRef = useRef([])

  const clearTimers = () => {
    timersRef.current.forEach(clearTimeout)
    timersRef.current = []
  }

  // 打开时重置状态
  useEffect(() => {
    if (open) {
      setPhase('upload')
      setCurrentStep(0)
      setFileName('')
      setResult(null)
      clearTimers()
    }
    return clearTimers
  }, [open])

  const handleFile = (file) => {
    if (!/\.(xlsx|xls)$/i.test(file.name)) {
      message.error('仅支持 .xlsx / .xls 格式的Excel文件')
      return false
    }
    setFileName(file.name)
    startProcessing()
    return false // 阻止真实上传
  }

  const startProcessing = () => {
    setPhase('processing')
    setCurrentStep(0)
    let acc = 0
    STEP_MS.forEach((ms, i) => {
      acc += ms
      timersRef.current.push(setTimeout(() => setCurrentStep(i + 1), acc))
    })
    timersRef.current.push(setTimeout(finishImport, acc + 400))
  }

  const finishImport = () => {
    const importUser = `${role.deptName}-${role.userName}`
    const res = buildImportResult({ stage, stageLabel, importUser, importSource: role.deptName })
    // 注入全局store：成功项目进阶段列表、冲突记录进研判池
    importStore.setImported(res)
    // 消息中心通知导入人
    const levelText = Object.entries(res.summary.levelCount).map(([lv, n]) => `${lv}×${n}`).join('、')
    msgStore.addMessage({
      toDeptKey: role.deptKey,
      title: '【导入判重提醒】',
      content: `您导入的「${fileName || '项目清单'}」已处理完成：成功入库 ${res.summary.success} 条，疑似重复 ${res.summary.duplicate} 条已转入研判池（${levelText}），跳过 ${res.summary.skipped} 条。请前往"项目重复研判"查看比对详情。`,
      type: 'import',
      link: '/project/yanpan',
    })
    setResult(res)
    setPhase('done')
  }

  const goToYanpan = (detailId) => {
    onCancel()
    navigate(detailId ? `/project/yanpan/detail/${detailId}` : '/project/yanpan')
  }

  const levelTag = (lv) => {
    const cfg = CONFLICT_LEVELS[lv]
    return <Tag color={cfg.color} style={{ margin: 0 }}>{cfg.label}</Tag>
  }

  // ===== 各阶段内容 =====
  const renderUpload = () => (
    <div>
      <Upload.Dragger
        accept=".xlsx,.xls"
        showUploadList={false}
        multiple={false}
        beforeUpload={handleFile}
      >
        <p className="ant-upload-drag-icon"><InboxOutlined /></p>
        <p className="ant-upload-text">点击或拖拽Excel文件到此处上传</p>
        <p className="ant-upload-hint">支持 .xlsx / .xls 格式，单次最多导入500条</p>
      </Upload.Dragger>
      <div style={{ marginTop: 12, textAlign: 'center' }}>
        <Button type="link" icon={<DownloadOutlined />} onClick={() => message.info('模板下载（demo示意）')}>
          下载导入模板
        </Button>
      </div>
      <div style={{
        marginTop: 16, padding: '8px 12px', background: '#f6f8fa',
        borderRadius: 4, fontSize: 12, color: '#8c8c8c', textAlign: 'center',
      }}>
        数据将导入至「{stageLabel}」阶段列表，导入时自动执行判重检测
      </div>
    </div>
  )

  const renderProcessing = () => (
    <div style={{ padding: '16px 8px 8px' }}>
      <div style={{ marginBottom: 20, textAlign: 'center', fontSize: 13, color: '#595959' }}>
        <FileExcelOutlined style={{ color: '#52c41a', marginRight: 6 }} />
        {fileName} · 正在处理，请勿关闭窗口
      </div>
      <Steps
        direction="vertical"
        size="small"
        current={Math.min(currentStep, IMPORT_STEPS.length - 1)}
        items={IMPORT_STEPS.map((s, i) => ({
          ...s,
          status: i < currentStep ? 'finish' : i === currentStep ? 'process' : 'wait',
        }))}
      />
    </div>
  )

  const renderDone = () => {
    const { summary, conflicts, skipped } = result
    const levelText = Object.entries(summary.levelCount).map(([lv, n]) => `${lv}×${n}`).join('、')
    return (
      <div>
        {/* 结果标题 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
          <CheckCircleFilled style={{ fontSize: 22, color: '#52c41a' }} />
          <span style={{ fontSize: 16, fontWeight: 600 }}>导入完成</span>
          <span style={{ fontSize: 12, color: '#bfbfbf' }}>{fileName} · {result.importTime}</span>
        </div>

        {/* 统计卡片 */}
        <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
          <div style={{ flex: 1, padding: '12px 16px', background: '#f6ffed', borderRadius: 6, borderLeft: '4px solid #52c41a' }}>
            <div style={{ fontSize: 12, color: '#8c8c8c' }}>成功入库</div>
            <div style={{ fontSize: 22, fontWeight: 600, color: '#52c41a' }}>{summary.success}<span style={{ fontSize: 12, fontWeight: 400 }}> 条</span></div>
          </div>
          <div style={{ flex: 1, padding: '12px 16px', background: '#fff7e6', borderRadius: 6, borderLeft: '4px solid #fa8c16' }}>
            <div style={{ fontSize: 12, color: '#8c8c8c' }}>疑似重复 · 已转研判池</div>
            <div style={{ fontSize: 22, fontWeight: 600, color: '#fa8c16' }}>
              {summary.duplicate}<span style={{ fontSize: 12, fontWeight: 400 }}> 条</span>
              <span style={{ fontSize: 12, fontWeight: 400, color: '#8c8c8c', marginLeft: 6 }}>{levelText}</span>
            </div>
          </div>
          <div style={{ flex: 1, padding: '12px 16px', background: '#fafafa', borderRadius: 6, borderLeft: '4px solid #bfbfbf' }}>
            <div style={{ fontSize: 12, color: '#8c8c8c' }}>跳过（格式错误）</div>
            <div style={{ fontSize: 22, fontWeight: 600, color: '#8c8c8c' }}>{summary.skipped}<span style={{ fontSize: 12, fontWeight: 400 }}> 条</span></div>
          </div>
        </div>

        {/* 疑似重复明细 */}
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: '#262626', marginBottom: 8 }}>
            疑似重复明细
            <span style={{ fontWeight: 400, color: '#8c8c8c', marginLeft: 8 }}>已转入研判池待人工决策，点击可查看比对详情</span>
          </div>
          {conflicts.map(c => (
            <div
              key={c.id}
              style={{
                display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap',
                padding: '8px 12px', background: '#fafafa',
                border: '1px solid #f0f0f0', borderRadius: 4, marginBottom: 6,
                cursor: 'pointer', transition: 'all 0.2s',
              }}
              onClick={() => goToYanpan(c.id)}
              onMouseEnter={(e) => e.currentTarget.style.borderColor = '#1677ff'}
              onMouseLeave={(e) => e.currentTarget.style.borderColor = '#f0f0f0'}
            >
              {levelTag(c.conflictLevel)}
              <span style={{ fontWeight: 500 }}>{c.newProjectName}</span>
              <RightOutlined style={{ fontSize: 11, color: '#bfbfbf' }} />
              <span style={{ color: '#595959' }}>命中：{c.existingProjectName}</span>
              <span style={{ fontSize: 12, color: '#bfbfbf' }}>（{c.existingStage}）</span>
            </div>
          ))}
        </div>

        {/* 跳过明细 */}
        <div>
          <div style={{ fontSize: 13, fontWeight: 600, color: '#262626', marginBottom: 8 }}>跳过明细</div>
          {skipped.map(s => (
            <div key={s.row} style={{ padding: '6px 12px', background: '#fafafa', border: '1px solid #f0f0f0', borderRadius: 4, fontSize: 13, color: '#8c8c8c' }}>
              第{s.row}行 · {s.reason}
            </div>
          ))}
        </div>
      </div>
    )
  }

  // ===== 底部按钮 =====
  const renderFooter = () => {
    if (phase === 'upload') return [<Button key="cancel" onClick={onCancel}>取消</Button>]
    if (phase === 'processing') return null
    return [
      <Button key="done" onClick={onCancel}>完成</Button>,
      result && result.summary.duplicate > 0 && (
        <Button key="go" type="primary" icon={<RightOutlined />} onClick={() => goToYanpan()}>
          去研判池处理
        </Button>
      ),
    ].filter(Boolean)
  }

  return (
    <Modal
      open={open}
      title={<span><ImportOutlined style={{ color: '#1677ff', marginRight: 8 }} />导入{stageLabel}项目</span>}
      width={640}
      footer={renderFooter()}
      maskClosable={phase !== 'processing'}
      keyboard={phase !== 'processing'}
      closable={phase !== 'processing'}
      onCancel={() => { if (phase !== 'processing') onCancel() }}
      destroyOnClose
    >
      {phase === 'upload' && renderUpload()}
      {phase === 'processing' && renderProcessing()}
      {phase === 'done' && renderDone()}
    </Modal>
  )
}
