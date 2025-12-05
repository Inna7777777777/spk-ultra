
import React, { useEffect, useState } from 'react'
import { Card, Typography, List, Button, Modal, Form, Input, Space, message, Switch } from 'antd'
import { fetchPolls, createPoll, fetchPollResults } from '../api'

const { Title, Text } = Typography

export default function ChairPolls({ siteKey }) {
  const [polls, setPolls] = useState([])
  const [openModal, setOpenModal] = useState(false)
  const [form] = Form.useForm()
  const [results, setResults] = useState(null)

  const load = async () => {
    try {
      const data = await fetchPolls(siteKey, false)
      setPolls(data)
    } catch (e) {
      console.error(e)
      message.error('Не удалось загрузить голосования')
    }
  }

  useEffect(() => {
    load()
  }, [siteKey])

  const openCreate = () => {
    form.setFieldsValue({
      title: '',
      description: '',
      is_anonymous: false,
      is_active: true,
      options: [{ text: 'Да' }, { text: 'Нет' }]
    })
    setOpenModal(true)
  }

  const handleCreate = async () => {
    try {
      const values = await form.validateFields()
      const payload = {
        site_id: values.site_id,
        title: values.title,
        description: values.description || '',
        is_anonymous: values.is_anonymous || false,
        is_active: values.is_active !== false,
        options: (values.options || []).map((o, idx) => ({
          text: o.text,
          sort_order: idx
        }))
      }
      await createPoll(payload)
      message.success('Голосование создано')
      setOpenModal(false)
      await load()
    } catch (e) {
      if (e?.errorFields) return
      console.error(e)
      message.error('Ошибка при создании голосования')
    }
  }

  const showResults = async (pollId) => {
    try {
      const res = await fetchPollResults(pollId)
      setResults(res)
    } catch (e) {
      console.error(e)
      message.error('Не удалось получить результаты')
    }
  }

  return (
    <Card style={{ marginTop: 16 }}>
      <Title level={5}>Управление онлайн-голосованиями</Title>
      <Button type="primary" onClick={openCreate} style={{ marginBottom: 12 }}>
        Создать голосование
      </Button>
      <List
        size="small"
        bordered
        dataSource={polls}
        renderItem={(item) => (
          <List.Item>
            <div style={{ flex: 1 }}>
              <Text strong>{item.title}</Text>
              <br />
              <Text type="secondary">{item.description}</Text>
            </div>
            <Button size="small" onClick={() => showResults(item.id)}>
              Результаты
            </Button>
          </List.Item>
        )}
      />

      <Modal
        open={openModal}
        title="Новое голосование"
        onCancel={() => setOpenModal(false)}
        onOk={handleCreate}
        width={720}
      >
        <Form layout="vertical" form={form}>
          <Form.Item
            label="ID сайта"
            name="site_id"
            rules={[{ required: true, message: 'Укажите site_id (например, ID spk1)' }]}
          >
            <Input placeholder="Например, 1" />
          </Form.Item>
          <Form.Item label="Название" name="title" rules={[{ required: true, message: 'Введите название' }]}>
            <Input />
          </Form.Item>
          <Form.Item label="Описание" name="description">
            <Input.TextArea rows={3} />
          </Form.Item>
          <Form.Item label="Опции" shouldUpdate>
            {() => (
              <Form.List name="options">
                {(fields, { add, remove }) => (
                  <>
                    {fields.map((field) => (
                      <Space key={field.key} align="baseline">
                        <Form.Item
                          {...field}
                          name={[field.name, 'text']}
                          rules={[{ required: true, message: 'Введите текст варианта' }]}
                        >
                          <Input placeholder="Текст варианта" />
                        </Form.Item>
                        <Button type="link" onClick={() => remove(field.name)}>
                          Удалить
                        </Button>
                      </Space>
                    ))}
                    <Button type="dashed" onClick={() => add()} style={{ marginTop: 8 }}>
                      Добавить вариант
                    </Button>
                  </>
                )}
              </Form.List>
            )}
          </Form.Item>
          <Form.Item label="Анонимное голосование" name="is_anonymous" valuePropName="checked">
            <Switch />
          </Form.Item>
          <Form.Item label="Активно" name="is_active" valuePropName="checked" initialValue={true}>
            <Switch defaultChecked />
          </Form.Item>
        </Form>
      </Modal>

      {results && (
        <Card size="small" style={{ marginTop: 16 }}>
          <Title level={5}>Результаты: {results.poll.title}</Title>
          <Text>
            Всего голосов: <b>{results.total_votes}</b>
          </Text>
          <div style={{ marginTop: 8 }}>
            {results.options.map((r) => (
              <div key={r.option.id}>
                <Text>
                  {r.option.text}: {r.count} голос(ов) ({r.percent}%)
                </Text>
              </div>
            ))}
          </div>
        </Card>
      )}
    </Card>
  )
}
