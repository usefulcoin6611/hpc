"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

interface UpdateDetailDialogProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: {
    detailBarangMasukNoSeriId: number
    ket: string
    lokasi: string
  }) => void
  detailBarangMasukNoSeriId: number
  noSeri: string
  currentKet: string
  currentLokasi: string
}

export function UpdateDetailDialog({
  isOpen,
  onClose,
  onSubmit,
  detailBarangMasukNoSeriId,
  noSeri,
  currentKet,
  currentLokasi
}: UpdateDetailDialogProps) {
  const [ket, setKet] = useState(currentKet || "")
  const [lokasi, setLokasi] = useState(currentLokasi || "")
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    setIsLoading(true)
    
    try {
      await onSubmit({
        detailBarangMasukNoSeriId,
        ket: ket.trim(),
        lokasi: lokasi.trim()
      })
      
      // Reset form
      setKet("")
      setLokasi("")
      onClose()
    } catch (error) {
      console.error('Error submitting form:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleClose = () => {
    if (!isLoading) {
      setKet(currentKet || "")
      setLokasi(currentLokasi || "")
      onClose()
    }
  }

  // Update form when dialog opens with new data
  const handleOpenChange = (open: boolean) => {
    if (open) {
      setKet(currentKet || "")
      setLokasi(currentLokasi || "")
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Update Detail Barang</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="noSeri">No Seri</Label>
            <Input
              id="noSeri"
              value={noSeri}
              disabled
              className="bg-gray-50"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="lokasi">Lokasi</Label>
            <Input
              id="lokasi"
              value={lokasi}
              onChange={(e) => setLokasi(e.target.value)}
              placeholder="Masukkan lokasi"
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="ket">Keterangan</Label>
            <Textarea
              id="ket"
              value={ket}
              onChange={(e) => setKet(e.target.value)}
              placeholder="Keterangan"
              disabled={isLoading}
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isLoading}
            >
              Batal
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
            >
              {isLoading ? "Menyimpan..." : "Simpan"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
} 