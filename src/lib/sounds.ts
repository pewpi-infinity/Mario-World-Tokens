export const MARIO_SOUNDS = {
  coin: 'https://ia800304.us.archive.org/27/items/arcade-sounds/coin.wav',
  brick: 'https://ia800304.us.archive.org/27/items/arcade-sounds/break.wav',
  bump: 'https://ia800304.us.archive.org/27/items/arcade-sounds/bump.wav',
  jump: 'https://ia800304.us.archive.org/27/items/arcade-sounds/jump.wav',
  powerUp: 'https://ia800304.us.archive.org/27/items/arcade-sounds/powerup.wav',
  oneUp: 'https://ia800304.us.archive.org/27/items/arcade-sounds/1up.wav',
  pipe: 'https://ia800304.us.archive.org/27/items/arcade-sounds/pipe.wav',
  fireball: 'https://ia800304.us.archive.org/27/items/arcade-sounds/fireball.wav',
  kick: 'https://ia800304.us.archive.org/27/items/arcade-sounds/kick.wav',
  pause: 'https://ia800304.us.archive.org/27/items/arcade-sounds/pause.wav',
  stomp: 'https://ia800304.us.archive.org/27/items/arcade-sounds/stomp.wav',
  gameOver: 'https://ia800304.us.archive.org/27/items/arcade-sounds/gameover.wav',
  stageClear: 'https://ia800304.us.archive.org/27/items/arcade-sounds/stage_clear.wav',
  warning: 'https://ia800304.us.archive.org/27/items/arcade-sounds/warning.wav',
  bowserFall: 'https://ia800304.us.archive.org/27/items/arcade-sounds/bowserfall.wav',
  bowserFire: 'https://ia800304.us.archive.org/27/items/arcade-sounds/bowserfire.wav',
  mariodie: 'https://ia800304.us.archive.org/27/items/arcade-sounds/mariodie.wav',
}

const audioCache: Map<string, HTMLAudioElement[]> = new Map()
let audioContext: AudioContext | null = null
const POOL_SIZE = 3

export function initializeAudioContext() {
  if (!audioContext) {
    try {
      audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
      console.log('🔊 AudioContext created:', audioContext.state)
    } catch (e) {
      console.warn('AudioContext not supported')
    }
  }
  
  if (audioContext && audioContext.state === 'suspended') {
    audioContext.resume().then(() => {
      console.log('🔊 AudioContext resumed!')
    })
  }
  
  return audioContext
}

export function preloadSound(soundUrl: string) {
  if (!audioCache.has(soundUrl)) {
    const pool: HTMLAudioElement[] = []
    for (let i = 0; i < POOL_SIZE; i++) {
      const audio = new Audio(soundUrl)
      audio.preload = 'auto'
      audio.volume = 0.8
      pool.push(audio)
    }
    audioCache.set(soundUrl, pool)
  }
  return audioCache.get(soundUrl)!
}

export function playSound(soundUrl: string, volume = 0.8) {
  try {
    if (audioContext?.state === 'suspended') {
      audioContext.resume()
    }
    
    let pool = audioCache.get(soundUrl)
    if (!pool) {
      pool = preloadSound(soundUrl)
    }
    
    const audio = pool.find(a => a.paused) || pool[0]
    audio.volume = volume
    audio.currentTime = 0
    
    audio.play().catch(() => {})
  } catch (e) {
    console.warn('Sound error:', e)
  }
}

export function preloadAllSounds() {
  Object.values(MARIO_SOUNDS).forEach(url => preloadSound(url))
}

export const playBrickBreak = () => playSound(MARIO_SOUNDS.brick, 0.7)
export const playCoinSound = () => playSound(MARIO_SOUNDS.coin, 0.8)
export const playJump = () => playSound(MARIO_SOUNDS.jump, 0.6)
export const playPowerUp = () => playSound(MARIO_SOUNDS.powerUp, 0.7)
export const playOneUp = () => playSound(MARIO_SOUNDS.oneUp, 0.7)
export const playPipe = () => playSound(MARIO_SOUNDS.pipe, 0.7)
export const playFireball = () => playSound(MARIO_SOUNDS.fireball, 0.6)
export const playKick = () => playSound(MARIO_SOUNDS.kick, 0.6)
export const playPause = () => playSound(MARIO_SOUNDS.pause, 0.6)
export const playStomp = () => playSound(MARIO_SOUNDS.stomp, 0.6)
export const playGameOver = () => playSound(MARIO_SOUNDS.gameOver, 0.7)
export const playStageClear = () => playSound(MARIO_SOUNDS.stageClear, 0.7)
export const playWarning = () => playSound(MARIO_SOUNDS.warning, 0.6)
export const playBowserFall = () => playSound(MARIO_SOUNDS.bowserFall, 0.7)
export const playBowserFire = () => playSound(MARIO_SOUNDS.bowserFire, 0.6)
export const playBump = () => playSound(MARIO_SOUNDS.bump, 0.7)
export const playMarioDie = () => playSound(MARIO_SOUNDS.mariodie, 0.7)
