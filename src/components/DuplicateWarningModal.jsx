import { useNavigate } from 'react-router-dom'
import { Modal, Tag, Button, Popconfirm, Typography } from 'antd'
import {
  WarningFilled,
  RightOutlined,
} from '@ant-design/icons'

const { Text } = Typography

/**
 * 项目重复研判 · 实时判重预警弹窗（PRD 2.1.8 场景一）
 *
 * 命中 L1：阻断，仅提供「返回修改」（无提交入口）
 * 命中 L2/L3：提供「返回修改」（默认推荐）+「仍要提交」（次级按钮，需二次点击确认）
 * 多命中：全部列出，按冲突等级从高到低排序
 */

const LEVEL_META = {
  L1: { label: 'L1 强匹配', color: 'red' },
  L2: { label: 'L2 高相似', color: 'orange' },
  L3: { label: 'L3 中风险', color: 'gold' },
}

const STAGE_PATH = { 在谈: 'zaitan', 谋划: 'mouhua', 签约: 'qianyue', 落地: 'luodi' }

const STATUS_META = {
  same: { text: '一致', color: '#52c41a', bg: '#f6ffed' },
  similar: { text: '相似', color: '#fa8c16', bg: '#fff7e6' },
  diff: { text: '差异', color: '#f5222d', bg: '#fff1f0' },
}

function HitCard({ hit, onViewDetail }) {
  const meta = LEVEL_META[hit.level] || LEVEL_META.L3
  const t = hit.target
  const canView = !!STAGE_PATH[t.stage]
  return (
    <div style={{ border: '1px solid #f0f0f0', borderRadius: 8, padding: '12px 16px', marginBottom: 12 }}>
      {/* 等级 + 置信度 + 判定理由 */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
        <Tag color={meta.color} style={{ marginRight: 0, fontWeight: 600 }}>{meta.label}</Tag>
        <Text type="secondary" style={{ fontSize: 12 }}>置信度 {Math.round(hit.confidence * 100)}%</Text>
        <Text style={{ fontSize: 13 }}>{hit.reason}</Text>
      </div>
      {/* 冲突项目卡片 */}
      <div style={{ background: '#fafafa', borderRadius: 6, padding: '10px 12px', marginBottom: 10 }}>
        <div style={{ marginBottom: 6 }}>
          <span style={{ fontWeight: 600, fontSize: 14 }}>{t.projectName}</span>
          <Tag style={{ marginLeft: 8 }} bordered={false}>{t.stageLabel || t.stage}</Tag>
        </div>
        <div style={{ fontSize: 12, color: '#595959', display: 'flex', flexWrap: 'wrap', gap: '2px 20px' }}>
          <span>投资主体：{t.investorEntity || '—'}</span>
          <span>投资金额：{Number(t.investAmount).toFixed(2)} 亿元</span>
          <span>申报单位（申报人）：{t.importSource && t.importSource !== '—' ? `${t.importSource} · ` : ''}{t.reporter}</span>
        </div>
        {canView && (
          <a style={{ fontSize: 12, marginTop: 6, display: 'inline-block' }} onClick={() => onViewDetail(hit)}>
            查看原项目详情 <RightOutlined style={{ fontSize: 10 }} />
          </a>
        )}
      </div>
      {/* 精简字段对照表 */}
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
        <thead>
          <tr style={{ background: '#fafafa' }}>
            <th style={{ textAlign: 'left', padding: '6px 8px', fontWeight: 500, color: '#8c8c8c', width: 110 }}>比对字段</th>
            <th style={{ textAlign: 'left', padding: '6px 8px', fontWeight: 500, color: '#8c8c8c' }}>新录入数据</th>
            <th style={{ textAlign: 'left', padding: '6px 8px', fontWeight: 500, color: '#8c8c8c' }}>库中项目</th>
            <th style={{ textAlign: 'center', padding: '6px 8px', fontWeight: 500, color: '#8c8c8c', width: 110 }}>标记</th>
          </tr>
        </thead>
        <tbody>
          {hit.fields.map(f => {
            const sm = STATUS_META[f.status]
            return (
              <tr key={f.key} style={{ borderTop: '1px solid #f0f0f0' }}>
                <td style={{ padding: '6px 8px', color: f.important ? '#262626' : '#8c8c8c' }}>
                  {f.important && <span style={{ color: '#fa541c', marginRight: 2 }}>*</span>}{f.label}
                </td>
                <td style={{ padding: '6px 8px' }}>
                  {f.isAmount ? Number(f.newValue).toFixed(2) : (f.newValue || '—')}
                </td>
                <td style={{ padding: '6px 8px' }}>
                  {f.isAmount ? Number(f.oldValue).toFixed(2) : (f.oldValue || '—')}
                </td>
                <td style={{ padding: '6px 8px', textAlign: 'center' }}>
                  <span style={{ color: sm.color, background: sm.bg, borderRadius: 4, padding: '1px 8px', fontSize: 12 }}>
                    {sm.text}{f.isAmount && f.deviation > 0 ? ` 偏差${f.deviation}%` : ''}{f.similarity !== undefined && f.similarity < 100 ? ` ${f.similarity}%` : ''}
                  </span>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
      {/* 字段一致性统计 */}
      <div style={{ marginTop: 8, fontSize: 12, color: '#595959' }}>
        字段一致性：<span style={{ color: '#52c41a' }}>{hit.stats.same} 项一致</span> / <span style={{ color: '#fa8c16' }}>{hit.stats.similar} 项相似</span> / <span style={{ color: '#f5222d' }}>{hit.stats.diff} 项存在差异</span>
        <span style={{ color: '#8c8c8c', marginLeft: 8 }}>完整比对可通过详情页跳转查看</span>
      </div>
    </div>
  )
}

export default function DuplicateWarningModal({ open, hits = [], contextTitle = '', onReturn, onForce, onCloseAll }) {
  const navigate = useNavigate()
  if (!hits.length) return null
  const blocked = hits.every(h => h.level === 'L1')
  const maxLevel = hits[0]?.level || 'L3'
  const meta = LEVEL_META[maxLevel]

  const handleViewDetail = (hit) => {
    const path = STAGE_PATH[hit.target.stage]
    if (!path) return
    if (onCloseAll) onCloseAll()
    navigate(`/project/${path}/detail/${hit.target.key}`)
  }

  return (
    <Modal
      open={open}
      title={
        <span>
          <WarningFilled style={{ color: '#fa8c16', marginRight: 8 }} />
          重复项目预警
        </span>
      }
      width={760}
      onCancel={onReturn}
      maskClosable={false}
      footer={
        blocked ? [
          <Button key="back" type="primary" onClick={onReturn}>返回修改</Button>,
        ] : [
          <Button key="back" type="primary" onClick={onReturn}>返回修改</Button>,
          <Popconfirm
            key="force"
            title="确认仍要提交？"
            description="已确认识别为重复或相似项目，提交后将创建成功"
            okText="确认提交"
            cancelText="取消"
            onConfirm={onForce}
          >
            <Button danger>仍要提交</Button>
          </Popconfirm>,
        ]
      }
    >
      <div style={{ background: '#fffbe6', border: '1px solid #ffe58f', borderRadius: 6, padding: '10px 14px', marginBottom: 12, fontSize: 13 }}>
        检测到 <Text strong> {hits.length} </Text> 条疑似重复/相似项目（最高等级 <Tag color={meta.color} style={{ marginRight: 0 }}>{meta.label}</Tag>），
        {contextTitle && <>本次「{contextTitle}」</>}
        {blocked
          ? <>命中强匹配，<Text strong type="danger">已阻断保存</Text>，请修改后重新提交。</>
          : <>请核实是否为同一项目，可选择返回修改或仍要提交。</>}
      </div>
      <div style={{ maxHeight: 'calc(80vh - 220px)', overflowY: 'auto' }}>
        {hits.map((hit, i) => (
          <HitCard key={i} hit={hit} onViewDetail={handleViewDetail} />
        ))}
      </div>
    </Modal>
  )
}
