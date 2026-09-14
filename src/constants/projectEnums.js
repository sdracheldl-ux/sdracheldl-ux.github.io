// 项目分类
export const PROJECT_CATEGORY_OPTIONS = ['政策类', '投资类', '供地类', '其他']

// 内外资
export const CAPITAL_NATURE_OPTIONS = ['内资', '外资']

// 产业类别
export const INDUSTRY_TYPE_OPTIONS = ['农业', '工业', '服务业']

// 企业性质
export const ENTERPRISE_NATURE_OPTIONS = ['国企（央企）', '国企（地方）', '民企', '外企（独资）', '外企(合资或合伙)']

// 企业类别
export const ENTERPRISE_CATEGORY_OPTIONS = [
  '省级高新技术企业', '国家级高新技术企业', '国家级专精特新', '省级专精特新',
  '省级瞪羚企业', '国家级瞪羚企业', '金种子', '省级独角兽', '国家级独角兽企业',
  '潜在独角兽', '世界500强', '中国500强', '中国民营500强', '中国服务业500强',
  '国家级专精特新"小巨人"', '省级专精特新"小巨人"', '中国制造业500强', '新经济500强', '其它'
]

// 是否存量企业
export const STOCK_ENTERPRISE_TYPE_OPTIONS = ['为存量企业新项目投资', '为存量企业技改投资', '其他']

// 注册资本单位
export const CAPITAL_UNIT_OPTIONS = ['万元', '亿元']

// 所属"五谷"优势产业集群
export const WUGU_OPTIONS = ['光谷优势产业集群', '车谷优势产业集群', '网谷优势产业集群', '星谷优势产业集群', '药谷优势产业集群', '不涉及']

// 所属片区
export const BELONG_AREA_OPTIONS = ['临空港片区', '阳逻港片区', '不涉及']

// 建设性质（第一层）
export const CONSTRUCTION_NATURE_OPTIONS = ['新建', '扩建', '改建', '技改', '开业', '其它']

// 建设性质第二层（独立选择，无联动）
export const CONSTRUCTION_NATURE_LEVEL2_OPTIONS = ['固投开工类', '开业营业类']

// 招商类型
export const MERCHANT_TYPE_OPTIONS = ['产业链招商', '资本链招商（股权融资）', '科创链招商', '场景招商', '央地合作', '人才招引（楚商校友）', '其它']

// 交办层级
export const ASSIGNED_LEVEL_OPTIONS = ['书记', '市长', '副市长', '非领导交办', '区主要领导', '区分管领导', '区投促局领导']

// 电话核实情况暂无枚举值，使用文本输入

// 楚商类型
export const CHUSHANG_TYPE_OPTIONS = ['湖北籍企业家', '武汉校友', '武大校友', '华科校友', '非楚商', '泛楚商']

// 问题类型（多选）
export const ISSUE_TYPE_OPTIONS = ['资金', '土地', '政策', '审批', '其他']

// 外溢来源（武汉各区）
export const OVERFLOW_SOURCE_OPTIONS = [
  '江岸区', '江汉区', '硚口区', '汉阳区', '武昌区', '青山区', '洪山区',
  '蔡甸区', '江夏区', '黄陂区', '新洲区', '东湖高新区', '武汉经开区',
  '武汉临空港', '长江新区'
]

// 国内省份/城市（简化版，用于来源地）
export const DOMESTIC_REGION_OPTIONS = [
  { value: '北京', label: '北京', children: [{ value: '北京市', label: '北京市' }] },
  { value: '上海', label: '上海', children: [{ value: '上海市', label: '上海市' }] },
  { value: '天津', label: '天津', children: [{ value: '天津市', label: '天津市' }] },
  { value: '重庆', label: '重庆', children: [{ value: '重庆市', label: '重庆市' }] },
  { value: '广东', label: '广东', children: [
    { value: '广州市', label: '广州市' }, { value: '深圳市', label: '深圳市' },
    { value: '珠海市', label: '珠海市' }, { value: '佛山市', label: '佛山市' },
    { value: '东莞市', label: '东莞市' }, { value: '中山市', label: '中山市' }
  ]},
  { value: '江苏', label: '江苏', children: [
    { value: '南京市', label: '南京市' }, { value: '苏州市', label: '苏州市' },
    { value: '无锡市', label: '无锡市' }, { value: '常州市', label: '常州市' },
    { value: '南通市', label: '南通市' }
  ]},
  { value: '浙江', label: '浙江', children: [
    { value: '杭州市', label: '杭州市' }, { value: '宁波市', label: '宁波市' },
    { value: '温州市', label: '温州市' }, { value: '嘉兴市', label: '嘉兴市' }
  ]},
  { value: '安徽', label: '安徽', children: [
    { value: '合肥市', label: '合肥市' }, { value: '芜湖市', label: '芜湖市' },
    { value: '蚌埠市', label: '蚌埠市' }
  ]},
  { value: '湖北', label: '湖北', children: [
    { value: '武汉市', label: '武汉市' }, { value: '宜昌市', label: '宜昌市' },
    { value: '襄阳市', label: '襄阳市' }, { value: '黄冈市', label: '黄冈市' }
  ]},
  { value: '湖南', label: '湖南', children: [
    { value: '长沙市', label: '长沙市' }, { value: '株洲市', label: '株洲市' }
  ]},
  { value: '四川', label: '四川', children: [
    { value: '成都市', label: '成都市' }, { value: '绵阳市', label: '绵阳市' }
  ]},
  { value: '山东', label: '山东', children: [
    { value: '济南市', label: '济南市' }, { value: '青岛市', label: '青岛市' },
    { value: '烟台市', label: '烟台市' }
  ]},
  { value: '河南', label: '河南', children: [
    { value: '郑州市', label: '郑州市' }, { value: '洛阳市', label: '洛阳市' }
  ]},
  { value: '福建', label: '福建', children: [
    { value: '福州市', label: '福州市' }, { value: '厦门市', label: '厦门市' },
    { value: '泉州市', label: '泉州市' }
  ]},
  { value: '河北', label: '河北', children: [
    { value: '石家庄市', label: '石家庄市' }, { value: '唐山市', label: '唐山市' }
  ]},
  { value: '陕西', label: '陕西', children: [{ value: '西安市', label: '西安市' }] },
  { value: '辽宁', label: '辽宁', children: [
    { value: '沈阳市', label: '沈阳市' }, { value: '大连市', label: '大连市' }
  ]},
]

// 国外国家列表（简化版）
export const FOREIGN_COUNTRY_OPTIONS = [
  '美国', '加拿大', '英国', '法国', '德国', '意大利', '西班牙', '荷兰', '比利时',
  '瑞士', '瑞典', '挪威', '丹麦', '芬兰', '日本', '韩国', '新加坡', '澳大利亚', '新西兰'
]

// 行业类别级联（门类→大类）
export const INDUSTRY_CASCADER_OPTIONS = [
  { value: '民生保障类', label: '民生保障类', children: [] },
  { value: '基础设施建设类', label: '基础设施建设类', children: [] },
  { value: '"光芯屏端网"新一代信息技术', label: '"光芯屏端网"新一代信息技术', children: [
    { value: '光通信', label: '光通信' }, { value: '高性能集成电路', label: '高性能集成电路' },
    { value: '新型显示', label: '新型显示' }, { value: '未来显示', label: '未来显示' },
    { value: '激光', label: '激光' }, { value: '信息通信设备及智能终端', label: '信息通信设备及智能终端' },
    { value: '大数据与云计算', label: '大数据与云计算' }, { value: '先进半导体', label: '先进半导体' },
    { value: '其他', label: '其他' }
  ]},
  { value: '软件和网络安全', label: '软件和网络安全', children: [
    { value: '网络安全', label: '网络安全' }, { value: '未来网络', label: '未来网络' },
    { value: '物联网', label: '物联网' }, { value: '自主可控软件', label: '自主可控软件' },
    { value: '软件信息服务', label: '软件信息服务' }, { value: '其他', label: '其他' },
    { value: '数字经济', label: '数字经济' }, { value: '网游电竞', label: '网游电竞' },
    { value: '直播电竞', label: '直播电竞' }
  ]},
  { value: '量子科技', label: '量子科技', children: [
    { value: '光量子芯片与通信', label: '光量子芯片与通信' }, { value: '量子感知', label: '量子感知' },
    { value: '量子计算', label: '量子计算' }, { value: '其他', label: '其他' }
  ]},
  { value: '高端装备', label: '高端装备', children: [
    { value: '3D打印与激光加工装备', label: '3D打印与激光加工装备' },
    { value: '海洋工程装备及高技术船舶', label: '海洋工程装备及高技术船舶' },
    { value: '飞机装备制造', label: '飞机装备制造' },
    { value: '轨道交通装备', label: '轨道交通装备' },
    { value: '高端舰船制造', label: '高端舰船制造' },
    { value: '智能家居', label: '智能家居' }, { value: '其他', label: '其他' },
    { value: '高速轨道交通', label: '高速轨道交通' }
  ]},
  { value: '大健康和生物技术', label: '大健康和生物技术', children: [
    { value: '生物医药', label: '生物医药' }, { value: '医疗器械', label: '医疗器械' },
    { value: '医药流通', label: '医药流通' }, { value: '健康服务', label: '健康服务' },
    { value: '健康食品', label: '健康食品' }, { value: '生物制造', label: '生物制造' },
    { value: '脑机接口', label: '脑机接口' }, { value: '其他', label: '其他' }
  ]},
  { value: '汽车制造和服务', label: '汽车制造和服务', children: [
    { value: '新能源汽车', label: '新能源汽车' },
    { value: '智能出行(含无人驾驶和网联汽车)', label: '智能出行(含无人驾驶和网联汽车)' },
    { value: '关键零部件', label: '关键零部件' },
    { value: '新型储能电池', label: '新型储能电池' },
    { value: '氢能', label: '氢能' }, { value: '其他', label: '其他' }
  ]},
  { value: '数字创意', label: '数字创意', children: [
    { value: '创意设计', label: '创意设计' }, { value: '网络文学', label: '网络文学' },
    { value: '影视音乐', label: '影视音乐' }, { value: '线上演播', label: '线上演播' },
    { value: '动漫游戏', label: '动漫游戏' }, { value: '数字出版', label: '数字出版' },
    { value: '元宇宙', label: '元宇宙' }, { value: '其他', label: '其他' }
  ]},
  { value: '深地深海深空', label: '深地深海深空', children: [
    { value: '地球深部勘探开发', label: '地球深部勘探开发' },
    { value: '深海装备', label: '深海装备' },
    { value: '传感网络开发', label: '传感网络开发' },
    { value: '深空对地探测', label: '深空对地探测' },
    { value: '其他', label: '其他' }
  ]},
  { value: '超级计算和人工智能', label: '超级计算和人工智能', children: [
    { value: '高性能计算', label: '高性能计算' },
    { value: '操作系统', label: '操作系统' },
    { value: '云服务和人工智能大模型', label: '云服务和人工智能大模型' },
    { value: '智能机器人', label: '智能机器人' },
    { value: '人形状机器人', label: '人形状机器人' },
    { value: '虚拟现实', label: '虚拟现实' },
    { value: '机器视觉', label: '机器视觉' },
    { value: '其他', label: '其他' }
  ]},
  { value: '绿色环保', label: '绿色环保', children: [
    { value: '高效节能', label: '高效节能' }, { value: '先进节能', label: '先进节能' },
    { value: '资源循环利用', label: '资源循环利用' }, { value: '其他', label: '其他' }
  ]},
  { value: '航空航天和空天信息', label: '航空航天和空天信息', children: [
    { value: '其他', label: '其他' }, { value: '低空经济', label: '低空经济' },
    { value: '北斗', label: '北斗' },
    { value: '地球空间信息应用服务', label: '地球空间信息应用服务' },
    { value: '地球空间信息产品开发', label: '地球空间信息产品开发' },
    { value: '地球空间信息平台建设', label: '地球空间信息平台建设' },
    { value: '航空装备', label: '航空装备' }, { value: '航天装备', label: '航天装备' }
  ]},
  { value: '电磁能', label: '电磁能', children: [
    { value: '电磁装备与制造', label: '电磁装备与制造' }, { value: '其他', label: '其他' }
  ]},
  { value: '文化旅游', label: '文化旅游', children: [
    { value: '文化', label: '文化' }, { value: '旅游', label: '旅游' },
    { value: '体育', label: '体育' }, { value: '教育', label: '教育' },
    { value: '其他', label: '其他' }
  ]},
  { value: '智能建造', label: '智能建造', children: [
    { value: '房建', label: '房建' }, { value: '市政', label: '市政' },
    { value: '水利', label: '水利' }, { value: '公路', label: '公路' },
    { value: '建筑服务', label: '建筑服务' }, { value: '其他', label: '其他' }
  ]},
  { value: '现代金融', label: '现代金融', children: [
    { value: '银行', label: '银行' }, { value: '保险', label: '保险' },
    { value: '证券', label: '证券' }, { value: '保理', label: '保理' },
    { value: '基金', label: '基金' }, { value: '其他', label: '其他' }
  ]},
  { value: '商贸物流', label: '商贸物流', children: [
    { value: '商务商贸', label: '商务商贸' }, { value: '商务会展', label: '商务会展' },
    { value: '商贸流通', label: '商贸流通' }, { value: '电子商务', label: '电子商务' },
    { value: '现代物流', label: '现代物流' }, { value: '航运物流', label: '航运物流' },
    { value: '港口物流', label: '港口物流' }, { value: '其他', label: '其他' }
  ]},
  { value: '新能源类', label: '新能源类', children: [
    { value: '海洋核能', label: '海洋核能' }, { value: '光伏发电', label: '光伏发电' },
    { value: '风能', label: '风能' }, { value: '生物质能', label: '生物质能' },
    { value: '其他', label: '其他' }
  ]},
]

// 965产业链类别级联（主链→子链）
export const CHAIN_965_CASCADER_OPTIONS = [
  { value: '光电子信息', label: '光电子信息', children: [
    { value: '光通信', label: '光通信' }, { value: '集成电路', label: '集成电路' },
    { value: '新型显示', label: '新型显示' }, { value: '智能终端', label: '智能终端' },
    { value: '激光', label: '激光' }
  ]},
  { value: '新能源与智能网联汽车', label: '新能源与智能网联汽车', children: [
    { value: '新能源汽车', label: '新能源汽车' },
    { value: '智能网联汽车', label: '智能网联汽车' },
    { value: '动力电池', label: '动力电池' }, { value: '车规芯片', label: '车规芯片' }
  ]},
  { value: '生命健康', label: '生命健康', children: [
    { value: '生物医药', label: '生物医药' }, { value: '高端医疗器械', label: '高端医疗器械' },
    { value: '精准医疗', label: '精准医疗' }, { value: '脑科学', label: '脑科学' }
  ]},
  { value: '高端装备', label: '高端装备', children: [
    { value: '航空航天', label: '航空航天' }, { value: '海洋装备', label: '海洋装备' },
    { value: '轨道交通', label: '轨道交通' }, { value: '智能装备', label: '智能装备' }
  ]},
  { value: '北斗和空天信息', label: '北斗和空天信息', children: [
    { value: '卫星导航', label: '卫星导航' }, { value: '地理信息', label: '地理信息' },
    { value: '遥感应用', label: '遥感应用' }
  ]},
  { value: '人工智能', label: '人工智能', children: [
    { value: '大模型与算法', label: '大模型与算法' },
    { value: 'AI芯片', label: 'AI芯片' },
    { value: '智能机器人', label: '智能机器人' }
  ]},
  { value: '数字经济', label: '数字经济', children: [
    { value: '云计算与大数据', label: '云计算与大数据' },
    { value: '网络安全', label: '网络安全' },
    { value: '区块链', label: '区块链' }
  ]},
  { value: '新材料', label: '新材料', children: [
    { value: '先进半导体材料', label: '先进半导体材料' },
    { value: '新能源材料', label: '新能源材料' },
    { value: '生物医用材料', label: '生物医用材料' }
  ]},
  { value: '新能源', label: '新能源', children: [
    { value: '氢能', label: '氢能' }, { value: '光伏', label: '光伏' },
    { value: '储能', label: '储能' }, { value: '智慧能源', label: '智慧能源' }
  ]},
]

// 核心决策节点选项（按项目分类+投资额联动）
export const CORE_DECISION_OPTIONS = {
  policy: ['投委会', '常务会'],
  investLarge: ['国企投决会', '投委会', '常务会'],
  investSmall: ['不涉及'],
  land: ['投委会', '常务会', '供地会'],
  other: ['不涉及'],
}

// ========== 签约阶段新增枚举 ==========

// 用地情况
export const LAND_SITUATION_OPTIONS = ['新供地', '现有用地', '租赁厂房', '购买房产', '其他']

// ===== 区级项目编码 =====
// 格式：YYYYMMDD + 3位序号（如 20260910001），在谋划阶段新增项目后由系统自动创建
export const generateDistrictCode = () => {
  const now = new Date()
  const pad = (n, len = 2) => String(n).padStart(len, '0')
  const dateStr = `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}`
  const seq = String(Math.floor(Math.random() * 999) + 1).padStart(3, '0')
  return `${dateStr}${seq}`
}

// 存量演示数据的区级项目编码种子（mock 原始数据无此字段）
export const DISTRICT_CODE_SEEDS = ['20260508001', '20260512002', '20260420003', '20260506004']

// 存量演示数据的市级项目编码种子（mock 原始数据无此字段）
export const CITY_CODE_SEEDS = ['SJ20260301001', 'SJ20260302015', 'SJ20260305023', 'SJ20260311008']

// 协议类型
export const AGREEMENT_TYPE_OPTIONS = ['投资协议', '框架协议', '补充协议', '其他']

// 投资形态
export const INVEST_FORM_OPTIONS = ['新设', '增资', '并购', '技改', '其他']

// 用地情况单位
export const LAND_AREA_UNIT_OPTIONS = ['亩', '平方米']

// 总部经济类型（两级无联动）
export const HQ_ECONOMY_LEVEL1_OPTIONS = ['全球总部', '亚太总部', '中国总部', '华中区域总部', '第二总部', '功能性总部', '其它']
export const HQ_ECONOMY_LEVEL2_OPTIONS = ['用地建设类', '开业营运类']

// 旧版枚举（兼容旧组件）
export const HQ_ECONOMY_TYPE_OPTIONS = ['全球总部', '亚太总部', '中国总部', '华中区域总部', '第二总部', '功能性总部', '其它']
export const HQ_BUILD_TYPE_OPTIONS = ['用地建设类', '开业营运类']
export const CONSTRUCTION_TYPE_OPTIONS = {
  '新建': ['固投开工类'],
  '扩建': ['固投开工类'],
  '改建': ['固投开工类'],
  '技改': ['固投开工类'],
  '开业': ['开业营业类'],
  '其它': ['固投开工类', '开业营业类'],
}

// 策划类型
export const PLANNING_TYPE_OPTIONS = ['一般经营性项目', '工业项目', '划拨类用地项目', '其它']

// 浙商类型
export const ZHESHANG_TYPE_OPTIONS = ['浙商回归', '浙商新增投资', '其他']

// 考核项目
export const ASSESS_PROJECT_OPTIONS = ['考核项目', '非考核项目']

// 内外贸
export const DOMESTIC_FOREIGN_TRADE_OPTIONS = ['内贸', '外贸', '内外贸结合']

// 存量企业类型
export const STOCK_ENTERPRISE_TYPE_FULL_OPTIONS = ['为存量企业新项目投资', '为存量企业技改投资', '其他']

// 开工开业类型
export const START_WORK_TYPE_OPTIONS = ['已开工（设备购置类）', '开业', '已开工（建安类）']

// 立项属性
export const PROJECT_ATTR_OPTIONS = ['审批', '核准', '备案']

// GB/T 4754-2017 国民经济行业分类 门类（简化版，20个门类）
export const GB_NATIONAL_INDUSTRY = [
  {
    value: 'A', label: 'A 农、林、牧、渔业',
    children: [
      { value: '01', label: '01 农业', children: [
        { value: '011', label: '011 谷物种植', children: [{ value: '0111', label: '0111 稻谷种植' }, { value: '0112', label: '0112 小麦种植' }, { value: '0113', label: '0113 玉米种植' }] },
        { value: '012', label: '012 豆类、油料和薯类种植' },
      ]},
      { value: '02', label: '02 林业' }, { value: '03', label: '03 畜牧业' }, { value: '04', label: '04 渔业' },
    ]
  },
  {
    value: 'B', label: 'B 采矿业',
    children: [
      { value: '06', label: '06 煤炭开采和洗选业' }, { value: '07', label: '07 石油和天然气开采业' },
      { value: '08', label: '08 黑色金属矿采选业' }, { value: '09', label: '09 有色金属矿采选业' },
    ]
  },
  {
    value: 'C', label: 'C 制造业',
    children: [
      { value: '14', label: '14 食品制造业' },
      { value: '26', label: '26 化学原料和化学制品制造业' },
      { value: '27', label: '27 医药制造业', children: [
        { value: '271', label: '271 化学药品原料药制造' }, { value: '272', label: '272 化学药品制剂制造' },
        { value: '273', label: '273 中药饮片加工' }, { value: '274', label: '274 中成药生产' },
        { value: '275', label: '275 兽用药品制造' }, { value: '276', label: '276 生物药品制造' },
      ]},
      { value: '35', label: '35 专用设备制造业' },
      { value: '36', label: '36 汽车制造业', children: [
        { value: '361', label: '361 汽车整车制造' }, { value: '362', label: '362 汽车用发动机制造' },
        { value: '366', label: '366 汽车零部件及配件制造' }, { value: '367', label: '367 汽车车身、挂车制造' },
      ]},
      { value: '37', label: '37 铁路、船舶、航空航天和其他运输设备制造业' },
      { value: '38', label: '38 电气机械和器材制造业' },
      { value: '39', label: '39 计算机、通信和其他电子设备制造业', children: [
        { value: '391', label: '391 计算机制造' }, { value: '392', label: '392 通信设备制造' },
        { value: '393', label: '393 广播电视设备制造' }, { value: '394', label: '394 雷达及配套设备制造' },
        { value: '395', label: '395 视听设备制造' }, { value: '396', label: '396 智能消费设备制造' },
        { value: '397', label: '397 电子器件制造' }, { value: '398', label: '398 电子元件及电子专用材料制造' },
      ]},
      { value: '40', label: '40 仪器仪表制造业' },
    ]
  },
  {
    value: 'D', label: 'D 电力、热力、燃气及水生产和供应业',
    children: [
      { value: '44', label: '44 电力、热力生产和供应业' }, { value: '45', label: '45 燃气生产和供应业' },
      { value: '46', label: '46 水的生产和供应业' },
    ]
  },
  { value: 'E', label: 'E 建筑业', children: [{ value: '47', label: '47 房屋建筑业' }, { value: '48', label: '48 土木工程建筑业' }, { value: '49', label: '49 建筑安装业' }, { value: '50', label: '50 建筑装饰、装修和其他建筑业' }] },
  { value: 'F', label: 'F 批发和零售业', children: [{ value: '51', label: '51 批发业' }, { value: '52', label: '52 零售业' }] },
  { value: 'G', label: 'G 交通运输、仓储和邮政业', children: [{ value: '53', label: '53 铁路运输业' }, { value: '54', label: '54 道路运输业' }, { value: '59', label: '59 仓储业' }, { value: '60', label: '60 邮政业' }] },
  { value: 'H', label: 'H 住宿和餐饮业', children: [{ value: '61', label: '61 住宿业' }, { value: '62', label: '62 餐饮业' }] },
  {
    value: 'I', label: 'I 信息传输、软件和信息技术服务业',
    children: [
      { value: '63', label: '63 电信、广播电视和卫星传输服务' },
      { value: '64', label: '64 互联网和相关服务' },
      { value: '65', label: '65 软件和信息技术服务业', children: [
        { value: '651', label: '651 软件开发' }, { value: '652', label: '652 集成电路设计' },
        { value: '653', label: '653 信息系统集成和物联网技术服务' }, { value: '654', label: '654 运行维护服务' },
        { value: '655', label: '655 信息处理和存储支持服务' }, { value: '656', label: '656 信息技术咨询服务' },
        { value: '657', label: '657 数字内容服务' }, { value: '659', label: '659 其他信息技术服务业' },
      ]},
    ]
  },
  { value: 'J', label: 'J 金融业', children: [{ value: '66', label: '66 货币金融服务' }, { value: '67', label: '67 资本市场服务' }, { value: '68', label: '68 保险业' }, { value: '69', label: '69 其他金融业' }] },
  { value: 'K', label: 'K 房地产业', children: [{ value: '70', label: '70 房地产业' }] },
  { value: 'L', label: 'L 租赁和商务服务业', children: [{ value: '71', label: '71 租赁业' }, { value: '72', label: '72 商务服务业' }] },
  { value: 'M', label: 'M 科学研究和技术服务业', children: [{ value: '73', label: '73 研究和试验发展' }, { value: '74', label: '74 专业技术服务业' }, { value: '75', label: '75 科技推广和应用服务业' }] },
  { value: 'N', label: 'N 水利、环境和公共设施管理业', children: [{ value: '76', label: '76 水利管理业' }, { value: '77', label: '77 生态保护和环境治理业' }, { value: '78', label: '78 公共设施管理业' }] },
  { value: 'O', label: 'O 居民服务、修理和其他服务业', children: [{ value: '79', label: '79 居民服务业' }, { value: '80', label: '80 机动车、电子产品和日用产品修理业' }, { value: '81', label: '81 其他服务业' }] },
  { value: 'P', label: 'P 教育', children: [{ value: '82', label: '82 教育' }] },
  { value: 'Q', label: 'Q 卫生和社会工作', children: [{ value: '83', label: '83 卫生' }, { value: '84', label: '84 社会工作' }] },
  { value: 'R', label: 'R 文化、体育和娱乐业', children: [{ value: '85', label: '85 新闻和出版业' }, { value: '86', label: '86 广播、电视、电影和录音制作业' }, { value: '87', label: '87 文化艺术业' }, { value: '88', label: '88 体育' }, { value: '89', label: '89 娱乐业' }] },
  { value: 'S', label: 'S 公共管理、社会保障和社会组织', children: [{ value: '90', label: '90 中国共产党机关' }, { value: '91', label: '91 国家机构' }] },
  { value: 'T', label: 'T 国际组织', children: [{ value: '97', label: '97 国际组织' }] },
]

// 服务业类别（简化）
export const SERVICE_INDUSTRY_OPTIONS = ['生产性服务业', '生活性服务业', '公共服务业']

// ========== 责任单位（多选，分组字典，贯穿谋划/在谈/签约/落地） ==========
export const RESPONSIBLE_UNIT_GROUPS = [
  { label: '投促局', options: ['市投促局', '区投促局'] },
  { label: '园区', options: [
    '未来科技城', '光谷生物城', '光谷中心城', '东湖综合保税区',
    '光电园', '服务业园', '智造园', '中华园',
  ] },
  { label: '国企/平台公司', options: [
    '光谷科投集团', '光谷人才集团', '武汉高科集团', '光谷产投', '光谷金控', '湖北科投',
  ] },
  { label: '区直部门', options: [
    '组织部', '宣传部', '发改局', '科创局', '企服局',
    '规划局', '建设局', '金融局', '自贸改革创新局',
  ] },
  { label: '街道', options: ['佛祖岭街道', '豹澥街道', '九峰街道'] },
]

// 责任单位全量选项（扁平，用于校验/筛选）
export const RESPONSIBLE_UNIT_OPTIONS = RESPONSIBLE_UNIT_GROUPS.reduce((acc, g) => acc.concat(g.options), [])

// 责任单位分组选项（antd Select options 格式：{label, options:[{label,value}]}）
export const RESPONSIBLE_UNIT_SELECT_GROUPS = RESPONSIBLE_UNIT_GROUPS.map(g => ({
  label: g.label,
  options: g.options.map(u => ({ label: u, value: u })),
}))

// 任意取值 -> 责任单位数组（兼容数组 / 顿号分隔字符串 / 单个字符串 / 空值）
export function normalizeResponsibleUnits(v) {
  if (v === undefined || v === null || v === '') return []
  if (Array.isArray(v)) return v.filter(Boolean)
  return String(v).split(/[、,，]/).map((s) => s.trim()).filter(Boolean)
}

// 责任单位数组 -> 展示文本（顿号连接）
export function responsibleUnitsText(v) {
  return normalizeResponsibleUnits(v).join('、')
}
