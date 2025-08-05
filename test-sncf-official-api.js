const axios = require('axios');

/**
 * Test de l'API SNCF officielle
 */
async function testSNCFOfficialAPI() {
  console.log('🚅 Test de l\'API SNCF officielle\n');

  try {
    // Test 1: Vérifier l'accès à l'API SNCF
    console.log('1️⃣ Test d\'accès à l\'API SNCF officielle...');
    
    const sncfResponse = await axios.get('https://api.sncf.com/v1/coverage/sncf/commercial_modes', {
      auth: {
        username: '960e391d-c9d0-4bc5-935e-3b21bbdcf628',
        password: ''
      }
    });

    if (sncfResponse.status === 200) {
      console.log('✅ API SNCF officielle accessible');
      console.log(`📊 ${sncfResponse.data.commercial_modes?.length || 0} modes de transport disponibles`);
    } else {
      console.log('❌ Erreur API SNCF:', sncfResponse.status);
    }

    // Test 2: Récupérer des trajets depuis Paris
    console.log('\n2️⃣ Test de récupération de trajets...');
    
    const journeysResponse = await axios.get('https://api.sncf.com/v1/coverage/sncf/journeys', {
      auth: {
        username: '960e391d-c9d0-4bc5-935e-3b21bbdcf628',
        password: ''
      },
      params: {
        from: 'admin:fr:75056', // Paris
        datetime: '20250805T000000',
        count: 10
      }
    });

    if (journeysResponse.status === 200) {
      const journeys = journeysResponse.data.journeys;
      console.log(`✅ ${journeys.length} trajets récupérés`);
      
      if (journeys.length > 0) {
        console.log('\n🚅 Exemples de trajets:');
        journeys.slice(0, 3).forEach((journey, index) => {
          console.log(`   ${index + 1}. Trajet ID: ${journey.id}`);
          
          if (journey.sections && journey.sections.length > 0) {
            const firstSection = journey.sections[0];
            const lastSection = journey.sections[journey.sections.length - 1];
            
            if (firstSection.from && lastSection.to) {
              console.log(`      ${firstSection.from.name} → ${lastSection.to.name}`);
              console.log(`      Départ: ${new Date(firstSection.departure_date_time).toLocaleTimeString()}`);
              console.log(`      Arrivée: ${new Date(lastSection.arrival_date_time).toLocaleTimeString()}`);
              
              // Vérifier si c'est un TGV
              const hasTGV = journey.sections.some(section => 
                section.mode === 'train' && 
                section.display_informations?.commercial_mode === 'TGV'
              );
              console.log(`      TGV: ${hasTGV ? '✅' : '❌'}`);
            } else {
              console.log(`      Sections incomplètes`);
            }
          } else {
            console.log(`      Aucune section trouvée`);
          }
        });
      }
    } else {
      console.log('❌ Erreur lors de la récupération des trajets:', journeysResponse.status);
    }

    // Test 3: Tester notre nouvelle API
    console.log('\n3️⃣ Test de notre nouvelle API...');
    
    const apiResponse = await axios.get('http://localhost:9090/api/sncf/all-trains?refresh=true');
    
    if (apiResponse.status === 200) {
      const data = apiResponse.data;
      console.log(`✅ ${data.data.length} destinations dans notre API`);
      console.log(`📊 ${data.statistics.totalTrains} trains totaux`);
      console.log(`🏙️ Source: ${data.statistics.source}`);
      
      data.data.forEach(dest => {
        console.log(`   - ${dest.city}: ${dest.totalTrains} trains`);
      });
      
      if (data.data.length > 0) {
        console.log('\n✅ Notre API SNCF officielle fonctionne !');
      } else {
        console.log('\n⚠️ Aucune destination trouvée');
      }
    } else {
      console.log('❌ Erreur notre API:', apiResponse.status);
    }

  } catch (error) {
    console.error('❌ Erreur:', error.message);
    if (error.response) {
      console.error('Détails:', error.response.data);
    }
  }
}

// Lancer le test
testSNCFOfficialAPI(); 