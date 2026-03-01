import { useEffect, useRef } from 'react'
import { EditorState } from '@/lib/types'

interface ImageCanvasProps {
  imageSrc: string
  editorState: EditorState | undefined
}

export function ImageCanvas({ imageSrc, editorState }: ImageCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const imgRef = useRef<HTMLImageElement | null>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const img = new Image()
    img.src = imageSrc
    img.onload = () => {
      imgRef.current = img
      canvas.width = img.width
      canvas.height = img.height
      render()
    }
  }, [imageSrc])

  useEffect(() => {
    render()
  }, [editorState])

  const render = () => {
    const canvas = canvasRef.current
    const img = imgRef.current
    if (!canvas || !img || !editorState) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    ctx.clearRect(0, 0, canvas.width, canvas.height)

    ctx.filter = 'none'
    ctx.globalCompositeOperation = 'source-over'

    const { filter, color, pixel } = editorState

    let filterStr = ''
    if (color.hue !== 0) {
      filterStr += `hue-rotate(${color.hue}deg) `
    }
    if (color.saturation !== 100) {
      filterStr += `saturate(${color.saturation}%) `
    }
    if (color.brightness !== 100) {
      filterStr += `brightness(${color.brightness}%) `
    }

    ctx.filter = filterStr || 'none'

    if (pixel.pixelation > 0) {
      const scale = 1 - (pixel.pixelation / 100) * 0.9
      const scaledWidth = Math.max(1, Math.floor(canvas.width * scale))
      const scaledHeight = Math.max(1, Math.floor(canvas.height * scale))

      ctx.imageSmoothingEnabled = false
      ctx.drawImage(img, 0, 0, scaledWidth, scaledHeight)
      ctx.drawImage(canvas, 0, 0, scaledWidth, scaledHeight, 0, 0, canvas.width, canvas.height)
    } else {
      ctx.drawImage(img, 0, 0)
    }

    if (filter.type === 'crt') {
      applyCRTFilter(ctx, canvas, filter.intensity)
    } else if (filter.type === 'vhs') {
      applyVHSFilter(ctx, canvas, filter.intensity)
    } else if (filter.type === 'gameboy') {
      applyGameBoyFilter(ctx, canvas, filter.intensity)
    } else if (filter.type === 'nes') {
      applyNESFilter(ctx, canvas, filter.intensity)
    } else if (filter.type === 'glitch') {
      applyGlitchFilter(ctx, canvas, filter.intensity)
    } else if (filter.type === 'arcade') {
      applyArcadeFilter(ctx, canvas, filter.intensity)
    }

    if (color.palette !== 'original') {
      applyPalette(ctx, canvas, color.palette, editorState)
    }

    editorState.stickers.forEach((sticker) => {
      drawSticker(ctx, sticker)
    })
  }

  const applyCRTFilter = (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, intensity: number) => {
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
    const data = imageData.data

    for (let y = 0; y < canvas.height; y += 3) {
      for (let x = 0; x < canvas.width; x++) {
        const i = (y * canvas.width + x) * 4
        const darkness = (intensity / 100) * 0.3
        data[i] *= (1 - darkness)
        data[i + 1] *= (1 - darkness)
        data[i + 2] *= (1 - darkness)
      }
    }

    ctx.putImageData(imageData, 0, 0)
  }

  const applyVHSFilter = (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, intensity: number) => {
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
    const data = imageData.data

    const shift = Math.floor((intensity / 100) * 5)
    for (let i = 0; i < data.length; i += 4) {
      const shiftedIndex = i + shift * 4
      if (shiftedIndex < data.length) {
        data[i] = data[shiftedIndex]
      }
    }

    ctx.putImageData(imageData, 0, 0)
  }

  const applyGameBoyFilter = (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, intensity: number) => {
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
    const data = imageData.data

    const palette = [
      [15, 56, 15],
      [48, 98, 48],
      [139, 172, 15],
      [155, 188, 15]
    ]

    for (let i = 0; i < data.length; i += 4) {
      const gray = (data[i] + data[i + 1] + data[i + 2]) / 3
      const colorIndex = Math.floor((gray / 255) * (palette.length - 1))
      const color = palette[colorIndex]

      const mix = intensity / 100
      data[i] = data[i] * (1 - mix) + color[0] * mix
      data[i + 1] = data[i + 1] * (1 - mix) + color[1] * mix
      data[i + 2] = data[i + 2] * (1 - mix) + color[2] * mix
    }

    ctx.putImageData(imageData, 0, 0)
  }

  const applyNESFilter = (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, intensity: number) => {
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
    const data = imageData.data

    const reduction = Math.floor((intensity / 100) * 200)
    for (let i = 0; i < data.length; i += 4) {
      if (reduction > 0) {
        data[i] = Math.round(data[i] / reduction) * reduction
        data[i + 1] = Math.round(data[i + 1] / reduction) * reduction
        data[i + 2] = Math.round(data[i + 2] / reduction) * reduction
      }
    }

    ctx.putImageData(imageData, 0, 0)
  }

  const applyGlitchFilter = (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, intensity: number) => {
    const sliceCount = Math.floor((intensity / 100) * 10)
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)

    for (let i = 0; i < sliceCount; i++) {
      const y = Math.floor(Math.random() * canvas.height)
      const height = Math.floor(Math.random() * 20) + 5
      const offset = (Math.random() - 0.5) * 20

      const slice = ctx.getImageData(0, y, canvas.width, height)
      ctx.putImageData(slice, offset, y)
    }
  }

  const applyArcadeFilter = (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, intensity: number) => {
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
    const data = imageData.data

    const boost = 1 + (intensity / 100) * 0.5
    for (let i = 0; i < data.length; i += 4) {
      data[i] = Math.min(255, data[i] * boost)
      data[i + 1] = Math.min(255, data[i + 1] * boost)
      data[i + 2] = Math.min(255, data[i + 2] * boost)
    }

    ctx.putImageData(imageData, 0, 0)
  }

  const applyPalette = (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, palette: string, state: EditorState) => {
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
    const data = imageData.data

    let hueShift = 0
    if (palette === 'fire') hueShift = 0
    else if (palette === 'luigi') hueShift = 120
    else if (palette === 'ice') hueShift = 200
    else if (palette === 'gold') hueShift = 45
    else if (palette === 'monochrome') {
      for (let i = 0; i < data.length; i += 4) {
        const gray = (data[i] + data[i + 1] + data[i + 2]) / 3
        data[i] = gray
        data[i + 1] = gray
        data[i + 2] = gray
      }
      ctx.putImageData(imageData, 0, 0)
      return
    }

    ctx.putImageData(imageData, 0, 0)
  }

  const drawSticker = (ctx: CanvasRenderingContext2D, sticker: any) => {
    ctx.save()
    ctx.translate(sticker.x, sticker.y)
    ctx.rotate((sticker.rotation * Math.PI) / 180)
    ctx.scale(sticker.scale, sticker.scale)

    ctx.font = '40px Arial'
    ctx.fillText(sticker.type, -20, 20)

    ctx.restore()
  }

  return (
    <div className="flex items-center justify-center bg-muted/20 rounded-lg p-4 crt-effect">
      <canvas
        ref={canvasRef}
        className="max-w-full h-auto border-4 border-border rounded"
        style={{ imageRendering: editorState?.pixel.pixelation ? 'pixelated' : 'auto' }}
      />
    </div>
  )
}
