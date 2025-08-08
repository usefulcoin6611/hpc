export const config = {
  // API Configuration
  api: {
    baseUrl: process.env.NEXT_PUBLIC_API_URL || '/api',
    timeout: 10000,
    retries: 3,
  },

  // App Configuration
  app: {
    name: 'Warehouse Admin System',
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development',
  },

  // Feature Flags
  features: {
    realTimeUpdates: true,
    fileUpload: true,
    exportImport: true,
    notifications: true,
    darkMode: true,
    analytics: false,
  },

  // Pagination Defaults
  pagination: {
    defaultPageSize: 10,
    pageSizeOptions: [10, 20, 50, 100],
  },

  // File Upload Limits
  upload: {
    maxFileSize: 5 * 1024 * 1024, // 5MB
    allowedTypes: ['.csv', '.xlsx', '.xls', '.pdf', '.jpg', '.png'],
    maxFiles: 10,
  },

  // Toast Configuration
  toast: {
    duration: 5000,
    position: 'top-right',
  },

  // Local Storage Keys
  storage: {
    authToken: 'auth_token',
    currentUser: 'current_user',
    theme: 'theme',
    sidebarState: 'sidebar_state',
  },

  // Validation Rules
  validation: {
    password: {
      minLength: 6,
      requireUppercase: true,
      requireLowercase: true,
      requireNumbers: true,
    },
    username: {
      minLength: 3,
      maxLength: 50,
    },
    email: {
      pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    },
  },

  // Error Messages
  messages: {
    networkError: 'Koneksi jaringan bermasalah',
    serverError: 'Terjadi kesalahan pada server',
    unauthorized: 'Anda tidak memiliki akses',
    notFound: 'Data tidak ditemukan',
    validationError: 'Data tidak valid',
  },
} as const

// Type untuk config
export type Config = typeof config

// Helper functions
export const isDevelopment = config.app.environment === 'development'
export const isProduction = config.app.environment === 'production'
export const isStaging = config.app.environment === 'staging' as any

// Feature check helpers
export const hasFeature = (feature: keyof typeof config.features): boolean => {
  return config.features[feature]
}

// API URL helpers
export const getApiUrl = (endpoint: string): string => {
  return `${config.api.baseUrl}${endpoint}`
}

// Storage helpers
export const getStorageKey = (key: keyof typeof config.storage): string => {
  return config.storage[key]
} 