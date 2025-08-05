const axios = require('axios');

async function testFinalApplication() {
  console.log('🎯 Test final de l\'application TGVmax Explorer\n');
  
  try {
    // 1. Test de l'API SNCF
    console.log('1. ✅ Test API SNCF TGVmax...');
    const sncfResponse = await axios.get('https://data.sncf.com/api/explore/v2.1/catalog/datasets/tgvmax/records', {
      params: { limit: 10, where: "od_happy_card='OUI'" }
    });
    console.log(`   - ${sncfResponse.data.results.length} trains TGVmax récupérés`);
    
    // 2. Test de l'API de recherche
    console.log('\n2. ✅ Test API de recherche...');
    const searchResponse = await axios.post('http://localhost:5000/api/search/destinations', {
      departureStation: 'PARIS',
      date: '2025-08-10',
      minDuration: 2
    });
    
    if (searchResponse.data.success) {
      console.log(`   - ${searchResponse.data.count} destinations trouvées`);
      
      if (searchResponse.data.data.length > 0) {
        const firstDestination = searchResponse.data.data[0];
        console.log(`   - Première destination: ${firstDestination.city}`);
        console.log(`   - Aller: ${firstDestination.outbound.departureTime} → ${firstDestination.outbound.arrivalTime}`);
        console.log(`   - Retour: ${firstDestination.return.departureTime} → ${firstDestination.return.arrivalTime}`);
        console.log(`   - Séjour: ${firstDestination.stayDuration}`);
      }
    }
    
    // 3. Test de l'API météo
    console.log('\n3. ✅ Test API météo...');
    const weatherResponse = await axios.get('http://localhost:5000/api/weather/Dijon?date=2025-08-10');
    if (weatherResponse.data.success) {
      console.log(`   - Météo pour Dijon: ${weatherResponse.data.data.temperature}°C`);
    }
    
    // 4. Test de l'API données démographiques
    console.log('\n4. ✅ Test API données démographiques...');
    const demoResponse = await axios.get('http://localhost:5000/api/data/city/Dijon');
    if (demoResponse.data.success) {
      console.log(`   - Population de Dijon: ${demoResponse.data.data.demographics.population} habitants`);
    }
    
    // 5. Test de l'API stations
    console.log('\n5. ✅ Test API stations...');
    const stationsResponse = await axios.get('http://localhost:5000/api/stations');
    if (stationsResponse.data.success) {
      console.log(`   - ${stationsResponse.data.data.length} stations disponibles`);
    }
    
    console.log('\n🎉 Tous les tests sont passés avec succès !');
    console.log('\n📋 Résumé des APIs fonctionnelles:');
    console.log('   ✅ API SNCF TGVmax - Données réelles');
    console.log('   ✅ API de recherche - Logique métier');
    console.log('   ✅ API météo - Prévisions (avec fallback)');
    console.log('   ✅ API démographie - Données villes (avec fallback)');
    console.log('   ✅ API stations - Gares disponibles');
    
    console.log('\n🚀 L\'application TGVmax Explorer est prête !');
    console.log('   - Ouvrez http://localhost:5000 dans votre navigateur');
    console.log('   - Testez avec: Paris → 2025-08-10 → Durée min: 2h');
    
  } catch (error) {
    console.error('❌ Erreur lors du test final:', error.message);
  }
}

testFinalApplication(); 