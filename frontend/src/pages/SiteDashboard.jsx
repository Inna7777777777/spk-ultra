import React from 'react'
import { Tabs, Card } from 'antd'
import { useSearchParams } from 'react-router-dom'
import CalendarView from '../components/CalendarView'
import ChatPanel from '../components/ChatPanel'
import ForumView from '../components/ForumView'
import BillingView from '../components/BillingView'
import PagesView from '../components/PagesView'
import PlotsView from '../components/PlotsView'
import DocumentsView from '../components/DocumentsView'
import OverviewPanel from '../components/OverviewPanel'
import ChairPanel from '../components/ChairPanel'
import AccountantPanel from '../components/AccountantPanel'
import AuditPanel from '../components/AuditPanel'
import BoardPanel from '../components/BoardPanel'
import MemberPanel from '../components/MemberPanel'

export default function SiteDashboard({ siteKey }) {
  const [params] = useSearchParams()
  const tab = params.get('tab') || 'overview'

  return (
    <Card style={{ borderRadius: 18, boxShadow: '0 10px 26px rgba(0,0,0,0.08)' }}>
      <Tabs activeKey={tab} destroyInactiveTabPane>
        <Tabs.TabPane tab="Обзор" key="overview">
          <OverviewPanel siteKey={siteKey} />
        </Tabs.TabPane>
        <Tabs.TabPane tab="Кабинет садовода" key="member">
          <MemberPanel siteKey={siteKey} />
        </Tabs.TabPane>
        <Tabs.TabPane tab="Кабинет председателя" key="chair">
          <ChairPanel siteKey={siteKey} />
        </Tabs.TabPane>
        <Tabs.TabPane tab="Кабинет правления" key="board">
          <BoardPanel siteKey={siteKey} />
        </Tabs.TabPane>
        <Tabs.TabPane tab="Кабинет бухгалтера" key="accountant">
          <AccountantPanel siteKey={siteKey} />
        </Tabs.TabPane>
        <Tabs.TabPane tab="Кабинет ревкома" key="audit">
          <AuditPanel siteKey={siteKey} />
        </Tabs.TabPane>
        <Tabs.TabPane tab="Календарь" key="calendar">
          <CalendarView siteKey={siteKey} />
        </Tabs.TabPane>
        <Tabs.TabPane tab="Взносы и оплата" key="billing">
          <BillingView siteKey={siteKey} />
        </Tabs.TabPane>
        <Tabs.TabPane tab="Участки" key="plots">
          <PlotsView siteKey={siteKey} />
        </Tabs.TabPane>
        <Tabs.TabPane tab="Форум" key="forum">
          <ForumView siteKey={siteKey} />
        </Tabs.TabPane>
        <Tabs.TabPane tab="Чат" key="chat">
          <ChatPanel siteKey={siteKey} />
        </Tabs.TabPane>
        <Tabs.TabPane tab="Страницы" key="pages">
          <PagesView siteKey={siteKey} />
        </Tabs.TabPane>
        <Tabs.TabPane tab="Документы" key="documents">
          <DocumentsView siteKey={siteKey} />
        </Tabs.TabPane>
      </Tabs>
    </Card>
  )
}
