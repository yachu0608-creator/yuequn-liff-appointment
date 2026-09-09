import liff from '@line/liff'

export type LiffContext = {
  status: 'initializing' | 'ready' | 'missing-id' | 'failed'
  isInClient: boolean
  isLoggedIn: boolean
  os: ReturnType<typeof liff.getOS> | null
  profile: Awaited<ReturnType<typeof liff.getProfile>> | null
}

let context: LiffContext = {
  status: 'initializing',
  isInClient: false,
  isLoggedIn: false,
  os: null,
  profile: null,
}

export async function initializeLiff() {
  const liffId = import.meta.env.VITE_LIFF_ID?.trim()

  if (!liffId) {
    context = { ...context, status: 'missing-id' }
    publishContext()
    return context
  }

  try {
    await liff.init({ liffId, withLoginOnExternalBrowser: false })
    const isInClient = liff.isInClient()
    const isLoggedIn = liff.isLoggedIn()
    const profile = isInClient && isLoggedIn ? await liff.getProfile() : null

    context = {
      status: 'ready',
      isInClient,
      isLoggedIn,
      os: liff.getOS(),
      profile,
    }
  } catch {
    // LIFF initialization must never block the standalone browser experience.
    context = { ...context, status: 'failed', isInClient: liff.isInClient() }
  }

  publishContext()
  return context
}

export function getLiffContext() {
  return context
}

export function closeLiffOrFallback(fallback: () => void) {
  if (context.status === 'ready' && context.isInClient) {
    liff.closeWindow()
    return
  }
  fallback()
}

function publishContext() {
  document.documentElement.dataset.liffStatus = context.status
  document.documentElement.dataset.liffEnvironment = context.isInClient ? 'line' : 'browser'
  window.dispatchEvent(new CustomEvent('liff:ready', { detail: context }))
}
