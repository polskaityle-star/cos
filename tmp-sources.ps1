"--- dist bundle mtime ---"
Get-ChildItem dist\assets -File | ForEach-Object { "{0}  {1,10:N0} B  {2}" -f $_.LastWriteTime.ToString('yyyy-MM-dd HH:mm'), $_.Length, $_.Name }

"`n--- VSCode Backups (hot exit) ---"
$bk = Join-Path $env:APPDATA 'Code\Backups'
"exists: " + (Test-Path $bk)
if (Test-Path $bk) { Get-ChildItem -Recurse -File $bk -ErrorAction SilentlyContinue | ForEach-Object { "{0}  {1,10:N0} B  {2}" -f $_.LastWriteTime.ToString('yyyy-MM-dd HH:mm'), $_.Length, $_.FullName } }

"`n--- other copies of App.tsx / Panel.tsx under user profile ---"
$roots = @("$env:USERPROFILE\Documents", "$env:USERPROFILE\Desktop", "$env:USERPROFILE\Downloads", "$env:APPDATA\Code", "$env:LOCALAPPDATA\Temp")
foreach ($r in $roots) {
  if (-not (Test-Path $r)) { continue }
  Get-ChildItem -Path $r -Recurse -File -Include 'App.tsx','Panel.tsx','App.tsx.bak','Panel.tsx.bak' -ErrorAction SilentlyContinue |
    Where-Object { $_.FullName -notmatch '\\node_modules\\' } |
    ForEach-Object { "{0}  {1,10:N0} B  {2}" -f $_.LastWriteTime.ToString('yyyy-MM-dd HH:mm'), $_.Length, $_.FullName }
}

"`n--- project: any backup-ish files ---"
Get-ChildItem -Recurse -File . -ErrorAction SilentlyContinue |
  Where-Object { $_.FullName -notmatch '\\node_modules\\' -and $_.Name -match '\.(bak|orig|old|save|tmp)$' } |
  ForEach-Object { "{0}  {1,10:N0} B  {2}" -f $_.LastWriteTime.ToString('yyyy-MM-dd HH:mm'), $_.Length, $_.FullName.Substring((Get-Location).Path.Length + 1) }
