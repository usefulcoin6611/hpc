import type { ReactNode } from "react"
import { Suspense } from "react"

import AdminSidebar from "@/components/admin-sidebar"
import AuthCheck from "@/components/auth-check"
import AuthGuard from "@/components/auth-guard"
import { PageLoading } from "@/components/ui/loading"
import { AdminLayoutClient } from "./admin-layout-client"

export default function AdminLayout({ children }: { children: ReactNode }) {
  return <AdminLayoutClient>{children}</AdminLayoutClient>
}
