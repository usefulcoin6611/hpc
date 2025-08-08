"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Loader2, Package } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import type { JenisBarang } from "@/services/jenis-barang"

interface EditJenisBarangDialogProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (id: number, data: { nama: string; deskripsi: string }) => Promise<boolean>
  jenisBarang: JenisBarang | null
}

export function EditJenisBarangDialog({ isOpen, onClose, onSubmit, jenisBarang }: EditJenisBarangDialogProps) {
  const [formData, setFormData] = useState({
    nama: '',
    deskripsi: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  const { toast } = useToast()

  // Update form data when jenis barang changes
  useEffect(() => {
    if (jenisBarang) {
      setFormData({
        nama: jenisBarang.nama,
        deskripsi: jenisBarang.deskripsi || ''
      })
    }
  }, [jenisBarang])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!jenisBarang || !formData.nama.trim()) {
      toast({
        title: "Error",
        description: "Nama jenis barang wajib diisi",
        variant: "destructive"
      })
      return
    }

    setIsSubmitting(true)
    try {
      const success = await onSubmit(jenisBarang.id, formData)
      if (success) {
        handleClose()
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    if (!isSubmitting) {
      setFormData({ nama: '', deskripsi: '' })
      onClose()
    }
  }

  if (!jenisBarang) return null

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Edit Jenis Barang
          </DialogTitle>
          <DialogDescription>
            Update informasi jenis barang: {jenisBarang.nama}
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="nama">Nama Jenis Barang *</Label>
            <Input
              id="nama"
              placeholder="Masukkan nama jenis barang"
              value={formData.nama}
              onChange={(e) => setFormData(prev => ({ ...prev, nama: e.target.value }))}
              required
            />
          </div>
          <div>
            <Label htmlFor="deskripsi">Deskripsi</Label>
            <Input
              id="deskripsi"
              placeholder="Masukkan deskripsi (opsional)"
              value={formData.deskripsi}
              onChange={(e) => setFormData(prev => ({ ...prev, deskripsi: e.target.value }))}
            />
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose} disabled={isSubmitting}>
              Batal
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Menyimpan...
                </>
              ) : (
                "Simpan"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
