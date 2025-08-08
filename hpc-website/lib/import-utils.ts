// Utility functions untuk import file CSV dan Excel

export interface ImportResult<T> {
  success: boolean
  data?: T[]
  error?: string
  totalRows: number
  validRows: number
  invalidRows: number
}

export interface ValidationRule<T> {
  field: keyof T
  required?: boolean
  validator?: (value: any) => boolean | string
  transformer?: (value: any) => any
}

// Parse CSV content
export function parseCSV(content: string): string[][] {
  const lines = content.split('\n').filter(line => line.trim() !== '')
  return lines.map(line => {
    const result: string[] = []
    let current = ''
    let inQuotes = false
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i]
      
      if (char === '"') {
        if (inQuotes && line[i + 1] === '"') {
          current += '"'
          i++ // Skip next quote
        } else {
          inQuotes = !inQuotes
        }
      } else if (char === ',' && !inQuotes) {
        result.push(current.trim())
        current = ''
      } else {
        current += char
      }
    }
    
    result.push(current.trim())
    return result
  })
}

// Parse Excel file (XLSX) using SheetJS
export async function parseExcel(file: File): Promise<string[][]> {
  try {
    // Dynamic import untuk mengurangi bundle size
    const XLSX = await import('xlsx')
    const data = await file.arrayBuffer()
    const workbook = XLSX.read(data, { type: 'array' })
    const sheetName = workbook.SheetNames[0]
    const worksheet = workbook.Sheets[sheetName]
    const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as string[][]
    
    return jsonData.filter(row => row.some(cell => cell !== undefined && cell !== ''))
  } catch (error) {
    throw new Error(`Gagal membaca file Excel: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

// Validate and transform data
export function validateAndTransformData<T>(
  rawData: string[][],
  headers: string[],
  validationRules: ValidationRule<T>[],
  skipFirstRow: boolean = true
): ImportResult<T> {
  const result: ImportResult<T> = {
    success: false,
    totalRows: 0,
    validRows: 0,
    invalidRows: 0
  }

  const data: T[] = []
  const errors: string[] = []

  // Skip header row if needed
  const dataRows = skipFirstRow ? rawData.slice(1) : rawData
  
  // Set totalRows to actual data rows (excluding header)
  result.totalRows = dataRows.length

  for (let rowIndex = 0; rowIndex < dataRows.length; rowIndex++) {
    const row = dataRows[rowIndex]
    const rowNumber = rowIndex + (skipFirstRow ? 2 : 1) // +2 because we start from 0 and skip header
    
    if (!row || row.length === 0) continue

    const rowData: any = {}
    let rowValid = true
    let rowErrors: string[] = []

    // Get header row to map column names
    const headerRow = skipFirstRow ? rawData[0] : headers
    
    // Debug logging
    console.log('=== IMPORT UTILS DEBUG ===')
    console.log('Header row:', headerRow)
    console.log('Data row:', row)
    console.log('Headers parameter:', headers)
    console.log('Skip first row:', skipFirstRow)
    
    // Map data to object based on header names, not position
    for (let colIndex = 0; colIndex < Math.min(headerRow.length, row.length); colIndex++) {
      const header = headerRow[colIndex]?.toString().trim()
      const value = row[colIndex]?.toString().trim() || ''
      
      console.log(`Column ${colIndex}: header="${header}", value="${value}"`)
      
      if (header) {
        rowData[header] = value
      }
    }
    
    console.log('Mapped row data:', rowData)

    // Validate each field
    for (const rule of validationRules) {
      const value = rowData[rule.field]
      
      // Check required fields
      if (rule.required && (!value || value === '')) {
        rowValid = false
        rowErrors.push(`${String(rule.field)} wajib diisi`)
        continue
      }

      // Apply custom validator
      if (rule.validator && value) {
        const validationResult = rule.validator(value)
        if (validationResult !== true) {
          rowValid = false
          rowErrors.push(typeof validationResult === 'string' ? validationResult : `${String(rule.field)} tidak valid`)
          continue
        }
      }

      // Apply transformer
      if (rule.transformer && value) {
        rowData[rule.field] = rule.transformer(value)
      }
    }

    if (rowValid) {
      data.push(rowData as T)
      result.validRows++
    } else {
      result.invalidRows++
      errors.push(`Baris ${rowNumber}: ${rowErrors.join(', ')}`)
    }
  }

  if (result.validRows > 0) {
    result.success = true
    result.data = data
  }

  if (errors.length > 0) {
    result.error = errors.join('\n')
  }

  return result
}

// Main import function
export async function importFile<T>(
  file: File,
  headers: string[],
  validationRules: ValidationRule<T>[],
  skipFirstRow: boolean = true
): Promise<ImportResult<T>> {
  try {
    let rawData: string[][]

    if (file.type === 'text/csv' || file.name.endsWith('.csv')) {
      const content = await file.text()
      rawData = parseCSV(content)
    } else if (
      file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
      file.type === 'application/vnd.ms-excel' ||
      file.name.endsWith('.xlsx') ||
      file.name.endsWith('.xls')
    ) {
      rawData = await parseExcel(file)
    } else {
      throw new Error('Format file tidak didukung. Gunakan file CSV atau Excel (.xlsx, .xls)')
    }

    return validateAndTransformData(rawData, headers, validationRules, skipFirstRow)
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Terjadi kesalahan saat import file',
      totalRows: 0,
      validRows: 0,
      invalidRows: 0
    }
  }
}

// Export data to CSV
export function exportToCSV<T>(data: T[], headers: string[], filename: string): void {
  const csvContent = [
    headers.join(','),
    ...data.map(row => 
      headers.map(header => {
        const value = (row as any)[header]
        // Escape quotes and wrap in quotes if contains comma or newline
        const escaped = String(value).replace(/"/g, '""')
        return escaped.includes(',') || escaped.includes('\n') ? `"${escaped}"` : escaped
      }).join(',')
    )
  ].join('\n')

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)
  
  link.setAttribute('href', url)
  link.setAttribute('download', `${filename}.csv`)
  link.style.visibility = 'hidden'
  
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

// Export data to Excel
export async function exportToExcel<T>(data: T[], headers: string[], filename: string): Promise<void> {
  try {
    const XLSX = await import('xlsx')
    
    // Transform data to worksheet format
    const worksheetData = [
      headers,
      ...data.map(row => headers.map(header => (row as any)[header]))
    ]
    
    const worksheet = XLSX.utils.aoa_to_sheet(worksheetData)
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Data')
    
    // Generate and download file
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' })
    const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    
    link.setAttribute('href', url)
    link.setAttribute('download', `${filename}.xlsx`)
    link.style.visibility = 'hidden'
    
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  } catch (error) {
    throw new Error(`Gagal export ke Excel: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
} 