"--- ROOT (incl. hidden) ---"
Get-ChildItem -Force | ForEach-Object { "{0} {1}" -f $(if ($_.PSIsContainer) { 'DIR ' } else { 'FILE' }), $_.Name }

"`n--- src (recursive) ---"
Get-ChildItem -Recurse -File src | ForEach-Object {
  $rel = $_.FullName.Substring((Get-Location).Path.Length + 1)
  $lines = ([System.IO.File]::ReadAllText($_.FullName) -split "`n").Count
  "{0,8} lines {1,8:N1} KB  {2}" -f $lines, ($_.Length / 1KB), $rel
}
