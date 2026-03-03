export const MARIO_BACKGROUND_MUSIC = {
  mainTheme: 'https://ia601509.us.archive.org/7/items/SMB-Soundtrack/01%20-%20Super%20Mario%20Bros.%20-%20Main%20Theme.mp3',
  underground: 'https://ia601509.us.archive.org/7/items/SMB-Soundtrack/02%20-%20Super%20Mario%20Bros.%20-%20Underground%20Theme.mp3',
  underwater: 'https://ia601509.us.archive.org/7/items/SMB-Soundtrack/03%20-%20Super%20Mario%20Bros.%20-%20Underwater%20Theme.mp3',
  castle: 'https://ia601509.us.archive.org/7/items/SMB-Soundtrack/04%20-%20Super%20Mario%20Bros.%20-%20Castle%20Theme.mp3',
  starPower: 'https://ia601509.us.archive.org/7/items/SMB-Soundtrack/05%20-%20Super%20Mario%20Bros.%20-%20Star%20Theme.mp3',
  ghostHouse: 'https://ia601509.us.archive.org/7/items/SMB-Soundtrack/06%20-%20Super%20Mario%20Bros.%20-%20Ending.mp3',
  fortress: 'https://ia601509.us.archive.org/7/items/SMB-Soundtrack/04%20-%20Super%20Mario%20Bros.%20-%20Castle%20Theme.mp3',
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
let volume = 0.3

export function initBackgroundMusic(page: BackgroundMusicPage = 'main') {
  currentPage = page
  playBackgroundMusic(page)
}

export function playBackgroundMusic(page: BackgroundMusicPage) {
  const musicUrl = PAGE_MUSIC_MAP[page]
  
  if (currentAudio && currentPage === page && !currentAudio.paused) {
    return
  }
  
  if (currentAudio) {
    currentAudio.pause()
    currentAudio.currentTime = 0
  }
  
  currentPage = page
  currentAudio = new Audio(musicUrl)
  currentAudio.loop = true
  currentAudio.volume = isMuted ? 0 : volume
  currentAudio.preload = 'auto'
  
  const playPromise = currentAudio.play()
  if (playPromise !== undefined) {
    playPromise.then(() => {
      console.log(`🎵 Playing background music: ${page}`)
    }).catch((error) => {
      console.log('Music autoplay blocked:', error.message)
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
  if (currentAudio && currentAudio.paused) {
    currentAudio.play().catch(() => {
      console.log('Could not auto-play')
    })
  }
}
