import React, { useEffect, useState } from 'react'
import { Card, Table, Typography, Select, Spin, Alert, Tag } from 'antd'
import api from '../api'

const { Title } = Typography

const CATEGORY_LABELS = {
  ustav: 'Устав',
  protocol: 'Протокол',
  smeta: 'Смета',
  dogovor: 'Договор',
  act: 'Акт',
  other: 'Иное'
}

export default function DocumentsView({ siteKey }) {
  const [docs, setDocs] = useState([])
  const [category, setCategory] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const load = async (cat) => {
    setLoading(true)
    setError(null)
    try {
      const params = { site_key: siteKey }
      if (cat) params.category = cat
      const { data } = await api.get('/documents/', { params })
      setDocs(data)
    } catch (e) {
      console.error(e)
      setError('Не удалось загрузить документы')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load(category)
  }, [siteKey, category])

  const columns = [
    { title: 'ID', dataIndex: 'id', key: 'id', width: 70 },
    {
      title: 'Категория',
      dataIndex: 'category',
      key: 'category',
      render: (value) => <Tag>{CATEGORY_LABELS[value] || value}</Tag>
    },
    { title: 'Название', dataIndex: 'title', key: 'title' },
    { title: 'Описание', dataIndex: 'description', key: 'description' },
    { title: 'Файл', dataIndex: 'file_path', key: 'file_path' },
    { title: 'ID автора', dataIndex: 'created_by_id', key: 'created_by_id' }
  ]

  if (loading) return <Spin />
  if (error) return <Alert type="error" message={error} />

  return (
    <Card>
      <Title level={4}>Документы товарищества</Title>
      <div style={{ marginBottom: 12 }}>
        Фильтр по категории:{' '}
        <Select
          allowClear
          placeholder="Все категории"
          style={{ width: 220 }}
          value={category}
          onChange={setCategory}
          options={[
            { value: 'ustav', label: 'Устав' },
            { value: 'protocol', label: 'Протоколы' },
            { value: 'smeta', label: 'Сметы' },
            { value: 'dogovor', label: 'Договоры' },
            { value: 'act', label: 'Акты' },
            { value: 'other', label: 'Прочие' }
          ]}
        />
      </div>
      <Table
        dataSource={docs}
        columns={columns}
        rowKey="id"
        size="small"
        style={{ background: 'white' }}
      />
    </Card>
  )
}
