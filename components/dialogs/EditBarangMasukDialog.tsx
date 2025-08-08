"use client"

import React, { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { DialogWrapper } from "@/components/ui/dialog-wrapper"
import {
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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, XCircle, Trash2 } from "lucide-react"
import { IncomingItemDetail, IncomingItem, UnitData } from "@/types/barang-masuk"
import { barangService, Barang } from "@/services/barang"

interface EditBarangMasukDialogProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  selectedItem: IncomingItem | null
  editIncomingItem: IncomingItem
  setEditIncomingItem: React.Dispatch<React.SetStateAction<IncomingItem>>
  editIncomingItemDetails: IncomingItemDetail[]
  setEditIncomingItemDetails: React.Dispatch<React.SetStateAction<IncomingItemDetail[]>>
  handleUpdateItem: () => void
  handleAddEditDetailItem: () => void
  handleUpdateEditDetailItem: (id: number, field: keyof IncomingItemDetail, value: string | number) => void
  handleRemoveEditDetailItem: (id: number) => void
}

export function EditBarangMasukDialog({
  isOpen,
  onOpenChange,
  selectedItem,
  editIncomingItem,
  setEditIncomingItem,
  editIncomingItemDetails,
  setEditIncomingItemDetails,
  handleUpdateItem,
  handleAddEditDetailItem,
  handleUpdateEditDetailItem,
  handleRemoveEditDetailItem,
}: EditBarangMasukDialogProps) {
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

  // Generate unit data based on jumlah
  const generateUnitData = (detail: IncomingItemDetail) => {
    const units = []
    for (let i = 0; i < detail.jumlah; i++) {
      // Use existing unit data or create new one
      const existingUnit = detail.units?.[i] || {
        no: i + 1,
        namaItem: detail.namaBarang,
        lokasi: '',
        noSeri: '',
        keterangan: '',
        unitIndex: i
      }
      units.push(existingUnit)
    }
    return units
  }

  // Handle delete unit
  const handleDeleteUnit = (detailId: number, unitIndex: number) => {
    setEditIncomingItemDetails(prev => 
      prev.map(detail => {
        if (detail.id === detailId) {
          // Reduce jumlah by 1
          const newJumlah = Math.max(0, detail.jumlah - 1)
          // Remove the unit from units array
          const newUnits = detail.units?.filter((_, index) => index !== unitIndex) || []
          return { ...detail, jumlah: newJumlah, units: newUnits }
        }
        return detail
      })
    )
  }

  // Handle update unit field
  const handleUpdateUnitField = (detailId: number, unitIndex: number, field: 'lokasi' | 'noSeri' | 'keterangan', value: string) => {
    setEditIncomingItemDetails(prev => 
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

  // Handle jumlah change - update units array
  const handleJumlahChange = (detailId: number, newJumlah: number) => {
    setEditIncomingItemDetails(prev => 
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

  // Handle kode barang change with better state management
  const handleKodeBarangChange = (detailId: number, kodeBarang: string) => {
    const selectedBarang = barangList.find(barang => barang.kode === kodeBarang)
    if (selectedBarang) {
      setEditIncomingItemDetails(prev => 
        prev.map(detail => {
          if (detail.id === detailId) {
            return {
              ...detail,
              kodeBarang: kodeBarang,
              namaBarang: selectedBarang.nama
            }
          }
          return detail
        })
      )
    }
  }

  // Debug: Log data when dialog opens
  useEffect(() => {
    if (isOpen && editIncomingItemDetails.length > 0) {
      console.log('Edit dialog opened with details:', editIncomingItemDetails)
      editIncomingItemDetails.forEach((detail, index) => {
        console.log(`Detail ${index + 1}:`, {
          id: detail.id,
          kodeBarang: detail.kodeBarang,
          namaBarang: detail.namaBarang,
          jumlah: detail.jumlah
        })
      })
    }
  }, [isOpen, editIncomingItemDetails])

  // Auto-fill kode barang if empty but nama barang exists
  useEffect(() => {
    if (isOpen && barangList.length > 0 && editIncomingItemDetails.length > 0) {
      const updatedDetails = editIncomingItemDetails.map(detail => {
        if (!detail.kodeBarang && detail.namaBarang) {
          const foundBarang = barangList.find(barang => barang.nama === detail.namaBarang)
          if (foundBarang) {
            console.log(`Auto-filling kode barang for ${detail.namaBarang}: ${foundBarang.kode}`)
            return { ...detail, kodeBarang: foundBarang.kode }
          }
        }
        return detail
      })
      
      // Only update if there are changes
      const hasChanges = updatedDetails.some((detail, index) => 
        detail.kodeBarang !== editIncomingItemDetails[index]?.kodeBarang
      )
      
      if (hasChanges) {
        setEditIncomingItemDetails(updatedDetails)
      }
    }
  }, [isOpen, barangList, editIncomingItemDetails])



  return (
                <DialogWrapper open={isOpen} onOpenChange={onOpenChange} className="sm:max-w-[900px] max-h-[90vh] overflow-y-auto modal-scrollbar">
        <DialogHeader>
          <DialogTitle>Edit Barang Masuk</DialogTitle>
          <DialogDescription>Ubah detail transaksi barang masuk ini.</DialogDescription>
        </DialogHeader>
        {selectedItem && (
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-tanggal">Tanggal</Label>
                <Input
                  id="edit-tanggal"
                  type="date"
                  value={editIncomingItem.tanggal}
                  onChange={(e) => setEditIncomingItem({ ...editIncomingItem, tanggal: e.target.value })}
                  className="rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-kode-kedatangan">Kode Kedatangan</Label>
                <Input
                  id="edit-kode-kedatangan"
                  value={editIncomingItem.kodeKedatangan}
                  onChange={(e) => setEditIncomingItem({ ...editIncomingItem, kodeKedatangan: e.target.value })}
                  className="rounded-xl"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-supplier">Nama Supplier</Label>
                <Input
                  id="edit-supplier"
                  value={editIncomingItem.namaSupplier}
                  onChange={(e) => setEditIncomingItem({ ...editIncomingItem, namaSupplier: e.target.value })}
                  className="rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-no-form">No Form</Label>
                <Input
                  id="edit-no-form"
                  value={editIncomingItem.noForm}
                  onChange={(e) => setEditIncomingItem({ ...editIncomingItem, noForm: e.target.value })}
                  className="rounded-xl"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-status">Status</Label>
              <Input
                id="edit-status"
                value={editIncomingItem.status}
                onChange={(e) => setEditIncomingItem({ ...editIncomingItem, status: e.target.value })}
                className="rounded-xl"
                placeholder="Contoh: Diterima, Pending, Diterima Sebagian"
              />
            </div>

            <h3 className="mt-4 text-lg font-medium text-gray-800">Detail Barang</h3>
            <div className="space-y-6">
              {editIncomingItemDetails.map((detail, index) => (
                <div key={detail.id} className="relative rounded-xl border border-gray-200 p-4">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-2 top-2 h-6 w-6 text-gray-400 hover:text-red-500"
                    onClick={() => handleRemoveEditDetailItem(detail.id)}
                  >
                    <XCircle className="h-4 w-4" />
                    <span className="sr-only">Hapus Detail Barang</span>
                  </Button>
                  <p className="mb-3 text-sm font-semibold text-gray-700">Item #{index + 1}</p>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <div className="space-y-2">
                      <Label htmlFor={`edit-detail-kode-barang-${detail.id}`}>Kode Barang</Label>
                                            <Select
                        key={`edit-kode-barang-${detail.id}-${detail.kodeBarang}`}
                        value={detail.kodeBarang || ""}
                        onValueChange={(value) => {
                          handleKodeBarangChange(detail.id, value)
                        }}
                      >
                        {(() => {
                          console.log(`Select for detail ${detail.id}:`, {
                            kodeBarang: detail.kodeBarang,
                            value: detail.kodeBarang || "",
                            hasValue: !!detail.kodeBarang
                          })
                          return null
                        })()}
                        <SelectTrigger className="rounded-xl">
                          <SelectValue placeholder="Pilih kode barang" />
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
                            <SelectItem key={barang.id} value={barang.kode}>
                              {barang.kode}
                            </SelectItem>
                          ))
                        )}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor={`edit-detail-nama-barang-${detail.id}`}>Nama Barang</Label>
                      <Input
                        id={`edit-detail-nama-barang-${detail.id}`}
                        value={detail.namaBarang}
                        className="rounded-xl"
                        placeholder="Nama barang akan terisi otomatis"
                        readOnly
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor={`edit-detail-jumlah-${detail.id}`}>Jumlah</Label>
                      <Input
                        id={`edit-detail-jumlah-${detail.id}`}
                        type="number"
                        value={detail.jumlah}
                        onChange={(e) => handleJumlahChange(detail.id, Number.parseInt(e.target.value) || 0)}
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
                              <TableHead className="py-2 text-center text-xs font-medium text-gray-600">Action</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {generateUnitData(detail).map((unit) => (
                              <TableRow key={unit.unitIndex}>
                                <TableCell className="text-center text-sm text-gray-600">{unit.no}</TableCell>
                                <TableCell className="text-sm text-gray-800">{unit.namaItem}</TableCell>
                                <TableCell className="p-2">
                                  <Input
                                    value={unit.lokasi}
                                    onChange={(e) => handleUpdateUnitField(detail.id, unit.unitIndex, 'lokasi', e.target.value)}
                                    className="h-8 text-xs rounded-lg"
                                    placeholder="Lokasi"
                                  />
                                </TableCell>
                                <TableCell className="p-2">
                                  <Input
                                    value={unit.noSeri}
                                    onChange={(e) => handleUpdateUnitField(detail.id, unit.unitIndex, 'noSeri', e.target.value)}
                                    className="h-8 text-xs rounded-lg"
                                    placeholder="No Seri"
                                  />
                                </TableCell>
                                <TableCell className="p-2">
                                  <Input
                                    value={unit.keterangan}
                                    onChange={(e) => handleUpdateUnitField(detail.id, unit.unitIndex, 'keterangan', e.target.value)}
                                    className="h-8 text-xs rounded-lg"
                                    placeholder="Keterangan"
                                  />
                                </TableCell>
                                <TableCell className="text-center">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                                    onClick={() => handleDeleteUnit(detail.id, unit.unitIndex)}
                                  >
                                    <Trash2 className="h-3 w-3" />
                                    <span className="sr-only">Hapus Unit</span>
                                  </Button>
                                </TableCell>
                              </TableRow>
                            ))}
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
                onClick={handleAddEditDetailItem}
                className="w-full rounded-xl border-dashed"
              >
                <Plus className="mr-2 h-4 w-4" />
                Tambah Detail Barang
              </Button>
            </div>
          </div>
        )}
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline" className="rounded-xl">
              Batal
            </Button>
          </DialogClose>
          <Button onClick={handleUpdateItem} className="rounded-xl bg-amber-400 text-white hover:bg-amber-500">
            Simpan Perubahan
          </Button>
        </DialogFooter>
    </DialogWrapper>
  )
} 