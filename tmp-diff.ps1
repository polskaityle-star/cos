function CommonPrefix([string]$a, [string]$b) {
  $lo = 0
  $hi = [Math]::Min($a.Length, $b.Length)
  while ($lo -lt $hi) {
    $mid = [int][Math]::Ceiling(($lo + $hi) / 2.0)
    if ($a.Substring(0, $mid) -ceq $b.Substring(0, $mid)) { $lo = $mid } else { $hi = $mid - 1 }
  }
  return $lo
}

$hist = Join-Path $env:APPDATA 'Code\User\History'
$targets = @{
  '-76ea713f' = 'src/Panel.tsx'
  '3e1074de'  = 'src/App.tsx'
}

foreach ($folder in $targets.Keys) {
  $curPath = $targets[$folder]
  $cur = [System.IO.File]::ReadAllText((Join-Path (Get-Location) $curPath))
  "=== $curPath  (current: $($cur.Length) chars) ==="

  $dir = Join-Path $hist $folder
  $json = [System.IO.File]::ReadAllText((Join-Path $dir 'entries.json')) | ConvertFrom-Json

  $results = foreach ($e in $json.entries) {
    $f = Join-Path $dir ([string]$e.id)
    if (-not (Test-Path -LiteralPath $f)) { continue }
    $txt = [System.IO.File]::ReadAllText($f)
    $cp = CommonPrefix $cur $txt
    [pscustomobject]@{
      Prefix = $cp
      Len    = $txt.Length
      Starts = ($cp -eq $cur.Length)
      Stamp  = [System.DateTimeOffset]::FromUnixTimeMilliseconds([long]$e.timestamp).LocalDateTime.ToString('yyyy-MM-dd HH:mm')
      Id     = $e.id
    }
  }

  $results | Sort-Object Prefix -Descending | Select-Object -First 6 | Format-Table -AutoSize
  ""
}
