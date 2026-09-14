import { useEffect, useState } from 'react'
import { Modal, Form, Row, Col, Input, InputNumber, Select, Cascader, DatePicker, Radio, Upload, Button, message } from 'antd'
import { UploadOutlined } from '@ant-design/icons'
import dayjs from 'dayjs'
import {
  CAPITAL_NATURE_OPTIONS, INDUSTRY_TYPE_OPTIONS,
  ENTERPRISE_CATEGORY_OPTIONS,
  CONSTRUCTION_NATURE_OPTIONS, MERCHANT_TYPE_OPTIONS,
  CHUSHANG_TYPE_OPTIONS, LAND_SITUATION_OPTIONS,
  HQ_ECONOMY_LEVEL1_OPTIONS, HQ_ECONOMY_LEVEL2_OPTIONS,
  DOMESTIC_REGION_OPTIONS, INDUSTRY_CASCADER_OPTIONS,
  AGREEMENT_TYPE_OPTIONS, CAPITAL_UNIT_OPTIONS,
  RESPONSIBLE_UNIT_SELECT_GROUPS, normalizeResponsibleUnits,
  CITY_CODE_SEEDS,
} from '../constants/projectEnums'

const { TextArea } = Input

const LAND_SITUATION_SELECT_OPTIONS = LAND_SITUATION_OPTIONS.map(v => ({ label: v, value: v }))
const radioOptions = [
  { label: '是', value: '是' },
  { label: '否', value: '否' },
]

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

function generateProjectCode() {
  const dateStr = dayjs().format('YYYYMMDD')
  const seq = String(Math.floor(Math.random() * 999) + 1).padStart(3, '0')
  return `QY${dateStr}${seq}`
}

// 级联字段兼容：字符串 / 数组 / 中英文破折号
function toCascader(v) {
  if (!v || v === '-') return undefined
  if (Array.isArray(v)) return v
  return [v]
}

function clean(v) {
  return (v === '-' || v === '' || v === null || v === undefined) ? undefined : v
}

export default function ZhuanQianyueModal({ open, projectData, onCancel, onOk }) {
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)
  const [agreementFileList, setAgreementFileList] = useState([])

  const watchedCapitalNature = Form.useWatch('capitalNature', form)
  const watchedProjectCategory = Form.useWatch('projectCategory', form)
  const watchedIsHqEconomy = Form.useWatch('isHqEconomy', form)
  const watchedIsRegister = Form.useWatch('isRegister', form)

  useEffect(() => {
    if (open) {
      form.resetFields()
      setAgreementFileList([])

      const rawRu = projectData?.responsibleUnits ?? projectData?.['责任单位']
      const responsibleUnits = normalizeResponsibleUnits(rawRu === '-' ? '' : rawRu)

      // 在谈字段：带出并可改
      const initialValues = {
        projectCode: generateProjectCode(),
        // 市级项目编码：签约阶段保留字段，从市级同步带出（demo 取种子）
        cityProjectCode: projectData?.cityProjectCode || CITY_CODE_SEEDS[Number(projectData?.key || 0) % CITY_CODE_SEEDS.length],
        projectName: clean(projectData?.projectName),
        capitalNature: clean(projectData?.capitalNature) || '内资',
        sourceRegion: toCascader(projectData?.sourceRegion || projectData?.sourceArea),
        industryType: clean(projectData?.industryType || projectData?.industryCategory),
        industryCategory: toCascader(projectData?.industryCategory || projectData?.industryType),
        secondaryIndustryCategory: toCascader(projectData?.secondaryIndustryCategory),
        projectDescription: clean(projectData?.projectDescription || projectData?.projectDesc),
        investAmount: projectData?.investAmount != null ? projectData.investAmount : projectData?.planInvestAmount,
        responsibleUnits,
        projectCategory: clean(projectData?.projectCategory),
        needInvestAmount: projectData?.needInvestAmount,
        investorEntity: clean(projectData?.investorEntity),
        dockingDate: clean(projectData?.dockingDate) ? dayjs(projectData.dockingDate) : undefined,
        enterpriseCategory: clean(projectData?.enterpriseCategory),
        isStock: clean(projectData?.isStock) || '否',
        registeredCapitalAmount: projectData?.registeredCapitalAmount != null ? projectData.registeredCapitalAmount : undefined,
        isEnclave: clean(projectData?.isEnclave) || '否',
        isOverflow: clean(projectData?.isOverflow) || '否',
        chushangType: clean(projectData?.chushangType),

        // 签约字段：待填
        constructionNature: undefined,
        constructionNatureLevel2: undefined,
        merchantType: undefined,
        merchantTypeDesc: undefined,
        isZheshang: '否',
        landSituation: undefined,
        isHqEconomy: '否',
        hqEconomyLevel1: undefined,
        hqEconomyLevel2: undefined,
        recordAmount: undefined,
        fixedInvestAmount: undefined,
        agreementSignDate: dayjs(),
        agreementType: undefined,
        isRegister: '否',
        registerDate: undefined,
        registerCapitalAmount: undefined,
        registerCapitalUnit: undefined,
        registerCompanyName: undefined,
        signSubject: undefined,
      }
      form.setFieldsValue(initialValues)
    }
  }, [open, form, projectData])

  const handleOk = async () => {
    try {
      const values = await form.validateFields()
      setLoading(true)
      onOk?.({ ...values, agreementAttachments: agreementFileList })
      form.resetFields()
      setAgreementFileList([])
    } catch (e) {
      // validation error
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    form.resetFields()
    setAgreementFileList([])
    onCancel?.()
  }

  const createUploadProps = (fileList, setFileList) => ({
    fileList,
    multiple: true,
    beforeUpload: (file) => {
      if (file.size > 20 * 1024 * 1024) {
        message.error(`${file.name} 超过20MB限制`)
        return Upload.LIST_IGNORE
      }
      setFileList(prev => [...prev, file])
      return false
    },
    onRemove: (file) => setFileList(prev => prev.filter(f => f.uid !== file.uid)),
  })

  const colProps = { span: 12 }

  return (
    <Modal
      title="转签约"
      open={open}
      width={960}
      onOk={handleOk}
      onCancel={handleCancel}
      confirmLoading={loading}
      okText="确认转签约"
      cancelText="取消"
      destroyOnClose
    >
      <Form form={form} layout="vertical">
        <SectionHeader title="项目基础信息" />
        <Row gutter={24}>
          <Col {...colProps}>
            <Form.Item label="区级项目编码" name="projectCode">
              <Input disabled />
            </Form.Item>
          </Col>
          <Col {...colProps}>
            <Form.Item label="市级项目编码" name="cityProjectCode">
              <Input disabled />
            </Form.Item>
          </Col>
          <Col {...colProps}>
            <Form.Item label="项目名称" name="projectName" rules={[{ required: true, message: '请输入项目名称' }]}>
              <Input placeholder="请输入项目名称" />
            </Form.Item>
          </Col>

          <Col {...colProps}>
            <Form.Item label="责任单位" name="responsibleUnits" rules={[{ required: true, message: '请选择责任单位' }]}>
              <Select mode="multiple" options={RESPONSIBLE_UNIT_SELECT_GROUPS} placeholder="请选择责任单位" showSearch maxTagCount="responsive" />
            </Form.Item>
          </Col>
          <Col {...colProps}>
            <Form.Item label="内外资" name="capitalNature" rules={[{ required: true, message: '请选择' }]}>
              <Select options={CAPITAL_NATURE_OPTIONS.map(v => ({ label: v, value: v }))} placeholder="请选择" />
            </Form.Item>
          </Col>

          <Col {...colProps}>
            <Form.Item label="来源地" name="sourceRegion" rules={[{ required: true, message: '请选择来源地' }]}>
              <Cascader
                options={watchedCapitalNature === '外资' ? DOMESTIC_REGION_OPTIONS.map(c => ({ ...c, children: undefined })) : DOMESTIC_REGION_OPTIONS}
                placeholder="请选择来源地"
              />
            </Form.Item>
          </Col>
          <Col {...colProps}>
            <Form.Item label="产业类别" name="industryType" rules={[{ required: true, message: '请选择产业类别' }]}>
              <Select options={INDUSTRY_TYPE_OPTIONS.map(v => ({ label: v, value: v }))} placeholder="请选择产业类别" />
            </Form.Item>
          </Col>

          <Col {...colProps}>
            <Form.Item label="行业类别" name="industryCategory" rules={[{ required: true, message: '请选择行业类别' }]}>
              <Cascader options={INDUSTRY_CASCADER_OPTIONS} placeholder="请选择行业类别" />
            </Form.Item>
          </Col>
          <Col {...colProps}>
            <Form.Item label="次要行业类别" name="secondaryIndustryCategory">
              <Cascader options={INDUSTRY_CASCADER_OPTIONS} placeholder="请选择次要行业类别" />
            </Form.Item>
          </Col>

          <Col span={24}>
            <Form.Item label="项目简介" name="projectDescription" labelCol={{ span: 4 }} wrapperCol={{ span: 20 }} rules={[{ required: true, message: '请输入项目简介' }]}>
              <TextArea rows={3} placeholder="请输入项目简介" maxLength={999} showCount />
            </Form.Item>
          </Col>
        </Row>

        <SectionHeader title="在谈阶段信息" />
        <Row gutter={24}>
          <Col {...colProps}>
            <Form.Item label="项目分类" name="projectCategory" rules={[{ required: true, message: '请选择项目分类' }]}>
              <Select options={['政策类', '投资类', '供地类', '其他'].map(v => ({ label: v, value: v }))} placeholder="请选择项目分类" />
            </Form.Item>
          </Col>
          <Col {...colProps}>
            <Form.Item label="计划投资总额(亿元)" name="investAmount" rules={[{ required: true, message: '请输入金额' }]}>
              <InputNumber style={{ width: '100%' }} placeholder="亿元" min={0} precision={2} addonAfter="亿元" />
            </Form.Item>
          </Col>

          {watchedProjectCategory === '投资类' && (
            <Col {...colProps}>
              <Form.Item label="需投资金额(亿元)" name="needInvestAmount" rules={[{ required: true, message: '请输入金额' }]}>
                <InputNumber style={{ width: '100%' }} placeholder="亿元" min={0} precision={2} addonAfter="亿元" />
              </Form.Item>
            </Col>
          )}
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
            <Form.Item label="企业类别" name="enterpriseCategory" rules={[{ required: true, message: '请选择企业类别' }]}>
              <Select options={ENTERPRISE_CATEGORY_OPTIONS.map(v => ({ label: v, value: v }))} placeholder="请选择企业类别" showSearch />
            </Form.Item>
          </Col>

          <Col {...colProps}>
            <Form.Item label="是否为存量企业" name="isStock" rules={[{ required: true, message: '请选择' }]}>
              <Radio.Group options={radioOptions} />
            </Form.Item>
          </Col>
          <Col {...colProps}>
            <Form.Item label="注册资本(亿元)" name="registeredCapitalAmount">
              <InputNumber style={{ width: '100%' }} placeholder="亿元" min={0} precision={2} addonAfter="亿元" />
            </Form.Item>
          </Col>

          <Col {...colProps}>
            <Form.Item label="是否飞地园区" name="isEnclave" rules={[{ required: true, message: '请选择' }]}>
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
              <Select options={CHUSHANG_TYPE_OPTIONS.map(v => ({ label: v, value: v }))} placeholder="请选择" allowClear />
            </Form.Item>
          </Col>
        </Row>

        <SectionHeader title="签约阶段信息" />
        <Row gutter={24}>
          <Col {...colProps}>
            <Form.Item label="建设性质" required labelCol={{ span: 8 }} wrapperCol={{ span: 16 }}>
              <div style={{ display: 'flex', gap: 8 }}>
                <Form.Item name="constructionNature" noStyle rules={[{ required: true, message: '请选择' }]}>
                  <Select style={{ flex: 1 }} placeholder="请选择" options={CONSTRUCTION_NATURE_OPTIONS.map(v => ({ label: v, value: v }))} />
                </Form.Item>
                <Form.Item name="constructionNatureLevel2" noStyle rules={[{ required: true, message: '请选择' }]}>
                  <Select style={{ flex: 1 }} placeholder="请选择" options={['固投开工类', '开业营业类'].map(v => ({ label: v, value: v }))} />
                </Form.Item>
              </div>
            </Form.Item>
          </Col>
          <Col {...colProps}>
            <Form.Item label="招商类型" name="merchantType" rules={[{ required: true, message: '请选择招商类型' }]}>
              <Select options={MERCHANT_TYPE_OPTIONS.map(v => ({ label: v, value: v }))} placeholder="请选择招商类型" />
            </Form.Item>
          </Col>

          <Col span={24}>
            <Form.Item label="招商类型说明" name="merchantTypeDesc" labelCol={{ span: 4 }} wrapperCol={{ span: 20 }} rules={[{ max: 100, message: '不超过100字' }]}>
              <Input placeholder="请输入招商类型说明（选填）" maxLength={100} showCount />
            </Form.Item>
          </Col>

          <Col {...colProps}>
            <Form.Item label="是否浙商" name="isZheshang" rules={[{ required: true, message: '请选择' }]}>
              <Radio.Group options={radioOptions} />
            </Form.Item>
          </Col>
          <Col {...colProps}>
            <Form.Item label="用地情况" name="landSituation" rules={[{ required: true, message: '请选择用地情况' }]}>
              <Select options={LAND_SITUATION_SELECT_OPTIONS} placeholder="请选择用地情况" />
            </Form.Item>
          </Col>

          <Col {...colProps}>
            <Form.Item label="是否总部经济" name="isHqEconomy" rules={[{ required: true, message: '请选择' }]}>
              <Radio.Group options={radioOptions} />
            </Form.Item>
          </Col>
          {watchedIsHqEconomy === '是' && (
            <Col span={24}>
              <Form.Item label="总部经济类型" labelCol={{ span: 4 }} wrapperCol={{ span: 20 }}>
                <Row gutter={8}>
                  <Col span={12}>
                    <Form.Item name="hqEconomyLevel1" noStyle>
                      <Select placeholder="请选择一级（选填）" allowClear options={HQ_ECONOMY_LEVEL1_OPTIONS.map(v => ({ label: v, value: v }))} />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item name="hqEconomyLevel2" noStyle>
                      <Select placeholder="请选择二级（选填）" allowClear options={HQ_ECONOMY_LEVEL2_OPTIONS.map(v => ({ label: v, value: v }))} />
                    </Form.Item>
                  </Col>
                </Row>
              </Form.Item>
            </Col>
          )}

          <Col {...colProps}>
            <Form.Item label="备案证金额(亿元)" name="recordAmount" rules={[{ required: true, message: '请输入金额' }]}>
              <InputNumber style={{ width: '100%' }} placeholder="亿元" min={0} precision={2} addonAfter="亿元" />
            </Form.Item>
          </Col>
          <Col {...colProps}>
            <Form.Item label="固投金额(亿元)" name="fixedInvestAmount" rules={[{ required: true, message: '请输入金额' }]}>
              <InputNumber style={{ width: '100%' }} placeholder="亿元" min={0} precision={2} addonAfter="亿元" />
            </Form.Item>
          </Col>

          <Col {...colProps}>
            <Form.Item label="协议签订时间" name="agreementSignDate" rules={[{ required: true, message: '请选择日期' }]}>
              <DatePicker style={{ width: '100%' }} placeholder="请选择日期" />
            </Form.Item>
          </Col>
          <Col {...colProps}>
            <Form.Item label="协议类型" name="agreementType" rules={[{ required: true, message: '请选择' }]}>
              <Select options={AGREEMENT_TYPE_OPTIONS.map(v => ({ label: v, value: v }))} placeholder="请选择" />
            </Form.Item>
          </Col>

          <Col span={24}>
            <Form.Item label="协议凭证附件" name="agreementAttachments" labelCol={{ span: 4 }} wrapperCol={{ span: 20 }}>
              <Upload {...createUploadProps(agreementFileList, setAgreementFileList)}>
                <Button icon={<UploadOutlined />}>点击上传</Button>
              </Upload>
            </Form.Item>
          </Col>

          <Col {...colProps}>
            <Form.Item label="是否注册" name="isRegister" rules={[{ required: true, message: '请选择' }]}>
              <Radio.Group
                options={radioOptions}
                onChange={(e) => {
                  if (e.target.value === '否') {
                    form.setFieldsValue({ registerDate: undefined, registerCapitalAmount: undefined, registerCapitalUnit: undefined, registerCompanyName: undefined })
                  }
                }}
              />
            </Form.Item>
          </Col>

          {watchedIsRegister === '是' && (
            <>
              <Col {...colProps}>
                <Form.Item label="注册时间" name="registerDate" rules={[{ required: true, message: '请选择日期' }]}>
                  <DatePicker style={{ width: '100%' }} placeholder="请选择日期" />
                </Form.Item>
              </Col>
              <Col {...colProps}>
                <Form.Item label="注册资本" required>
                  <Input.Group compact>
                    <Form.Item name="registerCapitalAmount" noStyle rules={[{ required: true, message: '请输入金额' }]}>
                      <InputNumber style={{ width: 'calc(100% - 100px)' }} placeholder="金额" min={0} precision={2} />
                    </Form.Item>
                    <Form.Item name="registerCapitalUnit" noStyle rules={[{ required: true, message: '请选择单位' }]}>
                      <Select style={{ width: 100 }} placeholder="单位" options={CAPITAL_UNIT_OPTIONS.map(v => ({ label: v, value: v }))} />
                    </Form.Item>
                  </Input.Group>
                </Form.Item>
              </Col>
              <Col {...colProps}>
                <Form.Item label="注册公司名称" name="registerCompanyName" rules={[{ required: true, message: '请输入' }]}>
                  <Input placeholder="请输入公司名称" />
                </Form.Item>
              </Col>
            </>
          )}

          <Col {...colProps}>
            <Form.Item label="签约主体" name="signSubject" rules={[{ required: true, message: '请输入签约主体' }]}>
              <Input placeholder="请输入签约主体" />
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Modal>
  )
}
