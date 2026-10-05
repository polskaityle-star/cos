import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'

type DriverSession = {
  name: string
  email: string
  role?: 'site' | 'driver' | 'admin'
  carriers?: string[]
  recruitmentStatus?: string
}

type PublicMessage = {
  id: string
  title: string
  content: string
  carrier: string
  author: string
  createdAt: string
}

const registrationCarrierOptions = ['VMPK Kielce', 'VBP Tour Regio Kielce'] as const

function App() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [authOpen, setAuthOpen] = useState(false)
  const [registerMode, setRegisterMode] = useState(false)
  const [registrationType, setRegistrationType] = useState<'site' | 'recruitment'>('site')
  const [driver, setDriver] = useState<DriverSession | null>(null)
  const [authError, setAuthError] = useState('')
  const [recruitmentNotice, setRecruitmentNotice] = useState('')
  const [publicMessages, setPublicMessages] = useState<PublicMessage[]>([])
  const [contactStatus, setContactStatus] = useState('')
  const [contactOpen, setContactOpen] = useState(false)
  const [theme, setTheme] = useState<'light' | 'dark'>(() => localStorage.getItem('vztm_theme') === 'dark' ? 'dark' : 'light')
  const [formName, setFormName] = useState('')
  const [formEmail, setFormEmail] = useState('')
  const [formPassword, setFormPassword] = useState('')
  const [formAge, setFormAge] = useState('')
  const [formMotivation, setFormMotivation] = useState('')
  const [formExperience, setFormExperience] = useState('')
  const [selectedCarriers, setSelectedCarriers] = useState<string[]>(['VMPK Kielce'])
  const [contactEmail, setContactEmail] = useState('')
  const [contactMessage, setContactMessage] = useState('')

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    localStorage.setItem('vztm_theme', theme)
  }, [theme])

  useEffect(() => {
    const token = localStorage.getItem('vztm_token')
    if (!token) return

    fetch('/api/me', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(async (response) => {
        if (!response.ok) throw new Error('Unauthorized')
        return response.json()
      })
      .then((data) => setDriver(data.user))
      .catch(() => {
        localStorage.removeItem('vztm_token')
        setDriver(null)
      })
  }, [])

  useEffect(() => {
    fetch('/api/public/messages')
      .then((response) => response.json())
      .then((data) => setPublicMessages(Array.isArray(data.messages) ? data.messages : []))
      .catch(() => undefined)
  }, [])

  const toggleCarrier = (carrier: string) => {
    setSelectedCarriers((current) =>
      current.includes(carrier) ? current.filter((item) => item !== carrier) : [...current, carrier],
    )
  }

  const submitAuth = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setAuthError('')
    setRecruitmentNotice('')

    const payload: Record<string, string | string[] | number> = {
      name: formName,
      email: formEmail,
      password: formPassword,
      carriers: selectedCarriers,
      registerType: registrationType,
    }

    if (registrationType === 'recruitment') {
      payload.age = Number(formAge) || 0
      payload.motivation = formMotivation
      payload.experience = formExperience
    }

    const response = await fetch(registerMode ? '/api/auth/register' : '/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })

    const data = await response.json().catch(() => ({} as Record<string, unknown>))
    if (!response.ok) {
      setAuthError(String((data as { message?: string }).message || 'Błąd logowania.'))
      return
    }

    const token = typeof data.token === 'string' ? data.token : ''
    const nextUser = (data.user as DriverSession | undefined) ?? null
    if (token) {
      localStorage.setItem('vztm_token', token)
      setDriver(nextUser)
    }

    if (data.siteAccount) {
      setRecruitmentNotice('Konto strony zostało utworzone. Brak dostępu do panelu — możesz korzystać z głównej strony.')
    } else if (registerMode && registrationType === 'recruitment' && nextUser) {
      setRecruitmentNotice('Rejestracja jako rekrutant została wysłana. Konto czeka na akceptację.')
    }

    setAuthOpen(false)
    setRegisterMode(false)
    setFormName('')
    setFormEmail('')
    setFormPassword('')
    setFormAge('')
    setFormMotivation('')
    setFormExperience('')
    setSelectedCarriers(['VMPK Kielce'])

    if (token && nextUser && nextUser.role !== 'site') {
      window.location.assign('/panel')
    }
  }

  const submitContact = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setContactStatus('')

    const response = await fetch('/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: contactEmail, message: contactMessage }),
    })

    const data = await response.json().catch(() => ({} as Record<string, string>))
    setContactStatus(response.ok ? 'Wiadomość została wysłana.' : String(data.message || 'Nie udało się wysłać wiadomości.'))

    if (response.ok) {
      setContactEmail('')
      setContactMessage('')
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('vztm_token')
    setDriver(null)
  }

  return (
    <div className="site-shell">
      <header className="topbar">
        <div className="brand" aria-label="VZTM Kielce">
          <div className="brand-mark">V</div>
          <div>
            <strong>VZTM Kielce</strong>
            <small>OMSI</small>
          </div>
        </div>

        <nav className={`nav-links ${menuOpen ? 'is-open' : ''}`}>
          <a href="#oddzialy">Oddziały</a>
          <a href="#o-nas">O nas</a>
          <a href="#aktualnosci">Aktualności</a>
          <button className="nav-login nav-cta" type="button" onClick={() => setAuthOpen(true)}>
            {driver ? driver.name : 'Logowanie'}
          </button>
        </nav>

        <button className="menu-toggle" type="button" aria-label="Menu" onClick={() => setMenuOpen((value) => !value)}>
          ☰
        </button>
      </header>

      <main>
        <section className="hero">
          <div className="hero-copy">
            <p className="eyebrow"><span className="status-dot" /> Wirtualny przewoźnik</p>
            <h1>
              Komunikacja <em>na czasie</em>
            </h1>
            <p className="hero-lead">
              VZTM Kielce to zintegrowany ekosystem kierowców, dyspozytorów i pracowników, który wspiera codzienną obsługę przewozów i działania operacyjne.
            </p>
            <div className="hero-actions">
              <button className="button button-primary" type="button" onClick={() => setAuthOpen(true)}>
                {driver ? 'Panel użytkownika' : 'Zaloguj się'}
              </button>
              <a href="#oddzialy" className="text-link">Zobacz oddziały <span>→</span></a>
            </div>
          </div>

          <div className="hero-visual" aria-label="Bus scene">
            <div className="route-line"><i /> Linie i rozkłady</div>
            <div className="bus-scene">
              <div className="sun" />
              <div className="hill hill-back" />
              <div className="hill hill-front" />
              <div className="bus">
                <div className="bus-destination"><span>VZTM</span><b>Kielce</b></div>
                <div className="bus-windows">
                  <i />
                  <i />
                  <i />
                  <i />
                  <i />
                </div>
                <div className="bus-body">OMSI <small>Nowa jakość transportu</small></div>
                <span className="wheel wheel-one" />
                <span className="wheel wheel-two" />
              </div>
            </div>
            <div className="scene-caption">Kielce · bus operator</div>
          </div>
        </section>

        <section className="branch-section" id="oddzialy">
          <div className="section-heading">
            <h2>Oddziały operacyjne</h2>
          </div>
          <div className="branch-grid">
            <article className="branch-card blue">
              <div className="branch-number">01</div>
              <p className="card-label">Oddział miejski</p>
              <h3>VMPK Kielce</h3>
              <p>Codzienna komunikacja miejska, rozkłady i trasy inspirowane sercem województwa świętokrzyskiego.</p>
              <a href="#o-nas" className="card-link">Poznaj więcej <span>→</span></a>
            </article>
            <article className="branch-card orange">
              <div className="branch-number">02</div>
              <p className="card-label">Oddział regionalny</p>
              <h3>VBP Tour Regio Kielce</h3>
              <p>Połączenia regionalne, dłuższe trasy i podróże poza granice miasta w świecie OMSI.</p>
              <a href="#o-nas" className="card-link">Poznaj więcej <span>→</span></a>
            </article>
          </div>
        </section>

        <section className="about-section" id="o-nas">
          <div>
            <p className="eyebrow">Nasza praca</p>
            <h2>Trasy, tabor i bezpieczeństwo w jednym miejscu.</h2>
          </div>
          <div className="about-copy">
            <p>
              Infrastruktura VZTM Kielce obejmuje zarządzanie rozkładami, działami obsługi i monitorowanie stanu pojazdów w obu oddziałach.
            </p>
            <div className="stats">
              <div>
                <strong>2</strong>
                <span>oddziały</span>
              </div>
              <div>
                <strong>24/7</strong>
                <span>obsługa</span>
              </div>
              <div>
                <strong>100%</strong>
                <span>perspektywa</span>
              </div>
            </div>
          </div>
        </section>

        <section className="news-section" id="aktualnosci">
          <div className="news-heading">
            <h2>Aktualności</h2>
            <a href="#" className="text-link">Czytaj więcej <span>→</span></a>
          </div>
          <div className="news-list">
            {publicMessages.length ? (
              publicMessages.slice(0, 3).map((message) => (
                <article key={message.id}>
                  <span>{new Date(message.createdAt).toLocaleDateString('pl-PL')}</span>
                  <h3>{message.title}</h3>
                  <a href="#">{message.carrier}</a>
                </article>
              ))
            ) : (
              <article>
                <span>Nowości</span>
                <h3>Brak publikowanych komunikatów.</h3>
                <a href="#">VZTM</a>
              </article>
            )}
          </div>
        </section>
      </main>

      <footer className="footer-main">
        <div>
          <div className="brand">
            <div className="brand-mark">V</div>
            <div>
              <strong>VZTM Kielce</strong>
              <small>OMSI</small>
            </div>
          </div>
          <p>Platforma wspierająca codzienną pracę przewoźnika, dyspozytora i kierowcy.</p>
        </div>

        <div className="footer-contact">
          <p className="eyebrow">Kontakt</p>
          <a href="mailto:kontakt@vztm-kielce.pl">kontakt@vztm-kielce.pl</a>
          <a href="tel:+48123456789">+48 123 456 789</a>
        </div>

        <div className="footer-note">
          <p>Komunikacja i organizacja w jednym miejscu.</p>
          <span>VMPK Kielce · VBP Regio Kielce</span>
        </div>
      </footer>

      <div className="footer-bottom">
        <span>© VZTM Kielce</span>
        <span>Wirtualny przewoźnik OMSI</span>
      </div>

      {authOpen && (
        <div className="modal-backdrop" onClick={() => setAuthOpen(false)}>
          <div className="auth-modal" onClick={(event) => event.stopPropagation()}>
            <button type="button" className="modal-close" aria-label="Zamknij" onClick={() => setAuthOpen(false)}>
              ×
            </button>
            <h2>{registerMode ? 'Rejestracja' : 'Logowanie'}</h2>
            <p className="modal-intro">
              {registerMode ? 'Utwórz konto do strony lub jako rekrutant.' : 'Zaloguj się do systemu VZTM Kielce.'}
            </p>

            <form onSubmit={submitAuth} className="auth-form">
              {registerMode && (
                <input value={formName} onChange={(event) => setFormName(event.target.value)} placeholder="Imię i nazwisko" required />
              )}
              <input value={formEmail} onChange={(event) => setFormEmail(event.target.value)} type="email" placeholder="E-mail" required />
              <input value={formPassword} onChange={(event) => setFormPassword(event.target.value)} type="password" placeholder="Hasło" required minLength={6} />

              {registerMode && (
                <>
                  <div style={{ display: 'flex', gap: '12px', marginTop: '4px' }}>
                    <button type="button" className={`button ${registrationType === 'site' ? 'button-primary' : ''}`} onClick={() => setRegistrationType('site')}>
                      Konto strony
                    </button>
                    <button type="button" className={`button ${registrationType === 'recruitment' ? 'button-primary' : ''}`} onClick={() => setRegistrationType('recruitment')}>
                      Rekrutacja
                    </button>
                  </div>

                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {registrationCarrierOptions.map((carrier) => (
                      <label key={carrier} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px' }}>
                        <input type="checkbox" checked={selectedCarriers.includes(carrier)} onChange={() => toggleCarrier(carrier)} />
                        {carrier}
                      </label>
                    ))}
                  </div>

                  {registrationType === 'recruitment' && (
                    <>
                      <input value={formAge} onChange={(event) => setFormAge(event.target.value)} type="number" min={14} max={100} placeholder="Wiek" />
                      <input value={formMotivation} onChange={(event) => setFormMotivation(event.target.value)} placeholder="Dlaczego chcesz dołączyć?" />
                      <textarea value={formExperience} onChange={(event) => setFormExperience(event.target.value)} placeholder="Twoje doświadczenie" rows={4} />
                    </>
                  )}
                </>
              )}

              {authError && <p className="form-error">{authError}</p>}
              {recruitmentNotice && <p className="form-error" style={{ color: '#385267' }}>{recruitmentNotice}</p>}

              <button type="submit" className="button button-primary" style={{ width: '100%' }}>
                {registerMode ? 'Utwórz konto' : 'Zaloguj'}
              </button>
            </form>

            <button
              type="button"
              className="switch-auth"
              onClick={() => {
                setRegisterMode((value) => !value)
                setAuthError('')
                setRecruitmentNotice('')
              }}
            >
              {registerMode ? 'Masz już konto? Zaloguj się' : 'Nie masz konta? Zarejestruj się'}
            </button>
          </div>
        </div>
      )}

      {contactOpen && (
        <div className="modal-backdrop" onClick={() => setContactOpen(false)}>
          <div className="auth-modal" onClick={(event) => event.stopPropagation()}>
            <button type="button" className="modal-close" aria-label="Zamknij" onClick={() => setContactOpen(false)}>
              ×
            </button>
            <h2>Kontakt</h2>
            <p className="modal-intro">Napisz do nas i otrzymaj odpowiedź od zespołu VZTM Kielce.</p>
            <form onSubmit={submitContact} className="auth-form">
              <input value={contactEmail} onChange={(event) => setContactEmail(event.target.value)} type="email" placeholder="E-mail" required />
              <textarea value={contactMessage} onChange={(event) => setContactMessage(event.target.value)} placeholder="Treść wiadomości" rows={6} required />
              {contactStatus && <p className="form-error" style={{ color: '#385267' }}>{contactStatus}</p>}
              <button type="submit" className="button button-primary" style={{ width: '100%' }}>Wyślij</button>
            </form>
          </div>
        </div>
      )}

      <button className="nav-login" type="button" style={{ position: 'fixed', right: '2rem', bottom: '2rem', zIndex: 20 }} onClick={() => setContactOpen(true)}>
        Kontakt
      </button>

      {driver && (
        <button className="logout-button" type="button" onClick={handleLogout} style={{ position: 'fixed', right: '2rem', top: '1rem', zIndex: 20 }}>
          Wyloguj {driver.name}
        </button>
      )}
    </div>
  )
}

export default App
