"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Loader2 } from "lucide-react"

interface User {
  id: number
  username: string
  name: string
  email: string | null
  role: 'inspeksi_mesin' | 'assembly_staff' | 'qc_staff' | 'pdi_staff' | 'painting_staff' | 'pindah_lokasi' | 'admin' | 'supervisor'
  isActive: boolean
  jobType: 'staff' | 'supervisor' | 'admin' | null
  createdAt: string
  updatedAt: string
}

interface EditUserDialogProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: { 
    id: number; 
    role: 'inspeksi_mesin' | 'assembly_staff' | 'qc_staff' | 'pdi_staff' | 'painting_staff' | 'pindah_lokasi' | 'admin' | 'supervisor'; 
    isActive: boolean; 
    jobType: 'staff' | 'supervisor' | 'admin' | null 
  }) => Promise<boolean>
  user: User | null
}

// Role options
const roleOptions = [
  { value: "admin", label: "Admin" },
  { value: "supervisor", label: "Supervisor" },
  { value: "inspeksi_mesin", label: "Inspeksi Mesin" },
  { value: "assembly_staff", label: "Assembly Staff" },
  { value: "qc_staff", label: "QC Staff" },
  { value: "pdi_staff", label: "PDI Staff" },
  { value: "painting_staff", label: "Painting Staff" },
  { value: "pindah_lokasi", label: "Pindah Lokasi" },
]

// Job type options
const jobTypeOptions = [
  { value: "admin", label: "Admin" },
  { value: "supervisor", label: "Supervisor" },
  { value: "staff", label: "Staff" },
]

export function EditUserDialog({ isOpen, onClose, onSubmit, user }: EditUserDialogProps) {
  const [role, setRole] = useState<'inspeksi_mesin' | 'assembly_staff' | 'qc_staff' | 'pdi_staff' | 'painting_staff' | 'pindah_lokasi' | 'admin' | 'supervisor'>('inspeksi_mesin')
  const [isActive, setIsActive] = useState(true)
  const [jobType, setJobType] = useState<'staff' | 'supervisor' | 'admin' | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Reset form when user changes
  useEffect(() => {
    if (user) {
      setRole(user.role)
      setIsActive(user.isActive)
      setJobType(user.jobType)
    }
  }, [user])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!user) return

    setIsSubmitting(true)
    try {
      const success = await onSubmit({
        id: user.id,
        role,
        isActive,
        jobType
      })
      
      if (success) {
        onClose()
      }
    } catch (error) {
      console.error('Error updating user:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    if (!isSubmitting) {
      onClose()
    }
  }

  if (!user) return null

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Edit Pengguna</DialogTitle>
          <DialogDescription>
            Edit informasi pengguna: {user.name} (@{user.username})
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* User Info (Read-only) */}
          <div className="space-y-4">
            <div>
              <Label className="text-sm font-medium text-gray-700">Nama</Label>
              <Input
                value={user.name}
                disabled
                className="mt-1 bg-gray-50"
              />
            </div>
            
            <div>
              <Label className="text-sm font-medium text-gray-700">Username</Label>
              <Input
                value={user.username}
                disabled
                className="mt-1 bg-gray-50"
              />
            </div>
            
            <div>
              <Label className="text-sm font-medium text-gray-700">Email</Label>
              <Input
                value={user.email || ""}
                disabled
                className="mt-1 bg-gray-50"
              />
            </div>
          </div>

          {/* Editable Fields */}
          <div className="space-y-4">
            <div>
              <Label className="text-sm font-medium text-gray-700">Role</Label>
              <Select value={role} onValueChange={(value: any) => setRole(value)}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Pilih role" />
                </SelectTrigger>
                <SelectContent>
                  {roleOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-sm font-medium text-gray-700">Job Type</Label>
              <Select value={jobType || ""} onValueChange={(value: any) => setJobType(value || null)}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Pilih job type" />
                </SelectTrigger>
                <SelectContent>
                  {jobTypeOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label className="text-sm font-medium text-gray-700">Status</Label>
                <p className="text-xs text-gray-500">Aktifkan atau nonaktifkan pengguna</p>
              </div>
              <Switch
                checked={isActive}
                onCheckedChange={setIsActive}
                className="ml-4"
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isSubmitting}
            >
              Batal
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-primary hover:bg-primary/90"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
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
