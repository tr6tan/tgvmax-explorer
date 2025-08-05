const axios = require('axios');

async function testAPIs() {
  console.log('🧪 Test des APIs...\n');

  // Test 1: API SNCF directe
  console.log('1️⃣ Test API SNCF directe...');
  try {
    const sncfResponse = await axios.get('https://api.sncf.com/v1/coverage/sncf/journeys', {
      auth: {
        username: '960e391d-c9d0-4bc5-935e-3b21bbdcf628',
        password: ''
      },
      params: {
        from: 'admin:fr:75056',
        datetime: '20250805T000000',
        count: 3
      }
    });

    console.log('✅ API SNCF accessible');
    console.log(`📊 ${sncfResponse.data.journeys?.length || 0} trajets récupérés`);
    
    if (sncfResponse.data.journeys && sncfResponse.data.journeys.length > 0) {
      const firstJourney = sncfResponse.data.journeys[0];
      console.log('🚅 Premier trajet:', {
        from: firstJourney.from?.name,
        to: firstJourney.to?.name,
        departure: firstJourney.departure_date_time,
        arrival: firstJourney.arrival_date_time
      });
    }
  } catch (error) {
    console.log('❌ Erreur API SNCF:', error.message);
  }

  console.log('\n2️⃣ Test API TGVmax (simulée)...');
  try {
    const tgvmaxResponse = await axios.get('http://localhost:9090/api/tgvmax/search', {
      params: {
        from: 'Paris',
        date: '2025-08-05'
      }
    });

    console.log('✅ API TGVmax testée');
    console.log(`📊 Status: ${tgvmaxResponse.data.search?.apiStatus}`);
    console.log(`📊 Trajets: ${tgvmaxResponse.data.trains?.length || 0}`);
  } catch (error) {
    console.log('❌ Erreur API TGVmax:', error.message);
  }

  console.log('\n3️⃣ Test API OUI.sncf...');
  try {
    const ouisncfResponse = await axios.get('http://localhost:9090/api/ouisncf/search', {
      params: {
        from: 'Paris',
        date: '2025-08-05'
      }
    });

    console.log('✅ API OUI.sncf testée');
    console.log(`📊 Status: ${ouisncfResponse.data.search?.apiStatus}`);
    console.log(`📊 Trajets: ${ouisncfResponse.data.trains?.length || 0}`);
  } catch (error) {
    console.log('❌ Erreur API OUI.sncf:', error.message);
  }
}

testAPIs(); 