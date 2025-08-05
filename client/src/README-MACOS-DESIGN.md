# 🍎 Design Système macOS - TGVmax Explorer

## 🎨 **Vue d'ensemble**

Le design système macOS a été implémenté pour créer une interface moderne et élégante inspirée des principes de design d'Apple. Il inclut des effets de verre, des contrôles teintés, des badges et une navigation fluide.

## 🎯 **Composants Principaux**

### ✅ **Effets de Verre (Glass Effects)**

```css
.macos-glass {
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}
```

**Utilisation :**
- Conteneurs principaux
- Cards avec effet de verre
- Toolbars avec transparence

### ✅ **Boutons avec Niveaux de Prominence**

```typescript
<MacOSButton variant="primary" size="large">
  Rechercher
</MacOSButton>

<MacOSButton variant="secondary">
  Annuler
</MacOSButton>

<MacOSButton variant="tertiary">
  Plus d'options
</MacOSButton>
```

**Variantes :**
- `primary` : Bouton principal avec accent color
- `secondary` : Bouton secondaire avec bordure
- `tertiary` : Bouton tertiaire transparent

### ✅ **Badges**

```typescript
<MacOSBadge variant="count" size="large">
  2
</MacOSBadge>

<MacOSBadge variant="text">
  Nouveau
</MacOSBadge>

<MacOSBadge variant="indicator">
  ⚠️
</MacOSBadge>
```

**Types :**
- `count` : Badge numérique (bleu)
- `text` : Badge texte (vert)
- `indicator` : Badge indicateur (orange)

### ✅ **Cards avec Effet de Verre**

```typescript
<MacOSCard variant="glass" hover>
  Contenu de la card
</MacOSCard>

<MacOSCard variant="glass-secondary">
  Card secondaire
</MacOSCard>
```

**Variantes :**
- `glass` : Effet de verre principal
- `glass-secondary` : Effet de verre secondaire
- `hover` : Animation au survol

## 🎨 **Palette de Couleurs**

### **Couleurs d'Accent**
```css
--macos-accent: #007AFF;        /* Bleu principal */
--macos-accent-secondary: #5856D6; /* Violet */
--macos-success: #34C759;       /* Vert */
--macos-warning: #FF9500;       /* Orange */
--macos-error: #FF3B30;         /* Rouge */
```

### **Couleurs de Fond**
```css
--macos-background: #F5F5F7;    /* Fond principal */
--macos-secondary-background: #FFFFFF; /* Fond secondaire */
--macos-tertiary-background: #F2F2F7; /* Fond tertiaire */
```

### **Effets de Verre**
```css
--glass-background: rgba(255, 255, 255, 0.8);
--glass-background-secondary: rgba(255, 255, 255, 0.6);
--glass-border: rgba(255, 255, 255, 0.2);
--glass-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
```

## 📐 **Système de Bordures**

```css
--macos-border-radius: 12px;        /* Rayon standard */
--macos-border-radius-large: 16px;  /* Rayon large */
--macos-border-radius-small: 8px;   /* Rayon petit */
```

## 🔤 **Typographie**

```css
--macos-font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
--macos-font-size-small: 13px;
--macos-font-size-base: 15px;
--macos-font-size-large: 17px;
--macos-font-size-xlarge: 20px;
```

## 🎭 **Composants Spécialisés**

### **Toolbar**
```css
.macos-toolbar {
  background: var(--glass-background);
  backdrop-filter: blur(20px);
  border-bottom: 1px solid var(--glass-border);
}
```

### **Navigation**
```css
.macos-nav {
  display: flex;
  gap: 8px;
  padding: 8px;
  background: var(--glass-background-secondary);
  border-radius: var(--macos-border-radius);
}
```

### **Status Indicators**
```css
.macos-status-success {
  background: rgba(52, 199, 89, 0.1);
  color: var(--macos-success);
}
```

## 🎬 **Animations**

### **Fade In**
```css
@keyframes macos-fade-in {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
```

### **Hover Effects**
```css
.macos-card-hover:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
}
```

## 📱 **Responsive Design**

```css
@media (max-width: 768px) {
  .macos-sidebar {
    width: 100%;
    border-right: none;
    border-bottom: 1px solid var(--glass-border);
  }
  
  .macos-toolbar {
    flex-direction: column;
    gap: 8px;
  }
}
```

## 🚀 **Utilisation dans TGVmax Explorer**

### **Interface Principale**
- Fond dégradé avec effet de verre
- Cards avec effet de verre pour les sections
- Badges pour afficher le nombre de destinations
- Navigation avec contrôles teintés

### **Formulaire de Recherche**
- Inputs avec effet de verre
- Boutons avec niveaux de prominence
- Status indicators pour les états

### **Header**
- Toolbar avec effet de verre
- Navigation avec contrôles teintés
- Status indicator pour l'API SNCF

## 🎯 **Avantages du Design macOS**

1. **Modernité** : Interface contemporaine et élégante
2. **Lisibilité** : Effets de verre améliorent la hiérarchie visuelle
3. **Accessibilité** : Contraste et tailles appropriés
4. **Performance** : Animations fluides et optimisées
5. **Cohérence** : Système de design unifié

## 🔧 **Implémentation Technique**

### **CSS Variables**
- Utilisation de variables CSS pour la cohérence
- Thème facilement modifiable
- Support des préférences système

### **Composants React**
- Composants réutilisables
- Props typées avec TypeScript
- Variantes configurables

### **Backdrop Filter**
- Effets de flou modernes
- Support des navigateurs récents
- Fallback pour les navigateurs plus anciens

---

*Design système macOS implémenté avec succès dans TGVmax Explorer* 🚅 