export interface TransaksiItem {
  id: number | string
  tanggal: string
  noForm: string | null // Khusus baris pertama diambil dari kode kedatangan
  jenisPekerjaan: string | null
  staff: string | null // Diambil dari field name dari table user
  status: string
  qty: number
  ket: string | null
  lokasi: string | null
  // Additional fields for search
  noSeri: string
  namaBarang: string
  kodeKedatangan: string
  // Flag untuk membedakan sumber data
  isDetailRow?: boolean // true = dari DetailBarangMasukNoSeri, false = dari Transaksi
  detailBarangMasukNoSeriId?: number // ID untuk referensi saat membuat transaksi baru
  // Approval status
  isApproved?: boolean
  approvedAt?: string | null
  approvedBy?: string | null
}

export interface TransaksiSearchParams {
  noSeri?: string
  namaBarang?: string
  lokasi?: string
  kodeKedatangan?: string
}

export interface TransaksiFilter {
  noSeri: string
  namaBarang: string
  lokasi: string
  kodeKedatangan: string
} 