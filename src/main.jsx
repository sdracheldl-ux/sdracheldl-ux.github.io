import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { HashRouter } from 'react-router-dom'
import { ConfigProvider } from 'antd'
import zhCN from 'antd/locale/zh_CN'
import 'dayjs/locale/zh-cn'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ConfigProvider
      locale={zhCN}
      theme={{
        token: {
          colorPrimary: '#1677ff',
          borderRadius: 4,
          fontSize: 13,
        },
        components: {
          Table: {
            headerBg: '#fafafa',
            headerColor: '#333',
            headerSortHoverBg: '#f0f0f0',
            headerSortActiveBg: '#f0f0f0',
            headerBorderRadius: 0,
            cellPaddingBlock: 10,
          },
          Menu: {
            itemBg: 'transparent',
            subMenuItemBg: 'transparent',
          },
        },
      }}
    >
      <HashRouter>
        <App />
      </HashRouter>
    </ConfigProvider>
  </StrictMode>,
)
