export default function ConvertButton({ onClick, disabled, loading }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      style={{
        width: '100%',
        height: 44,
        borderRadius: 6,
        border: 'none',
        cursor: disabled || loading ? 'default' : 'pointer',
        backgroundColor: disabled || loading ? '#1e1f21' : '#a8c7fa',
        color: disabled || loading ? '#3c3c3f' : '#0d1117',
        fontSize: 13,
        fontWeight: 500,
        letterSpacing: '0.02em',
        fontFamily: 'Inter, sans-serif',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        transition: 'opacity 0.15s, background-color 0.15s',
      }}
      onMouseEnter={e => { if (!disabled && !loading) e.currentTarget.style.opacity = '0.8' }}
      onMouseLeave={e => { if (!disabled && !loading) e.currentTarget.style.opacity = '1' }}
    >
      {loading && <Spinner />}
      {loading ? 'Generating…' : 'Convert'}
    </button>
  )
}

function Spinner() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      style={{ animation: 'spin 0.8s linear infinite' }}
    >
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
    </svg>
  )
}
