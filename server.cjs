const express = require('express')
const cors = require('cors')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const fs = require('node:fs')
const path = require('node:path')

const app = express()
const port = 4000
const secret = process.env.JWT_SECRET || 'vztm-kielce-local-secret'
const dataDirectory = path.join(__dirname, 'data')
const usersFile = path.join(dataDirectory, 'users.json')
const operationsFile = path.join(dataDirectory, 'operations.json')
const applicationsFile = path.join(dataDirectory, 'applications.json')
const assignmentsFile = path.join(dataDirectory, 'assignments.json')
const reportsFile = path.join(dataDirectory, 'reports.json')
const messagesFile = path.join(dataDirectory, 'messages.json')
const contactsFile = path.join(dataDirectory, 'contacts.json')
const downloadsFile = path.join(dataDirectory, 'downloads.json')
fs.mkdirSync(dataDirectory, { recursive: true })

function readJsonFile(filePath, fallbackValue) {
  if (!fs.existsSync(filePath)) return fallbackValue
  const rawText = fs.readFileSync(filePath, 'utf8').replace(/^\uFEFF/, '')
  if (!rawText.trim()) return fallbackValue
  return JSON.parse(rawText)
}

let users = readJsonFile(usersFile, [])
let migratedLegacyRole = false
for (const user of users) {
  if (user.role === 'dysposytor') {
    user.role = 'dyspozytor'
    migratedLegacyRole = true
  }
}

function reloadUsersFromDisk() {
  const nextUsers = readJsonFile(usersFile, [])
  for (const user of nextUsers) {
    if (user.role === 'dysposytor') {
      user.role = 'dyspozytor'
      migratedLegacyRole = true
    }
  }
  users.splice(0, users.length, ...nextUsers)
}
const applications = readJsonFile(applicationsFile, [])
const assignments = readJsonFile(assignmentsFile, [])
const reports = readJsonFile(reportsFile, [])
const messages = readJsonFile(messagesFile, [])
const contacts = readJsonFile(contactsFile, [])
const defaultDownloads = [
  { id: 'regulamin', title: 'Regulamin kierowcy', description: 'PDF · 1.2 MB', type: 'PDF', url: '' },
  { id: 'mapa', title: 'Mapa sieci', description: 'PDF · 4.8 MB', type: 'PDF', url: '' },
  { id: 'malowanie', title: 'Malowanie pojazdów', description: 'ZIP · 18 MB', type: 'ZIP', url: '' },
]
const downloads = readJsonFile(downloadsFile, defaultDownloads)
const operations = {
  'VMPK Kielce': {
    schedule: ['Linia 24 · Centrum — Bukówka · 06:15', 'Linia 12 · Ślichowice — Dąbrowa · 08:40', 'Linia 3 · Dworzec — Świętokrzyskie · 14:20'],
    fleet: [
      '007-919 · МАЗ 203069 · 2013',
      '030-032 · Temsa LF 12 · 2025',
      '046-406 · Mercedes-Benz Conecto · 2025',
      '056 · Mercedes-Benz Viano · 2011',
      '238-243 · Solaris Urbino 18 W13 · 2010',
      '244 · Solaris Urbino 15 · 2011',
      '245-268 · Solaris Urbino 18 · 2012',
      '254-256 · Solaris Urbino 18 W11 · 2013',
      '259-265 · Solaris Urbino 18 W25 · 2014',
      '266-267 · Solaris Urbino 18 W5 · 2015',
      '269-270 · Solaris Urbino 18 · 2021',
      '271-278 · MAN NG330 Lion’s City 18 · 2023',
      '279-282 · MAN NG330 Lion’s City 18 · 2025',
      '319-330 · Solaris Urbino 12 · 2001',
      '361-374 · Solaris Urbino 12 W13 · 2008',
      '375-451 · Solaris Urbino 12 · 2012',
      '400-403 · Mercedes-Benz Conecto LF · 2011',
      '404 · Mercedes-Benz O530K A26 · 2013',
      '410-414 · MAN NL280 Lion’s City 12 G · 2022',
      '415-429 · MAN NL280 Lion’s City 12 · 2022',
      '452-455 · Solaris Urbino 12 W9 · 2014',
      '5001-5015 · Solaris Urbino 12 hybrid · 2017',
      '531 · MAN RHC444 Lion’s Coach · 2014',
      '532-533 · MAN RHC444 Lion’s Coach L · 2015',
      '600-607 · Temsa LF 12 · 2018',
      '6001-6010 · Solaris Urbino 18 Hybrid · dane Phototrans',
      '610-614 · Autosan M12LF · dane Phototrans',
    ],
    workshop: [],
  },
  'VBP Tour Regio Kielce': {
    schedule: ['R1 · Kielce — Chęciny · brygada 01 · 05:40–22:10', 'R2 · Kielce — Busko-Zdrój · brygada 02 · 06:15–20:45', 'R3 · Kielce — Jędrzejów · brygada 03 · 07:00–21:30', 'R4 · Kielce — Skarżysko-Kamienna · brygada 04 · 05:55–19:50', 'R5 · Kielce — Ostrowiec Świętokrzyski · brygada 05 · 06:30–20:20', 'R6 · Kielce — Starachowice · brygada 06 · 07:10–18:40'],
    fleet: [
      'G4 6099-WSC 428AR · Solaris Urbino 18 · 2020',
      'G4 7934-WSC 424AR · Solaris Urbino 18 · 2020',
      'GDA 36544-LUB 8563H · Solaris Urbino 12 W24 · 2018',
      'GDA 37693-GDA 38441 · Mercedes-Benz Conecto · 2019',
      'LUB 2703L · Mercedes-Benz O530 II · 2020',
      'LUB 4904L · Solaris Urbino 18 W13 · 2022',
      'LUB 8608H · Volvo 7700 Hybrid · 2018',
      'RSR 40067 · MAN ÜL364 Lion’s Regio L · 2026',
      'TK 701FY-TK 724FY · Solaris Urbino 12 electric · 2026',
      'TKI 4080E · Irizar i8 14.98 · 2023',
      'WGM 0051V-WL 6101L · Mercedes-Benz Conecto G · 2017',
      'WGM 28920-WGM 28935 · Mercedes-Benz Conecto LF · 2017',
      'WGM 28931 · Mercedes-Benz O530K C2 · 2017',
      'WGM 3343U · MAN NL280 Lion’s City 12 · 2026',
      'WGM 77479 · Mercedes-Benz O530 II · 2019',
    ],
    workshop: [],
  },
}

const savedOperations = readJsonFile(operationsFile, {})
if (Object.keys(savedOperations).length) {
  for (const carrier of Object.keys(operations)) {
    if (savedOperations[carrier]?.schedule) operations[carrier].schedule = savedOperations[carrier].schedule
    if (savedOperations[carrier]?.fleet) operations[carrier].fleet = savedOperations[carrier].fleet
    if (savedOperations[carrier]?.photos) operations[carrier].photos = savedOperations[carrier].photos
    if (savedOperations[carrier]?.workshop) operations[carrier].workshop = savedOperations[carrier].workshop
  }
}

function saveUsers() {
  fs.writeFileSync(usersFile, JSON.stringify(users, null, 2))
}

if (migratedLegacyRole) saveUsers()

function userCanAccessCarrier(user, carrier) {
  if (!carrier) return true
  if (!user?.carriers?.length) return carrier === 'VMPK Kielce' || carrier === 'VBP Tour Regio Kielce'
  return user.carriers.includes(carrier)
}

function visibleRecordsForCarrier(items, user, carrierKey) {
  if (!Array.isArray(items)) return []
  if (!user || user.role === 'admin') return items
  if (user.carriers && user.carriers.length) {
    return items.filter((item) => !item.carrier || userCanAccessCarrier(user, item.carrier))
  }
  return items.filter((item) => !item.carrier || item.carrier === carrierKey || item.carrier === 'VMPK Kielce' || item.carrier === 'VBP Tour Regio Kielce')
}

function saveOperations() {
  fs.writeFileSync(operationsFile, JSON.stringify(operations, null, 2))
}

function saveApplications() {
  fs.writeFileSync(applicationsFile, JSON.stringify(applications, null, 2))
}

function saveAssignments() {
  fs.writeFileSync(assignmentsFile, JSON.stringify(assignments, null, 2))
}

function saveReports() {
  fs.writeFileSync(reportsFile, JSON.stringify(reports, null, 2))
}

function saveMessages() {
  fs.writeFileSync(messagesFile, JSON.stringify(messages, null, 2))
}

function saveContacts() {
  fs.writeFileSync(contactsFile, JSON.stringify(contacts, null, 2))
}

function saveDownloads() {
  fs.writeFileSync(downloadsFile, JSON.stringify(downloads, null, 2))
}

if (!fs.existsSync(operationsFile)) saveOperations()
if (!fs.existsSync(applicationsFile)) saveApplications()
if (!fs.existsSync(assignmentsFile)) saveAssignments()
if (!fs.existsSync(reportsFile)) saveReports()
if (!fs.existsSync(messagesFile)) saveMessages()
if (!fs.existsSync(contactsFile)) saveContacts()
if (!fs.existsSync(downloadsFile)) saveDownloads()

function vehicleInWorkshop(carrier, vehicle, date) {
  return Boolean(vehicle && operations[carrier]?.workshop?.some((item) => item.vehicle === vehicle && date >= item.startDate && date <= item.endDate))
}

function isAdminIdentity(user) {
  const email = String(user.email || '').toLowerCase()
  const username = email.split('@')[0]
  const name = String(user.name || '').trim().toLowerCase()
  return name === 'ksawery borowski' || name.includes('godksawiss') || username === 'godksawiss' || email === 'techksaw@gmail.com'
}

const rolePermissions = {
  dyspozytor: ['Grafik', 'Linie', 'Wiadomości'],
  mechanik: ['Tabor', 'Zgłoszenia', 'Wiadomości', 'Pobieralnia'],
  sprawdzajacy: ['Raporty', 'Wnioski', 'Wiadomości', 'Rekrutacja'],
  'tworca-mapy': ['Pobieralnia', 'Wiadomości'],
}

function canEdit(user, section) {
  return user.role === 'admin' || Boolean(rolePermissions[user.role]?.includes(section))
}

function isStaff(user) {
  return user.role === 'admin' || Object.hasOwn(rolePermissions, user.role)
}

function canSubmitApplication(user) {
  return user.role === 'admin' || user.role === 'driver' || user.role === 'site' || isStaff(user)
}

function visibleApplicationsFor(user) {
  if (user.role === 'site') return []
  return applications.filter((item) => {
    const matchesCarrier = !user.carriers?.length || !item.branch || userCanAccessCarrier(user, item.branch)
    if (!matchesCarrier) return false
    if (item.type === 'Rekrutacja' && !canEdit(user, 'Rekrutacja')) return false
    if (!isStaff(user) || (!canEdit(user, 'Wnioski') && !canEdit(user, 'Rekrutacja'))) return item.applicant === user.email
    return true
  })
}

function visibleAssignmentsFor(user) {
  return canEdit(user, 'Grafik') ? assignments : assignments.filter((item) => item.driverEmail === user.email)
}

app.use(cors())
app.use(express.json({ limit: '25mb' }))

function createToken(user) {
  return jwt.sign({ id: user.id, email: user.email, name: user.name, role: user.role, carriers: user.carriers || [], recruitmentStatus: user.recruitmentStatus || 'APPROVED' }, secret, { expiresIn: '7d' })
}

function auth(req, res, next) {
  const header = req.headers.authorization || ''
  const token = header.startsWith('Bearer ') ? header.slice(7) : null
  if (!token) return res.status(401).json({ message: 'Zaloguj się, aby kontynuować.' })
  try {
    req.user = jwt.verify(token, secret)
    const account = users.find((item) => item.email === req.user.email)
    const recruitment = applications.find((item) => item.type === 'Rekrutacja' && item.applicant === req.user.email)
    if (account) {
      req.user.role = isAdminIdentity(account) ? 'admin' : account.role
      req.user.carriers = account.carriers || []
      req.user.recruitmentStatus = recruitment?.status === 'NOWE' ? 'PENDING' : account.recruitmentStatus || 'APPROVED'
    }
    if (req.user.role !== 'admin' && ['PENDING', 'REJECTED'].includes(req.user.recruitmentStatus) && !(req.method === 'GET' && req.path === '/api/me')) {
      return res.status(403).json({ message: req.user.recruitmentStatus === 'PENDING' ? 'Twoje konto oczekuje na potwierdzenie rekrutacji.' : 'Zgłoszenie rekrutacyjne zostało odrzucone.' })
    }
    next()
  } catch { res.status(401).json({ message: 'Sesja wygasła. Zaloguj się ponownie.' }) }
}

app.post('/api/auth/register', async (req, res) => {
  const { name, email, password } = req.body
  const registrationType = String(req.body.registerType || req.body.accountType || 'recruitment').trim().toLowerCase()
  const isRecruitmentRegistration = registrationType === 'recruitment' || registrationType === 'rekrutant' || registrationType === 'recruiter'
  const isSiteRegistration = registrationType === 'site' || registrationType === 'strona' || registrationType === 'website'
  const age = Number(req.body.age)
  const motivation = String(req.body.motivation || '').trim()
  const experience = String(req.body.experience || '').trim()
  const rawCarriers = Array.isArray(req.body.carriers) ? req.body.carriers : typeof req.body.carriers === 'string' ? [req.body.carriers] : []
  const carriers = [...new Set(rawCarriers.filter((item) => ['VMPK Kielce', 'VBP Tour Regio Kielce'].includes(item)))].slice(0, 2)
  const validCarriers = carriers.length ? carriers : ['VMPK Kielce']
  if (!name || !email || !password || password.length < 6) return res.status(400).json({ message: 'Podaj imię, poprawny e-mail i hasło (minimum 6 znaków).' })
  if (isRecruitmentRegistration && (!Number.isInteger(age) || age < 14 || age > 100 || !motivation || !experience)) return res.status(400).json({ message: 'Podaj wiek, powód dołączenia i swoje doświadczenie.' })
  if (users.some((user) => user.email === email.toLowerCase())) return res.status(409).json({ message: 'Konto z tym adresem już istnieje.' })
  const role = isAdminIdentity({ name, email }) ? 'admin' : isSiteRegistration ? 'site' : 'driver'
  const recruitmentStatus = role === 'admin' ? 'APPROVED' : isRecruitmentRegistration ? 'PENDING' : 'APPROVED'
  const user = { id: Date.now().toString(), name, email: email.toLowerCase(), password: await bcrypt.hash(password, 10), role, carriers: validCarriers, recruitmentStatus }
  users.push(user)
  saveUsers()
  if (role !== 'admin' && isRecruitmentRegistration) {
    applications.push({ type: 'Rekrutacja', branch: validCarriers[0], age, motivation, experience, message: motivation, applicant: user.email, applicantName: user.name, status: 'NOWE', createdAt: new Date().toISOString() })
    saveApplications()
  }
  const isAuthorizedSiteUser = role === 'site' ? false : true
  res.status(201).json({ token: isAuthorizedSiteUser ? createToken(user) : '', user: { name: user.name, email: user.email, role: user.role, carriers: user.carriers, recruitmentStatus }, siteAccount: isSiteRegistration })
})

app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body
  const user = users.find((item) => item.email === String(email).toLowerCase())
  if (!user || !(await bcrypt.compare(password || '', user.password))) return res.status(401).json({ message: 'Nieprawidłowy e-mail lub hasło.' })
  const role = isAdminIdentity(user) ? 'admin' : user.role
  if (user.role !== role) {
    user.role = role
    saveUsers()
  }
  const recruitment = applications.find((item) => item.type === 'Rekrutacja' && item.applicant === user.email)
  const recruitmentStatus = recruitment?.status === 'NOWE' ? 'PENDING' : user.recruitmentStatus || 'APPROVED'
  res.json({ token: createToken({ ...user, role, recruitmentStatus }), user: { name: user.name, email: user.email, role, carriers: user.carriers, recruitmentStatus } })
})

app.get('/api/me', auth, (req, res) => {
  if (req.user.role === 'site') return res.status(403).json({ message: 'Konto strony nie ma dostępu do panelu.' })
  const role = isAdminIdentity(req.user) ? 'admin' : req.user.role
  res.json({ user: { ...req.user, role, carriers: req.user.carriers || ['VMPK Kielce', 'VBP Tour Regio Kielce'] } })
})

app.get('/api/operations', (req, res) => res.json({ operations }))

app.patch('/api/operations', auth, (req, res) => {
  const { carrier, type, items } = req.body
  if (!operations[carrier] || !['schedule', 'fleet'].includes(type) || !Array.isArray(items)) return res.status(400).json({ message: 'Nieprawidłowe dane operacyjne.' })
  if (!canEdit(req.user, type === 'schedule' ? 'Linie' : 'Tabor')) return res.status(403).json({ message: 'Nie masz uprawnień do tej części taboru.' })
  operations[carrier][type] = items.filter((item) => typeof item === 'string' && item.trim())
  saveOperations()
  res.json({ operations })
})

app.patch('/api/fleet/photo', auth, (req, res) => {
  if (!canEdit(req.user, 'Tabor')) return res.status(403).json({ message: 'Nie masz uprawnień do edycji taboru.' })
  const { carrier, index, dataUrl } = req.body
  if (!operations[carrier] || !Number.isInteger(index) || typeof dataUrl !== 'string' || !dataUrl.startsWith('data:image/')) return res.status(400).json({ message: 'Nieprawidłowe zdjęcie pojazdu.' })
  if (dataUrl.length > 20_000_000) return res.status(413).json({ message: 'Zdjęcie jest za duże. Maksymalny rozmiar to około 20 MB.' })
  operations[carrier].photos ||= []
  operations[carrier].photos[index] = dataUrl
  saveOperations()
  res.json({ operations })
})

app.post('/api/fleet/workshop', auth, (req, res) => {
  if (!canEdit(req.user, 'Tabor')) return res.status(403).json({ message: 'Nie masz uprawnień do edycji taboru.' })
  const { carrier, vehicle, startDate, endDate, reason } = req.body
  if (!operations[carrier] || !operations[carrier].fleet.includes(vehicle) || !startDate || !endDate || startDate > endDate || !String(reason || '').trim()) {
    return res.status(400).json({ message: 'Wybierz pojazd, prawidłowy okres i podaj przyczynę awarii.' })
  }
  operations[carrier].workshop ||= []
  operations[carrier].workshop.push({ id: Date.now().toString(), carrier, vehicle, startDate, endDate, reason: String(reason).trim() })
  saveOperations()
  res.status(201).json({ operations })
})

app.delete('/api/fleet/workshop/:id', auth, (req, res) => {
  if (!canEdit(req.user, 'Tabor')) return res.status(403).json({ message: 'Nie masz uprawnień do edycji taboru.' })
  const carrier = Object.keys(operations).find((name) => operations[name].workshop?.some((item) => item.id === req.params.id))
  if (!carrier) return res.status(404).json({ message: 'Nie znaleziono wpisu warsztatowego.' })
  operations[carrier].workshop = operations[carrier].workshop.filter((item) => item.id !== req.params.id)
  saveOperations()
  res.json({ operations })
})

app.get('/api/users', auth, (req, res) => {
  if (!isStaff(req.user)) return res.status(403).json({ message: 'Brak dostępu.' })
  reloadUsersFromDisk()
  res.json({ users: users.map(({ name, email, role, carriers, recruitmentStatus }) => {
    const recruitment = applications.find((item) => item.type === 'Rekrutacja' && item.applicant === email)
    return { name, email, role, carriers, recruitmentStatus: recruitment?.status === 'NOWE' ? 'PENDING' : recruitmentStatus || 'APPROVED' }
  }) })
})

app.patch('/api/users/:email/role', auth, (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ message: 'Tylko administrator może przypisywać role.' })
  const allowedRoles = ['driver', 'dyspozytor', 'mechanik', 'sprawdzajacy', 'tworca-mapy']
  const email = decodeURIComponent(req.params.email).toLowerCase()
  const nextRole = String(req.body.role || '')
  const account = users.find((item) => item.email === email)
  if (!account) return res.status(404).json({ message: 'Nie znaleziono użytkownika.' })
  if (isAdminIdentity(account)) return res.status(403).json({ message: 'Nie można zmienić roli administratora.' })
  if (!allowedRoles.includes(nextRole)) return res.status(400).json({ message: 'Nieprawidłowa rola.' })
  account.role = nextRole
  if (nextRole !== 'driver') account.recruitmentStatus = 'APPROVED'
  saveUsers()
  res.json({ users: users.map(({ name, email: userEmail, role, carriers, recruitmentStatus }) => ({ name, email: userEmail, role, carriers, recruitmentStatus })) })
})

app.delete('/api/users/:email', auth, (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ message: 'Tylko administrator może usuwać użytkowników.' })
  const email = decodeURIComponent(req.params.email).toLowerCase()
  const index = users.findIndex((item) => item.email === email)
  if (index < 0) return res.status(404).json({ message: 'Nie znaleziono użytkownika.' })
  const account = users[index]
  if (isAdminIdentity(account)) return res.status(403).json({ message: 'Nie można usunąć administratora.' })
  users.splice(index, 1)
  applications.splice(0, applications.length, ...applications.filter((item) => item.applicant !== email))
  reports.splice(0, reports.length, ...reports.filter((item) => item.reporter !== email))
  assignments.splice(0, assignments.length, ...assignments.filter((item) => item.driverEmail !== email))
  saveUsers(); saveApplications(); saveReports(); saveAssignments()
  reloadUsersFromDisk()
  res.json({ users: users.map(({ name, email: userEmail, role, carriers, recruitmentStatus }) => ({ name, email: userEmail, role, carriers, recruitmentStatus })) })
})

app.get('/api/assignments', auth, (req, res) => {
  res.json({ assignments: visibleAssignmentsFor(req.user) })
})

app.post('/api/assignments', auth, (req, res) => {
  if (!canEdit(req.user, 'Grafik')) return res.status(403).json({ message: 'Nie masz uprawnień do edycji grafiku.' })
  const { driverEmail, carrier, service, vehicle, date } = req.body
  if (!driverEmail || !carrier || !service || !date) return res.status(400).json({ message: 'Uzupełnij kierowcę, przewoźnika, służbę i datę.' })
  if (!operations[carrier]) return res.status(400).json({ message: 'Nieprawidłowy przewoźnik.' })
  if (!users.some((user) => user.email === driverEmail)) return res.status(400).json({ message: 'Nie znaleziono kierowcy.' })
  if (vehicle && !operations[carrier].fleet.includes(vehicle)) return res.status(400).json({ message: 'Wybrany pojazd nie należy do tego przewoźnika.' })
  if (vehicle && vehicleInWorkshop(carrier, vehicle, date)) return res.status(409).json({ message: 'Pojazd jest w warsztacie w wybranym terminie.' })
  assignments.push({ id: Date.now().toString(), driverEmail, carrier, service, vehicle: vehicle || '', date, description: String(req.body.description || '').trim() })
  saveAssignments()
  res.status(201).json({ assignments })
})

app.patch('/api/assignments/:id', auth, (req, res) => {
  if (!canEdit(req.user, 'Grafik')) return res.status(403).json({ message: 'Nie masz uprawnień do edycji grafiku.' })
  const assignment = assignments.find((item) => item.id === req.params.id)
  if (!assignment) return res.status(404).json({ message: 'Nie znaleziono przydzielonej służby.' })
  const { driverEmail, carrier, service, vehicle, date, description } = req.body
  if (!driverEmail || !operations[carrier] || !service || !date) return res.status(400).json({ message: 'Uzupełnij kierowcę, przewoźnika, linię i datę.' })
  if (vehicle && !operations[carrier].fleet.includes(vehicle)) return res.status(400).json({ message: 'Wybrany pojazd nie należy do tego przewoźnika.' })
  if (vehicle && vehicleInWorkshop(carrier, vehicle, date)) return res.status(409).json({ message: 'Pojazd jest w warsztacie w wybranym terminie.' })
  Object.assign(assignment, { driverEmail, carrier, service, vehicle: vehicle || '', date, description: String(description || '').trim() })
  saveAssignments()
  res.json({ assignment, assignments })
})

app.delete('/api/assignments/:id', auth, (req, res) => {
  if (!canEdit(req.user, 'Grafik')) return res.status(403).json({ message: 'Nie masz uprawnień do edycji grafiku.' })
  const index = assignments.findIndex((item) => item.id === req.params.id)
  if (index < 0) return res.status(404).json({ message: 'Nie znaleziono przydzielonej służby.' })
  assignments.splice(index, 1)
  saveAssignments()
  res.json({ assignments })
})

app.get('/api/reports', auth, (req, res) => {
  if (!isStaff(req.user)) {
    res.json({ reports: reports.filter((item) => item.reporter === req.user.email && (!req.user.carriers || !req.user.carriers.length || userCanAccessCarrier(req.user, item.carrier))) })
    return
  }
  res.json({ reports: visibleRecordsForCarrier(reports, req.user, req.user.carriers?.[0] || 'VMPK Kielce') })
})

app.patch('/api/reports/:id', auth, (req, res) => {
  const { id } = req.params
  const report = reports.find((item) => item.id === id)
  const nextStatus = String(req.body.status || '').trim()
  if (!report) return res.status(404).json({ message: 'Raport nie istnieje.' })
  const section = report.type === 'Awaria pojazdu' ? 'Zgłoszenia' : 'Raporty'
  if (!canEdit(req.user, section)) return res.status(403).json({ message: 'Nie masz uprawnień do rozpatrywania tej pozycji.' })
  if (!['ZATWIERDZONO', 'ODRZUCONO'].includes(nextStatus)) return res.status(400).json({ message: 'Nieprawidłowy status raportu.' })
  const decisionReason = String(req.body.reason || '').trim()
  if (nextStatus === 'ODRZUCONO' && !decisionReason) return res.status(400).json({ message: 'Podaj powód odrzucenia.' })
  report.status = nextStatus
  report.rejectionReason = nextStatus === 'ODRZUCONO' ? decisionReason : ''
  saveReports()
  res.json({ report, reports })
})

app.post('/api/reports/:id/appeal', auth, (req, res) => {
  const report = reports.find((item) => item.id === req.params.id)
  if (!report) return res.status(404).json({ message: 'Raport nie istnieje.' })
  if (req.user.role !== 'admin' && report.reporter !== req.user.email) return res.status(403).json({ message: 'Nie możesz odwołać cudzego raportu.' })
  if (report.status === 'ZATWIERDZONO') return res.status(409).json({ message: 'Zatwierdzonego raportu nie można odwołać.' })
  const description = String(req.body.description || '').trim()
  if (!description) return res.status(400).json({ message: 'Opisz powód odwołania.' })
  const photos = Array.isArray(req.body.photos) ? req.body.photos : []
  if (photos.some((photo) => typeof photo !== 'string' || !photo.startsWith('data:image/'))) return res.status(400).json({ message: 'Załącznik musi być zdjęciem.' })
  report.appeal = { description, photos, txtName: String(req.body.txtName || ''), txtContent: String(req.body.txtContent || ''), createdAt: new Date().toISOString() }
  saveReports()
  res.status(201).json({ report, reports: reports.filter((item) => req.user.role === 'admin' || item.reporter === req.user.email) })
})

app.post('/api/reports', auth, (req, res) => {
  if (req.user.role !== 'driver') return res.status(403).json({ message: 'Konto pracownicze ma dostęp tylko do odczytu raportów.' })
  const { type, carrier, vehicle, description, service, assignmentId, firstCounter, lastCounter, summary, reason, txtName, txtContent, photos } = req.body
  const reportSummary = String(summary || description || '').trim() || 'Brak przyczyny'
  const reportCarrier = String(carrier || '')
  const reportService = String(service || vehicle || '').trim()
  if (!type || !reportCarrier) return res.status(400).json({ message: 'Wybierz przewoźnika i uzupełnij dane raportu.' })
  if (type === 'Raport z OMSI' && !assignments.some((item) => item.id === assignmentId && item.driverEmail === req.user.email && item.carrier === reportCarrier)) return res.status(400).json({ message: 'Raport musi dotyczyć służby przydzielonej temu kierowcy.' })
  const createdReport = {
    id: Date.now().toString(),
    type,
    carrier: reportCarrier,
    vehicle: vehicle || reportService,
    description: reportSummary,
    reporter: req.user.email,
    createdAt: new Date().toISOString(),
    status: 'NOWE',
    service: reportService,
    assignmentId: assignmentId || '',
    firstCounter: firstCounter ?? '',
    lastCounter: lastCounter ?? '',
    summary: reportSummary,
    reason: String(reason || 'Brak przyczyny').trim() || 'Brak przyczyny',
    txtName: txtName || '',
    txtContent: txtContent || '',
    photos: Array.isArray(photos) ? photos : [],
  }
  reports.push(createdReport)
  saveReports()
  res.status(201).json({ message: 'Raport został wysłany do administratora.', reports: reports.filter((item) => item.reporter === req.user.email) })
})

app.get('/api/messages', auth, (req, res) => {
  if (!isStaff(req.user)) {
    const visibleMessages = messages.filter((item) => !item.recipient || item.recipient === req.user.email || item.recipient === 'Wszyscy' || item.recipient === 'all')
    return res.json({ messages: visibleMessages })
  }
  res.json({ messages })
})

app.get('/api/public/messages', (req, res) => {
  res.json({ messages: messages.filter((item) => item.isPublic) })
})

app.post('/api/messages', auth, (req, res) => {
  if (!canEdit(req.user, 'Wiadomości')) return res.status(403).json({ message: 'Nie masz uprawnień do publikowania wiadomości.' })
  const { title, content, carrier, recipientEmail, isPublic } = req.body
  if (!title || !content) return res.status(400).json({ message: 'Podaj tytuł i treść wiadomości.' })
  messages.unshift({
    id: Date.now().toString(),
    title,
    content,
    carrier: carrier || 'VZTM Kielce',
    author: req.user.name,
    createdAt: new Date().toISOString(),
    recipient: recipientEmail ? String(recipientEmail).trim() : '',
    isPublic: Boolean(isPublic),
  })
  saveMessages()
  res.status(201).json({ messages })
})

app.get('/api/contacts', auth, (req, res) => {
  if (!isStaff(req.user)) return res.status(403).json({ message: 'Brak dostępu.' })
  res.json({ contacts })
})

app.post('/api/contact', (req, res) => {
  const email = String(req.body.email || '').trim().toLowerCase()
  const message = String(req.body.message || '').trim()
  if (!/^\S+@\S+\.\S+$/.test(email) || !message) return res.status(400).json({ message: 'Podaj poprawny e-mail i treść wiadomości.' })
  const contact = { id: Date.now().toString(), email, message, createdAt: new Date().toISOString(), status: 'NOWA' }
  contacts.unshift(contact)
  saveContacts()
  res.status(201).json({ message: 'Wiadomość kontaktowa została wysłana.' })
})

app.post('/api/import/czynaczas', auth, async (req, res) => {
  if (!canEdit(req.user, 'Linie')) return res.status(403).json({ message: 'Nie masz uprawnień do edycji linii.' })
  try {
    const response = await fetch('https://czynaczas.pl/api/kielce/transport', {
      headers: { 'User-Agent': 'Mozilla/5.0 VZTM-Kielce/1.0', Accept: 'application/json', 'X-Page': '/kielce/rozklad-jazdy' },
    })
    if (!response.ok) return res.status(502).json({ message: 'Nie udało się pobrać danych linii z CzyNaCzas.' })
    const data = await response.json()
    const importedLines = Object.keys(data.routes || {})
      .sort((left, right) => left.localeCompare(right, 'pl', { numeric: true }))
      .map((line) => `Linia ${line}`)
    if (!importedLines.length) return res.status(502).json({ message: 'Nie znaleziono numerów linii na stronie CzyNaCzas.' })
    const carrier = req.body.carrier === 'VBP Tour Regio Kielce' ? 'VBP Tour Regio Kielce' : 'VMPK Kielce'
    operations[carrier].schedule = importedLines
    saveOperations()
    res.json({ operations, imported: importedLines.length, source: 'CzyNaCzas Kielce' })
  } catch {
    res.status(502).json({ message: 'Nie udało się połączyć z CzyNaCzas.' })
  }
})

app.post('/api/applications', auth, (req, res) => {
  if (!canSubmitApplication(req.user)) return res.status(403).json({ message: 'Nie masz uprawnień do składania wniosków.' })
  const { branch, experience, message, type, date, startDate, endDate, service, vehicle } = req.body
  const cleanedMessage = String(message || '').trim()
  const cleanedExperience = String(experience || '').trim()
  const allowedTypes = ['Dzień wolny', 'Dodatkowa Służba', 'Przydział stałego pojazdu', 'Zmiana stałego pojazdu', 'Urlop']
  if (!allowedTypes.includes(type)) return res.status(400).json({ message: 'Nieprawidłowy rodzaj wniosku.' })
  if (!branch || !type) return res.status(400).json({ message: 'Wybierz typ wniosku i przewoźnika.' })
  if ((type === 'Dzień wolny' || type === 'Dodatkowa Służba') && !date) return res.status(400).json({ message: 'Wybierz datę wniosku.' })
  if (type === 'Urlop' && (!startDate || !endDate || startDate > endDate)) return res.status(400).json({ message: 'Wybierz prawidłowy zakres urlopu.' })
  if (type === 'Dzień wolny' && !service) return res.status(400).json({ message: 'Wybierz służbę dla dnia wolnego.' })
  if (type === 'Dzień wolny' && !assignments.some((item) => item.driverEmail === req.user.email && item.carrier === branch && item.service === service && item.date === date)) return res.status(400).json({ message: 'Wybrana służba nie jest przypisana do Twojego grafiku.' })
  if (type === 'Dodatkowa Służba' && !vehicle) return res.status(400).json({ message: 'Wybierz pojazd dla dodatkowej służby.' })
  if ((type === 'Przydział stałego pojazdu' || type === 'Zmiana stałego pojazdu' || type === 'Dodatkowa Służba') && !cleanedMessage) return res.status(400).json({ message: 'Uzupełnij dodatkowe informacje wniosku.' })
  if (type !== 'Przydział stałego pojazdu' && type !== 'Zmiana stałego pojazdu' && type !== 'Dodatkowa Służba' && !cleanedMessage) return res.status(400).json({ message: 'Uzupełnij uzasadnienie wniosku.' })

  applications.push({
    ...req.body,
    type,
    branch,
    date: date || '',
    startDate: startDate || '',
    endDate: endDate || '',
    service: service || '',
    vehicle: vehicle || '',
    experience: cleanedExperience,
    message: cleanedMessage || cleanedExperience,
    applicant: req.user.email,
    status: 'NOWE',
    createdAt: new Date().toISOString(),
  })
  saveApplications()
  res.status(201).json({ message: 'Wniosek został wysłany. Zarząd VZTM odezwie się do Ciebie.' })
})

app.post('/api/applications/:id/schedule', auth, (req, res) => {
  if (!canEdit(req.user, 'Grafik') && !canEdit(req.user, 'Wnioski')) return res.status(403).json({ message: 'Nie masz uprawnień do zatwierdzania dodatkowej służby.' })
  const application = applications.find((item) => item.createdAt === req.params.id || item.id === req.params.id)
  if (!application || !['Dodatkowa Służba', 'Dodatkowa Sluzba'].includes(application.type)) return res.status(404).json({ message: 'Nie znaleziono wniosku o dodatkową służbę.' })
  if (application.scheduledAssignmentId) return res.status(409).json({ message: 'Ta dodatkowa służba jest już w grafiku.' })
  if (application.status && application.status !== 'NOWE') return res.status(409).json({ message: 'Można dodać tylko oczekujący wniosek.' })
  const approvedLine = String(req.body.line || '').trim()
  if (!application.date || !application.vehicle || !approvedLine) return res.status(400).json({ message: 'Podaj linię oraz sprawdź, czy wniosek zawiera datę i pojazd.' })
  const assignment = {
    id: Date.now().toString(),
    driverEmail: application.applicant,
    carrier: application.branch,
    service: approvedLine,
    vehicle: application.vehicle,
    date: application.date,
  }
  assignments.push(assignment)
  application.scheduledAssignmentId = assignment.id
  application.approvedLine = approvedLine
  application.status = 'ZATWIERDZONO'
  saveAssignments()
  saveApplications()
  res.status(201).json({ message: 'Dodatkowa służba została dodana do grafiku.', assignmentId: assignment.id })
})

app.get('/api/applications', auth, (req, res) => {
  res.json({ applications: visibleApplicationsFor(req.user) })
})

app.delete('/api/history/:kind', auth, (req, res) => {
  if (!isStaff(req.user)) return res.status(403).json({ message: 'Brak uprawnień do czyszczenia historii.' })
  const kind = String(req.params.kind || '').toLowerCase()
  const carrier = String(req.body?.carrier || req.query?.carrier || '').trim()
  const applyCarrierFilter = (itemCarrier) => !carrier || itemCarrier === carrier

  if (['recruitment', 'rekrutacja'].includes(kind)) {
    const nextApplications = applications.filter((item) => !(item.type === 'Rekrutacja' && applyCarrierFilter(item.branch)))
    applications.splice(0, applications.length, ...nextApplications)
    saveApplications()
    return res.json({ applications: visibleApplicationsFor(req.user), reports: visibleRecordsForCarrier(reports, req.user, carrier || req.user.carriers?.[0]) })
  }

  if (['applications', 'wnioski'].includes(kind)) {
    const nextApplications = applications.filter((item) => !(item.type !== 'Rekrutacja' && applyCarrierFilter(item.branch)))
    applications.splice(0, applications.length, ...nextApplications)
    saveApplications()
    return res.json({ applications: visibleApplicationsFor(req.user), reports: visibleRecordsForCarrier(reports, req.user, carrier || req.user.carriers?.[0]) })
  }

  if (['reports', 'raporty'].includes(kind)) {
    const nextReports = reports.filter((item) => !(item.type === 'Raport z OMSI' && applyCarrierFilter(item.carrier)))
    reports.splice(0, reports.length, ...nextReports)
    saveReports()
    return res.json({ reports: visibleRecordsForCarrier(reports, req.user, carrier || req.user.carriers?.[0]) })
  }

  if (['issues', 'zgloszenia', 'awarie'].includes(kind)) {
    const nextReports = reports.filter((item) => !(item.type === 'Awaria pojazdu' && applyCarrierFilter(item.carrier)))
    reports.splice(0, reports.length, ...nextReports)
    saveReports()
    return res.json({ reports: visibleRecordsForCarrier(reports, req.user, carrier || req.user.carriers?.[0]) })
  }

  return res.status(400).json({ message: 'Nieprawidłowy typ historii do wyczyszczenia.' })
})

app.patch('/api/applications/:id', auth, (req, res) => {
  const application = applications.find((item) => item.createdAt === req.params.id || item.id === req.params.id)
  if (!application) return res.status(404).json({ message: 'Wniosek nie istnieje.' })
  const status = String(req.body.status || '')
  if (isStaff(req.user)) {
    const section = application.type === 'Rekrutacja' ? 'Rekrutacja' : 'Wnioski'
    if (!canEdit(req.user, section)) return res.status(403).json({ message: 'Nie masz uprawnień do rozpatrywania tego wniosku.' })
    if (!['ZATWIERDZONO', 'ODRZUCONO'].includes(status)) return res.status(400).json({ message: 'Nieprawidłowy status wniosku.' })
    const decisionReason = String(req.body.reason || '').trim()
    if (status === 'ODRZUCONO' && !decisionReason) return res.status(400).json({ message: 'Podaj powód odrzucenia.' })
    application.status = status
    application.rejectionReason = status === 'ODRZUCONO' ? decisionReason : ''
    if (application.type === 'Rekrutacja') {
      const user = users.find((item) => item.email === application.applicant)
      if (user) {
        user.recruitmentStatus = status === 'ZATWIERDZONO' ? 'APPROVED' : 'REJECTED'
        saveUsers()
      }
    }
  } else {
    if (application.applicant !== req.user.email) return res.status(403).json({ message: 'Nie możesz odwołać tego wniosku.' })
    if (status !== 'ANULOWANO') return res.status(400).json({ message: 'Możesz jedynie odwołać własny wniosek.' })
    if (application.status && application.status !== 'NOWE') return res.status(400).json({ message: 'Można odwołać tylko wniosek oczekujący na rozpatrzenie.' })
    const reason = String(req.body.cancelReason || '').trim()
    if (!reason) return res.status(400).json({ message: 'Podaj powód odwołania wniosku.' })
    application.status = status
    application.cancelReason = reason
  }
  saveApplications()
  res.json({ application, applications: visibleApplicationsFor(req.user) })
})

app.get('/api/downloads', auth, (req, res) => {
  res.json({ downloads })
})

app.patch('/api/downloads', auth, (req, res) => {
  if (!canEdit(req.user, 'Pobieralnia')) return res.status(403).json({ message: 'Nie masz uprawnień do edycji pobieralni.' })
  if (!Array.isArray(req.body.downloads)) return res.status(400).json({ message: 'Nieprawidłowa lista plików.' })
  const nextDownloads = req.body.downloads.map((item) => {
    const download = {
      id: String(item.id || Date.now()),
      title: String(item.title || '').trim(),
      description: String(item.description || '').trim(),
      type: String(item.type || '').trim(),
    }
    if (typeof item.url === 'string') download.url = item.url.trim()
    if (typeof item.dataUrl === 'string' && item.dataUrl) download.dataUrl = item.dataUrl
    return download
  })
  if (nextDownloads.some((item) => !item.title || !item.type || (item.url && !/^https?:\/\//i.test(item.url)) || (item.dataUrl && !/^data:(application\/(pdf|zip|octet-stream)|text\/plain|image\/(png|jpeg|webp));base64,/.test(item.dataUrl)))) {
    return res.status(400).json({ message: 'Każda pozycja musi mieć nazwę, typ oraz prawidłowy link lub plik.' })
  }
  if (nextDownloads.some((item) => item.dataUrl && item.dataUrl.length > 20_000_000)) return res.status(413).json({ message: 'Plik jest za duży.' })
  downloads.splice(0, downloads.length, ...nextDownloads)
  saveDownloads()
  res.json({ downloads })
})

app.listen(port, () => console.log(`VZTM API działa na http://127.0.0.1:${port}`))