import { useState } from 'react'
import { Modal, Form, Select, Input, InputNumber, Upload, Button, Space, message } from 'antd'
import { InboxOutlined, PlusOutlined, DeleteOutlined } from '@ant-design/icons'
import { ALL_UNITS } from '../constants/assignConfig'

const { TextArea } = Input

// 文件图标
function getFileIcon(name) {
  if (!name) return '📄'
  const ext = name.split('.').pop().toLowerCase()
  if (['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'].includes(ext)) return '🖼️'
  if (['doc', 'docx'].includes(ext)) return '📘'
  if (['xls', 'xlsx'].includes(ext)) return '📗'
  if (ext === 'pdf') return '📕'
  if (['ppt', 'pptx'].includes(ext)) return '📙'
  if (['zip', 'rar', '7z'].includes(ext)) return '🗜️'
  return '📄'
}

// 自定义Option渲染：显示名称+接口人信息
function renderUnitOption(u) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <span>{u.shortName || u.name}</span>
      {u.contact && <span style={{ fontSize: 12, color: '#bfbfbf' }}>{u.contact}</span>}
    </div>
  )
}

const EMPTY_GROUP = { units: [], content: '', feedbackEveryXDays: 15 }

export default function AssignModal({ open, projectName, onCancel, onOk }) {
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)
  const [fileList, setFileList] = useState([])
  // 监听所有组已选单位，用于跨组互斥
  const groupsWatched = Form.useWatch('groups', form) || []

  const handleOk = async () => {
    try {
      const values = await form.validateFields()
      const groups = (values.groups || []).map(g => ({
        units: g.units,
        content: g.content,
        feedbackEveryXDays: g.feedbackEveryXDays,
      }))
      // 跨组互斥兜底校验
      const allUnits = groups.flatMap(g => g.units)
      if (new Set(allUnits).size !== allUnits.length) {
        message.warning('同一接收单位不可重复出现在多个单位组中')
        return
      }
      if (allUnits.length === 0) {
        message.warning('请至少选择一个接收单位')
        return
      }
      setLoading(true)
      const attachments = fileList.map(f => ({
        uid: f.uid,
        name: f.name,
        url: f.url || (f.originFileObj ? URL.createObjectURL(f.originFileObj) : ''),
        isImage: ['jpg','jpeg','png','gif','bmp','webp'].includes((f.name||'').split('.').pop().toLowerCase()),
      }))
      onOk && onOk({ groups, attachments })
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

  // 组内单位下拉：禁用已被其他组选中的单位（跨组互斥）
  const getUnitOptions = (groupIndex) => {
    const selectedInOtherGroups = new Set(
      groupsWatched.flatMap((g, i) => (i === groupIndex ? [] : (g?.units || [])))
    )
    return ALL_UNITS.map(u => ({
      label: u.shortName || u.name,
      value: u.key,
      disabled: selectedInOtherGroups.has(u.key),
      labelRender: renderUnitOption(u),
    }))
  }

  // 按关键字过滤组织（匹配名称、简称、接口人）
  const filterOption = (input, option) => {
    const keyword = (input || '').toLowerCase()
    const u = ALL_UNITS.find(x => x.key === option.value)
    if (!u) return false
    return (
      (u.name || '').toLowerCase().includes(keyword) ||
      (u.shortName || '').toLowerCase().includes(keyword) ||
      (u.contact || '').toLowerCase().includes(keyword)
    )
  }

  return (
    <Modal
      title={`新增协作分派 · ${projectName || ''}`}
      open={open}
      onOk={handleOk}
      onCancel={handleCancel}
      confirmLoading={loading}
      okText="确认分派"
      cancelText="取消"
      width={680}
      destroyOnClose
    >
      <Form form={form} layout="vertical" style={{ marginTop: 8 }} initialValues={{ groups: [{ ...EMPTY_GROUP }] }}>
        <Form.List name="groups">
          {(fields, { add, remove }) => (
            <>
              {fields.map((field, idx) => (
                <div key={field.key} style={{
                  border: '1px solid #f0f0f0', borderRadius: 8,
                  padding: '12px 16px 4px', marginBottom: 12, background: '#fafafa',
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                    <span style={{ fontWeight: 600, fontSize: 13, color: '#595959' }}>单位组 {idx + 1}</span>
                    {fields.length > 1 && (
                      <Button type="text" danger size="small" icon={<DeleteOutlined />} onClick={() => remove(field.name)}>
                        删除
                      </Button>
                    )}
                  </div>
                  <Form.Item
                    label="接收单位"
                    name={[field.name, 'units']}
                    rules={[{ required: true, message: '请选择接收单位' }]}
                    style={{ marginBottom: 12 }}
                  >
                    <Select
                      mode="multiple"
                      placeholder="请选择接收单位（可搜索、可多选；已被其他组选中的单位不可再选）"
                      allowClear
                      showSearch
                      filterOption={filterOption}
                      options={getUnitOptions(idx)}
                      optionRender={(opt) => renderUnitOption(ALL_UNITS.find(u => u.key === opt.value))}
                      maxTagCount="responsive"
                    />
                  </Form.Item>
                  <Form.Item
                    label="协同事项说明"
                    name={[field.name, 'content']}
                    rules={[{ required: true, message: '请输入该组的协同事项说明' }, { max: 500, message: '说明不能超过500字' }]}
                    style={{ marginBottom: 12 }}
                  >
                    <TextArea
                      placeholder="请说明该组接收单位需要协同的具体事项"
                      autoSize={{ minRows: 2, maxRows: 5 }}
                      showCount
                      maxLength={500}
                    />
                  </Form.Item>
                  <Form.Item
                    label="反馈要求"
                    name={[field.name, 'feedbackEveryXDays']}
                    rules={[{ required: true, message: '请设置反馈频率' }]}
                    style={{ marginBottom: 12 }}
                  >
                    <Space.Compact>
                      <InputNumber min={1} max={99} precision={0} style={{ width: 120 }} placeholder="15" />
                      <Input
                        style={{ width: 220, color: '#595959', background: '#fff' }}
                        readOnly
                        value="天至少提交 1 次反馈"
                      />
                    </Space.Compact>
                  </Form.Item>
                </div>
              ))}
              <Button
                type="dashed"
                block
                icon={<PlusOutlined />}
                onClick={() => add({ ...EMPTY_GROUP })}
                style={{ marginBottom: 16 }}
              >
                添加单位组
              </Button>
            </>
          )}
        </Form.List>

        <Form.Item label="附件（本次分派共享）">
          <Upload.Dragger {...uploadProps}>
            <p className="ant-upload-drag-icon"><InboxOutlined /></p>
            <p className="ant-upload-text">点击或拖拽文件到此处上传</p>
            <p className="ant-upload-hint" style={{ fontSize: 12, color: '#999' }}>
              支持图片、Word、Excel、PDF、压缩包等常见格式，单个不超过20MB，最多9个
            </p>
          </Upload.Dragger>
          {fileList.length > 0 && (
            <div style={{ marginTop: 8, display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {fileList.map(f => (
                <div key={f.uid} style={{
                  display: 'inline-flex', alignItems: 'center', gap: 6,
                  padding: '4px 10px', background: '#f5f5f5', borderRadius: 4, fontSize: 12,
                }}>
                  <span>{getFileIcon(f.name)}</span>
                  <span>{f.name}</span>
                </div>
              ))}
            </div>
          )}
        </Form.Item>
      </Form>
      <div style={{
        marginTop: 4, padding: '8px 12px', background: '#e6f4ff', borderRadius: 4,
        fontSize: 12, color: '#1677ff',
      }}>
        💡 提示：每个单位组可配置各自的协同事项说明与反馈频率要求，系统将按单位拆分为独立任务并跟踪反馈达标情况；同一单位不可重复出现在多个组。
      </div>
    </Modal>
  )
}
