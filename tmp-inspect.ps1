$json = Get-Content -Raw -LiteralPath 'data/operations.json' | ConvertFrom-Json
foreach ($carrier in $json.PSObject.Properties.Name) {
  $ops = $json.$carrier
  "CARRIER: $carrier"
  "  schedule: " + ($ops.schedule | Measure-Object).Count
  "  fleet:    " + ($ops.fleet | Measure-Object).Count
  "  workshop: " + ($ops.workshop | Measure-Object).Count
  $photos = @($ops.photos)
  "  photos:   " + $photos.Count + " (non-null: " + (@($photos | Where-Object { $_ }).Count) + ")"
  $i = 0
  foreach ($p in $photos) {
    if ($p) { "    [$i] " + [math]::Round($p.Length / 1KB) + " KB  " + $p.Substring(0, [Math]::Min(30, $p.Length)) }
    $i++
  }
}
