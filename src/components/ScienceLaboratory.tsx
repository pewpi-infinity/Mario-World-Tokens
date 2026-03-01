import { useState } from 'react'
import { useKV } from '@github/spark/hooks'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { 
  Flask, 
  Atom, 
  Lightbulb, 
  Radio, 
  Wrench,
  Lightning,
  Users,
  BookOpen,
  Cpu,
  MagnifyingGlass
} from '@phosphor-icons/react'
import { toast } from 'sonner'

interface ScienceLaboratoryProps {
  sciencePoints: number
  onBack: () => void
  onSpendPoints: (amount: number) => void
}

interface Experiment {
  id: string
  name: string
  description: string
  cost: number
  icon: string
  category: 'physics' | 'chemistry' | 'electronics' | 'engineering'
}

interface Component {
  id: string
  name: string
  type: string
  specs: Record<string, any>
  buildCost: number
  repairCost: number
  condition: number
  createdAt: number
}

interface CollaborativeProject {
  id: string
  title: string
  description: string
  participants: string[]
  contributions: { userId: string; timestamp: number; note: string }[]
  status: 'active' | 'completed' | 'abandoned'
  createdAt: number
}

export function ScienceLaboratory({ sciencePoints, onBack, onSpendPoints }: ScienceLaboratoryProps) {
  const [activeExperiment, setActiveExperiment] = useState<string | null>(null)
  const [experimentResults, setExperimentResults] = useKV<any[]>('experiment-results', [])
  const [userComponents, setUserComponents] = useKV<Component[]>('user-components', [])
  const [projects, setProjects] = useKV<CollaborativeProject[]>('collaborative-projects', [])
  const [activeTab, setActiveTab] = useState('experiments')

  const experiments: Experiment[] = [
    {
      id: 'tube-radio-build',
      name: '📻 Tube Radio Construction',
      description: 'Build a working vacuum tube radio from scratch. Learn about electron flow, amplification, and radio waves.',
      cost: 120,
      icon: '📻',
      category: 'electronics'
    },
    {
      id: 'light-bulb-physics',
      name: '💡 Light Bulb Engineering',
      description: 'Design and test different filament materials. Understand resistance, heat, and luminosity.',
      cost: 80,
      icon: '💡',
      category: 'physics'
    },
    {
      id: 'circuit-design',
      name: '⚡ Circuit Rewiring Master',
      description: 'Learn to diagnose and rewire electronic circuits. Master voltage, current, and resistance.',
      cost: 100,
      icon: '⚡',
      category: 'electronics'
    },
    {
      id: 'component-repair',
      name: '🔧 Component Repair Workshop',
      description: 'Fix broken electronics instead of replacing them. Fight planned obsolescence!',
      cost: 90,
      icon: '🔧',
      category: 'engineering'
    },
    {
      id: 'oscilloscope-analysis',
      name: '📊 Oscilloscope Waveform Analysis',
      description: 'Visualize electrical signals and sound waves. Understand frequency, amplitude, and phase.',
      cost: 110,
      icon: '📊',
      category: 'physics'
    },
    {
      id: 'chemistry-synthesis',
      name: '🧪 Chemical Synthesis Lab',
      description: 'Learn safe chemical reactions and compound creation. Real-world chemistry applications.',
      cost: 95,
      icon: '🧪',
      category: 'chemistry'
    },
    {
      id: 'magnetic-fields',
      name: '🧲 Electromagnetic Field Generator',
      description: 'Build electromagnets and study magnetic field interactions.',
      cost: 85,
      icon: '🧲',
      category: 'physics'
    },
    {
      id: 'solar-cell',
      name: '☀️ Solar Cell Engineering',
      description: 'Construct photovoltaic cells and learn about renewable energy conversion.',
      cost: 130,
      icon: '☀️',
      category: 'engineering'
    },
    {
      id: 'transistor-theory',
      name: '💻 Transistor & Logic Gates',
      description: 'Build digital logic from transistors. Foundation of all computers.',
      cost: 105,
      icon: '💻',
      category: 'electronics'
    },
    {
      id: 'spectrum-analyzer',
      name: '🌈 Light Spectrum Analysis',
      description: 'Break light into wavelengths. Study atomic emission and absorption.',
      cost: 115,
      icon: '🌈',
      category: 'physics'
    }
  ]

  const runExperiment = async (experiment: Experiment) => {
    if (sciencePoints < experiment.cost) {
      toast.error('Not enough Science Points!')
      return
    }

    onSpendPoints(experiment.cost)
    setActiveExperiment(experiment.id)
    
    toast.info(`🔬 Running ${experiment.name}...`)
    
    setTimeout(async () => {
      const prompt = (window as any).spark.llmPrompt`You are a science educator specializing in ${experiment.category}. 
      Provide educational content for an experiment called "${experiment.name}": ${experiment.description}
      
      Return a JSON object with:
      {
        "explanation": "Step-by-step what happens in this experiment (3-4 sentences)",
        "scientificPrinciple": "The core scientific principle being demonstrated",
        "realWorldApplication": "How this is used in real products/technology",
        "safetyTip": "One important safety consideration",
        "nextSteps": "How to improve or extend this experiment",
        "componentBuilt": "If applicable, what component or tool was created"
      }
      
      Make it accessible for ages 12+ but scientifically accurate.`
      
      try {
        const result = await (window as any).spark.llm(prompt, 'gpt-4o-mini', true)
        const parsed = JSON.parse(result)
        
        setExperimentResults((current) => [
          ...(current || []),
          {
            experimentId: experiment.id,
            experimentName: experiment.name,
            category: experiment.category,
            timestamp: Date.now(),
            ...parsed
          }
        ])

        if (parsed.componentBuilt && experiment.category === 'electronics' || experiment.category === 'engineering') {
          const newComponent: Component = {
            id: `comp-${Date.now()}`,
            name: parsed.componentBuilt,
            type: experiment.category,
            specs: {
              efficiency: Math.floor(Math.random() * 30) + 70,
              durability: Math.floor(Math.random() * 40) + 60
            },
            buildCost: experiment.cost,
            repairCost: Math.floor(experiment.cost * 0.3),
            condition: 100,
            createdAt: Date.now()
          }
          
          setUserComponents((current) => [...(current || []), newComponent])
          toast.success(`✅ Built: ${parsed.componentBuilt}`)
        } else {
          toast.success(`✅ Experiment Complete!`)
        }
        
        setActiveExperiment(null)
      } catch (error) {
        toast.error('Experiment failed - try again!')
        onSpendPoints(-experiment.cost)
        setActiveExperiment(null)
      }
    }, 3000)
  }

  const repairComponent = (component: Component) => {
    if (sciencePoints < component.repairCost) {
      toast.error('Not enough Science Points to repair!')
      return
    }

    onSpendPoints(component.repairCost)
    
    setUserComponents((current) => 
      (current || []).map(c => 
        c.id === component.id 
          ? { ...c, condition: 100 }
          : c
      )
    )
    
    toast.success(`🔧 ${component.name} repaired to 100%!`)
  }

  const upgradeComponent = async (component: Component) => {
    const upgradeCost = Math.floor(component.buildCost * 0.5)
    
    if (sciencePoints < upgradeCost) {
      toast.error('Not enough Science Points to upgrade!')
      return
    }

    onSpendPoints(upgradeCost)
    
    const prompt = (window as any).spark.llmPrompt`Suggest a specific upgrade for a ${component.type} component called "${component.name}". 
    Return JSON with: { "upgradeName": "name of upgrade", "improvement": "what improved", "newSpec": "new specification value" }
    Keep it brief and technical.`
    
    try {
      const result = await (window as any).spark.llm(prompt, 'gpt-4o-mini', true)
      const upgrade = JSON.parse(result)
      
      setUserComponents((current) => 
        (current || []).map(c => 
          c.id === component.id 
            ? { 
                ...c, 
                name: `${c.name} ${upgrade.upgradeName}`,
                specs: { ...c.specs, [upgrade.improvement]: upgrade.newSpec }
              }
            : c
        )
      )
      
      toast.success(`⚡ Upgraded: ${upgrade.upgradeName}!`)
    } catch (error) {
      toast.error('Upgrade failed!')
      onSpendPoints(-upgradeCost)
    }
  }

  const createCollaborativeProject = async () => {
    if (sciencePoints < 50) {
      toast.error('Need 50 Science Points to start a project!')
      return
    }

    const prompt = (window as any).spark.llmPrompt`Generate an interesting collaborative science project idea that multiple people could work on together. 
    Return JSON with: { "title": "project title", "description": "what the project aims to do (2 sentences)" }
    Focus on real-world impact and sustainability.`
    
    try {
      const result = await (window as any).spark.llm(prompt, 'gpt-4o-mini', true)
      const projectIdea = JSON.parse(result)
      
      onSpendPoints(50)
      
      const newProject: CollaborativeProject = {
        id: `proj-${Date.now()}`,
        title: projectIdea.title,
        description: projectIdea.description,
        participants: ['you'],
        contributions: [],
        status: 'active',
        createdAt: Date.now()
      }
      
      setProjects((current) => [...(current || []), newProject])
      toast.success(`🤝 Project Created: ${projectIdea.title}`)
    } catch (error) {
      toast.error('Failed to create project')
    }
  }

  const contributeToProject = (projectId: string, note: string) => {
    setProjects((current) => 
      (current || []).map(p => 
        p.id === projectId 
          ? {
              ...p,
              contributions: [
                ...p.contributions,
                { userId: 'you', timestamp: Date.now(), note }
              ]
            }
          : p
      )
    )
    
    toast.success('📝 Contribution added!')
  }

  const latestResult = experimentResults && experimentResults.length > 0 
    ? experimentResults[experimentResults.length - 1] 
    : null

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-[oklch(0.75_0.18_85)] pixel-font flex items-center gap-2">
          <Flask size={32} weight="fill" />
          SCIENCE LABORATORY
        </h2>
        <Button onClick={onBack} variant="outline" className="border-[oklch(0.35_0.05_285)]">
          ← Back to Race
        </Button>
      </div>

      <Card className="bg-[oklch(0.25_0.03_285)] border-[oklch(0.35_0.05_285)]">
        <CardContent className="pt-6">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-bold text-white">Science Points Balance</h3>
              <p className="text-sm text-[oklch(0.65_0.02_280)]">
                Earn more by racing! Use points to run experiments and build components.
              </p>
            </div>
            <div className="text-4xl font-bold text-[oklch(0.65_0.15_155)]">
              🔬 {sciencePoints}
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-4 w-full">
          <TabsTrigger value="experiments" className="flex items-center gap-2">
            <Atom size={18} weight="fill" />
            <span>Experiments</span>
          </TabsTrigger>
          <TabsTrigger value="components" className="flex items-center gap-2">
            <Wrench size={18} weight="fill" />
            <span>Components</span>
          </TabsTrigger>
          <TabsTrigger value="collaborative" className="flex items-center gap-2">
            <Users size={18} weight="fill" />
            <span>Collaborative</span>
          </TabsTrigger>
          <TabsTrigger value="library" className="flex items-center gap-2">
            <BookOpen size={18} weight="fill" />
            <span>Library</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="experiments" className="mt-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {experiments.map(experiment => (
              <Card 
                key={experiment.id}
                className={`bg-[oklch(0.18_0.02_280)] border-2 transition-all ${
                  activeExperiment === experiment.id
                    ? 'border-[oklch(0.75_0.18_85)] animate-pulse'
                    : 'border-[oklch(0.35_0.05_285)] hover:border-[oklch(0.70_0.24_190)]'
                }`}
              >
                <CardContent className="pt-6">
                  <div className="text-6xl text-center mb-4">{experiment.icon}</div>
                  <Badge className="mb-2 bg-[oklch(0.70_0.24_190)]">
                    {experiment.category}
                  </Badge>
                  <h4 className="font-bold text-white mb-2">{experiment.name}</h4>
                  <p className="text-sm text-[oklch(0.65_0.02_280)] mb-4 min-h-[60px]">
                    {experiment.description}
                  </p>
                  <div className="flex items-center justify-between mb-3">
                    <Badge className="bg-[oklch(0.75_0.18_85)]">
                      🔬 {experiment.cost}
                    </Badge>
                  </div>
                  <Button
                    onClick={() => runExperiment(experiment)}
                    disabled={sciencePoints < experiment.cost || activeExperiment !== null}
                    className="w-full bg-[oklch(0.65_0.15_155)] hover:bg-[oklch(0.70_0.17_155)] text-white disabled:opacity-50"
                  >
                    {activeExperiment === experiment.id ? 'Running...' : 'Run Experiment'}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          {latestResult && (
            <Card className="bg-[oklch(0.25_0.03_285)] border-2 border-[oklch(0.75_0.18_85)]">
              <CardContent className="pt-6">
                <h3 className="text-xl font-bold text-[oklch(0.75_0.18_85)] mb-4">
                  📊 Latest Experiment Result
                </h3>
                <div className="bg-[oklch(0.18_0.02_280)] p-4 rounded-lg space-y-3">
                  <div>
                    <h4 className="font-bold text-white mb-2">{latestResult.experimentName}</h4>
                    <Badge className="mb-2">{latestResult.category}</Badge>
                    <p className="text-[oklch(0.92_0.01_280)]">{latestResult.explanation}</p>
                  </div>
                  <div>
                    <h5 className="font-bold text-[oklch(0.75_0.18_85)] text-sm">🔬 Scientific Principle:</h5>
                    <p className="text-[oklch(0.92_0.01_280)] text-sm">{latestResult.scientificPrinciple}</p>
                  </div>
                  <div>
                    <h5 className="font-bold text-[oklch(0.65_0.15_155)] text-sm">🌍 Real-World Application:</h5>
                    <p className="text-[oklch(0.92_0.01_280)] text-sm">{latestResult.realWorldApplication}</p>
                  </div>
                  <div>
                    <h5 className="font-bold text-[oklch(0.58_0.24_330)] text-sm">⚠️ Safety Tip:</h5>
                    <p className="text-[oklch(0.92_0.01_280)] text-sm">{latestResult.safetyTip}</p>
                  </div>
                  <div>
                    <h5 className="font-bold text-[oklch(0.70_0.24_190)] text-sm">➡️ Next Steps:</h5>
                    <p className="text-[oklch(0.92_0.01_280)] text-sm">{latestResult.nextSteps}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="components" className="mt-6 space-y-6">
          <Card className="bg-[oklch(0.25_0.03_285)] border-[oklch(0.35_0.05_285)]">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  <Cpu size={24} weight="fill" />
                  Your Built Components
                </h3>
                <Badge className="bg-[oklch(0.75_0.18_85)]">
                  {(userComponents || []).length} Components
                </Badge>
              </div>
              <p className="text-sm text-[oklch(0.65_0.02_280)] mb-4">
                Components you've built can be maintained, repaired, and upgraded. Fight planned obsolescence by keeping things working forever!
              </p>
            </CardContent>
          </Card>

          {(userComponents || []).length === 0 ? (
            <Card className="bg-[oklch(0.18_0.02_280)] border-[oklch(0.35_0.05_285)]">
              <CardContent className="pt-12 pb-12 text-center">
                <Wrench size={64} className="mx-auto mb-4 text-[oklch(0.65_0.02_280)]" weight="fill" />
                <h4 className="text-xl font-bold text-white mb-2">No Components Yet</h4>
                <p className="text-[oklch(0.65_0.02_280)]">
                  Run electronics and engineering experiments to build components!
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {(userComponents || []).map(component => (
                <Card 
                  key={component.id}
                  className="bg-[oklch(0.18_0.02_280)] border-[oklch(0.35_0.05_285)]"
                >
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="font-bold text-white">{component.name}</h4>
                        <Badge className="mt-1">{component.type}</Badge>
                      </div>
                      <div className="text-right">
                        <div className={`text-2xl font-bold ${
                          component.condition > 70 ? 'text-[oklch(0.65_0.15_155)]' :
                          component.condition > 40 ? 'text-[oklch(0.75_0.18_85)]' :
                          'text-[oklch(0.58_0.24_330)]'
                        }`}>
                          {component.condition}%
                        </div>
                        <div className="text-xs text-[oklch(0.65_0.02_280)]">Condition</div>
                      </div>
                    </div>

                    <Progress value={component.condition} className="mb-4" />

                    <div className="grid grid-cols-2 gap-2 mb-4 text-sm">
                      {Object.entries(component.specs).map(([key, value]) => (
                        <div key={key} className="bg-[oklch(0.12_0.01_280)] p-2 rounded">
                          <div className="text-[oklch(0.65_0.02_280)] text-xs capitalize">{key}</div>
                          <div className="text-white font-bold">{value}</div>
                        </div>
                      ))}
                    </div>

                    <div className="flex gap-2">
                      {component.condition < 100 && (
                        <Button
                          onClick={() => repairComponent(component)}
                          disabled={sciencePoints < component.repairCost}
                          className="flex-1 bg-[oklch(0.58_0.24_330)] hover:bg-[oklch(0.63_0.26_330)] text-white text-sm disabled:opacity-50"
                        >
                          🔧 Repair ({component.repairCost})
                        </Button>
                      )}
                      <Button
                        onClick={() => upgradeComponent(component)}
                        disabled={sciencePoints < Math.floor(component.buildCost * 0.5)}
                        className="flex-1 bg-[oklch(0.70_0.24_190)] hover:bg-[oklch(0.75_0.26_190)] text-white text-sm disabled:opacity-50"
                      >
                        ⚡ Upgrade ({Math.floor(component.buildCost * 0.5)})
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="collaborative" className="mt-6 space-y-6">
          <Card className="bg-[oklch(0.25_0.03_285)] border-[oklch(0.35_0.05_285)]">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold text-white flex items-center gap-2">
                    <Users size={24} weight="fill" />
                    Collaborative Science Projects
                  </h3>
                  <p className="text-sm text-[oklch(0.65_0.02_280)] mt-2">
                    Work together on real science problems. Multiple people can contribute, preventing project abandonment.
                  </p>
                </div>
                <Button
                  onClick={createCollaborativeProject}
                  disabled={sciencePoints < 50}
                  className="bg-[oklch(0.75_0.18_85)] hover:bg-[oklch(0.80_0.20_85)] text-[oklch(0.15_0.02_280)] disabled:opacity-50"
                >
                  Start Project (50)
                </Button>
              </div>
            </CardContent>
          </Card>

          {(projects || []).length === 0 ? (
            <Card className="bg-[oklch(0.18_0.02_280)] border-[oklch(0.35_0.05_285)]">
              <CardContent className="pt-12 pb-12 text-center">
                <Users size={64} className="mx-auto mb-4 text-[oklch(0.65_0.02_280)]" weight="fill" />
                <h4 className="text-xl font-bold text-white mb-2">No Projects Yet</h4>
                <p className="text-[oklch(0.65_0.02_280)]">
                  Start a collaborative project to work with others on real science!
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {(projects || []).map(project => (
                <CollaborativeProjectCard 
                  key={project.id}
                  project={project}
                  onContribute={(note) => contributeToProject(project.id, note)}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="library" className="mt-6">
          <Card className="bg-[oklch(0.25_0.03_285)] border-[oklch(0.35_0.05_285)]">
            <CardContent className="pt-6">
              <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <BookOpen size={24} weight="fill" />
                Science Knowledge Library
              </h3>
              <p className="text-[oklch(0.65_0.02_280)] mb-6">
                All your completed experiments and their results. No textbooks needed - build your own knowledge base!
              </p>

              {experimentResults && experimentResults.length > 0 ? (
                <div className="space-y-3">
                  {[...experimentResults].reverse().map((result, index) => (
                    <Card key={index} className="bg-[oklch(0.18_0.02_280)] border-[oklch(0.35_0.05_285)]">
                      <CardContent className="pt-4">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h4 className="font-bold text-white">{result.experimentName}</h4>
                            <Badge className="mt-1">{result.category}</Badge>
                          </div>
                          <div className="text-xs text-[oklch(0.65_0.02_280)]">
                            {new Date(result.timestamp).toLocaleDateString()}
                          </div>
                        </div>
                        <p className="text-sm text-[oklch(0.92_0.01_280)] mb-2">
                          {result.explanation}
                        </p>
                        <div className="text-xs text-[oklch(0.70_0.24_190)]">
                          💡 {result.scientificPrinciple}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <MagnifyingGlass size={64} className="mx-auto mb-4 text-[oklch(0.65_0.02_280)]" weight="fill" />
                  <p className="text-[oklch(0.65_0.02_280)]">
                    Complete experiments to build your knowledge library!
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

function CollaborativeProjectCard({ 
  project, 
  onContribute 
}: { 
  project: CollaborativeProject
  onContribute: (note: string) => void 
}) {
  const [contributionNote, setContributionNote] = useState('')
  const [showContribute, setShowContribute] = useState(false)

  const handleSubmit = () => {
    if (contributionNote.trim()) {
      onContribute(contributionNote)
      setContributionNote('')
      setShowContribute(false)
    }
  }

  return (
    <Card className="bg-[oklch(0.18_0.02_280)] border-[oklch(0.35_0.05_285)]">
      <CardContent className="pt-6">
        <div className="flex items-start justify-between mb-3">
          <div>
            <h4 className="font-bold text-white text-lg">{project.title}</h4>
            <p className="text-sm text-[oklch(0.92_0.01_280)] mt-2">{project.description}</p>
          </div>
          <Badge className={`${
            project.status === 'active' ? 'bg-[oklch(0.65_0.15_155)]' :
            project.status === 'completed' ? 'bg-[oklch(0.75_0.18_85)]' :
            'bg-[oklch(0.35_0.05_285)]'
          }`}>
            {project.status}
          </Badge>
        </div>

        <div className="flex items-center gap-2 mb-4">
          <Users size={16} weight="fill" className="text-[oklch(0.65_0.02_280)]" />
          <span className="text-sm text-[oklch(0.65_0.02_280)]">
            {project.participants.length} participant{project.participants.length > 1 ? 's' : ''}
          </span>
          <span className="text-sm text-[oklch(0.65_0.02_280)]">•</span>
          <span className="text-sm text-[oklch(0.65_0.02_280)]">
            {project.contributions.length} contribution{project.contributions.length !== 1 ? 's' : ''}
          </span>
        </div>

        {project.contributions.length > 0 && (
          <div className="bg-[oklch(0.12_0.01_280)] rounded p-3 mb-4 max-h-40 overflow-y-auto">
            <h5 className="text-sm font-bold text-[oklch(0.75_0.18_85)] mb-2">Recent Contributions:</h5>
            <div className="space-y-2">
              {project.contributions.slice(-3).reverse().map((contrib, idx) => (
                <div key={idx} className="text-sm">
                  <div className="text-[oklch(0.65_0.02_280)] text-xs">
                    {new Date(contrib.timestamp).toLocaleString()}
                  </div>
                  <div className="text-white">{contrib.note}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {!showContribute ? (
          <Button
            onClick={() => setShowContribute(true)}
            className="w-full bg-[oklch(0.70_0.24_190)] hover:bg-[oklch(0.75_0.26_190)] text-white"
          >
            📝 Add Contribution
          </Button>
        ) : (
          <div className="space-y-2">
            <Label className="text-white">Your Contribution:</Label>
            <Textarea
              value={contributionNote}
              onChange={(e) => setContributionNote(e.target.value)}
              placeholder="Describe what you're adding to this project..."
              className="bg-[oklch(0.12_0.01_280)] border-[oklch(0.35_0.05_285)] text-white"
              rows={3}
            />
            <div className="flex gap-2">
              <Button
                onClick={handleSubmit}
                disabled={!contributionNote.trim()}
                className="flex-1 bg-[oklch(0.65_0.15_155)] hover:bg-[oklch(0.70_0.17_155)] text-white"
              >
                Submit
              </Button>
              <Button
                onClick={() => {
                  setShowContribute(false)
                  setContributionNote('')
                }}
                variant="outline"
                className="border-[oklch(0.35_0.05_285)]"
              >
                Cancel
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
