/**
 * AI 月度进展摘要弹窗（单项目）
 * - 时间口径：严格按"当前自然月"（本月）总结，不跟随统计区间。
 * - 读取项目本月进展记录，用演示模板引擎生成四段式汇报文本，支持编辑/复制/另存为进展汇报。
 */
import { useEffect, useRef, useState } from 'react'
import { Modal, Button, Space, message, Alert } from 'antd'
import { RobotOutlined, CopyOutlined, ReloadOutlined } from '@ant-design/icons'
import dayjs from 'dayjs'
import { generateSummary, monthOf, monthLabel } from '../utils/progressSummary'

export default function ProgressSummaryModal({
  open,
  onCancel,
  projectName = '',
  stageLabel = '',
  items = [],
  onSave,
}) {
  const currentYm = dayjs().format('YYYY-MM')
  const [text, setText] = useState('')
  const [loading, setLoading] = useState(false)
  const timerRef = useRef(null)

  const monthItems = items.filter((it) => monthOf(it.updateTime) === currentYm)

  useEffect(() => {
    if (open) {
      setText('')
      doGenerate()
    }
    return () => clearTimeout(timerRef.current)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  const doGenerate = () => {
    clearTimeout(timerRef.current)
    setLoading(true)
    setText('')
    // 模拟 AI 处理延迟
    timerRef.current = setTimeout(() => {
      const summary = generateSummary({ projectName, stageLabel, items: monthItems })
      setText(summary || '')
      setLoading(false)
    }, 500)
  }

  const copy = () => {
    if (!text) return
    navigator.clipboard?.writeText(text).then(
      () => message.success('摘要已复制'),
      () => message.warning('复制失败，请手动复制'),
    )
  }

  const save = () => {
    if (!text) return
    Modal.confirm({
      title: '另存为进展汇报',
      content: '将生成的 AI 月度摘要作为一条进展汇报记录保存到本项目进展列表，确认保存？',
      okText: '保存',
      cancelText: '取消',
      onOk: () => {
        onSave?.(`【AI摘要】本月进展自动总结：\n${text}`)
        message.success('已保存到进展列表')
        onCancel?.()
      },
    })
  }

  const hasData = monthItems.length > 0

  return (
    <Modal
      open={open}
      title={<Space><RobotOutlined style={{ color: '#1677ff' }} /><span>AI 月度进展摘要（{monthLabel(currentYm)}）</span></Space>}
      width={820}
      onCancel={onCancel}
      destroyOnHidden
      footer={[
        <Button key="again" icon={<ReloadOutlined />} onClick={doGenerate} disabled={!hasData}>重新生成</Button>,
        <Button key="copy" icon={<CopyOutlined />} onClick={copy} disabled={!text}>复制文本</Button>,
        onSave ? <Button key="save" type="primary" onClick={save} disabled={!text}>另存为进展汇报</Button> : null,
        <Button key="close" onClick={onCancel}>关闭</Button>,
      ].filter(Boolean)}
    >
      <div style={{ marginBottom: 12, fontSize: 13, color: '#8c8c8c' }}>
        项目：{projectName} · 当前阶段：{stageLabel || '-'} · 时间口径：本月（{monthLabel(currentYm)}）
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: '#8c8c8c' }}>
          <ReloadOutlined spin style={{ marginRight: 8 }} />AI 正在分析本月进展记录…
        </div>
      ) : !hasData ? (
        <Alert
          type="warning"
          showIcon
          message="本月暂无进展记录"
          description="项目在本月没有进展/系统节点记录，无法生成摘要。可先补录本月进展后重新生成。"
        />
      ) : !text ? (
        <Alert type="warning" showIcon message="未生成摘要，请重试" />
      ) : (
        <>
          <div style={{ fontSize: 12, color: '#bfbfbf', marginBottom: 6 }}>
            基于本月 {monthItems.length} 条进展记录自动生成（可编辑）
          </div>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={13}
            maxLength={2000}
            style={{
              width: '100%',
              border: '1px solid #d9d9d9',
              borderRadius: 6,
              padding: '10px 12px',
              fontSize: 13,
              lineHeight: 1.8,
              resize: 'vertical',
              outline: 'none',
            }}
          />
          <div style={{ textAlign: 'right', fontSize: 12, color: '#bfbfbf', marginTop: 4 }}>{text.length}/2000</div>
        </>
      )}
    </Modal>
  )
}
