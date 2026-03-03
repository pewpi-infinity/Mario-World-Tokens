export const MARIO_SOUNDS = {
  coin: 'https://archive.org/download/marioSoundEffects/smb_coin.wav',
  brick: 'https://archive.org/download/marioSoundEffects/smb_breakblock.wav',
  bump: 'https://archive.org/download/marioSoundEffects/smb_bump.wav',
  jump: 'https://archive.org/download/marioSoundEffects/smb_jump-small.wav',
  powerUp: 'https://archive.org/download/marioSoundEffects/smb_powerup.wav',
  oneUp: 'https://archive.org/download/marioSoundEffects/smb_1-up.wav',
  pipe: 'https://archive.org/download/marioSoundEffects/smb_pipe.wav',
  fireball: 'https://archive.org/download/marioSoundEffects/smb_fireball.wav',
  kick: 'https://archive.org/download/marioSoundEffects/smb_kick.wav',
  pause: 'https://archive.org/download/marioSoundEffects/smb_pause.wav',
  stomp: 'https://archive.org/download/marioSoundEffects/smb_stomp.wav',
  gameOver: 'https://archive.org/download/marioSoundEffects/smb_gameover.wav',
  stageClear: 'https://archive.org/download/marioSoundEffects/smb_stage_clear.wav',
  warning: 'https://archive.org/download/marioSoundEffects/smb_warning.wav',
  bowserFall: 'https://archive.org/download/marioSoundEffects/smb_bowserfall.wav',
  bowserFire: 'https://archive.org/download/marioSoundEffects/smb_bowserfire.wav',
}

const audioCache: { [key: string]: HTMLAudioElement } = {}

export function preloadSound(soundUrl: string) {
  if (!audioCache[soundUrl]) {
    const audio = new Audio(soundUrl)
    audio.preload = 'auto'
    audioCache[soundUrl] = audio
  }
  return audioCache[soundUrl]
}

export function playSound(soundUrl: string, volume = 0.5) {
  try {
    let audio = audioCache[soundUrl]
    
    if (!audio) {
      audio = preloadSound(soundUrl)
    }
    
    const soundClone = audio.cloneNode() as HTMLAudioElement
    soundClone.volume = volume
    soundClone.play().catch(() => {
      console.warn('Sound playback failed:', soundUrl)
    })
  } catch (error) {
    console.warn('Error playing sound:', error)
  }
}

export function preloadAllSounds() {
  Object.values(MARIO_SOUNDS).forEach(soundUrl => {
    preloadSound(soundUrl)
  })
}

export const playBrickBreak = () => playSound(MARIO_SOUNDS.brick, 0.6)
export const playCoinSound = () => playSound(MARIO_SOUNDS.coin, 0.5)
export const playJump = () => playSound(MARIO_SOUNDS.jump, 0.4)
export const playPowerUp = () => playSound(MARIO_SOUNDS.powerUp, 0.5)
export const playOneUp = () => playSound(MARIO_SOUNDS.oneUp, 0.5)
export const playPipe = () => playSound(MARIO_SOUNDS.pipe, 0.5)
export const playFireball = () => playSound(MARIO_SOUNDS.fireball, 0.4)
export const playKick = () => playSound(MARIO_SOUNDS.kick, 0.4)
export const playPause = () => playSound(MARIO_SOUNDS.pause, 0.4)
export const playStomp = () => playSound(MARIO_SOUNDS.stomp, 0.4)
export const playGameOver = () => playSound(MARIO_SOUNDS.gameOver, 0.5)
export const playStageClear = () => playSound(MARIO_SOUNDS.stageClear, 0.5)
export const playWarning = () => playSound(MARIO_SOUNDS.warning, 0.4)
export const playBowserFall = () => playSound(MARIO_SOUNDS.bowserFall, 0.5)
export const playBowserFire = () => playSound(MARIO_SOUNDS.bowserFire, 0.4)
export const playBump = () => playSound(MARIO_SOUNDS.bump, 0.5)
