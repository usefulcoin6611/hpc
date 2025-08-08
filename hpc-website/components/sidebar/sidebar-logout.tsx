import { LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog"

interface SidebarLogoutProps {
  isLogoutDialogOpen: boolean
  isLoggingOut: boolean
  onLogoutDialogChange: (open: boolean) => void
  onLogout: () => void
  className?: string
}

export function SidebarLogout({
  isLogoutDialogOpen,
  isLoggingOut,
  onLogoutDialogChange,
  onLogout,
  className = ""
}: SidebarLogoutProps) {
  return (
    <div className={`border-t border-indigo-500/30 p-3 ${className}`}>
      <Dialog open={isLogoutDialogOpen} onOpenChange={onLogoutDialogChange}>
        <DialogTrigger asChild>
          <button className="flex w-full items-center rounded-xl px-4 py-3 text-indigo-100 transition-all duration-200 hover:bg-indigo-600/50">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600/30">
              <LogOut className="h-5 w-5" />
            </span>
            <span className="ml-3">Logout</span>
          </button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Konfirmasi Logout</DialogTitle>
            <DialogDescription>
              Apakah Anda yakin ingin keluar dari sistem? Anda akan diarahkan ke halaman login.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline" className="rounded-xl" disabled={isLoggingOut}>
                Batal
              </Button>
            </DialogClose>
            <Button
              onClick={onLogout}
              className="rounded-xl bg-red-500 text-white hover:bg-red-600"
              disabled={isLoggingOut}
            >
              {isLoggingOut ? (
                <div className="flex items-center justify-center">
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  <span className="ml-2">Logging Out...</span>
                </div>
              ) : (
                "Ya, Logout"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
} 