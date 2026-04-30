import Link from 'next/link'
import { getAvatarColor, getAvatarInitials } from '@/lib/avatar'

interface Employee {
  id: string
  name: string
  role: string
  department: string
}

export default function EmployeeCard({ employee }: { employee: Employee }) {
  const color = getAvatarColor(employee.id)
  const initials = getAvatarInitials(employee.name)

  return (
    <Link href={`/employee/${employee.id}`} className="employee-card">
      <div className="employee-card-avatar" style={{ backgroundColor: color }}>
        {initials}
      </div>
      <div className="employee-card-info">
        <div className="employee-card-name">{employee.name}</div>
        <div className="employee-card-role">{employee.role}</div>
        <div className="employee-card-dept">{employee.department}</div>
      </div>
      <div className="employee-card-arrow">→</div>
    </Link>
  )
}
