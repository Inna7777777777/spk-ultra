import React, { useEffect, useState } from 'react'
import { Card, Table, Typography, Spin, Alert } from 'antd'
import api from '../api'

const { Title } = Typography

export default function PlotsView({ siteKey }) {
  const [plots, setPlots] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      setError(null)
      try {
        const { data } = await api.get('/plots/', { params: { site_key: siteKey } })
        setPlots(data)
      } catch (e) {
        console.error(e)
        setError('Не удалось загрузить участки')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [siteKey])

  const columns = [
    { title: 'ID', dataIndex: 'id', key: 'id' },
    { title: '№ участка', dataIndex: 'number', key: 'number' },
    { title: 'Площадь, м²', dataIndex: 'area', key: 'area' },
    { title: 'Кадастровый номер', dataIndex: 'cadastral_number', key: 'cadastral_number' },
    { title: 'ID владельца (user)', dataIndex: 'owner_user_id', key: 'owner_user_id' }
  ]

  if (loading) return <Spin />
  if (error) return <Alert type="error" message={error} />

  return (
    <Card>
      <Title level={4}>Реестр участков</Title>
      <Table
        dataSource={plots}
        columns={columns}
        rowKey="id"
        size="small"
        style={{ background: 'white' }}
      />
    </Card>
  )
}
