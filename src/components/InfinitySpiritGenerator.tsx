import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card } from '@/components/ui/card'
import { Sparkle, Download, ArrowClockwise } from '@phosphor-icons/react'
import { toast } from 'sonner'
import { Textarea } from '@/components/ui/textarea'

interface InfinitySpiritGeneratorProps {
  open: boolean
  onClose: () => void
  onGenerate: (imageData: string, description: string) => void
}

type ImageType = 'physics-animation' | 'chart' | 'educational-cartoon' | 'gif-animation' | 'scientific-diagram'

const imageTypes = [
  { value: 'physics-animation', label: '⚛️ Physics Animation (5sec GIF)', description: 'Moving physics concepts' },
  { value: 'chart', label: '📊 Data Chart/Graph', description: 'Statistical visualizations' },
  { value: 'educational-cartoon', label: '🎓 Educational Cartoon', description: 'Learning illustrations' },
  { value: 'gif-animation', label: '🎬 Custom GIF Animation', description: '5-second looping animation' },
  { value: 'scientific-diagram', label: '🔬 Scientific Diagram', description: 'Detailed scientific illustrations' }
]

export function InfinitySpiritGenerator({ open, onClose, onGenerate }: InfinitySpiritGeneratorProps) {
  const [imageType, setImageType] = useState<ImageType>('physics-animation')
  const [prompt, setPrompt] = useState('')
  const [generatedImage, setGeneratedImage] = useState<string | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [description, setDescription] = useState('')

  const physicsTopics = [
    'Newton\'s laws of motion with bouncing balls',
    'Pendulum wave pattern synchronization',
    'Electromagnetic field visualization',
    'Quantum particle wave-function collapse',
    'Projectile motion trajectory',
    'Conservation of momentum collision',
    'Simple harmonic oscillator',
    'Doppler effect with sound waves',
    'Centripetal force in circular motion',
    'Energy transformation in a roller coaster'
  ]

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast.error('Please enter a description')
      return
    }

    setIsGenerating(true)
    setGeneratedImage(null)

    try {
      const physicsKnowledge = `
You are an expert in ALL areas of physics including:
- Classical Mechanics (Newton's laws, momentum, energy, kinematics, dynamics)
- Thermodynamics (heat transfer, entropy, gas laws)
- Electromagnetism (electric fields, magnetic fields, circuits, waves)
- Quantum Mechanics (wave-particle duality, uncertainty principle, atomic structure)
- Optics (refraction, reflection, lenses, interference)
- Relativity (time dilation, space-time curvature)
- Fluid Dynamics (pressure, buoyancy, flow)
- Waves and Vibrations (resonance, harmonics, standing waves)
`

      let aiPrompt = ''
      
      if (imageType === 'physics-animation') {
        aiPrompt = window.spark.llmPrompt`${physicsKnowledge}

Create a detailed description for a 5-second looping GIF animation that illustrates this physics concept in a fun, cartoon Mario-style:

"${prompt}"

The animation should:
1. Show the physics principle in action with clear motion
2. Use bright, retro video game colors (reds, yellows, blues, greens)
3. Include simple geometric shapes and cartoon characters
4. Display 5 distinct frames that loop perfectly
5. Show vectors, forces, or energy with arrows/glowing effects
6. Be educational but visually exciting

Describe each of the 5 frames in detail, including colors, positions, movements, and physics annotations. Make it look like a retro arcade game teaching physics!

Format as: FRAME 1: [description], FRAME 2: [description], etc.`
      } else if (imageType === 'chart') {
        aiPrompt = window.spark.llmPrompt`Create a detailed description for a colorful data chart/graph in retro Mario style:

"${prompt}"

The chart should:
1. Use vibrant retro gaming colors (gold, red, blue, green)
2. Have pixel-art style borders and labels
3. Include clear data visualization (bars, lines, or pie segments)
4. Show Mario-themed icons as data points (coins, mushrooms, stars)
5. Have a retro arcade scoreboard aesthetic
6. Include a title and legend

Describe the complete chart layout, colors, data representation, and Mario-style decorative elements.`
      } else if (imageType === 'educational-cartoon') {
        aiPrompt = window.spark.llmPrompt`${physicsKnowledge}

Create a detailed description for an educational cartoon illustration in Mario retro style:

"${prompt}"

The illustration should:
1. Feature Mario/Luigi characters demonstrating the concept
2. Use speech bubbles with simple explanations
3. Include labeled diagrams with arrows
4. Use bright, friendly colors
5. Show step-by-step visual process
6. Be kid-friendly and engaging

Describe the full scene, character positions, labels, colors, and educational annotations.`
      } else if (imageType === 'gif-animation') {
        aiPrompt = window.spark.llmPrompt`Create a detailed description for a 5-second looping GIF animation in retro Mario style:

"${prompt}"

The animation should:
1. Have 5 distinct frames that loop smoothly
2. Use retro pixel-art or cartoon style
3. Include vibrant video game colors
4. Show clear motion and transformation
5. Feature Mario-universe elements (blocks, coins, pipes, etc.)
6. Be visually satisfying to watch on loop

Describe each of the 5 frames with specific details about positions, colors, and movements.`
      } else {
        aiPrompt = window.spark.llmPrompt`${physicsKnowledge}

Create a detailed description for a scientific diagram in colorful retro style:

"${prompt}"

The diagram should:
1. Show accurate scientific representations
2. Use color-coding for different elements
3. Include clear labels and annotations
4. Have arrows showing process flow or forces
5. Use a mix of cartoon style with technical accuracy
6. Include a legend explaining symbols

Describe the complete diagram layout, components, labels, colors, and scientific accuracy.`
      }

      const frameDescription = await window.spark.llm(aiPrompt, 'gpt-4o')
      setDescription(frameDescription)

      const canvas = document.createElement('canvas')
      canvas.width = 800
      canvas.height = 600
      const ctx = canvas.getContext('2d')!

      ctx.fillStyle = '#1a1a2e'
      ctx.fillRect(0, 0, 800, 600)

      if (imageType === 'physics-animation' || imageType === 'gif-animation') {
        drawAnimationFrames(ctx, frameDescription)
      } else if (imageType === 'chart') {
        drawChart(ctx, prompt)
      } else if (imageType === 'educational-cartoon') {
        drawEducationalCartoon(ctx, prompt)
      } else {
        drawScientificDiagram(ctx, prompt)
      }

      ctx.fillStyle = '#FFD700'
      ctx.font = 'bold 16px "Press Start 2P", monospace'
      ctx.textAlign = 'center'
      ctx.fillText('🌟 INFINITY SPIRIT GENERATOR 🌟', 400, 30)

      ctx.fillStyle = 'rgba(255, 255, 255, 0.8)'
      ctx.font = '12px "Press Start 2P", monospace'
      const lines = wrapText(ctx, prompt, 700)
      lines.forEach((line, i) => {
        ctx.fillText(line, 400, 570 + i * 15)
      })

      const imageData = canvas.toDataURL('image/png')
      setGeneratedImage(imageData)
      
      toast.success('✨ Image Generated!', {
        description: 'Your Infinity Spirit creation is ready'
      })

    } catch (error) {
      console.error('Generation error:', error)
      toast.error('Generation failed. Please try again.')
    } finally {
      setIsGenerating(false)
    }
  }

  const drawAnimationFrames = (ctx: CanvasRenderingContext2D, description: string) => {
    const frameWidth = 150
    const frameHeight = 100
    const padding = 10
    const startY = 100

    for (let i = 0; i < 5; i++) {
      const x = 50 + (frameWidth + padding) * i
      const y = startY

      ctx.fillStyle = `oklch(${0.3 + i * 0.1}_0.15_${i * 72})`
      ctx.fillRect(x, y, frameWidth, frameHeight)

      ctx.strokeStyle = '#FFD700'
      ctx.lineWidth = 3
      ctx.strokeRect(x, y, frameWidth, frameHeight)

      ctx.fillStyle = '#FFFFFF'
      ctx.font = 'bold 12px Arial'
      ctx.textAlign = 'center'
      ctx.fillText(`Frame ${i + 1}`, x + frameWidth / 2, y - 10)

      drawPhysicsElement(ctx, x, y, frameWidth, frameHeight, i)
    }

    ctx.fillStyle = 'rgba(255, 215, 0, 0.3)'
    ctx.font = '14px Arial'
    ctx.textAlign = 'left'
    const descLines = wrapText(ctx, description.substring(0, 200), 750)
    descLines.forEach((line, i) => {
      ctx.fillText(line, 25, startY + 150 + i * 18)
    })
  }

  const drawPhysicsElement = (ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, frame: number) => {
    const centerX = x + w / 2
    const centerY = y + h / 2
    const time = frame / 5

    ctx.save()
    ctx.translate(centerX, centerY)

    ctx.beginPath()
    ctx.arc(0, -20 * Math.cos(time * Math.PI * 2), 15, 0, Math.PI * 2)
    ctx.fillStyle = '#FF3333'
    ctx.fill()

    ctx.strokeStyle = '#00FF00'
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.moveTo(0, 0)
    ctx.lineTo(0, -20 * Math.cos(time * Math.PI * 2))
    ctx.stroke()

    ctx.beginPath()
    ctx.moveTo(-w / 2 + 10, h / 2 - 10)
    ctx.lineTo(w / 2 - 10, h / 2 - 10)
    ctx.strokeStyle = '#FFFFFF'
    ctx.lineWidth = 2
    ctx.stroke()

    ctx.restore()
  }

  const drawChart = (ctx: CanvasRenderingContext2D, topic: string) => {
    const chartX = 100
    const chartY = 150
    const chartWidth = 600
    const chartHeight = 300

    ctx.strokeStyle = '#FFD700'
    ctx.lineWidth = 3
    ctx.strokeRect(chartX, chartY, chartWidth, chartHeight)

    const bars = 8
    const barWidth = (chartWidth - 40) / bars
    const colors = ['#FF3333', '#FFD700', '#33FF33', '#3333FF', '#FF33FF', '#33FFFF', '#FF9933', '#9933FF']

    for (let i = 0; i < bars; i++) {
      const height = Math.random() * (chartHeight - 60) + 20
      const x = chartX + 20 + i * barWidth
      const y = chartY + chartHeight - height - 20

      ctx.fillStyle = colors[i]
      ctx.fillRect(x, y, barWidth - 10, height)

      ctx.strokeStyle = '#FFFFFF'
      ctx.lineWidth = 2
      ctx.strokeRect(x, y, barWidth - 10, height)

      ctx.fillStyle = '#FFFFFF'
      ctx.font = 'bold 10px Arial'
      ctx.textAlign = 'center'
      ctx.fillText(`${Math.floor(height)}`, x + barWidth / 2 - 5, y - 5)
    }

    ctx.strokeStyle = '#FFFFFF'
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.moveTo(chartX + 20, chartY + chartHeight - 20)
    ctx.lineTo(chartX + chartWidth - 20, chartY + chartHeight - 20)
    ctx.stroke()

    ctx.fillStyle = '#FFD700'
    ctx.font = 'bold 16px Arial'
    ctx.textAlign = 'center'
    ctx.fillText('📊 MARIO DATA CHART 📊', chartX + chartWidth / 2, chartY - 30)
  }

  const drawEducationalCartoon = (ctx: CanvasRenderingContext2D, topic: string) => {
    ctx.fillStyle = 'oklch(0.4_0.1_200)'
    ctx.fillRect(100, 100, 600, 400)

    ctx.strokeStyle = '#FFD700'
    ctx.lineWidth = 4
    ctx.strokeRect(100, 100, 600, 400)

    ctx.fillStyle = '#FF3333'
    ctx.beginPath()
    ctx.arc(250, 250, 40, 0, Math.PI * 2)
    ctx.fill()

    ctx.fillStyle = '#3333FF'
    ctx.fillRect(230, 260, 40, 60)

    ctx.fillStyle = '#FFD700'
    ctx.beginPath()
    ctx.arc(230, 200, 15, 0, Math.PI * 2)
    ctx.arc(270, 200, 15, 0, Math.PI * 2)
    ctx.fill()

    ctx.fillStyle = 'white'
    ctx.fillRect(420, 180, 220, 80)
    ctx.strokeStyle = '#000'
    ctx.lineWidth = 2
    ctx.strokeRect(420, 180, 220, 80)

    ctx.fillStyle = '#000'
    ctx.font = '14px Arial'
    ctx.textAlign = 'left'
    const speechLines = wrapText(ctx, 'Let me teach you about ' + topic + '!', 200)
    speechLines.forEach((line, i) => {
      ctx.fillText(line, 430, 200 + i * 20)
    })

    ctx.beginPath()
    ctx.moveTo(420, 220)
    ctx.lineTo(360, 240)
    ctx.lineTo(420, 240)
    ctx.closePath()
    ctx.fillStyle = 'white'
    ctx.fill()
    ctx.stroke()

    ctx.fillStyle = '#00FF00'
    ctx.font = 'bold 12px Arial'
    ctx.textAlign = 'center'
    ctx.fillText('⭐ Educational Moment! ⭐', 400, 480)
  }

  const drawScientificDiagram = (ctx: CanvasRenderingContext2D, topic: string) => {
    ctx.strokeStyle = '#00FFFF'
    ctx.lineWidth = 2

    ctx.beginPath()
    ctx.arc(250, 250, 80, 0, Math.PI * 2)
    ctx.stroke()

    ctx.fillStyle = '#FFD700'
    ctx.beginPath()
    ctx.arc(250, 250, 20, 0, Math.PI * 2)
    ctx.fill()

    for (let i = 0; i < 8; i++) {
      const angle = (i * Math.PI * 2) / 8
      const x1 = 250 + Math.cos(angle) * 60
      const y1 = 250 + Math.sin(angle) * 60
      const x2 = 250 + Math.cos(angle) * 100
      const y2 = 250 + Math.sin(angle) * 100

      ctx.strokeStyle = i % 2 === 0 ? '#FF3333' : '#33FF33'
      ctx.lineWidth = 3
      ctx.beginPath()
      ctx.moveTo(x1, y1)
      ctx.lineTo(x2, y2)
      ctx.stroke()

      ctx.fillStyle = i % 2 === 0 ? '#FF3333' : '#33FF33'
      ctx.beginPath()
      ctx.arc(x2, y2, 8, 0, Math.PI * 2)
      ctx.fill()
    }

    ctx.fillStyle = '#FFFFFF'
    ctx.font = 'bold 12px Arial'
    ctx.textAlign = 'left'
    ctx.fillText('🔬 Force Vectors', 450, 150)
    ctx.fillText('⚡ Energy Flow', 450, 180)
    ctx.fillText('🌀 Field Lines', 450, 210)
    ctx.fillText('📐 Measurements', 450, 240)

    ctx.strokeStyle = '#FFD700'
    ctx.lineWidth = 2
    ctx.strokeRect(440, 130, 200, 130)
  }

  const wrapText = (ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] => {
    const words = text.split(' ')
    const lines: string[] = []
    let currentLine = ''

    words.forEach(word => {
      const testLine = currentLine + word + ' '
      const metrics = ctx.measureText(testLine)
      if (metrics.width > maxWidth && currentLine !== '') {
        lines.push(currentLine)
        currentLine = word + ' '
      } else {
        currentLine = testLine
      }
    })
    lines.push(currentLine)
    return lines.slice(0, 3)
  }

  const handleUseImage = () => {
    if (generatedImage) {
      onGenerate(generatedImage, description)
      toast.success('Image added to token!')
      onClose()
    }
  }

  const handleDownload = () => {
    if (generatedImage) {
      const link = document.createElement('a')
      link.download = `infinity-spirit-${Date.now()}.png`
      link.href = generatedImage
      link.click()
      toast.success('Image downloaded!')
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl pixel-font flex items-center gap-2">
            <Sparkle size={24} weight="fill" className="text-[oklch(0.75_0.18_85)]" />
            INFINITY SPIRIT IMAGE GENERATOR
          </DialogTitle>
          <DialogDescription>
            AI-powered physics, charts, educational cartoons, and scientific visualizations
          </DialogDescription>
        </DialogHeader>

        <div className="grid md:grid-cols-2 gap-6 mt-4">
          <div className="space-y-4">
            <div>
              <Label className="text-base font-semibold">Image Type</Label>
              <Select value={imageType} onValueChange={(v) => setImageType(v as ImageType)}>
                <SelectTrigger className="mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {imageTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      <div>
                        <div className="font-semibold">{type.label}</div>
                        <div className="text-xs text-muted-foreground">{type.description}</div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-base font-semibold">Description</Label>
              <Textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Describe what you want to generate..."
                className="mt-2 min-h-[100px]"
              />
            </div>

            {imageType === 'physics-animation' && (
              <div>
                <Label className="text-sm font-semibold">Quick Physics Topics:</Label>
                <div className="mt-2 space-y-1 max-h-[200px] overflow-y-auto">
                  {physicsTopics.map((topic, idx) => (
                    <Button
                      key={idx}
                      variant="outline"
                      size="sm"
                      onClick={() => setPrompt(topic)}
                      className="w-full justify-start text-xs"
                    >
                      ⚛️ {topic}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            <div className="flex gap-2">
              <Button
                onClick={handleGenerate}
                disabled={isGenerating || !prompt}
                className="flex-1 bg-[oklch(0.75_0.18_85)] hover:bg-[oklch(0.85_0.20_85)] text-[oklch(0.15_0.02_280)]"
              >
                {isGenerating ? (
                  <>
                    <ArrowClockwise size={20} className="mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkle size={20} weight="fill" className="mr-2" />
                    Generate Image
                  </>
                )}
              </Button>
            </div>
          </div>

          <div className="space-y-4">
            <Card className="p-4 bg-[oklch(0.15_0.02_280)] border-2 border-[oklch(0.75_0.18_85)] min-h-[400px] flex items-center justify-center">
              {generatedImage ? (
                <img src={generatedImage} alt="Generated" className="max-w-full h-auto rounded-lg" />
              ) : (
                <div className="text-center text-muted-foreground">
                  <Sparkle size={48} weight="fill" className="mx-auto mb-2 opacity-30" />
                  <p className="text-sm">Your generated image will appear here</p>
                </div>
              )}
            </Card>

            {generatedImage && (
              <div className="flex gap-2">
                <Button onClick={handleDownload} variant="outline" className="flex-1">
                  <Download size={20} className="mr-2" />
                  Download
                </Button>
                <Button onClick={handleUseImage} className="flex-1 bg-[oklch(0.65_0.15_155)] hover:bg-[oklch(0.75_0.15_155)]">
                  Use in Token
                </Button>
              </div>
            )}
          </div>
        </div>

        {description && (
          <div className="mt-4 p-4 bg-muted rounded-lg">
            <Label className="text-sm font-semibold">AI Description:</Label>
            <p className="text-xs mt-2 text-muted-foreground whitespace-pre-wrap">{description.substring(0, 500)}...</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
