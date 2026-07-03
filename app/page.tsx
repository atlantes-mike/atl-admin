import { redirect } from 'next/navigation'

// Middleware gates auth; authenticated users land on Enterprises.
export default function Home() {
  redirect('/enterprises')
}
