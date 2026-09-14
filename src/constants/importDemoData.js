// 导入判重演示数据：模拟一次Excel导入的解析与判重结果
// 共12条数据：9条成功入库、2条疑似重复转研判池（L1×1、L3×1）、1条格式错误跳过

const now = new Date()
const pad = (n) => String(n).padStart(2, '0')
export const TODAY = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`
export const NOW_TIME = `${TODAY} ${pad(now.getHours())}:${pad(now.getMinutes())}`

// 冲突等级标签（与研判池列表/详情页保持一致）
export const CONFLICT_LEVELS = {
  L1: { label: 'L1-强匹配', color: 'red' },
  L2: { label: 'L2-高相似', color: 'orange' },
  L3: { label: 'L3-中风险', color: 'gold' },
  L4: { label: 'L4-弱提示', color: 'blue' },
}

// 成功入库的9个项目（中文键同时兼容在谈/签约列表的字段读取）
const SUCCESS_SEEDS = [
  { name: '高端医疗器械生产基地项目', industry: '生物医药', industryType: '大健康和生物技术', amount: 3.5, area: '东湖高新区', nature: '民企', investor: '武汉迈瑞医疗科技有限公司', source: '珠三角', desc: '拟投资3.5亿元建设高端医疗器械生产基地，覆盖体外诊断设备与微创手术器械产线。' },
  { name: '新型显示材料研发中心项目', industry: '光电子信息', industryType: '光电子信息', amount: 2.8, area: '东湖高新区', nature: '国企（地方）', investor: '武汉光电显示材料研究院', source: '武汉本地', desc: '拟投资2.8亿元建设新型显示材料研发中心，聚焦OLED发光材料与量子点技术。' },
  { name: '工业互联网平台建设项目', industry: '数字经济', industryType: '软件与信息服务', amount: 1.5, area: '东湖高新区', nature: '民企', investor: '武汉工互科技有限公司', source: '长三角', desc: '拟投资1.5亿元建设区域工业互联网平台，为制造业企业提供数字化改造服务。' },
  { name: '氢能源装备制造项目', industry: '新能源', industryType: '节能环保与新能源', amount: 6.2, area: '东湖高新区', nature: '民企', investor: '武汉氢能装备有限公司', source: '京津冀', desc: '拟投资6.2亿元建设氢燃料电池电堆及配套装备制造基地。' },
  { name: '人工智能算力中心项目', industry: '数字经济', industryType: '人工智能', amount: 8.0, area: '东湖高新区', nature: '国企（央企）', investor: '中国电信数字科技分公司', source: '武汉本地', desc: '拟投资8亿元建设智算中心，规划算力规模1000P，服务区域内AI企业。' },
  { name: '跨境电商产业园项目', industry: '现代物流', industryType: '现代服务业', amount: 1.8, area: '东湖高新区', nature: '民企', investor: '武汉跨境贸易服务有限公司', source: '长三角', desc: '拟投资1.8亿元建设跨境电商产业园，含保税仓与直播电商基地。' },
  { name: '精密光学元器件制造项目', industry: '光电子信息', industryType: '光电子信息', amount: 2.3, area: '东湖高新区', nature: '外企', investor: '蔡司光学（武汉）有限公司', source: '外资', desc: '拟投资2.3亿元建设精密光学元器件制造基地，主产高端镜头与光学模组。' },
  { name: '绿色低碳建材生产基地项目', industry: '节能环保', industryType: '节能环保与新能源', amount: 3.0, area: '东湖高新区', nature: '民企', investor: '武汉绿色建材集团有限公司', source: '武汉本地', desc: '拟投资3亿元建设绿色低碳建材生产基地，主产装配式建筑构件。' },
  { name: '数字经济产业孵化器项目', industry: '数字经济', industryType: '软件与信息服务', amount: 1.2, area: '东湖高新区', nature: '国企（地方）', investor: '武汉光谷产业发展有限公司', source: '武汉本地', desc: '拟投资1.2亿元建设数字经济产业孵化器，提供办公载体与投融资服务。' },
]

/**
 * 构造一次导入的完整结果
 * @param {Object} params { stage: 'zaitan'|'qianyue', stageLabel: '在谈'|'签约', importUser: 'xx-xx' }
 */
export function buildImportResult({ stage, stageLabel, importUser, importSource }) {
  const source = importSource || importUser

  const successProjects = SUCCESS_SEEDS.map((s, i) => ({
    id: `imp-${stage}-${i + 1}`,
    '项目名称': s.name,
    '项目区域': s.area,
    '来源地': s.source,
    '内外资': s.nature === '外企' ? '外资' : '内资',
    '产业类别': s.industry,
    '行业类别': s.industryType,
    '行业类别（门类）': s.industryType,
    '投资主体': s.investor,
    '投资金额（亿元）': s.amount, // 在谈列表读取（全角括号）
    '投资金额(亿元)': s.amount,   // 签约列表读取（半角括号）
    '企业性质': s.nature,
    '项目简介': s.desc,
    '申报人': importUser,
    '申报时间': TODAY,
    '项目状态': stageLabel,
    ...(stage === 'qianyue' ? { '是否已签约': '是', '协议签订时间': TODAY, '协议类型': '投资协议' } : {}),
  }))

  // 冲突记录（同时携带列表字段与详情页比对字段）
  const conflicts = [
    {
      id: 'yp-007',
      newProjectId: 'new-007',
      existingProjectId: 22,
      newProjectName: '武汉智能网联汽车测试场项目',
      existingProjectName: '智能网联汽车封闭测试场项目',
      conflictLevel: 'L1',
      conflictReason: '市级项目编码相同（SJ-2026-0102），同一市级编码视为同一项目',
      aiSuggestion: '合并覆盖（推荐）：市级项目编码一致，系统判定为同一项目，建议以最新导入数据合并覆盖原项目',
      confidence: 0.97,
      status: 'pending',
      newStage: stageLabel,
      existingStage: stageLabel,
      importUser,
      importTime: NOW_TIME,
      cityProjectCode: 'SJ-2026-0102',
      investorEntity: '武汉车谷智行科技有限公司',
      investAmount: 12.0,
      existingInvestAmount: 10.5,
      newData: {
        cityProjectCode: 'SJ-2026-0102',
        projectName: '武汉智能网联汽车测试场项目',
        investorEntity: '武汉车谷智行科技有限公司',
        investAmount: 12.0,
        industryCategory: '新能源汽车',
        industryType: '新能源与智能网联汽车',
        importSource: source,
        reporter: importUser,
        reportTime: TODAY,
        projectDesc: '拟投资12亿元建设智能网联汽车开放测试场，含高速环道、城市模拟路段及车路协同验证系统。',
        contactPerson: '刘明',
        contactPhone: '139****3301',
        address: '东湖高新区智能制造园',
      },
      existingData: {
        cityProjectCode: 'SJ-2026-0102',
        projectName: '智能网联汽车封闭测试场项目',
        investorEntity: '武汉车谷智行科技有限公司',
        investAmount: 10.5,
        industryCategory: '新能源汽车',
        industryType: '新能源与智能网联汽车',
        importSource: '投促局',
        reporter: '投促局 易成豪',
        reportTime: '2026-06-20',
        projectDesc: '投资10.5亿元建设智能网联汽车封闭测试场，一期场地已建成投用。',
        contactPerson: '刘明',
        contactPhone: '139****3301',
        address: '东湖高新区智能制造园',
      },
    },
    {
      id: 'yp-008',
      newProjectId: 'new-008',
      existingProjectId: 17,
      newProjectName: '光电子芯片封装测试基地',
      existingProjectName: '光电芯片封装产业化项目',
      conflictLevel: 'L3',
      conflictReason: '项目名称相似度68%（低于85%）、投资主体相同、建设地址相同、投资金额偏差15%',
      aiSuggestion: '人工确认：名称相似度中等，可能为同一项目的不同表述或分期建设，请核对项目简介后决定',
      confidence: 0.66,
      status: 'pending',
      newStage: stageLabel,
      existingStage: stageLabel,
      importUser,
      importTime: NOW_TIME,
      investorEntity: '武汉光芯电子技术有限公司',
      investAmount: 4.2,
      existingInvestAmount: 4.9,
      newData: {
        projectName: '光电子芯片封装测试基地',
        investorEntity: '武汉光芯电子技术有限公司',
        investAmount: 4.2,
        industryCategory: '光电子信息',
        industryType: '光电子信息',
        importSource: source,
        reporter: importUser,
        reportTime: TODAY,
        projectDesc: '拟投资4.5亿元建设光电子芯片封装测试基地，含COB封装产线与可靠性实验室。',
        contactPerson: '陈工',
        contactPhone: '137****8866',
        address: '东湖高新区光谷芯中心',
      },
      existingData: {
        cityProjectCode: 'SJ-2026-0087',
        projectName: '光电芯片封装产业化项目',
        investorEntity: '武汉光芯电子技术有限公司',
        investAmount: 4.9,
        industryCategory: '光电子信息',
        industryType: '光电子信息',
        importSource: '光电园',
        reporter: '光电园-李工',
        reportTime: '2026-07-05',
        projectDesc: '投资4.9亿元建设光电芯片封装产业化基地，聚焦存储芯片与显示驱动芯片封装。',
        contactPerson: '陈工',
        contactPhone: '137****8866',
        address: '东湖高新区光谷芯中心',
      },
    },
  ]

  // 跳过的错误行
  const skipped = [
    { row: 7, reason: '投资金额格式错误（非数字），无法导入' },
  ]

  const levelCount = conflicts.reduce((acc, c) => {
    acc[c.conflictLevel] = (acc[c.conflictLevel] || 0) + 1
    return acc
  }, {})

  return {
    stage,
    stageLabel,
    successProjects,
    conflicts,
    skipped,
    summary: {
      success: successProjects.length,
      duplicate: conflicts.length,
      skipped: skipped.length,
      levelCount,
    },
    importTime: NOW_TIME,
  }
}
