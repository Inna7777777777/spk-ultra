import React, { useEffect, useState } from 'react'
import { Card, Typography, Alert, List, Tag } from 'antd'
import { fetchMe, fetchEvents, fetchForumCategories } from '../api'

const { Title, Text } = Typography

function hasBoardAccess(me, siteKey) {
  if (!me) return false
  if (me.user.is_global_admin) return true
  const m = me.memberships.find((m) => m.site_key === siteKey)
  if (!m) return false
  return m.roles.includes('board') || m.roles.includes('chair') || m.roles.includes('admin')
}

export default function BoardPanel({ siteKey }) {
  const [me, setMe] = useState(null)
  const [events, setEvents] = useState([])
  const [categories, setCategories] = useState([])
  const [error, setError] = useState(null)

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
        const ev = await fetchEvents(siteKey)
        setEvents(ev)
      } catch (e) {
        console.error(e)
      }
      try {
        const cats = await fetchForumCategories(siteKey)
        setCategories(cats)
      } catch (e) {
        console.error(e)
      }
    }
    loadData()
  }, [siteKey])

  if (error) return <Alert type="error" message={error} />
  if (!me) return null

  if (!hasBoardAccess(me, siteKey)) {
    return <Alert type="warning" message="Нет прав доступа. Кабинет только для членов правления, председателя и админов." />
  }

  const upcoming = events.slice().sort((a, b) => a.date.localeCompare(b.date)).slice(0, 10)

  return (
    <Card>
      <Title level={4}>Кабинет правления</Title>
      <Title level={5} style={{ marginTop: 8 }}>Ближайшие события</Title>
      <List
        size="small"
        dataSource={upcoming}
        style={{ background: 'white', marginBottom: 16 }}
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
      <Title level={5}>Разделы форума</Title>
      <List
        size="small"
        dataSource={categories}
        style={{ background: 'white' }}
        renderItem={(item) => (
          <List.Item>
            <div>
              <Text strong>{item.title}</Text>
              <br />
              <Text type="secondary">{item.description}</Text>
            </div>
          </List.Item>
        )}
      />
    </Card>
  )
}
