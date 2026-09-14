import { useState } from 'react'
import { Modal, Form, Input, Upload, message } from 'antd'
import { InboxOutlined } from '@ant-design/icons'

const { TextArea } = Input

export default function FeedbackModal({ open, unitName, onCancel, onOk }) {
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)
  const [fileList, setFileList] = useState([])

  const handleOk = async () => {
    try {
      const values = await form.validateFields()
      const content = (values.content || '').trim()
      if (!content && fileList.length === 0) {
        message.warning('请填写反馈内容或上传附件')
        return
      }
      setLoading(true)
      const attachments = fileList.map(f => ({
        uid: f.uid,
        name: f.name,
        url: f.url || (f.originFileObj ? URL.createObjectURL(f.originFileObj) : ''),
        isImage: ['jpg','jpeg','png','gif','bmp','webp'].includes((f.name||'').split('.').pop().toLowerCase()),
      }))
      onOk && onOk({ content, attachments })
      form.resetFields()
      setFileList([])
    } catch (e) {
      // validate error
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    form.resetFields()
    setFileList([])
    onCancel && onCancel()
  }

  const uploadProps = {
    multiple: true,
    fileList,
    beforeUpload: (file) => {
      if (file.size > 20 * 1024 * 1024) {
        message.error(`${file.name} 超过20MB限制`)
        return Upload.LIST_IGNORE
      }
      setFileList(prev => [...prev, file])
      return false
    },
    onRemove: (file) => {
      setFileList(prev => prev.filter(f => f.uid !== file.uid))
    },
    accept: '.jpg,.jpeg,.png,.gif,.bmp,.webp,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.zip,.rar,.7z,.txt',
  }

  return (
    <Modal
      title={`提交进展反馈 · ${unitName || ''}`}
      open={open}
      onOk={handleOk}
      onCancel={handleCancel}
      confirmLoading={loading}
      okText="提交反馈"
      cancelText="取消"
      width={560}
      destroyOnClose
    >
      <Form form={form} layout="vertical" style={{ marginTop: 8 }}>
        <Form.Item
          label="反馈内容"
          name="content"
          rules={[{ max: 500, message: '反馈内容不能超过500字' }]}
        >
          <TextArea
            placeholder="请填写本次处理的进展情况…"
            autoSize={{ minRows: 4, maxRows: 8 }}
            showCount
            maxLength={500}
          />
        </Form.Item>
        <Form.Item label="附件">
          <Upload.Dragger {...uploadProps}>
            <p className="ant-upload-drag-icon"><InboxOutlined /></p>
            <p className="ant-upload-text">点击或拖拽文件到此处上传</p>
            <p className="ant-upload-hint" style={{ fontSize: 12, color: '#999' }}>
              支持图片、Word、Excel、PDF等常见格式，单个不超过20MB，最多9个
            </p>
          </Upload.Dragger>
          {fileList.length > 0 && (
            <div style={{ marginTop: 8, display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {fileList.map(f => (
                <div key={f.uid} style={{
                  display: 'inline-flex', alignItems: 'center', gap: 6,
                  padding: '4px 10px', background: '#f5f5f5', borderRadius: 4, fontSize: 12,
                }}>
                  <span>{['jpg','jpeg','png','gif','bmp','webp'].includes((f.name||'').split('.').pop().toLowerCase()) ? '🖼️' : '📄'}</span>
                  <span>{f.name}</span>
                </div>
              ))}
            </div>
          )}
        </Form.Item>
      </Form>
    </Modal>
  )
}
