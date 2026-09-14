import { useState, useMemo } from 'react'
import { Row, Col, Card, Table, Tag, Progress, Button, Space, Select, Tooltip, Dropdown, message } from 'antd'
import { DownloadOutlined, TrophyOutlined, DownOutlined } from '@ant-design/icons'
import ReactECharts from 'echarts-for-react'
import {
  PARKS, SOES, DEPTS,
  PARK_TARGETS, SOE_TARGETS, DEPT_TARGETS,
  GLOBAL_TOTALS, PARK_ACTIVITY_DETAIL, DEPT_LANDING_RESULTS,
  GLOBAL_EVENTS_SUMMARY, ASSESS_YEARS, ASSESS_MONTHS,
} from '../../constants/performanceData'
import { perfPageBg, perfCardStyle, filterBarStyle, perfSectionTitle, metricCardStyle } from '../../constants/performanceStyles'
import { COLORS } from '../../constants/uiStyles'

/* ==================== 工具函数 ==================== */

function calcRate(val) {
  if (!val?.target) return 0
  return Math.round((val.done / val.target) * 100)
}

function progressColor(rate) {
  if (rate >= 80) return '#52c41a'
  if (rate >= 60) return COLORS.primary
  if (rate >= 40) return '#faad14'
  return '#ff4d4f'
}

function rankTag(rank) {
  if (rank === 1) return <Tag color="gold" style={{ fontWeight: 600 }}>第{rank}名</Tag>
  if (rank === 2) return <Tag color="#d9d9d9" style={{ fontWeight: 600 }}>第{rank}名</Tag>
  if (rank === 3) return <Tag color="#cd7f32" style={{ fontWeight: 600 }}>第{rank}名</Tag>
  return <span style={{ color: '#8c8c8c', fontSize: 13 }}>第{rank}名</span>
}

function rateStatusTag(rate) {
  const map = [
    { min: 100, label: '已超额', color: '#52c41a' },
    { min: 80, label: '进展良好', color: COLORS.primary },
    { min: 60, label: '正常推进', color: '#faad14' },
    { min: 0, label: '需关注', color: '#ff4d4f' },
  ]
  const s = map.find(m => rate >= m.min)
  return <Tag color={s.color}>{s.label}</Tag>
}

/* ==================== 全局指标卡片 ==================== */

function MetricBox({ title, value, unit, color }) {
  return (
    <Card styles={{ body: { padding: '16px 20px' } }} style={{ ...metricCardStyle(color), background: '#fff' }}>
      <div style={{ fontSize: 13, color: '#8c8c8c', marginBottom: 4 }}>{title}</div>
      <div style={{ fontSize: 26, fontWeight: 700, color: '#262626' }}>
        {value}{unit && <span style={{ fontSize: 13, fontWeight: 400, color: '#8c8c8c', marginLeft: 4 }}>{unit}</span>}
      </div>
    </Card>
  )
}

/* ==================== 对象选择器（层级下拉） ==================== */

function TargetSelect({ value, onChange }) {
  // value 结构：{ type: 'park'|'soe'|'dept'|'all', keys: ['park1', 'park2'] }
  const items = [
    {
      key: 'park',
      label: (
        <Space>
          <span style={{ color: COLORS.primary, fontWeight: 600 }}>园区</span>
          <span style={{ color: '#bfbfbf', fontSize: 12 }}>8个</span>
        </Space>
      ),
      children: PARKS.map(p => ({ key: `park:${p.key}`, label: p.name })),
    },
    {
      key: 'soe',
      label: (
        <Space>
          <span style={{ color: '#722ed1', fontWeight: 600 }}>国企</span>
          <span style={{ color: '#bfbfbf', fontSize: 12 }}>4个</span>
        </Space>
      ),
      children: SOES.map(s => ({ key: `soe:${s.key}`, label: s.name })),
    },
    {
      key: 'dept',
      label: (
        <Space>
          <span style={{ color: '#13c2c2', fontWeight: 600 }}>部门</span>
          <span style={{ color: '#bfbfbf', fontSize: 12 }}>9个</span>
        </Space>
      ),
      children: DEPTS.map(d => ({ key: `dept:${d.key}`, label: d.name })),
    },
  ]

  // 显示文本
  const displayText = useMemo(() => {
    if (value.type === 'all') return '全部考核对象'
    const typeName = value.type === 'park' ? '园区' : value.type === 'soe' ? '国企' : '部门'
    const total = value.type === 'park' ? PARKS.length : value.type === 'soe' ? SOES.length : DEPTS.length
    if (value.keys.length === total) return `全部${typeName}`
    if (value.keys.length === 0) return `请选择${typeName}`
    if (value.keys.length === 1) {
      const list = value.type === 'park' ? PARKS : value.type === 'soe' ? SOES : DEPTS
      const found = list.find(x => x.key === value.keys[0])
      return found?.name || `已选1个`
    }
    return `已选 ${value.keys.length} 个${typeName}`
  }, [value])

  const handleMenuClick = ({ key }) => {
    if (key.startsWith('type:')) {
      const t = key.replace('type:', '')
      onChange({ type: t, keys: [] })
      return
    }
    const [type, k] = key.split(':')
    if (value.type !== type) {
      onChange({ type, keys: [k] })
    } else {
      const newKeys = value.keys.includes(k)
        ? value.keys.filter(x => x !== k)
        : [...value.keys, k]
      onChange({ type, keys: newKeys })
    }
  }

  // 自定义菜单（支持多选 + 分组）
  const menu = {
    items: [
      {
        key: 'all',
        label: <span style={{ fontWeight: 600 }}>全部考核对象</span>,
        onClick: () => onChange({ type: 'all', keys: [] }),
      },
      { type: 'divider' },
      {
        key: 'park-group',
        label: <span style={{ color: COLORS.primary, fontWeight: 600 }}>园区（8个）</span>,
        disabled: true,
      },
      ...PARKS.map(p => ({
        key: `park:${p.key}`,
        label: (
          <Space>
            <span>{p.name}</span>
            {value.type === 'park' && value.keys.includes(p.key) && <span style={{ color: COLORS.primary }}>✓</span>}
          </Space>
        ),
      })),
      { type: 'divider' },
      {
        key: 'soe-group',
        label: <span style={{ color: '#722ed1', fontWeight: 600 }}>国企（4个）</span>,
        disabled: true,
      },
      ...SOES.map(s => ({
        key: `soe:${s.key}`,
        label: (
          <Space>
            <span>{s.name}</span>
            {value.type === 'soe' && value.keys.includes(s.key) && <span style={{ color: '#722ed1' }}>✓</span>}
          </Space>
        ),
      })),
      { type: 'divider' },
      {
        key: 'dept-group',
        label: <span style={{ color: '#13c2c2', fontWeight: 600 }}>部门（9个）</span>,
        disabled: true,
      },
      ...DEPTS.map(d => ({
        key: `dept:${d.key}`,
        label: (
          <Space>
            <span>{d.name}</span>
            {value.type === 'dept' && value.keys.includes(d.key) && <span style={{ color: '#13c2c2' }}>✓</span>}
          </Space>
        ),
      })),
    ],
    onClick: handleMenuClick,
    selectedKeys: value.type === 'all' ? ['all'] : value.keys.map(k => `${value.type}:${k}`),
  }

  return (
    <Dropdown menu={menu} trigger={['click']} placement="bottomLeft">
      <Button style={{ minWidth: 160, textAlign: 'left' }} size="small">
        <Space style={{ justifyContent: 'space-between', width: '100%' }}>
          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 120 }}>{displayText}</span>
          <DownOutlined style={{ fontSize: 10, color: '#bfbfbf' }} />
        </Space>
      </Button>
    </Dropdown>
  )
}

/* ==================== 园区表格列 ==================== */

function parkColumns() {
  const indicators = [
    { key: 'signAmount', label: '签约金额（亿元）' },
    { key: 'startProject', label: '开工开业（个）' },
    { key: 'fdi', label: 'FDI（万美元）' },
  ]
  return [
    {
      title: '排名', width: 70, align: 'center', fixed: 'left',
      render: (_, __, idx) => rankTag(idx + 1),
    },
    { title: '园区名称', dataIndex: 'name', key: 'name', width: 110, align: 'center', fixed: 'left', render: t => <strong>{t}</strong> },
    ...indicators.flatMap(ind => [
      {
        title: ind.label, children: [
          { title: '目标值', dataIndex: [ind.key, 'target'], key: `${ind.key}-target`, width: 85, align: 'center', render: v => v != null ? <Tag color="blue" style={{ margin: 0 }}>{v}</Tag> : '-' },
          { title: '完成值', dataIndex: [ind.key, 'done'], key: `${ind.key}-done`, width: 85, align: 'center', render: v => v != null ? <strong>{typeof v === 'number' && v > 100 ? v.toFixed(1) : v}</strong> : '-' },
          {
            title: '完成率', dataIndex: ind.key, key: `${ind.key}-rate`, width: 100, align: 'center',
            render: val => { const r = calcRate(val); return <Progress percent={Math.min(r, 100)} size="small" strokeColor={progressColor(r)} format={() => `${r}%`} /> },
          },
        ],
      },
    ]),
  ]
}

/* ==================== 国企表格列 ==================== */

function soeColumns() {
  const indicators = [
    { key: 'dueDiligence', label: '尽调数（个）' },
    { key: 'subscriptionAmount', label: '认缴总额（亿元）' },
    { key: 'investAmount', label: '实缴总额（亿元）' },
    { key: 'industryProject', label: '产业链项目（个）' },
    { key: 'brandEvent', label: '品牌活动（场）' },
  ]
  return [
    { title: '国企名称', dataIndex: 'name', key: 'name', width: 120, align: 'center', fixed: 'left', render: t => <strong>{t}</strong> },
    ...indicators.flatMap(ind => [
      {
        title: ind.label, children: [
          { title: '目标值', dataIndex: [ind.key, 'target'], key: `${ind.key}-target`, width: 80, align: 'center', render: v => v != null ? <Tag color="blue" style={{ margin: 0 }}>{v}</Tag> : '-' },
          { title: '完成值', dataIndex: [ind.key, 'done'], key: `${ind.key}-done`, width: 80, align: 'center', render: v => v != null ? <strong>{typeof v === 'number' && v > 100 ? v.toFixed(1) : v}</strong> : '-' },
          {
            title: '完成率', dataIndex: ind.key, key: `${ind.key}-rate`, width: 90, align: 'center',
            render: val => { const r = calcRate(val); return <Progress percent={Math.min(r, 100)} size="small" strokeColor={progressColor(r)} format={() => `${r}%`} /> },
          },
        ],
      },
    ]),
  ]
}

/* ==================== 部门表格列 ==================== */

function deptColumns() {
  return [
    { title: '部门', dataIndex: 'name', key: 'name', width: 100, align: 'center', fixed: 'left', render: t => <strong>{t}</strong> },
    {
      title: '招商目标', dataIndex: 'targets', key: 'task', ellipsis: true, minWidth: 200,
      render: (_, row) => {
        const arr = row.targets || []
        return arr.map(t => typeof t === 'string' ? t : t.text).join('；')
      },
    },
    {
      title: '实际落地成果', key: 'landingResults', ellipsis: true, minWidth: 200,
      render: (_, row) => {
        const info = DEPT_LANDING_RESULTS.find(d => d.deptKey === row.key)
        return info?.landingResults?.length ? info.landingResults.join('；') : <span style={{ color: '#bfbfbf' }}>-</span>
      },
    },
    {
      title: '已入库项目', key: 'inStock', width: 180,
      render: (_, row) => {
        const info = DEPT_LANDING_RESULTS.find(d => d.deptKey === row.key)
        const projects = info?.inStockProjects || []
        if (!projects.length) return <span style={{ color: '#bfbfbf' }}>-</span>
        return (
          <Tooltip placement="topLeft" title={<div style={{ maxWidth: 320 }}>{projects.map((p, i) => <div key={i} style={{ marginBottom: 4 }}>{p}</div>)}</div>}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
              {projects.slice(0, 2).map(p => <Tag key={p} color="success" style={{ margin: 0 }}>{p}</Tag>)}
              {projects.length > 2 && <Tag style={{ margin: 0 }}>+{projects.length - 2}</Tag>}
            </div>
          </Tooltip>
        )
      },
    },
    {
      title: '待入库项目', key: 'pending', width: 180,
      render: (_, row) => {
        const info = DEPT_LANDING_RESULTS.find(d => d.deptKey === row.key)
        const projects = info?.pendingProjects || []
        if (!projects.length) return <span style={{ color: '#bfbfbf' }}>-</span>
        return (
          <Tooltip placement="topLeft" title={<div style={{ maxWidth: 320 }}>{projects.map((p, i) => <div key={i} style={{ marginBottom: 4 }}>{p}</div>)}</div>}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
              {projects.slice(0, 2).map(p => <Tag key={p} color="warning" style={{ margin: 0 }}>{p}</Tag>)}
              {projects.length > 2 && <Tag style={{ margin: 0 }}>+{projects.length - 2}</Tag>}
            </div>
          </Tooltip>
        )
      },
    },
    {
      title: '备注（进度说明）', key: 'remark', ellipsis: true, minWidth: 180,
      render: (_, row) => {
        const remarks = row.targets.map(t => t.remark).filter(Boolean)
        if (!remarks.length) return '-'
        return remarks.map(r => (
          <Tooltip key={r} title={r}>
            <Tag color="blue" style={{ margin: '2px 2px 0', maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis' }}>{r.slice(0, 20)}…</Tag>
          </Tooltip>
        ))
      },
    },
  ]
}

/* ==================== 园区活动明细表 ==================== */

function ParkActivityTable({ data }) {
  return (
    <Table
      columns={[
        { title: '园区', dataIndex: 'park', width: 110, align: 'center', render: t => <strong>{t}</strong> },
        { title: '重点活动场次', dataIndex: 'eventCount', width: 110, align: 'center', render: v => <Tag color="red" style={{ fontWeight: 600, margin: 0 }}>{v}</Tag> },
        { title: '对接企业数', dataIndex: 'enterpriseContacts', width: 110, align: 'center', render: v => <strong>{v}家</strong> },
        { title: '获取线索数', dataIndex: 'clueCount', width: 90, align: 'center', render: v => <strong style={{ color: COLORS.primary }}>{v}条</strong> },
      ]}
      dataSource={data}
      rowKey="park"
      size="small"
      scroll={{ x: 500 }}
      pagination={false}
    />
  )
}

/* ==================== 主页面组件 ==================== */

export default function PerformanceOverview() {
  const [year, setYear] = useState('2026')
  const [month, setMonth] = useState('all')
  const [targetFilter, setTargetFilter] = useState({ type: 'all', keys: [] })

  // 根据筛选条件过滤数据
  const filteredParks = useMemo(() => {
    if (targetFilter.type !== 'park' || targetFilter.keys.length === 0) return PARK_TARGETS
    return PARK_TARGETS.filter(p => targetFilter.keys.includes(p.key))
  }, [targetFilter])

  const filteredSoes = useMemo(() => {
    if (targetFilter.type !== 'soe' || targetFilter.keys.length === 0) return SOE_TARGETS
    return SOE_TARGETS.filter(s => targetFilter.keys.includes(s.key))
  }, [targetFilter])

  const filteredDepts = useMemo(() => {
    if (targetFilter.type !== 'dept' || targetFilter.keys.length === 0) return DEPTS
    return DEPTS.filter(d => targetFilter.keys.includes(d.key))
  }, [targetFilter])

  const filteredActivities = useMemo(() => {
    if (targetFilter.type !== 'park' || targetFilter.keys.length === 0) return PARK_ACTIVITY_DETAIL
    const parkNames = PARKS.filter(p => targetFilter.keys.includes(p.key)).map(p => p.name)
    return PARK_ACTIVITY_DETAIL.filter(a => parkNames.includes(a.park))
  }, [targetFilter])

  // 按筛选重新计算总指标（粗略模拟）
  const displayTotals = useMemo(() => {
    if (targetFilter.type === 'park' && targetFilter.keys.length > 0) {
      const parks = filteredParks
      return {
        billionProjects: parks.reduce((s, p) => s + (p.signAmount?.done || 0) * 0.3, 0).toFixed(0),
        signAmount: parks.reduce((s, p) => s + (p.signAmount?.done || 0), 0).toFixed(1),
        fundArrival: parks.reduce((s, p) => s + (p.fundArrival?.done || 0), 0).toFixed(1),
        startCount: parks.reduce((s, p) => s + (p.startProject?.done || 0), 0),
        fdi: parks.reduce((s, p) => s + (p.fdi?.done || 0), 0).toFixed(0),
        cityRanking: 3,
      }
    }
    if (targetFilter.type === 'soe' && targetFilter.keys.length > 0) {
      const soes = filteredSoes
      return {
        billionProjects: soes.length * 2,
        signAmount: '-',
        fundArrival: soes.reduce((s, p) => s + (p.investAmount?.done || 0), 0).toFixed(1),
        startCount: soes.reduce((s, p) => s + (p.industryProject?.done || 0), 0),
        fdi: '-',
        cityRanking: '-',
      }
    }
    if (targetFilter.type === 'dept' && targetFilter.keys.length > 0) {
      return {
        billionProjects: '-',
        signAmount: '-',
        fundArrival: '-',
        startCount: '-',
        fdi: '-',
        cityRanking: '-',
      }
    }
    return GLOBAL_TOTALS
  }, [targetFilter, filteredParks, filteredSoes])

  // ECharts option
  const pieOption = useMemo(() => ({
    tooltip: { trigger: 'item', formatter: '{b}: {c} ({d}%)' },
    legend: { bottom: 0, icon: 'circle' },
    color: [COLORS.primary, '#52c41a', '#faad14'],
    series: [{ type: 'pie', radius: ['42%', '68%'], center: ['50%', '48%'], avoidLabelOverlap: false, itemStyle: { borderRadius: 6, borderColor: '#fff', borderWidth: 2 }, label: { show: false }, emphasis: { label: { show: true, fontSize: 14, fontWeight: 600 } }, data: [
      { value: typeof displayTotals.signAmount === 'number' ? displayTotals.signAmount : 0, name: '签约金额' },
      { value: typeof displayTotals.fundArrival === 'number' ? displayTotals.fundArrival : 0, name: '到位资金' },
      { value: typeof displayTotals.startCount === 'number' ? displayTotals.startCount : 0, name: '开工项目' },
    ]}],
  }), [displayTotals])

  const barOption = useMemo(() => ({
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
    grid: { left: 80, right: 32, top: 16, bottom: 32 },
    xAxis: { type: 'value', max: 120 },
    yAxis: { type: 'category', data: [...filteredParks.map(p => p.name)].reverse(), axisLabel: { fontSize: 12 } },
    series: [{
      type: 'bar', barWidth: 18, data: [...filteredParks.map(r => calcRate(r.signAmount)).reverse()],
      itemStyle: { borderRadius: [0, 4, 4, 0], color: { type: 'linear', x: 0, y: 0, x2: 1, y2: 0, colorStops: [{ offset: 0, color: '#69b1ff' }, { offset: 1, color: COLORS.primary }] } },
      label: { show: true, position: 'right', formatter: '{c}%', fontSize: 12 },
    }],
  }), [filteredParks])

  const handleExport = () => {
    message.success(`已生成 ${year}年${month === 'all' ? '度' : month + '月'}通报文件`)
  }

  // 判断显示哪些区块
  const showPark = targetFilter.type === 'all' || targetFilter.type === 'park'
  const showSoe = targetFilter.type === 'all' || targetFilter.type === 'soe'
  const showDept = targetFilter.type === 'all' || targetFilter.type === 'dept'
  const showActivity = targetFilter.type === 'all' || targetFilter.type === 'park'

  return (
    <div style={perfPageBg}>
      {/* ====== 标题栏 ====== */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h2 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: '#262626' }}>绩效考核总览</h2>
        <Space>
          <Select value={year} onChange={setYear} style={{ width: 90 }} size="small" options={ASSESS_YEARS.map(y => ({ label: y + '年', value: y }))} />
          <Select value={month} onChange={setMonth} style={{ width: 100 }} size="small" options={[{ label: '全年', value: 'all' }, ...ASSESS_MONTHS.map(m => ({ label: m.label, value: m.key }))]} />
          <TargetSelect value={targetFilter} onChange={setTargetFilter} />
          <Button type="primary" icon={<DownloadOutlined />} onClick={handleExport}>导出通报</Button>
        </Space>
      </div>

      {/* ====== 全区总指标 ====== */}
      <div style={perfSectionTitle('16px 0 12px')}>全区总指标</div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 12, marginBottom: 24 }}>
        <MetricBox title="亿元项目数" value={displayTotals.billionProjects} unit="个" color={COLORS.primary} />
        <MetricBox title="签约额" value={displayTotals.signAmount} unit="亿元" color={COLORS.primary} />
        <MetricBox title="到位资金" value={displayTotals.fundArrival} unit="亿元" color="#52c41a" />
        <MetricBox title="开工数" value={displayTotals.startCount} unit="个" color="#faad14" />
        <MetricBox title="FDI" value={typeof displayTotals.fdi === 'number' ? displayTotals.fdi.toLocaleString() : displayTotals.fdi} unit="万美元" color="#722ed1" />
      </div>

      {/* ====== 园区核心指标 ====== */}
      {showPark && (
        <>
          <div style={perfSectionTitle()}>各园区核心指标完成情况</div>
          <Card style={perfCardStyle} bodyStyle={{ padding: '0 16px 16px' }}>
            <Table columns={parkColumns()} dataSource={filteredParks.map((r, i) => ({ ...r, _rank: i + 1 }))} rowKey="key" size="small" scroll={{ x: 850 }} pagination={false} />
          </Card>
        </>
      )}

      {/* ====== 国企指标 ====== */}
      {showSoe && (
        <>
          <div style={{ ...perfSectionTitle(), marginTop: 24 }}>区属国企指标完成情况</div>
          <Card style={perfCardStyle} bodyStyle={{ padding: '0 16px 16px' }}>
            <Table columns={soeColumns()} dataSource={filteredSoes} rowKey="key" size="small" scroll={{ x: 650 }} pagination={false} />
          </Card>
        </>
      )}

      {/* ====== 部门考核 ====== */}
      {showDept && (
        <>
          <div style={{ ...perfSectionTitle(), marginTop: 24 }}>职能部门考核及落地成果</div>
          <Card style={perfCardStyle} bodyStyle={{ padding: '0 16px 16px' }}>
            <Table columns={deptColumns()} dataSource={filteredDepts} rowKey="key" size="small" scroll={{ x: 1050 }} pagination={false} />
          </Card>
        </>
      )}

      {/* ====== 园区活动情况表 ====== */}
      {showActivity && (
        <>
          <div style={{ ...perfSectionTitle(), marginTop: 24 }}>各园区活动情况</div>
          <Card style={perfCardStyle} bodyStyle={{ padding: '0 16px 16px' }}>
            <ParkActivityTable data={filteredActivities} />
          </Card>
        </>
      )}

    </div>
  )
}
