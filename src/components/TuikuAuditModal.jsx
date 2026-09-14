import { useState, useEffect } from 'react'
import { Modal, Descriptions, Radio, Input, message } from 'antd'
import { AuditOutlined } from '@ant-design/icons'

const { TextArea } = Input

/**
 * 签约项目退库审核弹窗（投促局视角）
 * 只读回显申请信息（项目/申请人/时间/退库说明），选择审核结论；
 * 驳回时审核意见必填。
 */
export default function TuikuAuditModal({ open, record, onCancel, onOk }) {
  const [result, setResult] = useState('approved')
  const [opinion, setOpinion] = useState('')

  useEffect(() => {
    if (open) {
      setResult('approved')
      setOpinion('')
    }
  }, [open])

  const handleOk = () => {
    if (result === 'rejected' && !opinion.trim()) {
      message.warning('驳回时请填写审核意见')
      return
    }
    onOk?.({ result, opinion: opinion.trim() })
  }

  return (
    <Modal
      title={
        <span style={{ color: '#d4380d' }}>
          <AuditOutlined style={{ marginRight: 8 }} />
          退库审核
        </span>
      }
      open={open}
      onCancel={onCancel}
      onOk={handleOk}
      okText="提交审核结果"
      cancelText="取消"
      width={560}
      styles={{ body: { paddingBottom: 32 } }}
      destroyOnClose
    >
      <Descriptions
        bordered size="small" column={1}
        labelStyle={{ width: 110, background: '#fafafa', fontWeight: 500 }}
        style={{ marginBottom: 20 }}
      >
        <Descriptions.Item label="项目名称">{record?.projectName || '-'}</Descriptions.Item>
        <Descriptions.Item label="申请人">{record?.applicant || '-'}</Descriptions.Item>
        <Descriptions.Item label="申请时间">{record?.applyTime || '-'}</Descriptions.Item>
        <Descriptions.Item label="退库说明">{record?.reason || '-'}</Descriptions.Item>
      </Descriptions>

      <div style={{ fontSize: 13, color: '#595959', marginBottom: 6 }}>
        审核结论 <span style={{ color: '#ff4d4f' }}>*</span>
      </div>
      <Radio.Group
        value={result}
        onChange={(e) => setResult(e.target.value)}
        options={[
          { label: '通过（项目正式退库）', value: 'approved' },
          { label: '驳回（项目恢复正常状态）', value: 'rejected' },
        ]}
        style={{ marginBottom: 16 }}
      />

      <div style={{ fontSize: 13, color: '#595959', marginBottom: 6 }}>
        审核意见
        {result === 'rejected'
          ? <span style={{ color: '#ff4d4f' }}> *（驳回时必填）</span>
          : <span style={{ color: '#bfbfbf' }}>（选填，最多500字）</span>}
      </div>
      <TextArea
        value={opinion}
        onChange={(e) => setOpinion(e.target.value)}
        placeholder={result === 'rejected' ? '请填写驳回意见' : '请输入审核意见（选填）'}
        maxLength={500}
        showCount
        rows={4}
      />
    </Modal>
  )
}
