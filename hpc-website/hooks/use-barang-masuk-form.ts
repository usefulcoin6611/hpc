import { useState } from "react"
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
  const handleAddDetailItem = () => {
    setNewIncomingItemDetails([
      ...newIncomingItemDetails,
      { id: Date.now(), namaBarang: "", jumlah: 0, units: [] },
    ])
  }

  const handleUpdateDetailItem = (id: number, field: keyof IncomingItemDetail, value: string | number) => {
    setNewIncomingItemDetails(
      newIncomingItemDetails.map((detail) => (detail.id === id ? { ...detail, [field]: value } : detail)),
    )
  }

  const handleRemoveDetailItem = (id: number) => {
    setNewIncomingItemDetails(newIncomingItemDetails.filter((detail) => detail.id !== id))
  }

  // Form handlers for edit item
  const handleAddEditDetailItem = () => {
    setEditIncomingItemDetails([
      ...editIncomingItemDetails,
      { id: Date.now(), namaBarang: "", jumlah: 0, units: [] },
    ])
  }

  const handleUpdateEditDetailItem = (id: number, field: keyof IncomingItemDetail, value: string | number) => {
    setEditIncomingItemDetails(
      editIncomingItemDetails.map((detail) => (detail.id === id ? { ...detail, [field]: value } : detail)),
    )
  }

  const handleRemoveEditDetailItem = (id: number) => {
    setEditIncomingItemDetails(prev => prev.filter((detail) => detail.id !== id))
  }

  // Reset form
  const resetNewForm = () => {
    setNewIncomingItem({
      tanggal: "",
      kodeKedatangan: "",
      namaSupplier: "",
      noForm: "",
      status: "",
    })
    setNewIncomingItemDetails([])
  }

  const resetEditForm = () => {
    setEditIncomingItem({
      tanggal: "",
      kodeKedatangan: "",
      namaSupplier: "",
      noForm: "",
      status: "",
    })
    setEditIncomingItemDetails([])
  }

  // Set edit form data
  const setEditFormData = (item: IncomingItem & { details: IncomingItemDetail[] }) => {
    setEditIncomingItem({
      tanggal: item.tanggal,
      kodeKedatangan: item.kodeKedatangan,
      namaSupplier: item.namaSupplier,
      noForm: item.noForm,
      status: item.status,
    })
    setEditIncomingItemDetails([...item.details])
  }

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