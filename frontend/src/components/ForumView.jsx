import React, { useEffect, useState } from 'react'
import { Card, List, Typography, Tabs, Input, Button, message } from 'antd'
import {
  fetchForumCategories,
  fetchForumTopics,
  fetchForumPosts,
  createForumTopic,
  createForumPost
} from '../api'

const { Title, Paragraph, Text } = Typography

export default function ForumView({ siteKey }) {
  const [categories, setCategories] = useState([])
  const [activeCategory, setActiveCategory] = useState(null)
  const [topics, setTopics] = useState([])
  const [activeTopic, setActiveTopic] = useState(null)
  const [posts, setPosts] = useState([])
  const [newTopicTitle, setNewTopicTitle] = useState('')
  const [newPostText, setNewPostText] = useState('')

  useEffect(() => {
    const load = async () => {
      try {
        const cats = await fetchForumCategories(siteKey)
        setCategories(cats)
        if (cats.length > 0) {
          setActiveCategory(cats[0])
        }
      } catch (e) {
        console.error(e)
      }
    }
    load()
  }, [siteKey])

  useEffect(() => {
    const loadTopics = async () => {
      if (!activeCategory) return
      try {
        const t = await fetchForumTopics(activeCategory.id)
        setTopics(t)
        setActiveTopic(t[0] || null)
      } catch (e) {
        console.error(e)
      }
    }
    loadTopics()
  }, [activeCategory])

  useEffect(() => {
    const loadPosts = async () => {
      if (!activeTopic) {
        setPosts([])
        return
      }
      try {
        const p = await fetchForumPosts(activeTopic.id)
        setPosts(p)
      } catch (e) {
        console.error(e)
      }
    }
    loadPosts()
  }, [activeTopic])

  const handleCreateTopic = async () => {
    if (!newTopicTitle || !activeCategory) return
    try {
      const topic = await createForumTopic({
        category_id: activeCategory.id,
        title: newTopicTitle,
        author_name: 'Садовод'
      })
      setTopics((prev) => [...prev, topic])
      setNewTopicTitle('')
    } catch (e) {
      console.error(e)
      message.error('Не удалось создать тему')
    }
  }

  const handleCreatePost = async () => {
    if (!newPostText || !activeTopic) return
    try {
      const post = await createForumPost({
        topic_id: activeTopic.id,
        author_name: 'Садовод',
        content: newPostText
      })
      setPosts((prev) => [...prev, post])
      setNewPostText('')
    } catch (e) {
      console.error(e)
      message.error('Не удалось отправить сообщение')
    }
  }

  return (
    <Card>
      <Title level={4}>Форум садоводов</Title>
      <Tabs
        activeKey={activeCategory ? String(activeCategory.id) : undefined}
        onChange={(key) => {
          const cat = categories.find((c) => String(c.id) === key)
          setActiveCategory(cat)
        }}
      >
        {categories.map((cat) => (
          <Tabs.TabPane tab={cat.title} key={cat.id}>
            <Paragraph type="secondary">{cat.description}</Paragraph>
            <div style={{ display: 'flex', gap: 16 }}>
              <div style={{ flex: 1 }}>
                <Title level={5}>Темы</Title>
                <List
                  bordered
                  size="small"
                  dataSource={topics}
                  style={{ maxHeight: 260, overflowY: 'auto', background: 'white' }}
                  renderItem={(item) => (
                    <List.Item
                      onClick={() => setActiveTopic(item)}
                      style={{
                        cursor: 'pointer',
                        background: activeTopic && activeTopic.id === item.id ? '#e6f7ff' : 'white'
                      }}
                    >
                      <Text strong>{item.title}</Text>
                      <br />
                      <Text type="secondary">Автор: {item.author_name}</Text>
                    </List.Item>
                  )}
                />
                <div style={{ marginTop: 8 }}>
                  <Input
                    placeholder="Новая тема"
                    value={newTopicTitle}
                    onChange={(e) => setNewTopicTitle(e.target.value)}
                    onPressEnter={handleCreateTopic}
                    style={{ marginBottom: 4 }}
                  />
                  <Button type="primary" onClick={handleCreateTopic}>
                    Создать тему
                  </Button>
                </div>
              </div>
              <div style={{ flex: 2 }}>
                <Title level={5}>Сообщения</Title>
                {activeTopic && (
                  <Paragraph type="secondary">Тема: {activeTopic.title}</Paragraph>
                )}
                <List
                  bordered
                  size="small"
                  dataSource={posts}
                  style={{ maxHeight: 260, overflowY: 'auto', background: 'white' }}
                  renderItem={(item) => (
                    <List.Item>
                      <Text strong>{item.author_name}</Text>
                      <br />
                      <Text>{item.content}</Text>
                    </List.Item>
                  )}
                />
                <div style={{ marginTop: 8 }}>
                  <Input.TextArea
                    rows={3}
                    placeholder="Ваш ответ"
                    value={newPostText}
                    onChange={(e) => setNewPostText(e.target.value)}
                  />
                  <Button type="primary" style={{ marginTop: 4 }} onClick={handleCreatePost}>
                    Отправить
                  </Button>
                </div>
              </div>
            </div>
          </Tabs.TabPane>
        ))}
      </Tabs>
    </Card>
  )
}
