// =============================================
// 绩效考核模块 - 基础数据
// =============================================

// ---- 考核对象枚举 ----

export const ASSESS_TYPES = {
  PARK: 'park',
  SOE: 'soe',
  DEPT: 'dept',
}

export const ASSESS_TYPE_LABELS = {
  park: '园区',
  soe: '国企',
  dept: '部门',
}

export const PARKS = [
  { key: 'swc', name: '生物城' },
  { key: 'wlc', name: '未来城' },
  { key: 'zbq', name: '综保区' },
  { key: 'gdy', name: '光电园' },
  { key: 'fwy', name: '服务业园' },
  { key: 'zzy', name: '智造园' },
  { key: 'zhy', name: '中华园' },
  { key: 'zxc', name: '中心城' },
]

export const SOES = [
  { key: 'gk', name: '高科集团' },
  { key: 'skt', name: '省科投' },
  { key: 'ggjk', name: '光谷金控' },
  { key: 'ggjt', name: '光谷交通' },
]

export const DEPTS = [
  { key: 'zzb', name: '组织部', targets: ['推动人才专项落地项目不少于2个'] },
  { key: 'xcb', name: '宣传部', targets: ['招引不少于5个文化创意类项目入库'] },
  { key: 'fgj', name: '发改局', targets: ['推动招商项目上报国家部委行业指导不少于2个', '推动四新服务业重大专项落地项目不少于5个'] },
  { key: 'kcj', name: '科创局', targets: ['招引不少于10个人工智能、机器人领域关键项目入库'] },
  { key: 'qfj', name: '企服局', targets: ['推动不少于8个重点产业项目落地投产'] },
  { key: 'ghj', name: '规划局', targets: ['保障不少于6个重大项目用地需求'] },
  { key: 'jsj', name: '建设局', targets: ['完成不少于4个产业园区基础设施建设'] },
  { key: 'jrj', name: '金融局', targets: ['推动不少于3家企业完成上市辅导'] },
  { key: 'zmgg', name: '自贸改革创新局', targets: ['推动不少于5项制度创新成果落地'] },
]

// ---- 园区考核指标定义 ----

export const PARK_INDICATORS = [
  { key: 'signAmount', label: '签约金额', unit: '亿元', type: 'target' },
  { key: 'startProject', label: '开工开业项目', unit: '个', type: 'target' },
  { key: 'fdi', label: '外商直接投资(FDI)', unit: '万美元', type: 'target' },
  { key: 'eventCount', label: '举办招商活动', unit: '场', type: 'cumulative' },
]

// ---- 国企考核指标定义 ----

export const SOE_INDICATORS = [
  { key: 'dueDiligence', label: '开展尽调项目', unit: '个', type: 'target' },
  { key: 'subscriptionAmount', label: '项目认缴总额', unit: '亿元', type: 'target' },
  { key: 'investAmount', label: '项目出资总额', unit: '亿元', type: 'target' },
  { key: 'industryProject', label: '引进产业链项目', unit: '个', type: 'target' },
  { key: 'brandEvent', label: '品牌活动', unit: '场', type: 'target' },
]

// ---- 考核周期 ----

export const ASSESS_CYCLES = [
  { key: '2026', label: '2026年度' },
  { key: '2026-Q1', label: '2026年第一季度' },
]

// ---- 考核年份选项 ----

export const ASSESS_YEARS = ['2026', '2025', '2024']

// ---- 考核月份选项（支持按月筛选）----

export const ASSESS_MONTHS = [
  { key: 'all', label: '全部' },
  { key: '2026-01', label: '1月' },
  { key: '2026-02', label: '2月' },
  { key: '2026-03', label: '3月' },
  { key: '2026-04', label: '4月' },
  { key: '2026-05', label: '5月' },
  { key: '2026-06', label: '6月' },
]

// ---- Mock 月度细分数据 ----

/**
 * 各园区月度指标明细（用于时间筛选和通报数据支撑）
 */
export const PARK_TARGETS = [
  { key: 'swc', name: '生物城', period: '2026年度', signAmount: { target: 120, done: 86.4 }, startProject: { target: 8, done: 5 }, fdi: { target: 5000, done: 3200 }, meetCount: { done: 42, target: 60 }, tripCount: { done: 18, target: 25 }, weeklySign: { done: 28, target: 40 }, eventCount: { done: 6, target: 10 } },
  { key: 'wlc', name: '未来城', period: '2026年度', signAmount: { target: 100, done: 78.0 }, startProject: { target: 6, done: 4 }, fdi: { target: 4000, done: 2800 }, meetCount: { done: 35, target: 55 }, tripCount: { done: 14, target: 22 }, weeklySign: { done: 24, target: 36 }, eventCount: { done: 5, target: 8 } },
  { key: 'zbq', name: '综保区', period: '2026年第一季度', signAmount: { target: 80, done: 72.0 }, startProject: { target: 5, done: 5 }, fdi: { target: 8000, done: 7600 }, meetCount: { done: 30, target: 50 }, tripCount: { done: 12, target: 20 }, weeklySign: { done: 32, target: 38 }, eventCount: { done: 7, target: 9 } },
  { key: 'gdy', name: '光电园', period: '2026年度', signAmount: { target: 90, done: 54.0 }, startProject: { target: 7, done: 3 }, fdi: { target: 3500, done: 1750 }, meetCount: { done: 28, target: 45 }, tripCount: { done: 10, target: 18 }, weeklySign: { done: 20, target: 30 }, eventCount: { done: 4, target: 7 } },
  { key: 'fwy', name: '服务业园', period: '2025年度', signAmount: { target: 60, done: 48.0 }, startProject: { target: 4, done: 3 }, fdi: { target: 2000, done: 1200 }, meetCount: { done: 22, target: 38 }, tripCount: { done: 8, target: 15 }, weeklySign: { done: 18, target: 25 }, eventCount: { done: 3, target: 6 } },
  { key: 'zzy', name: '智造园', period: '2026年度', signAmount: { target: 110, done: 82.5 }, startProject: { target: 8, done: 6 }, fdi: { target: 4500, done: 3600 }, meetCount: { done: 38, target: 58 }, tripCount: { done: 16, target: 24 }, weeklySign: { done: 30, target: 42 }, eventCount: { done: 6, target: 10 } },
  { key: 'zhy', name: '中华园', period: '2025年度', signAmount: { target: 50, done: 27.5 }, startProject: { target: 3, done: 1 }, fdi: { target: 1500, done: 600 }, meetCount: { done: 15, target: 30 }, tripCount: { done: 6, target: 12 }, weeklySign: { done: 12, target: 20 }, eventCount: { done: 2, target: 5 } },
  { key: 'zxc', name: '中心城', period: '2026年度', signAmount: { target: 70, done: 49.0 }, startProject: { target: 5, done: 3 }, fdi: { target: 2500, done: 1500 }, meetCount: { done: 25, target: 42 }, tripCount: { done: 9, target: 16 }, weeklySign: { done: 22, target: 32 }, eventCount: { done: 4, target: 7 } },
]

/**
 * 各区属国企月度指标明细
 */
export const SOE_TARGETS = [
  { key: 'gk', name: '高科集团', period: '2026年度', dueDiligence: { target: 12, done: 8 }, subscriptionAmount: { target: 50, done: 35.0 }, investAmount: { target: 30, done: 21.0 }, industryProject: { target: 6, done: 4 }, brandEvent: { target: 4, done: 3 } },
  { key: 'skt', name: '省科投', period: '2026年第一季度', dueDiligence: { target: 10, done: 7 }, subscriptionAmount: { target: 40, done: 28.0 }, investAmount: { target: 25, done: 17.5 }, industryProject: { target: 5, done: 3 }, brandEvent: { target: 3, done: 2 } },
  { key: 'ggjk', name: '光谷金控', period: '2026年度', dueDiligence: { target: 8, done: 5 }, subscriptionAmount: { target: 35, done: 21.0 }, investAmount: { target: 20, done: 12.0 }, industryProject: { target: 4, done: 2 }, brandEvent: { target: 3, done: 2 } },
  { key: 'ggjt', name: '光谷交通', period: '2025年度', dueDiligence: { target: 6, done: 4 }, subscriptionAmount: { target: 25, done: 17.5 }, investAmount: { target: 15, done: 10.5 }, industryProject: { target: 3, done: 2 }, brandEvent: { target: 2, done: 1 } },
]

/**
 * 各部门招商目标与完成进度（含备注）
 */
export const DEPT_TARGETS = [
  { key: 'zzb', name: '组织部', targets: [{ text: '推动人才专项落地项目不少于2个', targetVal: 2, doneVal: 1, status: '进行中', period: '2026年度', remark: '已落地1个项目，另1个在洽谈阶段，预计Q3入库' }] },
  { key: 'xcb', name: '宣传部', targets: [{ text: '招引不少于5个文化创意类项目入库', targetVal: 5, doneVal: 3, status: '进行中', period: '2026年度', remark: '已入库3个文化IP项目，其中2个已完成注册' }] },
  { key: 'fgj', name: '发改局', targets: [{ text: '推动招商项目上报国家部委行业指导不少于2个', targetVal: 2, doneVal: 2, status: '已完成', period: '2026年度', remark: '光电子产业基建设备升级项目和四新服务业重大专项已获批复' }, { text: '推动四新服务业重大专项落地项目不少于5个', targetVal: 5, doneVal: 3, status: '进行中', period: '2026年第一季度', remark: '3个四新项目已落地，另外2个正在签约中' }] },
  { key: 'kcj', name: '科创局', targets: [{ text: '招引不少于10个人工智能、机器人领域关键项目入库', targetVal: 10, doneVal: 7, status: '进行中', period: '2026年度', remark: '已入库7个项目，其中3个为机器人赛道，4个为AI赛道' }] },
  { key: 'qfj', name: '企服局', targets: [{ text: '推动不少于8个重点产业项目落地投产', targetVal: 8, doneVal: 5, status: '进行中', period: '2026年度', remark: '5个项目已投产，剩余3个预计Q3可开工' }] },
  { key: 'ghj', name: '规划局', targets: [{ text: '保障不少于6个重大项目用地需求', targetVal: 6, doneVal: 4, status: '进行中', period: '2025年度', remark: '4个项目已完成用地审批，其余2个正在规划调整中' }] },
  { key: 'jsj', name: '建设局', targets: [{ text: '完成不少于4个产业园区基础设施建设', targetVal: 4, doneVal: 2, status: '进行中', period: '2026年度', remark: '智造园二期和生物城三期已完工，另2个在建' }] },
  { key: 'jrj', name: '金融局', targets: [{ text: '推动不少于3家企业完成上市辅导', targetVal: 3, doneVal: 1, status: '进行中', period: '2025年度', remark: '1家企业已进入申报阶段，2家在准备材料' }] },
  { key: 'zmgg', name: '自贸改革创新局', targets: [{ text: '推动不少于5项制度创新成果落地', targetVal: 5, doneVal: 3, status: '进行中', period: '2026年度', remark: '3项成果已获市级推广，2项正在申报省级试点' }] },
]

// ---- 全区汇总总指标（用于Word通报数据）----

export const GLOBAL_TOTALS = {
  billionProjects: 156,   // 亿元项目数
  signAmount: 466.9,      // 签约额（亿元）
  fundArrival: 189.3,     // 到位资金（亿元）
  startCount: 30,         // 开工数（个）
  fdi: 24250,             // FDI（万美元）
  cityRanking: 1,         // 全市排位
}

/**
 * 园区月度见商/出差/活动明细（支撑"各园区上半年见商、出差及活动情况"表）
 */
export const PARK_ACTIVITY_DETAIL = [
  { park: '生物城', meetCount: 42, tripCount: 18, weeklySignCount: 28, eventCount: 6, enterpriseContacts: 120, clueCount: 35 },
  { park: '未来城', meetCount: 35, tripCount: 14, weeklySignCount: 24, eventCount: 5, enterpriseContacts: 95, clueCount: 28 },
  { park: '综保区', meetCount: 30, tripCount: 12, weeklySignCount: 32, eventCount: 7, enterpriseContacts: 85, clueCount: 22 },
  { park: '光电园', meetCount: 28, tripCount: 10, weeklySignCount: 20, eventCount: 4, enterpriseContacts: 78, clueCount: 20 },
  { park: '服务业园', meetCount: 22, tripCount: 8, weeklySignCount: 18, eventCount: 3, enterpriseContacts: 60, clueCount: 15 },
  { park: '智造园', meetCount: 38, tripCount: 16, weeklySignCount: 30, eventCount: 6, enterpriseContacts: 110, clueCount: 32 },
  { park: '中华园', meetCount: 15, tripCount: 6, weeklySignCount: 12, eventCount: 2, enterpriseContacts: 40, clueCount: 10 },
  { park: '中心城', meetCount: 25, tripCount: 9, weeklySignCount: 22, eventCount: 4, enterpriseContacts: 70, clueCount: 18 },
]

/**
 * 各园区上半年重点招商活动清单
 */
export const PARK_KEY_EVENTS = [
  { park: '生物城', events: ['生物医药产业对接会(2月)','国际医疗峰会(4月)','全球药企武汉行(6月)'] },
  { park: '未来城', events: ['数字经济创新发展大会(1月)','AI技术论坛(3月)','青年创客马拉松(5月)'] },
  { park: '综保区', events: ['跨境电商贸易促进月(2月)','外贸型企业对接会(4月)','进出口政策宣讲会(6月)'] },
  { park: '光电园', events: ['光电子信息产业招商推介会(1月)','半导体产业链对接会(3月)','智能制造博览会(5月)'] },
  { park: '服务业园', events: ['现代服务业发展大会(2月)','金融服务实体经济论坛(4月)','文旅产业合作洽谈会(6月)'] },
  { park: '智造园', events: ['高端装备制造业峰会(1月)','新能源汽车产业链大会(3月)','机器人产业发展论坛(5月)'] },
  { park: '中华园', events: ['传统文化创意设计展(2月)','文创企业投资说明会(4月)'] },
  { park: '中心城', events: ['总部经济招商大会(1月)','楼宇经济发展研讨会(3月)','营商环境优化发布会(5月)'] },
]

/**
 * 职能部门招商目标完成情况（含落地成果和项目清单）
 */
export const DEPT_LANDING_RESULTS = [
  { deptKey: 'zzb', deptName: '组织部', landingResults: ['东湖高新区高层次人才创业项目1个','光谷科技人才孵化基地项目1个'], inStockProjects: ['东湖高新区高层次人才创业项目'], pendingProjects: ['光谷科技人才孵化基地项目'] },
  { deptKey: 'xcb', deptName: '宣传部', landingResults: ['楚天文化创意产业园','光谷数字内容制作中心'], inStockProjects: ['楚天文化创意产业园','光谷数字内容制作中心','光谷游戏研发基地'], pendingProjects: [] },
  { deptKey: 'fgj', deptName: '发改局', landingResults: ['光谷四新服务业综合体','华中物流中心升级改造项目'], inStockProjects: ['光谷四新服务业综合体','华中物流中心升级改造项目','光谷冷链物流基地'], pendingProjects: ['光谷供应链金融平台','光谷新能源服务中心'] },
  { deptKey: 'kcj', deptName: '科创局', landingResults: ['华科机器人研究院项目','光谷AI算力中心','武汉人工智能实验室扩产项目'], inStockProjects: ['华科机器人研究院项目','光谷AI算力中心','武汉人工智能实验室扩产项目','光谷智能传感器生产基地','光谷AI芯片设计中心'], pendingProjects: [] },
  { deptKey: 'qfj', deptName: '企服局', landingResults: ['光谷智能制造示范基地','高新科技企业加速器','光谷生物医药产业园'], inStockProjects: ['光谷智能制造示范基地','高新科技企业加速器','光谷生物医药产业园','光谷医疗器械生产基地'], pendingProjects: [] },
  { deptKey: 'ghj', deptName: '规划局', landingResults: [], inStockProjects: ['光谷科技创新走廊用地方案','智能制造产业带规划调整方案'], pendingProjects: ['光谷总部经济区用地预审','光谷交通枢纽规划调整'] },
  { deptKey: 'jsj', deptName: '建设局', landingResults: ['智造园二期基础设施','生物城三期道路工程'], inStockProjects: ['智造园二期基础设施','生物城三期道路工程'], pendingProjects: [] },
  { deptKey: 'jrj', deptName: '金融局', landingResults: [], inStockProjects: ['光谷上市企业培育库'], pendingProjects: ['光谷科创金融中心','光谷科技银行'] },
  { deptKey: 'zmgg', deptName: '自贸改革创新局', landingResults: ['自贸区跨境贸易便利化改革试点','光谷海关监管新模式'], inStockProjects: ['自贸区跨境贸易便利化改革试点','光谷海关监管新模式','光谷市场准入负面清单制度改革'], pendingProjects: [] },
]

// ---- 全区招商活动汇总（供通报使用）----

export const GLOBAL_EVENTS_SUMMARY = {
  totalMeetCount: 235,    // 全区见商次数
  totalTripCount: 93,     // 全区出差批次
  weeklySignCount: 186,   // 周周有签约场次
  keyEventCount: 24,      // 重点招商活动场次
  totalEnterpriseContacts: 658, // 对接企业总数
  totalClueCount: 180,    // 线索总数
  keyEvents: [
    { name: '2026光谷光电子信息产业招商推介会', location: '深圳', date: '2026-02-15', enterpriseCount: 45, clueCount: 12 },
    { name: '全球药企武汉行', location: '上海', date: '2026-04-10', enterpriseCount: 35, clueCount: 10 },
    { name: '数字经济创新发展大会', location: '北京', date: '2026-03-20', enterpriseCount: 50, clueCount: 15 },
    { name: '智能制造产业链对接会', location: '苏州', date: '2026-05-08', enterpriseCount: 40, clueCount: 11 },
    { name: '外资企业圆桌会议', location: '武汉', date: '2026-01-25', enterpriseCount: 20, clueCount: 5 },
    { name: '金融科技创新发展论坛', location: '广州', date: '2026-06-12', enterpriseCount: 30, clueCount: 8 },
  ],
}

/**
 * 国企月度指标明细
 */
export const SOE_MONTHLY_DATA = [
  { soe: '高科集团', dueDiligence: 8, subscriptionAmount: 35.0, investAmount: 21.0, industryProject: 4, brandEvent: 3 },
  { soe: '省科投', dueDiligence: 7, subscriptionAmount: 28.0, investAmount: 17.5, industryProject: 3, brandEvent: 2 },
  { soe: '光谷金控', dueDiligence: 5, subscriptionAmount: 21.0, investAmount: 12.0, industryProject: 2, brandEvent: 2 },
  { soe: '光谷交通', dueDiligence: 4, subscriptionAmount: 17.5, investAmount: 10.5, industryProject: 2, brandEvent: 1 },
]

// ---- 见商记录 Mock（供日常填报使用）----

export const MEET_RECORDS = [
  { id: 'm1', date: '2026-08-28', level: '一把手', city: '武汉', enterprise: '华为技术有限公司', type: '见商', dept: '生物城', content: '洽谈华为光电子产业链项目落地事宜', result: '获取线索' },
  { id: 'm2', date: '2026-08-25', level: '分管委领导', city: '深圳', enterprise: '腾讯科技', type: '出差', dept: '未来城', content: '拜访腾讯云计算事业部', result: '推进签约' },
  { id: 'm3', date: '2026-08-22', level: '班子成员', city: '武汉', enterprise: '长江存储', type: '见商', dept: '光电园', content: '商讨存储芯片二期扩产项目', result: '解决困难' },
  { id: 'm4', date: '2026-08-20', level: '一把手', city: '上海', enterprise: '中芯国际', type: '出差', dept: '智造园', content: '考察中芯国际上海工厂', result: '获取线索' },
  { id: 'm5', date: '2026-08-18', level: '分管委领导', city: '武汉', enterprise: '小米集团', type: '见商', dept: '中心城', content: '小米智能终端产业链项目选址', result: '推进签约' },
  { id: 'm6', date: '2026-08-15', level: '班子成员', city: '北京', enterprise: '京东方科技', type: '出差', dept: '光电园', content: '洽谈OLED产线项目', result: '获取线索' },
  { id: 'm7', date: '2026-08-12', level: '一把手', city: '武汉', enterprise: '药明康德', type: '见商', dept: '生物城', content: '药明康德武汉研发基地扩建', result: '解决困难' },
  { id: 'm8', date: '2026-08-10', level: '分管委领导', city: '杭州', enterprise: '海康威视', type: '出差', dept: '未来城', content: '安防AI项目合作洽谈', result: '推进签约' },
]

// ---- 招商活动记录 Mock（供日常填报使用）----

export const EVENT_RECORDS = [
  { id: 'e1', name: '2026光谷光电子信息产业招商推介会', date: '2026-08-26', location: '深圳', enterpriseCount: 45, clueCount: 12, isKey: true, detail: '聚焦光电子信息产业链，邀请45家上下游企业参会，达成12个合作意向' },
  { id: 'e2', name: '生物医药产业座谈会', date: '2026-08-20', location: '武汉', enterpriseCount: 20, clueCount: 5, isKey: false, detail: '组织生物医药领域企业家座谈，了解产业发展需求' },
  { id: 'e3', name: '智能制造产业链对接会', date: '2026-08-15', location: '上海', enterpriseCount: 35, clueCount: 8, isKey: true, detail: '对接上海智能制造龙头企业，推动产业链项目落地' },
  { id: 'e4', name: '外资企业圆桌会议', date: '2026-08-08', location: '武汉', enterpriseCount: 15, clueCount: 3, isKey: false, detail: '与在汉外资企业座谈，了解投资动态' },
]

// ---- 工具函数 ----

/**
 * 计算完成率
 */
export function calcRate(done, target) {
  if (!target || target === 0) return 0
  return Math.round((done / target) * 100)
}

/**
 * 获取完成率颜色
 */
export function getRateColor(rate) {
  if (rate >= 80) return '#52c41a'
  if (rate >= 60) return '#1677ff'
  if (rate >= 40) return '#faad14'
  return '#ff4d4f'
}

/**
 * 获取完成率状态标签
 */
export function getRateStatus(rate) {
  if (rate >= 100) return { label: '已超额', color: '#52c41a' }
  if (rate >= 80) return { label: '进展良好', color: '#1677ff' }
  if (rate >= 60) return { label: '正常推进', color: '#faad14' }
  return { label: '需关注', color: '#ff4d4f' }
}

/**
 * 计算园区综合得分（加权平均完成率）
 */
export function calcParkScore(row) {
  const weights = { signAmount: 0.25, fundArrival: 0.25, startProject: 0.2, fdi: 0.15, meetCount: 0.05, tripCount: 0.03, weeklySign: 0.05, eventCount: 0.07 }
  let totalScore = 0
  for (const [key, weight] of Object.entries(weights)) {
    const ind = PARK_INDICATORS.find(i => i.key === key)
    if (ind?.type === 'target') {
      const r = calcRate(row[key]?.done || 0, row[key]?.target || 1)
      totalScore += Math.min(r, 120) * weight
    } else {
      // 累计类指标取一个基准分
      totalScore += 70 * weight
    }
  }
  return Math.round(totalScore)
}

/**
 * 计算国企综合得分
 */
export function calcSoeScore(row) {
  const weights = { dueDiligence: 0.2, subscriptionAmount: 0.25, investAmount: 0.25, industryProject: 0.2, brandEvent: 0.1 }
  let totalScore = 0
  for (const [key, weight] of Object.entries(weights)) {
    const r = calcRate(row[key]?.done || 0, row[key]?.target || 1)
    totalScore += Math.min(r, 120) * weight
  }
  return Math.round(totalScore)
}
