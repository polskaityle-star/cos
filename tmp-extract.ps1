$tasksDir = "$env:APPDATA\Code\User\globalStorage\sixth.sixth-ai\tasks"
"--- tasks ---"
Get-ChildItem -Recurse -File $tasksDir -ErrorAction SilentlyContinue | ForEach-Object {
  "{0}  {1,10:N0} B  {2}" -f $_.LastWriteTime.ToString('yyyy-MM-dd HH:mm'), $_.Length, $_.FullName.Substring($tasksDir.Length + 1)
}

"`n--- markers in 1791196746590/api_conversation_history.json ---"
$p = Join-Path $tasksDir '1791196746590\api_conversation_history.json'
$raw = [System.IO.File]::ReadAllText($p)
"chars=$($raw.Length)"

foreach ($m in @('export default Panel', 'src/Panel.tsx', 'src\\/Panel.tsx', 'export default App', 'src/App.tsx', 'src\\/App.tsx', 'setSelectedScheduleBrigade')) {
  $idx = 0
  $positions = @()
  while (($idx = $raw.IndexOf($m, $idx)) -ge 0) { $positions += $idx; $idx += $m.Length }
  "{0,-32} count={1,-4} at {2}" -f $m, $positions.Count, (($positions | Select-Object -First 12) -join ', ')
}
