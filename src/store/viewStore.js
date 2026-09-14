import { useEffect, useState } from 'react'
import { VIEW_ROLES } from '../constants/assignConfig'

// 简单的全局视角store（事件通知模式，无需Provider）
let currentRole = VIEW_ROLES[0] // 默认发起人视角
const listeners = new Set()

export const viewStore = {
  getRole() {
    return currentRole
  },
  setRole(roleKey) {
    const r = VIEW_ROLES.find(x => x.key === roleKey)
    if (r && r.key !== currentRole.key) {
      currentRole = r
      listeners.forEach(fn => fn(currentRole))
    }
  },
  subscribe(fn) {
    listeners.add(fn)
    return () => listeners.delete(fn)
  },
}

// React hook
export function useViewRole() {
  const [role, setRole] = useState(currentRole)
  useEffect(() => {
    const handler = (r) => setRole(r)
    listeners.add(handler)
    return () => listeners.delete(handler)
  }, [])
  return {
    role,
    setRole: viewStore.setRole,
    isSponsor: role.isSponsor,
    myDeptKey: role.deptKey,
  }
}

// 全局消息store（分派/反馈/完成/导入判重/系统通知/待办）
// category: 'coop' 协作消息 | 'system' 系统通知 | 'todo' 待办事项
// toDeptKey: 指定单位仅该视角可见；'all' 表示全员可见（系统通知/待办）
let messages = [
  {
    id: 'sys2',
    toDeptKey: 'all',
    category: 'system',
    title: '超期预警：「某新能源汽车零部件项目」已超过30天未更新',
    time: '2026-08-25 14:30',
    read: false,
    type: 'warning',
    projectId: 'zaitan-2',
    stage: 'zaitan',
  },
  {
    id: 'sys3',
    toDeptKey: 'all',
    category: 'system',
    title: '超期预警：「某高端装备制造项目」已超过20天未更新',
    time: '2026-08-25 10:15',
    read: true,
    type: 'warning',
    projectId: 'zaitan-3',
    stage: 'zaitan',
  },
  {
    id: 'todo2',
    toDeptKey: 'all',
    category: 'todo',
    title: '请更新「某智能制造装备项目」进展汇报（剩余3天）',
    time: '2026-08-25 15:00',
    read: false,
    type: 'report',
    projectId: 'zaitan-4',
    stage: 'zaitan',
    action: 'report',
  },
  {
    id: 'm1',
    toDeptKey: 'kcj',
    category: 'coop',
    title: '【协作任务分派】',
    content: '您有一条来自"市投促局"的"人工智能药物研发及产业化平台建设项目"协作配合任务，请及时查看并跟进处理。',
    projectId: 'zaitan-1',
    stage: 'zaitan',
    projectName: '人工智能药物研发及产业化平台建设项目',
    time: '2026-08-28 10:30',
    read: false,
    type: 'assign',
    action: 'assign',
  },
  {
    id: 'm2',
    toDeptKey: 'qfj',
    category: 'coop',
    title: '【协作任务分派】',
    content: '您有一条来自"市投促局"的"人工智能药物研发及产业化平台建设项目"协作配合任务，请及时查看并跟进处理。',
    projectId: 'zaitan-1',
    stage: 'zaitan',
    projectName: '人工智能药物研发及产业化平台建设项目',
    time: '2026-08-28 10:30',
    read: false,
    type: 'assign',
    action: 'assign',
  },
  {
    id: 'm3',
    toDeptKey: 'sponsor',
    category: 'coop',
    title: '【协作反馈提醒】',
    content: '"东湖高新区"已提交"人工智能药物研发及产业化平台建设项目"的协作处理结果，请点击查看详情。',
    projectId: 'zaitan-1',
    stage: 'zaitan',
    projectName: '人工智能药物研发及产业化平台建设项目',
    time: '2026-05-08 15:20',
    read: false,
    type: 'feedback',
    action: 'assign',
  },
]
const msgListeners = new Set()

const visibleTo = (m, deptKey) => m.toDeptKey === deptKey || m.toDeptKey === 'all'

export const msgStore = {
  getMessages(deptKey) {
    return messages.filter(m => visibleTo(m, deptKey))
  },
  getUnreadCount(deptKey) {
    return messages.filter(m => visibleTo(m, deptKey) && !m.read).length
  },
  addMessage(msg) {
    messages = [{ id: `m${Date.now()}`, read: false, category: 'coop', time: new Date().toLocaleString('zh-CN', { hour12: false }).replace(/\//g, '-'), ...msg }, ...messages]
    msgListeners.forEach(fn => fn())
  },
  markRead(id) {
    let changed = false
    messages = messages.map(m => (m.id === id && !m.read ? (changed = true, { ...m, read: true }) : m))
    if (changed) msgListeners.forEach(fn => fn())
  },
  markAllRead(deptKey) {
    let changed = false
    messages = messages.map(m => (visibleTo(m, deptKey) && !m.read ? (changed = true, { ...m, read: true }) : m))
    if (changed) msgListeners.forEach(fn => fn())
  },
  subscribe(fn) {
    msgListeners.add(fn)
    return () => msgListeners.delete(fn)
  },
}

export function useMessages() {
  const { role } = useViewRole()
  const [, tick] = useState(0)
  useEffect(() => {
    return msgStore.subscribe(() => tick(n => n + 1))
  }, [])
  return {
    list: msgStore.getMessages(role.deptKey),
    unread: msgStore.getUnreadCount(role.deptKey),
    markAllRead: () => msgStore.markAllRead(role.deptKey),
  }
}

// 全局导入store（Excel导入判重后，成功项目注入阶段列表、冲突记录注入研判池）
let importedData = null // { stage, stageLabel, successProjects, conflicts, skipped, summary, time }
const importListeners = new Set()

export const importStore = {
  getImported() {
    return importedData
  },
  setImported(data) {
    importedData = data
    importListeners.forEach(fn => fn())
  },
  clearImported() {
    importedData = null
    importListeners.forEach(fn => fn())
  },
  subscribe(fn) {
    importListeners.add(fn)
    return () => importListeners.delete(fn)
  },
}

export function useImported() {
  const [, tick] = useState(0)
  useEffect(() => {
    return importStore.subscribe(() => tick(n => n + 1))
  }, [])
  return importStore.getImported()
}

// 全局移交store（在谈项目移交：仅支持一次，双方共同管理）
// transfers: [{ id, projectId, projectName, toDeptKey, toDeptName, reason, by, time }]
let transfers = []
const transferListeners = new Set()

export const transferStore = {
  getTransfers() {
    return transfers
  },
  getTransferByProject(projectId) {
    return transfers.find(t => String(t.projectId) === String(projectId)) || null
  },
  hasTransferred(projectId) {
    return !!transferStore.getTransferByProject(projectId)
  },
  getTransfersByDept(deptKey) {
    return transfers.filter(t => t.toDeptKey === deptKey)
  },
  addTransfer(record) {
    // 一次移交约束：已有记录则忽略
    if (transferStore.hasTransferred(record.projectId)) return
    transfers = [{ id: `tr-${Date.now()}`, ...record }, ...transfers]
    transferListeners.forEach(fn => fn())
  },
  subscribe(fn) {
    transferListeners.add(fn)
    return () => transferListeners.delete(fn)
  },
}

export function useTransferStore() {
  const [, tick] = useState(0)
  useEffect(() => {
    return transferStore.subscribe(() => tick(n => n + 1))
  }, [])
  return transferStore.getTransfers()
}

// 全局退库审核store（签约项目退库：申请 → 投促局审核 → 通过/驳回）
// audits: [{ id, projectId, projectName, reason, applicantDeptKey, applicantDeptName,
//            applyTime, status: 'pending' | 'approved' | 'rejected',
//            auditTime, auditor, auditOpinion }]
let tuikuAudits = []
const tuikuAuditListeners = new Set()

export const tuikuAuditStore = {
  getAuditList() {
    return tuikuAudits
  },
  getByProject(projectId) {
    return tuikuAudits.find(a => String(a.projectId) === String(projectId)) || null
  },
  hasPending(projectId) {
    const a = tuikuAuditStore.getByProject(projectId)
    return !!a && a.status === 'pending'
  },
  addApply(record) {
    // 同一项目已有驳回记录则复用该记录（状态切回待审核并更新申请信息），否则新建
    const exist = tuikuAudits.find(a => String(a.projectId) === String(record.projectId) && a.status === 'rejected')
    if (exist) {
      tuikuAudits = tuikuAudits.map(a => (
        a.id === exist.id
          ? { ...a, ...record, status: 'pending', auditTime: undefined, auditor: undefined, auditOpinion: undefined }
          : a
      ))
    } else {
      tuikuAudits = [{ id: `ta-${Date.now()}`, status: 'pending', ...record }, ...tuikuAudits]
    }
    tuikuAuditListeners.forEach(fn => fn())
  },
  audit(id, { result, opinion, auditor }) {
    tuikuAudits = tuikuAudits.map(a => (
      a.id === id
        ? { ...a, status: result, auditTime: new Date().toLocaleString('zh-CN', { hour12: false }).replace(/\//g, '-'), auditor, auditOpinion: opinion }
        : a
    ))
    tuikuAuditListeners.forEach(fn => fn())
  },
  subscribe(fn) {
    tuikuAuditListeners.add(fn)
    return () => tuikuAuditListeners.delete(fn)
  },
}

export function useTuikuAuditStore() {
  const [, tick] = useState(0)
  useEffect(() => {
    return tuikuAuditStore.subscribe(() => tick(n => n + 1))
  }, [])
  return tuikuAuditStore.getAuditList()
}
