export type UnitData = {
  no: number
  namaItem: string
  lokasi: string
  noSeri: string
  keterangan: string
  unitIndex: number
}

export type IncomingItemDetail = {
  id: number
  kodeBarang: string
  namaBarang: string
  jumlah: number
  units: UnitData[]
}

export type IncomingItem = {
  tanggal: string
  kodeKedatangan: string
  namaSupplier: string
  noForm: string
  status: string
}

export type IncomingItemWithDetails = IncomingItem & {
  id: number
  details: IncomingItemDetail[]
} 