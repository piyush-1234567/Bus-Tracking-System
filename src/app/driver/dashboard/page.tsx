import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import DriverDashboard from '@/components/driver/driver-dashboard'

export default function DriverDashboardPage() {
  const cookieStore = cookies()
  const busId = cookieStore.get('busId')?.value

  if (!busId) {
    redirect('/driver/login')
  }

  return <DriverDashboard busId={busId} />
}
