import { useState, useRef } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { UploadSimple, Image, VideoCamera, X, CheckCircle } from '@phosphor-icons/react'
import { toast } from 'sonner'

interface FileUploadPanelProps {
  type: 'image' | 'video'
  onFileSelect: (base64Data: string, fileName: string) => void
  currentFile?: string
  currentFileName?: string
}

export function FileUploadPanel({ type, onFileSelect, currentFile, currentFileName }: FileUploadPanelProps) {
  const [preview, setPreview] = useState<string | null>(currentFile || null)
  const [fileName, setFileName] = useState<string>(currentFileName || '')
  const [isProcessing, setIsProcessing] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const maxSize = type === 'image' ? 5 * 1024 * 1024 : 20 * 1024 * 1024
    if (file.size > maxSize) {
      toast.error(`File too large. Max size: ${type === 'image' ? '5MB' : '20MB'}`)
      return
    }

    const allowedTypes = type === 'image' 
      ? ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
      : ['video/mp4', 'video/webm', 'video/quicktime']

    if (!allowedTypes.includes(file.type)) {
      toast.error(`Invalid file type. Allowed: ${allowedTypes.join(', ')}`)
      return
    }

    setIsProcessing(true)

    const reader = new FileReader()
    reader.onload = async (e) => {
      const base64Data = e.target?.result as string

      setPreview(base64Data)
      setFileName(file.name)
      onFileSelect(base64Data, file.name)
      setIsProcessing(false)
      toast.success('File uploaded successfully!')
    }

    reader.onerror = () => {
      toast.error('Failed to read file')
      setIsProcessing(false)
    }

    reader.readAsDataURL(file)
  }

  const handleClear = () => {
    setPreview(null)
    setFileName('')
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
    onFileSelect('', '')
  }

  const Icon = type === 'image' ? Image : VideoCamera
  const label = type === 'image' ? 'Image' : 'Video'

  return (
    <Card className="p-4 border-2 border-border">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label className="text-base font-semibold flex items-center gap-2">
            <Icon size={20} weight="fill" />
            Upload {label}
          </Label>
          {preview && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClear}
              className="text-destructive"
            >
              <X size={16} weight="bold" />
              Clear
            </Button>
          )}
        </div>

        <div className="space-y-3">
          <input
            ref={fileInputRef}
            type="file"
            accept={type === 'image' ? 'image/*' : 'video/*'}
            onChange={handleFileChange}
            className="hidden"
            id={`file-upload-${type}`}
          />

          {!preview ? (
            <label
              htmlFor={`file-upload-${type}`}
              className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-muted-foreground/30 rounded-lg cursor-pointer hover:border-primary transition-colors"
            >
              <UploadSimple size={48} className="text-muted-foreground mb-2" />
              <p className="text-sm font-medium mb-1">Click to upload {label}</p>
              <p className="text-xs text-muted-foreground">
                {type === 'image' ? 'Max 5MB (JPG, PNG, GIF, WebP)' : 'Max 20MB (MP4, WebM, MOV)'}
              </p>
            </label>
          ) : (
            <div className="relative rounded-lg overflow-hidden bg-muted">
              {type === 'image' ? (
                <img src={preview} alt={fileName} className="w-full h-48 object-contain" />
              ) : (
                <video src={preview} controls className="w-full h-48" />
              )}
              <div className="absolute top-2 right-2 bg-primary text-primary-foreground rounded-full p-1">
                <CheckCircle size={20} weight="fill" />
              </div>
            </div>
          )}

          {fileName && (
            <p className="text-xs text-muted-foreground truncate">
              File: {fileName}
            </p>
          )}

          {isProcessing && (
            <div className="flex items-center justify-center p-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          )}
        </div>
      </div>
    </Card>
  )
}
