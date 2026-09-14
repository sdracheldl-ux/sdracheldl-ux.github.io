import { useState, useMemo } from 'react'
import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import { Layout, Menu, Avatar, Dropdown, Breadcrumb, Badge, message, Button, Segmented, Select } from 'antd'
import {
  ProjectOutlined,
  BarChartOutlined,
  DashboardOutlined,
  SettingOutlined,
  UserOutlined,
  BellOutlined,
  SearchOutlined,
  AppstoreOutlined,
  TeamOutlined,
  FileTextOutlined,
  WarningOutlined,
  StopOutlined,
  PullRequestOutlined,
  AuditOutlined,
  PieChartOutlined,
  LineChartOutlined,
  UsergroupAddOutlined,
  SafetyCertificateOutlined,
  FileProtectOutlined,
  FieldTimeOutlined,
  NotificationOutlined,
  IdcardOutlined,
} from '@ant-design/icons'
import { useViewRole, useMessages } from '../store/viewStore'
import { VIEW_ROLES } from '../constants/assignConfig'

const { Header, Sider, Content } = Layout

const menuItems = [
  {
    key: 'dashboard',
    icon: <DashboardOutlined />,
    label: '统计看板',
    children: [
      { key: '/dashboard/project', icon: <PieChartOutlined />, label: '统计看板' },
    ],
  },
  {
    key: 'project',
    icon: <ProjectOutlined />,
    label: '项目全生命周期管理',
    children: [
      { key: '/project/mouhua', icon: <AppstoreOutlined />, label: '项目谋划' },
      { key: '/project/zaitan', icon: <TeamOutlined />, label: '跟踪洽谈' },
      { key: '/project/qianyue', icon: <FileTextOutlined />, label: '签约注册' },
      { key: '/project/luodi', icon: <AuditOutlined />, label: '项目落地' },
      { key: '/project/yanpan', icon: <WarningOutlined />, label: '项目重复研判' },
      { key: '/project/tuiku', icon: <StopOutlined />, label: '项目退库' },
    ],
  },
  {
    key: 'performance',
    icon: <BarChartOutlined />,
    label: '绩效考核',
    children: [
      { key: '/performance/targets', icon: <FileTextOutlined />, label: '目标设定' },
      { key: '/performance/progress', icon: <PullRequestOutlined />, label: '进展填报' },
      { key: '/performance/approval', icon: <AuditOutlined />, label: '审核管理' },
    ],
  },
  {
    key: 'system',
    icon: <SettingOutlined />,
    label: '系统管理',
    children: [
      { key: '/system/account', icon: <UsergroupAddOutlined />, label: '账号管理' },
      { key: '/system/role', icon: <SafetyCertificateOutlined />, label: '角色管理' },
      { key: '/system/log', icon: <FileProtectOutlined />, label: '日志管理' },
      { key: '/system/field', icon: <AppstoreOutlined />, label: '字段管理' },
      { key: '/system/overdue', icon: <FieldTimeOutlined />, label: '超期设置' },
      { key: '/system/notice', icon: <NotificationOutlined />, label: '消息通知' },
      { key: '/system/profile', icon: <IdcardOutlined />, label: '个人中心' },
    ],
  },
]

const breadcrumbMap = {
  '/project/mouhua': ['项目全生命周期管理', '项目谋划'],
  '/project/mouhua/detail': ['项目全生命周期管理', '项目谋划', '项目详情'],
  '/project/zaitan': ['项目全生命周期管理', '跟踪洽谈'],
  '/project/zaitan/detail': ['项目全生命周期管理', '跟踪洽谈', '项目详情'],
  '/project/qianyue': ['项目全生命周期管理', '签约注册'],
  '/project/luodi': ['项目全生命周期管理', '项目落地'],
  '/project/yanpan': ['项目全生命周期管理', '项目重复研判'],
  '/project/tuiku': ['项目全生命周期管理', '项目退库'],
  '/performance/targets': ['绩效考核', '目标设定'],
  '/performance/progress': ['绩效考核', '进展填报'],
  '/performance/approval': ['绩效考核', '审核管理'],
  '/dashboard/project': ['统计看板'],
  '/dashboard/perf': ['统计看板'],
  '/system/account': ['系统管理', '账号管理'],
  '/system/role': ['系统管理', '角色管理'],
  '/system/log': ['系统管理', '日志管理'],
  '/system/field': ['系统管理', '字段管理'],
  '/system/overdue': ['系统管理', '超期设置'],
  '/system/notice': ['系统管理', '消息通知'],
  '/system/profile': ['系统管理', '个人中心'],
}

export default function MainLayout() {
  const [collapsed, setCollapsed] = useState(false)
  const [openKeys, setOpenKeys] = useState(['project'])
  const navigate = useNavigate()
  const location = useLocation()
  const { role, setRole } = useViewRole()
  const { unread } = useMessages()

  const realPath = useMemo(() => {
    const h = location.hash || ''
    if (h.startsWith('#')) return h.slice(1) || '/'
    return location.pathname
  }, [location.pathname, location.hash])

  const currentOpenKeys = useMemo(() => {
    for (const item of menuItems) {
      if (item.children?.some(c => realPath.startsWith(c.key))) {
        const set = new Set([...openKeys, item.key])
        return Array.from(set)
      }
    }
    return openKeys
  }, [realPath, openKeys])

  const getBreadcrumbKey = (path) => {
    if (path.startsWith('/project/mouhua/detail')) return '/project/mouhua/detail'
    if (path.startsWith('/project/zaitan/detail')) return '/project/zaitan/detail'
    return path
  }

  const breadcrumbItems = (breadcrumbMap[getBreadcrumbKey(realPath)] || []).map((title, i, arr) => ({
    title: i === arr.length - 1 ? <span style={{ color: '#333' }}>{title}</span> : title,
  }))

  const userMenuItems = [
    { key: 'profile', icon: <UserOutlined />, label: '个人中心' },
  ]

  const handleUserMenuClick = ({ key }) => {
    if (key === 'profile') navigate('/system/profile')
  }

  const getMenuKey = (path) => {
    if (path.startsWith('/project/mouhua')) return '/project/mouhua'
    if (path.startsWith('/project/zaitan')) return '/project/zaitan'
    if (path.startsWith('/project/qianyue')) return '/project/qianyue'
    if (path.startsWith('/project/luodi')) return '/project/luodi'
    if (path.startsWith('/project/yanpan')) return '/project/yanpan'
    if (path.startsWith('/project/tuiku')) return '/project/tuiku'
    if (path.startsWith('/dashboard/project')) return '/dashboard/project'
    if (path.startsWith('/dashboard/perf')) return '/dashboard/perf'
    if (path.startsWith('/performance/targets')) return '/performance/targets'
    if (path.startsWith('/performance/progress')) return '/performance/progress'
    if (path.startsWith('/performance/approval')) return '/performance/approval'
    if (path.startsWith('/performance')) return '/performance/targets'
    if (path.startsWith('/system/')) {
      const matched = menuItems.find(m => m.key === 'system').children.find(c => path.startsWith(c.key))
      return matched ? matched.key : path
    }
    return path
  }

  const onViewRoleChange = (roleKey) => {
    setRole(roleKey)
    const r = VIEW_ROLES.find(x => x.key === roleKey)
    message.success(`已切换至${r.isSponsor ? '发起人' : '接收方'}视角：${r.label}`)
    if (realPath.startsWith('/project/zaitan/detail') || realPath.startsWith('/project/mouhua/detail')) {
      navigate('/project/zaitan')
    }
  }

  const receiverRoles = VIEW_ROLES.filter(r => !r.isSponsor)

  return (
    <Layout style={{ height: '100vh' }}>
      <Sider
        collapsible
        collapsed={collapsed}
        onCollapse={setCollapsed}
        width={220}
        theme="dark"
        style={{
          overflow: 'auto',
          height: '100vh',
          position: 'fixed',
          left: 0,
          top: 0,
          bottom: 0,
          background: '#001529',
        }}
      >
        <div
          style={{
            height: 56,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            fontSize: collapsed ? 14 : 15,
            fontWeight: 700,
            letterSpacing: collapsed ? 0 : 1,
            borderBottom: '1px solid rgba(255,255,255,0.08)',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
          }}
        >
          {collapsed ? '光谷' : '光谷项目全周期管理平台'}
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[getMenuKey(realPath)]}
          openKeys={currentOpenKeys}
          onOpenChange={(keys) => setOpenKeys(keys)}
          items={menuItems}
          onClick={({ key }) => { if (key.startsWith('/')) navigate(key) }}
          style={{ borderRight: 0, paddingTop: 8 }}
        />
      </Sider>
      <Layout style={{ marginLeft: collapsed ? 80 : 220, transition: 'margin-left 0.2s' }}>
        <Header
          style={{
            padding: '0 24px',
            background: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            boxShadow: '0 1px 4px rgba(0,21,41,.08)',
            position: 'sticky',
            top: 0,
            zIndex: 10,
            height: 56,
          }}
        >
          <Breadcrumb items={breadcrumbItems} style={{ fontSize: 13 }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {/* 视角切换按钮组（绩效考核页面不显示） */}
            {!realPath.startsWith('/performance') && (
              <Segmented
                value={role.isSponsor ? 'sponsor' : 'receiver'}
                size="small"
                options={[
                  { label: '发起人视角', value: 'sponsor' },
                  { label: '接收方视角', value: 'receiver' },
                ]}
                onChange={(val) => {
                  if (val === 'sponsor') {
                    onViewRoleChange('sponsor')
                  } else {
                    onViewRoleChange(receiverRoles[0].key)
                  }
                }}
                style={{ fontSize: 12 }}
              />
            )}
            {!role.isSponsor && receiverRoles.length > 1 && !realPath.startsWith('/performance') && (
              <Select
                size="small"
                value={role.key}
                onChange={onViewRoleChange}
                options={receiverRoles.map(r => ({ label: r.deptName, value: r.key }))}
                style={{ width: 110, fontSize: 12 }}
                popupMatchSelectWidth={false}
              />
            )}

            <SearchOutlined
              style={{ fontSize: 16, color: '#8c8c8c', cursor: 'pointer' }}
              onClick={() => message.info('搜索功能开发中')}
            />
            <span style={{ display: 'inline-flex', marginRight: 12 }}>
              <Badge count={unread} size="small">
                <BellOutlined
                  style={{ fontSize: 16, color: '#8c8c8c', cursor: 'pointer' }}
                  onClick={() => navigate('/system/notice')}
                />
              </Badge>
            </span>
            <Dropdown menu={{ items: userMenuItems, onClick: handleUserMenuClick }} placement="bottomRight">
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                <Avatar size="small" icon={<UserOutlined />} style={{ background: role.isSponsor ? '#1677ff' : '#fa8c16' }} />
                <span style={{ fontSize: 13, color: '#333' }}>{role.userName}</span>
              </div>
            </Dropdown>
          </div>
        </Header>
        <Content
          style={{
            margin: 0,
            background: '#f0f2f5',
            overflow: 'auto',
            height: 'calc(100vh - 56px)',
          }}
        >
          <Outlet context={{ role }} />
        </Content>
      </Layout>
    </Layout>
  )
}
