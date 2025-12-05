import React, { useEffect, useState } from 'react'
import { Card, Typography, Alert } from 'antd'
import { fetchMe, fetchBillingSummary } from '../api'
import BillingView from './BillingView'

const { Title, Text } = Typography

function hasAccountantAccess(me, siteKey) {
  if (!me) return false
  if (me.user.is_global_admin) return true
  const m = me.memberships.find((m) => m.site_key === siteKey)
  if (!m) return false
  return m.roles.includes('accountant') || m.roles.includes('chair') || m.roles.includes('admin')
}

export default function AccountantPanel({ siteKey }) {
  const [me, setMe] = useState(null)
  const [summary, setSummary] = useState(null)
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
    const loadSummary = async () => {
      try {
        const s = await fetchBillingSummary(siteKey, year)
        setSummary(s)
      } catch (e) {
        console.error(e)
      }
    }
    loadSummary()
  }, [siteKey])

  if (error) return <Alert type="error" message={error} />
  if (!me) return null

  if (!hasAccountantAccess(me, siteKey)) {
    return <Alert type="warning" message="Нет прав доступа. Кабинет только для бухгалтера, председателя и админов." />
  }

  return (
    <Card>
      <Title level={4}>Кабинет бухгалтера</Title>
      {summary && (
        <div style={{ marginBottom: 16 }}>
          <Text>
            Сводка за <b>{summary.year}</b>: начислено <b>{summary.total_accrued}</b> ₽, оплачено{' '}
            <b>{summary.total_paid}</b> ₽, долг <b>{summary.total_pending}</b> ₽.
          </Text>
        </div>
      )}
      <BillingView siteKey={siteKey} />
    </Card>
  )
}
