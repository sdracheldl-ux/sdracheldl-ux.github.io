import { useState } from 'react'
import { Modal, Form, DatePicker, Button, message, Space } from 'antd'
import { CheckCircleOutlined } from '@ant-design/icons'
import DecisionFlow, { getDecisionNodes } from './DecisionFlow'

function formatDate(d) {
  if (!d) return ''
  const date = d instanceof Date ? d : new Date(d)
  const pad = (n) => String(n).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}

// 根据已通过节点构建节点列表状态
function buildNodes(baseNodes, passedNodes) {
  let currentFound = false
  return baseNodes.map(n => {
    const passedDate = passedNodes[n.key]
    if (passedDate) return { ...n, status: 'passed', date: passedDate }
    if (!currentFound) { currentFound = true; return { ...n, status: 'current' } }
    return { ...n, status: 'pending' }
  })
}

export default function UpdateDecisionModal({
  open,
  onCancel,
  onOk,
  projectCategory,
  investAmount,
  initialPassedNodes = {},
}) {
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)
  const [passedNodes, setPassedNodes] = useState(initialPassedNodes)
  const [pickingKey, setPickingKey] = useState(null)
  // 收集本次操作的变更日志： [{ action: 'pass'|'undo', label, date }]
  const [changes, setChanges] = useState([])

  // 每次open时重置内部状态
  const resetOnClose = () => {
    setPassedNodes(initialPassedNodes)
    setPickingKey(null)
    setChanges([])
    form.resetFields()
  }

  const baseNodes = getDecisionNodes(projectCategory, investAmount) || []
  const displayNodes = buildNodes(baseNodes, passedNodes)
  const currentNode = displayNodes.find(n => n.status === 'current')

  const handleMarkPass = () => {
    if (!currentNode) return
    setPickingKey(currentNode.key)
    form.setFieldsValue({ passDate: null })
  }

  const handleConfirmDate = async () => {
    try {
      const values = await form.validateFields()
      const dateStr = formatDate(values.passDate)
      const label = currentNode.label
      setPassedNodes(prev => ({ ...prev, [pickingKey]: dateStr }))
      setChanges(prev => [...prev, { action: 'pass', label, date: dateStr }])
      setPickingKey(null)
      form.resetFields()
    } catch (e) {
      // validation
    }
  }

  const handleUndoLast = () => {
    const passedKeys = baseNodes.filter(n => passedNodes[n.key]).map(n => n.key)
    if (passedKeys.length === 0) return
    const lastKey = passedKeys[passedKeys.length - 1]
    const lastLabel = baseNodes.find(n => n.key === lastKey)?.label || lastKey
    const lastDate = passedNodes[lastKey]
    const newMap = { ...passedNodes }
    delete newMap[lastKey]
    setPassedNodes(newMap)
    setChanges(prev => [...prev, { action: 'undo', label: lastLabel, date: lastDate }])
  }

  const handleOk = () => {
    setLoading(true)
    setTimeout(() => {
      message.success('决策节点已更新')
      // 将passedMap和changes都传给父组件
      onOk(passedNodes, changes)
      setLoading(false)
      resetOnClose()
    }, 300)
  }

  const handleCancel = () => {
    resetOnClose()
    onCancel()
  }

  const passedCount = Object.keys(passedNodes).length
  const allPassed = passedCount === baseNodes.length

  return (
    <Modal
      title="更新决策节点"
      open={open}
      onCancel={handleCancel}
      onOk={handleOk}
      confirmLoading={loading}
      okText="保存"
      cancelText="取消"
      width={640}
      destroyOnClose
    >
      <div style={{ padding: '8px 0' }}>
        <DecisionFlow nodes={displayNodes} />

        {allPassed ? (
          <div style={{
            textAlign: 'center',
            padding: '10px 0',
            color: '#52c41a',
            background: '#f6ffed',
            borderRadius: 4,
            border: '1px solid #b7eb8f',
            fontSize: 14,
          }}>
            <CheckCircleOutlined style={{ marginRight: 6 }} />
            所有决策节点已全部通过
          </div>
        ) : currentNode && (
          <div style={{ textAlign: 'center', padding: '10px 0' }}>
            {pickingKey ? (
              <Form form={form} layout="inline" style={{ justifyContent: 'center' }}>
                <Form.Item
                  name="passDate"
                  label={`${currentNode.label}通过日期`}
                  rules={[{ required: true, message: '请选择通过日期' }]}
                >
                  <DatePicker style={{ width: 180 }} placeholder="选择通过日期" />
                </Form.Item>
                <Form.Item>
                  <Space>
                    <Button type="primary" onClick={handleConfirmDate}>确认</Button>
                    <Button onClick={() => { setPickingKey(null); form.resetFields() }}>取消</Button>
                  </Space>
                </Form.Item>
              </Form>
            ) : (
              <Space>
                <Button type="primary" onClick={handleMarkPass}>
                  标记「{currentNode.label}」通过
                </Button>
                {passedCount > 0 && (
                  <Button onClick={handleUndoLast}>撤销上一节点</Button>
                )}
              </Space>
            )}
          </div>
        )}

        {changes.length > 0 && (
          <div style={{ marginTop: 10, padding: '8px 12px', background: '#fffbe6', border: '1px solid #ffe58f', borderRadius: 4, fontSize: 12, color: '#874d00' }}>
            本次将记录 {changes.length} 条变更到进展信息：
            <ul style={{ margin: '4px 0 0 18px', padding: 0 }}>
              {changes.map((c, i) => (
                <li key={i}>
                  {c.action === 'pass'
                    ? `「${c.label}」于 ${c.date} 通过`
                    : `撤销「${c.label}」（原通过日期 ${c.date}）`}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </Modal>
  )
}
