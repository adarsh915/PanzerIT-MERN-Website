import React, { useEffect, useState } from 'react'
import LogoBox from '@/components/LogoBox'
import IconifyIcon from '@/components/wrappers/IconifyIcon'
import SimplebarReactClient from '@/components/wrappers/SimplebarReactClient'
import { useLayoutContext } from '@/context/useLayoutContext'
import { useAuthContext } from '@/context/useAuthContext'
import { getMenuItems } from '@/helpers/Manu'
import AppMenu from './components/AppMenu'
import HoverMenuToggle from './components/HoverMenuToggle'

const VerticalNavigationBar = () => {
  const { user } = useAuthContext()
  const [mounted, setMounted] = useState(false)
  
  useEffect(() => {
    setMounted(true)
  }, [])

  // During SSR and first client render, always render 'admin' to match.
  // After mount, render the actual role-based menu.
  const menuItems = getMenuItems(mounted ? user?.role : 'admin')

  const { toggleBackdrop } = useLayoutContext()
  return (
    <div className="sidenav-menu">
      <LogoBox />
      {/* <button className="button-sm-hover">
        <IconifyIcon icon='tabler:circle' className="align-middle" />
      </button> */}
      <HoverMenuToggle />
      <button onClick={toggleBackdrop} className="button-close-fullsidebar">
        <IconifyIcon icon='tabler:x' className="align-middle" />
      </button>
      <div 
        id="leftside-menu-container" 
        style={{ 
          height: 'calc(100vh - 70px)', 
          overflowY: 'auto',
          overflowX: 'hidden'
        }}
      >
        <AppMenu menuItems={menuItems} />
        <div className="clearfix" />
      </div>
    </div>
  )
}

export default VerticalNavigationBar
