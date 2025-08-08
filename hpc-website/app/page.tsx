import Link from "next/link"
import { Warehouse } from "lucide-react"
import { redirect } from "next/navigation"

import { Button } from "@/components/ui/button"

export default function Home() {
  redirect("/admin/login")

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md text-center">
        <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-2xl bg-primary shadow-lg">
          <Warehouse className="h-12 w-12 text-white" />
        </div>

        <h1 className="mt-8 text-4xl font-bold text-gray-900">Kencur Warehouse</h1>
        <p className="mt-3 text-lg text-gray-600">Sistem Manajemen Gudang Modern</p>

        <div className="mt-10">
          <Link href="/admin/login">
            <Button className="rounded-xl bg-primary px-8 py-3 text-base font-medium text-white shadow-lg transition-all hover:bg-primary-dark hover:shadow-xl">
              Login ke Admin
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
