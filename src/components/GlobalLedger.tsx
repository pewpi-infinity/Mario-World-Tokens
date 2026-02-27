import { useState } from 'react'
import { MarioToken, Transaction } from '@/lib/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Scroll, Sparkle } from '@phosphor-icons/react'
import { formatTimestamp, isRareSerial } from '@/lib/currency'
import { ScrollArea } from '@/components/ui/scroll-area'

interface GlobalLedgerProps {
  tokens: MarioToken[]
  transactions: Transaction[]
}

export function GlobalLedger({ tokens, transactions }: GlobalLedgerProps) {
  const [search, setSearch] = useState('')

  const filteredTokens = tokens.filter(token =>
    token.serialNumber.toLowerCase().includes(search.toLowerCase()) ||
    token.currentOwner.toLowerCase().includes(search.toLowerCase()) ||
    token.mintedBy.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <Card className="border-2 shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Scroll size={24} className="text-primary" weight="fill" />
          Global Transaction Ledger
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Input
          placeholder="Search by serial number, owner, or minter..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <ScrollArea className="h-[500px]">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Serial Number</TableHead>
                <TableHead>Denomination</TableHead>
                <TableHead>Current Owner</TableHead>
                <TableHead>Minted By</TableHead>
                <TableHead>Minted At</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTokens.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground">
                    No tokens found
                  </TableCell>
                </TableRow>
              ) : (
                filteredTokens.map((token) => (
                  <TableRow key={token.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className="serial-number text-sm">{token.serialNumber}</span>
                        {isRareSerial(token.serialNumber) && (
                          <Sparkle size={16} className="text-accent" weight="fill" />
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">${token.denomination}</Badge>
                    </TableCell>
                    <TableCell className="font-medium">{token.currentOwner}</TableCell>
                    <TableCell className="text-muted-foreground">{token.mintedBy}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {formatTimestamp(token.mintedAt)}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </ScrollArea>

        <div className="pt-4 border-t">
          <p className="text-sm text-muted-foreground">
            Total tokens in circulation: {tokens.length} (${tokens.reduce((sum, t) => sum + t.denomination, 0).toLocaleString()})
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            Total transactions: {transactions.length}
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
