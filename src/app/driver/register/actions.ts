
'use server'
 
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
 
export async function register(formData: FormData) {
  const busId = formData.get('busId') as string
  const password = formData.get('password') as string
 
  if (busId && password) {
    cookies().set('busId', busId)
    redirect('/driver/dashboard')
  } else {
    redirect('/driver/register?error=InvalidData')
  }
}
