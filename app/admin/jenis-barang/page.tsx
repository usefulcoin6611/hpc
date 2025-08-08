"use client"
import React from "react"
import { AccessDenied } from "@/components/access-denied"

export default function JenisBarangPage() {
  // Halaman jenis barang sementara disembunyikan untuk semua role
  return (
    <AccessDenied 
      title="Halaman Tidak Tersedia"
      message="Halaman Jenis Barang sementara tidak tersedia."
    />
    )
  }
