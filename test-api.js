const axios = require('axios');

async function testSNCFAPI() {
  console.log('🧪 Test de l\'API SNCF TGVmax...');
  
  try {
    const response = await axios.get('https://data.sncf.com/api/explore/v2.1/catalog/datasets/tgvmax/records', {
      params: {
        limit: 10,
        select: 'date,train_no,origine,destination,heure_depart,heure_arrivee,od_happy_card'
      },
      timeout: 10000
    });

    console.log('✅ API SNCF accessible');
    console.log(`📊 ${response.data.results.length} trains récupérés`);
    
    if (response.data.results.length > 0) {
      const firstTrain = response.data.results[0];
      console.log('🚄 Exemple de train:');
      console.log(`  - Date: ${firstTrain.date}`);
      console.log(`  - Train: ${firstTrain.train_no}`);
      console.log(`  - De: ${firstTrain.origine}`);
      console.log(`  - À: ${firstTrain.destination}`);
      console.log(`  - Départ: ${firstTrain.heure_depart}`);
      console.log(`  - Arrivée: ${firstTrain.heure_arrivee}`);
      console.log(`  - TGVmax: ${firstTrain.od_happy_card}`);
    }

    return true;
  } catch (error) {
    console.error('❌ Erreur API SNCF:', error.message);
    return false;
  }
}

async function testOpenWeatherAPI() {
  console.log('\n🌤️ Test de l\'API OpenWeatherMap...');
  
  try {
    const response = await axios.get('https://api.openweathermap.org/data/2.5/weather', {
      params: {
        q: 'Paris,FR',
        appid: 'demo-key', // Clé de démonstration
        units: 'metric'
      },
      timeout: 5000
    });

    console.log('✅ API OpenWeatherMap accessible');
    console.log(`🌡️ Température à Paris: ${response.data.main.temp}°C`);
    return true;
  } catch (error) {
    console.log('⚠️ API OpenWeatherMap nécessite une clé valide');
    return false;
  }
}

async function runTests() {
  console.log('🚅 Tests des APIs TGVmax Explorer\n');
  
  const sncfResult = await testSNCFAPI();
  const weatherResult = await testOpenWeatherAPI();
  
  console.log('\n📋 Résumé des tests:');
  console.log(`  - API SNCF TGVmax: ${sncfResult ? '✅ OK' : '❌ ÉCHEC'}`);
  console.log(`  - API OpenWeatherMap: ${weatherResult ? '✅ OK' : '⚠️ Nécessite clé'}`);
  
  if (sncfResult) {
    console.log('\n🎉 L\'application peut utiliser les vraies données SNCF !');
  } else {
    console.log('\n⚠️ L\'application utilisera les données mockées');
  }
}

runTests().catch(console.error); 