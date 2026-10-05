import { ChangeEvent, ReactNode, useEffect, useState } from 'react'
import { closeLiffOrFallback } from './liff'

type Screen = 'home' | 'line-profile' | 'chat' | 'line-services' | 'line-faq' | 'link-verification' | 'appointment' | 'appointment-review' | 'appointment-submitted' | 'appointment-confirmed-notification' | 'appointment-confirmed' | 'appointment-records' | 'appointment-detail' | 'appointment-change' | 'appointment-change-review' | 'appointment-change-submitted' | 'report' | 'upload' | 'report-review' | 'report-submitted' | 'call' | 'call-followup' | 'status-a' | 'status-b' | 'status-c' | 'repair-presence' | 'repair-r1' | 'repair-r2' | 'repair-r3' | 'repair-r4' | 'repair-r5' | 'additional-notification' | 'additional-a1' | 'additional-a2' | 'additional-a3' | 'additional-a4' | 'additional-a5' | 'repair-status' | 'repair-complete' | 'repair-record'
type Appointment = { selectedDate: string; selectedTime: string; serviceType: string; serviceDetail: string; name: string; phone: string; plate: string; carModel: string; mileage: string; note: string }
type VehicleReport = { symptoms: string[]; occurrence: string; drivableStatus: string; plate: string; mileage: string; location: string; files: File[]; note: string }
type TimelineEvent = 'editor-request' | 'editor-reply' | 'report-received' | 'call-ended' | 'assessment-ready' | 'appointment-pending' | 'appointment-confirmed' | 'appointment-change-request' | 'appointment-updated' | 'appointment-change-failed' | 'additional-found' | 'additional-confirmed' | 'repair-complete'
type AppointmentSlot = { date: string; time: string }

const emptyAppointment: Appointment = { selectedDate: '', selectedTime: '', serviceType: '', serviceDetail: '', name: '', phone: '', plate: '', carModel: '', mileage: '', note: '' }
const emptyReport: VehicleReport = { symptoms: [], occurrence: '', drivableStatus: '', plate: '', mileage: '', location: '', files: [], note: '' }
const availability: Record<string, string[]> = {
  '2026-08-18': ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00'],
  '2026-08-20': ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00'],
  '2026-08-21': [],
  '2026-08-22': ['09:00', '10:00', '11:00', '13:00', '15:00', '16:00'],
  '2026-08-25': ['10:00', '11:00', '13:00', '14:00', '15:00', '16:00'],
  '2026-08-27': ['09:00', '10:00', '11:00', '13:00', '14:00', '15:00', '16:00'],
  '2026-08-28': ['09:00', '11:00', '13:00', '14:00', '15:00', '16:00'],
  '2026-08-29': ['09:00', '10:00', '11:00', '13:00', '14:00'],
}
const days = Array.from({ length: 31 }, (_, i) => i + 1)
const weekdays = ['日', '一', '二', '三', '四', '五', '六']
const services = ['定期保養', '車況異常／想檢查', '已知道要維修的項目', '我不確定', '其他']
const symptoms = ['異音', '警示燈亮起', '無法發動', '行駛抖動／異常', '漏油／漏水', '發動後熄火', '其他', '不確定']
const occurrences = ['行駛中', '發動時', '煞車時', '停車後', '其他']
const validPhone = (value: string) => /^09\d{8}$/.test(value.replace(/\D/g, ''))
const validPlate = (value: string) => /^[A-Z0-9-]{5,10}$/i.test(value.trim())
const validMileage = (value: string) => Number(value) > 0

function App() {
  const liffEntry = new URLSearchParams(window.location.search).get('liff')
  const initialScreen: Screen = liffEntry === 'report' ? 'report' : liffEntry === 'appointment' ? 'chat' : liffEntry === 'change' ? 'appointment-change' : 'home'
  const existingAppointment: Appointment = { selectedDate: '2026-08-27', selectedTime: '11:00', serviceType: '定期保養', serviceDetail: '', name: '王小明', phone: '0912 345 678', plate: 'ABC-1234', carModel: 'Toyota Corolla Cross', mileage: '42350', note: '' }
  const [screen, setScreen] = useState<Screen>(initialScreen)
  const [appointment, setAppointment] = useState<Appointment>(liffEntry === 'change' ? existingAppointment : liffEntry === 'appointment' ? { ...existingAppointment, note: '最近冷氣出風較弱' } : emptyAppointment)
  const [report, setReport] = useState<VehicleReport>(liffEntry === 'report' ? { ...emptyReport, symptoms: ['異音', '警示燈亮起'], occurrence: '行駛中', drivableStatus: '不確定', plate: 'ABC-1234', mileage: '42350', location: '台中市南區' } : emptyReport)
  const [menuOpen, setMenuOpen] = useState(false)
  const [repairItems, setRepairItems] = useState(['前煞車來令片更換', '冷氣濾網更換'])
  const [additionalApproved, setAdditionalApproved] = useState(true)
  const [appointmentConfirmed, setAppointmentConfirmed] = useState(false)
  const [appointmentBeforeChange, setAppointmentBeforeChange] = useState<AppointmentSlot>({ date: '2026-08-27', time: '11:00' })
  const [changeDraft, setChangeDraft] = useState<AppointmentSlot>({ date: '', time: '' })
  const [changeOutcome, setChangeOutcome] = useState<'success' | 'failure'>('success')
  const [timelineEvents, setTimelineEvents] = useState<TimelineEvent[]>([])
  const [chatMessages, setChatMessages] = useState<string[]>([])
  const [isLinked, setIsLinked] = useState(false)
  const [pendingDestination, setPendingDestination] = useState<Screen>('appointment-records')
  useEffect(() => { window.scrollTo({ top: 0, behavior: 'auto' }) }, [screen])
  useEffect(() => {
    if (screen !== 'chat' || !timelineEvents.includes('appointment-pending') || timelineEvents.includes('appointment-confirmed')) return
    const timer = window.setTimeout(() => {
      setAppointmentConfirmed(true)
      addEvent('appointment-confirmed')
    }, 4000)
    return () => window.clearTimeout(timer)
  }, [screen, timelineEvents])
  useEffect(() => {
    if (screen !== 'chat' || !timelineEvents.includes('appointment-change-request') || timelineEvents.includes('appointment-updated') || timelineEvents.includes('appointment-change-failed')) return
    const timer = window.setTimeout(() => {
      if (changeOutcome === 'failure') {
        addEvent('appointment-change-failed')
        return
      }
      setAppointment(current => ({ ...current, selectedDate: changeDraft.date, selectedTime: changeDraft.time }))
      setAppointmentConfirmed(true)
      addEvent('appointment-updated')
    }, 4000)
    return () => window.clearTimeout(timer)
  }, [screen, timelineEvents, changeDraft, changeOutcome])
  useEffect(() => {
    if (screen !== 'chat' || !timelineEvents.includes('editor-request') || timelineEvents.includes('editor-reply')) return
    const timer = window.setTimeout(() => addEvent('editor-reply'), 4000)
    return () => window.clearTimeout(timer)
  }, [screen, timelineEvents])
  const addEvent = (event: TimelineEvent) => setTimelineEvents(current => current.includes(event) ? current : [...current, event])
  const goChat = (event?: TimelineEvent) => { if (event) addEvent(event); setScreen('chat') }
  const openPersonalFeature = (destination: Screen) => {
    if (isLinked) { setScreen(destination); return }
    setPendingDestination(destination)
    setScreen('link-verification')
  }
  const openReschedule = (_appointmentId = 'active-appointment') => {
    setAppointmentBeforeChange({ date: appointment.selectedDate, time: appointment.selectedTime })
    setChangeDraft({ date: '', time: '' })
    setChangeOutcome('success')
    setTimelineEvents(current => current.filter(event => !['appointment-change-request','appointment-updated','appointment-change-failed'].includes(event)))
    setScreen('appointment-change')
  }
  const submitAppointmentChange = () => setScreen('appointment-change-review')
  const exitLiff = () => {
    closeLiffOrFallback(() => {
      if (window.opener) window.close()
      else setScreen('chat')
    })
  }
  const resetLinked = () => { setIsLinked(false); setPendingDestination('appointment-records'); setScreen('chat'); setMenuOpen(false) }
  const reset = () => { report.files.forEach(file => void file); setAppointment(emptyAppointment); setReport(emptyReport); setAppointmentConfirmed(false); setAppointmentBeforeChange({ date: '2026-08-27', time: '11:00' }); setChangeDraft({ date: '', time: '' }); setChangeOutcome('success'); setTimelineEvents([]); setChatMessages([]); setIsLinked(false); setPendingDestination('appointment-records'); setScreen('home'); setMenuOpen(false) }
  const jump = (next: Screen) => {
    if (next.startsWith('appointment') && !appointment.selectedDate) setAppointment({ selectedDate: '2026-08-27', selectedTime: '11:00', serviceType: '定期保養', serviceDetail: '', name: '王小明', phone: '0912 345 678', plate: 'ABC-1234', carModel: 'Toyota Corolla Cross', mileage: '42350', note: '最近冷氣出風較弱' })
    if ((next.includes('report') || next === 'chat' || next === 'call' || next.startsWith('status')) && !report.plate) setReport({ ...emptyReport, symptoms: ['異音', '警示燈亮起'], occurrence: '行駛中', drivableStatus: '不確定', plate: 'ABC-1234', mileage: '42350', location: '台中市南區', note: '啟動時有異音，儀表板也會亮起。' })
    setScreen(next); setMenuOpen(false)
  }
  const enterAppointmentFromReport = () => {
    setAppointment(current => ({ ...current, serviceType: '車況異常／想檢查', plate: report.plate || current.plate }))
    setScreen('appointment')
  }
  let page: ReactNode
  if (screen === 'home') page = <Home go={setScreen} reset={reset} />
  else if (screen === 'line-profile') page = <LineProfile go={setScreen} />
  else if (screen === 'line-services') page = <LineInfo type="services" go={setScreen} />
  else if (screen === 'line-faq') page = <LineInfo type="faq" go={setScreen} />
  else if (screen === 'link-verification') page = <LinkVerification destination={pendingDestination} success={() => { setIsLinked(true); setScreen(pendingDestination) }} back={() => setScreen('chat')} />
  else if (screen === 'appointment') page = <AppointmentForm value={appointment} onChange={setAppointment} next={() => setScreen('appointment-review')} back={() => setScreen('chat')} />
  else if (screen === 'appointment-review') page = <AppointmentReview value={appointment} back={() => setScreen('appointment')} submit={() => setScreen('appointment-submitted')} />
  else if (screen === 'appointment-submitted') page = <AppointmentSubmitted value={appointment} backToLine={() => goChat('appointment-pending')} />
  else if (screen === 'appointment-confirmed-notification') page = <AppointmentConfirmedNotification value={appointment} go={setScreen} />
  else if (screen === 'appointment-confirmed') page = <AppointmentConfirmed value={appointment} go={setScreen} />
  else if (screen === 'appointment-records') page = <AppointmentRecords value={appointment} confirmed={appointmentConfirmed} changePending={timelineEvents.includes('appointment-change-request') && !timelineEvents.includes('appointment-updated') && !timelineEvents.includes('appointment-change-failed')} go={setScreen} />
  else if (screen === 'appointment-detail') page = <AppointmentDetail value={appointment} confirmed={appointmentConfirmed} changePending={timelineEvents.includes('appointment-change-request') && !timelineEvents.includes('appointment-updated') && !timelineEvents.includes('appointment-change-failed')} go={setScreen} openReschedule={() => openReschedule('active-appointment')} />
  else if (screen === 'appointment-change') page = <AppointmentChange value={appointment} draft={changeDraft} onChange={setChangeDraft} outcome={changeOutcome} setOutcome={setChangeOutcome} submit={submitAppointmentChange} back={() => setScreen('appointment-detail')} />
  else if (screen === 'appointment-change-review') page = <AppointmentChangeReview value={appointment} draft={changeDraft} back={() => setScreen('appointment-change')} submit={() => setScreen('appointment-change-submitted')} />
  else if (screen === 'appointment-change-submitted') page = <AppointmentChangeSubmitted value={appointment} draft={changeDraft} backToLine={() => goChat('appointment-change-request')} />
  else if (screen === 'report') page = <ReportForm value={report} onChange={setReport} next={() => setScreen('upload')} back={() => setScreen('chat')} />
  else if (screen === 'upload') page = <Upload value={report} onChange={setReport} next={() => setScreen('report-review')} back={() => setScreen('report')} />
  else if (screen === 'report-review') page = <ReportReview value={report} back={() => setScreen('report')} submit={() => setScreen('report-submitted')} />
  else if (screen === 'report-submitted') page = <ReportSubmitted value={report} next={() => goChat('report-received')} />
  else if (screen === 'chat') page = <Chat go={setScreen} events={timelineEvents} messages={chatMessages} sendMessage={message => { setChatMessages(current => [...current, message]); if (['找小編','真人客服','聯絡客服'].includes(message.trim())) addEvent('editor-request') }} appointment={appointment} appointmentBeforeChange={appointmentBeforeChange} changeDraft={changeDraft} assessmentReady={() => addEvent('assessment-ready')} appointmentFromAssessment={enterAppointmentFromReport} openReschedule={() => openReschedule('active-appointment')} openPersonalFeature={openPersonalFeature} />
  else if (screen === 'call') page = <Call end={() => goChat('call-ended')} />
  else if (screen === 'call-followup') page = <CallFollowup go={setScreen} />
  else if (screen.startsWith('status-')) page = <VehicleStatus type={screen.slice(-1).toUpperCase() as 'A' | 'B' | 'C'} appointment={enterAppointmentFromReport} go={setScreen} />
  else if (screen === 'repair-presence') page = <RepairPresence go={setScreen} />
  else if (['repair-r1','repair-r2','repair-r3','repair-r4','repair-r5'].includes(screen)) page = <RepairFlow screen={screen} items={repairItems} setItems={setRepairItems} go={setScreen} notify={goChat} />
  else if (screen === 'additional-notification') page = <AdditionalNotification go={setScreen} />
  else if (screen.startsWith('additional-')) page = <AdditionalRepair screen={screen} approved={additionalApproved} setApproved={setAdditionalApproved} go={setScreen} notify={goChat} />
  else if (screen === 'repair-status') page = <RepairStatus go={setScreen} />
  else if (screen === 'repair-complete') page = <RepairComplete go={setScreen} />
  else page = <RepairRecord go={setScreen} />

  const liffScreen = ['link-verification','report','upload','report-review','report-submitted','appointment','appointment-review','appointment-submitted','appointment-confirmed','appointment-records','appointment-detail','appointment-change','appointment-change-review','appointment-change-submitted','line-services','line-faq','status-a','status-b','status-c','repair-presence','repair-r1','repair-r2','repair-r3','repair-r4','repair-r5','additional-a1','additional-a2','additional-a3','additional-a4','additional-a5','repair-status','repair-record'].includes(screen)
  const lineScreen = ['line-profile','chat','call','call-followup'].includes(screen)
  const reportFlow = ['report','upload','report-review','report-submitted'].includes(screen)
  const liffTitle = reportFlow ? '車況快速回報' : liffEntry === 'appointment' ? '線上預約' : liffEntry === 'change' ? '更改預約時間' : undefined
  return <div className={`shell screen-${screen}${liffEntry ? ' liff-standalone' : ''}${liffEntry === 'report' ? ' liff-report' : ''}${liffEntry === 'appointment' ? ' liff-appointment' : ''}${liffEntry === 'change' ? ' liff-change' : ''}`}>
    {liffEntry && <LiffStatusBar />}
    {screen === 'home' || lineScreen ? null : liffScreen ? <LiffHeader home={liffEntry ? exitLiff : () => setScreen('chat')} title={liffTitle} completed={screen === 'report-submitted'} /> : <header className="brand"><button className="brand-button" onClick={() => setScreen('home')}>越群汽車 <span>YUEQUN AUTO</span></button></header>}{page}<ScrollCue screen={screen} />{!liffEntry && <><button className={`demo-toggle${screen === 'home' ? ' home-offset' : ''}`} onClick={() => setMenuOpen(v => !v)} aria-expanded={menuOpen}>Demo Menu</button>{menuOpen && <DemoMenu jump={jump} reset={reset} resetLinked={resetLinked} />}</>}
  </div>
}

function Page({ title, description, children, progress, back }: { title: string; description?: string; children: ReactNode; progress?: string; back?: () => void }) {
  return <main>{back && <button className="text-button back" onClick={back}>← 返回</button>}<h1>{title}</h1>{description && <p className="lead">{description}</p>}{progress && <div className="progress"><span>STEP {progress}</span><div><i style={{ width: `${Number(progress[0]) * 25}%` }} /></div></div>}{children}</main>
}
function Home({ go, reset }: { go: (s: Screen) => void; reset: () => void }) { const [menu, setMenu] = useState(false); const anchor = (id: string) => { setMenu(false); document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' }) }; return <><header className="website-header"><button aria-label="開啟選單" aria-expanded={menu} onClick={() => setMenu(v => !v)}>☰</button><b>越群汽車</b><button aria-label="撥打電話" onClick={() => window.location.href='tel:0400000000'}>☎</button></header>{menu && <nav className="anchor-menu" aria-label="網站選單">{[['首頁','top'],['服務項目','services'],['技師團隊','team'],['顧客評價','reviews'],['聯絡我們','contact']].map(([label,id]) => <button key={id} onClick={() => anchor(id)}>{label}</button>)}</nav>}<main className="website" id="top"><section className="hero"><p className="eyebrow">YUEQUN AUTO</p><h1>越了解車況，<br />越安心上路。</h1><p>從車況協助、保養到維修，<br />讓每一次決定都更清楚。</p><button className="primary wide" onClick={() => go('line-profile')}>LINE 車況協助</button><div className="image-placeholder">車廠／技師工作情境</div></section><Carousel id="services" title="服務項目">{['定期保養','引擎系統','底盤系統','冷氣系統','電機系統'].map(x => <article className="carousel-card" key={x}><div className="image-placeholder small">服務照片</div><h3>{x}</h3><p>由技師檢查並清楚說明處理內容。</p></article>)}</Carousel><section id="principle" className="principle"><blockquote>「錢別白花了。」</blockquote><p>修什麼、為什麼修、多少錢，<br />說清楚了再決定。</p><div className="why-grid">{['專業技師','透明報價','清楚說明','維修後持續服務'].map(x => <span key={x}>✓ {x}</span>)}</div></section><Carousel id="team" title="技師團隊">{[['陳技師','底盤與煞車系統','10 年維修與檢查經驗'],['林技師','引擎與電機系統','專注故障檢查與說明'],['王技師','冷氣與定期保養','重視預防保養與後續服務']].map(([name,skill,bio]) => <article className="carousel-card" key={name}><div className="image-placeholder small">技師照片</div><h3>{name}</h3><b>{skill}</b><p>{bio}</p></article>)}</Carousel><section id="reviews"><div className="section-title"><h2>顧客評價</h2></div>{['說明很清楚，知道車子為什麼需要處理。','報價透明，確認後才開始維修。','預約流程簡單，聯繫也很方便。'].map((x,i) => <div className="review" key={i}>★★★★★<p>{x}</p><small>{['王先生','林小姐','匿名車主'][i]}</small></div>)}</section><section id="contact"><div className="section-title"><h2>聯絡越群</h2></div><Summary title="店家資訊" rows={[['地址','台中市（Prototype 地址）'],['營業時間','週一至週六 09:00–18:00'],['電話','04-0000-0000']]} /><button className="primary wide" onClick={() => go('line-profile')}>LINE 車況協助</button><button className="secondary wide" onClick={() => window.open('https://maps.google.com/?q=越群汽車','_blank','noopener,noreferrer')}>查看店家位置與導航</button><button className="text-button wide" onClick={reset}>Reset Demo</button></section></main><footer>© 2026 越群汽車｜Mobile Lo-fi Prototype</footer><div className="sticky-appointment"><button className="primary" onClick={() => go('line-profile')}>LINE 車況協助</button></div></> }

function Carousel({ id, title, children }: { id: string; title: string; children: ReactNode }) { const move = (amount: number) => document.getElementById(`${id}-track`)?.scrollBy({ left: amount, behavior: 'smooth' }); return <section id={id} className="carousel-section"><div className="carousel-heading"><h2>{title}</h2><div><button onClick={() => move(-260)} aria-label={`${title}上一張`}>←</button><button onClick={() => move(260)} aria-label={`${title}下一張`}>→</button></div></div><div className="carousel-track" id={`${id}-track`}>{children}</div></section> }
function LineProfile({ go }: { go: (s: Screen) => void }) { return <main className="line-profile"><div className="line-native-bar"><button onClick={() => go('home')}>×</button><b>LINE</b><span>官方帳號</span></div><div className="profile-cover" /><div className="profile-avatar">越</div><h1>越群汽車</h1><p>@yuequnauto<br />汽車保養・檢查・維修</p><button className="line-add" onClick={() => go('chat')}>＋ 加入好友</button><button className="secondary wide" onClick={() => go('chat')}>已加入好友，開啟聊天室</button><div className="notice"><b>Prototype 說明</b><span>新使用者可模擬加入好友；已加入好友可直接進入聊天室。</span></div></main> }
function LineInfo({ type, go }: { type: 'services' | 'faq'; go: (s: Screen) => void }) { return <Page title={type === 'services' ? '服務項目' : '常見問題'} back={() => go('chat')}>{type === 'services' ? <div className="service-info">{['定期保養','引擎系統','底盤系統','冷氣系統','電機系統'].map(x => <div key={x}><b>{x}</b><span>實際項目與費用由技師檢查後說明。</span></div>)}</div> : <div className="faq"><details open><summary>不知道問題怎麼描述？</summary><p>可以使用 LINE Call，直接向技師說明。</p></details><details><summary>可以自行修改預約嗎？</summary><p>請回 LINE 聊天室，由專人協助修改或取消。</p></details><details><summary>車況回報是正式診斷嗎？</summary><p>不是，實際故障仍需進廠檢查。</p></details></div>}</Page> }

function LinkVerification({ destination, success, back }: { destination: Screen; success: () => void; back: () => void }) {
  const [phone, setPhone] = useState('')
  const [code, setCode] = useState('')
  const [sent, setSent] = useState(false)
  const [verified, setVerified] = useState(false)
  const destinationLabel = destination === 'appointment-records' ? '預約紀錄' : destination === 'repair-status' ? '維修進度' : '維修紀錄'
  if (verified) return <Page title="驗證成功"><ResultIcon /><p className="result-message">車主資料已完成綁定。</p><div className="notice"><b>之後可直接透過 LINE</b><span>查看您的預約與維修資訊。</span></div><button className="primary wide" onClick={success}>繼續查看{destinationLabel}</button></Page>
  return <Page title="首次使用｜驗證車主資料" back={back}><p className="lead">為保護您的預約與維修資料，首次查看個人紀錄前需要完成一次驗證。<br /><br />完成後，下次可直接透過 LINE 查看。</p><Field label="手機號碼" required type="tel" value={phone} onChange={value => setPhone(value.replace(/\D/g, ''))} placeholder="0912 345 678" /><button className="secondary wide" disabled={!phone.trim()} onClick={() => setSent(true)}>發送驗證碼</button>{sent && <><Field label="驗證碼" required value={code} onChange={value => setCode(value.replace(/\D/g, '').slice(0, 6))} placeholder="_ _ _ _ _ _" /><p className="hint">Prototype：輸入任意 6 位數驗證碼。</p><button className="primary wide" disabled={code.length !== 6} onClick={() => setVerified(true)}>確認驗證</button></>}</Page>
}

function LiffStatusBar() { return <div className="liff-status-bar" aria-hidden="true"><b>9:41</b><span>▮▮▮　⌁　▬</span></div> }
function LiffHeader({ home, title, completed = false }: { home: () => void; title?: string; completed?: boolean }) { return <header className="liff-header"><button onClick={title ? home : () => history.back()} aria-label={title ? '關閉' : '返回'}>{title ? '×' : completed ? '×' : '‹'}</button><span><b>{title ?? '越群汽車'}</b>{!title && <small>LINE 內開啟的服務頁面</small>}</span><button onClick={home} aria-label={title ? '聯絡客服' : '關閉'}>{title ? '客服' : '×'}</button></header> }
function ScrollCue({ screen }: { screen: Screen }) { const [show, setShow] = useState(false); useEffect(() => { const check = () => setShow(window.scrollY < 24 && document.documentElement.scrollHeight > window.innerHeight + 40); check(); window.addEventListener('scroll', check, { passive: true }); window.addEventListener('resize', check); const timer = setTimeout(check, 100); return () => { clearTimeout(timer); window.removeEventListener('scroll', check); window.removeEventListener('resize', check) } }, [screen]); return show ? <div className={`scroll-cue${screen === 'home' ? ' above-sticky' : ''}`} aria-hidden="true">⌄</div> : null }

function AppointmentForm({ value, onChange, next, back }: { value: Appointment; onChange: (v: Appointment) => void; next: () => void; back: () => void }) {
  const [showErrors, setShowErrors] = useState(false)
  const update = (key: keyof Appointment, val: string) => onChange({ ...value, [key]: val })
  const detailRequired = ['已知道要維修的項目', '其他'].includes(value.serviceType)
  const complete = Boolean(value.selectedDate && value.selectedTime && value.serviceType && (!detailRequired || value.serviceDetail.trim()) && value.name.trim() && validPhone(value.phone) && validPlate(value.plate) && validMileage(value.mileage))
  const selectedSlots = availability[value.selectedDate] ?? []
  const validate = () => {
    if (complete) { next(); return }
    setShowErrors(true)
    window.requestAnimationFrame(() => document.querySelector<HTMLElement>('[data-inline-error="true"]')?.scrollIntoView({ behavior: 'smooth', block: 'center' }))
  }
  return <Page title="線上預約" description="選擇方便的日期與時間，填寫基本資料即可送出預約申請。" back={back}><FlowStepper current={1} labels={['預約資料','確認資料','送出申請']} />
    <p className="required-note">* 為必填欄位</p>
    <Section n="01" title="選擇服務／需求 *"><div className="radio-list">{services.map(item => <label key={item}><input type="radio" name="service" checked={value.serviceType === item} onChange={() => onChange({ ...value, serviceType: item, serviceDetail: '' })} /> <span>{item}</span></label>)}</div>{value.serviceType === '已知道要維修的項目' && <Field label="請告訴我們想處理的項目" required value={value.serviceDetail} onChange={v => update('serviceDetail', v)} placeholder="例如：更換煞車來令片" />}{value.serviceType === '其他' && <Field label="請簡單說明您的需求" required value={value.serviceDetail} onChange={v => update('serviceDetail', v)} placeholder="請輸入" />}{showErrors && !value.serviceType && <p className="error-text" data-inline-error="true">⚠ 請選擇服務需求</p>}{showErrors && detailRequired && !value.serviceDetail.trim() && <p className="error-text" data-inline-error="true">⚠ 請輸入需求說明</p>}</Section>
    <Section n="02" title="選擇日期 *"><Calendar selected={value.selectedDate} choose={date => onChange({ ...value, selectedDate: date, selectedTime: '' })} />{showErrors && !value.selectedDate && <p className="error-text" data-inline-error="true">⚠ 請選擇預約日期</p>}</Section>
    <Section n="03" title="選擇時間 *" reveal>{value.selectedDate ? <><p className="section-note">8 月 {Number(value.selectedDate.slice(-2))} 日可預約時段</p><TimeSlots available={selectedSlots} selected={value.selectedTime} choose={time => update('selectedTime', time)} /></> : <p className="section-note">請先選擇預約日期，再選擇可預約時段。</p>}{showErrors && !value.selectedTime && <p className="error-text" data-inline-error="true">⚠ 請選擇預約時段</p>}</Section>
    <Section n="04" title="聯絡與車輛資料"><Field label="姓名" required value={value.name} onChange={v => update('name', v)} placeholder="王小明" /><Field label="電話" required type="tel" value={value.phone} onChange={v => update('phone', v)} placeholder="0912 345 678" /><Field label="車牌號碼" required value={value.plate} onChange={v => update('plate', v)} placeholder="ABC-1234" /><Field label="車型" value={value.carModel} onChange={v => update('carModel', v)} placeholder="Toyota Corolla Cross" /><label className="field"><span>目前里程 <em>*</em></span><div className="input-unit"><input inputMode="numeric" pattern="[0-9]*" value={value.mileage} onChange={e => update('mileage', e.target.value.replace(/\D/g, ''))} placeholder="例如：42350" /><b>km</b></div></label><Field label="補充說明（選填）" textarea value={value.note} onChange={v => update('note', v)} placeholder="最近冷氣出風較弱" /></Section>
    {showErrors && !complete && <div className="error-summary" role="alert" data-inline-error="true"><b>請完成以下資料</b>{!value.name.trim() && <p>請輸入姓名</p>}{!validPhone(value.phone) && <p>請輸入正確的 10 碼手機號碼</p>}{!validPlate(value.plate) && <p>請輸入正確的車牌號碼</p>}{!validMileage(value.mileage) && <p>目前里程必須大於 0</p>}</div>}
    <button className="primary wide" onClick={validate}>下一步：確認預約資料</button>
  </Page>
}
function Calendar({ selected, choose }: { selected: string; choose: (v: string) => void }) { return <div className="calendar"><div className="calendar-head"><b>2026 年 8 月</b></div><div className="calendar-grid weekday">{weekdays.map(d => <span key={d}>{d}</span>)}</div><div className="calendar-grid days"><span /><span /><span /><span /><span /><span />{days.map(day => { const date = `2026-08-${String(day).padStart(2, '0')}`; const enabled = Boolean(availability[date]?.length); const state = enabled ? selected === date ? 'selected' : 'available' : 'unavailable'; return <button key={day} disabled={!enabled} className={state} aria-label={`2026 年 8 月 ${day} 日，${enabled ? '可預約' : '不可預約'}`} onClick={() => choose(date)}>{day}</button> })}</div><p className="legend"><span>可預約</span><span>已選日期</span><span className="unavailable">不可預約</span></p></div> }
function TimeSlots({ available, selected, choose }: { available: string[]; selected: string; choose: (time: string) => void }) { return <div className="button-grid">{available.map(time => <button key={time} className={selected === time ? 'choice selected' : 'choice'} onClick={() => choose(time)} aria-pressed={selected === time}>{time}</button>)}</div> }
function AppointmentReview({ value, back, submit }: { value: Appointment; back: () => void; submit: () => void }) { return <Page title="確認預約資料" description="請確認以下資料無誤後送出。" back={back}><FlowStepper current={2} labels={['預約資料','確認資料','送出申請']} /><Summary title="預約資訊" rows={[['預約日期', formatDate(value.selectedDate)], ['預約時間', value.selectedTime]]} /><Summary title="服務需求" rows={[['服務類型', value.serviceType], ...(value.serviceDetail ? [['需求說明', value.serviceDetail] as [string,string]] : [])]} /><Summary title="聯絡與車輛資料" rows={[['姓名', value.name], ['電話', value.phone], ['車牌號碼', value.plate], ['車型', value.carModel || '未填寫'], ['目前里程', `${Number(value.mileage).toLocaleString('en-US')} km`], ['補充說明', value.note || '無']]} /><button className="primary wide" onClick={submit}>確認並送出預約</button><button className="secondary wide" onClick={back}>返回修改</button></Page> }
function AppointmentSubmitted({ value, backToLine }: { value: Appointment; backToLine: () => void }) { return <Page title="已收到您的預約申請"><FlowStepper current={3} labels={['預約資料','確認資料','送出申請']} /><span className="status-chip">處理中</span><p className="result-message">我們正在確認預約時段，完成後會透過 LINE 通知您。</p><Summary title="申請內容" rows={[['日期', formatDate(value.selectedDate)], ['時間', value.selectedTime],['預約服務',value.serviceType],['車輛資訊',`${value.carModel || '未填車型'}／${value.plate}`],['目前里程',`${Number(value.mileage).toLocaleString('en-US')} km`]]} /><div className="notice"><b>這是預約申請，不是預約成功</b><span>預約成立後，我們會再透過 LINE 通知您。</span></div><button className="primary wide" onClick={backToLine}>回 LINE 聊天室</button></Page> }
function AppointmentConfirmed({ value, go }: { value: Appointment; go: (s: Screen) => void }) { return <Page title="預約成立"><ResultIcon /><p className="result-message">越群汽車已為你保留此時段。</p><Summary title="預約詳情" rows={[['日期', formatDate(value.selectedDate)], ['時間', value.selectedTime], ['服務需求', value.serviceType], ['車牌', value.plate], ['車型', value.carModel || '未填寫'],['預約狀態','預約成立']]} /><div className="notice"><b>需要更改或取消預約？</b><span>請透過 LINE 聯絡越群，由專人為您服務。</span></div><button className="primary wide" onClick={() => go('chat')}>LINE 聯絡越群</button><button className="secondary wide" onClick={() => window.open('https://maps.google.com/?q=越群汽車', '_blank', 'noopener,noreferrer')}>查看店家位置與導航</button></Page> }
function AppointmentConfirmedNotification({ value, go }: { value: Appointment; go: (s: Screen) => void }) { return <main className="line-room"><div className="line-native-bar"><button onClick={() => go('chat')}>←</button><b>LINE</b><span>聊天室</span></div><div className="line-chat-head"><span className="line-avatar">越</span><b>越群汽車官方帳號</b></div><div className="chat complete-chat"><div className="bubble"><b>您的預約已確認</b><span className="status-chip">預約成立</span>{formatDate(value.selectedDate)}<br />{value.selectedTime}<br />{value.serviceType}<button className="primary wide" onClick={() => go('appointment-confirmed')}>查看預約詳情</button></div></div></main> }
function AppointmentRecords({ value, confirmed, changePending, go }: { value: Appointment; confirmed: boolean; changePending: boolean; go: (s: Screen) => void }) { const status = changePending ? '修改確認中' : confirmed ? '預約成功' : '處理中'; return <Page title="預約紀錄" back={() => go('chat')}><button className="record-card" onClick={() => go('appointment-detail')} aria-label="查看這筆預約詳情"><span className="status-chip">{status}</span><b>{value.selectedDate ? formatDate(value.selectedDate) : '2026 年 8 月 27 日（四）'}　{value.selectedTime || '11:00'}</b><span>{value.serviceType || '定期保養'}</span><span>{value.plate || 'ABC-1234'}</span><em>查看預約詳情　→</em></button></Page> }
function AppointmentDetail({ value, confirmed, changePending, go, openReschedule }: { value: Appointment; confirmed: boolean; changePending: boolean; go: (s: Screen) => void; openReschedule: () => void }) { const status = changePending ? '修改確認中' : confirmed ? '預約成功' : '處理中'; const canReschedule = canRescheduleAppointment(value, confirmed, changePending); return <Page title="預約詳情" back={() => go('appointment-records')}><span className="status-chip">{status}</span><Summary title="預約資訊" rows={[['預約日期',value.selectedDate ? formatDate(value.selectedDate) : '2026 年 8 月 27 日（四）'],['預約時間',value.selectedTime || '11:00'],['服務項目',value.serviceType || '定期保養'],['車牌',value.plate || 'ABC-1234'],['目前里程',`${Number(value.mileage || 42350).toLocaleString('en-US')} km`],['預約狀態',status]]} />{!confirmed && <div className="notice"><b>越群正在確認您的預約時段</b><span>確認完成後將透過 LINE 通知您。</span></div>}{changePending && <div className="notice"><b>修改確認中</b><span>確認完成前原預約仍然有效，暫時不能再次提出修改。</span></div>}<AppointmentActions go={go} openReschedule={openReschedule} canReschedule={canReschedule} showDetails={false} /><button className="secondary wide" onClick={() => go('chat')}>返回 LINE</button></Page> }

function AppointmentActions({ go, openReschedule, canReschedule, showDetails = true }: { go: (screen: Screen) => void; openReschedule: () => void; canReschedule: boolean; showDetails?: boolean }) { return <div className="appointment-actions">{showDetails && <button className="primary wide" onClick={() => go('appointment-detail')}>查看預約詳情</button>}{canReschedule && <button className={showDetails ? 'secondary wide' : 'primary wide'} onClick={openReschedule}>更改預約時間</button>}</div> }
function canRescheduleAppointment(value: Appointment, confirmed: boolean, changePending: boolean) { return confirmed && !changePending && value.selectedDate >= '2026-08-20' }

function AppointmentChange({ value, draft, onChange, outcome, setOutcome, submit, back }: { value: Appointment; draft: AppointmentSlot; onChange: (value: AppointmentSlot) => void; outcome: 'success' | 'failure'; setOutcome: (value: 'success' | 'failure') => void; submit: () => void; back: () => void }) {
  const available = (availability[draft.date] ?? []).filter(time => draft.date !== value.selectedDate || time !== value.selectedTime)
  const complete = Boolean(draft.date && draft.time)
  return <Page title="更改預約時間" description="選擇希望更改的日期與時間。" back={back}><FlowStepper current={1} labels={['選擇時間','確認資料','送出申請']} /><Summary title="目前預約" rows={[['預約日期',formatDate(value.selectedDate)],['預約時間',value.selectedTime],['服務項目',value.serviceType]]} /><Section title="請選擇新的預約日期 *"><Calendar selected={draft.date} choose={date => onChange({ date, time: '' })} /></Section>{draft.date && <Section title="選擇新的預約時段 *" reveal><TimeSlots available={available} selected={draft.time} choose={time => onChange({ ...draft, time })} /></Section>}<div className="notice"><b>原預約會暫時保留</b><span>送出修改申請不代表原預約已取消；店家確認新時間前，原預約仍然有效。</span></div><fieldset className="prototype-outcome"><legend>Prototype 結果模擬</legend><label><input type="radio" checked={outcome === 'success'} onChange={() => setOutcome('success')} /> 4 秒後確認成功</label><label><input type="radio" checked={outcome === 'failure'} onChange={() => setOutcome('failure')} /> 4 秒後確認失敗</label></fieldset><button className="primary wide" disabled={!complete} onClick={submit}>下一步：確認變更資料</button></Page>
}

function AppointmentChangeReview({ value, draft, back, submit }: { value: Appointment; draft: AppointmentSlot; back: () => void; submit: () => void }) {
  return <Page title="確認變更資料" description="請確認原預約與希望更改的時間。" back={back}>
    <FlowStepper current={2} labels={['選擇時間','確認資料','送出申請']} />
    <Summary title="原預約時間" rows={[["預約日期",formatDate(value.selectedDate)],["預約時間",value.selectedTime],["服務項目",value.serviceType]]} />
    <Summary title="希望更改為" rows={[["預約日期",formatDate(draft.date)],["預約時間",draft.time]]} />
    <div className="notice"><b>原預約仍會保留</b><span>新時間經店家確認前，原預約仍然有效。</span></div>
    <button className="primary wide" onClick={submit}>確認並送出變更</button>
    <button className="secondary wide" onClick={back}>返回修改</button>
  </Page>
}

function AppointmentChangeSubmitted({ value, draft, backToLine }: { value: Appointment; draft: AppointmentSlot; backToLine: () => void }) {
  return <Page title="變更申請已送出">
    <FlowStepper current={3} labels={['選擇時間','確認資料','送出申請']} />
    <span className="status-chip">處理中</span>
    <p className="result-message">我們正在安排技師與現場時段，完成後會透過 LINE 通知您。期間原預約仍然有效。</p>
    <Summary title="變更內容" rows={[["原預約",`${formatDate(value.selectedDate)} ${value.selectedTime}`],["希望更改為",`${formatDate(draft.date)} ${draft.time}`],["服務項目",value.serviceType]]} />
    <button className="primary wide" onClick={backToLine}>回 LINE 聊天室</button>
  </Page>
}

function InfoOption({ title, text, action, onClick }: { title: string; text: string; action: string; onClick: () => void }) { return <div className="info-option"><h2>{title}</h2><p>{text}</p><button className="secondary" onClick={onClick}>{action} →</button></div> }
function ReportForm({ value, onChange, next, back }: { value: VehicleReport; onChange: (v: VehicleReport) => void; next: () => void; back: () => void }) {
  const [showErrors, setShowErrors] = useState(false)
  const update = (key: keyof VehicleReport, val: string) => onChange({ ...value, [key]: val })
  const toggle = (item: string) => onChange({ ...value, symptoms: value.symptoms.includes(item) ? value.symptoms.filter(v => v !== item) : [...value.symptoms, item] })
  const complete = Boolean(value.symptoms.length && value.occurrence && value.drivableStatus && validPlate(value.plate) && validMileage(value.mileage) && value.location.trim())
  const validate = () => {
    if (complete) { next(); return }
    setShowErrors(true)
    window.requestAnimationFrame(() => document.querySelector<HTMLElement>('[data-inline-error="true"]')?.scrollIntoView({ behavior: 'smooth', block: 'center' }))
  }
  return <Page title="車況快速回報" description="＊ 為必填欄位" progress="1 / 4" back={back}><Section title="目前遇到什麼狀況？＊"><p className="hint">可複選</p><div className="check-grid">{symptoms.map(item => <label key={item} className={value.symptoms.includes(item) ? 'check selected' : 'check'}><input type="checkbox" checked={value.symptoms.includes(item)} onChange={() => toggle(item)} /> {item}</label>)}</div></Section><Section title="什麼時候發生？＊"><div className="radio-list">{occurrences.map(item => <label key={item}><input type="radio" name="occurrence" checked={value.occurrence === item} onChange={() => update('occurrence', item)} /> <span>{item}</span></label>)}</div></Section><Section title="目前是否可以行駛？＊"><div className="radio-list">{['可以', '不可以', '不確定'].map(item => <label key={item}><input type="radio" name="drivable" checked={value.drivableStatus === item} onChange={() => update('drivableStatus', item)} /> <span>{item}</span></label>)}</div></Section><Field label="車牌號碼" required value={value.plate} onChange={v => update('plate', v.toUpperCase())} placeholder="ABC-1234" /><label className="field"><span>目前里程 <em>＊</em></span><div className="input-unit"><input inputMode="numeric" pattern="[0-9]*" value={value.mileage} onChange={e => update('mileage', e.target.value.replace(/\D/g, ''))} placeholder="例如：42350" /><b>km</b></div></label><Field label="目前所在地" required value={value.location} onChange={v => update('location', v)} placeholder="台中市南區" />{showErrors && !complete && <div className="error-summary" role="alert" data-inline-error="true"><b>請完成以下資料</b>{!value.symptoms.length && <p>請選擇目前遇到的狀況</p>}{!value.occurrence && <p>請選擇發生時機</p>}{!value.drivableStatus && <p>請選擇目前是否可以行駛</p>}{!validPlate(value.plate) && <p>請輸入正確的車牌號碼</p>}{!validMileage(value.mileage) && <p>目前里程必須大於 0</p>}{!value.location.trim() && <p>請輸入目前所在地</p>}</div>}<button className="primary wide" onClick={validate}>下一步</button></Page>
}
function Upload({ value, onChange, next, back }: { value: VehicleReport; onChange: (v: VehicleReport) => void; next: () => void; back: () => void }) {
  const [urls, setUrls] = useState<string[]>([])
  const [uploadError, setUploadError] = useState('')
  useEffect(() => { const nextUrls = value.files.map(URL.createObjectURL); setUrls(nextUrls); return () => nextUrls.forEach(URL.revokeObjectURL) }, [value.files])
  const addFiles = (e: ChangeEvent<HTMLInputElement>) => { const incoming = Array.from(e.target.files ?? []); const valid = incoming.filter(file => (file.type.startsWith('image/') || file.type.startsWith('video/')) && file.size <= 10 * 1024 * 1024); const nextFiles = [...value.files, ...valid].slice(0, 3); setUploadError(valid.length !== incoming.length ? '僅支援照片或影片，單一檔案不可超過 10 MB。' : value.files.length + valid.length > 3 ? '最多只能上傳 3 個檔案。' : ''); onChange({ ...value, files: nextFiles }); e.target.value = '' }
  const removeFile = (index: number) => { setUploadError(''); onChange({ ...value, files: value.files.filter((_, i) => i !== index) }) }
  return <Page title="上傳車況照片（選填）" description="若目前沒有照片，可跳過此步驟。" progress="2 / 4" back={back}><label className="upload"><b>點擊上傳</b><span>或從相簿選擇</span><small>照片或影片，最多 3 個；單檔 10 MB</small><input type="file" accept="image/*,video/*" multiple onChange={addFiles} /></label>{uploadError && <p className="error-text" role="alert">{uploadError}</p>}{urls.length > 0 && <div className="previews">{urls.map((url, i) => <div className="preview-item" key={url}>{value.files[i].type.startsWith('video/') ? <video src={url} controls aria-label={`已選擇影片 ${i + 1}`} /> : <img src={url} alt={`已選擇圖片 ${i + 1}`} />}<button type="button" onClick={() => removeFile(i)} aria-label={`移除第 ${i + 1} 個檔案`}>移除</button></div>)}</div>}<Field label="補充說明（選填）" textarea value={value.note} onChange={note => onChange({ ...value, note })} placeholder="請簡單描述發生的情況、頻率等" /><button className="primary wide" onClick={next}>下一步</button></Page>
}
function ReportReview({ value, back, submit }: { value: VehicleReport; back: () => void; submit: () => void }) { return <Page title="確認以下內容" description="送出前請再次確認資料是否正確。" progress="3 / 4" back={back}><Summary title="送給技師的車況資訊" rows={[['車牌', value.plate], ['目前里程', `${Number(value.mileage).toLocaleString('en-US')} km`], ['異常狀況', value.symptoms.join('、')], ['發生時機', value.occurrence], ['警示燈', value.symptoms.includes('警示燈亮起') ? '引擎警示燈' : '未回報'], ['是否可行駛', value.drivableStatus], ['所在地點', value.location], ['照片', value.files.length ? `使用者已上傳 ${value.files.length} 個檔案` : '未上傳'], ['補充說明', value.note || '無']]} /><button className="primary wide" onClick={submit}>確認並送出</button><button className="secondary wide" onClick={back}>返回修改</button></Page> }
function ReportSubmitted({ value, next }: { value: VehicleReport; next: () => void }) { return <Page title="回報已送出" description="技師將透過 LINE 與您聯繫。" progress="4 / 4"><ResultIcon /><p className="result-message">我們已收到您的車況資訊。<br />技師將透過 LINE 與您聯繫。</p><Summary title="已送給技師" rows={[['車牌號碼', value.plate], ['目前里程', `${Number(value.mileage).toLocaleString('en-US')} km`], ['異常狀況', value.symptoms.join('、')], ['照片', value.files.length ? `已上傳 ${value.files.length} 個檔案` : '未上傳']]} /><button className="primary wide" onClick={next}>回 LINE 聊天室</button></Page> }
function Chat({ go, events, messages, sendMessage, appointment, appointmentBeforeChange, changeDraft, assessmentReady, appointmentFromAssessment, openReschedule, openPersonalFeature }: { go: (s: Screen) => void; events: TimelineEvent[]; messages: string[]; sendMessage: (message: string) => void; appointment: Appointment; appointmentBeforeChange: AppointmentSlot; changeDraft: AppointmentSlot; assessmentReady: () => void; appointmentFromAssessment: () => void; openReschedule: () => void; openPersonalFeature: (screen: Screen) => void }) {
  const [input, setInput] = useState('')
  const [showCallHelp, setShowCallHelp] = useState(false)
  const [infoMode, setInfoMode] = useState<'menu' | 'services' | 'faq' | null>(null)
  const [selectedService, setSelectedService] = useState('')
  const [selectedFaq, setSelectedFaq] = useState('')
  const has = (event: TimelineEvent) => events.includes(event)
  const changePending = has('appointment-change-request') && !has('appointment-updated') && !has('appointment-change-failed')
  const canReschedule = canRescheduleAppointment(appointment, has('appointment-confirmed'), changePending)
  const groups: [string, [string, Screen][]][] = [
    ['遇到車況問題', [['快速回報車況','report'],['LINE Call 技師協助','call']]],
    ['預約服務', [['線上預約進廠','appointment'],['查看預約紀錄','appointment-records']]],
    ['維修服務', [['查看維修進度','repair-status'],['查看維修紀錄','repair-record']]],
    ['其他', [['服務資訊','line-services'],['真人客服','line-faq']]],
  ]
  const serviceDetails: Record<string, { text: string; items: string[] }> = {
    '🔧 定期保養': { text: '依照車況與里程，提供定期檢查與保養建議。', items: ['機油與濾芯更換','煞車與輪胎檢查','油水與電瓶檢查','保養週期確認'] },
    '⚙️ 引擎系統': { text: '提供引擎檢修、動力系統檢查及相關維修服務。', items: ['引擎異音檢查','引擎警示燈檢查','漏油／漏水檢查','動力異常檢查'] },
    '⭕ 底盤系統': { text: '提供煞車、懸吊與底盤相關檢查及維修服務。', items: ['煞車系統檢查','行駛異音檢查','避震與懸吊檢查','底盤零件檢查'] },
    '❄️ 冷氣系統': { text: '提供車內冷氣與空調循環相關檢查及維修服務。', items: ['冷氣不冷檢查','冷媒與壓縮機檢查','出風異常檢查','冷氣濾網更換'] },
    '🔋 電機系統': { text: '提供車輛供電、啟動與電子系統相關檢查。', items: ['電瓶健康檢查','發電機檢查','無法啟動檢查','車燈與電系檢查'] },
  }
  const faqAnswers: Record<string, string> = {
    '第一次來需要準備什麼？': '建議準備車輛基本資料、目前里程，以及想檢查或保養的項目。',
    '可以直接到店嗎？': '為避免現場等候，建議事先預約。\n\n若遇到臨時車況問題，可先使用「快速回報車況」，由技師協助初步判斷。',
    '維修需要多久？': '所需時間會依檢查結果與維修項目而定，確認項目後會提供預計完成時間。',
    '如何查看維修進度？': '可從下方 Rich Menu 點擊「查看維修進度」。首次查看個人資料時需要完成車主驗證。',
    '如何更改預約？': '預約確認後，可從 LINE 預約成功卡或預約詳情點擊「更改預約時間」。',
    '車子突然出現警示燈怎麼辦？': '若車況不明或擔心行車安全，請先安全停車，再使用快速回報車況或 LINE Call 聯絡技師。',
  }
  const openMenuItem = (target: Screen) => {
    if (target === 'call') { setShowCallHelp(true); return }
    if (target === 'line-services') { setInfoMode('menu'); setSelectedService(''); setSelectedFaq(''); return }
    if (target === 'line-faq') { sendMessage('真人客服'); return }
    if (['appointment-records','repair-status','repair-record'].includes(target)) { openPersonalFeature(target); return }
    go(target)
  }
  const submitMessage = () => { const message = input.trim(); if (!message) return; sendMessage(message); setInput('') }
  return <main className="line-room"><div className="line-native-bar"><button onClick={() => go('line-profile')}>←</button><b>LINE</b><span>聊天室</span></div><div className="line-chat-head"><span className="line-avatar">越</span><b>越群汽車官方帳號</b><button aria-label="LINE Call" onClick={() => go('call')}>☎</button></div><div className="chat hub-chat"><div className="bubble"><p>您好！👋<br />歡迎來到越群汽車！</p><p>想預約保養、查看維修進度，<br />或遇到車況問題，都可以從下方選單開始。</p><p>您傳送的訊息僅供越群服務人員查看，<br />請放心詢問。</p><p>💡 需要真人協助？輸入「找小編」<br />我們會於服務時間依序回覆您。</p></div>
    {showCallHelp && <div className="bubble technician-call-help"><p>需要技師協助查看車況嗎？<br />請點選聊天室右上角的通話圖案，即可與技師聯繫。</p><p>通話前請先將車輛停妥，行駛中請勿操作手機；若暫時無人接聽，也可以先將目前的狀況與照片傳送至聊天室。</p></div>}
    {messages.map((message, index) => <div className="bubble user-bubble" key={`${message}-${index}`}>{message}</div>)}
    {has('editor-request') && <div className="bubble"><b>【已收到您的需求】</b><p>正在為您轉接真人服務，<br />越群服務人員將於服務時間依序回覆您。</p></div>}
    {has('editor-reply') && <div className="bubble"><b>【越群小編】</b><p>您好，我是越群服務人員 👋<br />請問需要協助什麼呢？</p></div>}
    {infoMode === 'menu' && <div className="bubble info-reply"><b>【服務資訊】</b><p>請選擇你想了解的內容：</p><div className="chat-choice-list"><button onClick={() => setInfoMode('services')}>服務項目</button><button onClick={() => setInfoMode('faq')}>常見問題</button></div></div>}
    {infoMode === 'services' && <div className="bubble info-reply"><b>【越群汽車｜服務項目】</b><p>請選擇想了解的服務：</p><div className="chat-choice-list">{Object.keys(serviceDetails).map(label => <button key={label} onClick={() => setSelectedService(label)}>{label}</button>)}</div></div>}
    {selectedService && <><div className="bubble user-bubble">{selectedService.replace(/^[^ ]+ /, '')}</div><div className="bubble info-reply"><b>【{selectedService.replace(/^[^ ]+ /, '')}】</b><p>{serviceDetails[selectedService].text}</p><p>常見項目：<br />{serviceDetails[selectedService].items.map(item => `・${item}`).join('\n')}</p><p>不確定自己的狀況屬於哪一項？</p><button className="primary wide" onClick={() => go('report')}>快速回報車況</button><button className="secondary wide" onClick={() => sendMessage('找小編')}>找小編</button></div></>}
    {infoMode === 'faq' && <div className="bubble info-reply"><b>【常見問題】</b><p>請選擇想了解的問題：</p><div className="chat-choice-list">{Object.keys(faqAnswers).map(question => <button key={question} onClick={() => setSelectedFaq(question)}>{question}</button>)}</div></div>}
    {selectedFaq && <><div className="bubble user-bubble">{selectedFaq}</div><div className="bubble info-reply"><b>【{selectedFaq}】</b><p>{faqAnswers[selectedFaq]}</p>{selectedFaq === '可以直接到店嗎？' && <><button className="primary wide" onClick={() => go('appointment')}>線上預約進廠</button><button className="secondary wide" onClick={() => go('report')}>快速回報車況</button></>}{selectedFaq === '如何查看維修進度？' && <button className="primary wide" onClick={() => openPersonalFeature('repair-status')}>查看維修進度</button>}{selectedFaq === '如何更改預約？' && <button className="primary wide" onClick={() => openPersonalFeature('appointment-records')}>查看預約紀錄</button>}{selectedFaq === '車子突然出現警示燈怎麼辦？' && <><button className="primary wide" onClick={() => go('report')}>快速回報車況</button><button className="secondary wide" onClick={() => go('call')}>LINE Call 技師協助</button></>}</div></>}
    {has('report-received') && <div className="bubble"><b>車況回報已送出</b><p>已收到您的車況資訊與照片。<br />技師正在確認您提供的資訊，稍後會透過 LINE 提供初步建議。</p><span className="status-chip">技師確認中</span>{!has('assessment-ready') && <button className="prototype wide" onClick={assessmentReady}>Prototype：模擬技師完成評估</button>}</div>}
    {has('call-ended') && <><div className="system-message">LINE Call 已結束</div><div className="bubble">技師正在整理剛才確認的車況，稍後會透過 LINE 提供初步建議。<span className="status-chip">技師確認中</span>{!has('assessment-ready') && <button className="prototype wide" onClick={assessmentReady}>Prototype：模擬技師完成評估</button>}</div></>}
    {has('assessment-ready') && <div className="bubble"><b>【技師初步評估完成】</b><strong className="pickup">建議進廠檢查</strong><p>為確保行車安全，建議近期安排進廠檢查。</p><button className="primary wide" onClick={() => go('status-b')}>查看初步評估</button><button className="secondary wide" onClick={appointmentFromAssessment}>預約進廠檢查</button></div>}
    {has('appointment-pending') && <div className="bubble"><b>【預約申請已送出】</b><p>我們正在確認技師與現場排程，確認後會再透過 LINE 通知您。</p><span className="status-chip">處理中</span></div>}
    {has('appointment-confirmed') && !has('appointment-updated') && <div className="bubble"><b>【您的預約已確認】</b><span className="status-chip">預約成功</span><p>{formatDate(appointment.selectedDate)}<br />{appointment.selectedTime}<br />{appointment.serviceType}<br /><br />店家地址<br />台中市（Prototype 地址）</p><AppointmentActions go={go} openReschedule={openReschedule} canReschedule={canReschedule} /><button className="secondary wide" onClick={() => window.open('https://maps.google.com/?q=越群汽車','_blank','noopener,noreferrer')}>查看位置／開啟導航</button></div>}
    {has('appointment-change-request') && !has('appointment-updated') && !has('appointment-change-failed') && <div className="bubble"><b>【預約修改申請已送出】</b><p>原預約<br />{formatDate(appointmentBeforeChange.date)}<br />{appointmentBeforeChange.time}<br /><br />希望更改為<br />{formatDate(changeDraft.date)}<br />{changeDraft.time}<br /><br />我們正在確認技師與現場排程，確認完成前將為您保留原預約時間。</p><span className="status-chip">修改確認中</span></div>}
    {has('appointment-updated') && <div className="bubble"><b>【預約時間已更新】</b><p>原預約<br />{formatDate(appointmentBeforeChange.date)}<br />{appointmentBeforeChange.time}<br /><br />↓<br /><br />新預約<br />{formatDate(changeDraft.date)}<br />{changeDraft.time}<br /><br />店家地址<br />台中市（Prototype 地址）</p><span className="status-chip">預約成功</span><AppointmentActions go={go} openReschedule={openReschedule} canReschedule={canReschedule} /><button className="secondary wide" onClick={() => window.open('https://maps.google.com/?q=越群汽車','_blank','noopener,noreferrer')}>查看位置／開啟導航</button></div>}
    {has('appointment-change-failed') && <div className="bubble"><b>【預約時間修改未成立】</b><p>您希望更改的時段目前無法安排。<br /><br />原預約仍為：<br />{formatDate(appointmentBeforeChange.date)}<br />{appointmentBeforeChange.time}<br /><br />您的原預約不受影響。</p><button className="primary wide" onClick={openReschedule}>重新選擇時間</button></div>}
    {has('additional-found') && <div className="bubble"><b>【發現追加維修項目】</b><p>維修途中發現新的項目，需要您的確認。</p><button className="primary wide" onClick={() => go('additional-a1')}>查看新增項目</button></div>}
    {has('additional-confirmed') && <div className="bubble"><b>【追加維修確認結果】</b><p>已收到您的決定，維修方案與進度已同步更新。</p><button className="primary wide" onClick={() => go('repair-status')}>查看維修進度</button></div>}
    {has('repair-complete') && <div className="bubble"><b>【您的車輛已完成維修！】</b><strong className="pickup">可以取車了</strong><p>Toyota Corolla Cross<br />ABC-1234<br /><br />本次維修金額<br /><b>NT$3,800</b></p><span className="status-chip">已完成</span><button className="primary wide" onClick={() => go('repair-record')}>查看維修明細</button><button className="secondary wide" onClick={() => window.open('https://maps.google.com/?q=越群汽車','_blank','noopener,noreferrer')}>查看店家位置導航</button></div>}
  </div><section className="rich-menu">{groups.map(([title, items]) => <div className="rich-group" key={title}><h2>{title}</h2><div>{items.map(([label,target]) => <button key={label} onClick={() => openMenuItem(target)}>{label}</button>)}</div></div>)}</section><div className="line-input"><button aria-label="新增附件">＋</button><input aria-label="輸入訊息" value={input} onChange={event => setInput(event.target.value)} onKeyDown={event => { if (event.key === 'Enter') submitMessage() }} placeholder="輸入訊息" /><button aria-label="傳送訊息" onClick={submitMessage}>➤</button></div></main>
}
function Call({ end }: { end: () => void }) {
  const [connected, setConnected] = useState(false), [seconds, setSeconds] = useState(0), [muted, setMuted] = useState(false), [video, setVideo] = useState(false)
  useEffect(() => { const connect = window.setTimeout(() => setConnected(true), 1000); return () => clearTimeout(connect) }, [])
  useEffect(() => { if (!connected) return; const timer = window.setInterval(() => setSeconds(s => s + 1), 1000); return () => clearInterval(timer) }, [connected])
  return <Page title="與技師通話"><div className={video ? 'call-screen video' : 'call-screen'}>{video ? <><div className="vehicle-mock">車輛影像畫面</div><div className="avatar">技師</div></> : <div className="call-avatar">技</div>}<h2>{connected ? '與技師通話中' : '正在連線...'}</h2>{connected && <p className="timer">{formatTimer(seconds)}</p>}</div><div className="call-actions"><button aria-pressed={muted} onClick={() => setMuted(v => !v)}>{muted ? '取消靜音' : '靜音'}</button><button aria-pressed={video} onClick={() => setVideo(v => !v)}>{video ? '關閉視訊' : '視訊'}</button><button className="end" onClick={end}>結束</button></div></Page>
}
function CallFollowup({ go }: { go: (s: Screen) => void }) { const [ready, setReady] = useState(false); return <Page title="LINE 聊天室" back={() => go('chat')}><div className="line-chat-head"><span className="line-avatar">越</span><b>越群汽車官方帳號</b><span>LINE</span></div><div className="chat followup-chat"><div className="system-message">通話已結束</div><div className="bubble">技師正在整理剛才確認的車況，稍後會透過 LINE 提供初步建議。</div>{ready ? <div className="bubble"><b>已完成初步確認，請查看目前的車況建議。</b><button className="primary wide" onClick={() => go('status-b')}>查看初步評估</button></div> : <button className="prototype wide" onClick={() => setReady(true)}>模擬稍後收到訊息</button>}</div><div className="line-input"><button aria-label="新增附件">＋</button><span>輸入訊息</span><button aria-label="傳送訊息">➤</button></div></Page> }
function VehicleStatus({ type, appointment, go }: { type: 'A' | 'B' | 'C'; appointment: () => void; go: (s: Screen) => void }) {
  const content = type === 'A' ? { title: '無需立即維修', text: <>目前沒有明顯立即性問題，可以先持續觀察。<br /><br />如果出現新的異常，請再次聯絡我們。</> } : type === 'B' ? { title: '建議進廠檢查', text: <>為確保行車安全，建議近期安排進廠檢查。<br /><br />實際狀況仍需現場檢查為主。</> } : { title: '需要立即處理', text: <>此狀況可能影響行車安全。<br /><br />建議停止繼續行駛，並儘快安排技師協助。</> }
  return <Page title="車況初步評估"><div className={`status status-${type.toLowerCase()}`}><span className="status-mark">{type === 'A' ? '✓' : '!'}</span><h2>{content.title}</h2><p>{content.text}</p></div><div className="notice"><b>技師初步評估</b><span>此結果由技師根據您提供的資訊初步判斷，並非自動診斷；實際狀況仍以現場檢查為準。</span></div>{type === 'A' && <button className="primary wide" onClick={() => go('chat')}>回到 LINE</button>}{type === 'B' && <><button className="primary wide" onClick={appointment}>預約進廠檢查</button><button className="secondary wide" onClick={() => go('chat')}>LINE 繼續詢問</button></>}{type === 'C' && <button className="primary wide" onClick={() => go('call')}>聯絡技師</button>}</Page>
}

const repairPrices: Record<string, number> = { '前煞車來令片更換': 3200, '冷氣濾網更換': 600, '雨刷更換': 500 }
function FlowStepper({ current, labels }: { current: number; labels: string[] }) { return <div className="flow-stepper" style={{ gridTemplateColumns: `repeat(${labels.length},1fr)` }} aria-label={`步驟 ${current}，共 ${labels.length} 步`}>{labels.map((label, i) => <div key={label} className={current === i + 1 ? 'active' : current > i + 1 ? 'done' : ''}><span>{current > i + 1 ? '✓' : i + 1}</span><small>{label}</small></div>)}</div> }
function RepairFlow({ screen, items, setItems, go, notify }: { screen: Screen; items: string[]; setItems: (v: string[]) => void; go: (s: Screen) => void; notify: (event: TimelineEvent) => void }) {
  const total = items.reduce((sum, item) => sum + repairPrices[item], 0)
  const steps = ['檢查結果','方案費用','確認維修','收到確認','維修進行']
  if (screen === 'repair-r1') return <Page title="檢查結果"><FlowStepper current={1} labels={steps} /><Issue title="前煞車來令片磨損" urgency="建議近期處理" found="前煞車來令片已有明顯磨損。" reason="持續磨損可能影響煞車效果。" /><Issue title="冷氣濾網髒污" urgency="一般保養" found="濾網累積明顯灰塵與髒污。" reason="更換後有助於維持車內空氣流通。" /><button className="primary wide" onClick={() => go('repair-r2')}>下一步：方案與費用</button></Page>
  if (screen === 'repair-r2') { const toggle = (item: string) => setItems(items.includes(item) ? items.filter(x => x !== item) : [...items, item]); return <Page title="方案與費用" back={() => go('repair-r1')}><FlowStepper current={2} labels={steps} /><Section title="選擇本次維修項目"><div className="repair-options">{Object.entries(repairPrices).map(([item, price]) => <label key={item} className={items.includes(item) ? 'repair-option selected' : 'repair-option'}><input type="checkbox" checked={items.includes(item)} onChange={() => toggle(item)} /><span><b>{item}</b><small>{item === '前煞車來令片更換' ? '更換磨損零件，恢復正常煞車狀態。' : item === '冷氣濾網更換' ? '更換髒污濾網，維持空調循環。' : '更換老化雨刷。'}</small></span><strong>{money(price)}</strong></label>)}</div></Section><div className="cost-summary"><span>已選擇 {items.length} 項</span><b>預估總金額<strong>{money(total)}</strong></b><span>預計完成<br />8/20 17:00 前</span></div><button className="primary wide" disabled={!items.length} onClick={() => go('repair-r3')}>下一步：確認維修</button><button className="secondary wide" onClick={() => go('repair-r4')}>本次暫不維修</button></Page> }
  if (screen === 'repair-r3') return <Page title="確認維修" back={() => go('repair-r2')}><FlowStepper current={3} labels={steps} /><RepairItems items={items} /><Summary title="維修摘要" rows={[['預估總金額', money(total)],['預計完成','8/20 17:00 前']]} /><div className="notice"><b>重要說明</b><span>若維修過程發現其他問題，或需要增加維修項目與費用，會再次取得您的同意。未經同意，不會直接追加維修。</span></div><button className="primary wide" onClick={() => go('repair-r4')}>確認並同意維修</button><button className="secondary wide" onClick={() => go('repair-r2')}>返回修改</button></Page>
  if (screen === 'repair-r4') return <Page title="已收到您的維修確認"><FlowStepper current={4} labels={steps} /><ResultIcon /><RepairItems items={items} /><Summary title="確認摘要" rows={[['預估總金額', money(total)],['預計完成時間','8/20 17:00 前']]} /><div className="notice"><b>後續通知</b><span>若出現新增項目，會再次與您確認。</span></div><button className="primary wide" onClick={() => go('repair-r5')}>查看維修進度</button></Page>
  return <Page title="維修進行中"><FlowStepper current={5} labels={steps} /><RepairItems items={items} /><Summary title="目前狀態" rows={[['預估總金額', money(total)],['預計完成時間','8/20 17:00 前']]} /><button className="primary wide" onClick={() => go('chat')}>回 LINE 聯絡越群</button><button className="prototype wide" onClick={() => notify('additional-found')}>Prototype：模擬發現新增項目</button><button className="prototype wide" onClick={() => notify('repair-complete')}>Prototype：模擬維修完成</button></Page>
}
function Issue({ title, urgency, found, reason, impact }: { title: string; urgency: string; found: string; reason: string; impact?: string }) { return <article className="issue"><span className="tag">{urgency}</span><h2>{title}</h2><h3>發現什麼？</h3><p>{found}</p><h3>目前狀況</h3><p>{urgency === '建議近期處理' ? '短時間內仍可行駛，但建議近期安排處理。' : '目前不影響基本行駛，可配合保養處理。'}</p><h3>建議怎麼處理？</h3><p>{reason}</p>{impact && <><h3>可能造成什麼影響？</h3><p>{impact}</p></>}<RepairPhoto label="技師檢查照片" /></article> }
function RepairItems({ items, additional = false }: { items: string[]; additional?: boolean }) { return <section className="repair-items"><h2>{additional ? '更新後維修項目' : '本次確認項目'}</h2>{items.map(item => <div key={item}><span>{item}</span><b>{money(repairPrices[item] ?? 1800)}</b></div>)}</section> }

function AdditionalRepair({ screen, approved, setApproved, go, notify }: { screen: Screen; approved: boolean; setApproved: (v: boolean) => void; go: (s: Screen) => void; notify: (event: TimelineEvent) => void }) {
  const steps = ['發現問題','追加內容','確認','收到確認','維修進行']
  if (screen === 'additional-a1') return <Page title="有新的維修項目需要確認"><FlowStepper current={1} labels={steps} /><Summary title="原本已確認維修" rows={[['維修項目','前煞車來令片更換、冷氣濾網更換'],['原確認金額','NT$3,800']]} /><Section title="維修途中發現新的問題"><Issue title="下護板固定扣損壞" urgency="新增問題" found="檢查時發現下護板固定扣已損壞。" reason="需要重新固定下護板，避免鬆動持續擴大。" impact="可能造成行駛時異音、護板鬆動或與其他部件摩擦。" /></Section><button className="primary wide" onClick={() => go('additional-a2')}>查看新增項目</button></Page>
  if (screen === 'additional-a2') return <Page title="新增項目與費用" back={() => go('additional-a1')}><FlowStepper current={2} labels={steps} /><Summary title="新增維修項目" rows={[['項目','下護板固定扣更換'],['為什麼需要處理','固定扣損壞，需重新固定下護板。'],['追加費用','NT$1,800']]} /><RepairPhoto label="異常零件照片" /><div className="cost-summary"><span>原確認金額　NT$3,800</span><span>新增費用　＋NT$1,800</span><b>更新後總額<strong>NT$5,600</strong></b><span>更新後預計完成<br />8/20 18:00 前</span></div><button className="primary wide" onClick={() => go('additional-a3')}>下一步：確認追加</button><button className="secondary wide" onClick={() => { setApproved(false); go('additional-a4') }}>本次暫不處理</button></Page>
  if (screen === 'additional-a3') return <Page title="確認追加維修" back={() => go('additional-a2')}><FlowStepper current={3} labels={steps} /><Summary title="確認內容" rows={[['原確認項目','前煞車來令片更換、冷氣濾網更換'],['新增項目','下護板固定扣更換'],['原確認金額','NT$3,800'],['追加','NT$1,800'],['更新後總額','NT$5,600'],['時間影響','更新為 8/20 18:00 前']]} /><div className="notice"><b>重要說明</b><span>本次確認只包含以上追加項目與費用。若後續再發現其他問題，仍會再次取得您的同意。未經同意，不會自行增加維修項目或費用。</span></div><button className="primary wide" onClick={() => { setApproved(true); go('additional-a4') }}>同意追加維修</button><button className="secondary wide" onClick={() => { setApproved(false); go('additional-a4') }}>本次暫不處理</button></Page>
  if (screen === 'additional-a4') return <Page title={approved ? '已收到您的確認' : '已收到您的決定'}><FlowStepper current={4} labels={steps} /><ResultIcon /><p className="result-message">{approved ? '維修方案已更新。' : '本次不處理新增項目，原本已確認的維修項目會繼續進行。'}</p>{approved ? <><RepairItems additional items={['前煞車來令片更換','冷氣濾網更換','下護板固定扣更換']} /><Summary title="更新摘要" rows={[['追加費用','NT$1,800'],['更新後總額','NT$5,600'],['更新後預計完成時間','8/20 18:00 前']]} /></> : <Summary title="原維修方案" rows={[['原本總額','NT$3,800'],['原預計完成','8/20 17:00 前']]} />}<button className="primary wide" onClick={() => go('additional-a5')}>查看維修進度</button></Page>
  return <Page title="維修進行中"><FlowStepper current={5} labels={steps} /><Summary title="目前維修方案" rows={[['✓ 原維修項目','前煞車來令片更換'],['✓ 原維修項目　','冷氣濾網更換'],['✓ 追加維修項目',approved ? '下護板固定扣更換' : '本次未追加，維持原本方案'],['目前總額',approved ? 'NT$5,600' : 'NT$3,800'],['預計完成時間',approved ? '8/20 18:00 前' : '8/20 17:00 前']]} /><button className="primary wide" onClick={() => notify('additional-confirmed')}>回 LINE 查看確認結果</button><button className="prototype wide" onClick={() => notify('repair-complete')}>Prototype：模擬維修完成</button></Page>
}

function AdditionalNotification({ go }: { go: (s: Screen) => void }) { return <Page title="LINE 通知" back={() => go('repair-r5')}><div className="line-chat-head"><span className="line-avatar">越</span><b>越群汽車官方帳號</b><span>LINE</span></div><div className="chat additional-chat"><div className="bubble"><b>維修途中發現新的項目，需要您的確認。</b><br /><br />Toyota Corolla Cross<br />ABC-1234<br /><button className="primary wide" onClick={() => go('additional-a1')}>查看新增項目</button></div></div></Page> }

function RepairStatus({ go }: { go: (s: Screen) => void }) { return <Page title="維修進度" back={() => go('chat')}><Summary title="車輛" rows={[['車型','Toyota Corolla Cross'],['車牌','ABC-1234']]} /><span className="status-chip">待報價確認</span><Summary title="目前狀態" rows={[['車現在在做什麼','檢查已完成，技師已整理建議維修項目與費用。'],['你現在需要做什麼','查看檢查結果，確認是否進行維修。']]} /><RepairPhoto label="維修進度照片" /><button className="primary wide" onClick={() => go('repair-presence')}>查看檢查結果</button><button className="secondary wide" onClick={() => go('chat')}>回 LINE 聯絡越群</button></Page> }
function RepairPresence({ go }: { go: (s: Screen) => void }) { return <Page title="車主是否在現場？" back={() => go('repair-status')}><p className="lead">選擇目前情境，Prototype 將顯示對應的確認方式。</p><button className="option" onClick={() => go('repair-r5')}><b>車主在現場</b><span>由技師當面說明、確認報價，並同步數位維修紀錄。</span><em>現場確認 →</em></button><button className="option" onClick={() => go('repair-r1')}><b>車主不在現場</b><span>透過 LINE 開啟 LIFF，查看檢查結果並確認維修。</span><em>進入線上確認 →</em></button></Page> }
function RepairComplete({ go }: { go: (s: Screen) => void }) { return <Page title="LINE 完工通知" back={() => go('home')}><div className="line-chat-head"><span className="line-avatar">越</span><b>越群汽車官方帳號</b><span>LINE</span></div><div className="chat complete-chat"><div className="bubble"><b>您的車輛已完成維修！</b><strong className="pickup">可以取車了</strong>Toyota Corolla Cross<br />ABC-1234<br /><br />本次維修金額<br /><b>NT$3,800</b></div></div><button className="primary wide" onClick={() => go('repair-record')}>查看維修明細</button><button className="secondary wide" onClick={() => window.open('https://maps.google.com/?q=越群汽車','_blank','noopener,noreferrer')}>查看店家位置與導航</button></Page> }
function RepairRecord({ go }: { go: (s: Screen) => void }) { return <Page title="本次維修紀錄" back={() => go('chat')}><RepairItems items={['前煞車來令片更換','冷氣濾網更換']} /><Summary title="維修摘要" rows={[['本次總額','NT$3,800'],['完成日期','2026 / 08 / 20'],['維修狀態','已完成'],['技師備註','已完成更換與基本檢查，交車時將再次說明。']]} /><div className="before-after"><RepairPhoto label="維修前照片" /><RepairPhoto label="維修後照片" /></div><button className="primary wide" onClick={() => go('chat')}>完成／返回 LINE</button></Page> }
function RepairPhoto({ label }: { label: string }) { const [open, setOpen] = useState(false); return <><button className="repair-photo" onClick={() => setOpen(true)} aria-label={`放大查看${label}`}><span>{label}</span><small>點擊查看大圖</small></button>{open && <div className="photo-preview" role="dialog" aria-modal="true" aria-label={`${label}大圖預覽`}><button className="photo-close" onClick={() => setOpen(false)} aria-label="關閉大圖">×</button><div className="photo-large">{label}<small>維修細節大圖預覽</small></div></div>}</> }
function money(value: number) { return `NT$${value.toLocaleString('en-US')}` }
function Section({ n, title, children, reveal }: { n?: string; title: string; children: ReactNode; reveal?: boolean }) { return <section className={reveal ? 'reveal' : ''}><div className="section-title">{n && <span>{n}</span>}<h2>{title}</h2></div>{children}</section> }
function Field({ label, required, value, onChange, placeholder, textarea, type = 'text' }: { label: string; required?: boolean; value: string; onChange: (v: string) => void; placeholder?: string; textarea?: boolean; type?: string }) { return <label className="field"><span>{label}{required && <em> *</em>}</span>{textarea ? <textarea value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} rows={4} /> : <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} />}</label> }
function Summary({ title, rows }: { title: string; rows: [string, string][] }) { return <section className="summary"><h2>{title}</h2><dl>{rows.map(([key, val]) => <div key={key}><dt>{key}</dt><dd>{val}</dd></div>)}</dl></section> }
function ResultIcon() { return <div className="result-icon" aria-hidden="true">✓</div> }
function DemoMenu({ jump, reset, resetLinked }: { jump: (s: Screen) => void; reset: () => void; resetLinked: () => void }) { const items: [string, Screen][] = [['Website Home','home'],['LINE Hub','chat'],['Vehicle Report 1','report'],['Vehicle Report 2','upload'],['Vehicle Report 3','report-review'],['Vehicle Report 4','report-submitted'],['Appointment','appointment'],['Appointment Review','appointment-review'],['Appointment Pending','appointment-submitted'],['Appointment Records','appointment-records'],['Appointment Detail','appointment-detail'],['Appointment Change','appointment-change'],['Repair Presence','repair-presence'],['Repair R1','repair-r1'],['Repair R2','repair-r2'],['Repair R3','repair-r3'],['Repair R4','repair-r4'],['Repair R5','repair-r5'],['Additional A1','additional-a1'],['Additional A2','additional-a2'],['Additional A3','additional-a3'],['Additional A4','additional-a4'],['Additional A5','additional-a5'],['Repair Record','repair-record']]; return <aside className="demo-menu" aria-label="Prototype 測試選單"><b>Prototype 測試跳轉</b>{items.map(([label, screen]) => <button key={screen} onClick={() => jump(screen)}>{label}</button>)}<button onClick={resetLinked}>重設為未綁定使用者</button><button onClick={reset}>Reset Demo</button></aside> }
function formatDate(value: string) { if (!value) return '尚未選擇'; const d = new Date(`${value}T12:00:00`); return `2026 年 8 月 ${d.getDate()} 日（${weekdays[d.getDay()]}）` }
function slashDate(value: string) { return value.split('-').join('/') }
function formatTimer(seconds: number) { return `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}` }

export default App
