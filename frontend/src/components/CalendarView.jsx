import React, { useEffect, useState } from 'react'
import { Calendar, Badge, Spin, Alert } from 'antd'
import { fetchEvents } from '../api'

export default function CalendarView({ siteKey }) {
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      setError(null)
      try {
        const data = await fetchEvents(siteKey)
        setEvents(data)
      } catch (e) {
        console.error(e)
        setError('Не удалось загрузить события')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [siteKey])

  const eventsByDate = events.reduce((acc, ev) => {
    acc[ev.date] = acc[ev.date] || []
    acc[ev.date].push(ev)
    return acc
  }, {})

  const dateCellRender = (value) => {
    const dateStr = value.format('YYYY-MM-DD')
    const listData = eventsByDate[dateStr] || []
    return (
      <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
        {listData.map((item) => (
          <li key={item.id}>
            <Badge
              status={
                item.type === 'meeting'
                  ? 'processing'
                  : item.type === 'payment'
                  ? 'warning'
                  : item.type === 'outage'
                  ? 'error'
                  : 'default'
              }
              text={item.title}
            />
          </li>
        ))}
      </ul>
    )
  }

  if (loading) return <Spin />
  if (error) return <Alert type="error" message={error} />

  return <Calendar cellRender={dateCellRender} />
}
