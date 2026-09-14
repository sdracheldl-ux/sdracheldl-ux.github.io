import { useEffect, useRef, useState } from 'react'
import { Modal, Form, Row, Col, Input, InputNumber, Select, Cascader, DatePicker, Radio, message, Alert, Button, Tag } from 'antd'
import {
  PROJECT_CATEGORY_OPTIONS, CAPITAL_NATURE_OPTIONS, INDUSTRY_TYPE_OPTIONS,
  ENTERPRISE_CATEGORY_OPTIONS, CHUSHANG_TYPE_OPTIONS,
  INDUSTRY_CASCADER_OPTIONS, DOMESTIC_REGION_OPTIONS, FOREIGN_COUNTRY_OPTIONS,
  RESPONSIBLE_UNIT_SELECT_GROUPS, normalizeResponsibleUnits,
} from '../constants/projectEnums'
import DuplicateWarningModal from './DuplicateWarningModal'
import { checkDuplicates, buildZaitanLib } from '../utils/duplicateCheck'

const { TextArea } = Input

const SectionHeader = ({ title }) => (
  <div style={{
    background: '#e6f4ff', borderLeft: '3px solid #1677ff',
    padding: '8px 16px', margin: '0 0 20px 0', fontSize: 15, fontWeight: 600,
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    borderRadius: '2px 0 0 2px',
  }}>
    <span>{title}</span>
    <span style={{ fontSize: 12, fontWeight: 400, color: '#999' }}>注：<span style={{ color: '#ff4d4f' }}>*</span>为必填项</span>
  </div>
)

export default function TransferToZaitanModal({ open, onCancel, onOk, projectData }) {
  const [form] = Form.useForm()
  // ===== 实时判重（PRD 2.1.8 场景一：转在谈补判重，比对在谈库）=====
  const [warnVisible, setWarnVisible] = useState(false)
  const [warnHits, setWarnHits] = useState([])
  const [warnValues, setWarnValues] = useState(null)
  const [l4Hits, setL4Hits] = useState([])
  const [l4Expanded, setL4Expanded] = useState(false)
  const l4AckRef = useRef(false) // L4 提示后放行：再次提交直接保存

  const watchedCapitalNature = Form.useWatch('capitalNature', form)
  const watchedCategory = Form.useWatch('projectCategory', form)

  useEffect(() => {
    if (open && projectData) {
      form.resetFields()
      setL4Hits([])
      setL4Expanded(false)
      l4AckRef.current = false
      const fv = projectData._formValues || {}
      const initialValues = {
        // 谋划阶段带出
        districtProjectCode: projectData.districtProjectCode,
        projectName: projectData.projectName,
        capitalNature: fv.capitalNature,
        sourceRegion: fv.sourceRegion,
        industryType: fv.industryType || (projectData.industryCategory !== '-' ? projectData.industryCategory : undefined),
        industryCategory: fv.industryCategory,
        projectDescription: fv.projectDescription || (projectData.projectDesc && projectData.projectDesc !== '-' ? projectData.projectDesc : undefined),
        investAmount: fv.investAmount || projectData.investAmount,
        responsibleUnits: normalizeResponsibleUnits(projectData.responsibleUnits),
        // 在谈阶段待填
        projectCategory: undefined,
        needInvestAmount: undefined,
        secondaryIndustryCategory: undefined,
        investorEntity: projectData.investorEntity !== '-' ? projectData.investorEntity : undefined,
        dockingDate: null,
        enterpriseCategory: undefined,
        isStock: '否',
        registeredCapitalAmount: undefined,
        isEnclave: '否',
        isOverflow: undefined,
        chushangType: undefined,
      }
      form.setFieldsValue(initialValues)
    }
  }, [open, form, projectData])

  // 执行转在谈（判重通过 / L4 放行 / 预警「仍要提交」后调用）
  const doTransfer = (values) => {
    message.success('已转在谈（demo示意）')
    setL4Hits([])
    setL4Expanded(false)
    l4AckRef.current = false
    onOk?.(values)
  }

  const handleOk = async () => {
    try {
      const values = await form.validateFields()
      // ===== 实时判重：转在谈为字段补齐后的补判重最后时机，仅比对在谈库，不进入研判池 =====
      const now = new Date()
      const pad = (n) => String(n).padStart(2, '0')
      const hits = checkDuplicates({
        projectName: values.projectName,
        investorEntity: values.investorEntity,
        investAmount: values.investAmount,
        industryCategory: values.industryType || '',
        industryType: values.industryCategory ? values.industryCategory.join(' / ') : '',
        reporter: '投促局管理员',
        reportTime: `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`,
      }, [
        { stage: '在谈', rows: buildZaitanLib() },
      ])
      const strongHits = hits.filter(h => h.level !== 'L4')
      const l4Only = hits.filter(h => h.level === 'L4')
      if (strongHits.length > 0) {
        setWarnValues(values)
        setWarnHits(hits)
        setWarnVisible(true)
        return
      }
      if (l4Only.length > 0 && !l4AckRef.current) {
        l4AckRef.current = true
        setL4Hits(l4Only)
        setL4Expanded(false)
        message.warning('检测到与库中项目存在弱相似信号，建议核实是否重复；确认无误可再次提交')
        return
      }
      doTransfer(values)
    } catch (e) {
      // validation error
    }
  }

  const handleWarnReturn = () => {
    setWarnVisible(false)
    setWarnHits([])
    setWarnValues(null)
  }

  const handleWarnForce = () => {
    setWarnVisible(false)
    setWarnHits([])
    const values = warnValues
    setWarnValues(null)
    if (values) doTransfer(values)
  }

  const formItemLayout = { labelCol: { span: 9 }, wrapperCol: { span: 15 } }
  const colProps = { span: 12 }

  const radioOptions = [
    { label: '是', value: '是' },
    { label: '否', value: '否' },
  ]

  const sourceRegionOptions = watchedCapitalNature === '外资'
    ? FOREIGN_COUNTRY_OPTIONS.map(v => ({ label: v, value: v }))
    : watchedCapitalNature === '内资' ? DOMESTIC_REGION_OPTIONS : []

  return (
    <>
      <Modal
        title="转在谈"
        open={open}
        onOk={handleOk}
        onCancel={onCancel}
        okText="确认转在谈"
        cancelText="取消"
        width={1100}
        destroyOnClose
        styles={{ body: { maxHeight: '70vh', overflowY: 'auto', padding: '16px 24px 8px' } }}
      >
        <Form form={form} layout="horizontal" colon={false} requiredMark={true} {...formItemLayout}>
          {/* L4 弱提示：不阻断，可展开冲突项目列表（名称/阶段/链接） */}
          {l4Hits.length > 0 && (
            <Alert
              type="info"
              showIcon
              style={{ marginBottom: 16 }}
              message="检测到与库中项目存在弱相似信号，建议核实是否重复"
              action={
                <Button type="link" size="small" onClick={() => setL4Expanded(!l4Expanded)}>
                  {l4Expanded ? '收起' : '展开冲突项目'}
                </Button>
              }
              description={l4Expanded ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  {l4Hits.map((h, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <Tag bordered={false}>{h.target.stageLabel}</Tag>
                      <span style={{ fontWeight: 500 }}>{h.target.projectName}</span>
                      <span style={{ color: '#8c8c8c', fontSize: 12 }}>{h.reason}</span>
                    </div>
                  ))}
                </div>
              ) : undefined}
            />
          )}

          <SectionHeader title="项目基本信息" />
        <Row gutter={24}>
          <Col {...colProps}>
            <Form.Item label="区级项目编码" name="districtProjectCode">
              <Input disabled placeholder="系统自动生成" />
            </Form.Item>
          </Col>
          <Col {...colProps}>
            <Form.Item label="项目名称" name="projectName" rules={[{ required: true, message: '请输入项目名称' }, { max: 40, message: '不超过40字' }]}>
              <Input placeholder="请输入项目名称" maxLength={40} />
            </Form.Item>
          </Col>
          <Col {...colProps}>
            <Form.Item label="项目分类" name="projectCategory" rules={[{ required: true, message: '请选择项目分类' }]}>
              <Select
                placeholder="请选择"
                options={PROJECT_CATEGORY_OPTIONS.map(v => ({ label: v, value: v }))}
                onChange={(v) => {
                  // 切换为非投资类时清空需投资金额，避免残留
                  if (v !== '投资类') form.setFieldValue('needInvestAmount', undefined)
                }}
              />
            </Form.Item>
          </Col>

          {/* 需投资金额：仅项目分类=投资类时出现，紧跟项目分类之后 */}
          {watchedCategory === '投资类' && (
            <Col {...colProps}>
              <Form.Item label="需投资金额" name="needInvestAmount" rules={[
                { required: true, message: '请输入需投资金额' },
                { type: 'number', min: 0.01, message: '需投资金额需大于0' },
              ]}>
                <InputNumber style={{ width: '100%' }} placeholder="请输入" min={0} precision={2} addonAfter="亿元" />
              </Form.Item>
            </Col>
          )}

          <Col {...colProps}>
            <Form.Item label="内外资" name="capitalNature" rules={[{ required: true, message: '请选择' }]}>
              <Select
                placeholder="请选择"
                options={CAPITAL_NATURE_OPTIONS.map(v => ({ label: v, value: v }))}
                onChange={() => form.setFieldsValue({ sourceRegion: undefined })}
              />
            </Form.Item>
          </Col>

          <Col {...colProps}>
            <Form.Item label="来源地" name="sourceRegion" rules={[{ required: true, message: '请选择来源地' }]}>
              <Cascader
                options={sourceRegionOptions}
                placeholder={watchedCapitalNature === '外资' ? '请选择国家' : watchedCapitalNature === '内资' ? '请选择省份/城市' : '请先选择内外资'}
                expandTrigger="hover"
                showSearch
                disabled={!watchedCapitalNature}
              />
            </Form.Item>
          </Col>
          <Col {...colProps}>
            <Form.Item label="产业类别" name="industryType" rules={[{ required: true, message: '请选择产业类别' }]}>
              <Select placeholder="请选择" options={INDUSTRY_TYPE_OPTIONS.map(v => ({ label: v, value: v }))} />
            </Form.Item>
          </Col>

          <Col {...colProps}>
            <Form.Item label="行业类别" name="industryCategory" rules={[{ required: true, message: '请选择行业类别' }]}>
              <Cascader options={INDUSTRY_CASCADER_OPTIONS} placeholder="门类 / 大类" expandTrigger="hover" showSearch />
            </Form.Item>
          </Col>
          <Col {...colProps}>
            <Form.Item label="次要行业类别" name="secondaryIndustryCategory">
              <Cascader options={INDUSTRY_CASCADER_OPTIONS} placeholder="门类 / 大类（选填）" expandTrigger="hover" showSearch />
            </Form.Item>
          </Col>

          <Col {...colProps}>
            <Form.Item label="投资主体" name="investorEntity" rules={[{ required: true, message: '请输入投资主体' }]}>
              <Input placeholder="请输入投资主体" />
            </Form.Item>
          </Col>
          <Col {...colProps}>
            <Form.Item label="对接时间" name="dockingDate" rules={[{ required: true, message: '请选择对接时间' }]}>
              <DatePicker style={{ width: '100%' }} placeholder="请选择对接时间" />
            </Form.Item>
          </Col>

          <Col {...colProps}>
            <Form.Item label="计划投资总额" name="investAmount" rules={[{ required: true, message: '请输入投资金额' }]}>
              <InputNumber style={{ width: '100%' }} placeholder="请输入" min={0} precision={2} addonAfter="亿元" />
            </Form.Item>
          </Col>
          <Col {...colProps}>
            <Form.Item label="责任单位" name="responsibleUnits" rules={[{ required: true, message: '请选择责任单位（至少1个）' }]}>
              <Select mode="multiple" options={RESPONSIBLE_UNIT_SELECT_GROUPS} placeholder="请选择责任单位" showSearch allowClear maxTagCount="responsive" />
            </Form.Item>
          </Col>

          <Col {...colProps}>
            <Form.Item label="企业类别" name="enterpriseCategory">
              <Select placeholder="请选择" showSearch allowClear options={ENTERPRISE_CATEGORY_OPTIONS.map(v => ({ label: v, value: v }))} />
            </Form.Item>
          </Col>
          <Col {...colProps}>
            <Form.Item label="是否为存量企业" name="isStock" rules={[{ required: true, message: '请选择' }]}>
              <Radio.Group options={radioOptions} />
            </Form.Item>
          </Col>

          <Col {...colProps}>
            <Form.Item label="注册资本" name="registeredCapitalAmount">
              <InputNumber style={{ width: '100%' }} placeholder="金额（选填）" min={0} precision={2} addonAfter="亿元" />
            </Form.Item>
          </Col>
          <Col {...colProps}>
            <Form.Item label="是否飞地园区" name="isEnclave" rules={[{ required: true }]}>
              <Radio.Group options={radioOptions} />
            </Form.Item>
          </Col>

          <Col {...colProps}>
            <Form.Item label="是否产业外溢" name="isOverflow" rules={[{ required: true, message: '请选择是否产业外溢' }]}>
              <Radio.Group options={radioOptions} />
            </Form.Item>
          </Col>

          <Col {...colProps}>
            <Form.Item label="楚商类型" name="chushangType">
              <Select placeholder="请选择" allowClear options={CHUSHANG_TYPE_OPTIONS.map(v => ({ label: v, value: v }))} />
            </Form.Item>
          </Col>

          <Col span={24}>
            <Form.Item label="项目简介" name="projectDescription" labelCol={{ span: 4 }} wrapperCol={{ span: 20 }} rules={[{ required: true, message: '请输入项目简介' }]}>
              <TextArea rows={3} placeholder="请输入项目简介" maxLength={999} showCount />
            </Form.Item>
          </Col>
        </Row>
      </Form>
      </Modal>

      {/* 实时判重预警弹窗（L1 阻断 / L2·L3 二选一） */}
      <DuplicateWarningModal
        open={warnVisible}
        hits={warnHits}
        contextTitle="转在谈"
        onReturn={handleWarnReturn}
        onForce={handleWarnForce}
        onCloseAll={() => { setWarnVisible(false); onCancel?.() }}
      />
    </>
  )
}
