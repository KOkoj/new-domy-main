import { redirect } from 'next/navigation'
import AdminShell from './AdminShell'
import { getAdminAccess } from '@/lib/adminAuth'

export default async function AdminLayout({ children }) {
  const access = await getAdminAccess()

  if (access.reason === 'unauthenticated') {
    redirect('/login?redirect=/admin')
  }

  if (!access.ok) {
    redirect('/')
  }

  return (
    <AdminShell user={access.user} profile={access.profile}>
      {children}
    </AdminShell>
  )
}
