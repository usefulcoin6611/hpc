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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Loader2, Package, Search } from "lucide-react"
import { barangService, Barang } from "@/services/barang"
import { useToast } from "@/hooks/use-toast"

interface AddJenisBarangDialogProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (barangId: number, namaJenis: string, deskripsi?: string) => Promise<boolean>
}

export function AddJenisBarangDialog({ isOpen, onClose, onSubmit }: AddJenisBarangDialogProps) {
  const [selectedBarangId, setSelectedBarangId] = useState<string>("")
  const [namaJenis, setNamaJenis] = useState("")
  const [deskripsi, setDeskripsi] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [barangList, setBarangList] = useState<Barang[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [isLoadingBarang, setIsLoadingBarang] = useState(false)
  
  const { toast } = useToast()

  // Load barang data when dialog opens
  useEffect(() => {
    if (isOpen) {
      loadBarangData()
    }
  }, [isOpen])

  const loadBarangData = async () => {
    setIsLoadingBarang(true)
    try {
      const response = await barangService.getBarang()
      // Filter barang yang belum memiliki jenis
      const unassignedBarang = (response.data || []).filter(barang => !barang.jenisId)
      setBarangList(unassignedBarang)
    } catch (error) {
      console.error('Error loading barang:', error)
      toast({
        title: "Error",
        description: "Gagal memuat data barang",
        variant: "destructive"
      })
    } finally {
      setIsLoadingBarang(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!selectedBarangId || !namaJenis.trim()) {
      toast({
        title: "Error",
        description: "Pilih barang dan isi nama jenis",
        variant: "destructive"
      })
      return
    }

    setIsSubmitting(true)
    try {
      const success = await onSubmit(parseInt(selectedBarangId), namaJenis.trim(), deskripsi.trim() || undefined)
      
      if (success) {
        handleClose()
      }
    } catch (error) {
      console.error('Error creating jenis barang:', error)
      toast({
        title: "Error",
        description: "Gagal membuat jenis barang. Pastikan nama jenis belum ada.",
        variant: "destructive"
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    if (!isSubmitting) {
      setSelectedBarangId("")
      setNamaJenis("")
      setDeskripsi("")
      setSearchTerm("")
      onClose()
    }
  }

  const filteredBarang = barangList.filter(barang => 
    !searchTerm || 
    barang.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
    barang.kode.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const selectedBarang = barangList.find(barang => barang.id.toString() === selectedBarangId)

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Tambah Jenis Barang
          </DialogTitle>
          <DialogDescription>
            Pilih barang dan berikan nama jenis/kategori untuk barang tersebut
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Barang Selection */}
          <div className="space-y-3">
            <Label>Pilih Barang *</Label>
            
            {/* Search */}
            <div className="relative">
              <Input
                placeholder="Cari barang..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pr-10"
              />
              <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            </div>

            {/* Barang List */}
            <div className="max-h-48 overflow-y-auto border rounded-lg">
              {isLoadingBarang ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin mr-2" />
                  <span>Memuat data barang...</span>
                </div>
              ) : filteredBarang.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  {searchTerm ? "Tidak ada barang yang ditemukan" : "Tidak ada barang yang tersedia"}
                </div>
              ) : (
                <div className="divide-y">
                  {filteredBarang.map((barang) => (
                    <div
                      key={barang.id}
                      className={`p-3 cursor-pointer hover:bg-gray-50 transition-colors ${
                        selectedBarangId === barang.id.toString() ? 'bg-blue-50 border-l-4 border-blue-500' : ''
                      }`}
                      onClick={() => setSelectedBarangId(barang.id.toString())}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-medium text-gray-900">{barang.nama}</h4>
                            <Badge variant="outline" className="text-xs">
                              {barang.kode}
                            </Badge>
                          </div>

                        </div>
                        <div className="ml-4">
                          {selectedBarangId === barang.id.toString() && (
                            <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                              <div className="w-2 h-2 bg-white rounded-full"></div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Selected Barang Info */}
          {selectedBarang && (
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">Barang yang Dipilih:</h4>
              <div className="text-sm text-blue-800">
                <p><strong>Nama:</strong> {selectedBarang.nama}</p>
                <p><strong>Kode:</strong> {selectedBarang.kode}</p>
              </div>
            </div>
          )}

          {/* Jenis Barang Form */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="nama-jenis">Nama Jenis Barang *</Label>
              <Input
                id="nama-jenis"
                placeholder="Contoh: Hunter Equipment, Motor, Tire Changer, dll"
                value={namaJenis}
                onChange={(e) => setNamaJenis(e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="deskripsi">Deskripsi (Opsional)</Label>
              <Input
                id="deskripsi"
                placeholder="Deskripsi jenis barang"
                value={deskripsi}
                onChange={(e) => setDeskripsi(e.target.value)}
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose} disabled={isSubmitting}>
              Batal
            </Button>
            <Button type="submit" disabled={isSubmitting || !selectedBarangId || !namaJenis.trim()}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Menyimpan...
                </>
              ) : (
                "Tambah Jenis Barang"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
