import { AlertTriangle, Shield, Home } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useRouter } from "next/navigation"

interface AccessDeniedProps {
  title?: string
  message?: string
  showBackButton?: boolean
}

export function AccessDenied({ 
  title = "Akses Ditolak", 
  message = "Anda tidak memiliki izin untuk mengakses halaman ini.",
  showBackButton = true 
}: AccessDeniedProps) {
  const router = useRouter()

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
            <Shield className="h-8 w-8 text-red-600" />
          </div>
          <CardTitle className="text-xl font-semibold text-gray-900">
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-gray-600">
            {message}
          </p>
          <div className="flex items-center justify-center text-sm text-gray-500">
            <AlertTriangle className="h-4 w-4 mr-2" />
            Hubungi administrator untuk mendapatkan akses
          </div>
          {showBackButton && (
            <Button 
              onClick={() => router.push('/admin')}
              className="w-full"
            >
              <Home className="h-4 w-4 mr-2" />
              Kembali ke Dashboard
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
