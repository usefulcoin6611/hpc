"use client"

import React, { useState, useEffect, useRef } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Check, ChevronsUpDown, Search } from 'lucide-react'
import { cn } from '@/lib/utils'

interface AutocompleteOption {
  value: string | number
  label: string
  [key: string]: any
}

interface AutocompleteProps {
  options: AutocompleteOption[]
  value?: AutocompleteOption | null
  onValueChange: (value: AutocompleteOption | null) => void
  placeholder?: string
  className?: string
  disabled?: boolean
  loading?: boolean
  onSearch?: (query: string) => void
  searchQuery?: string
  onSearchQueryChange?: (query: string) => void
}

export function Autocomplete({
  options,
  value,
  onValueChange,
  placeholder = "Pilih opsi...",
  className,
  disabled = false,
  loading = false,
  onSearch,
  searchQuery = "",
  onSearchQueryChange
}: AutocompleteProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [inputValue, setInputValue] = useState("")
  const wrapperRef = useRef<HTMLDivElement>(null)

  // Update input value when value changes
  useEffect(() => {
    if (value) {
      setInputValue(value.label)
    } else {
      setInputValue("")
    }
  }, [value])

  // Handle click outside to close dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    setInputValue(newValue)
    
    if (onSearchQueryChange) {
      onSearchQueryChange(newValue)
    }
    
    if (onSearch) {
      onSearch(newValue)
    }
    
    setIsOpen(true)
  }

  // Handle option selection
  const handleSelectOption = (option: AutocompleteOption) => {
    onValueChange(option)
    setInputValue(option.label)
    setIsOpen(false)
  }

  // Handle clear
  const handleClear = () => {
    onValueChange(null)
    setInputValue("")
    if (onSearchQueryChange) {
      onSearchQueryChange("")
    }
    setIsOpen(false)
  }

  return (
    <div ref={wrapperRef} className={cn("relative", className)}>
      <div className="relative">
        <Input
          value={inputValue}
          onChange={handleInputChange}
          placeholder={placeholder}
          disabled={disabled}
          className="pr-10"
          onFocus={() => setIsOpen(true)}
        />
        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
          {loading && (
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-gray-600" />
          )}
          {value && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0 hover:bg-gray-100"
              onClick={handleClear}
            >
              <span className="sr-only">Clear</span>
              ×
            </Button>
          )}
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0 hover:bg-gray-100"
            onClick={() => setIsOpen(!isOpen)}
          >
            <ChevronsUpDown className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {isOpen && (
        <div className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-md border border-gray-200 bg-white shadow-lg">
          {options.length === 0 ? (
            <div className="px-3 py-2 text-sm text-gray-500">
              {loading ? "Mencari..." : "Tidak ada hasil"}
            </div>
          ) : (
            <div className="py-1">
              {options.map((option, index) => (
                <button
                  key={option.value}
                  type="button"
                  className={cn(
                    "relative flex w-full cursor-pointer select-none items-center px-3 py-2 text-sm hover:bg-gray-100",
                    value?.value === option.value && "bg-gray-100"
                  )}
                  onClick={() => handleSelectOption(option)}
                >
                  <span className="flex-1 text-left">{option.label}</span>
                  {value?.value === option.value && (
                    <Check className="h-4 w-4 text-blue-600" />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
} 