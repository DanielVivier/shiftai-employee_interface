export default function SessionExpiredPage() {
  return (
    <div className="auth-error-page">
      <div className="auth-error-card">
        <h1>Session expired</h1>
        <p>Your session has expired. Please log in again.</p>
        <a href="/login" className="btn-primary">
          Log in
        </a>
      </div>
    </div>
  )
}
