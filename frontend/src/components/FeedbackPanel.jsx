
import React, { useEffect, useState } from 'react'
import { Card, Typography, Form, Input, Button, List, Tag, message } from 'antd'
import { sendFeedback, fetchMyFeedback } from '../api'

const { Title, Text } = Typography

export default function FeedbackPanel({ siteKey, siteId }) {
  const [form] = Form.useForm()
  const [tickets, setTickets] = useState([])

  const load = async () => {
    try {
      const data = await fetchMyFeedback(siteKey)
      setTickets(data)
    } catch (e) {
      console.error(e)
    }
  }

  useEffect(() => {
    load()
  }, [siteKey])

  const onFinish = async (values) => {
    try {
      await sendFeedback({
        site_id: siteId,
        subject: values.subject,
        message: values.message
      })
      message.success('Обращение отправлено в правление')
      form.resetFields()
      await load()
    } catch (e) {
      console.error(e)
      message.error('Не удалось отправить обращение')
    }
  }

  return (
    <Card style={{ marginTop: 16 }}>
      <Title level={5}>Обратная связь с правлением</Title>
      <Form layout="vertical" form={form} onFinish={onFinish}>
        <Form.Item
          label="Тема обращения"
          name="subject"
          rules={[{ required: true, message: 'Укажите тему' }]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          label="Сообщение"
          name="message"
          rules={[{ required: true, message: 'Введите текст обращения' }]}
        >
          <Input.TextArea rows={4} />
        </Form.Item>
        <Button type="primary" htmlType="submit">
          Отправить
        </Button>
      </Form>

      <Title level={5} style={{ marginTop: 16 }}>
        Мои обращения
      </Title>
      <List
        size="small"
        bordered
        dataSource={tickets}
        renderItem={(t) => (
          <List.Item>
            <div style={{ flex: 1 }}>
              <Text strong>{t.subject}</Text>
              <br />
              <Text type="secondary">{t.message}</Text>
            </div>
            <Tag>{t.status}</Tag>
          </List.Item>
        )}
      />
    </Card>
  )
}
