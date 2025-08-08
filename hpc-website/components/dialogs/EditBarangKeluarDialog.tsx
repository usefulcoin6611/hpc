"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

import { Plus, Search, Trash2 } from "lucide-react"
import { getStoredToken } from "@/lib/auth-utils"
import { barangKeluarService } from "@/services/barang-keluar"

interface DetailBarangKeluar {
  barangId: number
  detailBarangMasukNoSeriId: number
  noSeri: string
  kode: string
  nama: string
  qty: number
}

interface BarangMasukNoSeriItem {
  id: number
  noSeri: string
  lokasi: string
  barangId: number
  barangKode: string
  barangNama: string
  barangSatuan: string
  barangMasukId: number
  kodeKedatangan: string
  tanggalMasuk: string
  availableQty: number
}

interface EditBarangKeluarDialogProps {
  isOpen: boolean
  onClose: () => void
  barangKeluarId: number | null
  onSubmit: (data: {
    tanggal: Date
    deliveryNo?: string
    shipVia?: string
    tujuan: string
    keterangan: string
    items: DetailBarangKeluar[]
  }) => Promise<boolean>
}

export function EditBarangKeluarDialog({
  isOpen,
  onClose,
  barangKeluarId,
  onSubmit
}: EditBarangKeluarDialogProps) {
  const [formData, setFormData] = useState({
    tanggal: new Date().toISOString().split('T')[0],
    tujuan: "",
    keterangan: "",
    shipVia: "",
    deliveryNo: ""
  })
  
  const [items, setItems] = useState<DetailBarangKeluar[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [showItemForm, setShowItemForm] = useState(false)
  const [selectedNoSeri, setSelectedNoSeri] = useState<BarangMasukNoSeriItem | null>(null)
  const [noSeriList, setNoSeriList] = useState<BarangMasukNoSeriItem[]>([])
  const [searchingNoSeri, setSearchingNoSeri] = useState(false)
  const [newItem, setNewItem] = useState({
    qty: 1
  })

  // Fetch barang keluar data when dialog opens
  useEffect(() => {
    if (isOpen && barangKeluarId) {
      fetchBarangKeluarData()
    }
  }, [isOpen, barangKeluarId])

  const fetchBarangKeluarData = async () => {
    if (!barangKeluarId) return

    setIsLoading(true)
    try {
      const response = await barangKeluarService.getById(barangKeluarId)
      if (response.success) {
        const data = response.data
        setFormData({
          tanggal: new Date(data.tanggal).toISOString().split('T')[0],
          tujuan: data.tujuan || "",
          keterangan: data.keterangan || "",
          shipVia: data.shipVia || "",
          deliveryNo: data.deliveryNo || ""
        })
        
        // Transform detail barang keluar to match interface
        const transformedItems = data.detailBarangKeluar.map(detail => ({
          barangId: detail.barang.id,
          detailBarangMasukNoSeriId: detail.detailBarangMasukNoSeri?.id || 0,
          noSeri: detail.detailBarangMasukNoSeri?.noSeri || '',
          kode: detail.barang.kode,
          nama: detail.barang.nama,
          qty: detail.jumlah
        }))
        setItems(transformedItems)
      }
    } catch (error) {
      console.error('Error fetching barang keluar data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // Fetch no seri data from API transaksi
  const fetchNoSeri = async (query: string) => {
    if (query.length < 2) {
      setNoSeriList([])
      return
    }

    setSearchingNoSeri(true)
    try {
      const token = getStoredToken()
      const response = await fetch(`/api/transaksi?noSeri=${encodeURIComponent(query)}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          const transformedData = data.data.map((item: any) => ({
            id: item.id,
            noSeri: item.noSeri,
            lokasi: item.lokasi || '',
            barangId: item.barangId,
            barangKode: item.barangKode,
            barangNama: item.barangNama,
            barangSatuan: item.barangSatuan,
            barangMasukId: item.barangMasukId,
            kodeKedatangan: item.kodeKedatangan,
            tanggalMasuk: item.tanggalMasuk,
            availableQty: item.qty
          }))
          setNoSeriList(transformedData)
        }
      }
    } catch (error) {
      console.error('Error fetching no seri:', error)
    } finally {
      setSearchingNoSeri(false)
    }
  }

  // Debounced search
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchTerm) {
        fetchNoSeri(searchTerm)
      } else {
        setNoSeriList([])
      }
    }, 300)

    return () => clearTimeout(timeoutId)
  }, [searchTerm])

  const handleAddItem = () => {
    if (!selectedNoSeri || newItem.qty <= 0) return

    // Check if quantity exceeds available quantity
    if (newItem.qty > selectedNoSeri.availableQty) {
      alert(`Quantity tidak boleh melebihi ${selectedNoSeri.availableQty}`)
      return
    }

    const newDetailItem: DetailBarangKeluar = {
      barangId: selectedNoSeri.barangId,
      detailBarangMasukNoSeriId: selectedNoSeri.id,
      noSeri: selectedNoSeri.noSeri,
      kode: selectedNoSeri.barangKode,
      nama: selectedNoSeri.barangNama,
      qty: newItem.qty
    }

    setItems(prev => [...prev, newDetailItem])
    setSelectedNoSeri(null)
    setSearchTerm("")
    setNewItem({ qty: 1 })
    setShowItemForm(false)
  }

  const handleRemoveItem = (index: number) => {
    setItems(prev => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (items.length === 0) return

    setIsLoading(true)
    try {
      const success = await onSubmit({
        tanggal: new Date(formData.tanggal),
        deliveryNo: formData.deliveryNo || undefined,
        shipVia: formData.shipVia || undefined,
        tujuan: formData.tujuan,
        keterangan: formData.keterangan,
        items
      })

      if (success) {
        handleClose()
      }
    } catch (error) {
      console.error('Error updating barang keluar:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleClose = () => {
    setFormData({
      tanggal: new Date().toISOString().split('T')[0],
      tujuan: "",
      keterangan: "",
      shipVia: "",
      deliveryNo: ""
    })
    setItems([])
    setSearchTerm("")
    setShowItemForm(false)
    setSelectedNoSeri(null)
    setNewItem({ qty: 1 })
    onClose()
  }

  const totalItems = items.reduce((sum, item) => sum + item.qty, 0)

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Barang Keluar</DialogTitle>
          <DialogDescription>
            Edit pengiriman barang keluar dari gudang
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Header Section */}
          <div className="space-y-4">
            {/* Main row - Ship to, Description, and stacked fields on the right */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {/* Left Column - Ship to */}
              <div>
                <Label htmlFor="tujuan">Ship to</Label>
                <Textarea
                  id="tujuan"
                  placeholder="Masukkan tujuan pengiriman..."
                  value={formData.tujuan}
                  onChange={(e) => setFormData(prev => ({ ...prev, tujuan: e.target.value }))}
                  className="mt-1 h-[180px]"
                  required
                />
              </div>

              {/* Middle Column - Description */}
              <div>
                <Label htmlFor="keterangan">Description</Label>
                <Textarea
                  id="keterangan"
                  placeholder="Masukkan deskripsi pengiriman..."
                  value={formData.keterangan}
                  onChange={(e) => setFormData(prev => ({ ...prev, keterangan: e.target.value }))}
                  className="mt-1 h-[180px]"
                />
              </div>

              {/* Right Column - Stacked fields */}
              <div className="space-y-4">
                <div>
                  <Label htmlFor="deliveryNo">Delivery No</Label>
                  <Input
                    id="deliveryNo"
                    placeholder="Masukkan nomor delivery..."
                    value={formData.deliveryNo}
                    onChange={(e) => setFormData(prev => ({ ...prev, deliveryNo: e.target.value }))}
                    className="mt-1"
                  />
                </div>
                
                <div>
                  <Label htmlFor="tanggal">Tanggal</Label>
                  <Input
                    id="tanggal"
                    type="date"
                    value={formData.tanggal}
                    onChange={(e) => setFormData(prev => ({ ...prev, tanggal: e.target.value }))}
                    className="mt-1"
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="shipVia">Ship Via</Label>
                  <Input
                    id="shipVia"
                    placeholder="Masukkan metode pengiriman..."
                    value={formData.shipVia}
                    onChange={(e) => setFormData(prev => ({ ...prev, shipVia: e.target.value }))}
                    className="mt-1"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Items Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Daftar Barang</h3>
              <Button
                type="button"
                onClick={() => setShowItemForm(true)}
                disabled={showItemForm}
              >
                <Plus className="h-4 w-4 mr-2" />
                Tambah Item
              </Button>
            </div>

            {/* Add Item Form */}
            <div className={`overflow-hidden transition-all duration-300 ease-in-out ${
              showItemForm 
                ? 'max-h-[500px] opacity-100 mb-4' 
                : 'max-h-0 opacity-0 mb-0'
            }`}>
              <div className="border rounded-lg p-4 bg-muted/30">
                {/* Search and Controls Row */}
                <div className="flex gap-4 items-end mb-3">
                  <div className="flex-1">
                    <Label>Cari No Seri</Label>
                    <div className="relative mt-1">
                      <Input
                        placeholder="Cari no seri atau kode barang..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pr-10"
                      />
                      <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    </div>
                  </div>
                  
                  <div className="w-24">
                    <Label>Qty</Label>
                    <Input
                      type="number"
                      min="1"
                      value={newItem.qty}
                      onChange={(e) => setNewItem(prev => ({ ...prev, qty: parseInt(e.target.value) || 1 }))}
                      className="mt-1"
                    />
                  </div>
                  
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      onClick={handleAddItem}
                      disabled={!selectedNoSeri}
                      className="h-10"
                    >
                      Tambah ke List
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowItemForm(false)}
                      className="h-10"
                    >
                      Batal
                    </Button>
                  </div>
                </div>

                {/* Search Results Dropdown */}
                <div className={`relative transition-all duration-300 ease-in-out ${
                  searchTerm ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0'
                }`}>
                  <div className="absolute top-0 left-0 right-0 bg-white border rounded-md shadow-lg z-10 max-h-40 overflow-y-auto">
                    {searchingNoSeri ? (
                      <div className="p-4 text-center">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto"></div>
                        <p className="text-sm text-muted-foreground mt-2">Mencari...</p>
                      </div>
                    ) : noSeriList.length > 0 ? (
                      noSeriList.map(noSeri => (
                        <div
                          key={noSeri.id}
                          onClick={() => setSelectedNoSeri(noSeri)}
                          className="p-2 hover:bg-accent cursor-pointer border-b last:border-b-0 transition-colors duration-150"
                        >
                          <div className="font-medium text-sm">{noSeri.noSeri}</div>
                          <div className="text-xs text-muted-foreground">
                            {noSeri.barangKode} - {noSeri.barangNama}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Lokasi: {noSeri.lokasi || '-'} | Kedatangan: {noSeri.kodeKedatangan} | Qty Tersedia: {noSeri.availableQty}
                          </div>
                        </div>
                      ))
                    ) : searchTerm && !searchingNoSeri ? (
                      <div className="p-4 text-center text-muted-foreground">
                        Tidak ada no seri ditemukan
                      </div>
                    ) : null}
                  </div>
                </div>
                
                <div className={`overflow-hidden transition-all duration-300 ease-in-out ${
                  selectedNoSeri 
                    ? 'max-h-32 opacity-100 mt-3' 
                    : 'max-h-0 opacity-0 mt-0'
                }`}>
                  <div className="p-3 bg-background rounded-md border">
                    <div className="text-sm">
                      <strong>No Seri Terpilih:</strong> {selectedNoSeri?.noSeri}
                    </div>
                    <div className="text-sm mt-1">
                      <strong>Barang:</strong> {selectedNoSeri?.barangKode} - {selectedNoSeri?.barangNama}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      Lokasi: {selectedNoSeri?.lokasi || '-'} | Kedatangan: {selectedNoSeri?.kodeKedatangan} | Qty Tersedia: {selectedNoSeri?.availableQty}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Items Table */}
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>No Seri</TableHead>
                    <TableHead>Item</TableHead>
                    <TableHead>Item Description</TableHead>
                    <TableHead>Qty</TableHead>
                    <TableHead className="w-20">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{item.noSeri}</TableCell>
                      <TableCell>{item.kode}</TableCell>
                      <TableCell>{item.nama}</TableCell>
                      <TableCell>{item.qty}</TableCell>
                      <TableCell>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => handleRemoveItem(index)}
                          className="h-8 w-8 p-0"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {items.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                        Belum ada item yang ditambahkan
                      </TableCell>
                    </TableRow>
                  )}
                  {/* Empty rows for aesthetics when there are items */}
                  {items.length > 0 && Array.from({ length: Math.max(0, 3 - items.length) }).map((_, index) => (
                    <TableRow key={`empty-${index}`} className="h-12">
                      <TableCell className="border-b border-gray-100"></TableCell>
                      <TableCell className="border-b border-gray-100"></TableCell>
                      <TableCell className="border-b border-gray-100"></TableCell>
                      <TableCell className="border-b border-gray-100"></TableCell>
                      <TableCell className="border-b border-gray-100"></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Total */}
            {items.length > 0 && (
              <div className="flex justify-end">
                <div className="text-lg font-semibold text-foreground">
                  Total Item: {totalItems}
                </div>
              </div>
            )}
          </div>

          <DialogFooter className="mt-6">
            <Button type="button" variant="outline" onClick={handleClose} disabled={isLoading}>
              Batal
            </Button>
            <Button type="submit" disabled={isLoading || items.length === 0}>
              {isLoading ? (
                <>
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                  Menyimpan...
                </>
              ) : (
                "Simpan Perubahan"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
} 