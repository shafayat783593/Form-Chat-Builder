
import { Footer } from '@/components/layout/public/footer'
import { Navbar } from '@/components/layout/public/navbar'
import React from 'react'

function layout({children}: {children: React.ReactNode}) {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1">
        {children}
      </main>
  
      <Footer/>
    </div>
  )
}

export default layout