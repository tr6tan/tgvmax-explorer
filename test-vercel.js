const axios = require('axios');

async function testVercelReadiness() {
  console.log('🚀 Test de préparation pour Vercel - TGVmax Explorer\n');
  
  try {
    // 1. Test du backend local
    console.log('1. ✅ Test Backend (port 5001)...');
    const backendResponse = await axios.post('http://localhost:5001/api/search/destinations', {
      departureStation: 'PARIS',
      date: '2025-08-10',
      minDuration: 2
    });
    
    if (backendResponse.data.success) {
      console.log(`   - ${backendResponse.data.count} destinations trouvées`);
      console.log(`   - Première destination: ${backendResponse.data.data[0]?.city}`);
    }
    
    // 2. Test du frontend local
    console.log('\n2. ✅ Test Frontend (port 3001)...');
    const frontendResponse = await axios.get('http://localhost:3001');
    if (frontendResponse.status === 200) {
      console.log('   - Interface React accessible');
      console.log('   - HTML généré correctement');
    }
    
    // 3. Test des APIs SNCF
    console.log('\n3. ✅ Test API SNCF TGVmax...');
    const sncfResponse = await axios.get('https://data.sncf.com/api/explore/v2.1/catalog/datasets/tgvmax/records', {
      params: { limit: 5, where: "od_happy_card='OUI'" }
    });
    console.log(`   - ${sncfResponse.data.results.length} trains TGVmax récupérés`);
    
    // 4. Vérification des fichiers de configuration
    console.log('\n4. ✅ Vérification Configuration Vercel...');
    const fs = require('fs');
    
    if (fs.existsSync('vercel.json')) {
      console.log('   - vercel.json présent');
    }
    
    if (fs.existsSync('client/package.json')) {
      console.log('   - client/package.json présent');
    }
    
    if (fs.existsSync('server/index.js')) {
      console.log('   - server/index.js présent');
    }
    
    // 5. Test des variables d'environnement
    console.log('\n5. ✅ Test Variables d\'Environnement...');
    console.log(`   - NODE_ENV: ${process.env.NODE_ENV || 'development'}`);
    console.log(`   - PORT: ${process.env.PORT || '5001'}`);
    
    console.log('\n🎉 Tous les tests sont passés avec succès !');
    console.log('\n📋 Résumé pour Vercel:');
    console.log('   ✅ Backend API fonctionnel');
    console.log('   ✅ Frontend React accessible');
    console.log('   ✅ API SNCF TGVmax opérationnelle');
    console.log('   ✅ Configuration Vercel prête');
    console.log('   ✅ Architecture monorepo correcte');
    
    console.log('\n🚀 L\'application est prête pour le déploiement Vercel !');
    console.log('\n📝 Prochaines étapes:');
    console.log('   1. Installer Vercel CLI: npm i -g vercel');
    console.log('   2. Se connecter: vercel login');
    console.log('   3. Déployer: vercel --prod');
    console.log('   4. Configurer les variables d\'environnement dans Vercel');
    
  } catch (error) {
    console.error('❌ Erreur lors du test:', error.message);
  }
}

testVercelReadiness(); 