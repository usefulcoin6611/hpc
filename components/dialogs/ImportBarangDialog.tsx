"use client"

import { useState } from "react"
import { DialogWrapper } from "@/components/ui/dialog-wrapper"
import { DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Download, Upload, FileText, AlertTriangle, CheckCircle, X } from "lucide-react"
import { importFile, exportToCSV, ImportResult } from "@/lib/import-utils"
import { CreateBarangData } from "@/services/barang"

interface ImportBarangDialogProps {
  isOpen: boolean
  onClose: () => void
  onImport: (data: CreateBarangData[]) => Promise<any>
}

export function ImportBarangDialog({
  isOpen,
  onClose,
  onImport
}: ImportBarangDialogProps) {
  const [importResult, setImportResult] = useState<ImportResult<any> | null>(null)
  const [importedFileName, setImportedFileName] = useState<string>("")
  const [isImporting, setIsImporting] = useState(false)
  const [importSummary, setImportSummary] = useState<{
    successCount: number
    errorCount: number
    skippedCount: number
    errors: string[]
  } | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [validatedData, setValidatedData] = useState<any[] | null>(null)

  const handleDownloadTemplate = () => {
    // Create template data with only headers and one empty row
    const templateData = [
      {
        'Kode Barang': '',
        'Nama Barang': ''
      }
    ]
    
    const headers = ['Kode Barang', 'Nama Barang']
    const filename = `template_master_barang_${new Date().toISOString().split('T')[0]}`
    
    exportToCSV(templateData, headers, filename)
  }

  const handleImportFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    
    // Save the file name
    setImportedFileName(file.name)
    setSelectedFile(file)
    
    // Set importing state for validation
    setIsImporting(true)
    
    try {
      const headers = [
        'Kode Barang',
        'Nama Barang'
      ]
      
      const validationRules = [
        {
          field: 'Kode Barang',
          required: true,
          validator: (value: string) => {
            if (!value || value.trim() === '') {
              return 'Kode Barang wajib diisi'
            }
            return true
          }
        },
        {
          field: 'Nama Barang',
          required: true,
          validator: (value: string) => {
            if (!value || value.trim() === '') {
              return 'Nama Barang wajib diisi'
            }
            return true
          }
        },
        {
          field: 'Stok',
          required: false,
          validator: (value: string) => {
            if (value && (isNaN(Number(value)) || Number(value) < 0)) {
              return 'Stok harus berupa angka positif'
            }
            return true
          }
        },
        {
          field: 'Stok Minimum',
          required: false,
          validator: (value: string) => {
            if (value && (isNaN(Number(value)) || Number(value) < 0)) {
              return 'Stok Minimum harus berupa angka positif'
            }
            return true
          }
        }
      ]
      
      const result = await importFile(file, headers, validationRules, true)
      
      // Check for duplicate kode barang within the file
      if (result.success && result.data && result.data.length > 0) {
        const kodeBarangSet = new Set<string>()
        const idSet = new Set<string>()
        const duplicateKodes: string[] = []
        const duplicateIds: string[] = []
        
        for (const row of result.data) {
          const kode = (row as any)['Kode Barang']?.trim()
          const id = (row as any)['ID']?.trim()
          
          // Check duplicate kode barang
          if (kode) {
            if (kodeBarangSet.has(kode)) {
              duplicateKodes.push(kode)
            } else {
              kodeBarangSet.add(kode)
            }
          }
          
          // Check duplicate ID
          if (id) {
            if (idSet.has(id)) {
              duplicateIds.push(id)
            } else {
              idSet.add(id)
            }
          }
        }
        
        const errors: string[] = []
        
        if (duplicateKodes.length > 0) {
          const uniqueDuplicates = [...new Set(duplicateKodes)]
          errors.push(`Kode barang duplikat: ${uniqueDuplicates.join(', ')}`)
        }
        
        if (duplicateIds.length > 0) {
          const uniqueDuplicates = [...new Set(duplicateIds)]
          errors.push(`ID duplikat: ${uniqueDuplicates.join(', ')}`)
        }
        
        if (errors.length > 0) {
          result.success = false
          result.error = errors.join('; ')
          result.validRows = 0
          result.data = []
        }
      }
      
      setImportResult(result)
      
      if (result.success && result.validRows > 0 && result.data && result.data.length > 0) {
        setValidatedData(result.data)
      } else {
        setValidatedData(null)
      }
    } catch (error) {
      console.error('File validation error:', error)
      setValidatedData(null)
    } finally {
      setIsImporting(false)
    }
  }

  const handleImportToDatabase = async () => {
    if (!validatedData || validatedData.length === 0) {
      return
    }

    // Set importing state
    setIsImporting(true)

    try {
      // Convert validated data to CreateBarangData format
      const importData: CreateBarangData[] = validatedData.map((row: any) => ({
        kode: (row as any)['Kode Barang']?.trim() || '',
        nama: (row as any)['Nama Barang']?.trim() || ''
      }))

      const result = await onImport(importData)
      setImportSummary(result)
    } catch (error) {
      console.error('Import to database error:', error)
    } finally {
      setIsImporting(false)
    }
  }

  const handleDeselectFile = () => {
    setSelectedFile(null)
    setImportedFileName("")
    setImportResult(null)
    setValidatedData(null)
    setImportSummary(null)
    
    // Reset file input
    const fileInput = document.getElementById('import-file-input') as HTMLInputElement
    if (fileInput) {
      fileInput.value = ''
    }
  }

  const handleClose = () => {
    if (!isImporting) {
      setImportResult(null)
      setImportedFileName("")
      setImportSummary(null)
      setSelectedFile(null)
      setValidatedData(null)
      
      // Reset file input
      const fileInput = document.getElementById('import-file-input') as HTMLInputElement
      if (fileInput) {
        fileInput.value = ''
      }
      
      onClose()
    }
  }

  return (
    <DialogWrapper open={isOpen} onOpenChange={handleClose} className="max-w-md">
        <DialogHeader>
          <DialogTitle>Import Data Master Barang</DialogTitle>
          <DialogDescription>
            Upload file CSV atau Excel untuk mengimport data barang (Kode Barang dan Nama Barang)
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          {/* Download template button */}
          <div className="flex justify-center">
            <Button
              variant="outline"
              size="sm"
              onClick={handleDownloadTemplate}
              className="text-xs"
            >
              <Download className="mr-2 h-4 w-4" />
              Download Template
            </Button>
          </div>
          
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
            <input
              type="file"
              accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
              onChange={handleImportFileChange}
              className="hidden"
              id="import-file-input"
              disabled={isImporting}
            />
            {!selectedFile ? (
              <Label
                htmlFor="import-file-input"
                className={`cursor-pointer flex flex-col items-center gap-2 ${isImporting ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <Upload className="h-8 w-8 text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-700">
                    {isImporting ? 'Memproses file...' : 'Klik untuk pilih file'}
                  </p>
                  <p className="text-xs text-gray-500">
                    CSV atau Excel (.xlsx, .xls)
                  </p>
                </div>
              </Label>
            ) : (
              <div className="flex flex-col items-center gap-3">
                <div className="flex items-center gap-2 p-3 bg-green-50 rounded-lg border border-green-200">
                  <FileText className="h-5 w-5 text-green-500" />
                  <span className="text-sm font-medium text-green-700">
                    {importedFileName}
                  </span>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleDeselectFile}
                    disabled={isImporting}
                    className="text-xs"
                  >
                    <X className="mr-1 h-3 w-3" />
                    Pilih File Lain
                  </Button>
                </div>
              </div>
            )}
          </div>

          {importResult && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                {importResult.success ? (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                ) : (
                  <AlertTriangle className="h-4 w-4 text-red-500" />
                )}
                <span className="text-sm font-medium">
                  {importResult.success ? 'File Valid' : 'File Tidak Valid'}
                </span>
              </div>
              <div className="text-xs text-gray-600 space-y-1">
                <p>Total baris: {importResult.totalRows}</p>
                <p>Baris valid: {importResult.validRows}</p>
                <p>Baris invalid: {importResult.invalidRows}</p>
                
                {/* Import Summary */}
                {importSummary && (
                  <div className="mt-3 p-2 bg-gray-50 rounded-lg">
                    <p className="font-medium text-gray-700 mb-1">Hasil Import:</p>
                    <div className="space-y-1">
                      {importSummary.successCount > 0 && (
                        <p className="text-green-600">✅ {importSummary.successCount} data berhasil disimpan</p>
                      )}
                      {importSummary.skippedCount > 0 && (
                        <p className="text-yellow-600">⚠️ {importSummary.skippedCount} data dilewati (kode barang atau ID sudah ada)</p>
                      )}
                      {importSummary.errorCount > 0 && (
                        <p className="text-red-600">❌ {importSummary.errorCount} data gagal</p>
                      )}
                    </div>
                    
                    {/* Show errors if any */}
                    {importSummary.errors.length > 0 && (
                      <div className="mt-2">
                        <p className="font-medium text-red-600 text-xs">Error Detail:</p>
                        <ul className="list-disc list-inside space-y-1 mt-1">
                          {importSummary.errors.slice(0, 3).map((error, index) => (
                            <li key={index} className="text-red-500 text-xs">{error}</li>
                          ))}
                          {importSummary.errors.length > 3 && (
                            <li className="text-red-500 text-xs">...dan {importSummary.errors.length - 3} error lainnya</li>
                          )}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
                
                {importResult.error && (
                  <div className="mt-2">
                    <p className="font-medium text-red-600">Error:</p>
                    <div className="text-red-500 text-xs">
                      {importResult.error}
                    </div>
                  </div>
                )}
                
                {/* Show duplicate detection info */}
                {importResult.error && (
                  importResult.error.includes('duplikat') || 
                  importResult.error.includes('duplicate')
                ) && (
                  <div className="mt-2 p-2 bg-red-50 rounded-lg border border-red-200">
                    <p className="font-medium text-red-700 text-xs mb-1">⚠️ Deteksi Duplikasi:</p>
                    <div className="text-red-600 text-xs">
                      {importResult.error.includes('Kode barang duplikat') && (
                        <p>• Kode barang yang sama ditemukan lebih dari sekali dalam file</p>
                      )}
                      {importResult.error.includes('ID duplikat') && (
                        <p>• ID yang sama ditemukan lebih dari sekali dalam file</p>
                      )}
                      <p className="mt-1 text-red-500">
                        Silakan perbaiki file dan coba lagi.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          {validatedData && validatedData.length > 0 && (
            <Button 
              onClick={handleImportToDatabase}
              className="rounded-lg bg-primary text-white hover:bg-primary/90"
              disabled={isImporting}
            >
              {isImporting ? (
                <>
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                  Importing...
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  Import
                </>
              )}
            </Button>
          )}
          
          <Button 
            variant="outline"
            onClick={handleClose}
            className="rounded-lg"
            disabled={isImporting}
          >
            Tutup
          </Button>
        </DialogFooter>
    </DialogWrapper>
  )
} 