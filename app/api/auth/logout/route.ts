import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    // In a real application, you might want to:
    // 1. Invalidate the token on the server
    // 2. Add the token to a blacklist
    // 3. Clear session data
    
    // For now, we'll just return a success response
    // The client will handle clearing the token
    
    return NextResponse.json({
      success: true,
      message: 'Logout berhasil'
    })
    
  } catch (error) {
    console.error('Logout error:', error)
    return NextResponse.json(
      { 
        success: false, 
        message: 'Terjadi kesalahan saat logout' 
      },
      { status: 500 }
    )
  }
} 