const axios = require('axios');

/**
 * Script pour tester les vraies données SNCF
 */
async function testRealSNCFData() {
  console.log('🚅 Test des vraies données SNCF\n');

  try {
    // Test 1: Récupérer les vraies données SNCF
    console.log('1️⃣ Récupération des données SNCF brutes');
    const sncfResponse = await axios.get('https://data.sncf.com/api/explore/v2.1/catalog/datasets/tgvmax/records', {
      params: {
        where: "od_happy_card='OUI'",
        limit: 50, // Plus de données pour voir la variété
        select: 'date,origine,destination,heure_depart,heure_arrivee,od_happy_card'
      }
    });

    if (sncfResponse.status === 200) {
      console.log('✅ API SNCF accessible');
      console.log(`📊 ${sncfResponse.data.results?.length || 0} trains récupérés`);
      
      // Analyser les données
      const trains = sncfResponse.data.results;
      const destinations = new Set();
      const departures = new Set();
      
      trains.forEach(train => {
        destinations.add(train.destination);
        departures.add(train.origine);
      });
      
      console.log('\n📋 Analyse des données:');
      console.log(`🏙️ Destinations uniques: ${destinations.size}`);
      console.log(`🚉 Départs uniques: ${departures.size}`);
      
      console.log('\n🏙️ Destinations trouvées:');
      Array.from(destinations).slice(0, 10).forEach(dest => {
        console.log(`   - ${dest}`);
      });
      
      console.log('\n🚉 Départs trouvés:');
      Array.from(departures).slice(0, 10).forEach(dep => {
        console.log(`   - ${dep}`);
      });
      
      // Afficher quelques exemples
      console.log('\n🚅 Exemples de trains:');
      trains.slice(0, 5).forEach((train, index) => {
        console.log(`   ${index + 1}. ${train.origine} → ${train.destination} (${train.heure_depart} - ${train.heure_arrivee})`);
      });
      
    } else {
      console.log('❌ Erreur API SNCF:', sncfResponse.status);
    }

    // Test 2: Vider le cache et forcer le rafraîchissement
    console.log('\n2️⃣ Test avec cache vidé');
    const cacheClearResponse = await axios.get('http://localhost:9090/api/all-trains?refresh=true');
    
    if (cacheClearResponse.status === 200) {
      console.log('✅ Cache vidé avec succès');
      const data = cacheClearResponse.data.data;
      console.log(`📊 ${data.length} destinations après rafraîchissement`);
      
      data.forEach(dest => {
        console.log(`   🏙️ ${dest.city}: ${dest.totalTrains} trains`);
      });
    }

    // Test 3: Vérifier si nous utilisons les vraies données
    console.log('\n3️⃣ Vérification de la source des données');
    const finalResponse = await axios.get('http://localhost:9090/api/all-trains');
    
    if (finalResponse.status === 200) {
      const data = finalResponse.data.data;
      console.log(`📊 ${data.length} destinations finales`);
      
      // Vérifier si les données semblent réelles
      const hasRealData = data.some(dest => 
        dest.outboundTrains.some(train => 
          train.departureStation.includes('PARIS') || 
          train.arrivalStation.includes('LYON') ||
          train.arrivalStation.includes('MARSEILLE')
        )
      );
      
      if (hasRealData) {
        console.log('✅ Données SNCF réelles détectées');
      } else {
        console.log('⚠️ Données de fallback utilisées');
      }
    }

  } catch (error) {
    console.error('❌ Erreur lors du test:', error.message);
  }
}

// Lancer le test
testRealSNCFData(); 