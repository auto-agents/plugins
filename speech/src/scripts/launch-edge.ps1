param([String]$url = 'page:blank') 
Start-Process -FilePath "microsoft-edge:$url" -WindowStyle Minimized
Start-Sleep 1
(Get-Process -Name msedge).MainWindowHandle | ForEach-Object { Set-WindowStyle MINIMIZE $_ }
