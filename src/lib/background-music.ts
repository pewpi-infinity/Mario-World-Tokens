export const MARIO_BACKGROUND_MUSIC = {
  mainTheme: 'https://ia600304.us.archive.org/33/items/TvtokmanPart1/Super%20Mario%20Bros.mp3',
  underground: 'https://ia600208.us.archive.org/29/items/Super_Mario_Bros_The_30_Greatest_SFX/01%20Super%20Mario%20Bros.%20-%20Underground%20BGM.mp3',
  underwater: 'https://ia600208.us.archive.org/29/items/Super_Mario_Bros_The_30_Greatest_SFX/09%20Super%20Mario%20Bros.%20-%20Underwater%20BGM.mp3',
  castle: 'https://ia600208.us.archive.org/29/items/Super_Mario_Bros_The_30_Greatest_SFX/03%20Super%20Mario%20Bros.%20-%20Castle%20BGM.mp3',
  starPower: 'https://ia600208.us.archive.org/29/items/Super_Mario_Bros_The_30_Greatest_SFX/07%20Super%20Mario%20Bros.%20-%20Starman%20BGM.mp3',
}

export type BackgroundMusicPage = 'treasury' | 'marketplace' | 'charts' | 'ledger' | 'main'

const PAGE_MUSIC_MAP: Record<BackgroundMusicPage, string> = {
  main: MARIO_BACKGROUND_MUSIC.mainTheme,
  treasury: MARIO_BACKGROUND_MUSIC.mainTheme,
  marketplace: MARIO_BACKGROUND_MUSIC.underground,
  charts: MARIO_BACKGROUND_MUSIC.castle,
  ledger: MARIO_BACKGROUND_MUSIC.underwater,
}

let currentAudio: HTMLAudioElement | null = null
let currentPage: BackgroundMusicPage = 'main'
let volume = 0.5
let isEnabled = true

export function initBackgroundMusic(page: BackgroundMusicPage = 'main') {
  currentPage = page
  console.log('🎵 Background music initialized for:', page)
  setTimeout(() => {
    playBackgroundMusic(page)
  }, 500)
}

export function playBackgroundMusic(page: BackgroundMusicPage) {
  const musicUrl = PAGE_MUSIC_MAP[page]
  
  if (currentAudio && currentPage === page && !currentAudio.paused) {
    console.log('🎵 Music already playing for:', page)
    return
  }
  
  if (currentAudio) {
    currentAudio.pause()
    currentAudio.remove()
    currentAudio = null
  }
  
  currentPage = page
  currentAudio = new Audio(musicUrl)
  currentAudio.loop = true
  currentAudio.volume = volume
  currentAudio.preload = 'auto'
  currentAudio.crossOrigin = 'anonymous'
  
  currentAudio.play().then(() => {
    console.log('🎵 BACKGROUND MUSIC PLAYING:', page)
  }).catch(error => {
    console.log('Music play attempt:', error.message)
    setTimeout(() => {
      if (currentAudio) {
        currentAudio.play().catch(() => {})
      }
    }, 1000)
  })
}

export function stopBackgroundMusic() {
  if (currentAudio) {
    currentAudio.pause()
    currentAudio.remove()
    currentAudio = null
  }
  console.log('🔇 Background music stopped')
}

export function setBackgroundMusicVolume(newVolume: number) {
  volume = Math.max(0, Math.min(1, newVolume))
  if (currentAudio) {
    currentAudio.volume = volume
  }
  console.log('🔊 Background music volume:', volume)
}

export function enableAutoPlay() {
  isEnabled = true
  console.log('🎵 AUTO-PLAY ENABLED')
  
  if (!currentAudio) {
    playBackgroundMusic(currentPage)
  } else if (currentAudio.paused) {
    currentAudio.play().then(() => {
      console.log('🎵 Music resumed!')
    }).catch(() => {
      setTimeout(() => {
        if (currentAudio) {
          currentAudio.play().catch(() => {})
        }
      }, 500)
    })
  }
}
