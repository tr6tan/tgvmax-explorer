# Protection de la Branche Principale

## Configuration Ruleset

Ce repository utilise un ruleset GitHub pour protéger la branche `main` contre les modifications accidentelles ou non autorisées.

### Règles Actives

#### 🔒 Protection de Base
- **Suppression interdite** : La branche main ne peut pas être supprimée
- **Mise à jour protégée** : Les modifications directes sont restreintes
- **Force push interdit** : Impossible de forcer les push sur main

#### 📋 Pull Requests Requises
- **1 approbation minimum** : Toute PR doit être approuvée avant merge
- **Résolution des conversations** : Tous les commentaires doivent être résolus
- **Approbation du dernier push** : Les nouveaux commits nécessitent une nouvelle approbation
- **Historique linéaire** : Les merges doivent être en mode "squash" ou "rebase"

#### ✅ Vérifications de Qualité
- **Status checks** : Les vérifications de statut doivent passer (si configurées)
- **Workflows requis** : Les workflows GitHub Actions doivent réussir (si configurés)

### Comment Appliquer la Configuration

#### Option 1 : Via l'Interface GitHub
1. Allez dans **Settings** > **Rulesets**
2. Cliquez sur **"Create ruleset"**
3. Copiez le contenu de `.github/rulesets/main-branch-protection.json`
4. Collez-le dans l'éditeur JSON
5. **Important** : Dans l'interface, activez manuellement les règles suivantes :
   - ✅ **Restrict creations** (Créations restreintes)
   - ✅ **Restrict updates** (Mises à jour restreintes) 
   - ✅ **Restrict deletions** (Suppressions restreintes)
   - ✅ **Require linear history** (Historique linéaire requis)
   - ✅ **Require a pull request before merging** (PR requise avant merge)
   - ✅ **Block force pushes** (Force push bloqué)
6. Cliquez sur **"Create"**

#### Option 2 : Via GitHub CLI
```bash
# Se connecter à GitHub (si pas déjà fait)
gh auth login

# Créer le ruleset
gh api repos/tr6tan/tgvmax-explorer/rulesets \
  --method POST \
  --input .github/rulesets/main-branch-protection.json
```

### Workflow de Développement

1. **Créer une branche** depuis `main`
   ```bash
   git checkout -b feature/nouvelle-fonctionnalite
   ```

2. **Développer et commiter**
   ```bash
   git add .
   git commit -m "feat: ajouter nouvelle fonctionnalité"
   ```

3. **Pousser la branche**
   ```bash
   git push origin feature/nouvelle-fonctionnalite
   ```

4. **Créer une Pull Request** sur GitHub

5. **Attendre l'approbation** et la résolution des commentaires

6. **Merger** une fois approuvé

### Exceptions

Les règles peuvent être contournées par :
- Les propriétaires du repository
- Les administrateurs
- Les utilisateurs avec des permissions spéciales

### Personnalisation

Pour modifier les règles :
1. Éditez le fichier `.github/rulesets/main-branch-protection.json`
2. Mettez à jour le ruleset via l'interface GitHub ou GitHub CLI
3. Testez les nouvelles règles sur une branche de test

### Support

En cas de problème avec les règles de protection :
1. Vérifiez les messages d'erreur dans l'interface GitHub
2. Consultez la documentation GitHub sur les rulesets
3. Contactez un administrateur du repository
