"use client"

import React, { useEffect } from 'react'
import { Dialog, DialogContent } from './dialog'
import { useDialogScroll } from '@/hooks/use-dialog-scroll'
import * as DialogPrimitive from "@radix-ui/react-dialog"

interface DialogWrapperProps extends React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content> {
  open: boolean
  onOpenChange: (open: boolean) => void
  children: React.ReactNode
}

export function DialogWrapper({ 
  open, 
  onOpenChange, 
  children, 
  ...props 
}: DialogWrapperProps) {
  const { lockScroll, unlockScroll } = useDialogScroll()

  useEffect(() => {
    if (open) {
      lockScroll()
    } else {
      unlockScroll()
    }

    return () => {
      unlockScroll()
    }
  }, [open, lockScroll, unlockScroll])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent {...props}>
        {children}
      </DialogContent>
    </Dialog>
  )
}
