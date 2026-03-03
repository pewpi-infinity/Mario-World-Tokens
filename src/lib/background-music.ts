export const MARIO_BACKGROUND_MUSIC = {
  mainTheme: 'https://ia800304.us.archive.org/27/items/arcade-music/overworld.mp3',
  underground: 'https://ia800304.us.archive.org/27/items/arcade-music/underground.mp3',
  underwater: 'https://ia800304.us.archive.org/27/items/arcade-music/underwater.mp3',
  castle: 'https://ia800304.us.archive.org/27/items/arcade-music/castle.mp3',
  starPower: 'https://ia800304.us.archive.org/27/items/arcade-music/starpower.mp3',
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
    currentAudio = null
  }
  
  currentPage = page
  currentAudio = new Audio(musicUrl)
  currentAudio.loop = true
  currentAudio.volume = volume
  currentAudio.preload = 'auto'
  
  const playPromise = currentAudio.play()
  if (playPromise !== undefined) {
    playPromise.then(() => {
      console.log('🎵 Background music playing:', page)
    }).catch(error => {
      console.error('❌ Background music failed:', error)
    })
  }
}

export function stopBackgroundMusic() {
  if (currentAudio) {
    currentAudio.pause()
    currentAudio = null
  }
}

export function setBackgroundMusicVolume(newVolume: number) {
  volume = Math.max(0, Math.min(1, newVolume))
  if (currentAudio) {
    currentAudio.volume = volume
  }
}

export function enableAutoPlay() {
  if (currentAudio?.paused) {
    const playPromise = currentAudio.play()
    if (playPromise !== undefined) {
      playPromise.then(() => {
        console.log('🎵 Auto-play enabled!')
      }).catch(error => {
        console.error('❌ Auto-play failed:', error)
      })
    }
  } else {
    initBackgroundMusic('main')
  }
}
