import type { AppError } from "@/types"

// Error codes untuk kategorisasi error
export const ERROR_CODES = {
  // Authentication errors
  AUTH_INVALID_CREDENTIALS: 'AUTH_INVALID_CREDENTIALS',
  AUTH_SESSION_EXPIRED: 'AUTH_SESSION_EXPIRED',
  AUTH_UNAUTHORIZED: 'AUTH_UNAUTHORIZED',
  
  // Form validation errors
  VALIDATION_REQUIRED: 'VALIDATION_REQUIRED',
  VALIDATION_INVALID_FORMAT: 'VALIDATION_INVALID_FORMAT',
  VALIDATION_MIN_LENGTH: 'VALIDATION_MIN_LENGTH',
  VALIDATION_MAX_LENGTH: 'VALIDATION_MAX_LENGTH',
  
  // Data errors
  DATA_NOT_FOUND: 'DATA_NOT_FOUND',
  DATA_INVALID: 'DATA_INVALID',
  DATA_DUPLICATE: 'DATA_DUPLICATE',
  
  // Network errors (untuk mock data)
  NETWORK_TIMEOUT: 'NETWORK_TIMEOUT',
  NETWORK_OFFLINE: 'NETWORK_OFFLINE',
  
  // Browser API errors
  STORAGE_QUOTA_EXCEEDED: 'STORAGE_QUOTA_EXCEEDED',
  STORAGE_NOT_AVAILABLE: 'STORAGE_NOT_AVAILABLE',
  
  // Component errors
  COMPONENT_RENDER_ERROR: 'COMPONENT_RENDER_ERROR',
  COMPONENT_MOUNT_ERROR: 'COMPONENT_MOUNT_ERROR',
  
  // Unknown errors
  UNKNOWN_ERROR: 'UNKNOWN_ERROR'
} as const

// Error messages dalam bahasa Indonesia
export const ERROR_MESSAGES = {
  [ERROR_CODES.AUTH_INVALID_CREDENTIALS]: 'Username atau password salah',
  [ERROR_CODES.AUTH_SESSION_EXPIRED]: 'Sesi Anda telah berakhir, silakan login kembali',
  [ERROR_CODES.AUTH_UNAUTHORIZED]: 'Anda tidak memiliki akses ke halaman ini',
  
  [ERROR_CODES.VALIDATION_REQUIRED]: 'Field ini wajib diisi',
  [ERROR_CODES.VALIDATION_INVALID_FORMAT]: 'Format tidak valid',
  [ERROR_CODES.VALIDATION_MIN_LENGTH]: 'Minimal {min} karakter',
  [ERROR_CODES.VALIDATION_MAX_LENGTH]: 'Maksimal {max} karakter',
  
  [ERROR_CODES.DATA_NOT_FOUND]: 'Data tidak ditemukan',
  [ERROR_CODES.DATA_INVALID]: 'Data tidak valid',
  [ERROR_CODES.DATA_DUPLICATE]: 'Data sudah ada',
  
  [ERROR_CODES.NETWORK_TIMEOUT]: 'Koneksi timeout, silakan coba lagi',
  [ERROR_CODES.NETWORK_OFFLINE]: 'Tidak ada koneksi internet',
  
  [ERROR_CODES.STORAGE_QUOTA_EXCEEDED]: 'Penyimpanan browser penuh',
  [ERROR_CODES.STORAGE_NOT_AVAILABLE]: 'Penyimpanan browser tidak tersedia',
  
  [ERROR_CODES.COMPONENT_RENDER_ERROR]: 'Terjadi kesalahan saat menampilkan komponen',
  [ERROR_CODES.COMPONENT_MOUNT_ERROR]: 'Terjadi kesalahan saat memuat komponen',
  
  [ERROR_CODES.UNKNOWN_ERROR]: 'Terjadi kesalahan yang tidak terduga'
} as const

// Utility untuk membuat AppError
export function createError(
  code: keyof typeof ERROR_CODES,
  message?: string,
  details?: any
): AppError {
  return {
    code: ERROR_CODES[code],
    message: message || ERROR_MESSAGES[code],
    details,
    timestamp: new Date(),
    stack: new Error().stack
  }
}

// Utility untuk menangani error dari try-catch
export function handleError(
  error: unknown,
  context?: string
): AppError {
  if (error instanceof Error) {
    return {
      code: context || ERROR_CODES.UNKNOWN_ERROR,
      message: error.message,
      details: error,
      timestamp: new Date(),
      stack: error.stack
    }
  }
  
  if (typeof error === 'string') {
    return {
      code: context || ERROR_CODES.UNKNOWN_ERROR,
      message: error,
      details: { originalError: error },
      timestamp: new Date()
    }
  }
  
  return {
    code: context || ERROR_CODES.UNKNOWN_ERROR,
    message: 'Terjadi kesalahan yang tidak terduga',
    details: error,
    timestamp: new Date()
  }
}

// Utility untuk validasi form dengan error handling
export function validateFormField(
  value: any,
  rules: {
    required?: boolean
    minLength?: number
    maxLength?: number
    pattern?: RegExp
    custom?: (value: any) => boolean | string
  }
): string | null {
  try {
    // Required validation
    if (rules.required && (!value || value.toString().trim() === '')) {
      return ERROR_MESSAGES[ERROR_CODES.VALIDATION_REQUIRED]
    }
    
    if (value && typeof value === 'string') {
      // Min length validation
      if (rules.minLength && value.length < rules.minLength) {
        return ERROR_MESSAGES[ERROR_CODES.VALIDATION_MIN_LENGTH].replace('{min}', rules.minLength.toString())
      }
      
      // Max length validation
      if (rules.maxLength && value.length > rules.maxLength) {
        return ERROR_MESSAGES[ERROR_CODES.VALIDATION_MAX_LENGTH].replace('{max}', rules.maxLength.toString())
      }
      
      // Pattern validation
      if (rules.pattern && !rules.pattern.test(value)) {
        return ERROR_MESSAGES[ERROR_CODES.VALIDATION_INVALID_FORMAT]
      }
    }
    
    // Custom validation
    if (rules.custom) {
      const result = rules.custom(value)
      if (result === false) {
        return ERROR_MESSAGES[ERROR_CODES.VALIDATION_INVALID_FORMAT]
      }
      if (typeof result === 'string') {
        return result
      }
    }
    
    return null
  } catch (error) {
    return handleError(error, ERROR_CODES.VALIDATION_INVALID_FORMAT).message
  }
}

// Utility untuk safe localStorage operations
export function safeLocalStorage() {
  const isAvailable = (): boolean => {
    try {
      const test = '__localStorage_test__'
      localStorage.setItem(test, test)
      localStorage.removeItem(test)
      return true
    } catch {
      return false
    }
  }
  
  const getItem = (key: string): string | null => {
    try {
      if (!isAvailable()) {
        throw new Error('LocalStorage not available')
      }
      return localStorage.getItem(key)
    } catch (error) {
      console.error('LocalStorage getItem error:', error)
      return null
    }
  }
  
  const setItem = (key: string, value: string): boolean => {
    try {
      if (!isAvailable()) {
        throw new Error('LocalStorage not available')
      }
      localStorage.setItem(key, value)
      return true
    } catch (error) {
      console.error('LocalStorage setItem error:', error)
      return false
    }
  }
  
  const removeItem = (key: string): boolean => {
    try {
      if (!isAvailable()) {
        throw new Error('LocalStorage not available')
      }
      localStorage.removeItem(key)
      return true
    } catch (error) {
      console.error('LocalStorage removeItem error:', error)
      return false
    }
  }
  
  return { getItem, setItem, removeItem, isAvailable }
}

// Utility untuk safe JSON operations
export function safeJSON() {
  const parse = <T>(json: string, fallback: T): T => {
    try {
      return JSON.parse(json) as T
    } catch (error) {
      console.error('JSON parse error:', error)
      return fallback
    }
  }
  
  const stringify = (value: any, fallback: string = ''): string => {
    try {
      return JSON.stringify(value)
    } catch (error) {
      console.error('JSON stringify error:', error)
      return fallback
    }
  }
  
  return { parse, stringify }
}

// Utility untuk error logging (untuk production monitoring)
export function logError(error: AppError, context?: string) {
  const errorLog = {
    ...error,
    context,
    userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown',
    url: typeof window !== 'undefined' ? window.location.href : 'unknown',
    timestamp: error.timestamp.toISOString()
  }
  
  console.error('Error Log:', errorLog)
  
  // Di production, bisa dikirim ke monitoring service
  if (process.env.NODE_ENV === 'production') {
    // sendToMonitoringService(errorLog)
  }
}

// Utility untuk retry operations
export async function retryOperation<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<T> {
  let lastError: Error
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation()
    } catch (error) {
      lastError = error as Error
      
      if (attempt === maxRetries) {
        throw lastError
      }
      
      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, delay * attempt))
    }
  }
  
  throw lastError!
}

// Utility untuk debounced error handling
export function debounceErrorHandler(
  handler: (error: AppError) => void,
  delay: number = 1000
) {
  let timeoutId: NodeJS.Timeout
  
  return (error: AppError) => {
    clearTimeout(timeoutId)
    timeoutId = setTimeout(() => handler(error), delay)
  }
} 