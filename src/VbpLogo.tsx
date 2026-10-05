type VbpLogoProps = { className: string; compact?: boolean }

function VbpLogo({ className, compact = false }: VbpLogoProps) {
  return (
    <svg className={className} viewBox={compact ? '0 10 214 185' : '0 0 720 225'} role="img" aria-label="Logo VBP Tour Regio Kielce" xmlns="http://www.w3.org/2000/svg">
      <rect className="vbp-bus-body" x="42" y="34" width="148" height="146" rx="22" strokeWidth="5" />
      <rect className="vbp-bus-window" x="57" y="50" width="118" height="59" rx="10" strokeWidth="4" />
      <path className="vbp-bus-divider" d="M116 52v55" fill="none" strokeWidth="4" />
      <rect className="vbp-bus-grille" x="82" y="122" width="68" height="31" rx="6" strokeWidth="3" />
      <path className="vbp-bus-grille-lines" d="M91 132h50M91 143h50" fill="none" strokeWidth="3" strokeLinecap="round" />
      <circle className="vbp-bus-lamp" cx="60" cy="129" r="8" strokeWidth="3" />
      <circle className="vbp-bus-lamp" cx="172" cy="129" r="8" strokeWidth="3" />
      <path className="vbp-bus-bumper" d="M61 165h110" fill="none" strokeWidth="6" strokeLinecap="round" />
      <circle className="vbp-bus-wheel" cx="65" cy="181" r="8" />
      <circle className="vbp-bus-wheel" cx="167" cy="181" r="8" />
      <path d="M222 24v184" stroke="#9ab8ca" strokeWidth="3" />
      <text className="vbp-logo-name" x="263" y="101" fill="#214f70" fontFamily="Arial,Helvetica,sans-serif" fontSize="82" fontWeight="800" letterSpacing="3">VBP</text>
      <text x="268" y="145" fill="#3686ad" fontFamily="Arial,Helvetica,sans-serif" fontSize="31" fontWeight="700" letterSpacing="5">TOUR REGIO</text>
      <text className="vbp-logo-location" x="270" y="190" fontFamily="Arial,Helvetica,sans-serif" fontSize="21" fontWeight="700" letterSpacing="7">KIELCE</text>
      <path d="M268 207h271" stroke="#27a9cc" strokeWidth="4" strokeLinecap="round" />
    </svg>
  )
}

export default VbpLogo