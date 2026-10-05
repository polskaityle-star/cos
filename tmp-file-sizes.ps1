Get-ChildItem -Recurse -File |
  Where-Object { $_.FullName -notmatch '\\node_modules\\|\\\.git\\|\\dist\\' } |
  Sort-Object Length -Descending |
  Select-Object -First 30 |
  ForEach-Object {
    $lines = 0
    if ($_.Length -lt 8MB) { $lines = (Get-Content -LiteralPath $_.FullName | Measure-Object -Line).Lines }
    $rel = $_.FullName.Substring((Get-Location).Path.Length + 1)
    "{0,10:N2} MB  {1,8} lines  {2}" -f ($_.Length / 1MB), $lines, $rel
  }
