import { getAudioContext, forceUnlockAudio } from '@/lib/sounds'

export const MARIO_BACKGROUND_MUSIC = {
  mainTheme: 'https://ia600208.us.archive.org/29/items/Super_Mario_Bros_The_30_Greatest_SFX/06%20Super%20Mario%20Bros.%20-%20Ground%20Theme%20BGM.mp3',
  underground: 'https://ia600208.us.archive.org/29/items/Super_Mario_Bros_The_30_Greatest_SFX/01%20Super%20Mario%20Bros.%20-%20Underground%20BGM.mp3',
  underwater: 'https://ia600208.us.archive.org/29/items/Super_Mario_Bros_The_30_Greatest_SFX/09%20Super%20Mario%20Bros.%20-%20Underwater%20BGM.mp3',
  castle: 'https://ia600208.us.archive.org/29/items/Super_Mario_Bros_The_30_Greatest_SFX/03%20Super%20Mario%20Bros.%20-%20Castle%20BGM.mp3',
  starPower: 'https://ia600208.us.archive.org/29/items/Super_Mario_Bros_The_30_Greatest_SFX/07%20Super%20Mario%20Bros.%20-%20Starman%20BGM.mp3',
}

export type BackgroundMusicPage = 'treasury' | 'marketplace' | 'charts' | 'ledger' | 'main' | 'star' | 'ghost' | 'fortress'

const PAGE_MUSIC_MAP: Record<BackgroundMusicPage, string> = {
  main: MARIO_BACKGROUND_MUSIC.mainTheme,
  treasury: MARIO_BACKGROUND_MUSIC.mainTheme,
  marketplace: MARIO_BACKGROUND_MUSIC.underground,
  charts: MARIO_BACKGROUND_MUSIC.castle,
  ledger: MARIO_BACKGROUND_MUSIC.underwater,
  star: MARIO_BACKGROUND_MUSIC.starPower,
  ghost: MARIO_BACKGROUND_MUSIC.castle,
  fortress: MARIO_BACKGROUND_MUSIC.underground,
}

let currentAudio: HTMLAudioElement | null = null
let currentPage: BackgroundMusicPage = 'main'
let volume = 0.4
let isEnabled = false
let synthMusicInterval: ReturnType<typeof setInterval> | null = null

const PAGE_SYNTH_NOTES: Record<BackgroundMusicPage, number[]> = {
  main: [262, 330, 392, 523],
  treasury: [262, 330, 392, 523],
  marketplace: [196, 247, 294, 392],
  charts: [220, 277, 330, 440],
  ledger: [175, 220, 262, 349],
  star: [523, 659, 784, 1047],
  ghost: [196, 233, 262, 311],
  fortress: [220, 262, 330, 392],
}

function stopSynthBackgroundMusic() {
  if (synthMusicInterval !== null) { clearInterval(synthMusicInterval); synthMusicInterval = null }
}

function playSynthBackgroundMusic(page: BackgroundMusicPage) {
  stopSynthBackgroundMusic()
  const ctx = getAudioContext()
  if (!ctx) return
  const notes = PAGE_SYNTH_NOTES[page] || PAGE_SYNTH_NOTES.main
  let noteIndex = 0
  synthMusicInterval = setInterval(() => {
    const o = ctx.createOscillator(), g = ctx.createGain()
    o.type = 'triangle'; o.frequency.value = notes[noteIndex % notes.length]
    g.gain.value = Math.max(0.01, Math.min(0.12, volume * 0.2))
    o.connect(g); g.connect(ctx.destination); o.start(); o.stop(ctx.currentTime + 0.22)
    noteIndex++
  }, 300)
}

export function initBackgroundMusic(page: BackgroundMusicPage = 'main') { currentPage = page }

export function playBackgroundMusic(page: BackgroundMusicPage) {
  if (!isEnabled) return
  const musicUrl = PAGE_MUSIC_MAP[page]
  if (currentAudio && currentPage === page && !currentAudio.paused) return
  currentPage = page
  if (currentAudio) { currentAudio.pause(); currentAudio.remove(); currentAudio = null }
  currentAudio = new Audio(musicUrl)
  currentAudio.loop = true; currentAudio.volume = volume; currentAudio.preload = 'auto'
  const attemptPlay = () => {
    if (!currentAudio) return
    currentAudio.play().then(() => stopSynthBackgroundMusic()).catch(() => {
      forceUnlockAudio(); playSynthBackgroundMusic(page)
      setTimeout(() => { if (currentAudio && currentAudio.paused) currentAudio.play().then(() => stopSynthBackgroundMusic()).catch(() => {}) }, 800)
    })
  }
  currentAudio.addEventListener('canplay', attemptPlay, { once: true }); currentAudio.load()
}

export function stopBackgroundMusic() {
  if (currentAudio) { currentAudio.pause(); currentAudio.remove(); currentAudio = null }
  stopSynthBackgroundMusic()
}

export function setBackgroundMusicVolume(v: number) {
  volume = Math.max(0, Math.min(1, v)); if (currentAudio) currentAudio.volume = volume
}

export function enableAutoPlay() {
  isEnabled = true; forceUnlockAudio()
  if (!currentAudio) playBackgroundMusic(currentPage)
  else if (currentAudio.paused) currentAudio.play().then(() => stopSynthBackgroundMusic()).catch(() => {
    playSynthBackgroundMusic(currentPage)
    setTimeout(() => { if (currentAudio) currentAudio.play().catch(() => {}) }, 500)
  })
}
