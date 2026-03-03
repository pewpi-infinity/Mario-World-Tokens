export const MARIO_SOUNDS = {
  coin: 'https://ia600304.us.archive.org/27/items/arcade-sounds/coin.wav',
  brick: 'https://ia600304.us.archive.org/27/items/arcade-sounds/break.wav',
  bump: 'https://ia600304.us.archive.org/27/items/arcade-sounds/bump.wav',
  jump: 'https://ia600304.us.archive.org/27/items/arcade-sounds/jump.wav',
  powerUp: 'https://ia600304.us.archive.org/27/items/arcade-sounds/powerup.wav',
  oneUp: 'https://ia600304.us.archive.org/27/items/arcade-sounds/1up.wav',
  pipe: 'https://ia600304.us.archive.org/27/items/arcade-sounds/pipe.wav',
  fireball: 'https://ia600304.us.archive.org/27/items/arcade-sounds/fireball.wav',
  kick: 'https://ia600304.us.archive.org/27/items/arcade-sounds/kick.wav',
  pause: 'https://ia600304.us.archive.org/27/items/arcade-sounds/pause.wav',
  stomp: 'https://ia600304.us.archive.org/27/items/arcade-sounds/stomp.wav',
  gameOver: 'https://ia600304.us.archive.org/27/items/arcade-sounds/gameover.wav',
  stageClear: 'https://ia600304.us.archive.org/27/items/arcade-sounds/stage_clear.wav',
  warning: 'https://ia600304.us.archive.org/27/items/arcade-sounds/warning.wav',
  bowserFall: 'https://ia600304.us.archive.org/27/items/arcade-sounds/bowserfall.wav',
  bowserFire: 'https://ia600304.us.archive.org/27/items/arcade-sounds/bowserfire.wav',
  mariodie: 'https://ia600304.us.archive.org/27/items/arcade-sounds/mariodie.wav',
}

const audioCache: Map<string, HTMLAudioElement> = new Map()
let audioContext: AudioContext | null = null
let isAudioUnlocked = false

export function initializeAudioContext() {
  if (!audioContext) {
    try {
      audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
      console.log('🔊 AudioContext created:', audioContext.state)
    } catch (e) {
      console.warn('AudioContext not supported', e)
    }
  }
  
  if (audioContext && audioContext.state === 'suspended') {
    audioContext.resume().then(() => {
      console.log('🔊 AudioContext resumed!')
      isAudioUnlocked = true
    }).catch(err => {
      console.error('Failed to resume AudioContext:', err)
    })
  } else {
    isAudioUnlocked = true
  }
  
  return audioContext
}

export function unlockAudio() {
  if (!isAudioUnlocked) {
    initializeAudioContext()
    if (audioContext?.state === 'suspended') {
      audioContext.resume()
    }
    
    const tempAudio = new Audio()
    tempAudio.volume = 0
    tempAudio.play().then(() => {
      tempAudio.pause()
      tempAudio.remove()
      isAudioUnlocked = true
      console.log('🔊 Audio unlocked!')
    }).catch(() => {
      console.warn('Audio unlock failed - needs user interaction')
    })
  }
}

export function preloadSound(soundUrl: string) {
  if (!audioCache.has(soundUrl)) {
    const audio = new Audio()
    audio.src = soundUrl
    audio.preload = 'auto'
    audio.volume = 0.7
    audio.crossOrigin = 'anonymous'
    audioCache.set(soundUrl, audio)
    
    audio.load()
  }
  return audioCache.get(soundUrl)!
}

export function playSound(soundUrl: string, volume = 0.7) {
  try {
    unlockAudio()
    
    let audio = audioCache.get(soundUrl)
    if (!audio) {
      audio = preloadSound(soundUrl)
    }
    
    const clonedAudio = audio.cloneNode(true) as HTMLAudioElement
    clonedAudio.volume = volume
    clonedAudio.crossOrigin = 'anonymous'
    
    const playPromise = clonedAudio.play()
    if (playPromise !== undefined) {
      playPromise.then(() => {
        console.log('🔊 Playing:', soundUrl.split('/').pop())
      }).catch(error => {
        console.error('❌ Playback failed:', error.message)
      })
    }
    
    clonedAudio.addEventListener('ended', () => {
      clonedAudio.remove()
    })
  } catch (e) {
    console.error('❌ Sound error:', e)
  }
}

export function preloadAllSounds() {
  console.log('🔊 Preloading all Mario sounds...')
  Object.entries(MARIO_SOUNDS).forEach(([name, url]) => {
    preloadSound(url)
    console.log(`  ✓ Loaded: ${name}`)
  })
  console.log('🔊 All sounds preloaded!')
}

export const playBrickBreak = () => playSound(MARIO_SOUNDS.brick, 0.6)
export const playCoinSound = () => playSound(MARIO_SOUNDS.coin, 0.7)
export const playJump = () => playSound(MARIO_SOUNDS.jump, 0.5)
export const playPowerUp = () => playSound(MARIO_SOUNDS.powerUp, 0.6)
export const playOneUp = () => playSound(MARIO_SOUNDS.oneUp, 0.6)
export const playPipe = () => playSound(MARIO_SOUNDS.pipe, 0.6)
export const playFireball = () => playSound(MARIO_SOUNDS.fireball, 0.5)
export const playKick = () => playSound(MARIO_SOUNDS.kick, 0.5)
export const playPause = () => playSound(MARIO_SOUNDS.pause, 0.5)
export const playStomp = () => playSound(MARIO_SOUNDS.stomp, 0.5)
export const playGameOver = () => playSound(MARIO_SOUNDS.gameOver, 0.6)
export const playStageClear = () => playSound(MARIO_SOUNDS.stageClear, 0.6)
export const playWarning = () => playSound(MARIO_SOUNDS.warning, 0.5)
export const playBowserFall = () => playSound(MARIO_SOUNDS.bowserFall, 0.6)
export const playBowserFire = () => playSound(MARIO_SOUNDS.bowserFire, 0.5)
export const playBump = () => playSound(MARIO_SOUNDS.bump, 0.6)
export const playMarioDie = () => playSound(MARIO_SOUNDS.mariodie, 0.6)
