
import React, { useEffect, useState } from 'react'
import { Card, Typography, List, Radio, Button, message, Spin } from 'antd'
import { fetchPolls, fetchPoll, castVote, fetchPollResults } from '../api'

const { Title, Text } = Typography

export default function MemberPolls({ siteKey }) {
  const [polls, setPolls] = useState([])
  const [loading, setLoading] = useState(false)
  const [activePoll, setActivePoll] = useState(null)
  const [options, setOptions] = useState([])
  const [selectedOption, setSelectedOption] = useState(null)
  const [results, setResults] = useState(null)

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      try {
        const data = await fetchPolls(siteKey, true)
        setPolls(data)
      } catch (e) {
        console.error(e)
        message.error('Не удалось загрузить голосования')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [siteKey])

  const openPoll = async (pollId) => {
    setLoading(true)
    try {
      const data = await fetchPoll(pollId)
      setActivePoll(data.poll)
      setOptions(data.options)
      setSelectedOption(null)
      setResults(null)
    } catch (e) {
      console.error(e)
      message.error('Не удалось загрузить голосование')
    } finally {
      setLoading(false)
    }
  }

  const submitVote = async () => {
    if (!activePoll || !selectedOption) {
      message.warning('Выберите вариант ответа')
      return
    }
    try {
      await castVote({ poll_id: activePoll.id, option_id: selectedOption })
      message.success('Голос принят')
      const res = await fetchPollResults(activePoll.id)
      setResults(res)
    } catch (e) {
      console.error(e)
      message.error(e?.response?.data?.detail || 'Ошибка при голосовании')
    }
  }

  if (loading && !activePoll) {
    return <Spin />
  }

  return (
    <Card style={{ marginTop: 16 }}>
      <Title level={5}>Онлайн-голосования</Title>
      <List
        size="small"
        bordered
        dataSource={polls}
        style={{ marginBottom: 16 }}
        renderItem={(item) => (
          <List.Item>
            <div style={{ flex: 1 }}>
              <Text strong>{item.title}</Text>
              <br />
              <Text type="secondary">{item.description}</Text>
            </div>
            <Button size="small" onClick={() => openPoll(item.id)}>
              Открыть
            </Button>
          </List.Item>
        )}
      />

      {activePoll && (
        <Card size="small" style={{ marginTop: 16 }}>
          <Title level={5}>{activePoll.title}</Title>
          <Text type="secondary">{activePoll.description}</Text>
          <Radio.Group
            onChange={(e) => setSelectedOption(e.target.value)}
            value={selectedOption}
            style={{ marginTop: 12, display: 'block' }}
          >
            {options.map((o) => (
              <Radio key={o.id} value={o.id} style={{ display: 'block', margin: '4px 0' }}>
                {o.text}
              </Radio>
            ))}
          </Radio.Group>
          <Button type="primary" style={{ marginTop: 12 }} onClick={submitVote}>
            Проголосовать
          </Button>

          {results && (
            <div style={{ marginTop: 16 }}>
              <Title level={5}>Результаты</Title>
              {results.options.map((r) => (
                <div key={r.option.id}>
                  <Text>
                    {r.option.text}: {r.count} голос(ов) ({r.percent}%)
                  </Text>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}
    </Card>
  )
}
