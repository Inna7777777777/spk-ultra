import React, { useEffect, useState } from 'react'
import { Card, Typography, Alert, List, Tag } from 'antd'
import { fetchMe, fetchMyAccruals, fetchEvents } from '../api'
import MemberPolls from './MemberPolls'
import FeedbackPanel from './FeedbackPanel'

const { Title, Text } = Typography

export default function MemberPanel({ siteKey }) {
  const [me, setMe] = useState(null)
  const [accruals, setAccruals] = useState([])
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
        const a = await fetchMyAccruals(siteKey, year)
        setAccruals(a)
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

  const upcoming = events.slice().sort((a, b) => a.date.localeCompare(b.date)).slice(0, 5)

  return (
    <Card>
      <Title level={4}>Кабинет садовода</Title>
      <Text strong>{me.user.full_name}</Text>
      <br />
      <Text type="secondary">{me.user.email}</Text>

      <Title level={5} style={{ marginTop: 16 }}>Мои начисления за {year} год</Title>
      <List
        size="small"
        bordered
        dataSource={accruals}
        style={{ background: 'white', marginBottom: 16 }}
        renderItem={(item) => (
          <List.Item>
            <div>
              <Text>
                Сумма: <b>{item.amount}</b> ₽, статус: <b>{item.status}</b>, год: {item.year}
              </Text>
            </div>
          </List.Item>
        )}
      />

      <Title level={5}>Ближайшие события</Title>
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

      
      <MemberPolls siteKey={siteKey} />
      <FeedbackPanel siteKey={siteKey} siteId={me.memberships.find((m) => m.site_key === siteKey)?.site_id} />

    </Card>
  )
}
