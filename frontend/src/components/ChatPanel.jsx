import React, { useEffect, useRef, useState } from 'react'
import { Input, Button, List, Typography, Space, Tag } from 'antd'

const { Text } = Typography

export default function ChatPanel({ siteKey }) {
  const [messages, setMessages] = useState([])
  const [value, setValue] = useState('')
  const wsRef = useRef(null)

  useEffect(() => {
    const wsUrl = `ws://localhost:8000/ws/chat/${siteKey}`
    const ws = new WebSocket(wsUrl)
    wsRef.current = ws

    ws.onmessage = (event) => {
      setMessages((prev) => [...prev, event.data])
    }

    return () => ws.close()
  }, [siteKey])

  const send = () => {
    if (!value) return
    const msg = value.trim()
    if (!msg) return
    if (wsRef.current) {
      wsRef.current.send(msg)
    }
    setValue('')
  }

  return (
    <Space direction="vertical" style={{ width: '100%' }}>
      <List
        bordered
        size="small"
        dataSource={messages}
        style={{ maxHeight: 320, overflowY: 'auto', background: 'white' }}
        renderItem={(item, index) => (
          <List.Item key={index}>
            <Space>
              <Tag color="green">Чат</Tag>
              <Text>{item}</Text>
            </Space>
          </List.Item>
        )}
      />
      <Space.Compact style={{ width: '100%' }}>
        <Input
          placeholder="Сообщение в чат сайта"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onPressEnter={send}
        />
        <Button type="primary" onClick={send}>
          Отправить
        </Button>
      </Space.Compact>
    </Space>
  )
}
