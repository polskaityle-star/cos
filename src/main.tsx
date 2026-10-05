import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import Panel from './Panel'
import './index.css'
import './auth.css'
import './panel.css'
import './dashboard.css'
import './admin.css'
import './panel-extra.css'
import './theme.css'
import './messages.css'
import './panel-fixes.css'

const Page = window.location.pathname === '/panel' ? Panel : App

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Page />
  </StrictMode>,
)
