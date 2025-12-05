import React, { useEffect, useState } from 'react'

export default function GardenerDashboard({ token }) {
  const [payments, setPayments] = useState([])
  const [debts, setDebts] = useState([])
  const [receipts, setReceipts] = useState([])
  const [plots, setPlots] = useState([])
  const [polls, setPolls] = useState([])
  const [news, setNews] = useState([])
  const [chat, setChat] = useState([])

  useEffect(() => {
    const h = { Authorization: `Bearer ${token}` }
    fetch('/finance/my/payments', { headers: h }).then(r => r.json()).then(setPayments).catch(() => {})
    fetch('/finance/my/debts', { headers: h }).then(r => r.json()).then(setDebts).catch(() => {})
    fetch('/finance/my/receipts', { headers: h }).then(r => r.json()).then(setReceipts).catch(() => {})
    fetch('/plots/my', { headers: h }).then(r => r.json()).then(setPlots).catch(() => {})
    fetch('/polls', { headers: h }).then(r => r.json()).then(setPolls).catch(() => {})
    fetch('/content/news', { headers: h }).then(r => r.json()).then(setNews).catch(() => {})
    fetch('/chat/messages', { headers: h }).then(r => r.json()).then(setChat).catch(() => {})
  }, [token])

  return (
    <div>
      <h2>Кабинет садовода</h2>

      <section>
        <h3>Мои участки</h3>
        <ul>
          {plots.map(p => (
            <li key={p.id}>Участок {p.number}, {p.area} соток</li>
          ))}
        </ul>
      </section>

      <section>
        <h3>Начисления и оплаты</h3>
        <ul>
          {payments.map(p => (
            <li key={p.id}>
              {p.purpose}: {p.amount} ₽ — {p.paid ? 'оплачено' : 'к оплате'}
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h3>Задолженности</h3>
        <ul>
          {debts.map(d => (
            <li key={d.id}>
              {d.reason}: {d.amount} ₽ (до {new Date(d.due_date).toLocaleDateString()})
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h3>Квитанции</h3>
        <ul>
          {receipts.map(r => (
            <li key={r.id}>
              {r.purpose} ({r.period}) — {r.amount} ₽<br />
              <small>QR: {r.qr_data}</small>
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h3>Голосования</h3>
        <ul>
          {polls.map(p => (
            <li key={p.id}>{p.question}</li>
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

      <section>
        <h3>Общий чат</h3>
        <ul>
          {chat.map(m => (
            <li key={m.id}>
              <strong>{m.author}:</strong> {m.text}
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}