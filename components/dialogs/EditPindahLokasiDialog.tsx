"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Camera, Download, Eye } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { pindahLokasiService, PindahLokasiFormData } from "@/services/pindah-lokasi"
import { useToast } from "@/hooks/use-toast"
import { UploadFotoDialog } from "./UploadFotoDialog"

interface EditPindahLokasiDialogProps {
  isOpen: boolean
  onClose: () => void
  onSubmit?: (data: any) => void
  noSeri: string
  namaBarang?: string
  isDetailView?: boolean // Add this prop for detail view mode
}

interface FotoPindahLokasi {
  id?: number
  fileName: string
  fileUrl: string
  fileSize?: number
  fileType?: string
  uploadDate?: string
  keterangan?: string
}

export function EditPindahLokasiDialog({
  isOpen,
  onClose,
  onSubmit,
  noSeri,
  namaBarang = "",
  isDetailView = false
}: EditPindahLokasiDialogProps) {
  const [formData, setFormData] = useState<PindahLokasiFormData>({
    noSeri: noSeri,
    namaBarang: namaBarang,
    lokasiAwal: '',
    lokasiBaru: '',
    noForm: `PL/V1/${noSeri}/${new Date().getFullYear()}`,
    tanggal: new Date(),
    keterangan: ''
  })
  const [isLoading, setIsLoading] = useState(false)
  const [showUploadDialog, setShowUploadDialog] = useState(false)
  const [fotos, setFotos] = useState<FotoPindahLokasi[]>([])
  const [isLoadingFotos, setIsLoadingFotos] = useState(false)
  const { toast } = useToast()

  // Load form data when dialog opens
  useEffect(() => {
    if (isOpen && noSeri) {
      loadFormData()
      
      // Fetch foto jika dalam mode detail
      if (isDetailView) {
        fetchFotos()
      }
    }
  }, [isOpen, noSeri, isDetailView])

  const loadFormData = async () => {
    try {
      setIsLoading(true)
      const data = await pindahLokasiService.getPindahLokasiForm(noSeri)
      
      if (data) {
        // Gunakan data yang sudah ada dari API, tapi lokasiBaru selalu kosong
        setFormData({
          ...data,
          lokasiBaru: '' // Selalu kosongkan lokasi baru
        })
      } else {
        // Hanya generate otomatis jika benar-benar tidak ada data sama sekali
        const currentYear = new Date().getFullYear()
        const generatedNoForm = `PL/V1/${noSeri}/${currentYear}`
        
        // Set default data
        setFormData({
          noSeri: noSeri,
          namaBarang: namaBarang,
          lokasiAwal: 'Gudang A',
          lokasiBaru: '',
          noForm: generatedNoForm,
          tanggal: new Date(),
          keterangan: ''
        })
      }
    } catch (error) {
      console.error('Error loading form data:', error)
      toast({
        title: "Error",
        description: "Gagal memuat data form",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const fetchFotos = async () => {
    if (!noSeri) return
    
    setIsLoadingFotos(true)
    try {
      const fotoList = await pindahLokasiService.getFotoList(noSeri)
      setFotos(fotoList)
    } catch (error) {
      console.error('Error fetching fotos:', error)
      setFotos([])
    } finally {
      setIsLoadingFotos(false)
    }
  }

  const handleUploadFoto = async (file: File, keterangan: string) => {
    try {
      await pindahLokasiService.uploadFoto(file, noSeri, keterangan)
      toast({
        title: "Success",
        description: "Foto berhasil diupload",
      })
    } catch (error) {
      console.error('Error uploading foto:', error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Gagal upload foto",
        variant: "destructive",
      })
    }
  }

  const updateFormData = (field: keyof PindahLokasiFormData, value: string | Date) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (isLoading) return

    try {
      setIsLoading(true)
      
      // Validate form
      if (!formData.lokasiBaru) {
        toast({
          title: "Error",
          description: "Lokasi baru harus diisi",
          variant: "destructive",
        })
        return
      }

      if (formData.lokasiBaru === formData.lokasiAwal) {
        toast({
          title: "Error",
          description: "Lokasi baru tidak boleh sama dengan lokasi awal",
          variant: "destructive",
        })
        return
      }

      // Save form data
      await pindahLokasiService.savePindahLokasiForm(formData)

      toast({
        title: "Success",
        description: "Data pindah lokasi berhasil disimpan",
      })

      // Call callback if provided - send data in correct format for update lembar kerja
      if (onSubmit) {
        onSubmit({
          items: [{
            parameter: "Pindah Lokasi",
            aktual: formData.lokasiBaru,
            standar: formData.lokasiAwal
          }],
          keterangan: formData.keterangan || ""
        })
      }

      onClose()
    } catch (error) {
      console.error('Error saving form data:', error)
      toast({
        title: "Error",
        description: "Gagal menyimpan data pindah lokasi",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleClose = () => {
    if (!isLoading) {
      onClose()
    }
  }

  return (
    <>
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="max-w-2xl max-h-[90vh] p-0 gap-0 [&>button]:hidden flex flex-col">
          {/* Header */}
          <DialogHeader className="px-6 py-4 border-b bg-white flex-shrink-0">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <DialogTitle className="text-xl font-semibold text-gray-900">
                  {isDetailView ? 'Detail Form Pindah Lokasi' : 'Form Pindah Lokasi'} - {noSeri}
                </DialogTitle>
              </div>

            </div>
          </DialogHeader>
          
          {/* Content */}
          <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
            <div className="flex-1 p-6 overflow-hidden">
              {isDetailView ? (
                // Detail View dengan Tabs
                <Tabs defaultValue="data" className="w-full h-full flex flex-col">
                  <TabsList className="grid w-full grid-cols-2 mb-2 flex-shrink-0">
                    <TabsTrigger value="data">Data Pindah Lokasi</TabsTrigger>
                    <TabsTrigger value="foto">Foto</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="data" className="flex-1 overflow-hidden mt-0 h-full">
                    <div className="h-full flex flex-col space-y-4">
                      {/* Form dalam layout 2 rangkap */}
                      <div className="space-y-4">
                        {/* Baris 1: Nama Barang | Lokasi Awal */}
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label className="text-sm font-medium text-gray-700">
                              Nama Barang
                            </Label>
                            <div className="mt-1 p-3 bg-gray-50 border border-gray-200 rounded-md text-sm text-gray-900">
                              {formData.namaBarang}
                            </div>
                          </div>
                          <div>
                            <Label className="text-sm font-medium text-gray-700">
                              Lokasi Awal
                            </Label>
                            <div className="mt-1 p-3 bg-gray-50 border border-gray-200 rounded-md text-sm text-gray-900">
                              {formData.lokasiAwal}
                            </div>
                          </div>
                        </div>

                        {/* Baris 2: No Form | Keterangan */}
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label className="text-sm font-medium text-gray-700">
                              No Form
                            </Label>
                            <div className="mt-1 p-3 bg-gray-50 border border-gray-200 rounded-md text-sm text-gray-900">
                              {formData.noForm}
                            </div>
                          </div>
                          <div>
                            <Label className="text-sm font-medium text-gray-700">
                              Keterangan
                            </Label>
                            <div className="mt-1 p-3 bg-gray-50 border border-gray-200 rounded-md text-sm text-gray-900">
                              {formData.keterangan || '-'}
                            </div>
                          </div>
                        </div>

                        {/* Baris 3: Lokasi Awal | Lokasi Baru */}
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label className="text-sm font-medium text-gray-700">
                              Lokasi Awal
                            </Label>
                            <div className="mt-1 p-3 bg-gray-50 border border-gray-200 rounded-md text-sm text-gray-900">
                              {formData.lokasiAwal}
                            </div>
                          </div>
                          <div>
                            <Label className="text-sm font-medium text-gray-700">
                              Lokasi Baru
                            </Label>
                            <div className="mt-1 p-3 bg-gray-50 border border-gray-200 rounded-md text-sm text-gray-900">
                              {formData.lokasiBaru || '-'}
                            </div>
                          </div>
                        </div>

                        {/* Tanggal */}
                        <div>
                          <Label className="text-sm font-medium text-gray-700">
                            Tanggal
                          </Label>
                          <div className="mt-1 p-3 bg-gray-50 border border-gray-200 rounded-md text-sm text-gray-900">
                            {formData.tanggal ? new Date(formData.tanggal).toLocaleDateString('id-ID') : '-'}
                          </div>
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="foto" className="flex-1 overflow-hidden mt-0 h-full">
                    <div className="h-full flex flex-col overflow-hidden">
                      <div className="flex-shrink-0 mb-4">
                        <h3 className="text-lg font-semibold text-gray-900">Foto Pindah Lokasi</h3>
                      </div>
                      <div className="flex-1 overflow-auto">
                        {isLoadingFotos ? (
                          <div className="flex items-center justify-center h-full">
                            <div className="text-center">
                              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                              <p className="text-gray-500">Memuat foto...</p>
                            </div>
                          </div>
                        ) : fotos.length > 0 ? (
                          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-4">
                            {fotos.map((foto) => (
                              <div key={foto.id} className="bg-white border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                                <div className="aspect-square bg-gray-100 relative group">
                                  <img
                                    src={foto.fileUrl}
                                    alt={foto.fileName}
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                      const target = e.target as HTMLImageElement
                                      target.src = '/placeholder.svg'
                                    }}
                                  />
                                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-200 flex items-center justify-center">
                                    <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex gap-2">
                                      <Button
                                        size="sm"
                                        variant="secondary"
                                        className="bg-white text-gray-900 hover:bg-gray-100"
                                        onClick={() => window.open(foto.fileUrl, '_blank')}
                                      >
                                        <Eye className="h-4 w-4" />
                                      </Button>
                                      <Button
                                        size="sm"
                                        variant="secondary"
                                        className="bg-white text-gray-900 hover:bg-gray-100"
                                        onClick={() => {
                                          const link = document.createElement('a')
                                          link.href = foto.fileUrl
                                          link.download = foto.fileName
                                          link.click()
                                        }}
                                      >
                                        <Download className="h-4 w-4" />
                                      </Button>
                                    </div>
                                  </div>
                                </div>
                                <div className="p-3">
                                  <p className="text-sm font-medium text-gray-900 truncate" title={foto.fileName}>
                                    {foto.fileName}
                                  </p>
                                  {foto.keterangan && (
                                    <p className="text-xs text-gray-500 mt-1 truncate" title={foto.keterangan}>
                                      {foto.keterangan}
                                    </p>
                                  )}
                                  {foto.uploadDate && (
                                    <p className="text-xs text-gray-400 mt-1">
                                      {new Date(foto.uploadDate).toLocaleDateString('id-ID')}
                                    </p>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center py-8 text-gray-500">
                            <Camera className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                            <p>Belum ada foto pindah lokasi</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              ) : (
                // Edit View dengan layout 2 rangkap
                <div className="space-y-4">
                  {/* Baris 1: Nama Barang | Lokasi Awal */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="namaBarang" className="text-sm font-medium text-gray-700">
                        Nama Barang
                      </Label>
                      <Input
                        id="namaBarang"
                        value={formData.namaBarang}
                        onChange={(e) => updateFormData('namaBarang', e.target.value)}
                        disabled={true}
                        className="mt-1 bg-gray-50 border-gray-200 text-gray-600"
                      />
                    </div>
                    <div>
                      <Label htmlFor="lokasiAwal" className="text-sm font-medium text-gray-700">
                        Lokasi Awal
                      </Label>
                      <Input
                        id="lokasiAwal"
                        value={formData.lokasiAwal}
                        onChange={(e) => updateFormData('lokasiAwal', e.target.value)}
                        disabled={true}
                        className="mt-1 bg-gray-50 border-gray-200 text-gray-600"
                      />
                    </div>
                  </div>

                  {/* Baris 2: No Form | Keterangan */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="noForm" className="text-sm font-medium text-gray-700">
                        No Form
                      </Label>
                      <Input
                        id="noForm"
                        value={formData.noForm}
                        onChange={(e) => updateFormData('noForm', e.target.value)}
                        placeholder="Nomor form otomatis"
                        disabled={true}
                        className="mt-1 border-gray-200 focus:border-blue-500 focus:ring-blue-500 bg-gray-50"
                      />
                    </div>
                    <div>
                      <Label htmlFor="keterangan" className="text-sm font-medium text-gray-700">
                        Keterangan
                      </Label>
                      <Input
                        id="keterangan"
                        value={formData.keterangan}
                        onChange={(e) => updateFormData('keterangan', e.target.value)}
                        placeholder="Masukkan keterangan"
                        disabled={isLoading}
                        className="mt-1 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  {/* Baris 3: Lokasi Awal | Lokasi Baru */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="lokasiAwal2" className="text-sm font-medium text-gray-700">
                        Lokasi Awal
                      </Label>
                      <Input
                        id="lokasiAwal2"
                        value={formData.lokasiAwal}
                        onChange={(e) => updateFormData('lokasiAwal', e.target.value)}
                        disabled={true}
                        className="mt-1 bg-gray-50 border-gray-200 text-gray-600"
                      />
                    </div>
                    <div>
                      <Label htmlFor="lokasiBaru" className="text-sm font-medium text-gray-700">
                        Lokasi Terbaru *
                      </Label>
                      <Input
                        id="lokasiBaru"
                        value={formData.lokasiBaru}
                        onChange={(e) => updateFormData('lokasiBaru', e.target.value)}
                        placeholder="Masukkan lokasi baru"
                        disabled={isLoading}
                        className="mt-1 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  {/* Tanggal */}
                  <div>
                    <Label htmlFor="tanggal" className="text-sm font-medium text-gray-700">
                      Tanggal
                    </Label>
                    <Input
                      id="tanggal"
                      type="date"
                      value={formData.tanggal ? new Date(formData.tanggal).toISOString().split('T')[0] : ''}
                      onChange={(e) => updateFormData('tanggal', new Date(e.target.value))}
                      disabled={isLoading}
                      className="mt-1 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="border-t bg-gray-50 rounded-b-lg flex-shrink-0">
              <div className="flex items-center justify-end gap-3 px-6 py-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleClose}
                  disabled={isLoading}
                  className="px-6"
                >
                  {isDetailView ? 'Tutup' : 'Batal'}
                </Button>
                {!isDetailView && (
                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="px-6 bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    {isLoading ? "Menyimpan..." : "Simpan"}
                  </Button>
                )}
              </div>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Upload Foto Dialog */}
      <UploadFotoDialog
        isOpen={showUploadDialog}
        onClose={() => setShowUploadDialog(false)}
        onUpload={handleUploadFoto}
        noSeri={noSeri}
        namaBarang={namaBarang}
        serviceType="pindah-lokasi"
        isDetailView={isDetailView}
      />
    </>
  )
} 