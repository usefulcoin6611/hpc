import { useState, useCallback } from "react"
import { IncomingItemDetail, IncomingItem } from "@/types/barang-masuk"

export function useBarangMasukForm() {
  // State for new incoming item form
  const [newIncomingItem, setNewIncomingItem] = useState<Omit<IncomingItem, "id" | "details">>({
    tanggal: "",
    kodeKedatangan: "",
    namaSupplier: "",
    noForm: "",
    status: "",
  })
  const [newIncomingItemDetails, setNewIncomingItemDetails] = useState<IncomingItemDetail[]>([])

  // State for editing incoming item form
  const [editIncomingItem, setEditIncomingItem] = useState<Omit<IncomingItem, "id" | "details">>({
    tanggal: "",
    kodeKedatangan: "",
    namaSupplier: "",
    noForm: "",
    status: "",
  })
  const [editIncomingItemDetails, setEditIncomingItemDetails] = useState<IncomingItemDetail[]>([])

  // Form handlers for new item
  const handleAddDetailItem = useCallback(() => {
    setNewIncomingItemDetails(prev => [
      ...prev,
      { id: Date.now(), kodeBarang: "", namaBarang: "", jumlah: 0, units: [] },
    ])
  }, [])

  const handleUpdateDetailItem = useCallback((id: number, field: keyof IncomingItemDetail, value: string | number) => {
    setNewIncomingItemDetails(prev =>
      prev.map((detail) => (detail.id === id ? { ...detail, [field]: value } : detail))
    )
  }, [])

  const handleRemoveDetailItem = useCallback((id: number) => {
    setNewIncomingItemDetails(prev => prev.filter((detail) => detail.id !== id))
  }, [])

  // Form handlers for edit item
  const handleAddEditDetailItem = useCallback(() => {
    setEditIncomingItemDetails(prev => [
      ...prev,
      { id: Date.now(), kodeBarang: "", namaBarang: "", jumlah: 0, units: [] },
    ])
  }, [])

  const handleUpdateEditDetailItem = useCallback((id: number, field: keyof IncomingItemDetail, value: string | number) => {
    setEditIncomingItemDetails(prev =>
      prev.map((detail) => (detail.id === id ? { ...detail, [field]: value } : detail))
    )
  }, [])

  const handleRemoveEditDetailItem = useCallback((id: number) => {
    setEditIncomingItemDetails(prev => prev.filter((detail) => detail.id !== id))
  }, [])

  // Reset form
  const resetNewForm = useCallback(() => {
    setNewIncomingItem({
      tanggal: "",
      kodeKedatangan: "",
      namaSupplier: "",
      noForm: "",
      status: "",
    })
    setNewIncomingItemDetails([])
  }, [])

  const resetEditForm = useCallback(() => {
    setEditIncomingItem({
      tanggal: "",
      kodeKedatangan: "",
      namaSupplier: "",
      noForm: "",
      status: "",
    })
    setEditIncomingItemDetails([])
  }, [])

  // Set edit form data
  const setEditFormData = useCallback((item: IncomingItem & { details: IncomingItemDetail[] }) => {
    setEditIncomingItem({
      tanggal: item.tanggal,
      kodeKedatangan: item.kodeKedatangan,
      namaSupplier: item.namaSupplier,
      noForm: item.noForm,
      status: item.status,
    })
    setEditIncomingItemDetails([...item.details])
  }, [])

  return {
    // New form state
    newIncomingItem,
    setNewIncomingItem,
    newIncomingItemDetails,
    setNewIncomingItemDetails,

    // Edit form state
    editIncomingItem,
    setEditIncomingItem,
    editIncomingItemDetails,
    setEditIncomingItemDetails,

    // New form handlers
    handleAddDetailItem,
    handleUpdateDetailItem,
    handleRemoveDetailItem,

    // Edit form handlers
    handleAddEditDetailItem,
    handleUpdateEditDetailItem,
    handleRemoveEditDetailItem,

    // Form utilities
    resetNewForm,
    resetEditForm,
    setEditFormData,
  }
} 