import { useState, useEffect } from "react"
import { useToast } from "@/hooks/use-toast"
import { IncomingItemWithDetails } from "@/types/barang-masuk"
import { barangMasukService, BarangMasukData } from "@/services/barang-masuk"

export function useBarangMasuk() {
  const [incomingItems, setIncomingItems] = useState<IncomingItemWithDetails[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [isExporting, setIsExporting] = useState(false)
  const [isImporting, setIsImporting] = useState(false)
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [selectedItem, setSelectedItem] = useState<IncomingItemWithDetails | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const { toast } = useToast()

  // Fetch data from API
  const fetchBarangMasuk = async () => {
    try {
      setIsLoading(true)
      const data = await barangMasukService.fetchAll()
      setIncomingItems(data)
    } catch (error) {
      console.error('Error fetching data:', error)
      toast({
        title: "Error",
        description: "Gagal mengambil data dari server",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Save new barang masuk
  const saveBarangMasuk = async (data: BarangMasukData) => {
    try {
      await barangMasukService.create(data)
      toast({
        title: "Berhasil!",
        description: "Data barang masuk berhasil disimpan",
        variant: "success",
      })
      return true
    } catch (error) {
      console.error('Error saving barang masuk:', error)
      
      // Extract title from error response if available
      let errorTitle = "Error"
      let errorMessage = "Gagal menyimpan data"
      
      if (error instanceof Error) {
        try {
          const errorData = JSON.parse(error.message)
          errorTitle = errorData.title || "Error"
          errorMessage = errorData.error || error.message
        } catch {
          errorMessage = error.message
        }
      }
      
      toast({
        title: errorTitle,
        description: errorMessage,
        variant: "destructive",
      })
      return false
    }
  }

  // Update barang masuk
  const updateBarangMasuk = async (id: number, data: BarangMasukData) => {
    try {
      await barangMasukService.update(id, data)
      toast({
        title: "Berhasil!",
        description: "Data barang masuk berhasil diperbarui",
        variant: "success",
      })
      return true
    } catch (error) {
      console.error('Error updating barang masuk:', error)
      
      // Extract title from error response if available
      let errorTitle = "Error"
      let errorMessage = "Gagal memperbarui data"
      
      if (error instanceof Error) {
        try {
          const errorData = JSON.parse(error.message)
          errorTitle = errorData.title || "Error"
          errorMessage = errorData.error || error.message
        } catch {
          errorMessage = error.message
        }
      }
      
      toast({
        title: errorTitle,
        description: errorMessage,
        variant: "destructive",
      })
      return false
    }
  }

  // Delete barang masuk
  const deleteBarangMasuk = async (id: number) => {
    try {
      await barangMasukService.delete(id)
      toast({
        title: "Berhasil!",
        description: "Data barang masuk berhasil dihapus",
        variant: "success",
      })
      return true
    } catch (error) {
      console.error('Error deleting barang masuk:', error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Gagal menghapus data",
        variant: "destructive",
      })
      return false
    }
  }

  // Filter items based on search term
  const filteredItems = incomingItems.filter((item) =>
    item.tanggal.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.kodeKedatangan.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.namaSupplier.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.noForm.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.status.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Export to CSV
  const handleExport = () => {
    setIsExporting(true)
    try {
      const headers = ["No", "Tanggal", "Kode Kedatangan", "Nama Supplier", "No Form", "Status"]
      const csvContent = [
        headers.join(","),
        ...filteredItems.map((item, index) =>
          [
            index + 1,
            item.tanggal,
            item.kodeKedatangan,
            item.namaSupplier,
            item.noForm,
            item.status,
          ].join(",")
        ),
      ].join("\n")

      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
      const link = document.createElement("a")
      const url = URL.createObjectURL(blob)
      link.setAttribute("href", url)
      link.setAttribute("download", `barang-masuk-${new Date().toISOString().split("T")[0]}.csv`)
      link.style.visibility = "hidden"
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      toast({
        title: "Berhasil!",
        description: "Data berhasil diekspor ke CSV",
        variant: "success",
      })
    } catch (error) {
      console.error("Error exporting data:", error)
      toast({
        title: "Error",
        description: "Gagal mengekspor data",
        variant: "destructive",
      })
    } finally {
      setIsExporting(false)
    }
  }

  // Import from CSV
  const handleImportFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setIsImporting(true)
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const csv = e.target?.result as string
        const lines = csv.split("\n")
        const headers = lines[0].split(",")
        
        // Process CSV data here
        console.log("CSV Headers:", headers)
        console.log("CSV Data:", lines.slice(1))
        
        toast({
          title: "Berhasil!",
          description: "File CSV berhasil dibaca",
          variant: "success",
        })
      } catch (error) {
        console.error("Error reading CSV:", error)
        toast({
          title: "Error",
          description: "Gagal membaca file CSV",
          variant: "destructive",
        })
      } finally {
        setIsImporting(false)
      }
    }
    reader.readAsText(file)
  }

  // Dialog handlers
  const handleDetailClick = (item: IncomingItemWithDetails) => {
    setSelectedItem(item)
    setIsDetailDialogOpen(true)
  }

  const handleDeleteItem = async (id: number) => {
    const success = await deleteBarangMasuk(id)
    if (success) {
      fetchBarangMasuk()
    }
  }

  // Load data on mount
  useEffect(() => {
    fetchBarangMasuk()
  }, [])

  return {
    // State
    incomingItems,
    searchTerm,
    isExporting,
    isImporting,
    isDetailDialogOpen,
    isEditDialogOpen,
    isAddDialogOpen,
    selectedItem,
    isLoading,
    filteredItems,

    // Setters
    setSearchTerm,
    setIsDetailDialogOpen,
    setIsEditDialogOpen,
    setIsAddDialogOpen,
    setSelectedItem,

    // Actions
    fetchBarangMasuk,
    saveBarangMasuk,
    updateBarangMasuk,
    deleteBarangMasuk,
    handleExport,
    handleImportFileChange,
    handleDetailClick,
    handleDeleteItem,
  }
} 