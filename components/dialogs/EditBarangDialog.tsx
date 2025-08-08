"use client"

import { useState, useEffect } from "react"
import { DialogWrapper } from "@/components/ui/dialog-wrapper"
import { DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Barang, UpdateBarangData } from "@/services/barang"

interface EditBarangDialogProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (id: number, data: UpdateBarangData) => Promise<boolean>
  barang: Barang | null
}

export function EditBarangDialog({
  isOpen,
  onClose,
  onSubmit,
  barang
}: EditBarangDialogProps) {
  const [formData, setFormData] = useState<UpdateBarangData>({
    kode: "",
    nama: "",
    satuan: null,
    stok: 0,
    stokMinimum: 0,
    lokasi: null,
    deskripsi: null
  })
  const [isLoading, setIsLoading] = useState(false)

  // Update form data when barang changes
  useEffect(() => {
    if (barang) {
      setFormData({
        kode: barang.kode,
        nama: barang.nama,
        satuan: barang.satuan,
        stok: barang.stok || 0,
        stokMinimum: barang.stokMinimum || 0,
        lokasi: barang.lokasi,
        deskripsi: barang.deskripsi
      })
    }
  }, [barang])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!barang || !formData.kode.trim() || !formData.nama.trim()) {
      return false
    }

    setIsLoading(true)
    try {
      const success = await onSubmit(barang.id, formData)
      if (success) {
        handleClose()
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleClose = () => {
    if (!isLoading) {
      onClose()
    }
  }

  if (!barang) return null

  return (
    <DialogWrapper open={isOpen} onOpenChange={handleClose}>
        <DialogHeader>
          <DialogTitle>Edit Barang</DialogTitle>
          <DialogDescription>
            Perbarui informasi barang yang dipilih
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-kode">Kode Barang</Label>
              <Input
                id="edit-kode"
                placeholder="Masukkan kode barang"
                value={formData.kode}
                onChange={(e) => setFormData(prev => ({ ...prev, kode: e.target.value }))}
                required
              />
            </div>
            <div>
              <Label htmlFor="edit-nama">Nama Barang</Label>
              <Input
                id="edit-nama"
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
                  Memperbarui...
                </>
              ) : (
                "Perbarui"
              )}
            </Button>
          </DialogFooter>
        </form>
    </DialogWrapper>
  )
} 