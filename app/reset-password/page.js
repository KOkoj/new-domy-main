import { redirect } from 'next/navigation'

// Reset links are no longer sent: "Zapomenuté heslo" e-mails a new generated
// password and the password is changed in Nastavení účtu. Old links from
// earlier e-mails land on the forgotten-password form.
export default function ResetPasswordPage() {
  redirect('/login?tab=forgot')
}
