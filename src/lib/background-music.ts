export const MARIO_BACKGROUND_MUSIC = {
  mainTheme: 'https://archive.org/download/marioSoundEffects/main-theme.mp3',
  underground: 'https://archive.org/download/marioSoundEffects/underground.mp3',
  underwater: 'https://archive.org/download/marioSoundEffects/underwater.mp3',
  castle: 'https://archive.org/download/marioSoundEffects/castle.mp3',
  starPower: 'https://archive.org/download/marioSoundEffects/athletic.mp3',
  ghostHouse: 'https://archive.org/download/marioSoundEffects/ghost-house.mp3',
  fortress: 'https://archive.org/download/marioSoundEffects/fortress.mp3',
}

export type BackgroundMusicPage = 'treasury' | 'marketplace' | 'charts' | 'ledger' | 'main' | 'ghost' | 'star' | 'fortress'

const PAGE_MUSIC_MAP: Record<BackgroundMusicPage, string> = {
  main: MARIO_BACKGROUND_MUSIC.mainTheme,
  treasury: MARIO_BACKGROUND_MUSIC.mainTheme,
  marketplace: MARIO_BACKGROUND_MUSIC.underground,
  charts: MARIO_BACKGROUND_MUSIC.castle,
  ledger: MARIO_BACKGROUND_MUSIC.underwater,
  ghost: MARIO_BACKGROUND_MUSIC.ghostHouse,
  star: MARIO_BACKGROUND_MUSIC.starPower,
  fortress: MARIO_BACKGROUND_MUSIC.fortress,
}

let currentAudio: HTMLAudioElement | null = null
let currentPage: BackgroundMusicPage = 'main'
let isMuted = false
let volume = 0.4
let isInitialized = false

export function initBackgroundMusic(page: BackgroundMusicPage = 'main') {
  isInitialized = true
  currentPage = page
  console.log(`🎵 Initializing background music for page: ${page}`)
  playBackgroundMusic(page)
}

export function playBackgroundMusic(page: BackgroundMusicPage) {
  const musicUrl = PAGE_MUSIC_MAP[page]
  
  if (currentAudio && currentPage === page && !currentAudio.paused) {
    console.log(`🎵 Music already playing for ${page}`)
    return
  }
  
  if (currentAudio) {
    currentAudio.pause()
    currentAudio.currentTime = 0
    currentAudio = null
  }
  
  currentPage = page
  currentAudio = new Audio(musicUrl)
  currentAudio.loop = true
  currentAudio.volume = isMuted ? 0 : volume
  currentAudio.preload = 'auto'
  currentAudio.load()
  
  const playPromise = currentAudio.play()
  if (playPromise !== undefined) {
    playPromise
      .then(() => {
        console.log(`🎵 Successfully playing background music: ${page}`)
      })
      .catch((error) => {
        console.log(`⚠️ Music autoplay blocked for ${page}:`, error.message)
      })
  }
}

export function stopBackgroundMusic() {
  if (currentAudio) {
    currentAudio.pause()
    currentAudio.currentTime = 0
    currentAudio = null
  }
}

export function setBackgroundMusicVolume(newVolume: number) {
  volume = Math.max(0, Math.min(1, newVolume))
  if (currentAudio && !isMuted) {
    currentAudio.volume = volume
  }
}

export function toggleBackgroundMusicMute() {
  isMuted = !isMuted
  if (currentAudio) {
    currentAudio.volume = isMuted ? 0 : volume
  }
  return isMuted
}

export function getBackgroundMusicState() {
  return {
    isPlaying: currentAudio !== null && !currentAudio.paused,
    isMuted,
    volume,
    currentPage,
  }
}

export function enableAutoPlay() {
  console.log('🔊 Enabling auto-play...')
  if (currentAudio && currentAudio.paused) {
    currentAudio.play()
      .then(() => {
        console.log('✅ Auto-play successful!')
      })
      .catch((err) => {
        console.log('⚠️ Could not auto-play:', err.message)
      })
  } else if (!isInitialized) {
    console.log('🎵 Initializing music on auto-play enable...')
    initBackgroundMusic('main')
  }
}
