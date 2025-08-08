"use client"

import { useState, useRef, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Camera, Upload, X, Trash2, Eye, Download } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { inspeksiService, FotoInspeksi } from "@/services/inspeksi"
import { assemblyService, FotoAssembly } from "@/services/assembly"
import { qcService, FotoQC } from "@/services/qc"
import { pdiService, FotoPDI } from "@/services/pdi"
import { paintingService, FotoPainting } from "@/services/painting"
import { pindahLokasiService, FotoPindahLokasi } from "@/services/pindah-lokasi"

// Union type untuk semua jenis foto
type FotoItem = FotoInspeksi | FotoAssembly | FotoQC | FotoPDI | FotoPainting | FotoPindahLokasi

// Service type untuk mendukung semua service
type FotoService = {
  getFotoList: (noSeri: string) => Promise<FotoItem[]>
  uploadFoto: (file: File, noSeri: string, keterangan: string) => Promise<void>
  deleteFoto: (fotoId: number, noSeri?: string) => Promise<void>
}

interface UploadFotoDialogProps {
  isOpen: boolean
  onClose: () => void
  onUpload: (file: File, keterangan: string) => Promise<void>
  noSeri: string
  namaBarang?: string
  serviceType: 'inspeksi' | 'assembly' | 'qc' | 'pdi' | 'painting' | 'pindah-lokasi'
  isDetailView?: boolean // Add this prop for detail view mode
}

// Mapping service type ke service instance dan title
const getServiceConfig = (serviceType: string) => {
  switch (serviceType) {
    case 'inspeksi':
      return {
        service: inspeksiService as FotoService,
        title: 'Manajemen Foto Inspeksi',
        description: 'foto tersimpan untuk inspeksi ini'
      }
    case 'assembly':
      return {
        service: assemblyService as FotoService,
        title: 'Manajemen Foto Assembly',
        description: 'foto tersimpan untuk assembly ini'
      }
    case 'qc':
      return {
        service: qcService as FotoService,
        title: 'Manajemen Foto QC',
        description: 'foto tersimpan untuk QC ini'
      }
    case 'pdi':
      return {
        service: pdiService as FotoService,
        title: 'Manajemen Foto PDI',
        description: 'foto tersimpan untuk PDI ini'
      }
    case 'painting':
      return {
        service: paintingService as FotoService,
        title: 'Manajemen Foto Painting',
        description: 'foto tersimpan untuk painting ini'
      }
    case 'pindah-lokasi':
      return {
        service: pindahLokasiService as FotoService,
        title: 'Manajemen Foto Pindah Lokasi',
        description: 'foto tersimpan untuk pindah lokasi ini'
      }
    default:
      return {
        service: inspeksiService as FotoService,
        title: 'Manajemen Foto',
        description: 'foto tersimpan'
      }
  }
}

export function UploadFotoDialog({
  isOpen,
  onClose,
  onUpload,
  noSeri,
  namaBarang = "",
  serviceType,
  isDetailView = false
}: UploadFotoDialogProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [keterangan, setKeterangan] = useState("")
  const [isUploading, setIsUploading] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [fotoList, setFotoList] = useState<FotoItem[]>([])
  const [selectedFoto, setSelectedFoto] = useState<FotoItem | null>(null)
  const [showFotoPreview, setShowFotoPreview] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

  const serviceConfig = getServiceConfig(serviceType)

  // Load foto list when dialog opens
  useEffect(() => {
    if (isOpen) {
      loadFotoList()
    }
  }, [isOpen, noSeri, serviceType])

  const loadFotoList = async () => {
    try {
      const fotos = await serviceConfig.service.getFotoList(noSeri)
      setFotoList(fotos)
    } catch (error) {
      console.error('Error loading foto list:', error)
      toast({
        title: "Error",
        description: "Gagal memuat daftar foto",
        variant: "destructive",
      })
    }
  }

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      // Validasi file
      if (!file.type.startsWith('image/')) {
        toast({
          title: "Error",
          description: "File harus berupa gambar",
          variant: "destructive",
        })
        return
      }

      if (file.size > 5 * 1024 * 1024) { // 5MB
        toast({
          title: "Error",
          description: "Ukuran file maksimal 5MB",
          variant: "destructive",
        })
        return
      }

      setSelectedFile(file)
      
      // Create preview URL
      const url = URL.createObjectURL(file)
      setPreviewUrl(url)
    }
  }

  const handleUpload = async () => {
    if (!selectedFile) {
      toast({
        title: "Error",
        description: "Pilih file terlebih dahulu",
        variant: "destructive",
      })
      return
    }

    try {
      setIsUploading(true)
      await onUpload(selectedFile, keterangan)
      
      // Reset form
      setSelectedFile(null)
      setKeterangan("")
      setPreviewUrl(null)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
      
      // Reload foto list
      await loadFotoList()
      
      toast({
        title: "Success",
        description: "Foto berhasil diupload",
      })
    } catch (error) {
      console.error('Error uploading:', error)
      toast({
        title: "Error",
        description: "Gagal upload foto",
        variant: "destructive",
      })
    } finally {
      setIsUploading(false)
    }
  }

  const handleDeleteFoto = async (foto: FotoItem) => {
    try {
      setIsDeleting(true)
      await serviceConfig.service.deleteFoto(foto.id!, noSeri)
      await loadFotoList()
      
      toast({
        title: "Success",
        description: "Foto berhasil dihapus",
      })
    } catch (error) {
      console.error('Error deleting foto:', error)
      toast({
        title: "Error",
        description: "Gagal menghapus foto",
        variant: "destructive",
      })
    } finally {
      setIsDeleting(false)
    }
  }

  const handlePreviewFoto = (foto: FotoItem) => {
    setSelectedFoto(foto)
    setShowFotoPreview(true)
  }

  const handleDownloadFoto = (foto: FotoItem) => {
    const link = document.createElement('a')
    link.href = foto.fileUrl
    link.download = foto.fileName
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handleClose = () => {
    if (!isUploading && !isDeleting) {
      // Cleanup preview URL
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl)
      }
      
      // Reset form
      setSelectedFile(null)
      setKeterangan("")
      setPreviewUrl(null)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
      
      onClose()
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (file) {
      // Create a synthetic event for file selection
      const syntheticEvent = {
        target: { files: [file] }
      } as unknown as React.ChangeEvent<HTMLInputElement>
      handleFileSelect(syntheticEvent)
    }
  }

  return (
    <>
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="max-w-4xl max-h-[90vh] p-0">
          {/* Header */}
          <DialogHeader className="px-6 py-4 border-b bg-gradient-to-r from-blue-50 to-indigo-50">
            <div className="flex items-center justify-between">
              <div>
                <DialogTitle className="text-xl font-semibold text-gray-900">
                  {isDetailView ? 'Lihat Foto' : serviceConfig.title}
                </DialogTitle>
                <div className="flex items-center gap-2 mt-1 text-sm text-gray-600">
                  <span className="font-medium">No Seri:</span>
                  <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-md font-mono">{noSeri}</span>
                  {namaBarang && (
                    <>
                      <span>•</span>
                      <span>{namaBarang}</span>
                    </>
                  )}
                </div>
              </div>
            </div>
          </DialogHeader>

          {/* Content */}
          <div className="flex-1 overflow-hidden">
            <div className="p-6 h-full overflow-y-auto">
              <div className={`grid gap-6 ${isDetailView ? 'grid-cols-1' : 'grid-cols-1 lg:grid-cols-2'}`}>
                {/* Upload Section - Hidden in detail view */}
                {!isDetailView && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Upload Foto Baru</h3>
                    
                      {/* Upload Area */}
                      <div className="space-y-4">
                        <div
                          className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-200 h-[147px] flex items-center justify-center ${
                            selectedFile 
                              ? 'border-green-400 bg-green-50' 
                              : 'border-gray-300 hover:border-blue-400 hover:bg-blue-50'
                          }`}
                          onClick={() => fileInputRef.current?.click()}
                          onDragOver={handleDragOver}
                          onDrop={handleDrop}
                        >
                          {previewUrl ? (
                            <div className="space-y-2">
                              <div className="relative inline-block">
                                <img
                                  src={previewUrl}
                                  alt="Preview"
                                  className="max-h-20 max-w-full object-contain rounded-lg shadow-lg"
                                />
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  className="absolute -top-1 -right-1 h-5 w-5 p-0 rounded-full"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    setSelectedFile(null)
                                    setPreviewUrl(null)
                                    if (fileInputRef.current) {
                                      fileInputRef.current.value = ''
                                    }
                                  }}
                                >
                                  <X className="h-3 w-3" />
                                </Button>
                              </div>
                              <div>
                                <p className="text-xs font-medium text-gray-900">
                                  {selectedFile?.name}
                                </p>
                                <p className="text-xs text-gray-500">
                                  {selectedFile && (selectedFile.size / 1024 / 1024).toFixed(2)} MB
                                </p>
                              </div>
                            </div>
                          ) : (
                            <div className="space-y-4">
                              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                                <Camera className="h-8 w-8 text-blue-600" />
                              </div>
                              <div>
                                <p className="text-lg font-medium text-gray-900 mb-2">
                                  Klik atau drag & drop file (max 5MB)
                                </p>
                              </div>
                            </div>
                          )}
                        </div>
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          onChange={handleFileSelect}
                          className="hidden"
                        />
                      </div>

                      {/* Keterangan */}
                      <div className="space-y-3 mt-6">
                        <Label htmlFor="keterangan" className="text-base font-medium text-gray-900">
                          Keterangan (Opsional)
                        </Label>
                        <Textarea
                          id="keterangan"
                          value={keterangan}
                          onChange={(e) => setKeterangan(e.target.value)}
                          placeholder="Masukkan keterangan untuk foto ini..."
                          className="resize-none border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                          rows={3}
                        />
                      </div>

                      {/* Upload Button */}
                      <div className="mt-6">
                        <Button
                          onClick={handleUpload}
                          disabled={!selectedFile || isUploading || isDeleting}
                          className="w-full bg-blue-600 hover:bg-blue-700"
                        >
                          <Upload className="h-4 w-4 mr-2" />
                          {isUploading ? "Uploading..." : "Upload Foto"}
                        </Button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Gallery Section */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900">Foto Tersimpan</h3>
                    <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                      {fotoList.length} foto
                    </span>
                  </div>
                  
                  {fotoList.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-[147px] text-center bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                      <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center mb-3">
                        <Camera className="h-6 w-6 text-gray-400" />
                      </div>
                      <p className="text-sm text-gray-500">Belum ada foto tersimpan</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-3 h-[147px] overflow-y-auto">
                      {fotoList.map((foto, index) => (
                        <div key={foto.id} className="group relative bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-all duration-200">
                          {/* Image */}
                          <div className="aspect-square relative">
                            <img
                              src={foto.fileUrl}
                              alt={`Foto ${serviceType} ${index + 1}`}
                              className="w-full h-full object-cover cursor-pointer"
                              onClick={() => handlePreviewFoto(foto)}
                            />
                            
                            {/* Overlay */}
                            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all duration-200 flex items-center justify-center">
                              <div className="opacity-0 group-hover:opacity-100 flex gap-1 transition-opacity duration-200">
                                <Button
                                  size="sm"
                                  variant="secondary"
                                  className="h-7 w-7 p-0 bg-white/90 hover:bg-white"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    handlePreviewFoto(foto)
                                  }}
                                >
                                  <Eye className="h-3 w-3" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="secondary"
                                  className="h-7 w-7 p-0 bg-white/90 hover:bg-white"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    handleDownloadFoto(foto)
                                  }}
                                >
                                  <Download className="h-3 w-3" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  className="h-7 w-7 p-0 bg-red-500/90 hover:bg-red-500"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    handleDeleteFoto(foto)
                                  }}
                                  disabled={isDeleting}
                                >
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>
                          </div>
                          
                          {/* Info */}
                          <div className="p-2">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-xs font-medium text-gray-900">
                                Foto {index + 1}
                              </span>
                              <span className="text-xs text-gray-500">
                                {foto.fileSize ? (foto.fileSize / 1024 / 1024).toFixed(1) : '0'}MB
                              </span>
                            </div>
                            {foto.keterangan && (
                              <p className="text-xs text-gray-600 line-clamp-1">
                                {foto.keterangan}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between px-6 py-4 border-t bg-gray-50 rounded-b-lg">
            <div className="text-sm text-gray-500">
              {fotoList.length} {serviceConfig.description}
            </div>
            <Button
              variant="outline"
              onClick={handleClose}
              disabled={isUploading || isDeleting}
            >
              Tutup
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Foto Preview Dialog */}
      {showFotoPreview && selectedFoto && (
        <Dialog open={showFotoPreview} onOpenChange={setShowFotoPreview}>
          <DialogContent className="max-w-5xl max-h-[95vh] p-0">
            <div className="relative">
              <Button
                variant="ghost"
                size="sm"
                className="absolute top-4 right-4 z-10 bg-black/50 text-white hover:bg-black/70"
                onClick={() => setShowFotoPreview(false)}
              >
                <X className="h-4 w-4" />
              </Button>
              <img
                src={selectedFoto.fileUrl}
                alt={`Preview foto ${serviceType}`}
                className="w-full h-auto max-h-[90vh] object-contain"
              />
              <div className="absolute bottom-4 left-4 right-4 bg-black/70 text-white p-4 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{selectedFoto.fileName}</p>
                    {selectedFoto.keterangan && (
                      <p className="text-sm text-gray-300 mt-1">{selectedFoto.keterangan}</p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => handleDownloadFoto(selectedFoto)}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDeleteFoto(selectedFoto)}
                      disabled={isDeleting}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Hapus
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  )
} 