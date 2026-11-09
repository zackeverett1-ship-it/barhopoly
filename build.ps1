# Builds public/index.html from crawl-board.html (the game page, also used for the Claude version).
# Run this after changing crawl-board.html, then commit and push:  powershell -File build.ps1
$root = $PSScriptRoot
$head = @'
<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<style>:root{color-scheme:light;padding-top:env(safe-area-inset-top,0px);padding-bottom:env(safe-area-inset-bottom,0px)}body{margin:0;font:14px/1.4 system-ui,sans-serif}img{max-width:100%}[hidden]{display:none!important}</style>
<script src="/standalone.js"></script>

'@
$game = [System.IO.File]::ReadAllText((Join-Path $root "crawl-board.html"))
$out = $head + $game + "`n</html>`n"
[System.IO.File]::WriteAllText((Join-Path $root "public\index.html"), $out, (New-Object System.Text.UTF8Encoding $false))
Write-Output "Built public/index.html ($([math]::Round($out.Length / 1024)) KB)"
