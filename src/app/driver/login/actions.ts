
'use server'
 
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
 
export async function login(formData: FormData) {
  const busId = formData.get('busId') as string
  const password = formData.get('password') as string
 
  // Manual check for 'admin' and 'password'
  if ((busId && busId.length > 3) || (busId === 'admin' && password === 'password')) {
    cookies().set('busId', busId)
    if (busId === 'admin') {
      redirect('/map')
    } else {
      redirect('/driver/dashboard')
    }
  } else {
    redirect('/driver/login?error=InvalidCredentials')
  }
}

    