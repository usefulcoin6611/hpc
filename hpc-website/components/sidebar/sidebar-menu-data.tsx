import {
  ChevronRight,
  ClipboardList,
  FileText,
  FolderOpen,
  Home,
  Settings,
  ShoppingCart,
  Tag,
  Truck,
  UserCheck,
  Users,
} from "lucide-react"
import type { MenuItem } from "@/types"

export const sidebarMenuItems: MenuItem[] = [
  {
    title: "Dashboard",
    path: "/admin",
    icon: <Home className="h-5 w-5" />,
    // Dashboard dapat diakses semua role
  },
  {
    title: "Master Barang",
    path: "/admin/master-barang",
    icon: <FolderOpen className="h-5 w-5" />,
    submenu: true,
    permission: {
      jobTypes: ['admin', 'supervisor'] // Hanya admin dan supervisor
    }
  },
  {
    title: "Jenis Barang",
    path: "/admin/jenis-barang",
    icon: <Tag className="h-5 w-5" />,
    submenu: true,
    permission: {
      jobTypes: ['admin', 'supervisor'] // Hanya admin dan supervisor
    }
  },
  {
    title: "Barang Masuk",
    path: "/admin/barang-masuk",
    icon: <ShoppingCart className="h-5 w-5" />,
    submenu: true,
    permission: {
      jobTypes: ['admin', 'supervisor'] // Hanya admin dan supervisor
    }
  },
  {
    title: "Transaksi",
    path: "/admin/transaksi",
    icon: <FileText className="h-5 w-5" />,
    submenu: true,
    permission: {
      jobTypes: ['admin', 'supervisor', 'staff'] // Semua job type
    }
  },
  {
    title: "Approver",
    path: "/admin/approver",
    icon: <UserCheck className="h-5 w-5" />,
    submenu: true,
    permission: {
      jobTypes: ['admin', 'supervisor'] // Hanya admin dan supervisor
    }
  },
  {
    title: "Barang Keluar",
    path: "/admin/barang-keluar",
    icon: <Truck className="h-5 w-5" />,
    submenu: true,
    permission: {
      jobTypes: ['admin', 'supervisor'] // Hanya admin dan supervisor
    }
  },
  {
    title: "Update Lembar Kerja",
    path: "/admin/update-lembar-kerja",
    icon: <ClipboardList className="h-5 w-5" />,
    submenu: true,
    permission: {
      jobTypes: ['admin', 'supervisor', 'staff'] // Semua job type
    }
  },
  {
    title: "Laporan",
    path: "/admin/laporan",
    icon: <FileText className="h-5 w-5" />,
    submenu: true,
    permission: {
      jobTypes: ['admin', 'supervisor'] // Hanya admin dan supervisor
    }
  },
  {
    title: "Data Pengguna",
    path: "/admin/data-pengguna",
    icon: <Users className="h-5 w-5" />,
    submenu: true,
    permission: {
      jobTypes: ['admin'] // Hanya admin
    }
  },
  {
    title: "Pengaturan",
    path: "/admin/pengaturan",
    icon: <Settings className="h-5 w-5" />,
    permission: {
      jobTypes: ['admin'] // Hanya admin
    }
  },
] 