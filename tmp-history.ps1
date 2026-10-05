$hist = Join-Path $env:APPDATA 'Code\User\History'
"Scanning: $hist`n"

Get-ChildItem -Path $hist -Directory -ErrorAction SilentlyContinue | ForEach-Object {
  $dir = $_
  $entriesFile = Join-Path $dir.FullName 'entries.json'
  if (-not (Test-Path -LiteralPath $entriesFile)) { return }

  $raw = [System.IO.File]::ReadAllText($entriesFile)
  $json = $raw | ConvertFrom-Json
  $res = [string]$json.resource
  if ($res -notmatch 'vztm-kielce') { return }
  if ($res -notmatch 'App\.tsx' -and $res -notmatch 'Panel\.tsx') { return }

  "FOLDER  $($dir.Name)"
  "  resource: $res"
  foreach ($e in $json.entries) {
    $file = Join-Path $dir.FullName ([string]$e.id)
    if (Test-Path -LiteralPath $file) {
      $len = (Get-Item -LiteralPath $file).Length
      $stamp = [System.DateTimeOffset]::FromUnixTimeMilliseconds([long]$e.timestamp).LocalDateTime.ToString('yyyy-MM-dd HH:mm:ss')
      "    {0}  {1,10:N0} B  {2}" -f $stamp, $len, $e.id
    }
  }
  ""
}
