import React, { useEffect, useState } from 'react'
import { Card, Table, Typography, Select, Spin, Alert, Button, message, Descriptions } from 'antd'
import { fetchTariffs, fetchAccruals, fetchBillingSummary, generateAccruals, fetchReceipt } from '../api'
import ReceiptModal from './ReceiptModal'

const { Title } = Typography

export default function BillingView({ siteKey }) {
  const [tariffs, setTariffs] = useState([])
  const [accruals, setAccruals] = useState([])
  const [year, setYear] = useState(new Date().getFullYear())
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [summary, setSummary] = useState(null)
  const [selectedTariffId, setSelectedTariffId] = useState(null)
  const [genLoading, setGenLoading] = useState(false)
  const [receiptOpen, setReceiptOpen] = useState(false)
  const [currentReceipt, setCurrentReceipt] = useState(null)

  const loadData = async (currentYear) => {
    setLoading(true)
    setError(null)
    try {
      const t = await fetchTariffs(siteKey)
      setTariffs(t)
      const a = await fetchAccruals(siteKey, currentYear)
      setAccruals(a)
      const s = await fetchBillingSummary(siteKey, currentYear)
      setSummary(s)
    } catch (e) {
      console.error(e)
      setError('Не удалось загрузить данные по взносам')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData(year)
  }, [siteKey, year])

  const handleGenerate = async (byPlots) => {
    if (!selectedTariffId) {
      message.warning('Выберите тариф для автоначисления')
      return
    }
    setGenLoading(true)
    try {
      await generateAccruals(siteKey, year, selectedTariffId, byPlots)
      message.success('Начисления сформированы')
      await loadData(year)
    } catch (e) {
      console.error(e)
      message.error('Ошибка при формировании начислений')
    } finally {
      setGenLoading(false)
    }
  }

  const handleReceipt = async (accrualId) => {
    try {
      const data = await fetchReceipt(accrualId)
      setCurrentReceipt(data)
      setReceiptOpen(true)
    } catch (e) {
      console.error(e)
      message.error('Не удалось получить квитанцию')
    }
  }

  const tariffColumns = [
    { title: 'ID', dataIndex: 'id', key: 'id', width: 60 },
    { title: 'Название', dataIndex: 'name', key: 'name' },
    { title: 'Категория', dataIndex: 'category', key: 'category' },
    { title: 'Год', dataIndex: 'year', key: 'year', width: 80 },
    { title: 'Сумма', dataIndex: 'amount', key: 'amount' },
    { title: 'Ед. изм.', dataIndex: 'unit', key: 'unit' },
    { title: 'Активен', dataIndex: 'is_active', key: 'is_active', render: (v) => (v ? 'Да' : 'Нет') }
  ]

  const accrualColumns = [
    { title: 'ID', dataIndex: 'id', key: 'id', width: 60 },
    { title: 'Год', dataIndex: 'year', key: 'year', width: 80 },
    { title: 'Тариф', dataIndex: 'tariff_id', key: 'tariff_id', width: 80 },
    { title: 'Сумма', dataIndex: 'amount', key: 'amount' },
    { title: 'Статус', dataIndex: 'status', key: 'status' },
    { title: 'ID участка', dataIndex: 'plot_id', key: 'plot_id', width: 90 },
    { title: 'ID садовода (user)', dataIndex: 'user_id', key: 'user_id', width: 110 },
    {
      title: 'Оплата',
      key: 'actions',
      width: 150,
      render: (_, record) => (
        <Button size="small" onClick={() => handleReceipt(record.id)}>
          Квитанция / QR
        </Button>
      )
    }
  ]

  if (loading) return <Spin />
  if (error) return <Alert type="error" message={error} />

  return (
    <Card>
      <Title level={4}>Взносы и начисления</Title>

      <div style={{ marginBottom: 16, display: 'flex', gap: 16, flexWrap: 'wrap' }}>
        <div>
          Год:{' '}
          <Select
            value={year}
            onChange={setYear}
            style={{ width: 120 }}
            options={[
              { value: year - 1, label: String(year - 1) },
              { value: year, label: String(year) },
              { value: year + 1, label: String(year + 1) }
            ]}
          />
        </div>
        <div>
          Тариф для автоначисления:{' '}
          <Select
            style={{ minWidth: 220 }}
            value={selectedTariffId}
            onChange={setSelectedTariffId}
            placeholder="Выберите тариф"
            options={tariffs.map((t) => ({
              value: t.id,
              label: `${t.name} (${t.year} · ${t.amount} ₽)`
            }))}
          />
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <Button type="primary" loading={genLoading} onClick={() => handleGenerate(true)}>
            Начислить по участкам
          </Button>
          <Button loading={genLoading} onClick={() => handleGenerate(false)}>
            Начислить по членам
          </Button>
        </div>
      </div>

      {summary && (
        <Descriptions bordered size="small" column={3} style={{ marginBottom: 16, background: 'white' }}>
          <Descriptions.Item label="Год">{summary.year}</Descriptions.Item>
          <Descriptions.Item label="Начислено всего">{summary.total_accrued} ₽</Descriptions.Item>
          <Descriptions.Item label="Оплачено">{summary.total_paid} ₽</Descriptions.Item>
          <Descriptions.Item label="Долг">{summary.total_pending} ₽</Descriptions.Item>
          <Descriptions.Item label="Начислений всего">{summary.count_all}</Descriptions.Item>
          <Descriptions.Item label="Оплачено / Не оплачено">
            {summary.count_paid} / {summary.count_pending}
          </Descriptions.Item>
        </Descriptions>
      )}

      <Title level={5}>Тарифы</Title>
      <Table
        dataSource={tariffs}
        columns={tariffColumns}
        rowKey="id"
        size="small"
        style={{ marginBottom: 16, background: 'white' }}
      />
      <Title level={5}>Начисления</Title>
      <Table
        dataSource={accruals}
        columns={accrualColumns}
        rowKey="id"
        size="small"
        style={{ background: 'white' }}
      />

      <ReceiptModal open={receiptOpen} onClose={() => setReceiptOpen(false)} receipt={currentReceipt} />
    </Card>
  )
}
