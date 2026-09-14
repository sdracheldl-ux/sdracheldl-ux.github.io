import { useState } from 'react'
import {
  Form,
  InputNumber,
  Button,
  message,
  Space,
  Alert,
  Divider,
} from 'antd'
import {
  SaveOutlined,
  ReloadOutlined,
  ClockCircleOutlined,
} from '@ant-design/icons'

const DEFAULT_VALUES = {
  mouhuaDays: 45,
  zaitanDays: 30,
  qianyueDays: 20,
  reportRemindDays: 7,
}

export default function Overdue() {
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)

  const handleSave = () => {
    form.validateFields().then(values => {
      setLoading(true)
      setTimeout(() => {
        setLoading(false)
        message.success('超期设置已保存')
      }, 500)
    })
  }

  const handleReset = () => {
    form.resetFields()
    message.info('已重置为默认值')
  }

  return (
    <div className="page-container">
      <div style={{ background: '#fff', borderRadius: 4, padding: 24 }}>
        <div style={{ marginBottom: 16 }}>
          <h3 style={{ fontSize: 16, fontWeight: 600, color: '#262626', margin: 0 }}>
            <ClockCircleOutlined style={{ color: '#1677ff', marginRight: 8 }} />
            超期提醒设置
          </h3>
          <p style={{ fontSize: 13, color: '#999', marginTop: 4, marginBottom: 0 }}>
            配置各阶段项目超期提醒阈值，超过设定天数未更新将自动发送预警通知给相关责任人
          </p>
        </div>

        <Alert
          message="规则说明"
          description="系统将根据以下设置的天数，每日自动扫描项目数据，对超过阈值未进行进展更新的项目发送预警通知。汇报提醒天数指的是项目进展汇报到期前提前提醒的天数。"
          type="info"
          showIcon
          style={{ marginBottom: 24, background: '#e6f4ff', border: '1px solid #91caff' }}
        />

        <Form
          form={form}
          layout="horizontal"
          labelCol={{ span: 6 }}
          wrapperCol={{ span: 10 }}
          initialValues={DEFAULT_VALUES}
          style={{ maxWidth: 640 }}
        >
          <div className="form-section-title">谋划阶段</div>
          <Form.Item
            name="mouhuaDays"
            label="谋划阶段超期天数"
            rules={[
              { required: true, message: '请输入超期天数' },
              { type: 'number', min: 1, max: 365, message: '请输入1-365之间的天数' },
            ]}
          >
            <InputNumber
              min={1}
              max={365}
              style={{ width: '100%' }}
              addonAfter="天"
              placeholder="请输入天数"
            />
          </Form.Item>
          <div style={{ paddingLeft: '25%', fontSize: 12, color: '#999', marginTop: -16, marginBottom: 16 }}>
            谋划项目超过设定天数无进展更新时，将发送超期预警
          </div>

          <div className="form-section-title">在谈阶段</div>
          <Form.Item
            name="zaitanDays"
            label="在谈阶段超期天数"
            rules={[
              { required: true, message: '请输入超期天数' },
              { type: 'number', min: 1, max: 365, message: '请输入1-365之间的天数' },
            ]}
          >
            <InputNumber
              min={1}
              max={365}
              style={{ width: '100%' }}
              addonAfter="天"
              placeholder="请输入天数"
            />
          </Form.Item>
          <div style={{ paddingLeft: '25%', fontSize: 12, color: '#999', marginTop: -16, marginBottom: 16 }}>
            在谈项目超过设定天数无进展更新时，将发送超期预警
          </div>

          <div className="form-section-title">签约阶段</div>
          <Form.Item
            name="qianyueDays"
            label="签约阶段超期天数"
            rules={[
              { required: true, message: '请输入超期天数' },
              { type: 'number', min: 1, max: 365, message: '请输入1-365之间的天数' },
            ]}
          >
            <InputNumber
              min={1}
              max={365}
              style={{ width: '100%' }}
              addonAfter="天"
              placeholder="请输入天数"
            />
          </Form.Item>
          <div style={{ paddingLeft: '25%', fontSize: 12, color: '#999', marginTop: -16, marginBottom: 16 }}>
            签约项目超过设定天数无进展更新时，将发送超期预警
          </div>

          <div className="form-section-title">汇报提醒</div>
          <Form.Item
            name="reportRemindDays"
            label="汇报提醒天数"
            rules={[
              { required: true, message: '请输入提醒天数' },
              { type: 'number', min: 1, max: 30, message: '请输入1-30之间的天数' },
            ]}
          >
            <InputNumber
              min={1}
              max={30}
              style={{ width: '100%' }}
              addonAfter="天"
              placeholder="请输入天数"
            />
          </Form.Item>
          <div style={{ paddingLeft: '25%', fontSize: 12, color: '#999', marginTop: -16, marginBottom: 16 }}>
            项目进展汇报到期前，提前指定天数发送提醒通知
          </div>

          <Divider style={{ margin: '24px 0' }} />

          <Form.Item wrapperCol={{ offset: 6, span: 10 }} style={{ marginBottom: 0 }}>
            <Space size={12}>
              <Button
                type="primary"
                icon={<SaveOutlined />}
                loading={loading}
                onClick={handleSave}
              >
                保存设置
              </Button>
              <Button
                icon={<ReloadOutlined />}
                onClick={handleReset}
              >
                重置默认
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </div>
    </div>
  )
}
