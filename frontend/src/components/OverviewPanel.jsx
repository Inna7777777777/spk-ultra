import React, { useEffect, useState } from 'react'
import { Row, Col, Card, Typography, List, Tag, Alert } from 'antd'
import { fetchMe, fetchBillingSummary, fetchMyAccruals } from '../api'

const { Title, Text } = Typography

export default function OverviewPanel({ siteKey }) {
  const [me, setMe] = useState(null)
  const [summary, setSummary] = useState(null)
  const [myAccruals, setMyAccruals] = useState([])
  const [error, setError] = useState(null)
  const currentYear = new Date().getFullYear()

  useEffect(() => {
    const load = async () => {
      try {
        const info = await fetchMe()
        setMe(info)
      } catch (e) {
        console.error(e)
        setError('Не удалось загрузить профиль пользователя')
      }
    }
    load()
  }, [])

  useEffect(() => {
    const loadBilling = async () => {
      try {
        const s = await fetchBillingSummary(siteKey, currentYear)
        setSummary(s)
      } catch (e) {
        console.error(e)
      }
      try {
        const a = await fetchMyAccruals(siteKey, currentYear)
        setMyAccruals(a)
      } catch (e) {
        console.error(e)
      }
    }
    loadBilling()
  }, [siteKey])

  if (error) return <Alert type="error" message={error} />

  return (
    <Row gutter={16}>
      <Col xs={24} lg={10}>
        <Card>
          <Title level={4}>Мой профиль</Title>
          {me && (
            <>
              <Text strong>{me.user.full_name}</Text>
              <br />
              <Text type="secondary">{me.user.email}</Text>
              {me.user.phone && (
                <>
                  <br />
                  <Text type="secondary">Телефон: {me.user.phone}</Text>
                </>
              )}
              <br />
              {me.user.is_global_admin && (
                <Tag color="magenta" style={{ marginTop: 8 }}>
                  Global Admin
                </Tag>
              )}
              <Title level={5} style={{ marginTop: 16 }}>Роли по сайтам</Title>
              <List
                size="small"
                dataSource={me.memberships}
                renderItem={(item) => (
                  <List.Item>
                    <div>
                      <Text strong>{item.site_name}</Text>
                      <br />
                      {item.roles.map((r) => (
                        <Tag key={r}>{r}</Tag>
                      ))}
                    </div>
                  </List.Item>
                )}
              />
            </>
          )}
        </Card>
      </Col>
      <Col xs={24} lg={14}>
        <Card>
          <Title level={4}>Финансовая сводка {currentYear}</Title>
          {summary ? (
            <>
              <Text>
                Начислено всего: <b>{summary.total_accrued}</b> ₽
              </Text>
              <br />
              <Text>
                Оплачено: <b style={{ color: 'green' }}>{summary.total_paid}</b> ₽, долг:{' '}
                <b style={{ color: 'red' }}>{summary.total_pending}</b> ₽
              </Text>
              <br />
              <Text type="secondary">
                Начислений: {summary.count_all}, оплачено: {summary.count_paid}, в ожидании:{' '}
                {summary.count_pending}
              </Text>
            </>
          ) : (
            <Text type="secondary">Сводка ещё не сформирована (нет начислений).</Text>
          )}
          <Title level={5} style={{ marginTop: 16 }}>Мои начисления за год</Title>
          <List
            size="small"
            bordered
            dataSource={myAccruals}
            style={{ maxHeight: 220, overflowY: 'auto', background: 'white' }}
            renderItem={(item) => (
              <List.Item>
                <Text>
                  Год: {item.year}, сумма: <b>{item.amount}</b> ₽, статус:{' '}
                  <b>{item.status}</b>, тариф ID: {item.tariff_id || '-'}
                </Text>
              </List.Item>
            )}
          />
        </Card>
      </Col>
    </Row>
  )
}
