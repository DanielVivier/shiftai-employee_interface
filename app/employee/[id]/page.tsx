import { redirect, notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase-server'
import { createAdminClient } from '@/lib/supabase-admin'
import EmployeeView from '@/components/EmployeeView'

interface Props {
  params: Promise<{ id: string }>
}

export default async function EmployeePage({ params }: Props) {
  const { id } = await params

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const adminClient = createAdminClient()

  const { data: employee } = await adminClient
    .from('ai_employees')
    .select('*, clients!inner(email)')
    .eq('id', id)
    .single()

  if (!employee) {
    notFound()
  }

  // Ownership check at page level
  if ((employee.clients as { email: string }).email !== user.email) {
    notFound()
  }

  return <EmployeeView employee={employee} />
}
