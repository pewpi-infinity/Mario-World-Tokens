export class SoundEffects {
  private audioContext: AudioContext | null = null

  private getAudioContext(): AudioContext {
    if (!this.audioContext) {
      this.audioContext = new AudioContext()
    }
    return this.audioContext
  }

  playCoinCollect() {
    const ctx = this.getAudioContext()
    const oscillator = ctx.createOscillator()
    const gainNode = ctx.createGain()

    oscillator.connect(gainNode)
    gainNode.connect(ctx.destination)

    oscillator.type = 'square'
    
    const now = ctx.currentTime
    oscillator.frequency.setValueAtTime(988, now)
    oscillator.frequency.setValueAtTime(1319, now + 0.1)
    
    gainNode.gain.setValueAtTime(0.3, now)
    gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.3)

    oscillator.start(now)
    oscillator.stop(now + 0.3)
  }

  playPowerUp() {
    const ctx = this.getAudioContext()
    const oscillator = ctx.createOscillator()
    const gainNode = ctx.createGain()

    oscillator.connect(gainNode)
    gainNode.connect(ctx.destination)

    oscillator.type = 'square'
    
    const now = ctx.currentTime
    const notes = [659, 784, 1047, 1319, 1568]
    
    notes.forEach((freq, i) => {
      oscillator.frequency.setValueAtTime(freq, now + i * 0.08)
    })
    
    gainNode.gain.setValueAtTime(0.2, now)
    gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.5)

    oscillator.start(now)
    oscillator.stop(now + 0.5)
  }

  playBrickBreak() {
    const ctx = this.getAudioContext()
    const oscillator = ctx.createOscillator()
    const gainNode = ctx.createGain()
    const noiseGain = ctx.createGain()

    oscillator.connect(gainNode)
    gainNode.connect(ctx.destination)

    oscillator.type = 'sawtooth'
    
    const now = ctx.currentTime
    oscillator.frequency.setValueAtTime(200, now)
    oscillator.frequency.exponentialRampToValueAtTime(50, now + 0.15)
    
    gainNode.gain.setValueAtTime(0.3, now)
    gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.15)

    const bufferSize = ctx.sampleRate * 0.15
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate)
    const output = buffer.getChannelData(0)
    
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1
    }
    
    const noise = ctx.createBufferSource()
    noise.buffer = buffer
    noise.connect(noiseGain)
    noiseGain.connect(ctx.destination)
    
    noiseGain.gain.setValueAtTime(0.1, now)
    noiseGain.gain.exponentialRampToValueAtTime(0.01, now + 0.15)

    oscillator.start(now)
    oscillator.stop(now + 0.15)
    noise.start(now)
    noise.stop(now + 0.15)
  }

  playJump() {
    const ctx = this.getAudioContext()
    const oscillator = ctx.createOscillator()
    const gainNode = ctx.createGain()

    oscillator.connect(gainNode)
    gainNode.connect(ctx.destination)

    oscillator.type = 'sine'
    
    const now = ctx.currentTime
    oscillator.frequency.setValueAtTime(600, now)
    oscillator.frequency.exponentialRampToValueAtTime(200, now + 0.2)
    
    gainNode.gain.setValueAtTime(0.3, now)
    gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.2)

    oscillator.start(now)
    oscillator.stop(now + 0.2)
  }
}

export const soundEffects = new SoundEffects()
