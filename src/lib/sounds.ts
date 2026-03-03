export const MARIO_SOUNDS = {
  coin: 'https://ia600200.us.archive.org/35/items/marioSoundEffects/smb_coin.wav',
  brick: 'https://ia600200.us.archive.org/35/items/marioSoundEffects/smb_breakblock.wav',
  bump: 'https://ia600200.us.archive.org/35/items/marioSoundEffects/smb_bump.wav',
  jump: 'https://ia600200.us.archive.org/35/items/marioSoundEffects/smb_jump-small.wav',
  powerUp: 'https://ia600200.us.archive.org/35/items/marioSoundEffects/smb_powerup.wav',
  oneUp: 'https://ia600200.us.archive.org/35/items/marioSoundEffects/smb_1-up.wav',
  pipe: 'https://ia600200.us.archive.org/35/items/marioSoundEffects/smb_pipe.wav',
  fireball: 'https://ia600200.us.archive.org/35/items/marioSoundEffects/smb_fireball.wav',
  kick: 'https://ia600200.us.archive.org/35/items/marioSoundEffects/smb_kick.wav',
  pause: 'https://ia600200.us.archive.org/35/items/marioSoundEffects/smb_pause.wav',
  stomp: 'https://ia600200.us.archive.org/35/items/marioSoundEffects/smb_stomp.wav',
  gameOver: 'https://ia600200.us.archive.org/35/items/marioSoundEffects/smb_gameover.wav',
  stageClear: 'https://ia600200.us.archive.org/35/items/marioSoundEffects/smb_stage_clear.wav',
  warning: 'https://ia600200.us.archive.org/35/items/marioSoundEffects/smb_warning.wav',
  bowserFall: 'https://ia600200.us.archive.org/35/items/marioSoundEffects/smb_bowserfall.wav',
  bowserFire: 'https://ia600200.us.archive.org/35/items/marioSoundEffects/smb_bowserfire.wav',
  mariodie: 'https://ia600200.us.archive.org/35/items/marioSoundEffects/smb_mariodie.wav',
}

const audioCache: Map<string, HTMLAudioElement[]> = new Map()
let audioContext: AudioContext | null = null
let userInteracted = false
let soundsEnabled = false
const POOL_SIZE = 5

export function initializeAudioContext() {
  if (!audioContext) {
    try {
      audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
    } catch (e) {
      console.warn('AudioContext not supported')
      soundsEnabled = true
      userInteracted = true
      return
    }
  }
  
  if (audioContext.state === 'suspended') {
    audioContext.resume().then(() => {
      soundsEnabled = true
      userInteracted = true
      console.log('🔊 Audio enabled!')
    }).catch(() => {
      soundsEnabled = true
      userInteracted = true
    })
  } else {
    soundsEnabled = true
    userInteracted = true
  }
}

export function preloadSound(soundUrl: string) {
  if (!audioCache.has(soundUrl)) {
    const pool: HTMLAudioElement[] = []
    for (let i = 0; i < POOL_SIZE; i++) {
      const audio = new Audio()
      audio.src = soundUrl
      audio.preload = 'auto'
      audio.load()
      pool.push(audio)
    }
    audioCache.set(soundUrl, pool)
  }
  return audioCache.get(soundUrl)!
}

export function playSound(soundUrl: string, volume = 0.5) {
  if (!userInteracted) {
    console.log('Waiting for user interaction...')
    return
  }
  
  try {
    let pool = audioCache.get(soundUrl)
    
    if (!pool) {
      pool = preloadSound(soundUrl)
    }
    
    const availableAudio = pool.find(audio => audio.paused || audio.ended || audio.currentTime === 0)
    const audio = availableAudio || pool[0]
    
    audio.volume = Math.max(0, Math.min(1, volume))
    audio.currentTime = 0
    
    const playPromise = audio.play()
    
    if (playPromise !== undefined) {
      playPromise.catch((error) => {
        console.log('Playback issue:', error.message)
      })
    }
  } catch (error) {
    console.log('Error playing sound:', error)
  }
}

export function preloadAllSounds() {
  console.log('Preloading all Mario sounds...')
  Object.entries(MARIO_SOUNDS).forEach(([name, soundUrl]) => {
    preloadSound(soundUrl)
    console.log(`Loaded: ${name}`)
  })
  console.log('All sounds preloaded!')
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
