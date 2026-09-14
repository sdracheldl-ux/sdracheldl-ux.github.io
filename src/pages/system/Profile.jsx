import {
  Card,
  Avatar,
  Tag,
  Divider,
  Descriptions,
} from 'antd'
import {
  UserOutlined,
  TeamOutlined,
  IdcardOutlined,
  PhoneOutlined,
  MailOutlined,
} from '@ant-design/icons'

const INITIAL_PROFILE = {
  username: 'zhangwei',
  name: '张伟',
  phone: '138****8888',
  email: 'zhangwei@donghu.gov.cn',
  department: '区投促局',
  role: '区投促局',
  lastLogin: '2025-08-26 08:30:15',
  createdAt: '2025-02-15 14:30:00',
}

export default function Profile() {
  const profile = INITIAL_PROFILE

  return (
    <div className="page-container">
      <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
        <div style={{ width: '33.33%', minWidth: 280 }}>
          <Card style={{ borderRadius: 4 }} bodyStyle={{ textAlign: 'center', padding: '32px 24px' }}>
            <div style={{ position: 'relative', display: 'inline-block', marginBottom: 16 }}>
              <Avatar
                size={96}
                icon={<UserOutlined />}
                style={{
                  backgroundColor: '#1677ff',
                  fontSize: 40,
                  border: '4px solid #e6f4ff',
                }}
              />
            </div>
            <h3 style={{ fontSize: 20, fontWeight: 600, color: '#262626', margin: '0 0 8px' }}>
              {profile.name}
            </h3>
            <div style={{ marginBottom: 4 }}>
              <Tag color="blue" style={{ fontSize: 13, padding: '2px 10px', marginBottom: 4 }}>
                <TeamOutlined style={{ marginRight: 4 }} />
                {profile.role}
              </Tag>
            </div>
            <div style={{ fontSize: 14, color: '#666', marginBottom: 16 }}>
              <IdcardOutlined style={{ marginRight: 6, color: '#1677ff' }} />
              {profile.department}
            </div>
            <Divider style={{ margin: '16px 0' }} />
            <Descriptions column={1} size="small" labelStyle={{ color: '#999', fontSize: 12, width: 80, justifyContent: 'flex-end' }} contentStyle={{ fontSize: 13, color: '#333' }}>
              <Descriptions.Item label="用户名">{profile.username}</Descriptions.Item>
              <Descriptions.Item label="上次登录">{profile.lastLogin}</Descriptions.Item>
              <Descriptions.Item label="创建时间">{profile.createdAt}</Descriptions.Item>
            </Descriptions>
          </Card>
        </div>

        <div style={{ flex: 1 }}>
          <Card
            title={
              <span style={{ fontSize: 16, fontWeight: 600 }}>
                <UserOutlined style={{ color: '#1677ff', marginRight: 8 }} />
                基本信息
              </span>
            }
            style={{ borderRadius: 4 }}
          >
            <Descriptions
              column={1}
              labelStyle={{ width: 100, color: '#666', fontSize: 14, padding: '16px 24px' }}
              contentStyle={{ fontSize: 14, color: '#333', padding: '16px 24px' }}
              bordered
            >
              <Descriptions.Item label="姓名">{profile.name}</Descriptions.Item>
              <Descriptions.Item label="手机">
                <PhoneOutlined style={{ color: '#1677ff', marginRight: 6 }} />
                {profile.phone}
              </Descriptions.Item>
              <Descriptions.Item label="邮箱">
                <MailOutlined style={{ color: '#1677ff', marginRight: 6 }} />
                {profile.email}
              </Descriptions.Item>
              <Descriptions.Item label="部门">
                <TeamOutlined style={{ color: '#1677ff', marginRight: 6 }} />
                {profile.department}
              </Descriptions.Item>
              <Descriptions.Item label="角色">
                <Tag color="blue" style={{ margin: 0 }}>{profile.role}</Tag>
              </Descriptions.Item>
            </Descriptions>
          </Card>
        </div>
      </div>
    </div>
  )
}
