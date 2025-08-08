"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { userService } from "@/services/user"

interface AddTransaksiDialogProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: {
    detailBarangMasukNoSeriId: number
    jenisPekerjaan: string
    staffId: number
    status: string
    ket?: string
    lokasi?: string
  }) => void
  detailBarangMasukNoSeriId: number
  noSeri: string
}

interface User {
  id: number
  name: string
  username: string
  jobType: 'staff' | 'supervisor' | 'admin' | null
}

const JOB_TYPES = [
  { value: 'inspeksi_mesin', label: 'Inspeksi Mesin' },
  { value: 'assembly_staff', label: 'Assembly Staff' },
  { value: 'qc_staff', label: 'QC Staff' },
  { value: 'pdi_staff', label: 'PDI Staff' },
  { value: 'painting_staff', label: 'Painting Staff' },
  { value: 'pindah_lokasi', label: 'Pindah Lokasi' }
]

// Mapping untuk mengkonversi jenis pekerjaan ke role yang sesuai
const getRoleFromJenisPekerjaan = (jenisPekerjaan: string): 'inspeksi_mesin' | 'assembly_staff' | 'qc_staff' | 'pdi_staff' | 'painting_staff' | 'pindah_lokasi' => {
  switch (jenisPekerjaan) {
    case 'inspeksi_mesin':
      return 'inspeksi_mesin'
    case 'assembly_staff':
      return 'assembly_staff'
    case 'qc_staff':
      return 'qc_staff'
    case 'pdi_staff':
      return 'pdi_staff'
    case 'painting_staff':
      return 'painting_staff'
    case 'pindah_lokasi':
      return 'pindah_lokasi'
    default:
      return 'inspeksi_mesin' // fallback
  }
}

export function AddTransaksiDialog({
  isOpen,
  onClose,
  onSubmit,
  detailBarangMasukNoSeriId,
  noSeri
}: AddTransaksiDialogProps) {
  const [jenisPekerjaan, setJenisPekerjaan] = useState("")
  const [staffId, setStaffId] = useState("")
  const [status, setStatus] = useState("Proses")
  const [ket, setKet] = useState("")
  const [lokasi, setLokasi] = useState("")
  const [users, setUsers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingUsers, setIsLoadingUsers] = useState(false)

  const { toast } = useToast()

  // Load users when jenis pekerjaan changes
  useEffect(() => {
    if (jenisPekerjaan) {
      loadUsers(jenisPekerjaan)
    } else {
      setUsers([])
      setStaffId("")
    }
  }, [jenisPekerjaan])

  const loadUsers = async (jenisPekerjaan: string) => {
    try {
      setIsLoadingUsers(true)
      
      // Konversi jenis pekerjaan ke role yang sesuai
      const role = getRoleFromJenisPekerjaan(jenisPekerjaan)
      
      const userData = await userService.getUsersByRole(role)
      setUsers(userData)
      
      // Auto-select first user if available
      if (userData.length > 0) {
        setStaffId(userData[0].id.toString())
      }
    } catch (error) {
      console.error('Error loading users:', error)
      toast({
        title: "Error",
        description: "Gagal memuat data staff",
        variant: "destructive",
      })
    } finally {
      setIsLoadingUsers(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!jenisPekerjaan || !staffId) {
      toast({
        title: "Error",
        description: "Jenis pekerjaan dan staff wajib diisi",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    
    try {
      await onSubmit({
        detailBarangMasukNoSeriId,
        jenisPekerjaan,
        staffId: parseInt(staffId),
        status,
        ket: ket || undefined,
        lokasi: lokasi || undefined
      })
      
      // Reset form
      setJenisPekerjaan("")
      setStaffId("")
      setStatus("Proses")
      setKet("")
      setLokasi("")
      onClose()
    } catch (error) {
      console.error('Error submitting form:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleClose = () => {
    if (!isLoading) {
      setJenisPekerjaan("")
      setStaffId("")
      setStatus("Proses")
      setKet("")
      setLokasi("")
      setUsers([])
      onClose()
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Tambah Transaksi Baru</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="noSeri">No Seri</Label>
              <Input
                id="noSeri"
                value={noSeri}
                disabled
                className="bg-gray-50"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="jenisPekerjaan">Jenis Pekerjaan *</Label>
              <Select
                value={jenisPekerjaan}
                onValueChange={setJenisPekerjaan}
                disabled={isLoading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Pilih jenis pekerjaan" />
                </SelectTrigger>
                <SelectContent>
                  {JOB_TYPES.map((jobType) => (
                    <SelectItem key={jobType.value} value={jobType.value}>
                      {jobType.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="staff">Staff *</Label>
            <Select
              value={staffId}
              onValueChange={setStaffId}
              disabled={isLoading || isLoadingUsers || !jenisPekerjaan}
            >
              <SelectTrigger>
                <SelectValue placeholder={
                  isLoadingUsers 
                    ? "Memuat staff..." 
                    : !jenisPekerjaan 
                    ? "Pilih jenis pekerjaan terlebih dahulu"
                    : "Pilih staff"
                } />
              </SelectTrigger>
              <SelectContent>
                {users.map((user) => (
                  <SelectItem key={user.id} value={user.id.toString()}>
                    {user.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select
              value={status}
              onValueChange={setStatus}
              disabled={isLoading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Pilih status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Proses">Proses</SelectItem>
                <SelectItem value="Selesai">Selesai</SelectItem>
                <SelectItem value="Ditolak">Ditolak</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="lokasi">Lokasi</Label>
            <Input
              id="lokasi"
              value={lokasi}
              onChange={(e) => setLokasi(e.target.value)}
              placeholder="Masukkan lokasi"
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="ket">Keterangan</Label>
            <Textarea
              id="ket"
              value={ket}
              onChange={(e) => setKet(e.target.value)}
              placeholder="Keterangan"
              disabled={isLoading}
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isLoading}
            >
              Batal
            </Button>
            <Button
              type="submit"
              disabled={isLoading || !jenisPekerjaan || !staffId}
            >
              {isLoading ? "Menyimpan..." : "Simpan"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
} 