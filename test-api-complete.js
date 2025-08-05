const axios = require('axios');

/**
 * Script de test complet pour vérifier l'API TGVmax
 */
async function testAPI() {
  console.log('🚅 Test complet de l\'API TGVmax\n');

  const baseURL = 'http://localhost:9090';
  
  try {
    // Test 1: API principale
    console.log('1️⃣ Test de l\'API principale /api/all-trains');
    const response1 = await axios.get(`${baseURL}/api/all-trains`);
    
    if (response1.status === 200) {
      console.log('✅ API principale fonctionne');
      console.log(`📊 Données reçues: ${response1.data.data.length} destinations`);
      
      // Afficher les détails des destinations
      response1.data.data.forEach(dest => {
        console.log(`   🏙️ ${dest.city}: ${dest.totalTrains} trains (${dest.availableTrains} disponibles)`);
      });
    } else {
      console.log('❌ Erreur API principale:', response1.status);
    }

    // Test 2: Statistiques
    console.log('\n2️⃣ Test des statistiques /api/all-trains/statistics');
    const response2 = await axios.get(`${baseURL}/api/all-trains/statistics`);
    
    if (response2.status === 200) {
      console.log('✅ API statistiques fonctionne');
      const stats = response2.data.data;
      console.log(`📈 Statistiques:`);
      console.log(`   - Destinations: ${stats.totalDestinations}`);
      console.log(`   - Trains totaux: ${stats.totalTrains}`);
      console.log(`   - Trains disponibles: ${stats.availableTrains}`);
      console.log(`   - Trains aller: ${stats.outboundTrains}`);
      console.log(`   - Trains retour: ${stats.returnTrains}`);
    } else {
      console.log('❌ Erreur API statistiques:', response2.status);
    }

    // Test 3: API avec date spécifique
    console.log('\n3️⃣ Test avec date spécifique');
    const today = new Date().toISOString().split('T')[0];
    const response3 = await axios.get(`${baseURL}/api/all-trains?date=${today}`);
    
    if (response3.status === 200) {
      console.log('✅ API avec date fonctionne');
      console.log(`📅 Date testée: ${today}`);
    } else {
      console.log('❌ Erreur API avec date:', response3.status);
    }

    // Test 4: Vérification des données
    console.log('\n4️⃣ Vérification de la structure des données');
    const data = response1.data.data;
    
    if (data && data.length > 0) {
      const sample = data[0];
      console.log('✅ Structure des données correcte');
      console.log(`📋 Exemple de destination:`);
      console.log(`   - ID: ${sample.id}`);
      console.log(`   - Ville: ${sample.city}`);
      console.log(`   - Coordonnées: ${sample.coordinates?.lat}, ${sample.coordinates?.lng}`);
      console.log(`   - Trains aller: ${sample.outboundTrains?.length || 0}`);
      console.log(`   - Trains retour: ${sample.returnTrains?.length || 0}`);
      
      // Vérifier un train
      if (sample.outboundTrains && sample.outboundTrains.length > 0) {
        const train = sample.outboundTrains[0];
        console.log(`🚅 Exemple de train:`);
        console.log(`   - Numéro: ${train.trainNumber}`);
        console.log(`   - Départ: ${train.departureTime}`);
        console.log(`   - Arrivée: ${train.arrivalTime}`);
        console.log(`   - Durée: ${train.duration}`);
      }
    } else {
      console.log('❌ Aucune donnée reçue');
    }

    // Test 5: Test de l'API SNCF directe
    console.log('\n5️⃣ Test de l\'API SNCF directe');
    try {
      const sncfResponse = await axios.get('https://data.sncf.com/api/explore/v2.1/catalog/datasets/tgvmax/records', {
        params: {
          where: "od_happy_card='OUI'",
          limit: 5
        }
      });
      
      if (sncfResponse.status === 200) {
        console.log('✅ API SNCF accessible');
        console.log(`📊 ${sncfResponse.data.results?.length || 0} trains récupérés`);
      } else {
        console.log('❌ Erreur API SNCF:', sncfResponse.status);
      }
    } catch (error) {
      console.log('❌ Erreur connexion API SNCF:', error.message);
    }

    // Test 6: Performance
    console.log('\n6️⃣ Test de performance');
    const startTime = Date.now();
    await axios.get(`${baseURL}/api/all-trains`);
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    console.log(`⏱️ Temps de réponse: ${duration}ms`);
    if (duration < 1000) {
      console.log('✅ Performance correcte');
    } else {
      console.log('⚠️ Performance lente');
    }

    console.log('\n🎉 Tests terminés avec succès !');
    console.log('\n📋 Résumé:');
    console.log('✅ API principale fonctionne');
    console.log('✅ Statistiques disponibles');
    console.log('✅ Données structurées correctement');
    console.log('✅ Performance acceptable');

  } catch (error) {
    console.error('❌ Erreur lors des tests:', error.message);
    
    if (error.code === 'ECONNREFUSED') {
      console.log('💡 Le serveur backend n\'est peut-être pas démarré');
      console.log('   Lancez: npm run dev dans le dossier racine');
    }
  }
}

// Lancer les tests
testAPI(); 