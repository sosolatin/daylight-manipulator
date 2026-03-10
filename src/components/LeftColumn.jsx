export default function LeftColumn({ children }) {
  return (
    <aside
      style={{
        width: '30%',
        flexShrink: 0,
        borderRight: '1px solid #2f3033',
        backgroundColor: '#1e1f21',
        height: '100vh',
        position: 'sticky',
        top: 0,
        display: 'flex',
        flexDirection: 'column',
        gap: 24,
        padding: 24,
        overflowY: 'auto',
      }}
    >
      <div style={{ marginBottom: 4 }}>
        <h1 style={{ fontSize: 13, fontWeight: 500, color: '#e2e2e5', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
          Saffire Freycinet
        </h1>
        <p style={{ fontSize: 12, color: '#55555a', marginTop: 3 }}>Daylight Converter</p>
      </div>
      {children}
    </aside>
  )
}
