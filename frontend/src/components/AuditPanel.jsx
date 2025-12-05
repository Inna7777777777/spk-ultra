import React, { useEffect, useState } from 'react'
import { Card, Typography, Alert, Table, Tabs, Tag } from 'antd'
import { fetchMe, fetchBillingSummary, fetchAuditLogs, fetchAuditAccrualReport } from '../api'

const { Title, Text } = Typography

function hasAuditAccess(me, siteKey) {
  if (!me) return false
  if (me.user.is_global_admin) return true
  const m = me.memberships.find((m) => m.site_key === siteKey)
  if (!m) return false
  return m.roles.includes('audit') || m.roles.includes('chair') || m.roles.includes('admin')
}

export default function AuditPanel({ siteKey }) {
  const [me, setMe] = useState(null)
  const [summary, setSummary] = useState(null)
  const [logs, setLogs] = useState([])
  const [rows, setRows] = useState([])
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
    const loadAudit = async () => {
      try {
        const s = await fetchBillingSummary(siteKey, year)
        setSummary(s)
      } catch (e) {
        console.error(e)
      }
      try {
        const acc = await fetchAuditAccrualReport(siteKey, year)
        setRows(acc)
      } catch (e) {
        console.error(e)
      }
      try {
        const l = await fetchAuditLogs(siteKey, 100)
        setLogs(l)
      } catch (e) {
        console.error(e)
      }
    }
    loadAudit()
  }, [siteKey])

  if (error) return <Alert type="error" message={error} />
  if (!me) return null

  if (!hasAuditAccess(me, siteKey)) {
    return <Alert type="warning" message="Нет прав доступа. Доступ только у ревизионной комиссии, председателя и админов." />
  }

  const accrualColumns = [
    { title: 'ID', dataIndex: 'id', key: 'id', width: 60 },
    { title: 'Год', dataIndex: 'year', key: 'year', width: 80 },
    { title: 'Садовод', dataIndex: 'user_name', key: 'user_name' },
    { title: 'Участок', dataIndex: 'plot_number', key: 'plot_number', width: 90 },
    { title: 'Тариф', dataIndex: 'tariff_name', key: 'tariff_name' },
    { title: 'Сумма', dataIndex: 'amount', key: 'amount', width: 100 },
    {
      title: 'Статус',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (v) => (
        <Tag color={v === 'paid' ? 'green' : 'red'}>
          {v}
        </Tag>
      )
    }
  ]

  const logColumns = [
    { title: 'ID', dataIndex: 'id', key: 'id', width: 60 },
    { title: 'Действие', dataIndex: 'action', key: 'action', width: 160 },
    { title: 'Сущность', dataIndex: 'entity_type', key: 'entity_type', width: 120 },
    { title: 'ID сущности', dataIndex: 'entity_id', key: 'entity_id', width: 110 },
    { title: 'Пользователь ID', dataIndex: 'user_id', key: 'user_id', width: 110 },
    { title: 'Дата/время', dataIndex: 'created_at', key: 'created_at', width: 200 },
    { title: 'Детали (JSON)', dataIndex: 'data', key: 'data' }
  ]

  return (
    <Card>
      <Title level={4}>Кабинет ревизионной комиссии</Title>
      {summary && (
        <div style={{ marginBottom: 16 }}>
          <Text>
            Год: <b>{summary.year}</b>, начислено: <b>{summary.total_accrued}</b> ₽, оплачено:{' '}
            <b>{summary.total_paid}</b> ₽, долг: <b>{summary.total_pending}</b> ₽
          </Text>
          <br />
          <Text type="secondary">
            Всего начислений: {summary.count_all}, оплачено: {summary.count_paid}, в ожидании:{' '}
            {summary.count_pending}
          </Text>
        </div>
      )}

      <Tabs defaultActiveKey="accruals">
        <Tabs.TabPane tab="Начисления по садоводам" key="accruals">
          <Table
            dataSource={rows}
            columns={accrualColumns}
            rowKey="id"
            size="small"
            style={{ background: 'white' }}
          />
        </Tabs.TabPane>
        <Tabs.TabPane tab="Журнал действий (AuditLog)" key="logs">
          <Table
            dataSource={logs}
            columns={logColumns}
            rowKey="id"
            size="small"
            style={{ background: 'white' }}
          />
        </Tabs.TabPane>
      </Tabs>
    </Card>
  )
}
