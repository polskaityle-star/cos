"--- src state ---"
Get-ChildItem src\App.tsx, src\Panel.tsx | ForEach-Object {
  $raw = [System.IO.File]::ReadAllText($_.FullName)
  "{0}  {1,8:N0} chars  {2}" -f $_.LastWriteTime.ToString('yyyy-MM-dd HH:mm:ss.fff'), $raw.Length, $_.Name
  "   tail: " + $raw.Substring([Math]::Max(0, $raw.Length - 90)).Replace("`r", '').Replace("`n", ' | ')
}

"`n--- task_metadata.json ---"
$tasksDir = "$env:APPDATA\Code\User\globalStorage\sixth.sixth-ai\tasks"
Get-Content -Raw (Join-Path $tasksDir '1791196746590\task_metadata.json')

"`n--- context @361400 (export default Panel) ---"
$raw = [System.IO.File]::ReadAllText((Join-Path $tasksDir '1791196746590\api_conversation_history.json'))
$raw.Substring(361300, 1200)
