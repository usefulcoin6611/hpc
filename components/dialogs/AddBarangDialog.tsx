"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { CreateBarangData } from "@/services/barang"

interface AddBarangDialogProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: CreateBarangData) => Promise<boolean>
}

export function AddBarangDialog({
  isOpen,
  onClose,
  onSubmit
}: AddBarangDialogProps) {
  const [formData, setFormData] = useState<CreateBarangData>({
    kode: "",
    nama: ""
  })
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.kode.trim() || !formData.nama.trim()) {
      return false
    }

    setIsLoading(true)
    try {
      const success = await onSubmit(formData)
      if (success) {
        handleClose()
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleClose = () => {
    if (!isLoading) {
      setFormData({
        kode: "",
        nama: ""
      })
      onClose()
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Tambah Barang Baru</DialogTitle>
          <DialogDescription>
            Masukkan informasi barang yang akan ditambahkan.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <Label htmlFor="kode">Kode Barang</Label>
              <Input
                id="kode"
                placeholder="Masukkan kode barang"
                value={formData.kode}
                onChange={(e) => setFormData(prev => ({ ...prev, kode: e.target.value }))}
                required
              />
            </div>
            <div>
              <Label htmlFor="nama">Nama Barang</Label>
              <Input
                id="nama"
                placeholder="Masukkan nama barang"
                value={formData.nama}
                onChange={(e) => setFormData(prev => ({ ...prev, nama: e.target.value }))}
                required
              />
            </div>
          </div>
          <DialogFooter className="mt-6">
            <Button type="button" variant="outline" onClick={handleClose} disabled={isLoading}>
              Batal
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                  Menambahkan...
                </>
              ) : (
                "Tambah"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
} 