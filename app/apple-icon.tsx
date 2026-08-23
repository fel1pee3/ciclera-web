import { ImageResponse } from 'next/og'

export const size = { width: 180, height: 180 }
export const contentType = 'image/png'

export default function AppleIcon() {
  return new ImageResponse(
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 36,
        background: '#F3F8F6',
      }}
    >
      <svg
        aria-hidden="true"
        width="122"
        height="122"
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
    </div>,
    size,
  )
}
