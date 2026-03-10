export default function RightColumn({ children }) {
  return (
    <main
      style={{
        flex: 1,
        overflowY: 'auto',
        backgroundColor: '#131315',
        height: '100vh',
      }}
    >
      {children}
    </main>
  )
}
