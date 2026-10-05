import { useEffect, useState } from 'react'

type SessionUser = {
  name: string
  email: string
  role: string
  carriers?: string[]
  recruitmentStatus?: string
}

type Application = {
  id?: string
  type?: string
  branch?: string
  applicant?: string
  applicantName?: string
  status?: string
  createdAt?: string
}

type Report = {
  id?: string
  type?: string
  carrier?: string
  reporter?: string
  status?: string
  createdAt?: string
}

function Panel() {
  const [user, setUser] = useState<SessionUser | null>(null)
  const [applications, setApplications] = useState<Application[]>([])
  const [reports, setReports] = useState<Report[]>([])
  const [users, setUsers] = useState<SessionUser[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const token = localStorage.getItem('vztm_token')

  useEffect(() => {
    if (!token) {
      window.location.assign('/')
      return
    }

    const headers = { Authorization: `Bearer ${token}` }

    Promise.all([
      fetch('/api/me', { headers }).then((response) => (response.ok ? response.json() : Promise.reject(new Error('Unauthorized')))),
      fetch('/api/applications', { headers }).then((response) => (response.ok ? response.json() : Promise.reject(new Error('Applications error')))),
      fetch('/api/reports', { headers }).then((response) => (response.ok ? response.json() : Promise.reject(new Error('Reports error')))),
      fetch('/api/users', { headers }).then((response) => (response.ok ? response.json() : Promise.reject(new Error('Users error')))),
    ])
      .then(([me, apps, reportsResponse, allUsers]) => {
        setUser(me.user)
        setApplications(Array.isArray(apps.applications) ? apps.applications : [])
        setReports(Array.isArray(reportsResponse.reports) ? reportsResponse.reports : [])
        setUsers(Array.isArray(allUsers.users) ? allUsers.users : [])
        setLoading(false)
      })
      .catch(() => {
        localStorage.removeItem('vztm_token')
        window.location.assign('/')
      })
  }, [token])

  const clearHistory = async (kind: 'recruitment' | 'applications' | 'reports' | 'issues') => {
    if (!token) return
    const response = await fetch(`/api/history/${kind}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    })

    if (!response.ok) {
      const data = await response.json().catch(() => ({}))
      setError(data.message || 'Nie udało się wyczyścić historii.')
      return
    }

    const data = await response.json().catch(() => ({}))
    if (Array.isArray(data.applications)) setApplications(data.applications)
    if (Array.isArray(data.reports)) setReports(data.reports)
    setError('')
  }

  if (loading) {
    return <div className="panel-loading">Ładowanie panelu…</div>
  }

  if (!user) {
    return null
  }

  if (user.role === 'site') {
    return (
      <div className="panel-page" style={{ padding: '4rem 2rem' }}>
        <p className="eyebrow">Dostęp ograniczony</p>
        <h1>Konto strony nie ma dostępu do panelu.</h1>
        <button className="button button-primary" type="button" onClick={() => window.location.assign('/')}>
          Powrót do strony głównej
        </button>
      </div>
    )
  }

  return (
    <div className="panel-page">
      <header className="panel-header">
        <div className="panel-user">
          <span>Użytkownik:</span>
          <b>{user.name}</b>
          <span>{user.email}</span>
        </div>
        <button type="button" onClick={() => { localStorage.removeItem('vztm_token'); window.location.assign('/') }}>
          Wyloguj
        </button>
      </header>

      <main className="panel-content">
        <p className="eyebrow">Panel</p>
        <h1>Witaj, <em>{user.name}</em></h1>

        {error && <p className="form-error">{error}</p>}

        <div className="admin-content">
          <div className="panel-intro">
            <p>Rola: <strong>{user.role}</strong></p>
            <p>Przewoźnicy: {user.carriers && user.carriers.length ? user.carriers.join(', ') : 'brak'}</p>
            <div className="admin-stats">
              <strong>{applications.length}</strong>
              <span>wnioski</span>
            </div>
            <div className="admin-stats">
              <strong>{reports.length}</strong>
              <span>raporty</span>
            </div>
          </div>

          <div>
            <div className="applications-table">
              <div className="table-heading">
                <span>Użytkownik</span>
                <span>Typ</span>
                <span>Akcja</span>
              </div>

              {users.length ? users.map((member) => (
                <article key={`${member.email}-${member.role}`}>
                  <strong>{member.name}</strong>
                  <small>{member.role}</small>
                  <span>{member.email}</span>
                </article>
              )) : <p className="empty-state">Brak użytkowników.</p>}
            </div>
          </div>
        </div>

        <div style={{ marginTop: '2rem' }}>
          <h2>Historia</h2>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <button className="button button-primary" type="button" onClick={() => void clearHistory('recruitment')}>Wyczyść rekrutację</button>
            <button className="button button-primary" type="button" onClick={() => void clearHistory('applications')}>Wyczyść wnioski</button>
            <button className="button button-primary" type="button" onClick={() => void clearHistory('reports')}>Wyczyść raporty</button>
            <button className="button button-primary" type="button" onClick={() => void clearHistory('issues')}>Wyczyść zgłoszenia</button>
          </div>
        </div>

        <div className="applications-table" style={{ marginTop: '2rem' }}>
          <div className="table-heading">
            <span>Typ</span>
            <span>Przewoźnik</span>
            <span>Status</span>
          </div>

          {applications.length || reports.length ? (
            <>
              {applications.slice(0, 10).map((item) => (
                <article key={item.id || `${item.type}-${item.createdAt}`}>
                  <strong>{item.type || 'Wniosek'}</strong>
                  <small>{item.branch || '—'}</small>
                  <span>{item.status || 'NOWE'}</span>
                </article>
              ))}
              {reports.slice(0, 10).map((item) => (
                <article key={item.id || `${item.type}-${item.createdAt}`}>
                  <strong>{item.type || 'Raport'}</strong>
                  <small>{item.carrier || '—'}</small>
                  <span>{item.status || 'NOWE'}</span>
                </article>
              ))}
            </>
          ) : (
            <p className="empty-state">Brak aktywnych rekordów.</p>
          )}
        </div>
      </main>
    </div>
  )
}

export default Panel
