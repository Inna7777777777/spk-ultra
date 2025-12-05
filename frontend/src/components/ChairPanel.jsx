import React, { useEffect, useState } from 'react'
import { Card, Typography, Alert, List, Tag } from 'antd'
import { fetchMe, fetchBillingSummary, fetchEvents } from '../api'
import ChairPolls from './ChairPolls'

const { Title, Text } = Typography

function hasChairAccess(me, siteKey) {
  if (!me) return false
  if (me.user.is_global_admin) return true
  const m = me.memberships.find((m) => m.site_key === siteKey)
  if (!m) return false
  return m.roles.includes('chair') || m.roles.includes('admin')
}

export default function ChairPanel({ siteKey }) {
  const [me, setMe] = useState(null)
  const [summary, setSummary] = useState(null)
  const [events, setEvents] = useState([])
  const [error, setError] = useState(null)
  const year = new Date().getFullYear()

  useEffect(() => {
    const load = async () => {
      try {
        const info = await fetchMe()
        setMe(info)
      } catch (e) {
        console.error(e)
        setError('Не удалось загрузить профиль пользователя')
        return
      }
    }
    load()
  }, [])

  useEffect(() => {
    const loadData = async () => {
      try {
        const s = await fetchBillingSummary(siteKey, year)
        setSummary(s)
      } catch (e) {
        console.error(e)
      }
      try {
        const ev = await fetchEvents(siteKey)
        setEvents(ev)
      } catch (e) {
        console.error(e)
      }
    }
    loadData()
  }, [siteKey])

  if (error) return <Alert type="error" message={error} />
  if (!me) return null

  if (!hasChairAccess(me, siteKey)) {
    return <Alert type="warning" message="Нет прав доступа. Кабинет только для председателя и админов." />
  }

  const upcoming = events.slice().sort((a, b) => a.date.localeCompare(b.date)).slice(0, 10)

  return (
    <Card>
      <Title level={4}>Кабинет председателя</Title>
      {summary && (
        <div style={{ marginBottom: 16 }}>
          <Text>
            Финансовая сводка за <b>{summary.year}</b>: начислено <b>{summary.total_accrued}</b> ₽, оплачено{' '}
            <b>{summary.total_paid}</b> ₽, долг <b>{summary.total_pending}</b> ₽.
          </Text>
          <br />
          <Text type="secondary">
            Начислений: {summary.count_all}, оплачено: {summary.count_paid}, в ожидании:{' '}
            {summary.count_pending}.
          </Text>
        </div>
      )}

      <Title level={5} style={{ marginTop: 16 }}>Ближайшие события</Title>
      <List
        size="small"
        dataSource={upcoming}
        style={{ background: 'white' }}
        renderItem={(item) => (
          <List.Item>
            <div>
              <Text strong>{item.title}</Text> ({item.date})
              <br />
              <Tag>{item.type}</Tag>
              <br />
              <Text type="secondary">{item.description}</Text>
            </div>
          </List.Item>
        )}
      />

      <ChairPolls siteKey={siteKey} />
    </Card>
  )
}
