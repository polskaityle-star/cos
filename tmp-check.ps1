"--- current state ---"
Get-ChildItem src\App.tsx, src\Panel.tsx | ForEach-Object {
  $len = ([System.IO.File]::ReadAllText($_.FullName)).Length
  "{0}  {1,8:N0} chars  {2}" -f $_.LastWriteTime.ToString('yyyy-MM-dd HH:mm:ss.fff'), $len, $_.Name
}

"`n--- dist bundle: first 700 chars ---"
$js = [System.IO.File]::ReadAllText((Join-Path (Get-Location) 'dist\assets\index-BeD6x1T5.js'))
$js.Substring(0, [Math]::Min(700, $js.Length))

"`n--- dist bundle: is it pretty-printed? newline count ---"
"newlines: " + (($js -split "`n").Count)
"total chars: " + $js.Length
