import Image from "next/image"
import { Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"

interface MobileHeaderProps {
  isMobileOpen: boolean
  onMobileOpenChange: (open: boolean) => void
  sidebarContent: React.ReactNode
  className?: string
}

export function MobileHeader({
  isMobileOpen,
  onMobileOpenChange,
  sidebarContent,
  className = ""
}: MobileHeaderProps) {
  return (
    <>
      <div className={`fixed left-0 top-0 z-40 flex h-16 w-full items-center justify-between bg-white px-4 shadow-sm ${className}`}>
        <div className="flex items-center">
          <Sheet open={isMobileOpen} onOpenChange={onMobileOpenChange}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="mr-2">
                <Menu className="h-6 w-6" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[280px] p-0">
              {sidebarContent}
            </SheetContent>
          </Sheet>
          <div className="flex items-center">
            <Image
              src="/images/hpcputih.png"
              alt="Himawanputra Corporation Logo"
              width={100}
              height={35}
              className="object-contain"
            />
          </div>
        </div>
      </div>
      <div className="h-16"></div> {/* Spacer untuk header tetap */}
    </>
  )
} 