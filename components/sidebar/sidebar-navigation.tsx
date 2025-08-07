import Link from "next/link"
import { ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"
import type { MenuItem } from "@/types"

interface SidebarNavigationProps {
  menuItems: MenuItem[]
  currentPath: string
  onMobileClose?: () => void
  className?: string
}

export function SidebarNavigation({ 
  menuItems, 
  currentPath, 
  onMobileClose,
  className = "" 
}: SidebarNavigationProps) {
  return (
    <nav
      className={`sidebar-scrollbar flex-1 overflow-y-auto p-3 ${className}`}
    >
      <ul className="space-y-1">
        {menuItems.map((item) => (
          <li key={item.path}>
            <Link
              href={item.path}
              className={cn(
                "flex items-center rounded-xl px-4 py-3 text-indigo-100 transition-all duration-200 hover:bg-indigo-600/50",
                currentPath === item.path && "bg-white/10 font-medium text-white",
              )}
              onClick={onMobileClose}
            >
              <span
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-lg",
                  currentPath === item.path ? "bg-white/20 text-white" : "bg-indigo-600/30 text-indigo-100",
                )}
              >
                {item.icon}
              </span>
              <span className="ml-3">{item.title}</span>
              {item.submenu && <ChevronRight className="ml-auto h-4 w-4 opacity-60" />}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  )
} 