foreach ($p in @('src/App.tsx', 'src/Panel.tsx', 'src/main.tsx')) {
  $raw = [System.IO.File]::ReadAllText((Join-Path (Get-Location) $p))
  $tailLen = [Math]::Min(260, $raw.Length)
  $tail = $raw.Substring($raw.Length - $tailLen)
  "===== $p  ($($raw.Length) chars) ====="
  $tail
  "===== END ====="
  ""
}
