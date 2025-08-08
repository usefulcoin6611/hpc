import { useEffect, useRef } from 'react'

export function useDialogScroll() {
  const scrollbarWidthRef = useRef<number>(0)

  // Calculate scrollbar width on mount
  useEffect(() => {
    const calculateScrollbarWidth = () => {
      // Create temporary elements to measure scrollbar width
      const outer = document.createElement('div')
      outer.style.visibility = 'hidden'
      outer.style.overflow = 'scroll'
      outer.style.position = 'absolute'
      outer.style.top = '-9999px'
      document.body.appendChild(outer)

      const inner = document.createElement('div')
      outer.appendChild(inner)

      const scrollbarWidth = outer.offsetWidth - inner.offsetWidth
      outer.parentNode?.removeChild(outer)

      scrollbarWidthRef.current = scrollbarWidth
      document.documentElement.style.setProperty('--scrollbar-width', `${scrollbarWidth}px`)
    }

    calculateScrollbarWidth()
  }, [])

  const lockScroll = () => {
    const body = document.body
    const scrollY = window.scrollY
    
    // Store scroll position
    body.style.top = `-${scrollY}px`
    body.style.position = 'fixed'
    body.style.width = '100%'
    
    // Add data attribute for CSS targeting
    body.setAttribute('data-dialog-open', 'true')
    
    // Add padding to compensate for scrollbar
    const scrollbarWidth = scrollbarWidthRef.current
    if (scrollbarWidth > 0) {
      body.style.paddingRight = `${scrollbarWidth}px`
    }
  }

  const unlockScroll = () => {
    const body = document.body
    
    // Remove data attribute
    body.removeAttribute('data-dialog-open')
    
    // Restore scroll position
    const scrollY = parseInt(body.style.top || '0') * -1
    body.style.position = ''
    body.style.top = ''
    body.style.width = ''
    body.style.paddingRight = ''
    
    // Restore scroll position
    window.scrollTo(0, scrollY)
  }

  return { lockScroll, unlockScroll }
}
