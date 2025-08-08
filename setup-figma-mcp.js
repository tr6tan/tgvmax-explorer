const fs = require('fs');
const path = require('path');

console.log('🔧 Configuration du MCP Figma pour TGV-max-app...');

// Créer le dossier .mcp s'il n'existe pas
const mcpDir = path.join(__dirname, '.mcp');
if (!fs.existsSync(mcpDir)) {
  fs.mkdirSync(mcpDir, { recursive: true });
  console.log('✅ Dossier .mcp créé');
}

// Créer le fichier de configuration MCP
const mcpConfig = {
  "mcpServers": {
    "figma": {
      "command": "npx",
      "args": ["@modelcontextprotocol/server-figma"],
      "env": {
        "FIGMA_ACCESS_TOKEN": process.env.FIGMA_ACCESS_TOKEN || "YOUR_FIGMA_ACCESS_TOKEN",
        "FIGMA_FILE_KEY": process.env.FIGMA_FILE_KEY || "YOUR_FIGMA_FILE_KEY"
      }
    }
  }
};

const configPath = path.join(__dirname, '.mcp', 'config.json');
fs.writeFileSync(configPath, JSON.stringify(mcpConfig, null, 2));
console.log('✅ Configuration MCP créée dans .mcp/config.json');

// Créer un fichier .env.example
const envExample = `# Configuration Figma MCP
FIGMA_ACCESS_TOKEN=your_figma_access_token_here
FIGMA_FILE_KEY=your_figma_file_key_here

# Pour obtenir votre access token :
# 1. Allez sur https://www.figma.com/developers/api#access-tokens
# 2. Créez un nouveau token
# 3. Copiez le token ici

# Pour obtenir votre file key :
# 1. Ouvrez votre fichier Figma
# 2. L'URL sera : https://www.figma.com/file/FILE_KEY/...
# 3. Copiez le FILE_KEY ici
`;

fs.writeFileSync(path.join(__dirname, '.env.example'), envExample);
console.log('✅ Fichier .env.example créé');

console.log('\n📋 Prochaines étapes :');
console.log('1. Créez un fichier .env avec vos tokens Figma');
console.log('2. Obtenez votre access token sur https://www.figma.com/developers/api#access-tokens');
console.log('3. Récupérez votre file key depuis l\'URL de votre fichier Figma');
console.log('4. Lancez le serveur MCP avec : npx @modelcontextprotocol/server-figma');
