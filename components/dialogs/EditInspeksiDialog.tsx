"use client"

import { useState, useEffect, useRef } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Checkbox } from "@/components/ui/checkbox"
import { Plus, Trash2, Camera, Download, Eye } from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { inspeksiService } from "@/services/inspeksi"
import { useToast } from "@/hooks/use-toast"
import { UploadFotoDialog } from "./UploadFotoDialog"

interface InspeksiItem {
  id?: number
  parameter: string
  hasil: boolean
  keterangan: string
}

interface FotoInspeksi {
  id?: number
  fileName: string
  fileUrl: string
  fileSize?: number
  fileType?: string
  uploadDate?: string
  keterangan?: string
}

interface EditInspeksiDialogProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: {noSeri: string
    items: InspeksiItem[]
    keterangan?: string
  }) => void
  noSeri: string
  currentItems?: InspeksiItem[]
  namaBarang?: string
  isDetailView?: boolean // Add this prop for detail view mode
  currentKeterangan?: string // Add this prop for current keterangan value
}

// Parameter bawaan untuk inspeksi mesin (10 item sesuai gambar)
const DEFAULT_INSpeksi_PARAMETERS = [
  { parameter: "Peti Rusak", hasil: false, keterangan: "" },
  { parameter: "Penutupan Unit Mesin Dengan Plastik bawaan", hasil: false, keterangan: "" },
  { parameter: "Bentuk Pedal Sama atau berbeda", hasil: false, keterangan: "" },
  { parameter: "Dimensi Kabinet (720 X 330 X 500)", hasil: false, keterangan: "" },
  { parameter: "Cover kabinet 640X415", hasil: false, keterangan: "" },
  { parameter: "Dimensi Piringan (580 X 580 X 15)", hasil: false, keterangan: "" },
  { parameter: "Ukur Velg Posisi Dalam/Tutup 11.7\"", hasil: false, keterangan: "" },
  { parameter: "Cek Fisik Kuku, Penutup/penahan per mounting head, Plat Sliding Kuku", hasil: false, keterangan: "" },
  { parameter: "Tiang (120 X 120 X 950), lengan 525x100x50", hasil: false, keterangan: "" },
  { parameter: "Jarak Tiang -As Mounting (595)", hasil: false, keterangan: "" }
]

export function EditInspeksiDialog({
  isOpen,
  onClose,
  onSubmit,
  noSeri,
  currentItems = [],
  namaBarang = "",
  isDetailView = false,
  currentKeterangan = ""
}: EditInspeksiDialogProps) {
  const [items, setItems] = useState<InspeksiItem[]>(currentItems)
  const [isLoading, setIsLoading] = useState(false)
  const [showUploadDialog, setShowUploadDialog] = useState(false)
  const [fotos, setFotos] = useState<FotoInspeksi[]>([])
  const [isLoadingFotos, setIsLoadingFotos] = useState(false)
  const [keterangan, setKeterangan] = useState(currentKeterangan)
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const { toast } = useToast()

  // Reset items when dialog opens with new data - selalu gunakan parameter bawaan sebagai base
  useEffect(() => {
    if (isOpen) {
      console.log('Dialog opened with currentItems:', currentItems) // Debug log
      
      // Jika ada data yang sudah ada, gunakan itu
      if (currentItems.length > 0) {
        // Pastikan semua value adalah string (tidak null/undefined) dan hasil adalah boolean
        const sanitizedItems = currentItems.map(item => ({
          ...item,
          parameter: item.parameter || "",
          hasil: typeof item.hasil === 'boolean' ? item.hasil : false,
          keterangan: item.keterangan || ""
        }))
        console.log('Using existing data:', sanitizedItems) // Debug log
        setItems(sanitizedItems)
      } else {
        // Jika tidak ada data, gunakan parameter bawaan
        const defaultItems = DEFAULT_INSpeksi_PARAMETERS.map(item => ({ ...item }))
        console.log('Using default parameters:', defaultItems) // Debug log
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
      const fotoList = await inspeksiService.getFotoList(noSeri)
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
      await inspeksiService.uploadFoto(file, noSeri, keterangan)
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
      throw error
    }
  }

  const addItem = () => {
    const newItems = [...items, { parameter: "", hasil: false, keterangan: "" }]
    setItems(newItems)
    
    // Auto scroll ke bawah setelah item ditambahkan
    setTimeout(() => {
      if (scrollAreaRef.current) {
        const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]')
        if (scrollContainer) {
          scrollContainer.scrollTop = scrollContainer.scrollHeight
        }
      }
    }, 100)
  }

  const removeItem = (index: number) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index))
    }
  }

  const updateItem = (index: number, field: keyof InspeksiItem, value: string | boolean) => {
    const newItems = [...items]
    newItems[index] = { ...newItems[index], [field]: value }
    setItems(newItems)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validate that all items have required fields
    const isValid = items.every(item => 
      item.parameter.trim() !== ""
    )

    if (!isValid) {
      toast({
        title: "Error",
        description: "Semua field Parameter harus diisi",
        variant: "destructive",
      })
      return
    }
    
    setIsLoading(true)
    
    try {
      await onSubmit({
        noSeri,
        items: items.map(item => ({
          ...item,
          parameter: item.parameter.trim(),
          hasil: item.hasil,
          keterangan: item.keterangan.trim()
        })),
        keterangan
      })
      
      onClose()
    } catch (error) {
      console.error('Error submitting form:', error)
      toast({
        title: "Error",
        description: "Gagal menyimpan data inspeksi",
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
                  {isDetailView ? 'Detail Data Inspeksi Mesin' : 'Edit Data Inspeksi Mesin'} - {noSeri}
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
                    <TabsTrigger value="data">Data Inspeksi</TabsTrigger>
                    <TabsTrigger value="foto">Foto</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="data" className="flex-1 overflow-hidden mt-0 h-full">
                    <div className="h-full flex flex-col space-y-4">
                      {/* Tabel Inspeksi */}
                      <div className="border rounded-lg flex-1 flex flex-col min-h-0">
                        <div className="flex-1 min-h-0">
                          <ScrollArea className="h-full">
                            <div className="p-0">
                              <Table className="text-sm">
                                <TableHeader className="sticky top-0 bg-gray-50 z-10">
                                  <TableRow>
                                    <TableHead className="w-12 text-center font-semibold text-gray-700 bg-gray-50 text-xs py-2">
                                      No
                                    </TableHead>
                                    <TableHead className="font-semibold text-gray-700 bg-gray-50 text-xs py-2">
                                      Pengerjaan
                                    </TableHead>
                                    <TableHead className="w-20 text-center font-semibold text-gray-700 bg-gray-50 text-xs py-2">
                                      Ceklist
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
                                          item.hasil
                                            ? 'bg-green-100 border-green-500 text-green-700'
                                            : 'bg-red-100 border-red-500 text-red-700'
                                        }`}>
                                          {item.hasil ? '✓' : '✗'}
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
                        <h3 className="text-lg font-semibold text-gray-900">Foto Inspeksi</h3>
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
                            <p>Belum ada foto inspeksi</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              ) : (
                // Edit View (tidak berubah)
                <div className="border rounded-lg overflow-hidden" ref={scrollAreaRef}>
                  <ScrollArea className="h-[400px] w-full">
                    <Table className="text-sm">
                      <TableHeader className="sticky top-0 bg-gray-50 z-10">
                        <TableRow>
                          <TableHead className="w-12 text-center font-semibold text-gray-700 bg-gray-50 text-xs py-2">
                            No
                          </TableHead>
                          <TableHead className="font-semibold text-gray-700 bg-gray-50 text-xs py-2">
                            Pengerjaan
                          </TableHead>
                          <TableHead className="w-20 text-center font-semibold text-gray-700 bg-gray-50 text-xs py-2">
                            Ceklist
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
                                placeholder="Masukkan pengerjaan inspeksi"
                                disabled={isLoading || isDetailView}
                                className="border-gray-200 focus:border-blue-500 focus:ring-blue-500 whitespace-nowrap text-xs h-7 text-xs"
                              />
                            </TableCell>
                            <TableCell className="text-center py-1">
                              <Checkbox
                                checked={item.hasil}
                                onCheckedChange={(checked) => updateItem(index, 'hasil', checked as boolean)}
                                disabled={isLoading || isDetailView}
                                className="mx-auto data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600 h-4 w-4"
                              />
                            </TableCell>
                            <TableCell className="py-1">
                              <Input
                                value={item.keterangan}
                                onChange={(e) => updateItem(index, 'keterangan', e.target.value)}
                                placeholder=""
                                disabled={isLoading || isDetailView}
                                className="border-gray-200 focus:border-blue-500 focus:ring-blue-500 text-xs h-7 text-xs"
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
        serviceType="inspeksi"
        isDetailView={isDetailView}
      />
    </>
  )
} 