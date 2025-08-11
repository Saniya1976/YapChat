import React, { Children } from 'react'
import Sidebar from './Sidebar'
import Navbar from './Navbar'


const Layout = (Children,showSidebar=false) => {
  return (
    <div className='min-h-screen '>
    <div className='flex'>
   { showSidebar && <Sidebar/>}
   <div className='flex1 flex flex-col'>
     <Navbar/>
     <main className='flex-1 overflow-y-auto'>
        {Children}
     </main>
   </div>
    </div>
    </div>
  )
}

export default Layout