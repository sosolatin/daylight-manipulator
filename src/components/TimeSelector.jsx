const TIME_OPTIONS = [
  {
    value: 'dawn',
    label: 'Pre-dawn / Dawn',
    subtitle: '~5:30–7:00am · Lamps still on',
  },
  {
    value: 'dusk',
    label: 'Dusk',
    subtitle: '~30–60 min post-sunset · Transition light',
  },
  {
    value: 'night',
    label: 'Night',
    subtitle: '~9pm–11pm · Full interior lamp glow',
  },
  {
    value: 'overcast',
    label: 'Overcast Day',
    subtitle: 'Flat cool Tasmanian daylight',
  },
]

export default function TimeSelector({ selected, onChange }) {
  return (
    <div>
      <div style={{ fontSize: 12, fontWeight: 500, color: '#8a8a8f', letterSpacing: '0.04em', textTransform: 'uppercase', marginBottom: 10 }}>
        Time of day
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        {TIME_OPTIONS.map(opt => {
          const isSelected = selected === opt.value
          return (
            <button
              key={opt.value}
              onClick={() => onChange(opt.value)}
              onMouseEnter={e => {
                if (!isSelected) {
                  e.currentTarget.style.backgroundColor = '#26272a'
                  e.currentTarget.style.borderColor = '#3c3c3f'
                }
              }}
              onMouseLeave={e => {
                if (!isSelected) {
                  e.currentTarget.style.backgroundColor = 'transparent'
                  e.currentTarget.style.borderColor = '#2f3033'
                }
              }}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-start',
                padding: '10px 12px',
                border: isSelected ? '1px solid #a8c7fa' : '1px solid #2f3033',
                borderRadius: 6,
                backgroundColor: isSelected ? '#1a2236' : 'transparent',
                cursor: 'pointer',
                textAlign: 'left',
                width: '100%',
                fontFamily: 'Inter, sans-serif',
                transition: 'background-color 0.12s, border-color 0.12s',
              }}
            >
              <div style={{ fontSize: 13, fontWeight: 500, color: isSelected ? '#e2e2e5' : '#8a8a8f' }}>
                {opt.label}
              </div>
              <div style={{ fontSize: 11, color: isSelected ? '#8a8a8f' : '#3c3c3f', marginTop: 2 }}>{opt.subtitle}</div>
            </button>
          )
        })}
      </div>
    </div>
  )
}

export { TIME_OPTIONS }
