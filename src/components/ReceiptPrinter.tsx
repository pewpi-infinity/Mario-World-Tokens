import { useRef } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { MarioCoin, Transfer } from '@/lib/types'
import { Printer, Download } from '@phosphor-icons/react'
import marioImage from '@/assets/images/Screenshot_20260225-192747.png'

interface ReceiptPrinterProps {
  coin: MarioCoin
  transfer?: Transfer
  open: boolean
  onClose: () => void
  onReceiptRecorded?: (coinId: string) => void
  type: 'minting' | 'transfer'
}

export function ReceiptPrinter({ coin, transfer, open, onClose, onReceiptRecorded, type }: ReceiptPrinterProps) {
  const receiptRef = useRef<HTMLDivElement>(null)

  const handlePrint = () => {
    if (receiptRef.current) {
      const printContent = receiptRef.current.innerHTML
      const printWindow = window.open('', '', 'height=800,width=600')
      if (printWindow) {
        printWindow.document.write('<html><head><title>Mario Coin Receipt</title>')
        printWindow.document.write('<style>')
        printWindow.document.write(`
          body { font-family: monospace; padding: 20px; background: white; }
          .receipt { max-width: 400px; margin: 0 auto; border: 2px dashed #333; padding: 20px; }
          .header { text-align: center; margin-bottom: 20px; border-bottom: 2px solid #333; padding-bottom: 10px; }
          .pixel-font { font-family: 'Press Start 2P', monospace; font-size: 12px; }
          .row { display: flex; justify-content: space-between; margin: 8px 0; padding: 4px 0; }
          .label { font-weight: bold; }
          .value { text-align: right; }
          .section { margin: 15px 0; padding: 10px 0; border-top: 1px dashed #666; }
          .footer { text-align: center; margin-top: 20px; font-size: 10px; border-top: 2px solid #333; padding-top: 10px; }
          .logo { width: 60px; height: 60px; margin: 0 auto 10px; }
          @media print { body { padding: 0; } }
        `)
        printWindow.document.write('</style></head><body>')
        printWindow.document.write(printContent)
        printWindow.document.write('</body></html>')
        printWindow.document.close()
        printWindow.print()
        onReceiptRecorded?.(coin.id)
      }
    }
  }

  const handleDownload = () => {
    if (receiptRef.current) {
      const receiptHTML = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Mario Coin Receipt - ${coin.id}</title>
          <style>
            body { font-family: monospace; padding: 20px; background: white; }
            .receipt { max-width: 400px; margin: 0 auto; border: 2px dashed #333; padding: 20px; }
            .header { text-align: center; margin-bottom: 20px; border-bottom: 2px solid #333; padding-bottom: 10px; }
            .pixel-font { font-size: 14px; font-weight: bold; }
            .row { display: flex; justify-content: space-between; margin: 8px 0; padding: 4px 0; }
            .label { font-weight: bold; }
            .value { text-align: right; }
            .section { margin: 15px 0; padding: 10px 0; border-top: 1px dashed #666; }
            .footer { text-align: center; margin-top: 20px; font-size: 10px; border-top: 2px solid #333; padding-top: 10px; }
          </style>
        </head>
        <body>
          ${receiptRef.current.innerHTML}
        </body>
        </html>
      `
      const blob = new Blob([receiptHTML], { type: 'text/html' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `mario-coin-receipt-${coin.id}.html`
      a.click()
      URL.revokeObjectURL(url)
      onReceiptRecorded?.(coin.id)
    }
  }

  const serialNumber = coin.serialNumber || `MC-${coin.id.substring(coin.id.length - 8).toUpperCase()}`

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="pixel-font text-xl">PRINTABLE RECEIPT</DialogTitle>
        </DialogHeader>

        <div ref={receiptRef} className="bg-white text-black p-8">
          <div className="receipt max-w-md mx-auto border-4 border-dashed border-black p-6">
            <div className="header text-center mb-6 border-b-4 border-black pb-4">
              <div className="w-16 h-16 mx-auto mb-3 bg-[#FFD700] rounded-lg flex items-center justify-center overflow-hidden">
                <img 
                  src={marioImage} 
                  alt="Mario Logo"
                  className="w-24 h-24 object-cover" 
                  style={{ marginTop: '-45px', marginLeft: '-20px' }}
                />
              </div>
              <div className="pixel-font text-sm mb-2">FEDERAL RESERVE MARIO</div>
              <div className="text-xs">People's Treasury Creation System</div>
              <div className="text-lg font-bold mt-2">{type === 'minting' ? 'MINTING RECEIPT' : 'TRANSFER RECEIPT'}</div>
            </div>

            <div className="section">
              <div className="row">
                <span className="label">Serial Number:</span>
                <span className="value font-mono">{serialNumber}</span>
              </div>
              <div className="row">
                <span className="label">Coin ID:</span>
                <span className="value font-mono text-xs">{coin.id.substring(0, 16)}...</span>
              </div>
              <div className="row">
                <span className="label">Value:</span>
                <span className="value text-xl font-bold">${coin.value.toFixed(2)} USD</span>
              </div>
            </div>

            <div className="section">
              <div className="row">
                <span className="label">Content Type:</span>
                <span className="value uppercase">{coin.content.type}</span>
              </div>
              <div className="row">
                <span className="label">Title:</span>
                <span className="value">{coin.content.title}</span>
              </div>
              <div className="mt-2">
                <div className="label mb-1">Description:</div>
                <div className="text-xs bg-gray-100 p-2 rounded">{coin.content.description}</div>
              </div>
            </div>

            {type === 'minting' && (
              <div className="section">
                <div className="row">
                  <span className="label">Minted By:</span>
                  <span className="value font-mono text-xs">{coin.mintedBy}</span>
                </div>
                <div className="row">
                  <span className="label">Mint Date:</span>
                  <span className="value">{new Date(coin.mintedAt).toLocaleString()}</span>
                </div>
                <div className="row">
                  <span className="label">Mint Location:</span>
                  <span className="value">Web Treasury</span>
                </div>
              </div>
            )}

            {type === 'transfer' && transfer && (
              <div className="section">
                <div className="row">
                  <span className="label">From:</span>
                  <span className="value font-mono text-xs">{transfer.from}</span>
                </div>
                <div className="row">
                  <span className="label">To:</span>
                  <span className="value font-mono text-xs">{transfer.to}</span>
                </div>
                <div className="row">
                  <span className="label">Transfer Date:</span>
                  <span className="value">{new Date(transfer.timestamp).toLocaleString()}</span>
                </div>
                {transfer.note && (
                  <div className="mt-2">
                    <div className="label mb-1">Transfer Note:</div>
                    <div className="text-xs bg-gray-100 p-2 rounded">{transfer.note}</div>
                  </div>
                )}
              </div>
            )}

            {coin.transferHistory.length > 0 && (
              <div className="section">
                <div className="label mb-2">Transfer History ({coin.transferHistory.length}):</div>
                <div className="text-xs space-y-1">
                  {coin.transferHistory.slice(-3).map((t, i) => (
                    <div key={i} className="bg-gray-50 p-2 rounded">
                      {new Date(t.timestamp).toLocaleDateString()} - {t.from.substring(0, 8)}... → {t.to.substring(0, 8)}...
                    </div>
                  ))}
                  {coin.transferHistory.length > 3 && (
                    <div className="text-center text-gray-500">... and {coin.transferHistory.length - 3} more</div>
                  )}
                </div>
              </div>
            )}

            <div className="footer text-center mt-6 pt-4 border-t-4 border-black">
              <div className="text-xs mb-2">OFFICIAL MARIO CURRENCY NOTE</div>
              <div className="text-xs">This note is legal tender in the People's Treasury system</div>
              <div className="text-xs mt-2">Backed by: {coin.content.type.toUpperCase()}</div>
              <div className="font-mono text-xs mt-3">{serialNumber}</div>
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <Button
            onClick={handlePrint}
            className="flex-1 bg-[oklch(0.75_0.18_85)] text-[oklch(0.15_0.02_280)] hover:bg-[oklch(0.80_0.20_85)]"
          >
            <Printer size={20} weight="bold" />
            <span className="ml-2">Print Receipt</span>
          </Button>
          <Button
            onClick={handleDownload}
            variant="outline"
            className="flex-1"
          >
            <Download size={20} weight="bold" />
            <span className="ml-2">Download HTML</span>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
