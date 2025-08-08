import Image from "next/image"

interface SidebarHeaderProps {
  className?: string
}

export function SidebarHeader({ className = "" }: SidebarHeaderProps) {
  return (
    <>
      <div className={`bg-[#2d29c8] flex items-center px-4 py-3 ${className}`}>
        <Image
          src="/images/hpcputih.png"
          alt="Himawanputra Corporation Logo"
          width={80}
          height={28}
          className="object-contain"
        />
        <h2 className="flex-grow text-center text-xs text-white">
          Warehouse Management System
        </h2>
      </div>
      <div className="border-b border-indigo-500/30" />
    </>
  )
} 