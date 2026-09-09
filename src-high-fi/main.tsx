import { StrictMode, useEffect } from 'react'
import { createRoot } from 'react-dom/client'
import App from '../src/App'
import { initializeLiff } from '../src/liff'
import '../src/styles.css'
import './high-fi.css'

const iconPaths: Record<string, string> = {
  '快速回報車況': '<path d="M4 15l2-6h12l2 6M5 15h14v5H5zM8 20v2m8-2v2M8 12h8"/><path class="accent" d="M18 3v5m0 3h.01"/>',
  'LINE Call 技師協助': '<path d="M7 11a5 5 0 0110 0v6M5 12h3v6H5zm11 0h3v6h-3zM16 19c0 2-2 3-4 3"/>',
  '線上預約進廠': '<rect x="4" y="5" width="16" height="15" rx="2"/><path d="M8 3v4m8-4v4M4 10h16M8 14h3v3H8z"/>',
  '查看預約紀錄': '<path d="M7 3h10v4h3v14H4V7h3zM8 12h8m-8 4h6"/><path class="accent" d="M9 3h6v4H9z"/>',
  '查看維修進度': '<circle cx="12" cy="12" r="8"/><path d="M12 8v5l3 2"/><path class="accent" d="M4 6l2 2m12-2l-2 2"/>',
  '查看維修紀錄': '<path d="M8 4h8l2 3v14H6V7zM9 11h6m-6 4h6"/><path class="accent" d="M10 4v3h4V4"/>',
  '服務資訊': '<circle cx="12" cy="12" r="9"/><path d="M12 11v6m0-10h.01"/>',
  '真人客服': '<path d="M5 12a7 7 0 0114 0v5h-3v-5M5 12v5h3v-5M9 20h5"/><path class="accent" d="M9 9a4 4 0 016 0"/>',
  '定期保養': '<path d="M7 4v5m10-5v5M5 8h14v12H5zM8 13h8"/>',
  '引擎系統': '<path d="M5 9h3l2-3h6l2 3h2v9H5zM2 11h3m15 1h2M9 12h6v3H9z"/>',
  '底盤系統': '<path d="M4 15h16M6 11h12l2 4H4zM7 18h.01M17 18h.01"/>',
  '冷氣系統': '<path d="M12 3v18M4.2 7.5l15.6 9M4.2 16.5l15.6-9M9 5l3 3 3-3M9 19l3-3 3 3"/>',
  '電機系統': '<path d="M13 2L6 13h6l-1 9 7-12h-6z"/>',
}

void initializeLiff()

function iconSvg(label: string) {
  return `<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${iconPaths[label] ?? iconPaths['服務資訊']}</svg>`
}

function HighFiApp() {
  useEffect(() => {
    document.body.classList.add('high-fi')
    const applyHighFiPresentation = () => {
      const welcome = document.querySelector<HTMLElement>('.hub-chat > .bubble:first-child')
      if (welcome && !welcome.dataset.highFiWelcome) {
        welcome.dataset.highFiWelcome = 'true'
        welcome.innerHTML = '<p>您好！👋<br>歡迎來到越群汽車！</p><p>想預約保養、查看維修進度，<br>或遇到車況問題，都可以從下方選單開始。</p><p>若需要進一步協助，也可以直接點選「真人客服」與服務人員聯繫。</p>'
      }

      const legacySupportLabel = String.fromCharCode(25214, 23567, 32232)
      document.querySelectorAll<HTMLElement>('.info-reply button, .user-bubble').forEach((element) => {
        if (element.textContent?.trim() === legacySupportLabel) element.textContent = '真人客服'
      })

      document.querySelectorAll<HTMLElement>('.info-reply').forEach((bubble) => {
        const heading = bubble.querySelector('b')?.textContent ?? ''
        if (heading.includes('【服務資訊】')) bubble.classList.add('hf-info-menu')
        if (heading.includes('【常見問題】')) bubble.classList.add('hf-faq-menu')
        if (heading.includes('【越群汽車｜服務項目】')) {
          bubble.classList.add('hf-services-menu')
          bubble.querySelectorAll<HTMLButtonElement>('.chat-choice-list button').forEach((button) => {
            if (button.dataset.highFiLabel) return
            button.dataset.highFiLabel = 'true'
            button.textContent = button.textContent?.replace(/^[^\p{L}\p{N}]+/u, '').trim() ?? ''
          })
        }
      })

      document.querySelectorAll<HTMLElement>('.bubble').forEach((bubble) => {
        if (!bubble.textContent?.includes('您的車輛已完成維修')) return
        bubble.classList.add('hf-complete-card')
        if (!bubble.querySelector('.hf-completion-note')) {
          const note = document.createElement('p')
          note.className = 'hf-completion-note'
          note.textContent = '車輛已完成本次維修，您可於營業時間內前往取車。'
          bubble.querySelector('.pickup')?.insertAdjacentElement('afterend', note)
        }
      })

      const heroPlaceholder = document.querySelector<HTMLElement>('.website .hero > .image-placeholder')
      if (heroPlaceholder && !heroPlaceholder.dataset.highFiHero) {
        heroPlaceholder.dataset.highFiHero = 'true'
        heroPlaceholder.innerHTML = '<img src="/high-fi-assets/workshop-hero.png" srcset="/high-fi-assets/workshop-hero.png 1680w" sizes="(max-width: 767px) 100vw, (max-width: 1199px) 55vw, 720px" alt="越群技師站在車外右側，正在維修廠檢查車輛引擎" width="1680" height="945">'
      }

      const websiteHeader = document.querySelector<HTMLElement>('.website-header')
      if (websiteHeader && !websiteHeader.querySelector('.high-fi-nav')) {
        const brand = websiteHeader.querySelector<HTMLElement>('b')
        if (brand) brand.innerHTML = `${iconSvg('引擎系統')}<span>越群汽車修配廠</span>`
        const nav = document.createElement('nav')
        nav.className = 'high-fi-nav'
        nav.setAttribute('aria-label', '主要導覽')
        nav.innerHTML = '<a class="active" aria-current="page" href="#top">首頁</a><a href="#services">服務項目</a><a href="#team">技師團隊</a><a href="#reviews">顧客評價</a><a href="#contact">聯絡我們</a>'
        nav.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => {
          nav.querySelectorAll('a').forEach((item) => { item.classList.remove('active'); item.removeAttribute('aria-current') })
          link.classList.add('active')
          link.setAttribute('aria-current', 'page')
        }))
        websiteHeader.insertBefore(nav, websiteHeader.lastElementChild)
        const headerCta = document.createElement('button')
        headerCta.className = 'high-fi-header-cta'
        headerCta.textContent = 'LINE 車況協助'
        headerCta.addEventListener('click', () => document.querySelector<HTMLButtonElement>('.hero > .primary')?.click())
        websiteHeader.appendChild(headerCta)
      }

      document.querySelectorAll<HTMLElement>('#services .carousel-card').forEach((card) => {
        const label = card.querySelector('h3')?.textContent?.trim() ?? ''
        const visual = card.querySelector<HTMLElement>('.image-placeholder')
        if (visual && !visual.dataset.highFiIcon) { visual.dataset.highFiIcon = 'true'; visual.innerHTML = `<span class="hf-service-icon">${iconSvg(label)}</span>` }
      })

      const principle = document.querySelector<HTMLElement>('.principle')
      if (principle && !principle.dataset.highFiPrinciple) {
        principle.dataset.highFiPrinciple = 'true'
        const descriptions: Record<string,string> = { '專業技師':'依車況提供專業檢查與處理建議。', '透明報價':'確認項目與費用後才開始維修。', '清楚說明':'用一般車主能理解的方式說明。', '維修後持續服務':'留下完整紀錄，持續掌握車況。' }
        principle.querySelectorAll<HTMLElement>('.why-grid span').forEach((item) => {
          const label = item.textContent?.replace('✓','').trim() ?? ''
          item.innerHTML = `<i>${iconSvg(label === '透明報價' ? '查看預約紀錄' : label === '清楚說明' ? '服務資訊' : label === '維修後持續服務' ? '查看維修紀錄' : '真人客服')}</i><strong>${label}</strong><small>${descriptions[label]}</small>`
        })
      }

      document.querySelectorAll<HTMLElement>('#team .carousel-card').forEach((card, index) => {
        const visual = card.querySelector<HTMLElement>('.image-placeholder')
        if (visual && !visual.dataset.highFiPhoto) {
          visual.dataset.highFiPhoto = 'true'
          visual.innerHTML = `<img src="/high-fi-assets/technician-team.png" alt="${card.querySelector('h3')?.textContent ?? '越群技師'}工作照" style="object-position:${[16,50,84][index]}% center">`
        }
      })

      document.querySelectorAll<HTMLElement>('.carousel-section').forEach((section) => {
        if (section.querySelector('.hf-carousel-dots')) return
        const cards = section.querySelectorAll('.carousel-card')
        const controls = section.querySelector('.carousel-heading > div')
        if (!controls || cards.length < 2) return
        const dots = document.createElement('span')
        dots.className = 'hf-carousel-dots'
        dots.setAttribute('aria-hidden', 'true')
        dots.innerHTML = Array.from(cards, (_, index) => `<i class="${index === 0 ? 'active' : ''}"></i>`).join('')
        controls.appendChild(dots)
        const track = section.querySelector<HTMLElement>('.carousel-track')
        track?.addEventListener('scroll', () => {
          const firstCard = track.querySelector<HTMLElement>('.carousel-card')
          const step = firstCard ? firstCard.offsetWidth + 18 : track.clientWidth
          const active = Math.min(cards.length - 1, Math.max(0, Math.round(track.scrollLeft / step)))
          dots.querySelectorAll('i').forEach((dot, index) => dot.classList.toggle('active', index === active))
        }, { passive: true })
      })

      const reviews = document.querySelector<HTMLElement>('#reviews')
      if (reviews && !reviews.querySelector('.hf-review-track')) {
        const cards = Array.from(reviews.querySelectorAll<HTMLElement>(':scope > .review'))
        if (cards.length) {
          const track = document.createElement('div')
          track.className = 'hf-review-track'
          cards.forEach((card) => track.appendChild(card))
          reviews.appendChild(track)
          const controls = document.createElement('div')
          controls.className = 'hf-review-controls'
          controls.innerHTML = '<button type="button" aria-label="顧客評價上一張">←</button><button type="button" aria-label="顧客評價下一張">→</button><span class="hf-carousel-dots" aria-hidden="true"><i class="active"></i><i></i><i></i></span>'
          reviews.querySelector('.section-title')?.appendChild(controls)
          controls.querySelector<HTMLButtonElement>('button:first-child')?.addEventListener('click', () => track.scrollBy({ left: -track.clientWidth * .8, behavior: 'smooth' }))
          controls.querySelector<HTMLButtonElement>('button:nth-child(2)')?.addEventListener('click', () => track.scrollBy({ left: track.clientWidth * .8, behavior: 'smooth' }))
          track.addEventListener('scroll', () => {
            const firstCard = track.querySelector<HTMLElement>('.review')
            const step = firstCard ? firstCard.offsetWidth + 18 : track.clientWidth
            const active = Math.min(cards.length - 1, Math.max(0, Math.round(track.scrollLeft / step)))
            controls.querySelectorAll('.hf-carousel-dots i').forEach((dot, index) => dot.classList.toggle('active', index === active))
          }, { passive: true })
        }
      }

      document.querySelectorAll<HTMLElement>('#reviews .review').forEach((review, index) => {
        if (review.querySelector('.hf-review-head')) return
        const name = review.querySelector('small')?.textContent ?? '越群車主'
        const head = document.createElement('div')
        head.className = 'hf-review-head'
        head.innerHTML = `<img src="/high-fi-assets/customer-owners.png" alt="${name}" style="object-position:${[16,50,84][index]}% center"><span><b>${name}</b><em aria-label="5 星評價">★★★★★</em></span>`
        review.insertBefore(head, review.firstChild)
        Array.from(review.childNodes).filter((node) => node.nodeType === Node.TEXT_NODE).forEach((node) => node.remove())
        review.querySelector('small')?.remove()
      })

      const contact = document.querySelector<HTMLElement>('#contact')
      if (contact && !contact.querySelector('.hf-shop-photo')) {
        const photo = document.createElement('figure')
        photo.className = 'hf-shop-photo'
        photo.innerHTML = '<img src="/high-fi-assets/shop-exterior.png" alt="越群汽車修配廠街邊店面與開放式維修工位"><figcaption>越群汽車修配廠｜台中</figcaption>'
        contact.appendChild(photo)
        contact.querySelectorAll<HTMLButtonElement>('button').forEach((button) => { if (button.textContent?.includes('Reset Demo')) button.classList.add('hf-hidden') })
      }

      const footer = document.querySelector<HTMLElement>('footer')
      if (footer && !footer.dataset.highFiFooter) {
        footer.dataset.highFiFooter = 'true'
        footer.innerHTML = `<div class="hf-footer-grid"><div class="hf-footer-brand">${iconSvg('引擎系統')}<b>越群汽車修配廠</b></div><nav aria-label="頁尾導覽"><a href="#services">服務項目</a><a href="#team">技師團隊</a><a href="#reviews">顧客評價</a><a href="#contact">聯絡我們</a></nav><a class="hf-back-top" href="#top" aria-label="回到頁首">↑</a></div><small>© 越群汽車修配廠 All Rights Reserved.</small>`
      }

      document.querySelectorAll<HTMLButtonElement>('.rich-menu button').forEach((button) => {
        if (button.querySelector('svg')) return
        const label = button.textContent?.trim() ?? ''
        button.innerHTML = `${iconSvg(label)}<span>${label}</span>`
      })

      const preview = document.querySelector<HTMLElement>('.photo-preview')
      document.body.classList.toggle('high-fi-modal-open', Boolean(preview))
      if (preview && !preview.dataset.highFiFocus) {
        preview.dataset.highFiFocus = 'true'
        preview.querySelector<HTMLElement>('.photo-close')?.focus()
      }
    }

    applyHighFiPresentation()
    const observer = new MutationObserver(applyHighFiPresentation)
    observer.observe(document.getElementById('root')!, { childList: true, subtree: true })
    const closePreview = (event: KeyboardEvent) => {
      if (event.key === 'Escape') document.querySelector<HTMLButtonElement>('.photo-preview .photo-close')?.click()
    }
    document.addEventListener('keydown', closePreview)
    return () => { observer.disconnect(); document.removeEventListener('keydown', closePreview); document.body.classList.remove('high-fi-modal-open') }
  }, [])

  return <App />
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <HighFiApp />
  </StrictMode>,
)
