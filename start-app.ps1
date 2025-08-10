# start-app.ps1
# Script PowerShell pour démarrer les applications TGVmax
# Client sur le port 4001, Server sur le port 4000

Write-Host "🚀 Démarrage des applications TGVmax..." -ForegroundColor Green

# Vérifier si les processus Node.js sont déjà en cours
$nodeProcesses = Get-Process -Name "node" -ErrorAction SilentlyContinue
if ($nodeProcesses) {
    Write-Host "⚠️ Des processus Node.js sont déjà en cours. Arrêt..." -ForegroundColor Yellow
    Stop-Process -Name "node" -Force -ErrorAction SilentlyContinue
    Start-Sleep -Seconds 2
}

# Démarrer le serveur
Write-Host "📡 Démarrage du serveur sur le port 4000..." -ForegroundColor Yellow
$serverProcess = Start-Process -FilePath "powershell" -ArgumentList "-NoExit", "-Command", "cd server; npm start" -WindowStyle Normal -PassThru

# Attendre que le serveur démarre
Start-Sleep -Seconds 5

# Démarrer le client
Write-Host "🖥️ Démarrage du client sur le port 4001..." -ForegroundColor Yellow
$clientProcess = Start-Process -FilePath "powershell" -ArgumentList "-NoExit", "-Command", "cd client; npm start" -WindowStyle Normal -PassThru

Write-Host "✅ Applications démarrées !" -ForegroundColor Green
Write-Host "📡 Serveur: http://localhost:4000" -ForegroundColor Cyan
Write-Host "🖥️ Client: http://localhost:4001" -ForegroundColor Cyan
Write-Host "⚠️ Appuyez sur Ctrl+C pour arrêter les applications" -ForegroundColor Red

# Garder la fenêtre ouverte et permettre l'arrêt propre
try {
    while ($true) {
        Start-Sleep -Seconds 1
        if (-not $serverProcess.HasExited -and -not $clientProcess.HasExited) {
            continue
        }
        break
    }
} catch {
    Write-Host "`n🛑 Arrêt des applications..." -ForegroundColor Yellow
    if (-not $serverProcess.HasExited) { Stop-Process -Id $serverProcess.Id -Force }
    if (-not $clientProcess.HasExited) { Stop-Process -Id $clientProcess.Id -Force }
}

Write-Host "✅ Applications arrêtées." -ForegroundColor Green
