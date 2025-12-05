import React, { useState } from 'react'
import { Routes, Route, Link, Navigate } from 'react-router-dom'
import GardenerDashboard from './dashboards/GardenerDashboard'
import ChairmanDashboard from './dashboards/ChairmanDashboard'
import BoardDashboard from './dashboards/BoardDashboard'
import AuditDashboard from './dashboards/AuditDashboard'
import AccountantDashboard from './dashboards/AccountantDashboard'
import AdminDashboard from './dashboards/AdminDashboard'

const roles = [
  { id: 'gardener', label: 'Садовод' },
  { id: 'chairman', label: 'Председатель' },
  { id: 'board', label: 'Правление' },
  { id: 'audit', label: 'Ревизионная комиссия' },
  { id: 'accountant', label: 'Бухгалтер' },
  { id: 'admin', label: 'Администратор' }
]

function App() {
  const [role, setRole] = useState(null)
  const [token, setToken] = useState(null)
  const [username, setUsername] = useState('')

  const handleLogin = async (r) => {
    const name = prompt('Введите ваше имя для кабинета ' + r.label)
    if (!name) return
    const res = await fetch('/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: name, role: r.id })
    })
    const data = await res.json()
    setRole(r.id)
    setUsername(name)
    setToken(data.access_token)
  }

  const logout = () => {
    setRole(null)
    setToken(null)
    setUsername('')
  }

  const Header = () => (
    <header style={{ padding: '1rem', background: '#0f766e', color: 'white', display: 'flex', justifyContent: 'space-between' }}>
      <div>
        <strong>СПК «Хорошово-1»</strong>
        <span style={{ marginLeft: '1rem', fontSize: '0.9rem' }}>портал садоводческого кооператива</span>
      </div>
      <div>
        {role ? (
          <>
            <span style={{ marginRight: '1rem' }}>{username} ({roles.find(r => r.id === role)?.label})</span>
            <button onClick={logout}>Выйти</button>
          </>
        ) : (
          <span>Вы не авторизованы</span>
        )}
      </div>
    </header>
  )

  const RoleSelector = () => (
    <div style={{ padding: '2rem' }}>
      <h2>Выберите кабинет</h2>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', marginTop: '1rem' }}>
        {roles.map(r => (
          <button key={r.id} onClick={() => handleLogin(r)} style={{ padding: '1rem', minWidth: '160px' }}>
            {r.label}
          </button>
        ))}
      </div>
      <p style={{ marginTop: '1rem', fontSize: '0.9rem', color: '#555' }}>
        После выбора кабинета и входа вы будете перенаправлены в соответствующий раздел.
      </p>
    </div>
  )

  const ProtectedRoute = ({ children, allowed }) => {
    if (!role) return <Navigate to="/" replace />
    if (allowed && !allowed.includes(role)) return <Navigate to="/" replace />
    return React.cloneElement(children, { token })
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header />
      <nav style={{ padding: '0.5rem 1rem', background: '#ccfbf1' }}>
        <Link to="/">Главная</Link>
        {role && (
          <>
            {' | '}
            <Link to={`/cabinet/${role}`}>Мой кабинет</Link>
          </>
        )}
      </nav>
      <main style={{ flex: 1, padding: '1rem' }}>
        <Routes>
          <Route path="/" element={<RoleSelector />} />
          <Route
            path="/cabinet/gardener"
            element={
              <ProtectedRoute allowed={['gardener']}>
                <GardenerDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/cabinet/chairman"
            element={
              <ProtectedRoute allowed={['chairman']}>
                <ChairmanDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/cabinet/board"
            element={
              <ProtectedRoute allowed={['board']}>
                <BoardDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/cabinet/audit"
            element={
              <ProtectedRoute allowed={['audit']}>
                <AuditDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/cabinet/accountant"
            element={
              <ProtectedRoute allowed={['accountant']}>
                <AccountantDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/cabinet/admin"
            element={
              <ProtectedRoute allowed={['admin']}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
        </Routes>
      </main>
      <footer style={{ padding: '1rem', background: '#ecfeff', fontSize: '0.8rem', textAlign: 'center' }}>
        © СПК «Хорошово-1», {new Date().getFullYear()}
      </footer>
    </div>
  )
}

export default App