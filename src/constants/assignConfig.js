// 全量组织/部门列表（实际对接时由OA接口返回，此处mock）
// 包含区直部门、街道、园区、平台公司等所有可分派的协作单位
export const ALL_UNITS = [
  // 区直部门
  { key: 'zzb', name: '组织部（人才工作局）', shortName: '组织部', contact: '组织部接口人' },
  { key: 'xcb', name: '宣传部', shortName: '宣传部', contact: '宣传部接口人' },
  { key: 'fgj', name: '发改局', shortName: '发改局', contact: '发改局接口人' },
  { key: 'kcj', name: '科创局', shortName: '科创局', contact: '王科长' },
  { key: 'qfj', name: '企服局', shortName: '企服局', contact: '李主任' },
  { key: 'ghj', name: '规划局', shortName: '规划局', contact: '规划局接口人' },
  { key: 'jsj', name: '建设局', shortName: '建设局', contact: '建设局接口人' },
  { key: 'jrj', name: '金融局', shortName: '金融局', contact: '金融局接口人' },
  { key: 'zmj', name: '自贸改革创新局', shortName: '自贸局', contact: '自贸局接口人' },
  // 街道
  { key: 'fzl', name: '佛祖岭街道', contact: '佛祖岭街道-周主任' },
  { key: 'bxj', name: '豹澥街道', contact: '豹澥街道-刘主任' },
  { key: 'jfj', name: '九峰街道', contact: '九峰街道-张主任' },
  // 园区
  { key: 'wljs', name: '未来科技城', contact: '未来科技城-陈主任' },
  { key: 'ggswc', name: '光谷生物城', contact: '生物城-吴主任' },
  { key: 'ggzx', name: '光谷中心城', contact: '中心城-孙主任' },
  { key: 'bq', name: '东湖综合保税区', contact: '综保区-郑主任' },
  // 平台公司
  { key: 'ggkt', name: '光谷科投集团', contact: '科投集团-赵总' },
  { key: 'ggrc', name: '光谷人才集团', contact: '人才集团-黄总' },
  { key: 'whgk', name: '武汉高科集团', contact: '高科集团-钱总' },
  { key: 'ggct', name: '光谷产投', contact: '产投-周总' },
  { key: 'ggjk', name: '光谷金控', contact: '金控-吴总' },
  { key: 'hbkt', name: '湖北科投', contact: '科投-王总' },
]

// 可切换的视角列表（演示用）
export const VIEW_ROLES = [
  { key: 'sponsor', deptKey: 'sponsor', deptName: '市投促局', userName: '张建国', isSponsor: true, label: '投促局-发起人' },
  { key: 'kcj', deptKey: 'kcj', deptName: '科创局', userName: '王科长', isSponsor: false, label: '科创局-王科长' },
  { key: 'qfj', deptKey: 'qfj', deptName: '企服局', userName: '李主任', isSponsor: false, label: '企服局-李主任' },
  { key: 'fgj', deptKey: 'fgj', deptName: '发改局', userName: '发改局接口人', isSponsor: false, label: '发改局接口人' },
  { key: 'jrj', deptKey: 'jrj', deptName: '金融局', userName: '金融局接口人', isSponsor: false, label: '金融局接口人' },
  { key: 'wljs', deptKey: 'wljs', deptName: '未来科技城', userName: '陈主任', isSponsor: false, label: '未来科技城-陈主任' },
  { key: 'ggkt', deptKey: 'ggkt', deptName: '光谷科投集团', userName: '赵总', isSponsor: false, label: '光谷科投-赵总' },
]

// 通过key查找组织完整信息（兼容发起人）
export function findUnitByKey(key) {
  if (key === 'sponsor') return { key: 'sponsor', name: '市投促局', shortName: '市投促局', contact: '张建国' }
  return ALL_UNITS.find(u => u.key === key) || null
}

// 兼容旧代码，保留FIXED_DEPARTMENTS别名（部分组件可能仍在引用）
export const FIXED_DEPARTMENTS = ALL_UNITS.slice(0, 9)
export const PARTNER_UNITS = ALL_UNITS.slice(9)
