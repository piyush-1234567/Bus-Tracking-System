
import { redirect } from 'next/navigation';

export default function RegisterPage() {
  // Registration is no longer needed for general users, so we redirect.
  redirect('/driver/login');
}

    