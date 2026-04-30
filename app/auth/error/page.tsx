export default function AuthErrorPage() {
  return (
    <div className="auth-error-page">
      <div className="auth-error-card">
        <h1>Link expired</h1>
        <p>
          This magic link has expired or has already been used.
          Please request a new one.
        </p>
        <a href="/login" className="btn-primary">
          Back to login
        </a>
      </div>
    </div>
  )
}
