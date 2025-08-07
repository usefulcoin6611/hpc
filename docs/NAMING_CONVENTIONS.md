# Naming Conventions - Warehouse Admin System

## 📁 File & Folder Naming

### **React Components**
```typescript
// ✅ Correct
UserProfile.tsx
DataTable.tsx
LoadingSpinner.tsx
AdminSidebar.tsx

// ❌ Incorrect
userProfile.tsx
data_table.tsx
loading-spinner.tsx
admin_sidebar.tsx
```

### **Pages (Next.js App Router)**
```typescript
// ✅ Correct
page.tsx
loading.tsx
error.tsx
layout.tsx

// ❌ Incorrect
Page.tsx
Loading.tsx
Error.tsx
Layout.tsx
```

### **Folders**
```typescript
// ✅ Correct
components/
admin-sidebar/
data-pengguna/
master-barang/
barang-masuk/
barang-keluar/

// ❌ Incorrect
Components/
admin_sidebar/
dataPengguna/
masterBarang/
barangMasuk/
barangKeluar/
```

## 🏷️ Variable & Function Naming

### **Variables**
```typescript
// ✅ Correct - camelCase
const userName = "John Doe"
const isLoggedIn = true
const userData = { id: 1, name: "John" }
const isLoading = false

// ❌ Incorrect
const user_name = "John Doe"
const isloggedin = true
const UserData = { id: 1, name: "John" }
const loading = false
```

### **Functions**
```typescript
// ✅ Correct - camelCase
function getUserData() { }
function handleSubmit() { }
function validateForm() { }
function fetchUserProfile() { }

// ❌ Incorrect
function get_user_data() { }
function HandleSubmit() { }
function validate_form() { }
function FetchUserProfile() { }
```

### **Constants**
```typescript
// ✅ Correct - UPPER_SNAKE_CASE
const API_BASE_URL = "https://api.example.com"
const MAX_RETRY_ATTEMPTS = 3
const DEFAULT_TIMEOUT = 5000

// ❌ Incorrect
const apiBaseUrl = "https://api.example.com"
const maxRetryAttempts = 3
const defaultTimeout = 5000
```

## 🎨 CSS Classes & Styling

### **Tailwind CSS Classes**
```typescript
// ✅ Correct - Consistent spacing and ordering
className="flex items-center justify-between p-4 bg-white rounded-lg shadow-sm"

// ✅ Correct - Responsive design
className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"

// ✅ Correct - Conditional classes
className={cn(
  "flex items-center rounded-xl px-4 py-3 transition-all duration-200",
  isActive ? "bg-white/10 font-medium text-white" : "text-indigo-100 hover:bg-indigo-600/50"
)}

// ❌ Incorrect - Inconsistent spacing
className="flex items-center justify-between p-4 bg-white rounded-lg shadow-sm"

// ❌ Incorrect - No responsive design
className="grid grid-cols-3 gap-4"
```

### **Custom CSS Classes**
```typescript
// ✅ Correct - kebab-case
className="sidebar-header"
className="user-profile-card"
className="data-table-container"

// ❌ Incorrect
className="sidebarHeader"
className="userProfileCard"
className="dataTableContainer"
```

## 🔧 TypeScript Interfaces & Types

### **Interfaces**
```typescript
// ✅ Correct - PascalCase with descriptive names
interface UserProfile {
  id: string
  name: string
  email: string
  role: UserRole
}

interface LoginFormData {
  username: string
  password: string
}

// ❌ Incorrect
interface userProfile {
  id: string
  name: string
}

interface login_form_data {
  username: string
  password: string
}
```

### **Types**
```typescript
// ✅ Correct - PascalCase
type UserRole = 'admin' | 'user' | 'approver'
type LoadingState = 'idle' | 'loading' | 'success' | 'error'
type ButtonVariant = 'primary' | 'secondary' | 'danger'

// ❌ Incorrect
type userRole = 'admin' | 'user' | 'approver'
type loading_state = 'idle' | 'loading' | 'success' | 'error'
type buttonVariant = 'primary' | 'secondary' | 'danger'
```

## 🎯 Component Props

### **Props Interface**
```typescript
// ✅ Correct - ComponentName + Props
interface UserCardProps {
  user: User
  onEdit?: (user: User) => void
  onDelete?: (userId: string) => void
  className?: string
}

// ❌ Incorrect
interface Props {
  user: User
  onEdit?: (user: User) => void
}

interface UserCardProps {
  User: User
  OnEdit?: (user: User) => void
}
```

### **Props Usage**
```typescript
// ✅ Correct - Destructuring with default values
export function UserCard({ 
  user, 
  onEdit, 
  onDelete, 
  className = "" 
}: UserCardProps) {
  // Component logic
}

// ❌ Incorrect
export function UserCard(props: UserCardProps) {
  const { user, onEdit, onDelete, className } = props
  // Component logic
}
```

## 🗂️ Import/Export Conventions

### **Import Statements**
```typescript
// ✅ Correct - Grouped and ordered
// React imports
import React from "react"
import { useState, useEffect } from "react"

// Next.js imports
import Link from "next/link"
import Image from "next/image"

// Third-party libraries
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

// Local imports
import { UserCard } from "@/components/user-card"
import type { User } from "@/types"

// ❌ Incorrect - Mixed and unordered
import { Button } from "@/components/ui/button"
import React from "react"
import { UserCard } from "@/components/user-card"
import { useState, useEffect } from "react"
```

### **Export Statements**
```typescript
// ✅ Correct - Named exports for components
export function UserCard() { }
export function LoadingSpinner() { }
export function DataTable() { }

// ✅ Correct - Default export for pages
export default function UserPage() { }

// ✅ Correct - Type exports
export type { User, UserRole }
export interface UserCardProps { }

// ❌ Incorrect
export default function UserCard() { }
export const UserCard = () => { }
```

## 🎨 UI Component Naming

### **Component Names**
```typescript
// ✅ Correct - Descriptive and specific
<AdminSidebar />
<UserProfileCard />
<DataTable />
<LoadingSpinner />
<ErrorBoundary />

// ❌ Incorrect - Generic names
<Sidebar />
<Card />
<Table />
<Spinner />
<Error />
```

### **Event Handlers**
```typescript
// ✅ Correct - handle + Action
const handleSubmit = () => { }
const handleUserEdit = (user: User) => { }
const handleDataDelete = (id: string) => { }
const handleFormValidation = () => { }

// ❌ Incorrect
const onSubmit = () => { }
const editUser = (user: User) => { }
const deleteData = (id: string) => { }
const validateForm = () => { }
```

## 📊 Database & API Naming

### **API Endpoints**
```typescript
// ✅ Correct - RESTful conventions
GET /api/users
POST /api/users
PUT /api/users/:id
DELETE /api/users/:id

// ✅ Correct - Resource-based
GET /api/barang-masuk
POST /api/barang-keluar
GET /api/master-barang

// ❌ Incorrect
GET /api/getUsers
POST /api/createUser
PUT /api/updateUser
DELETE /api/removeUser
```

### **Database Tables**
```typescript
// ✅ Correct - Plural, snake_case
users
barang_masuk
barang_keluar
master_barang
jenis_barang

// ❌ Incorrect
user
barangMasuk
barangKeluar
masterBarang
jenisBarang
```

## 🔍 Search & Filter Naming

### **Search Variables**
```typescript
// ✅ Correct
const searchTerm = ""
const searchQuery = ""
const filterValue = ""
const sortBy = "name"

// ❌ Incorrect
const search = ""
const query = ""
const filter = ""
const sort = "name"
```

## 📝 Comments & Documentation

### **Comments**
```typescript
// ✅ Correct - Clear and descriptive
// Handle user login form submission
const handleLoginSubmit = async (credentials: LoginCredentials) => {
  // Validate form data
  const validationError = validateLoginForm(credentials)
  if (validationError) {
    setError(validationError)
    return
  }

  // Attempt login
  try {
    const response = await loginUser(credentials)
    if (response.success) {
      router.push("/admin")
    }
  } catch (error) {
    setError("Login failed. Please try again.")
  }
}

// ❌ Incorrect - Unclear or redundant
// Handle submit
const handleSubmit = async (data) => {
  // Check if valid
  if (!data.username || !data.password) {
    setError("Invalid")
    return
  }

  // Do login
  try {
    const result = await login(data)
    if (result.ok) {
      router.push("/admin")
    }
  } catch (err) {
    setError("Error")
  }
}
```

## 🎯 Best Practices Summary

1. **Be Consistent** - Use the same pattern throughout the project
2. **Be Descriptive** - Names should clearly indicate purpose
3. **Be Specific** - Avoid generic names like `data`, `item`, `value`
4. **Follow Conventions** - Stick to established patterns
5. **Document Changes** - Update this guide when conventions change
6. **Use Linting** - Configure ESLint to enforce naming conventions
7. **Code Review** - Review naming during pull requests
8. **Refactor Regularly** - Improve naming as the codebase evolves

## 🔧 ESLint Configuration

Add these rules to your `.eslintrc.js`:

```javascript
module.exports = {
  rules: {
    // Enforce camelCase for variables and functions
    camelcase: ['error', { properties: 'always' }],
    
    // Enforce PascalCase for components
    'react/jsx-pascal-case': 'error',
    
    // Enforce consistent naming for event handlers
    'react/jsx-handler-names': 'error',
    
    // Enforce consistent naming for boolean props
    'react/boolean-prop-naming': 'error',
  }
}
``` 