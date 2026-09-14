import { Modal, Form, Select, Input, message } from 'antd'
import { Modal as AntModal } from 'antd'
import { ALL_UNITS } from '../constants/assignConfig'
import { transferStore, msgStore, useViewRole } from '../store/viewStore'

const { TextArea } = Input

// 移交目标：仅园区（不含区直部门/街道/平台公司）
const PARK_UNITS = ALL_UNITS.filter(u => ['wljs', 'ggswc', 'ggzx', 'bq'].includes(u.key))

export default function TransferZaitanModal({ open, projectData, onCancel, onOk }) {
  const [form] = Form.useForm()
  const { role } = useViewRole()

  const handleOk = async () => {
    try {
      const values = await form.validateFields()
      const park = PARK_UNITS.find(u => u.key === values.toDeptKey)
      AntModal.confirm({
        title: '确认移交',
        content: (
          <div>
            <div>确定将项目「<strong>{projectData?.projectName}</strong>」移交至「<strong>{park?.name}</strong>」吗？</div>
            <div style={{ marginTop: 8, fontSize: 12, color: '#faad14' }}>
              移交后该项目由双方共同管理，且不可再次移交。
            </div>
          </div>
        ),
        okText: '确认移交',
        cancelText: '取消',
        onOk: () => {
          // 1. 写入全局移交记录（一次移交约束在 store 内兜底）
          transferStore.addTransfer({
            projectId: projectData?.key ?? projectData?.id,
            projectName: projectData?.projectName,
            toDeptKey: values.toDeptKey,
            toDeptName: park?.name,
            reason: values.reason,
            by: `${role.deptName} ${role.userName}`,
            time: new Date().toLocaleString('zh-CN', { hour12: false }).replace(/\//g, '-'),
          })
          // 2. 园区消息提醒
          msgStore.addMessage({
            toDeptKey: values.toDeptKey,
            category: 'coop',
            title: '【项目移交】',
            content: `"${role.deptName}"已将"${projectData?.projectName}"移交至贵单位，请及时跟进后续转签约、落地工作。`,
            projectId: projectData?.key ?? projectData?.id,
            projectName: projectData?.projectName,
            type: 'transfer',
            action: 'assign',
          })
          message.success(`已成功移交至「${park?.name}」`)
          form.resetFields()
          onOk?.(values)
        },
      })
    } catch (e) {
      // validation error
    }
  }

  return (
    <Modal
      title="移交项目"
      open={open}
      onOk={handleOk}
      onCancel={() => { form.resetFields(); onCancel?.() }}
      okText="提交移交"
      cancelText="取消"
      width={560}
      destroyOnClose
    >
      <div style={{ marginBottom: 16, padding: '10px 14px', background: '#f6f8fa', borderRadius: 6, fontSize: 13, color: '#595959' }}>
        <div><span style={{ color: '#8c8c8c' }}>移交项目：</span>{projectData?.projectName}</div>
        <div style={{ marginTop: 4 }}><span style={{ color: '#8c8c8c' }}>移交说明：</span>项目移交后由投促局与承接园区共同管理，园区可开展后续转签约、落地等工作；移交仅支持一次。</div>
      </div>
      <Form form={form} layout="vertical" requiredMark>
        <Form.Item label="移交至园区" name="toDeptKey" rules={[{ required: true, message: '请选择移交至园区' }]}>
          <Select
            placeholder="请选择园区"
            showSearch
            optionFilterProp="label"
            options={PARK_UNITS.map(u => ({ label: u.name, value: u.key }))}
          />
        </Form.Item>
        <Form.Item label="移交说明" name="reason">
          <TextArea rows={3} placeholder="请输入移交说明（选填，最多200字）" maxLength={200} showCount />
        </Form.Item>
      </Form>
    </Modal>
  )
}
