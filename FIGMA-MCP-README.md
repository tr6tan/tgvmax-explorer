# 🎨 Configuration MCP Figma pour TGV-max-app

Ce guide vous explique comment configurer et utiliser le MCP (Model Context Protocol) Figma pour générer automatiquement des composants React à partir de vos designs Figma.

## 📋 Prérequis

1. **Token d'accès Figma** : Obtenez votre token sur [Figma Developers](https://www.figma.com/developers/api#access-tokens)
2. **File Key** : Récupérez la clé de votre fichier Figma depuis l'URL
3. **Node.js** : Version 16 ou supérieure

## 🚀 Installation et Configuration

### 1. Configuration initiale

```bash
npm run figma:setup
```

Cette commande va :
- Créer le dossier `.mcp` avec la configuration
- Générer le fichier `.env.example`
- Configurer la structure nécessaire

### 2. Configuration des tokens

Créez un fichier `.env` à la racine du projet :

```env
FIGMA_ACCESS_TOKEN=your_figma_access_token_here
FIGMA_FILE_KEY=your_figma_file_key_here
```

**Comment obtenir vos tokens :**

#### Access Token Figma
1. Allez sur https://www.figma.com/developers/api#access-tokens
2. Cliquez sur "Create new token"
3. Donnez un nom à votre token
4. Copiez le token généré

#### File Key Figma
1. Ouvrez votre fichier Figma
2. L'URL sera : `https://www.figma.com/file/FILE_KEY/...`
3. Copiez le `FILE_KEY` (la partie après `/file/` et avant le `/`)

### 3. Démarrage du serveur MCP

```bash
npm run figma:start
```

Le serveur MCP Figma sera accessible et prêt à traiter vos requêtes.

## 🎯 Utilisation

### Génération de composants

```bash
npm run figma:generate
```

Cette commande va :
- Récupérer les composants depuis votre fichier Figma
- Générer les composants React TypeScript
- Les sauvegarder dans `client/src/components/figma/`

### Structure des composants générés

Les composants seront générés avec :
- **TypeScript** : Interfaces typées
- **Props dynamiques** : Basées sur les propriétés Figma
- **Tailwind CSS** : Classes CSS prêtes à utiliser
- **Export nommé** : Pour faciliter l'import

### Exemple de composant généré

```tsx
import React from 'react';

interface FigmaButtonProps {
  className?: string;
  children?: React.ReactNode;
  variant?: string;
  size?: string;
  disabled?: boolean;
}

export const FigmaButton: React.FC<FigmaButtonProps> = ({
  className = '',
  children,
  variant,
  size,
  disabled
}) => {
  return (
    <button className={`${className}`}>
      {children}
    </button>
  );
};

export default FigmaButton;
```

## 🔧 Configuration avancée

### Personnalisation des templates

Modifiez `scripts/generate-figma-components.js` pour :
- Changer le préfixe des composants
- Ajouter des styles personnalisés
- Modifier la structure des props

### Intégration avec votre design system

1. **Synchronisation automatique** : Le MCP peut surveiller les changements Figma
2. **Tokens de design** : Récupérez les couleurs, typographies, espacements
3. **Composants variants** : Générez automatiquement les variantes

## 📁 Structure des fichiers

```
TGV-max-app/
├── .mcp/
│   └── config.json          # Configuration MCP
├── scripts/
│   ├── generate-figma-components.js  # Générateur de composants
│   └── start-figma-mcp.js           # Démarreur du serveur MCP
├── client/src/components/figma/      # Composants générés
├── setup-figma-mcp.js               # Script de configuration
└── .env                             # Tokens Figma
```

## 🐛 Dépannage

### Erreur de token
```
❌ Variables d'environnement manquantes: FIGMA_ACCESS_TOKEN
```
**Solution** : Vérifiez votre fichier `.env` et vos tokens

### Erreur de connexion
```
❌ Erreur du serveur MCP: connect ECONNREFUSED
```
**Solution** : Vérifiez que le serveur MCP est démarré avec `npm run figma:start`

### Composants non générés
```
❌ Erreur lors de la génération: Cannot read property 'name' of undefined
```
**Solution** : Vérifiez que votre fichier Figma contient des composants et que les permissions sont correctes

## 🔄 Workflow recommandé

1. **Design** : Créez vos composants dans Figma
2. **Configuration** : Configurez les tokens et le serveur MCP
3. **Génération** : Lancez la génération de composants
4. **Intégration** : Importez et utilisez les composants dans votre app
5. **Itération** : Modifiez dans Figma et régénérez

## 📚 Ressources

- [Documentation MCP](https://modelcontextprotocol.io/)
- [API Figma](https://www.figma.com/developers/api)
- [Figma Design Tokens](https://www.figma.com/developers/api#design-tokens)

---

🎉 **Votre MCP Figma est maintenant configuré !** Vous pouvez commencer à générer des composants React directement depuis vos designs Figma.
