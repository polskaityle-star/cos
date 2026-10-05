$needle = 'setSelectedScheduleBrigade'
$roots = @(
  "$env:APPDATA\Code\User\workspaceStorage",
  "$env:APPDATA\Code\User\globalStorage",
  "$env:APPDATA\Code\User\History",
  "$env:APPDATA\Code\Backups",
  "$env:APPDATA\Code\User"
)

"Searching for: $needle`n"

foreach ($root in $roots) {
  if (-not (Test-Path $root)) { continue }
  Get-ChildItem -Path $root -Recurse -File -ErrorAction SilentlyContinue |
    Where-Object { $_.Length -gt 300 -and $_.Length -lt 80MB } |
    ForEach-Object {
      try {
        $txt = [System.IO.File]::ReadAllText($_.FullName)
        if ($txt.Contains($needle)) {
          "{0,12:N0} B  {1}" -f $_.Length, $_.FullName
        }
      } catch { }
    }
}
"`nDone."
