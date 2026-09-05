'use client'

import { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'

// Dynamically import JoditEditor with SSR disabled
const JoditEditor = dynamic(() => import('jodit-react'), { ssr: false })

// Component wrapper that ensures CSS loads in production
const JoditEditorWrapper = (props: any) => {
  const [cssLoaded, setCssLoaded] = useState(false)

  useEffect(() => {
    // Check if CSS is already loaded
    const existingLink = document.querySelector('link[href*="jodit"]')
    if (existingLink) {
      setCssLoaded(true)
      return
    }

    // Create and append CSS link to static file in public folder
    const link = document.createElement('link')
    link.rel = 'stylesheet'
    link.href = '/jodit.min.css'
    link.onload = () => setCssLoaded(true)
    link.onerror = () => setCssLoaded(true) // Show editor even if CSS fails to load
    document.head.appendChild(link)
  }, [])

  // Show loading state while CSS loads
  if (!cssLoaded) {
    return (
      <div style={{ 
        minHeight: '400px', 
        border: '1px solid #e2e8f0', 
        borderRadius: '8px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#f8fafc'
      }}>
        <span style={{ color: '#64748b' }}>Loading editor...</span>
      </div>
    )
  }

  return <JoditEditor {...props} />
}

export default JoditEditorWrapper
