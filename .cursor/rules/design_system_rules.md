# Design System Rules - TGV-max-app

## 🎨 Structure du Design System

### 1. Définitions des Tokens

**Localisation :** `client/src/styles/macos-design-system.css`

```css
:root {
  --macos-background: rgba(255, 255, 255, 0.8);
  --macos-background-secondary: rgba(248, 250, 252, 0.8);
  --macos-border: rgba(226, 232, 240, 0.8);
  --macos-text-primary: #1f2937;
  --macos-text-secondary: #6b7280;
  --macos-accent: #3b82f6;
  --macos-accent-hover: #2563eb;
  --macos-success: #10b981;
  --macos-error: #ef4444;
  --macos-warning: #f59e0b;
}
```

**Format :** CSS Custom Properties (variables CSS)
**Transformation :** Utilisation directe dans les composants

### 2. Bibliothèque de Composants

**Localisation :** `client/src/components/`

**Architecture :**
- Composants fonctionnels React avec TypeScript
- Props typées avec interfaces
- Utilisation de `MacOSCard` comme wrapper de base
- Styles CSS modulaires avec classes BEM

**Structure des composants :**
```typescript
interface ComponentProps {
  variant?: 'default' | 'glass' | 'compact';
  className?: string;
  children?: React.ReactNode;
}

const Component: React.FC<ComponentProps> = ({ variant, className, children }) => {
  return (
    <MacOSCard variant={variant} className={`component-class ${className}`}>
      {children}
    </MacOSCard>
  );
};
```

### 3. Frameworks & Bibliothèques

**UI Framework :** React 18.2.0 avec TypeScript
**Styling :** 
- Tailwind CSS 3.3.0
- CSS Custom Properties
- CSS Modules (optionnel)

**Build System :** Create React App avec React Scripts 5.0.1
**Bundler :** Webpack (via CRA)

### 4. Gestion des Assets

**Images :** `client/public/` et `client/src/assets/`
**Optimisation :** Webpack asset optimization via CRA
**CDN :** Pas de configuration CDN actuelle

### 5. Système d'Icônes

**Bibliothèque :** Lucide React 0.294.0
**Import :** 
```typescript
import { Calendar, Map, Search } from 'lucide-react';
```
**Convention :** PascalCase pour les noms d'icônes

### 6. Approche Styling

**Méthodologie :** 
- Tailwind CSS pour les utilitaires
- CSS Custom Properties pour les tokens
- Classes CSS pour les composants complexes

**Styles globaux :** `client/src/index.css` et `macos-design-system.css`
**Responsive :** Classes Tailwind (sm:, md:, lg:, xl:)

### 7. Structure du Projet

```
client/src/
├── components/          # Composants UI réutilisables
│   ├── MacOSCard.tsx   # Wrapper de base
│   ├── IOSCalendar.tsx # Calendrier iOS 26
│   └── ...
├── styles/             # Styles et design system
│   └── macos-design-system.css
├── types/              # Types TypeScript
└── App.tsx            # Composant racine
```

## 🎯 Règles d'Intégration Figma

### 1. Conversion des Composants

**Pattern de conversion :**
```typescript
// Figma → React Component
const FigmaComponent: React.FC<FigmaComponentProps> = ({ 
  variant = 'default',
  className = '',
  ...props 
}) => {
  return (
    <MacOSCard 
      variant={variant} 
      className={`figma-component ${className}`}
    >
      {/* Contenu du composant */}
    </MacOSCard>
  );
};
```

### 2. Mapping des Styles

**Couleurs Figma → CSS Variables :**
- `#007AFF` → `var(--macos-accent)`
- `#34C759` → `var(--macos-success)`
- `#FF3B30` → `var(--macos-error)`

**Espacements Figma → Tailwind :**
- 4px → `p-1`
- 8px → `p-2`
- 16px → `p-4`
- 24px → `p-6`

**Bordures Figma → CSS :**
- `border-radius: 12px` → `rounded-xl`
- `backdrop-filter: blur(25px)` → Classe personnalisée

### 3. Animations iOS 26

**Keyframes disponibles :**
```css
@keyframes fadeInUp { /* ... */ }
@keyframes slideInRight { /* ... */ }
@keyframes pulse { /* ... */ }
@keyframes bounce { /* ... */ }
```

**Classes d'animation :**
- `.ios-fade-in`
- `.ios-slide-in`
- `.ios-pulse`
- `.ios-bounce`

### 4. Effets Glassmorphism

**Classes disponibles :**
```css
.macos-glass-container
.macos-glass-secondary
.ios-calendar /* Exemple d'application */
```

**Pattern d'application :**
```css
background: rgba(255, 255, 255, 0.9);
backdrop-filter: blur(25px);
-webkit-backdrop-filter: blur(25px);
border: 1px solid rgba(255, 255, 255, 0.3);
```

### 5. Responsive Design

**Breakpoints Tailwind :**
- `sm:` 640px
- `md:` 768px
- `lg:` 1024px
- `xl:` 1280px

**Pattern mobile-first :**
```css
@media (max-width: 768px) {
  .ios-component {
    /* Styles mobiles */
  }
}
```

### 6. Accessibilité

**Support des préférences utilisateur :**
```css
@media (prefers-reduced-motion: reduce) {
  * { animation-duration: 0.01ms !important; }
}

@media (prefers-color-scheme: dark) {
  :root { /* Variables dark mode */ }
}

@media (prefers-contrast: high) {
  /* Styles haute contraste */
}
```

## 🔧 Intégration MCP Figma

### 1. Configuration MCP

**Fichier :** `c:\Users\Tristan\.cursor\mcp.json`
```json
{
  "mcpServers": {
    "Figma": {
      "url": "http://127.0.0.1:3845/mcp"
    }
  }
}
```

### 2. Workflow d'Intégration

1. **Sélectionner** le composant dans Figma
2. **Générer le code** avec `mcp_Figma_get_code`
3. **Adapter** le code selon les règles ci-dessus
4. **Intégrer** dans la structure de composants existante

### 3. Mapping des Propriétés

**Figma Properties → React Props :**
- `variant` → Classes CSS conditionnelles
- `className` → Classes personnalisées
- `children` → Contenu du composant

### 4. Optimisations

**Performance :**
- Utiliser `React.memo()` pour les composants statiques
- Lazy loading pour les composants complexes
- Optimisation des images via Webpack

**Bundle Size :**
- Import sélectif des icônes Lucide
- Tree shaking automatique avec CRA
- CSS purging avec Tailwind

## 📋 Checklist d'Intégration

- [ ] Vérifier la compatibilité avec le design system existant
- [ ] Appliquer les tokens de couleur appropriés
- [ ] Implémenter les animations iOS 26
- [ ] Tester la responsivité
- [ ] Vérifier l'accessibilité
- [ ] Optimiser les performances
- [ ] Documenter le composant

## 🎨 Exemples d'Intégration

### Composant Calendrier iOS 26
```typescript
// Exemple d'intégration réussie
<IOSCalendar 
  variant="glass"
  selectedDate={new Date()}
  onDateSelect={handleDateSelect}
/>
```

### Styles Glassmorphism
```css
.ios-calendar {
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(25px);
  border-radius: 20px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}
```

Ce document sert de référence pour maintenir la cohérence lors de l'intégration de designs Figma dans le projet TGV-max-app.
