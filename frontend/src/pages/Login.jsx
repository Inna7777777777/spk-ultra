import React, { useState } from 'react'
import { Card, Form, Input, Button, Typography, message } from 'antd'
import { useNavigate } from 'react-router-dom'
import { login } from '../api'
import { detectSiteFromLocation, SITE_CONFIG } from '../siteConfig'

const { Title, Text } = Typography

export default function Login() {
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const siteKey = detectSiteFromLocation()
  const config = SITE_CONFIG[siteKey]

  const onFinish = async (values) => {
    setLoading(true)
    try {
      await login(values.email, values.password)
      message.success('Успешный вход')
      navigate(`/?site=${siteKey}`)
    } catch (e) {
      console.error(e)
      message.error('Ошибка входа. Проверьте email и пароль')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      background: 'linear-gradient(135deg,#e6fffb,#fff7e6,#f9f0ff)'
    }}>
      <Card style={{ width: 420, boxShadow: '0 12px 30px rgba(0,0,0,0.12)', borderRadius: 16 }}>
        <Title level={3} style={{ textAlign: 'center', marginBottom: 8 }}>Вход в портал</Title>
        <Text type="secondary" style={{ display: 'block', textAlign: 'center', marginBottom: 16 }}>
          Вы входите на сайт: <b>{config.title}</b>
        </Text>
        <Form layout="vertical" onFinish={onFinish}>
          <Form.Item label="Email" name="email" rules={[{ required: true, message: 'Введите email' }]}>
            <Input />
          </Form.Item>
          <Form.Item label="Пароль" name="password" rules={[{ required: true, message: 'Введите пароль' }]}>
            <Input.Password />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" block loading={loading}>
              Войти
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  )
}
