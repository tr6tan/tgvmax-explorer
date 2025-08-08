const fs = require('fs');
const path = require('path');

// Configuration pour la génération de composants
const FIGMA_CONFIG = {
  outputDir: path.join(__dirname, '../client/src/components/figma'),
  templateDir: path.join(__dirname, '../templates'),
  componentPrefix: 'Figma'
};

// Template pour un composant React TypeScript
const componentTemplate = (componentName, props, children) => `
import React from 'react';

interface ${componentName}Props {
  className?: string;
  children?: React.ReactNode;
  ${props.map(prop => `${prop.name}?: ${prop.type};`).join('\n  ')}
}

export const ${componentName}: React.FC<${componentName}Props> = ({
  className = '',
  children,
  ${props.map(prop => `${prop.name}`).join(',\n  ')}
}) => {
  return (
    <div className={\`${className}\`}>
      ${children}
    </div>
  );
};

export default ${componentName};
`;

// Fonction pour générer un composant à partir des données Figma
function generateComponent(figmaData) {
  const { name, type, properties } = figmaData;
  
  // Analyser les propriétés Figma
  const props = [];
  if (properties) {
    Object.entries(properties).forEach(([key, value]) => {
      if (typeof value === 'string') {
        props.push({ name: key, type: 'string' });
      } else if (typeof value === 'number') {
        props.push({ name: key, type: 'number' });
      } else if (typeof value === 'boolean') {
        props.push({ name: key, type: 'boolean' });
      }
    });
  }

  // Générer le nom du composant
  const componentName = `${FIGMA_CONFIG.componentPrefix}${name.replace(/[^a-zA-Z0-9]/g, '')}`;
  
  // Créer le contenu du composant
  const componentContent = componentTemplate(componentName, props, '');
  
  return {
    name: componentName,
    content: componentContent,
    filename: `${componentName}.tsx`
  };
}

// Fonction principale pour traiter les données Figma
async function processFigmaComponents(figmaData) {
  console.log('🎨 Traitement des composants Figma...');
  
  // Créer le dossier de sortie
  if (!fs.existsSync(FIGMA_CONFIG.outputDir)) {
    fs.mkdirSync(FIGMA_CONFIG.outputDir, { recursive: true });
  }
  
  const components = [];
  
  // Traiter chaque composant Figma
  if (Array.isArray(figmaData)) {
    figmaData.forEach(item => {
      const component = generateComponent(item);
      components.push(component);
    });
  } else {
    const component = generateComponent(figmaData);
    components.push(component);
  }
  
  // Écrire les fichiers
  components.forEach(component => {
    const filePath = path.join(FIGMA_CONFIG.outputDir, component.filename);
    fs.writeFileSync(filePath, component.content);
    console.log(`✅ Composant généré: ${component.filename}`);
  });
  
  // Créer un fichier d'index
  const indexContent = components.map(comp => 
    `export { ${comp.name} } from './${comp.name}';`
  ).join('\n');
  
  const indexPath = path.join(FIGMA_CONFIG.outputDir, 'index.ts');
  fs.writeFileSync(indexPath, indexContent);
  console.log('✅ Fichier index.ts généré');
  
  return components;
}

// Fonction pour récupérer les données Figma via MCP
async function fetchFigmaData() {
  // Cette fonction sera appelée par le MCP
  console.log('📡 Récupération des données Figma...');
  
  // Simulation des données Figma (à remplacer par l'appel MCP réel)
  const mockFigmaData = [
    {
      name: 'Button',
      type: 'component',
      properties: {
        variant: 'string',
        size: 'string',
        disabled: 'boolean'
      }
    },
    {
      name: 'Card',
      type: 'component',
      properties: {
        elevation: 'number',
        padding: 'number'
      }
    }
  ];
  
  return mockFigmaData;
}

// Point d'entrée principal
async function main() {
  try {
    console.log('🚀 Démarrage de la génération de composants Figma...');
    
    const figmaData = await fetchFigmaData();
    const components = await processFigmaComponents(figmaData);
    
    console.log(`\n✅ Génération terminée ! ${components.length} composants créés.`);
    console.log(`📁 Composants disponibles dans: ${FIGMA_CONFIG.outputDir}`);
    
  } catch (error) {
    console.error('❌ Erreur lors de la génération:', error);
  }
}

// Exporter les fonctions pour utilisation externe
module.exports = {
  processFigmaComponents,
  generateComponent,
  fetchFigmaData
};

// Exécuter si appelé directement
if (require.main === module) {
  main();
}
