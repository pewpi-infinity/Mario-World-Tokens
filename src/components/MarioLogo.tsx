import { useEffect, useRef } from 'react'

export function MarioLogo({ animated = false }: { animated?: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const pixelSize = 4
    const mario = [
      [0,0,0,0,1,1,1,1,1,0,0,0,0],
      [0,0,0,1,1,1,1,1,1,1,1,1,0],
      [0,0,0,2,2,2,3,3,2,3,0,0,0],
      [0,0,2,3,2,3,3,3,2,3,3,3,0],
      [0,0,2,3,2,2,3,3,3,2,3,3,3],
      [0,0,2,2,3,3,3,3,2,2,2,2,0],
      [0,0,0,0,3,3,3,3,3,3,3,0,0],
      [0,0,0,1,1,5,1,1,1,0,0,0,0],
      [0,0,1,1,1,5,1,1,5,1,1,1,0],
      [0,1,1,1,1,5,5,5,5,1,1,1,1],
      [0,3,3,1,5,4,5,5,4,5,1,3,3],
      [0,3,3,3,5,5,5,5,5,5,3,3,3],
      [0,3,3,5,5,5,5,5,5,5,5,3,3],
      [0,0,0,5,5,5,0,0,5,5,5,0,0],
      [0,0,2,2,2,0,0,0,0,2,2,2,0],
      [0,2,2,2,2,0,0,0,0,2,2,2,2]
    ]

    const colors: Record<number, string> = {
      0: 'transparent',
      1: '#ff0000',
      2: '#8b4513',
      3: '#ffcc99',
      4: '#000000',
      5: '#0000ff'
    }

    const drawMario = (offsetY = 0) => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      mario.forEach((row, y) => {
        row.forEach((pixel, x) => {
          if (pixel !== 0) {
            ctx.fillStyle = colors[pixel]
            ctx.fillRect(x * pixelSize, (y + offsetY) * pixelSize, pixelSize, pixelSize)
          }
        })
      })
    }

    if (animated) {
      let frame = 0
      const animate = () => {
        const bounce = Math.sin(frame * 0.1) * 2
        drawMario(bounce)
        frame++
        requestAnimationFrame(animate)
      }
      animate()
    } else {
      drawMario()
    }
  }, [animated])

  return (
    <canvas
      ref={canvasRef}
      width={13 * 4}
      height={16 * 4}
      className="image-rendering-pixelated"
      style={{ imageRendering: 'pixelated' }}
    />
  )
}
