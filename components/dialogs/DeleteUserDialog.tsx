"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Loader2, AlertTriangle } from "lucide-react"

interface User {
  id: number
  username: string
  name: string
  email: string | null
  role: string
  isActive: boolean
  jobType: string | null
  createdAt: string
  updatedAt: string
}

interface DeleteUserDialogProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: (userId: number) => Promise<boolean>
  user: User | null
}

export function DeleteUserDialog({ isOpen, onClose, onConfirm, user }: DeleteUserDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false)

  const handleConfirm = async () => {
    if (!user) return

    setIsDeleting(true)
    try {
      const success = await onConfirm(user.id)
      if (success) {
        onClose()
      }
    } catch (error) {
      console.error('Error deleting user:', error)
    } finally {
      setIsDeleting(false)
    }
  }

  const handleClose = () => {
    if (!isDeleting) {
      onClose()
    }
  }

  if (!user) return null

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-600">
            <AlertTriangle className="h-5 w-5" />
            Hapus Pengguna
          </DialogTitle>
          <DialogDescription>
            Apakah Anda yakin ingin menghapus pengguna ini? Tindakan ini tidak dapat dibatalkan.
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4">
          <div className="rounded-lg bg-red-50 border border-red-200 p-4">
            <h4 className="font-medium text-red-800 mb-2">Informasi Pengguna:</h4>
            <div className="space-y-1 text-sm text-red-700">
              <p><span className="font-medium">Nama:</span> {user.name}</p>
              <p><span className="font-medium">Username:</span> @{user.username}</p>
              <p><span className="font-medium">Email:</span> {user.email || "Tidak ada email"}</p>
              <p><span className="font-medium">Role:</span> {user.role}</p>
              <p><span className="font-medium">Job Type:</span> {user.jobType || "Tidak ada"}</p>
            </div>
          </div>
          
          <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
            <p className="text-sm text-amber-800">
              <strong>Peringatan:</strong> Menghapus pengguna akan menghapus semua data terkait dan tidak dapat dipulihkan.
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={isDeleting}
          >
            Batal
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleConfirm}
            disabled={isDeleting}
          >
            {isDeleting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Menghapus...
              </>
            ) : (
              "Hapus Pengguna"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
