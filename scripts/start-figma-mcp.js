const { spawn } = require('child_process');
const path = require('path');
require('dotenv').config();

console.log('🚀 Démarrage du serveur MCP Figma...');

// Vérifier les variables d'environnement
const requiredEnvVars = ['FIGMA_ACCESS_TOKEN', 'FIGMA_FILE_KEY'];
const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingVars.length > 0) {
  console.error('❌ Variables d\'environnement manquantes:');
  missingVars.forEach(varName => {
    console.error(`   - ${varName}`);
  });
  console.log('\n📋 Pour configurer :');
  console.log('1. Créez un fichier .env à la racine du projet');
  console.log('2. Ajoutez vos tokens Figma :');
  console.log('   FIGMA_ACCESS_TOKEN=your_token_here');
  console.log('   FIGMA_FILE_KEY=your_file_key_here');
  process.exit(1);
}

// Configuration du serveur MCP
const mcpConfig = {
  command: 'npx',
  args: ['@modelcontextprotocol/server-figma'],
  env: {
    ...process.env,
    FIGMA_ACCESS_TOKEN: process.env.FIGMA_ACCESS_TOKEN,
    FIGMA_FILE_KEY: process.env.FIGMA_FILE_KEY
  },
  stdio: 'inherit'
};

// Démarrer le serveur MCP
const mcpProcess = spawn(mcpConfig.command, mcpConfig.args, {
  env: mcpConfig.env,
  stdio: mcpConfig.stdio
});

console.log('✅ Serveur MCP Figma démarré');
console.log('📡 En attente de connexions...');

// Gestion des événements du processus
mcpProcess.on('error', (error) => {
  console.error('❌ Erreur du serveur MCP:', error);
});

mcpProcess.on('close', (code) => {
  console.log(`🔚 Serveur MCP fermé avec le code: ${code}`);
});

// Gestion de l'arrêt propre
process.on('SIGINT', () => {
  console.log('\n🛑 Arrêt du serveur MCP...');
  mcpProcess.kill('SIGINT');
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Arrêt du serveur MCP...');
  mcpProcess.kill('SIGTERM');
});
