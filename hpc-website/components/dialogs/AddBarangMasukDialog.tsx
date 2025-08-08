"use client"

import React, { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Plus, XCircle } from "lucide-react"
import { IncomingItemDetail, IncomingItem } from "@/types/barang-masuk"
import { barangService, Barang } from "@/services/barang"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

interface AddBarangMasukDialogProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  newIncomingItem: IncomingItem
  setNewIncomingItem: React.Dispatch<React.SetStateAction<IncomingItem>>
  newIncomingItemDetails: IncomingItemDetail[]
  setNewIncomingItemDetails: React.Dispatch<React.SetStateAction<IncomingItemDetail[]>>
  handleAddIncomingItem: () => void
  handleAddDetailItem: () => void
  handleUpdateDetailItem: (id: number, field: keyof IncomingItemDetail, value: string | number) => void
  handleRemoveDetailItem: (id: number) => void
}

export function AddBarangMasukDialog({
  isOpen,
  onOpenChange,
  newIncomingItem,
  setNewIncomingItem,
  newIncomingItemDetails,
  setNewIncomingItemDetails,
  handleAddIncomingItem,
  handleAddDetailItem,
  handleUpdateDetailItem,
  handleRemoveDetailItem,
}: AddBarangMasukDialogProps) {
  const [barangList, setBarangList] = useState<Barang[]>([])
  const [isLoadingBarang, setIsLoadingBarang] = useState(false)

  // Fetch barang data when dialog opens
  useEffect(() => {
    if (isOpen) {
      fetchBarangList()
    }
  }, [isOpen])

  const fetchBarangList = async () => {
    try {
      setIsLoadingBarang(true)
      const data = await barangService.fetchActive()
      setBarangList(data)
    } catch (error) {
      console.error('Error fetching barang:', error)
    } finally {
      setIsLoadingBarang(false)
    }
  }

  // Handle jumlah change - update units array
  const handleJumlahChange = (detailId: number, newJumlah: number) => {
    setNewIncomingItemDetails(prev => 
      prev.map(detail => {
        if (detail.id === detailId) {
          const currentUnits = detail.units || []
          let newUnits = [...currentUnits]
          
          if (newJumlah > currentUnits.length) {
            // Add new units
            for (let i = currentUnits.length; i < newJumlah; i++) {
              newUnits.push({
                no: i + 1,
                namaItem: detail.namaBarang,
                lokasi: '',
                noSeri: '',
                keterangan: '',
                unitIndex: i
              })
            }
          } else if (newJumlah < currentUnits.length) {
            // Remove excess units
            newUnits = newUnits.slice(0, newJumlah)
          }
          
          return { ...detail, jumlah: newJumlah, units: newUnits }
        }
        return detail
      })
    )
  }

  // Handle update unit field
  const handleUpdateUnitField = (detailId: number, unitIndex: number, field: 'lokasi' | 'noSeri' | 'keterangan', value: string) => {
    setNewIncomingItemDetails(prev => 
      prev.map(detail => {
        if (detail.id === detailId) {
          const updatedUnits = [...(detail.units || [])]
          if (updatedUnits[unitIndex]) {
            updatedUnits[unitIndex] = { ...updatedUnits[unitIndex], [field]: value }
          } else {
            // Create new unit if it doesn't exist
            updatedUnits[unitIndex] = {
              no: unitIndex + 1,
              namaItem: detail.namaBarang,
              lokasi: field === 'lokasi' ? value : '',
              noSeri: field === 'noSeri' ? value : '',
              keterangan: field === 'keterangan' ? value : '',
              unitIndex: unitIndex
            }
          }
          return { ...detail, units: updatedUnits }
        }
        return detail
      })
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto modal-scrollbar">
        <DialogHeader>
          <DialogTitle>Tambah Barang Masuk Baru</DialogTitle>
          <DialogDescription>Masukkan detail transaksi dan barang yang masuk.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="add-tanggal">Tanggal</Label>
              <Input
                id="add-tanggal"
                type="date"
                value={newIncomingItem.tanggal}
                onChange={(e) => setNewIncomingItem({ ...newIncomingItem, tanggal: e.target.value })}
                className="rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="add-kode-kedatangan">Kode Kedatangan</Label>
              <Input
                id="add-kode-kedatangan"
                value={newIncomingItem.kodeKedatangan}
                onChange={(e) => setNewIncomingItem({ ...newIncomingItem, kodeKedatangan: e.target.value })}
                className="rounded-xl"
                placeholder="Contoh: BM-2023-004"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="add-supplier">Nama Supplier</Label>
              <Input
                id="add-supplier"
                value={newIncomingItem.namaSupplier}
                onChange={(e) => setNewIncomingItem({ ...newIncomingItem, namaSupplier: e.target.value })}
                className="rounded-xl"
                placeholder="Contoh: PT ABC Logistik"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="add-no-form">No Form</Label>
              <Input
                id="add-no-form"
                value={newIncomingItem.noForm}
                onChange={(e) => setNewIncomingItem({ ...newIncomingItem, noForm: e.target.value })}
                className="rounded-xl"
                placeholder="Contoh: F-BM-004"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="add-status">Status</Label>
            <Input
              id="add-status"
              value={newIncomingItem.status}
              onChange={(e) => setNewIncomingItem({ ...newIncomingItem, status: e.target.value })}
              className="rounded-xl"
              placeholder="Contoh: Diterima, Pending, Diterima Sebagian"
            />
          </div>

          <h3 className="mt-6 text-lg font-medium text-gray-800">Detail Barang</h3>
          <div className="space-y-4">
            {newIncomingItemDetails.map((detail, index) => (
              <div key={detail.id} className="relative rounded-xl border border-gray-200 p-4">
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-2 top-2 h-6 w-6 text-gray-400 hover:text-red-500"
                  onClick={() => handleRemoveDetailItem(detail.id)}
                >
                  <XCircle className="h-4 w-4" />
                  <span className="sr-only">Hapus Detail Barang</span>
                </Button>
                <p className="mb-3 text-sm font-semibold text-gray-700">Item #{index + 1}</p>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor={`detail-nama-barang-${detail.id}`}>Nama Barang</Label>
                    <Select
                      value={detail.namaBarang}
                      onValueChange={(value) => handleUpdateDetailItem(detail.id, "namaBarang", value)}
                    >
                      <SelectTrigger className="rounded-xl">
                        <SelectValue placeholder="Pilih barang" />
                      </SelectTrigger>
                                             <SelectContent>
                         {isLoadingBarang ? (
                           <SelectItem value="loading" disabled>
                             Memuat data barang...
                           </SelectItem>
                         ) : barangList.length === 0 ? (
                           <SelectItem value="no-data" disabled>
                             Tidak ada data barang
                           </SelectItem>
                         ) : (
                           barangList.map((barang) => (
                             <SelectItem key={barang.id} value={barang.nama}>
                               {barang.nama} - {barang.kode}
                             </SelectItem>
                           ))
                         )}
                       </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`detail-jumlah-${detail.id}`}>Jumlah</Label>
                    <Input
                      id={`detail-jumlah-${detail.id}`}
                      type="number"
                      value={detail.jumlah}
                      onChange={(e) =>
                        handleJumlahChange(detail.id, Number.parseInt(e.target.value) || 0)
                      }
                      className="rounded-xl"
                      placeholder="Jumlah"
                      min="0"
                    />
                  </div>
                </div>

                {/* Tabel Detail Unit */}
                {detail.jumlah > 0 && (
                  <div className="mt-4">
                    <h4 className="mb-3 text-sm font-medium text-gray-700">Detail Unit</h4>
                    <div className="overflow-x-auto rounded-xl border border-gray-100 bg-white shadow-soft">
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-gray-50">
                            <TableHead className="py-2 text-center text-xs font-medium text-gray-600">No</TableHead>
                            <TableHead className="py-2 text-xs font-medium text-gray-600">Nama Item</TableHead>
                            <TableHead className="py-2 text-xs font-medium text-gray-600">Lokasi</TableHead>
                            <TableHead className="py-2 text-xs font-medium text-gray-600">No Seri</TableHead>
                            <TableHead className="py-2 text-xs font-medium text-gray-600">Keterangan</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {Array.from({ length: detail.jumlah }, (_, i) => {
                            const unit = detail.units?.[i] || {
                              no: i + 1,
                              namaItem: detail.namaBarang,
                              lokasi: '',
                              noSeri: '',
                              keterangan: '',
                              unitIndex: i
                            }
                            return (
                              <TableRow key={i}>
                                <TableCell className="text-center text-sm text-gray-600">{unit.no}</TableCell>
                                <TableCell className="text-sm text-gray-800">{unit.namaItem}</TableCell>
                                <TableCell className="p-2">
                                  <Input
                                    value={unit.lokasi}
                                    onChange={(e) => handleUpdateUnitField(detail.id, i, 'lokasi', e.target.value)}
                                    className="h-8 text-xs rounded-lg"
                                    placeholder="Lokasi"
                                  />
                                </TableCell>
                                <TableCell className="p-2">
                                  <Input
                                    value={unit.noSeri}
                                    onChange={(e) => handleUpdateUnitField(detail.id, i, 'noSeri', e.target.value)}
                                    className="h-8 text-xs rounded-lg"
                                    placeholder="No Seri"
                                  />
                                </TableCell>
                                <TableCell className="p-2">
                                  <Input
                                    value={unit.keterangan}
                                    onChange={(e) => handleUpdateUnitField(detail.id, i, 'keterangan', e.target.value)}
                                    className="h-8 text-xs rounded-lg"
                                    placeholder="Keterangan"
                                  />
                                </TableCell>
                              </TableRow>
                            )
                          })}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                )}
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              onClick={handleAddDetailItem}
              className="w-full rounded-xl border-dashed"
            >
              <Plus className="mr-2 h-4 w-4" />
              Tambah Detail Barang
            </Button>
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline" className="rounded-xl">
              Batal
            </Button>
          </DialogClose>
          <Button
            onClick={handleAddIncomingItem}
            className="rounded-xl bg-primary text-white hover:bg-primary-dark"
          >
            Simpan Data
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
} 