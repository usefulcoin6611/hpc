"use client"

import React from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { AlertTriangle, Trash2 } from "lucide-react"
import { IncomingItemWithDetails } from "@/types/barang-masuk"

interface DeleteBarangMasukDialogProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  selectedItem: IncomingItemWithDetails | null
  onConfirm: () => void
  isLoading?: boolean
}

export function DeleteBarangMasukDialog({
  isOpen,
  onOpenChange,
  selectedItem,
  onConfirm,
  isLoading = false
}: DeleteBarangMasukDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-600">
            <AlertTriangle className="h-5 w-5" />
            Konfirmasi Hapus
          </DialogTitle>
          <DialogDescription>
            Apakah Anda yakin ingin menghapus data barang masuk ini? Tindakan ini tidak dapat dibatalkan.
          </DialogDescription>
        </DialogHeader>
        
        {selectedItem && (
          <div className="space-y-4">
            <div className="rounded-lg bg-gray-50 p-4">
              <h4 className="font-medium text-gray-900 mb-2">Detail Barang Masuk:</h4>
              <div className="space-y-2 text-sm text-gray-600">
                <div>
                  <span className="font-medium">Kode Kedatangan:</span> {selectedItem.kodeKedatangan}
                </div>
                <div>
                  <span className="font-medium">Tanggal:</span> {selectedItem.tanggal}
                </div>
                <div>
                  <span className="font-medium">Supplier:</span> {selectedItem.namaSupplier}
                </div>
                <div>
                  <span className="font-medium">No Form:</span> {selectedItem.noForm}
                </div>
                <div>
                  <span className="font-medium">Status:</span> {selectedItem.status}
                </div>
                {selectedItem.details && selectedItem.details.length > 0 && (
                  <div>
                    <span className="font-medium">Jumlah Detail:</span> {selectedItem.details.length} item
                  </div>
                )}
              </div>
            </div>
            
            <div className="rounded-lg bg-red-50 border border-red-200 p-4">
              <div className="flex items-start gap-2">
                <AlertTriangle className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-red-700">
                  <p className="font-medium mb-1">Peringatan:</p>
                  <ul className="list-disc list-inside space-y-1">
                    <li>Data barang masuk akan dihapus secara permanen</li>
                    <li>Semua detail barang masuk akan dihapus</li>
                    <li>Stok barang akan dikurangi sesuai jumlah yang ada</li>
                    <li>Tindakan ini tidak dapat dibatalkan</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
            className="flex-1"
          >
            Batal
          </Button>
          <Button
            variant="destructive"
            onClick={onConfirm}
            disabled={isLoading}
            className="flex-1"
          >
            {isLoading ? (
              <>
                <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                Menghapus...
              </>
            ) : (
              <>
                <Trash2 className="mr-2 h-4 w-4" />
                Hapus
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
} 