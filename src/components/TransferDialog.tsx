import { useState } from 'react'
import { MarioToken } from '@/lib/types'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ScrollArea } from '@/components/ui/scroll-area'
import { ArrowsLeftRight, Check } from '@phosphor-icons/react'
import { TokenCard } from './TokenCard'
import { toast } from 'sonner'
import { validateGitHubUsername } from '@/lib/currency'

interface TransferDialogProps {
  availableTokens: MarioToken[]
  onTransfer: (tokenIds: string[], recipient: string) => void
}

export function TransferDialog({ availableTokens, onTransfer }: TransferDialogProps) {
  const [open, setOpen] = useState(false)
  const [recipient, setRecipient] = useState('')
  const [selectedTokenIds, setSelectedTokenIds] = useState<string[]>([])

  const handleToggleToken = (tokenId: string) => {
    setSelectedTokenIds((prev) =>
      prev.includes(tokenId)
        ? prev.filter((id) => id !== tokenId)
        : [...prev, tokenId]
    )
  }

  const handleTransfer = () => {
    if (!recipient.trim()) {
      toast.error('GitHub username is required')
      return
    }
    if (!validateGitHubUsername(recipient.trim())) {
      toast.error('Invalid GitHub username format')
      return
    }
    if (selectedTokenIds.length === 0) {
      toast.error('Please select at least one token to transfer')
      return
    }

    onTransfer(selectedTokenIds, recipient.trim())
    setRecipient('')
    setSelectedTokenIds([])
    setOpen(false)
    toast.success(`Successfully transferred ${selectedTokenIds.length} token(s)`)
  }

  const selectedTotal = availableTokens
    .filter(token => selectedTokenIds.includes(token.id))
    .reduce((sum, token) => sum + token.denomination, 0)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="default" size="lg">
          <ArrowsLeftRight size={20} className="mr-2" weight="bold" />
          Transfer Tokens
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Transfer Tokens</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="recipient">Recipient GitHub Username</Label>
            <Input
              id="recipient"
              placeholder="username"
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>Select Tokens to Transfer</Label>
            <ScrollArea className="h-[300px] border rounded-md p-4">
              {availableTokens.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">No tokens available</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {availableTokens.map((token) => (
                    <div key={token.id} className="relative">
                      <TokenCard
                        token={token}
                        onClick={() => handleToggleToken(token.id)}
                        selected={selectedTokenIds.includes(token.id)}
                      />
                      {selectedTokenIds.includes(token.id) && (
                        <div className="absolute top-2 left-2 bg-primary text-primary-foreground rounded-full p-1">
                          <Check size={16} weight="bold" />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </div>

          {selectedTokenIds.length > 0 && (
            <div className="bg-muted p-4 rounded-md">
              <p className="text-sm">
                Selected: {selectedTokenIds.length} token(s) = ${selectedTotal}
              </p>
            </div>
          )}

          <Button
            onClick={handleTransfer}
            className="w-full"
            size="lg"
            disabled={selectedTokenIds.length === 0 || !recipient.trim()}
          >
            Transfer Selected Tokens
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
