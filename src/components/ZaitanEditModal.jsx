import { useEffect, useState } from 'react'
import { Modal, Form, Row, Col, Input, InputNumber, Select, Cascader, DatePicker, Radio, message } from 'antd'
import dayjs from 'dayjs'
import {
  PROJECT_CATEGORY_OPTIONS, CAPITAL_NATURE_OPTIONS, INDUSTRY_TYPE_OPTIONS,
  ENTERPRISE_CATEGORY_OPTIONS, CHUSHANG_TYPE_OPTIONS,
  INDUSTRY_CASCADER_OPTIONS, DOMESTIC_REGION_OPTIONS, FOREIGN_COUNTRY_OPTIONS,
  RESPONSIBLE_UNIT_SELECT_GROUPS, normalizeResponsibleUnits,
} from '../constants/projectEnums'

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

export default function ZaitanEditModal({ open, onCancel, onOk, projectData }) {
  const [form] = Form.useForm()

  const watchedCapitalNature = Form.useWatch('capitalNature', form)
  const watchedCategory = Form.useWatch('projectCategory', form)

  // 将字符串/Date 转为 dayjs；无效则返回 undefined
  const toDayjs = (v) => {
    if (!v) return undefined
    const d = dayjs(v)
    return d.isValid() ? d : undefined
  }
  // 过滤掉 '-' 和空串
  const clean = (v) => (v === '-' || v === '' || v === null || v === undefined ? undefined : v)
  // 级联字段：字符串转单元素数组
  const toCascader = (v) => {
    const c = clean(v)
    if (!c) return undefined
    if (Array.isArray(c)) return c
    return [c]
  }

  useEffect(() => {
    if (open && projectData) {
      form.resetFields()
      const fv = projectData._formValues || {}
      // 优先从 _formValues 取；否则兼容详情页/列表页字段别名回填
      const g = (formKey, ...aliases) => {
        if (fv[formKey] !== undefined) return fv[formKey]
        for (const k of aliases) {
          if (projectData[k] !== undefined && projectData[k] !== null) return projectData[k]
        }
        return undefined
      }

      const initialValues = {
        districtProjectCode: g('districtProjectCode'),
        projectName: clean(g('projectName', 'projectName')),
        projectCategory: clean(g('projectCategory', 'projectCategory')),
        needInvestAmount: g('needInvestAmount'),
        capitalNature: clean(g('capitalNature', 'domesticForeign')),
        sourceRegion: toCascader(g('sourceRegion', 'sourceArea')),
        industryType: clean(g('industryType', 'industryCategory')),
        industryCategory: toCascader(g('industryCategory', 'industryType')),
        secondaryIndustryCategory: toCascader(g('secondaryIndustryCategory')),
        investorEntity: clean(g('investorEntity', 'investorEntity')),
        dockingDate: toDayjs(g('dockingDate', 'contactTime')),
        investAmount: g('investAmount', 'investAmount'),
        responsibleUnits: normalizeResponsibleUnits(g('responsibleUnits', 'responsibleUnits')),
        enterpriseCategory: clean(g('enterpriseCategory')),
        isStock: g('isStock') || '否',
        registeredCapitalAmount: g('registeredCapitalAmount', 'registerCapital'),
        isEnclave: g('isEnclave') || '否',
        isOverflow: g('isOverflow'),
        chushangType: clean(g('chushangType')),
        projectDescription: clean(g('projectDescription', 'projectDesc')),
      }
      form.setFieldsValue(initialValues)
    }
  }, [open, form, projectData])

  const handleOk = async () => {
    try {
      const values = await form.validateFields()
      message.success('保存成功（demo示意）')
      onOk?.(values)
    } catch (e) {
      // validation error
    }
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
    <Modal
      title="编辑在谈项目"
      open={open}
      onOk={handleOk}
      onCancel={onCancel}
      okText="保存"
      cancelText="取消"
      width={1100}
      destroyOnClose
      styles={{ body: { maxHeight: '70vh', overflowY: 'auto', padding: '16px 24px 8px' } }}
    >
      <Form form={form} layout="horizontal" colon={false} requiredMark={true} {...formItemLayout}>

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
              <Select
                mode="multiple"
                options={RESPONSIBLE_UNIT_SELECT_GROUPS}
                placeholder="请选择责任单位"
                showSearch
                allowClear
                maxTagCount="responsive"
              />
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
  )
}
