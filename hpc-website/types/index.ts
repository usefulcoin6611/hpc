// Global Types untuk Warehouse Admin System

// ===== AUTHENTICATION TYPES =====
export interface LoginCredentials {
  username: string
  password: string
}

export interface LoginResponse {
  success: boolean
  message?: string
  user?: User
  token?: string
}

export interface User {
  id: string
  username: string
  name: string
  email: string
  role: UserRole
  jobType?: UserJobType
  avatar?: string
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

export type UserRole = 'inspeksi_mesin' | 'assembly_staff' | 'qc_staff' | 'pdi_staff' | 'painting_staff' | 'pindah_lokasi' | 'admin' | 'supervisor'

export type UserJobType = 'staff' | 'supervisor' | 'admin'

// ===== NAVIGATION TYPES =====
export interface MenuItem {
  title: string
  path: string
  icon: React.ReactNode
  submenu?: boolean
  children?: MenuItem[]
  isActive?: boolean
  permission?: {
    roles?: UserRole[]
    jobTypes?: UserJobType[]
  }
}

// ===== DASHBOARD TYPES =====
export interface DashboardStats {
  totalBarang: number
  barangMasuk: number
  barangKeluar: number
  totalPengguna: number
  growthRate?: number
  period?: string
}

export interface ActivityItem {
  id: string
  type: 'barang_masuk' | 'barang_keluar' | 'user_login' | 'approval'
  title: string
  description: string
  timestamp: Date
  icon: React.ReactNode
  status?: 'success' | 'pending' | 'error'
}

// ===== INVENTORY TYPES =====
export interface Barang {
  id: string
  kode: string
  nama: string
  jenis: JenisBarang
  kategori: string
  satuan: string
  stok: number
  stokMinimum: number
  lokasi: string
  deskripsi?: string
  gambar?: string
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

export interface JenisBarang {
  id: string
  nama: string
  kode: string
  deskripsi?: string
  isActive: boolean
}

export interface TransaksiBarang {
  id: string
  kodeTransaksi: string
  jenis: 'masuk' | 'keluar'
  barang: Barang
  jumlah: number
  tanggal: Date
  keterangan?: string
  status: 'pending' | 'approved' | 'rejected' | 'completed'
  approvedBy?: User
  approvedAt?: Date
  createdBy: User
  createdAt: Date
  updatedAt: Date
}

// ===== FORM TYPES =====
export interface FormField {
  name: string
  label: string
  type: 'text' | 'email' | 'password' | 'number' | 'select' | 'textarea' | 'date' | 'file'
  required?: boolean
  placeholder?: string
  options?: Array<{ value: string; label: string }>
  validation?: {
    min?: number
    max?: number
    pattern?: string
    message?: string
  }
}

export interface FormData {
  [key: string]: string | number | boolean | Date | File | null
}

// ===== API RESPONSE TYPES =====
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  message?: string
  error?: string
  errors?: Record<string, string[]>
}

export interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasNext: boolean
    hasPrev: boolean
  }
}

// ===== COMPONENT PROPS TYPES =====
export interface BaseComponentProps {
  className?: string
  children?: React.ReactNode
}

export interface LoadingProps extends BaseComponentProps {
  size?: 'sm' | 'md' | 'lg'
  text?: string
}

export interface ErrorProps extends BaseComponentProps {
  title?: string
  message?: string
  onRetry?: () => void
}

export interface ModalProps extends BaseComponentProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
}

// ===== UTILITY TYPES =====
export type StatusType = 'success' | 'error' | 'warning' | 'info' | 'pending'

export interface Notification {
  id: string
  type: StatusType
  title: string
  message?: string
  duration?: number
  action?: {
    label: string
    onClick: () => void
  }
}

// ===== THEME TYPES =====
export type Theme = 'light' | 'dark' | 'system'

export interface ThemeContextType {
  theme: Theme
  setTheme: (theme: Theme) => void
}

// ===== SIDEBAR TYPES =====
export interface SidebarState {
  isOpen: boolean
  isMobile: boolean
  isCollapsed: boolean
}

export interface SidebarContextType {
  state: SidebarState
  toggle: () => void
  open: () => void
  close: () => void
  setMobile: (isMobile: boolean) => void
}

// ===== TABLE TYPES =====
export interface TableColumn<T = any> {
  key: string
  title: string
  dataIndex: keyof T
  render?: (value: any, record: T, index: number) => React.ReactNode
  sortable?: boolean
  width?: string | number
  align?: 'left' | 'center' | 'right'
}

export interface TableProps<T = any> {
  data: T[]
  columns: TableColumn<T>[]
  loading?: boolean
  pagination?: {
    current: number
    pageSize: number
    total: number
    onChange: (page: number, pageSize: number) => void
  }
  rowKey?: keyof T | ((record: T) => string)
  onRow?: (record: T, index: number) => React.HTMLAttributes<HTMLTableRowElement>
}

// ===== SEARCH & FILTER TYPES =====
export interface SearchFilters {
  keyword?: string
  dateRange?: {
    start: Date
    end: Date
  }
  status?: string[]
  category?: string[]
  [key: string]: any
}

export interface SortConfig {
  field: string
  direction: 'asc' | 'desc'
}

// ===== EXPORT TYPES =====
export interface ExportOptions {
  format: 'csv' | 'excel' | 'pdf'
  filename?: string
  includeHeaders?: boolean
  dateFormat?: string
}

// ===== VALIDATION TYPES =====
export interface ValidationRule {
  required?: boolean
  min?: number
  max?: number
  pattern?: RegExp
  message?: string
  validator?: (value: any) => boolean | string | Promise<boolean | string>
}

export interface ValidationSchema {
  [fieldName: string]: ValidationRule | ValidationRule[]
}

// ===== EVENT TYPES =====
export interface FormEvent {
  target: {
    name: string
    value: any
  }
}

export interface ChangeEvent {
  target: {
    name: string
    value: any
    checked?: boolean
  }
}

// ===== HOOK TYPES =====
export interface UseLocalStorageOptions<T> {
  defaultValue: T
  serialize?: (value: T) => string
  deserialize?: (value: string) => T
}

export interface UseDebounceOptions {
  delay: number
  leading?: boolean
  trailing?: boolean
}

// ===== ERROR TYPES =====
export interface AppError {
  code: string
  message: string
  details?: any
  timestamp: Date
  stack?: string
}

export interface ErrorBoundaryState {
  hasError: boolean
  error?: AppError
}

// ===== CONFIG TYPES =====
export interface AppConfig {
  name: string
  version: string
  environment: 'development' | 'staging' | 'production'
  apiUrl: string
  features: {
    [feature: string]: boolean
  }
}

// ===== PERMISSION TYPES =====
export interface Permission {
  resource: string
  action: string
  conditions?: Record<string, any>
}

export interface Role {
  id: string
  name: string
  permissions: Permission[]
  isActive: boolean
}

// ===== AUDIT TYPES =====
export interface AuditLog {
  id: string
  userId: string
  action: string
  resource: string
  resourceId?: string
  details?: Record<string, any>
  ipAddress?: string
  userAgent?: string
  timestamp: Date
}

// ===== NOTIFICATION TYPES =====
export interface NotificationSettings {
  email: boolean
  push: boolean
  sms: boolean
  types: {
    [type: string]: boolean
  }
}

// ===== FILE TYPES =====
export interface FileUpload {
  id: string
  name: string
  size: number
  type: string
  url: string
  uploadedAt: Date
  uploadedBy: string
}

export interface FileUploadOptions {
  maxSize?: number
  allowedTypes?: string[]
  multiple?: boolean
  autoUpload?: boolean
}

// ===== CHART TYPES =====
export interface ChartData {
  labels: string[]
  datasets: Array<{
    label: string
    data: number[]
    backgroundColor?: string | string[]
    borderColor?: string | string[]
    borderWidth?: number
  }>
}

export interface ChartOptions {
  responsive?: boolean
  maintainAspectRatio?: boolean
  plugins?: {
    legend?: {
      display?: boolean
      position?: 'top' | 'bottom' | 'left' | 'right'
    }
    tooltip?: {
      enabled?: boolean
    }
  }
  scales?: {
    y?: {
      beginAtZero?: boolean
    }
  }
} 