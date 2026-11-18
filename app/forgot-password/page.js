import { redirect } from 'next/navigation'

// "Zapomenuté heslo" lives in the sign-in form (modal and /login): it e-mails a
// new generated password, no reset link. Old bookmarks land there.
export default function ForgotPasswordPage() {
  redirect('/login?tab=forgot')
}
