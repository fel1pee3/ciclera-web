import { ImageResponse } from 'next/og'

export const socialImageSize = {
  width: 1200,
  height: 630,
}

function CicleraMark() {
  return (
    <svg
      aria-hidden="true"
      width="64"
      height="64"
      viewBox="0 0 64 64"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M29 9A23 23 0 0 0 29 55"
        fill="none"
        stroke="#075355"
        strokeWidth="10"
      />
      <path
        d="M35 9A23 23 0 0 1 52 19"
        fill="none"
        stroke="#009C8C"
        strokeWidth="10"
        strokeLinecap="round"
      />
      <path
        d="M52 45A23 23 0 0 1 35 55"
        fill="none"
        stroke="#009C8C"
        strokeWidth="10"
        strokeLinecap="round"
      />
    </svg>
  )
}

export function createSocialImage() {
  const stages = ['Planejar', 'Executar', 'Revisar', 'Faturar']

  return new ImageResponse(
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        position: 'relative',
        overflow: 'hidden',
        background: '#F3F8F6',
        color: '#102323',
        padding: '62px 68px',
        fontFamily: 'Arial, sans-serif',
      }}
    >
      <div
        style={{
          position: 'absolute',
          width: 430,
          height: 430,
          borderRadius: 999,
          border: '2px solid rgba(0, 156, 140, 0.13)',
          right: -120,
          top: -170,
          display: 'flex',
        }}
      />
      <div
        style={{
          position: 'absolute',
          width: 250,
          height: 250,
          borderRadius: 999,
          background: 'rgba(0, 156, 140, 0.07)',
          right: 180,
          bottom: -140,
          display: 'flex',
        }}
      />

      <div
        style={{
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 18,
          }}
        >
          <CicleraMark />
          <span style={{ fontSize: 36, fontWeight: 700, letterSpacing: -1 }}>
            Ciclera
          </span>
          <span
            style={{
              marginLeft: 'auto',
              border: '1px solid #CFE2DD',
              borderRadius: 999,
              background: '#FFFFFF',
              color: '#46605D',
              padding: '12px 20px',
              fontSize: 18,
            }}
          >
            ciclera.online
          </span>
        </div>

        <div
          style={{
            maxWidth: 900,
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <span
            style={{
              color: '#008B7C',
              fontSize: 18,
              fontWeight: 700,
              letterSpacing: 3,
              textTransform: 'uppercase',
            }}
          >
            Gestão de ordens de serviço
          </span>
          <span
            style={{
              marginTop: 18,
              fontSize: 58,
              lineHeight: 1.08,
              letterSpacing: -2.5,
              fontWeight: 750,
            }}
          >
            Do chamado ao caixa, cada etapa sob controle.
          </span>
          <span
            style={{
              marginTop: 20,
              maxWidth: 900,
              color: '#506562',
              fontSize: 23,
              lineHeight: 1.45,
            }}
          >
            Equipe, agenda, execução em campo, fotos, revisão e faturamento em
            um único sistema.
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {stages.map((stage, index) => (
            <div
              key={stage}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                borderRadius: 16,
                background: index === stages.length - 1 ? '#075355' : '#FFFFFF',
                border: '1px solid #D4E4E0',
                color: index === stages.length - 1 ? '#FFFFFF' : '#253D3A',
                padding: '13px 17px',
                fontSize: 17,
                fontWeight: 700,
              }}
            >
              <span
                style={{
                  display: 'flex',
                  color: index === stages.length - 1 ? '#B7F34A' : '#009C8C',
                  fontSize: 14,
                }}
              >
                0{index + 1}
              </span>
              {stage}
            </div>
          ))}
        </div>
      </div>
    </div>,
    socialImageSize,
  )
}
