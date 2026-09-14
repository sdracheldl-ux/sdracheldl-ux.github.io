import { useState, useMemo, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Tag, Tooltip, Space, Divider, Modal, Form, Input, InputNumber, Select, Cascader, Row, Col, message, Dropdown, Alert, Button } from 'antd'
import { EyeOutlined, FileTextOutlined, EditOutlined, MoreOutlined, PauseCircleOutlined, ExclamationCircleOutlined } from '@ant-design/icons'
import GenericProjectList from '../components/GenericProjectList'
import TransferToZaitanModal from '../components/TransferToZaitanModal'
import DuplicateWarningModal from '../components/DuplicateWarningModal'
import mockData from '../mock/data.json'
import { checkDuplicates, buildZaitanLib } from '../utils/duplicateCheck'
import { RESPONSIBLE_UNIT_SELECT_GROUPS, RESPONSIBLE_UNIT_OPTIONS, normalizeResponsibleUnits, generateDistrictCode, DISTRICT_CODE_SEEDS } from '../constants/projectEnums'

const { TextArea } = Input
const { Option } = Select

const actionLinkStyle = { color: '#1677ff', display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 14, cursor: 'pointer' }

const unitTagStyle = { background: '#e6f4ff', color: '#1677ff', border: '1px solid #91caff', borderRadius: 4, marginInlineEnd: 6 }

// 责任单位渲染：空显示 '-'；每项浅蓝 Tag，最多 3 个，超出用 +N 收起
function renderUnits(v) {
  const list = normalizeResponsibleUnits(v)
  if (list.length === 0) return '-'
  const shown = list.slice(0, 3)
  return (
    <span>
      {shown.map(u => <Tag key={u} style={unitTagStyle}>{u}</Tag>)}
      {list.length > 3 && <Tag style={unitTagStyle}>+{list.length - 3}</Tag>}
    </span>
  )
}

const MOUHUA_TYPES = ['产业招商', '产业链配套', '平台招商', '以商招商']
const MOUHUA_SOURCES = ['区级自主谋划', '市级交办', '企业主动对接', '校友资源', '楚商资源']

// 项目分类（来自Excel字段表：政策类、投资类、供地类、其他）
const PROJECT_CATEGORY_OPTIONS = ['政策类', '投资类', '供地类', '其他']
// 内外资
const CAPITAL_NATURE_OPTIONS = ['内资', '外资']
// 产业类别
const INDUSTRY_TYPE_OPTIONS = ['农业', '工业', '服务业']

// 来源地-国内：省份→主要城市（一级不带省/市/自治区后缀，直辖市二级仅展示市名）
const DOMESTIC_REGION_OPTIONS = [
  { value: '北京', label: '北京', children: [{ value: '北京市', label: '北京市' }] },
  { value: '天津', label: '天津', children: [{ value: '天津市', label: '天津市' }] },
  { value: '上海', label: '上海', children: [{ value: '上海市', label: '上海市' }] },
  { value: '重庆', label: '重庆', children: [{ value: '重庆市', label: '重庆市' }] },
  { value: '河北', label: '河北', children: [
    { value: '石家庄', label: '石家庄' }, { value: '唐山', label: '唐山' }, { value: '保定', label: '保定' },
    { value: '邯郸', label: '邯郸' }, { value: '廊坊', label: '廊坊' },
  ]},
  { value: '山西', label: '山西', children: [
    { value: '太原', label: '太原' }, { value: '大同', label: '大同' }, { value: '运城', label: '运城' },
  ]},
  { value: '辽宁', label: '辽宁', children: [
    { value: '沈阳', label: '沈阳' }, { value: '大连', label: '大连' }, { value: '鞍山', label: '鞍山' },
  ]},
  { value: '吉林', label: '吉林', children: [
    { value: '长春', label: '长春' }, { value: '吉林市', label: '吉林市' },
  ]},
  { value: '黑龙江', label: '黑龙江', children: [
    { value: '哈尔滨', label: '哈尔滨' }, { value: '大庆', label: '大庆' },
  ]},
  { value: '江苏', label: '江苏', children: [
    { value: '南京', label: '南京' }, { value: '苏州', label: '苏州' }, { value: '无锡', label: '无锡' },
    { value: '常州', label: '常州' }, { value: '南通', label: '南通' }, { value: '徐州', label: '徐州' },
    { value: '扬州', label: '扬州' },
  ]},
  { value: '浙江', label: '浙江', children: [
    { value: '杭州', label: '杭州' }, { value: '宁波', label: '宁波' }, { value: '温州', label: '温州' },
    { value: '嘉兴', label: '嘉兴' }, { value: '湖州', label: '湖州' }, { value: '绍兴', label: '绍兴' },
    { value: '金华', label: '金华' }, { value: '台州', label: '台州' },
  ]},
  { value: '安徽', label: '安徽', children: [
    { value: '合肥', label: '合肥' }, { value: '芜湖', label: '芜湖' }, { value: '蚌埠', label: '蚌埠' },
  ]},
  { value: '福建', label: '福建', children: [
    { value: '福州', label: '福州' }, { value: '厦门', label: '厦门' }, { value: '泉州', label: '泉州' },
    { value: '漳州', label: '漳州' },
  ]},
  { value: '江西', label: '江西', children: [
    { value: '南昌', label: '南昌' }, { value: '九江', label: '九江' }, { value: '赣州', label: '赣州' },
  ]},
  { value: '山东', label: '山东', children: [
    { value: '济南', label: '济南' }, { value: '青岛', label: '青岛' }, { value: '烟台', label: '烟台' },
    { value: '潍坊', label: '潍坊' }, { value: '淄博', label: '淄博' }, { value: '济宁', label: '济宁' },
  ]},
  { value: '河南', label: '河南', children: [
    { value: '郑州', label: '郑州' }, { value: '洛阳', label: '洛阳' }, { value: '开封', label: '开封' },
    { value: '南阳', label: '南阳' },
  ]},
  { value: '湖北', label: '湖北', children: [
    { value: '武汉', label: '武汉' }, { value: '宜昌', label: '宜昌' }, { value: '襄阳', label: '襄阳' },
    { value: '荆州', label: '荆州' }, { value: '黄石', label: '黄石' }, { value: '十堰', label: '十堰' },
    { value: '孝感', label: '孝感' }, { value: '黄冈', label: '黄冈' },
  ]},
  { value: '湖南', label: '湖南', children: [
    { value: '长沙', label: '长沙' }, { value: '株洲', label: '株洲' }, { value: '湘潭', label: '湘潭' },
    { value: '衡阳', label: '衡阳' }, { value: '岳阳', label: '岳阳' },
  ]},
  { value: '广东', label: '广东', children: [
    { value: '广州', label: '广州' }, { value: '深圳', label: '深圳' }, { value: '珠海', label: '珠海' },
    { value: '汕头', label: '汕头' }, { value: '佛山', label: '佛山' }, { value: '东莞', label: '东莞' },
    { value: '中山', label: '中山' }, { value: '惠州', label: '惠州' },
  ]},
  { value: '广西', label: '广西', children: [
    { value: '南宁', label: '南宁' }, { value: '柳州', label: '柳州' }, { value: '桂林', label: '桂林' },
  ]},
  { value: '海南', label: '海南', children: [
    { value: '海口', label: '海口' }, { value: '三亚', label: '三亚' },
  ]},
  { value: '四川', label: '四川', children: [
    { value: '成都', label: '成都' }, { value: '绵阳', label: '绵阳' }, { value: '德阳', label: '德阳' },
    { value: '宜宾', label: '宜宾' },
  ]},
  { value: '贵州', label: '贵州', children: [
    { value: '贵阳', label: '贵阳' }, { value: '遵义', label: '遵义' },
  ]},
  { value: '云南', label: '云南', children: [
    { value: '昆明', label: '昆明' }, { value: '曲靖', label: '曲靖' }, { value: '大理', label: '大理' },
  ]},
  { value: '陕西', label: '陕西', children: [
    { value: '西安', label: '西安' }, { value: '宝鸡', label: '宝鸡' }, { value: '咸阳', label: '咸阳' },
  ]},
  { value: '甘肃', label: '甘肃', children: [
    { value: '兰州', label: '兰州' }, { value: '天水', label: '天水' },
  ]},
  { value: '青海', label: '青海', children: [
    { value: '西宁', label: '西宁' },
  ]},
  { value: '内蒙古', label: '内蒙古', children: [
    { value: '呼和浩特', label: '呼和浩特' }, { value: '包头', label: '包头' }, { value: '鄂尔多斯', label: '鄂尔多斯' },
  ]},
  { value: '新疆', label: '新疆', children: [
    { value: '乌鲁木齐', label: '乌鲁木齐' }, { value: '喀什', label: '喀什' },
  ]},
  { value: '西藏', label: '西藏', children: [
    { value: '拉萨', label: '拉萨' },
  ]},
  { value: '宁夏', label: '宁夏', children: [
    { value: '银川', label: '银川' },
  ]},
  { value: '香港', label: '香港', children: [{ value: '香港', label: '香港' }] },
  { value: '澳门', label: '澳门', children: [{ value: '澳门', label: '澳门' }] },
  { value: '台湾', label: '台湾', children: [{ value: '台北', label: '台北' }, { value: '高雄', label: '高雄' }, { value: '台中', label: '台中' }] },
]

// 来源地-国外：国家列表（单级）
const FOREIGN_COUNTRY_OPTIONS = [
  { value: '美国', label: '美国' },
  { value: '加拿大', label: '加拿大' },
  { value: '英国', label: '英国' },
  { value: '法国', label: '法国' },
  { value: '德国', label: '德国' },
  { value: '意大利', label: '意大利' },
  { value: '西班牙', label: '西班牙' },
  { value: '荷兰', label: '荷兰' },
  { value: '比利时', label: '比利时' },
  { value: '瑞士', label: '瑞士' },
  { value: '瑞典', label: '瑞典' },
  { value: '挪威', label: '挪威' },
  { value: '丹麦', label: '丹麦' },
  { value: '芬兰', label: '芬兰' },
  { value: '俄罗斯', label: '俄罗斯' },
  { value: '日本', label: '日本' },
  { value: '韩国', label: '韩国' },
  { value: '新加坡', label: '新加坡' },
  { value: '马来西亚', label: '马来西亚' },
  { value: '泰国', label: '泰国' },
  { value: '越南', label: '越南' },
  { value: '印度尼西亚', label: '印度尼西亚' },
  { value: '菲律宾', label: '菲律宾' },
  { value: '印度', label: '印度' },
  { value: '巴基斯坦', label: '巴基斯坦' },
  { value: '澳大利亚', label: '澳大利亚' },
  { value: '新西兰', label: '新西兰' },
  { value: '巴西', label: '巴西' },
  { value: '阿根廷', label: '阿根廷' },
  { value: '墨西哥', label: '墨西哥' },
  { value: '南非', label: '南非' },
  { value: '埃及', label: '埃及' },
  { value: '阿联酋', label: '阿联酋' },
  { value: '沙特阿拉伯', label: '沙特阿拉伯' },
  { value: '以色列', label: '以色列' },
  { value: '土耳其', label: '土耳其' },
].map(c => ({ value: c.value, label: c.label, children: undefined }))

// 行业类别级联数据（门类→大类）—— 来源：Excel「行业&产业链类别枚举值」sheet
const INDUSTRY_CASCADER_OPTIONS = [
  { value: '民生保障类', label: '民生保障类', children: [] },
  { value: '基础设施建设类', label: '基础设施建设类', children: [] },
  { value: '"光芯屏端网"新一代信息技术', label: '"光芯屏端网"新一代信息技术', children: [
    { value: '光通信', label: '光通信' }, { value: '高性能集成电路', label: '高性能集成电路' },
    { value: '新型显示', label: '新型显示' }, { value: '未来显示', label: '未来显示' },
    { value: '激光', label: '激光' }, { value: '信息通信设备及智能终端', label: '信息通信设备及智能终端' },
    { value: '大数据与云计算', label: '大数据与云计算' }, { value: '先进半导体', label: '先进半导体' },
    { value: '其他', label: '其他' },
  ]},
  { value: '软件和网络安全', label: '软件和网络安全', children: [
    { value: '网络安全', label: '网络安全' }, { value: '未来网络', label: '未来网络' },
    { value: '物联网', label: '物联网' }, { value: '自主可控软件', label: '自主可控软件' },
    { value: '软件信息服务', label: '软件信息服务' }, { value: '数字经济', label: '数字经济' },
    { value: '网游电竞', label: '网游电竞' }, { value: '直播电竞', label: '直播电竞' },
    { value: '其他', label: '其他' },
  ]},
  { value: '量子科技', label: '量子科技', children: [
    { value: '光量子芯片与通信', label: '光量子芯片与通信' }, { value: '量子感知', label: '量子感知' },
    { value: '量子计算', label: '量子计算' }, { value: '其他', label: '其他' },
  ]},
  { value: '高端装备', label: '高端装备', children: [
    { value: '3D打印与激光加工装备', label: '3D打印与激光加工装备' }, { value: '海洋工程装备及高技术船舶', label: '海洋工程装备及高技术船舶' },
    { value: '飞机装备制造', label: '飞机装备制造' }, { value: '轨道交通装备', label: '轨道交通装备' },
    { value: '高端舰船制造', label: '高端舰船制造' }, { value: '智能家居', label: '智能家居' },
    { value: '高速轨道交通', label: '高速轨道交通' }, { value: '其他', label: '其他' },
  ]},
  { value: '大健康和生物技术', label: '大健康和生物技术', children: [
    { value: '生物医药', label: '生物医药' }, { value: '医疗器械', label: '医疗器械' },
    { value: '医药流通', label: '医药流通' }, { value: '健康服务', label: '健康服务' },
    { value: '健康食品', label: '健康食品' }, { value: '生物制造', label: '生物制造' },
    { value: '脑机接口', label: '脑机接口' }, { value: '其他', label: '其他' },
  ]},
  { value: '汽车制造和服务', label: '汽车制造和服务', children: [
    { value: '新能源汽车', label: '新能源汽车' }, { value: '智能出行(含无人驾驶和网联汽车)', label: '智能出行(含无人驾驶和网联汽车)' },
    { value: '关键零部件', label: '关键零部件' }, { value: '新型储能电池', label: '新型储能电池' },
    { value: '氢能', label: '氢能' }, { value: '其他', label: '其他' },
  ]},
  { value: '数字创意', label: '数字创意', children: [
    { value: '创意设计', label: '创意设计' }, { value: '网络文学', label: '网络文学' },
    { value: '影视音乐', label: '影视音乐' }, { value: '线上演播', label: '线上演播' },
    { value: '动漫游戏', label: '动漫游戏' }, { value: '数字出版', label: '数字出版' },
    { value: '元宇宙', label: '元宇宙' }, { value: '其他', label: '其他' },
  ]},
  { value: '深地深海深空', label: '深地深海深空', children: [
    { value: '地球深部勘探开发', label: '地球深部勘探开发' }, { value: '深海装备', label: '深海装备' },
    { value: '传感网络开发', label: '传感网络开发' }, { value: '深空对地探测', label: '深空对地探测' },
    { value: '其他', label: '其他' },
  ]},
  { value: '超级计算和人工智能', label: '超级计算和人工智能', children: [
    { value: '高性能计算', label: '高性能计算' }, { value: '操作系统', label: '操作系统' },
    { value: '云服务和人工智能大模型', label: '云服务和人工智能大模型' }, { value: '智能机器人', label: '智能机器人' },
    { value: '人形状机器人', label: '人形状机器人' }, { value: '虚拟现实', label: '虚拟现实' },
    { value: '机器视觉', label: '机器视觉' }, { value: '其他', label: '其他' },
  ]},
  { value: '绿色环保', label: '绿色环保', children: [
    { value: '高效节能', label: '高效节能' }, { value: '先进节能', label: '先进节能' },
    { value: '资源循环利用', label: '资源循环利用' }, { value: '其他', label: '其他' },
  ]},
  { value: '航空航天和空天信息', label: '航空航天和空天信息', children: [
    { value: '低空经济', label: '低空经济' }, { value: '北斗', label: '北斗' },
    { value: '地球空间信息应用服务', label: '地球空间信息应用服务' }, { value: '地球空间信息产品开发', label: '地球空间信息产品开发' },
    { value: '地球空间信息平台建设', label: '地球空间信息平台建设' }, { value: '航空装备', label: '航空装备' },
    { value: '航天装备', label: '航天装备' }, { value: '其他', label: '其他' },
  ]},
  { value: '电磁能', label: '电磁能', children: [
    { value: '电磁装备与制造', label: '电磁装备与制造' }, { value: '其他', label: '其他' },
  ]},
  { value: '文化旅游', label: '文化旅游', children: [
    { value: '文化', label: '文化' }, { value: '旅游', label: '旅游' },
    { value: '体育', label: '体育' }, { value: '教育', label: '教育' },
    { value: '其他', label: '其他' },
  ]},
  { value: '智能建造', label: '智能建造', children: [
    { value: '房建', label: '房建' }, { value: '市政', label: '市政' },
    { value: '水利', label: '水利' }, { value: '公路', label: '公路' },
    { value: '建筑服务', label: '建筑服务' }, { value: '其他', label: '其他' },
  ]},
  { value: '现代金融', label: '现代金融', children: [
    { value: '银行', label: '银行' }, { value: '保险', label: '保险' },
    { value: '证券', label: '证券' }, { value: '保理', label: '保理' },
    { value: '基金', label: '基金' }, { value: '其他', label: '其他' },
  ]},
  { value: '商贸物流', label: '商贸物流', children: [
    { value: '商务商贸', label: '商务商贸' }, { value: '商务会展', label: '商务会展' },
    { value: '商贸流通', label: '商贸流通' }, { value: '电子商务', label: '电子商务' },
    { value: '现代物流', label: '现代物流' }, { value: '航运物流', label: '航运物流' },
    { value: '港口物流', label: '港口物流' }, { value: '其他', label: '其他' },
  ]},
  { value: '新能源类', label: '新能源类', children: [
    { value: '海洋核能', label: '海洋核能' }, { value: '光伏发电', label: '光伏发电' },
    { value: '风能', label: '风能' }, { value: '生物质能', label: '生物质能' },
    { value: '其他', label: '其他' },
  ]},
  { value: '新材料类', label: '新材料类', children: [
    { value: '新型功能材料', label: '新型功能材料' }, { value: '高性复合材料', label: '高性复合材料' },
    { value: '先进基础材料', label: '先进基础材料' }, { value: '未来新材料', label: '未来新材料' },
    { value: '其他', label: '其他' },
  ]},
  { value: '房地产', label: '房地产', children: [
    { value: '总部楼宇', label: '总部楼宇' }, { value: '商业综合体', label: '商业综合体' },
    { value: '商业地产运营开发类', label: '商业地产运营开发类' }, { value: '商住一体', label: '商住一体' },
    { value: '特色小镇', label: '特色小镇' }, { value: '纯住宅', label: '纯住宅' },
    { value: '康养地产', label: '康养地产' }, { value: '其他', label: '其他' },
  ]},
  { value: '产业园', label: '产业园', children: [
    { value: '工业产业园', label: '工业产业园' }, { value: '科创产业园', label: '科创产业园' },
    { value: '特色产业园', label: '特色产业园' }, { value: '其他', label: '其他' },
  ]},
  { value: '石油化工类', label: '石油化工类', children: [
    { value: '精细化工', label: '精细化工' }, { value: '石油工业', label: '石油工业' },
    { value: '其他', label: '其他' },
  ]},
  { value: '科创类', label: '科创类', children: [
    { value: '科技服务', label: '科技服务' }, { value: '研发平台', label: '研发平台' },
    { value: '其他', label: '其他' },
  ]},
  { value: '现代农业', label: '现代农业', children: [
    { value: '农文旅', label: '农文旅' }, { value: '生态农业', label: '生态农业' },
    { value: '其他', label: '其他' },
  ]},
  { value: '其他类', label: '其他类', children: [
    { value: '私人定制', label: '私人定制' }, { value: 'PPP', label: 'PPP' },
    { value: '其他', label: '其他' },
  ]},
]

// 965产业链类别级联数据（主链→子链）—— 来源：Excel「行业&产业链类别枚举值」sheet
const CHAIN_965_CASCADER_OPTIONS = [
  { value: '航空航天', label: '航空航天', children: [
    { value: '火箭及卫星研发制造', label: '火箭及卫星研发制造' }, { value: '卫星星座建设运维', label: '卫星星座建设运维' },
    { value: '航空器研发及制造', label: '航空器研发及制造' }, { value: '航天电子设备', label: '航天电子设备' },
    { value: '航空维修', label: '航空维修' }, { value: '其他', label: '其他' },
  ]},
  { value: '合成生物', label: '合成生物', children: [
    { value: '细胞工程', label: '细胞工程' }, { value: '酶制剂', label: '酶制剂' },
    { value: '新型食品', label: '新型食品' }, { value: '医药中间体', label: '医药中间体' },
    { value: '动植物保护药物', label: '动植物保护药物' }, { value: '医美原料', label: '医美原料' },
    { value: '其它', label: '其它' },
  ]},
  { value: '低空经济', label: '低空经济', children: [
    { value: '低空飞行器制造', label: '低空飞行器制造' }, { value: '低空基础设施', label: '低空基础设施' },
    { value: '低空运营服务', label: '低空运营服务' }, { value: '低空飞行保障', label: '低空飞行保障' },
    { value: '其他', label: '其他' },
  ]},
  { value: '文化旅游和体育', label: '文化旅游和体育', children: [
    { value: '文旅资源开发', label: '文旅资源开发' }, { value: '演艺经济', label: '演艺经济' },
    { value: '文旅产品开发', label: '文旅产品开发' }, { value: '文旅消费场景', label: '文旅消费场景' },
    { value: '体育消费与赛事', label: '体育消费与赛事' }, { value: '其他', label: '其他' },
  ]},
  { value: '科技服务', label: '科技服务', children: [
    { value: '研究开发', label: '研究开发' }, { value: '技术转移转化', label: '技术转移转化' },
    { value: '企业孵化', label: '企业孵化' }, { value: '技术推广', label: '技术推广' },
    { value: '检验检测', label: '检验检测' }, { value: '知识产权', label: '知识产权' },
    { value: '其他', label: '其他' },
  ]},
  { value: '现代商贸', label: '现代商贸', children: [
    { value: '新零售', label: '新零售' }, { value: '直播电商', label: '直播电商' },
    { value: '跨境电商', label: '跨境电商' }, { value: '消费新业态', label: '消费新业态' },
    { value: '会展', label: '会展' }, { value: '其他', label: '其他' },
  ]},
  { value: '现代金融', label: '现代金融', children: [
    { value: '银行', label: '银行' }, { value: '证券', label: '证券' },
    { value: '保险', label: '保险' }, { value: '基金', label: '基金' },
    { value: '第三方支付', label: '第三方支付' }, { value: '其他', label: '其他' },
  ]},
  { value: '绿色环保', label: '绿色环保', children: [
    { value: '高效节能', label: '高效节能' }, { value: '先进环保', label: '先进环保' },
    { value: '资源循环利用', label: '资源循环利用' }, { value: '双碳服务', label: '双碳服务' },
    { value: '其他', label: '其他' },
  ]},
  { value: '工程设计', label: '工程设计', children: [
    { value: '建筑设计', label: '建筑设计' }, { value: '桥梁设计', label: '桥梁设计' },
    { value: '高铁设计', label: '高铁设计' }, { value: '市政设计', label: '市政设计' },
    { value: '景观设计', label: '景观设计' }, { value: '工业工程设计', label: '工业工程设计' },
    { value: '其他', label: '其他' },
  ]},
  { value: '智能建造', label: '智能建造', children: [
    { value: '建筑工业化', label: '建筑工业化' }, { value: '智能施工装备', label: '智能施工装备' },
    { value: '建筑信息化', label: '建筑信息化' }, { value: '新型建筑材料', label: '新型建筑材料' },
    { value: '其他', label: '其他' },
  ]},
  { value: '氢能和新型储能', label: '氢能和新型储能', children: [
    { value: '氢能', label: '氢能' }, { value: '锂离子电池', label: '锂离子电池' },
    { value: '液流电池', label: '液流电池' }, { value: '钠离子电池', label: '钠离子电池' },
    { value: '铅碳电池', label: '铅碳电池' }, { value: '超级电容器', label: '超级电容器' },
    { value: '压缩空气储能', label: '压缩空气储能' }, { value: '其他', label: '其他' },
  ]},
  { value: '新型显示', label: '新型显示', children: [
    { value: 'OLED', label: 'OLED' }, { value: 'Mini LED', label: 'Mini LED' },
    { value: 'Micro LED', label: 'Micro LED' }, { value: '硅基 OLED', label: '硅基 OLED' },
    { value: '量子点显示', label: '量子点显示' }, { value: '全息显示', label: '全息显示' },
    { value: '视网膜显示', label: '视网膜显示' }, { value: '激光显示', label: '激光显示' },
    { value: '其他', label: '其他' },
  ]},
  { value: '集成电路', label: '集成电路', children: [
    { value: '存储芯片', label: '存储芯片' }, { value: '传感器', label: '传感器' },
    { value: '高端逻辑芯片', label: '高端逻辑芯片' }, { value: '功率半导体', label: '功率半导体' },
    { value: '汽车芯片', label: '汽车芯片' }, { value: '光子芯片', label: '光子芯片' },
    { value: '射频芯片', label: '射频芯片' }, { value: '其他', label: '其他' },
  ]},
  { value: '现代物流', label: '现代物流', children: [
    { value: '物流设施', label: '物流设施' }, { value: '货运配送', label: '货运配送' },
    { value: '多式联运', label: '多式联运' }, { value: '水上运输', label: '水上运输' },
    { value: '航空运输', label: '航空运输' }, { value: '其他', label: '其他' },
  ]},
  { value: '北斗', label: '北斗', children: [
    { value: '高精度北斗芯片', label: '高精度北斗芯片' }, { value: '北斗定位终端', label: '北斗定位终端' },
    { value: '北斗高精度地图', label: '北斗高精度地图' }, { value: '地理信息系统', label: '地理信息系统' },
    { value: '时空数据采集', label: '时空数据采集' }, { value: '通导遥一体化', label: '通导遥一体化' },
    { value: '北斗+应用', label: '北斗+应用' }, { value: '其他', label: '其他' },
  ]},
  { value: '智能机器人', label: '智能机器人', children: [
    { value: '人形机器人', label: '人形机器人' }, { value: '工业机器人', label: '工业机器人' },
    { value: '特种机器人', label: '特种机器人' }, { value: '服务机器人', label: '服务机器人' },
    { value: '机器人部组件', label: '机器人部组件' }, { value: '其他', label: '其他' },
  ]},
  { value: '人工智能', label: '人工智能', children: [
    { value: '人工智能基础设施', label: '人工智能基础设施' }, { value: '算法与大模型', label: '算法与大模型' },
    { value: '软硬件产品', label: '软硬件产品' }, { value: '人工智能+应用', label: '人工智能+应用' },
    { value: '其他', label: '其他' },
  ]},
  { value: '数据和网络安全', label: '数据和网络安全', children: [
    { value: '计算存储', label: '计算存储' }, { value: '数据采集汇聚', label: '数据采集汇聚' },
    { value: '数据标注', label: '数据标注' }, { value: '流通交易', label: '流通交易' },
    { value: '开发利用', label: '开发利用' }, { value: '安全治理', label: '安全治理' },
    { value: '信息安全', label: '信息安全' }, { value: '数据安全', label: '数据安全' },
    { value: '内容安全', label: '内容安全' }, { value: '系统安全', label: '系统安全' },
    { value: '信创安全', label: '信创安全' }, { value: '其他', label: '其他' },
  ]},
  { value: '数字创意', label: '数字创意', children: [
    { value: '数字出版', label: '数字出版' }, { value: '网络游戏', label: '网络游戏' },
    { value: '电子竞技', label: '电子竞技' }, { value: '广播电视和网络视听', label: '广播电视和网络视听' },
    { value: '互联网广告', label: '互联网广告' }, { value: '其他', label: '其他' },
  ]},
  { value: '电磁能', label: '电磁能', children: [
    { value: '飞轮储能', label: '飞轮储能' }, { value: '电磁能牵引控制系统', label: '电磁能牵引控制系统' },
    { value: '磁悬浮科技', label: '磁悬浮科技' }, { value: '船舶动力系统', label: '船舶动力系统' },
    { value: '其他', label: '其他' },
  ]},
  { value: '未来网络', label: '未来网络', children: [
    { value: '6G', label: '6G' }, { value: '卫星互联网', label: '卫星互联网' },
    { value: '量子通信网', label: '量子通信网' }, { value: '其他', label: '其他' },
  ]},
  { value: '光电子信息', label: '光电子信息', children: [
    { value: '光子', label: '光子' }, { value: '智能终端', label: '智能终端' },
    { value: '智能穿戴', label: '智能穿戴' }, { value: '移动通信', label: '移动通信' },
    { value: '光电芯片', label: '光电芯片' }, { value: '光电材料', label: '光电材料' },
    { value: '光电收发', label: '光电收发' }, { value: '光电互联', label: '光电互联' },
    { value: '光电处理', label: '光电处理' }, { value: '光电传感', label: '光电传感' },
    { value: '其他', label: '其他' },
  ]},
  { value: '新材料', label: '新材料', children: [
    { value: '先进基础材料', label: '先进基础材料' }, { value: '关键战略材料', label: '关键战略材料' },
    { value: '前沿新材料', label: '前沿新材料' }, { value: '其他', label: '其他' },
  ]},
  { value: '汽车制造和服务', label: '汽车制造和服务', children: [
    { value: '汽车研发设计', label: '汽车研发设计' }, { value: '整车及零部件制造', label: '整车及零部件制造' },
    { value: '后市场服务', label: '后市场服务' }, { value: '其他', label: '其他' },
  ]},
  { value: '类脑科学与脑机接口', label: '类脑科学与脑机接口', children: [
    { value: '脑机接口设备', label: '脑机接口设备' }, { value: '类脑芯片与硬件', label: '类脑芯片与硬件' },
    { value: '类脑感知', label: '类脑感知' }, { value: '类脑算法', label: '类脑算法' },
    { value: '脑机接口应用产品', label: '脑机接口应用产品' }, { value: '其他', label: '其他' },
  ]},
  { value: '生命健康', label: '生命健康', children: [
    { value: '生物医药', label: '生物医药' }, { value: '医疗器械', label: '医疗器械' },
    { value: '医药流通', label: '医药流通' }, { value: '健康服务', label: '健康服务' },
    { value: '健康食品', label: '健康食品' }, { value: '其他', label: '其他' },
  ]},
  { value: '现代农业', label: '现代农业', children: [
    { value: '生物育种', label: '生物育种' }, { value: '设施农业', label: '设施农业' },
    { value: '智慧农业', label: '智慧农业' }, { value: '农产品精深加工', label: '农产品精深加工' },
    { value: '休闲农业', label: '休闲农业' }, { value: '其他', label: '其他' },
  ]},
  { value: '高端装备', label: '高端装备', children: [
    { value: '智能制造装备', label: '智能制造装备' }, { value: '绿色智能船舶', label: '绿色智能船舶' },
    { value: '能源装备', label: '能源装备' }, { value: '深地深海深空装备', label: '深地深海深空装备' },
    { value: '高端仪器', label: '高端仪器' }, { value: '安全应急', label: '安全应急' },
    { value: '其他', label: '其他' },
  ]},
  { value: '量子科技', label: '量子科技', children: [
    { value: '量子精密测量', label: '量子精密测量' }, { value: '量子通信', label: '量子通信' },
    { value: '量子计算', label: '量子计算' }, { value: '量子基础元器件', label: '量子基础元器件' },
    { value: '其他', label: '其他' },
  ]},
  { value: '软件信息', label: '软件信息', children: [
    { value: '开源体系', label: '开源体系' }, { value: '基础软件', label: '基础软件' },
    { value: '工业软件', label: '工业软件' }, { value: '应用软件', label: '应用软件' },
    { value: '其他', label: '其他' },
  ]},
  { value: '其它', label: '其它', children: [
    { value: '清洁能源', label: '清洁能源' }, { value: '石油化工', label: '石油化工' },
    { value: '房地产', label: '房地产' }, { value: '产业园', label: '产业园' },
  ]},
]

export default function Mouhua() {
  const navigate = useNavigate()
  const [addModalVisible, setAddModalVisible] = useState(false)
  const [addLoading, setAddLoading] = useState(false)
  const [form] = Form.useForm()
  const [progressForm] = Form.useForm()
  const [extraDataList, setExtraDataList] = useState([])
  const [progressModalVisible, setProgressModalVisible] = useState(false)
  const [progressLoading, setProgressLoading] = useState(false)
  const [transferModalVisible, setTransferModalVisible] = useState(false)
  const [currentTransferProject, setCurrentTransferProject] = useState(null)
  const [transferredKeys, setTransferredKeys] = useState([])
  const [currentProgressProject, setCurrentProgressProject] = useState(null)
  const [tuikuVisible, setTuikuVisible] = useState(false)
  const [tuikuRecord, setTuikuRecord] = useState(null)
  const [tuikuReason, setTuikuReason] = useState('')
  // ===== 实时判重（PRD 2.1.8 场景一）=====
  const [warnVisible, setWarnVisible] = useState(false)
  const [warnHits, setWarnHits] = useState([])
  const [warnValues, setWarnValues] = useState(null)
  const [l4Hits, setL4Hits] = useState([])
  const [l4Expanded, setL4Expanded] = useState(false)
  const l4AckRef = useRef(false) // L4 提示后放行：再次提交直接保存
  const capitalNature = Form.useWatch('capitalNature', form)

  const handleViewDetail = (record) => {
    navigate(`/project/mouhua/detail/${record.key}`)
  }

  const dataList = useMemo(() => {
    const mockFormValues = [
      { capitalNature: '内资', sourceRegion: ['上海', '上海市'], industryType: '工业', industryCategory: ['大健康和生物技术', '生物医药'], chainType965: ['生命健康', '生物医药'], investorContactPerson: '陶维红', investorContactPhone: '18612345625', investAmount: 1.2, projectDescription: '' },
      { capitalNature: '内资', sourceRegion: ['安徽', '合肥市'], industryType: '工业', industryCategory: ['超级计算和人工智能', '智能机器人'], chainType965: ['人工智能', '智能机器人'], investorContactPerson: '施海仁', investorContactPhone: '13800000002', investAmount: 1.5, projectDescription: '' },
      { capitalNature: '内资', sourceRegion: ['江苏', '苏州市'], industryType: '工业', industryCategory: ['"光芯屏端网"新一代信息技术', '先进半导体'], chainType965: ['光电子信息', '集成电路'], investorContactPerson: '许昂', investorContactPhone: '13900000003', investAmount: 1.1, projectDescription: '' },
      { capitalNature: '内资', sourceRegion: ['江苏', '南京市'], industryType: '工业', industryCategory: ['大健康和生物技术', '高端医疗器械'], chainType965: ['生命健康', '高端医疗器械'], investorContactPerson: '费良江', investorContactPhone: '13700000004', investAmount: 2, projectDescription: '' },
    ]
    const base = mockData.zaitan.slice(0, 4).map((item, idx) => ({
      key: `mouhua-${idx + 1}`,
      index: idx + 1,
      districtProjectCode: item['区级项目编码'] || DISTRICT_CODE_SEEDS[idx % DISTRICT_CODE_SEEDS.length],
      reporter: item['申报人'] || '-',
      projectStatus: '谋划中',
      projectName: item['项目名称'] || '-',
      sourceArea: item['来源地'] || '-',
      industryCategory: item['产业类别'] || '-',
      industryType: item['行业类别'] || '-',
      projectDesc: item['项目简介'] || '-',
      investorEntity: item['投资主体'] || '-',
      investAmount: item['投资金额（亿元）'] || mockFormValues[idx].investAmount,
      responsibleUnits: [RESPONSIBLE_UNIT_OPTIONS[idx % RESPONSIBLE_UNIT_OPTIONS.length]],
      enterpriseNature: item['企业性质'] || '-',
      mouhuaType: MOUHUA_TYPES[idx % MOUHUA_TYPES.length],
      mouhuaSource: MOUHUA_SOURCES[idx % MOUHUA_SOURCES.length],
      reportTime: item['申报时间'] || '-',
      auditStatus: idx < 2 ? '已审核通过' : '待审核',
      projectCategory: ['政策类', '投资类', '供地类', '其他'][idx % 4],
      _formValues: mockFormValues[idx],
    }))
    return [...base, ...extraDataList].filter(item => !transferredKeys.includes(item.key))
  }, [extraDataList, transferredKeys])

  const columns = useMemo(() => [
    { key: 'index', title: '序号', dataIndex: 'index', width: 55, align: 'center', fixed: 'left', required: true },
    { key: 'districtProjectCode', title: '区级项目编码', dataIndex: 'districtProjectCode', width: 130, align: 'center' },
    { key: 'reporter', title: '申报人', dataIndex: 'reporter', width: 120, align: 'left', fixed: 'left', ellipsis: true },
    { key: 'projectName', title: '项目名称', dataIndex: 'projectName', width: 220, ellipsis: true, required: true,
      render: (v, record) => (
        <Tooltip title={v}>
          <span style={{ color: '#1677ff', cursor: 'pointer' }} onClick={() => handleViewDetail(record)}>{v}</span>
        </Tooltip>
      )
    },
    { key: 'industryCategory', title: '产业类别', dataIndex: 'industryCategory', width: 80, align: 'center' },
    { key: 'industryType', title: '行业类别', dataIndex: 'industryType', width: 180, ellipsis: true },
    { key: 'sourceArea', title: '来源地', dataIndex: 'sourceArea', width: 120, ellipsis: true },
    { key: 'investAmount', title: '计划投资总额(亿元)', dataIndex: 'investAmount', width: 140, align: 'right', sorter: true,
      render: (v) => <span style={{ fontWeight: 600 }}>{Number(v).toFixed(2)}</span>
    },
    { key: 'responsibleUnits', title: '责任单位', dataIndex: 'responsibleUnits', width: 220, ellipsis: true,
      render: (v) => renderUnits(v)
    },
    { key: 'reportTime', title: '申报时间', dataIndex: 'reportTime', width: 120, align: 'center' },
    { key: 'action', title: '操作', dataIndex: 'action', width: 260, fixed: 'right', align: 'center', required: true,
      render: (_, record) => {
        const moreMenuItems = [
          { key: 'report', icon: <FileTextOutlined />, label: '进展汇报' },
          { key: 'stop', icon: <PauseCircleOutlined />, label: '标记退库', danger: true },
        ]
        const handleMoreClick = (e) => {
          if (e.key === 'stop') {
            setTuikuRecord(record)
            setTuikuReason('')
            setTuikuVisible(true)
          } else if (e.key === 'report') {
            setCurrentProgressProject(record)
            progressForm.resetFields()
            setProgressModalVisible(true)
          }
        }
        return (
          <Space size={0} split={<Divider type="vertical" style={{ margin: '0 6px', borderColor: '#d9d9d9' }} />}>
            <span style={actionLinkStyle} onClick={() => handleViewDetail(record)}>
              <EyeOutlined /> 详情
            </span>
            <span style={actionLinkStyle} onClick={() => {
              Modal.confirm({
                title: '转在谈',
                content: `确定将谋划项目「${record.projectName}」转入在谈阶段吗？需要补充在谈阶段必填字段。`,
                okText: '去补充信息', cancelText: '取消',
                onOk: () => {
                  setCurrentTransferProject(record)
                  setTransferModalVisible(true)
                },
              })
            }}>
              <EditOutlined /> 在谈
            </span>
            <Dropdown menu={{ items: moreMenuItems, onClick: handleMoreClick }} trigger={['click']}>
              <span style={actionLinkStyle} onClick={(e) => e.preventDefault()}>
                <MoreOutlined />
              </span>
            </Dropdown>
          </Space>
        )
      }
    },
  ], [])

  const extraFilters = [
    { key: 'responsibleUnits', dataIndex: 'responsibleUnits', label: '责任单位', type: 'select', multiple: true, options: RESPONSIBLE_UNIT_SELECT_GROUPS },
  ]

  const handleAdd = () => {
    form.resetFields()
    setL4Hits([])
    setL4Expanded(false)
    l4AckRef.current = false
    setAddModalVisible(true)
  }

  const handleProgressOk = async () => {
    try {
      await progressForm.validateFields()
      setProgressLoading(true)
      message.success('进展汇报已提交（demo示意）')
      setProgressModalVisible(false)
      progressForm.resetFields()
    } catch (e) {
      // validation
    } finally {
      setProgressLoading(false)
    }
  }

  const handleTransferOk = () => {
    if (currentTransferProject) {
      setTransferredKeys(prev => [...prev, currentTransferProject.key])
    }
    setTransferModalVisible(false)
    setCurrentTransferProject(null)
    message.success('该项目已从谋划列表移至在谈列表')
  }

  // 执行保存（判重通过 / L4 放行 / 预警「仍要提交」后调用）
  const doAddSave = async (values) => {
    try {
      setAddLoading(true)
      // 构造级联选择的显示文本
      const industryLabel = values.industryCategory ? values.industryCategory.join(' / ') : '-'
      const sourceLabel = values.sourceRegion ? values.sourceRegion.join(' / ') : '-'
      const now = new Date()
      const pad = (n) => String(n).padStart(2, '0')
      const timeStr = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}`

      // 区级项目编码：新增项目后由系统自动创建
      const districtProjectCode = generateDistrictCode()
      const newItem = {
        key: `mouhua-new-${Date.now()}`,
        index: dataList.length + 1,
        districtProjectCode,
        reporter: '投促局管理员',
        projectStatus: '谋划中',
        projectName: values.projectName,
        sourceArea: sourceLabel,
        industryCategory: values.industryType,
        industryType: industryLabel,
        projectDesc: values.projectDescription,
        investAmount: values.investAmount,
        responsibleUnits: values.responsibleUnits || [],
        enterpriseNature: '-',
        mouhuaSource: '区级自主谋划',
        reportTime: timeStr,
        auditStatus: '待审核',
        _formValues: { ...values },
      }
      setExtraDataList(prev => [newItem, ...prev])
      message.success(`谋划项目新增成功，区级项目编码：${districtProjectCode}`)
      setAddModalVisible(false)
      form.resetFields()
      setL4Hits([])
      setL4Expanded(false)
      l4AckRef.current = false
    } finally {
      setAddLoading(false)
    }
  }

  const handleAddOk = async () => {
    try {
      const values = await form.validateFields()
      // ===== 实时判重（PRD 2.1.8 场景一）：比对谋划库 + 在谈库，提交结果不进入研判池 =====
      const now = new Date()
      const pad = (n) => String(n).padStart(2, '0')
      const hits = checkDuplicates({
        projectName: values.projectName,
        investAmount: values.investAmount,
        industryCategory: values.industryType || '',
        industryType: values.industryCategory ? values.industryCategory.join(' / ') : '',
        reporter: '投促局管理员',
        reportTime: `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`,
      }, [
        { stage: '谋划', rows: dataList },
        { stage: '在谈', rows: buildZaitanLib() },
      ])
      const strongHits = hits.filter(h => h.level !== 'L4')
      const l4Only = hits.filter(h => h.level === 'L4')
      if (strongHits.length > 0) {
        // L1 阻断 / L2·L3 二选一（预警弹窗）
        setWarnValues(values)
        setWarnHits(hits)
        setWarnVisible(true)
        return
      }
      if (l4Only.length > 0 && !l4AckRef.current) {
        // L4 弱提示：表单保持打开，顶部提示条，可展开冲突列表；再次提交直接保存
        l4AckRef.current = true
        setL4Hits(l4Only)
        setL4Expanded(false)
        message.warning('检测到与库中项目存在弱相似信号，建议核实是否重复；确认无误可再次提交')
        return
      }
      await doAddSave(values)
    } catch (err) {
      // validation error, do nothing
    }
  }

  const handleWarnReturn = () => {
    setWarnVisible(false)
    setWarnHits([])
    setWarnValues(null)
  }

  const handleWarnForce = async () => {
    setWarnVisible(false)
    setWarnHits([])
    const values = warnValues
    setWarnValues(null)
    if (values) await doAddSave(values)
  }

  const formItemLayout = {
    labelCol: { span: 8 },
    wrapperCol: { span: 16 },
  }

  return (
    <>
      <GenericProjectList
        stage="mouhua"
        title="项目谋划"
        addButtonText="新增谋划项目"
        nextStageText="在谈"
        dataList={dataList}
        columns={columns}
        filters={extraFilters}
        scrollX={1630}
        canAdd={true}
        canImport={false}
        onAdd={handleAdd}
        hiddenFilters={['acceptStatus', 'auditStatus', 'warnStatus', 'enterpriseNature']}
      />
      <Modal
        title="新增谋划项目"
        open={addModalVisible}
        onOk={handleAddOk}
        onCancel={() => { setAddModalVisible(false); form.resetFields() }}
        confirmLoading={addLoading}
        okText="确定"
        cancelText="取消"
        width={960}
        destroyOnClose
        bodyStyle={{ padding: '24px', maxHeight: '70vh', overflowY: 'auto' }}
      >
        <Form form={form} {...formItemLayout} layout="horizontal" requiredMark={true} colon={false}>
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
                      <a onClick={() => { setAddModalVisible(false); setWarnVisible(false); navigate(`/project/${h.target.stage === '在谈' ? 'zaitan' : 'mouhua'}/detail/${h.target.key}`) }}>
                        {h.target.projectName}
                      </a>
                      <Tag bordered={false}>{h.target.stageLabel}</Tag>
                      <span style={{ color: '#8c8c8c', fontSize: 12 }}>{h.reason}</span>
                    </div>
                  ))}
                </div>
              ) : undefined}
            />
          )}
          <Row gutter={24}>
            <Col span={12}>
              <Form.Item label="项目名称" name="projectName" rules={[{ required: true, message: '请输入项目名称' }, { max: 40, message: '项目名称不超过40个字符' }]}>
                <Input placeholder="请输入项目名称" maxLength={40} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="内外资" name="capitalNature" rules={[{ required: true, message: '请选择内外资' }]}>
                <Select placeholder="请选择内外资" onChange={() => form.setFieldValue('sourceRegion', undefined)}>
                  {CAPITAL_NATURE_OPTIONS.map(o => <Option key={o} value={o}>{o}</Option>)}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="来源地" name="sourceRegion" rules={[{ required: true, message: '请选择来源地' }]}>
                <Cascader
                  options={capitalNature === '外资' ? FOREIGN_COUNTRY_OPTIONS : capitalNature === '内资' ? DOMESTIC_REGION_OPTIONS : []}
                  placeholder={capitalNature === '外资' ? '请选择国家' : capitalNature === '内资' ? '请选择省份/城市' : '请先选择内外资'}
                  expandTrigger="hover"
                  showSearch
                  disabled={!capitalNature}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="产业类别" name="industryType" rules={[{ required: true, message: '请选择产业类别' }]}>
                <Select placeholder="请选择产业类别">
                  {INDUSTRY_TYPE_OPTIONS.map(o => <Option key={o} value={o}>{o}</Option>)}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="行业类别" name="industryCategory" rules={[{ required: true, message: '请选择行业类别' }]}>
                <Cascader
                  options={INDUSTRY_CASCADER_OPTIONS}
                  placeholder="请选择行业类别（门类/大类）"
                  expandTrigger="hover"
                  showSearch
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="计划投资总额(亿元)" name="investAmount" rules={[{ required: true, message: '请输入计划投资总额' }, { type: 'number', min: 0.01, message: '计划投资总额需大于0' }]}>
                <InputNumber style={{ width: '100%' }} placeholder="请输入" min={0} precision={2} addonAfter="亿元" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="责任单位" name="responsibleUnits" rules={[{ required: true, message: '请选择责任单位（至少1个）' }]}>
                <Select mode="multiple" options={RESPONSIBLE_UNIT_SELECT_GROUPS} placeholder="请选择责任单位" showSearch allowClear maxTagCount="responsive" />
              </Form.Item>
            </Col>
            <Col span={24}>
              <Form.Item label="项目简介" name="projectDescription" labelCol={{ span: 4 }} wrapperCol={{ span: 20 }} rules={[{ required: true, message: '请输入项目简介' }, { max: 999, message: '项目简介不超过999个字符' }]}>
                <TextArea rows={4} placeholder="请输入项目简介，最多999字" maxLength={999} showCount />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>
      <Modal
        title={`进展汇报 - ${currentProgressProject?.projectName || ''}`}
        open={progressModalVisible}
        onOk={handleProgressOk}
        onCancel={() => { setProgressModalVisible(false); progressForm.resetFields() }}
        confirmLoading={progressLoading}
        okText="提交"
        cancelText="取消"
        width={600}
        destroyOnClose
      >
        <Form form={progressForm} layout="vertical" requiredMark={true} style={{ marginTop: 16 }}>
          <Form.Item
            label="进展内容"
            name="content"
            rules={[{ required: true, message: '请输入进展内容' }, { max: 500, message: '进展内容不超过500个字符' }]}
          >
            <TextArea rows={6} placeholder="请输入进展内容，最多500字" maxLength={500} showCount />
          </Form.Item>
        </Form>
      </Modal>
      <TransferToZaitanModal
        open={transferModalVisible}
        onCancel={() => setTransferModalVisible(false)}
        onOk={handleTransferOk}
        projectData={currentTransferProject}
      />

      {/* 实时判重预警弹窗（L1 阻断 / L2·L3 二选一） */}
      <DuplicateWarningModal
        open={warnVisible}
        hits={warnHits}
        contextTitle="新增谋划项目"
        onReturn={handleWarnReturn}
        onForce={handleWarnForce}
        onCloseAll={() => { setAddModalVisible(false); setWarnVisible(false) }}
      />

      {/* 退库确认弹窗 */}
      <Modal
        title={
          <span style={{ color: '#d4380d' }}>
            <ExclamationCircleOutlined style={{ marginRight: 8 }} />
            确认退库
          </span>
        }
        open={tuikuVisible}
        onCancel={() => { setTuikuVisible(false); setTuikuRecord(null); setTuikuReason('') }}
        okText="确认退库"
        cancelText="取消"
        okButtonProps={{ danger: true }}
        onOk={() => {
          message.success('已标记为退库（demo示意）')
          setTuikuVisible(false)
          setTuikuRecord(null)
          setTuikuReason('')
        }}
      >
        <div style={{ marginBottom: 16 }}>
          确定将项目「<strong>{tuikuRecord?.projectName}</strong>」标记为退库吗？退库后不可恢复。
        </div>
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 13, color: '#595959', marginBottom: 6 }}>
            退库说明 <span style={{ color: '#bfbfbf' }}>（非必填，最多500字）</span>
          </div>
          <Input.TextArea
            value={tuikuReason}
            onChange={(e) => setTuikuReason(e.target.value)}
            placeholder="请输入退库原因（非必填）"
            maxLength={500}
            showCount
            rows={4}
          />
        </div>
      </Modal>
    </>
  )
}
