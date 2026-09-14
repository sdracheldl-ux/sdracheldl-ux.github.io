import { useEffect } from 'react'
import { Modal, Form, Row, Col, Input, Select, DatePicker, Descriptions } from 'antd'
import dayjs from 'dayjs'
import { START_WORK_TYPE_OPTIONS, CITY_CODE_SEEDS } from '../constants/projectEnums'

/**
 * 签约转落地弹窗：
 * - 签约阶段信息只读回显；
 * - 仅保留 2 个落地必填字段（开工开业类型、开工/开业时间），直接暴露，无「是否已开工」联动；
 * - 落地为最终阶段、不涉及审核。
 */
export default function ZhuanLuodiModal({ open, projectData, onCancel, onOk }) {
  const [form] = Form.useForm()

  const toDayjs = (v) => {
    if (!v || v === '-') return undefined
    if (typeof v === 'number') {
      const d = dayjs('1899-12-30').add(v, 'day')
      return d.isValid() ? d : undefined
    }
    const d = dayjs(v)
    return d.isValid() ? d : undefined
  }

  const clean = (v) => (v === '-' || v === '' || v === null || v === undefined ? undefined : v)

  const rowIdx = Number(projectData?.id ?? projectData?.index ?? 0)
  const seed = (arr) => arr[(rowIdx >= 0 ? rowIdx : 0) % arr.length]

  // 签约信息只读回显（兼容列表 record 与详情 _raw 两种形态）
  const info = {
    cityProjectCode: clean(projectData?.cityProjectCode ?? projectData?.natongProjectCode ?? projectData?.['市级项目编码'])
      || seed(CITY_CODE_SEEDS, rowIdx),
    districtProjectCode: clean(projectData?.districtProjectCode ?? projectData?.projectCode ?? projectData?.['区级项目编码'] ?? projectData?.['编号']) || '-',
    projectName: clean(projectData?.projectName ?? projectData?.['项目名称']) || '-',
    capitalNature: clean(projectData?.capitalNature ?? projectData?.domesticForeign ?? projectData?.['内外资']) || '-',
    investAmount: clean(projectData?.investAmount ?? projectData?.['计划投资总额(亿元)'] ?? projectData?.['投资金额(亿元)']),
    signDate: clean(projectData?.signDate ?? projectData?.['协议签订时间']) || seed(['2026-03-15', '2026-04-02', '2026-05-20', '2026-06-11'], rowIdx),
    reporter: clean(projectData?.reporter ?? projectData?.['申报人']) || '-',
  }

  useEffect(() => {
    if (open && projectData) {
      form.resetFields()
      const fv = projectData._formValues || {}
      form.setFieldsValue({
        // 已填过的落地字段带出（编辑场景兜底）
        startWorkType: clean(fv.startWorkType ?? projectData.startWorkType ?? projectData['开工开业类型']),
        startDate: toDayjs(fv.startDate ?? projectData.startDate ?? projectData['开工/业时间']),
      })
    }
  }, [open, form, projectData])

  const handleOk = async () => {
    try {
      const values = await form.validateFields()
      onOk?.(values)
    } catch (e) {
      // validation error
    }
  }

  const colProps = { span: 12 }
  // label 160px + nowrap：「计划投资总额(亿元)」等长标签不换行；2列布局下内容区仍有 200px+
  const labelStyle = { width: 160, background: '#fafafa', fontWeight: 500, whiteSpace: 'nowrap' }

  return (
    <Modal
      title="签约转落地"
      open={open}
      onOk={handleOk}
      onCancel={onCancel}
      okText="确认推进至落地"
      cancelText="取消"
      width={820}
      destroyOnClose
      styles={{ body: { maxHeight: '70vh', overflowY: 'auto', padding: '16px 24px 8px' } }}
    >
      {/* 签约阶段信息回显（只读，2列布局保证编码/日期完整显示） */}
      <Descriptions
        bordered size="small" column={2}
        labelStyle={labelStyle}
        style={{ marginBottom: 20 }}
      >
        <Descriptions.Item label="项目名称" span={2}>{info.projectName}</Descriptions.Item>
        <Descriptions.Item label="区级项目编码">{info.districtProjectCode}</Descriptions.Item>
        <Descriptions.Item label="市级项目编码">{info.cityProjectCode}</Descriptions.Item>
        <Descriptions.Item label="内外资">{info.capitalNature}</Descriptions.Item>
        <Descriptions.Item label="计划投资总额(亿元)">{info.investAmount ?? '-'}</Descriptions.Item>
        <Descriptions.Item label="协议签订时间">{info.signDate}</Descriptions.Item>
        <Descriptions.Item label="申报人">{info.reporter}</Descriptions.Item>
      </Descriptions>

      <div style={{
        background: '#e6f4ff', borderLeft: '3px solid #1677ff',
        padding: '8px 16px', margin: '0 0 20px 0', fontSize: 15, fontWeight: 600,
        borderRadius: '2px 0 0 2px', display: 'flex', justifyContent: 'space-between',
      }}>
        <span>落地信息</span>
        <span style={{ fontSize: 12, fontWeight: 400, color: '#999' }}>注：<span style={{ color: '#ff4d4f' }}>*</span>为必填项</span>
      </div>

      {/* labelCol span=8：容纳必填星号+「开工/开业时间」7字标签，避免与控件重叠 */}
      <Form form={form} layout="horizontal" colon={false} requiredMark={true} labelCol={{ span: 8 }} wrapperCol={{ span: 16 }}>
        <Row gutter={24}>
          <Col {...colProps}>
            <Form.Item label="开工开业类型" name="startWorkType" rules={[{ required: true, message: '请选择开工开业类型' }]}>
              <Select placeholder="请选择" options={START_WORK_TYPE_OPTIONS.map(v => ({ label: v, value: v }))} />
            </Form.Item>
          </Col>
          <Col {...colProps}>
            <Form.Item label="开工/开业时间" name="startDate" rules={[{ required: true, message: '请选择开工/开业时间' }]}>
              <DatePicker style={{ width: '100%' }} placeholder="请选择" />
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Modal>
  )
}
