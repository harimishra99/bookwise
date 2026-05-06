import { Outlet } from 'react-router-dom'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import MobileBottomNav from '@/components/layout/MobileBottomNav'

export default function MainLayout() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#0f0f1a' }}>
      <Navbar />
      <main style={{ flex: 1, paddingTop: '64px', paddingBottom: '60px' }}>
        <Outlet />
      </main>
      <Footer />
      <MobileBottomNav />
    </div>
  )
}