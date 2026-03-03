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
let userInteracted = false
let soundsEnabled = true
const POOL_SIZE = 5

export function initializeAudioContext() {
  if (!userInteracted) {
    userInteracted = true
    soundsEnabled = true
    console.log('✅ User interaction detected - sounds enabled!')
  }
  
  if (!audioContext) {
    try {
      audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
      console.log('🔊 AudioContext created:', audioContext.state)
    } catch (e) {
      console.warn('AudioContext not supported, using HTML5 Audio fallback')
    }
  }
  
  if (audioContext && audioContext.state === 'suspended') {
    audioContext.resume().then(() => {
      console.log('🔊 AudioContext resumed! State:', audioContext?.state)
    }).catch((err) => {
      console.warn('Could not resume AudioContext:', err)
    })
  }
  
  return audioContext
}

export function preloadSound(soundUrl: string) {
  if (!audioCache.has(soundUrl)) {
    const pool: HTMLAudioElement[] = []
    for (let i = 0; i < POOL_SIZE; i++) {
      const audio = new Audio()
      audio.src = soundUrl
      audio.preload = 'auto'
      audio.crossOrigin = 'anonymous'
      audio.load()
      pool.push(audio)
    }
    audioCache.set(soundUrl, pool)
    console.log(`📦 Preloaded: ${soundUrl}`)
  }
  return audioCache.get(soundUrl)!
}

export function playSound(soundUrl: string, volume = 0.7) {
  if (!soundsEnabled) {
    console.log('⚠️ Sound not enabled yet - call initializeAudioContext first')
    return
  }
  
  try {
    if (audioContext && audioContext.state === 'suspended') {
      audioContext.resume()
    }
    
    let pool = audioCache.get(soundUrl)
    
    if (!pool) {
      console.log('🔄 Sound not preloaded, loading on-demand:', soundUrl)
      pool = preloadSound(soundUrl)
    }
    
    const availableAudio = pool.find(audio => audio.paused || audio.ended || audio.currentTime === 0)
    const audio = availableAudio || pool[0]
    
    audio.volume = Math.max(0, Math.min(1, volume))
    audio.currentTime = 0
    
    const playPromise = audio.play()
    
    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          console.log('🔊 Sound played successfully!')
        })
        .catch((error) => {
          if (error.name !== 'AbortError' && error.name !== 'NotAllowedError') {
            console.warn('❌ Sound playback failed:', error.message, error.name)
          } else if (error.name === 'NotAllowedError') {
            console.log('🔇 Autoplay blocked - need user interaction')
          }
        })
    }
  } catch (error) {
    console.warn('❌ Error playing sound:', error)
  }
}

export function preloadAllSounds() {
  console.log('🎮 Preloading all Mario sounds...')
  Object.entries(MARIO_SOUNDS).forEach(([name, soundUrl]) => {
    preloadSound(soundUrl)
  })
  console.log('✅ All sounds preloaded! Total:', Object.keys(MARIO_SOUNDS).length)
  return true
}

export const playBrickBreak = () => { console.log('🧱 Brick!'); playSound(MARIO_SOUNDS.brick, 0.6) }
export const playCoinSound = () => { console.log('🪙 Coin!'); playSound(MARIO_SOUNDS.coin, 0.7) }
export const playJump = () => { console.log('🦘 Jump!'); playSound(MARIO_SOUNDS.jump, 0.5) }
export const playPowerUp = () => { console.log('⭐ Power Up!'); playSound(MARIO_SOUNDS.powerUp, 0.6) }
export const playOneUp = () => { console.log('👤 1-UP!'); playSound(MARIO_SOUNDS.oneUp, 0.6) }
export const playPipe = () => { console.log('🚰 Pipe!'); playSound(MARIO_SOUNDS.pipe, 0.6) }
export const playFireball = () => { console.log('🔥 Fireball!'); playSound(MARIO_SOUNDS.fireball, 0.5) }
export const playKick = () => { console.log('👟 Kick!'); playSound(MARIO_SOUNDS.kick, 0.5) }
export const playPause = () => { console.log('⏸️ Pause!'); playSound(MARIO_SOUNDS.pause, 0.5) }
export const playStomp = () => { console.log('👞 Stomp!'); playSound(MARIO_SOUNDS.stomp, 0.5) }
export const playGameOver = () => { console.log('💀 Game Over!'); playSound(MARIO_SOUNDS.gameOver, 0.6) }
export const playStageClear = () => { console.log('🏁 Stage Clear!'); playSound(MARIO_SOUNDS.stageClear, 0.6) }
export const playWarning = () => { console.log('⚠️ Warning!'); playSound(MARIO_SOUNDS.warning, 0.5) }
export const playBowserFall = () => { console.log('👹 Bowser Fall!'); playSound(MARIO_SOUNDS.bowserFall, 0.6) }
export const playBowserFire = () => { console.log('🔥 Bowser Fire!'); playSound(MARIO_SOUNDS.bowserFire, 0.5) }
export const playBump = () => { console.log('💥 Bump!'); playSound(MARIO_SOUNDS.bump, 0.6) }
export const playMarioDie = () => { console.log('💀 Mario Die!'); playSound(MARIO_SOUNDS.mariodie, 0.6) }

export function getSoundStatus() {
  return {
    enabled: soundsEnabled,
    interacted: userInteracted,
    cachedSounds: audioCache.size,
  }
}
