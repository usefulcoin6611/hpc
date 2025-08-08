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
import { pdiService } from "@/services/pdi"
import { useToast } from "@/hooks/use-toast"
import { UploadFotoDialog } from "./UploadFotoDialog"

interface PDIItem {
  id?: number
  parameter: string
  pdi: boolean
  keterangan: string
}

interface FotoPDI {
  id?: number
  fileName: string
  fileUrl: string
  fileSize?: number
  fileType?: string
  uploadDate?: string
  keterangan?: string
}

interface EditPDIDialogProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: {noSeri: string
    items: PDIItem[]
    keterangan?: string
  }) => void
  noSeri: string
  currentItems?: PDIItem[]
  namaBarang?: string
  isDetailView?: boolean // Add this prop for detail view mode
  currentKeterangan?: string // Add this prop for current keterangan value
}

// Parameter bawaan untuk PDI sesuai gambar
const DEFAULT_PDI_PARAMETERS: PDIItem[] = [
  // PENGERJAAN UTAMA
  { 
    parameter: "Cek Kelengekapan (Terlampir di partlist)", 
    pdi: false, 
    keterangan: ""
  },
  { 
    parameter: "Gompalan/Baret", 
    pdi: false, 
    keterangan: ""
  },
  { 
    parameter: "Berjamur", 
    pdi: false, 
    keterangan: ""
  },
  { 
    parameter: "Cek Fisik Plastik Cover lock as mounting head", 
    pdi: false, 
    keterangan: ""
  },
  { 
    parameter: "Pecah/Kusam (Indikator, pelindung kuku)", 
    pdi: false, 
    keterangan: ""
  },
  { 
    parameter: "Pelumasan As Bead Breaker", 
    pdi: false, 
    keterangan: ""
  },
  { 
    parameter: "Pelumasan Permukaan Piringan", 
    pdi: false, 
    keterangan: ""
  },
  { 
    parameter: "Pelumasan Baut Tiang", 
    pdi: false, 
    keterangan: ""
  },
  { 
    parameter: "Pelumasan Grease Ke As Lock Tiang", 
    pdi: false, 
    keterangan: ""
  },
  { 
    parameter: "Pelumasan Grease Ke Mounting Head", 
    pdi: false, 
    keterangan: ""
  },
  { 
    parameter: "Pelumasan Pengait Piston Bead Breaker", 
    pdi: false, 
    keterangan: ""
  },
  { 
    parameter: "Bungkus Mounting Head (Bubble Wrap + Plastik Wrapping)", 
    pdi: false, 
    keterangan: ""
  },
  { 
    parameter: "Pengikatan Tiang Ke Kuku Untuk Menjaga Posisi Dudukan Tiang", 
    pdi: false, 
    keterangan: ""
  },
  { 
    parameter: "Pembungkusan Unit Mesin Dengan Plastik Wrapping", 
    pdi: false, 
    keterangan: ""
  },
  { 
    parameter: "Penutupan Peti kardus", 
    pdi: false, 
    keterangan: ""
  },
  { 
    parameter: "Memastikan posisi peti kardus rapat", 
    pdi: false, 
    keterangan: ""
  },
  // HELPER
  { 
    parameter: "Pemasangan Label alamat sesuai DO", 
    pdi: false, 
    keterangan: ""
  },
  { 
    parameter: "Pemasangan lembaran prosedur UNBOXING", 
    pdi: false, 
    keterangan: ""
  },
  { 
    parameter: "Pemasangan lembaran FRAGILE", 
    pdi: false, 
    keterangan: ""
  },
  { 
    parameter: "Pengikatan peti (menggunakan tali klam)", 
    pdi: false, 
    keterangan: ""
  },
  { 
    parameter: "Pasang lakban segel", 
    pdi: false, 
    keterangan: ""
  }
]

export function EditPDIDialog({
  isOpen,
  onClose,
  onSubmit,
  noSeri,
  currentItems = [],
  namaBarang = "",
  isDetailView = false,
  currentKeterangan = ""
}: EditPDIDialogProps) {
  const [items, setItems] = useState<PDIItem[]>(currentItems)
  const [isLoading, setIsLoading] = useState(false)
  const [showUploadDialog, setShowUploadDialog] = useState(false)
  const [fotos, setFotos] = useState<FotoPDI[]>([])
  const [isLoadingFotos, setIsLoadingFotos] = useState(false)
  const [keterangan, setKeterangan] = useState(currentKeterangan)
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const { toast } = useToast()

  // Reset items when dialog opens with new data
  useEffect(() => {
    if (isOpen) {
      if (currentItems.length > 0) {
        const sanitizedItems = currentItems.map(item => ({
          ...item,
          parameter: item.parameter || "",
          pdi: item.pdi || false,
          keterangan: item.keterangan || ""
        }))
        setItems(sanitizedItems)
      } else {
        const defaultItems = DEFAULT_PDI_PARAMETERS.map(item => ({ ...item }))
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
      const fotoList = await pdiService.getFotoList(noSeri)
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
      await pdiService.uploadFoto(file, noSeri, keterangan)
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
      pdi: false, 
      keterangan: ""
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

  const updateItem = (index: number, field: keyof PDIItem, value: string | boolean) => {
    setItems(prev => prev.map((item, i) => i === index ? { ...item, [field]: value } : item))
  }

  const handleToggleAll = () => {
    const allChecked = items.length > 0 && items.every(item => item.pdi)
    setItems(prev => prev.map(item => ({ ...item, pdi: !allChecked })))
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

      await onSubmit({
        noSeri,
        items: validItems,
        keterangan
      })

      toast({
        title: "Success",
        description: "Data PDI berhasil disimpan",
      })

      onClose()
    } catch (error) {
      console.error('Error saving PDI data:', error)
      toast({
        title: "Error",
        description: "Gagal menyimpan data PDI",
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
        <DialogContent className="max-w-7xl max-h-[90vh] p-0 gap-0 [&>button]:hidden flex flex-col">
          {/* Header */}
          <DialogHeader className="px-6 py-4 border-b bg-white flex-shrink-0">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <DialogTitle className="text-xl font-semibold text-gray-900">
                  {isDetailView ? 'Detail Data PDI' : 'Edit Data PDI'} - {noSeri}
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
                    onClick={() => setShowUploadDialog(true)}
                    disabled={isLoading}
                    className="flex items-center gap-2"
                  >
                    <Camera className="h-4 w-4" />
                    Foto
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleToggleAll}
                    disabled={isLoading}
                    className={`flex items-center gap-2 ${
                      items.length > 0 && items.every(item => item.pdi)
                        ? 'text-orange-600 border-orange-200 hover:bg-orange-50'
                        : 'text-blue-600 border-blue-200 hover:bg-blue-50'
                    }`}
                  >
                    {items.length > 0 && items.every(item => item.pdi) ? 'Uncheck All' : 'Check All'}
                  </Button>
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
                    <TabsTrigger value="data">Data PDI</TabsTrigger>
                    <TabsTrigger value="foto">Foto</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="data" className="flex-1 overflow-hidden mt-0 h-full">
                    <div className="h-full flex flex-col space-y-4">
                      {/* Tabel PDI */}
                      <div className="border rounded-lg flex-1 flex flex-col min-h-0">
                        <div className="flex-1 min-h-0">
                          <ScrollArea className="h-full">
                            <div className="p-0">
                              <Table className="text-sm">
                                <TableHeader className="sticky top-0 bg-gray-50 z-10">
                                  <TableRow>
                                    <TableHead className="w-16 text-center font-semibold text-gray-700 bg-gray-50 text-xs py-2">
                                      No
                                    </TableHead>
                                    <TableHead className="w-96 font-semibold text-gray-700 bg-gray-50 text-xs py-2">
                                      Pengerjaan
                                    </TableHead>
                                    <TableHead className="w-20 text-center font-semibold text-gray-700 bg-gray-50 text-xs py-2">
                                      PDI
                                    </TableHead>
                                    <TableHead className="w-28 font-semibold text-gray-700 bg-gray-50 text-xs py-2">
                                      Keterangan
                                    </TableHead>
                                  </TableRow>
                                </TableHeader>
                                <TableBody>
                                  {items.map((item, index) => (
                                    <TableRow key={index} className="hover:bg-gray-50 transition-colors">
                                      <TableCell className="text-center font-medium text-gray-700 py-2 text-xs">
                                        {index + 1}
                                      </TableCell>
                                      <TableCell className="py-2">
                                        <div className="text-sm text-gray-900 bg-gray-50 px-3 py-1 rounded border">
                                          {item.parameter}
                                        </div>
                                      </TableCell>
                                      <TableCell className="text-center py-2">
                                        <div className={`inline-flex items-center justify-center w-4 h-4 rounded border ${
                                          item.pdi
                                            ? 'bg-green-100 border-green-500 text-green-700'
                                            : 'bg-red-100 border-red-500 text-red-700'
                                        }`}>
                                          {item.pdi ? '✓' : '✗'}
                                        </div>
                                      </TableCell>
                                      <TableCell className="py-2">
                                        <div className="text-sm text-gray-900 bg-gray-50 px-3 py-1 rounded border">
                                          {item.keterangan || '-'}
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
                        <h3 className="text-lg font-semibold text-gray-900">Foto PDI</h3>
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
                            <p>Belum ada foto PDI</p>
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
                          <TableHead className="w-16 text-center font-semibold text-gray-700 bg-gray-50 text-xs py-2">
                            No
                          </TableHead>
                          <TableHead className="w-96 font-semibold text-gray-700 bg-gray-50 text-xs py-2">
                            Pengerjaan
                          </TableHead>
                          <TableHead className="w-20 text-center font-semibold text-gray-700 bg-gray-50 text-xs py-2">
                            PDI
                          </TableHead>
                          <TableHead className="w-28 font-semibold text-gray-700 bg-gray-50 text-xs py-2">
                            Keterangan
                          </TableHead>
                          <TableHead className="w-16 text-center font-semibold text-gray-700 bg-gray-50 text-xs py-2">
                            Action
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {items.map((item, index) => (
                          <TableRow key={index} className="hover:bg-gray-50 transition-colors">
                            <TableCell className="text-center font-medium text-gray-700 py-2 text-xs">
                              {index + 1}
                            </TableCell>
                            <TableCell className="py-1">
                              <Input
                                value={item.parameter}
                                onChange={(e) => updateItem(index, 'parameter', e.target.value)}
                                placeholder="Masukkan pengerjaan PDI"
                                disabled={isLoading || isDetailView}
                                className="border-gray-200 focus:border-blue-500 focus:ring-blue-500 text-xs h-7"
                              />
                            </TableCell>
                            <TableCell className="text-center py-1">
                              <input
                                type="checkbox"
                                checked={item.pdi}
                                onChange={(e) => updateItem(index, 'pdi', e.target.checked)}
                                disabled={isLoading || isDetailView}
                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                              />
                            </TableCell>
                            <TableCell className="py-1">
                              <Input
                                value={item.keterangan}
                                onChange={(e) => updateItem(index, 'keterangan', e.target.value)}
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
        serviceType="pdi"
        isDetailView={isDetailView}
      />
    </>
  )
} 