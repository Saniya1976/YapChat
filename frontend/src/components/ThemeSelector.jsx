import React from 'react'
import { useThemeStore } from '../store/useThemeStore'

const ThemeSelector = () => {
  const {theme,setTheme}=useThemeStore();
  return (
    <div className='dropdown dropdown-end'>

    </div>
  )
}

export default ThemeSelector