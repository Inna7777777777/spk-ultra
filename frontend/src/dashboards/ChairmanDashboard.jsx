import React, { useEffect, useState } from 'react'

export default function ChairmanDashboard({ token }) {
  const [users, setUsers] = useState([])
  const [plots, setPlots] = useState([])
  const [debts, setDebts] = useState([])
  const [news, setNews] = useState([])
  const [docs, setDocs] = useState([])

  useEffect(() => {
    const h = { Authorization: `Bearer ${token}` }
    fetch('/users', { headers: h }).then(r => r.json()).then(setUsers).catch(() => {})
    fetch('/plots', { headers: h }).then(r => r.json()).then(setPlots).catch(() => {})
    fetch('/finance/all/debts', { headers: h }).then(r => r.json()).then(setDebts).catch(() => {})
    fetch('/content/news', { headers: h }).then(r => r.json()).then(setNews).catch(() => {})
    fetch('/content/docs', { headers: h }).then(r => r.json()).then(setDocs).catch(() => {})
  }, [token])

  return (
    <div>
      <h2>Кабинет председателя</h2>

      <section>
        <h3>Садоводы</h3>
        <ul>
          {users.map(u => (
            <li key={u.id}>
              {u.fio} (участок {u.plot_number || '-'}, роль: {u.role})
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h3>Участки</h3>
        <ul>
          {plots.map(p => (
            <li key={p.id}>
              #{p.number}, {p.area} соток, владелец ID {p.owner_id}
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h3>Задолженности</h3>
        <ul>
          {debts.map(d => (
            <li key={d.id}>
              user {d.user_id}: {d.reason} — {d.amount} ₽
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h3>Нормативные документы</h3>
        <ul>
          {docs.map(d => (
            <li key={d.id}>
              {d.title} ({d.doc_type}) — {d.url}
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h3>Новости</h3>
        <ul>
          {news.map(n => (
            <li key={n.id}>
              <strong>{n.title}</strong>: {n.text}
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}