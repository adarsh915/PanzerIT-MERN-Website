import { useState, useEffect } from 'react'

const useViewPort = () => {
  const [width, setWidth] = useState(() => (typeof window === 'undefined' ? 0 : window.innerWidth))
  const [height, setHeight] = useState(() => (typeof window === 'undefined' ? 0 : window.innerHeight))

  useEffect(() => {
    const handleWindowResize = () => {
      setWidth(window.innerWidth)
      setHeight(window.innerHeight)
    }

    handleWindowResize()
    window.addEventListener('resize', handleWindowResize)
    return () => window.removeEventListener('resize', handleWindowResize)
  }, [])
  return { width, height }
}

export default useViewPort
