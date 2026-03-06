export const MARIO_SOUNDS = {
  coin: 'https://ia600208.us.archive.org/29/items/Super_Mario_Bros_The_30_Greatest_SFX/11%20Super%20Mario%20Bros.%20-%20Coin%20SFX.mp3',
  brick: 'https://ia600208.us.archive.org/29/items/Super_Mario_Bros_The_30_Greatest_SFX/23%20Super%20Mario%20Bros.%20-%20Brick%20Break%20SFX.mp3',
  bump: 'https://ia600208.us.archive.org/29/items/Super_Mario_Bros_The_30_Greatest_SFX/17%20Super%20Mario%20Bros.%20-%20Bump%20SFX.mp3',
  jump: 'https://ia600208.us.archive.org/29/items/Super_Mario_Bros_The_30_Greatest_SFX/12%20Super%20Mario%20Bros.%20-%20Jump%20Small%20SFX.mp3',
  powerUp: 'https://ia600208.us.archive.org/29/items/Super_Mario_Bros_The_30_Greatest_SFX/14%20Super%20Mario%20Bros.%20-%20Power-Up%20SFX.mp3',
  oneUp: 'https://ia600208.us.archive.org/29/items/Super_Mario_Bros_The_30_Greatest_SFX/16%20Super%20Mario%20Bros.%20-%201-UP%20SFX.mp3',
  pipe: 'https://ia600208.us.archive.org/29/items/Super_Mario_Bros_The_30_Greatest_SFX/19%20Super%20Mario%20Bros.%20-%20Pipe%20Travel%20SFX.mp3',
  fireball: 'https://ia600208.us.archive.org/29/items/Super_Mario_Bros_The_30_Greatest_SFX/20%20Super%20Mario%20Bros.%20-%20Fireball%20SFX.mp3',
  kick: 'https://ia600208.us.archive.org/29/items/Super_Mario_Bros_The_30_Greatest_SFX/18%20Super%20Mario%20Bros.%20-%20Kick%20SFX.mp3',
  pause: 'https://ia600208.us.archive.org/29/items/Super_Mario_Bros_The_30_Greatest_SFX/15%20Super%20Mario%20Bros.%20-%20Power-Down%20SFX.mp3',
  stomp: 'https://ia600208.us.archive.org/29/items/Super_Mario_Bros_The_30_Greatest_SFX/24%20Super%20Mario%20Bros.%20-%20Stomp%20SFX.mp3',
  gameOver: 'https://ia600208.us.archive.org/29/items/Super_Mario_Bros_The_30_Greatest_SFX/05%20Super%20Mario%20Bros.%20-%20Game%20Over.mp3',
  stageClear: 'https://ia600208.us.archive.org/29/items/Super_Mario_Bros_The_30_Greatest_SFX/08%20Super%20Mario%20Bros.%20-%20World%20Clear%20Fanfare.mp3',
  warning: 'https://ia600208.us.archive.org/29/items/Super_Mario_Bros_The_30_Greatest_SFX/02%20Super%20Mario%20Bros.%20-%20Hurry%21.mp3',
  bowserFall: 'https://ia600208.us.archive.org/29/items/Super_Mario_Bros_The_30_Greatest_SFX/21%20Super%20Mario%20Bros.%20-%20Bowser%20Falls%20SFX.mp3',
  bowserFire: 'https://ia600208.us.archive.org/29/items/Super_Mario_Bros_The_30_Greatest_SFX/22%20Super%20Mario%20Bros.%20-%20Bowser%20Fire%20SFX.mp3',
  mariodie: 'https://ia600208.us.archive.org/29/items/Super_Mario_Bros_The_30_Greatest_SFX/13%20Super%20Mario%20Bros.%20-%20Mario%20Dies%20SFX.mp3',
}

const audioCache: Map<string, HTMLAudioElement[]> = new Map()
let audioContext: AudioContext | null = null
let isAudioInitialized = false
let soundEffectsEnabled = false
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
      audio.load()
      pool.push(audio)
    }
    audioCache.set(soundUrl, pool)
  }
  return audioCache.get(soundUrl)![0]
}

export function playSound(soundUrl: string, volume = 0.7): void {
  if (!soundEffectsEnabled) return
  try {
    forceUnlockAudio()
    
    let audio: HTMLAudioElement | null = null
    
    if (audioCache.has(soundUrl)) {
      const pool = audioCache.get(soundUrl)!
      audio = pool.find(a => a.paused || a.ended || a.currentTime === 0) || pool[0]
      audio.currentTime = 0
    } else {
      audio = new Audio(soundUrl)
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
                } else {
                }
              }, 100 * (retryCount + 1))
            } else {
              console.warn('Unable to play Mario sound after retries:', soundUrl)
            }
          })
      } else {
        console.warn('Audio play promise not available for:', soundUrl)
      }
    }
    
    attemptPlay()
  } catch (e) {
    console.error('Sound error:', e)
  }
}

export function setSoundEffectsEnabled(enabled: boolean) {
  soundEffectsEnabled = enabled
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
