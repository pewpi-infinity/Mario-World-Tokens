import { useState } from 'react'
import { MarioToken, Denomination } from '@/lib/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Printer } from '@phosphor-icons/react'
import { generateSerialNumber } from '@/lib/currency'
import { toast } from 'sonner'

interface MintingInterfaceProps {
  currentUser: string
  onMint: (token: MarioToken) => void
}

export function MintingInterface({ currentUser, onMint }: MintingInterfaceProps) {
  const [denomination, setDenomination] = useState<Denomination>(1)
  const [location, setLocation] = useState('')
  const [designNotes, setDesignNotes] = useState('')

  const handleMint = () => {
    if (!location.trim()) {
      toast.error('Location is required')
      return
    }
    if (!designNotes.trim()) {
      toast.error('Design notes are required')
      return
    }

    const newToken: MarioToken = {
      id: `token-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      serialNumber: generateSerialNumber(),
      denomination,
      mintedBy: currentUser,
      mintedAt: Date.now(),
      location: location.trim(),
      designNotes: designNotes.trim(),
      currentOwner: currentUser,
    }

    onMint(newToken)
    setLocation('')
    setDesignNotes('')
    toast.success(`Successfully minted $${denomination} note`)
  }

  return (
    <Card className="border-2 shadow-lg">
      <CardHeader className="bg-secondary text-secondary-foreground">
        <CardTitle className="flex items-center gap-2">
          <Printer size={24} weight="fill" />
          Token Minting Press
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-6 space-y-4">
        <div className="space-y-2">
          <Label htmlFor="denomination">Denomination</Label>
          <Select
            value={denomination.toString()}
            onValueChange={(value) => setDenomination(parseInt(value) as Denomination)}
          >
            <SelectTrigger id="denomination">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">$1</SelectItem>
              <SelectItem value="5">$5</SelectItem>
              <SelectItem value="10">$10</SelectItem>
              <SelectItem value="20">$20</SelectItem>
              <SelectItem value="50">$50</SelectItem>
              <SelectItem value="100">$100</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="location">Minting Location</Label>
          <Input
            id="location"
            placeholder="e.g., San Francisco, CA"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="design-notes">Design Notes</Label>
          <Textarea
            id="design-notes"
            placeholder="e.g., Series 2025, Classic Green Design"
            value={designNotes}
            onChange={(e) => setDesignNotes(e.target.value)}
            rows={3}
          />
        </div>

        <Button
          onClick={handleMint}
          className="w-full"
          size="lg"
        >
          <Printer size={20} className="mr-2" weight="fill" />
          Mint Token
        </Button>
      </CardContent>
    </Card>
  )
}
