"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

import { Plus, Search } from "lucide-react"
import { getStoredToken } from "@/lib/auth-utils"


interface BarangItem {
  id: number
  kode: string
  nama: string
  stok: number
}

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
  availableQty: number // Qty yang tersedia dari transaksi
}

interface AddBarangKeluarDialogProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: {
    tanggal: Date
    deliveryNo?: string
    shipVia?: string
    tujuan: string
    keterangan: string
    items: DetailBarangKeluar[]
  }) => Promise<boolean>
}

export function AddBarangKeluarDialog({
  isOpen,
  onClose,
  onSubmit
}: AddBarangKeluarDialogProps) {
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

  const [barangList, setBarangList] = useState<BarangItem[]>([])
  const [searchingBarang, setSearchingBarang] = useState(false)

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
      const data = await response.json()
      
      if (data.success && data.data) {
        // Filter hanya data yang sudah diterima dan belum keluar
        const availableItems = data.data.filter((item: any) => 
          item.isDetailRow && // Hanya baris pertama (barang masuk)
          item.status === 'Diterima' // Hanya yang sudah diterima
        )
        
        // Transform data untuk kompatibilitas
        const transformedData = availableItems.map((item: any) => {
          // Ambil barangId dari data barang yang sudah di-fetch
          const barangId = item.barangId || 0
          
          return {
            id: item.detailBarangMasukNoSeriId,
            noSeri: item.noSeri,
            lokasi: item.lokasi || '',
            barangId: barangId,
            barangKode: item.kodeBarang,
            barangNama: item.namaBarang,
            barangSatuan: '',
            barangMasukId: 0,
            kodeKedatangan: item.kodeKedatangan,
            tanggalMasuk: item.tanggal,
            availableQty: item.qty || 1 // Qty yang tersedia dari transaksi
          }
        })
        
        setNoSeriList(transformedData)
      }
    } catch (error) {
      console.error('Error fetching no seri:', error)
    } finally {
      setSearchingNoSeri(false)
    }
  }



  // Debounce search
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchNoSeri(searchTerm)
    }, 300)

    return () => clearTimeout(timeoutId)
  }, [searchTerm])



  const filteredNoSeri = noSeriList

  const handleAddItem = () => {
    if (!selectedNoSeri || newItem.qty <= 0) return

    // Validasi qty tidak boleh melebihi available qty
    if (newItem.qty > selectedNoSeri.availableQty) {
      alert(`Qty tidak boleh melebihi ${selectedNoSeri.availableQty} yang tersedia`)
      return
    }

    const existingItem = items.find(item => item.detailBarangMasukNoSeriId === selectedNoSeri.id)
    if (existingItem) {
      // Validasi total qty tidak boleh melebihi available qty
      const totalQty = existingItem.qty + newItem.qty
      if (totalQty > selectedNoSeri.availableQty) {
        alert(`Total qty tidak boleh melebihi ${selectedNoSeri.availableQty} yang tersedia`)
        return
      }
      
      setItems(prev => prev.map(item =>
        item.detailBarangMasukNoSeriId === selectedNoSeri.id
          ? { ...item, qty: totalQty }
          : item
      ))
    } else {
      const newDetailItem: DetailBarangKeluar = {
        barangId: selectedNoSeri.barangId,
        detailBarangMasukNoSeriId: selectedNoSeri.id,
        noSeri: selectedNoSeri.noSeri,
        kode: selectedNoSeri.barangKode,
        nama: selectedNoSeri.barangNama,
        qty: newItem.qty
      }
      setItems(prev => [...prev, newDetailItem])
    }

    setSelectedNoSeri(null)
    setNewItem({ qty: 1 })
    setShowItemForm(false)
    setSearchTerm("")
  }



  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (items.length === 0) {
      alert("Minimal satu item harus ditambahkan")
      return
    }

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
    } finally {
      setIsLoading(false)
    }
  }

  const handleClose = () => {
    if (!isLoading) {
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
  }

  const totalItems = items.reduce((sum, item) => sum + item.qty, 0)



  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Tambah Barang Keluar</DialogTitle>
          <DialogDescription>
            Form pengiriman barang keluar dari gudang
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
                      <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    </div>
                  </div>
                  
                  <div className="w-24">
                    <Label>Qty</Label>
                    <Input
                      type="number"
                      min="1"
                      max={selectedNoSeri?.availableQty || 1}
                      value={newItem.qty}
                      onChange={(e) => setNewItem(prev => ({ ...prev, qty: parseInt(e.target.value) || 1 }))}
                      className="mt-1"
                    />
                    {selectedNoSeri && (
                      <div className="text-xs text-muted-foreground mt-1">
                        Max: {selectedNoSeri.availableQty}
                      </div>
                    )}
                  </div>
                  
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      onClick={handleAddItem}
                      disabled={!selectedNoSeri || newItem.qty <= 0}
                    >
                      Tambah ke List
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setShowItemForm(false)
                        setSelectedNoSeri(null)
                        setSearchTerm("")
                        setNewItem({ qty: 1 })
                      }}
                    >
                      Batal
                    </Button>
                  </div>
                </div>

                {/* Dropdown Results */}
                <div className={`overflow-hidden transition-all duration-300 ease-in-out ${
                  searchTerm 
                    ? 'max-h-40 opacity-100' 
                    : 'max-h-0 opacity-0'
                }`}>
                  <div className="border rounded-md overflow-y-auto max-h-40">
                    {searchingNoSeri ? (
                      <div className="p-4 text-center text-muted-foreground">
                        <div className="flex items-center justify-center gap-2">
                          <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
                          <span>Mencari no seri...</span>
                        </div>
                      </div>
                    ) : filteredNoSeri.length > 0 ? (
                      filteredNoSeri.map(noSeri => (
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
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{item.noSeri}</TableCell>
                      <TableCell>{item.kode}</TableCell>
                      <TableCell>{item.nama}</TableCell>
                      <TableCell>{item.qty}</TableCell>
                    </TableRow>
                  ))}
                  {items.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
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
                "Simpan"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
} 