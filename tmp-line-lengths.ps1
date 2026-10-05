$files = Get-ChildItem -Recurse -File -Include *.ts,*.tsx,*.css,*.cjs,*.json,*.html |
  Where-Object { $_.FullName -notmatch '\\node_modules\\|\\\.git\\|\\dist\\|package-lock' }

$rows = foreach ($f in $files) {
  $content = [System.IO.File]::ReadAllText($f.FullName)
  $lines = $content -split "`n"
  $longest = 0
  $lineNo = 0
  $i = 0
  foreach ($l in $lines) {
    $i++
    if ($l.Length -gt $longest) { $longest = $l.Length; $lineNo = $i }
  }
  [pscustomobject]@{
    Longest = $longest
    Line    = $lineNo
    Count   = $lines.Count
    KB      = [math]::Round($f.Length / 1KB, 1)
    Path    = $f.FullName.Substring((Get-Location).Path.Length + 1)
  }
}

$rows | Sort-Object Longest -Descending | Select-Object -First 30 | Format-Table -AutoSize
