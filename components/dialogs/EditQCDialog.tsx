"use client"

import { useState, useEffect, useRef } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, Trash2, Camera, Download, Eye } from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { qcService } from "@/services/qc"
import { useToast } from "@/hooks/use-toast"
import { UploadFotoDialog } from "./UploadFotoDialog"

interface QCItem {
  id?: number
  parameter: string
  aktual: string
  standar: string
  isHeader?: boolean
  isStatement?: boolean
  parentNumber?: number
  subNumber?: string
}

interface FotoQC {
  id?: number
  fileName: string
  fileUrl: string
  fileSize?: number
  fileType?: string
  uploadDate?: string
  keterangan?: string
}

interface EditQCDialogProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: {noSeri: string
    items: QCItem[]
    keterangan?: string
  }) => void
  noSeri: string
  currentItems?: QCItem[]
  namaBarang?: string
  isDetailView?: boolean // Add this prop for detail view mode
  currentKeterangan?: string // Add this prop for current keterangan value
}

// Parameter bawaan untuk QC sesuai gambar
const DEFAULT_QC_PARAMETERS: QCItem[] = [
  // 1. Pengecekan fungsi Regulator
  { 
    parameter: "Pengecekan fungsi Regulator", 
    aktual: "", 
    standar: "",
    isHeader: true,
    parentNumber: 1
  },
  { 
    parameter: "Cek tekanan angin dengan max 7-8 bar", 
    aktual: "", 
    standar: "Max 7-8 bar",
    parentNumber: 1
  },
  
  // 2. Pengecekan fungsi Air Gun
  { 
    parameter: "Pengecekan fungsi Air Gun", 
    aktual: "", 
    standar: "",
    isHeader: true,
    parentNumber: 2
  },
  { 
    parameter: "2.1 Fungsi pengisian angin ( menggunakan ban mobil )", 
    aktual: "", 
    standar: "",
    isStatement: true,
    parentNumber: 2
  },
  { 
    parameter: "Dengan cara tuas ditekan full, isi durasi waktu aktual hingga tekanan 40 Psi", 
    aktual: "", 
    standar: "35 - 60 detik",
    parentNumber: 2
  },
  { 
    parameter: "2.2 Fungsi pengurangan tekanan angin", 
    aktual: "", 
    standar: "",
    isStatement: true,
    parentNumber: 2
  },
  { 
    parameter: "Dengan cara tuas ditekan setengah, isi durasi waktu aktual hingga tekanan 40-0 Psi", 
    aktual: "", 
    standar: "105-120 detik",
    parentNumber: 2
  },
  
  // 3. Pengecekan fungsi pedal putaran piringan / cek dynamo, center kuku velg
  { 
    parameter: "Pengecekan fungsi pedal putaran piringan / cek dynamo, center kuku velg", 
    aktual: "", 
    standar: "",
    isHeader: true,
    parentNumber: 3
  },
  
  // 3.1 FUNGSI PEDAL
  { 
    parameter: "3.1 FUNGSI PEDAL", 
    aktual: "", 
    standar: "",
    isStatement: true,
    parentNumber: 3
  },
  { 
    parameter: "Tekan Pedal 1/2 (Tidak full ditekan ke bawah) selama 30 detik, cek apakah kuku bergerak", 
    aktual: "", 
    standar: "tidak bergerak",
    parentNumber: 3
  },
  { 
    parameter: "Jika tidak bergerak maka tidak ada kebocoran pada piston dan sebaliknya", 
    aktual: "", 
    standar: "",
    isStatement: true,
    parentNumber: 3
  },
  { 
    parameter: "Ukur Max Velg 24.5\" = 22\"", 
    aktual: "", 
    standar: "24.5\"",
    parentNumber: 3
  },
  
  // 3.2 TES DYNAMO
  { 
    parameter: "3.2 TES DYNAMO / tes putaran piringan (Tes dengan Alat Master Velg Tes, Alat Center Gauge dan Stop watch)", 
    aktual: "", 
    standar: "",
    isStatement: true,
    parentNumber: 3
  },
  { 
    parameter: "Tekan pedal dan hitung waktu yg dibutuhkan untuk mencapai 6 putaran piringan", 
    aktual: "", 
    standar: "40-70 Detik",
    parentNumber: 3
  },
  { 
    parameter: "Cek Putaran Kekiri (Dengan Cara Pedal Tekan Ke Atas atau kebalikanya)", 
    aktual: "", 
    standar: "",
    isStatement: true,
    parentNumber: 3
  },
  
  // 3.3 Tes dan cek adapter
  { 
    parameter: "3.3 Tes dan cek adapter penjepit velg, Center Kuku Velg dan Plastik Pelindung Kuku (menggunakan alat center gauge)", 
    aktual: "", 
    standar: "",
    isStatement: true,
    parentNumber: 3
  },
  { 
    parameter: "ukur dan cek nilai sudut yang ditampilkan", 
    aktual: "", 
    standar: "0.0-1.50 mm",
    parentNumber: 3
  },
  { 
    parameter: "Jika ada nilai sudut melebihi dari standar maksimal center (> 1.50 mm), maka setting kuku penjepitnya", 
    aktual: "", 
    standar: "",
    isStatement: true,
    parentNumber: 3
  },
  { 
    parameter: "ukur ulang dan cek nilai sudut yang ditampilkan", 
    aktual: "", 
    standar: "0.0-1.50 mm",
    parentNumber: 3
  }
]

export function EditQCDialog({
  isOpen,
  onClose,
  onSubmit,
  noSeri,
  currentItems = [],
  namaBarang = "",
  isDetailView = false,
  currentKeterangan = ""
}: EditQCDialogProps) {
  const [items, setItems] = useState<QCItem[]>(currentItems)
  const [isLoading, setIsLoading] = useState(false)
  const [showUploadDialog, setShowUploadDialog] = useState(false)
  const [fotos, setFotos] = useState<FotoQC[]>([])
  const [isLoadingFotos, setIsLoadingFotos] = useState(false)
  const [keterangan, setKeterangan] = useState(currentKeterangan)
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const { toast } = useToast()

  // Reset items when dialog opens with new data
  useEffect(() => {
    if (isOpen) {
      if (currentItems.length > 0) {
        const sanitizedItems = currentItems.map(item => {
                     // Detect if item is a statement based on parameter content
           const isStatement = item.parameter.includes("Jika") || 
                              item.parameter.includes("Cek Putaran Kekiri") ||
                              item.parameter.includes("maka setting kuku penjepitnya") ||
                              item.parameter.includes("Fungsi pengisian angin") ||
                              item.parameter.includes("Fungsi pengurangan tekanan angin") ||
                              item.parameter.includes("3.1 FUNGSI PEDAL") ||
                              item.parameter.includes("3.2 TES DYNAMO") ||
                              item.parameter.includes("3.3 Tes dan cek adapter")
          
                     // Detect if item is a header based on parameter content
           const isHeader = item.parameter.includes("Pengecekan fungsi")
          
          return {
            ...item,
            parameter: item.parameter || "",
            aktual: item.aktual || "",
            standar: item.standar || "",
            isHeader: item.isHeader || isHeader,
            isStatement: item.isStatement || isStatement,
            parentNumber: item.parentNumber || 0,
            subNumber: item.subNumber || ""
          }
        })
        setItems(sanitizedItems)
      } else {
        const defaultItems = DEFAULT_QC_PARAMETERS.map(item => ({ ...item }))
        setItems(defaultItems)
      }

      // Set keterangan from currentKeterangan prop
      setKeterangan(currentKeterangan || "")

      // Fetch foto jika dalam mode detail
      if (isDetailView) {
        fetchFotos()
      }
    }
  }, [isOpen, currentItems, noSeri, isDetailView, currentKeterangan])

  const fetchFotos = async () => {
    if (!noSeri) return
    
    setIsLoadingFotos(true)
    try {
      const fotoList = await qcService.getFotoList(noSeri)
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
      await qcService.uploadFoto(file, noSeri, keterangan)
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

  const addItem = () => {
    setItems(prev => [...prev, { 
      parameter: "", 
      aktual: "", 
      standar: "",
      isHeader: false,
      isStatement: false,
      parentNumber: 0,
      subNumber: ""
    }])
    
    // Auto scroll to bottom after adding item
    setTimeout(() => {
      const scrollArea = scrollAreaRef.current?.querySelector('[data-radix-scroll-area-viewport]')
      if (scrollArea) {
        scrollArea.scrollTo({
          top: scrollArea.scrollHeight,
          behavior: 'smooth'
        })
      }
    }, 150)
  }

  const removeItem = (index: number) => {
    setItems(prev => prev.filter((_, i) => i !== index))
  }

  const updateItem = (index: number, field: keyof QCItem, value: string | boolean) => {
    setItems(prev => prev.map((item, i) => i === index ? { ...item, [field]: value } : item))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (isLoading) return

    try {
      setIsLoading(true)
      
      const validItems = items.filter(item => item.parameter.trim() !== '')
      
      if (validItems.length === 0) {
        toast({
          title: "Error",
          description: "Minimal satu parameter harus diisi",
          variant: "destructive",
        })
        return
      }

      await onSubmit({noSeri,
        items: validItems,
        keterangan
      })

      toast({
        title: "Success",
        description: "Data QC berhasil disimpan",
      })

      onClose()
    } catch (error) {
      console.error('Error saving QC data:', error)
      toast({
        title: "Error",
        description: "Gagal menyimpan data QC",
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

  const getRowClassName = (item: QCItem) => {
    if (item.isHeader) {
      return "bg-blue-50 font-semibold"
    }
    if (item.isStatement) {
      return "bg-gray-50 italic"
    }
    return "hover:bg-gray-50 transition-colors"
  }

  const getNumberDisplay = (item: QCItem) => {
    // Only show numbers for main headers
    if (item.isHeader) {
      // Only show number for main headers (1, 2, 3)
      if (item.parentNumber && !item.subNumber) {
        return item.parentNumber.toString()
      }
    }
    
    // For statements, don't show numbers since they already have numbers in the text
    // For sub-headers and regular items, don't show numbers
    return ""
  }

  return (
    <>
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="max-w-7xl max-h-[90vh] p-0 gap-0 [&>button]:hidden flex flex-col">
          {/* Header */}
          <DialogHeader className="px-6 py-4 border-b bg-white flex-shrink-0">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <DialogTitle className="text-xl font-semibold text-gray-900">
                  {isDetailView ? 'Detail Data QC' : 'Edit Data QC'} - {noSeri}
                </DialogTitle>
                {namaBarang && (
                  <p className="text-sm text-gray-600 mt-1">
                    Nama Barang: {namaBarang}
                  </p>
                )}
              </div>
              {!isDetailView && (
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addItem}
                    disabled={isLoading}
                    className="flex items-center gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    Tambah Item
                  </Button>
                </div>
              )}
            </div>
          </DialogHeader>
          
          {/* Content */}
          <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
            <div className="flex-1 p-6 overflow-hidden">
              {isDetailView ? (
                // Detail View dengan Tabs
                <Tabs defaultValue="data" className="w-full h-full flex flex-col">
                  <TabsList className="grid w-full grid-cols-2 mb-2 flex-shrink-0">
                    <TabsTrigger value="data">Data QC</TabsTrigger>
                    <TabsTrigger value="foto">Foto</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="data" className="flex-1 overflow-hidden mt-0 h-full">
                    <div className="h-full flex flex-col space-y-4">
                      {/* Tabel QC */}
                      <div className="border rounded-lg flex-1 flex flex-col min-h-0">
                        <div className="flex-1 min-h-0">
                          <ScrollArea className="h-full">
                            <div className="p-0">
                              <Table className="text-sm">
                                <TableHeader className="sticky top-0 bg-gray-50 z-10">
                                  <TableRow>
                                    <TableHead className="min-w-[16px] max-w-[16px] w-[16px] text-center font-semibold text-gray-700 bg-gray-50 text-xs py-2">
                                      No
                                    </TableHead>
                                    <TableHead className="w-80 font-semibold text-gray-700 bg-gray-50 text-xs py-2">
                                      Pengerjaan
                                    </TableHead>
                                    <TableHead className="min-w-[70px] max-w-[70px] w-[70px] font-semibold text-gray-700 bg-gray-50 text-xs py-2">
                                      Aktual
                                    </TableHead>
                                    <TableHead className="min-w-[70px] max-w-[70px] w-[70px] font-semibold text-gray-700 bg-gray-50 text-xs py-2">
                                      Standar
                                    </TableHead>
                                  </TableRow>
                                </TableHeader>
                                <TableBody>
                                  {items.map((item, index) => (
                                    <TableRow key={index} className={getRowClassName(item)}>
                                      <TableCell className="text-center font-medium text-gray-700 py-2 text-xs">
                                        {getNumberDisplay(item)}
                                      </TableCell>
                                      <TableCell className="py-2">
                                        <div className="text-sm text-gray-900 bg-gray-50 px-3 py-1 rounded border">
                                          {item.parameter}
                                        </div>
                                      </TableCell>
                                      <TableCell className="py-2">
                                        <div className="text-sm text-gray-900 bg-gray-50 px-3 py-1 rounded border">
                                          {item.aktual || '-'}
                                        </div>
                                      </TableCell>
                                      <TableCell className="py-2">
                                        <div className="text-sm text-gray-900 bg-gray-50 px-3 py-1 rounded border">
                                          {item.standar || '-'}
                                        </div>
                                      </TableCell>
                                    </TableRow>
                                  ))}
                                </TableBody>
                              </Table>
                            </div>
                          </ScrollArea>
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="foto" className="flex-1 overflow-hidden mt-0 h-full">
                    <div className="h-full flex flex-col overflow-hidden">
                      <div className="flex-shrink-0 mb-4">
                        <h3 className="text-lg font-semibold text-gray-900">Foto QC</h3>
                      </div>
                      
                      {/* Upload Section */}
                      {!isDetailView && (
                        <div className="flex-shrink-0 mb-4">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => setShowUploadDialog(true)}
                            disabled={isLoading}
                            className="flex items-center gap-2"
                          >
                            <Camera className="h-4 w-4" />
                            Upload Foto Baru
                          </Button>
                        </div>
                      )}
                      
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
                            <p>Belum ada foto QC</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              ) : (
                // Edit View (tidak berubah)
                <div className="border rounded-lg overflow-hidden">
                  <ScrollArea ref={scrollAreaRef} className="h-[400px] w-full">
                    <Table className="text-sm">
                      <TableHeader className="sticky top-0 bg-gray-50 z-10">
                        <TableRow>
                          <TableHead className="min-w-[16px] max-w-[16px] w-[16px] text-center font-semibold text-gray-700 bg-gray-50 text-xs py-2">
                            No
                          </TableHead>
                          <TableHead className="w-80 font-semibold text-gray-700 bg-gray-50 text-xs py-2">
                            Pengerjaan
                          </TableHead>
                          <TableHead className="min-w-[70px] max-w-[70px] w-[70px] font-semibold text-gray-700 bg-gray-50 text-xs py-2">
                            Aktual
                          </TableHead>
                          <TableHead className="min-w-[70px] max-w-[70px] w-[70px] font-semibold text-gray-700 bg-gray-50 text-xs py-2">
                            Standar
                          </TableHead>
                          <TableHead className="min-w-[16px] max-w-[16px] w-[16px] text-center font-semibold text-gray-700 bg-gray-50 text-xs py-2">
                            Action
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {items.map((item, index) => (
                          <TableRow key={index} className={getRowClassName(item)}>
                            <TableCell className="text-center font-medium text-gray-700 py-2 text-xs">
                              {getNumberDisplay(item)}
                            </TableCell>
                            <TableCell className="py-1">
                              <Input
                                value={item.parameter}
                                onChange={(e) => updateItem(index, 'parameter', e.target.value)}
                                placeholder="Masukkan pengerjaan QC"
                                disabled={isLoading || isDetailView}
                                className="border-gray-200 focus:border-blue-500 focus:ring-blue-500 text-xs h-7"
                              />
                            </TableCell>
                            <TableCell className="py-1">
                              <Input
                                value={item.aktual}
                                onChange={(e) => updateItem(index, 'aktual', e.target.value)}
                                placeholder=""
                                disabled={isLoading || isDetailView}
                                className="border-gray-200 focus:border-blue-500 focus:ring-blue-500 text-xs h-7"
                              />
                            </TableCell>
                            <TableCell className="py-1">
                              <Input
                                value={item.standar}
                                onChange={(e) => updateItem(index, 'standar', e.target.value)}
                                placeholder=""
                                disabled={isLoading || isDetailView}
                                className="border-gray-200 focus:border-blue-500 focus:ring-blue-500 text-xs h-7"
                              />
                            </TableCell>
                            <TableCell className="text-center py-1">
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => removeItem(index)}
                                disabled={isLoading || items.length === 1 || isDetailView}
                                className="h-6 w-6 p-0 text-red-600 hover:text-red-700 hover:bg-red-50 transition-colors"
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </ScrollArea>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="border-t bg-gray-50 rounded-b-lg flex-shrink-0">
              {!isDetailView && (
                <div className="px-6 py-4 space-y-3">
                  <div className="space-y-2">
                    <Label htmlFor="keterangan" className="text-sm font-medium text-gray-700">
                      Keterangan
                    </Label>
                    <Input
                      id="keterangan"
                      value={keterangan}
                      onChange={(e) => setKeterangan(e.target.value)}
                      placeholder="Masukkan keterangan..."
                      className="w-full"
                    />
                  </div>
                </div>
              )}
              <div className="flex items-center justify-end gap-3 px-6 py-4 border-t">
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
        serviceType="qc"
        isDetailView={isDetailView}
      />
    </>
  )
}
