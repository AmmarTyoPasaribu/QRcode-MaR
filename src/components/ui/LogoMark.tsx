/** Brand mark: three QR finder eyes with a pine growing in the fourth corner. */
export default function LogoMark({ size = 36 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id="lm-bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#2f6b47" />
          <stop offset="1" stopColor="#163826" />
        </linearGradient>
      </defs>
      <rect width="48" height="48" rx="13" fill="url(#lm-bg)" />
      <g fill="none" stroke="#f4efdc" strokeWidth="3.2">
        <rect x="8" y="8" width="12" height="12" rx="3.5" />
        <rect x="28" y="8" width="12" height="12" rx="3.5" />
        <rect x="8" y="28" width="12" height="12" rx="3.5" />
      </g>
      <g fill="#f4efdc">
        <rect x="12.2" y="12.2" width="3.6" height="3.6" rx="1" />
        <rect x="32.2" y="12.2" width="3.6" height="3.6" rx="1" />
        <rect x="12.2" y="32.2" width="3.6" height="3.6" rx="1" />
      </g>
      <path d="M34 25.5l4.6 5.4h-2.4l3.6 4.4h-2.6l3.6 4.4H27.2l3.6-4.4h-2.6l3.6-4.4h-2.4z" fill="#e7c76a" />
      <rect x="33.1" y="39.6" width="1.8" height="2.6" rx=".6" fill="#e7c76a" />
    </svg>
  );
}
