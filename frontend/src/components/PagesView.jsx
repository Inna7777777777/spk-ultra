import React, { useEffect, useState } from 'react'
import { Card, Tabs, Typography, Spin, Alert } from 'antd'
import { fetchPages, fetchPublicPage } from '../api'

const { Title, Paragraph } = Typography

export default function PagesView({ siteKey }) {
  const [pages, setPages] = useState([])
  const [home, setHome] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      setError(null)
      try {
        const p = await fetchPages(siteKey)
        setPages(p)
        try {
          const h = await fetchPublicPage(siteKey, 'index')
          setHome(h)
        } catch (e) {}
      } catch (e) {
        console.error(e)
        setError('Не удалось загрузить страницы')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [siteKey])

  if (loading) return <Spin />
  if (error) return <Alert type="error" message={error} />

  return (
    <Card>
      <Title level={4}>Страницы сайта</Title>
      {home && (
        <>
          <Title level={5}>Главная</Title>
          <Paragraph>{home.content}</Paragraph>
        </>
      )}
      <Tabs>
        {pages.map((p) => (
          <Tabs.TabPane tab={p.title} key={p.id}>
            <Paragraph>{p.content}</Paragraph>
          </Tabs.TabPane>
        ))}
      </Tabs>
    </Card>
  )
}
