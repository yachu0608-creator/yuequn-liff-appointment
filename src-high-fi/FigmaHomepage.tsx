import { useEffect, useRef, useState } from 'react'
import './figma-homepage-v2.css'

const asset = (name: string) => `/figma-homepage/${name}`
const navItems = [['服務項目','services'],['維修流程','values'],['技師團隊','team'],['維修案例','reviews'],['聯絡我們','contact']]
const services = [
  { title:'定期保養', detail:'更換機油／全車檢查／延長愛車壽命' }, { title:'引擎系統', detail:'引擎診斷／動力檢測／解決異常抖動問題' },
  { title:'底盤系統', detail:'避震器／支柱／平衡桿／行車更穩定安全' }, { title:'冷氣系統', detail:'冷氣維修／冷媒充填／清涼舒適不悶熱' },
  { title:'電機系統', detail:'電池／啟動／充電檢查／啟動順暢不耗電' },
]
const values = [['專業技師','經驗豐富、專業診斷，提供可靠維修建議。'],['透明報價','項目與費用明確，不亂加價、不強銷。'],['貼心溝通','耐心解說維修內容，讓車主理解每次處理。'],['誠信保固','維修後提供保固服務，後續用車更安心。']]
const technicians = [
  { photo:'mechanic-2.jpg', name:'王志銘', english:'Michael Wang', years:'12年經驗', skill:'引擎系統診斷／底盤維修與調校' },
  { photo:'mechanic-1.jpg', name:'王志銘', english:'Michael Wang', years:'12年經驗', skill:'引擎系統診斷／底盤維修與調校' },
  { photo:'mechanic-3.jpg', name:'王志銘', english:'Michael Wang', years:'12年經驗', skill:'引擎系統診斷／底盤維修與調校' },
]
const reviews = [['王先生 / 台中市','老闆經驗豐富，是大廠出來的專業維修師，我們家過保固期限的車，都會專程開回來保養維修。'],['林小姐 / 台中市','保養前會清楚說明項目與價格，維修過程讓人放心，交車時也會提醒後續注意事項。'],['陳先生 / 彰化縣','技師很有耐心，問題說明得很清楚，不會讓車主花不必要的錢。']]

function Controls({ label,index,count,onChange }: { label:string;index:number;count:number;onChange:(value:number)=>void }) {
  const move=(step:number)=>onChange((index+step+count)%count)
  return <div className="fh-carousel-controls"><div className="fh-arrows"><button aria-label={`${label}上一項`} onClick={()=>move(-1)}>‹</button><button aria-label={`${label}下一項`} onClick={()=>move(1)}>›</button></div><div className="fh-dots" aria-label={`${label}，第 ${index+1} 項，共 ${count} 項`}>{Array.from({length:count},(_,i)=><button key={i} className={i===index?'active':''} aria-label={`顯示第 ${i+1} 項`} aria-current={i===index?'true':undefined} onClick={()=>onChange(i)} />)}</div></div>
}

export default function FigmaHomepage() {
  const [serviceIndex,setServiceIndex]=useState(0), [teamIndex,setTeamIndex]=useState(1), [reviewIndex,setReviewIndex]=useState(0)
  const [menuOpen,setMenuOpen]=useState(false), [activeSection,setActiveSection]=useState('services')
  const reviewTrack=useRef<HTMLDivElement>(null)
  const scrollTo=(id:string)=>{setMenuOpen(false);document.getElementById(id)?.scrollIntoView({behavior:'smooth'})}
  useEffect(()=>{const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting)setActiveSection(entry.target.id)}),{rootMargin:'-30% 0px -60%'});navItems.forEach(([,id])=>{const node=document.getElementById(id);if(node)observer.observe(node)});return()=>observer.disconnect()},[])
  useEffect(()=>{if(window.matchMedia('(prefers-reduced-motion: reduce)').matches)return;const timer=window.setInterval(()=>setReviewIndex(value=>(value+1)%reviews.length),6500);return()=>window.clearInterval(timer)},[])
  useEffect(()=>{reviewTrack.current?.querySelector<HTMLElement>(`[data-review="${reviewIndex}"]`)?.scrollIntoView({behavior:'smooth',block:'nearest',inline:'center'})},[reviewIndex])
  const currentService=services[serviceIndex]
  return <div className="figma-homepage">
    <header className="fh-nav"><a className="fh-logo" href="#top" aria-label="越群汽車首頁"><img src={asset('logo.svg')} alt="越群汽車修配廠" /></a><button className="fh-menu-toggle" aria-label="開啟導覽選單" aria-expanded={menuOpen} onClick={()=>setMenuOpen(v=>!v)}><span /><span /></button><nav className={menuOpen?'open':''} aria-label="主要導覽">{navItems.map(([label,id])=><button className={activeSection===id?'active':''} aria-current={activeSection===id?'page':undefined} key={id} onClick={()=>scrollTo(id)}>{label}</button>)}</nav><a className="fh-cta" href="https://line.me/" target="_blank" rel="noreferrer"><img src={asset('line.svg')} alt="" />LINE 線上諮詢</a></header>
    <main id="top">
      <section className="fh-hero"><div className="fh-hero-copy"><h1>專業細節，<br />維修更<span>放心</span>。</h1><p>從檢查、保養到維修，每一個環節都以<br />專業技術與清楚說明，提供值得信賴的服務。</p><a className="fh-cta" href="https://line.me/" target="_blank" rel="noreferrer"><img src={asset('line.svg')} alt="" />LINE 線上預約</a><div className="fh-hero-lines"><i /><i /></div></div><img className="fh-hero-image" src={asset('hero.png')} alt="越群技師檢查車輛引擎" /><div className="fh-since">SINCE<br />2001</div></section>
      <section className="fh-services" id="services"><div className="fh-section-intro"><small>OUR SERVICES</small><h2>越群服務項目</h2><div className="fh-service-tabs" role="tablist" aria-label="服務項目">{services.map(({title},i)=><button role="tab" aria-selected={i===serviceIndex} className={i===serviceIndex?'active':''} key={title} onClick={()=>setServiceIndex(i)}>{title}</button>)}</div><Controls label="服務項目" index={serviceIndex} count={services.length} onChange={setServiceIndex} /></div><article className="fh-service-feature" key={currentService.title}><img src={asset('service.png')} alt={`技師進行${currentService.title}`} /><div><img className="fh-round-icon" src={asset('service-icon.svg')} alt="" /><h3>{currentService.title}</h3><b>Regular Maintenance</b><p>{currentService.detail}</p></div></article></section>
      <section className="fh-values" id="values"><div className="fh-section-intro"><small>DON'T WASTE</small><h2>錢別白花了。</h2><p>修什麼、為什麼修、多少錢，<br />說清楚了再決定。</p></div><div className="fh-value-grid">{values.map(([title,text],i)=><article style={{'--i':i} as React.CSSProperties} key={title}><img src={asset(`value-${i+1}.svg`)} alt="" /><h3>{title}</h3><p>{text}</p></article>)}</div></section>
      <section className="fh-team" id="team"><div className="fh-team-copy"><small>OUR TEAM</small><h2>專業技師團隊</h2><p>修什麼、為什麼修、多少錢，說清楚了再決定。</p><Controls label="技師團隊" index={teamIndex} count={technicians.length} onChange={setTeamIndex} /></div><div className="fh-team-cards">{technicians.map((tech,i)=><article className={i===teamIndex?'active':''} aria-current={i===teamIndex?'true':undefined} key={`${tech.name}-${i}`} onClick={()=>setTeamIndex(i)}><img src={asset(tech.photo)} alt={`${tech.name}技師`} /><div><h3>{tech.name}</h3><small>{tech.english}</small><b>{tech.years}</b><p>{tech.skill}</p></div></article>)}</div></section>
      <section className="fh-reviews" id="reviews"><div className="fh-reviews-head"><div><small>CUSTOMER REVIEWS</small><h2>車主安心推薦</h2></div><Controls label="車主推薦" index={reviewIndex} count={reviews.length} onChange={setReviewIndex} /></div><div className="fh-review-track" ref={reviewTrack}>{reviews.map(([name,text],i)=><article data-review={i} className={i===reviewIndex?'active':''} key={name}><div className="fh-review-rating"><span>“</span><b aria-label="5 星評價">★★★★★</b><em>5.0</em></div><p>{text}</p><footer><img src={asset('customer.png')} alt="" />{name}</footer></article>)}</div></section>
      <section className="fh-contact" id="contact"><div><small>CONTACT US</small><h2>聯絡我們</h2><address><span>04-2532-3838</span><span>週一～週六 08:30–17:30</span><span>臺中市潭子區栗林里中山路三段826號</span></address><a className="fh-cta" href="https://line.me/" target="_blank" rel="noreferrer"><img src={asset('line.svg')} alt="" />LINE 線上預約</a></div><div className="fh-contact-media"><img src={asset('map.png')} alt="越群汽車修配廠位置地圖" /></div></section>
    </main>
    <footer className="fh-footer"><img src={asset('logo-white.svg')} alt="越群汽車修配廠" /><nav>{navItems.map(([label,id])=><a key={id} href={`#${id}`}>{label}</a>)}</nav><small>©2025越群汽車修配廠 All Rights Reserved</small><a className="fh-top" href="#top" aria-label="回到頁首">↑</a></footer>
  </div>
}
