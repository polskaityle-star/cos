"--- .github ---"
Get-ChildItem -Recurse -Force .github -ErrorAction SilentlyContinue | ForEach-Object { $_.FullName.Substring((Get-Location).Path.Length + 1) }

"`n--- git? ---"
"git dir exists: " + (Test-Path '.git')

"`n--- dist (top) ---"
Get-ChildItem -Recurse -File dist -ErrorAction SilentlyContinue | ForEach-Object { "{0,10:N0} B  {1}" -f $_.Length, $_.FullName.Substring((Get-Location).Path.Length + 1) }

"`n--- VSCode local history dirs ---"
foreach ($dir in @(
  "$env:APPDATA\Code\User\History",
  "$env:APPDATA\Code - Insiders\User\History",
  "$env:APPDATA\Cursor\User\History",
  "$env:APPDATA\Windsurf\User\History"
)) {
  "{0} -> {1}" -f $dir, (Test-Path $dir)
}

"`n--- Documents on OneDrive? ---"
"OneDrive env: " + $env:OneDrive
"User profile Documents: " + [Environment]::GetFolderPath('MyDocuments')
