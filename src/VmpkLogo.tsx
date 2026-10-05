type VmpkLogoProps = { className: string; compact?: boolean }

function VmpkLogo({ className, compact = false }: VmpkLogoProps) {
  return (
    <svg className={className} viewBox={compact ? '0 20 214 180' : '0 0 730 220'} role="img" aria-label="Logo VMPK Kielce" xmlns="http://www.w3.org/2000/svg">
      <rect className="vmpk-bus-body" x="42" y="34" width="148" height="146" rx="22" strokeWidth="5" />
      <rect className="vmpk-bus-window" x="57" y="50" width="118" height="59" rx="10" strokeWidth="4" />
      <path className="vmpk-bus-divider" d="M116 52v55" fill="none" strokeWidth="4" />
      <rect className="vmpk-bus-grille" x="82" y="122" width="68" height="31" rx="6" strokeWidth="3" />
      <path className="vmpk-bus-grille-lines" d="M91 132h50M91 143h50" fill="none" strokeWidth="3" strokeLinecap="round" />
      <circle className="vmpk-bus-lamp" cx="60" cy="129" r="8" strokeWidth="3" />
      <circle className="vmpk-bus-lamp" cx="172" cy="129" r="8" strokeWidth="3" />
      <path className="vmpk-bus-bumper" d="M61 165h110" fill="none" strokeWidth="6" strokeLinecap="round" />
      <circle className="vmpk-bus-wheel" cx="65" cy="181" r="8" />
      <circle className="vmpk-bus-wheel" cx="167" cy="181" r="8" />
      <text className="vmpk-wordmark" x="228" y="122" fontFamily="Arial,Helvetica,sans-serif" fontSize="100" fontWeight="800" letterSpacing="2">VMPK</text>
      <text className="vmpk-city" x="237" y="166" fontFamily="Arial,Helvetica,sans-serif" fontSize="27" fontWeight="700" letterSpacing="8">KIELCE</text>
      <path d="M237 185h326" stroke="#f0bd18" strokeWidth="5" strokeLinecap="round" />
    </svg>
  )
}

export default VmpkLogo