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

const audioCache: Map<string, HTMLAudioElement[]> = new Map()
let audioContext: AudioContext | null = null
let isAudioInitialized = false
const AUDIO_POOL_SIZE = 5
let unlockAttempts = 0
const MAX_UNLOCK_ATTEMPTS = 10

export function getAudioContext(): AudioContext | null {
  if (!audioContext) {
    initializeAudioContext()
  }
  return audioContext
}

export function initializeAudioContext(): AudioContext | null {
  if (audioContext) return audioContext
  
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext
    if (!AudioContextClass) {
      console.warn('AudioContext not supported in this browser')
      return null
    }
    
    audioContext = new AudioContextClass()
    console.log('🎮 AudioContext initialized:', audioContext.state)
    
    if (audioContext.state === 'suspended') {
      audioContext.resume().then(() => {
        console.log('🔊 AudioContext resumed')
        isAudioInitialized = true
      }).catch((err) => {
        console.warn('Failed to resume AudioContext:', err)
      })
    } else {
      isAudioInitialized = true
    }
  } catch (e) {
    console.warn('AudioContext initialization failed:', e)
  }
  
  return audioContext
}

export function forceUnlockAudio() {
  if (unlockAttempts >= MAX_UNLOCK_ATTEMPTS) return
  unlockAttempts++
  
  if (!audioContext) {
    initializeAudioContext()
  }
  
  if (audioContext?.state === 'suspended') {
    audioContext.resume().then(() => {
      console.log(`🔊 Audio force-unlocked! (attempt ${unlockAttempts})`)
      isAudioInitialized = true
    }).catch(() => {})
  }
  
  try {
    const silentAudio = new Audio()
    silentAudio.src = 'data:audio/wav;base64,UklGRigAAABXQVZFZm10IBIAAAABAAEARKwAAIhYAQACABAAAABkYXRhAgAAAAEA'
    silentAudio.volume = 0.01
    const playPromise = silentAudio.play()
    if (playPromise) {
      playPromise.then(() => {
        silentAudio.pause()
        isAudioInitialized = true
        console.log(`🔊 Silent audio unlock successful (attempt ${unlockAttempts})`)
      }).catch(() => {})
    }
  } catch (e) {}
}

export function preloadSound(soundUrl: string): HTMLAudioElement {
  if (!audioCache.has(soundUrl)) {
    const pool: HTMLAudioElement[] = []
    for (let i = 0; i < AUDIO_POOL_SIZE; i++) {
      const audio = new Audio()
      audio.src = soundUrl
      audio.preload = 'auto'
      audio.crossOrigin = 'anonymous'
      audio.load()
      pool.push(audio)
    }
    audioCache.set(soundUrl, pool)
  }
  return audioCache.get(soundUrl)![0]
}

export function playSound(soundUrl: string, volume = 0.7): void {
  try {
    forceUnlockAudio()
    
    let audio: HTMLAudioElement | null = null
    
    if (audioCache.has(soundUrl)) {
      const pool = audioCache.get(soundUrl)!
      audio = pool.find(a => a.paused || a.ended || a.currentTime === 0) || pool[0]
      audio.currentTime = 0
    } else {
      audio = new Audio(soundUrl)
      audio.crossOrigin = 'anonymous'
    }
    
    audio.volume = volume
    
    const attemptPlay = (retryCount = 0) => {
      const playPromise = audio!.play()
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            console.log('🔊 PLAYING:', soundUrl.split('/').pop())
          })
          .catch((error) => {
            console.warn(`Play attempt ${retryCount + 1} failed:`, error.message)
            
            if (retryCount < 3) {
              setTimeout(() => {
                forceUnlockAudio()
                
                const retryAudio = new Audio(soundUrl)
                retryAudio.volume = volume
                retryAudio.crossOrigin = 'anonymous'
                
                const retryPromise = retryAudio.play()
                if (retryPromise) {
                  retryPromise
                    .then(() => console.log('🔊 RETRY SUCCESS:', soundUrl.split('/').pop()))
                    .catch(() => {
                      if (retryCount < 2) {
                        attemptPlay(retryCount + 1)
                      }
                    })
                }
              }, 100 * (retryCount + 1))
            }
          })
      }
    }
    
    attemptPlay()
  } catch (e) {
    console.error('Sound error:', e)
  }
}

export function preloadAllSounds() {
  console.log('🔊 Preloading all Mario sounds...')
  Object.entries(MARIO_SOUNDS).forEach(([name, url]) => {
    preloadSound(url)
  })
  console.log('✅ All sounds preloaded!')
}

export const playBrickBreak = () => { console.log('🧱 BRICK BREAK'); playSound(MARIO_SOUNDS.brick, 0.7) }
export const playCoinSound = () => { console.log('🪙 COIN'); playSound(MARIO_SOUNDS.coin, 0.8) }
export const playJump = () => { console.log('⬆️ JUMP'); playSound(MARIO_SOUNDS.jump, 0.6) }
export const playPowerUp = () => { console.log('⭐ POWER UP'); playSound(MARIO_SOUNDS.powerUp, 0.7) }
export const playOneUp = () => { console.log('🍄 1-UP'); playSound(MARIO_SOUNDS.oneUp, 0.7) }
export const playPipe = () => { console.log('🟢 PIPE'); playSound(MARIO_SOUNDS.pipe, 0.7) }
export const playFireball = () => { console.log('🔥 FIREBALL'); playSound(MARIO_SOUNDS.fireball, 0.6) }
export const playKick = () => { console.log('👟 KICK'); playSound(MARIO_SOUNDS.kick, 0.6) }
export const playPause = () => { console.log('⏸️ PAUSE'); playSound(MARIO_SOUNDS.pause, 0.6) }
export const playStomp = () => { console.log('👞 STOMP'); playSound(MARIO_SOUNDS.stomp, 0.6) }
export const playGameOver = () => { console.log('💀 GAME OVER'); playSound(MARIO_SOUNDS.gameOver, 0.7) }
export const playStageClear = () => { console.log('🏁 STAGE CLEAR'); playSound(MARIO_SOUNDS.stageClear, 0.7) }
export const playWarning = () => { console.log('⚠️ WARNING'); playSound(MARIO_SOUNDS.warning, 0.6) }
export const playBowserFall = () => { console.log('🐉 BOWSER FALL'); playSound(MARIO_SOUNDS.bowserFall, 0.7) }
export const playBowserFire = () => { console.log('🔥 BOWSER FIRE'); playSound(MARIO_SOUNDS.bowserFire, 0.6) }
export const playBump = () => { console.log('💥 BUMP'); playSound(MARIO_SOUNDS.bump, 0.7) }
export const playMarioDie = () => { console.log('☠️ MARIO DIE'); playSound(MARIO_SOUNDS.mariodie, 0.7) }
