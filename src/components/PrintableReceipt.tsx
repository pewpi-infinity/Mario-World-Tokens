import { Transaction, MarioToken } from '@/lib/types'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Printer, Seal } from '@phosphor-icons/react'
import { formatTimestamp } from '@/lib/currency'

interface PrintableReceiptProps {
  transaction: Transaction
  token: MarioToken | undefined
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function PrintableReceipt({ transaction, token, open, onOpenChange }: PrintableReceiptProps) {
  const handlePrint = () => {
    window.print()
  }

  if (!token) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl print:shadow-none print:border-0">
        <DialogHeader className="print:hidden">
          <DialogTitle>Transaction Receipt</DialogTitle>
        </DialogHeader>

        <div id="receipt-content" className="space-y-6 p-6 print:p-0">
          <div className="text-center border-b-2 border-foreground pb-6 print:border-black">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Seal size={32} weight="fill" className="text-primary print:text-black" />
              <h1 className="text-3xl font-bold font-serif">Mario Tokens</h1>
            </div>
            <p className="text-sm text-muted-foreground print:text-gray-700">Federal Reserve Note</p>
            <p className="text-xs text-muted-foreground print:text-gray-600 mt-1">Official Transaction Receipt</p>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-muted-foreground print:text-gray-600 mb-1">Transaction ID</p>
                <p className="font-mono text-sm break-all">{transaction.id}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground print:text-gray-600 mb-1">Date & Time</p>
                <p className="text-sm">{formatTimestamp(transaction.timestamp)}</p>
              </div>
            </div>

            <Separator className="print:border-gray-300" />

            <div className="bg-muted p-4 rounded-lg print:bg-gray-50 print:border print:border-gray-300">
              <h3 className="font-semibold mb-3 font-serif">Note Details</h3>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-xs text-muted-foreground print:text-gray-600">Serial Number</p>
                  <p className="serial-number text-sm">{transaction.serialNumber}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground print:text-gray-600">Denomination</p>
                  <p className="text-lg font-bold">${transaction.denomination}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground print:text-gray-600">Original Minter</p>
                  <p className="text-sm">{token.mintedBy}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground print:text-gray-600">Minting Location</p>
                  <p className="text-sm">{token.location}</p>
                </div>
              </div>
            </div>

            <Separator className="print:border-gray-300" />

            <div className="space-y-3">
              <h3 className="font-semibold font-serif">Transfer Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground print:text-gray-600 mb-1">From</p>
                  <p className="font-medium">{transaction.from}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground print:text-gray-600 mb-1">To</p>
                  <p className="font-medium">{transaction.to}</p>
                </div>
              </div>
            </div>

            <Separator className="print:border-gray-300" />

            <div className="bg-accent/10 p-4 rounded-lg print:bg-gray-50 print:border print:border-gray-300">
              <p className="text-xs text-muted-foreground print:text-gray-600 mb-2">Design Notes</p>
              <p className="text-sm italic">{token.designNotes}</p>
            </div>
          </div>

          <div className="text-center pt-6 border-t border-border print:border-gray-300">
            <p className="text-xs text-muted-foreground print:text-gray-600">
              This receipt certifies the transfer of a Federal Reserve Note
            </p>
            <p className="text-xs text-muted-foreground print:text-gray-600 mt-1">
              Printed: {new Date().toLocaleString()}
            </p>
          </div>
        </div>

        <div className="print:hidden flex justify-end gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
          <Button onClick={handlePrint}>
            <Printer size={18} className="mr-2" />
            Print Receipt
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
