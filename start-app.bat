@echo off
echo 🚀 Démarrage de l'application TGVmax...

REM Vérifier si Node.js est installé
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js n'est pas installé ou n'est pas dans le PATH
    pause
    exit /b 1
)

echo ✅ Node.js détecté

REM Démarrer le serveur en arrière-plan
echo 🔧 Démarrage du serveur...
start "Serveur TGVmax" cmd /k "cd server && npm start"

REM Attendre un peu pour que le serveur démarre
timeout /t 3 /nobreak >nul

REM Démarrer le client
echo 🌐 Démarrage du client...
start "Client TGVmax" cmd /k "cd client && npm start"

echo ✅ Applications démarrées avec succès!
        echo 📱 Client: http://localhost:4001
        echo 🔧 Serveur: http://localhost:4000
echo 💡 Fermez cette fenêtre pour arrêter les applications
pause
