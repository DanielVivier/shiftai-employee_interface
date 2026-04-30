import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase-server'
import { createAdminClient } from '@/lib/supabase-admin'
import EmployeeCard from '@/components/EmployeeCard'

export default async function HomePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const adminClient = createAdminClient()

  // Get this client's employees via their email
  const { data: employees } = await adminClient
    .from('ai_employees')
    .select('*, clients!inner(email)')
    .eq('clients.email', user.email)
    .order('created_at', { ascending: true })

  return (
    <div className="home-page">
      <header className="home-header">
        <div className="home-header-inner">
          <span className="home-logo">ShiftAI</span>
          <span className="home-subtitle">Your AI Employee Team</span>
        </div>
      </header>

      <main className="home-main">
        {!employees || employees.length === 0 ? (
          <div className="empty-state">
            <p>Your AI employees are being configured.</p>
            <p className="empty-hint">Contact your ShiftAI account manager to get started.</p>
          </div>
        ) : (
          <div className="employee-grid">
            {employees.map((employee) => (
              <EmployeeCard key={employee.id} employee={employee} />
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
